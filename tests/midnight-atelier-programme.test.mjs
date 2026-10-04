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
    title: index === 0 ? "The Ceremony" : `Evening Act ${index + 1}`,
    eventDate: `2030-10-${String(20 + index).padStart(2, "0")}`,
    startTime: "18:30:00", endTime: "20:30:00",
    venueName: "The Langham Jakarta — Grand Ballroom with an intentionally long venue name",
    address: "District 8, SCBD, Jalan Jenderal Sudirman kavling yang sangat panjang, Jakarta Selatan",
    mapsUrl: `https://maps.example.test/venue-${index}`,
    livestreamUrl: `https://stream.example.test/event-${index}`,
    sortOrder: index,
    ...overrides,
  };
}

function fixture(overrides = {}) {
  return {
    id: "midnight-programme", type: "wedding", slug: "midnight-programme", title: "Nadia & Arka", status: "published",
    eventDate: "2030-10-20", venueSummary: null, publishedAt: "2026-09-30T00:00:00Z", expiresAt: null,
    theme: { slug: "midnight-atelier", settings: { dressCode: {
      description: "Black tie with a touch of oxblood.",
      groups: [{ label: "Evening palette", colors: ["#0A0A0C", "#6D1727", "bad-color"] }],
    } } },
    people: [
      { id: "nadia", role: "bride", fullName: "Nadia Rahmani", nickname: "Nadia", fatherName: null, motherName: null, photoUrl: null, bio: null, sortOrder: 0 },
      { id: "arka", role: "groom", fullName: "Arka Pradipta", nickname: "Arka", fatherName: null, motherName: null, photoUrl: null, bio: null, sortOrder: 1 },
    ],
    events: [event()], stories: [], gallery: [], gifts: [], wishes: [],
    content: { openingQuote: null, openingMessage: null, closingMessage: null },
    features: { ...baseFeatures }, media: { coverImageUrl: null, musicUrl: null },
    ...overrides,
  };
}

function render(invitation = fixture()) {
  const { MidnightAtelier } = loadTheme().load("themes/midnight-atelier");
  return new JSDOM(renderToStaticMarkup(React.createElement(MidnightAtelier, { invitation, guest: null }))).window.document;
}

test("evening programme renders one through five ordered events without truncating venue data", () => {
  for (const length of [1, 5]) {
    const events = Array.from({ length }, (_, index) => event(index));
    const document = render(fixture({ events }));
    const rows = [...document.querySelectorAll("#ma-acara [data-event-item]")];
    assert.equal(rows.length, length);
    rows.forEach((row, index) => {
      assert.equal(row.getAttribute("data-event-item"), `event-${index}`);
      assert.equal(row.querySelector(".ma-event-index")?.textContent, String(index + 1).padStart(2, "0"));
      assert.match(row.textContent, /Grand Ballroom with an intentionally long venue name/);
      assert.match(row.textContent, /Jakarta Selatan/);
    });
  }
});

test("programme rows expose safe event-specific maps but no calendar actions", () => {
  const document = render(fixture({ events: [event(0), event(1)] }));
  const row = document.querySelector("#ma-acara [data-event-item='event-0']");
  const maps = row?.querySelector("a[aria-label^='Buka Maps']");
  assert.equal(maps?.getAttribute("href"), "https://maps.example.test/venue-0");
  assert.equal(maps?.getAttribute("target"), "_blank");
  assert.match(maps?.getAttribute("rel") ?? "", /noopener/);
  assert.equal(document.querySelector("#ma-acara .ma-calendar-actions"), null);
  assert.equal(document.querySelector("#ma-acara a[aria-label^='Google Kalender'], #ma-acara button[aria-label^='Unduh kalender']"), null);
});

