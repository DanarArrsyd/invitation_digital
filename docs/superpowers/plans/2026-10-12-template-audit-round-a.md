# Template Audit Round A (Technical, §28) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the round A findings from the template readiness audit (A1–A5, all approved by the owner on 2026-10-12) and turn the automatable §28 rules into cross-theme tests.

**Architecture:** Two new cross-theme test files iterate every registered theme: `tests/template-readiness.test.mjs` (static source rules) and `tests/template-hydration.test.mjs` (server render, then hydrate in jsdom with `prefers-reduced-motion: reduce`, and fail on any React hydration warning). Theme fixes stay inside each theme's presentation layer; one new shared glyph goes into `src/themes/shared/action-icons.tsx`.

**Tech Stack:** Next.js 16, React 19 (`react-dom/server`, `react-dom/client` `hydrateRoot`), motion 12, TypeScript strict, `node --test`, jsdom, `ts.transpileModule`.

**Spec:** `docs/superpowers/specs/2026-10-11-template-readiness-audit-design.md` (Part 2, Round A). Findings and evidence: `docs/qa/2026-10-template-audit.md` (baseline) and the round A list below.

## Round A findings (owner-approved fix list)

| # | Template | Finding | Severity |
|---|---|---|---|
| A1 | Midnight, Cobalt, Kelir | `CoverGate` renders `data-reduced-motion={reducedMotion}` from `useReducedMotion()`: `false` on the server, `true` on a reduced-motion client. React keeps the server value ("This won't be patched up"), so the theme's reduced-motion cover CSS never applies. Breaks §28.1. | Important |
| A2 | Kelir | Small eyebrow text in `--kk-kencana-ink` (`#84601D`, 12px) on `--kk-kelir-deep` (`#E8D7B4`) in the dress-code section is 4.03:1, below AA 4.5. Kelir has no contrast test. | Important |
| A3 | All | Automatable §28 rules are not guarded by cross-theme tests. | Important |
| A4 | Cobalt, Kelir | Nav glyph maps are typed `Partial<Record<ThemeSectionKey, …>>` with a fallback glyph, so a new nav section would compile without an icon (§28.3 asks for the full record). | Minor |
| A5 | Midnight | Three buttons end in a typed "→" (cover, RSVP submit, wish submit) instead of a drawn arrow (PR #32 moved every other theme to drawn arrows). | Minor |

## Global Constraints

- Presentation-only changes; no data, capability or package changes. Every existing test keeps passing (tests that pinned the A1 attribute are updated in Task 2, nowhere else).
- Server markup and the first client render must match, including under reduced motion (§28.1). Reduced-motion styling goes in `@media (prefers-reduced-motion: reduce)`, never in markup derived from `useReducedMotion()` on the first render.
- Keep the reduced-motion cover rules at their current position in each sheet and at least their current specificity: replace `[data-reduced-motion="true"]` with `[data-opened]` (always rendered, `"true"`/`"false"`), inside the media query.
- Text contrast ≥ 4.5:1 for every body/label pair; large text (≥ 24px, or ≥ 18.66px bold) ≥ 3:1.
- New Kelir `kencanaInk`: `#7A581B` (5.28:1 on `#F2E7D0`, 4.57:1 on `#E8D7B4`). Its role (gold ink on the light screen) is unchanged; `kencana` on `malam` is untouched.
- No new dependencies. Commits end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Ask the owner before merging (merges deploy production).

## Review Focus

1. A hydration test that passes because motion's module state leaks between the server and client phases (it caches the reduced-motion answer at module load) — Task 2 reloads motion before each phase and its self-check proves a known-bad component fails.
2. Moving the reduced-motion rules into a media query at a lower specificity, so the opened-cover transitions still win and reduced-motion users still see the cover animate — Task 2 keeps `[data-opened]` and asserts the selector shape.
3. Darkening `kencanaInk` lowering contrast somewhere it sits on a dark surface — Task 3 checks every text pair of the palette, including `malam`.
4. Static source rules that silently match nothing (wrong glob, renamed file) and pass forever — Task 1 asserts each rule saw files for every theme and self-tests each rule against a violating snippet.
5. Replacing "→" changing the button's accessible name or layout — Task 5 keeps the decorative span `aria-hidden` and its CSS selector, and asserts the button text.

---

### Task 1: Cross-theme static readiness rules (A3, part 1)

**Files:**
- Create: `tests/template-readiness.test.mjs`

**Interfaces:**
- Produces: `RULES` (array of `{ name, check(file, source) → string[] }`), `THEME_SLUGS` read from `src/themes/registry.ts`; Task 5 adds one rule to `RULES`.

- [ ] **Step 1: Write the tests**

Create `tests/template-readiness.test.mjs`:

```js
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

// docs/DESIGN.md §28 rules that hold for every registered theme. A new
// theme is covered as soon as it is in src/themes/registry.ts.

const themesRoot = fileURLToPath(new URL("../src/themes/", import.meta.url));
const registry = readFileSync(join(themesRoot, "registry.ts"), "utf8");
const THEME_SLUGS = [...registry.matchAll(/from "\.\/([a-z-]+)"/g)].map(([, slug]) => slug);

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
    check: (_file, source) => (/supabase|package_key|packageKey|PACKAGE_DEFINITIONS|@\/lib\/packages\/entitlements/.test(code(source)) ? ["imports or names Supabase or the package"] : []),
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
    name: "no typed ↗ or ↓ arrows in markup (§28.5)",
    check: (_file, source) => (/[↗↓]/.test(code(source)) ? ["types an arrow character; use src/themes/shared/action-icons.tsx"] : []),
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
    "no typed ↗ or ↓ arrows in markup (§28.5)": "<span>Buka Maps ↗</span>",
    "Turnstile sits inside its form (§28.5)": "<form></form><TurnstileWidget />",
  };
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
```

- [ ] **Step 2: Run and read every result**

Run: `node --test tests/template-readiness.test.mjs`
Expected: PASS (8 tests). The self-test proves each rule fails on a violation and ignores comments; the per-rule tests pass because the round A audit found no violation of these five rules. If a per-rule test fails, it is a new finding: stop, add it to `docs/qa/2026-10-template-audit.md` round A, and ask the owner before fixing.

- [ ] **Step 3: Commit**

```bash
git add tests/template-readiness.test.mjs
git commit -m "test(themes): cross-theme §28 readiness rules

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Hydration parity under reduced motion (A3 part 2, A1)

**Files:**
- Create: `tests/template-hydration.test.mjs`
- Modify: `src/themes/midnight-atelier/CoverGate.tsx`, `src/themes/cobalt-riviera/CoverGate.tsx`, `src/themes/kelir-kencana/CoverGate.tsx` (remove the attribute)
- Modify: `src/themes/midnight-atelier/ThemeStyles.tsx`, `src/themes/cobalt-riviera/ThemeStyles.tsx`, `src/themes/kelir-kencana/ThemeStyles.tsx` (media query)
- Modify (tests that pinned the bug): `tests/cobalt-riviera-identity.test.mjs`, `tests/cobalt-riviera-quality.test.mjs`, `tests/cobalt-riviera-shell.test.mjs`, `tests/midnight-atelier-identity.test.mjs`, `tests/midnight-atelier-shell.test.mjs`

**Interfaces:**
- Consumes: `buildQaFixture`, `QA_DEFAULT_GUEST` (`src/lib/qa/fixture-invitation.ts`); `DEMOS`, `STORIES`, `GIFTS`, `WISHES`, `IMAGE_SLOTS`, `imagePath` (`scripts/demo/content.mjs`); `ThemeRenderer`, `themeRegistry`.

- [ ] **Step 1: Write the failing test**

Create `tests/template-hydration.test.mjs`:

```js
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import vm from "node:vm";

import { JSDOM } from "jsdom";
import ts from "typescript";

import { DEMOS, GIFTS, IMAGE_SLOTS, STORIES, WISHES, imagePath } from "../scripts/demo/content.mjs";

// §28.1: server markup and the first client render must match, including
// for a guest who prefers reduced motion. Each theme is rendered on a "server"
// (no window), then hydrated in jsdom whose matchMedia reports reduced motion;
// any React hydration warning fails the theme.

const nodeRequire = createRequire(import.meta.url);
const srcRoot = fileURLToPath(new URL("../src/", import.meta.url));
const React = nodeRequire("react");

const STUBS = {
  "next/image": {
    __esModule: true,
    default: ({ src, alt, fill, sizes, unoptimized, priority, quality, placeholder, ...rest }) => React.createElement("img", { src, alt, ...rest }),
  },
  "@/components/TurnstileWidget": { TurnstileWidget: () => null },
  "@/app/(public)/[slug]/actions": {
    trackCoverOpenedAction: async () => {},
    submitRsvpAction: async () => ({}),
    submitWishAction: async () => ({}),
  },
};

function resolveFile(file) {
  for (const candidate of [`${file}.tsx`, `${file}.ts`, file, `${file}/index.ts`, `${file}/index.tsx`]) {
    if (existsSync(candidate) && /\.tsx?$/.test(candidate)) return candidate;
  }
  throw new Error(`Missing module ${file}`);
}

/** A fresh module graph per phase, like a separate server and browser. */
function createLoader() {
  const cache = new Map();
  function load(file) {
    const path = resolveFile(file);
    if (cache.has(path)) return cache.get(path).exports;
    const module = { exports: {} };
    cache.set(path, module);
    const output = ts.transpileModule(readFileSync(path, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    }).outputText;
    vm.runInThisContext(`(function (exports, module, require) {${output}\n})`)(module.exports, module, (name) => {
      if (STUBS[name]) return STUBS[name];
      if (name.startsWith("@/")) return load(resolve(srcRoot, name.slice(2)));
      if (name.startsWith(".")) return load(resolve(dirname(path), name));
      return nodeRequire(name);
    });
    return module.exports;
  }
  return (relativePath) => load(resolve(srcRoot, relativePath));
}

// motion caches the reduced-motion answer in module state on first use, so a
// shared copy would carry one phase's answer into the other.
function reloadMotion() {
  for (const key of Object.keys(nodeRequire.cache)) {
    if (/node_modules\/(motion|framer-motion|motion-dom|motion-utils)\//.test(key)) delete nodeRequire.cache[key];
  }
}

const GLOBALS = ["window", "document", "navigator", "HTMLElement", "Node", "Element", "IntersectionObserver", "ResizeObserver", "requestAnimationFrame", "cancelAnimationFrame", "getComputedStyle"];

async function hydrationWarnings(render) {
  reloadMotion();
  const html = nodeRequire("react-dom/server").renderToString(render(createLoader()));

  const dom = new JSDOM(`<div id="root">${html}</div>`, { url: "https://invitation.test/", pretendToBeVisual: true });
  dom.window.matchMedia = (query) => ({
    matches: /prefers-reduced-motion(:\s*reduce)?\)/.test(query),
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent: () => false,
  });
  const prior = Object.fromEntries(GLOBALS.map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  for (const key of GLOBALS) {
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value: key === "window" ? dom.window : dom.window[key] });
  }
  const previousAct = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const warnings = [];
  const originalError = console.error;
  console.error = (...args) => warnings.push(args.map(String).join(" ").split("\n")[0]);
  try {
    reloadMotion();
    const element = render(createLoader());
    const { hydrateRoot } = nodeRequire("react-dom/client");
    let root;
    await React.act(async () => {
      root = hydrateRoot(dom.window.document.getElementById("root"), element, {
        onRecoverableError: (error) => warnings.push(`recoverable: ${error.message.split("\n")[0]}`),
      });
    });
    await React.act(async () => root.unmount());
  } finally {
    console.error = originalError;
    globalThis.IS_REACT_ACT_ENVIRONMENT = previousAct;
    for (const key of GLOBALS) {
      if (prior[key]) Object.defineProperty(globalThis, key, prior[key]);
      else delete globalThis[key];
    }
    dom.window.close();
  }
  reloadMotion();
  return warnings;
}

