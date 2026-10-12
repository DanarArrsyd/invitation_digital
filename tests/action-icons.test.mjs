import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import vm from "node:vm";

import ts from "typescript";

// Text arrows (↗ ↘) render as colour emoji on iOS. Public themes draw
// their action glyphs from src/themes/shared/action-icons.tsx instead.
test("theme markup uses drawn action icons, never text arrows", () => {
  const root = new URL("../src/themes/", import.meta.url);
  const files = readdirSync(root, { recursive: true }).filter((file) => file.endsWith(".tsx") && !file.endsWith("action-icons.tsx"));
  for (const file of files) {
    const source = readFileSync(new URL(file, root), "utf8");
    assert.doesNotMatch(source, />\s*[↗↘↓]\s*</, `${file} renders a text arrow`);
  }
});

test("ForwardArrowIcon is a decorative drawn arrow", () => {
  const nodeRequire = createRequire(import.meta.url);
  const source = ts.transpileModule(readFileSync(new URL("../src/themes/shared/action-icons.tsx", import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const icons = {};
  vm.runInNewContext(source, { exports: icons, module: { exports: icons }, require: nodeRequire });
  assert.equal(typeof icons.ForwardArrowIcon, "function");
  const html = nodeRequire("react-dom/server").renderToStaticMarkup(nodeRequire("react").createElement(icons.ForwardArrowIcon));
  assert.match(html, /<svg[^>]*aria-hidden="true"/);
  assert.match(html, /class="theme-action-icon /);
  assert.doesNotMatch(html, /→/);
});
