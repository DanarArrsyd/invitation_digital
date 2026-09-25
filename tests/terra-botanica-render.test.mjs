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
const sourceRoot = fileURLToPath(new URL("../src/", import.meta.url));

// Execute real theme components and shared hooks. Only build-time font loading,
// the server analytics boundary, and browser motion preference are substituted.
function loadTheme({ reducedMotion = false, track = async () => {} } = {}) {
  const cache = new Map();
  function load(file) {
    const path = [file, `${file}.tsx`, `${file}.ts`, `${file}/index.ts`].find(existsSync);
    if (!path) return {};
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
      get IntersectionObserver() { return globalThis.IntersectionObserver; },
      get requestAnimationFrame() { return globalThis.requestAnimationFrame; },
      require(name) {
        if (name === "next/font/google") return {
          Fraunces: () => ({ variable: "tb-fraunces" }),
          Manrope: () => ({ variable: "tb-manrope" }),
        };
        if (name === "motion/react") return { useReducedMotion: () => reducedMotion };
        if (name === "@/app/(public)/[slug]/actions") return { trackCoverOpenedAction: track };
        if (name.startsWith("@/")) return load(resolve(sourceRoot, name.slice(2)));
        if (name.startsWith(".")) return load(resolve(dirname(path), name));
        return nodeRequire(name);
      },
    });
    return exports;
  }
  return { load: (path) => load(resolve(sourceRoot, path)) };
}

const features = {
  music: true, countdown: true, maps: true, story: true, gallery: true,
  dressCode: true, livestream: true, rsvp: true, wishes: true, gift: true,
  guestPersonalization: true,
};
const guest = { id: "guest", displayName: "Nama Tamu Yang Sangat Panjang", token: "guest-token", notes: null };
function fixture(overrides = {}) {
  return {
    id: "terra-test", type: "wedding", slug: "terra-test", title: "Alya & Bima", status: "published",
    eventDate: "2026-10-20", venueSummary: "Kebun Pengujian", publishedAt: "2026-09-01T00:00:00Z", expiresAt: null,
    theme: { slug: "terra-botanica", settings: { dressCode: { description: "Warna bumi", groups: [] } } },
    people: [
      { id: "a", role: "bride", fullName: "Alya", nickname: null, fatherName: null, motherName: null, photoUrl: null, bio: null, sortOrder: 0 },
      { id: "b", role: "groom", fullName: "Bima", nickname: null, fatherName: null, motherName: null, photoUrl: null, bio: null, sortOrder: 1 },
    ],
    events: [{ id: "event", eventType: "ceremony", title: "Pertemuan", eventDate: "2026-10-21", startTime: null, endTime: null, venueName: null, address: null, mapsUrl: "https://maps.google.com/", livestreamUrl: "https://example.test/live", sortOrder: 0 }],
    stories: [{ id: "story", title: "Pertemuan pertama", storyDate: null, yearLabel: null, description: "Cerita pengujian", imageUrl: null, sortOrder: 0 }],
    gallery: [{ id: "photo", imageUrl: "/test.jpg", caption: null, altText: "Foto pengujian", aspectRatio: "portrait_4_5", sortOrder: 0 }],
    gifts: [{ id: "gift", providerType: "bank", providerName: "Bank Pengujian", accountNumber: "123", accountName: "Alya", logoUrl: null, sortOrder: 0 }],
    wishes: [], content: { openingQuote: null, openingMessage: null, closingMessage: null },
    features: { ...features }, media: { coverImageUrl: "/test-cover.jpg", musicUrl: "/test-music.mp3" },
    ...overrides,
  };
}

function renderShell(invitation = fixture(), recipient = guest) {
  const { TerraBotanica } = loadTheme().load("themes/terra-botanica/index");
  assert.equal(typeof TerraBotanica, "function", "Terra must be directly importable");
  return renderToStaticMarkup(React.createElement(TerraBotanica, { invitation, guest: recipient }));
}

// Catches dropped view-model data, incomplete cover composition, and unsafe null output.
test("shell renders personalized journal cover from normalized data", () => {
  const html = renderShell();
  assert.match(html, /tb-theme/);
  assert.match(html, /The Wedding Journal/);
  assert.match(html, /Buka Undangan/);
  assert.match(html, /Kepada Yth\./);
  assert.match(html, /Nama Tamu Yang Sangat Panjang/);
  assert.match(html, /Alya/);
  assert.match(html, /Bima/);
  assert.match(html, /20 Oktober 2026/);
  assert.doesNotMatch(html, /undefined|null/);
});

