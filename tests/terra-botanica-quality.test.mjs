import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
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
const terraRoot = resolve(sourceRoot, "themes/terra-botanica");

function loadSource(entry) {
  const cache = new Map();
  function load(file) {
    const path = [file, `${file}.tsx`, `${file}.ts`, `${file}/index.ts`].find(existsSync);
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
        if (name === "next/font/google") return Object.fromEntries(["Fraunces", "Manrope"].map((font) => [font, () => ({ variable: font })]));
        if (name === "next/script") return { __esModule: true, default: () => null };
        if (name === "@/app/(public)/[slug]/actions") return {
          trackCoverOpenedAction: async () => {}, submitRsvpAction: async () => ({ status: "success" }), submitWishAction: async () => ({ status: "success" }),
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
  dressCode: true, livestream: true, rsvp: true, wishes: true, gift: true, guestPersonalization: true,
};

function fixture(features = allFeatures) {
  return {
    id: "quality", type: "wedding", slug: "quality", title: "Nara & Bima", status: "published",
    eventDate: "2026-10-20", venueSummary: "Taman", publishedAt: "2026-09-01T00:00:00Z", expiresAt: null,
    theme: { slug: "terra-botanica", settings: { personSocials: { person: { instagram: "@nara" } }, dressCode: { description: "Warna bumi", groups: [] } } },
    people: [{ id: "person", role: "bride", fullName: "Nara Kusuma", nickname: null, fatherName: null, motherName: null, photoUrl: null, bio: null, sortOrder: 0 }],
    events: [{ id: "event", eventType: "ceremony", title: "Pertemuan", eventDate: "2026-10-20", startTime: "09:00", endTime: "10:00", venueName: "Taman", address: null, mapsUrl: "https://maps.example.test/", livestreamUrl: "https://live.example.test/", sortOrder: 0 }],
    stories: [{ id: "story", title: "Cerita", storyDate: null, yearLabel: null, description: "Kami bertemu.", imageUrl: null, sortOrder: 0 }],
    gallery: [{ id: "photo", imageUrl: "/test.jpg", caption: null, altText: "Nara dan Bima di taman", aspectRatio: "portrait_4_5", sortOrder: 0 }],
    gifts: [{ id: "gift", providerType: "bank", providerName: "Bank", accountNumber: "123", accountName: "Nara", logoUrl: null, sortOrder: 0 }],
    wishes: [], content: { openingQuote: "Bertumbuh bersama", openingMessage: null, closingMessage: null },
    features, media: { coverImageUrl: null, musicUrl: "/music.mp3" },
  };
}

function render(invitation) {
  const { TerraBotanica } = loadSource("themes/terra-botanica/index");
  return new JSDOM(renderToStaticMarkup(React.createElement(TerraBotanica, { invitation, guest: { id: "guest", displayName: "Tamu Panjang", token: "token", notes: null } }))).window.document;
}

// A voice-control command naming the visible handle must target the real link.
test("Instagram link accessible name includes its visible @username", () => {
  const link = render(fixture()).querySelector("#tb-mempelai .tb-instagram");
  assert.ok(link);
  assert.equal(link.textContent.trim(), "@nara");
  assert.match(link.getAttribute("aria-label"), /@nara\b/);
});

// A removed guard must expose a duplicate or disabled chapter in rendered output.
test("feature-controlled sections render once when enabled and disappear when disabled", () => {
  const enabled = render(fixture());
  const disabled = render(fixture(Object.fromEntries(Object.keys(allFeatures).map((key) => [key, false]))));
  for (const id of ["tb-countdown", "tb-dress-code", "tb-cerita", "tb-galeri", "tb-livestream", "tb-rsvp", "tb-ucapan", "tb-kado"]) {
    assert.equal(enabled.querySelectorAll(`#${id}`).length, 1, `${id} enabled exactly once`);
    assert.equal(disabled.querySelectorAll(`#${id}`).length, 0, `${id} disabled`);
  }
  assert.equal(disabled.querySelector("audio"), null, "disabled music creates no audio element");
  assert.equal(disabled.querySelector("#tb-cover .tb-guest-name").textContent, "Bapak/Ibu/Saudara/i");
  assert.equal(disabled.querySelector("#tb-acara a[href*='maps']"), null);
});

test("each disabled feature removes only its own section", () => {
  const sections = new Map([
    ["countdown", "tb-countdown"], ["dressCode", "tb-dress-code"],
    ["story", "tb-cerita"], ["gallery", "tb-galeri"],
    ["livestream", "tb-livestream"], ["rsvp", "tb-rsvp"],
    ["wishes", "tb-ucapan"], ["gift", "tb-kado"],
  ]);
  for (const [disabledFeature, disabledId] of sections) {
    const document = render(fixture({ ...allFeatures, [disabledFeature]: false }));
    assert.equal(document.querySelectorAll(`#${disabledId}`).length, 0, `${disabledFeature} removes ${disabledId}`);
    for (const [otherFeature, otherId] of sections) {
      if (otherFeature === disabledFeature) continue;
      assert.equal(document.querySelectorAll(`#${otherId}`).length, 1,
        `${disabledFeature} leaves ${otherFeature} visible exactly once`);
    }
  }
});

// Removing these rules would expose motion, clipped mobile content, or cramped focus/controls.
test("rendered Terra styles reserve media space and enforce motion, focus, and mobile bounds", () => {
  const document = render(fixture());
  const css = document.querySelector("style").textContent;
  assert.match(css, /overflow-x:\s*clip/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /animation:\s*none\s*!important/);
  assert.match(css, /transition:\s*none\s*!important/);
  assert.match(css, /:focus-visible\s*\{\s*outline:\s*3px/);
  assert.match(css, /\.tb-media\s*\{[^}]*aspect-ratio:/);
  assert.match(css, /\.tb-action\s*\{[^}]*min-height:\s*5[02]px/);
  const image = document.querySelector("#tb-galeri img");
  assert.ok(image.closest(".tb-media").style.aspectRatio, "slow image keeps an explicit ratio");
  assert.equal(image.getAttribute("loading"), "lazy");
  for (const form of document.querySelectorAll(".tb-form")) {
    assert.ok(form.querySelector("label, legend"), "public form fields have visible labels");
    assert.ok(form.querySelector('[role="alert"]') === null, "fresh form has no error alert");
  }
});

function sourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? sourceFiles(path) : /\.tsx?$/.test(path) ? [path] : [];
  });
}

