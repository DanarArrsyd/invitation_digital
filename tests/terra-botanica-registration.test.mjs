import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import vm from "node:vm";
import React from "react";
import ts from "typescript";

const nodeRequire = createRequire(import.meta.url);
const sourceRoot = fileURLToPath(new URL("../src/", import.meta.url));

function loadSource(entry) {
  const cache = new Map();
  function load(file) {
    const path = [file, `${file}.tsx`, `${file}.ts`, `${file}/index.ts`].find((candidate) => existsSync(candidate) && statSync(candidate).isFile());
    assert.ok(path, `Missing source module: ${file}`);
    if (cache.has(path)) return cache.get(path);
    const exports = {};
    cache.set(path, exports);
    const output = ts.transpileModule(readFileSync(path, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
    }).outputText;
    vm.runInNewContext(output, {
      exports, module: { exports }, console, Date, Intl, URL, URLSearchParams, Blob, process,
      setTimeout, clearTimeout, setInterval, clearInterval,
      get window() { return globalThis.window; },
      get document() { return globalThis.document; },
      get IntersectionObserver() { return globalThis.IntersectionObserver; },
      get requestAnimationFrame() { return globalThis.requestAnimationFrame; },
      require(name) {
        if (name === "next/font/google") return Object.fromEntries(
          ["Cormorant_Garamond", "Jost", "Fraunces", "Manrope"].map((font) => [font, () => ({ variable: font })]),
        );
        if (name === "next/script") return { __esModule: true, default: () => null };
        if (name === "next/image") return { __esModule: true, default: (imageProps) => {
          const props = { ...imageProps };
          delete props.fill;
          delete props.fetchPriority;
          delete props.unoptimized;
          return React.createElement("img", props);
        } };
        if (name === "motion/react") return { useReducedMotion: () => false };
        if (name === "@/app/(public)/[slug]/actions") return {
          trackCoverOpenedAction: async () => {},
          submitRsvpAction: async () => ({ status: "success" }),
          submitWishAction: async () => ({ status: "success" }),
        };
        if (name.startsWith("@/")) return load(resolve(sourceRoot, name.slice(2)));
        if (name.startsWith(".")) return load(resolve(dirname(path), name));
        return nodeRequire(name);
      },
    });
    return exports;
  }
  return load(resolve(sourceRoot, entry));
}

function invitation(themeSlug) {
  return {
    id: "test", type: "wedding", slug: "test", title: "Alya & Bima", status: "published",
    eventDate: null, venueSummary: null, publishedAt: "2026-09-01T00:00:00Z", expiresAt: null,
    theme: { slug: themeSlug, settings: {} }, people: [], events: [], stories: [], gallery: [], gifts: [], wishes: [],
    content: { openingQuote: null, openingMessage: null, closingMessage: null },
    features: Object.fromEntries([
      "music", "countdown", "maps", "story", "gallery", "dressCode", "livestream", "rsvp", "wishes", "gift", "guestPersonalization",
    ].map((key) => [key, false])),
    media: { musicUrl: null, coverImageUrl: null },
  };
}

test("all four registered theme slugs resolve through the real public renderer", () => {
  const { themeRegistry } = loadSource("themes/registry");
  const { ThemeRenderer } = loadSource("themes/ThemeRenderer");
  assert.deepEqual(Object.keys(themeRegistry).sort(), ["cobalt-riviera", "midnight-atelier", "nusantara-ivory", "terra-botanica"]);
  assert.equal(themeRegistry["terra-botanica"].preview.name, "Terra Botanica");
  assert.equal(themeRegistry["terra-botanica"].category, "wedding");
  assert.deepEqual([...themeRegistry["terra-botanica"].preview.palette], ["#F2E7D8", "#B6634B", "#53634E"]);
  assert.equal(themeRegistry["midnight-atelier"].preview.name, "Midnight Atelier");
  assert.equal(themeRegistry["midnight-atelier"].category, "wedding");
  assert.deepEqual([...themeRegistry["midnight-atelier"].preview.palette], ["#09090B", "#541E2B", "#C6A15B"]);
  assert.equal(themeRegistry["cobalt-riviera"].preview.name, "Cobalt Riviera");
  assert.equal(themeRegistry["cobalt-riviera"].category, "wedding");
  assert.deepEqual([...themeRegistry["cobalt-riviera"].preview.palette], ["#1646C8", "#FFF9EE", "#F06A3C"]);
  const expectedComponents = {
    "cobalt-riviera": "CobaltRiviera",
    "nusantara-ivory": "NusantaraIvory",
    "terra-botanica": "TerraBotanica",
    "midnight-atelier": "MidnightAtelier",
  };
  for (const [slug, componentName] of Object.entries(expectedComponents)) {
    const resolved = ThemeRenderer({ invitation: invitation(slug), guest: null });
    assert.equal(typeof resolved.type, "function", slug);
    assert.equal(resolved.type.name, componentName, slug);
    assert.equal(resolved.props.invitation.theme.slug, slug);
  }
});

