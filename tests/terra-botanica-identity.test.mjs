import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import vm from "node:vm";
import React, { act } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
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

/** Records observed elements; `trigger(isIntersecting)` reports them all (intersecting by default). */
class FakeIntersectionObserver {
  static instances = [];
  constructor(callback) { this.callback = callback; this.elements = []; FakeIntersectionObserver.instances.push(this); }
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

test("the cover carries a seed that blooms when the invitation opens", () => {
  const { TerraBotanica } = createLoader()("index");
  const html = renderToStaticMarkup(React.createElement(TerraBotanica, { invitation: invitation(), guest: null }));
  const { document } = new JSDOM(html).window;
  const bloom = document.querySelector("#tb-cover svg.tb-bloom");
  assert.ok(bloom, "bloom sits on the cover");
  assert.equal(bloom.getAttribute("aria-hidden"), "true");
  assert.ok(bloom.querySelector(".tb-bloom-seed"));
  assert.equal(bloom.querySelector(".tb-bloom-stem").getAttribute("pathLength"), "1");
  assert.equal(bloom.querySelectorAll(".tb-bloom-leaf").length, 2);
  assert.equal(bloom.querySelectorAll(".tb-bloom-petal").length, 3);
  assert.ok(bloom.querySelector(".tb-bloom-core"));
  assert.equal(document.querySelector("#tb-cover button").textContent.trim(), "Buka Undangan");
  assert.match(document.querySelector("#tb-cover").textContent, /Rosa amoris/, "specimen accent");

  const css = styles();
  assert.match(css, /\[data-opened="true"\] \.tb-bloom-stem\s*\{[^}]*animation:/);
  assert.match(css, /\[data-opened="true"\] \.tb-cover\s*\{[^}]*transition:[^}]*1100ms/, "cover waits for the bloom before fading");
});

test("a vine along the page edge grows with scroll progress", async () => {
  const { GrowingVine } = createLoader()("components/GrowingVine");
  const view = await mount(React.createElement(GrowingVine));
  try {
    const vine = view.document.querySelector(".tb-vine");
    assert.equal(vine.getAttribute("aria-hidden"), "true");
    assert.equal(vine.querySelector(".tb-vine-stem").getAttribute("pathLength"), "1");
    const leaves = vine.querySelectorAll(".tb-vine-leaf");
    assert.ok(leaves.length >= 6);
    for (const leaf of leaves) assert.match(leaf.getAttribute("style"), /--tb-at:\s*0\.\d+/);
    assert.equal(vine.style.getPropertyValue("--tb-progress"), "1.0000", "jsdom cannot scroll, so the vine is complete");
  } finally {
    await view.cleanup();
  }

  const { TerraBotanica } = createLoader()("index");
  const { document } = new JSDOM(renderToStaticMarkup(React.createElement(TerraBotanica, { invitation: invitation(), guest: null }))).window;
  assert.ok(document.querySelector("#tb-content .tb-vine"), "the vine lives inside the invitation content, not on the cover");

  const css = styles();
  assert.match(css, /\.tb-vine-stem\s*\{[^}]*stroke-dashoffset:\s*calc\(1 - var\(--tb-progress\)\)/);
  assert.match(css, /prefers-reduced-motion: reduce\)[\s\S]*\.tb-vine\s*\{\s*--tb-progress:\s*1 !important/);
});

