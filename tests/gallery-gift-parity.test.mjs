import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import ts from "typescript";
import vm from "node:vm";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { JSDOM } from "jsdom";

// Capability parity (docs/PROJECT_MEMORY.md, cross-template workflow): every
// registered theme must offer the gallery lightbox and the manual copy
// fallback. These tests mount each theme's real section components.

const nodeRequire = createRequire(import.meta.url);
const srcRoot = fileURLToPath(new URL("../src/", import.meta.url));

const THEMES = [
  { name: "nusantara-ivory", gallery: ["sections/GalleryRows", "GalleryRows"], gift: ["sections/GiftAccountCard", "GiftAccountCard"] },
  { name: "terra-botanica", gallery: ["sections/GallerySection", "GallerySection"], gift: ["sections/GiftAccountCard", "GiftAccountCard"] },
  { name: "midnight-atelier", gallery: ["sections/GallerySection", "GallerySection"], gift: ["sections/GiftAccountLedger", "GiftAccountLedger"] },
  { name: "cobalt-riviera", gallery: ["sections/GallerySection", "GallerySection"], gift: ["sections/GiftReceipt", "GiftReceipt"] },
  { name: "kelir-kencana", gallery: ["sections/GallerySection", "GallerySection"], gift: ["sections/GiftSlip", "GiftSlip"] },
];

const passthrough = ({ children, id }) => React.createElement(id ? "section" : "div", id ? { id } : null, children);
const stubImage = ({ src, alt }) => React.createElement("img", { src, alt });

function createLoader(themeDir) {
  const cache = new Map();
  function load(file) {
    const path = [file, `${file}.tsx`, `${file}.ts`].find((candidate) => existsSync(candidate) && !candidate.endsWith("/"));
    assert.ok(path, `Missing module: ${file}`);
    if (cache.has(path)) return cache.get(path);
    const exports = {};
    cache.set(path, exports);
    const output = ts.transpileModule(readFileSync(path, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
    }).outputText;
    vm.runInNewContext(output, {
      exports,
      module: { exports },
      setTimeout,
      clearTimeout,
      get window() { return globalThis.window; },
      get navigator() { return globalThis.navigator; },
      require(name) {
        if (name === "react" || name === "react/jsx-runtime") return nodeRequire(name);
        if (/\/components\/(EditorialImage|AtelierImage|RivieraImage|KelirImage)$/.test(name)) {
          return { EditorialImage: stubImage, AtelierImage: stubImage, RivieraImage: stubImage, KelirImage: stubImage };
        }
        if (/\/components\/(Section|Reveal)$/.test(name)) return { Section: passthrough, Reveal: passthrough };
        if (/\/components\/SectionHeading$/.test(name)) return { SectionHeading: ({ title }) => React.createElement("h2", null, title) };
        if (name.startsWith("@/")) return load(resolve(srcRoot, name.slice(2)));
        if (name.startsWith(".")) return load(resolve(dirname(path), name));
        throw new Error(`Unexpected import in ${path}: ${name}`);
      },
    });
    return exports;
  }
  return (relative) => load(resolve(srcRoot, "themes", themeDir, relative));
}

async function mount(element) {
  const dom = new JSDOM("<div id='root'></div>", { url: "https://invitation.test/", pretendToBeVisual: true });
  const { HTMLDialogElement } = dom.window;
  // jsdom has <dialog> but not showModal/close; mirror the open state and event.
  HTMLDialogElement.prototype.showModal = function showModal() { this.setAttribute("open", ""); };
  HTMLDialogElement.prototype.close = function close() {
    if (!this.hasAttribute("open")) return;
    this.removeAttribute("open");
    this.dispatchEvent(new dom.window.Event("close"));
  };
  const prior = {
    window: globalThis.window,
    document: globalThis.document,
    navigator: Object.getOwnPropertyDescriptor(globalThis, "navigator"),
    IS_REACT_ACT_ENVIRONMENT: globalThis.IS_REACT_ACT_ENVIRONMENT,
  };
  Object.assign(globalThis, { window: dom.window, document: dom.window.document, IS_REACT_ACT_ENVIRONMENT: true });
  Object.defineProperty(globalThis, "navigator", { configurable: true, value: dom.window.navigator });
  const root = createRoot(dom.window.document.getElementById("root"));
  await act(async () => root.render(element));
  return {
    document: dom.window.document,
    window: dom.window,
    async cleanup() {
      await act(async () => root.unmount());
      Object.assign(globalThis, { window: prior.window, document: prior.document, IS_REACT_ACT_ENVIRONMENT: prior.IS_REACT_ACT_ENVIRONMENT });
      if (prior.navigator) Object.defineProperty(globalThis, "navigator", prior.navigator);
      dom.window.close();
    },
  };
}

