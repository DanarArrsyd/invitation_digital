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

const baseFeatures = {
  music: false, countdown: true, maps: true, story: true, gallery: true,
  dressCode: true, livestream: true, rsvp: true, wishes: true, gift: true,
  guestPersonalization: true,
};

function fixture(overrides = {}) {
  return {
    id: "midnight-narrative", type: "wedding", slug: "midnight-narrative", title: "Nadia & Arka", status: "published",
    eventDate: "2027-02-14", venueSummary: null, publishedAt: "2026-09-30T00:00:00Z", expiresAt: null,
    theme: { slug: "midnight-atelier", settings: { personSocials: {
      nadia: { instagram: "@nadia.atelier" },
      arka: { instagram: "javascript:alert(1)" },
    } } },
    people: [
      { id: "nadia", role: "bride", fullName: "Nadia Rahmani", nickname: "Nadia", fatherName: "Bapak Rahman", motherName: "Ibu Nirmala", photoUrl: "/nadia.jpg", bio: "Menemukan rumah di dalam percakapan yang panjang.", sortOrder: 0 },
      { id: "arka", role: "groom", fullName: "Arka Pradipta", nickname: "Arka", fatherName: "Bapak Pradipta", motherName: "Ibu Laras", photoUrl: null, bio: null, sortOrder: 1 },
    ],
    events: [], stories: [],
    gallery: [
      { id: "one", imageUrl: "/gallery-one.jpg", caption: null, altText: "Nadia dan Arka", aspectRatio: "portrait_4_5", sortOrder: 0 },
      { id: "last", imageUrl: "/closing.jpg", caption: null, altText: "Nadia dan Arka di malam hari", aspectRatio: "portrait_3_4", sortOrder: 1 },
    ],
    gifts: [], wishes: [],
    content: {
      openingQuote: "Cinta memberi malam sebuah arah.",
      openingMessage: "Sebuah malam untuk merayakan perjalanan yang kami pilih bersama.",
      closingMessage: "Kehadiran Anda menjadi bagian yang kami simpan selamanya.",
    },
    features: { ...baseFeatures }, media: { coverImageUrl: "/hero.jpg", musicUrl: null },
    ...overrides,
  };
}

const guest = { id: "guest", displayName: "Keluarga Adinata", token: "token", notes: null };

function render(invitation = fixture()) {
  const { MidnightAtelier } = loadTheme().load("themes/midnight-atelier");
  return new JSDOM(renderToStaticMarkup(React.createElement(MidnightAtelier, { invitation, guest }))).window.document;
}

test("narrative renders cinematic hero, quote, diptych credits, and closing fallback data", () => {
  const document = render();
  const heroImage = document.querySelector("#ma-beranda img");
  assert.equal(heroImage?.getAttribute("src"), "/hero.jpg");
  assert.equal(heroImage?.getAttribute("loading"), "eager");
  assert.equal(heroImage?.getAttribute("alt"), "Potret Nadia & Arka");
  assert.equal(document.querySelector("#ma-kutipan blockquote")?.textContent, "Cinta memberi malam sebuah arah.");
  assert.equal(document.querySelectorAll("#ma-mempelai article").length, 2);
  assert.match(document.querySelector("#ma-mempelai")?.textContent ?? "", /Bapak Rahman.*Ibu Nirmala/s);
  const instagram = document.querySelector("#ma-mempelai .ma-instagram");
  assert.equal(instagram?.getAttribute("href"), "https://www.instagram.com/nadia.atelier/");
  assert.match(instagram?.getAttribute("aria-label") ?? "", /Nadia Rahmani.*@nadia\.atelier/);
  assert.equal(document.querySelectorAll("#ma-mempelai .ma-instagram").length, 1, "unsafe profile stays hidden");
  const closingImage = document.querySelector("#ma-penutup img");
  assert.equal(closingImage?.getAttribute("src"), "/closing.jpg");
  assert.equal(closingImage?.getAttribute("alt"), "Nadia dan Arka di malam hari");
});

