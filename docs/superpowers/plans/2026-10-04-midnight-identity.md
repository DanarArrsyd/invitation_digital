# Midnight Atelier Identity ("Malam di Ballroom") Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give Midnight Atelier its "Malam di Ballroom" identity — Imperial Script / Bodoni Moda italic / Jost, the tinta-oxblood-champagne-mutiara-asap palette with warm spotlight tokens, a champagne-toast opener that replaces the curtain cover, and four signature interactions (spotlight headings, dance card after an attending RSVP, champagne bubbles on a sent wish, picture lights in the gallery) — without changing any capability.

**Architecture:** Presentation-only change inside `src/themes/midnight-atelier/` plus font wiring in `src/themes/theme-fonts.ts`. Midnight stays CSS-driven like Terra: no Motion components (every Midnight test harness stubs `motion/react` down to `useReducedMotion`), animations are CSS keyframes/transitions toggled by data attributes, and in-view triggers reuse the shared `src/themes/shared/use-in-view-once.ts` (arms only after the observer reports the element off-screen, so server and first client markup agree). Colours stay in `tokens.ts` and are interpolated by `ThemeStyles.tsx`; existing `--ma-*` names are re-pointed, not renamed.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, `@fontsource`, `node --test` with vm/ts-transpile harnesses and jsdom.

**Spec:** `docs/superpowers/specs/2026-10-03-theme-identity-redesign-design.md` §3, §6, §8–10. Reference implementation of the pattern: the merged Terra plan `docs/superpowers/plans/2026-10-03-terra-identity.md`.

**Already done for Midnight — do not redo:** art-deco nav icons (`components/NavIcon.tsx`), calendar actions inside the countdown (`components/AddToCalendar.tsx` used by `CountdownSection`), 5-item non-scrolling mobile nav (`pickNavItems`, `.ma-nav` sizing), 3:4 title-first hero. Their tests in `tests/midnight-atelier-shell.test.mjs` and `-narrative.test.mjs` must keep passing untouched.

## Global Constraints

