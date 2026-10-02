import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import ts from "typescript";
import vm from "node:vm";

const nodeRequire = createRequire(import.meta.url);

function loadEntitlements() {
  const source = ts.transpileModule(
    readFileSync(new URL("../src/lib/packages/entitlements.ts", import.meta.url), "utf8"),
    { compilerOptions: { module: ts.ModuleKind.CommonJS } },
  ).outputText;
  const exports = {};
  vm.runInNewContext(source, {
    exports,
    module: { exports },
    require(name) {
      throw new Error(`Unexpected import: ${name}`);
    },
  });
  return exports;
}

// Exercise the real mutation; replace only the external database boundary.
function loadFeatureMutation(packageKey, settings, { readError, writeError } = {}) {
  const writes = [];
  const source = ts.transpileModule(
    readFileSync(new URL("../src/server/invitations/mutations.ts", import.meta.url), "utf8"),
    { compilerOptions: { module: ts.ModuleKind.CommonJS } },
  ).outputText;
  const exports = {};
  vm.runInNewContext(source, {
    exports,
    module: { exports },
    require(name) {
      if (name === "node:crypto") return nodeRequire(name);
      if (name === "@/lib/packages/entitlements") return loadEntitlements();
      if (name === "@/lib/supabase/server") return {
        createSupabaseServerClient: async () => ({
          from(table) {
            assert.equal(table, "invitations");
            return {
              select(columns) {
                return { eq: () => ({ single: async () => ({
                  data: Object.fromEntries(columns.split(",").map((column) => {
                    const key = column.trim();
                    return [key, { settings, package_key: packageKey }[key]];
                  })),
                  error: readError ? { message: readError } : null,
                }) }) };
              },
              update(payload) {
                writes.push(JSON.parse(JSON.stringify(payload)));
                return { eq: async (key, value) => {
                  assert.equal(key, "id");
                  assert.equal(value, "invitation-id");
                  return { error: writeError ? { message: writeError } : null };
                } };
              },
            };
          },
        }),
      };
      throw new Error(`Unexpected feature mutation import: ${name}`);
    },
  });
  return { updateInvitationFeatures: exports.updateInvitationFeatures, writes };
}

// Keep pages, entitlement helpers, query code and UI primitives real. The fake
// database is the only read boundary and records analytics table access.
function loadFeatureAdminPage(section, packageKey, settings = {}, { empty = false, missing = false } = {}) {
  const tableReads = [];
  const invitation = { id: "invitation-id", package_key: packageKey, settings };
  const rows = {
    rsvps: empty ? [] : [
      { id: "rsvp-1", invitation_id: "invitation-id", guest_id: null, guest_name: "Alya", attendance: "attending", created_at: "2026-09-01T00:00:00Z", updated_at: "2026-09-01T00:00:00Z" },
      { id: "rsvp-2", invitation_id: "invitation-id", guest_id: null, guest_name: "Bima", attendance: "not_attending", created_at: "2026-09-01T00:00:00Z", updated_at: "2026-09-01T00:00:00Z" },
    ],
    wishes: [],
    analytics_events: [
      { event_type: "invitation_open", session_id: "session-1" },
      { event_type: "invitation_open", session_id: "session-1" },
      { event_type: "cover_opened", session_id: "session-1" },
    ],
  };
  const supabase = { from(table) {
    tableReads.push(table);
    const query = {
      select: () => query,
      eq: () => query,
      order: () => query,
      maybeSingle: async () => ({ data: missing ? null : invitation, error: null }),
      single: async () => ({ data: missing ? null : invitation, error: null }),
      then: (resolve) => resolve({ data: rows[table] ?? [], error: null }),
    };
    return query;
  } };
  const cache = new Map();
  function load(path) {
    if (cache.has(path)) return cache.get(path);
    const file = [".tsx", ".ts"].map((ext) => new URL(`../src/${path}${ext}`, import.meta.url)).find(existsSync);
    assert.ok(file, `Module exists: ${path}`);
    const source = ts.transpileModule(readFileSync(file, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
    }).outputText;
    const exports = {};
    cache.set(path, exports);
    vm.runInNewContext(source, {
      exports,
      module: { exports },
      require(name) {
        if (name === "next/navigation") return { notFound: () => { throw new Error("NOT_FOUND"); } };
        if (name === "@/lib/supabase/server") return { createSupabaseServerClient: async () => supabase };
        if (name === "./actions") return {
          updateFeaturesAction() {}, deleteWishAction() {}, hideWishAction() {}, unhideWishAction() {},
        };
        if (name.startsWith("@/")) return load(name.slice(2));
        if (name.startsWith("./")) return load(`${path.slice(0, path.lastIndexOf("/"))}/${name.slice(2)}`);
        return nodeRequire(name);
      },
    });
    return exports;
  }
  return { Page: load(`app/admin/(protected)/(shell)/invitations/[id]/${section}/page`).default, tableReads };
}

