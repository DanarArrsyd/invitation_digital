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
    id: "cobalt-shell", type: "wedding", slug: "cobalt-shell", title: "Mira & Raka", status: "published",
    eventDate: "2027-06-19", venueSummary: null, publishedAt: "2026-10-01T00:00:00Z", expiresAt: null,
    theme: { slug: "cobalt-riviera", settings: {} },
    people: [
      { id: "mira", role: "bride", fullName: "Mira", nickname: null, fatherName: null, motherName: null, photoUrl: null, bio: null, sortOrder: 0 },
      { id: "raka", role: "groom", fullName: "Raka", nickname: null, fatherName: null, motherName: null, photoUrl: null, bio: null, sortOrder: 1 },
    ],
    events: [{ id: "event", eventType: "reception", title: "Resepsi", eventDate: "2027-06-19", startTime: "16:00", endTime: "20:00", venueName: "Riviera Hall", address: null, mapsUrl: null, livestreamUrl: null, sortOrder: 0 }],
    stories: [{ id: "story", title: "Pertemuan", storyDate: null, yearLabel: null, description: "Cerita", imageUrl: null, sortOrder: 0 }],
    gallery: [{ id: "photo", imageUrl: "/portrait.jpg", caption: null, altText: "Mira dan Raka", aspectRatio: "landscape_16_9", sortOrder: 0 }],
    gifts: [{ id: "gift", providerType: "bank", providerName: "Bank", accountNumber: "123", accountName: "Mira", logoUrl: null, sortOrder: 0 }],
    wishes: [], content: { openingQuote: null, openingMessage: "Bergabunglah dalam perayaan kami.", closingMessage: null },
    features: { ...features }, media: { coverImageUrl: null, musicUrl: "/music.mp3" },
    ...overrides,
  };
}

const guest = {
  id: "guest",
  displayName: "Keluarga Adinata dengan Nama Tamu yang Sangat Panjang Sekali",
  token: "guest-token",
  notes: null,
};

function renderShell(invitation = fixture(), recipient = guest) {
  const { CobaltRiviera } = loadTheme().load("themes/cobalt-riviera");
  return renderToStaticMarkup(React.createElement(CobaltRiviera, { invitation, guest: recipient }));
}

async function mountShell(options = {}, invitation = fixture(), recipient = guest, width = 390) {
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
  const { CobaltRiviera } = loadTheme(options).load("themes/cobalt-riviera");
  const root = createRoot(document.getElementById("root"));
  await act(async () => root.render(React.createElement(CobaltRiviera, { invitation, guest: recipient })));
  return {
    document: dom.window.document,
    async cleanup() {
      await act(async () => root.unmount());
      Object.assign(globalThis, previous);
      dom.window.close();
    },
  };
}

test("photo-free horizon cover renders normalized names, date, guest, shutters, seam, and labelled sun action", () => {
  const document = new JSDOM(renderShell()).window.document;
  assert.equal(document.querySelector("#cr-cover img"), null);
  assert.equal(document.querySelectorAll(".cr-horizon-shutter").length, 2);
  assert.ok(document.querySelector(".cr-horizon-seam"));
  assert.equal(document.querySelector(".cr-cover-guest-name")?.textContent, guest.displayName);
  assert.match(document.querySelector(".cr-cover-names")?.textContent ?? "", /Mira.*Raka/s);
  assert.equal(document.querySelector("time")?.getAttribute("datetime"), "2027-06-19");
  const action = document.querySelector(".cr-cover-open");
  assert.equal(action?.getAttribute("aria-controls"), "cr-content");
  assert.match(action?.textContent ?? "", /Buka undangan/i);
  assert.ok(action?.querySelector(".cr-sun-mark"));
});

