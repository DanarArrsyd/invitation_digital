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
    title: `Babak Riviera ${index + 1}`,
    storyDate: `202${index}-0${index + 1}-0${index + 1}`,
    yearLabel: null,
    description: `Cerita lengkap babak ${index + 1} yang tetap terbaca tanpa bergantung pada foto.`,
    imageUrl: `https://images.example.test/story-${index}.jpg`,
    sortOrder: index,
    ...overrides,
  };
}

const ratios = ["square_1_1", "portrait_4_5", "portrait_3_4", "landscape_16_9", "landscape_4_3"];
function galleryItem(index, overrides = {}) {
  return {
    id: `gallery-${index}`,
    imageUrl: `https://images.example.test/gallery-${index}.jpg`,
    caption: index % 2 === 0 ? `Caption ${index + 1}` : null,
    altText: index % 3 === 0 ? `Alt ${index + 1}` : null,
    aspectRatio: ratios[index % ratios.length],
    sortOrder: index,
    ...overrides,
  };
}

function fixture(overrides = {}) {
  return {
    id: "cobalt-story-gallery", type: "wedding", slug: "cobalt-story-gallery", title: "Mira & Raka", status: "published",
    eventDate: null, venueSummary: null, publishedAt: "2026-10-01T00:00:00Z", expiresAt: null,
    theme: { slug: "cobalt-riviera", settings: {} },
    people: [], events: [], stories: [story(0)], gallery: [galleryItem(0)], gifts: [], wishes: [],
    content: { openingQuote: null, openingMessage: null, closingMessage: null },
    features: { ...features }, media: { coverImageUrl: null, musicUrl: null },
    ...overrides,
  };
}

function render(invitation = fixture()) {
  const { CobaltRiviera } = loadTheme().load("themes/cobalt-riviera");
  return new JSDOM(renderToStaticMarkup(React.createElement(CobaltRiviera, { invitation, guest: null }))).window.document;
}

test("story folio preserves normalized chronology and complete text-only entries with invalid or missing dates", () => {
  const stories = [
    story(0, { imageUrl: null, yearLabel: "Pertemuan pertama", storyDate: null }),
    story(1, { imageUrl: null, yearLabel: "  ", storyDate: "not-a-date" }),
    story(2, { imageUrl: null, yearLabel: null, storyDate: "2024-02-29" }),
  ];
  const document = render(fixture({ stories }));
  const entries = [...document.querySelectorAll("#cr-cerita [data-story-item]")];
  assert.deepEqual(entries.map((entry) => entry.getAttribute("data-story-item")), stories.map(({ id }) => id));
  assert.deepEqual(entries.map((entry) => entry.querySelector("h3")?.textContent), stories.map(({ title }) => title));
  assert.ok(entries.every((entry, index) => entry.textContent.includes(stories[index].description)));
  assert.equal(entries[0].querySelector("img"), null);
  assert.match(entries[0].textContent, /Pertemuan pertama/);
  assert.equal(entries[1].querySelector("time"), null, "invalid dates must not create misleading time markup");
  assert.equal(entries[2].querySelector("time")?.getAttribute("datetime"), "2024-02-29");
  assert.equal(document.querySelector("#cr-cerita .cr-story-rail")?.getAttribute("tabindex"), "0");
});

test("gallery balances one through forty images with one panoramic anchor and an ordered ceramic mosaic", () => {
  for (const length of [1, 2, 3, 40]) {
    const gallery = Array.from({ length }, (_, index) => galleryItem(index));
    const document = render(fixture({ gallery }));
    const items = [...document.querySelectorAll("#cr-galeri [data-gallery-item]")];
    assert.equal(items.length, length);
    assert.deepEqual(items.map((item) => item.getAttribute("data-gallery-item")), gallery.map(({ id }) => id));
    assert.equal(items.filter((item) => item.getAttribute("data-gallery-anchor") === "true").length, 1);
    assert.equal(items[0].getAttribute("data-gallery-anchor"), "true");
    const spans = items.map((item) => Number(item.getAttribute("data-gallery-span")));
    assert.equal(spans[0], 12);
    for (let index = 1; index < spans.length;) {
      if (spans[index] === 12) {
        index += 1;
      } else {
        assert.equal(spans[index] + spans[index + 1], 12, "paired ceramic cells must fill their row");
        index += 2;
      }
    }
    assert.ok(items.every((item) => item.querySelector("img")?.getAttribute("loading") === "lazy"));
    items.forEach((item, index) => {
      const media = item.querySelector(".cr-media");
      assert.equal(media?.style.aspectRatio, ["1 / 1", "4 / 5", "3 / 4", "16 / 9", "4 / 3"][index % 5]);
      if (gallery[index].caption) assert.equal(item.querySelector("figcaption")?.textContent, gallery[index].caption);
    });
  }
});

