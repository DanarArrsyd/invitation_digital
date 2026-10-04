# Cobalt Riviera Identity ("Surat Cinta dari Mediterania") Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give Cobalt Riviera its "Surat Cinta dari Mediterania" identity — Corinthia (names) / Familjen Grotesk (spaced-capital labels) / Newsreader (italic headings, body ≥17px), the kobalt-porselen-tinta laut-jeruk-citron-kolam palette with a senja (sunset) sky token, a receding-wave opener that replaces the horizon shutters, and four signature interactions (swaying wave dividers, a morning-to-sunset sky with a sinking sun, an orange "Diterima" postmark on the RSVP confirmation, a message in a bottle after a sent wish) — without changing any capability.

**Architecture:** Presentation-only change inside `src/themes/cobalt-riviera/` plus font wiring in `src/themes/theme-fonts.ts`. Cobalt stays CSS-driven like Terra and Midnight: no Motion components (every Cobalt harness stubs `motion/react` down to `useReducedMotion`), animations are CSS keyframes/transitions toggled by data attributes, scroll-linked values come from the shared `src/themes/shared/use-scroll-progress.ts` (writes a CSS custom property, never re-renders React). Colours stay in `tokens.ts` and are interpolated by `ThemeStyles.tsx`; existing `--cr-*` names are re-pointed, not renamed, and three tokens are added.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, `@fontsource`, `node --test` with vm/ts-transpile harnesses and jsdom.

**Spec:** `docs/superpowers/specs/2026-10-03-theme-identity-redesign-design.md` §3, §7, §8–10. Reference implementations of the pattern: the merged Midnight plan `docs/superpowers/plans/2026-10-04-midnight-identity.md` and Terra plan `docs/superpowers/plans/2026-10-03-terra-identity.md`.

**Already done for Cobalt — do not redo:** nautical/postal nav icons (`components/NavIcon.tsx`), calendar actions inside the countdown (`components/AddToCalendar.tsx` used by `CountdownSection`), 5-item non-scrolling mobile bar (`pickNavItems`, `.cr-route-nav` sizing in `@media (max-width: 1199px)`), 3:4 title-first hero. Familjen Grotesk and Newsreader are already installed and mapped (`--font-cr-display`, `--font-cr-body`); Task 1 only adds Corinthia and Newsreader's italic axis and reassigns roles. Their tests in `tests/cobalt-riviera-shell.test.mjs`, `-narrative.test.mjs`, `-itinerary.test.mjs` must keep passing (only the assertions named in each task change).

## Global Constraints

