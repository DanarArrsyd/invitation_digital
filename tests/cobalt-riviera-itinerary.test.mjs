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

const baseFeatures = {
  music: false, countdown: true, maps: true, story: false, gallery: false,
  dressCode: true, livestream: true, rsvp: false, wishes: false, gift: false,
  guestPersonalization: false,
};

function event(index = 0, overrides = {}) {
  return {
    id: `event-${index}`, eventType: index === 0 ? "Akad" : "Reception",
    title: index === 0 ? "Upacara Pernikahan" : `Perayaan Riviera ${index + 1}`,
    eventDate: `2030-10-${String(20 + index).padStart(2, "0")}`,
    startTime: "16:30:00", endTime: "20:30:00",
    venueName: "Riviera Pavilion dengan Nama Tempat yang Sangat Panjang untuk Menguji Pembungkusan",
    address: "Jalan Pesisir Selatan nomor seratus dua puluh delapan, kawasan perayaan, Jakarta",
    mapsUrl: `https://maps.example.test/venue-${index}`,
    livestreamUrl: `https://stream.example.test/event-${index}`,
    sortOrder: index,
    ...overrides,
  };
}

function fixture(overrides = {}) {
  return {
    id: "cobalt-itinerary", type: "wedding", slug: "cobalt-itinerary", title: "Mira & Raka", status: "published",
    eventDate: "2030-10-20", venueSummary: null, publishedAt: "2026-10-01T00:00:00Z", expiresAt: null,
    theme: { slug: "cobalt-riviera", settings: { dressCode: {
      description: "Resort formal dengan warna matahari dan laut.",
      groups: [{ label: "Sunset", colors: ["#F06A3C", "#F3CF4C", "not-a-color"] }],
    } } },
    people: [
      { id: "mira", role: "bride", fullName: "Mira", nickname: null, fatherName: null, motherName: null, photoUrl: null, bio: null, sortOrder: 0 },
      { id: "raka", role: "groom", fullName: "Raka", nickname: null, fatherName: null, motherName: null, photoUrl: null, bio: null, sortOrder: 1 },
    ],
    events: [event()], stories: [], gallery: [], gifts: [], wishes: [],
    content: { openingQuote: null, openingMessage: null, closingMessage: null },
    features: { ...baseFeatures }, media: { coverImageUrl: null, musicUrl: null },
    ...overrides,
  };
}

function render(invitation = fixture()) {
  const { CobaltRiviera } = loadTheme().load("themes/cobalt-riviera");
  return new JSDOM(renderToStaticMarkup(React.createElement(CobaltRiviera, { invitation, guest: null }))).window.document;
}

test("flat itinerary renders one through five ordered events with all readable details visible", () => {
  for (const length of [1, 5]) {
    const document = render(fixture({ events: Array.from({ length }, (_, index) => event(index)) }));
    const rows = [...document.querySelectorAll("#cr-acara [data-event-item]")];
    assert.equal(rows.length, length);
    rows.forEach((row, index) => {
      assert.equal(row.getAttribute("data-event-item"), `event-${index}`);
      assert.equal(row.querySelector(".cr-event-index")?.textContent, String(index + 1).padStart(2, "0"));
      assert.match(row.textContent, /Riviera Pavilion/);
      assert.match(row.textContent, /Jakarta/);
      assert.equal(row.querySelector("details"), null, "itinerary must stay visible without disclosure");
    });
  }
});

test("event rows keep their safe maps while calendar actions stay out of the itinerary", () => {
  const document = render(fixture({ events: [event(0), event(1)] }));
  const rows = [...document.querySelectorAll("#cr-acara [data-event-item]")];
  assert.equal(rows.length, 2);
  rows.forEach((row, index) => {
    const maps = row.querySelector("a[aria-label^='Buka Maps']");
    assert.equal(maps?.getAttribute("href"), `https://maps.example.test/venue-${index}`);
    assert.equal(maps?.getAttribute("target"), "_blank");
    assert.match(maps?.getAttribute("rel") ?? "", /noopener/);
  });
  const events = document.getElementById("cr-acara");
  assert.equal(events.querySelector(".cr-calendar-actions"), null);
  assert.equal(events.querySelector("a[aria-label^='Google Kalender'], button[aria-label^='Unduh kalender']"), null);
});

