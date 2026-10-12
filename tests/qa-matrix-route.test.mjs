import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import vm from "node:vm";

import ts from "typescript";

const nodeRequire = createRequire(import.meta.url);

function loadTs(path, dependencies = {}, context = {}) {
  const source = ts.transpileModule(readFileSync(new URL(`../src/${path}`, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const exports = {};
  vm.runInNewContext(source, {
    exports,
    module: { exports },
    ...context,
    require(name) {
      if (Object.hasOwn(dependencies, name)) return dependencies[name];
      throw new Error(`Unexpected import in ${path}: ${name}`);
    },
  });
  return exports;
}

const timeZones = loadTs("lib/invitations/time-zones.ts");
const validation = loadTs("lib/validation/invitation.ts", { zod: nodeRequire("zod"), "@/lib/invitations/time-zones": timeZones });
const entitlements = loadTs("lib/packages/entitlements.ts");

function loadPage(nodeEnv) {
  const calls = [];
  class NotFound extends Error {}
  const page = loadTs("app/qa-matrix/[themeSlug]/page.tsx", {
    "next/navigation": { notFound: () => { throw new NotFound("not found"); } },
    zod: nodeRequire("zod"),
    "react/jsx-runtime": nodeRequire("react/jsx-runtime"),
    "@/lib/packages/entitlements": entitlements,
    "@/lib/validation/invitation": validation,
    "@/lib/qa/fixture-invitation": {
      QA_CONDITIONS: ["lengkap", "minim", "panjang"],
      QA_DEFAULT_GUEST: "Nama Tamu Anda",
      buildQaFixture: (source, _library, options) => {
        calls.push({ theme: source.theme, ...options });
        return { invitation: { type: options.type, navSections: ["hero", "couple"] }, guest: null };
      },
    },
    "@/themes/theme-fonts": {},
    "@/themes/ThemeRenderer": { ThemeRenderer: () => null },
    "../../../../scripts/demo/content.mjs": {
      DEMOS: [{ theme: "terra-botanica" }], STORIES: [], GIFTS: [], WISHES: [], IMAGE_SLOTS: [], imagePath: () => "",
    },
  }, { process: { env: { NODE_ENV: nodeEnv } } });
  return { Page: page.default, calls, NotFound };
}

const render = (Page, themeSlug, query = {}) => Page({ params: Promise.resolve({ themeSlug }), searchParams: Promise.resolve(query) });

test("production never renders the QA matrix, before reading anything", async () => {
  const { Page, calls, NotFound } = loadPage("production");
  let paramsRead = false;
  const params = { then: (resolve) => { paramsRead = true; resolve({ themeSlug: "terra-botanica" }); } };
  await assert.rejects(Page({ params, searchParams: Promise.resolve({}) }), NotFound);
  assert.equal(paramsRead, false, "the guard runs before params are awaited");
  assert.equal(calls.length, 0);
});

test("an unknown template is a 404 in development", async () => {
  const { Page, NotFound } = loadPage("development");
  await assert.rejects(render(Page, "not-a-theme"), NotFound);
});

test("odd query values fall back to the defaults instead of failing", async () => {
  const { Page, calls } = loadPage("development");
  await render(Page, "terra-botanica", { paket: "gold", jenis: "", kondisi: ["minim", "panjang"], to: ["a", "b"] });
  assert.deepEqual(calls.at(-1), {
    theme: "terra-botanica", packageKey: "signature", type: "wedding", condition: "lengkap", guestName: "Nama Tamu Anda",
  });
});

test("valid query values reach the fixture, and to=none drops the guest", async () => {
  const { Page, calls } = loadPage("development");
  await render(Page, "terra-botanica", { paket: "grand", jenis: "aqiqah", kondisi: "minim", to: "none" });
  assert.deepEqual(calls.at(-1), {
    theme: "terra-botanica", packageKey: "grand", type: "aqiqah", condition: "minim", guestName: null,
  });
  await render(Page, "terra-botanica", { to: "Bu Sari" });
  assert.equal(calls.at(-1).guestName, "Bu Sari");
});

test("no invitation can take the qa-matrix slug", () => {
  const result = validation.invitationSlugSchema.safeParse("qa-matrix");
  assert.equal(result.success, false);
  assert.match(result.error.issues[0].message, /dipakai halaman Temuraya/);
});