async function renderAdminPage(Page, searchParams = {}) {
  return nodeRequire("react-dom/server").renderToStaticMarkup(await Page({
    params: Promise.resolve({ id: "invitation-id" }),
    searchParams: Promise.resolve(searchParams),
  }));
}

// Using stale saved true values in a locked switch would make an unavailable
// feature appear active; hiding the row would remove the upgrade explanation.
test("features admin keeps unavailable controls visible, disabled and unchecked", async () => {
  const { Page } = loadFeatureAdminPage("features", "intimate", {
    features: { story: true, wishes: true, dressCode: true, livestream: true, music: true, rsvp: false },
  });
  const html = await renderAdminPage(Page);
  for (const key of ["story", "wishes", "dressCode", "livestream"]) {
    const control = html.match(new RegExp(`<input(?=[^>]*id="${key}")[^>]*>`))?.[0];
    assert.ok(control, `${key} switch remains visible`);
    assert.match(control, /disabled=""/);
    assert.doesNotMatch(control, /checked=""/);
  }
  assert.match(html, /Tersedia di Signature/);
  assert.match(html, /Tersedia di Grand/);
});

test("features admin uses saved checked and unchecked values only for granted controls", async () => {
  for (const packageKey of ["signature", "grand"]) {
    const { Page } = loadFeatureAdminPage("features", packageKey, {
      features: { story: true, wishes: false, music: false, livestream: true },
    });
    const html = await renderAdminPage(Page, { saved: "1" });
    for (const [key, checked, disabled] of [
      ["story", true, false], ["wishes", false, false], ["music", false, false],
      ["livestream", packageKey === "grand", packageKey !== "grand"],
    ]) {
      const control = html.match(new RegExp(`<input(?=[^>]*id="${key}")[^>]*>`))?.[0];
      assert.ok(control, key);
      assert.equal(control.includes('checked=""'), checked, key);
      assert.equal(control.includes('disabled=""'), disabled, key);
    }
    assert.match(html, /Tersimpan\./);
  }
});

// Querying analytics before package authorization can leak visitor metrics and
// makes locked plans depend on analytics service availability.
test("responses admin skips analytics reads for locked packages but keeps RSVP totals and rows", async () => {
  for (const packageKey of ["intimate", "signature"]) {
    const { Page, tableReads } = loadFeatureAdminPage("responses", packageKey);
    const html = await renderAdminPage(Page);
    assert.equal(tableReads.includes("analytics_events"), false);
    assert.match(html, /Statistik kunjungan tersedia di Grand/);
    assert.match(html, /RSVP masuk<\/dt><dd[^>]*>2<\/dd>/);
    assert.match(html, />Hadir<\/dt><dd[^>]*>1<\/dd>/);
    assert.match(html, /Tidak hadir<\/dt><dd[^>]*>1<\/dd>/);
    assert.match(html, /Alya/);
    assert.match(html, /Bima/);
    assert.doesNotMatch(html, /Dibuka<\/dt>|Pengunjung unik|Membuka cover/);
  }
});

test("responses admin queries and renders visitor analytics for Grand alongside RSVP data", async () => {
  const { Page, tableReads } = loadFeatureAdminPage("responses", "grand");
  const html = await renderAdminPage(Page);
  assert.equal(tableReads.filter((table) => table === "analytics_events").length, 1);
  assert.match(html, /Dibuka<\/dt><dd[^>]*>2<\/dd>/);
  assert.match(html, /Pengunjung unik<\/dt><dd[^>]*>1<\/dd>/);
  assert.match(html, /Membuka cover<\/dt><dd[^>]*>1<\/dd>/);
  assert.match(html, /RSVP masuk<\/dt><dd[^>]*>2<\/dd>/);
  assert.match(html, /Alya/);
  assert.doesNotMatch(html, /Statistik kunjungan tersedia/);
});