// Catches accidental photo dependency, invented dates, and personalization leaks.
test("cover works without photo, date, people, or guest and respects disabled personalization", () => {
  const sparse = fixture({ people: [], events: [], stories: [], gallery: [], eventDate: null, media: { coverImageUrl: null, musicUrl: null } });
  const document = new JSDOM(renderShell(sparse, null)).window.document;
  assert.match(document.querySelector("h1").textContent, /Alya & Bima/);
  assert.match(document.body.textContent, /Bapak\/Ibu\/Saudara\/i/);
  assert.equal(document.querySelector("time"), null);
  assert.equal(document.querySelector("img"), null);
  assert.equal(document.querySelector("audio"), null);
  assert.equal(document.querySelector("button").textContent.trim(), "Buka Undangan");
  const privateHtml = renderShell(fixture({ features: { ...features, guestPersonalization: false } }));
  assert.doesNotMatch(privateHtml, /Nama Tamu Yang Sangat Panjang/);
});

test("cover falls back to the primary event date when invitation date is absent", () => {
  assert.match(renderShell(fixture({ eventDate: null })), /21 Oktober 2026/);
});

test("cover preserves the title and uses a general label for non-wedding invitations", () => {
  const html = renderShell(fixture({ type: "birthday", people: [], title: "Perayaan Alya" }));
  assert.match(html, /Perayaan Alya/);
  assert.doesNotMatch(html, /The Wedding Journal/);
});

// Catches feature leaks and candidates for absent optional content.
test("shell navigation candidates require enabled features and available content", () => {
  const { buildTerraNavItems } = loadTheme().load("themes/terra-botanica/TerraBotanica");
  assert.equal(typeof buildTerraNavItems, "function");
  assert.deepEqual(Array.from(buildTerraNavItems(fixture()), (item) => item.id), [
    "tb-beranda", "tb-mempelai", "tb-acara", "tb-cerita", "tb-galeri", "tb-rsvp", "tb-ucapan", "tb-kado",
  ]);
  const empty = fixture({ people: [], events: [], stories: [], gallery: [], gifts: [], features: { ...features, rsvp: false, wishes: false } });
  assert.deepEqual(Array.from(buildTerraNavItems(empty), (item) => item.id), ["tb-beranda"]);
  const disabled = fixture({ features: Object.fromEntries(Object.keys(features).map((key) => [key, false])) });
  assert.deepEqual(Array.from(buildTerraNavItems(disabled), (item) => item.id), ["tb-beranda", "tb-mempelai", "tb-acara"]);
});

async function mountShell(options = {}, invitation = fixture(), hydrate = false) {
  const dom = new JSDOM("<div id='root'></div>", { pretendToBeVisual: true, url: "https://invitation.test/" });
  const keys = ["window", "document", "HTMLElement", "IntersectionObserver", "requestAnimationFrame", "IS_REACT_ACT_ENVIRONMENT"];
  const previous = Object.fromEntries(keys.map((key) => [key, globalThis[key]]));
  Object.assign(globalThis, {
    window: dom.window, document: dom.window.document, HTMLElement: dom.window.HTMLElement,
    IntersectionObserver: class { observe() {} disconnect() {} },
    requestAnimationFrame: dom.window.requestAnimationFrame.bind(dom.window), IS_REACT_ACT_ENVIRONMENT: true,
  });
  const { TerraBotanica } = loadTheme(options).load("themes/terra-botanica/index");
  assert.equal(typeof TerraBotanica, "function");
  const container = document.getElementById("root");
  let root;
  if (hydrate) {
    container.innerHTML = renderShell(invitation);
    await act(async () => { root = hydrateRoot(container, React.createElement(TerraBotanica, { invitation, guest })); });
  } else {
    root = createRoot(container);
    await act(async () => root.render(React.createElement(TerraBotanica, { invitation, guest })));
  }
  return {
    document: dom.window.document,
    async cleanup() {
      await act(async () => root.unmount());
      Object.assign(globalThis, previous);
      dom.window.close();
    },
  };
}