test("countdown carries exactly one calendar action set built from the earliest event", () => {
  const earliest = event(0, { title: "Akad Pagi", startTime: "08:00:00", endTime: "10:00:00", sortOrder: 5 });
  const document = render(fixture({ events: [event(1), earliest] }));
  const countdown = document.getElementById("cr-countdown");
  assert.ok(countdown);
  assert.equal(countdown.querySelectorAll("dd").length, 4, "the clock stays alongside the calendar");
  assert.equal(document.querySelectorAll(".cr-calendar-actions").length, 1);
  const actions = countdown.querySelector(".cr-calendar-actions");
  assert.ok(actions);
  assert.equal(actions.querySelectorAll("a[aria-label^='Google Kalender']").length, 1);
  assert.equal(actions.querySelectorAll("button[aria-label^='Unduh kalender']").length, 1);
  const google = new URL(actions.querySelector("a[aria-label^='Google Kalender']").getAttribute("href"));
  assert.equal(google.origin + google.pathname, "https://calendar.google.com/calendar/render");
  assert.equal(google.searchParams.get("text"), "Akad Pagi — Mira & Raka");
  assert.match(google.searchParams.get("dates") ?? "", /^20301020T010000Z\/20301020T030000Z$/);
  assert.equal(
    actions.querySelector("button[aria-label^='Unduh kalender']").getAttribute("aria-label"),
    "Unduh kalender .ics untuk Akad Pagi — Mira & Raka",
  );
});

test("calendar actions keep a save-the-date block when the countdown clock is off", () => {
  const document = render(fixture({ features: { ...baseFeatures, countdown: false } }));
  const countdown = document.getElementById("cr-countdown");
  assert.ok(countdown, "a calendar alone still earns the section");
  assert.equal(countdown.querySelector(".cr-countdown-units"), null);
  assert.equal(countdown.querySelectorAll("dd").length, 0);
  const heading = document.getElementById(countdown.getAttribute("aria-labelledby"));
  assert.match(heading?.textContent ?? "", /Simpan tanggalnya/);
  assert.equal(countdown.querySelectorAll(".cr-calendar-actions").length, 1);
  assert.equal(document.querySelectorAll(".cr-calendar-actions").length, 1);
});

test("calendar actions disappear when no event has a valid positive same-day interval", () => {
  const events = [event(0, { endTime: "16:30:00" }), event(1, { startTime: "18:00:00", endTime: "09:00:00" })];
  const withClock = render(fixture({ events }));
  assert.equal(withClock.querySelectorAll("#cr-countdown dd").length, 4);
  assert.equal(withClock.querySelector(".cr-calendar-actions"), null);
  const withoutClock = render(fixture({ events, features: { ...baseFeatures, countdown: false } }));
  assert.equal(withoutClock.getElementById("cr-countdown"), null);
  assert.equal(withoutClock.querySelector(".cr-calendar-actions"), null);
});

test("malformed date, times, and unsafe URLs preserve useful text without orphan actions", () => {
  const broken = event(0, {
    eventDate: "2030-02-31", startTime: "25:00", endTime: "17:00",
    mapsUrl: "javascript:alert(1)", livestreamUrl: "data:text/html,unsafe",
  });
  const document = render(fixture({ events: [broken] }));
  const row = document.querySelector("#cr-acara [data-event-item]");
  assert.ok(row);
  assert.match(row.textContent, /Upacara Pernikahan/);
  assert.match(row.textContent, /Riviera Pavilion/);
  assert.equal(row.querySelector("time"), null);
  assert.equal(row.querySelector(".cr-event-time"), null);
  assert.equal(row.querySelector(".cr-calendar-actions"), null);
  assert.equal(row.querySelector("a[aria-label^='Buka Maps']"), null);
  assert.equal(document.querySelector("#cr-livestream"), null);
});

test("horizon countdown has four non-negative units and clamps elapsed events to zero", () => {
  const future = render();
  assert.deepEqual([...future.querySelectorAll("#cr-countdown dd")].map((node) => node.getAttribute("data-unit")), ["days", "hours", "minutes", "seconds"]);
  assert.ok([...future.querySelectorAll("#cr-countdown dd")].every((node) => /^\d{2,}$/.test(node.textContent)));
  const elapsed = render(fixture({ eventDate: "2020-01-01", events: [event(0, { eventDate: "2020-01-01" })] }));
  assert.deepEqual([...elapsed.querySelectorAll("#cr-countdown dd")].map((node) => node.textContent), ["00", "00", "00", "00"]);
});

test("wardrobe strip labels valid colors and broadcast row keeps only safe links", () => {
  const document = render(fixture({ events: [event(0), event(1, { livestreamUrl: "javascript:alert(1)" })] }));
  assert.match(document.querySelector("#cr-dress-code")?.textContent ?? "", /Resort formal/);
  assert.deepEqual([...document.querySelectorAll("#cr-dress-code .cr-dress-swatch + span")].map((node) => node.textContent), ["#F06A3C", "#F3CF4C"]);
  const streams = [...document.querySelectorAll("#cr-livestream a")];
  assert.equal(streams.length, 1);
  assert.equal(streams[0].getAttribute("href"), "https://stream.example.test/event-0");
  assert.match(streams[0].getAttribute("rel") ?? "", /noopener/);
});