const library = { stories: STORIES, gifts: GIFTS, wishes: WISHES, imageSlots: IMAGE_SLOTS, imagePath };

test("the harness catches a component that renders useReducedMotion() into markup", async () => {
  const warnings = await hydrationWarnings(() => {
    function Probe() {
      const { useReducedMotion } = nodeRequire("motion/react");
      return React.createElement("div", { "data-reduced": useReducedMotion() ?? false });
    }
    return React.createElement(Probe);
  });
  assert.ok(warnings.some((warning) => /hydrated but some attributes/.test(warning)), warnings.join("\n"));
});

const registry = createLoader()("themes/registry");
for (const slug of Object.keys(registry.themeRegistry)) {
  test(`${slug} hydrates without warnings for a reduced-motion guest`, async () => {
    const source = DEMOS.find((demo) => demo.theme === slug);
    assert.ok(source, `${slug} has demo content`);
    const warnings = await hydrationWarnings((loader) => {
      const { buildQaFixture, QA_DEFAULT_GUEST } = loader("lib/qa/fixture-invitation");
      const { ThemeRenderer } = loader("themes/ThemeRenderer");
      const { invitation, guest } = buildQaFixture(source, library, { packageKey: "grand", type: "wedding", condition: "lengkap", guestName: QA_DEFAULT_GUEST });
      return React.createElement(ThemeRenderer, { invitation, guest });
    });
    assert.deepEqual(warnings.filter((warning) => !/Reduced Motion enabled/.test(warning)), []);
  });
}
```

- [ ] **Step 2: Run to verify it fails for the right reason**

Run: `node --test tests/template-hydration.test.mjs`
Expected: FAIL for `midnight-atelier`, `cobalt-riviera` and `kelir-kencana` with "A tree hydrated but some attributes of the server rendered HTML didn't match the client properties"; PASS for the harness self-check, `nusantara-ivory` and `terra-botanica`. Any other failure is a harness problem (fix it before touching themes) or a new finding (ledger it and tell the owner).

- [ ] **Step 3: Remove the attribute from the three covers**

In each file, change the gate element and keep everything else:

`src/themes/midnight-atelier/CoverGate.tsx`: `<div className="ma-gate" data-opened={opened} data-reduced-motion={reducedMotion}>` → `<div className="ma-gate" data-opened={opened}>`

`src/themes/cobalt-riviera/CoverGate.tsx`: `<div className="cr-gate" data-opened={opened} data-reduced-motion={reducedMotion}>` → `<div className="cr-gate" data-opened={opened}>`

`src/themes/kelir-kencana/CoverGate.tsx`: `<div className="kk-gate" data-opened={opened} data-reduced-motion={reducedMotion}>` → `<div className="kk-gate" data-opened={opened}>`

If `reducedMotion` is then unused in a file, remove it from that file's `useInvitationCover(...)` destructuring (lint will flag it).

- [ ] **Step 4: Move the rules into the media query**

`src/themes/midnight-atelier/ThemeStyles.tsx` — replace

```css
      .ma-gate[data-reduced-motion="true"] :is(.ma-cover, .ma-cover-frame, .ma-cover-masthead, .ma-cover-recipient, .ma-cover-names) { transition: none; }
      .ma-gate[data-reduced-motion="true"] :is(.ma-flute, .ma-toast-ring, .ma-toast-bubble) { animation: none; }
