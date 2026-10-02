import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

import { getCoupleDisplayName } from "../src/lib/utils/coupleName.ts";
import { getDressCode } from "../src/lib/utils/dressCode.ts";
import * as timeZones from "../src/lib/invitations/time-zones.ts";

const nodeRequire = createRequire(import.meta.url);

function loadModule(path, dependencies = {}) {
  let source;
  try {
    source = readFileSync(new URL(path, import.meta.url), "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") return {};
    throw error;
  }
  const exports = {};
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(output, {
    exports,
    module: { exports },
    Date,
    URLSearchParams,
    require(name) {
      return dependencies[name] ?? nodeRequire(name);
    },
  });
  return exports;
}

const calendar = loadModule("../src/themes/shared/calendar.ts", {
  "@/lib/invitations/time-zones": timeZones,
});
const viewModel = loadModule("../src/themes/shared/view-model.ts", {
  "@/lib/utils/coupleName": { getCoupleDisplayName },
  "@/lib/utils/dressCode": { getDressCode },
  "./calendar": calendar,
  "@/themes/shared/calendar": calendar,
  "@/lib/invitations/time-zones": timeZones,
});

const features = {
  music: true, countdown: true, maps: true, story: true, gallery: true,
  dressCode: true, livestream: true, rsvp: true, wishes: true, gift: true,
  guestPersonalization: true,
};

const earlyEvent = {
  id: "early", eventType: "ceremony", title: "Akad", eventDate: "2026-10-20",
  startTime: "09:30", endTime: "11:30", venueName: "Puri Nirwaran",
  address: null, mapsUrl: null, livestreamUrl: null, sortOrder: 2,
};
const lateEvent = {
  ...earlyEvent, id: "late", title: "Resepsi", eventDate: "2026-10-21",
  startTime: "12:00", sortOrder: 1,
};
const guest = { id: "guest", displayName: "Tamu Keluarga", token: "token", notes: null };

function fixture(overrides = {}) {
  return {
    id: "invitation", type: "wedding", slug: "rayhana-febri", title: "Rayhana & Febri",
    status: "published", eventDate: "2026-10-22", venueSummary: "Venue cadangan",
    publishedAt: "2026-09-01T00:00:00.000Z", expiresAt: null,
    theme: { slug: "nusantara-ivory", settings: { dressCode: { description: "Earth tones", groups: [] } } },
    people: [
      { id: "bride", role: "bride", fullName: "Rayhana", nickname: "Raya", fatherName: null, motherName: null, photoUrl: null, bio: null, sortOrder: 0 },
      { id: "groom", role: "groom", fullName: "Febri", nickname: "Febri", fatherName: null, motherName: null, photoUrl: null, bio: null, sortOrder: 1 },
    ],
    events: [lateEvent, earlyEvent], stories: [], gallery: [], gifts: [], wishes: [],
    content: { openingQuote: null, openingMessage: null, closingMessage: null },
    features: { ...features },
    media: { coverImageUrl: "https://example.test/cover.jpg", musicUrl: null },
    ...overrides,
  };
}

test("view model selects the earliest event without mutating input", () => {
  const invitation = fixture();
  const original = structuredClone(invitation);
  const result = viewModel.buildThemeViewModel(invitation, guest);
  assert.equal(result.primaryEvent.id, "early");
  assert.equal(result.countdownTarget, Date.parse("2026-10-20T02:30:00Z"));
  assert.equal(result.calendarEvent.title, "Akad — Raya & Febri");
  assert.equal(result.calendarEvent.location, "Puri Nirwaran");
  assert.equal(result.guestDisplayName, "Tamu Keluarga");
  assert.deepEqual(invitation, original);
});

test("view model omits actions and personalization without a date or enabled feature", () => {
  const result = viewModel.buildThemeViewModel(fixture({
    eventDate: null, events: [], media: { coverImageUrl: null, musicUrl: null },
    features: { ...features, guestPersonalization: false },
  }), guest);
  assert.equal(result.primaryEvent, null);
  assert.equal(result.countdownTarget, null);
  assert.equal(result.calendarEvent, null);
  assert.equal(result.guestDisplayName, null);
  assert.equal(result.heroImageUrl, null);
  assert.equal(result.closingImageUrl, null);
});

test("view model honors normalized package feature flags", () => {
  const result = viewModel.buildThemeViewModel(fixture({
    features: { ...features, countdown: false, dressCode: false, guestPersonalization: false },
  }), guest);
  assert.equal(result.countdownTarget, null);
  assert.equal(result.calendarEvent.date, "2026-10-20");
  assert.equal(result.dressCode, null);
  assert.equal(result.guestDisplayName, null);
  assert.equal(result.coupleDisplayName, "Raya & Febri");
});

test("view model uses fallback date and closing gallery image with sparse events", () => {
  const result = viewModel.buildThemeViewModel(fixture({
    events: [], gallery: [{ id: "photo", imageUrl: "https://example.test/last.jpg", caption: null, altText: null, aspectRatio: "square_1_1", sortOrder: 0 }],
  }), null);
  assert.equal(result.countdownTarget, Date.parse("2026-10-21T17:00:00Z"));
  assert.equal(result.calendarEvent, null, "a fallback invitation date is not a supplied event interval");
  assert.equal(result.heroImageUrl, "https://example.test/cover.jpg");
  assert.equal(result.closingImageUrl, "https://example.test/last.jpg");
  assert.equal(result.dressCode.description, "Earth tones");
});