test("disabled optional features stay absent while event rows remain useful", () => {
  const document = render(fixture({ features: { ...baseFeatures, countdown: false, maps: false, dressCode: false, livestream: false } }));
  assert.ok(document.querySelector("#cr-acara"));
  assert.equal(document.querySelector("#cr-acara a[aria-label^='Buka Maps']"), null);
  assert.equal(document.querySelector("#cr-countdown .cr-countdown-units"), null);
  assert.equal(document.querySelector("#cr-dress-code"), null);
  assert.equal(document.querySelector("#cr-livestream"), null);
});

test("empty events omit dependent sections and responsive CSS prevents clipping without generic effects", () => {
  const document = render(fixture({ events: [], eventDate: null }));
  for (const id of ["cr-acara", "cr-countdown", "cr-livestream"]) assert.equal(document.getElementById(id), null);
  const css = document.querySelector("style")?.textContent ?? "";
  assert.match(css, /\.cr-event[^}]*overflow-wrap:\s*anywhere/s);
  assert.match(css, /\.cr-event-actions[^}]*min-height:\s*48px/s);
  assert.match(css, /\.cr-countdown-units[^}]*grid-template-columns/s);
  assert.match(css, /@media\s*\(min-width:\s*768px\)[\s\S]*\.cr-event\s*\{[^}]*grid-template-columns/s);
  assert.doesNotMatch(css, /linear-gradient|radial-gradient|backdrop-filter|box-shadow|border-radius/);
});

test("every itinerary and broadcast control resolves a visible high-contrast focus ring from its surface", () => {
  const document = render();
  const luminance = (hex) => {
    const channels = hex.slice(1).match(/.{2}/g).map((value) => Number.parseInt(value, 16) / 255);
    const [red, green, blue] = channels.map((value) => (
      value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
    ));
    return (0.2126 * red) + (0.7152 * green) + (0.0722 * blue);
  };
  const contrast = (first, second) => {
    const [lighter, darker] = [luminance(first), luminance(second)].sort((a, b) => b - a);
    return (lighter + 0.05) / (darker + 0.05);
  };
  const controls = [
    ...document.querySelectorAll("#cr-acara .cr-event-actions a, #cr-acara .cr-event-actions button"),
    ...document.querySelectorAll("#cr-countdown .cr-calendar-actions a, #cr-countdown .cr-calendar-actions button"),
    ...document.querySelectorAll("#cr-livestream a"),
  ];
  assert.equal(document.querySelectorAll("#cr-countdown .cr-calendar-actions :is(a, button)").length, 2);
  assert.ok(controls.length >= 4);
  for (const control of controls) {
    control.focus();
    const style = document.defaultView.getComputedStyle(control);
    const surface = control.closest(".cr-surface-porcelain, .cr-surface-sea-ink, .cr-surface-cobalt");
    const dark = surface?.classList.contains("cr-surface-sea-ink") || surface?.classList.contains("cr-surface-cobalt");
    const expected = dark ? "#F3CF4C" : "#1646C8";
    const background = surface?.classList.contains("cr-surface-sea-ink") ? "#123047"
      : surface?.classList.contains("cr-surface-cobalt") ? "#1646C8" : "#FFF9EE";
    assert.equal(style.getPropertyValue("--cr-focus-ring").trim().toUpperCase(), expected);
    assert.ok(contrast(expected, background) >= 3);
  }
  const css = document.querySelector("style")?.textContent ?? "";
  assert.match(css, /:focus-visible\s*\{[^}]*outline:\s*3px solid var\(--cr-focus-ring\)/s);
});

test("mounted countdown resets for a new target, clamps at zero, and clears timers at zero and unmount", async () => {
  const dom = new JSDOM("<div id='root'></div>", { pretendToBeVisual: true, url: "https://invitation.test/" });
  const keys = ["window", "document", "HTMLElement", "IS_REACT_ACT_ENVIRONMENT"];
  const previous = Object.fromEntries(keys.map((key) => [key, globalThis[key]]));
  const realNow = Date.now;
  let now = 1_000_000;
  let nextTimer = 0;
  const callbacks = new Map();
  const cleared = [];
  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
    HTMLElement: dom.window.HTMLElement,
    IS_REACT_ACT_ENVIRONMENT: true,
  });
  Date.now = () => now;
  dom.window.setInterval = (callback) => {
    nextTimer += 1;
    callbacks.set(nextTimer, callback);
    return nextTimer;
  };
  dom.window.clearInterval = (timer) => {
    cleared.push(timer);
    callbacks.delete(timer);
  };

  const { CountdownSection } = loadTheme().load("themes/cobalt-riviera/sections/CountdownSection");
  const root = createRoot(document.getElementById("root"));
  try {
    await act(async () => root.render(React.createElement(CountdownSection, { target: now + 5_000, calendarEvent: null, calendarUid: "uid" })));
    assert.equal(document.querySelector('[data-unit="seconds"]')?.textContent, "05");
    const firstTimer = nextTimer;

    await act(async () => root.render(React.createElement(CountdownSection, { target: now + 9_000, calendarEvent: null, calendarUid: "uid" })));
    assert.equal(document.querySelector('[data-unit="seconds"]')?.textContent, "09", "new target must reset displayed time");
    assert.ok(cleared.includes(firstTimer), "changing target clears the old timer");
    const activeTimer = nextTimer;

    now += 10_000;
    await act(async () => callbacks.get(activeTimer)?.());
    assert.deepEqual([...document.querySelectorAll("#cr-countdown dd")].map((node) => node.textContent), ["00", "00", "00", "00"]);
    assert.ok(cleared.includes(activeTimer), "reaching zero clears the active timer");

    await act(async () => root.unmount());
    assert.ok(cleared.filter((timer) => timer === activeTimer).length >= 2, "unmount cleanup clears the active timer");
  } finally {
    Date.now = realNow;
    Object.assign(globalThis, previous);
    dom.window.close();
  }
});

