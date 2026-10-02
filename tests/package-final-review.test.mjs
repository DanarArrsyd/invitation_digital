import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import ts from "typescript";
import vm from "node:vm";

const nodeRequire = createRequire(import.meta.url);
const invitationId = "00000000-0000-4000-8000-000000000001";
const eventId = "00000000-0000-4000-8000-000000000011";

function loadTs(path, dependencies = {}) {
  const source = ts.transpileModule(readFileSync(new URL(`../src/${path}`, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const exports = {};
  vm.runInNewContext(source, {
    exports,
    module: { exports },
    URL,
    require(name) {
      if (Object.hasOwn(dependencies, name)) return dependencies[name];
      if (name === "node:crypto" || name === "react/jsx-runtime") return nodeRequire(name);
      if (name === "server-only") return {};
      throw new Error(`Unexpected import in ${path}: ${name}`);
    },
  });
  return exports;
}

const entitlements = loadTs("lib/packages/entitlements.ts");

test("event edit scopes the row to its existing invitation and never sends a new parent", async () => {
  let updatePayload;
  const filters = [];
  const query = {
    eq(key, value) { filters.push([key, value]); return query; },
    select() { return query; },
    async maybeSingle() { return { data: { id: eventId }, error: null }; },
    then(resolve) { return resolve({ error: null }); },
  };
  const supabase = { from(table) {
    assert.equal(table, "invitation_events");
    return { update(payload) { updatePayload = payload; return query; } };
  } };
  const { upsertEvent } = loadTs("server/invitations/mutations.ts", {
    "@/lib/packages/entitlements": entitlements,
    "@/lib/supabase/server": { createSupabaseServerClient: async () => supabase },
  });
  const result = await upsertEvent({
    id: eventId, invitationId, eventType: "akad", title: "Akad baru", eventDate: "2026-10-20",
    startTime: null, endTime: null, venueName: null, address: null,
    mapsUrl: null, livestreamUrl: null, sortOrder: 0,
  });
  assert.equal(result, null);
  assert.equal(Object.hasOwn(updatePayload, "invitation_id"), false);
  assert.deepEqual(filters, [["id", eventId], ["invitation_id", invitationId]]);
});

test("package change uses the database's current all-conflict rejection", async () => {
  const databaseMessage = "Paket tidak dapat diubah karena: Paket Intimate mendukung maksimal 2 acara. Paket Intimate mendukung maksimal 8 foto galeri. Fitur wishes tidak tersedia di paket Intimate.";
  let writes = 0;
  const supabase = { from(table) {
    if (table === "invitations") return {
      select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { package_key: "grand", settings: {} }, error: null }) }) }),
      update: () => {
        writes += 1;
        return { eq: async () => ({ error: { code: "P0001", message: databaseMessage } }) };
      },
    };
    if (table === "invitation_events" || table === "gallery_items") {
      return { select: () => ({ eq: async () => ({ count: table === "invitation_events" ? 3 : 0, error: null }) }) };
    }
    throw new Error(table);
  } };
  const { updateInvitationPackage } = loadTs("server/invitations/package-policy.ts", {
    "@/lib/packages/entitlements": entitlements,
    "@/lib/supabase/server": { createSupabaseServerClient: async () => supabase },
  });
  const result = await updateInvitationPackage({ invitationId, packageKey: "intimate" });
  assert.equal(result.error, databaseMessage);
  assert.equal(writes, 1);
});

function loadWishAction({ packageKey, wishesEnabled, published = true, writeError = null }) {
  const inserts = [];
  const invitation = { id: invitationId, package_key: packageKey, status: published ? "published" : "draft", settings: { features: { wishes: wishesEnabled } } };
  const supabase = { from(table) {
    if (table === "invitations") return { select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: invitation, error: null }) }) }) };
    if (table === "wishes") return { insert: async (row) => { inserts.push(row); return { error: writeError }; } };
    if (table === "guests") return { select: () => ({ eq: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }) }) };
    throw new Error(table);
  } };
  const schema = loadTs("lib/validation/public-wish.ts", { zod: nodeRequire("zod") });
  const { submitWish } = loadTs("server/public/wishes.ts", {
    "@/lib/analytics/session": { getSessionId: async () => "session" },
    "@/lib/supabase/admin": { createSupabaseAdminClient: () => supabase },
    "@/lib/security/sanitize": { sanitizePlainText: (value) => value.trim() },
    "@/lib/turnstile/verify": { verifyTurnstileToken: async () => true },
    "@/lib/validation/public-wish": schema,
    "@/lib/packages/entitlements": entitlements,
    "./analytics": { trackEvent: async () => {} },
  });
  return { submitWish, inserts };
}