test("calendar eligibility requires a valid supplied positive same-day interval, independently of countdown", () => {
  for (const [eventDate, startTime, endTime] of [
    ["2026-02-30", "09:30", "11:00"], ["2026-10-20", null, "11:00"],
    ["2026-10-20", "09:30", null], ["2026-10-20", "09:30", "09:30"],
    ["2026-10-20", "11:00", "09:30"], ["2026-10-20", "bad", "11:00"],
  ]) {
    const result = viewModel.buildThemeViewModel(fixture({
      events: [{ ...earlyEvent, eventDate, startTime, endTime }],
      features: { ...features, countdown: false },
    }), null);
    assert.equal(result.calendarEvent, null, `${eventDate} ${startTime}–${endTime}`);
  }
  const valid = viewModel.buildThemeViewModel(fixture({ features: { ...features, countdown: false } }), null);
  assert.equal(valid.calendarEvent.date, "2026-10-20");
  assert.equal(valid.calendarEvent.startTime, "09:30");
  assert.equal(valid.calendarEvent.endTime, "11:30");
});

test("invalid event dates or times never become countdown timestamps", () => {
  for (const [eventDate, startTime] of [["2026-02-30", "09:30"], ["2026-10-20", "25:00"]]) {
    const result = viewModel.buildThemeViewModel(fixture({ events: [{ ...earlyEvent, eventDate, startTime }] }), null);
    assert.equal(result.countdownTarget, null);
  }
});

test("calendar builders preserve punctuation, line breaks, and long venue names", () => {
  const location = `Grand Hall, Wing A; ${"Very Long Venue Name ".repeat(12).trim()}`;
  const event = {
    title: "Raya, Febri; Celebration", date: "2026-10-20", startTime: "09:30",
    endTime: "11:30", location, description: "First line, with comma; detail\nSecond line",
  };
  const googleUrl = new URL(calendar.buildGoogleCalendarUrl(event));
  assert.equal(googleUrl.origin, "https://calendar.google.com");
  assert.equal(googleUrl.searchParams.get("text"), event.title);
  assert.equal(googleUrl.searchParams.get("location"), location);
  assert.equal(googleUrl.searchParams.get("details"), event.description);
  assert.equal(googleUrl.searchParams.get("dates"), "20261020T023000Z/20261020T043000Z");

  const ics = calendar.buildIcsCalendar(event, "event@invitation.digital", new Date("2026-09-24T13:14:15.000Z"));
  assert.match(ics, /\r\nDTSTART:20261020T023000Z\r\nDTEND:20261020T043000Z\r\n/);
  assert.ok(ics.includes("SUMMARY:Raya\\, Febri\\; Celebration"));
  assert.ok(ics.includes(`LOCATION:Grand Hall\\, Wing A\\; ${"Very Long Venue Name ".repeat(12).trim()}`));
  assert.ok(ics.includes("DESCRIPTION:First line\\, with comma\\; detail\\nSecond line"));
  assert.ok(ics.includes("UID:event@invitation.digital"));
});

test("calendar builders use the existing morning and two-hour defaults", () => {
  const event = { title: "Gathering", date: "2026-10-20", startTime: null, endTime: null, location: null };
  const googleUrl = new URL(calendar.buildGoogleCalendarUrl(event));
  assert.equal(googleUrl.searchParams.get("dates"), "20261020T020000Z/20261020T040000Z");
  assert.equal(googleUrl.searchParams.has("location"), false);
  assert.equal(googleUrl.searchParams.has("details"), false);
  const ics = calendar.buildIcsCalendar(event, "gathering@invitation.digital", new Date("2026-09-24T13:14:15.000Z"));
  assert.ok(ics.includes("DTSTART:20261020T020000Z"));
  assert.ok(ics.includes("DTEND:20261020T040000Z"));
  assert.equal(ics.includes("LOCATION:"), false);
});

test("ICS output is exact and repeatable for a caller-provided timestamp", () => {
  const event = {
    title: "Akad", date: "2026-10-20", startTime: "09:30", endTime: "11:30",
    location: "Puri Nirwaran", description: "Undangan Raya & Febri",
  };
  const timestamp = new Date("2026-09-24T13:14:15.000Z");
  const expected = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Invitation Digital//ID",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    "UID:akad@invitation.digital",
    "DTSTAMP:20260924T131415Z",
    "DTSTART:20261020T023000Z",
    "DTEND:20261020T043000Z",
    "SUMMARY:Akad",
    "LOCATION:Puri Nirwaran",
    "DESCRIPTION:Undangan Raya & Febri",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  assert.equal(calendar.buildIcsCalendar(event, "akad@invitation.digital", timestamp), expected);
  assert.equal(calendar.buildIcsCalendar(event, "akad@invitation.digital", timestamp), expected);
});
