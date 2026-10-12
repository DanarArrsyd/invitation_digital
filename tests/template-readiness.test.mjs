import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

// docs/DESIGN.md §28 rules that hold for every registered theme. A new
// theme is covered as soon as it is in src/themes/registry.ts.

const themesRoot = fileURLToPath(new URL("../src/themes/", import.meta.url));
const registry = readFileSync(join(themesRoot, "registry.ts"), "utf8");
// Theme packages are the registry's directory imports (section-contract is a file).
const THEME_SLUGS = [...registry.matchAll(/from "\.\/([a-z-]+)"/g)]
  .map(([, slug]) => slug)
  .filter((slug) => existsSync(join(themesRoot, slug)) && statSync(join(themesRoot, slug)).isDirectory());

function themeFiles(slug) {
  const files = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) walk(path);
      else if (/\.tsx?$/.test(name)) files.push(path);
    }
  };
  walk(join(themesRoot, slug));
  return files;
}

// Comments may name forbidden things to explain why they are forbidden.
const code = (source) => source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");

export const RULES = [
  {
    name: "themes never reach Supabase or the package (§28.2)",
    check: (_file, source) => (/supabase|package_key|packageKey|PACKAGE_DEFINITIONS|@\/lib\/packages\//.test(code(source)) ? ["imports or names Supabase or the package"] : []),
  },
  {
    name: "photos go through next/image, never a raw <img> (§28.4)",
    check: (_file, source) => (/<img[\s>]/.test(code(source)) ? ["renders a raw <img>"] : []),
  },
  {
    name: "next/image uses isOptimizableImage (§28.4)",
    check: (_file, source) => {
      const body = code(source);
      if (!/from "next\/image"/.test(body)) return [];
      return /unoptimized=\{!isOptimizableImage\(/.test(body) ? [] : ["imports next/image without unoptimized={!isOptimizableImage(src)}"];
    },
  },
  {
    name: "no typed arrows in markup (§28.5)",
    check: (_file, source) => (/[↗↓→]/.test(code(source)) ? ["types an arrow character; use src/themes/shared/action-icons.tsx"] : []),
  },
  {
    name: "Turnstile sits inside its form (§28.5)",
    check: (_file, source) => {
      const body = code(source);
      if (!/<TurnstileWidget\b/.test(body)) return [];
      const turnstile = body.indexOf("<TurnstileWidget");
      const open = body.lastIndexOf("<form", turnstile);
      const close = body.indexOf("</form>", turnstile);
      return open >= 0 && close > turnstile ? [] : ["renders <TurnstileWidget /> outside a <form>"];
    },
  },
];

test("the registry lists every theme directory", () => {
  assert.deepEqual([...THEME_SLUGS].sort(), ["cobalt-riviera", "kelir-kencana", "midnight-atelier", "nusantara-ivory", "terra-botanica"]);
  for (const slug of THEME_SLUGS) assert.ok(themeFiles(slug).length > 5, `${slug} has source files`);
});

test("each rule catches a violation", () => {
  const bad = {
    "themes never reach Supabase or the package (§28.2)": 'import { createClient } from "@/lib/supabase/server";',
    "photos go through next/image, never a raw <img> (§28.4)": "return <img src={src} alt={alt} />;",
    "next/image uses isOptimizableImage (§28.4)": 'import Image from "next/image";\n<Image src={src} alt="" fill />',
    "no typed arrows in markup (§28.5)": "<span>Kirim →</span>",
    "Turnstile sits inside its form (§28.5)": "<form></form><TurnstileWidget />",
  };
  // Nav keys come through @/themes/shared/nav-priority, never @/lib/packages.
  assert.ok(RULES[0].check("x.tsx", 'import type { NavSectionKey } from "@/lib/packages/nav-sections";').length > 0);
  for (const rule of RULES) {
    assert.ok(bad[rule.name], `self-test snippet for ${rule.name}`);
    assert.ok(rule.check("x.tsx", bad[rule.name]).length > 0, `${rule.name} catches its violation`);
    assert.deepEqual(rule.check("x.tsx", "// <img> ↗ supabase are only mentioned here\nexport const ok = 1;"), [], `${rule.name} ignores comments`);
  }
});

for (const rule of RULES) {
  test(rule.name, () => {
    const failures = [];
    for (const slug of THEME_SLUGS) {
      for (const file of themeFiles(slug)) {
        for (const message of rule.check(file, readFileSync(file, "utf8"))) failures.push(`${relative(themesRoot, file)}: ${message}`);
      }
    }
    assert.deepEqual(failures, []);
  });
}

test("every theme with a NavIcon component keys it by the full NavSectionKey record (§28.3)", () => {
  // Themes whose nav imports ./NavIcon must ship it; a rename or move fails here
  // instead of silently dropping that theme from the check.
  const withNavIcon = THEME_SLUGS.filter((slug) =>
    themeFiles(slug).some((file) => /(FloatingNav|RouteNavigation)\.tsx$/.test(file) && /from "\.\/NavIcon"/.test(readFileSync(file, "utf8"))));
  assert.ok(withNavIcon.length >= 4, `expected the NavIcon themes, found ${withNavIcon.join(", ")}`);
  for (const slug of withNavIcon) {
    const source = readFileSync(join(themesRoot, slug, "components", "NavIcon.tsx"), "utf8");
    assert.doesNotMatch(source, /Partial<Record</, `${slug} NavIcon must not be Partial`);
    assert.doesNotMatch(source, /hasGlyph|COMPASS|DIAMOND/, `${slug} NavIcon must not need a fallback glyph`);
    // Terra aliases the key type (TerraNavSection = NavSectionKey), so check the name, not the exact generic.
    assert.match(source, /NavSectionKey/, `${slug} NavIcon covers every NavSectionKey`);
  }
});
