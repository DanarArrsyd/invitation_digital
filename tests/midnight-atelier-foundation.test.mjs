import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import vm from "node:vm";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { JSDOM } from "jsdom";
import ts from "typescript";

const nodeRequire = createRequire(import.meta.url);
const sourceRoot = fileURLToPath(new URL("../src/", import.meta.url));
const midnightRoot = resolve(sourceRoot, "themes/midnight-atelier");
const sectionKeys = [
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
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
      },
    }).outputText;
    vm.runInNewContext(output, {
      exports,
      module: { exports },
      console,
      Date,
      Intl,
      URL,
      URLSearchParams,
      Blob,
      process,
      setTimeout,
      clearTimeout,
      setInterval,
      clearInterval,
      require(name) {
        if (name === "next/image") {
          return {
            __esModule: true,
            default: (imageProps) => {
              const props = { ...imageProps };
              delete props.fill;
              delete props.fetchPriority;
              delete props.unoptimized;
              return React.createElement("img", props);
            },
          };
        }
        if (name === "next/script") return { __esModule: true, default: () => null };
        if (name === "@/app/(public)/[slug]/actions") {
          return {
            trackCoverOpenedAction: async () => {},
            submitRsvpAction: async () => ({ status: "success" }),
            submitWishAction: async () => ({ status: "success" }),
          };
        }
        if (name.startsWith("@/")) return load(resolve(sourceRoot, name.slice(2)));
        if (name.startsWith(".")) return load(resolve(dirname(path), name));
        return nodeRequire(name);
      },
    });
    return exports;
  }
  return load(resolve(sourceRoot, entry));
}

function fixture() {
  return {
    id: "midnight-test",
    type: "wedding",
    slug: "midnight-test",
    title: "Nadia & Arka",
    status: "published",
    eventDate: "2027-02-14",
    venueSummary: null,
    publishedAt: "2026-09-30T00:00:00Z",
    expiresAt: null,
    theme: { slug: "midnight-atelier", settings: {} },
    people: [
      { id: "nadia", role: "bride", fullName: "Nadia", nickname: null, fatherName: null, motherName: null, photoUrl: null, bio: null, sortOrder: 0 },
      { id: "arka", role: "groom", fullName: "Arka", nickname: null, fatherName: null, motherName: null, photoUrl: null, bio: null, sortOrder: 1 },
    ],
    events: [],
    stories: [],
    gallery: [],
    gifts: [],
    wishes: [],
    content: { openingQuote: null, openingMessage: null, closingMessage: null },
    features: Object.fromEntries([
      "music", "countdown", "maps", "story", "gallery", "dressCode",
      "livestream", "rsvp", "wishes", "gift", "guestPersonalization",
    ].map((key) => [key, key === "guestPersonalization"])),
    media: { musicUrl: null, coverImageUrl: null },
  };
}

test("Midnight declares every canonical section explicitly and uses that manifest in the registry", () => {
  const { MIDNIGHT_ATELIER_SECTIONS } = loadSource("themes/midnight-atelier/manifest");
  const { themeRegistry } = loadSource("themes/registry");

  assert.deepEqual(Object.keys(MIDNIGHT_ATELIER_SECTIONS), sectionKeys);
  assert.ok(sectionKeys.every((key) => MIDNIGHT_ATELIER_SECTIONS[key] === true));
  assert.deepEqual(Object.keys(themeRegistry).sort(), ["cobalt-riviera", "midnight-atelier", "nusantara-ivory", "terra-botanica"]);
  assert.deepEqual(Object.keys(themeRegistry["midnight-atelier"].sections), sectionKeys);
  assert.ok(sectionKeys.every((key) => themeRegistry["midnight-atelier"].sections[key] === true));
});

