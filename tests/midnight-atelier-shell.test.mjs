import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
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

// Bottom-bar stops per package, as the public loader resolves them (lib/packages/nav-sections).
const NAV = {
  intimate: ["hero", "couple", "events", "rsvp", "gift"],
  signature: ["hero", "couple", "events", "gallery", "rsvp", "wishes", "gift"],
  grand: ["hero", "couple", "events", "story", "gallery", "livestream", "rsvp", "wishes", "gift"],
};

const nodeRequire = createRequire(import.meta.url);
const sourceRoot = fileURLToPath(new URL("../src/", import.meta.url));

function loadTheme({ reducedMotion = false, track = async () => {} } = {}) {
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
        if (name === "next/image") {
          return { __esModule: true, default: (imageProps) => {
            const props = { ...imageProps };
            delete props.fill;
            delete props.fetchPriority;
            delete props.unoptimized;
            return React.createElement("img", props);
          } };
        }
        if (name === "motion/react") return { useReducedMotion: () => reducedMotion };
        if (name === "@/app/(public)/[slug]/actions") return {
          trackCoverOpenedAction: track,
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
  return { load: (entry) => load(resolve(sourceRoot, entry)) };
}

const features = {
  music: true, countdown: true, maps: true, story: true, gallery: true,
  dressCode: true, livestream: true, rsvp: true, wishes: true, gift: true,
  guestPersonalization: true,
};

function fixture(overrides = {}) {
  return {
    id: "midnight-shell", type: "wedding", navSections: NAV.signature, slug: "midnight-shell", title: "Nadia & Arka", status: "published",
    eventDate: "2027-02-14", venueSummary: null, publishedAt: "2026-09-30T00:00:00Z", expiresAt: null,
    theme: { slug: "midnight-atelier", settings: {} },
    people: [
      { id: "nadia", role: "bride", fullName: "Nadia", nickname: null, fatherName: null, motherName: null, photoUrl: null, bio: null, sortOrder: 0 },
      { id: "arka", role: "groom", fullName: "Arka", nickname: null, fatherName: null, motherName: null, photoUrl: null, bio: null, sortOrder: 1 },
    ],
    events: [{ id: "event", eventType: "reception", title: "Resepsi", eventDate: "2027-02-14", startTime: "19:00", endTime: "21:00", venueName: "Atelier Hall", address: null, mapsUrl: null, livestreamUrl: null, sortOrder: 0 }],
    stories: [{ id: "story", title: "Pertemuan", storyDate: null, yearLabel: null, description: "Cerita", imageUrl: null, sortOrder: 0 }],
    gallery: [{ id: "photo", imageUrl: "/portrait.jpg", caption: null, altText: "Nadia dan Arka", aspectRatio: "portrait_4_5", sortOrder: 0 }],
    gifts: [{ id: "gift", providerType: "bank", providerName: "Bank", accountNumber: "123", accountName: "Nadia", logoUrl: null, sortOrder: 0 }],
    wishes: [], content: { openingQuote: null, openingMessage: null, closingMessage: null },
    features: { ...features }, media: { coverImageUrl: null, musicUrl: "/music.mp3" },
    ...overrides,
  };
}

const guest = { id: "guest", displayName: "Keluarga Adinata yang Berbahagia", token: "guest-token", notes: null };

function renderShell(invitation = fixture(), recipient = guest) {
  const { MidnightAtelier } = loadTheme().load("themes/midnight-atelier");
  return renderToStaticMarkup(React.createElement(MidnightAtelier, { invitation, guest: recipient }));
}

async function mountShell(options = {}, invitation = fixture(), width = 390) {
  const dom = new JSDOM("<div id='root'></div>", { pretendToBeVisual: true, url: "https://invitation.test/" });
  Object.defineProperty(dom.window, "innerWidth", { configurable: true, value: width });
  const keys = ["window", "document", "HTMLElement", "IntersectionObserver", "requestAnimationFrame", "IS_REACT_ACT_ENVIRONMENT"];
  const previous = Object.fromEntries(keys.map((key) => [key, globalThis[key]]));
  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
    HTMLElement: dom.window.HTMLElement,
    IntersectionObserver: class { observe() {} disconnect() {} },
    requestAnimationFrame: dom.window.requestAnimationFrame.bind(dom.window),
    IS_REACT_ACT_ENVIRONMENT: true,
  });
  const { MidnightAtelier } = loadTheme(options).load("themes/midnight-atelier");
  const root = createRoot(document.getElementById("root"));
  await act(async () => root.render(React.createElement(MidnightAtelier, { invitation, guest })));
  return {
    document: dom.window.document,
    async cleanup() {
      await act(async () => root.unmount());
      Object.assign(globalThis, previous);
      dom.window.close();
    },
  };
}

