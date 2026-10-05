import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import vm from "node:vm";

import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const nodeRequire = createRequire(import.meta.url);

function loadTs(path, dependencies = {}) {
  const source = ts.transpileModule(
    readFileSync(new URL(`../src/${path}`, import.meta.url), "utf8"),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
      },
    },
  ).outputText;
  const exports = {};

  vm.runInNewContext(source, {
    exports,
    module: { exports },
    require(name) {
      if (Object.hasOwn(dependencies, name)) return dependencies[name];
      if (name === "react/jsx-runtime") return nodeRequire(name);
      throw new Error(`Unexpected import in ${path}: ${name}`);
    },
  });

  return exports;
}

test("the root is the Temuraya landing page, not a redirect into the admin", () => {
  assert.equal(existsSync(new URL("../src/app/page.tsx", import.meta.url)), false);
  const landing = readFileSync(new URL("../src/app/(marketing)/page.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(landing, /redirect\(/);
  const adminIndex = readFileSync(new URL("../src/app/admin/(protected)/(shell)/page.tsx", import.meta.url), "utf8");
  assert.match(adminIndex, /redirect\("\/admin\/dashboard"\)/);
});

test("all admin screens are excluded from search indexing", () => {
  const layout = loadTs("app/admin/layout.tsx", {
    "@/components/ui/sonner": { Toaster: () => null },
  });

  assert.equal(layout.metadata.robots.index, false);
  assert.equal(layout.metadata.robots.follow, false);
  assert.equal(layout.metadata.robots.noarchive, true);
  assert.equal(layout.metadata.title.default, "Temuraya Admin");
});

test("signed-out operators receive a semantic admin login gateway", async () => {
  const page = loadTs("app/admin/login/page.tsx", {
    "next/navigation": {
      redirect() {
        throw new Error("Unexpected redirect for a signed-out operator");
      },
    },
    "@/components/ui/card": {
      Card: "div",
      CardContent: "div",
      CardDescription: "p",
      CardHeader: "div",
      CardTitle: "div",
    },
    "@/lib/supabase/server": {
      createSupabaseServerClient: async () => ({
        auth: {
          getUser: async () => ({ data: { user: null } }),
        },
      }),
    },
    "./LoginForm": {
      LoginForm: () => nodeRequire("react").createElement("form", { "aria-label": "Form masuk admin" }),
    },
  });

  const html = renderToStaticMarkup(await page.default());

  assert.match(html, /<main\b/);
  assert.match(html, /<h1[^>]*>Masuk untuk mengelola undangan<\/h1>/);
  assert.match(html, /aria-label="Form masuk admin"/);
  assert.match(html, /Akses terbatas untuk pengelola/);
});

test("login form exposes a named, localized credential flow", () => {
  const { LoginForm } = loadTs("app/admin/login/LoginForm.tsx", {
    react: nodeRequire("react"),
    "@/components/ui/button": { Button: "button" },
    "@/components/ui/input": { Input: "input" },
    "@/components/ui/label": { Label: "label" },
    "./actions": { login: async () => ({ error: null }) },
  });

  const html = renderToStaticMarkup(nodeRequire("react").createElement(LoginForm));

  assert.match(html, /<form[^>]*aria-label="Form masuk admin"/);
  assert.match(html, /<label[^>]*for="email"[^>]*>Email<\/label>/);
  assert.match(html, /<label[^>]*for="password"[^>]*>Kata sandi<\/label>/);
  assert.match(html, /<button[^>]*>Masuk ke dashboard<\/button>/);
});
