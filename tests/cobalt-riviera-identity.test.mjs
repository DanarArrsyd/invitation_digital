import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import vm from "node:vm";
import React, { act } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { renderToStaticMarkup, renderToString } from "react-dom/server";
import { JSDOM } from "jsdom";
import ts from "typescript";

const nodeRequire = createRequire(import.meta.url);
const srcRoot = fileURLToPath(new URL("../src/", import.meta.url));
const cobaltRoot = resolve(srcRoot, "themes/cobalt-riviera");

/**
 * Loads Cobalt TS/TSX through vm. Like every Cobalt harness, `motion/react`
 * is reduced to `useReducedMotion`; `actions` replaces the server actions.
 */
function createLoader({ reducedMotion = false, actions = {} } = {}) {
  const cache = new Map();
  function load(file) {
    const path = [file, `${file}.tsx`, `${file}.ts`, `${file}/index.ts`]
      .find((candidate) => existsSync(candidate) && statSync(candidate).isFile());
    assert.ok(path, `Missing module: ${file}`);
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
      get navigator() { return globalThis.navigator; },
      get FormData() { return globalThis.FormData; },
      get IntersectionObserver() { return globalThis.IntersectionObserver; },
      get requestAnimationFrame() { return globalThis.requestAnimationFrame; },
      get cancelAnimationFrame() { return globalThis.cancelAnimationFrame; },
      require(name) {
        if (name === "next/image") {
          return { __esModule: true, default: (imageProps) => {
            const props = { ...imageProps };
            delete props.fill;
            delete props.fetchPriority;
            delete props.unoptimized;
            return React.createElement("img", props);
          } };
        }
        if (name === "next/script") return { __esModule: true, default: () => null };
        if (name === "@/components/TurnstileWidget") return { TurnstileWidget: () => null };
        if (name === "@/app/(public)/[slug]/actions") {
          return {
            trackCoverOpenedAction: actions.trackCoverOpened ?? (async () => {}),
            submitRsvpAction: actions.submitRsvp ?? (async () => ({ status: "idle" })),
            submitWishAction: actions.submitWish ?? (async () => ({ status: "idle" })),
          };
        }
        if (name === "motion/react") return { useReducedMotion: () => reducedMotion };
        if (name.startsWith("@/")) return load(resolve(srcRoot, name.slice(2)));
        if (name.startsWith(".")) return load(resolve(dirname(path), name));
        return nodeRequire(name);
      },
    });
    return exports;
  }
  return (relative) => load(resolve(cobaltRoot, relative));
}

/** Never reports: nothing changes, like a browser that never scrolls. */
class NoopObserver { observe() {} disconnect() {} }

/** Records observed elements and options; `trigger()` reports them all. */
class FakeIntersectionObserver {
  static instances = [];
  constructor(callback, options) { this.callback = callback; this.options = options; this.elements = []; FakeIntersectionObserver.instances.push(this); }
  observe(element) { this.elements.push(element); }
  disconnect() { this.elements = []; }
  trigger(isIntersecting = true) { this.callback(this.elements.map((target) => ({ target, isIntersecting }))); }
}

async function mount(element, { intersectionObserver = NoopObserver } = {}) {
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
    id: "cobalt", type: "wedding", slug: "cobalt", title: "Nadia & Arka", status: "published",
    eventDate: "2030-06-14", venueSummary: "Villa Laut", publishedAt: "2030-01-01T00:00:00Z", expiresAt: null,
    timeZone: "Asia/Jakarta",
    theme: { slug: "cobalt-riviera", settings: {} },
    people: [
      { id: "b", role: "bride", fullName: "Nadia Rahmani", nickname: "Nadia", fatherName: null, motherName: null, photoUrl: null, bio: null, sortOrder: 0 },
      { id: "g", role: "groom", fullName: "Arka Pradipta", nickname: "Arka", fatherName: null, motherName: null, photoUrl: null, bio: null, sortOrder: 1 },
    ],
    events: [{ id: "event", eventType: "Resepsi", title: "Resepsi", eventDate: "2030-06-14",
      startTime: "16:00:00", endTime: "20:00:00", venueName: "Villa Laut", address: null,
      mapsUrl: null, livestreamUrl: null, sortOrder: 0 }],
    stories: [{ id: "s", title: "Pertemuan", storyDate: null, yearLabel: "2021", description: "Di dermaga sore itu.", imageUrl: null, sortOrder: 0 }],
    gallery: [
      { id: "g1", imageUrl: "/a.jpg", caption: "Pagi di pantai", altText: null, aspectRatio: "portrait_4_5", sortOrder: 0 },
      { id: "g2", imageUrl: "/b.jpg", caption: null, altText: "Foto kedua", aspectRatio: "landscape_16_9", sortOrder: 1 },
      { id: "g3", imageUrl: "/c.jpg", caption: null, altText: null, aspectRatio: "square_1_1", sortOrder: 2 },
    ],
    gifts: [], wishes: [],
    content: { openingQuote: null, openingMessage: null, closingMessage: null },
    features: { music: false, countdown: true, maps: false, story: true, gallery: true, dressCode: false,
      livestream: false, rsvp: true, wishes: true, gift: false, guestPersonalization: false },
    media: { coverImageUrl: null, musicUrl: null },
    ...overrides,
  };
}