// A direct image or database/browser query bypasses the theme presentation boundary.
test("Terra source keeps media and data behind the approved boundaries", () => {
  const source = sourceFiles(terraRoot).map((path) => readFileSync(path, "utf8")).join("\n");
  assert.doesNotMatch(source, /<img\b/);
  assert.doesNotMatch(source, /querySelector|supabase|createSupabase/i);
});

// Expiration must short-circuit before theme rendering and opening analytics.
test("expired public route renders its expiry state without mounting either theme", async () => {
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
      if (name === "next/server") return { after: () => { analyticsCalls++; } };
      if (name === "@/server/public/invitation-loader") return { getPublicInvitationBySlug: async () => ({ kind: "expired", displayName: "Nara & Bima", eventDate: "2026-10-20" }) };
      if (name === "@/lib/analytics/session") return { getSessionId: async () => { analyticsCalls++; return "session"; } };
      if (name === "@/server/public/analytics") return { trackEvent: () => { analyticsCalls++; } };
      if (name === "@/lib/share/invitation-share") return { getInvitationShareData: () => { throw new Error("No share for expired invitation"); } };
      // Side-effect CSS import (theme font faces); nothing to evaluate in Node.
      if (name === "@/themes/theme-fonts") return {};
      if (name === "@/themes/ThemeRenderer") return { ThemeRenderer: () => { themeCalls++; return null; } };
      if (name === "./ExpiredState") return loadSource("app/(public)/[slug]/ExpiredState");
      throw new Error(`Unexpected import ${name}`);
    },
  });
  const element = await exports.default({ params: Promise.resolve({ slug: "expired" }), searchParams: Promise.resolve({ guest: "token" }) });
  const html = renderToStaticMarkup(element);
  assert.match(html, /Masa berlaku undangan ini sudah berakhir\./);
  assert.match(html, /Nara &amp; Bima/);
  assert.equal(themeCalls, 0);
  assert.equal(analyticsCalls, 0);
});
