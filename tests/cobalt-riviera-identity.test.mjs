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

async function mount(element, { intersectionObserver = NoopObserver, setup = () => {} } = {}) {
  const dom = new JSDOM("<div id='root'></div>", { url: "https://invitation.test/", pretendToBeVisual: true });
  setup(dom.window);
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

test("two wave lines divide the chapters and sway only while on screen", async () => {
  const load = createLoader();
  const { CobaltRiviera } = load("index");
  const full = invitation({
    content: { openingQuote: "Laut mengajari kami sabar.", openingMessage: null, closingMessage: null },
  });
  const { document } = new JSDOM(renderToStaticMarkup(React.createElement(CobaltRiviera, { invitation: full, guest: null }))).window;
  const sections = [...document.querySelectorAll("#cr-content main > section")];
  assert.ok(sections.length >= 8);
  for (const section of sections) {
    const dividers = section.querySelectorAll(":scope > .cr-divider");
    if (section.id === "cr-beranda") {
      assert.equal(dividers.length, 0, "the hero opens the page without a divider");
      continue;
    }
    assert.equal(dividers.length, 1, `${section.id} has one divider`);
    assert.equal(section.firstElementChild, dividers[0], `${section.id}: the divider sits at the chapter's top edge`);
    assert.equal(dividers[0].getAttribute("aria-hidden"), "true");
    assert.equal(dividers[0].querySelectorAll("path.cr-divider-line").length, 2);
    assert.equal(dividers[0].hasAttribute("data-sway"), false, "server markup is still");
  }

  const { WaveDivider } = load("components/WaveDivider");
  FakeIntersectionObserver.instances = [];
  const view = await mount(React.createElement(WaveDivider), { intersectionObserver: FakeIntersectionObserver });
  const observer = FakeIntersectionObserver.instances[0];
  try {
    const divider = view.document.querySelector(".cr-divider");
    assert.equal(divider.hasAttribute("data-sway"), false, "nothing moves before the observer reports");
    await act(async () => observer.trigger(true));
    assert.equal(divider.dataset.sway, "on");
    await act(async () => observer.trigger(false));
    assert.equal(divider.dataset.sway, "off", "it pauses again off screen");
    await act(async () => observer.trigger(true));
    assert.equal(divider.dataset.sway, "on", "and resumes when it returns");
  } finally { await view.cleanup(); }
  assert.equal(observer.elements.length, 0, "the observer is released on unmount");

  const sheet = css();
  assert.match(sheet, /\.cr-divider-line\s*\{[^}]*animation:\s*cr-sway[^;]*infinite[^}]*animation-play-state:\s*paused/);
  assert.match(sheet, /\.cr-divider\[data-sway="on"\] \.cr-divider-line\s*\{\s*animation-play-state:\s*running/);
  const sway = sheet.match(/@keyframes cr-sway\s*\{((?:[^{}]*\{[^}]*\})*)\s*\}/)?.[1] ?? "";
  assert.ok(sway, "cr-sway keyframes exist");
  for (const [, body] of sway.matchAll(/\{([^}]*)\}/g)) {
    for (const declaration of body.split(";").map((part) => part.trim()).filter(Boolean)) {
      assert.match(declaration, /^transform:/, `cr-sway animates only transform: ${declaration}`);
    }
  }
  assert.match(sheet, /\.cr-section-inner\s*\{[^}]*position:\s*relative[^}]*z-index:\s*1/, "chapter content stays above the divider");
});

