import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import vm from "node:vm";

import { JSDOM } from "jsdom";
import ts from "typescript";

import { DEMOS, GIFTS, IMAGE_SLOTS, STORIES, WISHES, imagePath } from "../scripts/demo/content.mjs";

// Round C: each event type reads as its own invitation. Every theme is
// mounted in jsdom for every type, opened like a guest would, and its text
// plus every aria-label is checked. Admin messages are blanked: they are
// customer data, and Kelir's empty-closing fallback must follow the type.

const nodeRequire = createRequire(import.meta.url);
const srcRoot = fileURLToPath(new URL("../src/", import.meta.url));
const React = nodeRequire("react");

const STUBS = {
  "next/image": {
    __esModule: true,
    default: (props) => React.createElement("img", { src: props.src, alt: props.alt, className: props.className }),
  },
  "@/components/TurnstileWidget": { TurnstileWidget: () => null },
  "@/app/(public)/[slug]/actions": {
    trackCoverOpenedAction: async () => {},
    submitRsvpAction: async () => ({}),
    submitWishAction: async () => ({}),
  },
};

function resolveFile(file) {
  for (const candidate of [`${file}.tsx`, `${file}.ts`, file, `${file}/index.ts`, `${file}/index.tsx`]) {
    if (existsSync(candidate) && /\.tsx?$/.test(candidate)) return candidate;
  }
  throw new Error(`Missing module ${file}`);
}

function createLoader() {
  const cache = new Map();
  function load(file) {
    const path = resolveFile(file);
    if (cache.has(path)) return cache.get(path).exports;
    const loaded = { exports: {} };
    cache.set(path, loaded);
    const output = ts.transpileModule(readFileSync(path, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    }).outputText;
    vm.runInThisContext(`(function (exports, module, require) {${output}\n})`)(loaded.exports, loaded, (name) => {
      if (STUBS[name]) return STUBS[name];
      if (name.startsWith("@/")) return load(resolve(srcRoot, name.slice(2)));
      if (name.startsWith(".")) return load(resolve(dirname(path), name));
      return nodeRequire(name);
    });
    return loaded.exports;
  }
  return (relativePath) => load(resolve(srcRoot, relativePath));
}

const GLOBALS = ["window", "document", "navigator", "HTMLElement", "Node", "Element", "IntersectionObserver", "ResizeObserver", "requestAnimationFrame", "cancelAnimationFrame", "getComputedStyle"];

/** Mounts, presses "Buka Undangan", and returns the guest's text and aria-labels. */
async function openedCopy(element) {
  const dom = new JSDOM(`<div id="root"></div>`, { url: "https://invitation.test/", pretendToBeVisual: true });
  const { window } = dom;
  window.matchMedia = (query) => ({
    matches: /prefers-reduced-motion/.test(query), media: query, onchange: null,
    addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false,
  });
  window.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} takeRecords() { return []; } };
  window.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
  window.HTMLElement.prototype.scrollIntoView = () => {};
  window.scrollTo = () => {};
  const prior = Object.fromEntries(GLOBALS.map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  for (const key of GLOBALS) {
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value: key === "window" ? window : window[key] });
  }
  const previousAct = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const originalError = console.error;
  console.error = () => {};
  try {
    const { createRoot } = nodeRequire("react-dom/client");
    const root = createRoot(window.document.getElementById("root"));
    await React.act(async () => root.render(element));
    const open = [...window.document.querySelectorAll("button")].find((button) => /buka undangan/i.test(button.textContent));
    assert.ok(open, "the cover has a Buka Undangan button");
    await React.act(async () => open.click());
    await React.act(async () => new Promise((done) => setTimeout(done, 50)));
    const document = window.document;
    for (const style of document.querySelectorAll("style")) style.remove();
    const text = document.body.textContent.replace(/\s+/g, " ");
    const labels = [...document.querySelectorAll("[aria-label]")].map((node) => node.getAttribute("aria-label"));
    const people = document.querySelector("[id$='-mempelai']")?.textContent.replace(/\s+/g, " ") ?? "";
    await React.act(async () => root.unmount());
    return { text, labels, people };
  } finally {
    console.error = originalError;
    globalThis.IS_REACT_ACT_ENVIRONMENT = previousAct;
    for (const key of GLOBALS) {
      if (prior[key]) Object.defineProperty(globalThis, key, prior[key]);
      else delete globalThis[key];
    }
    window.close();
  }
}

const library = { stories: STORIES, gifts: GIFTS, wishes: WISHES, imageSlots: IMAGE_SLOTS, imagePath };
const TYPES = ["wedding", "engagement", "birthday", "aqiqah", "graduation", "corporate"];
// Words that belong to a wedding, including the theme accents that did.
const WEDDING_ONLY = /mempelai|pernikahan|wedding|doa restu|hari bahagia|dua insan|rosa amoris|cerita pasangan/i;

const loader = createLoader();
const { themeRegistry } = loader("themes/registry");
const { eventCopy } = loader("themes/shared/event-copy");

for (const slug of Object.keys(themeRegistry)) {
  for (const type of TYPES) {
    test(`${slug} ${type} reads as its own event`, async () => {
      const source = DEMOS.find((demo) => demo.theme === slug);
      assert.ok(source, `${slug} has demo content`);
      const copy = eventCopy(type);
      const view = createLoader();
      const { buildQaFixture, QA_DEFAULT_GUEST } = view("lib/qa/fixture-invitation");
      const { ThemeRenderer } = view("themes/ThemeRenderer");
      const { invitation, guest } = buildQaFixture(source, library, { packageKey: "grand", type, condition: "lengkap", guestName: QA_DEFAULT_GUEST });
      const blanked = { ...invitation, content: { ...invitation.content, openingQuote: null, openingMessage: null, closingMessage: null } };
      const { text, labels, people } = await openedCopy(React.createElement(ThemeRenderer, { invitation: blanked, guest }));

      for (const expected of [copy.peopleHeading, copy.peopleNavLabel, copy.storyHeading, copy.giftIntro]) {
        assert.ok(text.includes(expected), `missing "${expected}"`);
      }
      if (type === "wedding") return;
      const leak = text.match(WEDDING_ONLY) ?? labels.join(" | ").match(WEDDING_ONLY);
      assert.equal(leak, null, `wedding copy on a ${type} page: "${leak?.[0]}"`);
      if (type === "corporate") assert.doesNotMatch(people, /\bdari\b/, "corporate hides the parents line");
      if (type === "engagement") assert.match(people, /Putri dari|Putra dari/, "an engagement names each family");
    });
  }
}
