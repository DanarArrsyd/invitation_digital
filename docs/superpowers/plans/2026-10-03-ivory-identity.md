# Nusantara Ivory Identity ("Surat dari Keraton") Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give Nusantara Ivory its "Surat dari Keraton" identity — Great Vibes / Cinzel / Lora, the gading-sogan-emas-bata palette with a kawung watermark, a gunungan-gate opener, and three signature interactions (garis canting, hujan melati, cap lilin) — without changing any capability.

**Architecture:** Presentation-only change inside `src/themes/nusantara-ivory/` plus font wiring in `src/themes/theme-fonts.ts`. Animations use CSS keyframes or Motion (`whileInView`, AnimatePresence exit variants) that already ship. Celebrations are components mounted by the success state they celebrate and render nothing under reduced motion.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, Tailwind 4, Motion (`motion/react`), `@fontsource`, `node --test` with vm/ts-transpile harnesses and jsdom.

**Spec:** `docs/superpowers/specs/2026-10-03-theme-identity-redesign-design.md` §3–4, §8–10.

## Global Constraints

- Fonts: Great Vibes (names only) · Cinzel (headings, eyebrows, dates, small capitals) · Lora (body, ≥16px). Self-hosted via `@fontsource`; no Google Fonts at runtime.
- No font may be mapped by two themes.
- Motion animates only `transform`, `opacity`, `clip-path`, `stroke-dashoffset`/`pathLength`, and CSS custom properties; particle effects ≤20 nodes and removed or finished after playing.
- `prefers-reduced-motion: reduce` → cover resolves immediately, drawn rules render final state, melati renders nothing; confirmation text always visible.
- One tap on "Buka Undangan" calls `openInvitation()` synchronously (music starts in the same gesture); the opener never delays it.
- Cover keeps an ivory background (CLAUDE.md); no pasted batik PNGs; motifs are SVG/CSS.
- Text contrast ≥4.5:1 (WCAG AA) for every body/label pair; `--ni-gold` (≈3.4:1) is for rules, ornaments, display-size type only.
- No capability added or removed; every existing test keeps passing.
- Merging to `main` auto-deploys production and changes the live Rayhana & Febri invitation (event 20 Oct 2026): open a PR and **ask the user before merging**.
- Commit messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## File Map

| File | Change |
|---|---|
| `package.json`, `package-lock.json` | add `@fontsource/great-vibes`, `@fontsource-variable/cinzel`, `@fontsource-variable/lora`; remove `@fontsource-variable/cormorant-garamond` (keep `jost`, Midnight adopts it later) |
| `src/themes/theme-fonts.ts` | Ivory block imports the new faces |
| `src/themes/nusantara-ivory/fonts.css` | map `--font-ni-script/-display/-body` |
| `src/themes/nusantara-ivory/fonts.ts` | three face class handles |
| `src/themes/nusantara-ivory/NusantaraIvory.tsx` | apply the three face classes |
| `src/themes/nusantara-ivory/ThemeStyles.tsx` | font tokens, `.ni-script`/`.ni-caps`, palette, kawung watermark, gate/melati/seal CSS |
| `src/themes/registry.ts` | Ivory preview palette |
| `src/themes/nusantara-ivory/components/Ornament.tsx` | new palette strokes; `Gunungan` |
| `src/themes/nusantara-ivory/components/CantingRule.tsx` | new: drawn heading rule |
| `src/themes/nusantara-ivory/components/SectionHeading.tsx` | use `CantingRule`, Cinzel sizing |
| `src/themes/nusantara-ivory/components/MelatiShower.tsx` | new: RSVP celebration |
| `src/themes/nusantara-ivory/components/WaxSeal.tsx` | new: copy stamp |
| `src/themes/nusantara-ivory/CoverGate.tsx` | gunungan gate opener |
| `src/themes/nusantara-ivory/sections/{HeroSection,CoupleSection,ClosingSection}.tsx` | script names |
| `src/themes/nusantara-ivory/sections/RsvpSection.tsx` | melati + "Matur nuwun" |
| `src/themes/nusantara-ivory/sections/GiftAccountCard.tsx` | wax seal |
| `tests/font-delivery.test.mjs` | Ivory faces; no shared face across themes |
| `tests/theme-contract.test.mjs` | Ivory palette |
| `tests/theme-shared-behavior.test.mjs` | MelatiShower stub + melati behaviour |
| `tests/nusantara-ivory-identity.test.mjs` | new: contrast, script names, cover gate, canting, melati, seal |
| `docs/DESIGN.md`, `docs/PROJECT_MEMORY.md` | record the new Ivory direction |

---

### Task 1: Ivory font system

**Files:**
- Modify: `package.json`, `package-lock.json`
- Modify: `src/themes/theme-fonts.ts`
- Modify: `src/themes/nusantara-ivory/fonts.css`, `src/themes/nusantara-ivory/fonts.ts`, `src/themes/nusantara-ivory/NusantaraIvory.tsx`, `src/themes/nusantara-ivory/ThemeStyles.tsx`
- Test: `tests/font-delivery.test.mjs`

**Interfaces:**
- Produces: CSS tokens `--ni-script`, `--ni-display-face`, `--ni-serif` (now Lora) on `.ni-theme`; utility classes `.ni-script` (Great Vibes, names) and `.ni-caps` (Cinzel, small capitals). Later tasks use these class names verbatim. `.ni-display` now renders Cinzel; `.ni-serif` renders Lora.

- [ ] **Step 1: Write the failing test**

In `tests/font-delivery.test.mjs` replace the `"nusantara-ivory"` entry of `THEME_FONTS` with:

```js
  "nusantara-ivory": {
    packages: [/@fontsource\/great-vibes/, /@fontsource-variable\/cinzel/, /@fontsource-variable\/lora/],
    faces: [
      /--font-ni-script:\s*"Great Vibes"/,
      /--font-ni-display:\s*"Cinzel Variable"/,
      /--font-ni-body:\s*"Lora Variable"/,
    ],
  },
```

and append these tests at the end of the file:

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/font-delivery.test.mjs`
Expected: FAIL — "each wedding theme bundles its own fonts" (no `great-vibes` import) and "Ivory styles consume…" (`--ni-script` missing).

- [ ] **Step 3: Install the faces**

```bash
npm install @fontsource/great-vibes@^5.3.0 @fontsource-variable/cinzel@^5.3.0 @fontsource-variable/lora@^5.3.0
npm uninstall @fontsource-variable/cormorant-garamond
```

Expected: `package.json` lists the three new packages and no `cormorant-garamond`; `@fontsource-variable/jost` stays.

- [ ] **Step 4: Wire the faces**

In `src/themes/theme-fonts.ts` replace the Ivory block with:

```ts
// nusantara-ivory
import "@fontsource/great-vibes/400.css";
import "@fontsource-variable/cinzel";
import "@fontsource-variable/lora";
import "@fontsource-variable/lora/wght-italic.css";
import "./nusantara-ivory/fonts.css";
```

Replace `src/themes/nusantara-ivory/fonts.css` with:

```css
.ni-font-script {
  --font-ni-script: "Great Vibes";
}

.ni-font-display {
  --font-ni-display: "Cinzel Variable";
}

.ni-font-body {
  --font-ni-body: "Lora Variable";
}
```

Replace `src/themes/nusantara-ivory/fonts.ts` with:

```ts
/** Script face — couple names and short signatures only. */
export const scriptFace = { variable: "ni-font-script" } as const;

/** Display face — inscription capitals for headings, eyebrows, dates. */
export const displayFace = { variable: "ni-font-display" } as const;

/** Text face — book serif for body copy, forms and long reading. */
export const bodyFace = { variable: "ni-font-body" } as const;
```

In `src/themes/nusantara-ivory/NusantaraIvory.tsx` change the import and root class:

```tsx
import { bodyFace, displayFace, scriptFace } from "./fonts";
```

```tsx
    <div className={`ni-theme ${scriptFace.variable} ${displayFace.variable} ${bodyFace.variable}`}>
