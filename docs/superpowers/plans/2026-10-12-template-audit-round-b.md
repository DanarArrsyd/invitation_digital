# Template Audit Round B (Visual on Phones) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the round B findings (owner-approved 2026-10-12): the open button off the first screen (Ivory, Terra, Midnight), cut nav labels (Terra, Ivory, Cobalt), "Streaming" → "Live" in every theme, hex codes removed from dress-code swatches in every theme, drawn arrows in the shared gallery lightbox (A6), and the QA runner's capture timing.

**Architecture:** Presentation-only. Each fix stays in the owning theme's `ThemeStyles.tsx` / section component, or in `src/themes/shared/` for the lightbox. Visual fits are proven with the QA matrix checks ("Buka Undangan" inside the first viewport, "nav label cut"), and pinned with source assertions where a check can't run in `node --test`.

**Tech Stack:** Next.js 16, React 19, TypeScript strict, CSS in theme `ThemeStyles.tsx` (unlayered, so it outranks Tailwind's layered utilities), `node --test`, the QA matrix (`npm run qa:matrix`, `docs/DESIGN.md` §28.7).

**Spec:** `docs/superpowers/specs/2026-10-11-template-readiness-audit-design.md` (Round B). Evidence: `docs/qa/2026-10-template-audit.md` baseline.

## Round B findings (owner-approved)

| # | Template | Finding | Severity | Decision |
|---|---|---|---|---|
| B1 | Ivory | Open button outside the first screen: content 915 px at 1280×800, 790 px at 320×568 | Important | Short-screen compression |
| B2 | Terra | Open button ends at 643 px at 320×568 | Important | Short-screen compression |
| B3 | Midnight | Open button ends at 585 px at 320×568 (17 px cut) | Important | Tighten the existing short-phone rule |
| B4 | Terra | Nav labels cut at ≥768 px: item padding `.9rem` caps labels at 48 px in 77 px items | Important | Smaller horizontal padding |
| B5 | Ivory, Cobalt | "Mempelai" / "Streaming" cut by 2–6 px at 320 px | Important | Tighter item padding / tracking on narrow phones |
| B6 | All five | "Streaming" cannot fit Terra's Courier at 320 px | Important | Owner: rename the nav label to **"Live"** in every theme |
| B7 (A6) | All five (shared) | Lightbox previous/next use typed "←" / "→" | Minor | Drawn `BackArrowIcon` / `ForwardArrowIcon` |
| B8 | All five | Dress-code swatches print raw hex codes ("#A87A3D") | Minor | Owner: **remove the hex text**; the description and group label carry the meaning; swatches become decorative |
| B9 | Midnight | A 42-character one-word script name breaks with a one-letter last line | Minor | Owner: leave as is (no change) |
| — | QA runner | Screens are captured 600 ms after scrolling, before a 17-character typed label finishes (~650 ms) | Tool | Wait 900 ms |

## Global Constraints

- Presentation only; no data, capability or package change. Wedding copy other than the nav label "Streaming" → "Live" is unchanged.
- The open button ("Buka Undangan", any case) must sit fully inside the first viewport at 320×568, 375×812, 768×1024 and 1280×800 for `lengkap` data with the default guest, in every package (matrix check). Nothing may be removed from the cover except, on screens ≤ 640 px tall, Ivory's monogram badge and its one-line greeting ("Dengan hormat, kami mengundang Anda untuk hadir.").
- Nav labels are never cut at 320, 375, 768 or 1280 px in any package (matrix check), and nav items stay ≥ 52 px tall on phones.
- Text sizes stay legible: nav labels ≥ 10 px, cover names no smaller than 2.6rem.
- Short-screen rules use `@media (max-height: …)`; they must not change the layout on screens taller than the threshold (compare the 375×812 and 768×1024 cover screenshots before and after).
- No new dependencies. Commits end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Ask the owner before merging (merges deploy production).

## Review Focus

1. A short-screen rule that also fires on a landscape phone or a short desktop window and squeezes a layout that already fit — check 844×390 and 1280×800 screenshots by eye.
2. Hiding Ivory's monogram/greeting on short screens hiding it on normal phones too (the threshold must be height-based, not width-based).
3. Removing hex labels leaving swatches that a screen reader announces as empty list items — the swatch list must be `aria-hidden` or carry no empty items.
4. "Live" changing anchors or section ids (`-livestream` must stay; only the visible label changes).
5. The lightbox arrows losing their accessible names ("Foto sebelumnya", "Foto berikutnya" must stay).

---

### Task 1: Drawn lightbox arrows (B7 / A6)

**Files:**
- Modify: `src/themes/shared/action-icons.tsx` (add `BackArrowIcon`)
- Modify: `src/themes/shared/GalleryLightbox.tsx`
- Test: `tests/action-icons.test.mjs`

- [ ] **Step 1: Write the failing tests**

In `tests/action-icons.test.mjs`, widen the text-arrow check from `/>\s*[↗↘↓]\s*</` to `/>\s*[↗↘↓←→]\s*</` and append (reusing the imports added in round A):

```js
test("BackArrowIcon is a decorative drawn arrow", () => {
  const nodeRequire = createRequire(import.meta.url);
  const source = ts.transpileModule(readFileSync(new URL("../src/themes/shared/action-icons.tsx", import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const icons = {};
  vm.runInNewContext(source, { exports: icons, module: { exports: icons }, require: nodeRequire });
  assert.equal(typeof icons.BackArrowIcon, "function");
  const html = nodeRequire("react-dom/server").renderToStaticMarkup(nodeRequire("react").createElement(icons.BackArrowIcon));
  assert.match(html, /<svg[^>]*aria-hidden="true"/);
  assert.match(html, /class="theme-action-icon\b/);
});

test("the gallery lightbox names its arrows and draws them", () => {
  const source = readFileSync(new URL("../src/themes/shared/GalleryLightbox.tsx", import.meta.url), "utf8");
  assert.match(source, /<BackArrowIcon \/>[\s\S]*Foto sebelumnya/);
  assert.match(source, /<ForwardArrowIcon \/>[\s\S]*Foto berikutnya/);
  assert.doesNotMatch(source, /[←→]/);
});
```

- [ ] **Step 2: Run to verify they fail**

Run: `node --test tests/action-icons.test.mjs`
Expected: FAIL — `GalleryLightbox.tsx renders a text arrow`, `BackArrowIcon` not a function, lightbox source still has "←".

- [ ] **Step 3: Implement**

Add to `src/themes/shared/action-icons.tsx`, before `ForwardArrowIcon`:

```tsx
/** Goes back (previous photo): a thin horizontal arrow. */
export function BackArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`theme-action-icon ${className}`} aria-hidden="true" focusable="false" {...STROKE}>
      <path d="M20 12H5M10 7l-5 5 5 5" />
    </svg>
  );
}
```

In `src/themes/shared/GalleryLightbox.tsx` import `{ BackArrowIcon, ForwardArrowIcon }` from `./action-icons` and replace `<span aria-hidden="true">←</span>` with `<BackArrowIcon />` and `<span aria-hidden="true">→</span>` with `<ForwardArrowIcon />`. Keep both `sr-only` labels.

- [ ] **Step 4: Run to verify they pass**

Run: `node --test tests/action-icons.test.mjs tests/gallery-gift-parity.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/themes/shared/action-icons.tsx src/themes/shared/GalleryLightbox.tsx tests/action-icons.test.mjs
git commit -m "fix(themes): drawn arrows in the gallery lightbox

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: "Live" nav label (B6)

**Files:**
- Modify: `src/themes/nusantara-ivory/NusantaraIvory.tsx`, `src/themes/terra-botanica/TerraBotanica.tsx`, `src/themes/midnight-atelier/MidnightAtelier.tsx`, `src/themes/cobalt-riviera/CobaltRiviera.tsx`, `src/themes/kelir-kencana/KelirKencana.tsx`
- Modify: tests that expect "Streaming": `tests/terra-botanica-identity.test.mjs`, `tests/nusantara-ivory-identity.test.mjs`, `tests/kelir-kencana.test.mjs` (and any other the suite reports)
- Test: `tests/template-readiness.test.mjs` (append)

- [ ] **Step 1: Write the failing test**

Append to `tests/template-readiness.test.mjs`:

```js
test("every theme labels the livestream nav stop \"Live\" and keeps its -livestream anchor", () => {
  for (const slug of THEME_SLUGS) {
    const hits = themeFiles(slug)
      .map((file) => readFileSync(file, "utf8"))
      .filter((source) => /id: "[a-z]{2}-livestream"/.test(source));
    assert.equal(hits.length, 1, `${slug} builds one livestream nav item`);
    assert.match(hits[0], /id: "[a-z]{2}-livestream"[^}]*label: "Live"/, `${slug} labels it Live`);
    assert.doesNotMatch(hits[0], /label: "Streaming"/);
  }
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `node --test --test-name-pattern="Live" tests/template-readiness.test.mjs`
Expected: FAIL — `labels it Live`.

- [ ] **Step 3: Rename**

In each of the five files change the livestream nav item's `label: "Streaming"` to `label: "Live"`. Do not change ids, sections, icons or section headings.

- [ ] **Step 4: Update the tests that pinned "Streaming"**

Run `grep -rn "Streaming" tests` and change each nav-label expectation to "Live" (leave assertions about section headings or copy that is not the nav label). Run `npm test` and fix only expectations about this label.

- [ ] **Step 5: Run to verify**

Run: `npm test`
Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add src/themes tests
git commit -m "fix(themes): \"Live\" nav label so it fits every theme's bar

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Dress-code swatches without hex text (B8)

**Files:**
- Modify: `src/themes/{nusantara-ivory,terra-botanica,midnight-atelier,cobalt-riviera,kelir-kencana}/sections/DressCodeSection.tsx` and the matching `ThemeStyles.tsx` rules that style the hex label
- Modify: `tests/cobalt-riviera-itinerary.test.mjs`, `tests/midnight-atelier-programme.test.mjs` (they assert the hex text)
- Modify: `docs/PROJECT_MEMORY.md` (Terra construction map line "Text-labelled swatches; color is never the only signal")
- Test: `tests/template-readiness.test.mjs` (append)

- [ ] **Step 1: Write the failing test**

Append to `tests/template-readiness.test.mjs`:

```js
test("dress-code swatches are decorative: no hex text, list hidden from screen readers", () => {
  for (const slug of THEME_SLUGS) {
    const path = join(themesRoot, slug, "sections", "DressCodeSection.tsx");
    const source = readFileSync(path, "utf8");
    assert.doesNotMatch(source, />\s*\{color\}\s*</, `${slug} prints the hex code`);
    // The swatch list itself (ul, or Ivory's Stagger), not some other decorative div.
    assert.match(source, /<(ul|Stagger)[^>]*aria-hidden="true"/, `${slug} hides the swatch list from screen readers`);
  }
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `node --test --test-name-pattern="dress-code swatches" tests/template-readiness.test.mjs`
Expected: FAIL for the first theme that prints `{color}`.

- [ ] **Step 3: Implement in all five themes**

In each `DressCodeSection.tsx`:
- delete the text node that prints `{color}` (Ivory: the `ni-dresscode-hex` span; others: the `<span>{color}</span>` after the swatch);
- put `aria-hidden="true"` on the swatch list element (`<ul>` or Ivory's `Stagger` container) and drop the now-redundant `aria-hidden` on each swatch span;
- keep the group label (`<h3>` / heading) and the description visible and outside the hidden list.

Remove the CSS rules that only styled the hex label (e.g. `.ni-dresscode-hex`), and adjust any rule that laid out swatch + text side by side so swatches sit in a row (`display: flex; flex-wrap: wrap; gap: .5rem`) — check each theme's dress-code screenshot at 375 px.

- [ ] **Step 4: Update the pinned tests and docs**

`tests/cobalt-riviera-itinerary.test.mjs` and `tests/midnight-atelier-programme.test.mjs` read the hex labels via `.cr-dress-swatch + span` / `.ma-dress-swatch + span`: change those assertions to check the swatch colours instead (`[...document.querySelectorAll("#cr-dress-code .cr-dress-swatch")].map((node) => node.style.backgroundColor)` against the expected `rgb(...)` values, or the count of swatches) and assert no hex text is rendered (`assert.doesNotMatch(section.textContent, /#[0-9a-f]{6}/i)`).

In `docs/PROJECT_MEMORY.md` replace "tb-dress-code   Text-labelled swatches; color is never the only signal" with "tb-dress-code   Description and group label carry the guidance; swatches are decorative (owner decision 2026-10-12)".

- [ ] **Step 5: Run to verify**

Run: `npm test`
Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add src/themes tests docs/PROJECT_MEMORY.md
git commit -m "fix(themes): decorative dress-code swatches without hex codes

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Nav labels that fit (B4, B5)

**Files:**
- Modify: `src/themes/terra-botanica/ThemeStyles.tsx`, `src/themes/nusantara-ivory/ThemeStyles.tsx` (or its nav CSS location), `src/themes/cobalt-riviera/ThemeStyles.tsx`
- Test: `tests/template-readiness.test.mjs` (append, source assertions) + QA matrix evidence

- [ ] **Step 1: Write the failing test**

Append to `tests/template-readiness.test.mjs`:

```js
test("Terra's tablet nav leaves room for its widest label", () => {
  const css = readFileSync(join(themesRoot, "terra-botanica", "ThemeStyles.tsx"), "utf8");
  const tablet = css.match(/\.tb-theme \.tb-nav a \{ padding: ([^;]+);/);
  assert.ok(tablet, "tablet nav padding rule");
  const horizontal = parseFloat(tablet[1].split(/\s+/)[1]);
  assert.ok(horizontal <= 0.4, `horizontal padding ${tablet[1]} leaves the label too little room`);
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `node --test --test-name-pattern="tablet nav" tests/template-readiness.test.mjs`
Expected: FAIL (`.4rem .9rem`).

- [ ] **Step 3: Fix the three themes**

- Terra (≥768 px block): `.tb-theme .tb-nav a { padding: .4rem .9rem; …}` → `padding: .4rem .35rem;`.
- Ivory and Cobalt: on phones, reduce the nav item's horizontal padding (and label letter-spacing to 0 if it is positive) inside `@media (max-width: 360px)` until "Mempelai" and "Live" fit at 320 px with ≥ 10 px text. Find the rules with `grep -n "floating-nav\|cr-route" src/themes/{nusantara-ivory,cobalt-riviera}/ThemeStyles.tsx`. Measure in the browser (`label.scrollWidth <= label.clientWidth`) at 320×568 on `/qa-matrix/<theme>?paket=grand`.

- [ ] **Step 4: Verify**

Run: `node --test tests/template-readiness.test.mjs`, then with `npm run dev`:

```bash
npm run qa:matrix -- --theme terra-botanica --viewport 768 --chromium "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
npm run qa:matrix -- --theme terra-botanica --viewport 320 --chromium "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
npm run qa:matrix -- --theme nusantara-ivory --viewport 320 --chromium "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
npm run qa:matrix -- --theme cobalt-riviera --viewport 320 --chromium "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
```

Expected: no "nav label cut" and no "shorter than 52px" failures (other known failures may remain until Task 5 / round C).

- [ ] **Step 5: Commit**

```bash
git add src/themes tests/template-readiness.test.mjs
git commit -m "fix(themes): nav labels fit at 320 px and on tablets

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Open button on the first screen (B1, B2, B3)

**Files:**
- Modify: `src/themes/nusantara-ivory/CoverGate.tsx` (semantic class names), `src/themes/nusantara-ivory/ThemeStyles.tsx`
- Modify: `src/themes/terra-botanica/ThemeStyles.tsx`
- Modify: `src/themes/midnight-atelier/ThemeStyles.tsx`
- Test: `tests/template-readiness.test.mjs` (append) + QA matrix evidence

- [ ] **Step 1: Write the failing test**

Append to `tests/template-readiness.test.mjs`:

```js
test("Ivory, Terra and Midnight compress their cover on short screens", () => {
  for (const [slug, selector] of [["nusantara-ivory", "ni-cover-names"], ["terra-botanica", "tb-cover-layout"], ["midnight-atelier", "ma-cover"]]) {
    const css = readFileSync(join(themesRoot, slug, "ThemeStyles.tsx"), "utf8");
    assert.match(css, new RegExp(`@media \\(max-height: \\d+px\\)\\s*\\{[^@]*\\.${selector}`), `${slug} has a short-screen cover rule for .${selector}`);
  }
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `node --test --test-name-pattern="short screens" tests/template-readiness.test.mjs`
Expected: FAIL for `nusantara-ivory` (no `.ni-cover-names` class yet) and `terra-botanica`.

- [ ] **Step 3: Ivory (B1)**

In `CoverGate.tsx` add semantic classes next to the existing Tailwind ones so CSS can target them: `ni-cover-pad` on the `relative flex min-h-full items-center justify-center px-7 py-16` div, `ni-cover-monogram` on the monogram wrapper (`mt-5`), `ni-cover-names` on both `<h1>` variants, `ni-cover-greeting` on the "Dengan hormat…" `<p>`, `ni-cover-cta` on the CTA wrapper (`mt-11`). Then add to `ThemeStyles.tsx` (unlayered CSS outranks Tailwind's layered utilities):

```css
/* Short screens: the cover must show "Buka Undangan" without scrolling. */
@media (max-height: 860px) {
  .ni-cover-pad { padding-block: clamp(1.5rem, 5svh, 3rem); }
  .ni-cover-names { font-size: clamp(2.6rem, min(15vw, 9svh), 7rem); margin-top: clamp(.75rem, 2svh, 1.5rem); }
  .ni-cover-content > * > .mt-7, .ni-cover-content > * > .mt-6, .ni-cover-content > * > .mt-8 { margin-top: clamp(.6rem, 2.2svh, 1.75rem); }
  .ni-cover-cta { margin-top: clamp(1rem, 3.5svh, 2.75rem); }
}
@media (max-height: 640px) {
  .ni-cover-monogram, .ni-cover-greeting { display: none; }
}
```

Tune the clamp values with the browser (start values above) until, at 1280×800 and 320×568, `button.getBoundingClientRect().bottom <= innerHeight - 8`, and at 375×812 and 768×1024 the cover screenshot is unchanged in proportion (heights may shrink slightly only on screens ≤ 860 px tall). Record the final values in the ledger.

- [ ] **Step 4: Terra (B2)**

Add to `src/themes/terra-botanica/ThemeStyles.tsx` (after the base cover rules):

```css
    /* Short screens: keep "Buka Undangan" above the fold. */
    @media (max-height: 700px) {
      .tb-theme .tb-cover-layout { gap: clamp(1rem, 3.5svh, 2.5rem); padding-top: max(2rem, env(safe-area-inset-top)); padding-bottom: max(2rem, env(safe-area-inset-bottom)); }
      .tb-theme .tb-journal-label { margin-bottom: 1rem; }
      .tb-theme .tb-cover-names { font-size: clamp(2.8rem, min(13vw, 9svh), 7.5rem); }
      .tb-theme .tb-cover-date { margin-top: 1rem; }
      .tb-theme .tb-cover-recipient .tb-action { margin-top: 1rem; }
    }
```

Tune until the 320×568 button bottom ≤ 560 px; 375×812 must be unchanged (the rule does not apply above 700 px).

- [ ] **Step 5: Midnight (B3)**

Extend Midnight's existing short-phone rule (`@media (max-height: 700px) { .ma-toast { … } }`) with a cover rule that recovers ≥ 30 px, e.g.:

```css
      @media (max-height: 700px) {
        .ma-toast { width: clamp(84px, 24vw, 120px); margin-top: 1rem; }
        .ma-cover .ma-cover-names { margin-top: .5rem; }
        .ma-cover .ma-cover-recipient { padding-top: 1rem; }
      }
```

Use the real selectors from `grep -n "ma-cover-names\|ma-cover-recipient\|ma-cover-masthead" src/themes/midnight-atelier/ThemeStyles.tsx` and tune until the 320×568 button bottom ≤ 560 px.

- [ ] **Step 6: Verify**

Run `node --test tests/template-readiness.test.mjs`, then with `npm run dev`:

```bash
npm run qa:matrix -- --theme nusantara-ivory --chromium "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
npm run qa:matrix -- --theme terra-botanica --viewport 320 --chromium "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
npm run qa:matrix -- --theme midnight-atelier --viewport 320 --chromium "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
```

Expected: no `"Buka Undangan" is not inside the first viewport` failure. Open the 320, 375 and 1280 cover screenshots of each theme and confirm the composition still reads as designed (names prominent, nothing overlapping). Also check 844×390 by hand in the browser and note the result in the ledger (landscape phones are not in the matrix).

- [ ] **Step 7: Commit**

```bash
git add src/themes tests/template-readiness.test.mjs
git commit -m "fix(themes): open button on the first screen on short screens

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Runner timing, verification, report, PR

**Files:**
- Modify: `scripts/qa/matrix.mjs` (`waitForTimeout(c.reducedMotion ? 150 : 600)` → `900`)
- Modify: `docs/qa/2026-10-template-audit.md` (round B table)

- [ ] **Step 1: Runner timing**

In `scripts/qa/matrix.mjs` change the per-screen wait from `c.reducedMotion ? 150 : 600` to `c.reducedMotion ? 150 : 900` and add the comment `// Long enough for a typed label (38 ms per character) to finish.`

- [ ] **Step 2: Full verification**

Run: `npm test`, `npm run lint`, `npm run typecheck`, `npm run build`. Expected: all pass.

- [ ] **Step 3: Full core matrix**

With `npm run dev` (and nothing else using the dev server): `npm run qa:matrix -- --chromium "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"`.
Expected: the only failures are round C's wedding-only copy on non-wedding pages (25 cases). Record the result.

- [ ] **Step 4: Record round B**

Fill the "Round B — Visual on phones" table in `docs/qa/2026-10-template-audit.md` with B1–B9 (template, location, finding, severity, evidence, status), mark A6 as fixed by B7, and note under the baseline table that the open-button and nav-label rows are fixed.

- [ ] **Step 5: Commit, push, PR**

```bash
git add scripts/qa/matrix.mjs docs/qa/2026-10-template-audit.md
git commit -m "docs(qa): round B findings fixed; runner waits for typed labels

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push -u origin HEAD
gh pr create --base main --title "Template audit round B: visual fixes on phones" --body "<summary of B1–B8, verification, matrix result; ends with the Claude Code line>"
```

Report the PR link and stop; the owner decides the merge.
