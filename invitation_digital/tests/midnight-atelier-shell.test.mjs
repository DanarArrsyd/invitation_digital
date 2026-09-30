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
    id: "midnight-shell", type: "wedding", slug: "midnight-shell", title: "Nadia & Arka", status: "published",
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

test("photo-free couture cover renders personalized programme data and curtain structure", () => {
  const document = new JSDOM(renderShell()).window.document;
  assert.equal(document.querySelector("#ma-cover img"), null);
  assert.equal(document.querySelectorAll(".ma-curtain-panel").length, 2);
  assert.ok(document.querySelector(".ma-curtain-seam"));
  assert.equal(document.querySelector(".ma-cover-guest-name")?.textContent, guest.displayName);
  assert.match(document.querySelector(".ma-cover-names")?.textContent ?? "", /Nadia.*Arka/s);
  assert.equal(document.querySelector("time")?.getAttribute("datetime"), "2027-02-14");
  assert.equal(document.querySelector(".ma-cover-open")?.getAttribute("aria-controls"), "ma-content");
});

test("navigation candidates require both enabled features and available content", () => {
  const { buildMidnightNavItems } = loadTheme().load("themes/midnight-atelier/MidnightAtelier");
  assert.deepEqual(Array.from(buildMidnightNavItems(fixture()), (item) => item.id), [
    "ma-beranda", "ma-mempelai", "ma-acara", "ma-cerita", "ma-galeri", "ma-rsvp", "ma-ucapan", "ma-kado",
  ]);
  const empty = fixture({
    people: [], events: [], stories: [], gallery: [], gifts: [],
    features: { ...features, story: false, gallery: false, rsvp: false, wishes: false, gift: false },
  });
  assert.deepEqual(Array.from(buildMidnightNavItems(empty), (item) => item.id), ["ma-beranda"]);
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

test("shell CSS defines distinct mobile and desktop navigation with a reduced-motion curtain path", () => {
  const document = new JSDOM(renderShell()).window.document;
  const css = document.querySelector("style")?.textContent ?? "";
  assert.match(css, /\.ma-curtain-seam/);
  assert.match(css, /data-opened="true"[^}]*\.ma-curtain-left[^{]*\{[^}]*translateX\(-10[01]%\)/s);
  assert.match(css, /@media\s*\(max-width:\s*767px\)/);
  assert.match(css, /@media\s*\(min-width:\s*768px\)/);
  assert.match(css, /safe-area-inset-bottom/);
  assert.match(css, /data-reduced-motion="true"/);
  assert.doesNotMatch(css, /linear-gradient|radial-gradient/);
});
