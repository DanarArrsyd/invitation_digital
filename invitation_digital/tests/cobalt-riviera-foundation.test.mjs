import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import vm from "node:vm";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { JSDOM } from "jsdom";
import ts from "typescript";

const nodeRequire = createRequire(import.meta.url);
const sourceRoot = fileURLToPath(new URL("../src/", import.meta.url));
const cobaltRoot = resolve(sourceRoot, "themes/cobalt-riviera");
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
      get window() { return globalThis.window; },
      get document() { return globalThis.document; },
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
    id: "cobalt-foundation",
    type: "wedding",
    slug: "cobalt-foundation",
    title: "Mira & Raka",
    status: "published",
    eventDate: "2027-06-19",
    venueSummary: null,
    publishedAt: "2026-10-01T00:00:00Z",
    expiresAt: null,
    theme: { slug: "cobalt-riviera", settings: {} },
    people: [
      { id: "mira", role: "bride", fullName: "Mira", nickname: null, fatherName: null, motherName: null, photoUrl: null, bio: null, sortOrder: 0 },
      { id: "raka", role: "groom", fullName: "Raka", nickname: null, fatherName: null, motherName: null, photoUrl: null, bio: null, sortOrder: 1 },
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

test("Cobalt declares every canonical section explicitly while remaining unregistered", () => {
  const { COBALT_RIVIERA_SECTIONS } = loadSource("themes/cobalt-riviera/manifest");
  const { themeRegistry } = loadSource("themes/registry");

  assert.deepEqual(Object.keys(COBALT_RIVIERA_SECTIONS), sectionKeys);
  assert.ok(sectionKeys.every((key) => COBALT_RIVIERA_SECTIONS[key] === true));
  assert.deepEqual(
    Object.keys(themeRegistry).sort(),
    ["midnight-atelier", "nusantara-ivory", "terra-botanica"],
  );
  assert.equal(themeRegistry["cobalt-riviera"], undefined);
});

test("Cobalt foundation renders normalized names and semantic Riviera primitives", () => {
  const { CobaltRiviera } = loadSource("themes/cobalt-riviera");
  const html = renderToStaticMarkup(React.createElement(CobaltRiviera, {
    invitation: fixture(),
    guest: { id: "guest", displayName: "Keluarga Adinata", token: "token", notes: null },
  }));
  const document = new JSDOM(html).window.document;

  assert.equal(document.querySelector(".cr-theme")?.getAttribute("data-theme"), "cobalt-riviera");
  assert.equal(document.querySelector("#cr-foundation")?.getAttribute("aria-labelledby"), "cr-foundation-title");
  assert.equal(document.querySelector("#cr-foundation-title")?.textContent, "Mira & Raka");
  assert.equal(document.querySelector(".cr-guest")?.textContent, "Keluarga Adinata");
  assert.equal(document.querySelector(".cr-sun-mark svg")?.getAttribute("aria-hidden"), "true");
  assert.equal(document.querySelector(".cr-route-rule")?.getAttribute("aria-hidden"), "true");
  assert.equal(document.querySelector(".cr-ceramic-line")?.getAttribute("aria-hidden"), "true");
});

test("RivieraImage reserves space, lazy loads, and swaps failures for an accessible fallback", async () => {
  const dom = new JSDOM("<div id='root'></div>", { pretendToBeVisual: true, url: "https://invitation.test/" });
  const keys = ["window", "document", "HTMLElement", "IS_REACT_ACT_ENVIRONMENT"];
  const previous = Object.fromEntries(keys.map((key) => [key, globalThis[key]]));
  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
    HTMLElement: dom.window.HTMLElement,
    IS_REACT_ACT_ENVIRONMENT: true,
  });
  const { RivieraImage } = loadSource("themes/cobalt-riviera/components/RivieraImage");
  const root = createRoot(document.getElementById("root"));

  try {
    await act(async () => root.render(React.createElement(RivieraImage, {
      src: "/portrait.jpg",
      alt: "Mira dan Raka di tepi kolam",
      sizes: "(max-width: 768px) 100vw, 50vw",
      aspectRatio: "16 / 10",
    })));
    const frame = document.querySelector(".cr-media");
    const image = frame?.querySelector("img");
    assert.equal(frame?.style.aspectRatio, "16 / 10");
    assert.equal(image?.getAttribute("loading"), "lazy");
    assert.equal(image?.getAttribute("alt"), "Mira dan Raka di tepi kolam");

    await act(async () => image?.dispatchEvent(new dom.window.Event("error")));
    const fallback = document.querySelector(".cr-image-fallback");
    assert.equal(fallback?.getAttribute("role"), "img");
    assert.equal(fallback?.getAttribute("aria-label"), "Mira dan Raka di tepi kolam");
    assert.equal(fallback?.closest(".cr-media")?.style.aspectRatio, "16 / 10");
  } finally {
    await act(async () => root.unmount());
    Object.assign(globalThis, previous);
    dom.window.close();
  }
});