test("photo-free couture cover renders personalized programme data and the champagne toast", () => {
  const document = new JSDOM(renderShell()).window.document;
  assert.equal(document.querySelector("#ma-cover img"), null);
  assert.equal(document.querySelectorAll("#ma-cover .ma-flute").length, 2);
  assert.ok(document.querySelector("#ma-cover .ma-toast-ring"));
  assert.equal(document.querySelector(".ma-cover-guest-name")?.textContent, guest.displayName);
  assert.match(document.querySelector(".ma-cover-names")?.textContent ?? "", /Nadia.*Arka/s);
  assert.equal(document.querySelector("time")?.getAttribute("datetime"), "2027-02-14");
  assert.equal(document.querySelector(".ma-cover-open")?.getAttribute("aria-controls"), "ma-content");
});

test("navigation candidates require both enabled features and available content", () => {
  const { buildMidnightNavItems } = loadTheme().load("themes/midnight-atelier/MidnightAtelier");
  const browsingOnly = fixture({ features: { ...features, rsvp: false, wishes: false, gift: false } });
  assert.deepEqual(Array.from(buildMidnightNavItems(browsingOnly), (item) => item.id), [
    "ma-beranda", "ma-mempelai", "ma-acara", "ma-galeri",
  ], "Signature lists gallery; story is a Grand stop");
  const empty = fixture({
    people: [], events: [], stories: [], gallery: [], gifts: [],
    features: { ...features, story: false, gallery: false, rsvp: false, wishes: false, gift: false },
  });
  assert.deepEqual(Array.from(buildMidnightNavItems(empty), (item) => item.id), ["ma-beranda"]);
});

test("each package shows its own nav stops in page order, growing with the package", () => {
  const { buildMidnightNavItems } = loadTheme().load("themes/midnight-atelier/MidnightAtelier");
  const ids = (invitation) => Array.from(buildMidnightNavItems(invitation), (item) => item.id);
  assert.deepEqual(ids(fixture({ navSections: NAV.intimate })), ["ma-beranda", "ma-mempelai", "ma-acara", "ma-rsvp", "ma-kado"]);
  assert.deepEqual(ids(fixture()), ["ma-beranda", "ma-mempelai", "ma-acara", "ma-galeri", "ma-rsvp", "ma-ucapan", "ma-kado"]);
  const live = fixture().events.map((event) => ({ ...event, livestreamUrl: "https://youtube.com/live/x" }));
  assert.deepEqual(ids(fixture({ navSections: NAV.grand, events: live })), [
    "ma-beranda", "ma-mempelai", "ma-acara", "ma-cerita", "ma-galeri", "ma-livestream", "ma-rsvp", "ma-ucapan", "ma-kado",
  ]);
});

test("every navigation section key has a thin art-deco icon", () => {
  const { NavIcon } = loadTheme().load("themes/midnight-atelier/components/NavIcon");
  const sections = ["hero", "couple", "events", "story", "gallery", "livestream", "rsvp", "wishes", "gift"];
  const markup = new Set();
  for (const section of sections) {
    const html = renderToStaticMarkup(React.createElement(NavIcon, { section }));
    const svg = new JSDOM(html).window.document.querySelector("svg");
    assert.ok(svg, `${section} renders an svg`);
    assert.equal(svg.getAttribute("viewBox"), "0 0 24 24", section);
    assert.equal(svg.getAttribute("aria-hidden"), "true", section);
    assert.equal(svg.getAttribute("focusable"), "false", section);
    assert.equal(svg.getAttribute("stroke"), "currentColor", section);
    assert.equal(svg.getAttribute("stroke-linejoin"), "miter", section);
    assert.ok(svg.querySelector("path, rect, circle, line, polyline, ellipse"), `${section} draws a glyph`);
    markup.add(svg.innerHTML);
  }
  assert.equal(markup.size, sections.length, "each section has a distinct glyph");
});

