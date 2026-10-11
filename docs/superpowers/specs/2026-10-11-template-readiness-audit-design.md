# Template Readiness Audit — Design

**Date:** 2026-10-11
**Status:** Draft for owner review
**Phase:** 9 (Commercial Hardening), sub-project 0

## Context and intent

Temuraya has five live templates (Nusantara Ivory, Terra Botanica, Midnight
Atelier, Cobalt Riviera, Kelir Kencana) and no paying customers yet. There is
no promotion deadline. The owner wants the foundation and the templates tidy
before the first customer buys, so nothing basic is discovered late.

Phase 9 is split into independent sub-projects, each with its own spec, plan
and pull requests, in this order (owner decision, 2026-10-11):

0. Template readiness audit (this spec)
1. Error monitoring
2. Data lifecycle (expiry cleanup, analytics retention, backups)
3. Abuse guards (rate limits, storage limits)
4. Legal (privacy policy, terms, data handling procedure)
5. Vercel and Supabase plan review

"Tidy" means all three of (owner decision):

- **Technical:** every template works in every package, data shape, screen
  size and accessibility setting, measured against `docs/DESIGN.md` §28.
- **Visual:** spacing, type, empty states and signature motion hold up on
  phones.
- **Event types:** copy and flow read naturally for every `InvitationType`
  (`wedding`, `birthday`, `engagement`, `aqiqah`, `graduation`, `corporate`),
  not only weddings.

### Success criteria

- The QA tool runs locally and produces the core matrix in one command.
- Every Critical and Important finding from rounds A, B and C is fixed and
  re-checked with the tool; Minor findings are listed and the owner chose
  which to fix.
- A non-wedding invitation in any template shows no wedding-only copy.
- Rules that can be automated become cross-theme tests, so a sixth template
  is checked by the same suite.
- No app behaviour changes for existing customers beyond the fixes listed in
  the audit report.

### Known before the audit (evidence, 2026-10-11)

- Nav label "Mempelai" is hard-coded in all five themes, for every type.
- Ivory's couple heading is always "Mempelai"; Terra, Midnight and Cobalt use
  "Yang mengundang" for non-weddings; Kelir uses "Tuan rumah".
- Only Kelir maps `invitation.type` to an event name (`EVENT_NAMES`); others
  fall back to "Perayaan" or "Undangan".
- `PersonRole` already includes `celebrant`, `host` and `speaker`, so round C
  is not expected to need a schema change.
- Terra's cover button sits below the fold on a landscape phone (844×390);
  the cover scrolls, so it stays reachable.

## Approach

Audit by dimension across all five templates (round A technical, round B
visual, round C event types), one pull request per round, preceded by a
lightweight QA tool that produces the evidence for every round and stays in
the repo for future templates. Chosen over per-template audits because the
same defect usually appears in several themes and is best fixed once in
shared code.

## Part 1 — QA tool

### Fixture route

`src/app/qa-matrix/[themeSlug]/page.tsx`, committed.

- Calls `notFound()` when `process.env.NODE_ENV === "production"`, before
  reading any data. A test asserts this guard exists and runs first.
- Query parameters, each validated with Zod and falling back to a default:
  - `paket`: `intimate | signature | grand` (default `signature`)
  - `jenis`: an `InvitationType` (default `wedding`)
  - `kondisi`: `lengkap | minim | panjang` (default `lengkap`)
  - `to`: guest name (default "Nama Tamu Anda")
- Builds a `PublicInvitation` from `scripts/demo/content.mjs` (names, events,
  stories, gifts, wishes, `/demo/<theme>/` images) through a pure builder
  `src/lib/qa/fixture-invitation.ts`, then applies the package exactly as
  production does: `resolveEffectiveInvitationFeatures`,
  `NAV_SECTIONS_BY_PACKAGE`, and the package's `maxEvents` /
  `maxGalleryImages`. No Supabase, no analytics, no customer data.
- `jenis` sets `invitation.type`, and for non-wedding types replaces the
  bride/groom pair with one `celebrant` (birthday, aqiqah, graduation) or a
  `host` (corporate); engagement keeps a couple.
- `kondisi`:
  - `lengkap`: the full demo content.
  - `minim`: one event, no stories, no gallery, no gifts, no wishes, no
    quote, no parents, no music.
  - `panjang`: long unbroken names (40+ characters), a long venue and
    address, a 300-character wish, a long guest name.
- Renders `<ThemeRenderer>` with `import "@/themes/theme-fonts"`. The
  fixture invitation id exists in no database, so a submitted RSVP or wish
  is rejected server-side without any write (the demo short-circuit keys on
  the `is_demo` row and does not apply). The runner never submits forms;
  success, pending and error states stay covered by the existing mounted
  component tests.
- `/qa-matrix` is a static segment, so it takes precedence over the public
  `/[slug]` route.

The builder is unit-tested: package limits applied, nav sections per
package, type and role substitution, and each `kondisi`.

### Runner