test("gallery images keep meaningful alternatives and stable accessible failure frames", async () => {
  const dom = new JSDOM("<div id='root'></div>", { pretendToBeVisual: true, url: "https://invitation.test/" });
  const keys = ["window", "document", "HTMLElement", "Event", "IS_REACT_ACT_ENVIRONMENT"];
  const previous = Object.fromEntries(keys.map((key) => [key, globalThis[key]]));
  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
    HTMLElement: dom.window.HTMLElement,
    Event: dom.window.Event,
    IS_REACT_ACT_ENVIRONMENT: true,
  });
  const root = createRoot(document.getElementById("root"));
  try {
    const { GallerySection } = loadTheme().load("themes/cobalt-riviera/sections/GallerySection");
    const gallery = [galleryItem(0, { altText: "Pemandangan upacara", caption: "Senja" })];
    await act(async () => root.render(React.createElement(GallerySection, { gallery, displayName: "Mira & Raka" })));
    const image = document.querySelector("img");
    assert.equal(image?.getAttribute("alt"), "Pemandangan upacara");
    await act(async () => image?.dispatchEvent(new dom.window.Event("error")));
    const fallback = document.querySelector(".cr-image-fallback");
    assert.equal(fallback?.getAttribute("role"), "img");
    assert.equal(fallback?.getAttribute("aria-label"), "Pemandangan upacara");
    assert.equal(fallback?.closest(".cr-media")?.style.aspectRatio, "1 / 1");
  } finally {
    await act(async () => root.unmount());
    Object.assign(globalThis, previous);
    dom.window.close();
  }
});

test("disabled or empty story and gallery sections leave no chapter or route target", () => {
  const disabled = render(fixture({ features: { ...features, story: false, gallery: false } }));
  assert.equal(disabled.querySelector("#cr-cerita"), null);
  assert.equal(disabled.querySelector("#cr-galeri"), null);
  assert.equal(disabled.querySelector("a[href='#cr-cerita']"), null);
  assert.equal(disabled.querySelector("a[href='#cr-galeri']"), null);

  const empty = render(fixture({ stories: [], gallery: [] }));
  assert.equal(empty.querySelector("#cr-cerita"), null);
  assert.equal(empty.querySelector("#cr-galeri"), null);
  assert.equal(empty.querySelector("a[href='#cr-cerita']"), null);
  assert.equal(empty.querySelector("a[href='#cr-galeri']"), null);
});

test("mobile snap remains progressive while desktop folio and ceramic grid stay static and overflow-safe", () => {
  const document = render(fixture({
    stories: [story(0, { title: "Nama babak panjang tanpa spasi".repeat(12), description: "Isi panjang ".repeat(180) })],
    gallery: Array.from({ length: 40 }, (_, index) => galleryItem(index)),
  }));
  const css = document.querySelector("style")?.textContent ?? "";
  assert.match(css, /\.cr-story-copy[^}]*overflow-wrap:\s*anywhere/s);
  assert.match(css, /@media\s*\(max-width:\s*767px\)[\s\S]*\.cr-story-rail\s*\{[^}]*overflow-x:\s*auto[^}]*scroll-snap-type:\s*x proximity/s);
  assert.match(css, /@media\s*\(min-width:\s*768px\)[\s\S]*\.cr-story-rail\s*\{[^}]*overflow:\s*visible[^}]*scroll-snap-type:\s*none/s);
  assert.match(css, /\.cr-gallery-mosaic[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s);
  assert.match(css, /@media\s*\(min-width:\s*768px\)[\s\S]*\.cr-gallery-mosaic\s*\{[^}]*grid-template-columns:\s*repeat\(12,\s*minmax\(0,\s*1fr\)\)/s);
  assert.doesNotMatch(css, /linear-gradient|radial-gradient|backdrop-filter|box-shadow|border-radius/);
  const source = readFileSync(resolve(sourceRoot, "themes/cobalt-riviera/sections/StorySection.tsx"), "utf8");
  assert.doesNotMatch(source, /onTouch|onPointer|onMouse|useState|useEffect|carousel/i);
});