- Fonts: Corinthia Bold (couple names, signatures and the cover's sand names only) · Familjen Grotesk (spaced-capital labels, dates, actions, nav) · Newsreader (headings in italic; body ≥17px). Self-hosted via `@fontsource`; no Google Fonts at runtime. Only the Latin `700` Corinthia face is imported.
- No font may be mapped by two themes (`tests/font-delivery.test.mjs`).
- Palette (re-pointed, names unchanged): kobalt `#1D3E9E` (`--cr-cobalt`), porselen `#F7F4EC` (`--cr-porcelain`), tinta laut `#0E2350` (`--cr-sea-ink`), jeruk `#E8743B` (`--cr-tangerine`), citron `#E9D35B` (`--cr-citron`), kolam `#8EC5D6` (`--cr-pool`). Added: `--cr-tangerine-ink` `#9A3D14` (jeruk for text; raw jeruk is 2.73:1 on porselen), `--cr-sea-ink-soft` `#4A5878` (placeholders/secondary), `--cr-sunset` `#F8DCC4` (senja sky).
- Contrast: every text pair on every surface ≥4.5:1 (large display text ≥3:1), including text over the sky. The morning-to-sunset ramp is tested at 0, .25, .5, .75 and 1 for every text colour used on porcelain chapters; raw jeruk never colours text (`.cr-route-rule` is the only `color: var(--cr-tangerine)` owner, and it draws rules, not text).
- No `linear-gradient`, `radial-gradient`, `conic-gradient`, `box-shadow`, `backdrop-filter` or `border-radius` anywhere in the Cobalt stylesheet (`-foundation`, `-shell`, `-itinerary`, `-narrative`, `-story-gallery`, `-interactions` tests). Round shapes are SVG circles or `clip-path: circle()`; the sky is two flat colour layers cross-faded by opacity.
- Motion animates only `transform`, `opacity`, `clip-path`, `stroke-dashoffset` and CSS custom properties driving those; particle/decor nodes per effect ≤20; celebrations are mounted by the success state and leave the DOM when done.
- Scroll-linked effects use `useScrollProgress` (rAF-throttled, custom property, recomputed on body resize) and change only `opacity` and `transform` of composited layers (`will-change`), never a background colour of a large area.
- In-view effects: any once-only reveal uses the shared `useInViewOnce`, and its data attribute is `watching ? (seen ? "on" : "waiting") : undefined` so an element already on screen keeps no attribute and never blinks. The wave dividers are not a reveal (they hide nothing); they pause/resume with a direct observer that writes `data-sway` and is absent in server markup.
- `prefers-reduced-motion: reduce` → cover hides at once, waves still, the sky is pinned to its final (sunset) palette, the postmark shows at rest, no bottle; every confirmation text still appears.
- One tap on "Buka undangan" calls `openInvitation()` synchronously (music in the same gesture); the opener never delays it. The cover turns `inert` immediately. The open button stays on screen on a 360×640 phone: cover type shrinks under `@media (max-height: 700px)`.
- Anything shown after an RSVP depends on the attendance that was **submitted** (captured from `FormData` in `handleSubmit`), never the live choice: the choice buttons stay enabled while the action is pending.
- A sent-wish effect stays inside its own clipped band above the thank-you and never covers the section heading on phones; the thank-you text is never replaced or covered.
- Server markup and the first client render must agree: no reduced-motion branching in initial markup; scroll and visibility state is written to the DOM only after mount.
- Cobalt source must not contain `<img` or `querySelector` (`tests/cobalt-riviera-quality.test.mjs`, `-foundation.test.mjs`); use refs.
- The cover's open button keeps class `cr-cover-open`, text "Buka undangan", the `.cr-sun-mark` inside it and `aria-controls="cr-content"`; the cover `h1.cr-cover-names` still contains both names and keeps `max-width: 100%`, `flex-wrap: wrap`, `overflow-wrap: anywhere` (shell test).
- Binding mobile rules stay intact: DESIGN.md §9 (3:4 hero, title first) and §12a (≤5 nav items, equal widths, no sideways scroll, ≥52px items, labels ≥11px, content padding for the bar). Name headings are never capped by a `ch` measure (owner rule) — Cobalt's hero and closing names currently are (`max-width: 11ch`); Task 3 removes that.
- No capability added or removed. RSVP collects name and attendance only; the postmark shows attendance only. A new wish reaches the list through the existing server revalidation, not an optimistic insert.
- Guest-facing labels are Bahasa Indonesia; thanks are "Terima kasih" (no "Matur nuwun", no "Grazie" in place of it). Small Italian accents ("Saluti dalla Costa", "Saluti") carry `lang="it"`. "Cobalt Riviera" stays as the masthead brand mark.
- Every existing test keeps passing. Tests that pin the old palette, shutters, `CR / 04` or font list are updated deliberately in the task that changes that behaviour (named in each task). Baseline: `npm test` 370/371 — the one failure is the known environmental countdown-timezone test in `tests/terra-botanica-render.test.mjs`.
- Merging to `main` auto-deploys production: open a PR and **ask the user before merging**.
- Execution branch: `design/terra-identity-at0kh3`. Before Task 1 run `git fetch origin && git merge --ff-only origin/main` (local `59db030` → `origin/main` `13d9150`, same tree); if it is not a fast-forward, stop and ask. Do not create or switch branches.
- Commit messages end with:
  ```
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_011pT7SiXwq9HVRhaYt6ogn3
  ```
  (subagents use their own model name in the first line).

## Owner decisions (open — confirm before Task 1)

Recommended defaults are written into the tasks; change the task if the owner decides otherwise.

1. **Postmark on "Tidak Hadir" too?** Default: yes. The postmark is a receipt ("Diterima"), not a celebration, so it stamps every successful RSVP and names the submitted attendance ("HADIR" / "TIDAK HADIR").
2. **Where does the sun sink?** Default: a small sun in the left page gutter (like Terra's vine), visible through the porcelain chapters and passing behind the opaque cobalt/kolam/tinta laut chapters; it never sits under text.
3. **Reduced-motion sky:** Default: pinned to the final (sunset) palette, per spec §3 "scroll-linked effects render their final state". Alternative: pin morning (the brightest look).
4. **Italian accents:** Default: only "Saluti dalla Costa" (cover masthead) and "Saluti" (hero horizon), both `lang="it"`; no "Grazie". The cover's "+" between the names becomes a Newsreader italic "&".

## File Map

| File | Change |
|---|---|
| `package.json`, `package-lock.json` | add `@fontsource/corinthia` |
| `src/themes/theme-fonts.ts` | Cobalt block imports Corinthia 700, Familjen Grotesk, Newsreader (+ italic axis) |
| `src/themes/cobalt-riviera/fonts.css`, `fonts.ts`, `CobaltRiviera.tsx` | script face handle |
| `src/themes/cobalt-riviera/tokens.ts` | re-pointed palette; `tangerineInk`, `seaInkSoft`, `sunset` |
| `src/themes/cobalt-riviera/ThemeStyles.tsx` | type tokens and roles, palette, names, waves, dividers, sky, postmark, bottle |
| `src/themes/registry.ts` | Cobalt preview palette |
| `src/themes/cobalt-riviera/components/RecedingWaves.tsx` | new: cover opener |
| `src/themes/cobalt-riviera/components/WaveDivider.tsx` | new: swaying chapter divider |
| `src/themes/cobalt-riviera/components/RivieraSky.tsx` | new: morning-to-sunset sky and sun |
| `src/themes/cobalt-riviera/components/Postmark.tsx` | new: RSVP receipt mark |
| `src/themes/cobalt-riviera/components/WishBottle.tsx` | new: wish celebration |
| `src/themes/cobalt-riviera/components/Section.tsx` | renders the divider |
| `src/themes/cobalt-riviera/CoverGate.tsx` | waves replace shutters; script names; Italian masthead; `intro` prop |
| `src/themes/cobalt-riviera/sections/{HeroSection,CoupleSection,ClosingSection}.tsx` | script names |
| `src/themes/cobalt-riviera/sections/{RsvpSection,WishesSection}.tsx` | postmark, bottle |
| `src/themes/cobalt-riviera/sections/{HeroSection,CoupleSection,EventsSection,CountdownSection,DressCodeSection,LivestreamSection,QuoteSection,GiftSection,ClosingSection}.tsx` | Indonesian labels |
| `tests/cobalt-riviera-identity.test.mjs` | new: identity tests + harness |
| `tests/font-delivery.test.mjs` | Cobalt faces |
| `tests/cobalt-riviera-foundation.test.mjs` | font and palette assertions |
| `tests/cobalt-riviera-itinerary.test.mjs` | focus-ring hex values |
| `tests/cobalt-riviera-shell.test.mjs` | shutters → waves |
| `tests/cobalt-riviera-narrative.test.mjs` | `CR / 04` → `Saluti` |
| `tests/theme-contract.test.mjs`, `tests/terra-botanica-registration.test.mjs`, `tests/cobalt-riviera-registration.test.mjs` | Cobalt preview palette |
| `CLAUDE.md`, `docs/PROJECT_MEMORY.md`, `docs/DESIGN.md` §27, `docs/superpowers/specs/2026-10-01-cobalt-riviera-theme-design.md`, `docs/superpowers/specs/2026-10-03-theme-identity-redesign-design.md` §7 | record the new direction |

---

### Task 1: Cobalt font system

**Files:**
- Modify: `package.json`, `package-lock.json`
- Modify: `src/themes/theme-fonts.ts`
- Modify: `src/themes/cobalt-riviera/fonts.css`, `src/themes/cobalt-riviera/fonts.ts`, `src/themes/cobalt-riviera/CobaltRiviera.tsx`, `src/themes/cobalt-riviera/ThemeStyles.tsx`
- Test: `tests/font-delivery.test.mjs`, `tests/cobalt-riviera-foundation.test.mjs` (deliberate update: it lists the approved packages and faces)

**Interfaces:**
- Produces: tokens `--cr-script`, `--cr-label`, `--cr-text`; classes `.cr-script` (names) and `.cr-label` (Familjen spaced capitals); the heading rule `.cr-theme :is(h2, h3, blockquote):not(.cr-script)`. Later tasks use these names verbatim.

- [ ] **Step 1: Write the failing tests**

In `tests/font-delivery.test.mjs` replace the `"cobalt-riviera"` entry of `THEME_FONTS` with:

```js
  "cobalt-riviera": {
    packages: [/@fontsource\/corinthia/, /@fontsource-variable\/familjen-grotesk/, /@fontsource-variable\/newsreader/],
    faces: [
      /--font-cr-script:\s*"Corinthia"/,
      /--font-cr-display:\s*"Familjen Grotesk Variable"/,
      /--font-cr-body:\s*"Newsreader Variable"/,
    ],
  },
```

and append:

```js
test("Cobalt styles consume the script, label and text faces", async () => {
  const [styles, themeFonts] = await Promise.all([
    source("src/themes/cobalt-riviera/ThemeStyles.tsx"),
    source("src/themes/theme-fonts.ts"),
  ]);
  assert.match(styles, /--cr-script:\s*var\(--font-cr-script\)/);
  assert.match(styles, /--cr-label:\s*var\(--font-cr-display\)/);
  assert.match(styles, /--cr-text:\s*var\(--font-cr-body\)/);
  assert.doesNotMatch(styles, /var\(--font-cr-(display|body)\), (Arial|Georgia)/, "every rule reads the role tokens");
  assert.match(styles, /font-family:\s*var\(--cr-text\);\s*font-size:\s*1\.0625rem/, "body text is at least 17px");
  assert.match(styles, /\.cr-theme \.cr-script\s*\{[^}]*font-family:\s*var\(--cr-script\)[^}]*font-weight:\s*700/);
  assert.match(styles, /\.cr-theme \.cr-label\s*\{[^}]*font-family:\s*var\(--cr-label\)[^}]*text-transform:\s*uppercase/);
  assert.match(styles, /\.cr-theme :is\(h2, h3, blockquote\):not\(\.cr-script\)\s*\{\s*font-family:\s*var\(--cr-text\);\s*font-style:\s*italic/);
  for (const size of styles.matchAll(/font-size:\s*([\d.]+)rem;\s*line-height:\s*1\.[5-6]/g)) {
    assert.ok(Number(size[1]) >= 1.0625, `reading text at ${size[1]}rem is below 17px`);
  }
  assert.match(themeFonts, /@fontsource\/corinthia\/700\.css/, "names use Corinthia Bold");
  assert.match(themeFonts, /@fontsource-variable\/newsreader\/wght-italic\.css/, "italic headings ship the italic axis");
});
```

In `tests/cobalt-riviera-foundation.test.mjs` (test "Cobalt stays presentation-only and bundles only its approved font families") after `assert.match(fontsTs, /@fontsource-variable\/newsreader/);` add:

```js
  assert.match(fontsTs, /@fontsource\/corinthia\/700\.css/);
  assert.match(fontsCss, /--font-cr-script:\s*"Corinthia"/);
  assert.match(packageJson, /@fontsource\/corinthia/);
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/font-delivery.test.mjs tests/cobalt-riviera-foundation.test.mjs`
Expected: FAIL — `@fontsource/corinthia` missing from `theme-fonts.ts`, no `--font-cr-script`, "Cobalt styles consume…" fails.

- [ ] **Step 3: Install the package**

```bash
npm install @fontsource/corinthia@^5.3.0
ls node_modules/@fontsource/corinthia/700.css
```

(`@fontsource-variable/familjen-grotesk` and `@fontsource-variable/newsreader` are already installed; Newsreader ships `wght-italic.css`.)

- [ ] **Step 4: Wire the faces**

In `src/themes/theme-fonts.ts` replace the Cobalt block with:

```ts
// cobalt-riviera
import "@fontsource/corinthia/700.css";
import "@fontsource-variable/familjen-grotesk";
import "@fontsource-variable/newsreader";
import "@fontsource-variable/newsreader/wght-italic.css";
import "./cobalt-riviera/fonts.css";
```

Replace `src/themes/cobalt-riviera/fonts.css` with:

```css
.cr-font-script {
  --font-cr-script: "Corinthia";
}

.cr-font-display {
  --font-cr-display: "Familjen Grotesk Variable";
}

.cr-font-body {
  --font-cr-body: "Newsreader Variable";
}
```

Replace `src/themes/cobalt-riviera/fonts.ts` with:

```ts
/** Postcard script — couple names and the cover's sand names only. */
export const rivieraScript = { variable: "cr-font-script" } as const;

/** Grotesk — spaced-capital labels, dates, actions and navigation. */
export const rivieraDisplay = { variable: "cr-font-display" } as const;

/** Newsreader — italic headings and body text (≥17px). */
export const rivieraBody = { variable: "cr-font-body" } as const;
```

In `src/themes/cobalt-riviera/CobaltRiviera.tsx` replace `import { rivieraBody, rivieraDisplay } from "./fonts";` with

```tsx
import { rivieraBody, rivieraDisplay, rivieraScript } from "./fonts";
```

and the root class with

```tsx
      className={`cr-theme ${rivieraScript.variable} ${rivieraDisplay.variable} ${rivieraBody.variable}`}
```

- [ ] **Step 5: Retarget the Cobalt type roles**

In `src/themes/cobalt-riviera/ThemeStyles.tsx`:

1. Replace every `var(--font-cr-display), Arial, sans-serif` with `var(--cr-label)` (46 occurrences; replace-all).
2. Replace every `var(--font-cr-body), Georgia, serif` with `var(--cr-text)` (4 occurrences; replace-all).
3. Inside the `.cr-theme { … }` rule replace `font-family: var(--cr-text);` with:

```css
        --cr-script: var(--font-cr-script), "Snell Roundhand", cursive;
        --cr-label: var(--font-cr-display), "Helvetica Neue", Arial, sans-serif;
        --cr-text: var(--font-cr-body), "Iowan Old Style", Georgia, serif;
        font-family: var(--cr-text);
        font-size: 1.0625rem;
```

(The fallbacks after each face deliberately do not start with `Arial`/`Georgia`, so the test can prove no rule still reads a raw face.)

4. Raise reading text to 17px: replace every `font-size: 1.05rem;` with `font-size: 1.0625rem;` (5 occurrences); in `.cr-hero-copy > p:not(.cr-hero-index):not(.cr-guest)` replace `font-size: clamp(1.05rem, 2vw, 1.35rem);` with `font-size: clamp(1.0625rem, 2vw, 1.35rem);`; in `.cr-gallery-item figcaption` replace `font-size: .95rem;` with `font-size: 1.0625rem;`; in `.cr-form-control` replace `font: 1rem/1.5 var(--cr-text);` with `font: 1.0625rem/1.5 var(--cr-text);`.
5. Directly before the `@media (max-width: 767px)` block add:

```css
      /* Postcard voices: Corinthia for names (.cr-script), Newsreader italic for
         headings and numerals, Familjen Grotesk spaced capitals for labels. */
      .cr-theme :is(h2, h3, blockquote):not(.cr-script) { font-family: var(--cr-text); font-style: italic; font-variation-settings: normal; font-weight: 500; letter-spacing: -.015em; line-height: 1.02; }
      .cr-theme :is(.cr-countdown-units dd, .cr-gift-number, .cr-form-success strong) { font-family: var(--cr-text); font-style: italic; font-variation-settings: normal; font-weight: 500; letter-spacing: 0; font-variant-numeric: lining-nums; }
      .cr-theme :is(.cr-chapter-heading > p, .cr-dress-group h3) { font-family: var(--cr-label); font-size: .75rem; font-style: normal; font-weight: 600; letter-spacing: .16em; line-height: 1.2; text-transform: uppercase; }
      .cr-theme .cr-script { font-family: var(--cr-script); font-style: normal; font-variation-settings: normal; font-weight: 700; letter-spacing: 0; }
      .cr-theme .cr-label { font-family: var(--cr-label); font-size: .75rem; font-style: normal; font-weight: 600; letter-spacing: .16em; text-transform: uppercase; }
```

(Specificity: the heading rule is (0,2,1) and wins over every `.cr-… h2` rule; the label rule comes after it with equal specificity so `.cr-dress-group h3` stays a label; `.cr-script` is excluded from the heading rule by `:not()`. Until Task 3 the names render as Newsreader italic headings.)

- [ ] **Step 6: Run tests to verify they pass**

Run: `node --test tests/font-delivery.test.mjs tests/cobalt-riviera-foundation.test.mjs`
Expected: PASS.

Run: `grep -n "font-cr-display\|font-cr-body\|font-cr-script" src/themes/cobalt-riviera/ThemeStyles.tsx`
Expected: only the three token definitions inside `.cr-theme`.

Run: `npm test`
Expected: 371/372 (one new test); only the known countdown-timezone test fails.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json src/themes/theme-fonts.ts src/themes/cobalt-riviera/fonts.css src/themes/cobalt-riviera/fonts.ts src/themes/cobalt-riviera/CobaltRiviera.tsx src/themes/cobalt-riviera/ThemeStyles.tsx tests/font-delivery.test.mjs tests/cobalt-riviera-foundation.test.mjs
git commit -m "feat(cobalt): Corinthia, Familjen Grotesk and Newsreader italic type system

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_011pT7SiXwq9HVRhaYt6ogn3"
```

---

### Task 2: Palette, morning-to-sunset tokens and test harness

**Files:**
- Modify: `src/themes/cobalt-riviera/tokens.ts`
- Modify: `src/themes/cobalt-riviera/ThemeStyles.tsx`
- Modify: `src/themes/registry.ts` (Cobalt `preview.palette`)
- Modify: `tests/theme-contract.test.mjs`, `tests/terra-botanica-registration.test.mjs`, `tests/cobalt-riviera-registration.test.mjs` (Cobalt palette expectation)
- Modify: `tests/cobalt-riviera-foundation.test.mjs` (deliberate update: it pins the old six hex values)
- Modify: `tests/cobalt-riviera-itinerary.test.mjs` (deliberate update: the focus-ring test hard-codes the old cobalt, citron, sea-ink and porcelain hex values)
- Create: `tests/cobalt-riviera-identity.test.mjs`

**Interfaces:**
- Produces: tokens `tangerineInk` / `--cr-tangerine-ink`, `seaInkSoft` / `--cr-sea-ink-soft`, `sunset` / `--cr-sunset`. Test helpers in `tests/cobalt-riviera-identity.test.mjs` — `createLoader({ reducedMotion?, actions? })` returning `load(pathInsideCobaltDir)`, `mount(element, { intersectionObserver? })` (defaults to a no-op observer, because the route navigation's `useActiveSection` needs one), `invitation(overrides)`, `css()`, `tokens()`, `rules(css, selector)`, `owners(css, declarationRegex)`, `contrast(a, b)`, `mix(fg, bg, alpha)`, `pick(form, label)`, `submit(view, form)`, `FakeIntersectionObserver` (records `options`; `trigger(isIntersecting = true)`; does not disconnect on its own). Tasks 3–9 append tests to this file and reuse them.

- [ ] **Step 1: Write the failing tests**

Create `tests/cobalt-riviera-identity.test.mjs`:

```js
import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import vm from "node:vm";
import React, { act } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { renderToStaticMarkup, renderToString } from "react-dom/server";
import { JSDOM } from "jsdom";
import ts from "typescript";

const nodeRequire = createRequire(import.meta.url);
const srcRoot = fileURLToPath(new URL("../src/", import.meta.url));
const cobaltRoot = resolve(srcRoot, "themes/cobalt-riviera");

/**
 * Loads Cobalt TS/TSX through vm. Like every Cobalt harness, `motion/react`
 * is reduced to `useReducedMotion`; `actions` replaces the server actions.
 */
function createLoader({ reducedMotion = false, actions = {} } = {}) {
  const cache = new Map();
  function load(file) {
    const path = [file, `${file}.tsx`, `${file}.ts`, `${file}/index.ts`]
      .find((candidate) => existsSync(candidate) && statSync(candidate).isFile());
    assert.ok(path, `Missing module: ${file}`);
    if (cache.has(path)) return cache.get(path);
    const exports = {};
    cache.set(path, exports);
    const output = ts.transpileModule(readFileSync(path, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
    }).outputText;
    vm.runInNewContext(output, {
      exports, module: { exports }, console, Date, Intl, URL, URLSearchParams, Blob, process,
      setTimeout, clearTimeout, setInterval, clearInterval,
      get window() { return globalThis.window; },
      get document() { return globalThis.document; },
      get navigator() { return globalThis.navigator; },
      get FormData() { return globalThis.FormData; },
      get IntersectionObserver() { return globalThis.IntersectionObserver; },
      get requestAnimationFrame() { return globalThis.requestAnimationFrame; },
      get cancelAnimationFrame() { return globalThis.cancelAnimationFrame; },
      require(name) {
        if (name === "next/image") {
          return { __esModule: true, default: (imageProps) => {
            const props = { ...imageProps };
            delete props.fill;
            delete props.fetchPriority;
            delete props.unoptimized;
            return React.createElement("img", props);
          } };
        }
        if (name === "next/script") return { __esModule: true, default: () => null };
        if (name === "@/components/TurnstileWidget") return { TurnstileWidget: () => null };
        if (name === "@/app/(public)/[slug]/actions") {
          return {
            trackCoverOpenedAction: actions.trackCoverOpened ?? (async () => {}),
            submitRsvpAction: actions.submitRsvp ?? (async () => ({ status: "idle" })),
            submitWishAction: actions.submitWish ?? (async () => ({ status: "idle" })),
          };
        }
        if (name === "motion/react") return { useReducedMotion: () => reducedMotion };
        if (name.startsWith("@/")) return load(resolve(srcRoot, name.slice(2)));
        if (name.startsWith(".")) return load(resolve(dirname(path), name));
        return nodeRequire(name);
      },
    });
    return exports;
  }
  return (relative) => load(resolve(cobaltRoot, relative));
}

/** Never reports: nothing changes, like a browser that never scrolls. */
class NoopObserver { observe() {} disconnect() {} }

/** Records observed elements and options; `trigger()` reports them all. */
class FakeIntersectionObserver {
  static instances = [];
  constructor(callback, options) { this.callback = callback; this.options = options; this.elements = []; FakeIntersectionObserver.instances.push(this); }
  observe(element) { this.elements.push(element); }
  disconnect() { this.elements = []; }
  trigger(isIntersecting = true) { this.callback(this.elements.map((target) => ({ target, isIntersecting }))); }
}

async function mount(element, { intersectionObserver = NoopObserver } = {}) {
  const dom = new JSDOM("<div id='root'></div>", { url: "https://invitation.test/", pretendToBeVisual: true });
  const prior = {
    window: globalThis.window, document: globalThis.document, FormData: globalThis.FormData, HTMLElement: globalThis.HTMLElement,
    IntersectionObserver: globalThis.IntersectionObserver,
    requestAnimationFrame: globalThis.requestAnimationFrame, cancelAnimationFrame: globalThis.cancelAnimationFrame,
    navigator: Object.getOwnPropertyDescriptor(globalThis, "navigator"),
    IS_REACT_ACT_ENVIRONMENT: globalThis.IS_REACT_ACT_ENVIRONMENT,
  };
  Object.assign(globalThis, {
    window: dom.window, document: dom.window.document, FormData: dom.window.FormData, HTMLElement: dom.window.HTMLElement,
    IntersectionObserver: intersectionObserver,
    requestAnimationFrame: dom.window.requestAnimationFrame.bind(dom.window),
    cancelAnimationFrame: dom.window.cancelAnimationFrame.bind(dom.window),
    IS_REACT_ACT_ENVIRONMENT: true,
  });
  Object.defineProperty(globalThis, "navigator", { configurable: true, value: dom.window.navigator });
  const root = createRoot(dom.window.document.getElementById("root"));
  await act(async () => root.render(element));
  return {
    document: dom.window.document,
    window: dom.window,
    async cleanup() {
      await act(async () => root.unmount());
      const { navigator, ...rest } = prior;
      Object.assign(globalThis, rest);
      if (navigator) Object.defineProperty(globalThis, "navigator", navigator);
      dom.window.close();
    },
  };
}

function invitation(overrides = {}) {
  return {
    id: "cobalt", type: "wedding", slug: "cobalt", title: "Nadia & Arka", status: "published",
    eventDate: "2030-06-14", venueSummary: "Villa Laut", publishedAt: "2030-01-01T00:00:00Z", expiresAt: null,
    timeZone: "Asia/Jakarta",
    theme: { slug: "cobalt-riviera", settings: {} },
    people: [
      { id: "b", role: "bride", fullName: "Nadia Rahmani", nickname: "Nadia", fatherName: null, motherName: null, photoUrl: null, bio: null, sortOrder: 0 },
      { id: "g", role: "groom", fullName: "Arka Pradipta", nickname: "Arka", fatherName: null, motherName: null, photoUrl: null, bio: null, sortOrder: 1 },
    ],
    events: [{ id: "event", eventType: "Resepsi", title: "Resepsi", eventDate: "2030-06-14",
      startTime: "16:00:00", endTime: "20:00:00", venueName: "Villa Laut", address: null,
      mapsUrl: null, livestreamUrl: null, sortOrder: 0 }],
    stories: [{ id: "s", title: "Pertemuan", storyDate: null, yearLabel: "2021", description: "Di dermaga sore itu.", imageUrl: null, sortOrder: 0 }],
    gallery: [
      { id: "g1", imageUrl: "/a.jpg", caption: "Pagi di pantai", altText: null, aspectRatio: "portrait_4_5", sortOrder: 0 },
      { id: "g2", imageUrl: "/b.jpg", caption: null, altText: "Foto kedua", aspectRatio: "landscape_16_9", sortOrder: 1 },
      { id: "g3", imageUrl: "/c.jpg", caption: null, altText: null, aspectRatio: "square_1_1", sortOrder: 2 },
    ],
    gifts: [], wishes: [],
    content: { openingQuote: null, openingMessage: null, closingMessage: null },
    features: { music: false, countdown: true, maps: false, story: true, gallery: true, dressCode: false,
      livestream: false, rsvp: true, wishes: true, gift: false, guestPersonalization: false },
    media: { coverImageUrl: null, musicUrl: null },
    ...overrides,
  };
}

/** The rendered stylesheet, with token values interpolated. */
function css() {
  const { ThemeStyles } = createLoader()("ThemeStyles");
  return new JSDOM(renderToStaticMarkup(React.createElement(ThemeStyles))).window.document.querySelector("style").textContent;
}

const tokens = () => createLoader()("tokens").COBALT_RIVIERA_TOKENS.colors;

/** Declaration bodies of every rule whose selector ends with `selector`. */
function rules(sheet, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return [...sheet.matchAll(new RegExp(`(?:^|[}\\s])${escaped}\\s*\\{([^}]*)\\}`, "g"))].map((match) => match[1]);
}

/** Selectors of every innermost rule whose body matches `declaration`. */
function owners(sheet, declaration) {
  return [...sheet.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .filter(([, , body]) => declaration.test(body))
    .map(([, selector]) => selector.trim());
}

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

/** `fg` laid over `bg` at `alpha` (an opacity), as a hex colour. */
function mix(fg, bg, alpha) {
  return `#${[1, 3, 5].map((i) => Math.round(parseInt(fg.slice(i, i + 2), 16) * alpha + parseInt(bg.slice(i, i + 2), 16) * (1 - alpha))
    .toString(16).padStart(2, "0")).join("")}`;
}

/** The attendance choice whose label is exactly `label` (the check mark is a separate span). */
function pick(form, label) {
  return [...form.querySelectorAll(".cr-attendance-choice")].find((button) => button.querySelector("span").textContent === label);
}

function submit(view, form) {
  return act(async () => { form.dispatchEvent(new view.window.Event("submit", { bubbles: true, cancelable: true })); });
}

test("the Surat Cinta palette re-points every --cr token and keeps each text pair at WCAG AA", () => {
  const c = tokens();
  assert.deepEqual(
    [c.cobalt, c.porcelain, c.seaInk, c.tangerine, c.citron, c.pool],
    ["#1D3E9E", "#F7F4EC", "#0E2350", "#E8743B", "#E9D35B", "#8EC5D6"],
  );
  assert.deepEqual([c.tangerineInk, c.seaInkSoft, c.sunset], ["#9A3D14", "#4A5878", "#F8DCC4"]);
  for (const [fg, bg, min] of [
    ["porcelain", "cobalt", 4.5], ["citron", "cobalt", 4.5],
    ["seaInk", "porcelain", 7], ["cobalt", "porcelain", 4.5], ["tangerineInk", "porcelain", 4.5], ["seaInkSoft", "porcelain", 4.5],
    ["seaInk", "pool", 4.5], ["cobalt", "pool", 4.5],
    ["porcelain", "seaInk", 7], ["citron", "seaInk", 4.5],
    ["seaInk", "citron", 4.5], ["tangerineInk", "citron", 4.5],
    ["seaInk", "tangerine", 4.5],
  ]) {
    assert.ok(contrast(c[fg], c[bg]) >= min, `${fg} on ${bg} is ${contrast(c[fg], c[bg]).toFixed(2)}`);
  }
  const sheet = css();
  for (const name of ["--cr-tangerine-ink:\\s*#9A3D14", "--cr-sea-ink-soft:\\s*#4A5878", "--cr-sunset:\\s*#F8DCC4"]) {
    assert.match(sheet, new RegExp(name, "i"));
  }
  assert.deepEqual(owners(sheet, /(?:^|[;\s])color:\s*var\(--cr-tangerine\)/), [".cr-route-rule"], "raw jeruk (2.7:1) never colours text");
  assert.match(sheet, /\.cr-form-control::placeholder\s*\{[^}]*color:\s*var\(--cr-sea-ink-soft\)/);
  assert.doesNotMatch(sheet, /color-mix\(in srgb,\s*var\(--cr-sea-ink\)/, "no translucent text colours");
});

test("text on the porcelain chapters stays AA at every point of the morning-to-sunset ramp", () => {
  const c = tokens();
  for (const day of [0, 0.25, 0.5, 0.75, 1]) {
    const sky = mix(c.sunset, c.porcelain, day);
    for (const [fg, min] of [["seaInk", 7], ["cobalt", 4.5], ["tangerineInk", 4.5], ["seaInkSoft", 4.5]]) {
      const ratio = contrast(c[fg], sky);
      assert.ok(ratio >= min, `${fg} on the sky at ${day} is ${ratio.toFixed(2)}`);
    }
    assert.ok(contrast(c.cobalt, sky) >= 3, "the focus ring on porcelain chapters stays at least 3:1");
  }
});
```

In `tests/theme-contract.test.mjs` change the Cobalt expectation to:

```js
    "cobalt-riviera": { name: "Cobalt Riviera", palette: ["#1D3E9E", "#F7F4EC", "#E8743B"] },
```

In `tests/terra-botanica-registration.test.mjs` replace `["#1646C8", "#FFF9EE", "#F06A3C"]` with `["#1D3E9E", "#F7F4EC", "#E8743B"]`; in `tests/cobalt-riviera-registration.test.mjs` replace `palette: ["#1646C8", "#FFF9EE", "#F06A3C"],` with `palette: ["#1D3E9E", "#F7F4EC", "#E8743B"],`.

In `tests/cobalt-riviera-foundation.test.mjs` (test "Cobalt styles encode the approved palette…") replace

```js
  for (const color of ["#1646C8", "#FFF9EE", "#123047", "#F06A3C", "#F3CF4C", "#81C7D4"]) {
```

with

```js
  for (const color of ["#1D3E9E", "#F7F4EC", "#0E2350", "#E8743B", "#E9D35B", "#8EC5D6", "#9A3D14", "#4A5878", "#F8DCC4"]) {
```

In `tests/cobalt-riviera-itinerary.test.mjs` (test "every itinerary and broadcast control resolves a visible high-contrast focus ring from its surface") replace

```js
    const expected = dark ? "#F3CF4C" : "#1646C8";
    const background = surface?.classList.contains("cr-surface-sea-ink") ? "#123047"
      : surface?.classList.contains("cr-surface-cobalt") ? "#1646C8" : "#FFF9EE";
```

with

```js
    const expected = dark ? "#E9D35B" : "#1D3E9E";
    const background = surface?.classList.contains("cr-surface-sea-ink") ? "#0E2350"
      : surface?.classList.contains("cr-surface-cobalt") ? "#1D3E9E" : "#F7F4EC";
```

(The dress-code fixture colours `#F06A3C`/`#F3CF4C` in that file and `#1646C8`/`#FFF9EE` in `-quality.test.mjs` are customer data, not theme tokens; leave them.)

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/cobalt-riviera-identity.test.mjs tests/theme-contract.test.mjs tests/terra-botanica-registration.test.mjs tests/cobalt-riviera-registration.test.mjs tests/cobalt-riviera-foundation.test.mjs tests/cobalt-riviera-itinerary.test.mjs`
Expected: FAIL — old palette values, no `tangerineInk`/`seaInkSoft`/`sunset`, raw jeruk on five text rules, translucent placeholder, registry mismatch.

- [ ] **Step 3: Re-point the palette**

Replace `src/themes/cobalt-riviera/tokens.ts` with:

```ts
export const COBALT_RIVIERA_TOKENS = {
  slug: "cobalt-riviera",
  colors: {
    /** Kobalt — the sea and the majolica glaze; architectural chapters. */
    cobalt: "#1D3E9E",
    /** Porselen — the reading surface and the morning sky. */
    porcelain: "#F7F4EC",
    /** Tinta laut — body text and the night chapters. */
    seaInk: "#0E2350",
    /** Jeruk — fills, rules, accents and the postmark ring; never text (2.7:1 on porselen). */
    tangerine: "#E8743B",
    citron: "#E9D35B",
    /** Kolam — the quiet secondary field. */
    pool: "#8EC5D6",
    /** Jeruk deepened for text: AA on porselen, citron and the senja sky. */
    tangerineInk: "#9A3D14",
    /** Tinta laut softened for placeholders and secondary notes; AA on the whole sky ramp. */
    seaInkSoft: "#4A5878",
    /** Senja — the sky behind the porcelain chapters at the end of the day. */
    sunset: "#F8DCC4",
  },
} as const;
```

In `ThemeStyles.tsx`, inside `.cr-theme { … }` directly after `--cr-pool: ${colors.pool};` add:

```css
        --cr-tangerine-ink: ${colors.tangerineInk};
        --cr-sea-ink-soft: ${colors.seaInkSoft};
        --cr-sunset: ${colors.sunset};
```

- [ ] **Step 4: Move text off raw jeruk and translucent ink**

In `ThemeStyles.tsx`:
- `.cr-parent-join { color: var(--cr-tangerine); }` → `.cr-parent-join { color: var(--cr-tangerine-ink); }`
- `.cr-event-index { color: var(--cr-tangerine); }` → `.cr-event-index { color: var(--cr-tangerine-ink); }`
- In `.cr-story-index { … }` replace `color: var(--cr-tangerine);` with `color: var(--cr-tangerine-ink);`.
- In `.cr-wish-route, .cr-gift-route { … }` replace `color: var(--cr-tangerine);` with `color: var(--cr-tangerine-ink);`, and directly after that rule add `.cr-gift-route { color: var(--cr-sea-ink); }` (the gift chapter is kolam, where tangerine-ink is only 3:1).
- Replace `.cr-form-control::placeholder { color: color-mix(in srgb, var(--cr-sea-ink) 62%, transparent); }` with `.cr-form-control::placeholder { color: var(--cr-sea-ink-soft); opacity: 1; }`.

(Jeruk stays on fills and rules: `.cr-route-rule`, Maps/Instagram underlines, the selected attendance field, the error rule and the nav icon accent.)

- [ ] **Step 5: Registry swatch**

In `src/themes/registry.ts` set the Cobalt preview palette to:

```ts
      palette: ["#1D3E9E", "#F7F4EC", "#E8743B"],
```

(The catalogue row stores no palette; no migration.)

- [ ] **Step 6: Run tests to verify they pass**

Run: `node --test tests/cobalt-riviera-identity.test.mjs tests/theme-contract.test.mjs tests/terra-botanica-registration.test.mjs tests/cobalt-riviera-registration.test.mjs tests/cobalt-riviera-*.test.mjs`
Expected: PASS. Then `npm test` — all pass except the known countdown-timezone test.

- [ ] **Step 7: Commit**

```bash
git add src/themes/cobalt-riviera/tokens.ts src/themes/cobalt-riviera/ThemeStyles.tsx src/themes/registry.ts tests/theme-contract.test.mjs tests/terra-botanica-registration.test.mjs tests/cobalt-riviera-registration.test.mjs tests/cobalt-riviera-foundation.test.mjs tests/cobalt-riviera-itinerary.test.mjs tests/cobalt-riviera-identity.test.mjs
git commit -m "feat(cobalt): Mediterranean palette, text-safe jeruk and senja sky token

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_011pT7SiXwq9HVRhaYt6ogn3"
```

---

### Task 3: Corinthia couple names

**Files:**
- Modify: `src/themes/cobalt-riviera/CoverGate.tsx` (h1 class, "&")
- Modify: `src/themes/cobalt-riviera/sections/HeroSection.tsx`, `CoupleSection.tsx`, `ClosingSection.tsx`
- Modify: `src/themes/cobalt-riviera/ThemeStyles.tsx` (name sizes; drop `ch` caps and negative tracking on names)
- Test: `tests/cobalt-riviera-identity.test.mjs`

**Interfaces:**
- Consumes: `.cr-script`, `--cr-text` (Task 1); `createLoader`, `invitation`, `css`, `rules` (Task 2).

- [ ] **Step 1: Write the failing test**

Append to `tests/cobalt-riviera-identity.test.mjs`:

```js
test("couple names are Corinthia signatures and chapter titles stay Newsreader italic", () => {
  const { CobaltRiviera } = createLoader()("index");
  const { document } = new JSDOM(renderToStaticMarkup(React.createElement(CobaltRiviera, { invitation: invitation(), guest: null }))).window;
  const cover = document.querySelector("#cr-cover h1");
  assert.ok(cover.classList.contains("cr-script"));
  assert.match(cover.textContent, /Nadia.*&.*Arka/s, "the names are joined by an ampersand");
  for (const id of ["cr-hero-heading", "cr-closing-heading"]) {
    assert.ok(document.getElementById(id).classList.contains("cr-script"), `${id} is script`);
  }
  const people = [...document.querySelectorAll(".cr-person-copy h3")];
  assert.equal(people.length, 2);
  for (const name of people) assert.ok(name.classList.contains("cr-script"));
  const chapters = [...document.querySelectorAll("#cr-content section h2")].filter((title) => !title.classList.contains("cr-script"));
  assert.ok(chapters.length >= 4, `${chapters.length} chapter titles stay Newsreader`);

  const sheet = css();
  for (const selector of [".cr-hero-copy h2", ".cr-person-copy h3", ".cr-closing-copy h2", ".cr-cover-names", ".cr-hero-horizon-name"]) {
    for (const body of rules(sheet, selector)) {
      assert.doesNotMatch(body, /max-width:\s*[\d.]+ch/, `${selector} is a name: never capped by a ch measure`);
      assert.doesNotMatch(body, /letter-spacing:\s*-/, `${selector}: script needs no negative tracking`);
    }
  }
  assert.match(sheet, /\.cr-cover-amp\s*\{[^}]*font-family:\s*var\(--cr-text\)[^}]*font-style:\s*italic/, "the ampersand is a Newsreader italic accent");
  assert.match(sheet, /\.cr-person-monogram\s*\{[^}]*font:\s*700 [^;]*var\(--cr-script\)/, "a missing portrait shows a script initial");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test --test-name-pattern="Corinthia signatures" tests/cobalt-riviera-identity.test.mjs`
Expected: FAIL — cover h1 lacks `cr-script`.

- [ ] **Step 3: Apply the script class**

`CoverGate.tsx`: `<h1 className="cr-cover-names cr-script">` and replace `<span className="cr-cover-amp">+</span>` with `<span className="cr-cover-amp">&amp;</span>`.

`HeroSection.tsx`: `<h2 id="cr-hero-heading" className="cr-script">` (the inner `#cr-foundation-title` span stays) and `<p className="cr-hero-horizon-name cr-script">{displayName}</p>`.

`ClosingSection.tsx`: `<h2 id="cr-closing-heading" className="cr-script">{displayName}</h2>`.

`CoupleSection.tsx`: `<h3 className="cr-script">{person.fullName}</h3>`.

- [ ] **Step 4: Name sizes, no `ch` caps**

In `ThemeStyles.tsx` (after Task 1 the family lines read `var(--cr-label)`):

In `.cr-cover-names { … }` replace

```css
        font-family: var(--cr-label);
        font-size: clamp(3.15rem, 17vw, 10rem);
        font-variation-settings: "wght" 640;
        letter-spacing: -.065em;
        line-height: .78;
```

with

```css
        font-size: clamp(3.75rem, 19vw, 10.5rem);
        line-height: 1;
```

Replace `.cr-cover-amp { color: var(--cr-citron); font-size: .48em; letter-spacing: 0; }` with

```css
      .cr-cover-amp { color: var(--cr-citron); font-family: var(--cr-text); font-size: .42em; font-style: italic; font-weight: 400; }
```

In `.cr-hero-horizon-name { … }` replace

```css
        font-family: var(--cr-label);
        font-size: clamp(4.5rem, 19vw, 15rem);
        font-variation-settings: "wght" 690;
        letter-spacing: -.075em;
        line-height: .7;
```

with

```css
        font-size: clamp(4.5rem, 20vw, 15rem);
        line-height: .95;
```

Replace the combined rule

```css
      .cr-hero-copy h2, .cr-chapter-heading h2, .cr-person-copy h3, .cr-closing-copy h2 {
        margin: 0;
        font-family: var(--cr-label);
        font-variation-settings: "wght" 620;
        letter-spacing: -.055em;
        line-height: .86;
        overflow-wrap: anywhere;
      }
```

with

```css
      .cr-chapter-heading h2 { margin: 0; overflow-wrap: anywhere; }
      /* Couple names: Corinthia signatures in a full column, balanced wrap. */
      .cr-hero-copy h2, .cr-person-copy h3, .cr-closing-copy h2 {
        margin: 0;
        line-height: 1.05;
        overflow-wrap: anywhere;
        text-wrap: balance;
      }
```

Replace `.cr-hero-copy h2 { max-width: 11ch; font-size: clamp(3rem, 14vw, 9rem); }` with `.cr-hero-copy h2 { font-size: clamp(3.75rem, 17vw, 9.5rem); }`.

Replace `.cr-person-copy h3 { color: var(--cr-cobalt); font-size: clamp(2.6rem, 9vw, 6.5rem); }` with `.cr-person-copy h3 { color: var(--cr-cobalt); font-size: clamp(3rem, 11vw, 6.5rem); }`.

Replace `.cr-closing-copy h2 { max-width: 11ch; font-size: clamp(3rem, 12vw, 8rem); }` with `.cr-closing-copy h2 { font-size: clamp(3.5rem, 14vw, 8.5rem); }`.

In `.cr-person-monogram { … }` replace `font: 620 clamp(6rem, 32vw, 15rem)/.7 var(--cr-label);` with `font: 700 clamp(7rem, 36vw, 16rem)/.9 var(--cr-script);`.

In `@media (min-width: 768px)` replace `.cr-hero-photo .cr-hero-copy h2 { font-size: clamp(3rem, 8vw, 6.5rem); }` with `.cr-hero-photo .cr-hero-copy h2 { font-size: clamp(3.5rem, 8.5vw, 7rem); }`.

- [ ] **Step 5: Run tests to verify they pass**

Run: `node --test tests/cobalt-riviera-identity.test.mjs tests/cobalt-riviera-narrative.test.mjs tests/cobalt-riviera-shell.test.mjs tests/cobalt-riviera-foundation.test.mjs`
Expected: PASS (`#cr-foundation-title` still reads "Mira & Raka"; the cover-names rule keeps `max-width: 100%`, `flex-wrap: wrap`, `overflow-wrap: anywhere`; the horizon name keeps `overflow: hidden … text-overflow: clip`; hero 3:4 and title-first untouched).

- [ ] **Step 6: Commit**

```bash
git add src/themes/cobalt-riviera/CoverGate.tsx src/themes/cobalt-riviera/sections/HeroSection.tsx src/themes/cobalt-riviera/sections/CoupleSection.tsx src/themes/cobalt-riviera/sections/ClosingSection.tsx src/themes/cobalt-riviera/ThemeStyles.tsx tests/cobalt-riviera-identity.test.mjs
git commit -m "feat(cobalt): Corinthia couple names, uncapped by ch

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_011pT7SiXwq9HVRhaYt6ogn3"
```

---

### Task 4: Receding-wave opener ("Ombak surut")

**Files:**
- Create: `src/themes/cobalt-riviera/components/RecedingWaves.tsx`
- Modify: `src/themes/cobalt-riviera/CoverGate.tsx`
- Modify: `src/themes/cobalt-riviera/ThemeStyles.tsx`
- Modify: `tests/cobalt-riviera-shell.test.mjs` (deliberate update: two tests pin the horizon shutters, seam and their 800ms `translateY`)
- Test: `tests/cobalt-riviera-identity.test.mjs`

**Interfaces:**
- Consumes: `.cr-script`; `createLoader({ reducedMotion, actions })`, `mount`, `invitation`, `css` (Task 2).
- Produces: `RecedingWaves({ names })` → `<div class="cr-sea" aria-hidden="true">` with `p.cr-sand-names.cr-script` (the names on the porcelain sand) followed by `div.cr-wave.cr-wave-back` and `div.cr-wave.cr-wave-front`, each holding `svg.cr-wave-edge` with `path.cr-wave-body` and `path.cr-wave-foam` — 9 descendants. Pure markup, no hooks (server-safe).

Storyboard: the cover is a full-screen cobalt sea (front wave) over a kolam swell (back wave); the masthead, names, date, guest and button sit on the sea in porselen and citron. On tap the cover becomes inert, its text fades (250ms), the front wave recedes upward (900ms) and the back wave follows (1000ms, 150ms later), each dragging a porselen foam edge across the screen; the names lie revealed on the porcelain sand and settle (transform), then the cover fades (400ms after 1000ms). The content and focus are handed over at once by `useInvitationCover`, so the opener never delays the music or the keyboard.

- [ ] **Step 1: Write the failing tests**

Append to `tests/cobalt-riviera-identity.test.mjs`:

```js
test("the cover is a cobalt sea whose two foam-edged waves recede on the first tap", async () => {
  const { CobaltRiviera } = createLoader()("index");
  const { document } = new JSDOM(renderToStaticMarkup(React.createElement(CobaltRiviera, { invitation: invitation(), guest: null }))).window;
  assert.equal(document.querySelector(".cr-horizon-shutter, .cr-horizon-seam"), null, "the horizon shutters are retired");
  const sea = document.querySelector("#cr-cover .cr-sea");
  assert.ok(sea, "the cover carries the sea");
  assert.equal(sea.getAttribute("aria-hidden"), "true");
  const waves = [...sea.querySelectorAll(".cr-wave")];
  assert.deepEqual(waves.map((wave) => wave.classList.contains("cr-wave-front")), [false, true], "the kolam swell lies under the cobalt wave");
  for (const wave of waves) {
    assert.equal(wave.querySelectorAll(".cr-wave-edge .cr-wave-foam").length, 1, "each wave drags a foam edge");
  }
  assert.ok(sea.querySelectorAll("*").length <= 20, `${sea.querySelectorAll("*").length} nodes`);
  const sand = sea.querySelector(".cr-sand-names");
  assert.ok(sand.classList.contains("cr-script"));
  assert.equal(sand.textContent, "Nadia & Arka");
  assert.ok(sand.compareDocumentPosition(waves[0]) & 4, "the waves cover the sand until they recede");
  const greeting = document.querySelector("#cr-cover .cr-cover-masthead [lang='it']");
  assert.equal(greeting?.textContent, "Saluti dalla Costa");
  const open = document.querySelector("#cr-cover button");
  assert.equal(open.className, "cr-cover-open");
  assert.match(open.textContent, /Buka undangan/);
  assert.equal(open.getAttribute("aria-controls"), "cr-content");
  assert.ok(open.querySelector(".cr-sun-mark"));

  const calls = [];
  const load = createLoader({ actions: { trackCoverOpened: async (...args) => { calls.push(args); } } });
  const withMusic = invitation({
    features: { ...invitation().features, music: true },
    media: { coverImageUrl: null, musicUrl: "/music.mp3" },
  });
  const view = await mount(React.createElement(load("index").CobaltRiviera, { invitation: withMusic, guest: null }));
  try {
    let plays = 0;
    view.document.querySelector("audio").play = async () => { plays += 1; };
    await act(async () => view.document.querySelector(".cr-cover-open").click());
    assert.equal(plays, 1, "music starts in the same tap");
    assert.deepEqual(calls, [["cobalt", null]]);
    assert.equal(view.document.getElementById("cr-content").hidden, false);
    assert.equal(view.document.getElementById("cr-cover").hasAttribute("inert"), true, "the cover stops taking taps at once");
  } finally { await view.cleanup(); }

  const sheet = css();
  assert.match(sheet, /\.cr-cover\s*\{[^}]*background:\s*var\(--cr-porcelain\)/, "under the waves lies porcelain sand");
  assert.match(sheet, /\.cr-wave\s*\{[^}]*transition:\s*transform 900ms/);
  assert.match(sheet, /\[data-opened="true"\] \.cr-wave-front\s*\{[^}]*transform:\s*translateY\(-112%\)/);
  assert.match(sheet, /\[data-opened="true"\] \.cr-wave-back\s*\{[^}]*transform:\s*translateY\(-112%\)[^}]*transition-delay:\s*150ms/);
  assert.match(sheet, /\[data-opened="true"\] \.cr-cover\s*\{[^}]*transition:[^}]*opacity 400ms ease 1000ms/, "the cover lingers for the tide, then fades");
  assert.match(sheet, /data-reduced-motion="true"\] :is\([^)]*\.cr-wave[^)]*\)\s*\{\s*transition:\s*none/);
  assert.match(sheet, /@media \(max-height: 700px\)\s*\{\s*\.cr-cover-names\s*\{\s*font-size:/, "short phones keep the open button on screen");
  for (const selector of [".cr-wave", ".cr-sand-names", ".cr-cover-frame"]) {
    for (const body of rules(sheet, selector)) {
      const transition = body.match(/transition:\s*([^;]+)/)?.[1];
      if (transition) for (const part of transition.split(/,(?![^(]*\))/)) assert.match(part.trim(), /^(opacity|transform|none)\b/, `${selector}: ${part}`);
    }
  }
});

test("the wave cover hydrates without mismatch when the browser prefers reduced motion", async () => {
  const { CobaltRiviera } = createLoader({ reducedMotion: true })("index");
  const element = React.createElement(CobaltRiviera, {
    invitation: invitation({ features: { ...invitation().features, countdown: false } }),
    guest: null,
  });
  const view = await mount(React.createElement("div"));
  const errors = [];
  const originalError = console.error;
  console.error = (...args) => errors.push(args.map(String).join(" "));
  let root;
  try {
    const container = view.document.createElement("div");
    view.document.body.append(container);
    container.innerHTML = renderToString(element);
    await act(async () => { root = hydrateRoot(container, element); });
    assert.deepEqual(errors, []);
    assert.ok(container.querySelector(".cr-sea .cr-wave-front"));
  } finally {
    console.error = originalError;
    if (root) await act(async () => root.unmount());
    await view.cleanup();
  }
});
```

In `tests/cobalt-riviera-shell.test.mjs`:

Rename the test `"photo-free horizon cover renders normalized names, date, guest, shutters, seam, and labelled sun action"` to `"photo-free sea cover renders normalized names, date, guest, receding waves, and labelled sun action"` and replace

```js
  assert.equal(document.querySelectorAll(".cr-horizon-shutter").length, 2);
  assert.ok(document.querySelector(".cr-horizon-seam"));
```

with

```js
  assert.equal(document.querySelectorAll("#cr-cover .cr-wave").length, 2);
  assert.ok(document.querySelector("#cr-cover .cr-wave-front .cr-wave-foam"));
```

Rename the test `"shell CSS defines the approved shutter timing, instant motion fallback, mobile strip, desktop edge index, and safe music offsets"` to `"shell CSS defines the receding-wave timing, instant motion fallback, mobile strip, desktop edge index, and safe music offsets"` and replace

```js
  assert.match(css, /\.cr-horizon-seam/);
  assert.match(css, /\.cr-horizon-shutter[^}]*transition[^}]*800ms/s);
  assert.match(css, /data-opened="true"[^}]*\.cr-shutter-upper[^{]*\{[^}]*translateY\(-10[01]%\)/s);
  assert.match(css, /data-opened="true"[^}]*\.cr-shutter-lower[^{]*\{[^}]*translateY\(10[01]%\)/s);
```

with

```js
  assert.match(css, /\.cr-wave\s*\{[^}]*transition:\s*transform 900ms/);
  assert.match(css, /data-opened="true"\] \.cr-wave-front\s*\{[^}]*translateY\(-112%\)/);
  assert.match(css, /data-opened="true"\] \.cr-wave-back\s*\{[^}]*translateY\(-112%\)/);
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test --test-name-pattern="wave cover|cobalt sea|sea cover|receding-wave" tests/cobalt-riviera-identity.test.mjs tests/cobalt-riviera-shell.test.mjs`
Expected: FAIL — shutters still present, no `.cr-sea`.

- [ ] **Step 3: Write the component**

Create `src/themes/cobalt-riviera/components/RecedingWaves.tsx`:

```tsx
// One crest and one trough per 60 units; the body's lower edge and the foam
// trace the same curve, so the foam sits exactly on the wave's edge.
const FOAM = "M0 6C15 0 15 0 30 6S45 12 60 6 75 0 90 6 105 12 120 6";
const BODY = "M0 0H120V6C105 12 105 12 90 6S75 0 60 6 45 12 30 6 15 0 0 6Z";

/**
 * Ombak surut: the cover's sea. A kolam swell lies under a cobalt wave; when
 * the cover opens (`.cr-gate[data-opened="true"]`) CSS draws both up and away,
 * foam edge first, and the couple's names are left on the porcelain sand.
 * Decorative; the cover's own heading carries the names for readers.
 */
export function RecedingWaves({ names }: { names: string }) {
  return (
    <div className="cr-sea" aria-hidden="true">
      <p className="cr-sand-names cr-script">{names}</p>
      {(["back", "front"] as const).map((layer) => (
        <div key={layer} className={`cr-wave cr-wave-${layer}`}>
          <svg className="cr-wave-edge" viewBox="0 0 120 12" preserveAspectRatio="none" focusable="false">
            <path className="cr-wave-body" d={BODY} />
            <path className="cr-wave-foam" d={FOAM} />
          </svg>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Replace the shutters with the sea**

In `CoverGate.tsx`:
- Add `import { RecedingWaves } from "./components/RecedingWaves";`.
- Replace the whole `<div className="cr-horizon" aria-hidden="true"> … </div>` block (two shutters and the seam) with `<RecedingWaves names={displayName} />`.
- Replace the masthead's two spans with:

```tsx
            <span lang="it">Saluti dalla Costa</span>
            <span>{label}</span>
```

- [ ] **Step 5: Tide and cover timing CSS**

In `ThemeStyles.tsx`:

In `.cr-cover { … }` replace `background: var(--cr-cobalt);` with `background: var(--cr-porcelain);` and delete `transition: visibility 0s linear 800ms;`.

Delete the five rules `.cr-horizon`, `.cr-horizon-shutter`, `.cr-shutter-upper`, `.cr-shutter-lower`, `.cr-horizon-seam`.

In `.cr-cover-frame { … }` replace `transition: opacity 180ms ease, transform 800ms cubic-bezier(.76, 0, .24, 1);` with `transition: opacity 250ms ease;`.

Replace

```css
      .cr-gate[data-opened="true"] .cr-cover { visibility: hidden; pointer-events: none; }
      .cr-gate[data-opened="true"] .cr-shutter-upper { transform: translateY(-101%); }
      .cr-gate[data-opened="true"] .cr-shutter-lower { transform: translateY(101%); }
      .cr-gate[data-opened="true"] .cr-horizon-seam { opacity: 0; }
      .cr-gate[data-opened="true"] .cr-cover-frame { opacity: 0; transform: translateY(-1rem); }
```

with

```css
      /* Ombak surut: a cobalt wave over a kolam swell. On opening the text
         fades, both waves recede upward dragging their foam edge, the names
         settle on the porcelain sand, then the cover fades (1000ms + 400ms).
         It is inert and stops taking taps the moment it opens. */
      .cr-sea { position: fixed; inset: 0; overflow: hidden; pointer-events: none; }
      .cr-sand-names { position: absolute; right: 0; bottom: 38%; left: 0; margin: 0; padding-inline: clamp(1.1rem, 6vw, 6rem); color: var(--cr-cobalt); font-size: clamp(3.5rem, 16vw, 9rem); line-height: 1; text-align: center; overflow-wrap: anywhere; transform: translateY(12px); }
      .cr-wave { position: absolute; top: 0; right: 0; left: 0; height: 100%; transition: transform 900ms cubic-bezier(.65, 0, .35, 1); will-change: transform; }
      .cr-wave-back { background: var(--cr-pool); }
      .cr-wave-front { background: var(--cr-cobalt); }
      .cr-wave-edge { position: absolute; top: calc(100% - 1px); left: 0; width: 100%; height: clamp(28px, 7vh, 64px); overflow: visible; }
      .cr-wave-back .cr-wave-body { fill: var(--cr-pool); }
      .cr-wave-front .cr-wave-body { fill: var(--cr-cobalt); }
      .cr-wave-foam { fill: none; stroke: var(--cr-porcelain); stroke-width: 2; vector-effect: non-scaling-stroke; }
      .cr-gate[data-opened="true"] .cr-cover {
        opacity: 0; visibility: hidden; pointer-events: none;
        transition: opacity 400ms ease 1000ms, visibility 0s 1400ms;
      }
      .cr-gate[data-opened="true"] .cr-cover-frame { opacity: 0; }
      .cr-gate[data-opened="true"] .cr-wave-front { transform: translateY(-112%); }
      .cr-gate[data-opened="true"] .cr-wave-back { transform: translateY(-112%); transition-delay: 150ms; transition-duration: 1000ms; }
      .cr-gate[data-opened="true"] .cr-sand-names { transform: translateY(0); transition: transform 800ms cubic-bezier(.22, .61, .36, 1) 500ms; }
      /* Short phones: smaller names keep "Buka undangan" above the fold. */
      @media (max-height: 700px) {
        .cr-cover-names { font-size: clamp(3rem, 14vw, 5rem); }
        .cr-cover-frame { gap: .75rem; }
        .cr-cover-open { grid-template-columns: 2.75rem minmax(0, 1fr); }
        .cr-cover-open .cr-sun-mark { width: 2.75rem; }
      }
```

(−112% clears the wave plus its foam edge, which is at most 7vh tall. The text is porselen/citron on cobalt until it has faded, so no text ever sits on the sand except the cobalt sand names.)

Replace

```css
      .cr-gate[data-reduced-motion="true"] .cr-cover,
      .cr-gate[data-reduced-motion="true"] .cr-horizon-shutter,
      .cr-gate[data-reduced-motion="true"] .cr-horizon-seam,
      .cr-gate[data-reduced-motion="true"] .cr-cover-frame,
      .cr-gate[data-reduced-motion="true"] .cr-cover-open .cr-sun-mark {
        transition: none;
      }
```

with

```css
      .cr-gate[data-reduced-motion="true"] :is(.cr-cover, .cr-cover-frame, .cr-wave, .cr-sand-names, .cr-cover-open .cr-sun-mark) { transition: none; }
```

(The existing `@media (prefers-reduced-motion: reduce)` block already removes every transition, so a reduced-motion cover hides at once regardless of the attribute.)

- [ ] **Step 6: Run tests to verify they pass**

Run: `node --test tests/cobalt-riviera-identity.test.mjs tests/cobalt-riviera-shell.test.mjs tests/cobalt-riviera-quality.test.mjs tests/cobalt-riviera-foundation.test.mjs tests/invitation-time-zone.test.mjs`
Expected: PASS (shell still opens once, tracks once, focuses content, survives rejected autoplay at 320 and 1440, keeps the long-name and compact-cover assertions; quality still finds `data-reduced-motion="true"`).

- [ ] **Step 7: Commit**

```bash
git add src/themes/cobalt-riviera/components/RecedingWaves.tsx src/themes/cobalt-riviera/CoverGate.tsx src/themes/cobalt-riviera/ThemeStyles.tsx tests/cobalt-riviera-shell.test.mjs tests/cobalt-riviera-identity.test.mjs
git commit -m "feat(cobalt): receding-wave opener replaces the horizon shutters

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_011pT7SiXwq9HVRhaYt6ogn3"
```

---

### Task 5: Wave dividers ("Ombak pembatas")

**Files:**
- Create: `src/themes/cobalt-riviera/components/WaveDivider.tsx`
- Modify: `src/themes/cobalt-riviera/components/Section.tsx`
- Modify: `src/themes/cobalt-riviera/sections/HeroSection.tsx` (no divider above the first chapter)
- Modify: `src/themes/cobalt-riviera/ThemeStyles.tsx`
- Test: `tests/cobalt-riviera-identity.test.mjs`

**Interfaces:**
- Consumes: `createLoader`, `mount`, `FakeIntersectionObserver`, `invitation`, `css`, `owners` (Task 2).
- Produces: `WaveDivider()` → `<div class="cr-divider" aria-hidden="true" data-sway="on" | "off">` (attribute absent until the observer reports) holding one `svg` with `path.cr-divider-line.cr-divider-line-a` and `.cr-divider-line-b`. `Section` gains `divider?: boolean` (default `true`).

Why not `useInViewOnce`: the lines must pause again when they leave the screen, and they hide nothing, so this is a continuous visibility toggle rather than a once-only reveal. The observer writes `data-sway` straight onto the element (no React state, no re-render); the server markup has no attribute and the lines rest still wherever the observer cannot run. It stays in the Cobalt folder because no other theme needs it; promote it to `themes/shared/` if a second theme does.

- [ ] **Step 1: Write the failing test**

Append to `tests/cobalt-riviera-identity.test.mjs`:

```js
test("two wave lines divide the chapters and sway only while on screen", async () => {
  const load = createLoader();
  const { CobaltRiviera } = load("index");
  const full = invitation({
    content: { openingQuote: "Laut mengajari kami sabar.", openingMessage: null, closingMessage: null },
  });
  const { document } = new JSDOM(renderToStaticMarkup(React.createElement(CobaltRiviera, { invitation: full, guest: null }))).window;
  const sections = [...document.querySelectorAll("#cr-content main > section")];
  assert.ok(sections.length >= 8);
  for (const section of sections) {
    const dividers = section.querySelectorAll(":scope > .cr-divider");
    if (section.id === "cr-beranda") {
      assert.equal(dividers.length, 0, "the hero opens the page without a divider");
      continue;
    }
    assert.equal(dividers.length, 1, `${section.id} has one divider`);
    assert.equal(section.firstElementChild, dividers[0], `${section.id}: the divider sits at the chapter's top edge`);
    assert.equal(dividers[0].getAttribute("aria-hidden"), "true");
    assert.equal(dividers[0].querySelectorAll("path.cr-divider-line").length, 2);
    assert.equal(dividers[0].hasAttribute("data-sway"), false, "server markup is still");
  }

  const { WaveDivider } = load("components/WaveDivider");
  FakeIntersectionObserver.instances = [];
  const view = await mount(React.createElement(WaveDivider), { intersectionObserver: FakeIntersectionObserver });
  const observer = FakeIntersectionObserver.instances[0];
  try {
    const divider = view.document.querySelector(".cr-divider");
    assert.equal(divider.hasAttribute("data-sway"), false, "nothing moves before the observer reports");
    await act(async () => observer.trigger(true));
    assert.equal(divider.dataset.sway, "on");
    await act(async () => observer.trigger(false));
    assert.equal(divider.dataset.sway, "off", "it pauses again off screen");
    await act(async () => observer.trigger(true));
    assert.equal(divider.dataset.sway, "on", "and resumes when it returns");
  } finally { await view.cleanup(); }
  assert.equal(observer.elements.length, 0, "the observer is released on unmount");

  const sheet = css();
  assert.match(sheet, /\.cr-divider-line\s*\{[^}]*animation:\s*cr-sway[^;]*infinite[^}]*animation-play-state:\s*paused/);
  assert.match(sheet, /\.cr-divider\[data-sway="on"\] \.cr-divider-line\s*\{\s*animation-play-state:\s*running/);
  const sway = sheet.match(/@keyframes cr-sway\s*\{((?:[^{}]*\{[^}]*\})*)\s*\}/)?.[1] ?? "";
  assert.ok(sway, "cr-sway keyframes exist");
  for (const [, body] of sway.matchAll(/\{([^}]*)\}/g)) {
    for (const declaration of body.split(";").map((part) => part.trim()).filter(Boolean)) {
      assert.match(declaration, /^transform:/, `cr-sway animates only transform: ${declaration}`);
    }
  }
  assert.match(sheet, /\.cr-section-inner\s*\{[^}]*position:\s*relative[^}]*z-index:\s*1/, "chapter content stays above the divider");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test --test-name-pattern="wave lines divide" tests/cobalt-riviera-identity.test.mjs`
Expected: FAIL — no `.cr-divider`.

- [ ] **Step 3: Write the component**

Create `src/themes/cobalt-riviera/components/WaveDivider.tsx`:

```tsx
"use client";

import { useEffect, useRef } from "react";

/** A gentle sine across `width` units at height `y`: one crest and one trough per 50 units. */
function wave(y: number, width = 400): string {
  let d = `M0 ${y}C12.5 ${y - 5} 12.5 ${y - 5} 25 ${y}`;
  for (let x = 25; x < width; x += 25) {
    const control = (x / 25) % 2 === 1 ? y + 5 : y - 5;
    d += `S${x + 12.5} ${control} ${x + 25} ${y}`;
  }
  return d;
}

// Computed once at module load, so server and client markup are identical.
const LINE_A = wave(8);
const LINE_B = wave(12);

/**
 * Ombak pembatas: two wave lines at the top edge of a chapter. They sway only
 * while the divider is on screen; the observer writes `data-sway` straight onto
 * the element, so scrolling never re-renders React, and the server markup has
 * no attribute, so the lines rest still wherever the observer cannot run.
 */
export function WaveDivider() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver((entries) => {
      element.dataset.sway = entries.some((entry) => entry.isIntersecting) ? "on" : "off";
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="cr-divider" aria-hidden="true">
      <svg viewBox="0 0 400 20" preserveAspectRatio="none" focusable="false">
        <path className="cr-divider-line cr-divider-line-a" d={LINE_A} />
        <path className="cr-divider-line cr-divider-line-b" d={LINE_B} />
      </svg>
    </div>
  );
}
```

- [ ] **Step 4: Put a divider at the top of every chapter but the hero**

Replace `src/themes/cobalt-riviera/components/Section.tsx` with:

```tsx
import type { ReactNode } from "react";

import { WaveDivider } from "./WaveDivider";

type RivieraTone = "cobalt" | "porcelain" | "sea-ink" | "pool";

interface SectionProps {
  id: `cr-${string}`;
  labelledBy?: string;
  tone?: RivieraTone;
  /** Two swaying wave lines at the chapter's top edge; off for the hero. */
  divider?: boolean;
  className?: string;
  children: ReactNode;
}

export function Section({
  id,
  labelledBy,
  tone = "porcelain",
  divider = true,
  className = "",
  children,
}: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={`cr-section cr-surface-${tone} ${className}`}
    >
      {divider ? <WaveDivider /> : null}
      <div className="cr-section-inner">{children}</div>
    </section>
  );
}
```

In `HeroSection.tsx` add `divider={false}` to the `<Section … >` props.

(`tests/gallery-gift-parity.test.mjs` stubs `components/Section` with a passthrough, so its strict import list is unaffected.)

- [ ] **Step 5: Divider CSS**

In `ThemeStyles.tsx`:

In `.cr-section-inner { … }` add `position: relative;` and `z-index: 1;` as the first declarations.

Add before the `/* Postcard voices … */` block:

```css
      /* Ombak pembatas: two wave lines at each chapter's top edge, below the
         content. They sway only while on screen; only transform animates. */
      .cr-divider { position: absolute; z-index: 0; top: clamp(1.25rem, 3.5vw, 2.25rem); right: 0; left: 0; height: 20px; overflow: hidden; pointer-events: none; }
      .cr-divider svg { display: block; width: 200%; height: 100%; overflow: visible; }
      .cr-divider-line { fill: none; stroke-width: 1.5; vector-effect: non-scaling-stroke; transform-box: view-box; animation: cr-sway 7s ease-in-out infinite alternate; animation-play-state: paused; }
      .cr-divider-line-a { stroke: currentColor; opacity: .45; }
      .cr-divider-line-b { stroke: var(--cr-tangerine); animation-duration: 9s; animation-delay: -3s; }
      .cr-divider[data-sway="on"] .cr-divider-line { animation-play-state: running; }
      @keyframes cr-sway { from { transform: translateX(0); } to { transform: translateX(-25%); } }
```

(−25% of the 400-unit view box is two whole periods, so the lines never show an edge. The global reduced-motion block already sets `animation: none !important`.)

- [ ] **Step 6: Run tests to verify they pass**

Run: `node --test tests/cobalt-riviera-identity.test.mjs tests/cobalt-riviera-*.test.mjs tests/gallery-gift-parity.test.mjs tests/theme-countdown-calendar-parity.test.mjs`
Expected: PASS (section ids, `aria-labelledby`, route targets and the "no dead chapter" quality test unchanged).

- [ ] **Step 7: Commit**

```bash
git add src/themes/cobalt-riviera/components/WaveDivider.tsx src/themes/cobalt-riviera/components/Section.tsx src/themes/cobalt-riviera/sections/HeroSection.tsx src/themes/cobalt-riviera/ThemeStyles.tsx tests/cobalt-riviera-identity.test.mjs
git commit -m "feat(cobalt): swaying wave dividers between chapters

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_011pT7SiXwq9HVRhaYt6ogn3"
```

---

### Task 6: Morning-to-sunset sky ("Pagi ke senja")

**Files:**
- Create: `src/themes/cobalt-riviera/components/RivieraSky.tsx`
- Modify: `src/themes/cobalt-riviera/CobaltRiviera.tsx`
- Modify: `src/themes/cobalt-riviera/ThemeStyles.tsx`
- Test: `tests/cobalt-riviera-identity.test.mjs`

**Interfaces:**
- Consumes: `useScrollProgress(ref, property)` (shared); `--cr-porcelain`, `--cr-sunset`, `--cr-citron`, `--cr-tangerine` (Task 2); `createLoader`, `mount`, `invitation`, `css`, `owners` (Task 2). The AA ramp for porcelain-chapter text is already proven by Task 2's "morning-to-sunset ramp" test; this task binds the CSS to that ramp (porcelain base, sunset layer at `opacity: var(--cr-day)`).
- Produces: `RivieraSky()` → `<div class="cr-sky" aria-hidden="true" style="--cr-day: …">` with `span.cr-sky-dusk` and `svg.cr-sun` (`circle.cr-sun-day`, `circle.cr-sun-dusk`) — 4 descendants.

Design: a fixed sky sits behind the content (`z-index: 0`); `main` is lifted to `z-index: 1`; porcelain chapters become transparent so the sky shows through, while cobalt, kolam and tinta laut chapters stay opaque "sea". `--cr-day` (0 at the top, 1 at the end) drives exactly two things: the senja layer's `opacity` and the sun's `transform`. Both are composited (`will-change`), so a scroll frame repaints nothing. The sun lives in the left page gutter (owner decision 2), passes behind the opaque chapters and never sits under text.

- [ ] **Step 1: Write the failing test**

Append to `tests/cobalt-riviera-identity.test.mjs`:

```js
test("the sky warms from morning to sunset with scroll and the sun sinks down the margin", async () => {
  const load = createLoader();
  const { RivieraSky } = load("components/RivieraSky");
  const view = await mount(React.createElement(RivieraSky));
  try {
    const sky = view.document.querySelector(".cr-sky");
    assert.equal(sky.getAttribute("aria-hidden"), "true");
    assert.ok(sky.querySelector(".cr-sky-dusk"));
    assert.ok(sky.querySelector("svg.cr-sun .cr-sun-day") && sky.querySelector("svg.cr-sun .cr-sun-dusk"));
    assert.ok(sky.querySelectorAll("*").length <= 20);
    assert.equal(sky.style.getPropertyValue("--cr-day"), "1.0000", "jsdom cannot scroll, so the day has ended");
  } finally { await view.cleanup(); }

  const { document } = new JSDOM(renderToStaticMarkup(React.createElement(load("index").CobaltRiviera, { invitation: invitation(), guest: null }))).window;
  assert.ok(document.querySelector("#cr-content > .cr-sky"), "the sky belongs to the opened invitation");
  assert.equal(document.querySelector("#cr-cover .cr-sky"), null);
  assert.equal(document.querySelector(".cr-sky").getAttribute("style"), null, "server markup carries no scroll state");

  const sheet = css();
  assert.match(sheet, /\.cr-sky\s*\{[^}]*--cr-day:\s*0[^}]*position:\s*fixed[^}]*background:\s*var\(--cr-porcelain\)/, "morning is the porcelain");
  assert.match(sheet, /\.cr-sky-dusk\s*\{[^}]*background:\s*var\(--cr-sunset\)[^}]*opacity:\s*var\(--cr-day\)[^}]*will-change:\s*opacity/, "sunset is the senja layer at --cr-day");
  assert.match(sheet, /\.cr-sun\s*\{[^}]*transform:\s*translateY\(calc\(var\(--cr-day\) \* [^)]+\)\)[^}]*will-change:\s*transform/);
  for (const [, selector, body] of sheet.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    for (const declaration of body.split(";").map((part) => part.trim())) {
      if (declaration.includes("var(--cr-day)")) {
        assert.match(declaration, /^(opacity|transform):/, `${selector.trim()}: only opacity and transform follow the scroll (${declaration})`);
      }
    }
  }
  assert.match(sheet, /\.cr-content > main\s*\{[^}]*position:\s*relative[^}]*z-index:\s*1/);
  assert.match(sheet, /\.cr-content \.cr-surface-porcelain\s*\{\s*background:\s*transparent/, "porcelain chapters show the sky");
  assert.match(sheet, /prefers-reduced-motion: reduce\)[\s\S]*\.cr-sky\s*\{\s*--cr-day:\s*1 !important/, "reduced motion pins one palette");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test --test-name-pattern="morning to sunset" tests/cobalt-riviera-identity.test.mjs`
Expected: FAIL — "Missing module: …/components/RivieraSky".

- [ ] **Step 3: Write the component**

Create `src/themes/cobalt-riviera/components/RivieraSky.tsx`:

```tsx
"use client";

import { useRef } from "react";

import { useScrollProgress } from "@/themes/shared/use-scroll-progress";

/**
 * Pagi ke senja: the sky behind the porcelain chapters warms from morning to
 * sunset with scroll progress, and a small sun sinks down the page margin.
 * `useScrollProgress` writes `--cr-day` (0–1) straight onto this element, so
 * scrolling never re-renders React; CSS turns it into one opacity and one
 * transform. Decorative.
 */
export function RivieraSky() {
  const ref = useRef<HTMLDivElement>(null);
  useScrollProgress(ref, "--cr-day");

  return (
    <div ref={ref} className="cr-sky" aria-hidden="true">
      <span className="cr-sky-dusk" />
      <svg className="cr-sun" viewBox="0 0 24 24" focusable="false">
        <circle className="cr-sun-day" cx="12" cy="12" r="11" />
        <circle className="cr-sun-dusk" cx="12" cy="12" r="11" />
      </svg>
    </div>
  );
}
```

- [ ] **Step 4: Mount it inside the content**

In `CobaltRiviera.tsx` add `import { RivieraSky } from "./components/RivieraSky";` and, inside `<CoverGate …>`, put `<RivieraSky />` directly before `<main>`.

- [ ] **Step 5: Sky CSS**

In `ThemeStyles.tsx` add after the divider block (Task 5):

```css
      /* Pagi ke senja: a fixed sky behind the porcelain chapters. --cr-day
         (0–1, from useScrollProgress) drives only the senja layer's opacity
         and the sun's transform, so a scroll frame composites and repaints
         nothing. Opaque cobalt, kolam and tinta laut chapters are the sea. */
      .cr-sky { --cr-day: 0; position: fixed; z-index: 0; inset: 0; background: var(--cr-porcelain); pointer-events: none; }
      .cr-sky-dusk { position: absolute; inset: 0; background: var(--cr-sunset); opacity: var(--cr-day); will-change: opacity; }
      .cr-sun { position: absolute; top: 16svh; left: max(4px, env(safe-area-inset-left)); width: clamp(12px, 2vw, 24px); height: auto; transform: translateY(calc(var(--cr-day) * 62svh)); will-change: transform; }
      .cr-sun-day { fill: var(--cr-citron); }
      .cr-sun-dusk { fill: var(--cr-tangerine); opacity: var(--cr-day); }
      .cr-content > main { position: relative; z-index: 1; }
      .cr-content .cr-surface-porcelain { background: transparent; }
```

Inside the existing `@media (prefers-reduced-motion: reduce) { … }` block add:

```css
        .cr-sky { --cr-day: 1 !important; }
```

(`!important` in the stylesheet outranks the hook's inline value. The sun ends at 78svh, above the bottom bar on a 640px phone; its 12px disc sits inside the 20px gutter at 320px.)

- [ ] **Step 6: Run tests to verify they pass**

Run: `node --test tests/cobalt-riviera-identity.test.mjs tests/cobalt-riviera-*.test.mjs tests/terra-botanica-identity.test.mjs`
Expected: PASS (Terra's `useScrollProgress` behaviour is untouched; the itinerary focus test still finds porcelain chapters by class).

- [ ] **Step 7: Commit**

```bash
git add src/themes/cobalt-riviera/components/RivieraSky.tsx src/themes/cobalt-riviera/CobaltRiviera.tsx src/themes/cobalt-riviera/ThemeStyles.tsx tests/cobalt-riviera-identity.test.mjs
git commit -m "feat(cobalt): morning-to-sunset sky and a sinking sun

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_011pT7SiXwq9HVRhaYt6ogn3"
```

---

### Task 7: Postmark on the RSVP confirmation ("Cap pos 'Diterima'")

**Files:**
- Create: `src/themes/cobalt-riviera/components/Postmark.tsx`
- Modify: `src/themes/cobalt-riviera/sections/RsvpSection.tsx`
- Modify: `src/themes/cobalt-riviera/ThemeStyles.tsx`
- Test: `tests/cobalt-riviera-identity.test.mjs`

**Interfaces:**
- Consumes: `useRsvpForm()` state (unchanged); `--cr-tangerine`, `--cr-tangerine-ink`, `--cr-label`; `createLoader({ actions })`, `mount`, `css`, `rules`, `contrast`, `tokens`, `pick`, `submit` (Task 2).
- Produces: `Postmark({ attendance: "attending" | "not_attending" })` → `<svg class="cr-postmark" data-cr-postmark aria-hidden="true">` with two `.cr-postmark-ring` circles, one `.cr-postmark-cancel` path and two `<text>` (`DITERIMA`, then `HADIR` or `TIDAK HADIR`) — 5 descendants. No hooks; server-safe.

The postmark stamps every successful RSVP (owner decision 1) and names the attendance captured from `FormData` in `handleSubmit` — never the live `attendance` state, because the choice buttons stay enabled while the action is pending. It sits after the status block in its own grid row, so the "Terima kasih" text is never covered.

- [ ] **Step 1: Write the failing tests**

Append to `tests/cobalt-riviera-identity.test.mjs`:

```js
async function rsvp({ guestName = "Bude Sri", choose, changeTo = null, typedName = null }) {
  let resolve;
  const { RsvpSection } = createLoader({ actions: { submitRsvp: () => new Promise((done) => { resolve = done; }) } })("sections/RsvpSection");
  const view = await mount(React.createElement(RsvpSection, { invitationId: "cobalt", slug: "cobalt", guestToken: "t", guestName }));
  const form = view.document.querySelector("#cr-rsvp form");
  if (typedName) form.elements.namedItem("guestName").value = typedName;
  await act(async () => pick(form, choose).click());
  await submit(view, form);
  if (changeTo) await act(async () => pick(form, changeTo).click());
  await act(async () => { resolve({ status: "success" }); });
  return view;
}

test("a confirmed RSVP is stamped with an orange 'Diterima' postmark beside the thank-you", async () => {
  const attending = await rsvp({ choose: "Hadir" });
  try {
    const sheetEl = attending.document.querySelector("#cr-rsvp .cr-rsvp-sheet");
    const status = sheetEl.querySelector('[role="status"]');
    assert.match(status.textContent, /Terima kasih\..*Konfirmasi kehadiran Anda telah kami terima/s);
    const mark = sheetEl.querySelector("[data-cr-postmark]");
    assert.ok(mark, "the postmark is stamped");
    assert.equal(mark.getAttribute("aria-hidden"), "true", "the status text carries the message");
    assert.equal(status.contains(mark), false, "the postmark is never inside the confirmation");
    assert.ok(status.compareDocumentPosition(mark) & 4, "it follows the confirmation in reading order");
    assert.deepEqual([...mark.querySelectorAll("text")].map((text) => text.textContent), ["DITERIMA", "HADIR"]);
    assert.ok(mark.querySelectorAll("*").length <= 20);
  } finally { await attending.cleanup(); }

  const declined = await rsvp({ choose: "Tidak Hadir" });
  try {
    assert.match(declined.document.querySelector('#cr-rsvp [role="status"]').textContent, /Terima kasih/);
    assert.deepEqual([...declined.document.querySelectorAll("[data-cr-postmark] text")].map((text) => text.textContent), ["DITERIMA", "TIDAK HADIR"]);
  } finally { await declined.cleanup(); }

  const sheet = css();
  for (const body of rules(sheet, ".cr-postmark")) {
    assert.doesNotMatch(body, /position:\s*(absolute|fixed)/, "the postmark takes its own row and never overlaps the text");
  }
  assert.match(rules(sheet, ".cr-postmark").join(";"), /animation:\s*cr-stamp[^;]*both/, "at rest (and under reduced motion) the stamp shows");
  assert.match(sheet, /@keyframes cr-stamp\s*\{\s*0%\s*\{\s*opacity:\s*0;\s*transform:/);
  assert.match(sheet, /\.cr-postmark text\s*\{[^}]*fill:\s*var\(--cr-tangerine-ink\)/);
  assert.match(sheet, /\.cr-postmark-ring\s*\{[^}]*stroke:\s*var\(--cr-tangerine\)/, "the ring is jeruk orange");
  const c = tokens();
  assert.ok(contrast(c.tangerineInk, c.porcelain) >= 4.5, "the postmark lettering is AA on the porcelain card");
});

test("the postmark names the attendance that was submitted, not a choice changed while sending", async () => {
  const accepted = await rsvp({ choose: "Hadir", changeTo: "Tidak Hadir" });
  try {
    assert.equal(accepted.document.querySelectorAll("[data-cr-postmark] text")[1].textContent, "HADIR", "a stored acceptance reads HADIR");
  } finally { await accepted.cleanup(); }

  const declined = await rsvp({ choose: "Tidak Hadir", changeTo: "Hadir" });
  try {
    assert.equal(declined.document.querySelectorAll("[data-cr-postmark] text")[1].textContent, "TIDAK HADIR", "a stored decline never reads HADIR");
  } finally { await declined.cleanup(); }
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test --test-name-pattern="postmark" tests/cobalt-riviera-identity.test.mjs`
Expected: FAIL — no `[data-cr-postmark]`.

- [ ] **Step 3: Write the component**

Create `src/themes/cobalt-riviera/components/Postmark.tsx`:

```tsx
const ATTENDANCE = { attending: "HADIR", not_attending: "TIDAK HADIR" } as const;

/**
 * An orange round postmark stamped beside the RSVP confirmation: a double
 * ring, wavy cancellation lines and "DITERIMA" over the attendance that was
 * sent. Decorative — the status text beside it carries the message.
 */
export function Postmark({ attendance }: { attendance: keyof typeof ATTENDANCE }) {
  return (
    <svg className="cr-postmark" data-cr-postmark="" viewBox="0 0 168 120" aria-hidden="true" focusable="false">
      <circle className="cr-postmark-ring" cx="60" cy="60" r="54" />
      <circle className="cr-postmark-ring cr-postmark-inner" cx="60" cy="60" r="44" />
      <path className="cr-postmark-cancel" d="M116 42c7-5 14 5 21 0s14 5 21 0M116 60c7-5 14 5 21 0s14 5 21 0M116 78c7-5 14 5 21 0s14 5 21 0" />
      <text className="cr-postmark-word" x="60" y="58" textAnchor="middle">DITERIMA</text>
      <text className="cr-postmark-note" x="60" y="76" textAnchor="middle">{ATTENDANCE[attendance]}</text>
    </svg>
  );
}
```

- [ ] **Step 4: Stamp it after a successful RSVP**

In `RsvpSection.tsx`:
- Add `import { useState, type FormEvent } from "react";` and `import { Postmark } from "../components/Postmark";`.
- After the `useRsvpForm()` line add:

```tsx
  // The form unmounts on success and the choices stay live while the action
  // is pending; the postmark names the attendance that was actually sent.
  const [sentAttendance, setSentAttendance] = useState<"attending" | "not_attending" | null>(null);
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const sent = new FormData(event.currentTarget).get("attendance");
    setSentAttendance(sent === "attending" || sent === "not_attending" ? sent : null);
    onSubmit(event);
  }
```

- Change the form's `onSubmit={onSubmit}` to `onSubmit={handleSubmit}`.
- Replace the success branch with:

```tsx
          <div className="cr-rsvp-receipt">
            <div className="cr-form-success" role="status">
              <span aria-hidden="true">✓</span>
              <div>
                <strong>Terima kasih.</strong>
                <p>Konfirmasi kehadiran Anda telah kami terima.</p>
              </div>
            </div>
            {sentAttendance ? <Postmark attendance={sentAttendance} /> : null}
          </div>
```

- [ ] **Step 5: Postmark CSS**

In `ThemeStyles.tsx` add after the sky block (Task 6):

```css
      /* Cap pos "Diterima": an orange postmark in its own row after the
         confirmation. It fills "both", so with animations off (reduced
         motion) it simply shows stamped. */
      .cr-rsvp-receipt { display: grid; min-width: 0; gap: 1.25rem; }
      .cr-postmark { display: block; width: clamp(8.5rem, 40vw, 10.5rem); height: auto; justify-self: end; overflow: visible; transform: rotate(-10deg); transform-origin: 35% 50%; animation: cr-stamp .55s cubic-bezier(.2, .8, .2, 1) .15s both; }
      .cr-postmark-ring { fill: none; stroke: var(--cr-tangerine); stroke-width: 3; }
      .cr-postmark-inner { stroke-width: 1.5; stroke-dasharray: 2 3; }
      .cr-postmark-cancel { fill: none; stroke: var(--cr-tangerine); stroke-width: 2.5; stroke-linecap: round; }
      .cr-postmark text { fill: var(--cr-tangerine-ink); font-family: var(--cr-label); font-weight: 700; letter-spacing: .12em; }
      .cr-postmark-word { font-size: 15px; }
      .cr-postmark-note { font-size: 10px; }
      @keyframes cr-stamp { 0% { opacity: 0; transform: scale(1.5) rotate(-22deg); } 70% { opacity: 1; transform: scale(.95) rotate(-9deg); } 100% { opacity: 1; transform: scale(1) rotate(-10deg); } }
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `node --test tests/cobalt-riviera-identity.test.mjs tests/cobalt-riviera-interactions.test.mjs tests/cobalt-riviera-quality.test.mjs`
Expected: PASS (exact RSVP payload, checked/pending/error recovery and success text unchanged).

- [ ] **Step 7: Commit**

```bash
git add src/themes/cobalt-riviera/components/Postmark.tsx src/themes/cobalt-riviera/sections/RsvpSection.tsx src/themes/cobalt-riviera/ThemeStyles.tsx tests/cobalt-riviera-identity.test.mjs
git commit -m "feat(cobalt): Diterima postmark on the RSVP confirmation

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_011pT7SiXwq9HVRhaYt6ogn3"
```

---

### Task 8: Message in a bottle after a sent wish ("Pesan dalam botol")

**Files:**
- Create: `src/themes/cobalt-riviera/components/WishBottle.tsx`
- Modify: `src/themes/cobalt-riviera/sections/WishesSection.tsx`
- Modify: `src/themes/cobalt-riviera/ThemeStyles.tsx`
- Test: `tests/cobalt-riviera-identity.test.mjs`

**Interfaces:**
- Consumes: `useWishForm()` state (unchanged); `useReducedMotion` from `motion/react` (the only Motion import, matching every Cobalt harness stub); `createLoader({ reducedMotion, actions })`, `mount`, `css`, `rules`, `submit` (Task 2).
- Produces: `WishBottle({ message: string | null })` → `<div class="cr-bottle-band" data-cr-bottle aria-hidden="true">` with an optional `p.cr-bottle-note` (one ellipsised line of the sent wish, ≤80 chars), `svg.cr-bottle` (`g.cr-bottle-bob` → glass, cork, rolled note) and `svg.cr-bottle-sea` — ≤10 nodes; `null` under reduced motion and after the drift ends.

Storyboard: the sent line rolls up (scale/translate) into the corked bottle, the bottle bobs on a wave line and drifts out of its band; the thank-you stays below. The band is a clipped 6rem row reserved where the form was (`.cr-wish-sent` padding), so nothing drifts over "Doa & ucapan" and nothing jumps when the band leaves. The wish reaches the list through the existing server revalidation.

- [ ] **Step 1: Write the failing test**

Append to `tests/cobalt-riviera-identity.test.mjs`:

```js
test("a sent wish rolls into a bottle that drifts away inside its own band; the thank-you stays", async () => {
  const { WishBottle } = createLoader()("components/WishBottle");
  const band = new JSDOM(renderToStaticMarkup(React.createElement(WishBottle, { message: "Bahagia selalu" }))).window.document.querySelector("[data-cr-bottle]");
  assert.equal(band.getAttribute("aria-hidden"), "true");
  assert.equal(band.querySelector(".cr-bottle-note").textContent, "Bahagia selalu");
  assert.ok(band.querySelector("svg.cr-bottle .cr-bottle-bob") && band.querySelector("svg.cr-bottle-sea"));
  assert.ok(band.querySelectorAll("*").length <= 20, `${band.querySelectorAll("*").length} nodes`);
  const long = new JSDOM(renderToStaticMarkup(React.createElement(WishBottle, { message: "doa ".repeat(100) }))).window.document;
  assert.ok(long.querySelector(".cr-bottle-note").textContent.length <= 80);
  const still = createLoader({ reducedMotion: true })("components/WishBottle").WishBottle;
  assert.equal(renderToStaticMarkup(React.createElement(still, { message: "Bahagia selalu" })), "");

  const wishes = [{ id: "w1", guestName: "Pak Joko", message: "Selamat menempuh hidup baru", createdAt: "2030-01-02T00:00:00Z" }];
  const { WishesSection } = createLoader({ actions: { submitWish: async () => ({ status: "success" }) } })("sections/WishesSection");
  const view = await mount(React.createElement(WishesSection, { invitationId: "cobalt", slug: "cobalt", guestToken: "t", guestName: "Bude Sri", wishes }));
  try {
    const form = view.document.querySelector("#cr-ucapan form");
    form.elements.namedItem("message").value = "Bahagia selalu";
    await submit(view, form);
    const section = view.document.getElementById("cr-ucapan");
    const status = section.querySelector('[role="status"]');
    assert.match(status.textContent, /Terima kasih atas ucapan dan doanya/);
    const bottle = section.querySelector("[data-cr-bottle]");
    assert.equal(bottle.querySelector(".cr-bottle-note").textContent, "Bahagia selalu", "the sent text, captured at submit");
    assert.equal(bottle.contains(status), false, "the thank-you is never inside the band");
    assert.ok(bottle.compareDocumentPosition(status) & 4, "the band sits above the thank-you, below the heading");
    assert.equal(section.querySelectorAll("[data-wish-id]").length, 1, "no optimistic insert: the list waits for revalidation");
  } finally { await view.cleanup(); }

  const reduced = createLoader({ reducedMotion: true, actions: { submitWish: async () => ({ status: "success" }) } })("sections/WishesSection").WishesSection;
  const calm = await mount(React.createElement(reduced, { invitationId: "cobalt", slug: "cobalt", guestToken: "t", guestName: "Bude Sri", wishes: [] }));
  try {
    const form = calm.document.querySelector("#cr-ucapan form");
    form.elements.namedItem("message").value = "Bahagia selalu";
    await submit(calm, form);
    assert.match(calm.document.querySelector('#cr-ucapan [role="status"]').textContent, /Terima kasih/);
    assert.equal(calm.document.querySelector("[data-cr-bottle]"), null, "no bottle under reduced motion");
  } finally { await calm.cleanup(); }

  const sheet = css();
  const bandRule = rules(sheet, ".cr-bottle-band").join(";");
  assert.match(bandRule, /top:\s*0/);
  assert.match(bandRule, /height:\s*6rem/);
  assert.match(bandRule, /overflow:\s*hidden/, "the bottle never leaves its band");
  assert.match(rules(sheet, ".cr-wish-sent").join(";"), /padding-top:\s*6rem/, "the band's row is reserved, so nothing jumps when it leaves");
  assert.match(sheet, /prefers-reduced-motion: reduce\)[\s\S]*\.cr-wish-sent\s*\{\s*padding-top:\s*0/, "no empty row under reduced motion");
  const note = rules(sheet, ".cr-bottle-note").join(";");
  assert.match(note, /white-space:\s*nowrap/, "one line only");
  assert.match(note, /text-overflow:\s*ellipsis/);
  for (const name of ["cr-note-roll", "cr-bottle-bob", "cr-bottle-drift"]) {
    const frames = sheet.match(new RegExp(`@keyframes ${name}\\s*\\{((?:[^{}]*\\{[^}]*\\})*)\\s*\\}`))?.[1] ?? "";
    assert.ok(frames, `${name} keyframes exist`);
    for (const [, body] of frames.matchAll(/\{([^}]*)\}/g)) {
      for (const declaration of body.split(";").map((part) => part.trim()).filter(Boolean)) {
        assert.match(declaration, /^(transform|opacity):/, `${name}: ${declaration}`);
      }
    }
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test --test-name-pattern="rolls into a bottle" tests/cobalt-riviera-identity.test.mjs`
Expected: FAIL — "Missing module: …/components/WishBottle".

- [ ] **Step 3: Write the component**

Create `src/themes/cobalt-riviera/components/WishBottle.tsx`:

```tsx
"use client";

import { useState, type AnimationEvent } from "react";
import { useReducedMotion } from "motion/react";

const MAX_NOTE = 80;

/**
 * Pesan dalam botol: the sent wish rolls up into a corked bottle that bobs on
 * a wave line and drifts out of its clipped band above the thank-you. Mounted
 * by the success state; decorative. It leaves the DOM once the bottle has
 * drifted away, and never renders under reduced motion.
 */
export function WishBottle({ message }: { message: string | null }) {
  const reduced = useReducedMotion() ?? false;
  const [done, setDone] = useState(false);
  if (reduced || done) return null;

  const text = message?.trim() ?? "";
  const note = text.length > MAX_NOTE ? `${text.slice(0, MAX_NOTE - 1)}…` : text;

  function finish(event: AnimationEvent<HTMLDivElement>) {
    if (event.animationName === "cr-bottle-drift") setDone(true);
  }

  return (
    <div className="cr-bottle-band" data-cr-bottle="" aria-hidden="true" onAnimationEnd={finish}>
      {note ? <p className="cr-bottle-note">{note}</p> : null}
      <svg className="cr-bottle" viewBox="0 0 64 28" focusable="false">
        <g className="cr-bottle-bob">
          <path className="cr-bottle-glass" d="M4 9h34l8-4h8v18h-8l-8-4H4a4 4 0 0 1-4-4v-2a4 4 0 0 1 4-4Z" />
          <rect className="cr-bottle-cork" x="54" y="7" width="7" height="14" />
          <rect className="cr-bottle-scroll" x="10" y="11" width="22" height="6" />
        </g>
      </svg>
      <svg className="cr-bottle-sea" viewBox="0 0 240 12" preserveAspectRatio="none" focusable="false">
        <path d="M0 6C20 0 20 0 40 6S60 12 80 6 100 0 120 6 140 12 160 6 180 0 200 6 220 12 240 6" />
      </svg>
    </div>
  );
}
```

- [ ] **Step 4: Wire it and style it**

In `WishesSection.tsx`:
- Add `import { useState, type FormEvent } from "react";` and `import { WishBottle } from "../components/WishBottle";`.
- After the `useWishPagination` line add:

```tsx
  // The form unmounts on success; keep the text it sent so it can sail away.
  const [sentMessage, setSentMessage] = useState<string | null>(null);
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const message = new FormData(event.currentTarget).get("message");
    setSentMessage(typeof message === "string" ? message : null);
    onSubmit(event);
  }
```

- Change the form's `onSubmit={onSubmit}` to `onSubmit={handleSubmit}`.
- Replace the success paragraph with:

```tsx
          <div className="cr-wish-sent">
            <WishBottle message={sentMessage} />
            <p className="cr-form-success cr-form-success-dark" role="status">Terima kasih atas ucapan dan doanya.</p>
          </div>
```

(The list still comes from the server: `submitWishAction` revalidates the page and the new wish arrives with the refreshed `wishes` prop. No optimistic insert.)

In `ThemeStyles.tsx` add after the postmark block (Task 7):

```css
      /* Pesan dalam botol: the band is a reserved, clipped 6rem row where the
         form was, above the thank-you, so the bottle never drifts over the
         heading or the confirmation and nothing jumps when it leaves. */
      .cr-wish-sent { position: relative; min-width: 0; padding-top: 6rem; }
      .cr-bottle-band { position: absolute; top: 0; right: 0; left: 0; height: 6rem; overflow: hidden; pointer-events: none; }
      .cr-bottle-note { position: absolute; top: .25rem; right: 0; left: 0; margin: 0; overflow: hidden; color: var(--cr-cobalt); font-family: var(--cr-text); font-size: 1.0625rem; font-style: italic; white-space: nowrap; text-overflow: ellipsis; transform-origin: 0 100%; animation: cr-note-roll .9s cubic-bezier(.5, 0, .75, 0) .2s both; }
      .cr-bottle { position: absolute; bottom: .55rem; left: 0; width: 4.5rem; height: auto; overflow: visible; animation: cr-bottle-drift 1.4s ease-in 1.7s both; }
      .cr-bottle-bob { transform-box: fill-box; transform-origin: center; animation: cr-bottle-bob .55s ease-in-out .9s 4 alternate both; }
      .cr-bottle-glass { fill: rgba(142, 197, 214, .35); stroke: var(--cr-cobalt); stroke-width: 1.5; }
      .cr-bottle-cork { fill: var(--cr-tangerine); }
      .cr-bottle-scroll { fill: var(--cr-citron); stroke: var(--cr-sea-ink); stroke-width: .75; }
      .cr-bottle-sea { position: absolute; right: 0; bottom: 0; left: 0; width: 100%; height: 12px; }
      .cr-bottle-sea path { fill: none; stroke: var(--cr-pool); stroke-width: 2; vector-effect: non-scaling-stroke; }
      @keyframes cr-note-roll { from { opacity: 1; transform: none; } to { opacity: 0; transform: translate(.5rem, 3.2rem) scale(.06); } }
      @keyframes cr-bottle-bob { from { transform: translateY(0) rotate(-3deg); } to { transform: translateY(-4px) rotate(3deg); } }
      @keyframes cr-bottle-drift { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(min(70vw, 22rem)); } }
```

Inside the existing `@media (prefers-reduced-motion: reduce) { … }` block add:

```css
        .cr-wish-sent { padding-top: 0; }
```

(The existing `.cr-form-success-dark` top rule and spacing are unchanged.)

- [ ] **Step 5: Run tests to verify they pass**

Run: `node --test tests/cobalt-riviera-identity.test.mjs tests/cobalt-riviera-interactions.test.mjs tests/cobalt-riviera-quality.test.mjs`
Expected: PASS (wish payload, Turnstile proof, edit recovery and pagination unchanged; "Jadilah yang pertama" still shows for an empty list).

- [ ] **Step 6: Commit**

```bash
git add src/themes/cobalt-riviera/components/WishBottle.tsx src/themes/cobalt-riviera/sections/WishesSection.tsx src/themes/cobalt-riviera/ThemeStyles.tsx tests/cobalt-riviera-identity.test.mjs
git commit -m "feat(cobalt): a sent wish sails away in a bottle

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_011pT7SiXwq9HVRhaYt6ogn3"
```

---

### Task 9: Bahasa Indonesia labels

**Files:**
- Modify: `src/themes/cobalt-riviera/CobaltRiviera.tsx`, `CoverGate.tsx` (`intro` prop)
- Modify: `src/themes/cobalt-riviera/sections/{HeroSection,CoupleSection,EventsSection,CountdownSection,DressCodeSection,LivestreamSection,QuoteSection,GiftSection,ClosingSection}.tsx`
- Modify: `tests/cobalt-riviera-narrative.test.mjs` (deliberate update: the sparse-hero test pins `CR / 04` in the horizon)
- Test: `tests/cobalt-riviera-identity.test.mjs`

**Interfaces:**
- Consumes: `createLoader`, `invitation`, `mount` (Task 2).
- Produces: `CoverGate` prop `intro: string`.

English that remains in Cobalt (found by reading every `.tsx`): "Sunlit invitation", "The wedding of", "CR / 04" (hero index and horizon), "Meet the hosts", "{nn} / Riviera", "One celebration, every stop in view.", "Itinerary", "Next horizon", "Wardrobe coordinates", "Dress code", "Live broadcast", "Join from anywhere", "East / Sun / Celebration", "Travel folio receipts", "With warmth from the Riviera". "RSVP" (nav) is the common Indonesian loanword and stays; "Cobalt Riviera" stays as the brand mark.

- [ ] **Step 1: Write the failing test**

Append to `tests/cobalt-riviera-identity.test.mjs`:

```js
const ENGLISH_LABELS = [
  "Sunlit invitation", "The wedding of", "CR / 04", "Meet the hosts", "/ Riviera",
  "One celebration, every stop in view.", "Itinerary", "Next horizon", "Wardrobe coordinates", "Dress code",
  "Live broadcast", "Join from anywhere", "East / Sun / Celebration", "Travel folio receipts",
  "With warmth from the Riviera", "Matur nuwun",
];

/** Every guest-facing string (not CSS): visible text plus aria-labels, placeholders and alt text. */
function guestCopy(document) {
  const attributes = [...document.querySelectorAll("[aria-label], [placeholder], [alt], [title]")]
    .flatMap((element) => ["aria-label", "placeholder", "alt", "title"].map((name) => element.getAttribute(name) ?? ""));
  const body = document.body.cloneNode(true);
  for (const code of body.querySelectorAll("style, script")) code.remove();
  return [body.textContent, ...attributes].join("\n");
}

function assertIndonesian(copy, expected) {
  for (const english of ENGLISH_LABELS) assert.ok(!copy.includes(english), `English label left: ${english}`);
  for (const label of expected) assert.ok(copy.includes(label), `missing Indonesian label: ${label}`);
}

test("every guest-facing label speaks Bahasa Indonesia; Italian stays a tagged accent", () => {
  const full = invitation({
    theme: { slug: "cobalt-riviera", settings: { dressCode: { description: "Biru dan putih.", groups: [{ label: "Tamu", colors: ["#1D3E9E"] }] } } },
    events: [{ ...invitation().events[0], mapsUrl: "https://maps.example.test/a", livestreamUrl: "https://live.example.test/a" }],
    gifts: [{ id: "gift", providerType: "bank", providerName: "Bank", accountNumber: "123", accountName: "Nadia", logoUrl: null, sortOrder: 0 }],
    wishes: [{ id: "w", guestName: "Bude Sri", message: "Bahagia selalu", createdAt: "2030-01-02T00:00:00Z" }],
    content: { openingQuote: "Kutipan.", openingMessage: "Pembuka.", closingMessage: "Penutup." },
    features: { music: true, countdown: true, maps: true, story: true, gallery: true, dressCode: true,
      livestream: true, rsvp: true, wishes: true, gift: true, guestPersonalization: true },
    media: { coverImageUrl: null, musicUrl: "/music.mp3" },
  });
  const { CobaltRiviera } = createLoader()("index");
  const wedding = new JSDOM(renderToStaticMarkup(React.createElement(CobaltRiviera, { invitation: full, guest: null }))).window.document;
  assertIndonesian(guestCopy(wedding), [
    "Pernikahan", "Salam dari pesisir", "Yang berbahagia", "Kartu pos 01", "Rangkaian acara",
    "Satu perayaan, setiap persinggahan.", "Hitung mundur", "Panduan busana", "Saran busana",
    "Siaran langsung", "Hadir dari mana saja", "Laut / Matahari / Perayaan", "Amplop digital",
    "Salam hangat dari tepi laut", "Google Kalender",
  ]);
  assert.ok(guestCopy(wedding).includes("Cobalt Riviera"), "the theme name stays as the masthead brand mark");
  for (const accent of wedding.querySelectorAll("[lang='it']")) {
    assert.match(accent.textContent, /^Saluti( dalla Costa)?$/, "Italian appears only as the tagged Saluti accent");
  }
  assert.ok(wedding.querySelectorAll("[lang='it']").length >= 1);

  const party = invitation({ type: "birthday", features: { ...invitation().features, countdown: false } });
  const birthday = new JSDOM(renderToStaticMarkup(React.createElement(CobaltRiviera, { invitation: party, guest: null }))).window.document;
  assertIndonesian(guestCopy(birthday), ["Undangan perayaan", "Perayaan", "Tuan rumah", "Tandai kalender Anda", "Simpan tanggalnya"]);
});
```

In `tests/cobalt-riviera-narrative.test.mjs` (test "sparse and partial narrative uses intentional horizons…") replace

```js
  assert.match(horizon?.textContent ?? "", /CR \/ 04/);
```

with

```js
  assert.match(horizon?.textContent ?? "", /Saluti/);
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test --test-name-pattern="Bahasa Indonesia|sparse and partial" tests/cobalt-riviera-identity.test.mjs tests/cobalt-riviera-narrative.test.mjs`
Expected: FAIL — "English label left: The wedding of" (and the narrative test's `Saluti`).

- [ ] **Step 3: Replace the strings**

| File | From | To |
|---|---|---|
| `CobaltRiviera.tsx` | `label={invitation.type === "wedding" ? "Cobalt Riviera" : "Sunlit invitation"}` | `label={invitation.type === "wedding" ? "Cobalt Riviera" : "Undangan perayaan"}` and add `intro={invitation.type === "wedding" ? "Pernikahan" : "Perayaan"}` |
| `CoverGate.tsx` | `<p className="cr-cover-intro">The wedding of</p>` | `<p className="cr-cover-intro">{intro}</p>` (add `intro: string;` to `CoverGateProps` and the destructuring) |
| `HeroSection.tsx` | `<p className="cr-hero-index">CR / 04</p>` | `<p className="cr-hero-index">Salam dari pesisir</p>` |
| `HeroSection.tsx` | `<span className="cr-hero-horizon-route">CR / 04</span>` | `<span className="cr-hero-horizon-route" lang="it">Saluti</span>` |
| `CoupleSection.tsx` | `<p>Meet the hosts</p>` | `<p>{invitationType === "wedding" ? "Yang berbahagia" : "Tuan rumah"}</p>` |
| `CoupleSection.tsx` | `{String(index + 1).padStart(2, "0")} / Riviera` | `Kartu pos {String(index + 1).padStart(2, "0")}` |
| `EventsSection.tsx` | `<p>One celebration, every stop in view.</p>` / `Itinerary` | `<p>Satu perayaan, setiap persinggahan.</p>` / `Rangkaian acara` |
| `CountdownSection.tsx` | `<p>Next horizon</p>` | `<p>{hasTarget ? "Hitung mundur" : "Tandai kalender Anda"}</p>` |
| `DressCodeSection.tsx` | `Wardrobe coordinates` / `Dress code` | `Panduan busana` / `Saran busana` |
| `LivestreamSection.tsx` | `Live broadcast` / `Join from anywhere` | `Siaran langsung` / `Hadir dari mana saja` |
| `QuoteSection.tsx` | `East / Sun / Celebration` | `Laut / Matahari / Perayaan` |
| `GiftSection.tsx` | `Travel folio receipts` | `Amplop digital` |
| `ClosingSection.tsx` | `With warmth from the Riviera` | `Salam hangat dari tepi laut` |

(The couple `h2` already reads "Mempelai" / "Yang mengundang"; the countdown `h2` already reads "Menuju hari bahagia" / "Simpan tanggalnya". Thanks stay "Terima kasih".)

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/cobalt-riviera-identity.test.mjs tests/cobalt-riviera-*.test.mjs`
Expected: PASS.

Run: `npm test && npm run lint && npm run typecheck`
Expected: all pass except the known countdown-timezone test; lint and typecheck exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/themes/cobalt-riviera tests/cobalt-riviera-identity.test.mjs tests/cobalt-riviera-narrative.test.mjs
git commit -m "feat(cobalt): Bahasa Indonesia labels with a tagged Saluti accent

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_011pT7SiXwq9HVRhaYt6ogn3"
```

---

### Task 10: Docs, verification, visual QA, PR

**Files:**
- Modify: `CLAUDE.md` ("Active Implementation Checkpoint")
- Modify: `docs/PROJECT_MEMORY.md` (Cobalt decision, construction map, identity record, checkpoint)
- Modify: `docs/DESIGN.md` §27
- Modify: `docs/superpowers/specs/2026-10-01-cobalt-riviera-theme-design.md` (supersede note)
- Modify: `docs/superpowers/specs/2026-10-03-theme-identity-redesign-design.md` §7 (implementation notes)
- Add: `docs/superpowers/plans/2026-10-05-cobalt-identity.md` (this plan, if not yet committed)
- Temporary (never committed): `src/app/qa-fixture/page.tsx`, `public/qa/` (both in `.git/info/exclude`)

- [ ] **Step 1: Docs**

`docs/PROJECT_MEMORY.md`:
- In "Product decisions…", replace the Cobalt bullet with:

```markdown
- Cobalt Riviera uses the approved **Surat Cinta dari Mediterania** direction
  (Oct 2026, replacing the sunlit destination editorial): Corinthia /
  Familjen Grotesk / Newsreader italic, the Kobalt/Porselen/Tinta laut/Jeruk/
  Citron/Kolam palette with a Senja sky (see the 2026-10-03 identity spec), a
  receding-wave cover, wave dividers, a morning-to-sunset sky, a postmark on
  the RSVP and a message in a bottle for wishes. Flat colour only: no
  gradients, shadows, glass or rounded cards; shells, palms and flight paths
  stay out.
```

- In "Cobalt Riviera construction map", change the first line of the tree to `CoverGate — receding waves (Ombak surut), guest personalization, music and focus handoff`, the RSVP line to `RSVP — large checked color fields; "Diterima" postmark naming the submitted attendance`, the wishes line to `Wishes — route-separated notes; a sent wish sails away in a bottle`, and replace the paragraph starting "The registry preview uses Cobalt `#1646C8`…" with:

```markdown
Cobalt uses Kobalt `#1D3E9E`, Porselen `#F7F4EC`, Tinta laut `#0E2350`,
Jeruk `#E8743B` (fills, rules and the postmark ring; text uses
`--cr-tangerine-ink` `#9A3D14`), Citron `#E9D35B`, Kolam `#8EC5D6`, and Senja
`#F8DCC4`, the sunset sky behind the porcelain chapters. Corinthia carries
couple names, Newsreader italic the headings and numerals, Newsreader the body
(17px) and Familjen Grotesk the spaced-capital labels. The registry preview
uses Kobalt, Porselen and Jeruk. The catalogue migration is
`20261002000001_cobalt_riviera_theme.sql`; it is a single slug upsert that
preserves an existing row ID and all invitation foreign-key references.
```

- In "Theme identity redesign (Oct 2026)", add:

```markdown
- Cobalt "Surat Cinta dari Mediterania": receding-wave cover
  (`RecedingWaves`, replaces the horizon shutters), swaying chapter dividers
  (`WaveDivider`, paused off screen by a direct observer), morning-to-sunset
  sky with a sinking sun (`RivieraSky` over
  `themes/shared/use-scroll-progress.ts`; only opacity and transform follow
  the scroll), "Diterima" postmark naming the submitted attendance
  (`Postmark`), sent wish sailing away in a bottle (`WishBottle`), Bahasa
  Indonesia labels with a tagged "Saluti" accent. Plan:
  `docs/superpowers/plans/2026-10-05-cobalt-identity.md`. `@fontsource/corinthia`
  added. `tests/cobalt-riviera-identity.test.mjs` pins contrast (including the
  sky ramp), names, waves, dividers, sky, postmark, bottle and labels.
```

- Replace "Checkpoint — Cobalt 'Surat Cinta dari Mediterania' (next)" with a checkpoint in the Midnight shape: branch, task commits, deviations from the plan, visual QA findings, verification numbers, remaining notes, and the owner decisions taken.

`docs/DESIGN.md` §27: replace the "Palette:" paragraph, the "Storyboard:" paragraph and the paragraph starting "Use hard rectangular crops" with:

```markdown
Since October 2026 Cobalt follows **Surat Cinta dari Mediterania** (spec
`docs/superpowers/specs/2026-10-03-theme-identity-redesign-design.md` §7): a
summer postcard from the coast — majolica blue, lemons, stamps and sea. It is
the brightest theme.

Palette: Kobalt `#1D3E9E` (sea and architectural chapters), Porselen
`#F7F4EC` (reading surface, morning sky), Tinta laut `#0E2350` (text, night
chapters), Jeruk `#E8743B` (fills, rules, postmark ring; text uses `#9A3D14`),
Citron `#E9D35B` (sun, highlights), Kolam `#8EC5D6` (quiet secondary field)
and Senja `#F8DCC4` (sunset sky). Corinthia is reserved for couple names;
Newsreader italic carries headings and numerals; Newsreader carries body text
at 17px or larger; Familjen Grotesk carries spaced-capital labels.

Storyboard: a cobalt sea cover whose two foam-edged waves recede to leave the
names on porcelain sand; two wave lines swaying at each chapter's top edge
(only while on screen); a sky behind the porcelain chapters that warms from
morning to sunset as the guest scrolls, with a small sun sinking down the page
margin; an orange "Diterima" postmark beside the RSVP confirmation; a sent
wish rolled into a bottle that bobs and drifts away. Small Italian accents
("Saluti") are tagged `lang="it"`; every label is Bahasa Indonesia.

Use flat colour fields, hard rectangular crops, thin route rules, wave lines
and strong left alignment. Avoid gradients, glass, shadows, rounded cards,
shells, palms, decorative flight paths and any invented customer data. The
receding waves own the one theatrical motion; dividers and the sky are quiet,
and reduced motion shows the final sky, still waves and the postmark at rest
while preserving every action. Empty, malformed, and disabled content must
leave no dead route item or decorative gap, while controls remain at least
48px and usable from 320px through desktop.
```

`docs/superpowers/specs/2026-10-01-cobalt-riviera-theme-design.md`: add directly under the title:

```markdown
> **Superseded (visual direction only), 2026-10-05:** typography, palette,
> cover and ornaments now follow `2026-10-03-theme-identity-redesign-design.md`
> §7 ("Surat Cinta dari Mediterania"). Data, sections, feature gating and
> accessibility below remain authoritative.
```

`docs/superpowers/specs/2026-10-03-theme-identity-redesign-design.md` §7: after the signature-interaction list add:

```markdown
Implementation notes (Cobalt PR): jeruk is 2.7:1 on porselen, so text uses
`#9A3D14`; the sky is two flat layers (porselen, senja `#F8DCC4`) cross-faded
by opacity, AA-tested along the whole ramp, and reduced motion pins sunset.
The sun sinks in the left page gutter. Dividers pause off screen with a direct
observer (no reveal, so not `use-in-view-once`). The postmark stamps every
successful RSVP and names the submitted attendance; RSVP has no party size.
The sent wish reaches the list through server revalidation. Italian accents
are limited to a tagged "Saluti"; thanks stay "Terima kasih".
```

`CLAUDE.md` "Active Implementation Checkpoint": replace the paragraph starting "Terra Botanica 'Herbarium Cinta' shipped…" with one stating Midnight shipped in PR #16 (merge `202c787`), the current work is Cobalt "Surat Cinta dari Mediterania" on `design/terra-identity-at0kh3`, plan `docs/superpowers/plans/2026-10-05-cobalt-identity.md`, all plan tasks done, and the PR waits for the owner's explicit "merge".

- [ ] **Step 2: Full verification**

Run: `npm test` — all pass except the known environmental countdown-timezone test (`tests/terra-botanica-render.test.mjs`, nested `node --test` prints TAP when piped on Node 22). Record the count (baseline 370/371 plus the new tests).
Run: `npm run lint && npm run typecheck && npm run build` — each exits 0. If the build reports a stale `.next/dev/types` reference to `qa-fixture`, delete `.next/dev` and retry.
Run: `grep -rn "querySelector\|<img" src/themes/cobalt-riviera` — no output.
Run: `grep -rn "border-radius\|gradient\|box-shadow\|backdrop-filter" src/themes/cobalt-riviera` — no output.

- [ ] **Step 3: Visual QA with fixture data (never a live invitation)**

Create `src/app/qa-fixture/page.tsx` rendering `<ThemeRenderer invitation={…} guest={…} />` with `import "@/themes/theme-fonts";`, `theme.slug: "cobalt-riviera"`, two events with times, countdown on, two stories, three gallery items pointing at local SVGs in `public/qa/`, rsvp and wishes enabled, music off, a long guest name. Start the Browser preview (`preview_start` name `web`), open `/qa-fixture`, and check at 320×640, 360×640, 375×812 and 1280×860 (trigger clicks with `element.click()` via the JS tool):

1. Cover: names in Corinthia with a Newsreader italic "&", "Saluti dalla Costa" and the brand in Familjen spaced capitals over the cobalt sea; at 360×640 the open button's bottom is ≤640px. Tap → cover inert at once, text fades, cobalt wave then kolam swell recede upward with a porselen foam edge, names lie on the sand, cover gone by ~1.4s.
2. Headings Newsreader italic; body Newsreader 17px (`getComputedStyle(p).fontSize === "17px"`); labels Familjen uppercase.
3. Dividers: two lines at the top of each chapter; they move while on screen and `data-sway` turns `off` for dividers scrolled away.
4. Sky: `--cr-day` ≈0 after opening, ≈0.5 mid-page, 1 at the end; porcelain chapters warm to senja; the sun stays in the left gutter, never under text, hidden behind cobalt/kolam chapters; DevTools Performance shows no full-page paint per scroll frame (only composite).
5. Postmark and bottle need a successful submission (Turnstile rejects localhost); they are covered by the identity tests. Optionally mount `<Postmark attendance="not_attending" />` and `<WishBottle message="…" />` inside a `.cr-theme` wrapper on the fixture page; confirm the postmark fits 320px beside nothing, the bottle stays inside its band at 320px, never reaches the "Doa & ucapan" heading, and its node leaves the DOM after ~3.1s.
6. No horizontal overflow at any width (`document.documentElement.scrollWidth === innerWidth`); five nav items with icons, ≥52px tall on phones; hero title before the 3:4 photo; names never squeezed into a narrow column.
7. Reduced motion (emulate `prefers-reduced-motion: reduce`): cover hides at once, dividers still, sky pinned to sunset (`getComputedStyle(sky).getPropertyValue("--cr-day")` is `1`), postmark at rest, no bottle and no empty band.
8. Contrast spot checks with DevTools on: cover text on cobalt, sand names, a porcelain chapter at the end of the page (senja), the postmark lettering, a placeholder.

Delete `src/app/qa-fixture/`, `public/qa/` and `.next/dev` afterwards.

- [ ] **Step 4: Commit docs and push**

```bash
git add CLAUDE.md docs/PROJECT_MEMORY.md docs/DESIGN.md docs/superpowers/specs/2026-10-01-cobalt-riviera-theme-design.md docs/superpowers/specs/2026-10-03-theme-identity-redesign-design.md docs/superpowers/plans/2026-10-05-cobalt-identity.md
git commit -m "docs: record the Cobalt identity redesign

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_011pT7SiXwq9HVRhaYt6ogn3"
git push -u origin design/terra-identity-at0kh3
```

(The remote branch holds merged commits that are ancestors of `main`, so this is a fast-forward. If the push is rejected as non-fast-forward, stop and ask the user; do not force-push.)

- [ ] **Step 5: Open the PR and stop**

```bash
gh pr create --base main --head design/terra-identity-at0kh3 --title "Cobalt identity: Surat Cinta dari Mediterania" --body "$(cat <<'EOF'
Cobalt Riviera gets its "Surat Cinta dari Mediterania" identity (spec docs/superpowers/specs/2026-10-03-theme-identity-redesign-design.md §7, plan docs/superpowers/plans/2026-10-05-cobalt-identity.md):

- Corinthia (names) / Newsreader italic (headings, body 17px) / Familjen Grotesk (spaced-capital labels); @fontsource/corinthia added
- Kobalt-porselen-tinta laut-jeruk-citron-kolam palette with a senja sky; AA contrast test covers every surface and the whole morning-to-sunset ramp (jeruk text uses #9A3D14)
- Receding-wave cover replaces the horizon shutters (music still starts on the first tap; the open button stays on screen at 360x640)
- Swaying wave dividers (paused off screen), morning-to-sunset sky with a sinking sun (opacity/transform only, via use-scroll-progress), "Diterima" postmark naming the submitted attendance, a sent wish sailing away in a bottle inside its own band
- Bahasa Indonesia labels; Italian only as a tagged "Saluti" accent
- Reduced motion: cover hides at once, still waves, sunset sky, postmark at rest, no bottle
- Updated tests that pinned the old palette, shutters, CR / 04 and the font list

Presentation only; no capability or data changes.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_011pT7SiXwq9HVRhaYt6ogn3
EOF
)"
```

Report the PR link to the user and **wait for an explicit "merge"** (merging to `main` deploys production).