test("locked responses admin retains empty and error states", async () => {
  const { Page, tableReads } = loadFeatureAdminPage("responses", "intimate", {}, { empty: true });
  const html = await renderAdminPage(Page, { error: "Response failed" });
  assert.equal(tableReads.includes("analytics_events"), false);
  assert.match(html, /Belum ada RSVP/);
  assert.match(html, /Belum ada ucapan/);
  assert.match(html, /Response failed/);
  assert.match(html, /RSVP masuk<\/dt><dd[^>]*>0<\/dd>/);
});

test("responses admin returns not found before analytics when the invitation is missing", async () => {
  const { Page, tableReads } = loadFeatureAdminPage("responses", "grand", {}, { missing: true });
  await assert.rejects(renderAdminPage(Page), /NOT_FOUND/);
  assert.equal(tableReads.includes("analytics_events"), false);
});

// Missing entitlement validation would accept a gated toggle and write the other
// submitted changes. Each rejection must leave the entire settings row intact.
test("rejects unavailable feature updates before any settings write", async () => {
  for (const [packageKey, feature, label, required] of [
    ["intimate", "story", "Love Story", "Signature"],
    ["intimate", "wishes", "Wishes", "Signature"],
    ["intimate", "dressCode", "Dress Code", "Signature"],
    ["signature", "livestream", "Livestream", "Grand"],
  ]) {
    const settings = { music: { loop: false }, features: { music: true } };
    const { updateInvitationFeatures, writes } = loadFeatureMutation(packageKey, settings);
    const features = { ...loadEntitlements().getDefaultInvitationFeatures(packageKey), music: false, [feature]: true };

    const result = await updateInvitationFeatures({ invitationId: "invitation-id", features });

    assert.equal(result?.error, `Fitur ${label} membutuhkan paket ${required}.`);
    assert.deepEqual(writes, []);
    assert.deepEqual(settings, { music: { loop: false }, features: { music: true } });
  }
});

test("saves allowed feature changes while preserving unrelated settings exactly", async () => {
  for (const packageKey of ["intimate", "signature", "grand"]) {
    const settings = {
      features: { music: true, story: true },
      music: { loop: false, autoplayAfterOpen: true },
      gallery: { initialDisplayLimit: 5 },
      personSocials: { person: { instagram: "https://instagram.com/example" } },
      dressCode: { colors: ["ivory"] },
      custom: { nested: [null, "keep", false, 0] },
    };
    const before = JSON.parse(JSON.stringify(settings));
    const { updateInvitationFeatures, writes } = loadFeatureMutation(packageKey, settings);
    const features = JSON.parse(JSON.stringify(loadEntitlements().getDefaultInvitationFeatures(packageKey)));
    features.music = false;
    if (packageKey === "grand") features.livestream = true;

    assert.equal(await updateInvitationFeatures({ invitationId: "invitation-id", features }), null);
    assert.deepEqual(writes, [{ settings: { ...before, features } }]);
    assert.deepEqual(settings, before);
  }
});

test("returns feature settings read and write failures", async () => {
  const features = loadEntitlements().getDefaultInvitationFeatures("intimate");
  for (const options of [{ readError: "Read failed" }, { writeError: "Write failed" }]) {
    const { updateInvitationFeatures, writes } = loadFeatureMutation("intimate", {}, options);
    const result = await updateInvitationFeatures({ invitationId: "invitation-id", features });
    assert.equal(result?.error, options.readError ?? options.writeError);
    assert.equal(writes.length, options.readError ? 0 : 1);
  }
});

function loadCreateInvitationAction() {
  const validationSource = ts.transpileModule(
    readFileSync(new URL("../src/lib/validation/invitation.ts", import.meta.url), "utf8"),
    { compilerOptions: { module: ts.ModuleKind.CommonJS } },
  ).outputText;
  const validationExports = {};
  vm.runInNewContext(validationSource, {
    exports: validationExports,
    module: { exports: validationExports },
    require(name) {
      if (name === "zod") return nodeRequire("zod");
      throw new Error(`Unexpected validation import: ${name}`);
    },
  });

  const actionSource = ts.transpileModule(
    readFileSync(
      new URL("../src/app/admin/(protected)/(shell)/invitations/new/actions.ts", import.meta.url),
      "utf8",
    ),
    { compilerOptions: { module: ts.ModuleKind.CommonJS } },
  ).outputText;
  const actionExports = {};
  vm.runInNewContext(actionSource, {
    exports: actionExports,
    module: { exports: actionExports },
    require(name) {
      if (name === "next/navigation") {
        return { redirect: () => { throw new Error("Unexpected redirect"); } };
      }
      if (name === "@/lib/validation/invitation") return validationExports;
      if (name === "@/server/invitations/mutations") {
        return {
          createInvitation: async () => {
            throw new Error("Invalid package key reached the invitation mutation");
          },
        };
      }
      throw new Error(`Unexpected action import: ${name}`);
    },
  });
  return actionExports.createInvitationAction;
}