```

with

```css
      /* In CSS, not markup: the server cannot know the guest's motion setting. */
      @media (prefers-reduced-motion: reduce) {
        .ma-gate[data-opened] :is(.ma-cover, .ma-cover-frame, .ma-cover-masthead, .ma-cover-recipient, .ma-cover-names) { transition: none; }
        .ma-gate[data-opened] :is(.ma-flute, .ma-toast-ring, .ma-toast-bubble) { animation: none; }
      }
```

`src/themes/cobalt-riviera/ThemeStyles.tsx` — replace

```css
      .cr-gate[data-reduced-motion="true"] :is(.cr-cover, .cr-cover-frame, .cr-wave, .cr-sand-names, .cr-cover-open .cr-sun-mark) { transition: none; }
```

with

```css
      /* In CSS, not markup: the server cannot know the guest's motion setting. */
      @media (prefers-reduced-motion: reduce) {
        .cr-gate[data-opened] :is(.cr-cover, .cr-cover-frame, .cr-wave, .cr-sand-names, .cr-cover-open .cr-sun-mark) { transition: none; }
      }
```

`src/themes/kelir-kencana/ThemeStyles.tsx` — replace

```css
      .kk-gate[data-reduced-motion="true"] :is(.kk-cover, .kk-cover-copy, .kk-stage-gunungan, .kk-stage-figure) { transition: none; }
