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
const ivoryRoot = resolve(srcRoot, "themes/nusantara-ivory");

const OPENED_COVER = {
  opened: true, playing: false, canPlayMusic: false, reducedMotion: false,
  audioRef: { current: null }, contentRef: { current: null },
  openInvitation: () => {}, toggleMusic: () => {},
};

/** Loads theme TS/TSX through vm. `cover` replaces useInvitationCover's result; `reducedMotion` forces Motion's preference. */
function createLoader({ cover = OPENED_COVER, reducedMotion = false } = {}) {
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
      require(name) {
        if (name === "next/image") return { __esModule: true, default: ({ src, alt }) => React.createElement("img", { src, alt }) };
        if (name === "next/script") return { __esModule: true, default: () => null };
        if (name === "@/components/TurnstileWidget") return { TurnstileWidget: () => null };
        if (name === "@/app/(public)/[slug]/actions") {
          return { trackCoverOpenedAction: async () => {}, submitRsvpAction: async () => ({ status: "idle" }), submitWishAction: async () => ({ status: "idle" }) };
        }
        if (name === "@/themes/shared/use-invitation-cover") return { useInvitationCover: () => cover };
        if (name === "motion/react" && reducedMotion) return { ...nodeRequire("motion/react"), useReducedMotion: () => true };
        if (name.startsWith("@/")) return load(resolve(srcRoot, name.slice(2)));
        if (name.startsWith(".")) return load(resolve(dirname(path), name));
        return nodeRequire(name);
      },
    });
    return exports;
  }
  return (relative) => load(resolve(ivoryRoot, relative));
}

async function mount(element) {
  const dom = new JSDOM("<div id='root'></div>", { url: "https://invitation.test/", pretendToBeVisual: true });
  const prior = {
    window: globalThis.window, document: globalThis.document,
    navigator: Object.getOwnPropertyDescriptor(globalThis, "navigator"),
    IS_REACT_ACT_ENVIRONMENT: globalThis.IS_REACT_ACT_ENVIRONMENT,
  };
  Object.assign(globalThis, { window: dom.window, document: dom.window.document, IS_REACT_ACT_ENVIRONMENT: true });
  Object.defineProperty(globalThis, "navigator", { configurable: true, value: dom.window.navigator });
  const root = createRoot(dom.window.document.getElementById("root"));
  await act(async () => root.render(element));
  return {
    document: dom.window.document,
    window: dom.window,
    async cleanup() {
      await act(async () => root.unmount());
      Object.assign(globalThis, { window: prior.window, document: prior.document, IS_REACT_ACT_ENVIRONMENT: prior.IS_REACT_ACT_ENVIRONMENT });
      if (prior.navigator) Object.defineProperty(globalThis, "navigator", prior.navigator);
      dom.window.close();
    },
  };
}

function invitation(overrides = {}) {
  return {
    id: "ivory", type: "wedding", slug: "ivory", title: "Alya & Bima", status: "published",
    eventDate: "2030-10-20", venueSummary: "Ubud", publishedAt: "2030-01-01T00:00:00Z", expiresAt: null,
    timeZone: "Asia/Jakarta",
    theme: { slug: "nusantara-ivory", settings: {} },
    people: [
      { id: "b", role: "bride", fullName: "Alya Putri", nickname: "Alya", fatherName: null, motherName: null, photoUrl: null, bio: null, sortOrder: 0 },
      { id: "g", role: "groom", fullName: "Bima Satria", nickname: "Bima", fatherName: null, motherName: null, photoUrl: null, bio: null, sortOrder: 1 },
    ],
    events: [{ id: "event", eventType: "Resepsi", title: "Resepsi", eventDate: "2030-10-20",
      startTime: "10:00:00", endTime: "12:00:00", venueName: "Ubud", address: null,
      mapsUrl: null, livestreamUrl: null, sortOrder: 0 }],
    stories: [], gallery: [], gifts: [], wishes: [],
    content: { openingQuote: null, openingMessage: null, closingMessage: null },
    features: { music: false, countdown: false, maps: false, story: false, gallery: false, dressCode: false,
      livestream: false, rsvp: false, wishes: false, gift: false, guestPersonalization: false },
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

test("the Surat dari Keraton palette keeps every text pair at WCAG AA", () => {
  const styles = readFileSync(resolve(ivoryRoot, "ThemeStyles.tsx"), "utf8");
  const token = Object.fromEntries([...styles.matchAll(/--ni-([a-z0-9-]+):\s*(#[0-9A-Fa-f]{6})/g)].map(([, name, hex]) => [name, hex]));
  assert.equal(token.ivory, "#F8F1E4");
  assert.equal(token.sogan, "#6B3E26");
  assert.equal(token.bata, "#7A2E22");
  assert.equal(token.hijau, "#2F4A3A");
  assert.equal(token.gold, "#A87A3D");
  for (const [fg, bg, min] of [
    ["ink", "ivory", 7], ["brown", "ivory", 4.5], ["brown-soft", "ivory", 4.5], ["brown-soft", "cream", 4.5],
    ["gold-ink", "ivory", 4.5], ["gold-ink", "cream", 4.5], ["gold-ink", "cream-edge", 4.5], ["brown-soft", "cream-edge", 4.5], ["danger", "ivory", 4.5],
    ["gold-soft", "espresso", 4.5], ["ivory-2", "espresso", 4.5],
  ]) {
    assert.ok(contrast(token[fg], token[bg]) >= min, `--ni-${fg} on --ni-${bg} is ${contrast(token[fg], token[bg]).toFixed(2)}`);
  }
});

test("the Ivory watermark is a drawn kawung pattern", () => {
  const styles = readFileSync(resolve(ivoryRoot, "ThemeStyles.tsx"), "utf8");
  const lattice = styles.match(/\.ni-lattice::before \{[\s\S]*?\n\}/)[0];
  assert.equal((lattice.match(/%3Cellipse/g) ?? []).length, 4, "four kawung petals per tile");
  assert.doesNotMatch(lattice, /\.png|\.jpg/);
});
