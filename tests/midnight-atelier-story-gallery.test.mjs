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
        if (name === "@/app/(public)/[slug]/actions") return { trackCoverOpenedAction: async () => {} };
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
  music: false, countdown: false, maps: false, story: true, gallery: true,
  dressCode: false, livestream: false, rsvp: false, wishes: false, gift: false,
  guestPersonalization: false,
};

function story(index, overrides = {}) {
  return {
    id: `story-${index}`,
    title: `Act ${index + 1}`,
    storyDate: index === 1 ? "2028-06-17" : null,
    yearLabel: index === 0 ? "2027" : null,
    description: `Cerita panjang babak ${index + 1} yang tetap terbaca sebagai bagian perjalanan bersama.`,
    imageUrl: index % 2 === 0 ? `/story-${index}.jpg` : null,
    sortOrder: index,
    ...overrides,
  };
}

const ratios = ["landscape_16_9", "portrait_4_5", "square_1_1", "landscape_4_3", "portrait_3_4"];
const ratioCss = ["16 / 9", "4 / 5", "1 / 1", "4 / 3", "3 / 4"];

function galleryItem(index) {
  return {
    id: `frame-${index}`,
    imageUrl: `/frame-${index}.jpg`,
    caption: `Caption ${index}`,
    altText: index === 0 ? "Nadia dan Arka di bawah cahaya malam" : null,
    aspectRatio: ratios[index % ratios.length],
    sortOrder: index,
  };
}

function fixture(overrides = {}) {
  return {
    id: "midnight-story-gallery", type: "wedding", slug: "midnight-story-gallery", title: "Nadia & Arka", status: "published",
    eventDate: null, venueSummary: null, publishedAt: "2026-09-30T00:00:00Z", expiresAt: null,
    theme: { slug: "midnight-atelier", settings: {} },
    people: [
      { id: "nadia", role: "bride", fullName: "Nadia Rahmani", nickname: "Nadia", fatherName: null, motherName: null, photoUrl: null, bio: null, sortOrder: 0 },
      { id: "arka", role: "groom", fullName: "Arka Pradipta", nickname: "Arka", fatherName: null, motherName: null, photoUrl: null, bio: null, sortOrder: 1 },
    ],
    events: [], stories: [story(0), story(1), story(2)], gallery: [galleryItem(0), galleryItem(1), galleryItem(2)],
    gifts: [], wishes: [],
    content: { openingQuote: null, openingMessage: null, closingMessage: null },
    features: { ...features }, media: { coverImageUrl: null, musicUrl: null },
    ...overrides,
  };
}

function render(invitation = fixture()) {
  const { MidnightAtelier } = loadTheme().load("themes/midnight-atelier");
  return new JSDOM(renderToStaticMarkup(React.createElement(MidnightAtelier, { invitation, guest: null }))).window.document;
}

test("story renders ordered acts with dates, text-only entries, and long copy intact", () => {
  const document = render();
  const entries = [...document.querySelectorAll("#ma-cerita [data-story-item]")];
  assert.equal(entries.length, 3);
  entries.forEach((entry, index) => {
    assert.equal(entry.getAttribute("data-story-item"), `story-${index}`);
    assert.equal(entry.querySelector(".ma-story-index")?.textContent, String(index + 1).padStart(2, "0"));
    assert.match(entry.textContent, new RegExp(`Cerita panjang babak ${index + 1}`));
  });
  assert.match(entries[0].textContent, /2027/);
  assert.match(entries[1].textContent, /17 Juni 2028/);
  assert.ok(entries[1].classList.contains("ma-story-text-only"));
  assert.equal(entries[1].querySelector("img"), null);
});

test("invalid story dates stay hidden while the text-only act remains complete", () => {
  const document = render(fixture({ stories: [story(0, { storyDate: "2028-02-31", yearLabel: null, imageUrl: null })] }));
  const entry = document.querySelector("#ma-cerita [data-story-item]");
  assert.ok(entry);
  assert.equal(entry.querySelector("time"), null);
  assert.match(entry.textContent, /Act 1/);
  assert.match(entry.textContent, /Cerita panjang/);
});