```

with

```css
      /* In CSS, not markup: the server cannot know the guest's motion setting. */
      @media (prefers-reduced-motion: reduce) {
        .kk-gate[data-opened] :is(.kk-cover, .kk-cover-copy, .kk-stage-gunungan, .kk-stage-figure) { transition: none; }
      }
```

If a rule sits inside a template literal that already contains a `@media (prefers-reduced-motion: reduce)` block at the same place, merge into that block instead of adding a second one.

- [ ] **Step 5: Update the tests that pinned the attribute**

Each replacement keeps the test's intent (reduced motion stops the cover motion) and pins the fix (no attribute in markup):

`tests/cobalt-riviera-identity.test.mjs` — replace
`assert.match(sheet, /data-reduced-motion="true"\] :is\([^)]*\.cr-wave[^)]*\)\s*\{\s*transition:\s*none/);`
with
`assert.match(sheet, /@media \(prefers-reduced-motion: reduce\)\s*\{[^@]*\.cr-gate\[data-opened\] :is\([^)]*\.cr-wave[^)]*\)\s*\{\s*transition:\s*none/);`

`tests/cobalt-riviera-quality.test.mjs` — replace
`assert.equal(view.document.querySelector(".cr-gate").dataset.reducedMotion, "true");`
with
`assert.equal(view.document.querySelector(".cr-gate").hasAttribute("data-reduced-motion"), false, "reduced motion lives in CSS so server and client markup match");`
and replace `assert.match(css, /data-reduced-motion="true"/);` with `assert.match(css, /@media \(prefers-reduced-motion: reduce\)\s*\{[^@]*\.cr-gate\[data-opened\]/);`

`tests/cobalt-riviera-shell.test.mjs` — replace
`assert.equal(view.document.querySelector(".cr-gate")?.getAttribute("data-reduced-motion"), "true");`
with
`assert.equal(view.document.querySelector(".cr-gate")?.hasAttribute("data-reduced-motion"), false);`
and replace `assert.match(css, /data-reduced-motion="true"/);` with `assert.match(css, /@media \(prefers-reduced-motion: reduce\)\s*\{[^@]*\.cr-gate\[data-opened\]/);`

`tests/midnight-atelier-identity.test.mjs` — replace
`assert.match(sheet, /data-reduced-motion="true"\] :is\([^)]*\.ma-flute[^)]*\)\s*\{[^}]*animation:\s*none/);`
with
`assert.match(sheet, /@media \(prefers-reduced-motion: reduce\)\s*\{[^@]*\.ma-gate\[data-opened\] :is\([^)]*\.ma-flute[^)]*\)\s*\{[^}]*animation:\s*none/);`

`tests/midnight-atelier-shell.test.mjs` — replace
`assert.equal(view.document.querySelector(".ma-gate")?.getAttribute("data-reduced-motion"), "true");`
with
`assert.equal(view.document.querySelector(".ma-gate")?.hasAttribute("data-reduced-motion"), false);`
replace `assert.match(css, /data-reduced-motion="true"\][^{]*\.ma-flute/);` with `assert.match(css, /\.ma-gate\[data-opened\] :is\([^)]*\.ma-flute/);`
and replace `assert.match(css, /data-reduced-motion="true"/);` with `assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);`

- [ ] **Step 6: Run to verify it passes**

Run: `node --test tests/template-hydration.test.mjs tests/cobalt-riviera-identity.test.mjs tests/cobalt-riviera-quality.test.mjs tests/cobalt-riviera-shell.test.mjs tests/midnight-atelier-identity.test.mjs tests/midnight-atelier-shell.test.mjs tests/kelir-kencana.test.mjs`
Expected: PASS. Then `npm run lint && npm run typecheck` — clean.

- [ ] **Step 7: Commit**

```bash
git add tests/template-hydration.test.mjs tests/cobalt-riviera-*.test.mjs tests/midnight-atelier-*.test.mjs src/themes/midnight-atelier src/themes/cobalt-riviera src/themes/kelir-kencana
git commit -m "fix(themes): reduced-motion cover rules in CSS, not markup