// Catches a presentational open button disconnected from shared behavior.
test("cover open reveals and focuses content, tracks opening, and keeps rejected audio recoverable", async () => {
  const calls = [];
  const view = await mountShell({ track: async (...args) => calls.push(args) });
  try {
    const { document } = view;
    const audio = document.querySelector("audio");
    let attempts = 0;
    audio.play = async () => { attempts++; throw new Error("autoplay denied"); };
    const content = document.getElementById("tb-content");
    assert.equal(content.hidden, true);
    assert.equal(attempts, 0);
    assert.equal(document.querySelector("nav"), null);
    // jsdom has no layout; give scrollspy the section geometry a browser supplies.
    for (const [index, section] of [...content.querySelectorAll("section")].entries()) {
      section.getBoundingClientRect = () => ({ top: index * 1000 });
    }
    await act(async () => document.querySelector("button").click());
    assert.equal(content.hidden, false);
    assert.equal(document.activeElement, content);
    assert.deepEqual(calls, [["terra-test", "guest-token"]]);
    assert.equal(attempts, 1);
    assert.equal(document.getElementById("tb-cover").getAttribute("aria-hidden"), "true");
    const play = document.querySelector('button[aria-label="Putar musik"]');
    assert.ok(play);
    audio.play = async () => { attempts++; };
    await act(async () => play.click());
    assert.ok(document.querySelector('button[aria-label="Jeda musik"]'));
    assert.equal(attempts, 2);
    for (const link of document.querySelectorAll("nav a")) {
      assert.ok(document.querySelector(link.getAttribute("href")), "navigation must only target mounted sections");
    }
    assert.equal(document.querySelector("nav a").getAttribute("aria-current"), "location");
  } finally { await view.cleanup(); }
});

test("cover opens with reduced motion and disabled music without an audio control", async () => {
  const view = await mountShell({ reducedMotion: true }, fixture({ features: { ...features, music: false } }));
  try {
    await act(async () => view.document.querySelector("button").click());
    assert.equal(view.document.getElementById("tb-content").hidden, false);
    assert.equal(view.document.querySelector("audio"), null);
    assert.equal(view.document.querySelector('[aria-label="Putar musik"]'), null);
    assert.equal(view.document.getElementById("tb-cover").hasAttribute("inert"), true);
  } finally { await view.cleanup(); }
});

test("cover hydrates without mismatch when the browser prefers reduced motion", async () => {
  const errors = [];
  const originalError = console.error;
  console.error = (...args) => errors.push(args);
  let view;
  try {
    view = await mountShell({ reducedMotion: true }, fixture(), true);
    assert.equal(errors.length, 0, `server and initial browser markup must agree regardless of motion preference: ${errors.map(args => args.map(String).join(" ")).join(" | ")}`);
  } finally {
    if (view) await view.cleanup();
    console.error = originalError;
  }
});

test("shell section primitives preserve an accessible heading and visible long content", () => {
  const loader = loadTheme();
  const { Section } = loader.load("themes/terra-botanica/components/Section");
  const { SectionHeading } = loader.load("themes/terra-botanica/components/SectionHeading");
  const { Reveal } = loader.load("themes/terra-botanica/components/Reveal");
  assert.equal(typeof Section, "function");
  const html = renderToStaticMarkup(React.createElement(Section, { id: "tb-test", labelledBy: "tb-test-heading", tone: "moss" },
    React.createElement(SectionHeading, { id: "tb-test-heading", title: "Pertemuan keluarga" }),
    React.createElement(Reveal, null, "Nama Keluarga Yang Sangat Panjang"),
  ));
  const document = new JSDOM(html).window.document;
  assert.equal(document.querySelector("section").getAttribute("aria-labelledby"), "tb-test-heading");
  assert.equal(document.querySelector("h2").textContent, "Pertemuan keluarga");
  assert.match(document.body.textContent, /Nama Keluarga Yang Sangat Panjang/);
  assert.equal(document.querySelector("[hidden]"), null);
});

