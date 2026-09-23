import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import vm from "node:vm";

import { JSDOM } from "jsdom";
import React from "react";
import { createRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import ts from "typescript";

const nodeRequire = createRequire(import.meta.url);

function loadHook(react, browserWindow) {
  const source = ts.transpileModule(
    readFileSync(new URL("../src/hooks/use-mobile.ts", import.meta.url), "utf8"),
    { compilerOptions: { module: ts.ModuleKind.CommonJS } },
  ).outputText;
  const exports = {};
  vm.runInNewContext(source, {
    exports,
    module: { exports },
    require(name) {
      return name === "react" ? react : nodeRequire(name);
    },
    window: browserWindow,
  });
  return exports.useIsMobile;
}

test("mobile hook renders the desktop fallback on the server without browser reads", () => {
  const useIsMobile = loadHook(React, {
    innerWidth: 390,
    matchMedia() {
      throw new Error("Server render must not query matchMedia");
    },
  });

  function Probe() {
    return React.createElement("span", null, String(useIsMobile()));
  }

  assert.equal(renderToString(React.createElement(Probe)), "<span>false</span>");
});

test("mobile hook updates its mounted consumer and removes the listener on unmount", async () => {
  const dom = new JSDOM("<div id='root'></div>");
  const previousWindow = globalThis.window;
  const previousDocument = globalThis.document;
  const previousActEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;

  const listeners = new Set();
  const mediaQuery = {
    matches: false,
    addEventListener(type, callback) {
      assert.equal(type, "change");
      listeners.add(callback);
    },
    removeEventListener(type, callback) {
      assert.equal(type, "change");
      listeners.delete(callback);
    },
  };
  dom.window.matchMedia = (query) => {
    assert.equal(query, "(max-width: 767px)");
    return mediaQuery;
  };
  const useIsMobile = loadHook(React, dom.window);
  const container = dom.window.document.getElementById("root");
  const root = createRoot(container);
  let mounted = true;

  function Probe() {
    return React.createElement("span", null, useIsMobile() ? "mobile" : "desktop");
  }

  async function changeMediaQuery(matches, innerWidth) {
    assert.equal(listeners.size, 1, "mounted hook must subscribe to media-query changes");
    mediaQuery.matches = matches;
    dom.window.innerWidth = innerWidth;
    const [onChange] = listeners;
    await React.act(async () => onChange(new dom.window.Event("change")));
  }

  try {
    await React.act(async () => root.render(React.createElement(Probe)));
    assert.equal(container.textContent, "desktop");

    await changeMediaQuery(true, 770);
    assert.equal(container.textContent, "mobile");

    await changeMediaQuery(false, 390);
    assert.equal(container.textContent, "desktop");

    await React.act(async () => root.unmount());
    mounted = false;
    assert.equal(listeners.size, 0, "unmount must remove the media-query listener");
  } finally {
    if (mounted) await React.act(async () => root.unmount());
    dom.window.close();
    globalThis.window = previousWindow;
    globalThis.document = previousDocument;
    globalThis.IS_REACT_ACT_ENVIRONMENT = previousActEnvironment;
  }
});