```

- [ ] **Step 5: Retarget the Ivory type tokens**

In `src/themes/nusantara-ivory/ThemeStyles.tsx`:

Replace

```css
  --ni-serif: var(--font-nusantara-serif), "Iowan Old Style", Georgia, serif;
  --ni-sans: var(--font-nusantara-sans), ui-sans-serif, system-ui, sans-serif;
```

with

```css
  --ni-script: var(--font-ni-script), "Snell Roundhand", "Apple Chancery", cursive;
  --ni-display-face: var(--font-ni-display), "Trajan Pro", Georgia, serif;
  --ni-serif: var(--font-ni-body), "Iowan Old Style", Georgia, serif;
```

In the `.ni-theme { … }` block replace `font-family: var(--ni-sans);` with `font-family: var(--ni-serif);`.

Replace the `.ni-serif` rule line with:

```css
.ni-serif { font-family: var(--ni-serif); font-weight: 400; }

/* Couple names and signatures only — never body, labels or forms. */
.ni-script { font-family: var(--ni-script); font-weight: 400; line-height: 1.05; letter-spacing: 0; text-transform: none; color: var(--ni-ink); }

/* Inscription capitals for dates, buttons and small labels. */
.ni-caps { font-family: var(--ni-display-face); font-weight: 500; }
```

In `.ni-eyebrow` replace `font-family: var(--ni-sans);` with `font-family: var(--ni-display-face);` and `font-weight: 400;` with `font-weight: 500;`.

Replace the whole `.ni-display { … }` rule with:

```css
.ni-display {
  font-family: var(--ni-display-face);
  font-weight: 500;
  line-height: 1.12;
  letter-spacing: 0.03em;
  color: var(--ni-ink);
}
```

In `.ni-monogram-badge-letters` replace `font-family: var(--ni-serif);` with `font-family: var(--ni-display-face);`.

In `.ni-addcal-item` replace `font-family: var(--ni-sans);` with `font-family: var(--ni-serif);`.

In `.ni-rsvp-option span { … }` add `font-family: var(--ni-display-face);` right after `display: flex;`.

- [ ] **Step 6: Run tests to verify they pass**

Run: `node --test tests/font-delivery.test.mjs`
Expected: PASS (3 original + 2 new tests).

Run: `grep -rn "font-nusantara\|--ni-sans" src`
Expected: no output.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json src/themes/theme-fonts.ts src/themes/nusantara-ivory/fonts.css src/themes/nusantara-ivory/fonts.ts src/themes/nusantara-ivory/NusantaraIvory.tsx src/themes/nusantara-ivory/ThemeStyles.tsx tests/font-delivery.test.mjs
git commit -m "feat(ivory): Great Vibes, Cinzel and Lora type system

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Palette and kawung watermark

**Files:**
- Modify: `src/themes/nusantara-ivory/ThemeStyles.tsx`
- Modify: `src/themes/nusantara-ivory/components/Ornament.tsx`
- Modify: `src/themes/registry.ts:65`
- Modify: `tests/theme-contract.test.mjs:66`
- Create: `tests/nusantara-ivory-identity.test.mjs`

**Interfaces:**
- Produces: tokens `--ni-sogan`, `--ni-bata`, `--ni-hijau` (used by Tasks 4–7), and the shared test helpers `createLoader`, `mount`, `invitation` in `tests/nusantara-ivory-identity.test.mjs` (Tasks 3–7 append tests to this file and reuse them).

- [ ] **Step 1: Write the failing tests**

Create `tests/nusantara-ivory-identity.test.mjs`:

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
const ivoryRoot = resolve(srcRoot, "themes/nusantara-ivory");

const OPENED_COVER = {
  opened: true, playing: false, canPlayMusic: false, reducedMotion: false,
  audioRef: { current: null }, contentRef: { current: null },
  openInvitation: () => {}, toggleMusic: () => {},
};

/** Loads theme TS/TSX through vm. `cover` replaces useInvitationCover's result; `reducedMotion` forces Motion's preference. */
function createLoader({ cover = OPENED_COVER, reducedMotion = false } = {}) {
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
      require(name) {
        if (name === "next/image") return { __esModule: true, default: ({ src, alt }) => React.createElement("img", { src, alt }) };
        if (name === "next/script") return { __esModule: true, default: () => null };
        if (name === "@/components/TurnstileWidget") return { TurnstileWidget: () => null };
        if (name === "@/app/(public)/[slug]/actions") {
          return { trackCoverOpenedAction: async () => {}, submitRsvpAction: async () => ({ status: "idle" }), submitWishAction: async () => ({ status: "idle" }) };
        }
        if (name === "@/themes/shared/use-invitation-cover") return { useInvitationCover: () => cover };
        if (name === "motion/react" && reducedMotion) return { ...nodeRequire("motion/react"), useReducedMotion: () => true };
        if (name.startsWith("@/")) return load(resolve(srcRoot, name.slice(2)));
        if (name.startsWith(".")) return load(resolve(dirname(path), name));
        return nodeRequire(name);
      },
    });
    return exports;
  }
  return (relative) => load(resolve(ivoryRoot, relative));
}

async function mount(element) {
  const dom = new JSDOM("<div id='root'></div>", { url: "https://invitation.test/", pretendToBeVisual: true });
  const prior = {
    window: globalThis.window, document: globalThis.document,
    navigator: Object.getOwnPropertyDescriptor(globalThis, "navigator"),
    IS_REACT_ACT_ENVIRONMENT: globalThis.IS_REACT_ACT_ENVIRONMENT,
  };
  Object.assign(globalThis, { window: dom.window, document: dom.window.document, IS_REACT_ACT_ENVIRONMENT: true });
  Object.defineProperty(globalThis, "navigator", { configurable: true, value: dom.window.navigator });
  const root = createRoot(dom.window.document.getElementById("root"));
  await act(async () => root.render(element));
  return {
    document: dom.window.document,
    window: dom.window,
    async cleanup() {
      await act(async () => root.unmount());
      Object.assign(globalThis, { window: prior.window, document: prior.document, IS_REACT_ACT_ENVIRONMENT: prior.IS_REACT_ACT_ENVIRONMENT });
      if (prior.navigator) Object.defineProperty(globalThis, "navigator", prior.navigator);
      dom.window.close();
    },
  };
}

function invitation(overrides = {}) {
  return {
    id: "ivory", type: "wedding", slug: "ivory", title: "Alya & Bima", status: "published",
    eventDate: "2030-10-20", venueSummary: "Ubud", publishedAt: "2030-01-01T00:00:00Z", expiresAt: null,
    timeZone: "Asia/Jakarta",
    theme: { slug: "nusantara-ivory", settings: {} },
    people: [
      { id: "b", role: "bride", fullName: "Alya Putri", nickname: "Alya", fatherName: null, motherName: null, photoUrl: null, bio: null, sortOrder: 0 },
      { id: "g", role: "groom", fullName: "Bima Satria", nickname: "Bima", fatherName: null, motherName: null, photoUrl: null, bio: null, sortOrder: 1 },
    ],
    events: [{ id: "event", eventType: "Resepsi", title: "Resepsi", eventDate: "2030-10-20",
      startTime: "10:00:00", endTime: "12:00:00", venueName: "Ubud", address: null,
      mapsUrl: null, livestreamUrl: null, sortOrder: 0 }],
    stories: [], gallery: [], gifts: [], wishes: [],
    content: { openingQuote: null, openingMessage: null, closingMessage: null },
    features: { music: false, countdown: false, maps: false, story: false, gallery: false, dressCode: false,
      livestream: false, rsvp: false, wishes: false, gift: false, guestPersonalization: false },
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

test("the Surat dari Keraton palette keeps every text pair at WCAG AA", () => {
  const styles = readFileSync(resolve(ivoryRoot, "ThemeStyles.tsx"), "utf8");
  const token = Object.fromEntries([...styles.matchAll(/--ni-([a-z0-9-]+):\s*(#[0-9A-Fa-f]{6})/g)].map(([, name, hex]) => [name, hex]));
  assert.equal(token.ivory, "#F8F1E4");
  assert.equal(token.sogan, "#6B3E26");
  assert.equal(token.bata, "#7A2E22");
  assert.equal(token.hijau, "#2F4A3A");
  assert.equal(token.gold, "#A87A3D");
  for (const [fg, bg, min] of [
    ["ink", "ivory", 7], ["brown", "ivory", 4.5], ["brown-soft", "ivory", 4.5], ["brown-soft", "cream", 4.5],
    ["gold-ink", "ivory", 4.5], ["gold-ink", "cream", 4.5], ["danger", "ivory", 4.5],
    ["gold-soft", "espresso", 4.5], ["ivory-2", "espresso", 4.5],
  ]) {
    assert.ok(contrast(token[fg], token[bg]) >= min, `--ni-${fg} on --ni-${bg} is ${contrast(token[fg], token[bg]).toFixed(2)}`);
  }
});

test("the Ivory watermark is a drawn kawung pattern", () => {
  const styles = readFileSync(resolve(ivoryRoot, "ThemeStyles.tsx"), "utf8");
  const lattice = styles.match(/\.ni-lattice::before \{[\s\S]*?\n\}/)[0];
  assert.equal((lattice.match(/%3Cellipse/g) ?? []).length, 4, "four kawung petals per tile");
  assert.doesNotMatch(lattice, /\.png|\.jpg/);
});
```