- Fonts: Imperial Script (couple names only) · Bodoni Moda (headings, italic) · Jost (body ≥17px; labels in spaced capitals). Self-hosted via `@fontsource`; no Google Fonts at runtime. `@fontsource/ibm-plex-sans-condensed` is removed (nothing else uses it).
- No font may be mapped by two themes (`tests/font-delivery.test.mjs`). Jost is installed and no longer mapped by Ivory.
- Palette: tinta `#14121A` (`--ma-ink`), oxblood `#5E1A22`, champagne `#D8C08A`, mutiara `#EDE6DA` (`--ma-pearl`), asap `#6E6873` (`--ma-smoke`). `--ma-lacquer` is kept as a lifted tinta `#1E1A24` for layered surfaces. Asap is ≈3.4:1 on tinta, so small secondary text uses `--ma-smoke-ink` `#A9A2AD`; raw `--ma-smoke` is for rules and borders only.
- Text contrast ≥4.5:1 for every body/label pair, including over the spotlight wash (`--ma-light`); the spotlight's resting dim (`--ma-dim` opacity on large headings) stays ≥3:1 on every surface it is used on.
- Radial gradients are allowed only for light (the spotlight `::before`, the picture-light `::after`); no linear/conic gradients, no neon glow.
- Motion animates only `transform`, `opacity`, `clip-path`, `stroke-dashoffset`, and CSS custom properties; particle effects ≤20 nodes.
- `prefers-reduced-motion: reduce` → cover hides at once, headings fully lit, no wish bubbles, frames lit, dance card shown filled; confirmation text always visible.
- One tap on "Buka undangan" calls `openInvitation()` synchronously (music in the same gesture); the toast never delays it. The cover turns `inert` immediately.
- Server markup and the first client render must agree: no reduced-motion branching in initial markup; in-view state comes only from `useInViewOnce`.
- Midnight source must not contain `<img` or `querySelector` (`tests/midnight-atelier-quality.test.mjs`, `-foundation.test.mjs`); use refs.
- The cover's open button keeps class `ma-cover-open`, text "Buka undangan" and `aria-controls="ma-content"`; the cover `h1` still contains both names.
- Binding mobile rules stay intact: DESIGN.md §9 (3:4 hero, title first) and §12a (≤5 nav items, equal widths, no sideways scroll, ≥52px items, labels ≥11px, content padding for the bar). Name headings are never capped by a `ch` measure (owner rule).
- No capability added or removed. RSVP collects no party size, so the dance card shows name and attendance only.
- Every existing test keeps passing. Tests that pin the old fonts, palette, curtain cover or the blanket "no radial-gradient" rule are updated deliberately in the task that changes that behaviour (named in each task).
- Merging to `main` auto-deploys production: open a PR and **ask the user before merging**.
- Execution branch: `design/terra-identity-at0kh3` (reset to `main` after PR #15). Do not create or switch branches.
- Commit messages end with:
  ```
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_011pT7SiXwq9HVRhaYt6ogn3
  ```
  (subagents use their own model name in the first line).

## File Map

| File | Change |
|---|---|
| `package.json`, `package-lock.json` | add `@fontsource/imperial-script`; remove `@fontsource/ibm-plex-sans-condensed` |
| `src/themes/theme-fonts.ts` | Midnight block imports Imperial Script, Bodoni Moda (+ italic axis), Jost |
| `src/themes/midnight-atelier/fonts.css`, `fonts.ts`, `MidnightAtelier.tsx` | three face handles |
| `src/themes/midnight-atelier/tokens.ts` | re-pointed palette, `smokeInk` |
| `src/themes/midnight-atelier/ThemeStyles.tsx` | type tokens, `.ma-script`/`.ma-label`, palette and light tokens, toast, spotlight, dance card, bubbles, picture lights |
| `src/themes/registry.ts`, `tests/theme-contract.test.mjs` | Midnight preview palette |
| `src/themes/midnight-atelier/components/ChampagneToast.tsx` | new: cover opener |
| `src/themes/midnight-atelier/components/Spotlight.tsx` | new: lit chapter heading |
| `src/themes/midnight-atelier/components/DanceCard.tsx` | new: RSVP celebration |
| `src/themes/midnight-atelier/components/WishBubbles.tsx` | new: wish celebration |
| `src/themes/midnight-atelier/CoverGate.tsx` | toast replaces curtain; script names |
| `src/themes/midnight-atelier/sections/{HeroSection,CoupleSection,ClosingSection}.tsx` | script names |
| `src/themes/midnight-atelier/sections/{CoupleSection,EventsSection,CountdownSection,DressCodeSection,StorySection,GallerySection,LivestreamSection,RsvpSection,WishesSection,GiftSection}.tsx` | spotlight headings |
| `src/themes/midnight-atelier/sections/RsvpSection.tsx`, `WishesSection.tsx`, `GallerySection.tsx` | dance card, bubbles, picture lights |
| `tests/font-delivery.test.mjs` | Midnight faces |
| `tests/midnight-atelier-identity.test.mjs` | new: identity tests + harness |
| `tests/midnight-atelier-foundation.test.mjs` | fonts, palette, gradient assertion |
| `tests/midnight-atelier-shell.test.mjs` | curtain → toast, gradient assertion |
| `tests/midnight-atelier-{guest-interactions,narrative,programme,story-gallery}.test.mjs` | gradient assertion only |
| `docs/PROJECT_MEMORY.md`, `docs/DESIGN.md` §26, `docs/superpowers/specs/2026-09-30-midnight-atelier-theme-design.md`, `docs/superpowers/specs/2026-10-03-theme-identity-redesign-design.md` §6 | record the new direction |

---

### Task 1: Midnight font system

**Files:**
- Modify: `package.json`, `package-lock.json`
- Modify: `src/themes/theme-fonts.ts`
- Modify: `src/themes/midnight-atelier/fonts.css`, `src/themes/midnight-atelier/fonts.ts`, `src/themes/midnight-atelier/MidnightAtelier.tsx`, `src/themes/midnight-atelier/ThemeStyles.tsx`
- Test: `tests/font-delivery.test.mjs`, `tests/midnight-atelier-foundation.test.mjs` (deliberate update: it pins IBM Plex Sans Condensed)

**Interfaces:**
- Produces: tokens `--ma-script`, `--ma-display`, `--ma-body`; classes `.ma-script` (names) and `.ma-label` (Jost spaced capitals). Later tasks use these names verbatim.

- [ ] **Step 1: Write the failing tests**

In `tests/font-delivery.test.mjs` replace the `"midnight-atelier"` entry of `THEME_FONTS` with:

```js
  "midnight-atelier": {
    packages: [/@fontsource\/imperial-script/, /@fontsource-variable\/bodoni-moda/, /@fontsource-variable\/jost/],
    faces: [
      /--font-ma-script:\s*"Imperial Script"/,
      /--font-ma-display:\s*"Bodoni Moda Variable"/,
      /--font-ma-text:\s*"Jost Variable"/,
    ],
  },
```

and append:

```js
test("Midnight styles consume the script, display and text faces", async () => {
  const [styles, themeFonts] = await Promise.all([
    source("src/themes/midnight-atelier/ThemeStyles.tsx"),
    source("src/themes/theme-fonts.ts"),
  ]);
  assert.match(styles, /--ma-script:\s*var\(--font-ma-script\)/);
  assert.match(styles, /--ma-display:\s*var\(--font-ma-display\)/);
  assert.match(styles, /--ma-body:\s*var\(--font-ma-text\)/);
  assert.doesNotMatch(styles, /--font-ma-body|var\(--font-ma-display\), serif/);
  assert.match(styles, /font-family:\s*var\(--ma-body\);\s*font-size:\s*1\.0625rem/, "body text is at least 17px on the dark ground");
  assert.match(styles, /\.ma-script\s*\{[^}]*font-family:\s*var\(--ma-script\)/);
  assert.match(styles, /\.ma-label\s*\{[^}]*font-family:\s*var\(--ma-body\)[^}]*text-transform:\s*uppercase/);
  assert.match(styles, /:is\(h2, h3, blockquote\)\s*\{\s*font-style:\s*italic/);
  assert.match(themeFonts, /@fontsource-variable\/bodoni-moda\/wght-italic\.css/, "italic headings ship the italic axis");
  assert.doesNotMatch(themeFonts, /ibm-plex-sans-condensed/);
});
```

In `tests/midnight-atelier-foundation.test.mjs` (test "Midnight source stays presentation-only and uses bundled font families") replace

```js
  assert.match(fontsTs, /@fontsource-variable\/bodoni-moda/);
  assert.match(fontsTs, /@fontsource\/ibm-plex-sans-condensed/);
  assert.match(fontsCss, /--font-ma-display:\s*"Bodoni Moda Variable"/);
  assert.match(fontsCss, /--font-ma-body:\s*"IBM Plex Sans Condensed"/);
```

with

```js
  assert.match(fontsTs, /@fontsource\/imperial-script/);
  assert.match(fontsTs, /@fontsource-variable\/bodoni-moda/);
  assert.match(fontsTs, /@fontsource-variable\/jost/);
  assert.match(fontsCss, /--font-ma-script:\s*"Imperial Script"/);
  assert.match(fontsCss, /--font-ma-display:\s*"Bodoni Moda Variable"/);
  assert.match(fontsCss, /--font-ma-text:\s*"Jost Variable"/);
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/font-delivery.test.mjs tests/midnight-atelier-foundation.test.mjs`
Expected: FAIL — `@fontsource/imperial-script` missing from `theme-fonts.ts`, "Midnight styles consume…" fails, foundation font assertions fail.

- [ ] **Step 3: Install and remove packages**

```bash
npm install @fontsource/imperial-script@^5.3.0
npm uninstall @fontsource/ibm-plex-sans-condensed
```

(`@fontsource-variable/jost` and `@fontsource-variable/bodoni-moda` are already installed.)

- [ ] **Step 4: Wire the faces**

In `src/themes/theme-fonts.ts` replace the Midnight block with:

```ts
// midnight-atelier
import "@fontsource/imperial-script/400.css";
import "@fontsource-variable/bodoni-moda";
import "@fontsource-variable/bodoni-moda/wght-italic.css";
import "@fontsource-variable/jost";
import "./midnight-atelier/fonts.css";
```

Replace `src/themes/midnight-atelier/fonts.css` with:

```css
.ma-font-script {
  --font-ma-script: "Imperial Script";
}

.ma-font-display {
  --font-ma-display: "Bodoni Moda Variable";
}

.ma-font-text {
  --font-ma-text: "Jost Variable";
}
```

Replace `src/themes/midnight-atelier/fonts.ts` with:

```ts
/** Ballroom script — couple names only. */
export const scriptFace = { variable: "ma-font-script" } as const;

/** High-contrast display face — italic headings, numerals, venue lines. */
export const displayFace = { variable: "ma-font-display" } as const;

/** Geometric text face — body copy (≥17px) and spaced-capital labels. */
export const textFace = { variable: "ma-font-text" } as const;
```

In `src/themes/midnight-atelier/MidnightAtelier.tsx` replace `import { bodyCondensed, displaySerif } from "./fonts";` with

```tsx
import { displayFace, scriptFace, textFace } from "./fonts";
```

and the root class with

```tsx
      className={`ma-theme ${scriptFace.variable} ${displayFace.variable} ${textFace.variable}`}
```

- [ ] **Step 5: Retarget the Midnight type tokens**

In `src/themes/midnight-atelier/ThemeStyles.tsx`, inside the `.ma-theme { … }` rule replace

```css
        font-family: var(--font-ma-body), sans-serif;
```

with

```css
        --ma-script: var(--font-ma-script), "Snell Roundhand", cursive;
        --ma-display: var(--font-ma-display), Didot, Georgia, serif;
        --ma-body: var(--font-ma-text), Futura, "Century Gothic", Arial, sans-serif;
        font-family: var(--ma-body);
        font-size: 1.0625rem;
```

Replace every occurrence of `var(--font-ma-display), serif` with `var(--ma-display)` (26 occurrences; use replace-all).

In `.ma-hero-copy p` replace `font-size: clamp(1rem, 2vw, 1.2rem);` with `font-size: clamp(1.0625rem, 2vw, 1.25rem);`.

Directly after the `.ma-display { … }` rule add:

```css
      /* Ballroom voices: Imperial Script for names, Bodoni italic for headings,
         Jost spaced capitals for labels. */
      .ma-theme :is(h2, h3, blockquote) { font-style: italic; }
      .ma-theme .ma-script { font-family: var(--ma-script); font-style: normal; font-weight: 400; letter-spacing: 0; }
      .ma-theme .ma-label { font-family: var(--ma-body); font-size: .75rem; font-style: normal; font-weight: 500; letter-spacing: .18em; text-transform: uppercase; }
      .ma-theme :is(.ma-cover-masthead, .ma-cover-intro, .ma-cover-recipient > p:first-child, .ma-chapter-heading p, .ma-interaction-heading > p, .ma-countdown-intro p, .ma-livestream-copy > p, .ma-event-type, .ma-countdown-units dt, .ma-gift-provider, .ma-parents p:first-child, .ma-dress-group h3, .ma-form-field > span, .ma-attendance legend, .ma-form-recipient > span) { font-family: var(--ma-body); font-style: normal; font-weight: 500; letter-spacing: .16em; text-transform: uppercase; }
```

(The nav label stays sentence case so five labels fit a 320px bar.)

- [ ] **Step 6: Run tests to verify they pass**

Run: `node --test tests/font-delivery.test.mjs tests/midnight-atelier-foundation.test.mjs`
Expected: PASS.

Run: `grep -rn "ibm-plex\|IBM Plex\|font-ma-body\|bodyCondensed\|displaySerif" src tests package.json`
Expected: no output.

Run: `npm test`
Expected: all pass except the pre-existing environmental countdown-timezone test in `tests/terra-botanica-render.test.mjs` (baseline 348/349).

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json src/themes/theme-fonts.ts src/themes/midnight-atelier/fonts.css src/themes/midnight-atelier/fonts.ts src/themes/midnight-atelier/MidnightAtelier.tsx src/themes/midnight-atelier/ThemeStyles.tsx tests/font-delivery.test.mjs tests/midnight-atelier-foundation.test.mjs
git commit -m "feat(midnight): Imperial Script, Bodoni Moda italic and Jost type system

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_011pT7SiXwq9HVRhaYt6ogn3"
```

---

### Task 2: Palette, light tokens and test harness

**Files:**
- Modify: `src/themes/midnight-atelier/tokens.ts`
- Modify: `src/themes/midnight-atelier/ThemeStyles.tsx`
- Modify: `src/themes/registry.ts` (Midnight `preview.palette`)
- Modify: `tests/theme-contract.test.mjs` (Midnight expectation)
- Modify: `tests/midnight-atelier-foundation.test.mjs` (deliberate update: it pins the old six hex values)
- Create: `tests/midnight-atelier-identity.test.mjs`

**Interfaces:**
- Produces: token `smokeInk` / `--ma-smoke-ink`; CSS tokens `--ma-light` (spotlight wash), `--ma-light-strong` (picture light), `--ma-dim` (resting heading opacity). Test helpers in `tests/midnight-atelier-identity.test.mjs` — `createLoader({ reducedMotion?, actions? })` returning `load(pathInsideMidnightDir)`, `mount(element, { intersectionObserver? })`, `invitation(overrides)`, `css()`, `tokens()`, `rules(css, selector)`, `contrast(a, b)`, `mix(fg, bg, alpha)`, `rgba(css, token)`, `FakeIntersectionObserver` (records `options`; `trigger(isIntersecting = true)`). Tasks 3–8 append tests to this file and reuse them.

- [ ] **Step 1: Write the failing tests**

Create `tests/midnight-atelier-identity.test.mjs`:

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
const midnightRoot = resolve(srcRoot, "themes/midnight-atelier");

/**
 * Loads Midnight TS/TSX through vm. Like every Midnight harness, `motion/react`
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
  return (relative) => load(resolve(midnightRoot, relative));
}

/** Records observed elements and options; `trigger()` reports them all. */
class FakeIntersectionObserver {
  static instances = [];
  constructor(callback, options) { this.callback = callback; this.options = options; this.elements = []; FakeIntersectionObserver.instances.push(this); }
  observe(element) { this.elements.push(element); }
  disconnect() { this.elements = []; }
  trigger(isIntersecting = true) { this.callback(this.elements.map((target) => ({ target, isIntersecting }))); }
}

async function mount(element, { intersectionObserver } = {}) {
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
    id: "midnight", type: "wedding", slug: "midnight", title: "Nadia & Arka", status: "published",
    eventDate: "2030-02-14", venueSummary: "Atelier Hall", publishedAt: "2030-01-01T00:00:00Z", expiresAt: null,
    timeZone: "Asia/Jakarta",
    theme: { slug: "midnight-atelier", settings: {} },
    people: [
      { id: "b", role: "bride", fullName: "Nadia Rahmani", nickname: "Nadia", fatherName: null, motherName: null, photoUrl: null, bio: null, sortOrder: 0 },
      { id: "g", role: "groom", fullName: "Arka Pradipta", nickname: "Arka", fatherName: null, motherName: null, photoUrl: null, bio: null, sortOrder: 1 },
    ],
    events: [{ id: "event", eventType: "Resepsi", title: "Resepsi", eventDate: "2030-02-14",
      startTime: "19:00:00", endTime: "22:00:00", venueName: "Atelier Hall", address: null,
      mapsUrl: null, livestreamUrl: null, sortOrder: 0 }],
    stories: [{ id: "s", title: "Pertemuan", storyDate: null, yearLabel: "2021", description: "Di galeri malam.", imageUrl: null, sortOrder: 0 }],
    gallery: [
      { id: "g1", imageUrl: "/a.jpg", caption: "Malam pertama", altText: null, aspectRatio: "portrait_4_5", sortOrder: 0 },
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

const tokens = () => createLoader()("tokens").MIDNIGHT_ATELIER_TOKENS.colors;

/** Declaration bodies of every rule whose selector ends with `selector`. */
function rules(sheet, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return [...sheet.matchAll(new RegExp(`(?:^|[}\\s])${escaped}\\s*\\{([^}]*)\\}`, "g"))].map((match) => match[1]);
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

/** `fg` laid over `bg` at `alpha` (opacity or an rgba wash), as a hex colour. */
function mix(fg, bg, alpha) {
  return `#${[1, 3, 5].map((i) => Math.round(parseInt(fg.slice(i, i + 2), 16) * alpha + parseInt(bg.slice(i, i + 2), 16) * (1 - alpha))
    .toString(16).padStart(2, "0")).join("")}`;
}

/** Reads `--name: rgba(r, g, b, a)` from the stylesheet as `{ hex, alpha }`. */
function rgba(sheet, name) {
  const match = sheet.match(new RegExp(`${name}:\\s*rgba\\((\\d+),\\s*(\\d+),\\s*(\\d+),\\s*([\\d.]+)\\)`));
  assert.ok(match, `${name} is an rgba token`);
  const hex = `#${match.slice(1, 4).map((v) => Number(v).toString(16).padStart(2, "0")).join("")}`;
  return { hex, alpha: Number(match[4]) };
}