const gallery = [
  { id: "g1", imageUrl: "/a.jpg", caption: "Pertama", altText: null, aspectRatio: "portrait_4_5", sortOrder: 0 },
  { id: "g2", imageUrl: "/b.jpg", caption: null, altText: "Foto kedua", aspectRatio: "landscape_16_9", sortOrder: 1 },
  { id: "g3", imageUrl: "/c.jpg", caption: null, altText: null, aspectRatio: "square_1_1", sortOrder: 2 },
];

for (const theme of THEMES) {
  test(`${theme.name}: every gallery photo opens in a browsable, closable lightbox`, async () => {
    const [path, exportName] = theme.gallery;
    const Gallery = createLoader(theme.name)(path)[exportName];
    const view = await mount(React.createElement(Gallery, { gallery, displayName: "Alya & Bima" }));
    try {
      const triggers = [...view.document.querySelectorAll("button")].filter((b) => /^Perbesar foto/.test(b.getAttribute("aria-label") ?? ""));
      assert.equal(triggers.length, 3);
      assert.equal(triggers[0].getAttribute("aria-label"), "Perbesar foto 1 dari 3: Pertama");

      const dialog = view.document.querySelector("dialog");
      assert.equal(dialog.getAttribute("aria-label"), "Foto galeri");
      assert.equal(dialog.open, false);

      await act(async () => triggers[0].click());
      assert.equal(dialog.open, true);
      assert.match(dialog.textContent, /1 \/ 3 · Pertama/);
      assert.equal(view.document.activeElement?.textContent, "Tutup", "focus lands on Close");

      const key = (k) => act(async () => dialog.dispatchEvent(new view.window.KeyboardEvent("keydown", { key: k, bubbles: true })));
      await key("ArrowRight");
      assert.match(dialog.textContent, /2 \/ 3/);
      assert.equal(dialog.querySelector("img").getAttribute("alt"), "Foto kedua");
      await key("ArrowLeft");
      await key("ArrowLeft");
      assert.match(dialog.textContent, /3 \/ 3/, "previous wraps to the last photo");

      await act(async () => [...dialog.querySelectorAll("button")].find((b) => b.textContent === "Tutup").click());
      assert.equal(dialog.open, false);
    } finally {
      await view.cleanup();
    }
  });

  test(`${theme.name}: a blocked clipboard selects the account number and says so`, async () => {
    const [path, exportName] = theme.gift;
    const Gift = createLoader(theme.name)(path)[exportName];
    const gift = { id: "gift", providerType: "bank", providerName: "BCA", accountNumber: "1234567890", accountName: "Alya", logoUrl: null, sortOrder: 0 };
    const view = await mount(React.createElement(Gift, { gift, index: 0 }));
    try {
      Object.defineProperty(view.window.navigator, "clipboard", {
        configurable: true,
        value: { writeText: () => Promise.reject(new Error("denied")) },
      });
      const button = [...view.document.querySelectorAll("button")].find((b) => /Salin/.test(b.textContent));
      await act(async () => button.click());
      const status = view.document.querySelector('[role="status"]');
      assert.match(status.textContent, /Tidak bisa menyalin otomatis/);
      assert.equal(view.window.getSelection().toString(), "1234567890");
    } finally {
      await view.cleanup();
    }
  });
}