Midnight, Cobalt and Kelir rendered data-reduced-motion from
useReducedMotion(): false on the server, true for a reduced-motion guest,
so React kept the server value and the cover rules never applied. A
cross-theme test now hydrates every theme as a reduced-motion guest.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Kelir contrast (A2)

**Files:**
- Modify: `src/themes/kelir-kencana/tokens.ts` (`kencanaInk`)
- Create: `tests/kelir-kencana-contrast.test.mjs`

- [ ] **Step 1: Write the failing test**

Create `tests/kelir-kencana-contrast.test.mjs`:

```js
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
```

- [ ] **Step 2: Run to verify it fails**

Run: `node --test tests/kelir-kencana-contrast.test.mjs`
Expected: FAIL with `kencanaInk on kelirDeep is 4.03:1`.

- [ ] **Step 3: Darken the ink**

In `src/themes/kelir-kencana/tokens.ts` replace `kencanaInk: "#84601D",` with `kencanaInk: "#7A581B",` and update its comment to `/** Kencana deepened for text on kelir and kelirDeep (AA on both). */`.

- [ ] **Step 4: Run to verify it passes**

Run: `node --test tests/kelir-kencana-contrast.test.mjs tests/kelir-kencana.test.mjs tests/share-banners.test.mjs`
Expected: PASS. If a test pins `#84601D` (share banners or screenshots), update it to `#7A581B` and say so in the ledger.