const terraSql = readFileSync(new URL("../supabase/migrations/20260924000001_terra_botanica_theme.sql", import.meta.url), "utf8");
const midnightMigration = new URL("../supabase/migrations/20260930000001_midnight_atelier_theme.sql", import.meta.url);
const themesSchema = readFileSync(new URL("../supabase/migrations/20260913000003_themes.sql", import.meta.url), "utf8");
const invitationsSchema = readFileSync(new URL("../supabase/migrations/20260913000004_invitations.sql", import.meta.url), "utf8");

function assertMigrationContract(sql, schema, invitationSchema, { name, slug }) {
  assert.doesNotMatch(sql, /--|\/\*/, "this fixed seed migration must not contain SQL comments");
  const statements = sql.split(";").map((statement) => statement.trim()).filter(Boolean);
  assert.equal(statements.length, 1, "migration must have exactly one statement");
  assert.match(sql.trim(), /^insert\s+into\s+public\.themes\b[\s\S]*;$/i);
  assert.match(schema, /id uuid primary key/i);
  assert.match(schema, /slug text not null unique/i);
  assert.match(schema, /create trigger set_themes_updated_at/i);
  assert.match(invitationSchema, /theme_id\s+uuid\s+not null\s+references\s+public\.themes\s*\(\s*id\s*\)\s+on\s+delete\s+restrict\b/i);
  assert.match(sql, /insert into public\.themes\s*\(name, slug, category, description, is_active\)/i);
  assert.match(sql, new RegExp(`'${name}',\\s*'${slug}',\\s*'wedding'`, "i"));
  assert.match(sql, /on conflict \(slug\) do update/i);
  for (const column of ["name", "category", "description"]) {
    assert.match(sql, new RegExp(`${column}\\s*=\\s*excluded\\.${column}`, "i"));
  }
  assert.match(sql, /is_active\s*=\s*true/i);
  assert.match(sql, /updated_at\s*=\s*now\(\)/i);
  assert.doesNotMatch(sql, /\b(delete|truncate|drop|update\s+public\.invitations)\b/i);
  assert.doesNotMatch(sql, /\bid\s*=/i);
}

test("Terra migration activates an existing slug in place on every retry", () => {
  assertMigrationContract(terraSql, themesSchema, invitationsSchema, { name: "Terra Botanica", slug: "terra-botanica" });
});

test("Midnight migration activates an existing slug in place on every retry", () => {
  assert.equal(existsSync(midnightMigration), true, "Midnight catalogue migration must exist");
  const sql = readFileSync(midnightMigration, "utf8");
  assertMigrationContract(sql, themesSchema, invitationsSchema, { name: "Midnight Atelier", slug: "midnight-atelier" });
  assert.match(sql, /'Dark cinematic editorial wedding invitation\.'/i);
});

test("migration contract rejects an extra plain theme insert", () => {
  const unsafeSql = `${terraSql}\ninsert into public.themes (name, slug, category) values ('Duplicate', 'terra-botanica', 'wedding');`;
  assert.throws(() => assertMigrationContract(unsafeSql, themesSchema, invitationsSchema, { name: "Terra Botanica", slug: "terra-botanica" }));
});

test("migration contract rejects an upsert hidden in SQL comments", () => {
  const unsafeSql = `insert into public.themes (name, slug, category, description, is_active)
values (
  'Terra Botanica',
  'terra-botanica',
  'wedding',
  'Organic editorial garden wedding theme.',
  true
)
-- on conflict (slug) do update
-- set name = excluded.name,
--     category = excluded.category,
--     description = excluded.description,
--     is_active = true,
--     updated_at = now()
;`;
  assert.throws(() => assertMigrationContract(unsafeSql, themesSchema, invitationsSchema, { name: "Terra Botanica", slug: "terra-botanica" }));
});