test("specimen labels type out once in view and keep their full text for readers", async () => {
  const { EventsSection } = createLoader()("sections/EventsSection");
  const event = invitation().events[0];
  const props = { events: [event], mapsEnabled: false, timeZone: "Asia/Jakarta" };

  const idle = await mount(React.createElement(EventsSection, props));
  try {
    const labels = idle.document.querySelectorAll(".tb-typed");
    assert.equal(labels.length, 2, "date and time are typed labels");
    for (const label of labels) assert.equal(label.dataset.typed, "idle", "no observer: stays fully visible");
    assert.match(idle.document.querySelector(".tb-event-time").textContent, /10:00\s*–\s*12:00 WIB/);
  } finally { await idle.cleanup(); }

  FakeIntersectionObserver.instances = [];
  const watched = await mount(React.createElement(EventsSection, props), { intersectionObserver: FakeIntersectionObserver });
  try {
    const time = watched.document.querySelector(".tb-event-time .tb-typed");
    assert.equal(time.dataset.typed, "idle", "visible until the observer reports the label off-screen");
    await act(async () => FakeIntersectionObserver.instances.forEach((observer) => observer.trigger(false)));
    assert.equal(time.dataset.typed, "waiting");
    assert.equal(time.style.getPropertyValue("--tb-chars"), String(time.textContent.length));
    await act(async () => FakeIntersectionObserver.instances.forEach((observer) => observer.trigger()));
    assert.equal(time.dataset.typed, "typed");
  } finally { await watched.cleanup(); }

  // Already on screen when the observer first reports (restored scroll, deep
  // link): the label is never clipped, so nothing flashes.
  FakeIntersectionObserver.instances = [];
  const onScreen = await mount(React.createElement(EventsSection, props), { intersectionObserver: FakeIntersectionObserver });
  try {
    const time = onScreen.document.querySelector(".tb-event-time .tb-typed");
    await act(async () => FakeIntersectionObserver.instances.forEach((observer) => observer.trigger()));
    assert.equal(time.dataset.typed, "idle");
  } finally { await onScreen.cleanup(); }

  const { StorySection } = createLoader()("sections/StorySection");
  const story = new JSDOM(renderToStaticMarkup(React.createElement(StorySection, { stories: invitation().stories }))).window.document;
  assert.equal(story.querySelector(".tb-story-date .tb-typed").textContent, "2021");

  const css = styles();
  assert.match(css, /\.tb-typed\[data-typed="typed"\]\s*\{[^}]*steps\(var\(--tb-chars\)/);
  assert.match(css, /prefers-reduced-motion: reduce\)[\s\S]*\.tb-typed\[data-typed\]\s*\{\s*clip-path:\s*none !important/);
});

test("typed labels reveal on any overlap so a label at the page end never stays clipped", () => {
  const source = readFileSync(resolve(terraRoot, "components/TypedText.tsx"), "utf8");
  assert.match(source, /useInViewOnce\(ref, "0px"\)/);
});

test("a sent wish releases dandelion seeds and keeps the thank-you visible", async () => {
  const { DandelionRelease } = createLoader()("components/DandelionRelease");
  const head = new JSDOM(renderToStaticMarkup(React.createElement(DandelionRelease))).window.document.querySelector("[data-tb-dandelion]");
  assert.equal(head.getAttribute("aria-hidden"), "true");
  assert.equal(head.querySelectorAll(".tb-dandelion-seed").length, 18);
  assert.equal(head.querySelectorAll(".tb-dandelion-stalk").length, 1);
  assert.ok(head.querySelectorAll("*").length <= 20, "particle effects stay within 20 nodes");
  const still = createLoader({ reducedMotion: true })("components/DandelionRelease").DandelionRelease;
  assert.equal(renderToStaticMarkup(React.createElement(still)), "");

  const { WishesSection } = createLoader({ actions: { submitWish: async () => ({ status: "success" }) } })("sections/WishesSection");
  const view = await mount(React.createElement(WishesSection, { invitationId: "terra", slug: "terra", guestToken: "t", guestName: "Bude Sri", wishes: [] }));
  try {
    const form = view.document.querySelector("#tb-ucapan form");
    form.elements.namedItem("message").value = "Bahagia selalu";
    await act(async () => form.dispatchEvent(new view.window.Event("submit", { bubbles: true, cancelable: true })));
    const section = view.document.getElementById("tb-ucapan");
    assert.match(section.querySelector('[role="status"]').textContent, /Terima kasih atas ucapan dan doanya/);
    assert.ok(section.querySelector("[data-tb-dandelion]"));
  } finally { await view.cleanup(); }

  const css = styles();
  assert.match(css, /\.tb-dandelion\s*\{[^}]*pointer-events:\s*none/);
  const drift = css.match(/@keyframes tb-seed-drift\s*\{([\s\S]*?\})\s*\}/);
  assert.ok(drift, "seed drift keyframes exist");
  for (const [, property] of drift[1].matchAll(/([a-z-]+)\s*:/g)) assert.ok(["transform", "opacity"].includes(property), `seed drift animates ${property}`);
  assert.match(css, /prefers-reduced-motion: reduce\)[\s\S]*\.tb-dandelion\s*\{\s*display:\s*none/);
});