test("forged wishes cannot write when the package or saved toggle disables the guestbook", async () => {
  for (const [packageKey, wishesEnabled] of [["intimate", true], ["signature", false]]) {
    const { submitWish, inserts } = loadWishAction({ packageKey, wishesEnabled });
    const result = await submitWish({ invitationId, guestName: "Tamu", message: "Selamat!", turnstileToken: "verified" });
    assert.equal(result.ok, false);
    assert.equal(result.error, "Ucapan tidak tersedia untuk undangan ini.");
    assert.equal(inserts.length, 0);
  }
});

test("published Signature with wishes enabled accepts a validated wish", async () => {
  const { submitWish, inserts } = loadWishAction({ packageKey: "signature", wishesEnabled: true });
  const result = await submitWish({ invitationId, guestName: "Tamu", message: "Selamat!", turnstileToken: "verified" });
  assert.equal(result.ok, true);
  assert.equal(inserts.length, 1);
  assert.equal(inserts[0].message, "Selamat!");
});

test("a raced wish toggle returns the database's friendly entitlement error", async () => {
  const { submitWish } = loadWishAction({
    packageKey: "signature", wishesEnabled: true,
    writeError: { code: "P0001", message: "Ucapan tidak tersedia untuk undangan ini." },
  });
  const result = await submitWish({ invitationId, guestName: "Tamu", message: "Selamat!", turnstileToken: "verified" });
  assert.equal(result.ok, false);
  assert.equal(result.error, "Ucapan tidak tersedia untuk undangan ini.");
});

test("Intimate dress code mutation rejects nonempty content but allows clearing", async () => {
  const writes = [];
  const existing = { dressCode: { description: "Ivory", groups: [] }, features: { dressCode: false } };
  const query = {
    select: () => query,
    eq: () => query,
    update(value) { writes.push(value); return query; },
    async maybeSingle() { return { data: writes.length ? { id: invitationId } : { package_key: "intimate", settings: existing, updated_at: "v1" }, error: null }; },
  };
  const supabase = { auth: { getUser: async () => ({ data: { user: { id: "admin" } } }) }, from: () => query };
  const dressUtils = loadTs("lib/utils/dressCode.ts");
  const { updateDressCode } = loadTs("server/invitations/dress-code.ts", {
    "@/lib/supabase/server": { createSupabaseServerClient: async () => supabase },
    "@/lib/utils/dressCode": dressUtils,
    "@/lib/packages/entitlements": entitlements,
  });
  const input = { invitationId, description: "Blue", group1Label: "", group1Colors: "", group2Label: "", group2Colors: "" };
  assert.equal((await updateDressCode(input)).error, "Dress Code membutuhkan paket Signature.");
  assert.equal(writes.length, 0);
  assert.equal(await updateDressCode({ ...input, description: "" }), null);
  assert.equal(writes.length, 1);
  assert.equal(writes[0].settings.dressCode.description, null);
});

test("a raced downgrade returns the database's Dress Code package message", async () => {
  let wrote = false;
  const query = {
    select: () => query,
    eq: () => query,
    update() { wrote = true; return query; },
    async maybeSingle() {
      return wrote
        ? { data: null, error: { code: "P0001", message: "Dress Code membutuhkan paket Signature." } }
        : { data: { package_key: "signature", settings: {}, updated_at: "v1" }, error: null };
    },
  };
  const supabase = { auth: { getUser: async () => ({ data: { user: { id: "admin" } } }) }, from: () => query };
  const { updateDressCode } = loadTs("server/invitations/dress-code.ts", {
    "@/lib/supabase/server": { createSupabaseServerClient: async () => supabase },
    "@/lib/utils/dressCode": loadTs("lib/utils/dressCode.ts"),
    "@/lib/packages/entitlements": entitlements,
  });
  const result = await updateDressCode({ invitationId, description: "Blue",
    group1Label: "", group1Colors: "", group2Label: "", group2Colors: "" });
  assert.equal(result.error, "Dress Code membutuhkan paket Signature.");
});