test("route candidates require usable content and enabled features while Cobalt stays unregistered", () => {
  const { buildCobaltRouteItems } = loadTheme().load("themes/cobalt-riviera/CobaltRiviera");
  const { themeRegistry } = loadTheme().load("themes/registry");
  assert.deepEqual(Array.from(buildCobaltRouteItems(fixture()), (item) => item.id), [
    "cr-beranda", "cr-mempelai", "cr-acara", "cr-cerita", "cr-galeri", "cr-rsvp", "cr-ucapan", "cr-kado",
  ]);
  const sparse = fixture({
    people: [], events: [], stories: [], gallery: [], gifts: [],
    features: { ...features, story: false, gallery: false, rsvp: false, wishes: false, gift: false },
  });
  assert.deepEqual(Array.from(buildCobaltRouteItems(sparse), (item) => item.id), ["cr-beranda"]);
  assert.equal(themeRegistry["cobalt-riviera"], undefined);
});

for (const width of [320, 1440]) {
  test(`cover opens once, tracks, focuses, and survives rejected autoplay at ${width}px`, async () => {
    const calls = [];
    const view = await mountShell({ track: async (...args) => calls.push(args) }, fixture(), guest, width);
    try {
      const { document } = view;
      const audio = document.querySelector("audio");
      let attempts = 0;
      audio.play = async () => { attempts += 1; throw new Error("autoplay denied"); };
      const action = document.querySelector(".cr-cover-open");
      assert.equal(document.getElementById("cr-content").hidden, true);
      await act(async () => action.click());
      await act(async () => action.click());
      assert.equal(document.getElementById("cr-content").hidden, false);
      assert.equal(document.activeElement, document.getElementById("cr-content"));
      assert.equal(document.querySelector(".cr-gate")?.getAttribute("data-opened"), "true");
      assert.deepEqual(calls, [["cobalt-shell", "guest-token"]]);
      assert.equal(attempts, 1);
      assert.ok(document.querySelector('button[aria-label="Putar musik"]'));
      for (const link of document.querySelectorAll(".cr-route-nav a")) {
        assert.ok(document.querySelector(link.getAttribute("href")), "route navigation cannot target an absent section");
      }
      assert.deepEqual(
        Array.from(document.querySelectorAll(".cr-route-nav a"), (link) => link.getAttribute("href")),
        ["#cr-beranda", "#cr-mempelai", "#cr-acara", "#cr-cerita", "#cr-galeri", "#cr-rsvp", "#cr-ucapan", "#cr-kado"],
      );
      assert.ok(document.querySelector('.cr-route-nav a[aria-current="location"]'));
    } finally {
      await view.cleanup();
    }
  });
}

test("generic guest, reduced motion, and disabled music keep the shell operable without audio", async () => {
  const invitation = fixture({ features: { ...features, music: false } });
  const view = await mountShell({ reducedMotion: true }, invitation, null, 390);
  try {
    assert.equal(view.document.querySelector(".cr-cover-guest-name")?.textContent, "Bapak/Ibu/Saudara/i");
    assert.equal(view.document.querySelector(".cr-gate")?.getAttribute("data-reduced-motion"), "true");
    await act(async () => view.document.querySelector(".cr-cover-open").click());
    assert.equal(view.document.getElementById("cr-content").hidden, false);
    assert.equal(view.document.querySelector("audio"), null);
    assert.equal(view.document.querySelector('[aria-label="Putar musik"]'), null);
    assert.equal(view.document.getElementById("cr-cover").hasAttribute("inert"), true);
  } finally {
    await view.cleanup();
  }
});