function narrativeFixture(overrides = {}) {
  const base = fixture();
  return fixture({
    theme: { ...base.theme, settings: { personSocials: { a: { instagram: "https://www.instagram.com/nara/" }, b: { instagram: "javascript:alert(1)" } } } },
    people: base.people.map((person, index) => ({ ...person,
      fullName: index ? "Bima Pradipta" : "Nara Kusuma", nickname: index ? "Bima" : "Nara",
      fatherName: `Bapak Nama Ayah Yang Sangat Panjang ${index}`,
      motherName: `Ibu Nama Ibu Yang Sangat Panjang ${index}`,
      photoUrl: `/person-${index}.jpg`, bio: `Keterangan mempelai ${index}`,
    })),
    stories: [{ id: "text-story", title: "Pertemuan di taman", yearLabel: "2021", storyDate: null, description: "Kami berjumpa di antara pohon-pohon.", imageUrl: null, sortOrder: 0 }],
    gallery: [
      { id: "first", imageUrl: "/gallery-1.jpg", caption: "Sore di kebun", altText: "Nara dan Bima berjalan di kebun", aspectRatio: "landscape_16_9", sortOrder: 0 },
      { id: "second", imageUrl: "/gallery-2.jpg", caption: "Di bawah pohon", altText: null, aspectRatio: "portrait_3_4", sortOrder: 1 },
      { id: "third", imageUrl: "/gallery-3.jpg", caption: null, altText: null, aspectRatio: "square_1_1", sortOrder: 2 },
    ],
    content: { openingQuote: "Bertumbuh bersama, setiap hari.", openingMessage: "Kami mengundang Anda untuk berbagi kebahagiaan.", closingMessage: "Terima kasih telah menjadi bagian cerita kami." },
    ...overrides,
  });
}

// Catches missing/duplicated sections, dropped long family data, and unsafe social URLs.
test("narrative renders one accessible chapter per section with parents and safe Instagram", () => {
  const document = new JSDOM(renderShell(narrativeFixture())).window.document;
  for (const id of ["tb-beranda", "tb-mempelai", "tb-cerita", "tb-galeri", "tb-penutup"]) {
    assert.equal(document.querySelectorAll(`#${id}`).length, 1, id);
    const section = document.getElementById(id);
    assert.ok(document.getElementById(section.getAttribute("aria-labelledby")), `${id} has a heading`);
  }
  assert.match(document.getElementById("tb-beranda").textContent, /Kami mengundang Anda/);
  assert.equal(document.querySelector("blockquote").textContent.trim(), "Bertumbuh bersama, setiap hari.");
  const couple = document.getElementById("tb-mempelai");
  assert.match(couple.textContent, /Nara Kusuma/);
  assert.match(couple.textContent, /Bima Pradipta/);
  for (const person of narrativeFixture().people) {
    assert.ok(couple.textContent.includes(person.fatherName));
    assert.ok(couple.textContent.includes(person.motherName));
    assert.ok(couple.textContent.includes(person.bio));
  }
  const instagram = couple.querySelector("a");
  assert.equal(instagram.href, "https://www.instagram.com/nara/");
  assert.equal(instagram.target, "_blank");
  assert.match(instagram.rel, /noopener/);
  assert.match(instagram.getAttribute("aria-label"), /Nara Kusuma/);
  assert.equal(couple.querySelectorAll("a").length, 1);
  assert.match(document.getElementById("tb-penutup").textContent, /Terima kasih telah menjadi bagian cerita kami/);
});

test("sparse narrative omits absent or disabled chapters and supports text-only stories", () => {
  const textOnly = new JSDOM(renderShell(narrativeFixture())).window.document.getElementById("tb-cerita");
  assert.ok(textOnly, "the supplied story must render");
  assert.match(textOnly.textContent, /2021/);
  assert.match(textOnly.textContent, /Kami berjumpa di antara pohon-pohon/);
  assert.equal(textOnly.querySelector("img"), null);
  const sparse = new JSDOM(renderShell(narrativeFixture({
    people: [], stories: [], gallery: [], content: { openingQuote: null, openingMessage: null, closingMessage: null },
    media: { coverImageUrl: null, musicUrl: null },
  }))).window.document;
  for (const id of ["tb-mempelai", "tb-cerita", "tb-galeri", "tb-kutipan"]) assert.equal(sparse.getElementById(id), null);
  assert.equal(sparse.querySelector("img"), null);
  assert.match(sparse.getElementById("tb-penutup").className, /tb-surface-moss/);
  const disabled = new JSDOM(renderShell(narrativeFixture({ features: { ...features, story: false, gallery: false } }))).window.document;
  assert.equal(disabled.getElementById("tb-cerita"), null);
  assert.equal(disabled.getElementById("tb-galeri"), null);
});