test("the sky warms from morning to sunset with scroll and the sun sinks down the margin", async () => {
  const load = createLoader();
  const { RivieraSky } = load("components/RivieraSky");
  const view = await mount(React.createElement(RivieraSky));
  try {
    const sky = view.document.querySelector(".cr-sky");
    assert.equal(sky.getAttribute("aria-hidden"), "true");
    assert.ok(sky.querySelector(".cr-sky-dusk"));
    assert.ok(sky.querySelector("svg.cr-sun .cr-sun-day") && sky.querySelector("svg.cr-sun .cr-sun-dusk"));
    assert.ok(sky.querySelectorAll("*").length <= 20);
    assert.equal(sky.style.getPropertyValue("--cr-day"), "1.0000", "jsdom cannot scroll, so the day has ended");
  } finally { await view.cleanup(); }

  const { document } = new JSDOM(renderToStaticMarkup(React.createElement(load("index").CobaltRiviera, { invitation: invitation(), guest: null }))).window;
  assert.ok(document.querySelector("#cr-content > .cr-sky"), "the sky belongs to the opened invitation");
  assert.equal(document.querySelector("#cr-cover .cr-sky"), null);
  assert.equal(document.querySelector(".cr-sky").getAttribute("style"), null, "server markup carries no scroll state");

  const sheet = css();
  assert.match(sheet, /\.cr-sky\s*\{[^}]*--cr-day:\s*0[^}]*position:\s*fixed[^}]*background:\s*var\(--cr-porcelain\)/, "morning is the porcelain");
  assert.match(sheet, /\.cr-sky-dusk\s*\{[^}]*background:\s*var\(--cr-sunset\)[^}]*opacity:\s*var\(--cr-day\)[^}]*will-change:\s*opacity/, "sunset is the senja layer at --cr-day");
  assert.match(sheet, /\.cr-sun\s*\{[^}]*transform:\s*translateY\(calc\(var\(--cr-day\) \* [^)]+\)\)[^}]*will-change:\s*transform/);
  for (const [, selector, body] of sheet.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    for (const declaration of body.split(";").map((part) => part.trim())) {
      if (declaration.includes("var(--cr-day)")) {
        assert.match(declaration, /^(opacity|transform):/, `${selector.trim()}: only opacity and transform follow the scroll (${declaration})`);
      }
    }
  }
  assert.match(sheet, /\.cr-content > main\s*\{[^}]*position:\s*relative[^}]*z-index:\s*1/);
  assert.match(sheet, /\.cr-content \.cr-surface-porcelain\s*\{\s*background:\s*transparent/, "porcelain chapters show the sky");
  assert.match(sheet, /prefers-reduced-motion: reduce\)[\s\S]*\.cr-sky\s*\{\s*--cr-day:\s*1 !important/, "reduced motion pins one palette");
});

test("the sky starts at morning once the cover opens, sits behind the content and never takes a tap", async () => {
  let resized = null;
  class FakeResizeObserver {
    constructor(callback) { resized = callback; }
    observe() {}
    disconnect() {}
  }
  const setup = (window) => {
    window.ResizeObserver = FakeResizeObserver;
    Object.defineProperty(window.document.documentElement, "scrollHeight", { configurable: true, value: 640 });
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 640 });
  };
  const view = await mount(React.createElement(createLoader()("index").CobaltRiviera, { invitation: invitation(), guest: null }), { setup });
  const frame = () => act(async () => new Promise((done) => view.window.requestAnimationFrame(() => done())));
  try {
    const sky = view.document.querySelector("#cr-content > .cr-sky");
    assert.equal(sky.nextElementSibling.tagName, "MAIN", "the sky lies directly under main");
    assert.equal(sky.style.getPropertyValue("--cr-day"), "1.0000", "behind the cover nothing scrolls yet");
    await act(async () => view.document.querySelector(".cr-cover-open").click());
    Object.defineProperty(view.document.documentElement, "scrollHeight", { configurable: true, value: 6400 });
    resized([]);
    await frame();
    assert.equal(sky.style.getPropertyValue("--cr-day"), "0.0000", "the opened invitation starts in the morning");
    Object.defineProperty(view.window, "scrollY", { configurable: true, value: 2880 });
    view.window.dispatchEvent(new view.window.Event("scroll"));
    await frame();
    assert.equal(sky.style.getPropertyValue("--cr-day"), "0.5000");
  } finally { await view.cleanup(); }

  const sheet = css();
  const [sky] = rules(sheet, ".cr-sky");
  assert.match(sky, /pointer-events:\s*none/, "the sky never intercepts a tap");
  assert.match(sky, /z-index:\s*0/);
  assert.doesNotMatch(sky, /will-change/, "the sky itself is painted once");
  const [sun] = rules(sheet, ".cr-sun");
  assert.match(sun, /left:\s*max\(4px, env\(safe-area-inset-left\)\)/, "the sun keeps to the left margin");
  assert.match(sun, /width:\s*clamp\(12px, 2vw, 24px\)/, "at 320px the 12px sun fits the 20px gutter");
});