function loadGalleryUpload({ invitationResult, galleryResult } = {}) {
  const calls = { storageWrites: 0, inserts: 0 };
  const supabase = {
    from(table) {
      if (table === "invitations") {
        return {
          select: () => ({
            eq: () => ({
              single: async () => invitationResult ?? { data: { package_key: "intimate" }, error: null },
            }),
          }),
        };
      }
      if (table === "gallery_items") {
        return {
          select: () => ({
            eq: async () => galleryResult ?? { count: 6, error: null },
          }),
          insert: async () => {
            calls.inserts += 1;
            return { error: null };
          },
        };
      }
      throw new Error(`Unexpected table: ${table}`);
    },
    storage: {
      from: () => ({
        upload: async () => {
          calls.storageWrites += 1;
          return { error: null };
        },
      }),
    },
  };

  const source = ts.transpileModule(
    readFileSync(new URL("../src/server/media/upload.ts", import.meta.url), "utf8"),
    { compilerOptions: { module: ts.ModuleKind.CommonJS } },
  ).outputText;
  const exports = {};
  vm.runInNewContext(source, {
    exports,
    module: { exports },
    require(name) {
      if (name === "node:crypto") return { randomUUID: () => "test-upload" };
      if (name === "@/lib/supabase/storage") return { INVITATION_MEDIA_BUCKET: "invitation-media" };
      if (name === "@/lib/supabase/server") {
        return { createSupabaseServerClient: async () => supabase };
      }
      if (name === "@/lib/validation/media") {
        return { validateMediaFile: () => ({ ok: true }) };
      }
      if (name === "@/lib/packages/entitlements") return loadEntitlements();
      throw new Error(`Unexpected upload import: ${name}`);
    },
  });
  return { uploadGalleryItems: exports.uploadGalleryItems, calls };
}

function loadGalleryPage(galleryCount) {
  const source = ts.transpileModule(
    readFileSync(
      new URL("../src/app/admin/(protected)/(shell)/invitations/[id]/gallery/page.tsx", import.meta.url),
      "utf8",
    ),
    { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } },
  ).outputText;
  const exports = {};
  vm.runInNewContext(source, {
    exports,
    module: { exports },
    require(name) {
      if (name === "react/jsx-runtime") return nodeRequire("react/jsx-runtime");
      if (name === "next/navigation") {
        return { notFound: () => { throw new Error("Unexpected notFound"); } };
      }
      if (name === "@/components/admin/empty-state") return { EmptyState: "empty-state" };
      if (name === "@/components/admin/form-message") return { FormMessage: ({ children }) => children ?? null };
      if (name === "@/components/admin/submit-button") return { SubmitButton: "submit-button" };
      if (name === "@/components/ui/input") return { Input: "input" };
      if (name === "@/components/ui/label") return { Label: "label" };
      if (name === "@/lib/packages/entitlements") return loadEntitlements();
      if (name === "@/lib/supabase/storage") {
        return { getMediaPublicUrl: (path) => `/media/${path}` };
      }
      if (name === "@/server/invitations/queries") {
        return {
          getInvitationDetail: async () => ({
            invitation: { id: "invitation-id", package_key: "intimate" },
            gallery: Array.from({ length: galleryCount }, (_, index) => ({
              id: `photo-${index}`,
              image_path: `photo-${index}.webp`,
              caption: null,
              alt_text: null,
              aspect_ratio: "auto",
            })),
          }),
        };
      }
      if (name === "./actions") return { uploadGalleryItemsAction: () => {} };
      if (name === "./GalleryGrid") return { GalleryGrid: "gallery-grid" };
      throw new Error(`Unexpected gallery page import: ${name}`);
    },
  });
  return exports.default;
}