test("Cobalt styles encode the approved palette, focus, motion, and hard-edged geometry", () => {
  const { ThemeStyles } = loadSource("themes/cobalt-riviera/ThemeStyles");
  const { COBALT_RIVIERA_TOKENS } = loadSource("themes/cobalt-riviera/tokens");
  const document = new JSDOM(renderToStaticMarkup(React.createElement(ThemeStyles))).window.document;
  const css = document.querySelector("style")?.textContent ?? "";

  for (const color of ["#1646C8", "#FFF9EE", "#123047", "#F06A3C", "#F3CF4C", "#81C7D4"]) {
    assert.match(css, new RegExp(color, "i"), color);
  }
  assert.match(css, /overflow-x:\s*clip/);
  assert.match(css, /:focus-visible\s*\{[^}]*outline:\s*3px solid var\(--cr-focus-ring\)/is);
  assert.match(css, /min-height:\s*48px/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /animation:\s*none\s*!important/);
  assert.match(css, /transition:\s*none\s*!important/);
  assert.match(css, /\.cr-route-rule/);
  assert.match(css, /\.cr-ceramic-line/);
  assert.doesNotMatch(css, /linear-gradient|radial-gradient|box-shadow/);

  const luminance = (hex) => {
    const channels = hex.slice(1).match(/.{2}/g).map((value) => Number.parseInt(value, 16) / 255);
    const [red, green, blue] = channels.map((value) => (
      value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
    ));
    return (0.2126 * red) + (0.7152 * green) + (0.0722 * blue);
  };
  const contrast = (first, second) => {
    const [lighter, darker] = [luminance(first), luminance(second)].sort((a, b) => b - a);
    return (lighter + 0.05) / (darker + 0.05);
  };
  const focusMappings = [
    ["cobalt", "citron"],
    ["porcelain", "cobalt"],
    ["sea-ink", "citron"],
    ["pool", "seaInk"],
  ];
  for (const [surface, focus] of focusMappings) {
    const cssToken = focus === "seaInk" ? "sea-ink" : focus;
    assert.match(
      css,
      new RegExp(`\\.cr-surface-${surface}\\s*\\{[^}]*--cr-focus-ring:\\s*var\\(--cr-${cssToken}\\)`, "s"),
      `${surface} focus token`,
    );
    const backgroundKey = surface === "sea-ink" ? "seaInk" : surface;
    assert.ok(
      contrast(COBALT_RIVIERA_TOKENS.colors[backgroundKey], COBALT_RIVIERA_TOKENS.colors[focus]) >= 3,
      `${surface} focus ring must retain at least 3:1 contrast`,
    );
  }

  const anchorDom = new JSDOM(
    `${renderToStaticMarkup(React.createElement(ThemeStyles))}<div class="cr-theme"><a href="#route">Route</a></div>`,
    { pretendToBeVisual: true },
  );
  const anchorStyle = anchorDom.window.getComputedStyle(anchorDom.window.document.querySelector("a"));
  assert.equal(anchorStyle.display, "inline-flex");
  assert.equal(anchorStyle.minHeight, "48px");
});

test("Cobalt stays presentation-only and bundles only its approved font families", () => {
  assert.ok(existsSync(cobaltRoot));
  const files = readdirSync(cobaltRoot, { recursive: true })
    .filter((entry) => /\.(ts|tsx)$/.test(entry));
  const source = files.map((entry) => readFileSync(resolve(cobaltRoot, entry), "utf8")).join("\n");
  const registry = readFileSync(resolve(sourceRoot, "themes/registry.ts"), "utf8");
  const layout = readFileSync(resolve(sourceRoot, "app/layout.tsx"), "utf8");
  const globals = readFileSync(resolve(sourceRoot, "app/globals.css"), "utf8");
  const packageJson = readFileSync(resolve(sourceRoot, "../package.json"), "utf8");

  assert.doesNotMatch(source, /supabase|createSupabase|next\/font\/google|@\/lib\/packages/i);
  assert.doesNotMatch(source, /<img\b/);
  assert.doesNotMatch(registry, /cobalt-riviera/i);
  assert.match(layout, /@fontsource-variable\/familjen-grotesk/);
  assert.match(layout, /@fontsource-variable\/newsreader/);
  assert.match(globals, /--font-cr-display:\s*"Familjen Grotesk Variable"/);
  assert.match(globals, /--font-cr-body:\s*"Newsreader Variable"/);
  assert.match(packageJson, /@fontsource-variable\/familjen-grotesk/);
  assert.match(packageJson, /@fontsource-variable\/newsreader/);
});