test("only the porcelain chapters turn transparent, and their text uses colours proven on the sky ramp", () => {
  const full = invitation({
    content: { openingQuote: "Laut mengajari kami sabar.", openingMessage: "Dengan hormat.", closingMessage: "Sampai jumpa." },
    features: { ...invitation().features, gift: true, livestream: true, dressCode: true },
    gifts: [{ id: "gift", bankName: "Bank", accountName: "Nadia", accountNumber: "123", sortOrder: 0 }],
    wishes: [{ id: "w", guestName: "Tamu", message: "Selamat!", createdAt: "2030-01-02T00:00:00Z" }],
  });
  const { document } = new JSDOM(renderToStaticMarkup(React.createElement(createLoader()("index").CobaltRiviera, { invitation: full, guest: null }))).window;
  const porcelain = [...document.querySelectorAll("#cr-content main > section.cr-surface-porcelain")].map((section) => section.id);
  assert.deepEqual(porcelain, ["cr-beranda", "cr-mempelai", "cr-acara", "cr-galeri", "cr-ucapan"], "the chapters that show the sky");

  // Every text colour any porcelain chapter can carry is one of the four the
  // ramp test proves at AA, or the element brings its own opaque background.
  const proven = new Set(["sea-ink", "cobalt", "tangerine-ink", "sea-ink-soft"]);
  const sheet = css();
  const classes = new Set();
  for (const id of porcelain) {
    for (const node of document.getElementById(id).querySelectorAll("[class]")) {
      for (const name of node.classList) classes.add(name);
    }
  }
  for (const [, selector, body] of sheet.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const color = body.match(/(?:^|[;\s])color:\s*var\(--cr-([a-z-]+)\)/)?.[1];
    if (!color || proven.has(color) || /background:\s*var\(--cr-(?!porcelain)/.test(body)) continue;
    for (const part of selector.trim().split(/,(?![^(]*\))/)) {
      const subject = part.trim().split(/\s+|>/).filter(Boolean).at(-1) ?? "";
      if (/\.cr-(surface|cover|gate|rsvp|livestream|closing|countdown|quote|story|dress|gift|route|music|lightbox|hero-horizon)/.test(part)) continue;
      const named = [...subject.matchAll(/\.([\w-]+)/g)].map((match) => match[1]);
      assert.ok(!named.some((name) => classes.has(name)), `${part.trim()} colours porcelain-chapter text with --cr-${color}`);
    }
  }
});

async function rsvp({ guestName = "Bude Sri", choose, changeTo = null, typedName = null }) {
  let resolve;
  const { RsvpSection } = createLoader({ actions: { submitRsvp: () => new Promise((done) => { resolve = done; }) } })("sections/RsvpSection");
  const view = await mount(React.createElement(RsvpSection, { invitationId: "cobalt", slug: "cobalt", guestToken: "t", guestName }));
  const form = view.document.querySelector("#cr-rsvp form");
  if (typedName) form.elements.namedItem("guestName").value = typedName;
  await act(async () => pick(form, choose).click());
  await submit(view, form);
  if (changeTo) await act(async () => pick(form, changeTo).click());
  await act(async () => { resolve({ status: "success" }); });
  return view;
}

test("a confirmed RSVP is stamped with an orange 'Diterima' postmark beside the thank-you", async () => {
  const attending = await rsvp({ choose: "Hadir" });
  try {
    const sheetEl = attending.document.querySelector("#cr-rsvp .cr-rsvp-sheet");
    const status = sheetEl.querySelector('[role="status"]');
    assert.match(status.textContent, /Terima kasih\..*Konfirmasi kehadiran Anda telah kami terima/s);
    const mark = sheetEl.querySelector("[data-cr-postmark]");
    assert.ok(mark, "the postmark is stamped");
    assert.equal(mark.getAttribute("aria-hidden"), "true", "the status text carries the message");
    assert.equal(status.contains(mark), false, "the postmark is never inside the confirmation");
    assert.ok(status.compareDocumentPosition(mark) & 4, "it follows the confirmation in reading order");
    assert.deepEqual([...mark.querySelectorAll("text")].map((text) => text.textContent), ["DITERIMA", "HADIR"]);
    assert.ok(mark.querySelectorAll("*").length <= 20);
  } finally { await attending.cleanup(); }

  const declined = await rsvp({ choose: "Tidak Hadir" });
  try {
    assert.match(declined.document.querySelector('#cr-rsvp [role="status"]').textContent, /Terima kasih/);
    assert.deepEqual([...declined.document.querySelectorAll("[data-cr-postmark] text")].map((text) => text.textContent), ["DITERIMA", "TIDAK HADIR"]);
  } finally { await declined.cleanup(); }

  const sheet = css();
  for (const body of rules(sheet, ".cr-postmark")) {
    assert.doesNotMatch(body, /position:\s*(absolute|fixed)/, "the postmark takes its own row and never overlaps the text");
  }
  assert.match(rules(sheet, ".cr-postmark").join(";"), /animation:\s*cr-stamp[^;]*both/, "at rest (and under reduced motion) the stamp shows");
  assert.match(sheet, /@keyframes cr-stamp\s*\{\s*0%\s*\{\s*opacity:\s*0;\s*transform:/);
  assert.match(sheet, /\.cr-postmark text\s*\{[^}]*fill:\s*var\(--cr-tangerine-ink\)/);
  assert.match(sheet, /\.cr-postmark-ring\s*\{[^}]*stroke:\s*var\(--cr-tangerine\)/, "the ring is jeruk orange");
  const c = tokens();
  assert.ok(contrast(c.tangerineInk, c.porcelain) >= 4.5, "the postmark lettering is AA on the porcelain card");
});

test("the postmark names the attendance that was submitted, not a choice changed while sending", async () => {
  const accepted = await rsvp({ choose: "Hadir", changeTo: "Tidak Hadir" });
  try {
    assert.equal(accepted.document.querySelectorAll("[data-cr-postmark] text")[1].textContent, "HADIR", "a stored acceptance reads HADIR");
  } finally { await accepted.cleanup(); }

  const declined = await rsvp({ choose: "Tidak Hadir", changeTo: "Hadir" });
  try {
    assert.equal(declined.document.querySelectorAll("[data-cr-postmark] text")[1].textContent, "TIDAK HADIR", "a stored decline never reads HADIR");
  } finally { await declined.cleanup(); }
});

test("a sent wish rolls into a bottle that drifts away inside its own band; the thank-you stays", async () => {
  const { WishBottle } = createLoader()("components/WishBottle");
  const band = new JSDOM(renderToStaticMarkup(React.createElement(WishBottle, { message: "Bahagia selalu" }))).window.document.querySelector("[data-cr-bottle]");
  assert.equal(band.getAttribute("aria-hidden"), "true");
  assert.equal(band.querySelector(".cr-bottle-note").textContent, "Bahagia selalu");
  assert.ok(band.querySelector("svg.cr-bottle .cr-bottle-bob") && band.querySelector("svg.cr-bottle-sea"));
  assert.ok(band.querySelectorAll("*").length <= 20, `${band.querySelectorAll("*").length} nodes`);
  const long = new JSDOM(renderToStaticMarkup(React.createElement(WishBottle, { message: "doa ".repeat(100) }))).window.document;
  assert.ok(long.querySelector(".cr-bottle-note").textContent.length <= 80);
  const still = createLoader({ reducedMotion: true })("components/WishBottle").WishBottle;
  assert.equal(renderToStaticMarkup(React.createElement(still, { message: "Bahagia selalu" })), "");

  const wishes = [{ id: "w1", guestName: "Pak Joko", message: "Selamat menempuh hidup baru", createdAt: "2030-01-02T00:00:00Z" }];
  const { WishesSection } = createLoader({ actions: { submitWish: async () => ({ status: "success" }) } })("sections/WishesSection");
  const view = await mount(React.createElement(WishesSection, { invitationId: "cobalt", slug: "cobalt", guestToken: "t", guestName: "Bude Sri", wishes }));
  try {
    const form = view.document.querySelector("#cr-ucapan form");
    form.elements.namedItem("message").value = "Bahagia selalu";
    await submit(view, form);
    const section = view.document.getElementById("cr-ucapan");
    const status = section.querySelector('[role="status"]');
    assert.match(status.textContent, /Terima kasih atas ucapan dan doanya/);
    const bottle = section.querySelector("[data-cr-bottle]");
    assert.equal(bottle.querySelector(".cr-bottle-note").textContent, "Bahagia selalu", "the sent text, captured at submit");
    assert.equal(bottle.contains(status), false, "the thank-you is never inside the band");
    assert.ok(bottle.compareDocumentPosition(status) & 4, "the band sits above the thank-you, below the heading");
    assert.equal(section.querySelectorAll("[data-wish-id]").length, 1, "no optimistic insert: the list waits for revalidation");
  } finally { await view.cleanup(); }

  const reduced = createLoader({ reducedMotion: true, actions: { submitWish: async () => ({ status: "success" }) } })("sections/WishesSection").WishesSection;
  const calm = await mount(React.createElement(reduced, { invitationId: "cobalt", slug: "cobalt", guestToken: "t", guestName: "Bude Sri", wishes: [] }));
  try {
    const form = calm.document.querySelector("#cr-ucapan form");
    form.elements.namedItem("message").value = "Bahagia selalu";
    await submit(calm, form);
    assert.match(calm.document.querySelector('#cr-ucapan [role="status"]').textContent, /Terima kasih/);
    assert.equal(calm.document.querySelector("[data-cr-bottle]"), null, "no bottle under reduced motion");
  } finally { await calm.cleanup(); }

  const sheet = css();
  const bandRule = rules(sheet, ".cr-bottle-band").join(";");
  assert.match(bandRule, /top:\s*0/);
  assert.match(bandRule, /height:\s*6rem/);
  assert.match(bandRule, /overflow:\s*hidden/, "the bottle never leaves its band");
  assert.match(rules(sheet, ".cr-wish-sent").join(";"), /padding-top:\s*6rem/, "the band's row is reserved, so nothing jumps when it leaves");
  assert.match(sheet, /prefers-reduced-motion: reduce\)[\s\S]*\.cr-wish-sent\s*\{\s*padding-top:\s*0/, "no empty row under reduced motion");
  const note = rules(sheet, ".cr-bottle-note").join(";");
  assert.match(note, /white-space:\s*nowrap/, "one line only");
  assert.match(note, /text-overflow:\s*ellipsis/);
  for (const name of ["cr-note-roll", "cr-bottle-bob", "cr-bottle-drift"]) {
    const frames = sheet.match(new RegExp(`@keyframes ${name}\\s*\\{((?:[^{}]*\\{[^}]*\\})*)\\s*\\}`))?.[1] ?? "";
    assert.ok(frames, `${name} keyframes exist`);
    for (const [, body] of frames.matchAll(/\{([^}]*)\}/g)) {
      for (const declaration of body.split(";").map((part) => part.trim()).filter(Boolean)) {
        assert.match(declaration, /^(transform|opacity):/, `${name}: ${declaration}`);
      }
    }
  }
});

test("the bottle sails once: a server refresh of the list never replays it, and it leaves for good", async () => {
  const { WishesSection } = createLoader({ actions: { submitWish: async () => ({ status: "success" }) } })("sections/WishesSection");
  let setWishes;
  function Host() {
    const [wishes, update] = React.useState([]);
    setWishes = update;
    return React.createElement(WishesSection, { invitationId: "cobalt", slug: "cobalt", guestToken: "t", guestName: "Bude Sri", wishes });
  }
  const view = await mount(React.createElement(Host));
  try {
    const form = view.document.querySelector("#cr-ucapan form");
    form.elements.namedItem("message").value = "Bahagia selalu";
    await submit(view, form);
    const band = view.document.querySelector("[data-cr-bottle]");
    assert.equal(band.getAttribute("aria-hidden"), "true");
    await act(async () => setWishes([{ id: "w1", guestName: "Bude Sri", message: "Bahagia selalu", createdAt: "2030-01-02T00:00:00Z" }]));
    assert.equal(view.document.querySelector("[data-cr-bottle]"), band, "the revalidated list does not remount the bottle");
    const end = (name) => { const event = new view.window.Event("animationend", { bubbles: true }); event.animationName = name; return event; };
    await act(async () => band.querySelector(".cr-bottle-bob").dispatchEvent(end("cr-bottle-bob")));
    assert.ok(view.document.querySelector("[data-cr-bottle]"), "only the drift ends it");
    await act(async () => band.querySelector("svg.cr-bottle").dispatchEvent(end("cr-bottle-drift")));
    assert.equal(view.document.querySelector("[data-cr-bottle]"), null, "gone once it has drifted away");
    await act(async () => setWishes((current) => [...current]));
    assert.equal(view.document.querySelector("[data-cr-bottle]"), null, "and it never comes back");
    assert.match(view.document.querySelector('#cr-ucapan [role="status"]').textContent, /Terima kasih atas ucapan dan doanya/);
    assert.equal(view.document.querySelectorAll("[data-wish-id]").length, 1);
  } finally { await view.cleanup(); }

  const source = readFileSync(resolve(cobaltRoot, "components/WishBottle.tsx"), "utf8");
  assert.match(source, /setTimeout\(/, "a missed animationend still removes the band");
  assert.doesNotMatch(source, /Math\.random\(|querySelector|<img/);
});

const ENGLISH_LABELS = [
  "Sunlit invitation", "The wedding of", "CR / 04", "Meet the hosts", "/ Riviera",
  "One celebration, every stop in view.", "Itinerary", "Next horizon", "Wardrobe coordinates", "Dress code",
  "Live broadcast", "Join from anywhere", "East / Sun / Celebration", "Travel folio receipts",
  "With warmth from the Riviera", "AC/0", "Matur nuwun", "Grazie",
];

/** Every guest-facing string (not CSS): visible text plus aria-labels, placeholders, alt text and titles. */
function guestCopy(document) {
  const attributes = [...document.querySelectorAll("[aria-label], [placeholder], [alt], [title]")]
    .flatMap((element) => ["aria-label", "placeholder", "alt", "title"].map((name) => element.getAttribute(name) ?? ""));
  const body = document.body.cloneNode(true);
  for (const code of body.querySelectorAll("style, script")) code.remove();
  return [body.textContent, ...attributes].join("\n");
}

function assertIndonesian(copy, expected) {
  for (const english of ENGLISH_LABELS) assert.ok(!copy.includes(english), `English label left: ${english}`);
  for (const label of expected) assert.ok(copy.includes(label), `missing Indonesian label: ${label}`);
}

function assertItalianAccents(document) {
  const accents = [...document.querySelectorAll("[lang='it']")];
  assert.ok(accents.length >= 1);
  for (const accent of accents) {
    assert.match(accent.textContent, /^Saluti( dalla Costa)?$/, "Italian appears only as the tagged Saluti accent");
  }
  // Wherever "Saluti" is written, it sits inside a lang="it" element.
  const walker = document.createTreeWalker(document.body, 4);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (/Saluti/.test(node.textContent)) assert.ok(node.parentElement.closest("[lang='it']"), "every Saluti is tagged lang=it");
  }
}

function fullInvitation() {
  return invitation({
    theme: { slug: "cobalt-riviera", settings: { dressCode: { description: "Biru dan putih.", groups: [{ label: "Tamu", colors: ["#1D3E9E"] }] } } },
    events: [{ ...invitation().events[0], mapsUrl: "https://maps.example.test/a", livestreamUrl: "https://live.example.test/a" }],
    gifts: [{ id: "gift", providerType: "bank", providerName: "Bank", accountNumber: "123", accountName: "Nadia", logoUrl: null, sortOrder: 0 }],
    wishes: [{ id: "w", guestName: "Bude Sri", message: "Bahagia selalu", createdAt: "2030-01-02T00:00:00Z" }],
    content: { openingQuote: "Kutipan.", openingMessage: "Pembuka.", closingMessage: "Penutup." },
    features: { music: true, countdown: true, maps: true, story: true, gallery: true, dressCode: true,
      livestream: true, rsvp: true, wishes: true, gift: true, guestPersonalization: true },
    media: { coverImageUrl: null, musicUrl: "/music.mp3" },
  });
}

const WEDDING_LABELS = [
  "Pernikahan", "Salam dari pesisir", "Yang berbahagia", "Kartu pos 01", "Rangkaian acara",
  "Satu perayaan, setiap persinggahan.", "Hitung mundur", "Panduan busana", "Saran busana",
  "Siaran langsung", "Hadir dari mana saja", "Laut / Matahari / Perayaan", "Amplop digital", "Amplop 01",
  "Salam hangat dari tepi laut", "Google Kalender",
];

test("every guest-facing label speaks Bahasa Indonesia; Italian stays a tagged accent", async () => {
  const { CobaltRiviera } = createLoader()("index");
  const wedding = new JSDOM(renderToStaticMarkup(React.createElement(CobaltRiviera, { invitation: fullInvitation(), guest: null }))).window.document;
  assertIndonesian(guestCopy(wedding), WEDDING_LABELS);
  assert.ok(guestCopy(wedding).includes("Cobalt Riviera"), "the theme name stays as the masthead brand mark");
  assertItalianAccents(wedding);
  assert.equal(wedding.querySelector(".cr-hero-horizon-route")?.getAttribute("lang"), "it", "the photo-less horizon carries Saluti");

  const party = invitation({ type: "birthday", features: { ...invitation().features, countdown: false } });
  const birthday = new JSDOM(renderToStaticMarkup(React.createElement(CobaltRiviera, { invitation: party, guest: null }))).window.document;
  assertIndonesian(guestCopy(birthday), ["Undangan perayaan", "Perayaan", "Tuan rumah", "Tandai kalender Anda", "Simpan tanggalnya"]);
  assert.ok(!guestCopy(birthday).includes("Pernikahan"), "a birthday is never called a wedding");
  assertItalianAccents(birthday);
  assert.equal(birthday.querySelector(".cr-hero-horizon-route")?.getAttribute("lang"), "it", "the photo-less horizon carries Saluti");
});

test("after opening, an attending RSVP and a sent wish, no English label appears anywhere", async () => {
  const actions = { submitRsvp: async () => ({ status: "success" }), submitWish: async () => ({ status: "success" }) };
  class FakeResizeObserver { observe() {} disconnect() {} }
  const setup = (window) => { window.ResizeObserver = FakeResizeObserver; window.HTMLMediaElement.prototype.play = async () => {}; };
  const view = await mount(React.createElement(createLoader({ actions })("index").CobaltRiviera, { invitation: fullInvitation(), guest: null }), { setup });
  try {
    await act(async () => view.document.querySelector(".cr-cover-open").click());
    assert.ok(view.document.querySelector(".cr-route-nav"), "the nav is shown once open");
    assert.ok(view.document.querySelector(".cr-music"), "the music control is shown once open");

    const rsvpForm = view.document.querySelector("#cr-rsvp form");
    rsvpForm.elements.namedItem("guestName").value = "Bude Sri";
    await act(async () => pick(rsvpForm, "Hadir").click());
    await submit(view, rsvpForm);
    assert.ok(view.document.querySelector("[data-cr-postmark]"), "the postmark is shown");

    const wishForm = view.document.querySelector("#cr-ucapan form");
    wishForm.elements.namedItem("guestName").value = "Bude Sri";
    wishForm.elements.namedItem("message").value = "Bahagia selalu";
    await submit(view, wishForm);

    const copy = guestCopy(view.document);
    assertIndonesian(copy, [...WEDDING_LABELS, "Navigasi undangan", "DITERIMA", "HADIR", "Terima kasih", "Jeda musik"]);
    assertItalianAccents(view.document);
  } finally { await view.cleanup(); }
});

test("the longer Indonesian labels fit a 320px phone without breaking mid-label", () => {
  const sheet = css();
  // "Saluti dalla Costa" + "Undangan perayaan" need ~295px; a 320px cover leaves ~282px.
  const [masthead] = rules(sheet, ".cr-cover-masthead");
  assert.match(masthead, /flex-wrap:\s*wrap/, "the masthead drops the label to its own line instead of splitting it");
  assert.match(rules(sheet, ".cr-cover-masthead > span").join(";"), /white-space:\s*nowrap/);
  assert.match(rules(sheet, ".cr-cover-masthead > span:last-child").join(";"), /margin-left:\s*auto/, "a wrapped label stays right-aligned");
  // "Amplop 01" is ~63px; the receipt's route column must size to it.
  assert.match(rules(sheet, ".cr-gift-route").join(";"), /white-space:\s*nowrap/);
  assert.doesNotMatch(sheet, /\.cr-gift-receipt\s*\{[^}]*grid-template-columns:\s*3\.5rem/, "no fixed 56px route column");
});
