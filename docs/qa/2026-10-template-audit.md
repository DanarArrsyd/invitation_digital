# Template Readiness Audit — October 2026

Spec: `docs/superpowers/specs/2026-10-11-template-readiness-audit-design.md`.
Severity: Critical (broken feature or wrong data), Important (§28,
accessibility, visible phone defect), Minor (taste; owner picks).

## Baseline — QA matrix, 2026-10-12, branch at `253636d` (base `main` `4410d95`)

Core matrix: 105 pages, 43 with failures. Screenshots stay local in
`qa-output/2026-10-12T02-58-47-758Z/` (gitignored). Every failure below was
checked by hand against the screenshots or the live page; none is a runner
artefact. The tier-presence check (every section the package promises
renders with full data) passed on all 105 pages.

| Template | Check | Cases | Example case | Verified detail | Proposed round | Severity |
|---|---|---|---|---|---|---|
| All five | Wedding-only copy on non-wedding pages | 25 (5 per template) | `terra-botanica` signature birthday 375 | The nav label "Mempelai" is hard-coded; also the couple heading in Ivory | C | Important |
| Midnight, Cobalt, Kelir | Hydration mismatch under reduced motion | 3 (1 per template) | `midnight-atelier` signature wedding 375, reduced motion | `CoverGate` renders `data-reduced-motion={useReducedMotion()}`: `false` on the server, `true` on the client, so React logs a hydration error and keeps the server value. Breaks §28.1 (server and first client render must match). Guests still saw no cover motion: each theme's global reduced-motion block already sets `transition`/`animation: none !important` | A | Important |
| Nusantara Ivory | "Buka Undangan" outside the first screen | 7 | signature wedding 1280×800; all packages at 320×568; `panjang` at 375 | At 1280×800 the button sits at 819–867 px inside the scrolling gate (`ni-gate-scroll`, 915 px tall): reachable only by scrolling, invisible on a common laptop screen | B | Important |
| Terra Botanica | "Buka Undangan" outside the first screen | 3 | all packages at 320×568 | The recipient block starts near the fold; the button is below it | B | Important |
| Midnight Atelier | "Buka Undangan" outside the first screen | 3 | all packages at 320×568 | Button at 532–585 px on a 568 px screen (17 px cut) | B | Important |
| Terra Botanica | Nav label cut | 3 | grand wedding 768×1024; signature and grand at 320 | "Beran…", "Mempe…", "Strea…" truncate with an ellipsis, at 768 px too where the bar has room | B | Important |
| Nusantara Ivory | Nav label cut | 2 | signature and grand wedding 320×568 | "Mempe…", "Strea…" | B | Important |
| Cobalt Riviera | Nav label cut | 1 | grand wedding 320×568 | "Strea…" | B | Important |

Fixed in round A (2026-10-12): the three reduced-motion hydration rows
(Midnight, Cobalt, Kelir); their `…__375__rm` cases now pass the matrix.

Fixed in round B (2026-10-12/13): the open-button and nav-label rows. Core
matrix after round B: 105 pages, the only failures are the 25 round C
wedding-only copy cases (Ivory, Midnight and Cobalt re-run after the review
fixes: 21 pages each, copy failures only).

