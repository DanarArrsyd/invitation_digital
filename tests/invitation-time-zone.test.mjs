import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import vm from "node:vm";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { JSDOM } from "jsdom";
import ts from "typescript";

import { resolveInvitationTimeZone, timeZoneLabel } from "../src/lib/invitations/time-zones.ts";

const nodeRequire = createRequire(import.meta.url);
const sourceRoot = fileURLToPath(new URL("../src/", import.meta.url));

function createLoader() {
  const cache = new Map();
  function load(file) {
    const path = [file, `${file}.tsx`, `${file}.ts`, `${file}/index.ts`].find((candidate) => existsSync(candidate) && !candidate.endsWith("/"));
    assert.ok(path, `Missing module: ${file}`);
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
      require(name) {
        if (name === "next/image") return { __esModule: true, default: ({ src, alt }) => React.createElement("img", { src, alt }) };
        if (name === "next/script") return { __esModule: true, default: () => null };
        if (name === "@/app/(public)/[slug]/actions") {
          return { trackCoverOpenedAction: async () => {}, submitRsvpAction: async () => ({}), submitWishAction: async () => ({}) };
        }
        if (name === "@/themes/shared/use-invitation-cover") {
          return {
            useInvitationCover: () => ({ opened: true, playing: false, canPlayMusic: false,
              reducedMotion: false, audioRef: React.createRef(), contentRef: React.createRef(),
              openInvitation: () => {}, toggleMusic: () => {} }),
          };
        }
        if (name.startsWith("@/")) return load(resolve(sourceRoot, name.slice(2)));
        if (name.startsWith(".")) return load(resolve(dirname(path), name));
        return nodeRequire(name);
      },
    });
    return exports;
  }
  return load;
}

const load = createLoader();
const calendar = load(resolve(sourceRoot, "themes/shared/calendar"));

test("settings.timeZone resolves to a supported zone and defaults to WIB", () => {
  assert.equal(resolveInvitationTimeZone({ timeZone: "Asia/Makassar" }), "Asia/Makassar");
  assert.equal(resolveInvitationTimeZone({ timeZone: "Asia/Jayapura" }), "Asia/Jayapura");
  for (const settings of [undefined, null, {}, { timeZone: "Europe/Paris" }, { timeZone: 7 }, []]) {
    assert.equal(resolveInvitationTimeZone(settings), "Asia/Jakarta");
  }
  assert.deepEqual(["Asia/Jakarta", "Asia/Makassar", "Asia/Jayapura"].map(timeZoneLabel), ["WIB", "WITA", "WIT"]);
});

test("the same wall-clock time is one hour earlier in absolute time for each zone east", () => {
  const wib = calendar.toEventTimestamp("2030-10-20", "10:00:00", "Asia/Jakarta");
  const wita = calendar.toEventTimestamp("2030-10-20", "10:00:00", "Asia/Makassar");
  const wit = calendar.toEventTimestamp("2030-10-20", "10:00:00", "Asia/Jayapura");
  assert.equal(new Date(wib).toISOString(), "2030-10-20T03:00:00.000Z");
  assert.equal(wib - wita, 3_600_000);
  assert.equal(wita - wit, 3_600_000);
  assert.equal(calendar.toEventTimestamp("2030-10-20", "10:00:00"), wib, "no zone means WIB");
});

test("calendar exports use the invitation's zone", () => {
  const event = { id: "e", eventType: null, title: "Resepsi", eventDate: "2030-10-20", startTime: "10:00:00",
    endTime: "12:00:00", venueName: "Ubud", address: null, mapsUrl: null, livestreamUrl: null, sortOrder: 0 };
  const wita = calendar.calendarEventForEvent(event, "Alya & Bima", "Asia/Makassar");
  const ics = calendar.buildIcsCalendar(wita, "uid", new Date("2030-01-01T00:00:00Z"));
  assert.match(ics, /DTSTART:20301020T020000Z/);
  assert.match(ics, /DTEND:20301020T040000Z/);
  assert.match(calendar.buildGoogleCalendarUrl(wita), /dates=20301020T020000Z%2F20301020T040000Z/);

  const wib = calendar.calendarEventForEvent(event, "Alya & Bima");
  assert.match(calendar.buildIcsCalendar(wib, "uid", new Date("2030-01-01T00:00:00Z")), /DTSTART:20301020T030000Z/);
});

const THEMES = [
  ["themes/nusantara-ivory/index", "NusantaraIvory", "nusantara-ivory", "#ni-acara"],
  ["themes/terra-botanica/index", "TerraBotanica", "terra-botanica", "#tb-acara"],
  ["themes/midnight-atelier/index", "MidnightAtelier", "midnight-atelier", "#ma-acara"],
  ["themes/cobalt-riviera/index", "CobaltRiviera", "cobalt-riviera", "#cr-acara"],
];

function invitation(slug, overrides = {}) {
  return {
    id: "tz", type: "wedding", slug: "tz", title: "Alya & Bima", status: "published",
    eventDate: "2030-10-20", venueSummary: "Ubud", publishedAt: "2030-01-01T00:00:00Z", expiresAt: null,
    theme: { slug, settings: {} },
    people: [
      { id: "b", role: "bride", fullName: "Alya", nickname: null, fatherName: null, motherName: null, photoUrl: null, bio: null, sortOrder: 0 },
      { id: "g", role: "groom", fullName: "Bima", nickname: null, fatherName: null, motherName: null, photoUrl: null, bio: null, sortOrder: 1 },
    ],
    events: [{ id: "event", eventType: "Resepsi", title: "Resepsi", eventDate: "2030-10-20",
      startTime: "10:00:00", endTime: "12:00:00", venueName: "Ubud", address: null,
      mapsUrl: null, livestreamUrl: null, sortOrder: 0 }],
    stories: [], gallery: [], gifts: [], wishes: [],
    content: { openingQuote: null, openingMessage: null, closingMessage: null },
    features: { music: false, countdown: false, maps: false, story: false, gallery: false, dressCode: false,
      livestream: false, rsvp: false, wishes: false, gift: false, guestPersonalization: false },
    media: { coverImageUrl: null, musicUrl: null },
    ...overrides,
  };
}

for (const [entry, exportName, slug, eventsSelector] of THEMES) {
  test(`${slug}: event times carry the invitation's zone label`, () => {
    const Theme = load(resolve(sourceRoot, entry))[exportName];
    const render = (overrides) => {
      const html = renderToStaticMarkup(React.createElement(Theme, { invitation: invitation(slug, overrides), guest: null }));
      return new JSDOM(html).window.document.querySelector(eventsSelector)?.textContent ?? "";
    };
    const wita = render({ timeZone: "Asia/Makassar" });
    assert.match(wita, /10:00\s*–\s*12:00 WITA/);
    assert.doesNotMatch(wita, /\bWIB\b/);
    assert.match(render({ timeZone: "Asia/Jayapura" }), /12:00 WIT(?!A)/);
    assert.match(render({}), /12:00 WIB/, "invitations saved before the setting existed stay WIB");
  });
}