/** The rendered stylesheet, with token values interpolated. */
function css() {
  const { ThemeStyles } = createLoader()("ThemeStyles");
  return new JSDOM(renderToStaticMarkup(React.createElement(ThemeStyles))).window.document.querySelector("style").textContent;
}

const tokens = () => createLoader()("tokens").COBALT_RIVIERA_TOKENS.colors;

/** Declaration bodies of every rule whose selector ends with `selector`. */
function rules(sheet, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return [...sheet.matchAll(new RegExp(`(?:^|[}\\s])${escaped}\\s*\\{([^}]*)\\}`, "g"))].map((match) => match[1]);
}

/** Selectors of every innermost rule whose body matches `declaration`. */
function owners(sheet, declaration) {
  return [...sheet.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .filter(([, , body]) => declaration.test(body))
    .map(([, selector]) => selector.trim());
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

/** `fg` laid over `bg` at `alpha` (an opacity), as a hex colour. */
function mix(fg, bg, alpha) {
  return `#${[1, 3, 5].map((i) => Math.round(parseInt(fg.slice(i, i + 2), 16) * alpha + parseInt(bg.slice(i, i + 2), 16) * (1 - alpha))
    .toString(16).padStart(2, "0")).join("")}`;
}

/** The attendance choice whose label is exactly `label` (the check mark is a separate span). */
function pick(form, label) {
  return [...form.querySelectorAll(".cr-attendance-choice")].find((button) => button.querySelector("span").textContent === label);
}

function submit(view, form) {
  return act(async () => { form.dispatchEvent(new view.window.Event("submit", { bubbles: true, cancelable: true })); });
}

test("the Surat Cinta palette re-points every --cr token and keeps each text pair at WCAG AA", () => {
  const c = tokens();
  assert.deepEqual(
    [c.cobalt, c.porcelain, c.seaInk, c.tangerine, c.citron, c.pool],
    ["#1D3E9E", "#F7F4EC", "#0E2350", "#E8743B", "#E9D35B", "#8EC5D6"],
  );
  assert.deepEqual([c.tangerineInk, c.seaInkSoft, c.sunset], ["#9A3D14", "#4A5878", "#F8DCC4"]);
  for (const [fg, bg, min] of [
    ["porcelain", "cobalt", 4.5], ["citron", "cobalt", 4.5],
    ["seaInk", "porcelain", 7], ["cobalt", "porcelain", 4.5], ["tangerineInk", "porcelain", 4.5], ["seaInkSoft", "porcelain", 4.5],
    ["seaInk", "pool", 4.5], ["cobalt", "pool", 4.5],
    ["porcelain", "seaInk", 7], ["citron", "seaInk", 4.5],
    ["seaInk", "citron", 4.5], ["tangerineInk", "citron", 4.5],
    ["seaInk", "tangerine", 4.5],
  ]) {
    assert.ok(contrast(c[fg], c[bg]) >= min, `${fg} on ${bg} is ${contrast(c[fg], c[bg]).toFixed(2)}`);
  }
  const sheet = css();
  for (const name of ["--cr-tangerine-ink:\\s*#9A3D14", "--cr-sea-ink-soft:\\s*#4A5878", "--cr-sunset:\\s*#F8DCC4"]) {
    assert.match(sheet, new RegExp(name, "i"));
  }
  assert.deepEqual(owners(sheet, /(?:^|[;\s])color:\s*var\(--cr-tangerine\)/), [".cr-route-rule"], "raw jeruk (2.7:1) never colours text");
  assert.match(sheet, /\.cr-form-control::placeholder\s*\{[^}]*color:\s*var\(--cr-sea-ink-soft\)/);
  assert.doesNotMatch(sheet, /color-mix\(in srgb,\s*var\(--cr-sea-ink\)/, "no translucent text colours");
});

test("text on the porcelain chapters stays AA at every point of the morning-to-sunset ramp", () => {
  const c = tokens();
  for (const day of [0, 0.25, 0.5, 0.75, 1]) {
    const sky = mix(c.sunset, c.porcelain, day);
    for (const [fg, min] of [["seaInk", 7], ["cobalt", 4.5], ["tangerineInk", 4.5], ["seaInkSoft", 4.5]]) {
      const ratio = contrast(c[fg], sky);
      assert.ok(ratio >= min, `${fg} on the sky at ${day} is ${ratio.toFixed(2)}`);
    }
    assert.ok(contrast(c.cobalt, sky) >= 3, "the focus ring on porcelain chapters stays at least 3:1");
  }
});

test("couple names are Corinthia signatures and chapter titles stay Newsreader italic", () => {
  const { CobaltRiviera } = createLoader()("index");
  const { document } = new JSDOM(renderToStaticMarkup(React.createElement(CobaltRiviera, { invitation: invitation(), guest: null }))).window;
  const cover = document.querySelector("#cr-cover h1");
  assert.ok(cover.classList.contains("cr-script"));
  assert.match(cover.textContent, /Nadia.*&.*Arka/s, "the names are joined by an ampersand");
  for (const id of ["cr-hero-heading", "cr-closing-heading"]) {
    assert.ok(document.getElementById(id).classList.contains("cr-script"), `${id} is script`);
  }
  const people = [...document.querySelectorAll(".cr-person-copy h3")];
  assert.equal(people.length, 2);
  for (const name of people) assert.ok(name.classList.contains("cr-script"));
  const chapters = [...document.querySelectorAll("#cr-content section h2")].filter((title) => !title.classList.contains("cr-script"));
  assert.ok(chapters.length >= 4, `${chapters.length} chapter titles stay Newsreader`);

  const sheet = css();
  for (const selector of [".cr-hero-copy h2", ".cr-person-copy h3", ".cr-closing-copy h2", ".cr-cover-names", ".cr-hero-horizon-name"]) {
    for (const body of rules(sheet, selector)) {
      assert.doesNotMatch(body, /max-width:\s*[\d.]+ch/, `${selector} is a name: never capped by a ch measure`);
      assert.doesNotMatch(body, /letter-spacing:\s*-/, `${selector}: script needs no negative tracking`);
    }
  }
  assert.match(sheet, /\.cr-cover-amp\s*\{[^}]*font-family:\s*var\(--cr-text\)[^}]*font-style:\s*italic/, "the ampersand is a Newsreader italic accent");
  assert.match(sheet, /\.cr-person-monogram\s*\{[^}]*font:\s*700 [^;]*var\(--cr-script\)/, "a missing portrait shows a script initial");
});

test("the cover is a cobalt sea whose two foam-edged waves recede on the first tap", async () => {
  const { CobaltRiviera } = createLoader()("index");
  const { document } = new JSDOM(renderToStaticMarkup(React.createElement(CobaltRiviera, { invitation: invitation(), guest: null }))).window;
  assert.equal(document.querySelector(".cr-horizon-shutter, .cr-horizon-seam"), null, "the horizon shutters are retired");
  const sea = document.querySelector("#cr-cover .cr-sea");
  assert.ok(sea, "the cover carries the sea");
  assert.equal(sea.getAttribute("aria-hidden"), "true");
  const waves = [...sea.querySelectorAll(".cr-wave")];
  assert.deepEqual(waves.map((wave) => wave.classList.contains("cr-wave-front")), [false, true], "the kolam swell lies under the cobalt wave");
  for (const wave of waves) {
    assert.equal(wave.querySelectorAll(".cr-wave-edge .cr-wave-foam").length, 1, "each wave drags a foam edge");
  }
  assert.ok(sea.querySelectorAll("*").length <= 20, `${sea.querySelectorAll("*").length} nodes`);
  const sand = sea.querySelector(".cr-sand-names");
  assert.ok(sand.classList.contains("cr-script"));
  assert.equal(sand.textContent, "Nadia & Arka");
  assert.ok(sand.compareDocumentPosition(waves[0]) & 4, "the waves cover the sand until they recede");
  const greeting = document.querySelector("#cr-cover .cr-cover-masthead [lang='it']");
  assert.equal(greeting?.textContent, "Saluti dalla Costa");
  const open = document.querySelector("#cr-cover button");
  assert.equal(open.className, "cr-cover-open");
  assert.match(open.textContent, /Buka undangan/);
  assert.equal(open.getAttribute("aria-controls"), "cr-content");
  assert.ok(open.querySelector(".cr-sun-mark"));

  const calls = [];
  const load = createLoader({ actions: { trackCoverOpened: async (...args) => { calls.push(args); } } });
  const withMusic = invitation({
    features: { ...invitation().features, music: true },
    media: { coverImageUrl: null, musicUrl: "/music.mp3" },
  });
  const view = await mount(React.createElement(load("index").CobaltRiviera, { invitation: withMusic, guest: null }));
  try {
    let plays = 0;
    view.document.querySelector("audio").play = async () => { plays += 1; };
    await act(async () => view.document.querySelector(".cr-cover-open").click());
    assert.equal(plays, 1, "music starts in the same tap");
    assert.deepEqual(calls, [["cobalt", null]]);
    assert.equal(view.document.getElementById("cr-content").hidden, false);
    assert.equal(view.document.getElementById("cr-cover").hasAttribute("inert"), true, "the cover stops taking taps at once");
  } finally { await view.cleanup(); }

  const sheet = css();
  assert.match(sheet, /\.cr-cover\s*\{[^}]*background:\s*var\(--cr-porcelain\)/, "under the waves lies porcelain sand");
  assert.match(sheet, /\.cr-wave\s*\{[^}]*transition:\s*transform 900ms/);
  assert.match(sheet, /\[data-opened="true"\] \.cr-wave-front\s*\{[^}]*transform:\s*translateY\(-112%\)/);
  assert.match(sheet, /\[data-opened="true"\] \.cr-wave-back\s*\{[^}]*transform:\s*translateY\(-112%\)[^}]*transition-delay:\s*150ms/);
  assert.match(sheet, /\[data-opened="true"\] \.cr-cover\s*\{[^}]*transition:[^}]*opacity 400ms ease 1000ms/, "the cover lingers for the tide, then fades");
  assert.match(sheet, /data-reduced-motion="true"\] :is\([^)]*\.cr-wave[^)]*\)\s*\{\s*transition:\s*none/);
  assert.match(sheet, /@media \(max-height: 700px\)\s*\{\s*\.cr-cover-names\s*\{\s*font-size:/, "short phones keep the open button on screen");
  for (const selector of [".cr-wave", ".cr-sand-names", ".cr-cover-frame"]) {
    for (const body of rules(sheet, selector)) {
      const transition = body.match(/transition:\s*([^;]+)/)?.[1];
      if (transition) for (const part of transition.split(/,(?![^(]*\))/)) assert.match(part.trim(), /^(opacity|transform|none)\b/, `${selector}: ${part}`);
    }
  }
});

test("the wave cover hydrates without mismatch when the browser prefers reduced motion", async () => {
  const { CobaltRiviera } = createLoader({ reducedMotion: true })("index");
  const element = React.createElement(CobaltRiviera, {
    invitation: invitation({ features: { ...invitation().features, countdown: false } }),
    guest: null,
  });
  const view = await mount(React.createElement("div"));
  const errors = [];
  const originalError = console.error;
  console.error = (...args) => errors.push(args.map(String).join(" "));
  let root;
  try {
    const container = view.document.createElement("div");
    view.document.body.append(container);
    container.innerHTML = renderToString(element);
    await act(async () => { root = hydrateRoot(container, element); });
    assert.deepEqual(errors, []);
    assert.ok(container.querySelector(".cr-sea .cr-wave-front"));
  } finally {
    console.error = originalError;
    if (root) await act(async () => root.unmount());
    await view.cleanup();
  }
});