test("opened navigation shows one hidden icon plus a visible label and no numeric index", async () => {
  const view = await mountShell({}, fixture());
  try {
    const { document } = view;
    await act(async () => document.querySelector(".ma-cover-open").click());
    const links = [...document.querySelectorAll(".ma-nav a")];
    assert.deepEqual(links.map((link) => link.textContent), [
      "Beranda", "Mempelai", "Acara", "Galeri", "RSVP", "Ucapan", "Kado",
    ]);
    for (const link of links) {
      const icons = link.querySelectorAll("svg");
      assert.equal(icons.length, 1, `${link.textContent} has one icon`);
      assert.equal(icons[0].getAttribute("aria-hidden"), "true");
      assert.equal(icons[0].getAttribute("focusable"), "false");
      assert.doesNotMatch(link.textContent, /\d/, "no numeric index");
      assert.ok(link.querySelector(".ma-nav-label")?.textContent, "label stays visible text");
    }
  } finally {
    await view.cleanup();
  }
});

function navCss() {
  const document = new JSDOM(renderShell()).window.document;
  return document.querySelector("style")?.textContent ?? "";
}

function cssBlock(css, header) {
  const start = css.indexOf(header);
  assert.notEqual(start, -1, `missing ${header}`);
  let depth = 0;
  for (let index = css.indexOf("{", start); index < css.length; index += 1) {
    if (css[index] === "{") depth += 1;
    if (css[index] === "}") depth -= 1;
    if (depth === 0) return css.slice(start, index + 1);
  }
  throw new Error(`unterminated ${header}`);
}

function withoutMedia(css, header) {
  return css.replace(cssBlock(css, header), "");
}

function rules(css, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return [...css.matchAll(new RegExp(`(?:^|[}\\s])${escaped}\\s*\\{([^}]*)\\}`, "g"))].map((match) => match[1]);
}

test("navigation CSS stacks icons on mobile and sets them beside labels on the desktop rail", () => {
  const css = navCss();
  assert.match(css, /\.ma-nav-icon\s*\{[^}]*width:\s*clamp\(18px,\s*5\.2vw,\s*22px\)/s);
  assert.match(css, /\.ma-nav a\[aria-current="location"\]\s*\{[^}]*background:\s*var\(--ma-ink\)[^}]*color:\s*var\(--ma-pearl\)/s);
  assert.match(css, /\.ma-nav a\[aria-current="location"\] \.ma-nav-icon\s*\{[^}]*color:\s*var\(--ma-champagne\)/s);
  assert.match(cssBlock(css, "@media (min-width: 768px)"), /\.ma-nav a\s*\{[^}]*grid-template-columns:\s*(?:1[89]|20)px/);
  assert.doesNotMatch(css, /\.ma-nav a span:first-child/, "numeric index styling is gone");
});

test("mobile nav is a full-width bar of equal, readable items that scrolls inside itself past five", () => {
  const css = navCss();
  const mobile = withoutMedia(css, "@media (min-width: 768px)");
  const list = rules(mobile, ".ma-nav ul").join(";");
  assert.match(list, /overflow-x:\s*auto/, "extra stops scroll inside the bar");
  assert.match(list, /scrollbar-width:\s*none/);
  const nav = rules(mobile, ".ma-nav").join(";");
  assert.match(nav, /left:\s*max\(12px,\s*env\(safe-area-inset-left\)\)/);
  assert.match(nav, /right:\s*max\(12px,\s*env\(safe-area-inset-right\)\)/);
  assert.match(nav, /bottom:\s*var\(--ma-nav-offset\)/);
  assert.match(css, /--ma-nav-offset:\s*max\(12px,\s*env\(safe-area-inset-bottom\)\)/);
  assert.match(rules(mobile, ".ma-nav li").join(";"), /flex:\s*1 0 calc\(100% \/ 5\.4\)/, "up to five share the width; more peek in");
  assert.match(rules(mobile, ".ma-nav li").join(";"), /min-width:\s*0/);
  const link = rules(mobile, ".ma-nav a").join(";");
  const minHeight = Number(link.match(/min-height:\s*(\d+)px/)?.[1]);
  assert.ok(minHeight >= 52, `item min-height ${minHeight}px is at least 52px`);
  const label = rules(mobile, ".ma-nav-label").join(";");
  const labelSize = label.match(/font-size:\s*clamp\((\d+)px,\s*[\d.]+vw,\s*(\d+)px\)/);
  assert.ok(labelSize, "label size is a px clamp");
  assert.ok(Number(labelSize[1]) >= 11, "label never below 11px");
  assert.match(label, /white-space:\s*nowrap/);
  assert.match(label, /text-overflow:\s*ellipsis/);
});