test("defines stable package limits and ordering", () => {
  const { PACKAGE_KEYS, PACKAGE_DEFINITIONS, isPackageUpgrade, isPackageDowngrade } =
    loadEntitlements();
  assert.deepEqual(Array.from(PACKAGE_KEYS), ["intimate", "signature", "grand"]);
  assert.equal(PACKAGE_DEFINITIONS.intimate.limits.maxEvents, 2);
  assert.equal(PACKAGE_DEFINITIONS.signature.limits.maxGalleryImages, 20);
  assert.equal(PACKAGE_DEFINITIONS.grand.limits.maxSponsors, 10);
  assert.equal(isPackageUpgrade("intimate", "signature"), true);
  assert.equal(isPackageDowngrade("grand", "signature"), true);
  assert.equal(isPackageUpgrade("signature", "signature"), false);
});

test("defines the complete package entitlement matrix", () => {
  const { PACKAGE_DEFINITIONS, getDefaultInvitationFeatures } = loadEntitlements();
  const expected = {
    intimate: {
      label: "Intimate",
      recommended: false,
      limits: { maxEvents: 2, maxGalleryImages: 8, maxSponsors: 0 },
      invitationFeatures: {
        music: true,
        countdown: true,
        maps: true,
        story: false,
        gallery: true,
        dressCode: false,
        livestream: false,
        rsvp: true,
        wishes: false,
        gift: true,
        guestPersonalization: true,
      },
      defaults: {
        music: true,
        countdown: true,
        maps: true,
        story: false,
        gallery: true,
        dressCode: false,
        livestream: false,
        rsvp: true,
        wishes: false,
        gift: true,
        guestPersonalization: true,
      },
      capabilities: {
        instagram: false,
        rsvpExport: false,
        sponsorship: false,
        videoGallery: false,
        advancedRsvp: false,
        analytics: false,
        stylePresets: false,
      },
    },
    signature: {
      label: "Signature",
      recommended: true,
      limits: { maxEvents: 3, maxGalleryImages: 20, maxSponsors: 5 },
      invitationFeatures: {
        music: true,
        countdown: true,
        maps: true,
        story: true,
        gallery: true,
        dressCode: true,
        livestream: false,
        rsvp: true,
        wishes: true,
        gift: true,
        guestPersonalization: true,
      },
      defaults: {
        music: true,
        countdown: true,
        maps: true,
        story: true,
        gallery: true,
        dressCode: false,
        livestream: false,
        rsvp: true,
        wishes: true,
        gift: true,
        guestPersonalization: true,
      },
      capabilities: {
        instagram: true,
        rsvpExport: true,
        sponsorship: true,
        videoGallery: false,
        advancedRsvp: false,
        analytics: false,
        stylePresets: false,
      },
    },
    grand: {
      label: "Grand",
      recommended: false,
      limits: { maxEvents: 5, maxGalleryImages: 40, maxSponsors: 10 },
      invitationFeatures: {
        music: true,
        countdown: true,
        maps: true,
        story: true,
        gallery: true,
        dressCode: true,
        livestream: true,
        rsvp: true,
        wishes: true,
        gift: true,
        guestPersonalization: true,
      },
      defaults: {
        music: true,
        countdown: true,
        maps: true,
        story: true,
        gallery: true,
        dressCode: false,
        livestream: false,
        rsvp: true,
        wishes: true,
        gift: true,
        guestPersonalization: true,
      },
      capabilities: {
        instagram: true,
        rsvpExport: true,
        sponsorship: true,
        videoGallery: true,
        advancedRsvp: true,
        analytics: true,
        stylePresets: true,
      },
    },
  };

  for (const [packageKey, packageExpectation] of Object.entries(expected)) {
    const definition = PACKAGE_DEFINITIONS[packageKey];
    assert.equal(definition.label, packageExpectation.label);
    assert.equal(definition.recommended, packageExpectation.recommended);
    assert.deepEqual(JSON.parse(JSON.stringify(definition.limits)), packageExpectation.limits);
    assert.deepEqual(
      JSON.parse(JSON.stringify(definition.invitationFeatures)),
      packageExpectation.invitationFeatures,
    );
    assert.deepEqual(
      JSON.parse(JSON.stringify(getDefaultInvitationFeatures(packageKey))),
      packageExpectation.defaults,
    );
    assert.deepEqual(
      JSON.parse(JSON.stringify(definition.capabilities)),
      packageExpectation.capabilities,
    );
  }
});