- [ ] **Step 5: Commit**

```bash
git add src/themes/kelir-kencana/tokens.ts tests/kelir-kencana-contrast.test.mjs
git commit -m "fix(kelir): AA contrast for gold ink on the deep screen

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Full nav glyph records for Cobalt and Kelir (A4)

**Files:**
- Modify: `src/themes/cobalt-riviera/components/NavIcon.tsx`, `src/themes/cobalt-riviera/components/RouteNavigation.tsx`
- Modify: `src/themes/kelir-kencana/components/NavIcon.tsx`, `src/themes/kelir-kencana/components/RouteNavigation.tsx`
- Test: `tests/template-readiness.test.mjs` (append)

**Interfaces:**
- Consumes: `NAV_SECTION_KEYS`, `NavSectionKey` (`src/lib/packages/nav-sections.ts`).
- Produces: `NavIcon({ section: NavSectionKey; className? })` in both themes, rendering `data-icon={section}` with no fallback glyph.

- [ ] **Step 1: Write the test**

Append to `tests/template-readiness.test.mjs`:

```js
test("every theme with a NavIcon component keys it by the full NavSectionKey record (§28.3)", () => {
  for (const slug of THEME_SLUGS) {
    const path = join(themesRoot, slug, "components", "NavIcon.tsx");
    let source;
    try { source = readFileSync(path, "utf8"); } catch { continue; }
    assert.doesNotMatch(source, /Partial<Record</, `${slug} NavIcon must not be Partial`);
    assert.doesNotMatch(source, /hasGlyph|COMPASS|DIAMOND/, `${slug} NavIcon must not need a fallback glyph`);
    // Terra aliases the key type (TerraNavSection = NavSectionKey), so check the name, not the exact generic.
    assert.match(source, /NavSectionKey/, `${slug} NavIcon covers every NavSectionKey`);
  }
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `node --test --test-name-pattern="full NavSectionKey" tests/template-readiness.test.mjs`
Expected: FAIL for `cobalt-riviera` ("must not be Partial").

- [ ] **Step 3: Make the records full**

In `src/themes/cobalt-riviera/components/NavIcon.tsx`:
- import `type { NavSectionKey } from "@/lib/packages/nav-sections";` (drop the `ThemeSectionKey` import if unused);
- change `} satisfies Partial<Record<ThemeSectionKey, ReactElement>>;` to `} satisfies Record<NavSectionKey, ReactElement>;`;
- delete the `COMPASS` constant and `hasGlyph`;
- change `NavIcon({ section, className }: { section: ThemeSectionKey; className?: string })` to take `section: NavSectionKey`, render `ROUTE_ICON_GLYPHS[section]`, and set `data-icon={section}`.

Do the same in `src/themes/kelir-kencana/components/NavIcon.tsx` with `NAV_ICON_GLYPHS`, removing `DIAMOND` and `hasGlyph`.

In both `RouteNavigation.tsx` files change the nav item's `section: ThemeSectionKey;` to `section: NavSectionKey;` (import from `@/lib/packages/nav-sections`). If TypeScript then reports a call site passing a non-nav section, that call site is a bug: report it in the ledger.

- [ ] **Step 4: Run to verify it passes**

Run: `node --test tests/template-readiness.test.mjs tests/cobalt-riviera-shell.test.mjs tests/kelir-kencana.test.mjs tests/nav-priority.test.mjs` and `npm run typecheck`
Expected: PASS and clean. A test asserting `data-icon="compass"` or `"diamond"` for some section is evidence that section had no icon: replace the expectation with the section key and ledger it.

- [ ] **Step 5: Commit**

```bash
git add src/themes/cobalt-riviera/components src/themes/kelir-kencana/components tests/template-readiness.test.mjs
git commit -m "refactor(themes): full nav glyph records for Cobalt and Kelir

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Drawn arrows in Midnight (A5)

**Files:**
- Modify: `src/themes/shared/action-icons.tsx` (add `ForwardArrowIcon`)
- Modify: `src/themes/midnight-atelier/CoverGate.tsx`, `src/themes/midnight-atelier/sections/RsvpSection.tsx`, `src/themes/midnight-atelier/sections/WishesSection.tsx`
- Test: `tests/action-icons.test.mjs` (append), `tests/template-readiness.test.mjs` (extend the arrow rule)

**Interfaces:**
- Produces: `ForwardArrowIcon({ className?: string })` — a thin horizontal arrow, `aria-hidden`, class `theme-action-icon`.

- [ ] **Step 1: Write the failing tests**

In `tests/template-readiness.test.mjs`, change the arrow rule so it also bans "→":
- `name: "no typed ↗ or ↓ arrows in markup (§28.5)"` → `name: "no typed arrows in markup (§28.5)"`
- regex `/[↗↓]/` → `/[↗↓→]/`
- in the self-test map, rename the key to `"no typed arrows in markup (§28.5)"` and use `"<span>Kirim →</span>"`.

In `tests/action-icons.test.mjs`, widen the existing text-arrow check from `/>\s*[↗↘↓]\s*</` to `/>\s*[↗↘↓→]\s*</`, then add these imports at the top:

```js
import { createRequire } from "node:module";
import vm from "node:vm";
import ts from "typescript";
```

and append:

```js
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
```

- [ ] **Step 2: Run to verify they fail**

Run: `node --test tests/template-readiness.test.mjs tests/action-icons.test.mjs`
Expected: FAIL — the readiness arrow rule and the widened action-icons check both list the three Midnight files; `ForwardArrowIcon` is not a function.

- [ ] **Step 3: Add the glyph and use it**

Append to `src/themes/shared/action-icons.tsx` after `DownloadArrowIcon`:

```tsx
/** Moves on (open, send): a thin horizontal arrow. */
export function ForwardArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`theme-action-icon ${className}`} aria-hidden="true" focusable="false" {...STROKE}>
      <path d="M4 12h15M14 7l5 5-5 5" />
    </svg>
  );
}
```

In the three Midnight files, import `ForwardArrowIcon` from `@/themes/shared/action-icons` and replace each `<span aria-hidden="true">→</span>` with `<span aria-hidden="true"><ForwardArrowIcon /></span>` (the span keeps `.ma-cover-open span:last-child` and the submit-button styles). If the arrow then renders at the wrong size, size it with the existing `.theme-action-icon` rule or one Midnight rule (`.ma-theme :is(.ma-cover-open, .ma-form-submit) .theme-action-icon { width: 1em; height: 1em; }`), checked in the browser at 375 px.

- [ ] **Step 4: Run to verify they pass**

Run: `node --test tests/template-readiness.test.mjs tests/action-icons.test.mjs tests/midnight-atelier-*.test.mjs`
Expected: PASS. A Midnight test asserting the button's text content now sees no "→": update the expectation to the label alone and ledger it.

- [ ] **Step 5: Commit**

```bash
git add src/themes/shared/action-icons.tsx src/themes/midnight-atelier tests/template-readiness.test.mjs tests/action-icons.test.mjs
git commit -m "fix(midnight): drawn forward arrows instead of typed ones

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Verification, audit report, PR