// Catches accidental ordering, truncation, orphan final tiles, or lost saved crop ratios.
test("gallery preserves normalized order, captions, crops and balanced rows for 1 through 40 photos", () => {
  for (let length = 1; length <= 40; length++) {
    const gallery = Array.from({ length }, (_, i) => ({ ...narrativeFixture().gallery[i % 3], id: `image-${i}`, sortOrder: length - i, caption: `Caption ${i}` }));
    const document = new JSDOM(renderShell(narrativeFixture({ gallery }))).window.document;
    const items = [...document.querySelectorAll("#tb-galeri [data-gallery-item]")];
    assert.equal(items.length, length);
    let rowSpans = 0;
    for (const [index, item] of items.entries()) {
      assert.equal(item.getAttribute("data-gallery-item"), `image-${index}`);
      assert.equal(item.querySelector("figcaption").textContent, `Caption ${index}`);
      assert.equal(item.querySelector(".tb-media").style.aspectRatio, ["16 / 9", "3 / 4", "1 / 1"][index % 3]);
      const span = Number(item.getAttribute("data-gallery-span"));
      assert.ok([1, 2].includes(span));
      rowSpans += span;
      assert.ok(rowSpans <= 2, "items must not leave an unfilled grid row");
      if (rowSpans === 2) rowSpans = 0;
    }
    assert.equal(rowSpans, 0, `complete final row with ${length} photos`);
  }
  const empty = renderShell(narrativeFixture({ gallery: [] }));
  assert.doesNotMatch(empty, /id="tb-galeri"/);
});

test("narrative images have descriptive alternatives, responsive sizes and stable lazy frames", () => {
  const invitation = narrativeFixture();
  invitation.stories[0].imageUrl = "/story.jpg";
  const document = new JSDOM(renderShell(invitation)).window.document;
  const images = [...document.querySelectorAll("img")];
  assert.equal(images.length, 8);
  for (const image of images) {
    assert.ok(image.alt.trim().length > 5, "useful image alternative");
    assert.ok(image.sizes, "explicit responsive sizes");
    assert.ok(image.srcset, "local photos use responsive delivery");
    assert.ok(image.closest(".tb-media").style.aspectRatio, "reserved frame before loading");
    assert.equal(image.getAttribute("loading"), image.closest("#tb-beranda") ? "eager" : "lazy");
  }
  assert.equal(document.querySelector("#tb-galeri img").alt, "Nara dan Bima berjalan di kebun");
  assert.match(images.find(image => image.closest('[data-gallery-item="third"]')).alt, /Nara.*Bima.*3/);
  assert.match(document.querySelector("#tb-cerita img").alt, /Pertemuan di taman/);
});

test("sparse closing chooses the last gallery image then cover and renders without either", () => {
  for (const [overrides, expected] of [
    [{}, "gallery-3.jpg"],
    [{ gallery: [] }, "test-cover.jpg"],
    [{ gallery: [], media: { coverImageUrl: null, musicUrl: null } }, null],
  ]) {
    const closing = new JSDOM(renderShell(narrativeFixture(overrides))).window.document.getElementById("tb-penutup");
    assert.ok(closing);
    const image = closing.querySelector("img");
    if (expected) assert.ok(decodeURIComponent(image.getAttribute("src")).includes(expected));
    else assert.equal(image, null);
    assert.match(closing.textContent, /Nara.*Bima/);
  }
});

test("narrative image failure keeps its frame and readable alternative", async () => {
  const view = await mountShell({}, narrativeFixture());
  try {
    const image = view.document.querySelector("#tb-beranda img");
    assert.ok(image);
    const frame = image.closest(".tb-media");
    const ratio = frame.style.aspectRatio;
    const alt = image.alt;
    await act(async () => image.dispatchEvent(new view.document.defaultView.Event("error")));
    assert.equal(frame.querySelector("img"), null);
    assert.equal(frame.style.aspectRatio, ratio);
    assert.equal(frame.querySelector('[role="img"]').getAttribute("aria-label"), alt);
    assert.match(frame.textContent, /Foto tidak dapat dimuat/);
  } finally { await view.cleanup(); }
});

function gatheringFixture(count = 1, overrides = {}) {
  const base = fixture();
  return fixture({
    events: Array.from({ length: count }, (_, index) => ({ ...base.events[0],
      id: `gathering-${index}`, title: `Pertemuan keluarga ${index + 1}`,
      eventDate: `2030-10-${String(20 + index).padStart(2, "0")}`, startTime: "09:30:00", endTime: "11:00:00",
      venueName: "Kebun Pertemuan Keluarga di Tengah Pepohonan yang Teduh ".repeat(3),
      address: "Jalan Pengujian dengan Alamat Sangat Panjang Blok Seratus Dua Puluh ".repeat(4),
    })),
    ...overrides,
  });
}

