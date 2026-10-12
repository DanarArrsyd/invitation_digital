import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

import ts from "typescript";

const source = ts.transpileModule(readFileSync(new URL("../src/themes/kelir-kencana/tokens.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const exports = {};
vm.runInNewContext(source, { exports, module: { exports }, require: () => ({}) });
const { colors } = exports.KELIR_KENCANA_TOKENS;

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const contrast = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};

test("every Kelir text pair meets WCAG AA", () => {
  // Small text pairs as the sheet uses them (eyebrows, dates, labels, body).
  for (const [fg, bg] of [
    ["sogan", "kelir"], ["sogan", "kelirDeep"],
    ["soganSoft", "kelir"], ["soganSoft", "kelirDeep"],
    ["prada", "kelir"], ["prada", "kelirDeep"],
    ["kencanaInk", "kelir"], ["kencanaInk", "kelirDeep"],
    ["kelir", "malam"], ["kencana", "malam"], ["kelir", "prada"],
  ]) {
    const ratio = contrast(colors[fg], colors[bg]);
    assert.ok(ratio >= 4.5, `${fg} on ${bg} is ${ratio.toFixed(2)}:1`);
  }
});