test("sparse narrative remains intentional without photos, quote, parents, or people", () => {
  const sparse = fixture({
    people: [], gallery: [],
    content: { openingQuote: " ", openingMessage: null, closingMessage: null },
    media: { coverImageUrl: null, musicUrl: null },
  });
  const document = render(sparse);
  assert.ok(document.querySelector("#ma-beranda.ma-hero-text-only"));
  assert.equal(document.querySelector("#ma-beranda img"), null);
  assert.equal(document.querySelector("#ma-kutipan"), null);
  assert.equal(document.querySelector("#ma-mempelai"), null);
  assert.ok(document.querySelector("#ma-penutup.ma-closing-text-only"));
  assert.equal(document.querySelector("#ma-penutup img"), null);
  document.querySelectorAll("style, script").forEach((element) => element.remove());
  assert.doesNotMatch(document.body.textContent, /undefined|null/);
});

test("closing uses cover only when no gallery image exists", () => {
  const document = render(fixture({ gallery: [] }));
  assert.equal(document.querySelector("#ma-penutup img")?.getAttribute("src"), "/hero.jpg");
});

test("long partial people content keeps names, credits, and biographies intact", () => {
  const long = "Nama yang sangat panjang untuk menguji pembungkusan teks tanpa keluar dari panggung editorial";
  const document = render(fixture({ people: [{
    id: "long", role: "bride", fullName: long, nickname: null,
    fatherName: `${long} Ayah`, motherName: `${long} Ibu`, photoUrl: null,
    bio: `${long}. ${long}.`, sortOrder: 0,
  }] }));
  const person = document.querySelector("#ma-mempelai article");
  assert.equal(person?.querySelector("h3")?.textContent, long);
  assert.match(person?.textContent ?? "", new RegExp(`${long} Ayah`));
  assert.match(person?.textContent ?? "", new RegExp(`${long} Ibu`));
  assert.ok(person?.classList.contains("ma-person-text-only"));
});

test("hero, portrait, and closing image failures retain stable accessible frames", async () => {
  const dom = new JSDOM("<div id='root'></div>", { pretendToBeVisual: true, url: "https://invitation.test/" });
  const keys = ["window", "document", "HTMLElement", "IntersectionObserver", "requestAnimationFrame", "IS_REACT_ACT_ENVIRONMENT"];
  const previous = Object.fromEntries(keys.map((key) => [key, globalThis[key]]));
  Object.assign(globalThis, {
    window: dom.window, document: dom.window.document, HTMLElement: dom.window.HTMLElement,
    IntersectionObserver: class { observe() {} disconnect() {} },
    requestAnimationFrame: dom.window.requestAnimationFrame.bind(dom.window), IS_REACT_ACT_ENVIRONMENT: true,
  });
  const { MidnightAtelier } = loadTheme().load("themes/midnight-atelier");
  const root = createRoot(document.getElementById("root"));
  try {
    await act(async () => root.render(React.createElement(MidnightAtelier, { invitation: fixture(), guest })));
    await act(async () => document.querySelector(".ma-cover-open").click());
    const images = [...document.querySelectorAll("#ma-beranda img, #ma-mempelai img, #ma-penutup img")];
    assert.equal(images.length, 3);
    for (const image of images) {
      assert.ok(image.closest(".ma-media")?.style.aspectRatio);
      await act(async () => image.dispatchEvent(new dom.window.Event("error")));
    }
    const fallbacks = [...document.querySelectorAll("#ma-beranda .ma-image-fallback, #ma-mempelai .ma-image-fallback, #ma-penutup .ma-image-fallback")];
    assert.equal(fallbacks.length, 3);
    assert.ok(fallbacks.every((fallback) => fallback.getAttribute("role") === "img"));
    assert.ok(fallbacks.every((fallback) => fallback.getAttribute("aria-label")));
  } finally {
    await act(async () => root.unmount());
    Object.assign(globalThis, previous);
    dom.window.close();
  }
});

test("narrative CSS protects long content and required viewport compositions", () => {
  const css = render().querySelector("style")?.textContent ?? "";
  assert.match(css, /\.ma-person-copy[^}]*overflow-wrap:\s*anywhere/s);
  assert.match(css, /\.ma-hero-image[^}]*aspect-ratio/s);
  assert.match(css, /@media\s*\(max-width:\s*767px\)/);
  assert.match(css, /@media\s*\(min-width:\s*768px\)/);
  assert.match(css, /@media\s*\(min-width:\s*1100px\)/);
  assert.doesNotMatch(css, /linear-gradient|radial-gradient/);
});