test("gallery preserves order, captions, crop intent, lazy loading, and one anchor for 1 through 40 images", () => {
  for (let length = 1; length <= 40; length++) {
    const gallery = Array.from({ length }, (_, index) => galleryItem(index));
    const document = render(fixture({ gallery }));
    const frames = [...document.querySelectorAll("#ma-galeri [data-gallery-item]")];
    assert.equal(frames.length, length);
    frames.forEach((frame, index) => {
      assert.equal(frame.getAttribute("data-gallery-item"), `frame-${index}`);
      assert.match(frame.querySelector("figcaption")?.textContent ?? "", new RegExp(`Caption ${index}$`));
      assert.equal(frame.querySelector(".ma-media")?.style.aspectRatio, ratioCss[index % ratioCss.length]);
      assert.equal(frame.querySelector("img")?.getAttribute("loading"), "lazy");
      assert.ok(frame.querySelector("img")?.getAttribute("sizes"));
    });
    assert.equal(document.querySelectorAll("#ma-galeri [data-gallery-anchor='true']").length, 1);
    assert.equal(document.querySelectorAll("#ma-galeri .ma-gallery-columns [data-gallery-item]").length, length - 1);
  }
});

test("story and gallery images expose meaningful alternatives and stable reserved frames", () => {
  const document = render();
  const storyImages = [...document.querySelectorAll("#ma-cerita img")];
  assert.equal(storyImages.length, 2);
  assert.ok(storyImages.every((image) => image.alt.includes("Act")));
  assert.ok(storyImages.every((image) => image.getAttribute("loading") === "lazy"));
  const galleryImages = [...document.querySelectorAll("#ma-galeri img")];
  assert.equal(galleryImages[0].alt, "Nadia dan Arka di bawah cahaya malam");
  assert.match(galleryImages[1].alt, /Caption 1/);
  assert.ok([...storyImages, ...galleryImages].every((image) => image.closest(".ma-media")?.style.aspectRatio));
});

test("empty or disabled story and gallery leave no sections or dead navigation links", () => {
  const empty = render(fixture({ stories: [], gallery: [] }));
  assert.equal(empty.getElementById("ma-cerita"), null);
  assert.equal(empty.getElementById("ma-galeri"), null);
  assert.equal(empty.querySelector('a[href="#ma-cerita"], a[href="#ma-galeri"]'), null);

  const disabled = render(fixture({ features: { ...features, story: false, gallery: false } }));
  assert.equal(disabled.getElementById("ma-cerita"), null);
  assert.equal(disabled.getElementById("ma-galeri"), null);
  assert.equal(disabled.querySelector('a[href="#ma-cerita"], a[href="#ma-galeri"]'), null);
});

test("story and gallery image failures keep accessible frames", async () => {
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
    await act(async () => root.render(React.createElement(MidnightAtelier, { invitation: fixture(), guest: null })));
    await act(async () => document.querySelector(".ma-cover-open").click());
    const targets = [document.querySelector("#ma-cerita img"), document.querySelector("#ma-galeri img")];
    for (const image of targets) {
      const frame = image.closest(".ma-media");
      const ratio = frame.style.aspectRatio;
      const alt = image.alt;
      await act(async () => image.dispatchEvent(new dom.window.Event("error")));
      assert.equal(frame.style.aspectRatio, ratio);
      assert.equal(frame.querySelector('[role="img"]')?.getAttribute("aria-label"), alt);
      assert.match(frame.textContent, /Foto tidak dapat dimuat/);
    }
  } finally {
    await act(async () => root.unmount());
    Object.assign(globalThis, previous);
    dom.window.close();
  }
});

test("story and contact-sheet CSS protects long content, crop intent, and target viewports", () => {
  const css = render().querySelector("style")?.textContent ?? "";
  assert.match(css, /\.ma-story-copy[^}]*overflow-wrap:\s*anywhere/s);
  assert.match(css, /\.ma-gallery-item[^}]*break-inside:\s*avoid/s);
  assert.match(css, /\.ma-gallery-columns[^}]*columns:\s*1/s);
  assert.match(css, /\.ma-gallery-columns[^}]*columns:\s*3/s);
  assert.match(css, /@media\s*\(max-width:\s*767px\)/);
  assert.match(css, /@media\s*\(min-width:\s*768px\)/);
  assert.doesNotMatch(css, /linear-gradient|conic-gradient/); // radial light is confined by midnight-atelier-identity
});