test("gallery photos drop in and settle, taped and tilted, without losing the lightbox", async () => {
  const { GallerySection } = createLoader()("sections/GallerySection");
  const props = { gallery: invitation().gallery, displayName: "Alya & Bima" };

  const plain = await mount(React.createElement(GallerySection, props));
  try {
    assert.equal(plain.document.querySelector(".tb-gallery-grid").hasAttribute("data-settle"), false, "no observer: photos simply show");
  } finally { await plain.cleanup(); }

  FakeIntersectionObserver.instances = [];
  const view = await mount(React.createElement(GallerySection, props), { intersectionObserver: FakeIntersectionObserver });
  try {
    const grid = view.document.querySelector(".tb-gallery-grid");
    assert.equal(grid.hasAttribute("data-settle"), false, "visible until the observer reports the grid off-screen");
    await act(async () => FakeIntersectionObserver.instances.forEach((observer) => observer.trigger(false)));
    assert.equal(grid.dataset.settle, "waiting");
    const items = [...grid.querySelectorAll(".tb-gallery-item")];
    assert.equal(items.length, 3);
    for (const item of items) {
      assert.match(item.style.getPropertyValue("--tb-tilt"), /^-?\d+(\.\d+)?deg$/);
      assert.match(item.style.getPropertyValue("--tb-drop-delay"), /^\d+(\.\d+)?s$/);
    }
    await act(async () => FakeIntersectionObserver.instances.forEach((observer) => observer.trigger()));
    assert.equal(grid.dataset.settle, "settled");
    assert.ok(grid.querySelector("button[aria-label^='Perbesar foto 1 dari 3']"), "lightbox trigger intact");
  } finally { await view.cleanup(); }

  FakeIntersectionObserver.instances = [];
  const onScreen = await mount(React.createElement(GallerySection, props), { intersectionObserver: FakeIntersectionObserver });
  try {
    await act(async () => FakeIntersectionObserver.instances.forEach((observer) => observer.trigger()));
    assert.equal(onScreen.document.querySelector(".tb-gallery-grid").hasAttribute("data-settle"), false, "already on screen: no drop-in");
  } finally { await onScreen.cleanup(); }

  const css = styles();
  assert.match(css, /\.tb-gallery-item::before\s*\{[^}]*rgba\(217, 164, 65/, "paper tape");
  assert.match(css, /\[data-settle="waiting"\] \.tb-gallery-item\s*\{[^}]*opacity:\s*0/);
  // Reduced motion: a waiting print is shown settled rather than held invisible.
  assert.match(css, /prefers-reduced-motion: reduce\)[\s\S]*\.tb-gallery-grid\[data-settle\] \.tb-gallery-item\s*\{\s*opacity:\s*1 !important;\s*transform:\s*rotate\(var\(--tb-tilt, 0deg\)\) !important/);
});

test("every action and form label wears the Courier specimen voice", () => {
  const rule = styles().match(/\.tb-theme :is\(([^{]*)\)\s*\{\s*font-family:\s*var\(--tb-label\)/);
  assert.ok(rule, "Courier label rule exists");
  for (const selector of [".tb-text-action", ".tb-calendar-actions :is(a, button)", ".tb-gift-account > button", ".tb-attendance legend", ".tb-attendance-choices button"]) {
    assert.ok(rule[1].includes(selector), `${selector} uses Courier`);
  }
});

test("a text-only couple keeps full-width names instead of a shrunken far-edge column", () => {
  const css = styles();
  assert.match(css, /\.tb-person-copy > :not\(h3\) \{ max-width: 42ch; \}/, "measure limits copy, not the name");
  assert.doesNotMatch(css, /\.tb-person-copy \{[^}]*max-width/);
  assert.match(css, /\.tb-person-text-only \{ display: block; width: min\(100%, 44rem\); \}/);
  assert.doesNotMatch(css, /\.tb-person-text-only:nth-child\(even\) \{ margin-left: auto; \}/);
});

function navInvitation() {
  const gifts = [{ id: "gift", providerType: "bank", providerName: "Bank", accountNumber: "123", accountName: "Alya", logoUrl: null, sortOrder: 0 }];
  const base = invitation({ gifts });
  return { ...base, features: { ...base.features, rsvp: true, wishes: true, gift: true } };
}

test("floating nav pairs every visible Courier label with one hidden botanical glyph", () => {
  const load = createLoader();
  const { buildTerraNavItems } = load("TerraBotanica");
  const { FloatingNav } = load("components/FloatingNav");
  const items = buildTerraNavItems(navInvitation());
  assert.deepEqual(Array.from(items, (item) => item.section), ["hero", "events", "rsvp", "wishes", "gift"]);
  const { document } = new JSDOM(renderToStaticMarkup(React.createElement(FloatingNav, { items }))).window;
  const links = [...document.querySelectorAll(".tb-nav a")];
  assert.equal(links.length, items.length);
  const glyphs = new Set();
  for (const [index, link] of links.entries()) {
    const icons = link.querySelectorAll("svg");
    assert.equal(icons.length, 1, `${items[index].label} has one icon`);
    const [icon] = icons;
    assert.equal(icon.getAttribute("aria-hidden"), "true");
    assert.equal(icon.getAttribute("focusable"), "false");
    assert.equal(icon.getAttribute("stroke"), "currentColor");
    assert.equal(icon.getAttribute("viewBox"), "0 0 24 24");
    assert.ok(icon.querySelector("path, circle"), "glyph has drawn line work");
    assert.equal(link.textContent.trim(), items[index].label, "accessible name stays the visible label");
    assert.equal(link.hasAttribute("aria-label"), false);
    assert.equal(link.querySelector(".tb-nav-label").textContent, items[index].label);
    assert.ok(icon.compareDocumentPosition(link.querySelector(".tb-nav-label")) & 4, "icon sits before (above) the label");
    glyphs.add(icon.innerHTML);
  }
  assert.equal(glyphs.size, items.length, "each section has its own glyph");
  const active = document.querySelector('.tb-nav a[aria-current="location"]');
  assert.ok(active?.querySelector("svg"), "the active item keeps its icon");
});

test("every section the nav can emit has a Herbarium glyph", () => {
  const source = readFileSync(resolve(terraRoot, "TerraBotanica.tsx"), "utf8");
  const builder = source.match(/export function buildTerraNavItems[\s\S]*?\n}\n/)[0];
  const sections = [...builder.matchAll(/section: "([a-zA-Z]+)"/g)].map(([, key]) => key);
  assert.ok(sections.length >= 8);
  const { NavIcon } = createLoader()("components/NavIcon");
  for (const section of sections) {
    const svg = new JSDOM(renderToStaticMarkup(React.createElement(NavIcon, { section }))).window.document.querySelector("svg");
    assert.ok(svg?.querySelector("path, circle"), `${section} has an icon`);
    assert.equal(svg.getAttribute("stroke-width"), "1.4");
  }
  const icon = readFileSync(resolve(terraRoot, "components/NavIcon.tsx"), "utf8");
  for (const forbidden of [/<img/, /querySelector/, /motion\//]) assert.doesNotMatch(icon, forbidden);
});

/** The CSS rules for `selector` outside any @media block (the mobile-first base). */
function baseRule(css, selector) {
  const base = css.slice(0, css.indexOf("@media"));
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = base.match(new RegExp(`\\.tb-theme ${escaped} \\{([^}]*)\\}`));
  assert.ok(match, `missing base rule for ${selector}`);
  return match[1];
}

test("the bottom nav keeps at most five items, guest actions first, in page order", () => {
  const source = readFileSync(resolve(terraRoot, "TerraBotanica.tsx"), "utf8");
  assert.match(source, /import \{ pickNavItems \} from "@\/themes\/shared\/nav-priority";/);
  assert.match(source, /return pickNavItems\(/);
  assert.match(readFileSync(resolve(terraRoot, "components/FloatingNav.tsx"), "utf8"), /section: NavSectionKey;/);
  const { buildTerraNavItems } = createLoader()("TerraBotanica");
  const full = buildTerraNavItems(navInvitation());
  assert.equal(full.length, 5);
  assert.deepEqual(Array.from(full, (item) => item.label), ["Beranda", "Acara", "RSVP", "Ucapan", "Kado"]);
  const noGift = navInvitation();
  noGift.features = { ...noGift.features, gift: false };
  assert.deepEqual(Array.from(buildTerraNavItems(noGift), (item) => item.section), ["hero", "couple", "events", "rsvp", "wishes"]);
});

test("below 768px the nav spans the screen in equal, unscrolled items with readable labels", () => {
  const css = styles();
  const nav = baseRule(css, ".tb-nav");
  assert.match(nav, /left: max\(12px, env\(safe-area-inset-left\)\); right: max\(12px, env\(safe-area-inset-right\)\);/);
  assert.match(nav, /bottom: max\(12px, env\(safe-area-inset-bottom\)\);/);
  assert.doesNotMatch(nav, /fit-content/, "full-width bar on phones");
  assert.match(nav, /background: var\(--tb-bone\);/, "bone bar");
  assert.match(nav, /border: 1px solid var\(--tb-moss\);/, "moss hairline");
  const list = baseRule(css, ".tb-nav ul");
  assert.match(list, /display: flex;/);
  assert.doesNotMatch(css, /\.tb-nav ul \{[^}]*overflow-x/, "the bar never scrolls sideways");
  assert.match(baseRule(css, ".tb-nav li"), /flex: 1 1 0; min-width: 0;/, "items share the width equally");
  const link = baseRule(css, ".tb-nav a");
  assert.match(link, /flex-direction: column;/);
  const minHeight = Number(link.match(/min-height: (\d+)px/)[1]);
  assert.ok(minHeight >= 52, `item height ${minHeight}px`);
  assert.match(link, /font-size: clamp\(11px, 3vw, 12px\)/, "label never below 11px");
  assert.match(baseRule(css, ".tb-nav-icon"), /width: clamp\(18px, 5\.2vw, 22px\); height: clamp\(18px, 5\.2vw, 22px\);/);
  assert.match(baseRule(css, ".tb-nav-label"), /white-space: nowrap; overflow: hidden; text-overflow: ellipsis;/);
  assert.doesNotMatch(css, /\.tb-nav-icon \{[^}]*(opacity|color):/, "icon inherits the item's text color");
  assert.match(css, /\.tb-nav a\[aria-current="location"\] \{[^}]*background: var\(--tb-moss\); color: var\(--tb-bone\)/);
});

test("page content reserves room for the bar so the last fields are never covered", () => {
  const css = styles();
  const space = css.match(/--tb-nav-space: calc\((\d+)px \+ max\(12px, env\(safe-area-inset-bottom\)\)\);/);
  assert.ok(space, "bar height plus its offset is one token");
  assert.ok(Number(space[1]) >= 52 + 2, "token covers the item height and the border");
  assert.match(baseRule(css, ".tb-content"), /padding-bottom: calc\(var\(--tb-nav-space\) \+ [^)]+\);/);
  assert.match(css, /:is\(input, textarea, button, select\) \{ scroll-margin-bottom: calc\(var\(--tb-nav-space\)/);
  assert.match(baseRule(css, ".tb-music"), /bottom: calc\(var\(--tb-nav-space\) \+ [^)]+\);/, "music control floats above the bar");
});

test("floating nav server markup matches the first client render", async () => {
  const load = createLoader();
  const { buildTerraNavItems } = load("TerraBotanica");
  const { FloatingNav } = load("components/FloatingNav");
  const element = React.createElement(FloatingNav, { items: buildTerraNavItems(navInvitation()) });
  const view = await mount(React.createElement("div"));
  const errors = [];
  const originalError = console.error;
  console.error = (...args) => errors.push(args.map(String).join(" "));
  let root;
  try {
    const container = view.document.createElement("div");
    view.document.body.append(container);
    container.innerHTML = renderToStaticMarkup(element);
    await act(async () => { root = hydrateRoot(container, element); });
    assert.deepEqual(errors, []);
    assert.equal(container.querySelectorAll(".tb-nav svg").length, 5);
  } finally {
    console.error = originalError;
    if (root) await act(async () => root.unmount());
    await view.cleanup();
  }
});

test("the hero photo is a 3:4 portrait placed after the title block", () => {
  const { TerraBotanica } = createLoader()("index");
  const withPhoto = invitation({
    media: { coverImageUrl: "/hero.jpg", musicUrl: null },
    content: { openingQuote: null, openingMessage: "Dengan memohon rahmat-Nya.", closingMessage: null },
  });
  const { document } = new JSDOM(renderToStaticMarkup(React.createElement(TerraBotanica, { invitation: withPhoto, guest: null }))).window;
  const hero = document.getElementById("tb-beranda");
  const frame = hero.querySelector(".tb-hero-image");
  assert.equal(frame.style.aspectRatio, "3 / 4");
  const heading = document.getElementById("tb-hero-heading");
  const copy = heading.closest(".tb-hero-copy");
  assert.ok(copy.querySelector("p"), "opening message stays in the title block");
  assert.ok(heading.compareDocumentPosition(frame.querySelector("img")) & 4, "names come before the photo in reading order");
  assert.ok(copy.compareDocumentPosition(frame) & 4, "the whole title block precedes the photo");

  const textOnly = new JSDOM(renderToStaticMarkup(React.createElement(TerraBotanica, { invitation: invitation(), guest: null }))).window.document.getElementById("tb-beranda");
  assert.ok(textOnly.classList.contains("tb-hero-text-only"));
  assert.equal(textOnly.querySelector(".tb-media"), null, "no placeholder frame without a photo");
  assert.ok(textOnly.querySelector(".tb-hero-botanical").compareDocumentPosition(textOnly.querySelector(".tb-hero-copy")) & 4);

  const source = readFileSync(resolve(terraRoot, "sections/HeroSection.tsx"), "utf8");
  assert.match(source, /sizes="\(min-width: 1360px\) 492px, \(min-width: 768px\) 40vw, 88vw"/, "sizes match the 5/12 desktop column");
  const css = styles();
  const desktop = css.slice(css.indexOf("@media (min-width: 768px)"));
  assert.match(desktop, /\.tb-hero:not\(\.tb-hero-text-only\) > \.tb-section-inner \{[^}]*grid-template-columns: minmax\(0, 7fr\) minmax\(0, 5fr\);/, "side by side, photo ~5/12");
});
