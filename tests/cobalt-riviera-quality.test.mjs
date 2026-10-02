import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
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
const cobaltRoot = resolve(sourceRoot, "themes/cobalt-riviera");

function createLoader({ reducedMotion = false, trackOpen, submitRsvp, submitWish } = {}) {
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
      get FormData() { return globalThis.FormData; },
      get navigator() { return globalThis.window?.navigator; },
      get IntersectionObserver() { return globalThis.IntersectionObserver; },
      get requestAnimationFrame() { return globalThis.requestAnimationFrame; },
      require(name) {
        if (name === "next/image") return { __esModule: true, default: (imageProps) => {
          const props = { ...imageProps };
          delete props.fill;
          delete props.fetchPriority;
          delete props.unoptimized;
          return React.createElement("img", props);
        } };
        if (name === "next/script") return { __esModule: true, default: () => null };
        if (name === "next/font/google") return Object.fromEntries(["Fraunces", "Manrope"].map((font) => [font, () => ({ variable: font })]));
        if (name === "motion/react") return { useReducedMotion: () => reducedMotion };
        if (name === "@/app/(public)/[slug]/actions") return {
          trackCoverOpenedAction: trackOpen ?? (async () => {}),
          submitRsvpAction: submitRsvp ?? (async () => ({ status: "success" })),
          submitWishAction: submitWish ?? (async () => ({ status: "success" })),
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

const allFeatures = {
  music: true, countdown: true, maps: true, story: true, gallery: true,
  dressCode: true, livestream: true, rsvp: true, wishes: true, gift: true,
  guestPersonalization: true,
};

function fixture(overrides = {}) {
  const long = "Perayaan keluarga besar dari dua kota dengan rangkaian kata yang sengaja sangat panjang untuk menguji pembungkusan konten pada layar kecil";
  return {
    id: "cobalt-quality", type: "wedding", slug: "cobalt-quality", title: "Nadira Maharani & Mahesa Wiratama",
    status: "published", eventDate: "2030-10-20", venueSummary: long,
    publishedAt: "2026-10-02T00:00:00Z", expiresAt: null,
    theme: {
      slug: "cobalt-riviera",
      settings: {
        personSocials: { person: { instagram: "@nadira" } },
        dressCode: { description: long, groups: [{ label: "Riviera formal", colors: ["#1646C8", "#FFF9EE"] }] },
      },
    },
    people: [{
      id: "person", role: "bride", fullName: `Nadira Maharani ${long}`, nickname: null,
      fatherName: `Bapak ${long}`, motherName: `Ibu ${long}`, photoUrl: "/person.jpg", bio: long, sortOrder: 0,
    }],
    events: [{
      id: "event", eventType: "ceremony", title: long, eventDate: "2030-10-20", startTime: "09:00", endTime: "11:00",
      venueName: long, address: long, mapsUrl: "https://maps.example.test/venue", livestreamUrl: "https://live.example.test/event", sortOrder: 0,
    }],
    stories: [{ id: "story", title: long, storyDate: "2028-01-02", yearLabel: "2028", description: long, imageUrl: "/story.jpg", sortOrder: 0 }],
    gallery: [{ id: "photo", imageUrl: "/gallery.jpg", caption: long, altText: long, aspectRatio: "portrait_4_5", sortOrder: 0 }],
    gifts: [{ id: "gift", providerType: "bank", providerName: long, accountNumber: "1234 5678 9012 3456", accountName: long, logoUrl: null, sortOrder: 0 }],
    wishes: [{ id: "wish", guestName: long, message: long, createdAt: "2026-10-02T00:00:00Z", isVisible: true, guestId: null }],
    content: { openingQuote: long, openingMessage: long, closingMessage: long },
    features: { ...allFeatures }, media: { coverImageUrl: "/cover.jpg", musicUrl: "/music.mp3" },
    ...overrides,
  };
}

const guest = {
  id: "guest", token: "guest-token", notes: null,
  displayName: "Keluarga Besar Bapak Alexander Konstantinopel dan Ibu Maharani dari Kepulauan Nusantara",
};

function render(invitation = fixture(), recipient = guest) {
  const { CobaltRiviera } = createLoader().load("themes/cobalt-riviera");
  return new JSDOM(renderToStaticMarkup(React.createElement(CobaltRiviera, { invitation, guest: recipient }))).window.document;
}

async function mount(options = {}, invitation = fixture(), recipient = guest) {
  const dom = new JSDOM("<div id='root'></div>", { pretendToBeVisual: true, url: "https://invitation.test/" });
  const keys = ["window", "document", "HTMLElement", "FormData", "IntersectionObserver", "requestAnimationFrame", "IS_REACT_ACT_ENVIRONMENT"];
  const previous = Object.fromEntries(keys.map((key) => [key, globalThis[key]]));
  Object.assign(globalThis, {
    window: dom.window, document: dom.window.document, HTMLElement: dom.window.HTMLElement, FormData: dom.window.FormData,
    IntersectionObserver: class { observe() {} disconnect() {} },
    requestAnimationFrame: dom.window.requestAnimationFrame.bind(dom.window), IS_REACT_ACT_ENVIRONMENT: true,
  });
  const { CobaltRiviera } = createLoader(options).load("themes/cobalt-riviera");
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

test("full, sparse, and disabled Cobalt states mount no duplicate or dead chapters", () => {
  const full = render();
  for (const id of ["cr-beranda", "cr-mempelai", "cr-acara", "cr-countdown", "cr-dress-code", "cr-cerita", "cr-galeri", "cr-livestream", "cr-rsvp", "cr-ucapan", "cr-kado", "cr-penutup"]) {
    assert.equal(full.querySelectorAll(`#${id}`).length, 1, `${id} mounts exactly once`);
  }

  const disabledFeatures = Object.fromEntries(Object.keys(allFeatures).map((key) => [key, false]));
  const sparse = render(fixture({
    people: [], events: [], stories: [], gallery: [], gifts: [], wishes: [],
    content: { openingQuote: null, openingMessage: null, closingMessage: null },
    features: disabledFeatures, media: { coverImageUrl: null, musicUrl: null },
    theme: { slug: "cobalt-riviera", settings: {} }, eventDate: null,
  }), null);
  for (const id of ["cr-mempelai", "cr-acara", "cr-countdown", "cr-dress-code", "cr-cerita", "cr-galeri", "cr-livestream", "cr-rsvp", "cr-ucapan", "cr-kado"]) {
    assert.equal(sparse.getElementById(id), null, `${id} is absent when unusable or disabled`);
  }
  assert.ok(sparse.getElementById("cr-beranda"));
  assert.ok(sparse.getElementById("cr-penutup"));
  assert.equal(sparse.querySelector("audio"), null);
});

test("malformed optional data keeps useful copy while unsafe actions and misleading values disappear", () => {
  const invitation = fixture({
    eventDate: "not-a-date",
    events: [{
      ...fixture().events[0], eventDate: "not-a-date", startTime: "99:99", endTime: "00:00",
      mapsUrl: "javascript:alert(1)", livestreamUrl: "data:text/html,unsafe",
    }],
    stories: [{ ...fixture().stories[0], storyDate: "not-a-date", yearLabel: null }],
    theme: { slug: "cobalt-riviera", settings: { dressCode: { description: "Tetap tampil", groups: [{ label: "Invalid", colors: ["not-a-color"] }] } } },
  });
  const document = render(invitation);
  assert.match(document.getElementById("cr-acara").textContent, /Perayaan keluarga besar/);
  assert.doesNotMatch(document.body.innerHTML, /href="(?:javascript|data):/i);
  assert.doesNotMatch(document.getElementById("cr-acara").textContent, /99:99|00:00 WIB/);
  assert.equal(document.querySelector("#cr-cerita time"), null);
  assert.equal(document.getElementById("cr-countdown"), null);
});

test("malformed media sources become stable accessible fallbacks instead of broken images", () => {
  const document = render(fixture({
    gallery: [
      { ...fixture().gallery[0], id: "blank", imageUrl: "   ", altText: "Foto kosong" },
      { ...fixture().gallery[0], id: "unsafe", imageUrl: "javascript:alert(1)", altText: "Foto tidak aman", sortOrder: 1 },
      { ...fixture().gallery[0], id: "protocol-relative", imageUrl: "//tracker.example.test/photo.jpg", altText: "Foto tanpa protokol", sortOrder: 2 },
    ],
  }));
  const gallery = document.getElementById("cr-galeri");
  assert.equal(gallery.querySelectorAll("img").length, 0);
  assert.deepEqual(
    [...gallery.querySelectorAll('[role="img"]')].map((node) => node.getAttribute("aria-label")),
    ["Foto kosong", "Foto tidak aman", "Foto tanpa protokol"],
  );
});

test("slow media, long content, and mobile-performance contracts remain stable", () => {
  const document = render();
  const css = document.querySelector("style").textContent;
  const images = [...document.querySelectorAll("img")];
  assert.equal(images.filter((image) => image.getAttribute("loading") === "eager").length, 1, "only the hero loads eagerly");
  assert.ok(images.filter((image) => image.getAttribute("loading") === "lazy").length >= 3, "below-fold media is lazy");
  for (const image of images) {
    assert.ok(image.getAttribute("sizes"), "responsive images declare sizes");
    assert.ok(image.closest(".cr-media")?.style.aspectRatio, "slow images keep reserved geometry");
  }
  assert.match(css, /overflow-x:\s*clip/);
  assert.match(css, /@media\s*\(max-width:\s*767px\)/);
  assert.match(css, /@media\s*\(min-width:\s*768px\)/);
  assert.match(css, /@media\s*\(min-width:\s*768px\)\s*and\s*\(max-width:\s*1199px\)/);
  assert.match(css, /@media\s*\(min-width:\s*768px\)\s*and\s*\(max-width:\s*1199px\)[\s\S]*\.cr-hero-layout\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/);
  assert.match(css, /@media\s*\(min-width:\s*768px\)\s*and\s*\(max-width:\s*1199px\)[\s\S]*\.cr-route-nav\s*\{[^}]*bottom:\s*0/);
  assert.match(css, /@media\s*\(min-width:\s*900px\)\s*and\s*\(max-width:\s*1199px\)\s*and\s*\(max-height:\s*850px\)[\s\S]*\.cr-hero-horizon\s*\{[^}]*min-height:\s*clamp\(18rem,\s*42svh,\s*22rem\)/);
  assert.match(css, /@media\s*\(min-width:\s*900px\)\s*and\s*\(max-width:\s*1199px\)\s*and\s*\(max-height:\s*850px\)[\s\S]*\.cr-hero-image\s*\{[^}]*aspect-ratio:\s*auto\s*!important;[^}]*height:\s*clamp\(18rem,\s*42svh,\s*22rem\)/);
  assert.match(css, /@media\s*\(min-width:\s*1200px\)[\s\S]*\.cr-section-inner\s*\{[^}]*padding-right:\s*max\([^;]*10rem\)/);
  assert.match(css, /@media\s*\(min-width:\s*1200px\)[\s\S]*\.cr-hero-layout\s*\{[^}]*padding-right:\s*8rem/);
  assert.match(css, /\.cr-theme :is\(a, button, input, textarea, select\)\s*\{[^}]*min-height:\s*48px/s);
  assert.match(css, /\.cr-cover\s*\{[^}]*overflow-y:\s*auto/s);
  assert.match(css, /\.cr-cover-guest-name\s*\{[^}]*overflow-wrap:\s*anywhere/s);
  assert.match(css, /\.cr-wish-entry[^}]*overflow-wrap:\s*anywhere/s);
  assert.match(css, /\.cr-gift-receipt[^}]*overflow-wrap:\s*anywhere/s);
  assert.match(document.getElementById("cr-ucapan").textContent, /Perayaan keluarga besar/);
});

test("reduced motion, keyboard focus handoff, and rejected audio keep the invitation operable", async () => {
  const calls = [];
  const view = await mount({ reducedMotion: true, trackOpen: async (...args) => calls.push(args) });
  try {
    const audio = view.document.querySelector("audio");
    let playAttempts = 0;
    audio.play = async () => { playAttempts += 1; throw new Error("autoplay denied"); };
    const open = view.document.querySelector(".cr-cover-open");
    assert.ok(open);
    await act(async () => open.click());
    await act(async () => Promise.resolve());
    assert.equal(view.document.querySelector(".cr-gate").dataset.reducedMotion, "true");
    assert.equal(view.document.getElementById("cr-content").hidden, false);
    assert.equal(view.document.activeElement, view.document.getElementById("cr-content"));
    assert.equal(playAttempts, 1);
    assert.deepEqual(calls, [["cobalt-quality", "guest-token"]]);
    assert.ok(view.document.querySelector('button[aria-label="Putar musik"]'));
    const css = view.document.querySelector("style").textContent;
    assert.match(css, /data-reduced-motion="true"/);
    assert.match(css, /prefers-reduced-motion:\s*reduce/);
    assert.match(css, /animation:\s*none\s*!important/);
    assert.match(css, /transition:\s*none\s*!important/);
    assert.match(css, /:focus-visible/);
  } finally {
    await view.cleanup();
  }
});

test("expired public routes stop before theme rendering or analytics", async () => {
  const path = resolve(sourceRoot, "app/(public)/[slug]/page.tsx");
  const output = ts.transpileModule(readFileSync(path, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  let themeCalls = 0;
  let analyticsCalls = 0;
  const exports = {};
  vm.runInNewContext(output, {
    exports, module: { exports },
    require(name) {
      if (name === "react/jsx-runtime") return nodeRequire(name);
      if (name === "next/navigation") return { notFound: () => { throw new Error("Unexpected notFound"); } };
      if (name === "next/server") return { after: () => { analyticsCalls += 1; } };
      if (name === "@/server/public/invitation-loader") return { getPublicInvitationBySlug: async () => ({ kind: "expired", displayName: "Nadira & Mahesa", eventDate: "2030-10-20" }) };
      if (name === "@/lib/analytics/session") return { getSessionId: async () => { analyticsCalls += 1; return "session"; } };
      if (name === "@/server/public/analytics") return { trackEvent: () => { analyticsCalls += 1; } };
      if (name === "@/lib/share/invitation-share") return { getInvitationShareData: () => { throw new Error("No share for expired invitation"); } };
      if (name === "@/themes/ThemeRenderer") return { ThemeRenderer: () => { themeCalls += 1; return null; } };
      if (name === "./ExpiredState") return createLoader().load("app/(public)/[slug]/ExpiredState");
      throw new Error(`Unexpected import ${name}`);
    },
  });
  const element = await exports.default({ params: Promise.resolve({ slug: "expired" }), searchParams: Promise.resolve({ guest: "token" }) });
  const html = renderToStaticMarkup(element);
  assert.match(html, /This invitation is no longer active\./);
  assert.equal(themeCalls, 0);
  assert.equal(analyticsCalls, 0);
});

function sourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? sourceFiles(path) : /\.tsx?$/.test(path) ? [path] : [];
  });
}

test("Cobalt stays inside theme boundaries and all four themes retain capability parity", () => {
  const source = sourceFiles(cobaltRoot).map((path) => readFileSync(path, "utf8")).join("\n");
  assert.doesNotMatch(source, /<img\b/);
  assert.doesNotMatch(source, /querySelector|supabase|createSupabase/i);

  const { themeRegistry } = createLoader().load("themes/registry");
  const slugs = ["nusantara-ivory", "terra-botanica", "midnight-atelier", "cobalt-riviera"];
  const baseline = JSON.stringify(themeRegistry[slugs[0]].sections);
  for (const slug of slugs) {
    assert.equal(JSON.stringify(themeRegistry[slug].sections), baseline, `${slug} keeps capability parity`);
  }
});