test("Midnight foundation renders normalized names with semantic structural primitives", () => {
  const { MidnightAtelier } = loadSource("themes/midnight-atelier");
  const html = renderToStaticMarkup(React.createElement(MidnightAtelier, {
    invitation: fixture(),
    guest: { id: "guest", displayName: "Keluarga Adinata", token: "token", notes: null },
  }));
  const document = new JSDOM(html).window.document;

  assert.equal(document.querySelector(".ma-theme")?.getAttribute("data-theme"), "midnight-atelier");
  assert.equal(document.querySelector("#ma-beranda")?.getAttribute("aria-labelledby"), "ma-hero-heading");
  assert.equal(document.querySelector("#ma-hero-heading")?.textContent, "Nadia & Arka");
  assert.equal(document.querySelector(".ma-cover-guest-name")?.textContent, "Keluarga Adinata");
  assert.equal(document.querySelector(".ma-mark svg")?.getAttribute("aria-hidden"), "true");
});

test("Midnight image primitive reserves space, loads lazily, and keeps accessible fallback styling", () => {
  const { AtelierImage } = loadSource("themes/midnight-atelier/components/AtelierImage");
  const { ThemeStyles } = loadSource("themes/midnight-atelier/ThemeStyles");
  const html = renderToStaticMarkup(React.createElement(React.Fragment, null,
    React.createElement(ThemeStyles),
    React.createElement(AtelierImage, {
      src: "/portrait.jpg",
      alt: "Nadia dan Arka",
      sizes: "(max-width: 768px) 100vw, 50vw",
      aspectRatio: "4 / 5",
    }),
  ));
  const document = new JSDOM(html).window.document;
  const frame = document.querySelector(".ma-media");
  const image = frame?.querySelector("img");

  assert.equal(frame?.style.aspectRatio, "4 / 5");
  assert.equal(image?.getAttribute("alt"), "Nadia dan Arka");
  assert.equal(image?.getAttribute("loading"), "lazy");
  assert.match(document.querySelector("style")?.textContent ?? "", /\.ma-image-fallback/);
});

test("Midnight base styles encode the approved palette, focus, motion, and mobile boundaries", () => {
  const { ThemeStyles } = loadSource("themes/midnight-atelier/ThemeStyles");
  const document = new JSDOM(renderToStaticMarkup(React.createElement(ThemeStyles))).window.document;
  const css = document.querySelector("style")?.textContent ?? "";

  for (const color of ["#09090B", "#171216", "#541E2B", "#C6A15B", "#F3EEE6", "#AAA3A4"]) {
    assert.match(css, new RegExp(color, "i"), color);
  }
  assert.match(css, /overflow-x:\s*clip/);
  assert.match(css, /:focus-visible\s*\{[^}]*outline:\s*3px/is);
  assert.match(css, /min-height:\s*48px/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /animation:\s*none\s*!important/);
  assert.match(css, /transition:\s*none\s*!important/);
  assert.doesNotMatch(css, /linear-gradient|radial-gradient/);
});

test("Midnight source stays presentation-only and uses bundled font families", () => {
  assert.ok(existsSync(midnightRoot));
  const files = readdirSync(midnightRoot, { recursive: true })
    .filter((entry) => /\.(ts|tsx)$/.test(entry));
  const source = files.map((entry) => readFileSync(resolve(midnightRoot, entry), "utf8")).join("\n");
  const fontsTs = readFileSync(resolve(sourceRoot, "themes/theme-fonts.ts"), "utf8");
  const fontsCss = readFileSync(resolve(sourceRoot, "themes/midnight-atelier/fonts.css"), "utf8");

  assert.doesNotMatch(source, /supabase|createSupabase|next\/font\/google/i);
  assert.doesNotMatch(source, /<img\b/);
  assert.match(fontsTs, /@fontsource\/imperial-script/);
  assert.match(fontsTs, /@fontsource-variable\/bodoni-moda/);
  assert.match(fontsTs, /@fontsource-variable\/jost/);
  assert.match(fontsCss, /--font-ma-script:\s*"Imperial Script"/);
  assert.match(fontsCss, /--font-ma-display:\s*"Bodoni Moda Variable"/);
  assert.match(fontsCss, /--font-ma-text:\s*"Jost Variable"/);
});
