import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import vm from "node:vm";

import { JSDOM } from "jsdom";
import ts from "typescript";

// OrderLink renders the default WhatsApp message on the server, hydrates
// without a mismatch, then adds the visit source from utm_* or sessionStorage.

const nodeRequire = createRequire(import.meta.url);
const srcRoot = fileURLToPath(new URL("../src/", import.meta.url));
const React = nodeRequire("react");
const tracked = [];
const STUBS = { "@vercel/analytics": { track: (name, props) => tracked.push({ name, props }) } };

function createLoader() {
  const cache = new Map();
  function load(file) {
    const path = [`${file}.tsx`, `${file}.ts`].find((candidate) => existsSync(candidate));
    if (!path) throw new Error(`Missing module ${file}`);
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

const SETTINGS = {
  whatsappNumber: "6281295575991",
  whatsappMessage: "Halo Temuraya, saya mau pesan template {template} paket {paket} untuk {acara}.",
  instagramUrl: null,
};
const GLOBALS = ["window", "document", "navigator", "HTMLElement", "Node", "Element"];

async function renderAndHydrate(url, { storage = null, blockStorage = false } = {}) {
  const element = (load) =>
    React.createElement(load("components/marketing/order-link").OrderLink, { settings: SETTINGS, values: { paket: "Signature" } }, "Pesan");
  const html = nodeRequire("react-dom/server").renderToString(element(createLoader()));

  const dom = new JSDOM(`<div id="root">${html}</div>`, { url });
  if (storage) dom.window.sessionStorage.setItem("temuraya:visit-source", storage);
  if (blockStorage) {
    Object.defineProperty(dom.window, "sessionStorage", { get() { throw new Error("SecurityError"); } });
  }
  const saved = Object.fromEntries(GLOBALS.map((key) => [key, globalThis[key]]));
  for (const key of GLOBALS) Object.defineProperty(globalThis, key, { value: dom.window[key], configurable: true, writable: true });
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const warnings = [];
  const originalError = console.error;
  console.error = (...args) => warnings.push(args.map(String).join(" "));
  try {
    const { act } = React;
    const root = dom.window.document.getElementById("root");
    await act(async () => {
      nodeRequire("react-dom/client").hydrateRoot(root, element(createLoader()), {
        onRecoverableError: (error) => warnings.push(String(error)),
      });
    });
    const link = root.querySelector("a");
    return {
      serverText: decodeURIComponent(html.match(/text=([^"&]+)/)[1]),
      clientText: decodeURIComponent(new URL(link.href).searchParams.get("text")),
      link,
      stored: blockStorage ? null : dom.window.sessionStorage.getItem("temuraya:visit-source"),
      warnings,
    };
  } finally {
    console.error = originalError;
    for (const key of GLOBALS) Object.defineProperty(globalThis, key, { value: saved[key], configurable: true, writable: true });
  }
}

const DEFAULT = "Halo Temuraya, saya mau pesan paket Signature.";

test("utm parameters reach the message after hydration, without a mismatch", async () => {
  const result = await renderAndHydrate("https://temuraya.test/?utm_source=instagram&utm_campaign=poster-uts");
  assert.equal(result.serverText, DEFAULT);
  assert.equal(result.clientText, `${DEFAULT} (Sumber: instagram/poster-uts)`);
  assert.deepEqual(JSON.parse(result.stored), { source: "instagram", campaign: "poster-uts" });
  assert.deepEqual(result.warnings, []);
});

test("a later page without utm keeps the remembered source", async () => {
  const result = await renderAndHydrate("https://temuraya.test/template/janji-kota", {
    storage: JSON.stringify({ source: "whatsapp", campaign: "status-uts" }),
  });
  assert.equal(result.clientText, `${DEFAULT} (Sumber: whatsapp/status-uts)`);
  assert.deepEqual(result.warnings, []);
});

test("without a source, or with blocked storage, the message stays default", async () => {
  assert.equal((await renderAndHydrate("https://temuraya.test/")).clientText, DEFAULT);
  const blocked = await renderAndHydrate("https://temuraya.test/", { blockStorage: true });
  assert.equal(blocked.clientText, DEFAULT);
  assert.deepEqual(blocked.warnings, []);
});

test("a click sends wa_click with paket and source", async () => {
  tracked.length = 0;
  const result = await renderAndHydrate("https://temuraya.test/?utm_source=instagram&utm_campaign=poster-uts");
  result.link.addEventListener("click", (event) => event.preventDefault());
  await React.act(async () => {
    result.link.dispatchEvent(new result.link.ownerDocument.defaultView.MouseEvent("click", { bubbles: true, cancelable: true }));
  });
  assert.deepEqual(tracked, [{ name: "wa_click", props: { paket: "Signature", source: "instagram/poster-uts" } }]);
});

test("analytics drops admin pages and guest identifiers", () => {
  const { redactAnalyticsEvent } = createLoader()("components/analytics/web-analytics");
  assert.equal(redactAnalyticsEvent({ type: "pageview", url: "https://temuraya.test/admin/invitations" }), null);
  assert.equal(
    redactAnalyticsEvent({ type: "pageview", url: "https://temuraya.test/nama-acara?guest=abc123&utm_source=instagram" }).url,
    "https://temuraya.test/nama-acara?utm_source=instagram",
  );
  assert.equal(
    redactAnalyticsEvent({ type: "pageview", url: "https://temuraya.test/demo/janji-kota?paket=grand&to=Budi" }).url,
    "https://temuraya.test/demo/janji-kota?paket=grand",
  );
});
