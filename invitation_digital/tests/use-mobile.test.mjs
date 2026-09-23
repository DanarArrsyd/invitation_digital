import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import vm from "node:vm";

import React from "react";
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

test("mobile hook follows its media query when innerWidth differs", () => {
  const unset = Symbol("unset");
  let state = unset;
  let effect;
  let listener;
  let unsubscribe;
  const mediaQuery = {
    matches: true,
    addEventListener(type, callback) {
      assert.equal(type, "change");
      listener = callback;
    },
    removeEventListener(type, callback) {
      assert.equal(type, "change");
      assert.equal(callback, listener);
    },
  };
  const reactForClient = {
    useState(initial) {
      if (state === unset) state = initial;
      return [state, (next) => { state = next; }];
    },
    useEffect(callback) { effect = callback; },
    useSyncExternalStore(subscribe, getSnapshot) {
      unsubscribe ??= subscribe(() => {});
      return getSnapshot();
    },
  };
  const browserWindow = {
    innerWidth: 770,
    matchMedia(query) {
      assert.equal(query, "(max-width: 767px)");
      return mediaQuery;
    },
  };
  const useIsMobile = loadHook(reactForClient, browserWindow);

  useIsMobile();
  effect?.();
  assert.equal(useIsMobile(), true);

  mediaQuery.matches = false;
  browserWindow.innerWidth = 390;
  listener?.();
  assert.equal(useIsMobile(), false);
  unsubscribe?.();
});
