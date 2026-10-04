import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import vm from "node:vm";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { JSDOM } from "jsdom";
import ts from "typescript";

const nodeRequire = createRequire(import.meta.url);
const sourceRoot = fileURLToPath(new URL("../src/", import.meta.url));
const midnightRoot = resolve(sourceRoot, "themes/midnight-atelier");

function loadSource(entry) {
  const cache = new Map();
  function load(file) {
    const path = [file, `${file}.tsx`, `${file}.ts`, `${file}/index.ts`]
      .find((candidate) => existsSync(candidate) && statSync(candidate).isFile());
    assert.ok(path, `Missing module ${file}`);
    if (cache.has(path)) return cache.get(path);
    const exports = {};
    cache.set(path, exports);
    const output = ts.transpileModule(readFileSync(path, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
    }).outputText;
    vm.runInNewContext(output, {
      exports, module: { exports }, console, Date, Intl, URL, URLSearchParams, Blob, process,
      setTimeout, clearTimeout, setInterval, clearInterval,
      require(name) {
        if (name === "next/image") return { __esModule: true, default: (imageProps) => {
          const props = { ...imageProps };
          delete props.fill;
          delete props.fetchPriority;
          delete props.unoptimized;
          return React.createElement("img", props);
        } };
        if (name === "next/script") return { __esModule: true, default: () => null };
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

const allFeatures = {
  music: true, countdown: true, maps: true, story: true, gallery: true,
  dressCode: true, livestream: true, rsvp: true, wishes: true, gift: true,
  guestPersonalization: true,
};

function fixture(features = allFeatures) {
  return {
    id: "quality", type: "wedding", slug: "quality", title: "Nadia & Arka", status: "published",
    eventDate: "2030-10-20", venueSummary: "Ballroom", publishedAt: "2030-01-01T00:00:00Z", expiresAt: null,
    theme: {
      slug: "midnight-atelier",
      settings: {
        personSocials: { person: { instagram: "@nadia" } },
        dressCode: { description: "Busana malam", groups: [{ label: "Formal", colors: ["#09090B"] }] },
      },
    },
    people: [{
      id: "person", role: "bride", fullName: "Nadia Kusuma", nickname: null,
      fatherName: "Bapak Kusuma", motherName: "Ibu Kusuma", photoUrl: "/test.jpg",
      bio: "Sebuah kisah yang terus bertumbuh.", sortOrder: 0,
    }],
    events: [{
      id: "event", eventType: "ceremony", title: "Pertemuan", eventDate: "2030-10-20",
      startTime: "19:00", endTime: "21:00", venueName: "Ballroom", address: "Jakarta",
      mapsUrl: "https://maps.example.test/", livestreamUrl: "https://live.example.test/", sortOrder: 0,
    }],
    stories: [{ id: "story", title: "Pertemuan", storyDate: null, yearLabel: "2026", description: "Kami bertemu.", imageUrl: "/story.jpg", sortOrder: 0 }],
    gallery: [{ id: "photo", imageUrl: "/gallery.jpg", caption: "Malam bersama", altText: "Nadia dan Arka", aspectRatio: "portrait_4_5", sortOrder: 0 }],
    gifts: [{ id: "gift", providerType: "bank", providerName: "Bank", accountNumber: "123", accountName: "Nadia", logoUrl: null, sortOrder: 0 }],
    wishes: [],
    content: { openingQuote: "To the night we remember.", openingMessage: "Join our evening.", closingMessage: "See you there." },
    features,
    media: { coverImageUrl: "/cover.jpg", musicUrl: "/music.mp3" },
  };
}

function render(invitation) {
  const { MidnightAtelier } = loadSource("themes/midnight-atelier/index");
  const html = renderToStaticMarkup(React.createElement(MidnightAtelier, {
    invitation,
    guest: { id: "guest", displayName: "Tamu Panjang", token: "token", notes: null },
  }));
  return new JSDOM(html).window.document;
}

test("Midnight Instagram link names its visible handle", () => {
  const link = render(fixture()).querySelector("#ma-mempelai .ma-instagram");
  assert.ok(link);
  assert.equal(link.textContent.trim(), "@nadia");
  assert.match(link.getAttribute("aria-label"), /@nadia\b/);
});

test("feature-controlled Midnight sections render once and disappear when disabled", () => {
  const enabled = render(fixture());
  const disabled = render(fixture(Object.fromEntries(Object.keys(allFeatures).map((key) => [key, false]))));
  for (const id of ["ma-dress-code", "ma-cerita", "ma-galeri", "ma-livestream", "ma-rsvp", "ma-ucapan", "ma-kado"]) {
    assert.equal(enabled.querySelectorAll(`#${id}`).length, 1, `${id} enabled exactly once`);
    assert.equal(disabled.querySelectorAll(`#${id}`).length, 0, `${id} disabled`);
  }
  assert.equal(enabled.querySelectorAll("#ma-countdown .ma-countdown-units").length, 1, "countdown clock enabled exactly once");
  assert.equal(disabled.querySelectorAll("#ma-countdown .ma-countdown-units").length, 0, "countdown clock disabled");
  assert.equal(disabled.querySelectorAll("#ma-countdown .ma-calendar-actions").length, 1, "calendar outlives the countdown");
  assert.equal(disabled.querySelector("audio"), null, "disabled music creates no audio element");
  assert.equal(disabled.querySelector("#ma-cover .ma-cover-guest-name").textContent, "Bapak/Ibu/Saudara/i");
  assert.equal(disabled.querySelector("#ma-acara a[href*='maps']"), null);
});

test("each disabled feature removes only its own Midnight section", () => {
  // The countdown section also carries the calendar actions, so a disabled
  // countdown removes only its clock units.
  const sections = new Map([
    ["countdown", "#ma-countdown .ma-countdown-units"], ["dressCode", "#ma-dress-code"],
    ["story", "#ma-cerita"], ["gallery", "#ma-galeri"],
    ["livestream", "#ma-livestream"], ["rsvp", "#ma-rsvp"],
    ["wishes", "#ma-ucapan"], ["gift", "#ma-kado"],
  ]);
  for (const [disabledFeature, disabledSelector] of sections) {
    const document = render(fixture({ ...allFeatures, [disabledFeature]: false }));
    assert.equal(document.querySelectorAll(disabledSelector).length, 0, `${disabledFeature} removes ${disabledSelector}`);
    for (const [otherFeature, otherSelector] of sections) {
      if (otherFeature === disabledFeature) continue;
      assert.equal(document.querySelectorAll(otherSelector).length, 1,
        `${disabledFeature} leaves ${otherFeature} visible exactly once`);
    }
    assert.equal(document.querySelectorAll("#ma-countdown .ma-calendar-actions").length, 1, `${disabledFeature} keeps the calendar`);
  }
});

test("Midnight styles reserve media and enforce motion, focus, and mobile bounds", () => {
  const document = render(fixture());
  const css = document.querySelector("style").textContent;
  assert.match(css, /overflow-x:\s*clip/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /animation:\s*none\s*!important/);
  assert.match(css, /transition(?:-duration)?:\s*(?:none|0\.01ms)\s*!important/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /\.ma-media\s*\{[^}]*overflow:\s*hidden/);
  assert.match(css, /\.ma-cover-open\s*\{[^}]*min-height:\s*5[02]px/);
  const image = document.querySelector("#ma-galeri img");
  assert.ok(image.closest(".ma-media").style.aspectRatio, "slow image keeps an explicit ratio");
  assert.equal(image.getAttribute("loading"), "lazy");
  for (const form of document.querySelectorAll(".ma-form")) {
    assert.ok(form.querySelector("label, legend"), "public form fields have visible labels");
    assert.equal(form.querySelector('[role="alert"]'), null, "fresh form has no error alert");
  }
});

function sourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? sourceFiles(path) : /\.tsx?$/.test(path) ? [path] : [];
  });
}

test("Midnight source keeps media and data behind approved boundaries", () => {
  const source = sourceFiles(midnightRoot).map((path) => readFileSync(path, "utf8")).join("\n");
  assert.doesNotMatch(source, /<img\b/);
  assert.doesNotMatch(source, /querySelector|supabase|createSupabase/i);
});

test("Ivory tolerates malformed event dates and rejects unsafe event links", () => {
  const { EventsSection } = loadSource("themes/nusantara-ivory/sections/EventsSection");
  const { LivestreamSection } = loadSource("themes/nusantara-ivory/sections/LivestreamSection");
  const event = {
    ...fixture().events[0],
    eventDate: "not-a-date",
    startTime: "99:99",
    endTime: "00:00",
    mapsUrl: "javascript:alert(1)",
    livestreamUrl: "data:text/html,unsafe",
  };
  const html = renderToStaticMarkup(React.createElement(React.Fragment, null,
    React.createElement(EventsSection, { events: [event], venueSummary: null, showMaps: true }),
    React.createElement(LivestreamSection, { events: [event] }),
  ));
  assert.match(html, /Pertemuan/);
  assert.doesNotMatch(html, /href="(?:javascript|data):/i);
  assert.doesNotMatch(html, /99:99/);
  assert.doesNotMatch(html, /00:00 WIB/, "an end time never becomes an orphan start time");
});
