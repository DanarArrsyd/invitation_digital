import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import vm from "node:vm";

import ts from "typescript";

const nodeRequire = createRequire(import.meta.url);

function loadTs(path, dependencies = {}) {
  const source = ts.transpileModule(readFileSync(new URL(`../src/${path}`, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  vm.runInNewContext(source, {
    exports,
    module: { exports },
    URL,
    Intl,
    require(name) {
      if (Object.hasOwn(dependencies, name)) return dependencies[name];
      if (name === "server-only") return {};
      if (name === "node:crypto") return nodeRequire(name);
      throw new Error(`Unexpected import in ${path}: ${name}`);
    },
  });
  return exports;
}

const site = loadTs("lib/validation/site.ts", {
  zod: nodeRequire("zod"),
  "@/lib/marketing/event-types": loadTs("lib/marketing/event-types.ts"),
  "@/lib/marketing/whatsapp": loadTs("lib/marketing/whatsapp.ts"),
  "@/lib/packages/entitlements": loadTs("lib/packages/entitlements.ts"),
});

const themeId = "00000000-0000-4000-8000-0000000000aa";

test("package prices accept rupiah formats and blank means ask for a price", () => {
  const parse = (price) => site.packageOfferSchema.safeParse({ packageKey: "signature", price, priceNote: "", isVisible: true });
  assert.equal(parse("149000").data.price, 149000);
  assert.equal(parse("149.000").data.price, 149000);
  assert.equal(parse("Rp 1.250.000").data.price, 1250000);
  assert.equal(parse("  ").data.price, null);
  assert.equal(parse("").data.priceNote, null);
  assert.equal(parse("seratus ribu").success, false);
  assert.equal(parse("-5000").success, false);
  assert.equal(parse("999999999").success, false);
  assert.equal(
    site.packageOfferSchema.safeParse({ packageKey: "platinum", price: "1", priceNote: "", isVisible: true }).success,
    false,
  );
});

test("contact settings normalise the WhatsApp number and Instagram handle", () => {
  const parse = (values) =>
    site.siteContactSchema.safeParse({ whatsappNumber: "", whatsappMessage: "Halo", instagramUrl: "", ...values });
  assert.equal(parse({ whatsappNumber: "0812 3456 7890" }).data.whatsappNumber, "6281234567890");
  assert.equal(parse({ whatsappNumber: "" }).data.whatsappNumber, null);
  assert.match(parse({ whatsappNumber: "12ab" }).error.issues[0].message, /Nomor WhatsApp tidak valid/);
  assert.equal(parse({ instagramUrl: "@temuraya.id" }).data.instagramUrl, "https://www.instagram.com/temuraya.id/");
  assert.equal(
    parse({ instagramUrl: "https://www.instagram.com/temuraya" }).data.instagramUrl,
    "https://www.instagram.com/temuraya",
  );
  assert.equal(parse({ instagramUrl: "https://evil.example/instagram.com" }).success, false);
  assert.equal(parse({ whatsappMessage: "  " }).success, false);
});

test("catalogue entries need a known event type", () => {
  const parse = (eventTypes) =>
    site.themeCatalogueSchema.safeParse({
      themeId,
      isListed: true,
      sortOrder: "2",
      tagline: "",
      description: "",
      eventTypes,
    });
  assert.equal(parse(["wedding"]).data.sortOrder, 2);
  assert.equal(parse(["wedding"]).data.tagline, null);
  assert.equal(parse([]).success, false);
  assert.equal(parse(["party"]).success, false);
});

function demoMutations(invitations) {
  const calls = [];
  const supabase = {
    from(table) {
      assert.equal(table, "invitations");
      const filters = {};
      let patch = null;
      const query = {
        select: () => query,
        update(values) {
          patch = values;
          return query;
        },
        eq(column, value) {
          filters[column] = value;
          return query;
        },
        async maybeSingle() {
          return { data: invitations.find((row) => row.id === filters.id) ?? null, error: null };
        },
        async single() {
          return query.then((result) => ({ data: result.data[0], error: null }));
        },
        then(resolve) {
          const rows = invitations.filter((row) => Object.entries(filters).every(([key, value]) => row[key] === value));
          if (patch) {
            calls.push({ patch, filters: { ...filters } });
            for (const row of rows) Object.assign(row, patch);
          }
          return Promise.resolve({ data: rows.map((row) => ({ slug: row.slug })), error: null }).then(resolve);
        },
      };
      return query;
    },
  };
  const mutations = loadTs("server/marketing/mutations.ts", {
    "@/lib/supabase/server": { createSupabaseServerClient: async () => supabase },
    "@/lib/supabase/storage": { INVITATION_MEDIA_BUCKET: "invitation-media" },
    "@/lib/validation/media": { validateMediaFile: () => ({ ok: true }) },
  });
  return { mutations, calls };
}

test("a template's demo moves to the chosen invitation, clearing the old one first", async () => {
  const invitations = [
    { id: "a", slug: "demo-lama", theme_id: themeId, is_demo: true },
    { id: "b", slug: "demo-baru", theme_id: themeId, is_demo: false },
  ];
  const { mutations, calls } = demoMutations(invitations);
  const result = await mutations.setThemeDemo({ themeId, invitationId: "b" });
  assert.deepEqual([...result.changedSlugs], ["demo-lama", "demo-baru"]);
  assert.deepEqual(calls.map((call) => call.patch.is_demo), [false, true]);
  assert.deepEqual(
    invitations.map((row) => row.is_demo),
    [false, true],
  );
});

test("an invitation from another template cannot become this template's demo", async () => {
  const invitations = [{ id: "c", slug: "lain", theme_id: "other-theme", is_demo: false }];
  const { mutations, calls } = demoMutations(invitations);
  const result = await mutations.setThemeDemo({ themeId, invitationId: "c" });
  assert.match(result.error, /template yang sama/);
  assert.equal(calls.length, 0);
});
