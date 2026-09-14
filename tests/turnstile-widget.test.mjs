import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";
import vm from "node:vm";

const nodeRequire = createRequire(import.meta.url);

function renderWidget(siteKey = "test-site-key") {
  const source = ts.transpileModule(
    readFileSync(new URL("../src/components/TurnstileWidget.tsx", import.meta.url), "utf8"),
    {
      compilerOptions: {
        jsx: ts.JsxEmit.ReactJSX,
        module: ts.ModuleKind.CommonJS,
      },
    },
  ).outputText;

  const exports = {};
  vm.runInNewContext(source, {
    exports,
    module: { exports },
    process: { env: { NEXT_PUBLIC_TURNSTILE_SITE_KEY: siteKey } },
    require(name) {
      if (name === "next/script") return { __esModule: true, default: () => null };
      return nodeRequire(name);
    },
  });

  return exports.TurnstileWidget();
}

test("keeps Turnstile hidden unless visitor interaction is required", () => {
  const widget = renderWidget();
  const container = widget.props.children[1];

  assert.equal(container.props.className, "cf-turnstile");
  assert.equal(container.props["data-appearance"], "interaction-only");
});