const calendarEvent = {
  title: "Upacara Pernikahan — Mira & Raka", date: "2030-10-20", startTime: "16:30", endTime: "20:30",
  location: "Riviera Pavilion", description: "Undangan Mira & Raka", timeZone: "Asia/Jakarta",
};

test("countdown omits null and non-finite targets unless a calendar event remains", () => {
  const { CountdownSection } = loadTheme().load("themes/cobalt-riviera/sections/CountdownSection");
  for (const target of [null, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
    assert.equal(renderToStaticMarkup(React.createElement(CountdownSection, { target, calendarEvent: null, calendarUid: "uid" })), "");
    const document = new JSDOM(renderToStaticMarkup(
      React.createElement(CountdownSection, { target, calendarEvent, calendarUid: "uid" }),
    )).window.document;
    assert.equal(document.querySelector("section")?.id, "cr-countdown");
    assert.equal(document.querySelector("dd"), null);
    assert.match(document.querySelector("h2")?.textContent ?? "", /Simpan tanggalnya/);
    assert.equal(document.querySelectorAll(".cr-calendar-actions").length, 1);
  }
});

test("countdown calendar download builds the .ics from the primary event and its stable uid", async (t) => {
  const dom = new JSDOM("<div id='root'></div>", { pretendToBeVisual: true, url: "https://invitation.test/" });
  const keys = ["window", "document", "HTMLElement", "IS_REACT_ACT_ENVIRONMENT"];
  const previous = Object.fromEntries(keys.map((key) => [key, globalThis[key]]));
  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
    HTMLElement: dom.window.HTMLElement,
    IS_REACT_ACT_ENVIRONMENT: true,
  });
  const { CountdownSection } = loadTheme().load("themes/cobalt-riviera/sections/CountdownSection");
  const root = createRoot(document.getElementById("root"));
  try {
    let downloaded;
    const create = t.mock.method(URL, "createObjectURL", (blob) => { downloaded = blob; return "blob:cobalt-calendar"; });
    const revoke = t.mock.method(URL, "revokeObjectURL", () => {});
    const click = t.mock.method(dom.window.HTMLAnchorElement.prototype, "click", function () {
      assert.match(this.download, /\.ics$/);
    });
    await act(async () => root.render(React.createElement(CountdownSection, {
      target: null, calendarEvent, calendarUid: "cobalt-itinerary-event-0@invitation.digital",
    })));
    const button = document.querySelector("#cr-countdown button[aria-label^='Unduh kalender']");
    assert.ok(button);
    await act(async () => button.click());
    assert.equal(create.mock.callCount(), 1);
    assert.equal(click.mock.callCount(), 1);
    assert.equal(revoke.mock.calls[0].arguments[0], "blob:cobalt-calendar");
    const text = await downloaded.text();
    assert.match(text, /UID:cobalt-itinerary-event-0@invitation\.digital/);
    assert.match(text, /DTSTART:20301020T093000Z/);
    assert.match(text, /DTEND:20301020T133000Z/);
    assert.match(text, /SUMMARY:Upacara Pernikahan — Mira & Raka/);
    await act(async () => root.unmount());
  } finally {
    Object.assign(globalThis, previous);
    dom.window.close();
  }
});

test("theme wires the countdown calendar uid from the invitation and earliest event", () => {
  const source = readFileSync(resolve(sourceRoot, "themes/cobalt-riviera/CobaltRiviera.tsx"), "utf8");
  assert.match(source, /calendarUid=\{`\$\{invitation\.id\}-\$\{primaryEvent\?\.id \?\? "main"\}@invitation\.digital`\}/);
});
