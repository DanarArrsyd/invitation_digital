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
| Midnight, Cobalt, Kelir | Hydration mismatch under reduced motion | 3 (1 per template) | `midnight-atelier` signature wedding 375, reduced motion | `CoverGate` renders `data-reduced-motion={useReducedMotion()}`: empty on the server, `true` on the client. React leaves the server value, so the theme's reduced-motion cover rules never apply. Breaks §28.1 (server and first client render must match) | A | Important |
| Nusantara Ivory | "Buka Undangan" outside the first screen | 7 | signature wedding 1280×800; all packages at 320×568; `panjang` at 375 | At 1280×800 the button sits at 819–867 px inside the scrolling gate (`ni-gate-scroll`, 915 px tall): reachable only by scrolling, invisible on a common laptop screen | B | Important |
| Terra Botanica | "Buka Undangan" outside the first screen | 3 | all packages at 320×568 | The recipient block starts near the fold; the button is below it | B | Important |
| Midnight Atelier | "Buka Undangan" outside the first screen | 3 | all packages at 320×568 | Button at 532–585 px on a 568 px screen (17 px cut) | B | Important |
| Terra Botanica | Nav label cut | 3 | grand wedding 768×1024; signature and grand at 320 | "Beran…", "Mempe…", "Strea…" truncate with an ellipsis, at 768 px too where the bar has room | B | Important |
| Nusantara Ivory | Nav label cut | 2 | signature and grand wedding 320×568 | "Mempe…", "Strea…" | B | Important |
| Cobalt Riviera | Nav label cut | 1 | grand wedding 320×568 | "Strea…" | B | Important |

Not yet covered by the matrix and still to audit by hand in each round:
§28 items without an automatic check (round A), visual rhythm and empty
states (round B, plus the owner's real-phone pass through `/demo/<slug>`),
and copy beyond the wedding-only words (round C).

## Round A — Technical (§28)

| Template | Location | Finding | Severity | Evidence | Status |
|---|---|---|---|---|---|

## Round B — Visual on phones

| Template | Location | Finding | Severity | Evidence | Status |
|---|---|---|---|---|---|

## Round C — Event types

| Template | Location | Finding | Severity | Evidence | Status |
|---|---|---|---|---|---|
