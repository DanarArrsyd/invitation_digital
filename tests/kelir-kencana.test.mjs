import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import vm from "node:vm";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { JSDOM } from "jsdom";
import ts from "typescript";

// Kelir Kencana (docs/superpowers/specs/2026-10-05-kelir-kencana-theme-design.md):
// full renders through the real theme modules.

const nodeRequire = createRequire(import.meta.url);
const sourceRoot = fileURLToPath(new URL("../src/", import.meta.url));
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

function loadSource(entry) {
  const cache = new Map();
  function load(file) {
    const path = [file, `${file}.tsx`, `${file}.ts`, `${file}/index.ts`].find((candidate) => existsSync(candidate) && statSync(candidate).isFile());
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
      require(name) {
        if (name === "next/script") return { __esModule: true, default: () => null };
        if (name === "next/image") return { __esModule: true, default: (imageProps) => {
          const props = { ...imageProps };
          delete props.fill;
          delete props.fetchPriority;
          delete props.unoptimized;
          return React.createElement("img", props);
        } };
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
  return load(resolve(sourceRoot, entry));
}

const theme = loadSource("themes/kelir-kencana/index");
const KelirKencana = theme.KelirKencana;
const { buildKelirRouteItems } = loadSource("themes/kelir-kencana/KelirKencana");

const ALL_STOPS = ["hero", "couple", "events", "story", "gallery", "livestream", "rsvp", "wishes", "gift"];
const allFeatures = Object.fromEntries([
  "music", "countdown", "maps", "story", "gallery", "dressCode", "livestream", "rsvp", "wishes", "gift", "guestPersonalization",
].map((key) => [key, true]));

function fixture(overrides = {}) {
  return {
    id: "kk", type: "wedding", slug: "ratri-galih", title: "Ratri & Galih", status: "published",
    eventDate: "2030-10-16", venueSummary: "Pendopo, Surakarta", publishedAt: "2030-01-01T00:00:00Z", expiresAt: null,
    timeZone: "Asia/Jakarta",
    navSections: ALL_STOPS,
    theme: { slug: "kelir-kencana", settings: { dressCode: { description: "Batik sogan", groups: [{ label: "Tamu", colors: ["#3D2314"] }] } } },
    people: [
      { id: "b", role: "bride", fullName: "Ratri Wulandari", nickname: "Ratri", fatherName: "Bapak Harjono", motherName: "Ibu Sulastri", photoUrl: "/b.jpg", bio: null, sortOrder: 0 },
      { id: "g", role: "groom", fullName: "Galih Satriya", nickname: "Galih", fatherName: "Bapak Darmaji", motherName: null, photoUrl: null, bio: null, sortOrder: 1 },
    ],
    events: [{ id: "e1", eventType: "Sakral", title: "Akad Nikah", eventDate: "2030-10-16", startTime: "08:00:00", endTime: "10:00:00",
      venueName: "Masjid", address: "Jl. Contoh 1", mapsUrl: "https://maps.google.com/?q=x", livestreamUrl: "https://youtube.com/live", sortOrder: 0 }],
    stories: [{ id: "s1", title: "Bertemu", description: "Di kampus", storyDate: null, yearLabel: "2019", imageUrl: null, sortOrder: 0 }],
    gallery: [
      { id: "p1", imageUrl: "/1.jpg", caption: null, altText: null, aspectRatio: "portrait_3_4", sortOrder: 0 },
      { id: "p2", imageUrl: "/2.jpg", caption: null, altText: null, aspectRatio: "square_1_1", sortOrder: 1 },
    ],
    gifts: [{ id: "k1", providerType: "bank", providerName: "BCA", accountNumber: "123", accountName: "Ratri", logoUrl: null, sortOrder: 0 }],
    wishes: [{ id: "w1", guestName: "Tamu", message: "Selamat", createdAt: "2030-01-02T00:00:00Z" }],
    content: { openingQuote: "Kutipan pembuka", openingMessage: "Dengan hormat", closingMessage: null },
    features: allFeatures,
    media: { coverImageUrl: "/cover.jpg", musicUrl: null },
    ...overrides,
  };
}

function render(invitation, guest = null) {
  const html = renderToStaticMarkup(React.createElement(KelirKencana, { invitation, guest }));
  return new JSDOM(html).window.document;
}

test("Kelir renders every section under the canonical kk- anchors", () => {
  const document = render(fixture());
  for (const id of [
    "kk-cover", "kk-beranda", "kk-quote", "kk-mempelai", "kk-acara", "kk-countdown", "kk-dress-code",
    "kk-cerita", "kk-galeri", "kk-livestream", "kk-rsvp", "kk-ucapan", "kk-kado", "kk-penutup",
  ]) {
    assert.ok(document.getElementById(id), id);
  }
  assert.equal(document.querySelector("[data-theme]").getAttribute("data-theme"), "kelir-kencana");
});

test("the cover names the guest and the event type, and has no photo", () => {
  const document = render(fixture(), { token: "t", displayName: "Bapak Hendra" });
  const cover = document.getElementById("kk-cover");
  assert.match(cover.textContent, /Pagelaran Pernikahan/);
  assert.match(cover.textContent, /Bapak Hendra/);
  assert.equal(cover.querySelector("img"), null);
  assert.ok(cover.querySelector("button.kk-cover-open"));
  assert.equal(cover.querySelectorAll(".kk-figure-shadow").length, 2, "two shadow figures flank the gunungan");

  const aqiqah = render(fixture({ type: "aqiqah" })).getElementById("kk-cover");
  assert.match(aqiqah.textContent, /Pagelaran Tasyakuran Aqiqah/);
  assert.doesNotMatch(aqiqah.textContent, /Pernikahan/);
  assert.match(render(fixture()).getElementById("kk-cover").textContent, /Bapak\/Ibu\/Saudara\/i/, "no guest falls back to a neutral salutation");
});

test("Jejer pairs the putri with the bride and the satria with the groom, facing the portrait", () => {
  const people = render(fixture()).querySelectorAll("#kk-mempelai .kk-person");
  assert.equal(people.length, 2);
  assert.equal(people[0].querySelector(".kk-figure").getAttribute("data-figure"), "putri");
  assert.equal(people[0].getAttribute("data-figure-side"), "right");
  assert.match(people[0].textContent, /Mempelai Wanita/);
  assert.equal(people[1].querySelector(".kk-figure").getAttribute("data-figure"), "satria");
  assert.equal(people[1].getAttribute("data-figure-side"), "left");
  assert.match(people[1].textContent, /Mempelai Pria/);
  assert.ok(people[1].querySelector(".kk-person-monogram"), "a missing portrait keeps the composition");

  const birthday = render(fixture({ type: "birthday", people: [
    { id: "c", role: "celebrant", fullName: "Sari", nickname: null, fatherName: null, motherName: null, photoUrl: null, bio: null, sortOrder: 0 },
  ] })).getElementById("kk-mempelai");
  assert.equal(birthday.querySelector(".kk-figure"), null, "figures sit beside a couple only");
  assert.doesNotMatch(birthday.textContent, /Mempelai/);
});

test("the bottom bar follows the package tiers without ranking inside the theme", () => {
  const ids = (navSections) => [...buildKelirRouteItems(fixture({ navSections }))].map((item) => item.id);
  assert.deepEqual(ids(["hero", "couple", "events", "rsvp", "gift"]), ["kk-beranda", "kk-mempelai", "kk-acara", "kk-rsvp", "kk-kado"]);
  assert.equal(ids(["hero", "couple", "events", "gallery", "rsvp", "wishes", "gift"]).length, 7);
  assert.deepEqual(ids(ALL_STOPS), [
    "kk-beranda", "kk-mempelai", "kk-acara", "kk-cerita", "kk-galeri", "kk-livestream", "kk-rsvp", "kk-ucapan", "kk-kado",
  ]);
  const noStream = fixture({ events: fixture().events.map((event) => ({ ...event, livestreamUrl: null })) });
  assert.ok(!buildKelirRouteItems(noStream).some((item) => item.id === "kk-livestream"), "Streaming needs a usable link");
});

test("missing optional content renders nothing", () => {
  const document = render(fixture({
    stories: [], gallery: [], gifts: [], wishes: [], events: [],
    content: { openingQuote: null, openingMessage: null, closingMessage: null },
    features: { ...allFeatures, rsvp: false, wishes: false, dressCode: false, countdown: false, livestream: false },
    media: { coverImageUrl: null, musicUrl: null },
  }));
  for (const id of ["kk-quote", "kk-acara", "kk-cerita", "kk-galeri", "kk-kado", "kk-rsvp", "kk-ucapan", "kk-dress-code", "kk-livestream", "kk-countdown"]) {
    assert.equal(document.getElementById(id), null, id);
  }
  assert.equal(document.querySelector("#kk-beranda .kk-hero-arch"), null, "no photo means no arch");
  assert.ok(document.getElementById("kk-penutup"));
});

test("every gunungan has its own pattern ids", () => {
  const document = render(fixture());
  const ids = [...document.querySelectorAll(".kk-gunungan [id]")].map((node) => node.id);
  assert.ok(ids.length >= 8);
  assert.equal(new Set(ids).size, ids.length);
});

test("forms keep Turnstile inside the form and photos go through isOptimizableImage", () => {
  for (const file of ["RsvpSection", "WishesSection"]) {
    assert.match(read(`src/themes/kelir-kencana/sections/${file}.tsx`), /<form[\s\S]*<TurnstileWidget \/>[\s\S]*<\/form>/, file);
  }
  assert.match(read("src/themes/kelir-kencana/components/KelirImage.tsx"), /unoptimized=\{!isOptimizableImage\(/);
});

test("the catalogue migration is an idempotent upsert that never deletes", () => {
  const sql = read("supabase/migrations/20261005000004_kelir_kencana_theme.sql");
  assert.match(sql, /insert into public\.themes/i);
  assert.match(sql, /'Kelir Kencana',\s*'kelir-kencana'/);
  assert.match(sql, /on conflict \(slug\) do update/i);
  assert.doesNotMatch(sql.replace(/^--.*$/gm, ""), /\b(delete|truncate|drop)\b/i);
  assert.doesNotMatch(sql, /references\s+public\.invitations/i, "no foreign key from themes to invitations");
  for (const file of ["wayang-satria.webp", "wayang-putri.webp"]) {
    assert.ok(existsSync(new URL(`../public/themes/kelir-kencana/${file}`, import.meta.url)), file);
  }
});
