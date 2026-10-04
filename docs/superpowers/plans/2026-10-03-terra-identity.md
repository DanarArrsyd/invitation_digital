# Terra Botanica Identity ("Herbarium Cinta") Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give Terra Botanica its "Herbarium Cinta" identity — Herr Von Muellerhoff / Courier Prime / Spectral, the linen-lumut-liat palette with paper texture, a seed-to-bloom opener, and four signature interactions (growing vine, typed specimen labels, dandelion on a sent wish, taped photos) — without changing any capability.

**Architecture:** Presentation-only change inside `src/themes/terra-botanica/` plus font wiring in `src/themes/theme-fonts.ts` and two small shared hooks in `src/themes/shared/` (`use-in-view-once.ts`, `use-scroll-progress.ts`) that Midnight and Cobalt reuse later. Terra stays CSS-driven: no Motion components (Terra's test harnesses stub `motion/react` down to `useReducedMotion`), animations are CSS keyframes/transitions toggled by data attributes, scroll progress is written to a CSS custom property without re-rendering.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, `@fontsource`, `node --test` with vm/ts-transpile harnesses and jsdom.

**Spec:** `docs/superpowers/specs/2026-10-03-theme-identity-redesign-design.md` §3, §5, §8–10. Reference implementation of the pattern: the merged Ivory plan `docs/superpowers/plans/2026-10-03-ivory-identity.md`.

## Global Constraints

- Fonts: Herr Von Muellerhoff (names only) · Courier Prime (labels, dates, eyebrows, buttons, nav) · Spectral (headings in italic, body ≥16px). Self-hosted via `@fontsource`; no Google Fonts at runtime.
- No font may be mapped by two themes (`tests/font-delivery.test.mjs` enforces it).
- Palette: linen `#F2EBDD`, lumut `#4E5B3A`, tanah liat `#B5653E`, kakao `#4A3426`, matahari `#D9A441`, tulang `#FBF7EE`; small clay-coloured text uses `--tb-clay-ink` `#9A4F2E`.
- Text contrast ≥4.5:1 for every body/label pair; `--tb-clay` (≈4.0 on bone) is for rules, fills and large type only.
- Motion animates only `transform`, `opacity`, `clip-path`, `stroke-dashoffset`, and CSS custom properties; particle effects ≤20 nodes.
- `prefers-reduced-motion: reduce` → cover hides instantly, the vine renders complete, labels render fully typed, photos render settled, the dandelion renders nothing; confirmation text always visible.
- One tap on "Buka Undangan" calls `openInvitation()` synchronously; the bloom never delays it.
- Terra source must not contain `<img` or `querySelector` (`tests/terra-botanica-quality.test.mjs`); use refs.
- Server markup and the first client render must agree, including with reduced motion (`tests/terra-botanica-render.test.mjs` hydration test): no reduced-motion branching in initial markup.
- The cover's first `button` stays "Buka Undangan"; the cover `h1` text stays exactly the display name (e.g. "Alya & Bima"); no `<time>` renders when there is no date.
- No pasted raster botanicals; motifs are SVG/CSS.
- No capability added or removed; every existing test keeps passing.
- Merging to `main` auto-deploys production: open a PR and **ask the user before merging**.
- Commit messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` (subagents use their own model name).

## File Map

| File | Change |
|---|---|
| `package.json`, `package-lock.json` | add `@fontsource/herr-von-muellerhoff`, `@fontsource/courier-prime`, `@fontsource/spectral`; remove `@fontsource-variable/fraunces`, `@fontsource-variable/manrope` |
| `src/themes/theme-fonts.ts` | Terra block imports the new faces |
| `src/themes/terra-botanica/fonts.css`, `fonts.ts`, `TerraBotanica.tsx` | three face handles |
| `src/themes/terra-botanica/ThemeStyles.tsx` | tokens, palette, texture, script/label classes, bloom, vine, typed, dandelion, taped-photo CSS |
| `src/themes/registry.ts`, `tests/theme-contract.test.mjs` | Terra preview palette |
| `src/themes/shared/use-in-view-once.ts` | new shared hook |
| `src/themes/shared/use-scroll-progress.ts` | new shared hook + pure `scrollProgress` |
| `src/themes/terra-botanica/components/SeedBloom.tsx` | new: cover bloom |
| `src/themes/terra-botanica/components/GrowingVine.tsx` | new: scroll vine |
| `src/themes/terra-botanica/components/TypedText.tsx` | new: typed label |
| `src/themes/terra-botanica/components/DandelionRelease.tsx` | new: wish celebration |
| `src/themes/terra-botanica/CoverGate.tsx` | bloom + script names + specimen accent |
| `src/themes/terra-botanica/sections/{HeroSection,CoupleSection,ClosingSection,EventsSection,StorySection,GallerySection,WishesSection}.tsx` | script names, typed labels, dandelion, taped photos |
| `tests/font-delivery.test.mjs` | Terra faces |
| `tests/theme-motion-hooks.test.mjs` | new: shared hook tests |
| `tests/terra-botanica-identity.test.mjs` | new: identity tests |
| `tests/theme-shared-behavior.test.mjs` | DandelionRelease stub |
| `docs/PROJECT_MEMORY.md`, `docs/superpowers/specs/2026-09-24-terra-botanica-theme-design.md` | record the new direction |

---

### Task 1: Terra font system ✅ done (`4deb1c3`)

**Files:**
- Modify: `package.json`, `package-lock.json`
- Modify: `src/themes/theme-fonts.ts`
- Modify: `src/themes/terra-botanica/fonts.css`, `src/themes/terra-botanica/fonts.ts`, `src/themes/terra-botanica/TerraBotanica.tsx`, `src/themes/terra-botanica/ThemeStyles.tsx`
- Test: `tests/font-delivery.test.mjs`

**Interfaces:**
- Produces: tokens `--tb-script`, `--tb-label`, `--tb-display` (now Spectral), `--tb-body` (Spectral); classes `.tb-script` (names) and `.tb-label` (typewriter labels). Later tasks use these names verbatim.

- [x] **Step 1: Write the failing test**

In `tests/font-delivery.test.mjs` replace the `"terra-botanica"` entry of `THEME_FONTS` with:

```js
  "terra-botanica": {
    packages: [/@fontsource\/herr-von-muellerhoff/, /@fontsource\/courier-prime/, /@fontsource\/spectral/],
    faces: [
      /--font-tb-script:\s*"Herr Von Muellerhoff"/,
      /--font-tb-label:\s*"Courier Prime"/,
      /--font-tb-text:\s*"Spectral"/,
    ],
  },
```

and append:

```js
test("Terra styles consume the script, label and text faces", async () => {
  const styles = await source("src/themes/terra-botanica/ThemeStyles.tsx");
  assert.match(styles, /--tb-script:\s*var\(--font-tb-script\)/);
  assert.match(styles, /--tb-label:\s*var\(--font-tb-label\)/);
  assert.match(styles, /--tb-display:\s*var\(--font-tb-text\)/);
  assert.match(styles, /--tb-body:\s*var\(--font-tb-text\)/);
  assert.doesNotMatch(styles, /--font-tb-display|--font-tb-body/);
  assert.match(styles, /\.tb-script\s*\{[^}]*font-family:\s*var\(--tb-script\)/);
  assert.match(styles, /\.tb-label\s*\{[^}]*font-family:\s*var\(--tb-label\)/);
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `node --test tests/font-delivery.test.mjs`
Expected: FAIL — Terra packages missing and "Terra styles consume…" fails.

- [x] **Step 3: Install the faces**

```bash
npm install @fontsource/herr-von-muellerhoff@^5.3.0 @fontsource/courier-prime@^5.3.0 @fontsource/spectral@^5.3.0
npm uninstall @fontsource-variable/fraunces @fontsource-variable/manrope
```

- [x] **Step 4: Wire the faces**

In `src/themes/theme-fonts.ts` replace the Terra block with:

```ts
// terra-botanica
import "@fontsource/herr-von-muellerhoff/400.css";
import "@fontsource/courier-prime/400.css";
import "@fontsource/courier-prime/700.css";
import "@fontsource/spectral/400.css";
import "@fontsource/spectral/400-italic.css";
import "@fontsource/spectral/600.css";
import "@fontsource/spectral/700.css";
import "./terra-botanica/fonts.css";
```

Replace `src/themes/terra-botanica/fonts.css` with:

```css
.tb-font-script {
  --font-tb-script: "Herr Von Muellerhoff";
}

.tb-font-label {
  --font-tb-label: "Courier Prime";
}

.tb-font-text {
  --font-tb-text: "Spectral";
}
```

Replace `src/themes/terra-botanica/fonts.ts` with:

```ts
/** Ink signature face — couple names only. */
export const scriptFace = { variable: "tb-font-script" } as const;

/** Typewriter face — specimen labels, dates, buttons, navigation. */
export const labelFace = { variable: "tb-font-label" } as const;

/** Book face — italic headings and all body copy. */
export const textFace = { variable: "tb-font-text" } as const;
```

In `src/themes/terra-botanica/TerraBotanica.tsx`:

```tsx
import { labelFace, scriptFace, textFace } from "./fonts";
```

```tsx
    <div className={`tb-theme ${scriptFace.variable} ${labelFace.variable} ${textFace.variable}`}>
```

- [x] **Step 5: Retarget the Terra type tokens**

In `src/themes/terra-botanica/ThemeStyles.tsx` replace

```css
      --tb-display: var(--font-tb-display), Georgia, serif;
      --tb-body: var(--font-tb-body), Arial, sans-serif;
```

with

```css
      --tb-script: var(--font-tb-script), "Snell Roundhand", cursive;
      --tb-label: var(--font-tb-label), "Courier New", monospace;
      --tb-display: var(--font-tb-text), Georgia, serif;
      --tb-body: var(--font-tb-text), Georgia, serif;
```

Replace the heading rule

```css
    .tb-theme h1, .tb-theme h2, .tb-theme h3 { font-family: var(--tb-display); font-weight: 400; }
```

with

```css
    .tb-theme h1, .tb-theme h2, .tb-theme h3 { font-family: var(--tb-display); font-weight: 400; font-style: italic; }
    /* Herbarium voices: ink signatures for names, typewriter for specimen labels. */
    .tb-theme .tb-script { font-family: var(--tb-script); font-style: normal; font-weight: 400; letter-spacing: 0; }
    .tb-theme .tb-label { font-family: var(--tb-label); font-style: normal; letter-spacing: .04em; }
    .tb-theme :is(.tb-journal-label, .tb-cover-date, .tb-event-index, .tb-event-main time, .tb-event-time, .tb-story-date, .tb-gift-provider, .tb-wish-meta time, .tb-gallery-item figcaption, .tb-countdown-units dt, .tb-action, .tb-form-submit, .tb-more-wishes, .tb-nav a) { font-family: var(--tb-label); font-style: normal; letter-spacing: .04em; }
```

- [x] **Step 6: Run tests to verify they pass**

Run: `node --test tests/font-delivery.test.mjs`
Expected: PASS.

Run: `grep -rn "displaySerif\|bodySans\|font-tb-display\|font-tb-body" src/themes/terra-botanica`
Expected: no output.

Run: `npm test`
Expected: all pass (Terra render/quality tests mock `next/font/google`, which Terra no longer imports; that is harmless).

- [x] **Step 7: Commit**

```bash
git add package.json package-lock.json src/themes/theme-fonts.ts src/themes/terra-botanica/fonts.css src/themes/terra-botanica/fonts.ts src/themes/terra-botanica/TerraBotanica.tsx src/themes/terra-botanica/ThemeStyles.tsx tests/font-delivery.test.mjs
git commit -m "feat(terra): Herr Von Muellerhoff, Courier Prime and Spectral type system

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Palette, paper texture and test harness

**Files:**
- Modify: `src/themes/terra-botanica/ThemeStyles.tsx`
- Modify: `src/themes/registry.ts` (Terra `preview.palette`)
- Modify: `tests/theme-contract.test.mjs` (Terra expectation)
- Create: `tests/terra-botanica-identity.test.mjs`

**Interfaces:**
- Produces: token `--tb-clay-ink`; test helpers in `tests/terra-botanica-identity.test.mjs` — `createLoader({ reducedMotion?, actions? })` returning `load(pathInsideTerraDir)`, `mount(element, { intersectionObserver? })`, `invitation(overrides)`, `contrast(a, b)`, `FakeIntersectionObserver`. Tasks 3–9 append tests to this file and reuse them.

- [ ] **Step 1: Write the failing tests**

Create `tests/terra-botanica-identity.test.mjs`:

```js
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import vm from "node:vm";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { JSDOM } from "jsdom";
import ts from "typescript";

const nodeRequire = createRequire(import.meta.url);
const srcRoot = fileURLToPath(new URL("../src/", import.meta.url));
const terraRoot = resolve(srcRoot, "themes/terra-botanica");

/** Loads Terra TS/TSX through vm. `reducedMotion` forces Motion's preference; `actions` replaces the server actions. */
function createLoader({ reducedMotion = false, actions = {} } = {}) {
  const cache = new Map();
  function load(file) {
    const path = [file, `${file}.tsx`, `${file}.ts`, `${file}/index.ts`].find((candidate) => existsSync(candidate) && !candidate.endsWith("/"));
    assert.ok(path, `Missing module: ${file}`);
    if (cache.has(path)) return cache.get(path);
    const exports = {};
    cache.set(path, exports);
    const output = ts.transpileModule(readFileSync(path, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
    }).outputText;
    vm.runInNewContext(output, {
      exports, module: { exports }, console, Date, Intl, URL, URLSearchParams, Blob,
      setTimeout, clearTimeout, setInterval, clearInterval,
      get window() { return globalThis.window; },
      get document() { return globalThis.document; },
      get navigator() { return globalThis.navigator; },
      get FormData() { return globalThis.FormData; },
      get IntersectionObserver() { return globalThis.IntersectionObserver; },
      get requestAnimationFrame() { return globalThis.requestAnimationFrame; },
      get cancelAnimationFrame() { return globalThis.cancelAnimationFrame; },
      require(name) {
        if (name === "next/image") return { __esModule: true, default: ({ src, alt }) => React.createElement("img", { src, alt }) };
        if (name === "next/script") return { __esModule: true, default: () => null };
        if (name === "@/components/TurnstileWidget") return { TurnstileWidget: () => null };
        if (name === "@/app/(public)/[slug]/actions") {
          return {
            trackCoverOpenedAction: async () => {},
            submitRsvpAction: actions.submitRsvp ?? (async () => ({ status: "idle" })),
            submitWishAction: actions.submitWish ?? (async () => ({ status: "idle" })),
          };
        }
        if (name === "motion/react") return { ...nodeRequire("motion/react"), useReducedMotion: () => reducedMotion };
        if (name.startsWith("@/")) return load(resolve(srcRoot, name.slice(2)));
        if (name.startsWith(".")) return load(resolve(dirname(path), name));
        return nodeRequire(name);
      },
    });
    return exports;
  }
  return (relative) => load(resolve(terraRoot, relative));
}

/** Records observed elements; `trigger()` reports them all as intersecting. */
class FakeIntersectionObserver {
  static instances = [];
  constructor(callback) { this.callback = callback; this.elements = []; FakeIntersectionObserver.instances.push(this); }
  observe(element) { this.elements.push(element); }
  disconnect() { this.elements = []; }
  trigger() { this.callback(this.elements.map((target) => ({ target, isIntersecting: true }))); }
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
    id: "terra", type: "wedding", slug: "terra", title: "Alya & Bima", status: "published",
    eventDate: "2030-10-20", venueSummary: "Kebun Raya", publishedAt: "2030-01-01T00:00:00Z", expiresAt: null,
    timeZone: "Asia/Jakarta",
    theme: { slug: "terra-botanica", settings: {} },
    people: [
      { id: "b", role: "bride", fullName: "Alya Putri", nickname: "Alya", fatherName: null, motherName: null, photoUrl: null, bio: null, sortOrder: 0 },
      { id: "g", role: "groom", fullName: "Bima Satria", nickname: "Bima", fatherName: null, motherName: null, photoUrl: null, bio: null, sortOrder: 1 },
    ],
    events: [{ id: "event", eventType: "Resepsi", title: "Resepsi", eventDate: "2030-10-20",
      startTime: "10:00:00", endTime: "12:00:00", venueName: "Kebun Raya", address: null,
      mapsUrl: null, livestreamUrl: null, sortOrder: 0 }],
    stories: [{ id: "s", title: "Bertemu", storyDate: null, yearLabel: "2021", description: "Di perpustakaan.", imageUrl: null, sortOrder: 0 }],
    gallery: [
      { id: "g1", imageUrl: "/a.jpg", caption: "Kebun pagi", altText: null, aspectRatio: "portrait_4_5", sortOrder: 0 },
      { id: "g2", imageUrl: "/b.jpg", caption: null, altText: "Foto kedua", aspectRatio: "landscape_16_9", sortOrder: 1 },
      { id: "g3", imageUrl: "/c.jpg", caption: null, altText: null, aspectRatio: "square_1_1", sortOrder: 2 },
    ],
    gifts: [], wishes: [],
    content: { openingQuote: null, openingMessage: null, closingMessage: null },
    features: { music: false, countdown: false, maps: false, story: true, gallery: true, dressCode: false,
      livestream: false, rsvp: false, wishes: true, gift: false, guestPersonalization: false },
    media: { coverImageUrl: null, musicUrl: null },
    ...overrides,
  };
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

const styles = () => readFileSync(resolve(terraRoot, "ThemeStyles.tsx"), "utf8");

test("the Herbarium Cinta palette keeps every text pair at WCAG AA", () => {
  const token = Object.fromEntries([...styles().matchAll(/--tb-([a-z-]+):\s*(#[0-9A-Fa-f]{6})/g)].map(([, name, hex]) => [name, hex]));
  assert.deepEqual(
    [token.linen, token.moss, token.clay, token.cacao, token.sun, token.bone],
    ["#F2EBDD", "#4E5B3A", "#B5653E", "#4A3426", "#D9A441", "#FBF7EE"],
  );
  for (const [fg, bg, min] of [
    ["cacao", "linen", 7], ["cacao", "bone", 7], ["moss", "linen", 4.5], ["moss", "bone", 4.5],
    ["bone", "moss", 4.5], ["clay-ink", "bone", 4.5], ["clay-ink", "linen", 4.5],
  ]) {
    assert.ok(contrast(token[fg], token[bg]) >= min, `--tb-${fg} on --tb-${bg} is ${contrast(token[fg], token[bg]).toFixed(2)}`);
  }
  assert.match(styles(), /\.tb-event-index\s*\{[^}]*color:\s*var\(--tb-clay-ink\)/, "small clay labels use the AA ink");
});

test("paper surfaces carry a drawn dot texture, never a raster", () => {
  const css = styles();
  assert.match(css, /:is\(\.tb-surface-linen, \.tb-surface-bone, \.tb-cover\)\s*\{[^}]*radial-gradient\(/);
  assert.doesNotMatch(css, /url\([^)]*\.(png|jpe?g|webp)/);
});
```

In `tests/theme-contract.test.mjs` change the Terra expectation to:

```js
    "terra-botanica": { name: "Terra Botanica", palette: ["#F2EBDD", "#B5653E", "#4E5B3A"] },
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/terra-botanica-identity.test.mjs tests/theme-contract.test.mjs`
Expected: FAIL — old palette values, no `--tb-clay-ink`, no texture rule, registry mismatch.

- [ ] **Step 3: Replace the palette tokens**

In `ThemeStyles.tsx` replace the six colour tokens at the top of `.tb-theme` with:

```css
      --tb-linen: #F2EBDD;
      --tb-clay: #B5653E;
      --tb-moss: #4E5B3A;
      --tb-cacao: #4A3426;
      --tb-sun: #D9A441;
      --tb-bone: #FBF7EE;
      /* Clay for small text: --tb-clay is ~4:1 on bone, this ink stays AA. */
      --tb-clay-ink: #9A4F2E;
```

In the `.tb-event-index` rule replace `color: var(--tb-clay);` with `color: var(--tb-clay-ink);`.

- [ ] **Step 4: Paper texture**

Directly after the `.tb-theme .tb-surface-moss { … }` rule add:

```css
    /* Herbarium paper: a fine printed dot, drawn in CSS so it costs no request. */
    .tb-theme :is(.tb-surface-linen, .tb-surface-bone, .tb-cover) { background-image: radial-gradient(rgba(74, 52, 38, .05) 1px, transparent 1px); background-size: 5px 5px; }
```

- [ ] **Step 5: Registry swatch**

In `src/themes/registry.ts` set the Terra preview palette to:

```ts
      palette: ["#F2EBDD", "#B5653E", "#4E5B3A"],
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `node --test tests/terra-botanica-identity.test.mjs tests/theme-contract.test.mjs`
Expected: PASS. Then `npm test` — all pass.

- [ ] **Step 7: Commit**

```bash
git add src/themes/terra-botanica/ThemeStyles.tsx src/themes/registry.ts tests/theme-contract.test.mjs tests/terra-botanica-identity.test.mjs
git commit -m "feat(terra): herbarium palette and paper texture

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Ink-signature names

**Files:**
- Modify: `src/themes/terra-botanica/CoverGate.tsx` (h1 class)
- Modify: `src/themes/terra-botanica/sections/HeroSection.tsx`, `CoupleSection.tsx`, `ClosingSection.tsx`
- Modify: `src/themes/terra-botanica/ThemeStyles.tsx` (name sizes)
- Test: `tests/terra-botanica-identity.test.mjs`

**Interfaces:**
- Consumes: `.tb-script` (Task 1); `createLoader`, `invitation` (Task 2).

- [ ] **Step 1: Write the failing test**

Append to `tests/terra-botanica-identity.test.mjs`:

```js
test("couple names are ink signatures and chapter titles stay Spectral", () => {
  const { TerraBotanica } = createLoader()("index");
  const html = renderToStaticMarkup(React.createElement(TerraBotanica, { invitation: invitation(), guest: null }));
  const { document } = new JSDOM(html).window;
  assert.equal(document.querySelector("h1").textContent, "Alya & Bima", "cover h1 keeps the plain display name");
  assert.ok(document.querySelector("h1").classList.contains("tb-script"));
  for (const id of ["tb-hero-heading", "tb-closing-heading"]) {
    assert.ok(document.getElementById(id).classList.contains("tb-script"), `${id} is script`);
  }
  const people = [...document.querySelectorAll(".tb-person-copy h3")];
  assert.equal(people.length, 2);
  for (const name of people) assert.ok(name.classList.contains("tb-script"));
  for (const title of document.querySelectorAll(".tb-section-heading h2")) {
    assert.ok(!title.classList.contains("tb-script"), `chapter "${title.textContent}" stays Spectral`);
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test --test-name-pattern="ink signatures" tests/terra-botanica-identity.test.mjs`
Expected: FAIL — h1 lacks `tb-script`.

- [ ] **Step 3: Apply the script class**

`CoverGate.tsx`: `<h1 className="tb-cover-names tb-script">`.

`HeroSection.tsx`: `<h2 id="tb-hero-heading" className="tb-script">{displayName}</h2>`.

`ClosingSection.tsx`: `<h2 id="tb-closing-heading" className="tb-script">{displayName}</h2>`.

`CoupleSection.tsx`: `<h3 className="tb-script">{person.fullName}</h3>`.

In `ThemeStyles.tsx` replace these four declarations (the script face needs no negative tracking and a little more size):

```css
    .tb-theme .tb-cover-names { font-size: clamp(3.4rem, 15vw, 7.5rem); line-height: 1; letter-spacing: 0; max-width: 11ch; }
```

```css
    .tb-theme .tb-hero-copy h2 { max-width: 15ch; font-size: clamp(3.2rem, 11vw, 7rem); line-height: 1.05; letter-spacing: 0; }
```

```css
    .tb-theme .tb-person-copy h3 { font-size: clamp(2.6rem, 7vw, 4.6rem); line-height: 1.1; letter-spacing: 0; }
```

```css
    .tb-theme .tb-closing h2 { max-width: 12ch; font-size: clamp(3rem, 10vw, 6.5rem); line-height: 1.1; letter-spacing: 0; }
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/terra-botanica-identity.test.mjs tests/terra-botanica-render.test.mjs tests/terra-botanica-quality.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/themes/terra-botanica/CoverGate.tsx src/themes/terra-botanica/sections/HeroSection.tsx src/themes/terra-botanica/sections/CoupleSection.tsx src/themes/terra-botanica/sections/ClosingSection.tsx src/themes/terra-botanica/ThemeStyles.tsx tests/terra-botanica-identity.test.mjs
git commit -m "feat(terra): ink-signature couple names

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Shared in-view and scroll-progress hooks

**Files:**
- Create: `src/themes/shared/use-in-view-once.ts`
- Create: `src/themes/shared/use-scroll-progress.ts`
- Create: `tests/theme-motion-hooks.test.mjs`

**Interfaces:**
- Produces:
  - `useInViewOnce(ref: RefObject<Element | null>, rootMargin?: string): { watching: boolean; seen: boolean }` — `watching` becomes true after mount only when `IntersectionObserver` exists; `seen` becomes true the first time the element intersects (then the observer disconnects).
  - `scrollProgress(scrollTop: number, scrollHeight: number, viewportHeight: number): number` — clamped 0–1; returns 1 when the page cannot scroll.
  - `useScrollProgress(target: RefObject<HTMLElement | null>, property: string): void` — writes the page's progress (4 decimals) to `property` on `target` on mount, then at most once per animation frame on scroll/resize.

- [ ] **Step 1: Write the failing tests**

Create `tests/theme-motion-hooks.test.mjs`:

```js
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import vm from "node:vm";
import React, { act, useRef } from "react";
import { createRoot } from "react-dom/client";
import { JSDOM } from "jsdom";
import ts from "typescript";

const nodeRequire = createRequire(import.meta.url);

function loadShared(name) {
  const source = readFileSync(new URL(`../src/themes/shared/${name}.ts`, import.meta.url), "utf8");
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  vm.runInNewContext(output, {
    exports, module: { exports },
    get window() { return globalThis.window; },
    get document() { return globalThis.document; },
    get IntersectionObserver() { return globalThis.IntersectionObserver; },
    require: (moduleName) => nodeRequire(moduleName),
  });
  return exports;
}

class FakeIntersectionObserver {
  static last = null;
  constructor(callback, options) { this.callback = callback; this.options = options; this.disconnected = false; FakeIntersectionObserver.last = this; }
  observe(element) { this.element = element; }
  disconnect() { this.disconnected = true; }
  report(isIntersecting) { this.callback([{ target: this.element, isIntersecting }]); }
}

async function withDom(intersectionObserver, run) {
  const dom = new JSDOM("<div id='root'></div>", { url: "https://invitation.test/", pretendToBeVisual: true });
  const prior = { window: globalThis.window, document: globalThis.document, IntersectionObserver: globalThis.IntersectionObserver, IS_REACT_ACT_ENVIRONMENT: globalThis.IS_REACT_ACT_ENVIRONMENT };
  Object.assign(globalThis, { window: dom.window, document: dom.window.document, IntersectionObserver: intersectionObserver, IS_REACT_ACT_ENVIRONMENT: true });
  const root = createRoot(dom.window.document.getElementById("root"));
  try {
    await run({ dom, root });
  } finally {
    await act(async () => root.unmount());
    Object.assign(globalThis, prior);
    dom.window.close();
  }
}

test("useInViewOnce stays idle without IntersectionObserver so nothing hides", async () => {
  const { useInViewOnce } = loadShared("use-in-view-once");
  let result;
  function Probe() { const ref = useRef(null); result = useInViewOnce(ref); return React.createElement("span", { ref }); }
  await withDom(undefined, async ({ root }) => {
    await act(async () => root.render(React.createElement(Probe)));
    assert.deepEqual(result, { watching: false, seen: false });
  });
});

test("useInViewOnce watches after mount, reports the first intersection once, then disconnects", async () => {
  const { useInViewOnce } = loadShared("use-in-view-once");
  let result;
  function Probe() { const ref = useRef(null); result = useInViewOnce(ref); return React.createElement("span", { ref }); }
  await withDom(FakeIntersectionObserver, async ({ root }) => {
    await act(async () => root.render(React.createElement(Probe)));
    assert.deepEqual(result, { watching: true, seen: false });
    assert.equal(FakeIntersectionObserver.last.options.rootMargin, "0px 0px -10% 0px");
    await act(async () => FakeIntersectionObserver.last.report(false));
    assert.equal(result.seen, false, "a non-intersecting report changes nothing");
    await act(async () => FakeIntersectionObserver.last.report(true));
    assert.deepEqual(result, { watching: true, seen: true });
    assert.equal(FakeIntersectionObserver.last.disconnected, true);
  });
});

test("scrollProgress clamps to 0–1 and treats an unscrollable page as complete", () => {
  const { scrollProgress } = loadShared("use-scroll-progress");
  assert.equal(scrollProgress(0, 3000, 1000), 0);
  assert.equal(scrollProgress(1000, 3000, 1000), 0.5);
  assert.equal(scrollProgress(2400, 3000, 1000), 1);
  assert.equal(scrollProgress(-50, 3000, 1000), 0);
  assert.equal(scrollProgress(0, 800, 1000), 1);
});

test("useScrollProgress writes progress to a custom property and follows scrolling", async () => {
  const { useScrollProgress } = loadShared("use-scroll-progress");
  let element;
  function Probe() { const ref = useRef(null); useScrollProgress(ref, "--probe"); return React.createElement("div", { ref: (node) => { ref.current = node; element = node; } }); }
  await withDom(undefined, async ({ dom, root }) => {
    Object.defineProperty(dom.window.document.documentElement, "scrollHeight", { configurable: true, value: 3000 });
    Object.defineProperty(dom.window, "innerHeight", { configurable: true, value: 1000 });
    await act(async () => root.render(React.createElement(Probe)));
    assert.equal(element.style.getPropertyValue("--probe"), "0.0000");
    Object.defineProperty(dom.window, "scrollY", { configurable: true, value: 1500 });
    dom.window.dispatchEvent(new dom.window.Event("scroll"));
    await act(async () => new Promise((resolve) => dom.window.requestAnimationFrame(() => resolve())));
    assert.equal(element.style.getPropertyValue("--probe"), "0.7500");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/theme-motion-hooks.test.mjs`
Expected: FAIL — ENOENT for `use-in-view-once.ts`.

- [ ] **Step 3: Write the hooks**

Create `src/themes/shared/use-in-view-once.ts`:

```ts
"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * Watches an element until it first scrolls into view. `watching` turns
 * true only after mount and only where IntersectionObserver exists, so the
 * server markup and the first client render always agree and content is
 * never hidden in a browser that could not reveal it again.
 */
export function useInViewOnce(
  ref: RefObject<Element | null>,
  rootMargin = "0px 0px -10% 0px",
): { watching: boolean; seen: boolean } {
  const [watching, setWatching] = useState(false);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") return;
    setWatching(true);
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setSeen(true);
        observer.disconnect();
      }
    }, { rootMargin });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, rootMargin]);

  return { watching, seen };
}
```

Create `src/themes/shared/use-scroll-progress.ts`:

```ts
"use client";

import { useEffect, type RefObject } from "react";

/** Page scroll position as 0–1; an unscrollable page counts as complete. */
export function scrollProgress(scrollTop: number, scrollHeight: number, viewportHeight: number): number {
  const range = scrollHeight - viewportHeight;
  if (range <= 0) return 1;
  return Math.min(1, Math.max(0, scrollTop / range));
}

/**
 * Writes the page's scroll progress to `property` on `target`, at most once
 * per animation frame. CSS reads the custom property, so scrolling never
 * re-renders React.
 */
export function useScrollProgress(target: RefObject<HTMLElement | null>, property: string): void {
  useEffect(() => {
    const element = target.current;
    if (!element) return;
    let frame = 0;
    const write = () => {
      frame = 0;
      const progress = scrollProgress(window.scrollY, document.documentElement.scrollHeight, window.innerHeight);
      element.style.setProperty(property, progress.toFixed(4));
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(write);
    };
    write();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [target, property]);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/theme-motion-hooks.test.mjs`
Expected: PASS (4 tests). Then `npm run lint && npm run typecheck` — clean.

- [ ] **Step 5: Commit**

```bash
git add src/themes/shared/use-in-view-once.ts src/themes/shared/use-scroll-progress.ts tests/theme-motion-hooks.test.mjs
git commit -m "feat(themes): shared in-view and scroll-progress hooks

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Seed-to-bloom opener

**Files:**
- Create: `src/themes/terra-botanica/components/SeedBloom.tsx`
- Modify: `src/themes/terra-botanica/CoverGate.tsx`
- Modify: `src/themes/terra-botanica/ThemeStyles.tsx`
- Test: `tests/terra-botanica-identity.test.mjs`

**Interfaces:**
- Consumes: tokens `--tb-moss`, `--tb-clay`, `--tb-sun`, `--tb-cacao`; `.tb-label`; `createLoader`, `invitation` (Task 2).
- Produces: `SeedBloom()` → `<svg class="tb-bloom" aria-hidden="true">` containing `.tb-bloom-seed`, `.tb-bloom-stem` (`pathLength="1"`), two `.tb-bloom-leaf`, three `.tb-bloom-petal`, `.tb-bloom-core`.

- [ ] **Step 1: Write the failing test**

Append to `tests/terra-botanica-identity.test.mjs`:

```js
test("the cover carries a seed that blooms when the invitation opens", () => {
  const { TerraBotanica } = createLoader()("index");
  const html = renderToStaticMarkup(React.createElement(TerraBotanica, { invitation: invitation(), guest: null }));
  const { document } = new JSDOM(html).window;
  const bloom = document.querySelector("#tb-cover svg.tb-bloom");
  assert.ok(bloom, "bloom sits on the cover");
  assert.equal(bloom.getAttribute("aria-hidden"), "true");
  assert.ok(bloom.querySelector(".tb-bloom-seed"));
  assert.equal(bloom.querySelector(".tb-bloom-stem").getAttribute("pathLength"), "1");
  assert.equal(bloom.querySelectorAll(".tb-bloom-leaf").length, 2);
  assert.equal(bloom.querySelectorAll(".tb-bloom-petal").length, 3);
  assert.ok(bloom.querySelector(".tb-bloom-core"));
  assert.equal(document.querySelector("#tb-cover button").textContent.trim(), "Buka Undangan");
  assert.match(document.querySelector("#tb-cover").textContent, /Rosa amoris/, "specimen accent");

  const css = styles();
  assert.match(css, /\[data-opened="true"\] \.tb-bloom-stem\s*\{[^}]*animation:/);
  assert.match(css, /\[data-opened="true"\] \.tb-cover\s*\{[^}]*transition:[^}]*1100ms/, "cover waits for the bloom before fading");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test --test-name-pattern="seed that blooms" tests/terra-botanica-identity.test.mjs`
Expected: FAIL — no `svg.tb-bloom`.

- [ ] **Step 3: Write the component**

Create `src/themes/terra-botanica/components/SeedBloom.tsx`:

```tsx
/**
 * A pressed-flower seed on the cover. When the gate opens
 * (`.tb-gate[data-opened="true"]`), CSS draws the stem, unfolds the leaves
 * and opens the petals one by one. Decorative only.
 */
export function SeedBloom() {
  return (
    <svg className="tb-bloom" viewBox="0 0 96 120" fill="none" aria-hidden="true" focusable="false">
      <path className="tb-bloom-stem" d="M48 118C47 90 50 70 48 46" pathLength={1} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path className="tb-bloom-leaf" d="M48 88C36 80 30 84 26 76c10-2 16 2 22 10Z" fill="var(--tb-moss)" />
      <path className="tb-bloom-leaf tb-bloom-leaf--late" d="M49 72c11-8 17-4 23-12-10-2-17 3-23 10Z" fill="var(--tb-moss)" />
      <g transform="translate(48 34)">
        {[0, 60, 120].map((angle, index) => (
          <g key={angle} transform={`rotate(${angle})`}>
            <ellipse
              className="tb-bloom-petal"
              rx="7"
              ry="15"
              fill={index === 1 ? "var(--tb-clay)" : "#C98463"}
              style={{ animationDelay: `${0.85 + index * 0.08}s` }}
            />
          </g>
        ))}
        <circle className="tb-bloom-core" r="5" fill="var(--tb-sun)" />
      </g>
      <circle className="tb-bloom-seed" cx="48" cy="116" r="3" fill="var(--tb-cacao)" />
    </svg>
  );
}
```

- [ ] **Step 4: Put it on the cover**

In `CoverGate.tsx` import it (`import { SeedBloom } from "./components/SeedBloom";`) and make the start of `.tb-cover-title` read:

```tsx
            <div className="tb-cover-title">
              <SeedBloom />
              <p className="tb-journal-label">{label}</p>
```

and directly after the `{dateLabel ? <time … /> : null}` line add the decorative specimen accent:

```tsx
              <p className="tb-specimen tb-label" aria-hidden="true">Rosa amoris · No. 01</p>
```

- [ ] **Step 5: Bloom and cover timing CSS**

In `ThemeStyles.tsx` replace the opened-cover rule

```css
    .tb-theme .tb-gate[data-opened="true"] .tb-cover {
      transform: translateY(-6%); opacity: 0; visibility: hidden; pointer-events: none;
    }
```

with

```css
    /* The cover stays while the seed blooms (~1.2s), then lifts away. It stops
       taking taps immediately so the revealed content is usable at once. */
    .tb-theme .tb-gate[data-opened="true"] .tb-cover {
      transform: translateY(-6%); opacity: 0; visibility: hidden; pointer-events: none;
      transition: transform 600ms cubic-bezier(.65, 0, .25, 1) 1100ms, opacity 600ms ease 1100ms, visibility 0s 1700ms;
    }
    .tb-theme .tb-bloom { display: block; width: clamp(64px, 16vw, 96px); height: auto; margin-bottom: 1.5rem; color: var(--tb-moss); }
    .tb-theme .tb-bloom-stem { stroke-dasharray: 1; stroke-dashoffset: 1; }
    .tb-theme :is(.tb-bloom-leaf, .tb-bloom-petal, .tb-bloom-core) { transform-box: fill-box; transform-origin: center; transform: scale(0); }
    .tb-theme .tb-gate[data-opened="true"] .tb-bloom-stem { animation: tb-bloom-draw .7s cubic-bezier(.4, 0, .2, 1) forwards; }
    .tb-theme .tb-gate[data-opened="true"] .tb-bloom-leaf { animation: tb-bloom-pop .4s .45s cubic-bezier(.3, 1.4, .5, 1) forwards; }
    .tb-theme .tb-gate[data-opened="true"] .tb-bloom-leaf--late { animation-delay: .6s; }
    .tb-theme .tb-gate[data-opened="true"] .tb-bloom-petal { animation: tb-bloom-pop .45s cubic-bezier(.3, 1.4, .5, 1) forwards; }
    .tb-theme .tb-gate[data-opened="true"] .tb-bloom-core { animation: tb-bloom-pop .3s 1.1s forwards; }
    @keyframes tb-bloom-draw { to { stroke-dashoffset: 0; } }
    @keyframes tb-bloom-pop { to { transform: scale(1); } }
    .tb-theme .tb-specimen { margin-top: 1rem; font-size: .8125rem; color: var(--tb-moss); }
```

(The existing `@media (prefers-reduced-motion: reduce)` rule already removes all transitions and animations, so a reduced-motion cover hides at once.)

- [ ] **Step 6: Run tests to verify they pass**

Run: `node --test tests/terra-botanica-identity.test.mjs tests/terra-botanica-render.test.mjs tests/terra-botanica-quality.test.mjs`
Expected: PASS (render tests still find "Buka Undangan" as the first button and `h1` text "Alya & Bima").

- [ ] **Step 7: Commit**

```bash
git add src/themes/terra-botanica/components/SeedBloom.tsx src/themes/terra-botanica/CoverGate.tsx src/themes/terra-botanica/ThemeStyles.tsx tests/terra-botanica-identity.test.mjs
git commit -m "feat(terra): seed-to-bloom opener

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Vine that grows with scrolling

**Files:**
- Create: `src/themes/terra-botanica/components/GrowingVine.tsx`
- Modify: `src/themes/terra-botanica/TerraBotanica.tsx`
- Modify: `src/themes/terra-botanica/ThemeStyles.tsx`
- Test: `tests/terra-botanica-identity.test.mjs`

**Interfaces:**
- Consumes: `useScrollProgress(target, property)` (Task 4); `createLoader`, `mount`, `invitation` (Task 2).
- Produces: `GrowingVine()` → `<div class="tb-vine" aria-hidden="true">` whose inline style carries `--tb-progress`.

- [ ] **Step 1: Write the failing test**

Append to `tests/terra-botanica-identity.test.mjs`:

```js
test("a vine along the page edge grows with scroll progress", async () => {
  const { GrowingVine } = createLoader()("components/GrowingVine");
  const view = await mount(React.createElement(GrowingVine));
  try {
    const vine = view.document.querySelector(".tb-vine");
    assert.equal(vine.getAttribute("aria-hidden"), "true");
    assert.equal(vine.querySelector(".tb-vine-stem").getAttribute("pathLength"), "1");
    const leaves = vine.querySelectorAll(".tb-vine-leaf");
    assert.ok(leaves.length >= 6);
    for (const leaf of leaves) assert.match(leaf.getAttribute("style"), /--tb-at:\s*0\.\d+/);
    assert.equal(vine.style.getPropertyValue("--tb-progress"), "1.0000", "jsdom cannot scroll, so the vine is complete");
  } finally {
    await view.cleanup();
  }

  const { TerraBotanica } = createLoader()("index");
  const { document } = new JSDOM(renderToStaticMarkup(React.createElement(TerraBotanica, { invitation: invitation(), guest: null }))).window;
  assert.ok(document.querySelector("#tb-content .tb-vine"), "the vine lives inside the invitation content, not on the cover");

  const css = styles();
  assert.match(css, /\.tb-vine-stem\s*\{[^}]*stroke-dashoffset:\s*calc\(1 - var\(--tb-progress\)\)/);
  assert.match(css, /prefers-reduced-motion: reduce\)[\s\S]*\.tb-vine\s*\{\s*--tb-progress:\s*1 !important/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test --test-name-pattern="vine along" tests/terra-botanica-identity.test.mjs`
Expected: FAIL — "Missing module: …/components/GrowingVine".

- [ ] **Step 3: Write the component**

Create `src/themes/terra-botanica/components/GrowingVine.tsx`:

```tsx
"use client";

import { useRef, type CSSProperties } from "react";

import { useScrollProgress } from "@/themes/shared/use-scroll-progress";

// Leaves alternate sides of the stem; `at` is the scroll progress where each unfolds.
const LEAVES = [
  { at: 0.1, d: "M24 130c10-10 18-6 20-14-8-2-14 4-20 12Z" },
  { at: 0.24, d: "M20 290c-10-10-18-6-20-14 8-2 14 4 20 12Z" },
  { at: 0.38, d: "M24 430c10-10 18-6 20-14-8-2-14 4-20 12Z" },
  { at: 0.52, d: "M20 570c-10-10-18-6-20-14 8-2 14 4 20 12Z" },
  { at: 0.66, d: "M24 710c10-10 18-6 20-14-8-2-14 4-20 12Z" },
  { at: 0.8, d: "M20 850c-10-10-18-6-20-14 8-2 14 4 20 12Z" },
] as const;

/**
 * One climbing vine on the page edge. It grows with scroll progress, a leaf
 * unfolds at each chapter and a flower opens at the closing. Decorative.
 */
export function GrowingVine() {
  const ref = useRef<HTMLDivElement>(null);
  useScrollProgress(ref, "--tb-progress");

  return (
    <div ref={ref} className="tb-vine" aria-hidden="true">
      <svg viewBox="0 0 44 1000" preserveAspectRatio="none" focusable="false">
        <path
          className="tb-vine-stem"
          d="M22 0C6 80 38 160 22 250S6 410 22 500 38 660 22 750 6 910 22 1000"
          pathLength={1}
          vectorEffect="non-scaling-stroke"
        />
        {LEAVES.map((leaf) => (
          <path key={leaf.at} className="tb-vine-leaf" d={leaf.d} style={{ "--tb-at": leaf.at } as CSSProperties} />
        ))}
        <circle className="tb-vine-leaf tb-vine-flower" cx="22" cy="975" r="9" style={{ "--tb-at": 0.94 } as CSSProperties} />
      </svg>
    </div>
  );
}
```

- [ ] **Step 4: Mount it and style it**

In `TerraBotanica.tsx` import `GrowingVine` (`import { GrowingVine } from "./components/GrowingVine";`) and make it the first child inside `<CoverGate …>`:

```tsx
        <GrowingVine />
        <HeroSection displayName={coupleDisplayName} imageUrl={heroImageUrl} message={invitation.content.openingMessage} />
```

In `ThemeStyles.tsx` add before the `@media (min-width: 768px)` block:

```css
    /* Climbing vine: fixed to the page edge inside the gutter; its growth is
       a CSS read of --tb-progress, written by useScrollProgress. */
    .tb-theme .tb-vine { position: fixed; z-index: 1; top: 0; bottom: 0; left: max(2px, env(safe-area-inset-left)); width: clamp(18px, 3vw, 36px); pointer-events: none; color: var(--tb-moss); opacity: .55; --tb-progress: 0; }
    .tb-theme .tb-vine svg { display: block; width: 100%; height: 100%; overflow: visible; }
    .tb-theme .tb-vine-stem { fill: none; stroke: currentColor; stroke-width: 1.4; stroke-dasharray: 1; stroke-dashoffset: calc(1 - var(--tb-progress)); }
    .tb-theme .tb-vine-leaf { fill: currentColor; transform-box: fill-box; transform-origin: center; transform: scale(clamp(0, (var(--tb-progress) - var(--tb-at)) * 12, 1)); }
    .tb-theme .tb-vine-flower { fill: var(--tb-clay); }
```

and inside the existing `@media (prefers-reduced-motion: reduce) { … }` block add:

```css
      .tb-theme .tb-vine { --tb-progress: 1 !important; }
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `node --test tests/terra-botanica-identity.test.mjs tests/terra-botanica-render.test.mjs tests/terra-botanica-quality.test.mjs tests/invitation-time-zone.test.mjs`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/themes/terra-botanica/components/GrowingVine.tsx src/themes/terra-botanica/TerraBotanica.tsx src/themes/terra-botanica/ThemeStyles.tsx tests/terra-botanica-identity.test.mjs
git commit -m "feat(terra): vine that grows with scrolling

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Typewritten specimen labels

**Files:**
- Create: `src/themes/terra-botanica/components/TypedText.tsx`
- Modify: `src/themes/terra-botanica/sections/EventsSection.tsx`, `StorySection.tsx`, `GallerySection.tsx`
- Modify: `src/themes/terra-botanica/ThemeStyles.tsx`
- Test: `tests/terra-botanica-identity.test.mjs`

**Interfaces:**
- Consumes: `useInViewOnce(ref)` (Task 4); `createLoader`, `mount`, `FakeIntersectionObserver` (Task 2).
- Produces: `TypedText({ text: string })` → `<span class="tb-typed" data-typed="idle" | "waiting" | "typed" style="--tb-chars: N">text</span>`.

- [ ] **Step 1: Write the failing test**

Append to `tests/terra-botanica-identity.test.mjs`:

```js
test("specimen labels type out once in view and keep their full text for readers", async () => {
  const { EventsSection } = createLoader()("sections/EventsSection");
  const event = invitation().events[0];
  const props = { events: [event], mapsEnabled: false, coupleDisplayName: "Alya & Bima", invitationId: "terra", timeZone: "Asia/Jakarta" };

  const idle = await mount(React.createElement(EventsSection, props));
  try {
    const labels = idle.document.querySelectorAll(".tb-typed");
    assert.equal(labels.length, 2, "date and time are typed labels");
    for (const label of labels) assert.equal(label.dataset.typed, "idle", "no observer: stays fully visible");
    assert.match(idle.document.querySelector(".tb-event-time").textContent, /10:00\s*–\s*12:00 WIB/);
  } finally { await idle.cleanup(); }

  FakeIntersectionObserver.instances = [];
  const watched = await mount(React.createElement(EventsSection, props), { intersectionObserver: FakeIntersectionObserver });
  try {
    const time = watched.document.querySelector(".tb-event-time .tb-typed");
    assert.equal(time.dataset.typed, "waiting");
    assert.equal(time.style.getPropertyValue("--tb-chars"), String(time.textContent.length));
    await act(async () => FakeIntersectionObserver.instances.forEach((observer) => observer.trigger()));
    assert.equal(time.dataset.typed, "typed");
  } finally { await watched.cleanup(); }

  const { StorySection } = createLoader()("sections/StorySection");
  const story = new JSDOM(renderToStaticMarkup(React.createElement(StorySection, { stories: invitation().stories }))).window.document;
  assert.equal(story.querySelector(".tb-story-date .tb-typed").textContent, "2021");

  const css = styles();
  assert.match(css, /\.tb-typed\[data-typed="typed"\]\s*\{[^}]*steps\(var\(--tb-chars\)/);
  assert.match(css, /prefers-reduced-motion: reduce\)[\s\S]*\.tb-typed\[data-typed\]\s*\{\s*clip-path:\s*none !important/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test --test-name-pattern="specimen labels" tests/terra-botanica-identity.test.mjs`
Expected: FAIL — `labels.length` is 0.

- [ ] **Step 3: Write the component**

Create `src/themes/terra-botanica/components/TypedText.tsx`:

```tsx
"use client";

import { useRef, type CSSProperties } from "react";

import { useInViewOnce } from "@/themes/shared/use-in-view-once";

/**
 * A specimen label typed out once when it scrolls into view. The text is
 * always in the DOM, so screen readers and readers without JavaScript get
 * it immediately; only its visible width is revealed character by character.
 */
export function TypedText({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const { watching, seen } = useInViewOnce(ref);
  const state = seen ? "typed" : watching ? "waiting" : "idle";

  return (
    <span
      ref={ref}
      className="tb-typed"
      data-typed={state}
      style={{ "--tb-chars": Math.max(1, text.length) } as CSSProperties}
    >
      {text}
    </span>
  );
}
```

- [ ] **Step 4: Use it for dates, times and captions**

`EventsSection.tsx` — import `TypedText` from `"../components/TypedText"` and replace the date and time lines with:

```tsx
                {dateIsValid ? <time dateTime={event.eventDate}><TypedText text={new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${event.eventDate}T00:00:00Z`))} /></time> : null}
                {start ? <p className="tb-event-time"><TypedText text={`${start}${end ? ` – ${end}` : ""} ${timeZoneLabel(timeZone)}`} /></p> : null}
```

`StorySection.tsx` — import `TypedText` and replace the date line with:

```tsx
                {story.yearLabel?.trim() ? <p className="tb-story-date"><TypedText text={story.yearLabel} /></p> : dateLabel ? <time className="tb-story-date" dateTime={story.storyDate ?? undefined}><TypedText text={dateLabel} /></time> : null}
```

`GallerySection.tsx` — import `TypedText` and replace the caption line with:

```tsx
              {item.caption?.trim() ? <figcaption><TypedText text={item.caption} /></figcaption> : null}
```

- [ ] **Step 5: Typing CSS**

In `ThemeStyles.tsx` add before the `@media (min-width: 768px)` block:

```css
    /* Typewriter labels: hidden only once the observer is armed, then revealed
       one character step at a time. */
    .tb-theme .tb-typed { display: inline-block; max-width: 100%; }
    .tb-theme .tb-typed[data-typed="waiting"] { clip-path: inset(0 100% 0 0); }
    .tb-theme .tb-typed[data-typed="typed"] { animation: tb-type calc(var(--tb-chars) * 38ms) steps(var(--tb-chars), end) both; }
    @keyframes tb-type { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); } }
```

and inside the reduced-motion block add:

```css
      .tb-theme .tb-typed[data-typed] { clip-path: none !important; }
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `node --test tests/terra-botanica-identity.test.mjs tests/terra-botanica-render.test.mjs tests/terra-botanica-quality.test.mjs tests/invitation-time-zone.test.mjs tests/gallery-gift-parity.test.mjs`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/themes/terra-botanica/components/TypedText.tsx src/themes/terra-botanica/sections/EventsSection.tsx src/themes/terra-botanica/sections/StorySection.tsx src/themes/terra-botanica/sections/GallerySection.tsx src/themes/terra-botanica/ThemeStyles.tsx tests/terra-botanica-identity.test.mjs
git commit -m "feat(terra): typewritten specimen labels

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Dandelion after a sent wish

**Files:**
- Create: `src/themes/terra-botanica/components/DandelionRelease.tsx`
- Modify: `src/themes/terra-botanica/sections/WishesSection.tsx`
- Modify: `src/themes/terra-botanica/ThemeStyles.tsx`
- Modify: `tests/theme-shared-behavior.test.mjs` (stub)
- Test: `tests/terra-botanica-identity.test.mjs`

**Interfaces:**
- Consumes: `useWishForm()` state (unchanged); `useReducedMotion` from `motion/react`; `createLoader({ reducedMotion, actions })`, `mount` (Task 2).
- Produces: `DandelionRelease()` → `<div class="tb-dandelion" data-tb-dandelion aria-hidden="true">` with one `.tb-dandelion-stalk` and 18 `.tb-dandelion-seed`, or `null` under reduced motion.

- [ ] **Step 1: Write the failing tests**

Append to `tests/terra-botanica-identity.test.mjs`:

```js
test("a sent wish releases dandelion seeds and keeps the thank-you visible", async () => {
  const { DandelionRelease } = createLoader()("components/DandelionRelease");
  const head = new JSDOM(renderToStaticMarkup(React.createElement(DandelionRelease))).window.document.querySelector("[data-tb-dandelion]");
  assert.equal(head.getAttribute("aria-hidden"), "true");
  assert.equal(head.querySelectorAll(".tb-dandelion-seed").length, 18);
  assert.equal(head.querySelectorAll(".tb-dandelion-stalk").length, 1);
  const still = createLoader({ reducedMotion: true })("components/DandelionRelease").DandelionRelease;
  assert.equal(renderToStaticMarkup(React.createElement(still)), "");

  const { WishesSection } = createLoader({ actions: { submitWish: async () => ({ status: "success" }) } })("sections/WishesSection");
  const view = await mount(React.createElement(WishesSection, { invitationId: "terra", slug: "terra", guestToken: "t", guestName: "Bude Sri", wishes: [] }));
  try {
    const form = view.document.querySelector("#tb-ucapan form");
    form.elements.namedItem("message").value = "Bahagia selalu";
    await act(async () => form.dispatchEvent(new view.window.Event("submit", { bubbles: true, cancelable: true })));
    const section = view.document.getElementById("tb-ucapan");
    assert.match(section.querySelector('[role="status"]').textContent, /Terima kasih atas ucapan dan doanya/);
    assert.ok(section.querySelector("[data-tb-dandelion]"));
  } finally { await view.cleanup(); }
});
```

In `tests/theme-shared-behavior.test.mjs`, inside `loadSection`'s `require(moduleName)` add before the final `return nodeRequire(moduleName);`:

```js
      if (moduleName.endsWith("/DandelionRelease")) return { DandelionRelease: () => React.createElement("div", { "data-tb-dandelion": "" }) };
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test --test-name-pattern="dandelion" tests/terra-botanica-identity.test.mjs`
Expected: FAIL — "Missing module: …/DandelionRelease".

- [ ] **Step 3: Write the component**

Create `src/themes/terra-botanica/components/DandelionRelease.tsx`:

```tsx
"use client";

import type { CSSProperties } from "react";
import { useReducedMotion } from "motion/react";

// Deterministic spread (no Math.random) so every render is identical.
const SEEDS = Array.from({ length: 18 }, (_, index) => ({
  angle: index * 20,
  dx: 110 + ((index * 37) % 170),
  dy: -(50 + ((index * 53) % 130)),
  delay: 0.45 + (index % 6) * 0.06,
}));

/**
 * A dandelion clock whose seeds lift away once a wish is sent — "a hope
 * carried on the wind". Mounted by the success state; decorative only.
 */
export function DandelionRelease() {
  const reduced = useReducedMotion() ?? false;
  if (reduced) return null;

  return (
    <div className="tb-dandelion" data-tb-dandelion="" aria-hidden="true">
      <span className="tb-dandelion-stalk" />
      {SEEDS.map((seed) => (
        <span
          key={seed.angle}
          className="tb-dandelion-seed"
          style={{
            "--tb-angle": `${seed.angle}deg`,
            "--tb-dx": `${seed.dx}px`,
            "--tb-dy": `${seed.dy}px`,
            animationDelay: `${seed.delay}s`,
          } as CSSProperties}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Wire it and style it**

In `WishesSection.tsx` import `DandelionRelease` from `"../components/DandelionRelease"` and replace the success paragraph with:

```tsx
          <div className="tb-wish-sent">
            <p className="tb-form-success" role="status">Terima kasih atas ucapan dan doanya.</p>
            <DandelionRelease />
          </div>
```

In `ThemeStyles.tsx` add before the `@media (min-width: 768px)` block:

```css
    .tb-theme .tb-dandelion { position: relative; width: 120px; height: 130px; margin-top: 1.5rem; pointer-events: none; }
    .tb-theme .tb-dandelion-stalk { position: absolute; left: 59px; top: 56px; width: 1.5px; height: 74px; background: var(--tb-moss); }
    .tb-theme .tb-dandelion-seed { position: absolute; left: 60px; top: 56px; width: 1px; height: 26px; background: rgba(74, 52, 38, .45); transform-origin: 0 0; transform: rotate(var(--tb-angle)); animation: tb-seed-drift 2.6s cubic-bezier(.2, .6, .3, 1) forwards; }
    .tb-theme .tb-dandelion-seed::after { content: ""; position: absolute; top: 22px; left: -6px; width: 12px; height: 12px; border-radius: 50%; border: 1px dotted rgba(74, 52, 38, .55); }
    @keyframes tb-seed-drift { to { transform: translate(var(--tb-dx), var(--tb-dy)) rotate(calc(var(--tb-angle) + 140deg)); opacity: 0; } }
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `node --test tests/terra-botanica-identity.test.mjs tests/theme-shared-behavior.test.mjs tests/terra-botanica-render.test.mjs`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/themes/terra-botanica/components/DandelionRelease.tsx src/themes/terra-botanica/sections/WishesSection.tsx src/themes/terra-botanica/ThemeStyles.tsx tests/theme-shared-behavior.test.mjs tests/terra-botanica-identity.test.mjs
git commit -m "feat(terra): dandelion seeds after a sent wish

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Photos taped into the herbarium

**Files:**
- Modify: `src/themes/terra-botanica/sections/GallerySection.tsx`
- Modify: `src/themes/terra-botanica/ThemeStyles.tsx`
- Test: `tests/terra-botanica-identity.test.mjs`

**Interfaces:**
- Consumes: `useInViewOnce(ref)` (Task 4); `createLoader`, `mount`, `FakeIntersectionObserver`, `invitation` (Task 2).
- Produces: gallery grid `data-settle="waiting" | "settled"` (absent without an observer); each `.tb-gallery-item` carries `--tb-tilt` and `--tb-drop-delay`.

- [ ] **Step 1: Write the failing test**

Append to `tests/terra-botanica-identity.test.mjs`:

```js
test("gallery photos drop in and settle, taped and tilted, without losing the lightbox", async () => {
  const { GallerySection } = createLoader()("sections/GallerySection");
  const props = { gallery: invitation().gallery, displayName: "Alya & Bima" };

  const plain = await mount(React.createElement(GallerySection, props));
  try {
    assert.equal(plain.document.querySelector(".tb-gallery-grid").hasAttribute("data-settle"), false, "no observer: photos simply show");
  } finally { await plain.cleanup(); }

  FakeIntersectionObserver.instances = [];
  const view = await mount(React.createElement(GallerySection, props), { intersectionObserver: FakeIntersectionObserver });
  try {
    const grid = view.document.querySelector(".tb-gallery-grid");
    assert.equal(grid.dataset.settle, "waiting");
    const items = [...grid.querySelectorAll(".tb-gallery-item")];
    assert.equal(items.length, 3);
    for (const item of items) {
      assert.match(item.style.getPropertyValue("--tb-tilt"), /^-?\d+(\.\d+)?deg$/);
      assert.match(item.style.getPropertyValue("--tb-drop-delay"), /^\d+(\.\d+)?s$/);
    }
    await act(async () => FakeIntersectionObserver.instances.forEach((observer) => observer.trigger()));
    assert.equal(grid.dataset.settle, "settled");
    assert.ok(grid.querySelector("button[aria-label^='Perbesar foto 1 dari 3']"), "lightbox trigger intact");
  } finally { await view.cleanup(); }

  const css = styles();
  assert.match(css, /\.tb-gallery-item::before\s*\{[^}]*rgba\(217, 164, 65/, "paper tape");
  assert.match(css, /\[data-settle="waiting"\] \.tb-gallery-item\s*\{[^}]*opacity:\s*0/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test --test-name-pattern="drop in and settle" tests/terra-botanica-identity.test.mjs`
Expected: FAIL — `data-settle` missing.

- [ ] **Step 3: Settle the gallery**

In `GallerySection.tsx`:

- Change the React import line to `import { useRef, type CSSProperties } from "react";` (add it if absent) and import `useInViewOnce` from `"@/themes/shared/use-in-view-once"`.
- Above the component add:

```tsx
// Hand-placed tilt for each print, repeated down the page.
const TILTS = [-2, 1.5, -1, 2.5, -1.5, 1] as const;
```

- Inside the component, after `const lightbox = useGalleryLightbox(gallery.length);`:

```tsx
  const gridRef = useRef<HTMLDivElement>(null);
  const { watching, seen } = useInViewOnce(gridRef);
```

- Replace `<div className="tb-gallery-grid">` with:

```tsx
      <div ref={gridRef} className="tb-gallery-grid" data-settle={seen ? "settled" : watching ? "waiting" : undefined}>
```

- Give each `<figure>` the tilt and a capped stagger:

```tsx
            <figure
              key={item.id}
              data-gallery-item={item.id}
              data-gallery-span={span}
              className="tb-gallery-item"
              style={{ "--tb-tilt": `${TILTS[index % TILTS.length]}deg`, "--tb-drop-delay": `${Math.min(index, 8) * 0.08}s` } as CSSProperties}
            >
```

Note: the `if (gallery.length === 0) return null;` early return must stay after the hooks (it already follows `useGalleryLightbox`; keep `useRef`/`useInViewOnce` above it too).

- [ ] **Step 4: Taped-print CSS**

In `ThemeStyles.tsx` add before the `@media (min-width: 768px)` block:

```css
    /* Herbarium prints: white border, paper tape, a hand-placed tilt; they
       drop in and settle once the gallery scrolls into view. */
    .tb-theme .tb-gallery-item { position: relative; transform: rotate(var(--tb-tilt, 0deg)); }
    .tb-theme .tb-gallery-item .tb-media { border: 6px solid var(--tb-bone); box-shadow: 0 6px 16px -10px rgba(74, 52, 38, .55); }
    .tb-theme .tb-gallery-item::before { content: ""; position: absolute; z-index: 1; top: -9px; left: 50%; width: 64px; height: 18px; margin-left: -32px; background: rgba(217, 164, 65, .45); transform: rotate(-4deg); pointer-events: none; }
    .tb-theme .tb-gallery-grid[data-settle="waiting"] .tb-gallery-item { opacity: 0; transform: translateY(-48px) rotate(calc(var(--tb-tilt, 0deg) * -6)); }
    .tb-theme .tb-gallery-grid[data-settle="settled"] .tb-gallery-item { transition: transform .8s cubic-bezier(.3, 1.3, .5, 1) var(--tb-drop-delay, 0s), opacity .4s ease var(--tb-drop-delay, 0s); }
```

(Reduced motion: the existing rule removes transitions, so prints appear settled at once.)

- [ ] **Step 5: Run tests to verify they pass**

Run: `node --test tests/terra-botanica-identity.test.mjs tests/gallery-gift-parity.test.mjs tests/terra-botanica-render.test.mjs tests/terra-botanica-quality.test.mjs`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/themes/terra-botanica/sections/GallerySection.tsx src/themes/terra-botanica/ThemeStyles.tsx tests/terra-botanica-identity.test.mjs
git commit -m "feat(terra): photos taped into the herbarium

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Docs, verification, visual QA, PR

**Files:**
- Modify: `docs/PROJECT_MEMORY.md` (Terra identity lines; redesign record)
- Modify: `docs/superpowers/specs/2026-09-24-terra-botanica-theme-design.md` (supersede note)
- Modify: `docs/superpowers/specs/2026-10-03-theme-identity-redesign-design.md` (§3 shared hooks note)
- Temporary (never committed): `src/app/qa-fixture/page.tsx`

- [ ] **Step 1: Docs**

`docs/PROJECT_MEMORY.md`:
- In "Product decisions…", replace the Terra bullet's "Fraunces, Manrope, Linen/Clay/Moss/Cacao/Sun/Bone" with "Herr Von Muellerhoff / Courier Prime / Spectral, the Herbarium Cinta palette (see the 2026-10-03 identity spec)".
- In "Terra Botanica design grammar → Visual identity", replace the Display type, Supporting type and Palette bullets with:

```markdown
- Direction since Oct 2026: **Herbarium Cinta** — the couple's pressed-flower
  herbarium (spec `docs/superpowers/specs/2026-10-03-theme-identity-redesign-design.md` §5).
- Type: Herr Von Muellerhoff for couple names; Courier Prime for specimen
  labels, dates, buttons and navigation; Spectral for italic headings and body.
- Palette: Linen `#F2EBDD`, Lumut `#4E5B3A`, Clay `#B5653E` (small text uses
  `--tb-clay-ink` `#9A4F2E`), Cacao `#4A3426`, Sun `#D9A441`, Bone `#FBF7EE`.
```

- In "Theme identity redesign (Oct 2026)", add:

```markdown
- Terra "Herbarium Cinta": seed-to-bloom cover, scroll vine (`GrowingVine`,
  `themes/shared/use-scroll-progress.ts`), typed labels (`TypedText`,
  `themes/shared/use-in-view-once.ts`), dandelion after a sent wish, taped
  gallery prints. Plan: `docs/superpowers/plans/2026-10-03-terra-identity.md`.
  `@fontsource-variable/fraunces` and `manrope` removed.
```

`docs/superpowers/specs/2026-09-24-terra-botanica-theme-design.md`: add directly under the title:

```markdown
> **Superseded (visual direction only), 2026-10-03:** typography, palette, cover
> and ornaments now follow `2026-10-03-theme-identity-redesign-design.md` §5
> ("Herbarium Cinta"). Data, sections, feature gating and accessibility below
> remain authoritative.
```

`docs/superpowers/specs/2026-10-03-theme-identity-redesign-design.md` §3 Signature interactions bullet: replace "The only new shared mechanic is `src/themes/shared/use-scroll-progress.ts` (…); it lands with Terra, the first theme that needs it." with:

```markdown
Terra added two shared mechanics: `use-scroll-progress.ts` (rAF-throttled
0–1 progress written to a CSS custom property) and `use-in-view-once.ts`
(IntersectionObserver that only arms after mount, so server and client
markup agree). Terra uses its own hook rather than Motion because Terra
stays CSS-driven and its test harnesses stub Motion.
```

- [ ] **Step 2: Full verification**

Run: `npm test` — all pass, 0 failures.
Run: `npm run lint && npm run typecheck && npm run build` — each exits 0. If the build reports a stale `.next/dev/types` reference to `qa-fixture`, delete `.next/dev` and retry.

- [ ] **Step 3: Visual QA with fixture data (never a live invitation)**

Create `src/app/qa-fixture/page.tsx` (listed in `.git/info/exclude`) rendering `<ThemeRenderer invitation={…} guest={…} />` with `import "@/themes/theme-fonts";`, `theme.slug: "terra-botanica"`, two events with times, two stories with `yearLabel`, three gallery items pointing at existing files under `public/` (or none if there are none — then check the gallery via the identity test only), wishes enabled, a long guest name. Start the Browser preview (`preview_start` name `web`), open `/qa-fixture`, and check at desktop (mobile emulation clicks are unreliable in this pane; use it for screenshots only, and trigger clicks with `element.click()` via the JS tool):

1. Cover: seed above "The Wedding Journal", script names, Courier date, "Rosa amoris · No. 01"; tap → stem draws, leaves and petals open, then the cover lifts (~1.7s) and taps reach content immediately.
2. Vine on the left edge grows while scrolling; leaves appear; full at the bottom; no horizontal overflow at 375px (`document.documentElement.scrollWidth === innerWidth`).
3. Event date/time and story year type out when scrolled into view.
4. Headings italic Spectral; names Herr Von Muellerhoff; body Spectral ≥16px.

Dandelion (needs a successful wish; Turnstile rejects localhost) is covered by the identity test; optionally mount `<DandelionRelease />` inside a `.tb-theme` wrapper on the fixture page to eyeball it. Delete `src/app/qa-fixture/` and `.next/dev` afterwards.

- [ ] **Step 4: Commit docs and push**

```bash
git add docs/PROJECT_MEMORY.md docs/superpowers/specs/2026-09-24-terra-botanica-theme-design.md docs/superpowers/specs/2026-10-03-theme-identity-redesign-design.md
git commit -m "docs: record the Terra identity redesign

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push -u origin design/terra-identity
```

- [ ] **Step 5: Open the PR and stop**

```bash
gh pr create --base main --title "Terra identity: Herbarium Cinta" --body "$(cat <<'EOF'
Terra Botanica gets its "Herbarium Cinta" identity (spec docs/superpowers/specs/2026-10-03-theme-identity-redesign-design.md §5, plan docs/superpowers/plans/2026-10-03-terra-identity.md):

- Herr Von Muellerhoff (names) / Courier Prime (labels) / Spectral (italic headings, body); Fraunces and Manrope removed
- Linen-lumut-liat palette with AA contrast test, dotted paper texture
- Seed-to-bloom cover opener (music still starts on the first tap)
- Vine that grows with scrolling, typed specimen labels, dandelion after a sent wish, taped gallery prints
- Shared hooks for later themes: use-in-view-once, use-scroll-progress
- Reduced motion: cover hides at once, vine complete, labels fully shown, prints settled, no dandelion

Presentation only; no capability or data changes.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Report the PR link to the user and **wait for an explicit "merge"**.
