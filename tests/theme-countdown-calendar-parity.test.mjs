import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
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

function loadTheme(entry) {
  const cache = new Map();
  function load(file) {
    const path = [file, `${file}.tsx`, `${file}.ts`, `${file}/index.ts`].find(existsSync);
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
      require(name) {
        if (name === "next/font/google") return Object.fromEntries(
          ["Cormorant_Garamond", "Jost", "Fraunces", "Manrope"].map(font => [font, () => ({ variable: font })]),
        );
        if (name === "next/script") return { __esModule: true, default: () => null };
        if (name === "@/app/(public)/[slug]/actions") return { trackCoverOpenedAction: async () => {} };
        if (name === "@/themes/shared/use-invitation-cover") return {
          useInvitationCover: () => ({ opened: true, playing: false, canPlayMusic: false,
            reducedMotion: false, audioRef: React.createRef(), contentRef: React.createRef(),
            openInvitation: () => {}, toggleMusic: () => {} }),
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

const features = {
  music: false, countdown: true, maps: true, story: false, gallery: false,
  dressCode: false, livestream: false, rsvp: false, wishes: false, gift: false,
  guestPersonalization: false,
};

function invitation(overrides = {}) {
  return {
    id: "parity", type: "wedding", slug: "parity", title: "Alya & Bima", status: "published",
    eventDate: "2030-10-20", venueSummary: "Kebun", publishedAt: "2030-01-01T00:00:00Z", expiresAt: null,
    theme: { slug: "nusantara-ivory", settings: {} }, people: [],
    events: [{ id: "event", eventType: "ceremony", title: "Pertemuan", eventDate: "2030-10-20",
      startTime: "09:30:00", endTime: "11:00:00", venueName: "Kebun", address: null,
      mapsUrl: null, livestreamUrl: null, sortOrder: 0 }],
    stories: [], gallery: [], gifts: [], wishes: [],
    content: { openingQuote: null, openingMessage: null, closingMessage: null },
    features: { ...features }, media: { coverImageUrl: null, musicUrl: null }, ...overrides,
  };
}

function renderTheme(theme, normalized = invitation()) {
  const entry = theme === "ivory" ? "themes/nusantara-ivory/index" : "themes/terra-botanica/index";
  const themeExports = loadTheme(entry);
  const Component = theme === "ivory" ? themeExports.NusantaraIvory : themeExports.TerraBotanica;
  const html = renderToStaticMarkup(React.createElement(Component, { invitation: normalized, guest: null }));
  return new JSDOM(html).window.document;
}

if (process.env.THEME_PARITY_TIMEZONE_PROBE) {
  test("both countdowns use the event's WIB instant", (t) => {
    t.mock.timers.enable({ apis: ["Date"], now: Date.parse("2030-10-20T02:29:58Z") });
    const ivory = renderTheme("ivory");
    const terra = renderTheme("terra");
    assert.deepEqual([...ivory.querySelectorAll(".ni-panel-dark .tabular-nums")].map(node => node.textContent), ["00", "00", "00", "02"]);
    assert.deepEqual([...terra.querySelectorAll("#tb-countdown dd")].map(node => node.textContent), ["00", "00", "00", "02"]);
  });
} else {
  test("both registered themes count down to the same WIB instant in three viewer timezones", () => {
    for (const timezone of ["UTC", "Asia/Jakarta", "America/Los_Angeles"]) {
      const environment = { ...process.env, TZ: timezone, THEME_PARITY_TIMEZONE_PROBE: "1" };
      for (const key of Object.keys(environment)) if (key.startsWith("NODE_TEST_")) delete environment[key];
      const result = spawnSync(process.execPath, ["--test", "--test-name-pattern=^both countdowns use the event's WIB instant$", fileURLToPath(import.meta.url)], {
        env: environment, encoding: "utf8",
      });
      assert.equal(result.status, 0, `${timezone}: ${result.stdout}\n${result.stderr}`);
    }
  });
}

test("both themes provide calendar actions for the same valid event when countdown is disabled", () => {
  const normalized = invitation({ features: { ...features, countdown: false } });
  for (const theme of ["ivory", "terra"]) {
    const document = renderTheme(theme, normalized);
    assert.equal(document.querySelectorAll(".ni-panel-dark .tabular-nums, #tb-countdown").length, 0, theme);
    const calendar = theme === "ivory"
      ? document.querySelector(".ni-addcal-trigger")
      : document.querySelector("#tb-acara .tb-calendar-actions a");
    assert.ok(calendar, `${theme} offers the supplied event without countdown`);
  }
});

test("both themes omit calendar actions for an event without a positive interval", () => {
  const normalized = invitation({ events: [{ ...invitation().events[0], endTime: null }], features: { ...features, countdown: false } });
  for (const theme of ["ivory", "terra"]) {
    const document = renderTheme(theme, normalized);
    assert.equal(document.querySelector(".ni-addcal-trigger, .tb-calendar-actions"), null, theme);
  }
});
