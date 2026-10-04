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

test("chapter headings rest dim and a stage spotlight lights them once in view", async () => {
  const load = createLoader();
  const { MidnightAtelier } = load("index");
  const { document } = new JSDOM(renderToStaticMarkup(React.createElement(MidnightAtelier, { invitation: invitation(), guest: null }))).window;
  const headings = [...document.querySelectorAll("#ma-content section h2")].filter((heading) => !heading.classList.contains("ma-script"));
  assert.ok(headings.length >= 6, `${headings.length} chapter headings`);
  for (const heading of headings) {
    const spot = heading.closest(".ma-spotlight");
    assert.ok(spot, `"${heading.textContent}" stands in a spotlight`);
    assert.equal(spot.hasAttribute("data-spot"), false, "server markup is lit and unarmed");
  }

  const { EventsSection } = load("sections/EventsSection");
  const props = { events: invitation().events, mapsEnabled: false, timeZone: "Asia/Jakarta" };
  FakeIntersectionObserver.instances = [];
  const view = await mount(React.createElement(EventsSection, props), { intersectionObserver: FakeIntersectionObserver });
  try {
    const spot = view.document.querySelector("#ma-acara .ma-spotlight");
    assert.equal(spot.hasAttribute("data-spot"), false, "nothing dims before the observer reports");
    assert.equal(FakeIntersectionObserver.instances[0].options.rootMargin, "0px 0px -40% 0px");
    await act(async () => FakeIntersectionObserver.instances.forEach((observer) => observer.trigger(false)));
    assert.equal(spot.dataset.spot, "waiting");
    await act(async () => FakeIntersectionObserver.instances.forEach((observer) => observer.trigger(true)));
    assert.equal(spot.dataset.spot, "lit");
    assert.equal(spot.querySelector("h2").textContent, "Rangkaian acara");
  } finally { await view.cleanup(); }

  const sheet = css();
  assert.match(sheet, /\.ma-spotlight\[data-spot="waiting"\] h2\s*\{[^}]*opacity:\s*var\(--ma-dim\)/);
  assert.match(sheet, /\.ma-spotlight::before\s*\{[^}]*radial-gradient\([^)]*var\(--ma-light\)/);
  assert.match(sheet, /prefers-reduced-motion: reduce\)[\s\S]*\.ma-spotlight\[data-spot\] h2[^{]*\{\s*opacity:\s*1 !important/);
});

test("radial light appears only in the spotlight and picture lights, never as a page gradient", () => {
  const sheet = css();
  assert.doesNotMatch(sheet, /linear-gradient|conic-gradient/);
  const owners = [...sheet.matchAll(/([^{}]+)\{[^{}]*radial-gradient\(/g)].map(([, selector]) => selector.trim());
  assert.ok(owners.length >= 1);
  for (const selector of owners) assert.match(selector, /^\.ma-(spotlight|gallery-item)::(before|after)$/, selector);
});

/** Every section that carries a spotlight heading, switched on. */
function everySpotlight() {
  const base = invitation();
  return invitation({
    theme: { slug: "midnight-atelier", settings: { dressCode: { description: "Hitam formal.", groups: [] } } },
    events: base.events.map((event) => ({ ...event, livestreamUrl: "https://live.test/resepsi" })),
    gifts: [{ id: "gift", providerType: "bank", providerName: "Bank", accountNumber: "123", accountName: "Nadia", logoUrl: null, sortOrder: 0 }],
    features: { ...base.features, dressCode: true, livestream: true, gift: true },
  });
}

/** Selector → declaration bodies, with comma lists split (later rules win). */
function ruleMap(sheet) {
  const map = new Map();
  for (const [, selectors, body] of sheet.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    for (const selector of selectors.split(",").map((s) => s.trim().replace(/\s+/g, " "))) {
      map.set(selector, [...(map.get(selector) ?? []), body]);
    }
  }
  return map;
}

/**
 * The `--ma-*` token colouring `element` inside `spot`: the most specific
 * section/heading rule that sets a colour, else the surface's own text colour.
 */
function resolveColour(map, spot, element) {
  const tag = element.tagName.toLowerCase();
  const section = spot.closest("section");
  const own = [...section.classList].filter((name) => /^ma-/.test(name) && !/^ma-(section|surface-)/.test(name));
  const heads = [...spot.classList].filter((name) => name !== "ma-spotlight").reverse();
  const candidates = [
    ...own.flatMap((s) => heads.flatMap((h) => [`.${s} .${h} > ${tag}`, `.${s} .${h} ${tag}`])),
    ...heads.flatMap((h) => [`.${h} > ${tag}`, `.${h} ${tag}`]),
  ];
  for (const selector of candidates) {
    const colour = (map.get(selector) ?? []).map((body) => body.match(/(?:^|[;\s])color:\s*var\(--ma-([\w-]+)\)/)?.[1]).filter(Boolean).at(-1);
    if (colour) return { colour, from: selector };
  }
  const surface = section.className.match(/ma-surface-(\w+)/)[1];
  const colour = (map.get(`.ma-surface-${surface}`) ?? []).map((body) => body.match(/(?:^|[;\s])color:\s*var\(--ma-([\w-]+)\)/)?.[1]).filter(Boolean).at(-1);
  return { colour, from: `.ma-surface-${surface}` };
}

const tokenKey = (name) => name.replace(/-(\w)/g, (_, letter) => letter.toUpperCase());

test("every line of small text inside a spotlight stays AA over the wash on its own surface", () => {
  const c = tokens();
  const sheet = css();
  const map = ruleMap(sheet);
  const light = rgba(sheet, "--ma-light");
  const { MidnightAtelier } = createLoader()("index");
  const { document } = new JSDOM(renderToStaticMarkup(React.createElement(MidnightAtelier, { invitation: everySpotlight(), guest: null }))).window;
  const spots = [...document.querySelectorAll("#ma-content .ma-spotlight")];
  assert.equal(spots.length, 10, "couple, events, countdown, dress code, story, gallery, livestream, RSVP, wishes, gift");
  const surfaces = new Set();
  const seen = [];
  for (const spot of spots) {
    const surface = spot.closest("section").className.match(/ma-surface-(\w+)/)[1];
    surfaces.add(surface);
    // The wash spills 2.5rem above the heading; nothing may sit there.
    assert.equal(spot.previousElementSibling, null, `${spot.closest("section").id}: the heading opens its column`);
    const lit = mix(light.hex, c[surface], light.alpha);
    for (const element of spot.querySelectorAll("*")) {
      if (element.tagName === "H2" || !element.textContent.trim()) continue;
      const { colour, from } = resolveColour(map, spot, element);
      const fg = c[tokenKey(colour)];
      assert.ok(fg, `${from} resolves to a palette colour (${colour})`);
      const ratio = contrast(fg, lit);
      seen.push(`${surface}/${colour}=${ratio.toFixed(2)}`);
      assert.ok(ratio >= 4.5, `${spot.closest("section").id} ${element.tagName.toLowerCase()} (${colour} via ${from}) on lit ${surface} is ${ratio.toFixed(2)}`);
      if (surface === "oxblood") assert.ok(["champagne", "pearl"].includes(colour), `small text on lit oxblood is champagne or mutiara, not ${colour}`);
    }
  }
  assert.deepEqual([...surfaces].sort(), ["ink", "lacquer", "oxblood", "pearl"]);
  assert.ok(seen.length >= 13, seen.join(" "));
  // Asap ink on lit oxblood would be ≈3.7:1 — the reason oxblood intros stay champagne.
  assert.ok(contrast(c.smokeInk, mix(light.hex, c.oxblood, light.alpha)) < 4.5);
});

test("a resting heading keeps at least 3:1 on every surface, oxblood on mutiara included", () => {
  const c = tokens();
  const sheet = css();
  const map = ruleMap(sheet);
  const dim = Number(sheet.match(/--ma-dim:\s*([\d.]+)/)?.[1]);
  const { MidnightAtelier } = createLoader()("index");
  const { document } = new JSDOM(renderToStaticMarkup(React.createElement(MidnightAtelier, { invitation: everySpotlight(), guest: null }))).window;
  const spots = [...document.querySelectorAll("#ma-content .ma-spotlight")];
  assert.equal(spots.length, 10);
  for (const spot of spots) {
    const surface = spot.closest("section").className.match(/ma-surface-(\w+)/)[1];
    const { colour, from } = resolveColour(map, spot, spot.querySelector("h2"));
    const fg = c[tokenKey(colour)];
    const ratio = contrast(mix(fg, c[surface], dim), c[surface]);
    assert.ok(ratio >= 3, `${spot.closest("section").id} dim ${colour} (${from}) on ${surface} is ${ratio.toFixed(2)}`);
  }
  // Explicitly: should a mutiara heading ever turn oxblood, it still clears 3:1 (≈3.19).
  assert.ok(contrast(mix(c.oxblood, c.pearl, dim), c.pearl) >= 3);
});

test("spotlights agree on server and client, light at once when already on stage, and never stay dim without an observer", async () => {
  const markup = (reducedMotion) => {
    const { MidnightAtelier } = createLoader({ reducedMotion })("index");
    const { document } = new JSDOM(renderToStaticMarkup(React.createElement(MidnightAtelier, { invitation: everySpotlight(), guest: null }))).window;
    return [...document.querySelectorAll(".ma-spotlight")].map((spot) => spot.outerHTML);
  };
  assert.deepEqual(markup(true), markup(false), "no reduced-motion branching in the markup");

  const { EventsSection } = createLoader()("sections/EventsSection");
  const props = { events: invitation().events, mapsEnabled: false, timeZone: "Asia/Jakarta" };

  FakeIntersectionObserver.instances = [];
  const onStage = await mount(React.createElement(EventsSection, props), { intersectionObserver: FakeIntersectionObserver });
  try {
    await act(async () => FakeIntersectionObserver.instances.forEach((observer) => observer.trigger(true)));
    assert.equal(onStage.document.querySelector(".ma-spotlight").hasAttribute("data-spot"), false, "a heading already lit is left alone: no dim, no wash restart");
  } finally { await onStage.cleanup(); }

  const noObserver = await mount(React.createElement(EventsSection, props));
  try {
    assert.equal(noObserver.document.querySelector(".ma-spotlight").hasAttribute("data-spot"), false);
  } finally { await noObserver.cleanup(); }

  const sheet = css();
  const keyframes = sheet.match(/@keyframes ma-spot-on\s*\{([\s\S]*?)\}\s*\}/)?.[1] ?? sheet.match(/@keyframes ma-spot-on\s*\{([^}]*\})/)?.[1];
  assert.ok(keyframes, "spotlight keyframes");
  for (const [, property] of keyframes.matchAll(/([\w-]+)\s*:/g)) assert.equal(property, "opacity");
  for (const [selector, bodies] of ruleMap(sheet)) {
    if (!selector.includes(".ma-spotlight")) continue;
    for (const body of bodies) {
      const transition = body.match(/transition:\s*([^;]+)/)?.[1];
      if (transition) for (const part of transition.split(",")) assert.match(part.trim(), /^(opacity|transform|--[\w-]+|none)\b/, `${selector}: ${part}`);
    }
  }
});

test("an attending RSVP writes a tasselled dance card; declining keeps the plain thank-you", async () => {
  const { RsvpSection } = createLoader({ actions: { submitRsvp: async () => ({ status: "success" }) } })("sections/RsvpSection");
  async function answer(guestName, choice, typedName) {
    const view = await mount(React.createElement(RsvpSection, { invitationId: "midnight", slug: "midnight", guestToken: "t", guestName }));
    const form = view.document.querySelector("#ma-rsvp form");
    if (typedName) form.elements.namedItem("guestName").value = typedName;
    const button = [...form.querySelectorAll('button[type="button"]')].find((candidate) => candidate.textContent.trim() === choice);
    await act(async () => button.click());
    await act(async () => form.dispatchEvent(new view.window.Event("submit", { bubbles: true, cancelable: true })));
    return view;
  }

  const personal = await answer("Bude Sri", "Hadir");
  try {
    const section = personal.document.getElementById("ma-rsvp");
    assert.match(section.querySelector('[role="status"]').textContent, /Konfirmasi kehadiran Anda telah kami terima/);
    const card = section.querySelector("[data-ma-dance-card]");
    assert.ok(card, "the dance card appears");
    assert.equal(card.getAttribute("aria-hidden"), "true", "the status text carries the message");
    assert.ok(card.querySelector("svg.ma-dance-tassel"));
    const entries = [...card.querySelectorAll("dd")];
    assert.deepEqual(entries.map((entry) => entry.textContent), ["Bude Sri", "Hadir"], "name and attendance only; no invented party size");
    for (const entry of entries) {
      assert.ok(entry.classList.contains("ma-script"));
      assert.match(entry.style.getPropertyValue("--ma-write-delay"), /^\d+(\.\d+)?s$/);
    }
  } finally { await personal.cleanup(); }

  const typed = await answer(null, "Hadir", "Pak Joko");
  try {
    assert.equal(typed.document.querySelector("[data-ma-dance-card] dd").textContent, "Pak Joko", "a typed name is written too");
  } finally { await typed.cleanup(); }

  const declined = await answer("Bude Sri", "Tidak Hadir");
  try {
    assert.match(declined.document.querySelector('#ma-rsvp [role="status"]').textContent, /Terima kasih/);
    assert.match(declined.document.querySelector('#ma-rsvp [role="status"]').textContent, /Tercatat: Tidak hadir\./, "a decline is announced too");
    assert.equal(declined.document.querySelector("[data-ma-dance-card]"), null);
  } finally { await declined.cleanup(); }

  const sheet = css();
  assert.match(sheet, /@keyframes ma-write\s*\{\s*from\s*\{\s*clip-path:\s*inset\(0 100% 0 0\)/);
  for (const body of rules(sheet, ".ma-dance-card dd")) {
    assert.doesNotMatch(body, /clip-path/, "at rest, and under reduced motion, the card is filled in");
    assert.match(body, /animation:[^;]*both/);
  }
});

test("the dance card stays hidden on an error, reads AA on mutiara, wraps long names and only animates compositor properties", async () => {
  let result = { status: "error", message: "Gagal mengirim." };
  const { RsvpSection } = createLoader({ actions: { submitRsvp: async () => result } })("sections/RsvpSection");
  const view = await mount(React.createElement(RsvpSection, { invitationId: "midnight", slug: "midnight", guestToken: "t", guestName: null }));
  try {
    const form = () => view.document.querySelector("#ma-rsvp form");
    const longName = "Raden Ayu Kusumawardhani Prameswari Notonegoro Hadiningrat";
    form().elements.namedItem("guestName").value = longName;
    const hadir = [...form().querySelectorAll('button[type="button"]')].find((candidate) => candidate.textContent.trim() === "Hadir");
    await act(async () => hadir.click());
    await act(async () => form().dispatchEvent(new view.window.Event("submit", { bubbles: true, cancelable: true })));
    assert.ok(view.document.querySelector('#ma-rsvp [role="alert"]'), "the error is shown");
    assert.equal(view.document.querySelector("[data-ma-dance-card]"), null, "no card on an error");

    result = { status: "success" };
    await act(async () => form().dispatchEvent(new view.window.Event("submit", { bubbles: true, cancelable: true })));
    assert.ok(view.document.querySelector('#ma-rsvp [role="status"]'), "the confirmation text stays");
    assert.equal(view.document.querySelector("[data-ma-dance-card] dd").textContent, longName);
  } finally { await view.cleanup(); }

  const sheet = css();
  const c = tokens();
  const [card] = rules(sheet, ".ma-dance-card");
  assert.match(card, /background:\s*var\(--ma-pearl\)/);
  assert.match(card, /color:\s*var\(--ma-ink\)/);
  assert.match(card, /width:\s*min\(100%,/, "never wider than a 320px column");
  for (const selector of [".ma-dance-card > .ma-label", ".ma-dance-card dt"]) {
    assert.match(rules(sheet, selector).join(";"), /color:\s*var\(--ma-oxblood\)/, selector);
  }
  assert.ok(contrast(c.ink, c.pearl) >= 4.5 && contrast(c.oxblood, c.pearl) >= 4.5, "ink and oxblood are AA on mutiara");
  assert.match(rules(sheet, ".ma-dance-card dd").join(";"), /overflow-wrap:\s*anywhere/, "a long name wraps");

  for (const name of ["ma-card-in", "ma-write", "ma-tassel"]) {
    const body = sheet.match(new RegExp(`@keyframes ${name}\\s*\\{((?:[^{}]*\\{[^}]*\\})*)\\s*\\}`))?.[1];
    assert.ok(body, `@keyframes ${name}`);
    for (const [, property] of body.matchAll(/([\w-]+)\s*:/g)) {
      assert.match(property, /^(opacity|transform|clip-path|stroke-dashoffset|--[\w-]+)$/, `${name} animates ${property}`);
    }
  }
  assert.match(sheet, /prefers-reduced-motion: reduce\)\s*\{\s*\.ma-theme, \.ma-theme \*[^{]*\{\s*animation: none !important/, "reduced motion shows the card already filled");
});

test("a sent wish rises away with champagne bubbles and the thank-you stays", async () => {
  const { WishBubbles } = createLoader()("components/WishBubbles");
  const rise = new JSDOM(renderToStaticMarkup(React.createElement(WishBubbles, { message: "Bahagia selalu" }))).window.document.querySelector("[data-ma-bubbles]");
  assert.equal(rise.getAttribute("aria-hidden"), "true");
  assert.equal(rise.querySelector(".ma-wish-ghost").textContent, "Bahagia selalu");
  assert.ok(rise.querySelectorAll(".ma-bubble").length >= 6);
  assert.ok(rise.querySelectorAll("*").length <= 20, `${rise.querySelectorAll("*").length} nodes`);
  const long = new JSDOM(renderToStaticMarkup(React.createElement(WishBubbles, { message: "doa ".repeat(100) }))).window.document;
  assert.ok(long.querySelector(".ma-wish-ghost").textContent.length <= 140);
  const still = createLoader({ reducedMotion: true })("components/WishBubbles").WishBubbles;
  assert.equal(renderToStaticMarkup(React.createElement(still, { message: "Bahagia selalu" })), "");

  const { WishesSection } = createLoader({ actions: { submitWish: async () => ({ status: "success" }) } })("sections/WishesSection");
  const view = await mount(React.createElement(WishesSection, { invitationId: "midnight", slug: "midnight", guestToken: "t", guestName: "Bude Sri", wishes: [] }));
  try {
    const form = view.document.querySelector("#ma-ucapan form");
    form.elements.namedItem("message").value = "Bahagia selalu";
    await act(async () => form.dispatchEvent(new view.window.Event("submit", { bubbles: true, cancelable: true })));
    const section = view.document.getElementById("ma-ucapan");
    assert.match(section.querySelector('[role="status"]').textContent, /Terima kasih atas ucapan dan doanya/);
    assert.equal(section.querySelector("[data-ma-bubbles] .ma-wish-ghost").textContent, "Bahagia selalu");
  } finally { await view.cleanup(); }

  const reduced = createLoader({ reducedMotion: true, actions: { submitWish: async () => ({ status: "success" }) } })("sections/WishesSection").WishesSection;
  const calm = await mount(React.createElement(reduced, { invitationId: "midnight", slug: "midnight", guestToken: "t", guestName: "Bude Sri", wishes: [] }));
  try {
    const form = calm.document.querySelector("#ma-ucapan form");
    form.elements.namedItem("message").value = "Bahagia selalu";
    await act(async () => form.dispatchEvent(new calm.window.Event("submit", { bubbles: true, cancelable: true })));
    assert.match(calm.document.querySelector('#ma-ucapan [role="status"]').textContent, /Terima kasih/);
    assert.equal(calm.document.querySelector("[data-ma-bubbles]"), null, "no bubbles under reduced motion");
  } finally { await calm.cleanup(); }
});

test("wish bubbles are decorative, leave once risen, never replay, add no wish client-side and animate only compositor properties", async () => {
  const { WishesSection } = createLoader({ actions: { submitWish: async () => ({ status: "success" }) } })("sections/WishesSection");
  const props = { invitationId: "midnight", slug: "midnight", guestToken: "t", guestName: "Bude Sri", wishes: [] };
  // No bubbles in the server markup or before a submit.
  assert.doesNotMatch(renderToString(React.createElement(WishesSection, props)), /data-ma-bubbles/);
  let setWishes;
  function Host() {
    const [wishes, update] = React.useState([]);
    setWishes = update;
    return React.createElement(WishesSection, { ...props, wishes });
  }
  const view = await mount(React.createElement(Host));
  try {
    assert.equal(view.document.querySelector("[data-ma-bubbles]"), null);
    const form = view.document.querySelector("#ma-ucapan form");
    form.elements.namedItem("message").value = "Semoga sakinah";
    await act(async () => form.dispatchEvent(new view.window.Event("submit", { bubbles: true, cancelable: true })));
    const rise = view.document.querySelector("[data-ma-bubbles]");
    assert.ok(rise);
    assert.ok(rise.querySelectorAll("*").length <= 12, `${rise.querySelectorAll("*").length} nodes`);
    assert.equal(view.document.querySelector(".ma-wishes-list"), null, "the sent wish is not inserted client-side");
    assert.ok(view.document.querySelector(".ma-wishes-empty"));

    const end = (target, animationName) => {
      const event = new view.window.Event("animationend", { bubbles: true });
      Object.defineProperty(event, "animationName", { value: animationName });
      target.dispatchEvent(event);
    };
    await act(async () => end(rise.querySelector(".ma-bubble"), "ma-bubble-rise"));
    assert.ok(view.document.querySelector("[data-ma-bubbles]"), "a bubble ending early does not remove the rise");
    await act(async () => end(rise.querySelector(".ma-wish-ghost"), "ma-ghost-rise"));
    assert.equal(view.document.querySelector("[data-ma-bubbles]"), null, "removed once the wish has risen away");
    assert.match(view.document.querySelector('#ma-ucapan [role="status"]').textContent, /Terima kasih atas ucapan dan doanya/);

    // The server refresh brings the wish in; the bubbles do not replay.
    const wish = { id: "w1", guestName: "Bude Sri", message: "Semoga sakinah", createdAt: "2030-01-02T00:00:00Z" };
    await act(async () => setWishes([wish]));
    assert.equal(view.document.querySelector(".ma-wish-entry p").textContent, "Semoga sakinah");
    assert.equal(view.document.querySelector("[data-ma-bubbles]"), null, "an unrelated re-render does not replay the bubbles");
    assert.ok(view.document.querySelector('#ma-ucapan [role="status"]'));
  } finally { await view.cleanup(); }

  const sheet = css();
  assert.match(rules(sheet, ".ma-wish-rise").join(";"), /pointer-events:\s*none/);
  assert.match(rules(sheet, ".ma-wish-rise").join(";"), /left:\s*0/);
  // A long wish stays one ellipsised line inside its own clipped band above
  // the thank-you, so it never drifts over the section heading.
  assert.match(rules(sheet, ".ma-wish-ghost").join(";"), /white-space:\s*nowrap;\s*overflow:\s*hidden;\s*text-overflow:\s*ellipsis/);
  assert.match(rules(sheet, ".ma-wish-rise").join(";"), /top:\s*0;[^}]*height:\s*5rem;\s*overflow:\s*hidden/);
  assert.match(rules(sheet, ".ma-wish-sent").join(";"), /padding-top:\s*5rem/);
  for (const name of ["ma-ghost-rise", "ma-bubble-rise"]) {
    const body = sheet.match(new RegExp(`@keyframes ${name}\\s*\\{((?:[^{}]*\\{[^}]*\\})*)\\s*\\}`))?.[1];
    assert.ok(body, `@keyframes ${name}`);
    for (const [, property] of body.matchAll(/([\w-]+)\s*:/g)) {
      assert.match(property, /^(opacity|transform|--[\w-]+)$/, `${name} animates ${property}`);
    }
  }
  const source = readFileSync(resolve(midnightRoot, "components/WishBubbles.tsx"), "utf8");
  assert.doesNotMatch(source, /<img|querySelector|Math\.random\(/);
});

test("framed photos on the dark wall are lit one by one by picture lights, lightbox intact", async () => {
  const { GallerySection } = createLoader()("sections/GallerySection");
  const props = { gallery: invitation().gallery, displayName: "Nadia & Arka" };

  const plain = await mount(React.createElement(GallerySection, props));
  try {
    assert.equal(plain.document.querySelector(".ma-gallery-grid").hasAttribute("data-lights"), false, "no observer: photos simply show");
  } finally { await plain.cleanup(); }

  FakeIntersectionObserver.instances = [];
  const view = await mount(React.createElement(GallerySection, props), { intersectionObserver: FakeIntersectionObserver });
  try {
    const grid = view.document.querySelector(".ma-gallery-grid");
    assert.equal(grid.hasAttribute("data-lights"), false, "nothing dims before the observer reports");
    await act(async () => FakeIntersectionObserver.instances.forEach((observer) => observer.trigger(false)));
    assert.equal(grid.dataset.lights, "waiting");
    const delays = [...grid.querySelectorAll(".ma-gallery-item")].map((item) => item.style.getPropertyValue("--ma-light-delay"));
    assert.deepEqual(delays, ["0.00s", "0.18s", "0.36s"], "lit one by one, in order");
    await act(async () => FakeIntersectionObserver.instances.forEach((observer) => observer.trigger(true)));
    assert.equal(grid.dataset.lights, "lit");
    assert.ok(grid.querySelector("button[aria-label^='Perbesar foto 1 dari 3']"), "lightbox trigger intact");
  } finally { await view.cleanup(); }

  const sheet = css();
  assert.match(sheet, /\.ma-gallery-item::after\s*\{[^}]*radial-gradient\([^)]*var\(--ma-light-strong\)/);
  assert.match(sheet, /\.ma-gallery-item::before\s*\{[^}]*background:\s*var\(--ma-champagne\)/, "a brass picture lamp above each frame");
  assert.match(rules(sheet, '.ma-gallery-grid[data-lights="waiting"] .ma-gallery-zoom').join(";"), /opacity:/);
  assert.match(sheet, /prefers-reduced-motion: reduce\)[\s\S]*\.ma-gallery-grid\[data-lights\] \.ma-gallery-zoom[^{]*\{\s*opacity:\s*1 !important/);
});

test("a gallery already on screen is simply lit, markup agrees on server and client, and only opacity animates", async () => {
  const { GallerySection } = createLoader()("sections/GallerySection");
  const gallery = Array.from({ length: 12 }, (_, index) => ({
    id: `p${index}`, imageUrl: `/p${index}.jpg`, caption: index === 0 ? "Malam pertama" : null, altText: null,
    aspectRatio: index % 2 ? "landscape_16_9" : "portrait_4_5", sortOrder: index,
  }));
  const props = { gallery, displayName: "Nadia & Arka" };

  const markup = (reducedMotion) => renderToStaticMarkup(React.createElement(createLoader({ reducedMotion })("sections/GallerySection").GallerySection, props));
  assert.equal(markup(true), markup(false), "no reduced-motion branching in the markup");
  assert.doesNotMatch(markup(false), /data-lights/, "server markup never dims a frame");

  FakeIntersectionObserver.instances = [];
  const onScreen = await mount(React.createElement(GallerySection, props), { intersectionObserver: FakeIntersectionObserver });
  try {
    const grid = onScreen.document.querySelector(".ma-gallery-grid");
    await act(async () => FakeIntersectionObserver.instances.forEach((observer) => observer.trigger(true)));
    assert.equal(grid.hasAttribute("data-lights"), false, "already on screen: no dark-then-lit flash");
    const items = [...grid.querySelectorAll(".ma-gallery-item")];
    assert.equal(items.length, 12, "every photo keeps its frame");
    assert.equal(grid.querySelectorAll("button.ma-gallery-zoom").length, 12, "every photo still opens the lightbox");
    assert.equal(items.at(-1).style.getPropertyValue("--ma-light-delay"), "1.44s", "the lamp delay is capped at eight steps");
  } finally { await onScreen.cleanup(); }

  const sheet = css();
  for (const [selector, bodies] of ruleMap(sheet)) {
    if (!selector.includes(".ma-gallery")) continue;
    for (const body of bodies) {
      const transition = body.match(/transition:\s*([^;]+)/)?.[1];
      if (transition) for (const part of transition.split(/,(?![^(]*\))/)) assert.match(part.trim(), /^(opacity|transform|--[\w-]+|none)\b/, `${selector}: ${part}`);
      assert.doesNotMatch(body, /animation:/, `${selector} adds no keyframe animation`);
    }
  }
});

const ENGLISH_LABELS = [
  "Private celebration", "The wedding of", "Evening invitation", "The protagonists", "Your hosts",
  "Evening programme", "The night awaits", "Save the evening", "Wardrobe note", "Dress code",
  "acts in chronology", "contact sheet", "Remote viewing", "Private confirmation", "Dance card",
  "Guest book", "Gift registry", "Google Calendar", "Open",
];

/** Every guest-facing string (not CSS): visible text plus aria-labels, placeholders and alt text. */
function guestCopy(document) {
  const attributes = [...document.querySelectorAll("[aria-label], [placeholder], [alt], [title]")]
    .flatMap((element) => ["aria-label", "placeholder", "alt", "title"].map((name) => element.getAttribute(name) ?? ""));
  const body = document.body.cloneNode(true);
  for (const code of body.querySelectorAll("style, script")) code.remove();
  return [body.textContent, ...attributes].join("\n");
}

function assertIndonesian(copy, expected) {
  for (const english of ENGLISH_LABELS) {
    assert.ok(!copy.includes(english), `English label left: ${english}`);
  }
  for (const label of expected) assert.ok(copy.includes(label), `missing Indonesian label: ${label}`);
}

test("every guest-facing label speaks Bahasa Indonesia, the dance card included", async () => {
  const full = invitation({
    theme: { slug: "midnight-atelier", settings: { dressCode: { description: "Hitam dan merah anggur.", groups: [{ label: "Tamu", colors: ["#14121A"] }] } } },
    events: [{ ...invitation().events[0], mapsUrl: "https://maps.example.test/a", livestreamUrl: "https://live.example.test/a" }],
    gifts: [{ id: "gift", providerType: "bank", providerName: "Bank", accountNumber: "123", accountName: "Nadia", logoUrl: null, sortOrder: 0 }],
    wishes: [{ id: "w", guestName: "Bude Sri", message: "Bahagia selalu", createdAt: "2030-01-02T00:00:00Z" }],
    content: { openingQuote: "Kutipan.", openingMessage: "Pembuka.", closingMessage: "Penutup." },
    features: { music: true, countdown: true, maps: true, story: true, gallery: true, dressCode: true,
      livestream: true, rsvp: true, wishes: true, gift: true, guestPersonalization: true },
    media: { coverImageUrl: null, musicUrl: "/music.mp3" },
  });
  const load = createLoader({ actions: { submitRsvp: async () => ({ status: "success" }) } });
  const view = await mount(React.createElement(load("index").MidnightAtelier, { invitation: full, guest: null }), { intersectionObserver: FakeIntersectionObserver });
  try {
    await act(async () => view.document.querySelector(".ma-cover-open").click());
    const form = view.document.querySelector("#ma-rsvp form");
    form.elements.namedItem("guestName").value = "Pak Joko";
    const attend = [...form.querySelectorAll('button[type="button"]')].find((button) => button.textContent.trim() === "Hadir");
    await act(async () => attend.click());
    await act(async () => form.dispatchEvent(new view.window.Event("submit", { bubbles: true, cancelable: true })));
    assert.ok(view.document.querySelector("[data-ma-dance-card]"), "the dance card is on the page");
    assertIndonesian(guestCopy(view.document), [
      "Perayaan terbatas", "Pernikahan", "Dua insan", "Agenda malam", "Malam yang dinanti", "Untuk malam itu",
      "Saran busana", "01 babak perjalanan", "03 potret kenangan", "Siaran langsung", "Konfirmasi kehadiran",
      "Kartu dansa", "Buku tamu", "Amplop digital", "Google Kalender",
    ]);
    assert.ok(guestCopy(view.document).includes("Midnight Atelier"), "the theme name stays as the masthead brand mark");
  } finally { await view.cleanup(); }

  const { MidnightAtelier } = createLoader()("index");
  const evening = invitation({ type: "birthday", features: { ...invitation().features, countdown: false } });
  const { document } = new JSDOM(renderToStaticMarkup(React.createElement(MidnightAtelier, { invitation: evening, guest: null }))).window;
  assertIndonesian(guestCopy(document), ["Undangan malam", "Perayaan", "Tuan rumah", "Tandai kalender Anda", "Simpan tanggalnya"]);
});

test("the dance card follows the attendance that was submitted, not a choice changed while sending", async () => {
  async function race(submitted, changedTo) {
    let resolve;
    const { RsvpSection } = createLoader({ actions: { submitRsvp: () => new Promise((done) => { resolve = done; }) } })("sections/RsvpSection");
    const view = await mount(React.createElement(RsvpSection, { invitationId: "midnight", slug: "midnight", guestToken: "t", guestName: "Bude Sri" }));
    const form = view.document.querySelector("#ma-rsvp form");
    const pick = (label) => [...form.querySelectorAll('button[type="button"]')].find((candidate) => candidate.textContent.trim() === label);
    await act(async () => pick(submitted).click());
    await act(async () => { form.dispatchEvent(new view.window.Event("submit", { bubbles: true, cancelable: true })); });
    await act(async () => pick(changedTo).click());
    await act(async () => { resolve({ status: "success" }); });
    return view;
  }

  const accepted = await race("Hadir", "Tidak Hadir");
  try {
    assert.ok(accepted.document.querySelector("[data-ma-dance-card]"), "a stored acceptance keeps its card");
  } finally { await accepted.cleanup(); }

  const declined = await race("Tidak Hadir", "Hadir");
  try {
    assert.equal(declined.document.querySelector("[data-ma-dance-card]"), null, "a stored decline never shows a card");
  } finally { await declined.cleanup(); }
});
