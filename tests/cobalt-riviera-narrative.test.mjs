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

function loadTheme() {
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
        if (name === "motion/react") return { useReducedMotion: () => false };
        if (name === "@/app/(public)/[slug]/actions") return {
          trackCoverOpenedAction: async () => {},
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
  music: false, countdown: true, maps: true, story: true, gallery: true,
  dressCode: true, livestream: true, rsvp: true, wishes: true, gift: true,
  guestPersonalization: true,
};

function person(overrides = {}) {
  return {
    id: "mira", role: "bride", fullName: "Mira Azzahra", nickname: "Mira",
    fatherName: "Bapak Ardiansyah dengan Nama Keluarga yang Sangat Panjang",
    motherName: "Ibu Lestari dengan Nama Keluarga yang Sama Panjangnya",
    photoUrl: "/mira.jpg",
    bio: "Mira tumbuh di antara kota dan laut, membawa keramahan keluarga ke setiap perjumpaan.",
    sortOrder: 0,
    ...overrides,
  };
}

function fixture(overrides = {}) {
  return {
    id: "cobalt-narrative", type: "wedding", slug: "cobalt-narrative",
    title: "Mira Azzahra & Raka Mahendra", status: "published", eventDate: "2027-06-19",
    venueSummary: null, publishedAt: "2026-10-01T00:00:00Z", expiresAt: null,
    theme: { slug: "cobalt-riviera", settings: {
      personSocials: {
        mira: { instagram: "@mira.riviera" },
        raka: { instagram: "https://evil.example/raka" },
      },
    } },
    people: [
      person(),
      person({
        id: "raka", role: "groom", fullName: "Raka Mahendra", nickname: "Raka",
        fatherName: null, motherName: null, photoUrl: "/raka.jpg",
        bio: "Raka percaya perjalanan terbaik selalu pulang pada orang yang tepat.", sortOrder: 1,
      }),
    ],
    events: [], stories: [], gifts: [], wishes: [],
    gallery: [
      { id: "closing", imageUrl: "/closing.jpg", caption: "Mira dan Raka menatap cakrawala", altText: null, aspectRatio: "landscape_16_9", sortOrder: 0 },
    ],
    content: {
      openingQuote: "Cinta memberi arah, lalu keberanian membawa kita pulang.",
      openingMessage: "Satu perayaan hangat di bawah langit yang terbuka.",
      closingMessage: "Sampai bertemu di hari bahagia kami.",
    },
    features: { ...features },
    media: { coverImageUrl: "/hero.jpg", musicUrl: null },
    ...overrides,
  };
}

function render(invitation = fixture()) {
  const { CobaltRiviera } = loadTheme().load("themes/cobalt-riviera");
  return new JSDOM(renderToStaticMarkup(React.createElement(CobaltRiviera, { invitation, guest: null }))).window.document;
}

test("full narrative renders a panoramic eager hero, optional quote, safe editorial people, and lazy closing fallback image", () => {
  const document = render();
  const hero = document.getElementById("cr-beranda");
  const couple = document.getElementById("cr-mempelai");
  const closing = document.getElementById("cr-penutup");

  assert.equal(hero?.getAttribute("aria-labelledby"), "cr-hero-heading");
  assert.equal(hero?.querySelector("img")?.getAttribute("src"), "/hero.jpg");
  assert.equal(hero?.querySelector("img")?.getAttribute("loading"), "eager");
  assert.equal(hero?.querySelector("img")?.getAttribute("alt"), "Panorama perayaan Mira & Raka");
  assert.match(hero?.querySelector("img")?.getAttribute("sizes") ?? "", /100vw/);
  assert.equal(document.querySelector(".cr-quote blockquote")?.textContent, "Cinta memberi arah, lalu keberanian membawa kita pulang.");

  assert.equal(couple?.querySelectorAll(".cr-person").length, 2);
  assert.equal(couple?.querySelectorAll(".cr-person-portrait img").length, 2);
  assert.match(couple?.textContent ?? "", /Putri dari/);
  assert.match(couple?.textContent ?? "", /Bapak Ardiansyah/);
  assert.match(couple?.textContent ?? "", /Ibu Lestari/);
  const instagram = couple?.querySelector(".cr-instagram");
  assert.equal(instagram?.getAttribute("href"), "https://www.instagram.com/mira.riviera/");
  assert.equal(instagram?.getAttribute("aria-label"), "Instagram Mira Azzahra @mira.riviera");
  assert.equal(couple?.querySelectorAll(".cr-instagram").length, 1, "unsafe Instagram values stay hidden");

  assert.equal(closing?.querySelector("img")?.getAttribute("src"), "/closing.jpg");
  assert.equal(closing?.querySelector("img")?.getAttribute("loading"), "lazy");
  assert.equal(closing?.querySelector("img")?.getAttribute("alt"), "Mira dan Raka menatap cakrawala");
  assert.match(closing?.querySelector("img")?.getAttribute("sizes") ?? "", /100vw|vw/);
});

test("sparse and partial narrative uses intentional horizons, omits blank quote, and keeps one person readable", () => {
  const invitation = fixture({
    media: { coverImageUrl: null, musicUrl: null }, gallery: [],
    people: [person({ photoUrl: null, fatherName: null, motherName: null, bio: null })],
    content: { openingQuote: "   ", openingMessage: null, closingMessage: null },
  });
  const document = render(invitation);

  assert.equal(document.querySelector("#cr-beranda img"), null);
  const horizon = document.querySelector("#cr-beranda .cr-hero-horizon");
  assert.equal(horizon?.getAttribute("aria-hidden"), "true");
  assert.match(horizon?.textContent ?? "", /Mira Azzahra.*Raka Mahendra/s);
  assert.match(horizon?.textContent ?? "", /CR \/ 04/);
  assert.ok(horizon?.querySelector(".cr-hero-horizon-name"));
  assert.equal(document.querySelector(".cr-quote"), null);
  assert.equal(document.querySelectorAll("#cr-mempelai .cr-person").length, 1);
  assert.ok(document.querySelector("#cr-mempelai .cr-person-monogram"));
  assert.equal(document.querySelector("#cr-penutup img"), null);
  assert.ok(document.querySelector("#cr-penutup .cr-closing-horizon"));
  assert.equal(document.querySelector('a[href="#cr-mempelai"]'), null, "navigation is client-mounted only");
});

test("closing metadata comes from the exact final gallery record and never leaks onto the cover fallback", () => {
  const duplicateUrl = fixture({
    media: { coverImageUrl: "/hero.jpg", musicUrl: null },
    gallery: [
      { id: "first", imageUrl: "/same.jpg", caption: "Caption pertama yang salah", altText: "Alt pertama yang salah", aspectRatio: "square_1_1", sortOrder: 0 },
      { id: "last", imageUrl: "/same.jpg", caption: "Caption penutup yang benar", altText: "Alt penutup yang benar", aspectRatio: "landscape_16_9", sortOrder: 1 },
    ],
  });
  const duplicateDocument = render(duplicateUrl);
  assert.equal(duplicateDocument.querySelector("#cr-penutup img")?.getAttribute("alt"), "Alt penutup yang benar");

  const coverFallback = fixture({ gallery: [] });
  const coverDocument = render(coverFallback);
  assert.equal(
    coverDocument.querySelector("#cr-penutup img")?.getAttribute("alt"),
    "Potret penutup Mira & Raka",
  );
});

test("hero, person, and closing failures preserve stable geometry and meaningful accessible fallbacks", async () => {
  const dom = new JSDOM("<div id='root'></div>", { pretendToBeVisual: true, url: "https://invitation.test/" });
  const keys = ["window", "document", "HTMLElement", "IntersectionObserver", "requestAnimationFrame", "IS_REACT_ACT_ENVIRONMENT"];
  const previous = Object.fromEntries(keys.map((key) => [key, globalThis[key]]));
  Object.assign(globalThis, {
    window: dom.window, document: dom.window.document, HTMLElement: dom.window.HTMLElement,
    IntersectionObserver: class { observe() {} disconnect() {} },
    requestAnimationFrame: dom.window.requestAnimationFrame.bind(dom.window), IS_REACT_ACT_ENVIRONMENT: true,
  });
  const { CobaltRiviera } = loadTheme().load("themes/cobalt-riviera");
  const root = createRoot(document.getElementById("root"));
  try {
    await act(async () => root.render(React.createElement(CobaltRiviera, { invitation: fixture(), guest: null })));
    const frames = [
      ["#cr-beranda .cr-media", "16 / 9", "Panorama perayaan Mira & Raka", "eager"],
      ["#cr-mempelai .cr-media", "4 / 5", "Potret Mira Azzahra", "lazy"],
      ["#cr-penutup .cr-media", "16 / 10", "Mira dan Raka menatap cakrawala", "lazy"],
    ];
    for (const [selector, ratio, alt, loading] of frames) {
      const frame = document.querySelector(selector);
      const image = frame?.querySelector("img");
      assert.equal(frame?.style.aspectRatio, ratio);
      assert.equal(image?.getAttribute("loading"), loading);
      await act(async () => image?.dispatchEvent(new dom.window.Event("error")));
      assert.equal(frame?.style.aspectRatio, ratio);
      assert.equal(frame?.querySelector(".cr-image-fallback")?.getAttribute("aria-label"), alt);
    }
  } finally {
    await act(async () => root.unmount());
    Object.assign(globalThis, previous);
    dom.window.close();
  }
});

test("narrative CSS encodes responsive offset spreads, long-copy containment, hard crops, and no generic travel effects", () => {
  const document = render();
  const css = document.querySelector("style")?.textContent ?? "";
  assert.match(css, /\.cr-hero-layout\s*\{[^}]*display:\s*grid/s);
  assert.match(css, /\.cr-hero-image[^}]*aspect-ratio|\.cr-media/);
  assert.match(css, /\.cr-person\[data-position="right"\]/);
  assert.match(css, /overflow-wrap:\s*anywhere/);
  assert.match(css, /max-width:\s*72ch/);
  assert.match(css, /@media\s*\(min-width:\s*768px\)/);
  assert.match(css, /@media\s*\(min-width:\s*1200px\)/);
  assert.match(css, /\.cr-person-monogram[^}]*aspect-ratio:\s*4\s*\/\s*5/s);
  assert.match(css, /\.cr-hero-horizon-name\s*\{[^}]*overflow:\s*hidden[^}]*text-overflow:\s*clip/s);
  assert.match(css, /\.cr-hero-horizon-name[^}]*overflow-wrap:\s*anywhere/s);
  assert.doesNotMatch(css, /linear-gradient|radial-gradient|backdrop-filter|box-shadow|border-radius/);
});