test("countdown holds exactly one calendar action set built from the earliest event", () => {
  const document = render(fixture({ events: [event(1), event(0)] }));
  assert.equal(document.querySelectorAll(".ma-calendar-actions").length, 1);
  const actions = document.querySelector("#ma-countdown .ma-calendar-actions");
  assert.ok(actions, "calendar actions live inside the countdown section");
  const google = actions.querySelector("a[aria-label^='Google Kalender']");
  assert.match(google?.getAttribute("href") ?? "", /^https:\/\/calendar\.google\.com\/calendar\/render\?/);
  assert.equal(new URL(google?.getAttribute("href") ?? "").searchParams.get("text"), "The Ceremony — Nadia & Arka");
  assert.equal(google?.getAttribute("target"), "_blank");
  assert.match(google?.getAttribute("rel") ?? "", /noopener/);
  assert.equal(actions.querySelector("button")?.getAttribute("aria-label"), "Unduh kalender .ics untuk The Ceremony — Nadia & Arka");
  assert.equal(document.querySelectorAll("#ma-countdown .ma-countdown-units dd").length, 4);
});

test("calendar actions stay in the countdown section when the countdown is disabled", () => {
  const document = render(fixture({ features: { ...baseFeatures, countdown: false } }));
  const section = document.querySelector("#ma-countdown");
  assert.ok(section, "countdown section remains for the calendar");
  assert.equal(section.querySelector(".ma-countdown-units"), null, "no clock units without a countdown");
  assert.equal(section.querySelector("h2")?.textContent, "Simpan tanggalnya");
  assert.equal(section.getAttribute("aria-labelledby"), section.querySelector("h2")?.id);
  assert.equal(document.querySelectorAll(".ma-calendar-actions").length, 1);
  assert.ok(section.querySelector(".ma-calendar-actions a[aria-label^='Google Kalender']"));
});

test("calendar actions disappear when the earliest event has no valid positive same-day interval", () => {
  for (const overrides of [{ endTime: null }, { endTime: "17:00:00" }, { startTime: null }, { eventDate: "2030-02-31" }]) {
    const broken = [event(0, overrides)];
    const withCountdown = render(fixture({ events: broken }));
    assert.equal(withCountdown.querySelector(".ma-calendar-actions"), null, JSON.stringify(overrides));
    const withoutCountdown = render(fixture({ events: broken, features: { ...baseFeatures, countdown: false } }));
    assert.equal(withoutCountdown.querySelector("#ma-countdown"), null, `${JSON.stringify(overrides)} leaves no empty countdown`);
  }
});

test("countdown .ics action downloads the earliest event calendar file", async () => {
  const dom = new JSDOM("<div id='root'></div>", { pretendToBeVisual: true, url: "https://invitation.test/" });
  const keys = ["window", "document", "HTMLElement", "IntersectionObserver", "requestAnimationFrame", "IS_REACT_ACT_ENVIRONMENT"];
  const previous = Object.fromEntries(keys.map((key) => [key, globalThis[key]]));
  const { createObjectURL, revokeObjectURL } = URL;
  const blobs = [];
  const revoked = [];
  const clicks = [];
  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
    HTMLElement: dom.window.HTMLElement,
    IntersectionObserver: class { observe() {} disconnect() {} },
    requestAnimationFrame: dom.window.requestAnimationFrame.bind(dom.window),
    IS_REACT_ACT_ENVIRONMENT: true,
  });
  URL.createObjectURL = (blob) => { blobs.push(blob); return "blob:calendar"; };
  URL.revokeObjectURL = (url) => revoked.push(url);
  dom.window.HTMLAnchorElement.prototype.click = function click() {
    clicks.push({ href: this.getAttribute("href"), download: this.getAttribute("download") });
  };
  const { MidnightAtelier } = loadTheme().load("themes/midnight-atelier");
  const root = createRoot(dom.window.document.getElementById("root"));
  try {
    await act(async () => root.render(React.createElement(MidnightAtelier, {
      invitation: fixture({ events: [event(1), event(0)] }), guest: null,
    })));
    const button = dom.window.document.querySelector("#ma-countdown button[aria-label^='Unduh kalender']");
    assert.ok(button);
    await act(async () => button.click());
    assert.deepEqual(clicks, [{ href: "blob:calendar", download: "the-ceremony-nadia-arka.ics" }]);
    assert.deepEqual(revoked, ["blob:calendar"]);
    assert.equal(blobs.length, 1);
    const ics = await blobs[0].text();
    assert.match(ics, /BEGIN:VCALENDAR/);
    assert.match(ics, /UID:midnight-programme-event-0@invitation\.digital/);
    assert.match(ics, /SUMMARY:The Ceremony — Nadia & Arka/);
    assert.match(ics, /DTSTART:20301020T113000Z/);
  } finally {
    await act(async () => root.unmount());
    URL.createObjectURL = createObjectURL;
    URL.revokeObjectURL = revokeObjectURL;
    Object.assign(globalThis, previous);
    dom.window.close();
  }
});