In `tests/theme-contract.test.mjs` change the Ivory expectation to:

```js
    "nusantara-ivory": { name: "Nusantara Ivory", palette: ["#F8F1E4", "#A87A3D", "#6B3E26"] },
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/nusantara-ivory-identity.test.mjs tests/theme-contract.test.mjs`
Expected: FAIL — `token.ivory` is `#FCFAF5`, no `%3Cellipse` in the lattice, registry palette mismatch.

- [ ] **Step 3: Replace the palette tokens**

In `src/themes/nusantara-ivory/ThemeStyles.tsx` replace the colour declarations at the top of `.ni-theme` (from `--ni-ivory` through `--ni-espresso`) with:

```css
  --ni-ivory: #F8F1E4;
  --ni-ivory-2: #F2E8D6;
  --ni-cream: #E9DCC4;
  --ni-sand: #D9C6A5;
  --ni-gold: #A87A3D;
  --ni-gold-soft: #C9A15C;
  --ni-ink: #2B1A10;
  --ni-brown: #5A3A24;
  --ni-brown-soft: #74553D;
  --ni-espresso: #3A2416;
  /* Surat dari Keraton accents: sogan batik brown, wax-seal brick, deep green. */
  --ni-sogan: #6B3E26;
  --ni-bata: #7A2E22;
  --ni-hijau: #2F4A3A;
```

Replace `--ni-gold-ink: #735B3A;` with `--ni-gold-ink: #7A5A2E;` and the three line tokens with:

```css
  --ni-line-strong: rgba(168,122,61,0.45);
  --ni-line: rgba(168,122,61,0.3);
  --ni-line-soft: rgba(168,122,61,0.22);
```

Replace the two panel rules with:

```css
.ni-panel-dark {
  background:
    radial-gradient(120% 90% at 50% 0%, #4A2E1C 0%, var(--ni-espresso) 58%, #2A190F 100%);
  color: var(--ni-ivory-2);
}

.ni-panel-cream {
  background:
    radial-gradient(90% 70% at 20% 0%, #F5ECDD 0%, var(--ni-cream) 70%, #E2D3B8 100%);
}
```

- [ ] **Step 4: Draw the kawung watermark**

Replace the comment and rule for `.ni-lattice::before` with:

```css
/* Kawung watermark — four-petal palm-fruit motif from Javanese batik, drawn
   as thin line work so it reads as paper texture, never as a pasted print. */
.ni-lattice::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.5;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Cg fill='none' stroke='%23A87A3D' stroke-width='0.6' opacity='0.55'%3E%3Cellipse cx='24' cy='12' rx='6' ry='10'/%3E%3Cellipse cx='24' cy='36' rx='6' ry='10'/%3E%3Cellipse cx='12' cy='24' rx='10' ry='6'/%3E%3Cellipse cx='36' cy='24' rx='10' ry='6'/%3E%3Ccircle cx='24' cy='24' r='1.4'/%3E%3C/g%3E%3C/svg%3E");
  background-size: 48px 48px;
}
```

- [ ] **Step 5: Align ornament strokes and the registry swatch**

In `src/themes/nusantara-ivory/components/Ornament.tsx` replace every `"#A98A5C"` with `"#A87A3D"` and `"#DCCCB0"` with `"#D9C6A5"`.

In `src/themes/registry.ts` change the Ivory preview palette to:

