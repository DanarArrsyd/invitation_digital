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
const midnightRoot = resolve(srcRoot, "themes/midnight-atelier");

/**
 * Loads Midnight TS/TSX through vm. Like every Midnight harness, `motion/react`
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
  return (relative) => load(resolve(midnightRoot, relative));
}

/** Records observed elements and options; `trigger()` reports them all. */
class FakeIntersectionObserver {
  static instances = [];
  constructor(callback, options) { this.callback = callback; this.options = options; this.elements = []; FakeIntersectionObserver.instances.push(this); }
  observe(element) { this.elements.push(element); }
  disconnect() { this.elements = []; }
  trigger(isIntersecting = true) { this.callback(this.elements.map((target) => ({ target, isIntersecting }))); }
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
    id: "midnight", type: "wedding", slug: "midnight", title: "Nadia & Arka", status: "published",
    eventDate: "2030-02-14", venueSummary: "Atelier Hall", publishedAt: "2030-01-01T00:00:00Z", expiresAt: null,
    timeZone: "Asia/Jakarta",
    theme: { slug: "midnight-atelier", settings: {} },
    people: [
      { id: "b", role: "bride", fullName: "Nadia Rahmani", nickname: "Nadia", fatherName: null, motherName: null, photoUrl: null, bio: null, sortOrder: 0 },
      { id: "g", role: "groom", fullName: "Arka Pradipta", nickname: "Arka", fatherName: null, motherName: null, photoUrl: null, bio: null, sortOrder: 1 },
    ],
    events: [{ id: "event", eventType: "Resepsi", title: "Resepsi", eventDate: "2030-02-14",
      startTime: "19:00:00", endTime: "22:00:00", venueName: "Atelier Hall", address: null,
      mapsUrl: null, livestreamUrl: null, sortOrder: 0 }],
    stories: [{ id: "s", title: "Pertemuan", storyDate: null, yearLabel: "2021", description: "Di galeri malam.", imageUrl: null, sortOrder: 0 }],
    gallery: [
      { id: "g1", imageUrl: "/a.jpg", caption: "Malam pertama", altText: null, aspectRatio: "portrait_4_5", sortOrder: 0 },
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

const tokens = () => createLoader()("tokens").MIDNIGHT_ATELIER_TOKENS.colors;

/** Declaration bodies of every rule whose selector ends with `selector`. */
function rules(sheet, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return [...sheet.matchAll(new RegExp(`(?:^|[}\\s])${escaped}\\s*\\{([^}]*)\\}`, "g"))].map((match) => match[1]);
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

/** `fg` laid over `bg` at `alpha` (opacity or an rgba wash), as a hex colour. */
function mix(fg, bg, alpha) {
  return `#${[1, 3, 5].map((i) => Math.round(parseInt(fg.slice(i, i + 2), 16) * alpha + parseInt(bg.slice(i, i + 2), 16) * (1 - alpha))
    .toString(16).padStart(2, "0")).join("")}`;
}

/** Reads `--name: rgba(r, g, b, a)` from the stylesheet as `{ hex, alpha }`. */
function rgba(sheet, name) {
  const match = sheet.match(new RegExp(`${name}:\\s*rgba\\((\\d+),\\s*(\\d+),\\s*(\\d+),\\s*([\\d.]+)\\)`));
  assert.ok(match, `${name} is an rgba token`);
  const hex = `#${match.slice(1, 4).map((v) => Number(v).toString(16).padStart(2, "0")).join("")}`;
  return { hex, alpha: Number(match[4]) };
}

test("the Malam di Ballroom palette keeps every text pair at WCAG AA", () => {
  const c = tokens();
  assert.deepEqual(
    [c.ink, c.oxblood, c.champagne, c.pearl, c.smoke],
    ["#14121A", "#5E1A22", "#D8C08A", "#EDE6DA", "#6E6873"],
  );
  for (const [fg, bg, min] of [
    ["pearl", "ink", 7], ["pearl", "lacquer", 7], ["pearl", "oxblood", 7],
    ["champagne", "ink", 4.5], ["champagne", "lacquer", 4.5], ["champagne", "oxblood", 4.5],
    ["smokeInk", "ink", 4.5], ["smokeInk", "lacquer", 4.5], ["smokeInk", "oxblood", 4.5],
    ["ink", "pearl", 7], ["oxblood", "pearl", 4.5], ["ink", "champagne", 4.5],
  ]) {
    assert.ok(contrast(c[fg], c[bg]) >= min, `${fg} on ${bg} is ${contrast(c[fg], c[bg]).toFixed(2)}`);
  }
  const sheet = css();
  assert.match(sheet, /--ma-smoke-ink:\s*#A9A2AD/i);
  assert.doesNotMatch(sheet, /[{;\s]color:\s*(?:color-mix\(in srgb,\s*)?var\(--ma-smoke\)/, "asap (≈3.4:1) never colours small text");
});

test("text stays AA under the spotlight wash and a resting heading stays at least 3:1", () => {
  const c = tokens();
  const sheet = css();
  const dim = Number(sheet.match(/--ma-dim:\s*([\d.]+)/)?.[1]);
  assert.ok(dim > 0 && dim < 1, "--ma-dim is an opacity");
  for (const [fg, bg] of [["pearl", "ink"], ["pearl", "lacquer"], ["pearl", "oxblood"], ["ink", "pearl"]]) {
    const ratio = contrast(mix(c[fg], c[bg], dim), c[bg]);
    assert.ok(ratio >= 3, `dim ${fg} heading on ${bg} is ${ratio.toFixed(2)}`);
  }
  const light = rgba(sheet, "--ma-light");
  for (const [fg, bg] of [
    ["pearl", "ink"], ["pearl", "lacquer"], ["pearl", "oxblood"], ["ink", "pearl"], ["oxblood", "pearl"],
    ["champagne", "ink"], ["champagne", "lacquer"], ["champagne", "oxblood"], ["smokeInk", "ink"], ["smokeInk", "lacquer"],
  ]) {
    const ratio = contrast(c[fg], mix(light.hex, c[bg], light.alpha));
    assert.ok(ratio >= 4.5, `${fg} on lit ${bg} is ${ratio.toFixed(2)}`);
  }
  assert.ok(rgba(sheet, "--ma-light-strong").alpha > light.alpha, "picture lights are stronger than the heading wash");
});

test("light-form placeholders stay AA on mutiara (ink at 70% ≈ 6:1)", () => {
  const css = readFileSync(new URL("../src/themes/midnight-atelier/ThemeStyles.tsx", import.meta.url), "utf8");
  assert.match(css, /\.ma-form-dark \.ma-form-control::placeholder \{ color: color-mix\(in srgb, var\(--ma-ink\) 70%, transparent\); \}/);
});

test("couple names are Imperial Script signatures and chapter titles stay Bodoni italic", () => {
  const { MidnightAtelier } = createLoader()("index");
  const { document } = new JSDOM(renderToStaticMarkup(React.createElement(MidnightAtelier, { invitation: invitation(), guest: null }))).window;
  const cover = document.querySelector("#ma-cover h1");
  assert.ok(cover.classList.contains("ma-script"));
  assert.match(cover.textContent, /Nadia.*Arka/s);
  for (const id of ["ma-hero-heading", "ma-closing-heading"]) {
    assert.ok(document.getElementById(id).classList.contains("ma-script"), `${id} is script`);
  }
  const people = [...document.querySelectorAll(".ma-person-copy h3")];
  assert.equal(people.length, 2);
  for (const name of people) assert.ok(name.classList.contains("ma-script"));
  for (const title of document.querySelectorAll(".ma-chapter-heading h2, .ma-interaction-heading h2, .ma-countdown-intro h2")) {
    assert.ok(!title.classList.contains("ma-script"), `chapter "${title.textContent}" stays Bodoni`);
  }

  const sheet = css();
  for (const selector of [".ma-hero-copy h2", ".ma-person-copy h3", ".ma-closing-copy h2", ".ma-cover-names"]) {
    for (const body of rules(sheet, selector)) {
      assert.doesNotMatch(body, /max-width:\s*[\d.]+ch/, `${selector} is a name: never capped by a ch measure`);
      assert.doesNotMatch(body, /letter-spacing:\s*-/, `${selector}: script needs no negative tracking`);
    }
  }
  assert.match(sheet, /\.ma-cover-amp\s*\{[^}]*font-family:\s*var\(--ma-display\)/, "the ampersand stays a Bodoni italic accent");
});

test("the cover toasts with two champagne flutes and still opens on the first tap", async () => {
  const { MidnightAtelier } = createLoader()("index");
  const { document } = new JSDOM(renderToStaticMarkup(React.createElement(MidnightAtelier, { invitation: invitation(), guest: null }))).window;
  assert.equal(document.querySelector(".ma-curtain"), null, "the curtain seam is retired");
  const toast = document.querySelector("#ma-cover .ma-cover-stage svg.ma-toast");
  assert.ok(toast, "the flutes stand on the cover stage");
  assert.equal(toast.getAttribute("aria-hidden"), "true");
  assert.ok(document.querySelector("#ma-cover h1").compareDocumentPosition(toast) & 4, "the names sit above the flutes");
  assert.equal(toast.querySelectorAll(".ma-flute").length, 2);
  assert.ok(toast.querySelector(".ma-flute-left") && toast.querySelector(".ma-flute-right"));
  assert.equal(toast.querySelectorAll(".ma-toast-ring").length, 1);
  assert.ok(toast.querySelectorAll(".ma-toast-bubble").length >= 6);
  assert.ok(toast.querySelectorAll("*").length <= 20, `${toast.querySelectorAll("*").length} nodes`);
  const open = document.querySelector("#ma-cover button");
  assert.equal(open.className, "ma-cover-open");
  assert.match(open.textContent, /Buka undangan/);
  assert.equal(open.getAttribute("aria-controls"), "ma-content");

  const calls = [];
  const load = createLoader({ actions: { trackCoverOpened: async (...args) => { calls.push(args); } } });
  const withMusic = invitation({
    features: { ...invitation().features, music: true },
    media: { coverImageUrl: null, musicUrl: "/music.mp3" },
  });
  const view = await mount(
    React.createElement(load("index").MidnightAtelier, { invitation: withMusic, guest: null }),
    { intersectionObserver: FakeIntersectionObserver },
  );
  try {
    let plays = 0;
    view.document.querySelector("audio").play = async () => { plays += 1; };
    await act(async () => view.document.querySelector(".ma-cover-open").click());
    assert.equal(plays, 1, "music starts in the same tap");
    assert.deepEqual(calls, [["midnight", null]]);
    assert.equal(view.document.getElementById("ma-content").hidden, false);
    assert.equal(view.document.getElementById("ma-cover").hasAttribute("inert"), true, "the cover stops taking taps at once");
  } finally { await view.cleanup(); }

  const sheet = css();
  assert.match(sheet, /\[data-opened="true"\] \.ma-flute-left\s*\{[^}]*animation:/);
  assert.match(sheet, /\[data-opened="true"\] \.ma-toast-ring\s*\{[^}]*animation:/);
  assert.match(sheet, /\[data-opened="true"\] \.ma-cover\s*\{[^}]*transition:[^}]*opacity[^}]*1000ms/, "the cover lingers for the toast, then fades");
  assert.match(sheet, /data-reduced-motion="true"\] :is\([^)]*\.ma-flute[^)]*\)\s*\{[^}]*animation:\s*none/);
  assert.doesNotMatch(sheet, /ma-curtain/);
});

test("the toast cover hydrates without mismatch when the browser prefers reduced motion", async () => {
  const { MidnightAtelier } = createLoader({ reducedMotion: true })("index");
  const element = React.createElement(MidnightAtelier, {
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
    assert.ok(container.querySelector("svg.ma-toast"));
  } finally {
    console.error = originalError;
    if (root) await act(async () => root.unmount());
    await view.cleanup();
  }
});

test("the toast shrinks on short phones so the open button stays above the fold", () => {
  const css = readFileSync(new URL("../src/themes/midnight-atelier/ThemeStyles.tsx", import.meta.url), "utf8");
  assert.match(css, /@media \(max-height: 700px\) \{ \.ma-toast \{ width: clamp\(84px, 24vw, 120px\); margin-top: 1rem; \} \}/);
});