test("mobile content reserves room for the bar and the music button clears it", () => {
  const css = navCss();
  const phone = cssBlock(css, "@media (max-width: 767px)");
  assert.match(phone, /\.ma-content\s*\{[^}]*padding-bottom:\s*calc\(var\(--ma-nav-height\)\s*\+\s*var\(--ma-nav-offset\)/s);
  const height = Number(css.match(/--ma-nav-height:\s*(\d+)px/)?.[1]);
  assert.ok(height >= 52 + 2, `declared bar height ${height}px covers the 52px items and border`);
  const music = rules(withoutMedia(css, "@media (min-width: 768px)"), ".ma-music").join(";");
  assert.match(music, /bottom:\s*calc\(var\(--ma-nav-offset\)\s*\+\s*var\(--ma-nav-height\)\s*\+\s*\d+px\)/);
});

for (const width of [390, 1440]) {
  test(`cover opens, tracks, focuses, and recovers from rejected audio at ${width}px`, async () => {
    const calls = [];
    const view = await mountShell({ track: async (...args) => calls.push(args) }, fixture(), width);
    try {
      const { document } = view;
      const audio = document.querySelector("audio");
      let attempts = 0;
      audio.play = async () => { attempts += 1; throw new Error("autoplay denied"); };
      assert.equal(document.getElementById("ma-content").hidden, true);
      await act(async () => document.querySelector(".ma-cover-open").click());
      assert.equal(document.getElementById("ma-content").hidden, false);
      assert.equal(document.activeElement, document.getElementById("ma-content"));
      assert.equal(document.querySelector(".ma-gate")?.getAttribute("data-opened"), "true");
      assert.deepEqual(calls, [["midnight-shell", "guest-token"]]);
      assert.equal(attempts, 1);
      const play = document.querySelector('button[aria-label="Putar musik"]');
      assert.ok(play);
      audio.play = async () => { attempts += 1; };
      await act(async () => play.click());
      assert.ok(document.querySelector('button[aria-label="Jeda musik"]'));
      assert.equal(attempts, 2);
      for (const link of document.querySelectorAll(".ma-nav a")) {
        assert.ok(document.querySelector(link.getAttribute("href")), "navigation cannot target an absent section");
      }
      assert.ok(document.querySelector('.ma-nav a[aria-current="location"]'));
    } finally {
      await view.cleanup();
    }
  });
}

test("reduced motion and disabled music keep the shell operable without audio", async () => {
  const invitation = fixture({ features: { ...features, music: false } });
  const view = await mountShell({ reducedMotion: true }, invitation);
  try {
    assert.equal(view.document.querySelector(".ma-gate")?.getAttribute("data-reduced-motion"), "true");
    await act(async () => view.document.querySelector(".ma-cover-open").click());
    assert.equal(view.document.getElementById("ma-content").hidden, false);
    assert.equal(view.document.querySelector("audio"), null);
    assert.equal(view.document.querySelector('[aria-label="Putar musik"]'), null);
    assert.equal(view.document.getElementById("ma-cover").hasAttribute("inert"), true);
  } finally {
    await view.cleanup();
  }
});

test("shell CSS defines distinct mobile and desktop navigation with a reduced-motion opener path", () => {
  const document = new JSDOM(renderShell()).window.document;
  const css = document.querySelector("style")?.textContent ?? "";
  assert.match(css, /data-opened="true"\] \.ma-flute-left\s*\{[^}]*animation:/);
  assert.match(css, /data-reduced-motion="true"\][^{]*\.ma-flute/);
  assert.match(css, /@media\s*\(max-width:\s*767px\)/);
  assert.match(css, /@media\s*\(min-width:\s*768px\)/);
  assert.match(css, /safe-area-inset-bottom/);
  assert.match(css, /data-reduced-motion="true"/);
  assert.doesNotMatch(css, /linear-gradient|conic-gradient/); // radial light is confined by midnight-atelier-identity
});