```ts
      palette: ["#F8F1E4", "#A87A3D", "#6B3E26"],
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `node --test tests/nusantara-ivory-identity.test.mjs tests/theme-contract.test.mjs`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/themes/nusantara-ivory/ThemeStyles.tsx src/themes/nusantara-ivory/components/Ornament.tsx src/themes/registry.ts tests/theme-contract.test.mjs tests/nusantara-ivory-identity.test.mjs
git commit -m "feat(ivory): gading-sogan palette and kawung watermark

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Script couple names and Cinzel headings

**Files:**
- Modify: `src/themes/nusantara-ivory/sections/HeroSection.tsx:39,75`
- Modify: `src/themes/nusantara-ivory/sections/CoupleSection.tsx:50`
- Modify: `src/themes/nusantara-ivory/sections/ClosingSection.tsx:66`
- Modify: `src/themes/nusantara-ivory/components/SectionHeading.tsx:35`
- Modify: `src/themes/nusantara-ivory/ThemeStyles.tsx` (`.ni-hero-names`)
- Test: `tests/nusantara-ivory-identity.test.mjs`

**Interfaces:**
- Consumes: `.ni-script`, `.ni-display` (Task 1); `createLoader`, `invitation` (Task 2).

- [ ] **Step 1: Write the failing test**

Append to `tests/nusantara-ivory-identity.test.mjs`:

```js
test("couple names use the script face and section titles stay in Cinzel", () => {
  const { NusantaraIvory } = createLoader()("index");
  const html = renderToStaticMarkup(React.createElement(NusantaraIvory, { invitation: invitation(), guest: null }));
  const { document } = new JSDOM(html).window;
  const scripts = [...document.querySelectorAll(".ni-script")].map((node) => node.textContent.trim());
  assert.ok(scripts.includes("Alya & Bima"), "hero names");
  assert.ok(scripts.includes("Alya") && scripts.includes("Bima"), "couple names");
  assert.ok(document.querySelector("#ni-beranda h1.ni-script"), "hero h1 is script");
  const titles = [...document.querySelectorAll("h2")];
  assert.ok(titles.length > 0);
  for (const title of titles) {
    assert.ok(!title.classList.contains("ni-script"), `section title "${title.textContent}" must not be script`);
  }
  assert.match(document.body.textContent, /Matur Nuwun · Terima Kasih/, "closing carries the Javanese thanks");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test --test-name-pattern="couple names use the script face" tests/nusantara-ivory-identity.test.mjs`
Expected: FAIL — "hero names" (no `.ni-script` nodes).

- [ ] **Step 3: Apply the script face to name sites**

`src/themes/nusantara-ivory/sections/HeroSection.tsx` — both occurrences:

```tsx
            <h1 className="ni-script ni-hero-names mt-8">{displayName}</h1>
```

```tsx
            <h1 className="ni-script ni-hero-names my-8">{displayName}</h1>
```

`src/themes/nusantara-ivory/sections/CoupleSection.tsx`:

```tsx
      <h3 className="ni-script text-[clamp(2.6rem,6.5vw,4.2rem)] break-words">{display}</h3>
```

`src/themes/nusantara-ivory/sections/ClosingSection.tsx` — the title paragraph:

```tsx
          <p
            className="ni-script text-[clamp(2.8rem,9vw,5rem)] leading-tight"
            style={{ color: "var(--ni-ivory)" }}
          >
            {title}
          </p>
```

In the same file, the small label at the end of the closing changes from `Terima Kasih` to the Javanese-first accent:

```tsx
            Matur Nuwun · Terima Kasih
```

`src/themes/nusantara-ivory/components/SectionHeading.tsx` — Cinzel is wider than Cormorant, so the title steps down:

```tsx
        className="ni-display text-[clamp(1.8rem,4.6vw,3.2rem)]"
```

In `ThemeStyles.tsx` replace the `.ni-hero-names` rule with:

```css
.ni-hero-names { max-width: 14ch; font-size: clamp(3.8rem, 8.5vw, 8.5rem); line-height: 1.05; }
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/nusantara-ivory-identity.test.mjs tests/invitation-time-zone.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/themes/nusantara-ivory/sections/HeroSection.tsx src/themes/nusantara-ivory/sections/CoupleSection.tsx src/themes/nusantara-ivory/sections/ClosingSection.tsx src/themes/nusantara-ivory/components/SectionHeading.tsx src/themes/nusantara-ivory/ThemeStyles.tsx tests/nusantara-ivory-identity.test.mjs
git commit -m "feat(ivory): script couple names, Cinzel section titles

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Gunungan gate opener

**Files:**
- Modify: `src/themes/nusantara-ivory/components/Ornament.tsx` (add `Gunungan`)
- Modify: `src/themes/nusantara-ivory/CoverGate.tsx` (full rewrite below)
- Modify: `src/themes/nusantara-ivory/ThemeStyles.tsx` (gate CSS; drop arch/floral cover CSS)
- Test: `tests/nusantara-ivory-identity.test.mjs`

**Interfaces:**
- Consumes: `.ni-script`, `.ni-caps` (Task 1); `--ni-sogan` (Task 2); `createLoader`, `mount` (Task 2).
- Produces: `Gunungan({ className?: string })` exported from `components/Ornament.tsx`.

- [ ] **Step 1: Write the failing test**

Append to `tests/nusantara-ivory-identity.test.mjs`:

```js
test("the cover is a two-leaf gunungan gate that opens in the same tap", async () => {
  let opens = 0;
  const cover = { ...OPENED_COVER, opened: false, openInvitation: () => { opens += 1; } };
  const { CoverGate } = createLoader({ cover })("CoverGate");
  const view = await mount(React.createElement(CoverGate, {
    invitationId: "ivory", guestToken: null, eyebrow: "The Wedding Of", displayName: "Alya & Bima",
    eventDate: "2030-10-20", guestDisplayName: "Bude Sri", musicUrl: null, musicEnabled: false, navItems: [],
  }, React.createElement("p", null, "isi")));
  try {
    const leaves = view.document.querySelectorAll("[data-ni-gate-leaf]");
    assert.equal(leaves.length, 2);
    for (const leaf of leaves) {
      assert.equal(leaf.getAttribute("aria-hidden"), "true");
      assert.ok(leaf.querySelector("svg.ni-gate-gunungan"), "each leaf carries half of the gunungan");
    }
    assert.match(view.document.querySelector("h1.ni-script").textContent, /Alya/);
    assert.match(view.document.body.textContent, /Bude Sri/);
    const button = [...view.document.querySelectorAll("button")].find((node) => node.textContent.trim() === "Buka Undangan");
    assert.ok(button, "the cover keeps a real Buka Undangan button");
    await act(async () => button.click());
    assert.equal(opens, 1, "openInvitation runs synchronously in the tap");
  } finally {
    await view.cleanup();
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test --test-name-pattern="gunungan gate" tests/nusantara-ivory-identity.test.mjs`
Expected: FAIL — `leaves.length` is 0.

- [ ] **Step 3: Add the gunungan ornament**

Append to `src/themes/nusantara-ivory/components/Ornament.tsx`:

```tsx
/**
 * Gunungan (kayon) — the wayang "tree of life" a dalang raises to open and
 * close a lakon. Line work only; colour comes from `currentColor`.
 */
export function Gunungan({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 260" className={className} fill="none" aria-hidden="true" focusable="false">
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path d="M100 6C70 52 30 104 22 170c-4 34 6 62 20 84h116c14-22 24-50 20-84C170 104 130 52 100 6Z" strokeWidth="1.4" />
        <path d="M100 34C78 72 50 112 44 166c-3 28 4 50 14 70h84c10-20 17-42 14-70-6-54-34-94-56-132Z" strokeWidth="0.8" opacity="0.7" />
        <path
          d="M100 70v170M100 110c-16-10-30-6-38 6M100 110c16-10 30-6 38 6M100 150c-22-12-40-6-50 10M100 150c22-12 40-6 50 10M100 190c-26-10-44-2-54 16M100 190c26-10 44-2 54 16"
          stroke="var(--ni-sogan)"
          strokeWidth="0.7"
          opacity="0.6"
        />
        <path d="M86 228h28v12H86zM92 222h16" strokeWidth="0.8" opacity="0.7" />
      </g>
    </svg>
  );
}
```

- [ ] **Step 4: Rewrite the cover as a gate**

Replace `src/themes/nusantara-ivory/CoverGate.tsx` with:

```tsx
"use client";

import { AnimatePresence, motion, type Variants } from "motion/react";

import { getCoupleInitials } from "@/lib/utils/coupleName";
import { useInvitationCover } from "@/themes/shared/use-invitation-cover";

import { MonogramBadge } from "./components/Botanical";
import { FloatingNav, type NavItem } from "./components/FloatingNav";
import { Gunungan, OrnamentDivider } from "./components/Ornament";

function formatEventDate(eventDate: string | null): string {
  if (!eventDate) return "";
  // Plain YYYY-MM-DD: format in UTC so no viewer timezone shifts the day.
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${eventDate}T00:00:00Z`));
}

function splitCoupleName(displayName: string): [string, string] | null {
  const parts = displayName.split(/\s+&\s+/);
  if (parts.length === 2) return [parts[0], parts[1]];
  return null;
}

const GATE_EASE = [0.65, 0, 0.25, 1] as const;

/**
 * Exit choreography for the gunungan gate. The cover only waits for its
 * leaves (it never fades), the text clears first, then the two halves slide
 * apart like a dalang parting the kayon. Reduced motion: a short fade.
 */
function gateVariants(reduced: boolean): Record<"cover" | "content" | "left" | "right", Variants> {
  if (reduced) {
    return {
      cover: { exit: { opacity: 0, transition: { duration: 0.2 } } },
      content: {},
      left: {},
      right: {},
    };
  }
  return {
    cover: { exit: { opacity: 1, transition: { duration: 1.2 } } },
    content: { exit: { opacity: 0, transition: { duration: 0.25 } } },
    left: { exit: { x: "-101%", transition: { duration: 0.95, delay: 0.2, ease: GATE_EASE } } },
    right: { exit: { x: "101%", transition: { duration: 0.95, delay: 0.2, ease: GATE_EASE } } },
  };
}