test("the Malam di Ballroom palette keeps every text pair at WCAG AA", () => {
  const c = tokens();
  assert.deepEqual(
    [c.ink, c.oxblood, c.champagne, c.pearl, c.smoke],
    ["#14121A", "#5E1A22", "#D8C08A", "#EDE6DA", "#6E6873"],
  );
  for (const [fg, bg, min] of [
    ["pearl", "ink", 7], ["pearl", "lacquer", 7], ["pearl", "oxblood", 7],
    ["champagne", "ink", 4.5], ["champagne", "lacquer", 4.5], ["champagne", "oxblood", 4.5],
    ["smokeInk", "ink", 4.5], ["smokeInk", "lacquer", 4.5], ["smokeInk", "oxblood", 4.5],
    ["ink", "pearl", 7], ["oxblood", "pearl", 4.5], ["ink", "champagne", 4.5],
  ]) {
    assert.ok(contrast(c[fg], c[bg]) >= min, `${fg} on ${bg} is ${contrast(c[fg], c[bg]).toFixed(2)}`);
  }
  const sheet = css();
  assert.match(sheet, /--ma-smoke-ink:\s*#A9A2AD/i);
  assert.doesNotMatch(sheet, /[{;\s]color:\s*(?:color-mix\(in srgb,\s*)?var\(--ma-smoke\)/, "asap (≈3.4:1) never colours small text");
});

test("text stays AA under the spotlight wash and a resting heading stays at least 3:1", () => {
  const c = tokens();
  const sheet = css();
  const dim = Number(sheet.match(/--ma-dim:\s*([\d.]+)/)?.[1]);
  assert.ok(dim > 0 && dim < 1, "--ma-dim is an opacity");
  for (const [fg, bg] of [["pearl", "ink"], ["pearl", "lacquer"], ["pearl", "oxblood"], ["ink", "pearl"]]) {
    const ratio = contrast(mix(c[fg], c[bg], dim), c[bg]);
    assert.ok(ratio >= 3, `dim ${fg} heading on ${bg} is ${ratio.toFixed(2)}`);
  }
  const light = rgba(sheet, "--ma-light");
  for (const [fg, bg] of [
    ["pearl", "ink"], ["pearl", "lacquer"], ["pearl", "oxblood"], ["ink", "pearl"], ["oxblood", "pearl"],
    ["champagne", "ink"], ["champagne", "lacquer"], ["champagne", "oxblood"], ["smokeInk", "ink"], ["smokeInk", "lacquer"],
  ]) {
    const ratio = contrast(c[fg], mix(light.hex, c[bg], light.alpha));
    assert.ok(ratio >= 4.5, `${fg} on lit ${bg} is ${ratio.toFixed(2)}`);
  }
  assert.ok(rgba(sheet, "--ma-light-strong").alpha > light.alpha, "picture lights are stronger than the heading wash");
});
```

In `tests/theme-contract.test.mjs` change the Midnight expectation to:

```js
    "midnight-atelier": { name: "Midnight Atelier", palette: ["#14121A", "#5E1A22", "#D8C08A"] },
```

In `tests/midnight-atelier-foundation.test.mjs` (test "Midnight base styles encode the approved palette…") replace

```js
  for (const color of ["#09090B", "#171216", "#541E2B", "#C6A15B", "#F3EEE6", "#AAA3A4"]) {
```

with

```js
  for (const color of ["#14121A", "#1E1A24", "#5E1A22", "#D8C08A", "#EDE6DA", "#6E6873", "#A9A2AD"]) {
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/midnight-atelier-identity.test.mjs tests/theme-contract.test.mjs tests/midnight-atelier-foundation.test.mjs`
Expected: FAIL — old palette values, no `smokeInk`/`--ma-smoke-ink`, no `--ma-dim`/`--ma-light`, registry mismatch.

- [ ] **Step 3: Re-point the palette**

Replace `src/themes/midnight-atelier/tokens.ts` with:

```ts
export const MIDNIGHT_ATELIER_TOKENS = {
  slug: "midnight-atelier",
  colors: {
    /** Tinta — the ballroom at night; primary ground. */
    ink: "#14121A",
    /** Tinta lifted one step for layered surfaces. */
    lacquer: "#1E1A24",
    oxblood: "#5E1A22",
    champagne: "#D8C08A",
    /** Mutiara — text on dark and the reading surface. */
    pearl: "#EDE6DA",
    /** Asap — rules and borders only (≈3.4:1 on tinta). */
    smoke: "#6E6873",
    /** Asap lifted for small secondary text; AA on every dark surface. */
    smokeInk: "#A9A2AD",
  },
} as const;
```

In `ThemeStyles.tsx`, inside `.ma-theme { … }` directly after `--ma-smoke: ${colors.smoke};` add:

```css
        --ma-smoke-ink: ${colors.smokeInk};
        /* Light, used sparingly: the heading spotlight and picture lights. */
        --ma-light: rgba(216, 192, 138, .16);
        --ma-light-strong: rgba(216, 192, 138, .32);
        /* Resting opacity of a heading before its spotlight comes up. */
        --ma-dim: .55;
```

- [ ] **Step 4: Move small text off raw asap**

In `ThemeStyles.tsx`:
- Replace every `color: var(--ma-smoke);` with `color: var(--ma-smoke-ink);` (15 occurrences; replace-all).
- Replace `.ma-form-control::placeholder { color: color-mix(in srgb, var(--ma-smoke) 72%, transparent); opacity: 1; }` with `.ma-form-control::placeholder { color: var(--ma-smoke-ink); opacity: 1; }`.
- In `.ma-image-fallback` replace `border: 1px solid color-mix(in srgb, var(--ma-champagne) 50%, transparent);` with `border: 1px solid var(--ma-smoke);` (asap keeps a job as a hairline).

- [ ] **Step 5: Registry swatch**

In `src/themes/registry.ts` set the Midnight preview palette to:

```ts
      palette: ["#14121A", "#5E1A22", "#D8C08A"],
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `node --test tests/midnight-atelier-identity.test.mjs tests/theme-contract.test.mjs tests/midnight-atelier-foundation.test.mjs`
Expected: PASS. Then `npm test` — all pass except the known environmental countdown-timezone test.

- [ ] **Step 7: Commit**

```bash
git add src/themes/midnight-atelier/tokens.ts src/themes/midnight-atelier/ThemeStyles.tsx src/themes/registry.ts tests/theme-contract.test.mjs tests/midnight-atelier-foundation.test.mjs tests/midnight-atelier-identity.test.mjs
git commit -m "feat(midnight): ballroom palette and spotlight light tokens

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_011pT7SiXwq9HVRhaYt6ogn3"
```

---

### Task 3: Imperial Script couple names

**Files:**
- Modify: `src/themes/midnight-atelier/CoverGate.tsx` (h1 class)
- Modify: `src/themes/midnight-atelier/sections/HeroSection.tsx`, `CoupleSection.tsx`, `ClosingSection.tsx`
- Modify: `src/themes/midnight-atelier/ThemeStyles.tsx` (name sizes; drop `ch` caps on names)
- Test: `tests/midnight-atelier-identity.test.mjs`

**Interfaces:**
- Consumes: `.ma-script`, `--ma-display` (Task 1); `createLoader`, `invitation`, `css`, `rules` (Task 2).

- [ ] **Step 1: Write the failing test**

Append to `tests/midnight-atelier-identity.test.mjs`:

```js
test("couple names are Imperial Script signatures and chapter titles stay Bodoni italic", () => {
  const { MidnightAtelier } = createLoader()("index");
  const { document } = new JSDOM(renderToStaticMarkup(React.createElement(MidnightAtelier, { invitation: invitation(), guest: null }))).window;
  const cover = document.querySelector("#ma-cover h1");
  assert.ok(cover.classList.contains("ma-script"));
  assert.match(cover.textContent, /Nadia.*Arka/s);
  for (const id of ["ma-hero-heading", "ma-closing-heading"]) {
    assert.ok(document.getElementById(id).classList.contains("ma-script"), `${id} is script`);
  }
  const people = [...document.querySelectorAll(".ma-person-copy h3")];
  assert.equal(people.length, 2);
  for (const name of people) assert.ok(name.classList.contains("ma-script"));
  for (const title of document.querySelectorAll(".ma-chapter-heading h2, .ma-interaction-heading h2, .ma-countdown-intro h2")) {
    assert.ok(!title.classList.contains("ma-script"), `chapter "${title.textContent}" stays Bodoni`);
  }

  const sheet = css();
  for (const selector of [".ma-hero-copy h2", ".ma-person-copy h3", ".ma-closing-copy h2", ".ma-cover-names"]) {
    for (const body of rules(sheet, selector)) {
      assert.doesNotMatch(body, /max-width:\s*[\d.]+ch/, `${selector} is a name: never capped by a ch measure`);
      assert.doesNotMatch(body, /letter-spacing:\s*-/, `${selector}: script needs no negative tracking`);
    }
  }
  assert.match(sheet, /\.ma-cover-amp\s*\{[^}]*font-family:\s*var\(--ma-display\)/, "the ampersand stays a Bodoni italic accent");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test --test-name-pattern="Imperial Script signatures" tests/midnight-atelier-identity.test.mjs`
Expected: FAIL — cover h1 lacks `ma-script`.

- [ ] **Step 3: Apply the script class**

`CoverGate.tsx`: `<h1 className="ma-cover-names ma-script">`.

`HeroSection.tsx`: `<h2 id="ma-hero-heading" className="ma-script">{displayName}</h2>`.

`ClosingSection.tsx`: `<h2 id="ma-closing-heading" className="ma-script">{displayName}</h2>`.

`CoupleSection.tsx`: `<h3 className="ma-script">{person.fullName}</h3>`.

- [ ] **Step 4: Name sizes, no `ch` caps**

In `ThemeStyles.tsx` (after Task 1 the family lines read `var(--ma-display)`):

In `.ma-cover-names { … }` replace

```css
        font-family: var(--ma-display);
        font-size: clamp(4rem, 15vw, 10rem);
        font-weight: 500;
        letter-spacing: -.055em;
        line-height: .76;
```

with

```css
        font-size: clamp(4.25rem, 17vw, 10.5rem);
        line-height: 1.02;
```

In `.ma-cover-amp { … }` add `font-family: var(--ma-display);` as the first declaration.

Replace the `.ma-hero-copy h2 { … }` rule with:

```css
      .ma-hero-copy h2 {
        margin: 0;
        font-size: clamp(3.8rem, 15vw, 10rem);
        line-height: 1.05;
        overflow-wrap: anywhere;
        text-wrap: balance;
      }
```

Replace the `.ma-person-copy h3 { … }` rule with:

```css
      .ma-person-copy h3 {
        margin: 0;
        font-size: clamp(2.9rem, 9vw, 5.25rem);
        line-height: 1.1;
        text-wrap: balance;
      }
```

Replace the `.ma-closing-copy h2 { … }` rule with:

```css
      .ma-closing-copy h2 {
        margin: clamp(2rem, 6vw, 4rem) 0 0;
        font-size: clamp(3.6rem, 12vw, 8.5rem);
        line-height: 1.05;
        text-wrap: balance;
      }
```

In `@media (max-width: 767px)` replace `.ma-cover-names { font-size: clamp(3.5rem, 20vw, 6.25rem); }` with `.ma-cover-names { font-size: clamp(3.75rem, 19vw, 6.5rem); }`.

In `@media (min-width: 768px)` replace `.ma-hero:not(.ma-hero-text-only) .ma-hero-copy h2 { font-size: clamp(3.6rem, 7vw, 8.5rem); }` with `.ma-hero:not(.ma-hero-text-only) .ma-hero-copy h2 { font-size: clamp(3.8rem, 7.5vw, 8.5rem); }`.

- [ ] **Step 5: Run tests to verify they pass**

Run: `node --test tests/midnight-atelier-identity.test.mjs tests/midnight-atelier-narrative.test.mjs tests/midnight-atelier-shell.test.mjs tests/midnight-atelier-foundation.test.mjs`
Expected: PASS (hero 3:4 and title-first tests untouched; long-name test still finds the full `h3` text).

- [ ] **Step 6: Commit**

```bash
git add src/themes/midnight-atelier/CoverGate.tsx src/themes/midnight-atelier/sections/HeroSection.tsx src/themes/midnight-atelier/sections/CoupleSection.tsx src/themes/midnight-atelier/sections/ClosingSection.tsx src/themes/midnight-atelier/ThemeStyles.tsx tests/midnight-atelier-identity.test.mjs
git commit -m "feat(midnight): Imperial Script couple names

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_011pT7SiXwq9HVRhaYt6ogn3"
```

---

### Task 4: Champagne-toast opener

**Files:**
- Create: `src/themes/midnight-atelier/components/ChampagneToast.tsx`
- Modify: `src/themes/midnight-atelier/CoverGate.tsx`
- Modify: `src/themes/midnight-atelier/ThemeStyles.tsx`
- Modify: `tests/midnight-atelier-shell.test.mjs` (deliberate update: two tests pin the curtain panels/seam and the curtain `translateX`)
- Test: `tests/midnight-atelier-identity.test.mjs`

**Interfaces:**
- Consumes: tokens `--ma-champagne`; `createLoader({ reducedMotion, actions })`, `mount`, `invitation`, `css` (Task 2).
- Produces: `ChampagneToast()` → `<svg class="ma-toast" aria-hidden="true">` with `.ma-toast-ring`, `g.ma-flute.ma-flute-left`, `g.ma-flute.ma-flute-right` (each: bowl, `.ma-flute-wine`, stem, foot) and 8 `.ma-toast-bubble` — 18 descendants. Pure SVG, no hooks (server-safe).

- [ ] **Step 1: Write the failing tests**

Append to `tests/midnight-atelier-identity.test.mjs`:

```js
test("the cover toasts with two champagne flutes and still opens on the first tap", async () => {
  const { MidnightAtelier } = createLoader()("index");
  const { document } = new JSDOM(renderToStaticMarkup(React.createElement(MidnightAtelier, { invitation: invitation(), guest: null }))).window;
  assert.equal(document.querySelector(".ma-curtain"), null, "the curtain seam is retired");
  const toast = document.querySelector("#ma-cover .ma-cover-stage svg.ma-toast");
  assert.ok(toast, "the flutes stand on the cover stage");
  assert.equal(toast.getAttribute("aria-hidden"), "true");
  assert.ok(document.querySelector("#ma-cover h1").compareDocumentPosition(toast) & 4, "the names sit above the flutes");
  assert.equal(toast.querySelectorAll(".ma-flute").length, 2);
  assert.ok(toast.querySelector(".ma-flute-left") && toast.querySelector(".ma-flute-right"));
  assert.equal(toast.querySelectorAll(".ma-toast-ring").length, 1);
  assert.ok(toast.querySelectorAll(".ma-toast-bubble").length >= 6);
  assert.ok(toast.querySelectorAll("*").length <= 20, `${toast.querySelectorAll("*").length} nodes`);
  const open = document.querySelector("#ma-cover button");
  assert.equal(open.className, "ma-cover-open");
  assert.match(open.textContent, /Buka undangan/);
  assert.equal(open.getAttribute("aria-controls"), "ma-content");

  const calls = [];
  const load = createLoader({ actions: { trackCoverOpened: async (...args) => { calls.push(args); } } });
  const withMusic = invitation({
    features: { ...invitation().features, music: true },
    media: { coverImageUrl: null, musicUrl: "/music.mp3" },
  });
  const view = await mount(React.createElement(load("index").MidnightAtelier, { invitation: withMusic, guest: null }));
  try {
    let plays = 0;
    view.document.querySelector("audio").play = async () => { plays += 1; };
    await act(async () => view.document.querySelector(".ma-cover-open").click());
    assert.equal(plays, 1, "music starts in the same tap");
    assert.deepEqual(calls, [["midnight", null]]);
    assert.equal(view.document.getElementById("ma-content").hidden, false);
    assert.equal(view.document.getElementById("ma-cover").hasAttribute("inert"), true, "the cover stops taking taps at once");
  } finally { await view.cleanup(); }

  const sheet = css();
  assert.match(sheet, /\[data-opened="true"\] \.ma-flute-left\s*\{[^}]*animation:/);
  assert.match(sheet, /\[data-opened="true"\] \.ma-toast-ring\s*\{[^}]*animation:/);
  assert.match(sheet, /\[data-opened="true"\] \.ma-cover\s*\{[^}]*transition:[^}]*opacity[^}]*1000ms/, "the cover lingers for the toast, then fades");
  assert.match(sheet, /data-reduced-motion="true"\] :is\([^)]*\.ma-flute[^)]*\)\s*\{[^}]*animation:\s*none/);
  assert.doesNotMatch(sheet, /ma-curtain/);
});

test("the toast cover hydrates without mismatch when the browser prefers reduced motion", async () => {
  const { MidnightAtelier } = createLoader({ reducedMotion: true })("index");
  const element = React.createElement(MidnightAtelier, {
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
    assert.ok(container.querySelector("svg.ma-toast"));
  } finally {
    console.error = originalError;
    if (root) await act(async () => root.unmount());
    await view.cleanup();
  }
});
```

In `tests/midnight-atelier-shell.test.mjs`:

Rename the test `"photo-free couture cover renders personalized programme data and curtain structure"` to `"photo-free couture cover renders personalized programme data and the champagne toast"` and replace

```js
  assert.equal(document.querySelectorAll(".ma-curtain-panel").length, 2);
  assert.ok(document.querySelector(".ma-curtain-seam"));
```

with

```js
  assert.equal(document.querySelectorAll("#ma-cover .ma-flute").length, 2);
  assert.ok(document.querySelector("#ma-cover .ma-toast-ring"));
```

Rename the test `"shell CSS defines distinct mobile and desktop navigation with a reduced-motion curtain path"` to `"shell CSS defines distinct mobile and desktop navigation with a reduced-motion opener path"` and replace

```js
  assert.match(css, /\.ma-curtain-seam/);
  assert.match(css, /data-opened="true"[^}]*\.ma-curtain-left[^{]*\{[^}]*translateX\(-10[01]%\)/s);
```

with

```js
  assert.match(css, /data-opened="true"\] \.ma-flute-left\s*\{[^}]*animation:/);
  assert.match(css, /data-reduced-motion="true"\][^{]*\.ma-flute/);
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test --test-name-pattern="toast" tests/midnight-atelier-identity.test.mjs tests/midnight-atelier-shell.test.mjs`
Expected: FAIL — `.ma-curtain` still present, no `svg.ma-toast`.

- [ ] **Step 3: Write the component**

Create `src/themes/midnight-atelier/components/ChampagneToast.tsx`:

```tsx
import type { CSSProperties } from "react";

// Deterministic spread (no Math.random) so server and client markup match.
const BUBBLES = [
  { cx: 78, r: 1.6, dx: -10, dy: -46, delay: 0.5 },
  { cx: 82, r: 1.2, dx: 8, dy: -58, delay: 0.56 },
  { cx: 80, r: 2, dx: -2, dy: -70, delay: 0.62 },
  { cx: 76, r: 1, dx: -18, dy: -38, delay: 0.66 },
  { cx: 84, r: 1.4, dx: 16, dy: -50, delay: 0.7 },
  { cx: 79, r: 1.1, dx: -6, dy: -82, delay: 0.76 },
  { cx: 81, r: 1.7, dx: 4, dy: -64, delay: 0.8 },
  { cx: 83, r: 1, dx: 12, dy: -76, delay: 0.86 },
] as const;

/**
 * Two champagne flutes under the couple's names. When the cover opens
 * (`.ma-gate[data-opened="true"]`) CSS tilts them together to clink, pulses
 * a ring of light at the rims and lets bubbles rise. Decorative only.
 */
export function ChampagneToast() {
  return (
    <svg className="ma-toast" viewBox="0 0 160 120" fill="none" aria-hidden="true" focusable="false">
      <circle className="ma-toast-ring" cx="80" cy="14" r="10" />
      <g className="ma-flute ma-flute-left">
        <path d="M56 14h16l-1.6 38c-.4 6-3.4 9-6.4 9s-6-3-6.4-9Z" />
        <path className="ma-flute-wine" d="M57.6 30h12.8l-.9 21c-.3 4.6-2.6 7-5.5 7s-5.2-2.4-5.5-7Z" />
        <path d="M64 61v46" />
        <path d="M55 108h18" />
      </g>
      <g className="ma-flute ma-flute-right">
        <path d="M88 14h16l-1.6 38c-.4 6-3.4 9-6.4 9s-6-3-6.4-9Z" />
        <path className="ma-flute-wine" d="M89.6 30h12.8l-.9 21c-.3 4.6-2.6 7-5.5 7s-5.2-2.4-5.5-7Z" />
        <path d="M96 61v46" />
        <path d="M87 108h18" />
      </g>
      {BUBBLES.map((bubble) => (
        <circle
          key={`${bubble.cx}-${bubble.dy}`}
          className="ma-toast-bubble"
          cx={bubble.cx}
          cy="12"
          r={bubble.r}
          style={{ "--ma-dx": `${bubble.dx}px`, "--ma-dy": `${bubble.dy}px`, animationDelay: `${bubble.delay}s` } as CSSProperties}
        />
      ))}
    </svg>
  );
}
```

- [ ] **Step 4: Replace the curtain with the toast**

In `CoverGate.tsx`:
- Replace `import { AtelierMark } from "./components/AtelierMark";` with `import { ChampagneToast } from "./components/ChampagneToast";`.
- Delete the whole `<div className="ma-curtain" aria-hidden="true"> … </div>` block (panels and seam).
- After the `{dateLabel ? <time … /> : null}` line inside `.ma-cover-stage` add `<ChampagneToast />`.

- [ ] **Step 5: Toast and cover timing CSS**

In `ThemeStyles.tsx`:

In `.ma-cover { … }` delete the line `transition: visibility 0s linear .95s;`.

Delete the six curtain rules `.ma-curtain`, `.ma-curtain-panel`, `.ma-curtain-left`, `.ma-curtain-right`, `.ma-curtain-seam`, `.ma-curtain-seam .ma-mark`.

Replace

```css
      .ma-gate[data-opened="true"] .ma-cover { visibility: hidden; pointer-events: none; }
      .ma-gate[data-opened="true"] .ma-curtain-left { transform: translateX(-101%); }
      .ma-gate[data-opened="true"] .ma-curtain-right { transform: translateX(101%); }
      .ma-gate[data-opened="true"] .ma-curtain-seam { opacity: 0; transition-delay: 0s; }
      .ma-gate[data-opened="true"] .ma-cover-frame { opacity: 0; transform: scale(.985); }
```

with

```css
      /* Champagne toast: the flutes clink (~.55s), a ring of light pulses and
         bubbles rise; the cover then fades (1000ms + 400ms). It is inert and
         stops taking taps the moment it opens. */
      .ma-gate[data-opened="true"] .ma-cover {
        opacity: 0; visibility: hidden; pointer-events: none;
        transition: opacity 400ms ease 1000ms, visibility 0s 1400ms;
      }
      .ma-gate[data-opened="true"] :is(.ma-cover-masthead, .ma-cover-recipient) { opacity: 0; transition: opacity .3s ease; }
      .ma-gate[data-opened="true"] .ma-cover-names { transform: translateY(-6px); transition: transform .8s cubic-bezier(.22, .61, .36, 1) .2s; }
      .ma-toast { display: block; width: clamp(120px, 34vw, 180px); height: auto; margin: clamp(1.5rem, 5vw, 2.5rem) auto 0; overflow: visible; color: var(--ma-champagne); }
      .ma-toast .ma-flute path { stroke: currentColor; stroke-width: 1.2; }
      .ma-toast .ma-flute .ma-flute-wine { fill: rgba(216, 192, 138, .35); stroke: none; }
      .ma-flute { transform-box: view-box; }
      .ma-flute-left { transform-origin: 64px 108px; }
      .ma-flute-right { transform-origin: 96px 108px; }
      .ma-toast-ring { stroke: var(--ma-champagne); stroke-width: 1; opacity: 0; transform-box: fill-box; transform-origin: center; }
      .ma-toast-bubble { fill: var(--ma-champagne); opacity: 0; transform-box: fill-box; }
      .ma-gate[data-opened="true"] .ma-flute-left { animation: ma-clink-left .55s cubic-bezier(.3, 0, .2, 1) forwards; }
      .ma-gate[data-opened="true"] .ma-flute-right { animation: ma-clink-right .55s cubic-bezier(.3, 0, .2, 1) forwards; }
      .ma-gate[data-opened="true"] .ma-toast-ring { animation: ma-ring .6s ease-out .45s forwards; }
      .ma-gate[data-opened="true"] .ma-toast-bubble { animation: ma-bubble 1s ease-out forwards; }
      @keyframes ma-clink-left { 60% { transform: rotate(6deg); } 80% { transform: rotate(4.5deg); } 100% { transform: rotate(5deg); } }
      @keyframes ma-clink-right { 60% { transform: rotate(-6deg); } 80% { transform: rotate(-4.5deg); } 100% { transform: rotate(-5deg); } }
      @keyframes ma-ring { from { opacity: .9; transform: scale(.4); } to { opacity: 0; transform: scale(2.4); } }
      @keyframes ma-bubble { 0% { opacity: 0; transform: translate(0, 0); } 20% { opacity: .9; } 100% { opacity: 0; transform: translate(var(--ma-dx), var(--ma-dy)); } }
```

(Rim geometry: rotating each flute 5° about its foot brings the rim corners together at x = 80, where the ring sits.)

Replace

```css
      .ma-gate[data-reduced-motion="true"] .ma-cover,
      .ma-gate[data-reduced-motion="true"] .ma-curtain-panel,
      .ma-gate[data-reduced-motion="true"] .ma-curtain-seam,
      .ma-gate[data-reduced-motion="true"] .ma-cover-frame { transition: none; }
```

with

```css
      .ma-gate[data-reduced-motion="true"] :is(.ma-cover, .ma-cover-frame, .ma-cover-masthead, .ma-cover-recipient, .ma-cover-names) { transition: none; }
      .ma-gate[data-reduced-motion="true"] :is(.ma-flute, .ma-toast-ring, .ma-toast-bubble) { animation: none; }
```

(The existing `@media (prefers-reduced-motion: reduce)` block already removes every animation and transition, so a reduced-motion cover hides at once regardless of the attribute.)

- [ ] **Step 6: Run tests to verify they pass**

Run: `node --test tests/midnight-atelier-identity.test.mjs tests/midnight-atelier-shell.test.mjs tests/midnight-atelier-quality.test.mjs tests/midnight-atelier-foundation.test.mjs tests/invitation-time-zone.test.mjs`
Expected: PASS (shell still opens, tracks once, focuses content, keeps music controls; quality still finds `.ma-cover-open` min-height 52px).

- [ ] **Step 7: Commit**

```bash
git add src/themes/midnight-atelier/components/ChampagneToast.tsx src/themes/midnight-atelier/CoverGate.tsx src/themes/midnight-atelier/ThemeStyles.tsx tests/midnight-atelier-shell.test.mjs tests/midnight-atelier-identity.test.mjs
git commit -m "feat(midnight): champagne-toast opener replaces the curtain cover

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_011pT7SiXwq9HVRhaYt6ogn3"
```

---

### Task 5: Spotlight headings

**Files:**
- Create: `src/themes/midnight-atelier/components/Spotlight.tsx`
- Modify: `src/themes/midnight-atelier/sections/{CoupleSection,EventsSection,CountdownSection,DressCodeSection,StorySection,GallerySection,LivestreamSection,RsvpSection,WishesSection,GiftSection}.tsx`
- Modify: `src/themes/midnight-atelier/ThemeStyles.tsx`
- Modify: `tests/midnight-atelier-{foundation,shell,guest-interactions,narrative,programme,story-gallery}.test.mjs` (deliberate update: each forbids any `radial-gradient`; the spec now allows radial light, which the identity test confines to the two light rules)
- Test: `tests/midnight-atelier-identity.test.mjs`

**Interfaces:**
- Consumes: `useInViewOnce(ref, rootMargin)` (shared); `--ma-light`, `--ma-dim` (Task 2); `createLoader`, `mount`, `FakeIntersectionObserver`, `invitation`, `css` (Task 2).
- Produces: `Spotlight({ className, children })` → `<header class="ma-spotlight {className}" data-spot="waiting" | "lit">` (attribute absent until the observer reports; rootMargin `"0px 0px -40% 0px"`).

- [ ] **Step 1: Write the failing tests**

Append to `tests/midnight-atelier-identity.test.mjs`:

```js
test("chapter headings rest dim and a stage spotlight lights them once in view", async () => {
  const load = createLoader();
  const { MidnightAtelier } = load("index");
  const { document } = new JSDOM(renderToStaticMarkup(React.createElement(MidnightAtelier, { invitation: invitation(), guest: null }))).window;
  const headings = [...document.querySelectorAll("#ma-content section h2")].filter((heading) => !heading.classList.contains("ma-script"));
  assert.ok(headings.length >= 6, `${headings.length} chapter headings`);
  for (const heading of headings) {
    const spot = heading.closest(".ma-spotlight");
    assert.ok(spot, `"${heading.textContent}" stands in a spotlight`);
    assert.equal(spot.hasAttribute("data-spot"), false, "server markup is lit and unarmed");
  }

  const { EventsSection } = load("sections/EventsSection");
  const props = { events: invitation().events, mapsEnabled: false, timeZone: "Asia/Jakarta" };
  FakeIntersectionObserver.instances = [];
  const view = await mount(React.createElement(EventsSection, props), { intersectionObserver: FakeIntersectionObserver });
  try {
    const spot = view.document.querySelector("#ma-acara .ma-spotlight");
    assert.equal(spot.hasAttribute("data-spot"), false, "nothing dims before the observer reports");
    assert.equal(FakeIntersectionObserver.instances[0].options.rootMargin, "0px 0px -40% 0px");
    await act(async () => FakeIntersectionObserver.instances.forEach((observer) => observer.trigger(false)));
    assert.equal(spot.dataset.spot, "waiting");
    await act(async () => FakeIntersectionObserver.instances.forEach((observer) => observer.trigger(true)));
    assert.equal(spot.dataset.spot, "lit");
    assert.equal(spot.querySelector("h2").textContent, "Rangkaian acara");
  } finally { await view.cleanup(); }

  const sheet = css();
  assert.match(sheet, /\.ma-spotlight\[data-spot="waiting"\] h2\s*\{[^}]*opacity:\s*var\(--ma-dim\)/);
  assert.match(sheet, /\.ma-spotlight::before\s*\{[^}]*radial-gradient\([^)]*var\(--ma-light\)/);
  assert.match(sheet, /prefers-reduced-motion: reduce\)[\s\S]*\.ma-spotlight\[data-spot\] h2[^{]*\{\s*opacity:\s*1 !important/);
});

test("radial light appears only in the spotlight and picture lights, never as a page gradient", () => {
  const sheet = css();
  assert.doesNotMatch(sheet, /linear-gradient|conic-gradient/);
  const owners = [...sheet.matchAll(/([^{}]+)\{[^{}]*radial-gradient\(/g)].map(([, selector]) => selector.trim());
  assert.ok(owners.length >= 1);
  for (const selector of owners) assert.match(selector, /^\.ma-(spotlight|gallery-item)::(before|after)$/, selector);
});
```

In each of `tests/midnight-atelier-foundation.test.mjs`, `-shell.test.mjs`, `-guest-interactions.test.mjs`, `-narrative.test.mjs`, `-programme.test.mjs`, `-story-gallery.test.mjs` replace

```js
  assert.doesNotMatch(css, /linear-gradient|radial-gradient/);
```

with

```js
  assert.doesNotMatch(css, /linear-gradient|conic-gradient/); // radial light is confined by midnight-atelier-identity
```

(one line per file; `sed -i 's#assert.doesNotMatch(css, /linear-gradient|radial-gradient/);#assert.doesNotMatch(css, /linear-gradient|conic-gradient/); // radial light is confined by midnight-atelier-identity#' tests/midnight-atelier-*.test.mjs` does all six.)

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test --test-name-pattern="spotlight|radial light" tests/midnight-atelier-identity.test.mjs`
Expected: FAIL — no `.ma-spotlight` wrapper; no radial-gradient owners.

- [ ] **Step 3: Write the component**

Create `src/themes/midnight-atelier/components/Spotlight.tsx`:

```tsx
"use client";

import { useRef, type ReactNode } from "react";

import { useInViewOnce } from "@/themes/shared/use-in-view-once";

/**
 * A chapter heading on the ballroom stage. Once the observer reports it below
 * the upper stage it rests dim; a warm spotlight comes up as it scrolls into
 * that band. Server markup and the first client render carry no state, so the
 * heading is fully lit wherever the effect cannot run.
 */
export function Spotlight({ className, children }: { className: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const { watching, seen } = useInViewOnce(ref, "0px 0px -40% 0px");

  return (
    <header
      ref={ref}
      className={`ma-spotlight ${className}`}
      data-spot={seen ? "lit" : watching ? "waiting" : undefined}
    >
      {children}
    </header>
  );
}
```

- [ ] **Step 4: Put every chapter heading in a spotlight**

In each file import `{ Spotlight } from "../components/Spotlight"` and swap the heading wrapper (children unchanged):

| File | From | To |
|---|---|---|
| `CoupleSection.tsx`, `DressCodeSection.tsx`, `StorySection.tsx` | `<header className="ma-chapter-heading">…</header>` | `<Spotlight className="ma-chapter-heading">…</Spotlight>` |
| `EventsSection.tsx`, `GallerySection.tsx` | `<header className="ma-chapter-heading ma-chapter-heading-dark">…</header>` | `<Spotlight className="ma-chapter-heading ma-chapter-heading-dark">…</Spotlight>` |
| `CountdownSection.tsx` | `<div className="ma-countdown-intro">…</div>` | `<Spotlight className="ma-countdown-intro">…</Spotlight>` |
| `LivestreamSection.tsx` | `<div className="ma-livestream-copy">…</div>` | `<Spotlight className="ma-livestream-copy">…</Spotlight>` |
| `RsvpSection.tsx`, `WishesSection.tsx`, `GiftSection.tsx` | `<header className="ma-interaction-heading">…</header>` | `<Spotlight className="ma-interaction-heading">…</Spotlight>` |

(Countdown and livestream intros become `<header>` elements; every class-based selector still matches.)

- [ ] **Step 5: Spotlight CSS**

In `ThemeStyles.tsx` add before the `@media (max-width: 767px)` block:

```css
      /* Stage spotlight: chapter headings rest dim, then a warm light comes up
         once they reach the upper stage. Only opacity animates. */
      .ma-spotlight { position: relative; isolation: isolate; }
      .ma-spotlight::before { content: ""; position: absolute; z-index: -1; inset: -2.5rem 0 -1rem; background: radial-gradient(ellipse 70% 80% at 25% 35%, var(--ma-light), transparent 70%); pointer-events: none; }
      .ma-spotlight[data-spot="waiting"]::before { opacity: 0; }
      .ma-spotlight[data-spot="waiting"] h2 { opacity: var(--ma-dim); }
      .ma-spotlight[data-spot="lit"]::before { animation: ma-spot-on 1.1s ease-out both; }
      .ma-spotlight[data-spot="lit"] h2 { transition: opacity .9s ease; }
      @keyframes ma-spot-on { from { opacity: 0; } }
```

and inside the existing `@media (prefers-reduced-motion: reduce) { … }` block add:

```css
        .ma-spotlight[data-spot] h2, .ma-spotlight[data-spot]::before { opacity: 1 !important; }
```

(Only the large `h2` dims; eyebrows and lead text keep full contrast. The inset keeps the glow inside the column so it never widens the page.)

- [ ] **Step 6: Run tests to verify they pass**

Run: `node --test tests/midnight-atelier-identity.test.mjs tests/midnight-atelier-*.test.mjs tests/gallery-gift-parity.test.mjs tests/theme-countdown-calendar-parity.test.mjs tests/invitation-time-zone.test.mjs`
Expected: PASS (harness observers never report, so nothing dims; the programme test still finds "Simpan tanggalnya" as the countdown `h2`).

- [ ] **Step 7: Commit**

```bash
git add src/themes/midnight-atelier/components/Spotlight.tsx src/themes/midnight-atelier/sections src/themes/midnight-atelier/ThemeStyles.tsx tests/midnight-atelier-*.test.mjs
git commit -m "feat(midnight): stage spotlight on chapter headings

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_011pT7SiXwq9HVRhaYt6ogn3"
```

---

### Task 6: Dance card after an attending RSVP

**Files:**
- Create: `src/themes/midnight-atelier/components/DanceCard.tsx`
- Modify: `src/themes/midnight-atelier/sections/RsvpSection.tsx`
- Modify: `src/themes/midnight-atelier/ThemeStyles.tsx`
- Test: `tests/midnight-atelier-identity.test.mjs`

**Interfaces:**
- Consumes: `useRsvpForm()` state (unchanged: `attendance` stays set after success); `.ma-script`, `.ma-label`; `createLoader({ actions })`, `mount`, `css` (Task 2).
- Produces: `DanceCard({ name: string | null })` → `<div class="ma-dance-card" data-ma-dance-card aria-hidden="true">` with `svg.ma-dance-tassel`, a `.ma-label` title and a `<dl>` of rows (Nama when known, Kehadiran = "Hadir"); each `<dd class="ma-script">` carries `--ma-write-delay`. No hooks; RSVP collects no party size, so there is no party-size row.

- [ ] **Step 1: Write the failing test**

Append to `tests/midnight-atelier-identity.test.mjs`:

```js
test("an attending RSVP writes a tasselled dance card; declining keeps the plain thank-you", async () => {
  const { RsvpSection } = createLoader({ actions: { submitRsvp: async () => ({ status: "success" }) } })("sections/RsvpSection");
  async function answer(guestName, choice, typedName) {
    const view = await mount(React.createElement(RsvpSection, { invitationId: "midnight", slug: "midnight", guestToken: "t", guestName }));
    const form = view.document.querySelector("#ma-rsvp form");
    if (typedName) form.elements.namedItem("guestName").value = typedName;
    const button = [...form.querySelectorAll('button[type="button"]')].find((candidate) => candidate.textContent.trim() === choice);
    await act(async () => button.click());
    await act(async () => form.dispatchEvent(new view.window.Event("submit", { bubbles: true, cancelable: true })));
    return view;
  }

  const personal = await answer("Bude Sri", "Hadir");
  try {
    const section = personal.document.getElementById("ma-rsvp");
    assert.match(section.querySelector('[role="status"]').textContent, /Konfirmasi kehadiran Anda telah kami terima/);
    const card = section.querySelector("[data-ma-dance-card]");
    assert.ok(card, "the dance card appears");
    assert.equal(card.getAttribute("aria-hidden"), "true", "the status text carries the message");
    assert.ok(card.querySelector("svg.ma-dance-tassel"));
    const entries = [...card.querySelectorAll("dd")];
    assert.deepEqual(entries.map((entry) => entry.textContent), ["Bude Sri", "Hadir"], "name and attendance only; no invented party size");
    for (const entry of entries) {
      assert.ok(entry.classList.contains("ma-script"));
      assert.match(entry.style.getPropertyValue("--ma-write-delay"), /^\d+(\.\d+)?s$/);
    }
  } finally { await personal.cleanup(); }

  const typed = await answer(null, "Hadir", "Pak Joko");
  try {
    assert.equal(typed.document.querySelector("[data-ma-dance-card] dd").textContent, "Pak Joko", "a typed name is written too");
  } finally { await typed.cleanup(); }

  const declined = await answer("Bude Sri", "Tidak Hadir");
  try {
    assert.match(declined.document.querySelector('#ma-rsvp [role="status"]').textContent, /Terima kasih/);
    assert.equal(declined.document.querySelector("[data-ma-dance-card]"), null);
  } finally { await declined.cleanup(); }

  const sheet = css();
  assert.match(sheet, /@keyframes ma-write\s*\{\s*from\s*\{\s*clip-path:\s*inset\(0 100% 0 0\)/);
  for (const body of rules(sheet, ".ma-dance-card dd")) {
    assert.doesNotMatch(body, /clip-path/, "at rest, and under reduced motion, the card is filled in");
    assert.match(body, /animation:[^;]*both/);
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test --test-name-pattern="dance card" tests/midnight-atelier-identity.test.mjs`
Expected: FAIL — no `[data-ma-dance-card]`.

- [ ] **Step 3: Write the component**

Create `src/themes/midnight-atelier/components/DanceCard.tsx`:

```tsx
import type { CSSProperties } from "react";

/**
 * A tasselled dance card shown after an attending RSVP; the guest's name and
 * attendance are "written" in script. The confirmation beside it carries the
 * message for assistive technology, so the card is decorative.
 */
export function DanceCard({ name }: { name: string | null }) {
  const rows = [
    ...(name ? [{ label: "Nama", value: name }] : []),
    { label: "Kehadiran", value: "Hadir" },
  ];

  return (
    <div className="ma-dance-card" data-ma-dance-card="" aria-hidden="true">
      <svg className="ma-dance-tassel" viewBox="0 0 24 64" fill="none" focusable="false">
        <path d="M12 0v22" />
        <path d="m12 22 4 5-4 5-4-5Z" />
        <path d="M9 32h6l1 26H8Z" />
        <path d="M10 36v20M12 36v22M14 36v20" />
      </svg>
      <p className="ma-label">Dance card</p>
      <dl>
        {rows.map((row, index) => (
          <div key={row.label}>
            <dt className="ma-label">{row.label}</dt>
            <dd className="ma-script" style={{ "--ma-write-delay": `${(0.5 + index * 0.6).toFixed(1)}s` } as CSSProperties}>
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
```

- [ ] **Step 4: Show it after "Hadir"**

In `RsvpSection.tsx`:
- Add `import { useState, type FormEvent } from "react";` and `import { DanceCard } from "../components/DanceCard";`.
- After the `useRsvpForm()` line add:

```tsx
  // The form unmounts on success; keep the name it sent for the dance card.
  const [sentName, setSentName] = useState<string | null>(null);
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const typed = new FormData(event.currentTarget).get("guestName");
    setSentName(typeof typed === "string" && typed.trim() ? typed.trim() : null);
    onSubmit(event);
  }
```

- Change the form's `onSubmit={onSubmit}` to `onSubmit={handleSubmit}`.
- Replace the success branch with:

```tsx
          <>
            <div className="ma-form-success" role="status">
              <p>Terima kasih.</p>
              <span>Konfirmasi kehadiran Anda telah kami terima.</span>
            </div>
            {attendance === "attending" ? <DanceCard name={guestName ?? sentName} /> : null}
          </>
```

(The card sits outside the status block so `.ma-form-success p` styles never reach it.)

- [ ] **Step 5: Dance-card CSS**

In `ThemeStyles.tsx` add before the `@media (max-width: 767px)` block:

```css
      /* Dance card: a pearl card with a gold frame and tassel; entries are
         written in script. Every animation fills "both", so with animations
         off (reduced motion) the card simply shows filled in. */
      .ma-dance-card { position: relative; width: min(100%, 22rem); margin-top: 2rem; border: 1px solid var(--ma-champagne); padding: 1.5rem 1.5rem 1.25rem; background: var(--ma-pearl); color: var(--ma-ink); animation: ma-card-in .7s cubic-bezier(.2, .7, .2, 1) both; }
      .ma-dance-card::before { content: ""; position: absolute; inset: 5px; border: 1px solid rgba(94, 26, 34, .35); pointer-events: none; }
      .ma-dance-card > .ma-label { margin: 0 0 .75rem; color: var(--ma-oxblood); }
      .ma-dance-card dl { margin: 0; }
      .ma-dance-card dl > div { border-bottom: 1px solid rgba(94, 26, 34, .3); padding-block: .5rem; }
      .ma-dance-card dt { color: var(--ma-oxblood); }
      .ma-dance-card dd { margin: .2rem 0 0; font-size: clamp(1.9rem, 8vw, 2.5rem); line-height: 1.15; overflow-wrap: anywhere; animation: ma-write 1.1s ease-in-out var(--ma-write-delay, .5s) both; }
      .ma-dance-tassel { position: absolute; top: -1.25rem; right: 1.5rem; width: 18px; height: auto; stroke: var(--ma-champagne); stroke-width: 1; transform-origin: 50% 0; animation: ma-tassel 1.6s ease-out .3s both; }
      @keyframes ma-card-in { from { opacity: 0; transform: translateY(18px) rotate(-2deg); } }
      @keyframes ma-write { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); } }
      @keyframes ma-tassel { 0% { transform: rotate(14deg); } 40% { transform: rotate(-8deg); } 70% { transform: rotate(4deg); } 100% { transform: rotate(0); } }
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `node --test tests/midnight-atelier-identity.test.mjs tests/midnight-atelier-guest-interactions.test.mjs tests/midnight-atelier-quality.test.mjs`
Expected: PASS (exact RSVP payload, pending/error recovery and success text unchanged).

- [ ] **Step 7: Commit**

```bash
git add src/themes/midnight-atelier/components/DanceCard.tsx src/themes/midnight-atelier/sections/RsvpSection.tsx src/themes/midnight-atelier/ThemeStyles.tsx tests/midnight-atelier-identity.test.mjs
git commit -m "feat(midnight): dance card after an attending RSVP

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_011pT7SiXwq9HVRhaYt6ogn3"
```

---

### Task 7: Champagne bubbles on a sent wish

**Files:**
- Create: `src/themes/midnight-atelier/components/WishBubbles.tsx`
- Modify: `src/themes/midnight-atelier/sections/WishesSection.tsx`
- Modify: `src/themes/midnight-atelier/ThemeStyles.tsx`
- Test: `tests/midnight-atelier-identity.test.mjs`

**Interfaces:**
- Consumes: `useWishForm()` state (unchanged); `useReducedMotion` from `motion/react` (the only Motion import, matching every Midnight harness stub); `createLoader({ reducedMotion, actions })`, `mount` (Task 2).
- Produces: `WishBubbles({ message: string | null })` → `<div class="ma-wish-rise" data-ma-bubbles aria-hidden="true">` with an optional `.ma-wish-ghost` (the sent text, ≤140 chars) and 10 `.ma-bubble` spans (≤12 nodes); `null` under reduced motion and after the ghost's animation ends.

- [ ] **Step 1: Write the failing test**

Append to `tests/midnight-atelier-identity.test.mjs`:

```js
test("a sent wish rises away with champagne bubbles and the thank-you stays", async () => {
  const { WishBubbles } = createLoader()("components/WishBubbles");
  const rise = new JSDOM(renderToStaticMarkup(React.createElement(WishBubbles, { message: "Bahagia selalu" }))).window.document.querySelector("[data-ma-bubbles]");
  assert.equal(rise.getAttribute("aria-hidden"), "true");
  assert.equal(rise.querySelector(".ma-wish-ghost").textContent, "Bahagia selalu");
  assert.ok(rise.querySelectorAll(".ma-bubble").length >= 6);
  assert.ok(rise.querySelectorAll("*").length <= 20, `${rise.querySelectorAll("*").length} nodes`);
  const long = new JSDOM(renderToStaticMarkup(React.createElement(WishBubbles, { message: "doa ".repeat(100) }))).window.document;
  assert.ok(long.querySelector(".ma-wish-ghost").textContent.length <= 140);
  const still = createLoader({ reducedMotion: true })("components/WishBubbles").WishBubbles;
  assert.equal(renderToStaticMarkup(React.createElement(still, { message: "Bahagia selalu" })), "");

  const { WishesSection } = createLoader({ actions: { submitWish: async () => ({ status: "success" }) } })("sections/WishesSection");
  const view = await mount(React.createElement(WishesSection, { invitationId: "midnight", slug: "midnight", guestToken: "t", guestName: "Bude Sri", wishes: [] }));
  try {
    const form = view.document.querySelector("#ma-ucapan form");
    form.elements.namedItem("message").value = "Bahagia selalu";
    await act(async () => form.dispatchEvent(new view.window.Event("submit", { bubbles: true, cancelable: true })));
    const section = view.document.getElementById("ma-ucapan");
    assert.match(section.querySelector('[role="status"]').textContent, /Terima kasih atas ucapan dan doanya/);
    assert.equal(section.querySelector("[data-ma-bubbles] .ma-wish-ghost").textContent, "Bahagia selalu");
  } finally { await view.cleanup(); }

  const reduced = createLoader({ reducedMotion: true, actions: { submitWish: async () => ({ status: "success" }) } })("sections/WishesSection").WishesSection;
  const calm = await mount(React.createElement(reduced, { invitationId: "midnight", slug: "midnight", guestToken: "t", guestName: "Bude Sri", wishes: [] }));
  try {
    const form = calm.document.querySelector("#ma-ucapan form");
    form.elements.namedItem("message").value = "Bahagia selalu";
    await act(async () => form.dispatchEvent(new calm.window.Event("submit", { bubbles: true, cancelable: true })));
    assert.match(calm.document.querySelector('#ma-ucapan [role="status"]').textContent, /Terima kasih/);
    assert.equal(calm.document.querySelector("[data-ma-bubbles]"), null, "no bubbles under reduced motion");
  } finally { await calm.cleanup(); }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test --test-name-pattern="champagne bubbles" tests/midnight-atelier-identity.test.mjs`
Expected: FAIL — "Missing module: …/components/WishBubbles".

- [ ] **Step 3: Write the component**

Create `src/themes/midnight-atelier/components/WishBubbles.tsx`:

```tsx
"use client";

import { useState, type AnimationEvent, type CSSProperties } from "react";
import { useReducedMotion } from "motion/react";

// Deterministic spread (no Math.random) so every render is identical.
const BUBBLES = Array.from({ length: 10 }, (_, index) => ({
  left: 8 + ((index * 37) % 84),
  size: 4 + (index % 3) * 2,
  rise: 90 + ((index * 53) % 70),
  delay: 0.15 + (index % 5) * 0.12,
}));

const MAX_GHOST = 140;

/**
 * The sent wish rises and fades among champagne bubbles, echoing the opener.
 * Mounted by the success state; decorative only. It leaves the DOM once the
 * wish has risen away (the longest animation), and never renders under
 * reduced motion.
 */
export function WishBubbles({ message }: { message: string | null }) {
  const reduced = useReducedMotion() ?? false;
  const [done, setDone] = useState(false);
  if (reduced || done) return null;

  const text = message?.trim() ?? "";
  const ghost = text.length > MAX_GHOST ? `${text.slice(0, MAX_GHOST - 1)}…` : text;

  function finish(event: AnimationEvent<HTMLDivElement>) {
    if (event.animationName === "ma-ghost-rise") setDone(true);
  }

  return (
    <div className="ma-wish-rise" data-ma-bubbles="" aria-hidden="true" onAnimationEnd={finish}>
      {ghost ? <p className="ma-wish-ghost">{ghost}</p> : null}
      {BUBBLES.map((bubble, index) => (
        <span
          key={index}
          className="ma-bubble"
          style={{
            left: `${bubble.left}%`,
            width: bubble.size,
            height: bubble.size,
            "--ma-rise": `-${bubble.rise}px`,
            animationDelay: `${bubble.delay}s`,
          } as CSSProperties}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Wire it and style it**

In `WishesSection.tsx`:
- Add `import { useState, type FormEvent } from "react";` and `import { WishBubbles } from "../components/WishBubbles";`.
- After the `useWishPagination` line add:

```tsx
  // The form unmounts on success; keep the text it sent so it can rise away.
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
          <div className="ma-wish-sent">
            <p className="ma-form-success ma-form-success-dark" role="status">Terima kasih atas ucapan dan doanya.</p>
            <WishBubbles message={sentMessage} />
          </div>
```

(The list itself still comes from the server: `submitWishAction` revalidates the page and the new wish arrives with the refreshed `wishes` prop. No optimistic insert.)

In `ThemeStyles.tsx` add before the `@media (max-width: 767px)` block:

```css
      /* A sent wish rises out of the guest book among champagne bubbles. It
         starts just above the thank-you, so the confirmation is never covered. */
      .ma-wish-sent { position: relative; }
      .ma-wish-rise { position: absolute; right: 0; bottom: 100%; left: 0; pointer-events: none; }
      .ma-wish-ghost { position: absolute; right: 0; bottom: 0; left: 0; margin: 0; color: var(--ma-oxblood); font-family: var(--ma-display); font-size: 1.25rem; font-style: italic; line-height: 1.4; overflow-wrap: anywhere; animation: ma-ghost-rise 2.4s ease-out forwards; }
      .ma-bubble { position: absolute; bottom: 0; border: 1px solid var(--ma-champagne); border-radius: 50%; background: rgba(216, 192, 138, .25); opacity: 0; animation: ma-bubble-rise 1.6s ease-out forwards; }
      @keyframes ma-ghost-rise { from { opacity: .9; transform: translateY(0); } to { opacity: 0; transform: translateY(-110px); } }
      @keyframes ma-bubble-rise { 0% { opacity: 0; transform: translateY(0); } 15% { opacity: .9; } 100% { opacity: 0; transform: translateY(var(--ma-rise)); } }
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `node --test tests/midnight-atelier-identity.test.mjs tests/midnight-atelier-guest-interactions.test.mjs`
Expected: PASS (wish payload, Turnstile proof, edit recovery and pagination unchanged).

- [ ] **Step 6: Commit**

```bash
git add src/themes/midnight-atelier/components/WishBubbles.tsx src/themes/midnight-atelier/sections/WishesSection.tsx src/themes/midnight-atelier/ThemeStyles.tsx tests/midnight-atelier-identity.test.mjs
git commit -m "feat(midnight): champagne bubbles carry a sent wish away

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_011pT7SiXwq9HVRhaYt6ogn3"
```

---

### Task 8: Picture lights in the gallery

**Files:**
- Modify: `src/themes/midnight-atelier/sections/GallerySection.tsx`
- Modify: `src/themes/midnight-atelier/ThemeStyles.tsx`
- Test: `tests/midnight-atelier-identity.test.mjs`

**Interfaces:**
- Consumes: `useInViewOnce(ref)` (shared, default root margin); `--ma-light-strong` (Task 2); `createLoader`, `mount`, `FakeIntersectionObserver`, `invitation`, `css`, `rules` (Task 2).
- Produces: gallery grid `data-lights="waiting" | "lit"` (absent until the observer reports); each `.ma-gallery-item` carries `--ma-light-delay` (`0.18s` steps, capped at 8).

- [ ] **Step 1: Write the failing test**

Append to `tests/midnight-atelier-identity.test.mjs`:

```js
test("framed photos on the dark wall are lit one by one by picture lights, lightbox intact", async () => {
  const { GallerySection } = createLoader()("sections/GallerySection");
  const props = { gallery: invitation().gallery, displayName: "Nadia & Arka" };

  const plain = await mount(React.createElement(GallerySection, props));
  try {
    assert.equal(plain.document.querySelector(".ma-gallery-grid").hasAttribute("data-lights"), false, "no observer: photos simply show");
  } finally { await plain.cleanup(); }

  FakeIntersectionObserver.instances = [];
  const view = await mount(React.createElement(GallerySection, props), { intersectionObserver: FakeIntersectionObserver });
  try {
    const grid = view.document.querySelector(".ma-gallery-grid");
    assert.equal(grid.hasAttribute("data-lights"), false, "nothing dims before the observer reports");
    await act(async () => FakeIntersectionObserver.instances.forEach((observer) => observer.trigger(false)));
    assert.equal(grid.dataset.lights, "waiting");
    const delays = [...grid.querySelectorAll(".ma-gallery-item")].map((item) => item.style.getPropertyValue("--ma-light-delay"));
    assert.deepEqual(delays, ["0.00s", "0.18s", "0.36s"], "lit one by one, in order");
    await act(async () => FakeIntersectionObserver.instances.forEach((observer) => observer.trigger(true)));
    assert.equal(grid.dataset.lights, "lit");
    assert.ok(grid.querySelector("button[aria-label^='Perbesar foto 1 dari 3']"), "lightbox trigger intact");
  } finally { await view.cleanup(); }

  const sheet = css();
  assert.match(sheet, /\.ma-gallery-item::after\s*\{[^}]*radial-gradient\([^)]*var\(--ma-light-strong\)/);
  assert.match(sheet, /\.ma-gallery-item::before\s*\{[^}]*background:\s*var\(--ma-champagne\)/, "a brass picture lamp above each frame");
  assert.match(rules(sheet, '.ma-gallery-grid[data-lights="waiting"] .ma-gallery-zoom').join(";"), /opacity:/);
  assert.match(sheet, /prefers-reduced-motion: reduce\)[\s\S]*\.ma-gallery-grid\[data-lights\] \.ma-gallery-zoom[^{]*\{\s*opacity:\s*1 !important/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test --test-name-pattern="picture lights" tests/midnight-atelier-identity.test.mjs`
Expected: FAIL — `data-lights` never set.

- [ ] **Step 3: Light the gallery**

In `GallerySection.tsx`:
- Add `import { useRef, type CSSProperties } from "react";` and `import { useInViewOnce } from "@/themes/shared/use-in-view-once";`.
- Directly after `const lightbox = useGalleryLightbox(gallery.length);` (and before the `if (gallery.length === 0) return null;` early return, so hooks keep their order) add:

```tsx
  const gridRef = useRef<HTMLDivElement>(null);
  const { watching, seen } = useInViewOnce(gridRef);
```

- In `frame()`, give the `<figure>` its lamp delay:

```tsx
      <figure
        key={item.id}
        data-gallery-item={item.id}
        data-gallery-anchor={anchor ? "true" : undefined}
        className={`ma-gallery-item${anchor ? " ma-gallery-anchor" : ""}`}
        style={{ "--ma-light-delay": `${(Math.min(index, 8) * 0.18).toFixed(2)}s` } as CSSProperties}
      >
```

- Replace `<div className="ma-gallery-grid">` with:

```tsx
      <div ref={gridRef} className="ma-gallery-grid" data-lights={seen ? "lit" : watching ? "waiting" : undefined}>
```

(`tests/gallery-gift-parity.test.mjs` loads this file with a strict import list: `react` and `@/…` modules are allowed; do not import `motion/react` here.)

- [ ] **Step 4: Picture-light CSS**

In `ThemeStyles.tsx` add before the `@media (max-width: 767px)` block:

```css
      /* Picture lights: thin gold frames on the dark wall, a brass lamp above
         each, lit one by one as the gallery enters view. Only opacity animates. */
      .ma-gallery-item { position: relative; padding-top: 16px; }
      .ma-gallery-item::before { content: ""; position: absolute; z-index: 2; top: 0; left: 50%; width: 64px; height: 7px; margin-left: -32px; background: var(--ma-champagne); clip-path: polygon(0 0, 100% 0, 86% 100%, 14% 100%); pointer-events: none; }
      .ma-gallery-item::after { content: ""; position: absolute; z-index: 1; top: 16px; right: 0; left: 0; height: 55%; background: radial-gradient(ellipse 55% 75% at 50% 0%, var(--ma-light-strong), transparent 72%); pointer-events: none; }
      .ma-theme .ma-gallery-grid .ma-gallery-zoom { padding: 6px; border: 1px solid var(--ma-champagne); }
      .ma-gallery-grid[data-lights="waiting"] .ma-gallery-zoom { opacity: .35; }
      .ma-gallery-grid[data-lights="waiting"] .ma-gallery-item::after { opacity: 0; }
      .ma-gallery-grid[data-lights="lit"] .ma-gallery-zoom { transition: opacity .8s ease var(--ma-light-delay, 0s); }
      .ma-gallery-grid[data-lights="lit"] .ma-gallery-item::after { transition: opacity .6s ease var(--ma-light-delay, 0s); }
```

(`.ma-theme .ma-gallery-grid .ma-gallery-zoom` outranks the later `.ma-theme .ma-gallery-zoom { padding: 0; border: 0 }` lightbox rule by specificity, so source order does not matter.)

Inside the existing `@media (prefers-reduced-motion: reduce) { … }` block add:

```css
        .ma-gallery-grid[data-lights] .ma-gallery-zoom, .ma-gallery-grid[data-lights] .ma-gallery-item::after { opacity: 1 !important; }
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `node --test tests/midnight-atelier-identity.test.mjs tests/midnight-atelier-story-gallery.test.mjs tests/gallery-gift-parity.test.mjs tests/midnight-atelier-quality.test.mjs`
Expected: PASS (1–40 images keep order, captions, ratios, lazy loading and one anchor; lightbox opens; the radial-light test now finds both owners).

- [ ] **Step 6: Commit**

```bash
git add src/themes/midnight-atelier/sections/GallerySection.tsx src/themes/midnight-atelier/ThemeStyles.tsx tests/midnight-atelier-identity.test.mjs
git commit -m "feat(midnight): picture lights in the gallery

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_011pT7SiXwq9HVRhaYt6ogn3"
```

---

### Task 9: Docs, verification, visual QA, PR

**Files:**
- Modify: `docs/PROJECT_MEMORY.md` (Midnight decision, construction map, identity record, checkpoint)
- Modify: `docs/DESIGN.md` §26
- Modify: `docs/superpowers/specs/2026-09-30-midnight-atelier-theme-design.md` (supersede note)
- Modify: `docs/superpowers/specs/2026-10-03-theme-identity-redesign-design.md` §6 (implementation notes)
- Temporary (never committed): `src/app/qa-fixture/page.tsx`, `public/qa/` (both in `.git/info/exclude`)

- [ ] **Step 1: Docs**

`docs/PROJECT_MEMORY.md`:
- In "Product decisions…", replace the Midnight bullet with:

```markdown
- Midnight Atelier uses the approved **Malam di Ballroom** direction (Oct 2026,
  replacing dark cinematic couture): Imperial Script / Bodoni Moda italic /
  Jost, the Tinta/Oxblood/Champagne/Mutiara/Asap palette (see the 2026-10-03
  identity spec), programme-led composition, light drawn only as spotlight
  and picture lights, and no generic black-and-gold styling.
```

- In "Midnight Atelier construction map", change the first line of the tree to `CoverGate — champagne toast, guest personalization, music and focus handoff`, and replace the paragraph starting "Midnight uses Ink `#09090B`…" with:

```markdown
Midnight uses Tinta `#14121A`, a lifted Tinta `#1E1A24` for layered
surfaces, Oxblood `#5E1A22`, Champagne `#D8C08A`, Mutiara `#EDE6DA` and Asap
`#6E6873` (rules only; small secondary text uses `--ma-smoke-ink` `#A9A2AD`).
Imperial Script carries couple names, Bodoni Moda italic the headings, Jost
the body (17px) and spaced-capital labels. Radial light appears only in the
heading spotlight and the gallery picture lights; no other gradients, fake
foil, stars or SaaS cards. Optional content must disappear cleanly, and
nonessential motion must honor reduced motion preferences.
```

- In "Theme identity redesign (Oct 2026)", add:

```markdown
- Midnight "Malam di Ballroom": champagne-toast cover (`ChampagneToast`,
  replaces the curtain seam), spotlight chapter headings (`Spotlight` over
  `themes/shared/use-in-view-once.ts`), dance card after an attending RSVP
  (`DanceCard`; name and attendance only — RSVP has no party size), sent
  wish rising with champagne bubbles (`WishBubbles`), picture lights in the
  gallery. Plan: `docs/superpowers/plans/2026-10-04-midnight-identity.md`.
  `@fontsource/ibm-plex-sans-condensed` removed; Jost now belongs to Midnight.
  `tests/midnight-atelier-identity.test.mjs` pins contrast, light, names,
  toast, spotlight, dance card, bubbles and picture lights.
```

- Update "Checkpoint — Midnight 'Malam di Ballroom'" with the task commits, verification numbers, visual QA findings and remaining notes (same shape as the Terra checkpoint).

`docs/DESIGN.md` §26: replace the "Palette:" paragraph and the "Storyboard:" paragraph with:

```markdown
Since October 2026 Midnight follows **Malam di Ballroom** (spec
`docs/superpowers/specs/2026-10-03-theme-identity-redesign-design.md` §6): a
black-tie evening ball of crystal light, champagne and oxblood velvet.

Palette: Tinta `#14121A` (ground), lifted Tinta `#1E1A24` (layered surfaces),
Oxblood `#5E1A22`, Champagne `#D8C08A` (rules, small highlights, light),
Mutiara `#EDE6DA` (text on dark, reading surfaces) and Asap `#6E6873` (rules
only; small secondary text uses `#A9A2AD`). Imperial Script is reserved for
couple names; Bodoni Moda italic carries headings; Jost carries body text at
17px or larger and spaced-capital labels.

Storyboard: a champagne-toast cover (two flutes clink, a ring of light,
rising bubbles); chapter headings lit by a stage spotlight; a dance card after
an attending RSVP; a sent wish rising with champagne bubbles; framed photos lit
one by one by picture lights. Light is drawn with warm radial gradients only
in the spotlight and picture lights. Avoid any other gradient, neon glow, fake
foil, star fields, repeated ornamental frames, excessive gold and SaaS cards.
```

and in the last paragraph replace "controlled curtain movement" with "the champagne toast".

`docs/superpowers/specs/2026-09-30-midnight-atelier-theme-design.md`: add directly under the title:

```markdown
> **Superseded (visual direction only), 2026-10-04:** typography, palette,
> cover and ornaments now follow `2026-10-03-theme-identity-redesign-design.md`
> §6 ("Malam di Ballroom"). Data, sections, feature gating and accessibility
> below remain authoritative.
```

`docs/superpowers/specs/2026-10-03-theme-identity-redesign-design.md` §6: after the signature-interaction list add:

```markdown
Implementation notes (Midnight PR): RSVP collects no party size, so the dance
card writes the guest's name and attendance only. The new wish reaches the
list through the existing server revalidation, not an optimistic insert.
Asap is a rule colour; small secondary text uses `#A9A2AD`. In-view effects
use `themes/shared/use-in-view-once.ts` (Midnight stays CSS-driven).
**Deferred:** the gold-line chandelier ornament.
```

- [ ] **Step 2: Full verification**

Run: `npm test` — all pass except the known environmental countdown-timezone test (`tests/terra-botanica-render.test.mjs`, nested `node --test` prints TAP when piped on Node 22). Record the count.
Run: `npm run lint && npm run typecheck && npm run build` — each exits 0. If the build reports a stale `.next/dev/types` reference to `qa-fixture`, delete `.next/dev` and retry.
Run: `grep -rn "querySelector\|<img" src/themes/midnight-atelier` — no output.

- [ ] **Step 3: Visual QA with fixture data (never a live invitation)**

Create `src/app/qa-fixture/page.tsx` rendering `<ThemeRenderer invitation={…} guest={…} />` with `import "@/themes/theme-fonts";`, `theme.slug: "midnight-atelier"`, two events with times, countdown on, two stories, three gallery items pointing at local SVGs in `public/qa/`, rsvp and wishes enabled, music off, a long guest name. Start the Browser preview (`preview_start` name `web`), open `/qa-fixture`, and check at 320, 375 and 1280 (trigger clicks with `element.click()` via the JS tool):

1. Cover: names in Imperial Script with a Bodoni italic "&", Jost spaced-capital masthead, flutes under the names; tap → flutes clink, ring pulses, bubbles rise, cover fades by ~1.4s and taps reach content at once.
2. Headings Bodoni italic; body Jost 17px (`getComputedStyle(p).fontSize === "17px"`); labels Jost uppercase.
3. Spotlight: a heading below the fold is dim (`opacity` 0.55), then lit as it reaches the upper 60% of the viewport; headings on screen after opening are lit without a flash.
4. Gallery: frames dim on arrival, then lamps light them in order; tapping a photo opens the lightbox.
5. Dance card / bubbles need a successful submission (Turnstile rejects localhost); they are covered by the identity tests. Optionally mount `<DanceCard name="Keluarga Adinata yang Berbahagia" />` and `<WishBubbles message="…" />` inside a `.ma-theme` wrapper on the fixture page to eyeball them; confirm the bubbles node leaves the DOM after ~2.5s and the card fits 320px.
6. No horizontal overflow at any width (`document.documentElement.scrollWidth === innerWidth`); five nav items with icons, ≥52px tall on phones; hero title before the 3:4 photo.
7. Reduced motion (emulate `prefers-reduced-motion: reduce`): cover hides at once, headings fully lit, frames lit, dance card filled, no bubbles.

Delete `src/app/qa-fixture/`, `public/qa/` and `.next/dev` afterwards.

- [ ] **Step 4: Commit docs and push**

```bash
git add docs/PROJECT_MEMORY.md docs/DESIGN.md docs/superpowers/specs/2026-09-30-midnight-atelier-theme-design.md docs/superpowers/specs/2026-10-03-theme-identity-redesign-design.md
git commit -m "docs: record the Midnight identity redesign

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_011pT7SiXwq9HVRhaYt6ogn3"
git push -u origin design/terra-identity-at0kh3
```

(The remote branch holds the merged Terra commits, which are ancestors of `main`, so this is a fast-forward. If the push is rejected as non-fast-forward, stop and ask the user; do not force-push.)

- [ ] **Step 5: Open the PR and stop**

```bash
gh pr create --base main --head design/terra-identity-at0kh3 --title "Midnight identity: Malam di Ballroom" --body "$(cat <<'EOF'
Midnight Atelier gets its "Malam di Ballroom" identity (spec docs/superpowers/specs/2026-10-03-theme-identity-redesign-design.md §6, plan docs/superpowers/plans/2026-10-04-midnight-identity.md):

- Imperial Script (names) / Bodoni Moda italic (headings) / Jost (body 17px, spaced-capital labels); IBM Plex Sans Condensed removed
- Tinta-oxblood-champagne-mutiara-asap palette with an AA contrast test (asap is a rule colour; small text uses #A9A2AD), warm light tokens
- Champagne-toast cover opener replaces the curtain (music still starts on the first tap)
- Spotlight chapter headings, dance card after an attending RSVP (name and attendance; RSVP has no party size), champagne bubbles on a sent wish, picture lights in the gallery
- Reduced motion: cover hides at once, headings lit, frames lit, dance card filled, no bubbles
- Updated tests that pinned the old fonts, palette, curtain and the blanket radial-gradient ban

Presentation only; no capability or data changes.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_011pT7SiXwq9HVRhaYt6ogn3
EOF
)"
```

Report the PR link to the user and **wait for an explicit "merge"** (merging to `main` deploys production).