`scripts/qa/matrix.mjs`, following `scripts/demo/images.mjs`: it loads
`playwright-core` (or `PLAYWRIGHT_CORE`) installed outside the project, so
no dependency is added. It expects `next dev` already running
(`--base-url`, default `http://localhost:3000`).

For each case it opens the page, screenshots the cover, clicks "Buka
Undangan", waits for the opener, screenshots the full page, and records:

- horizontal overflow (`scrollWidth > innerWidth`);
- console errors and failed requests;
- images that failed to load;
- whether "Buka Undangan" is inside the first viewport;
- nav stop count compared with the package's expected stops (after
  dropping sections with no content);
- any wedding-only string ("Mempelai", "The Wedding Of", "Pernikahan",
  "mempelai") on a non-wedding page.

Output goes to `qa-output/<run-timestamp>/` (gitignored): screenshots,
`report.json`, and `summary.md` listing every failed check.

Matrix sizes:

- **Core (default):** 5 templates × 3 packages × 4 viewports (320×568,
  390×844, 768×1024, 1440×900) with `jenis=wedding, kondisi=lengkap`, plus
  every other `jenis` and `kondisi` at 390×844 for every template on
  Signature. About 150 pages.
- **Full (`--full`):** every combination, 900 pages.
- `--theme`, `--viewport` filters for quick re-runs.

The runner exits non-zero when any check fails, so it can gate a PR
locally. It is not wired into CI in this sub-project.

## Part 2 — Audit rounds

Every round: run the tool, record findings, get the owner's approval of the
fix list, implement in one PR, re-run the tool as proof.

Findings live in `docs/qa/2026-10-template-audit.md`, one table per round:
template, location, finding, severity, evidence (screenshot path or test),
status.

- **Critical:** a broken feature or wrong data shown to a guest.
- **Important:** a §28 violation, an accessibility failure, or a visible
  phone defect.
- **Minor:** taste. Collected; the owner picks which to fix.

### Round A — Technical (§28)

Check each template against §28.2–§28.5: data contract, nav tiers and
icons, anchors, `next/image` with `isOptimizableImage`, shared action
icons, Turnstile inside forms, reduced motion, AA contrast for text and
active nav, server/client markup parity. Automatable rules become
cross-theme tests in `tests/template-readiness.test.mjs` that iterate the
theme registry, so new templates are covered automatically.

### Round B — Visual on phones

From the screenshots (cover, each section, `minim` and `panjang`, at 320
and 390 px): spacing, type hierarchy, clipped or colliding text, empty
states that look intended, signature motion moments. Includes the
landscape cover button. A separate owner step checks every template on a
real phone through `/demo/<slug>`; findings from that step are added to the
report.

### Round C — Event types

A shared module `src/themes/shared/event-copy.ts` returns, per
`InvitationType`, the vocabulary themes need: cover label, eyebrow, the
people-section heading, its nav label, and the event noun. Example
direction (final wording is approved in the round C fix list):

| Type | People heading / nav | Event noun |
|---|---|---|
| wedding | Mempelai | Pernikahan |
| engagement | Pasangan | Lamaran |
| birthday | Yang berulang tahun | Ulang tahun |
| aqiqah | Ananda | Aqiqah |
| graduation | Wisudawan | Wisuda |
| corporate | Tuan rumah | Acara |

All five themes read copy from this module; each theme keeps its own
presentation (type, layout, ornament) but not its own words. Theme-specific
lines that are part of an identity (for example Terra's "The Wedding
Journal") get a per-type variant in the theme, still chosen by
`invitation.type`. A cross-theme test renders every template for every
non-wedding type and asserts none of the wedding-only strings appear.

Parent lines ("Putri dari", "Putra dari") are checked for celebrant and
host roles. If round C finds a need to change the data model (roles or
fields), that is raised with the owner as a separate decision and is not
part of this sub-project.

## Order and pull requests

1. PR 1 — QA tool (fixture builder, route, runner, tests, `.gitignore`).
2. PR 2 — Round A fixes and cross-theme tests.
3. PR 3 — Round B fixes.
4. PR 4 — Round C: `event-copy.ts`, theme wiring, tests.

Each PR passes `npm test`, lint, typecheck and build, attaches the QA
summary, and waits for the owner before merging (merges deploy
production).

## Out of scope

- New templates or new sections.
- Midnight's gold-line chandelier (stays deferred unless the owner asks).
- CI integration of the QA runner.
- Changes to package tiers, prices or entitlements.
- Schema changes (raised separately if round C needs one).

## Risks

- `/qa-matrix` reaching production: mitigated by the `notFound()` guard and
  its test.
- Fixture drift from real data: the builder reuses the production package
  functions and the demo content source, so it only diverges where `jenis`
  and `kondisi` deliberately change data.
- Copy changes reaching live invitations: every live invitation today is a
  wedding or a demo, and wedding copy stays unchanged; round C diffs are
  reviewed against wedding screenshots before and after.