export function CoverGate({
  invitationId,
  guestToken,
  eyebrow,
  displayName,
  eventDate,
  guestDisplayName,
  musicUrl,
  musicEnabled,
  navItems,
  children,
}: {
  invitationId: string;
  guestToken: string | null;
  eyebrow: string | null;
  displayName: string;
  eventDate: string | null;
  guestDisplayName: string | null;
  musicUrl: string | null;
  musicEnabled: boolean;
  navItems: NavItem[];
  children: React.ReactNode;
}) {
  const {
    opened, playing, canPlayMusic, reducedMotion: reduced,
    audioRef, contentRef, openInvitation, toggleMusic,
  } = useInvitationCover({ invitationId, guestToken, musicEnabled, musicUrl });
  const couple = splitCoupleName(displayName);
  const initials = getCoupleInitials(displayName);
  const gate = gateVariants(reduced);

  return (
    <>
      {canPlayMusic ? (
        <audio ref={audioRef} src={musicUrl ?? undefined} loop preload="none" />
      ) : null}

      <AnimatePresence>
        {!opened ? (
          <motion.div
            key="ni-cover"
            className="ni-gate fixed inset-0 z-50"
            variants={gate.cover}
            initial={false}
            exit="exit"
            style={{ pointerEvents: "auto" }}
          >
            {(["left", "right"] as const).map((side) => (
              <motion.div
                key={side}
                className={`ni-gate-leaf ni-gate-leaf--${side} ni-grain`}
                variants={gate[side]}
                data-ni-gate-leaf=""
                aria-hidden="true"
              >
                <div className="ni-lattice absolute inset-0 opacity-[0.12]" />
                <Gunungan className="ni-gate-gunungan" />
              </motion.div>
            ))}

            <motion.div className="ni-gate-scroll" variants={gate.content}>
              <div className="relative flex min-h-full items-center justify-center px-7 py-16">
                {/* Entrance stagger is CSS (.ni-cover-stagger + animation-delay),
                    so it runs before hydration and respects reduced motion. */}
                <div className="ni-cover-content relative flex flex-col items-center text-center">
                  {(
                    [
                      eyebrow ? (
                        <p key="eyebrow" className="ni-eyebrow">
                          {eyebrow}
                        </p>
                      ) : null,

                      initials ? (
                        <div key="monogram" className="mt-5">
                          <MonogramBadge initials={initials} />
                        </div>
                      ) : null,

                      couple ? (
                        <h1
                          key="names"
                          className="ni-script mt-6 flex flex-col items-center text-[clamp(3.4rem,15vw,7rem)]"
                        >
                          <span>{couple[0]}</span>
                          <span className="my-1 text-[0.5em]" style={{ color: "var(--ni-gold)" }}>
                            &amp;
                          </span>
                          <span>{couple[1]}</span>
                        </h1>
                      ) : (
                        <h1 key="names" className="ni-script mt-6 text-[clamp(2.8rem,11vw,5.2rem)]">
                          {displayName}
                        </h1>
                      ),

                      <div key="divider" className="mt-7 flex justify-center">
                        <OrnamentDivider />
                      </div>,

                      eventDate ? (
                        <p
                          key="date"
                          className="ni-caps mt-6 text-[0.8rem] tracking-[0.3em] uppercase"
                          style={{ color: "var(--ni-brown-soft)" }}
                        >
                          {formatEventDate(eventDate)}
                        </p>
                      ) : null,

                      (
                        <div
                          key="guest"
                          className="ni-recipient mx-auto mt-8 flex w-full max-w-[min(380px,74vw)] flex-col items-center gap-2 border-t border-b px-4 py-5"
                          style={{ borderColor: "var(--ni-line)" }}
                        >
                          <p
                            className="ni-caps text-[0.66rem] tracking-[0.3em] uppercase"
                            style={{ color: "var(--ni-brown-soft)" }}
                          >
                            Kepada Yth.
                          </p>
                          <p className="ni-serif text-[1.45rem] leading-snug text-[var(--ni-ink)]">
                            {guestDisplayName?.trim() || "Bapak/Ibu/Saudara/i"}
                          </p>
                          <p className="ni-body mt-1 text-sm">Dengan hormat, kami mengundang Anda untuk hadir.</p>
                        </div>
                      ),

                      <div key="cta" className="mt-11">
                        <button
                          type="button"
                          onClick={openInvitation}
                          className="ni-caps group relative inline-flex min-h-[48px] items-center gap-3 overflow-hidden border px-9 py-3.5 text-[0.74rem] tracking-[0.28em] uppercase transition-colors duration-500"
                          style={{ borderColor: "var(--ni-gold)", color: "var(--ni-brown)" }}
                        >
                          <span
                            className="absolute inset-0 origin-bottom scale-y-0 transition-transform duration-500 ease-out group-hover:scale-y-100 motion-reduce:transition-none"
                            style={{ background: "var(--ni-sogan)" }}
                            aria-hidden="true"
                          />
                          <span className="relative transition-colors duration-500 group-hover:text-white">
                            Buka Undangan
                          </span>
                        </button>
                      </div>,
                    ] as (React.ReactElement | null)[]
                  )
                    .filter(Boolean)
                    .map((node, i) => (
                      <div key={i} className="ni-cover-stagger" style={{ animationDelay: `${i * .09}s` }}>
                        {node}
                      </div>
                    ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {opened ? (
        <motion.div
          ref={contentRef}
          tabIndex={-1}
          role="region"
          aria-label="Isi undangan"
          className="outline-none"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1], delay: reduced ? 0 : 0.1 }}
        >
          {children}
        </motion.div>
      ) : null}

      {opened ? <FloatingNav items={navItems} /> : null}

      {/* Kept outside the animated wrapper: an ancestor transform would turn
          this fixed control into an absolutely positioned one. */}
      {opened && canPlayMusic ? (
        <button
          type="button"
          onClick={toggleMusic}
          aria-label={playing ? "Jeda musik" : "Putar musik"}
          className="fixed right-5 z-40 flex size-12 items-center justify-center rounded-full border backdrop-blur transition-colors"
          style={{
            // Clears the floating nav, which only renders with 2+ items.
            bottom: navItems.length >= 2
              ? "calc(5.4rem + env(safe-area-inset-bottom))"
              : "calc(1.25rem + env(safe-area-inset-bottom))",
            borderColor: "var(--ni-line-strong)",
            background: "rgba(248,241,228,0.88)",
            color: "var(--ni-brown)",
          }}
        >
          {playing ? (
            <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden="true">
              <rect x="6" y="5" width="4" height="14" />
              <rect x="14" y="5" width="4" height="14" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden="true">
              <path d="M7 5v14l12-7z" />
            </svg>
          )}
        </button>
      ) : null}
    </>
  );
}
```

- [ ] **Step 5: Gate CSS**

In `ThemeStyles.tsx` delete these three rules (the cover no longer renders an arch or floral corners; `.ni-cover-content` and `.ni-cover-content > div` stay):

```css
.ni-cover-arch { height: calc(100% - 3rem); }
.ni-cover-floral-left { left: -55px; bottom: -45px; opacity: .45; }
.ni-cover-floral-right { right: -65px; top: -80px; transform: rotate(180deg); opacity: .3; }
```

and add after `.ni-cover-content > div { … }`:

```css
/* Gunungan gate: two ivory leaves meeting at a gold seam, each clipping half
   of one centred gunungan. The text layer scrolls independently so short
   screens keep the gate fixed behind it. */
.ni-gate { overflow: hidden; }
.ni-gate-leaf { position: absolute; top: 0; bottom: 0; width: 50%; overflow: hidden; background: var(--ni-ivory); }
.ni-gate-leaf--left { left: 0; box-shadow: inset -1px 0 0 var(--ni-line-strong); }
.ni-gate-leaf--right { right: 0; }
.ni-gate-gunungan { position: absolute; top: 50%; width: min(560px, 118vw); height: auto; color: var(--ni-gold); opacity: .5; transform: translate(-50%, -50%); }
.ni-gate-leaf--left .ni-gate-gunungan { left: 100%; }
.ni-gate-leaf--right .ni-gate-gunungan { left: 0; }
.ni-gate-scroll { position: absolute; inset: 0; z-index: 1; overflow-x: hidden; overflow-y: auto; }
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `node --test tests/nusantara-ivory-identity.test.mjs`
Expected: PASS.

Run: `npm run typecheck`
Expected: exit 0. (`FloralCorner` and `OrnamentArch` stay exported from their modules; HeroSection still uses `FloralCorner`.)

- [ ] **Step 7: Commit**

```bash
git add src/themes/nusantara-ivory/CoverGate.tsx src/themes/nusantara-ivory/components/Ornament.tsx src/themes/nusantara-ivory/ThemeStyles.tsx tests/nusantara-ivory-identity.test.mjs
git commit -m "feat(ivory): gunungan gate opener

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Garis canting heading rule

**Files:**
- Create: `src/themes/nusantara-ivory/components/CantingRule.tsx`
- Modify: `src/themes/nusantara-ivory/components/SectionHeading.tsx`
- Test: `tests/nusantara-ivory-identity.test.mjs`

**Interfaces:**
- Consumes: `--ni-gold`, `--ni-gold-soft`, `--ni-bata` tokens; `createLoader` (Task 2).
- Produces: `CantingRule({ align?: "left" | "center"; tone?: "gold" | "light" })`, root `<svg data-ni-canting="draw" | "static" aria-hidden="true">`.

- [ ] **Step 1: Write the failing test**

Append to `tests/nusantara-ivory-identity.test.mjs`:

```js
test("section headings carry a kawung rule drawn like a canting stroke", () => {
  const render = (options, props) => {
    const { CantingRule } = createLoader(options)("components/CantingRule");
    return new JSDOM(renderToStaticMarkup(React.createElement(CantingRule, props))).window.document;
  };
  for (const align of ["center", "left"]) {
    const doc = render({}, { align });
    const svg = doc.querySelector("svg[data-ni-canting]");
    assert.equal(svg.getAttribute("aria-hidden"), "true");
    assert.equal(svg.getAttribute("data-ni-canting"), "draw");
    assert.equal(svg.querySelectorAll("ellipse").length, 4, `${align}: kawung centre`);
    assert.equal(svg.querySelectorAll("path").length, align === "center" ? 2 : 1);
  }
  const still = render({ reducedMotion: true }, { align: "center" });
  assert.equal(still.querySelector("svg").getAttribute("data-ni-canting"), "static");

  const { SectionHeading } = createLoader()("components/SectionHeading");
  const heading = new JSDOM(renderToStaticMarkup(React.createElement(SectionHeading, { title: "Acara", align: "center" }))).window.document;
  assert.ok(heading.querySelector("svg[data-ni-canting]"), "SectionHeading renders the canting rule");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test --test-name-pattern="canting stroke" tests/nusantara-ivory-identity.test.mjs`
Expected: FAIL — "Missing module: …/components/CantingRule".

- [ ] **Step 3: Write the component**

Create `src/themes/nusantara-ivory/components/CantingRule.tsx`:

```tsx
"use client";

import { motion, useReducedMotion } from "motion/react";

const DRAW_EASE = [0.45, 0, 0.2, 1] as const;
const VIEWPORT = { once: true, margin: "0px 0px -10% 0px" } as const;

/** Kawung centre: four petals around a brick-red dot, at (cx, 12). */
function petals(cx: number) {
  return [
    { cx, cy: 6.5, rx: 2.6, ry: 4.6 },
    { cx, cy: 17.5, rx: 2.6, ry: 4.6 },
    { cx: cx - 5.5, cy: 12, rx: 4.6, ry: 2.6 },
    { cx: cx + 5.5, cy: 12, rx: 4.6, ry: 2.6 },
  ];
}

/**
 * Heading rule "written" with a canting: the gold lines and the kawung
 * centre draw in once when the heading scrolls into view. Reduced motion
 * renders the finished rule. Decorative only.
 */
export function CantingRule({
  align = "center",
  tone = "gold",
}: {
  align?: "left" | "center";
  tone?: "gold" | "light";
}) {
  const reduced = useReducedMotion() ?? false;
  const stroke = tone === "gold" ? "var(--ni-gold)" : "var(--ni-gold-soft)";
  const isCenter = align === "center";
  const width = isCenter ? 240 : 120;
  const centre = isCenter ? 120 : 92;
  const lines = isCenter ? ["M4 12H100", "M140 12H236"] : ["M0 12H72"];
  const common = { fill: "none", stroke, strokeWidth: 0.9, strokeLinecap: "round" as const };

  if (reduced) {
    return (
      <svg viewBox={`0 0 ${width} 24`} className={isCenter ? "h-6 w-[min(240px,60%)]" : "h-6 w-28"} aria-hidden="true" focusable="false" data-ni-canting="static">
        {lines.map((d) => <path key={d} d={d} {...common} />)}
        {petals(centre).map((p) => <ellipse key={`${p.cx}-${p.cy}`} {...p} {...common} />)}
        <circle cx={centre} cy={12} r={1.6} fill="var(--ni-bata)" />
      </svg>
    );
  }

  return (
    <svg viewBox={`0 0 ${width} 24`} className={isCenter ? "h-6 w-[min(240px,60%)]" : "h-6 w-28"} aria-hidden="true" focusable="false" data-ni-canting="draw">
      {lines.map((d, index) => (
        <motion.path
          key={d}
          d={d}
          {...common}
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1, transition: { duration: 1.1, ease: DRAW_EASE, delay: index * 0.15 } }}
          viewport={VIEWPORT}
        />
      ))}
      {petals(centre).map((p, index) => (
        <motion.ellipse
          key={`${p.cx}-${p.cy}`}
          {...p}
          {...common}
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1, transition: { duration: 0.6, ease: DRAW_EASE, delay: 0.7 + index * 0.08 } }}
          viewport={VIEWPORT}
        />
      ))}
      <motion.circle
        cx={centre}
        cy={12}
        r={1.6}
        fill="var(--ni-bata)"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1, transition: { duration: 0.3, delay: 1.1 } }}
        viewport={VIEWPORT}
      />
    </svg>
  );
}
```

- [ ] **Step 4: Use it in SectionHeading**

In `src/themes/nusantara-ivory/components/SectionHeading.tsx` replace the import `import { OrnamentDivider } from "./Ornament";` with `import { CantingRule } from "./CantingRule";` and replace the whole `{isCenter ? ( <OrnamentDivider … /> ) : ( <span … /> )}` block with:

```tsx
      <CantingRule align={isCenter ? "center" : "left"} tone={tone === "light" ? "light" : "gold"} />
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `node --test tests/nusantara-ivory-identity.test.mjs tests/invitation-time-zone.test.mjs tests/gallery-gift-parity.test.mjs`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/themes/nusantara-ivory/components/CantingRule.tsx src/themes/nusantara-ivory/components/SectionHeading.tsx tests/nusantara-ivory-identity.test.mjs
git commit -m "feat(ivory): canting-drawn kawung rule under section headings

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Hujan melati on an attending RSVP