// Catches lost event rows, clipped content in markup, wrong calendar input, and duplicate targets.
test("events render one and five individually actionable entries with long venues and addresses", () => {
  for (const count of [1, 5]) {
    const invitation = gatheringFixture(count);
    const document = new JSDOM(renderShell(invitation)).window.document;
    const section = document.getElementById("tb-acara");
    assert.ok(section, "event chapter renders");
    assert.match(section.textContent, /The Gathering/);
    const rows = [...section.querySelectorAll("[data-event-item]")];
    assert.equal(rows.length, count);
    for (const [index, row] of rows.entries()) {
      const event = invitation.events[index];
      assert.ok(row.textContent.includes(event.title));
      assert.ok(row.textContent.includes(event.venueName));
      assert.ok(row.textContent.includes(event.address));
      assert.match(row.textContent, /09:30.*11:00.*WIB/);
      assert.equal(row.querySelector("time").dateTime, event.eventDate);
      assert.ok(row.querySelector('a[href="https://maps.google.com/"]'));
      const calendar = new URL(row.querySelector('a[href^="https://calendar.google.com/"]').href);
      assert.equal(calendar.searchParams.get("dates"), `203010${20 + index}T023000Z/203010${20 + index}T040000Z`);
      assert.ok(calendar.searchParams.get("text").includes(event.title));
      assert.ok(calendar.searchParams.get("location").includes(event.venueName));
    }
    const ids = [...document.querySelectorAll("[id]")].map(element => element.id);
    assert.equal(new Set(ids).size, ids.length, "all addressable targets are unique");
    for (const link of section.querySelectorAll('a[target="_blank"]')) {
      assert.match(link.rel, /noopener/);
      assert.match(link.rel, /noreferrer/);
    }
  }
});

test("events omit missing or unsafe map actions and respect disabled maps", () => {
  for (const mapsUrl of [null, "", " ", "not-a-url", "javascript:alert(1)", "data:text/html,hello", "/relative"]) {
    const invitation = gatheringFixture();
    invitation.events[0].mapsUrl = mapsUrl;
    const document = new JSDOM(renderShell(invitation)).window.document;
    assert.ok(document.getElementById("tb-acara"), "event details survive missing maps");
    assert.equal([...document.querySelectorAll("#tb-acara a")].some(link => /maps/i.test(link.textContent)), false);
    assert.equal(document.querySelector('a:not([href]), a[href=""], a[href="#"]'), null);
  }
  const document = new JSDOM(renderShell(gatheringFixture(1, { features: { ...features, maps: false } }))).window.document;
  assert.equal(document.querySelector('a[href="https://maps.google.com/"]'), null);
  assert.ok(document.querySelector('a[href^="https://calendar.google.com/"]'), "calendar remains independent of maps");
});

test("events preserve partial details but omit invalid calendar dates and an empty chapter", () => {
  const invitation = gatheringFixture();
  invitation.events[0].eventDate = "invalid";
  const document = new JSDOM(renderShell(invitation)).window.document;
  assert.ok(document.getElementById("tb-acara"));
  assert.ok(document.body.textContent.includes(invitation.events[0].venueName));
  assert.equal(document.querySelector('#tb-acara a[href^="https://calendar.google.com/"]'), null);
  assert.equal(document.querySelector("#tb-acara time"), null);
  assert.equal(new JSDOM(renderShell(fixture({ events: [], eventDate: null }))).window.document.getElementById("tb-acara"), null);
});

test("event actions identify their event and malformed times do not create calendar links", () => {
  const document = new JSDOM(renderShell(gatheringFixture(5))).window.document;
  for (const [index, row] of [...document.querySelectorAll("[data-event-item]")].entries()) {
    const title = `Pertemuan keluarga ${index + 1}`;
    for (const action of row.querySelectorAll("a, button")) {
      assert.match(action.getAttribute("aria-label"), new RegExp(title));
    }
  }
  const invalid = gatheringFixture();
  invalid.events[0].startTime = "not-a-time";
  const invalidDocument = new JSDOM(renderShell(invalid)).window.document;
  assert.equal(invalidDocument.querySelector('#tb-acara a[href^="https://calendar.google.com/"]'), null);
  assert.equal(invalidDocument.querySelector("#tb-acara button"), null);
});