**Files:**
- Modify: `docs/qa/2026-10-template-audit.md` (round A table)

- [ ] **Step 1: Full verification**

Run: `npm test`, `npm run lint`, `npm run typecheck`, `npm run build`
Expected: all pass.

- [ ] **Step 2: QA matrix on the affected cases**

With `npm run dev` running and `PLAYWRIGHT_CORE` set (see `docs/DESIGN.md` §28.7):

```bash
npm run qa:matrix -- --theme midnight-atelier --viewport 375 --chromium "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
npm run qa:matrix -- --theme cobalt-riviera --viewport 375 --chromium "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
npm run qa:matrix -- --theme kelir-kencana --viewport 375 --chromium "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
```

Expected: the reduced-motion case (`…__375__rm`) passes in all three; remaining failures are only the known round B/C findings ("Mempelai" on non-wedding pages). Open the Midnight cover and RSVP screenshots to confirm the drawn arrow sits where "→" was, and the Kelir dress-code screenshot to confirm the eyebrow colour still reads as gold.

- [ ] **Step 3: Record round A**

Fill the "Round A — Technical (§28)" table in `docs/qa/2026-10-template-audit.md` with A1–A5 (template, location, finding, severity, evidence = the test name, status = fixed in this PR), and add one line under the baseline table that the reduced-motion hydration rows are fixed.