**Files:**
- Create: `src/themes/nusantara-ivory/components/MelatiShower.tsx`
- Modify: `src/themes/nusantara-ivory/sections/RsvpSection.tsx`
- Modify: `src/themes/nusantara-ivory/ThemeStyles.tsx` (melati CSS)
- Modify: `tests/theme-shared-behavior.test.mjs` (stub + behaviour test)
- Test: `tests/nusantara-ivory-identity.test.mjs`

**Interfaces:**
- Consumes: `useRsvpForm()` → `{ state, attendance }` from `src/themes/shared/use-public-forms.ts` (unchanged); `.ni-script` (Task 1).
- Produces: `MelatiShower()` → `<div class="ni-melati" data-ni-melati aria-hidden="true">` with 12 `svg.ni-melati-petal`, or `null` under reduced motion.

- [ ] **Step 1: Write the failing tests**

Append to `tests/nusantara-ivory-identity.test.mjs`:

```js
test("melati shower drops twelve blossoms and stays silent under reduced motion", () => {
  const { MelatiShower } = createLoader()("components/MelatiShower");
  const doc = new JSDOM(renderToStaticMarkup(React.createElement(MelatiShower))).window.document;
  const shower = doc.querySelector("[data-ni-melati]");
  assert.equal(shower.getAttribute("aria-hidden"), "true");
  assert.equal(shower.querySelectorAll("svg.ni-melati-petal").length, 12);

  const still = createLoader({ reducedMotion: true })("components/MelatiShower").MelatiShower;
  assert.equal(renderToStaticMarkup(React.createElement(still)), "");
});
```