test("invalid dates, time intervals, and unsafe URLs never become actions", () => {
  const broken = event(0, {
    eventDate: "2030-02-31", startTime: "25:00", endTime: "17:00",
    mapsUrl: "javascript:alert(1)", livestreamUrl: "data:text/html,unsafe",
  });
  const document = render(fixture({ events: [broken] }));
  const row = document.querySelector("#ma-acara [data-event-item]");
  assert.ok(row, "partial event remains readable");
  assert.match(row.textContent, /The Ceremony/);
  assert.equal(row.querySelector("time"), null);
  assert.equal(row.querySelector(".ma-event-time"), null);
  assert.equal(document.querySelector(".ma-calendar-actions"), null);
  assert.equal(row.querySelector("a[aria-label^='Buka Maps']"), null);
  assert.equal(document.querySelector("#ma-livestream"), null);
});

test("countdown uses four non-negative units and clamps an elapsed target to zero", () => {
  const future = render();
  assert.deepEqual([...future.querySelectorAll("#ma-countdown dd")].map((node) => node.getAttribute("data-unit")), ["days", "hours", "minutes", "seconds"]);
  assert.ok([...future.querySelectorAll("#ma-countdown dd")].every((node) => /^\d{2,}$/.test(node.textContent)));
  const elapsed = render(fixture({ eventDate: "2020-01-01", events: [event(0, { eventDate: "2020-01-01" })] }));
  assert.deepEqual([...elapsed.querySelectorAll("#ma-countdown dd")].map((node) => node.textContent), ["00", "00", "00", "00"]);
});

test("dress code keeps valid labelled swatches and livestream keeps only safe links", () => {
  const document = render(fixture({ events: [event(0), event(1, { livestreamUrl: "javascript:alert(1)" })] }));
  assert.match(document.querySelector("#ma-dress-code")?.textContent ?? "", /Black tie with a touch of oxblood/);
  const colors = [...document.querySelectorAll("#ma-dress-code .ma-dress-swatch + span")].map((node) => node.textContent);
  assert.deepEqual(colors, ["#0A0A0C", "#6D1727"]);
  const streams = [...document.querySelectorAll("#ma-livestream a")];
  assert.equal(streams.length, 1);
  assert.equal(streams[0].getAttribute("href"), "https://stream.example.test/event-0");
});

test("disabled programme features stay absent while events remain useful", () => {
  const document = render(fixture({ features: { ...baseFeatures, countdown: false, maps: false, dressCode: false, livestream: false } }));
  assert.ok(document.querySelector("#ma-acara"));
  assert.equal(document.querySelector("#ma-acara a[aria-label^='Buka Maps']"), null);
  assert.equal(document.querySelector("#ma-countdown .ma-countdown-units"), null);
  assert.ok(document.querySelector("#ma-countdown .ma-calendar-actions"), "calendar survives a disabled countdown");
  assert.equal(document.querySelector("#ma-dress-code"), null);
  assert.equal(document.querySelector("#ma-livestream"), null);
});

test("empty events omit programme-dependent sections and CSS protects compact viewports", () => {
  const document = render(fixture({ events: [], eventDate: null }));
  for (const id of ["ma-acara", "ma-countdown", "ma-livestream"]) assert.equal(document.getElementById(id), null);
  const css = document.querySelector("style")?.textContent ?? "";
  assert.match(css, /\.ma-event[^}]*overflow-wrap:\s*anywhere/s);
  assert.match(css, /\.ma-event-actions[^}]*min-height:\s*48px/s);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.doesNotMatch(css, /linear-gradient|conic-gradient/); // radial light is confined by midnight-atelier-identity
});
