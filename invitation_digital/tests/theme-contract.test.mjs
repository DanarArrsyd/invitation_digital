import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";
import vm from "node:vm";

function loadTs(path, dependencies = {}) {
  const url = new URL(`../src/${path}`, import.meta.url);
  assert.equal(existsSync(url), true, `${path} must exist`);
  const source = ts.transpileModule(readFileSync(url, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  const exports = {};
  vm.runInNewContext(source, {
    exports,
    module: { exports },
    require(name) {
      if (Object.hasOwn(dependencies, name)) return dependencies[name];
      throw new Error(`Unexpected import in ${path}: ${name}`);
    },
  });
  return exports;
}

const expected = [
  "cover", "hero", "quote", "couple", "parents", "events",
  "countdown", "maps", "calendar", "dressCode", "story", "gallery",
  "livestream", "rsvp", "wishes", "gift", "instagram", "closing",
];

function loadThemeContract() {
  const contract = loadTs("themes/section-contract.ts");
  const { themeRegistry } = loadTs("themes/registry.ts", {
    "./nusantara-ivory": { NusantaraIvory: () => null },
    "./terra-botanica": { TerraBotanica: () => null },
    "./midnight-atelier": {
      MidnightAtelier: () => null,
      MIDNIGHT_ATELIER_SECTIONS: Object.fromEntries(contract.THEME_SECTION_KEYS.map((key) => [key, true])),
    },
    "./section-contract": contract,
  });
  return { ...contract, themeRegistry };
}

test("all registered themes cover the canonical public section contract", () => {
  const { THEME_SECTION_KEYS, themeRegistry } = loadThemeContract();
  assert.deepEqual([...THEME_SECTION_KEYS], expected);
  for (const [slug, definition] of Object.entries(themeRegistry)) {
    assert.deepEqual(Object.keys(definition.sections).sort(), [...expected].sort(), slug);
    assert.equal(Object.values(definition.sections).every(Boolean), true, slug);
  }
  assert.equal(THEME_SECTION_KEYS.includes("sponsorship"), false);
});

test("every registered theme exposes its approved preview metadata", () => {
  const { themeRegistry } = loadThemeContract();
  assert.deepEqual(Object.fromEntries(Object.entries(themeRegistry).map(([slug, definition]) => [slug, {
    name: definition.preview.name,
    palette: [...definition.preview.palette],
  }])), {
    "nusantara-ivory": { name: "Nusantara Ivory", palette: ["#FCFAF5", "#AA8D61", "#27231F"] },
    "terra-botanica": { name: "Terra Botanica", palette: ["#F2E7D8", "#B6634B", "#53634E"] },
    "midnight-atelier": { name: "Midnight Atelier", palette: ["#09090B", "#541E2B", "#C6A15B"] },
  });
});
