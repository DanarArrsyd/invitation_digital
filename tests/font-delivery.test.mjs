import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("wedding themes use bundled fonts instead of build-time Google font downloads", async () => {
  const [layout, globals, ivoryFonts, terraFonts] = await Promise.all([
    source("src/app/layout.tsx"),
    source("src/app/globals.css"),
    source("src/themes/nusantara-ivory/fonts.ts"),
    source("src/themes/terra-botanica/fonts.ts"),
  ]);

  assert.match(layout, /@fontsource-variable\/cormorant-garamond/);
  assert.match(layout, /@fontsource-variable\/jost/);
  assert.match(layout, /@fontsource-variable\/fraunces/);
  assert.match(layout, /@fontsource-variable\/manrope/);

  assert.doesNotMatch(ivoryFonts, /next\/font\/google/);
  assert.doesNotMatch(terraFonts, /next\/font\/google/);
  assert.match(globals, /--font-nusantara-serif:\s*"Cormorant Garamond Variable"/);
  assert.match(globals, /--font-nusantara-sans:\s*"Jost Variable"/);
  assert.match(globals, /--font-tb-display:\s*"Fraunces Variable"/);
  assert.match(globals, /--font-tb-body:\s*"Manrope Variable"/);
});
