import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
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
const srcRoot = fileURLToPath(new URL("../src/", import.meta.url));
const terraRoot = resolve(srcRoot, "themes/terra-botanica");

/** Loads Terra TS/TSX through vm. `reducedMotion` forces Motion's preference; `actions` replaces the server actions. */
function createLoader({ reducedMotion = false, actions = {} } = {}) {
  const cache = new Map();
  function load(file) {
    const path = [file, `${file}.tsx`, `${file}.ts`, `${file}/index.ts`].find((candidate) => existsSync(candidate) && !candidate.endsWith("/"));
    assert.ok(path, `Missing module: ${file}`);
    if (cache.has(path)) return cache.get(path);
    const exports = {};
    cache.set(path, exports);
    const output = ts.transpileModule(readFileSync(path, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
    }).outputText;
    vm.runInNewContext(output, {
      exports, module: { exports }, console, Date, Intl, URL, URLSearchParams, Blob,
      setTimeout, clearTimeout, setInterval, clearInterval,
      get window() { return globalThis.window; },
      get document() { return globalThis.document; },
      get navigator() { return globalThis.navigator; },
      get FormData() { return globalThis.FormData; },
      get IntersectionObserver() { return globalThis.IntersectionObserver; },
      get requestAnimationFrame() { return globalThis.requestAnimationFrame; },
      get cancelAnimationFrame() { return globalThis.cancelAnimationFrame; },
      require(name) {
        if (name === "next/image") return { __esModule: true, default: ({ src, alt }) => React.createElement("img", { src, alt }) };
        if (name === "next/script") return { __esModule: true, default: () => null };
        if (name === "@/components/TurnstileWidget") return { TurnstileWidget: () => null };
        if (name === "@/app/(public)/[slug]/actions") {
          return {
            trackCoverOpenedAction: async () => {},
            submitRsvpAction: actions.submitRsvp ?? (async () => ({ status: "idle" })),
            submitWishAction: actions.submitWish ?? (async () => ({ status: "idle" })),
          };
        }
        if (name === "motion/react") return { ...nodeRequire("motion/react"), useReducedMotion: () => reducedMotion };
        if (name.startsWith("@/")) return load(resolve(srcRoot, name.slice(2)));
        if (name.startsWith(".")) return load(resolve(dirname(path), name));
        return nodeRequire(name);
      },
    });
    return exports;
  }
  return (relative) => load(resolve(terraRoot, relative));
}

/** Records observed elements; `trigger()` reports them all as intersecting. */
class FakeIntersectionObserver {
  static instances = [];
  constructor(callback) { this.callback = callback; this.elements = []; FakeIntersectionObserver.instances.push(this); }
  observe(element) { this.elements.push(element); }
  disconnect() { this.elements = []; }
  trigger() { this.callback(this.elements.map((target) => ({ target, isIntersecting: true }))); }
}

async function mount(element, { intersectionObserver } = {}) {
  const dom = new JSDOM("<div id='root'></div>", { url: "https://invitation.test/", pretendToBeVisual: true });
  const prior = {
    window: globalThis.window, document: globalThis.document, FormData: globalThis.FormData, HTMLElement: globalThis.HTMLElement,
    IntersectionObserver: globalThis.IntersectionObserver,
    requestAnimationFrame: globalThis.requestAnimationFrame, cancelAnimationFrame: globalThis.cancelAnimationFrame,
    navigator: Object.getOwnPropertyDescriptor(globalThis, "navigator"),
    IS_REACT_ACT_ENVIRONMENT: globalThis.IS_REACT_ACT_ENVIRONMENT,
  };
  Object.assign(globalThis, {
    window: dom.window, document: dom.window.document, FormData: dom.window.FormData, HTMLElement: dom.window.HTMLElement,
    IntersectionObserver: intersectionObserver,
    requestAnimationFrame: dom.window.requestAnimationFrame.bind(dom.window),
    cancelAnimationFrame: dom.window.cancelAnimationFrame.bind(dom.window),
    IS_REACT_ACT_ENVIRONMENT: true,
  });
  Object.defineProperty(globalThis, "navigator", { configurable: true, value: dom.window.navigator });
  const root = createRoot(dom.window.document.getElementById("root"));
  await act(async () => root.render(element));
  return {
    document: dom.window.document,
    window: dom.window,
    async cleanup() {
      await act(async () => root.unmount());
      const { navigator, ...rest } = prior;
      Object.assign(globalThis, rest);
      if (navigator) Object.defineProperty(globalThis, "navigator", navigator);
      dom.window.close();
    },
  };
}