test("countdown renders a valid target and omits disabled, missing or invalid targets", () => {
  const present = new JSDOM(renderShell(gatheringFixture())).window.document;
  assert.ok(present.getElementById("tb-countdown"));
  for (const unit of ["Hari", "Jam", "Menit", "Detik"]) assert.ok(present.getElementById("tb-countdown").textContent.includes(unit));
  for (const invitation of [
    gatheringFixture(1, { features: { ...features, countdown: false } }),
    gatheringFixture(0, { eventDate: null }),
    gatheringFixture(0, { eventDate: "invalid" }),
  ]) {
    const document = new JSDOM(renderShell(invitation)).window.document;
    assert.equal(document.getElementById("tb-countdown"), null);
  }
  const withoutCountdown = new JSDOM(renderShell(gatheringFixture(1, { features: { ...features, countdown: false } }))).window.document;
  assert.ok(withoutCountdown.querySelector('#tb-acara a[href^="https://calendar.google.com/"]'), "calendar works when countdown is off");
});

test("countdown reaches zero without negative values and stops its interval", async (t) => {
  const target = new Date("2030-10-20T09:30:00").getTime();
  t.mock.timers.enable({ apis: ["Date", "setInterval"], now: target - 2000 });
  const scheduled = t.mock.method(globalThis, "setInterval");
  const cleared = t.mock.method(globalThis, "clearInterval");
  const view = await mountShell({}, gatheringFixture());
  try {
    const section = view.document.getElementById("tb-countdown");
    assert.ok(section);
    assert.equal(section.querySelector('dd[data-unit="seconds"]').textContent, "02");
    assert.equal(scheduled.mock.callCount(), 1);
    await act(async () => t.mock.timers.tick(2000));
    assert.deepEqual([...section.querySelectorAll("dd")].map(node => node.textContent), ["00", "00", "00", "00"]);
    assert.equal(cleared.mock.callCount(), 1, "interval is cleared at zero");
    await act(async () => t.mock.timers.tick(60000));
    assert.equal(scheduled.mock.callCount(), 1);
    assert.equal(cleared.mock.callCount(), 1);
  } finally { await view.cleanup(); }
});

test("countdown pairs each visible value with its unit label", () => {
  const section = new JSDOM(renderShell(gatheringFixture())).window.document.getElementById("tb-countdown");
  const units = [...section.querySelectorAll("dl > div")];
  assert.deepEqual(units.map(unit => [...unit.children].map(child => child.tagName)), [
    ["DT", "DD"], ["DT", "DD"], ["DT", "DD"], ["DT", "DD"],
  ]);
  assert.deepEqual(units.map(unit => unit.querySelector("dt").textContent), ["Hari", "Jam", "Menit", "Detik"]);
});

test("countdown cleans an active timer on unmount and skips timers without a usable target", async (t) => {
  t.mock.timers.enable({ apis: ["Date", "setInterval"], now: new Date("2030-10-19T09:30:00").getTime() });
  const scheduled = t.mock.method(globalThis, "setInterval");
  const cleared = t.mock.method(globalThis, "clearInterval");
  const view = await mountShell({}, gatheringFixture());
  assert.ok(view.document.getElementById("tb-countdown"));
  assert.equal(scheduled.mock.callCount(), 1);
  const countdownTimer = scheduled.mock.calls[0].result;
  await view.cleanup();
  assert.ok(cleared.mock.calls.some(call => call.arguments[0] === countdownTimer), "the countdown timer is cleared on unmount");
  for (const invitation of [gatheringFixture(0, { eventDate: null }), gatheringFixture(0, { eventDate: "bad" }), gatheringFixture(1, { features: { ...features, countdown: false } })]) {
    const empty = await mountShell({}, invitation);
    await empty.cleanup();
  }
  assert.equal(scheduled.mock.callCount(), 1);
});

