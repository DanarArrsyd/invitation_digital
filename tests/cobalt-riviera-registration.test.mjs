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
const themeSlugs = [
  "cobalt-riviera",
  "midnight-atelier",
  "nusantara-ivory",
  "terra-botanica",
];
const capabilityKeys = [
  "cover", "hero", "quote", "couple", "parents", "events", "countdown",
  "maps", "calendar", "dressCode", "story", "gallery", "livestream",
  "rsvp", "wishes", "gift", "instagram", "closing",
];

function loadSource(entry) {
  const cache = new Map();
  function load(file) {
    const path = [file, `${file}.tsx`, `${file}.ts`, `${file}/index.ts`]
      .find((candidate) => existsSync(candidate) && statSync(candidate).isFile());
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
        if (name === "next/script") return { __esModule: true, default: () => null };
        if (name === "next/image") return { __esModule: true, default: (props) => React.createElement("img", props) };
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
    eventDate: null, venueSummary: null, publishedAt: "2026-10-02T00:00:00Z", expiresAt: null,
    theme: { slug: themeSlug, settings: {} }, people: [], events: [], stories: [], gallery: [], gifts: [], wishes: [],
    content: { openingQuote: null, openingMessage: null, closingMessage: null },
    features: Object.fromEntries([
      "music", "countdown", "maps", "story", "gallery", "dressCode", "livestream", "rsvp", "wishes", "gift", "guestPersonalization",
    ].map((key) => [key, false])),
    media: { musicUrl: null, coverImageUrl: null },
  };
}

test("all four registered theme slugs resolve through the public renderer", () => {
  const { themeRegistry } = loadSource("themes/registry");
  const { ThemeRenderer } = loadSource("themes/ThemeRenderer");
  assert.deepEqual(Object.keys(themeRegistry).sort(), themeSlugs);
  assert.deepEqual({
    name: themeRegistry["cobalt-riviera"].preview.name,
    palette: [...themeRegistry["cobalt-riviera"].preview.palette],
    category: themeRegistry["cobalt-riviera"].category,
  }, {
    name: "Cobalt Riviera",
    palette: ["#1646C8", "#FFF9EE", "#F06A3C"],
    category: "wedding",
  });

  for (const slug of themeSlugs) {
    const resolved = ThemeRenderer({ invitation: invitation(slug), guest: null });
    assert.equal(typeof resolved.type, "function", slug);
    assert.equal(resolved.props.invitation.theme.slug, slug);
  }
  const unsupported = ThemeRenderer({ invitation: invitation("unfinished-theme"), guest: null });
  assert.equal(unsupported.type.name, "UnsupportedTheme");
  assert.equal(unsupported.props.themeSlug, "unfinished-theme");
});

test("every registered theme exposes every canonical capability", () => {
  const { themeRegistry } = loadSource("themes/registry");
  for (const slug of themeSlugs) {
    const sections = themeRegistry[slug].sections;
    assert.deepEqual(Object.keys(sections).sort(), [...capabilityKeys].sort(), slug);
    assert.equal(capabilityKeys.every((key) => sections[key] === true), true, slug);
  }
});

const migrationUrl = new URL("../supabase/migrations/20261002000001_cobalt_riviera_theme.sql", import.meta.url);

test("Cobalt catalogue migration is one idempotent in-place upsert", () => {
  assert.equal(existsSync(migrationUrl), true, "Cobalt catalogue migration must exist");
  const sql = readFileSync(migrationUrl, "utf8");
  const themesSchema = readFileSync(new URL("../supabase/migrations/20260913000003_themes.sql", import.meta.url), "utf8");
  const invitationsSchema = readFileSync(new URL("../supabase/migrations/20260913000004_invitations.sql", import.meta.url), "utf8");
  const statements = sql.split(";").map((statement) => statement.trim()).filter(Boolean);
  assert.equal(statements.length, 1);
  assert.match(themesSchema, /id uuid primary key/i);
  assert.match(themesSchema, /slug text not null unique/i);
  assert.match(invitationsSchema, /theme_id\s+uuid\s+not null\s+references\s+public\.themes\s*\(\s*id\s*\)\s+on\s+delete\s+restrict\b/i);
  assert.match(sql, /insert into public\.themes\s*\(name, slug, category, description, is_active\)/i);
  assert.match(sql, /'Cobalt Riviera',\s*'cobalt-riviera',\s*'wedding'/i);
  assert.match(sql, /'Sunlit destination editorial wedding invitation\.'/i);
  assert.match(sql, /on conflict \(slug\) do update/i);
  for (const column of ["name", "category", "description"]) {
    assert.match(sql, new RegExp(`${column}\\s*=\\s*excluded\\.${column}`, "i"));
  }
  assert.match(sql, /is_active\s*=\s*true/i);
  assert.match(sql, /updated_at\s*=\s*now\(\)/i);
  assert.doesNotMatch(sql, /\b(delete|truncate|drop|update\s+public\.invitations)\b/i);
  assert.doesNotMatch(sql, /\bid\s*=/i);
});

test("admin discovery remains database-backed through listActiveThemes", () => {
  const page = readFileSync(new URL("../src/app/admin/(protected)/(shell)/invitations/new/page.tsx", import.meta.url), "utf8");
  const queries = readFileSync(new URL("../src/server/invitations/queries.ts", import.meta.url), "utf8");
  assert.match(page, /listActiveThemes\(\)/);
  assert.doesNotMatch(page, /themeRegistry/);
  assert.match(queries, /\.from\("themes"\)[\s\S]*\.eq\("is_active", true\)/);
});
