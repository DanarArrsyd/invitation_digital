import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

const THEME_FONTS = {
  "nusantara-ivory": {
    packages: [/@fontsource\/great-vibes/, /@fontsource-variable\/cinzel/, /@fontsource-variable\/lora/],
    faces: [
      /--font-ni-script:\s*"Great Vibes"/,
      /--font-ni-display:\s*"Cinzel Variable"/,
      /--font-ni-body:\s*"Lora Variable"/,
    ],
  },
  "terra-botanica": {
    packages: [/@fontsource-variable\/fraunces/, /@fontsource-variable\/manrope/],
    faces: [/--font-tb-display:\s*"Fraunces Variable"/, /--font-tb-body:\s*"Manrope Variable"/],
  },
  "midnight-atelier": {
    packages: [/@fontsource-variable\/bodoni-moda/, /@fontsource\/ibm-plex-sans-condensed/],
    faces: [/--font-ma-display:\s*"Bodoni Moda Variable"/, /--font-ma-body:\s*"IBM Plex Sans Condensed"/],
  },
  "cobalt-riviera": {
    packages: [/@fontsource-variable\/familjen-grotesk/, /@fontsource-variable\/newsreader/],
    faces: [/--font-cr-display:\s*"Familjen Grotesk Variable"/, /--font-cr-body:\s*"Newsreader Variable"/],
  },
};

test("each wedding theme bundles its own fonts instead of downloading Google fonts at build time", async () => {
  for (const [theme, { packages, faces }] of Object.entries(THEME_FONTS)) {
    const [themeFonts, fontsTs, fontsCss] = await Promise.all([
      source("src/themes/theme-fonts.ts"),
      source(`src/themes/${theme}/fonts.ts`),
      source(`src/themes/${theme}/fonts.css`),
    ]);

    assert.doesNotMatch(fontsTs, /next\/font\/google/, theme);
    assert.ok(themeFonts.includes(`import "./${theme}/fonts.css";`), theme);
    for (const pattern of packages) assert.match(themeFonts, pattern, theme);
    for (const pattern of faces) assert.match(fontsCss, pattern, theme);
  }
});

test("theme fonts load only on routes that render a theme", async () => {
  const [layout, publicPage, previewPage, globals] = await Promise.all([
    source("src/app/layout.tsx"),
    source("src/app/(public)/[slug]/page.tsx"),
    source("src/app/admin/(protected)/invitations/[id]/preview/page.tsx"),
    source("src/app/globals.css"),
  ]);

  assert.match(publicPage, /import "@\/themes\/theme-fonts";/);
  assert.match(previewPage, /import "@\/themes\/theme-fonts";/);
  assert.doesNotMatch(layout, /@fontsource|theme-fonts/);
  assert.match(layout, /lang="id"/);
  assert.doesNotMatch(globals, /--font-(nusantara|tb|ma|cr)-/);
});

test("the admin sans token resolves to Geist instead of referencing itself", async () => {
  const globals = await source("src/app/globals.css");

  // `--font-sans: var(--font-sans)` is a cycle: the declaration is invalid at
  // computed time and the browser falls back to its default serif (Times).
  assert.doesNotMatch(globals, /--font-sans:\s*var\(--font-sans\)/);
  assert.match(globals, /--font-sans:\s*var\(--font-geist-sans\)/);
});

test("no font family is mapped by two themes", async () => {
  const owners = new Map();
  for (const theme of Object.keys(THEME_FONTS)) {
    const css = await source(`src/themes/${theme}/fonts.css`);
    for (const [, family] of css.matchAll(/--font-[a-z-]+:\s*"([^"]+)"/g)) {
      assert.equal(owners.get(family) ?? theme, theme, `${family} is mapped by ${owners.get(family)} and ${theme}`);
      owners.set(family, theme);
    }
  }
});

test("Ivory styles consume the script, display and body faces", async () => {
  const styles = await source("src/themes/nusantara-ivory/ThemeStyles.tsx");
  assert.match(styles, /--ni-script:\s*var\(--font-ni-script\)/);
  assert.match(styles, /--ni-display-face:\s*var\(--font-ni-display\)/);
  assert.match(styles, /--ni-serif:\s*var\(--font-ni-body\)/);
  assert.doesNotMatch(styles, /--font-nusantara-|--ni-sans/);
  assert.match(styles, /\.ni-script\s*\{[^}]*font-family:\s*var\(--ni-script\)/);
  assert.match(styles, /\.ni-caps\s*\{[^}]*font-family:\s*var\(--ni-display-face\)/);
});