function renderAdminPage(path, packageKey) {
  const invitation = {
    id: invitationId,
    package_key: packageKey,
    settings: {
      personSocials: { person: { instagram: "https://www.instagram.com/old/" } },
      dressCode: { description: "Ivory", groups: [] },
    },
    opening_quote: null,
    opening_message: null,
    closing_message: null,
  };
  const detail = {
    invitation,
    people: [{ id: "person", full_name: "Alya", role: "bride", photo_path: null,
      nickname: null, father_name: null, mother_name: null, bio: null, sort_order: 0 }],
    stories: [],
  };
  const dressUtils = loadTs("lib/utils/dressCode.ts");
  const dependencies = {
    "next/navigation": { notFound: () => { throw new Error("NOT_FOUND"); } },
    "@/components/admin/color-list-input": { ColorListInput: "input" },
    "@/components/admin/confirm-delete-form": { ConfirmDeleteForm: () => null },
    "@/components/admin/form-field": { FormField: ({ children }) => children },
    "@/components/admin/form-message": { FormMessage: ({ children }) => children ?? null },
    "@/components/admin/submit-button": { SubmitButton: "button" },
    "@/components/ui/button": { Button: "button" },
    "@/components/ui/input": { Input: "input" },
    "@/components/ui/label": { Label: "label" },
    "@/components/ui/separator": { Separator: "hr" },
    "@/components/ui/textarea": { Textarea: "textarea" },
    "@/lib/packages/entitlements": entitlements,
    "@/lib/supabase/storage": { getMediaPublicUrl: () => null },
    "@/lib/utils/instagram": { getPersonInstagram: () => ({ url: "https://www.instagram.com/old/" }) },
    "@/lib/utils/dressCode": dressUtils,
    "@/server/invitations/queries": { getInvitationDetail: async () => detail },
    "./actions": {},
    "./media-actions": {},
  };
  const Page = loadTs(path, dependencies).default;
  return Page({ params: Promise.resolve({ id: invitationId }), searchParams: Promise.resolve({}) })
    .then((element) => nodeRequire("react-dom/server").renderToStaticMarkup(element));
}

test("Intimate keeps Instagram and Dress Code editors visible with Signature labels and locked inputs", async () => {
  const people = await renderAdminPage("app/admin/(protected)/invitations/[id]/people/page.tsx", "intimate");
  assert.match(people, /Instagram \(opsional\)/);
  assert.match(people, /Tersedia di Signature/);
  assert.match(people, /<fieldset disabled=""[^>]*>[^]*?name="instagram"/);
  const content = await renderAdminPage("app/admin/(protected)/invitations/[id]/content/page.tsx", "intimate");
  assert.match(content, /Dress Code/);
  assert.match(content, /Tersedia di Signature/);
  assert.match(content, /<fieldset disabled=""[^>]*>[^]*?name="description"/);
});

test("Signature keeps Instagram and Dress Code editors available", async () => {
  const people = await renderAdminPage("app/admin/(protected)/invitations/[id]/people/page.tsx", "signature");
  const content = await renderAdminPage("app/admin/(protected)/invitations/[id]/content/page.tsx", "signature");
  assert.doesNotMatch(people, /<fieldset disabled=""[^>]*>[^]*?name="instagram"/);
  assert.doesNotMatch(content, /<fieldset disabled=""[^>]*>[^]*?name="description"/);
});

test("package selector makes keyboard focus visible on every radio card", () => {
  const PackageForm = loadTs("app/admin/(protected)/invitations/[id]/general/PackageForm.tsx", {
    "@/components/ui/badge": { Badge: "span" },
    "@/components/admin/form-message": { FormMessage: ({ children }) => children ?? null },
    "@/components/admin/submit-button": { SubmitButton: "button" },
    "@/lib/packages/entitlements": entitlements,
    "./package-actions": { updateInvitationPackageAction: () => {} },
  }).PackageForm;
  const html = nodeRequire("react-dom/server").renderToStaticMarkup(PackageForm({ invitationId, currentPackage: "intimate" }));
  assert.equal((html.match(/peer-focus-visible:ring-2/g) ?? []).length, 3);
});