test("intersects saved invitation features with package entitlements", () => {
  const { resolveEffectiveInvitationFeatures } = loadEntitlements();
  const requested = {
    music: true, countdown: true, maps: true, story: true, gallery: true,
    dressCode: true, livestream: true, rsvp: true, wishes: true, gift: true,
    guestPersonalization: true,
  };
  const intimate = resolveEffectiveInvitationFeatures("intimate", requested);
  assert.equal(intimate.music, true);
  assert.equal(intimate.story, false);
  assert.equal(intimate.wishes, false);
  assert.equal(intimate.livestream, false);
  const grand = resolveEffectiveInvitationFeatures("grand", requested);
  assert.equal(grand.story, true);
  assert.equal(grand.livestream, true);
});

test("uses product defaults without enabling optional dress code or livestream", () => {
  const { getDefaultInvitationFeatures } = loadEntitlements();
  const intimate = getDefaultInvitationFeatures("intimate");
  assert.equal(intimate.music, true);
  assert.equal(intimate.story, false);
  assert.equal(intimate.wishes, false);
  assert.equal(intimate.dressCode, false);
  assert.equal(intimate.livestream, false);

  const signature = getDefaultInvitationFeatures("signature");
  assert.equal(signature.story, true);
  assert.equal(signature.wishes, true);
  assert.equal(signature.dressCode, false);
  assert.equal(signature.livestream, false);
});

test("identifies package keys and required packages", () => {
  const { isPackageKey, getRequiredPackageForFeature } = loadEntitlements();
  assert.equal(isPackageKey("signature"), true);
  assert.equal(isPackageKey("premium"), false);
  assert.equal(getRequiredPackageForFeature("story"), "signature");
  assert.equal(getRequiredPackageForFeature("wishes"), "signature");
  assert.equal(getRequiredPackageForFeature("livestream"), "grand");
  assert.equal(getRequiredPackageForFeature("music"), "intimate");
  assert.equal(getRequiredPackageForFeature("instagram"), "signature");
  assert.equal(getRequiredPackageForFeature("videoGallery"), "grand");
});

test("rejects additions beyond event and gallery limits", () => {
  const { validatePackageCapacity } = loadEntitlements();
  assert.equal(validatePackageCapacity("intimate", "events", 1, 1), null);
  assert.equal(
    validatePackageCapacity("intimate", "events", 2, 1).code,
    "PACKAGE_EVENT_LIMIT_REACHED",
  );
  assert.equal(
    validatePackageCapacity("signature", "gallery", 19, 2).code,
    "PACKAGE_GALLERY_LIMIT_REACHED",
  );
});

test("checks the whole gallery batch before upload", () => {
  const { validatePackageCapacity } = loadEntitlements();
  assert.equal(validatePackageCapacity("intimate", "gallery", 6, 2), null);
  const error = validatePackageCapacity("intimate", "gallery", 6, 3);
  assert.equal(error.code, "PACKAGE_GALLERY_LIMIT_REACHED");
  assert.equal(error.current, 6);
  assert.equal(error.limit, 8);
});

test("rejects an over-limit gallery batch before any storage write", async () => {
  const { uploadGalleryItems, calls } = loadGalleryUpload();
  const files = ["one.webp", "two.webp", "three.webp"].map((name) => ({
    name,
    type: "image/webp",
  }));

  const result = await uploadGalleryItems("invitation-id", files);

  assert.equal(result?.error, "Paket Intimate mendukung maksimal 8 foto galeri.");
  assert.equal(calls.storageWrites, 0);
  assert.equal(calls.inserts, 0);
});

test("returns gallery lookup errors before writing to storage", async () => {
  const files = [{ name: "photo.webp", type: "image/webp" }];
  for (const setup of [
    { invitationResult: { data: null, error: { message: "Invitation query failed" } }, expected: "Invitation query failed" },
    { galleryResult: { count: null, error: { message: "Gallery count failed" } }, expected: "Gallery count failed" },
  ]) {
    const { uploadGalleryItems, calls } = loadGalleryUpload(setup);
    const result = await uploadGalleryItems("invitation-id", files);
    assert.equal(result?.error, setup.expected);
    assert.equal(calls.storageWrites, 0);
    assert.equal(calls.inserts, 0);
  }
});

