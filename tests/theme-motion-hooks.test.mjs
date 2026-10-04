import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import vm from "node:vm";
import React, { act, useRef } from "react";
import { createRoot } from "react-dom/client";
import { JSDOM } from "jsdom";
import ts from "typescript";

const nodeRequire = createRequire(import.meta.url);

function loadShared(name) {
  const source = readFileSync(new URL(`../src/themes/shared/${name}.ts`, import.meta.url), "utf8");
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  vm.runInNewContext(output, {
    exports, module: { exports },
    get window() { return globalThis.window; },
    get document() { return globalThis.document; },
    get IntersectionObserver() { return globalThis.IntersectionObserver; },
    require: (moduleName) => nodeRequire(moduleName),
  });
  return exports;
}

class FakeIntersectionObserver {
  static last = null;
  constructor(callback, options) { this.callback = callback; this.options = options; this.disconnected = false; FakeIntersectionObserver.last = this; }
  observe(element) { this.element = element; }
  disconnect() { this.disconnected = true; }
  report(isIntersecting) { this.callback([{ target: this.element, isIntersecting }]); }
}

async function withDom(intersectionObserver, run) {
  const dom = new JSDOM("<div id='root'></div>", { url: "https://invitation.test/", pretendToBeVisual: true });
  const prior = { window: globalThis.window, document: globalThis.document, IntersectionObserver: globalThis.IntersectionObserver, IS_REACT_ACT_ENVIRONMENT: globalThis.IS_REACT_ACT_ENVIRONMENT };
  Object.assign(globalThis, { window: dom.window, document: dom.window.document, IntersectionObserver: intersectionObserver, IS_REACT_ACT_ENVIRONMENT: true });
  const root = createRoot(dom.window.document.getElementById("root"));
  try {
    await run({ dom, root });
  } finally {
    await act(async () => root.unmount());
    Object.assign(globalThis, prior);
    dom.window.close();
  }
}

test("useInViewOnce stays idle without IntersectionObserver so nothing hides", async () => {
  const { useInViewOnce } = loadShared("use-in-view-once");
  let result;
  function Probe() { const ref = useRef(null); result = useInViewOnce(ref); return React.createElement("span", { ref }); }
  await withDom(undefined, async ({ root }) => {
    await act(async () => root.render(React.createElement(Probe)));
    assert.deepEqual({ ...result }, { watching: false, seen: false });
  });
});

test("useInViewOnce watches after mount, reports the first intersection once, then disconnects", async () => {
  const { useInViewOnce } = loadShared("use-in-view-once");
  let result;
  function Probe() { const ref = useRef(null); result = useInViewOnce(ref); return React.createElement("span", { ref }); }
  await withDom(FakeIntersectionObserver, async ({ root }) => {
    await act(async () => root.render(React.createElement(Probe)));
    assert.deepEqual({ ...result }, { watching: true, seen: false });
    assert.equal(FakeIntersectionObserver.last.options.rootMargin, "0px 0px -10% 0px");
    await act(async () => FakeIntersectionObserver.last.report(false));
    assert.equal(result.seen, false, "a non-intersecting report changes nothing");
    await act(async () => FakeIntersectionObserver.last.report(true));
    assert.deepEqual({ ...result }, { watching: true, seen: true });
    assert.equal(FakeIntersectionObserver.last.disconnected, true);
  });
});

test("scrollProgress clamps to 0–1 and treats an unscrollable page as complete", () => {
  const { scrollProgress } = loadShared("use-scroll-progress");
  assert.equal(scrollProgress(0, 3000, 1000), 0);
  assert.equal(scrollProgress(1000, 3000, 1000), 0.5);
  assert.equal(scrollProgress(2400, 3000, 1000), 1);
  assert.equal(scrollProgress(-50, 3000, 1000), 0);
  assert.equal(scrollProgress(0, 800, 1000), 1);
});

test("useScrollProgress writes progress to a custom property and follows scrolling", async () => {
  const { useScrollProgress } = loadShared("use-scroll-progress");
  let element;
  function Probe() { const ref = useRef(null); useScrollProgress(ref, "--probe"); return React.createElement("div", { ref: (node) => { ref.current = node; element = node; } }); }
  await withDom(undefined, async ({ dom, root }) => {
    Object.defineProperty(dom.window.document.documentElement, "scrollHeight", { configurable: true, value: 3000 });
    Object.defineProperty(dom.window, "innerHeight", { configurable: true, value: 1000 });
    await act(async () => root.render(React.createElement(Probe)));
    assert.equal(element.style.getPropertyValue("--probe"), "0.0000");
    Object.defineProperty(dom.window, "scrollY", { configurable: true, value: 1500 });
    dom.window.dispatchEvent(new dom.window.Event("scroll"));
    await act(async () => new Promise((resolve) => dom.window.requestAnimationFrame(() => resolve())));
    assert.equal(element.style.getPropertyValue("--probe"), "0.7500");
  });
});

test("useScrollProgress recomputes when the page grows without a scroll, e.g. content revealed by the cover", async () => {
  const { useScrollProgress } = loadShared("use-scroll-progress");
  let element;
  let observed = null;
  let resized = null;
  let disconnected = false;
  class FakeResizeObserver {
    constructor(callback) { resized = callback; }
    observe(target) { observed = target; }
    disconnect() { disconnected = true; }
  }
  function Probe() { const ref = useRef(null); useScrollProgress(ref, "--probe"); return React.createElement("div", { ref: (node) => { ref.current = node; element = node; } }); }
  await withDom(undefined, async ({ dom, root }) => {
    dom.window.ResizeObserver = FakeResizeObserver;
    Object.defineProperty(dom.window.document.documentElement, "scrollHeight", { configurable: true, value: 800 });
    Object.defineProperty(dom.window, "innerHeight", { configurable: true, value: 1000 });
    await act(async () => root.render(React.createElement(Probe)));
    assert.equal(element.style.getPropertyValue("--probe"), "1.0000", "a page that cannot scroll yet reads as complete");
    assert.equal(observed, dom.window.document.body);
    Object.defineProperty(dom.window.document.documentElement, "scrollHeight", { configurable: true, value: 5000 });
    resized([]);
    await act(async () => new Promise((resolve) => dom.window.requestAnimationFrame(() => resolve())));
    assert.equal(element.style.getPropertyValue("--probe"), "0.0000", "revealed content resets progress to the top");
    await act(async () => root.unmount());
    assert.equal(disconnected, true);
  });
});