Not yet covered by the matrix and still to audit by hand in each round:
§28 items without an automatic check (round A), visual rhythm and empty
states (round B, plus the owner's real-phone pass through `/demo/<slug>`),
and copy beyond the wedding-only words (round C).

## Round A — Technical (§28)

Audited 2026-10-12 against §28.2–§28.5 for all five templates. Passing
everywhere: no Supabase or package access, `pickNavItems` with `data-nav-id`
and `useNavRailScroll`, the nine §28.2 anchors, `next/image` with
`isOptimizableImage` and no raw `<img>`, shared action icons, Turnstile
inside all ten forms.

| # | Template | Location | Finding | Severity | Evidence | Status |
|---|---|---|---|---|---|---|
| A1 | Midnight, Cobalt, Kelir | `CoverGate.tsx`, `ThemeStyles.tsx` | `data-reduced-motion={useReducedMotion()}` differed between server and client: a hydration error on every reduced-motion visit. The cover itself did not move for those guests, because the global reduced-motion block already stopped it; the scoped cover rules were redundant and stay only as documentation of intent | Important (§28.1) | `tests/template-hydration.test.mjs` | Fixed: no attribute; scoped rules in `@media (prefers-reduced-motion: reduce)` |
| A2 | Kelir | `tokens.ts` (`kencanaInk`) | Small gold eyebrow on `kelirDeep` at 4.03:1 | Important | `tests/kelir-kencana-contrast.test.mjs` | Fixed: `#84601D` → `#7A581B` (4.57:1) |
| A3 | All | tests | Automatable §28 rules unguarded | Important | `tests/template-readiness.test.mjs`, `tests/template-hydration.test.mjs` | Fixed |
| A4 | Cobalt, Kelir | `components/NavIcon.tsx` | Nav glyphs typed `Partial` with a fallback glyph | Minor | readiness test "full NavSectionKey record" | Fixed |
| A5 | Midnight | cover, RSVP and wish buttons | Typed "→" instead of a drawn arrow | Minor | readiness rule "no typed arrows" | Fixed: shared `ForwardArrowIcon` |
| A6 | All (shared) | `src/themes/shared/GalleryLightbox.tsx` | Previous/next buttons use typed "←" / "→" (not emoji-prone, but not drawn like other arrows) | Minor | found while widening the arrow check | Fixed in round B (B7) |

## Round B — Visual on phones

Reviewed 2026-10-12 from fresh matrix screenshots (`minim` and `panjang` at
375 px for all five templates, plus the baseline failures). Empty sections
disappear without gaps, long names and addresses wrap without overflow, and
the nav lists only rendered sections.

| # | Template | Location | Finding | Severity | Evidence | Status |
|---|---|---|---|---|---|---|
| B1 | Ivory | `CoverGate.tsx`, `ThemeStyles.tsx` | Open button off the first screen (cover 915 px at 1280×800, 790 px at 320×568) | Important | matrix "Buka Undangan" check; readiness "short screens" test | Fixed: short-screen compression (≤860 px), one-name titles keep their own scale, monogram and greeting hidden only at ≤620 px (real phones with browser bars, ~635–665 px, keep them); button at 729/800 and 500/568 |
| B2 | Terra | `ThemeStyles.tsx` | Open button ends at 643 px on 320×568 | Important | same | Fixed: ≤700 px rule; button at 526/568 |
| B3 | Midnight | `ThemeStyles.tsx` | Open button ends at 585 px on 320×568 | Important | same | Fixed: ≤700 px rule (row-gap only, names capped by height); button at 548/568; two-column cover keeps its column gap on landscape and short laptops |
| B4 | Terra | `ThemeStyles.tsx` (≥768 px nav) | Labels cut on tablets by `.9rem` item padding | Important | matrix "nav label cut"; readiness "tablet nav" test | Fixed: `.4rem .35rem` |
| B5 | Ivory, Terra, Cobalt | nav CSS | "Mempelai" / "Streaming" cut by 2–10 px at 320 px | Important | matrix "nav label cut" | Fixed: ≤360 px rules (Ivory, Terra); Cobalt fixed by B6 |
| B6 | All | theme roots | "Streaming" cannot fit Terra's Courier at 320 px | Important | readiness "Live" test | Fixed: nav label "Live" in every theme (owner decision) |
| B7 | All (shared) | `GalleryLightbox.tsx` | Typed "←" / "→" (A6) | Minor | `tests/action-icons.test.mjs` | Fixed: `BackArrowIcon` / `ForwardArrowIcon` |
| B8 | All | `DressCodeSection.tsx` | Swatches printed raw hex codes | Minor | readiness "dress-code swatches" test | Fixed: hex removed, swatch list `aria-hidden` (owner decision) |
| B9 | Midnight | cover/couple names | A 42-character one-word script name leaves a one-letter last line | Minor | `panjang` screenshot | Won't fix (owner decision) |
| B10 | Ivory | cover, landscape 844×390 | Button 18 px below the fold (Terra and Midnight now fit) | Minor | manual check | Residual: fixing needs names below 2.6rem or dropping ornaments; the gate scrolls |

## Round C — Event types

| Template | Location | Finding | Severity | Evidence | Status |
|---|---|---|---|---|---|
