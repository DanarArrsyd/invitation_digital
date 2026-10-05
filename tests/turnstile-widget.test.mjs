import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";
import vm from "node:vm";

const nodeRequire = createRequire(import.meta.url);
const React = nodeRequire("react");
const { renderToStaticMarkup } = nodeRequire("react-dom/server");
const widgetSource = readFileSync(new URL("../src/components/TurnstileWidget.tsx", import.meta.url), "utf8");

function loadWidget(siteKey = "test-site-key") {
  const source = ts.transpileModule(widgetSource, {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS },
  }).outputText;
  const exports = {};
  vm.runInNewContext(source, {
    exports,
    module: { exports },
    process: { env: { NEXT_PUBLIC_TURNSTILE_SITE_KEY: siteKey } },
    require: nodeRequire,
  });
  return exports.TurnstileWidget;
}

test("renders the Turnstile container inside the form", () => {
  const html = renderToStaticMarkup(React.createElement(loadWidget()));
  assert.match(html, /class="cf-turnstile"/);
  assert.match(html, /data-sitekey="test-site-key"/);
});

test("renders nothing without a site key", () => {
  assert.equal(renderToStaticMarkup(React.createElement(loadWidget(""))), "");
});

test("renders explicitly on mount so late or re-mounted forms still get a token", () => {
  assert.match(widgetSource, /api\.js\?render=explicit/, "no reliance on the one-time auto scan");
  assert.match(widgetSource, /turnstile\.render\(container,/);
  assert.match(widgetSource, /appearance: "always"/, "the check is visible right away");
  assert.match(widgetSource, /"response-field-name": "cf-turnstile-response"/);
  assert.match(widgetSource, /api\?\.reset\(widgetId\)/, "single-use tokens refresh after each submit");
  assert.match(widgetSource, /api\.remove\(widgetId\)/, "unmount removes the widget");
});
