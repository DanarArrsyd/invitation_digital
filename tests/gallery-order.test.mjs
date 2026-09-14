// Loose assert (not node:assert/strict) — reorderIds runs in vm.runInNewContext's
// separate realm, so its returned arrays have a different Array constructor than
// this file's literals; deepStrictEqual fails on that alone even when contents match.
import assert from "node:assert";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";
import vm from "node:vm";

const source = ts.transpileModule(
  readFileSync(new URL("../src/lib/utils/gallery-order.ts", import.meta.url), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS } },
).outputText;

const exports = {};
vm.runInNewContext(source, { exports, module: { exports } });
const { reorderIds } = exports;

test("moves an item forward", () => {
  assert.deepEqual(reorderIds(["a", "b", "c", "d"], 0, 2), ["b", "c", "a", "d"]);
});

test("moves an item backward", () => {
  assert.deepEqual(reorderIds(["a", "b", "c", "d"], 3, 1), ["a", "d", "b", "c"]);
});

test("no-op when from equals to", () => {
  assert.deepEqual(reorderIds(["a", "b", "c"], 1, 1), ["a", "b", "c"]);
});

test("does not mutate the input array", () => {
  const input = ["a", "b", "c"];
  reorderIds(input, 0, 2);
  assert.deepEqual(input, ["a", "b", "c"]);
});
