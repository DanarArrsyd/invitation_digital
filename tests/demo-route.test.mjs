import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

import ts from "typescript";

function loadTs(path, dependencies = {}) {
  const source = ts.transpileModule(readFileSync(new URL(`../src/${path}`, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  vm.runInNewContext(source, {
    exports,
    module: { exports },
    require(name) {
      if (Object.hasOwn(dependencies, name)) return dependencies[name];
      if (name === "server-only") return {};
      throw new Error(`Unexpected import in ${path}: ${name}`);
    },
  });
  return exports;
}

const entitlements = loadTs("lib/packages/entitlements.ts");

function loadQueries({ theme, invitation }) {
  const normalizeCalls = [];
  const supabase = {
    from(table) {
      const query = {
        select: () => query,
        eq: () => query,
        order: () => query,
        maybeSingle: async () => ({ data: table === "themes" ? theme : invitation, error: null }),
      };
      return query;
    },
  };
  const queries = loadTs("server/marketing/queries.ts", {
    "next/cache": { unstable_cache: (fn) => fn },
    "@/lib/marketing/cache-tags": loadTs("lib/marketing/cache-tags.ts"),
    "@/lib/marketing/event-types": loadTs("lib/marketing/event-types.ts"),
    "@/lib/packages/entitlements": entitlements,
    "@/lib/supabase/admin": { createSupabaseAdminClient: () => supabase },
    "@/lib/supabase/storage": { getMediaPublicUrl: (path) => (path ? `https://cdn/${path}` : null) },
    "@/server/public/normalize": {
      loadNormalizedInvitation: async (_client, row) => {
        normalizeCalls.push(row);
        return {
          id: row.id,
          expiresAt: "2027-01-01T00:00:00Z",
          events: Array.from({ length: 6 }, (_, index) => ({ id: `e${index}` })),
          gallery: Array.from({ length: 45 }, (_, index) => ({ id: `g${index}` })),
        };
      },
    },
  });
  return { queries, normalizeCalls };
}

const theme = { id: "t1", slug: "terra-botanica", is_listed: true };
const invitation = {
  id: "i1",
  theme_id: "t1",
  is_demo: true,
  package_key: "grand",
  expires_at: "2026-12-01T00:00:00Z",
  settings: { features: { story: false }, dressCode: { description: "Hijau" } },
};

test("a demo renders as the requested package, with every included section on", async () => {
  const { queries, normalizeCalls } = loadQueries({ theme, invitation });
  await queries.getDemoInvitation("terra-botanica", "intimate");

  const row = normalizeCalls[0];
  assert.equal(row.package_key, "intimate");
  assert.equal(row.expires_at, null);
  assert.equal(row.theme, theme);
  assert.equal(row.settings.dressCode.description, "Hijau", "content settings are kept");
  assert.ok(Object.values(row.settings.features).every(Boolean), "the package, not saved toggles, decides");
});

test("package limits trim events and gallery, and a demo never expires", async () => {
  const { queries } = loadQueries({ theme, invitation });
  for (const [packageKey, events, gallery] of [
    ["intimate", 2, 8],
    ["signature", 3, 20],
    ["grand", 5, 40],
  ]) {
    const demo = await queries.getDemoInvitation("terra-botanica", packageKey);
    assert.equal(demo.events.length, events, `${packageKey} events`);
    assert.equal(demo.gallery.length, gallery, `${packageKey} gallery`);
    assert.equal(demo.expiresAt, null);
  }
});

test("no demo is served for an unlisted template or a template without a demo", async () => {
  assert.equal(await loadQueries({ theme: null, invitation }).queries.getDemoInvitation("x", "signature"), null);
  assert.equal(await loadQueries({ theme, invitation: null }).queries.getDemoInvitation("terra-botanica", "signature"), null);
});

test("the demo page is noindex and falls back to Signature and a sample guest name", () => {
  const page = readFileSync(new URL("../src/app/demo/[themeSlug]/page.tsx", import.meta.url), "utf8");
  assert.match(page, /robots: \{ index: false, follow: false \}/);
  assert.match(page, /const DEFAULT_PACKAGE: PackageKey = "signature"/);
  assert.match(page, /isPackageKey\(paket\)/);
  assert.match(page, /\.slice\(0, 40\)/);
});