test("shows package usage and disables only new uploads when gallery is full", async () => {
  const { renderToStaticMarkup } = nodeRequire("react-dom/server");
  const GalleryPage = loadGalleryPage(8);
  const html = renderToStaticMarkup(await GalleryPage({ params: Promise.resolve({ id: "invitation-id" }) }));

  assert.match(html, /8 dari 8 foto · Paket Intimate · drag foto untuk mengubah urutan/);
  assert.match(html, /Batas galeri paket tercapai\. Hapus foto atau upgrade paket\./);
  assert.match(html, /<gallery-grid/);
  assert.match(html, /<fieldset disabled=""/);
  assert.doesNotMatch(html, /<form[^>]*disabled/);
});

test("keeps new uploads available below gallery capacity", async () => {
  const { renderToStaticMarkup } = nodeRequire("react-dom/server");
  const GalleryPage = loadGalleryPage(7);
  const html = renderToStaticMarkup(await GalleryPage({ params: Promise.resolve({ id: "invitation-id" }) }));

  assert.match(html, /7 dari 8 foto · Paket Intimate/);
  assert.match(html, /<fieldset class=/);
  assert.doesNotMatch(html, /Batas galeri paket tercapai/);
});

test("shows upload errors returned through the gallery action", async () => {
  const { renderToStaticMarkup } = nodeRequire("react-dom/server");
  const GalleryPage = loadGalleryPage(7);
  const html = renderToStaticMarkup(await GalleryPage({
    params: Promise.resolve({ id: "invitation-id" }),
    searchParams: Promise.resolve({ error: "Paket Intimate mendukung maksimal 8 foto galeri." }),
  }));

  assert.match(html, /Paket Intimate mendukung maksimal 8 foto galeri\./);
});

test("allows event edits conceptually without consuming capacity", () => {
  const { validatePackageCapacity } = loadEntitlements();
  assert.equal(validatePackageCapacity("intimate", "events", 2, 0), null);
  assert.equal(validatePackageCapacity("intimate", "events", 2, 1).limit, 2);
  assert.equal(validatePackageCapacity("grand", "events", 4, 1), null);
});

test("reports every incompatible downgrade condition", () => {
  const { findPackageChangeConflicts } = loadEntitlements();
  const conflicts = findPackageChangeConflicts("intimate", {
    eventCount: 3,
    galleryCount: 9,
    enabledFeatures: { story: true, wishes: true },
  });
  assert.deepEqual(
    Array.from(conflicts, (item) => item.kind),
    ["events", "gallery", "feature", "feature"],
  );
});

test("allows package capacity at the limit and leaves compatible changes conflict-free", () => {
  const { validatePackageCapacity, findPackageChangeConflicts } = loadEntitlements();
  assert.equal(validatePackageCapacity("intimate", "events", 2, 0), null);
  assert.equal(validatePackageCapacity("intimate", "gallery", 6, 2), null);
  assert.equal(validatePackageCapacity("grand", "events", 4, 1), null);
  assert.deepEqual(
    Array.from(findPackageChangeConflicts("signature", {
      eventCount: 3,
      galleryCount: 20,
      enabledFeatures: { story: true, wishes: true, dressCode: true },
    })),
    [],
  );
});

test("reports stable Indonesian capacity errors without mutating conflict snapshots", () => {
  const { validatePackageCapacity, findPackageChangeConflicts } = loadEntitlements();
  const error = validatePackageCapacity("intimate", "events", 2, 1);
  assert.deepEqual(JSON.parse(JSON.stringify(error)), {
    code: "PACKAGE_EVENT_LIMIT_REACHED",
    message: "Paket Intimate mendukung maksimal 2 acara.",
    packageKey: "intimate",
    current: 2,
    limit: 2,
  });

  const snapshot = {
    eventCount: 3,
    galleryCount: 9,
    enabledFeatures: { story: true, wishes: true },
  };
  const before = JSON.parse(JSON.stringify(snapshot));
  findPackageChangeConflicts("intimate", snapshot);
  assert.deepEqual(snapshot, before);
});

test("rejects invalid package keys in the invitation creation server action", async () => {
  const createInvitationAction = loadCreateInvitationAction();
  const formData = new FormData();
  formData.set("title", "Rayhana & Febri");
  formData.set("slug", "rayhana-febri");
  formData.set("type", "wedding");
  formData.set("themeId", "d290f1ee-6c54-4b01-90e6-d701748f0851");
  formData.set("packageKey", "premium");

  const result = await createInvitationAction({ error: null }, formData);

  assert.equal(typeof result.error, "string");
});
