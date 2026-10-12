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

// §28.1: server markup and the first client render must match, including
// for a guest who prefers reduced motion. Each theme is rendered on a "server"
// (no window), then hydrated in jsdom whose matchMedia reports reduced motion;
// any React hydration warning fails the theme.

const nodeRequire = createRequire(import.meta.url);
const srcRoot = fileURLToPath(new URL("../src/", import.meta.url));
const React = nodeRequire("react");

const STUBS = {
  "next/image": {
    __esModule: true,
    // Only what reaches the DOM on both sides; next/image's own props are dropped.
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

/** A fresh module graph per phase, like a separate server and browser. */
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

// motion caches the reduced-motion answer in module state on first use, so a
// shared copy would carry one phase's answer into the other.
function reloadMotion() {
  for (const key of Object.keys(nodeRequire.cache)) {
    if (/node_modules\/(motion|framer-motion|motion-dom|motion-utils)\//.test(key)) delete nodeRequire.cache[key];
  }
}

const GLOBALS = ["window", "document", "navigator", "HTMLElement", "Node", "Element", "IntersectionObserver", "ResizeObserver", "requestAnimationFrame", "cancelAnimationFrame", "getComputedStyle"];

async function hydrationWarnings(render) {
  reloadMotion();
  const html = nodeRequire("react-dom/server").renderToString(render(createLoader()));

  const dom = new JSDOM(`<div id="root">${html}</div>`, { url: "https://invitation.test/", pretendToBeVisual: true });
  dom.window.matchMedia = (query) => ({
    matches: /prefers-reduced-motion(:\s*reduce)?\)/.test(query),
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent: () => false,
  });
  const prior = Object.fromEntries(GLOBALS.map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  for (const key of GLOBALS) {
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value: key === "window" ? dom.window : dom.window[key] });
  }
  const previousAct = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const warnings = [];
  const originalError = console.error;
  console.error = (...args) => warnings.push(args.map(String).join(" ").split("\n")[0]);
  try {
    reloadMotion();
    const element = render(createLoader());
    const { hydrateRoot } = nodeRequire("react-dom/client");
    let root;
    await React.act(async () => {
      root = hydrateRoot(dom.window.document.getElementById("root"), element, {
        onRecoverableError: (error) => warnings.push(`recoverable: ${error.message.split("\n")[0]}`),
      });
    });
    await React.act(async () => root.unmount());
  } finally {
    console.error = originalError;
    globalThis.IS_REACT_ACT_ENVIRONMENT = previousAct;
    for (const key of GLOBALS) {
      if (prior[key]) Object.defineProperty(globalThis, key, prior[key]);
      else delete globalThis[key];
    }
    dom.window.close();
  }
  reloadMotion();
  return warnings;
}

const library = { stories: STORIES, gifts: GIFTS, wishes: WISHES, imageSlots: IMAGE_SLOTS, imagePath };

test("the harness catches a component that renders useReducedMotion() into markup", async () => {
  const warnings = await hydrationWarnings(() => {
    function Probe() {
      const { useReducedMotion } = nodeRequire("motion/react");
      return React.createElement("div", { "data-reduced": useReducedMotion() ?? false });
    }
    return React.createElement(Probe);
  });
  assert.ok(warnings.some((warning) => /hydrated but some attributes/.test(warning)), warnings.join("\n"));
});

const registry = createLoader()("themes/registry");
for (const slug of Object.keys(registry.themeRegistry)) {
  test(`${slug} hydrates without warnings for a reduced-motion guest`, async () => {
    const source = DEMOS.find((demo) => demo.theme === slug);
    assert.ok(source, `${slug} has demo content`);
    const warnings = await hydrationWarnings((loader) => {
      const { buildQaFixture, QA_DEFAULT_GUEST } = loader("lib/qa/fixture-invitation");
      const { ThemeRenderer } = loader("themes/ThemeRenderer");
      const { invitation, guest } = buildQaFixture(source, library, { packageKey: "grand", type: "wedding", condition: "lengkap", guestName: QA_DEFAULT_GUEST });
      return React.createElement(ThemeRenderer, { invitation, guest });
    });
    assert.deepEqual(warnings.filter((warning) => !/Reduced Motion enabled/.test(warning)), []);
  });
}