test("migration contract rejects additional destructive theme writes", () => {
  for (const additionalWrite of [
    "delete from public.themes where slug = 'terra-botanica';",
    "update public.themes set is_active = false where slug = 'nusantara-ivory';",
    "drop table public.themes;",
  ]) {
    assert.throws(() => assertMigrationContract(`${terraSql}\n${additionalWrite}`, themesSchema, invitationsSchema, { name: "Terra Botanica", slug: "terra-botanica" }));
  }
});

test("migration contract requires the invitation theme foreign key", () => {
  const withoutForeignKey = invitationsSchema.replace(
    "theme_id uuid not null references public.themes (id) on delete restrict",
    "theme_id uuid not null",
  );
  assert.notEqual(withoutForeignKey, invitationsSchema);
  assert.throws(() => assertMigrationContract(terraSql, themesSchema, withoutForeignKey, { name: "Terra Botanica", slug: "terra-botanica" }));
  const cascadingForeignKey = invitationsSchema.replace(
    "theme_id uuid not null references public.themes (id) on delete restrict",
    "theme_id uuid not null references public.themes (id) on delete cascade",
  );
  assert.notEqual(cascadingForeignKey, invitationsSchema);
  assert.throws(() => assertMigrationContract(terraSql, themesSchema, cascadingForeignKey, { name: "Terra Botanica", slug: "terra-botanica" }));
});

test("admin theme selection remains database-backed", () => {
  const source = readFileSync(new URL("../src/app/admin/(protected)/invitations/new/page.tsx", import.meta.url), "utf8");
  assert.match(source, /listActiveThemes\(\)/);
  assert.doesNotMatch(source, /themeRegistry/);
});

function loadNormalizer() {
  const cache = new Map();
  function load(path) {
    if (cache.has(path)) return cache.get(path);
    const source = readFileSync(new URL(`../src/${path}.ts`, import.meta.url), "utf8");
    const exports = {};
    cache.set(path, exports);
    vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, {
      exports, module: { exports },
      require(name) {
        if (name === "@/lib/packages/entitlements") return load("lib/packages/entitlements");
        if (name === "@/lib/supabase/storage") return { getMediaPublicUrl: () => null };
        throw new Error(`Unexpected normalization import: ${name}`);
      },
    });
    return exports;
  }
  return load("server/public/normalize").loadNormalizedInvitation;
}

test("all packages normalize identical effective features for every registered theme", async () => {
  const normalize = loadNormalizer();
  const savedFeatures = {
    music: true, countdown: true, maps: true, story: true, gallery: true,
    dressCode: true, livestream: true, rsvp: true, wishes: true, gift: true, guestPersonalization: true,
  };
  const expected = {
    intimate: { ...savedFeatures, story: false, dressCode: false, livestream: false, wishes: false },
    signature: { ...savedFeatures, livestream: false },
    grand: savedFeatures,
  };
  const supabase = {
    from() {
      const query = { select: () => query, eq: () => query, order: async () => ({ data: [], error: null }) };
      return query;
    },
  };
  for (const packageKey of ["intimate", "signature", "grand"]) {
    const results = [];
    for (const slug of ["nusantara-ivory", "terra-botanica", "midnight-atelier", "cobalt-riviera"]) {
      const row = {
        id: "test", type: "wedding", slug: "test", title: "Alya & Bima", status: "published",
        package_key: packageKey, settings: { features: savedFeatures }, theme_id: "theme-id", theme: { id: "theme-id", slug },
        event_date: null, venue_summary: null, published_at: "2026-09-01T00:00:00Z", expires_at: null,
        created_at: "2026-09-01T00:00:00Z", updated_at: "2026-09-01T00:00:00Z", created_by: null,
        opening_quote: null, opening_message: null, closing_message: null, music_path: null, cover_image_path: null,
      };
      const normalized = JSON.parse(JSON.stringify(await normalize(supabase, row)));
      assert.equal(normalized.theme.slug, slug);
      assert.deepEqual(normalized.features, expected[packageKey], `${packageKey}/${slug}`);
      assert.deepEqual(normalized.theme.settings.features, expected[packageKey], `${packageKey}/${slug}`);
      results.push(normalized.features);
    }
    for (const features of results.slice(1)) assert.deepEqual(features, results[0], packageKey);
  }
});
