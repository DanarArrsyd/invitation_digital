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

test("safe maps and shared event-specific calendar actions remain attached to their row", () => {
  const document = render();
  const row = document.querySelector("#cr-acara [data-event-item='event-0']");
  const maps = row?.querySelector("a[aria-label^='Buka Maps']");
  assert.equal(maps?.getAttribute("href"), "https://maps.example.test/venue-0");
  assert.equal(maps?.getAttribute("target"), "_blank");
  assert.match(maps?.getAttribute("rel") ?? "", /noopener/);
  const google = row?.querySelector("a[aria-label^='Google Kalender']");
  assert.match(google?.getAttribute("href") ?? "", /^https:\/\/calendar\.google\.com\/calendar\/render\?/);
  assert.equal(new URL(google?.getAttribute("href") ?? "").searchParams.get("text"), "Upacara Pernikahan — Mira & Raka");
  assert.ok(row?.querySelector("button[aria-label^='Unduh kalender']"));
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
  assert.equal(document.querySelector("#cr-countdown"), null);
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
    ...document.querySelectorAll("#cr-livestream a"),
  ];
  assert.ok(controls.length >= 4);
  for (const control of controls) {
    control.focus();
    const style = document.defaultView.getComputedStyle(control);
    const surface = control.closest(".cr-surface-porcelain, .cr-surface-sea-ink");
    const expected = surface?.classList.contains("cr-surface-sea-ink") ? "#F3CF4C" : "#1646C8";
    const background = surface?.classList.contains("cr-surface-sea-ink") ? "#123047" : "#FFF9EE";
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
    await act(async () => root.render(React.createElement(CountdownSection, { target: now + 5_000 })));
    assert.equal(document.querySelector('[data-unit="seconds"]')?.textContent, "05");
    const firstTimer = nextTimer;

    await act(async () => root.render(React.createElement(CountdownSection, { target: now + 9_000 })));
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

test("countdown omits null and non-finite targets", () => {
  const { CountdownSection } = loadTheme().load("themes/cobalt-riviera/sections/CountdownSection");
  for (const target of [null, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
    assert.equal(renderToStaticMarkup(React.createElement(CountdownSection, { target })), "");
  }
});