function invitation(overrides = {}) {
  return {
    id: "terra", type: "wedding", slug: "terra", title: "Alya & Bima", status: "published",
    eventDate: "2030-10-20", venueSummary: "Kebun Raya", publishedAt: "2030-01-01T00:00:00Z", expiresAt: null,
    timeZone: "Asia/Jakarta",
    theme: { slug: "terra-botanica", settings: {} },
    people: [
      { id: "b", role: "bride", fullName: "Alya Putri", nickname: "Alya", fatherName: null, motherName: null, photoUrl: null, bio: null, sortOrder: 0 },
      { id: "g", role: "groom", fullName: "Bima Satria", nickname: "Bima", fatherName: null, motherName: null, photoUrl: null, bio: null, sortOrder: 1 },
    ],
    events: [{ id: "event", eventType: "Resepsi", title: "Resepsi", eventDate: "2030-10-20",
      startTime: "10:00:00", endTime: "12:00:00", venueName: "Kebun Raya", address: null,
      mapsUrl: null, livestreamUrl: null, sortOrder: 0 }],
    stories: [{ id: "s", title: "Bertemu", storyDate: null, yearLabel: "2021", description: "Di perpustakaan.", imageUrl: null, sortOrder: 0 }],
    gallery: [
      { id: "g1", imageUrl: "/a.jpg", caption: "Kebun pagi", altText: null, aspectRatio: "portrait_4_5", sortOrder: 0 },
      { id: "g2", imageUrl: "/b.jpg", caption: null, altText: "Foto kedua", aspectRatio: "landscape_16_9", sortOrder: 1 },
      { id: "g3", imageUrl: "/c.jpg", caption: null, altText: null, aspectRatio: "square_1_1", sortOrder: 2 },
    ],
    gifts: [], wishes: [],
    content: { openingQuote: null, openingMessage: null, closingMessage: null },
    features: { music: false, countdown: false, maps: false, story: true, gallery: true, dressCode: false,
      livestream: false, rsvp: false, wishes: true, gift: false, guestPersonalization: false },
    media: { coverImageUrl: null, musicUrl: null },
    ...overrides,
  };
}

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

const styles = () => readFileSync(resolve(terraRoot, "ThemeStyles.tsx"), "utf8");

test("the Herbarium Cinta palette keeps every text pair at WCAG AA", () => {
  const token = Object.fromEntries([...styles().matchAll(/--tb-([a-z-]+):\s*(#[0-9A-Fa-f]{6})/g)].map(([, name, hex]) => [name, hex]));
  assert.deepEqual(
    [token.linen, token.moss, token.clay, token.cacao, token.sun, token.bone],
    ["#F2EBDD", "#4E5B3A", "#B5653E", "#4A3426", "#D9A441", "#FBF7EE"],
  );
  for (const [fg, bg, min] of [
    ["cacao", "linen", 7], ["cacao", "bone", 7], ["moss", "linen", 4.5], ["moss", "bone", 4.5],
    ["bone", "moss", 4.5], ["clay-ink", "bone", 4.5], ["clay-ink", "linen", 4.5],
  ]) {
    assert.ok(contrast(token[fg], token[bg]) >= min, `--tb-${fg} on --tb-${bg} is ${contrast(token[fg], token[bg]).toFixed(2)}`);
  }
  assert.match(styles(), /\.tb-event-index\s*\{[^}]*color:\s*var\(--tb-clay-ink\)/, "small clay labels use the AA ink");
});

test("paper surfaces carry a drawn dot texture, never a raster", () => {
  const css = styles();
  assert.match(css, /:is\(\.tb-surface-linen, \.tb-surface-bone, \.tb-cover\)\s*\{[^}]*radial-gradient\(/);
  assert.doesNotMatch(css, /url\([^)]*\.(png|jpe?g|webp)/);
});

test("couple names are ink signatures and chapter titles stay Spectral", () => {
  const { TerraBotanica } = createLoader()("index");
  const html = renderToStaticMarkup(React.createElement(TerraBotanica, { invitation: invitation(), guest: null }));
  const { document } = new JSDOM(html).window;
  assert.equal(document.querySelector("h1").textContent, "Alya & Bima", "cover h1 keeps the plain display name");
  assert.ok(document.querySelector("h1").classList.contains("tb-script"));
  for (const id of ["tb-hero-heading", "tb-closing-heading"]) {
    assert.ok(document.getElementById(id).classList.contains("tb-script"), `${id} is script`);
  }
  const people = [...document.querySelectorAll(".tb-person-copy h3")];
  assert.equal(people.length, 2);
  for (const name of people) assert.ok(name.classList.contains("tb-script"));
  for (const title of document.querySelectorAll(".tb-section-heading h2")) {
    assert.ok(!title.classList.contains("tb-script"), `chapter "${title.textContent}" stays Spectral`);
  }
});