In `tests/theme-shared-behavior.test.mjs`, inside `loadSection`'s `require(moduleName)` add before the final `return nodeRequire(moduleName);`:

```js
      if (moduleName.endsWith("/MelatiShower")) return { MelatiShower: () => React.createElement("div", { "data-ni-melati": "" }) };
```

and append this test after the existing "shared RSVP behavior reaches the real Ivory form…" test:

```js
for (const [attendance, showsMelati] of [["attending", true], ["not_attending", false]]) {
  test(`Ivory RSVP success (${attendance}) thanks the guest${showsMelati ? " with falling melati" : ""}`, async () => {
    const view = await mountIvorySection("RsvpSection", { invitationId: "inv-ivory", slug: "ivory", guestToken: "t", guestName: "Bude Sri" }, {
      submitRsvp: async () => ({ status: "success" }),
    });
    try {
      const form = view.document.querySelector("#ni-rsvp form");
      await act(async () => form.querySelector(`input[type="radio"][value="${attendance}"]`).click());
      await act(async () => form.dispatchEvent(new view.document.defaultView.Event("submit", { bubbles: true, cancelable: true })));
      const section = view.document.getElementById("ni-rsvp");
      assert.match(section.querySelector('[role="status"]').textContent, /Matur nuwun/);
      assert.match(section.textContent, /Konfirmasi kehadiran Anda telah kami terima/);
      assert.equal(Boolean(section.querySelector("[data-ni-melati]")), showsMelati);
    } finally { await view.cleanup(); }
  });
}
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/nusantara-ivory-identity.test.mjs tests/theme-shared-behavior.test.mjs`
Expected: FAIL — "Missing module: …/MelatiShower" and the success status lacks "Matur nuwun".

- [ ] **Step 3: Write the component**

Create `src/themes/nusantara-ivory/components/MelatiShower.tsx`:

```tsx
"use client";

import type { CSSProperties } from "react";
import { useReducedMotion } from "motion/react";

// Fixed choreography (no Math.random) so renders are deterministic.
const BLOSSOMS = [
  { left: 6, delay: 0, duration: 2.6, drift: -18, spin: 220, size: 18 },
  { left: 15, delay: 0.35, duration: 3.1, drift: 14, spin: -180, size: 15 },
  { left: 24, delay: 0.1, duration: 2.8, drift: -10, spin: 260, size: 20 },
  { left: 33, delay: 0.5, duration: 3.4, drift: 22, spin: 200, size: 16 },
  { left: 42, delay: 0.2, duration: 2.9, drift: -24, spin: -240, size: 19 },
  { left: 51, delay: 0.6, duration: 3.2, drift: 12, spin: 180, size: 14 },
  { left: 60, delay: 0.05, duration: 2.7, drift: -14, spin: 300, size: 18 },
  { left: 68, delay: 0.45, duration: 3.3, drift: 20, spin: -200, size: 16 },
  { left: 76, delay: 0.25, duration: 2.9, drift: -20, spin: 240, size: 20 },
  { left: 84, delay: 0.55, duration: 3.5, drift: 16, spin: -260, size: 15 },
  { left: 90, delay: 0.15, duration: 2.8, drift: -12, spin: 210, size: 17 },
  { left: 96, delay: 0.4, duration: 3.0, drift: 10, spin: -220, size: 14 },
] as const;

/**
 * Jasmine (melati) — the blossom of Javanese bridal garlands — drifting down
 * once after a guest confirms they will attend. Mounted by the success
 * state, so it plays exactly once per confirmation. Decorative only.
 */
export function MelatiShower() {
  const reduced = useReducedMotion() ?? false;
  if (reduced) return null;

  return (
    <div className="ni-melati" data-ni-melati="" aria-hidden="true">
      {BLOSSOMS.map((blossom, index) => (
        <svg
          key={index}
          viewBox="-10 -10 20 20"
          className="ni-melati-petal"
          style={{
            left: `${blossom.left}%`,
            width: blossom.size,
            height: blossom.size,
            animationDelay: `${blossom.delay}s`,
            animationDuration: `${blossom.duration}s`,
            "--ni-drift": `${blossom.drift}px`,
            "--ni-spin": `${blossom.spin}deg`,
          } as CSSProperties}
        >
          {[0, 72, 144, 216, 288].map((angle) => (
            <ellipse key={angle} cy={-4.6} rx={2.8} ry={4.8} transform={`rotate(${angle})`} />
          ))}
          <circle r={1.7} className="ni-melati-core" />
        </svg>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Melati CSS**

Append inside the `CSS` template in `ThemeStyles.tsx`, before the `@media (prefers-reduced-motion: reduce)` block:

```css
.ni-melati { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
.ni-melati-petal {
  position: absolute;
  top: -24px;
  opacity: 0;
  fill: #FFFDF6;
  stroke: var(--ni-sand);
  stroke-width: .5;
  animation-name: ni-melati-fall;
  animation-timing-function: cubic-bezier(.3,.1,.6,1);
  animation-fill-mode: forwards;
}
.ni-melati-core { fill: #E2C46B; stroke: none; }
@keyframes ni-melati-fall {
  0% { opacity: 0; transform: translate(0, 0) rotate(0deg); }
  12% { opacity: 1; }
  85% { opacity: .9; }
  100% { opacity: 0; transform: translate(var(--ni-drift), 520px) rotate(var(--ni-spin)); }
}
```

- [ ] **Step 5: Wire it into the RSVP panel**

In `src/themes/nusantara-ivory/sections/RsvpSection.tsx` add the import:

```tsx
import { MelatiShower } from "../components/MelatiShower";
```

Inside `<div className="ni-rsvp-panel relative …">`, directly after the two `<OrnamentCorner … />` lines, add:

```tsx
            {state.status === "success" && attendance === "attending" ? <MelatiShower /> : null}
```

and replace the success paragraph `<p className="ni-serif text-[1.5rem] text-[var(--ni-ink)]">Terima kasih</p>` with:

```tsx
                <p className="ni-script text-[2.75rem]">Matur nuwun</p>
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `node --test tests/nusantara-ivory-identity.test.mjs tests/theme-shared-behavior.test.mjs`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/themes/nusantara-ivory/components/MelatiShower.tsx src/themes/nusantara-ivory/sections/RsvpSection.tsx src/themes/nusantara-ivory/ThemeStyles.tsx tests/theme-shared-behavior.test.mjs tests/nusantara-ivory-identity.test.mjs
git commit -m "feat(ivory): melati shower after an attending RSVP

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Cap lilin "Tersalin" on copy

**Files:**
- Create: `src/themes/nusantara-ivory/components/WaxSeal.tsx`
- Modify: `src/themes/nusantara-ivory/sections/GiftAccountCard.tsx`
- Modify: `src/themes/nusantara-ivory/ThemeStyles.tsx` (seal CSS)
- Test: `tests/nusantara-ivory-identity.test.mjs`

**Interfaces:**
- Consumes: `useCopyFeedback()` → `{ copied, failed, copy }` (unchanged); `--ni-bata`, `--ni-display-face` tokens.
- Produces: `WaxSeal({ stamped: boolean })` → `<span class="ni-wax-seal" data-ni-seal data-stamped? aria-hidden="true">`.

- [ ] **Step 1: Write the failing test**

Append to `tests/nusantara-ivory-identity.test.mjs`:

```js
test("copying an account number stamps a wax seal and keeps the fallback path", async () => {
  const { GiftAccountCard } = createLoader()("sections/GiftAccountCard");
  const gift = { id: "gift", providerType: "bank", providerName: "BCA", accountNumber: "1234567890", accountName: "Alya", logoUrl: null, sortOrder: 0 };
  const view = await mount(React.createElement(GiftAccountCard, { gift }));
  try {
    Object.defineProperty(view.window.navigator, "clipboard", { configurable: true, value: { writeText: async () => {} } });
    const seal = view.document.querySelector("[data-ni-seal]");
    assert.equal(seal.getAttribute("aria-hidden"), "true");
    assert.equal(seal.hasAttribute("data-stamped"), false);
    const button = [...view.document.querySelectorAll("button")].find((node) => /Salin/.test(node.textContent));
    await act(async () => button.click());
    assert.equal(seal.hasAttribute("data-stamped"), true);
    assert.equal(button.textContent, "Tersalin");
  } finally {
    await view.cleanup();
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test --test-name-pattern="wax seal" tests/nusantara-ivory-identity.test.mjs`
Expected: FAIL — `seal` is `null` ("Cannot read properties of null").

- [ ] **Step 3: Write the component**

Create `src/themes/nusantara-ivory/components/WaxSeal.tsx`:

```tsx
/**
 * Brick-red wax seal pressed onto a gift card once its number is copied —
 * the same seal that closes a keraton letter. The button text and the
 * status line carry the meaning; the seal is decorative.
 */
export function WaxSeal({ stamped }: { stamped: boolean }) {
  return (
    <span className="ni-wax-seal" data-ni-seal="" data-stamped={stamped ? "" : undefined} aria-hidden="true">
      <span className="ni-wax-seal-text">Tersalin</span>
    </span>
  );
}
```

- [ ] **Step 4: Seal CSS**

Append inside the `CSS` template in `ThemeStyles.tsx`, before the `@media (prefers-reduced-motion: reduce)` block:

```css
.ni-wax-seal {
  position: absolute;
  top: -1.1rem;
  right: -.6rem;
  display: grid;
  place-items: center;
  width: 4.4rem;
  height: 4.4rem;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #9A3E2E, var(--ni-bata) 70%);
  box-shadow: inset 0 0 0 4px rgba(243,221,184,.2), 0 3px 8px -2px rgba(0,0,0,.45);
  color: #F3DDB8;
  opacity: 0;
  transform: scale(2.2) rotate(-25deg);
  pointer-events: none;
}
.ni-wax-seal-text { font-family: var(--ni-display-face); font-size: .55rem; letter-spacing: .14em; text-transform: uppercase; }
.ni-wax-seal[data-stamped] { animation: ni-seal-stamp .45s cubic-bezier(.3,1.5,.5,1) forwards; }
@keyframes ni-seal-stamp { to { opacity: 1; transform: scale(1) rotate(-12deg); } }
```

- [ ] **Step 5: Stamp the card**

In `src/themes/nusantara-ivory/sections/GiftAccountCard.tsx` add `import { WaxSeal } from "../components/WaxSeal";` after the existing imports and insert as the first child of the root `<div className="relative flex h-full …">`:

```tsx
      <WaxSeal stamped={copied} />
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `node --test tests/nusantara-ivory-identity.test.mjs tests/gallery-gift-parity.test.mjs`
Expected: PASS (the parity test still sees the manual-copy fallback).

- [ ] **Step 7: Commit**

```bash
git add src/themes/nusantara-ivory/components/WaxSeal.tsx src/themes/nusantara-ivory/sections/GiftAccountCard.tsx src/themes/nusantara-ivory/ThemeStyles.tsx tests/nusantara-ivory-identity.test.mjs
git commit -m "feat(ivory): wax seal stamp when an account number is copied

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Docs, full verification, visual QA, PR

**Files:**
- Modify: `docs/DESIGN.md` (§5 typography rule)
- Modify: `docs/PROJECT_MEMORY.md` (redesign record)
- Temporary (never committed, already in `.git/info/exclude`): `src/app/qa-fixture/page.tsx`

- [ ] **Step 1: Update the docs**

In `docs/DESIGN.md` replace `Do not use more than 2 primary font families without a strong reason.` with:

```markdown
Do not use more than 2 primary font families without a strong reason. A
script face reserved for couple names and signatures may be the third
family; it is never used for body copy, labels or forms. Each theme's trio
is listed in `docs/superpowers/specs/2026-10-03-theme-identity-redesign-design.md`.
```

In `docs/PROJECT_MEMORY.md`, under the redesign phases section, add:

```markdown
### Theme identity redesign (Oct 2026)

Spec: `docs/superpowers/specs/2026-10-03-theme-identity-redesign-design.md`.
One PR per theme, Ivory → Terra → Midnight → Cobalt.

- Ivory "Surat dari Keraton": Great Vibes / Cinzel / Lora; gading-sogan
  palette; kawung watermark; gunungan gate cover; canting heading rule;
  melati after an attending RSVP; wax seal on copy. Plan:
  `docs/superpowers/plans/2026-10-03-ivory-identity.md`.
- Jost stays installed for Midnight; `cormorant-garamond` removed.
```

- [ ] **Step 2: Full verification**

Run: `npm test`
Expected: all tests pass (previous 282 + the new ones), 0 failures.

Run: `npm run lint && npm run typecheck && npm run build`
Expected: each exits 0.

- [ ] **Step 3: Visual QA with fixture data (never the live invitation)**

Create `src/app/qa-fixture/page.tsx` rendering `<ThemeRenderer invitation={…} guest={null} />` (`import { ThemeRenderer } from "@/themes/ThemeRenderer"; import "@/themes/theme-fonts";`) with the `invitation()` shape from `tests/nusantara-ivory-identity.test.mjs`, `theme.slug: "nusantara-ivory"`, `features.rsvp/gift/story: true`, one gift account and two stories. Start the dev server with the Browser preview (`preview_start` name `web`), open `/qa-fixture` and check, at 375×812 and desktop:

1. Cover: ivory leaves, gold gunungan split at the seam, script names, Cinzel date, "Buka Undangan" button; tap → text fades, leaves part, hero visible.
2. Section headings: canting rule draws once when scrolled into view.
3. Couple names and closing title in Great Vibes; body copy in Lora ≥16px.
4. Copy account number → wax seal stamps; button reads "Tersalin".
5. Repeat 1–4 with reduced motion emulated (cover opens instantly, rules already drawn).

RSVP melati needs a successful server action (Turnstile rejects localhost), so it is covered by the behaviour test, not visual QA. Take screenshots of 1 and 4 for the PR, then delete `src/app/qa-fixture/` and any `public/qa/` files.

- [ ] **Step 4: Commit docs and push**

```bash
git add docs/DESIGN.md docs/PROJECT_MEMORY.md
git commit -m "docs: record the Ivory identity redesign

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push -u origin design/theme-identity-redesign
```

- [ ] **Step 5: Open the PR and stop**

```bash
gh pr create --title "Ivory identity: Surat dari Keraton" --body "$(cat <<'EOF'
Ivory gets its own identity from the theme identity spec (docs/superpowers/specs/2026-10-03-theme-identity-redesign-design.md):

- Great Vibes (names) / Cinzel (headings) / Lora (body)
- gading-sogan-emas-bata palette, kawung watermark, AA contrast test
- gunungan gate cover (music still starts on the first tap)
- canting-drawn heading rule, melati after an attending RSVP, wax seal on copy
- reduced motion: cover opens instantly, rules render drawn, no melati

Presentation only; no capability changes. Merging deploys production and changes the live Rayhana & Febri invitation.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Then report the PR link and screenshots to the user and **wait for an explicit "merge"** before merging.
