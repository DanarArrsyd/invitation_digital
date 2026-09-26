import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import vm from "node:vm";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
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
      require(name) {
        if (name === "next/font/google") return Object.fromEntries(
          ["Cormorant_Garamond", "Jost", "Fraunces", "Manrope"].map((font) => [font, () => ({ variable: font })]),
        );
        if (name === "next/script") return { __esModule: true, default: () => null };
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

test("both registered theme slugs resolve through the real public renderer", () => {
  const { themeRegistry } = loadSource("themes/registry");
  const { ThemeRenderer } = loadSource("themes/ThemeRenderer");
  assert.deepEqual(Object.keys(themeRegistry).sort(), ["nusantara-ivory", "terra-botanica"]);
  assert.equal(themeRegistry["terra-botanica"].preview.name, "Terra Botanica");
  assert.equal(themeRegistry["terra-botanica"].category, "wedding");
  assert.deepEqual([...themeRegistry["terra-botanica"].preview.palette], ["#F2E7D8", "#B6634B", "#53634E"]);
  for (const slug of Object.keys(themeRegistry)) {
    const html = renderToStaticMarkup(React.createElement(ThemeRenderer, { invitation: invitation(slug), guest: null }));
    assert.doesNotMatch(html, /is not available yet/, slug);
    assert.match(html, /Alya/, slug);
    assert.match(html, /Bima/, slug);
  }
});

test("Terra migration activates an existing slug in place on every retry", () => {
  const sql = readFileSync(new URL("../supabase/migrations/20260924000001_terra_botanica_theme.sql", import.meta.url), "utf8");
  const schema = readFileSync(new URL("../supabase/migrations/20260913000003_themes.sql", import.meta.url), "utf8");
  assert.match(schema, /slug text not null unique/i);
  assert.match(schema, /create trigger set_themes_updated_at/i);
  assert.match(sql, /insert into public\.themes\s*\(name, slug, category, description, is_active\)/i);
  assert.match(sql, /'Terra Botanica',\s*'terra-botanica',\s*'wedding'/i);
  assert.match(sql, /on conflict \(slug\) do update/i);
  for (const column of ["name", "category", "description"]) {
    assert.match(sql, new RegExp(`${column}\\s*=\\s*excluded\\.${column}`, "i"));
  }
  assert.match(sql, /is_active\s*=\s*true/i);
  assert.match(sql, /updated_at\s*=\s*now\(\)/i);
  assert.doesNotMatch(sql, /\b(delete|truncate|drop|update\s+public\.invitations)\b/i);
  assert.doesNotMatch(sql, /\bid\s*=/i);
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

test("all packages normalize identical effective features for Ivory and Terra", async () => {
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
    for (const slug of ["nusantara-ivory", "terra-botanica"]) {
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
    assert.deepEqual(results[0], results[1], packageKey);
  }
});