test("shell CSS defines the approved shutter timing, instant motion fallback, mobile strip, desktop edge index, and safe music offsets", () => {
  const { COBALT_RIVIERA_TOKENS } = loadTheme().load("themes/cobalt-riviera/tokens");
  const document = new JSDOM(renderShell()).window.document;
  const css = document.querySelector("style")?.textContent ?? "";
  assert.match(css, /\.cr-horizon-seam/);
  assert.match(css, /\.cr-horizon-shutter[^}]*transition[^}]*800ms/s);
  assert.match(css, /data-opened="true"[^}]*\.cr-shutter-upper[^{]*\{[^}]*translateY\(-10[01]%\)/s);
  assert.match(css, /data-opened="true"[^}]*\.cr-shutter-lower[^{]*\{[^}]*translateY\(10[01]%\)/s);
  assert.match(css, /@media\s*\(max-width:\s*767px\)/);
  assert.match(css, /@media\s*\(min-width:\s*768px\)/);
  assert.match(css, /safe-area-inset-bottom/);
  assert.match(css, /data-reduced-motion="true"/);
  assert.match(css, /\.cr-music[^}]*bottom:\s*calc\([^}]*--cr-mobile-nav-clearance/s);
  assert.match(css, /\.cr-route-nav\s*\{[^}]*--cr-focus-ring:\s*var\(--cr-cobalt\)/s);
  assert.match(css, /\.cr-route-nav a\[aria-current="location"\]\s*\{[^}]*--cr-focus-ring:\s*var\(--cr-sea-ink\)/s);
  assert.match(css, /\.cr-music\s*\{[^}]*--cr-focus-ring:\s*var\(--cr-sea-ink\)/s);
  assert.match(css, /\.cr-content\s*\{[^}]*padding-bottom:\s*calc\(var\(--cr-mobile-nav-clearance\) \+ env\(safe-area-inset-bottom\)\)/s);
  assert.match(css, /@media\s*\(min-width:\s*768px\)[\s\S]*?\.cr-content\s*\{[^}]*padding-bottom:\s*0/s);

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
  assert.ok(contrast(COBALT_RIVIERA_TOKENS.colors.porcelain, COBALT_RIVIERA_TOKENS.colors.cobalt) >= 3);
  assert.ok(contrast(COBALT_RIVIERA_TOKENS.colors.citron, COBALT_RIVIERA_TOKENS.colors.seaInk) >= 3);
  assert.doesNotMatch(css, /linear-gradient|radial-gradient|backdrop-filter|box-shadow/);
});

test("compact cover CSS keeps long names and its action structurally reachable without pretending jsdom performs layout", () => {
  const document = new JSDOM(renderShell()).window.document;
  const css = document.querySelector("style")?.textContent ?? "";
  assert.match(css, /\.cr-cover\s*\{[^}]*min-height:\s*100svh[^}]*overflow-y:\s*auto/s);
  assert.match(css, /\.cr-cover-frame\s*\{[^}]*min-height:\s*100svh/s);
  assert.match(css, /\.cr-cover-names\s*\{[^}]*max-width:\s*100%[^}]*flex-wrap:\s*wrap[^}]*overflow-wrap:\s*anywhere/s);
  assert.match(css, /\.cr-cover-guest-name\s*\{[^}]*max-width:[^}]*overflow-wrap:\s*anywhere/s);
  assert.match(css, /\.cr-cover-open\s*\{[^}]*min-width:\s*7\.5rem[^}]*max-width:\s*11rem/s);
  assert.match(css, /@media\s*\(max-width:\s*767px\)[\s\S]*?\.cr-cover-recipient\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\)[^}]*\}[\s\S]*?\.cr-cover-open\s*\{[^}]*justify-self:\s*start/s);
});

test("route links retain their grid composition while ordinary anchors keep the shared touch target", () => {
  const { ThemeStyles } = loadTheme().load("themes/cobalt-riviera/ThemeStyles");
  const dom = new JSDOM(
    `${renderToStaticMarkup(React.createElement(ThemeStyles))}
     <div class="cr-theme">
       <nav class="cr-route-nav"><a id="route-link" href="#cr-beranda"><span>01</span><span>Beranda</span></a></nav>
       <a id="ordinary-link" href="#next">Lanjut</a>
     </div>`,
    { pretendToBeVisual: true },
  );
  const routeStyle = dom.window.getComputedStyle(dom.window.document.getElementById("route-link"));
  const ordinaryStyle = dom.window.getComputedStyle(dom.window.document.getElementById("ordinary-link"));
  assert.equal(routeStyle.display, "grid");
  assert.equal(routeStyle.minHeight, "48px");
  assert.equal(ordinaryStyle.display, "inline-flex");
  assert.equal(ordinaryStyle.minHeight, "48px");
});