- [ ] **Step 4: Commit, push, PR**

```bash
git add docs/qa/2026-10-template-audit.md
git commit -m "docs(qa): round A findings fixed

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push -u origin HEAD
gh pr create --base main --title "Template audit round A: §28 technical fixes" --body "$(cat <<'EOF'
Round A of the template readiness audit (spec docs/superpowers/specs/2026-10-11-template-readiness-audit-design.md, plan docs/superpowers/plans/2026-10-12-template-audit-round-a.md).

- A1: Midnight, Cobalt and Kelir no longer render data-reduced-motion; the cover rules moved into @media (prefers-reduced-motion: reduce). This fixes a hydration mismatch that kept those rules from ever applying.
- A2: Kelir gold ink #84601D → #7A581B, which is AA on the deep screen (was 4.03:1). New Kelir contrast test.
- A3: Cross-theme tests. tests/template-readiness.test.mjs checks the §28 source rules, and tests/template-hydration.test.mjs hydrates every theme as a reduced-motion guest.
- A4: Cobalt and Kelir nav glyphs are full Record<NavSectionKey, …> with no fallback glyph.
- A5: Midnight uses a drawn ForwardArrowIcon instead of a typed "→".

Presentation only; no data or capability change.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Report the PR link and stop; the owner decides the merge.