test("dress code retains visible swatch labels and omits absent or disabled content", () => {
  const invitation = gatheringFixture(1, { theme: { slug: "terra-botanica", settings: { dressCode: {
    description: "Busana nyaman untuk kebun", groups: [{ label: "Keluarga", colors: ["#53634E", "#B6634B"] }],
  } } } });
  const document = new JSDOM(renderShell(invitation)).window.document;
  const section = document.getElementById("tb-dress-code");
  assert.ok(section);
  assert.match(section.textContent, /Busana nyaman untuk kebun/);
  assert.match(section.textContent, /Keluarga/);
  for (const label of ["#53634E", "#B6634B"]) {
    const swatch = [...section.querySelectorAll("li")].find(node => node.textContent.includes(label));
    assert.ok(swatch, `${label} is a visible label`);
    assert.equal(swatch.querySelector('[aria-hidden="true"]').style.backgroundColor.length > 0, true);
  }
  for (const input of [
    gatheringFixture(1, { theme: { slug: "terra-botanica", settings: {} } }),
    gatheringFixture(1, { theme: { slug: "terra-botanica", settings: { dressCode: { description: " ", groups: [] } } } }),
    { ...invitation, features: { ...features, dressCode: false } },
  ]) assert.equal(new JSDOM(renderShell(input)).window.document.getElementById("tb-dress-code"), null);
});

test("livestream renders usable event links only while enabled", () => {
  const invitation = gatheringFixture(5);
  invitation.events[1].livestreamUrl = null;
  invitation.events[2].livestreamUrl = "javascript:alert(1)";
  invitation.events[3].livestreamUrl = "not-a-url";
  invitation.events[4].livestreamUrl = "https://example.test/second";
  const document = new JSDOM(renderShell(invitation)).window.document;
  const section = document.getElementById("tb-livestream");
  assert.ok(section);
  const links = [...section.querySelectorAll("a")];
  assert.equal(links.length, 2);
  assert.deepEqual(links.map(link => link.href), ["https://example.test/live", "https://example.test/second"]);
  for (const link of links) {
    assert.equal(link.target, "_blank");
    assert.match(link.rel, /noopener/);
    assert.match(link.rel, /noreferrer/);
    assert.match(link.textContent, /Pertemuan keluarga/);
  }
  for (const livestreamUrl of [null, "", "bad", "javascript:alert(1)", "/relative"]) {
    const input = gatheringFixture();
    input.events[0].livestreamUrl = livestreamUrl;
    assert.equal(new JSDOM(renderShell(input)).window.document.getElementById("tb-livestream"), null);
  }
  assert.equal(new JSDOM(renderShell({ ...invitation, features: { ...features, livestream: false } })).window.document.getElementById("tb-livestream"), null);
});

test("event navigation destinations exist once and empty optional chapters leave no anchors", async () => {
  const view = await mountShell({}, gatheringFixture(5, { features: { ...features, music: false } }));
  try {
    await act(async () => view.document.querySelector("button").click());
    assert.ok(view.document.querySelector('nav a[href="#tb-acara"]'));
    for (const link of view.document.querySelectorAll('a[href^="#"]')) assert.equal(view.document.querySelectorAll(link.getAttribute("href")).length, 1);
    for (const id of ["tb-acara", "tb-countdown", "tb-dress-code", "tb-livestream"]) {
      const section = view.document.getElementById(id);
      assert.ok(section);
      assert.ok(view.document.getElementById(section.getAttribute("aria-labelledby")));
    }
  } finally { await view.cleanup(); }
});

test("event calendar download uses shared WIB times and a fresh UI timestamp", async (t) => {
  t.mock.timers.enable({ apis: ["Date"], now: Date.parse("2029-09-12T00:00:00Z") });
  const view = await mountShell({}, gatheringFixture());
  try {
    let downloaded;
    const create = t.mock.method(URL, "createObjectURL", blob => { downloaded = blob; return "blob:test-calendar"; });
    const revoke = t.mock.method(URL, "revokeObjectURL", () => {});
    const click = t.mock.method(view.document.defaultView.HTMLAnchorElement.prototype, "click", function () { assert.match(this.download, /\.ics$/); });
    const button = [...view.document.querySelectorAll("#tb-acara button")].find(node => /\.ics/.test(node.textContent));
    assert.ok(button);
    await act(async () => button.click());
    assert.equal(create.mock.callCount(), 1);
    assert.equal(click.mock.callCount(), 1);
    assert.equal(revoke.mock.calls[0].arguments[0], "blob:test-calendar");
    const text = await downloaded.text();
    assert.match(text, /DTSTAMP:20290912T000000Z/);
    assert.match(text, /DTSTART:20301020T023000Z/);
    assert.match(text, /DTEND:20301020T040000Z/);
    assert.match(text, /UID:terra-test-gathering-0/);
    assert.match(text, /SUMMARY:Pertemuan keluarga 1/);
  } finally { await view.cleanup(); }
});
