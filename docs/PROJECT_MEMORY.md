# Project Memory

Last updated: 29 September 2026 (Asia/Jakarta)

## Purpose

This is the durable resume checkpoint for the invitation platform. Read it
after `CLAUDE.md` and before continuing the active Terra Botanica plan. The
approved spec and implementation plan remain the source of truth:

- `docs/superpowers/specs/2026-09-24-terra-botanica-theme-design.md`
- `docs/superpowers/plans/2026-09-24-terra-botanica-theme.md`

## Product decisions that must survive future sessions

- The platform is a reusable invitation product, not a one-off wedding site.
- Packages are named **Intimate**, **Signature**, and **Grand**.
- Package availability and normalized public data stay upstream of themes.
- Every public feature or layout added to one registered theme must be
  represented in **all registered themes** through the canonical typed section
  contract. Presentation may differ; capability parity may not.
- `nusantara-ivory` must remain visually unchanged while Terra is built.
- Terra Botanica uses the approved **Editorial Garden** direction: Fraunces,
  Manrope, Linen/Clay/Moss/Cacao/Sun/Bone, asymmetrical editorial composition,
  restrained custom botanical marks, and no generic SaaS-card styling.
- Sponsorship is only a reserved package entitlement. There is no public
  sponsorship data model or UI in this plan.
- Themes receive normalized data and never query Supabase directly.
- Missing optional data renders nothing or an intentional sparse composition;
  never invent customer data.
- Do not push, deploy, or apply a remote Supabase migration without a separate
  explicit user request.

## Working location and repository state

Active isolated project worktree:

`/Users/ekadanararrasyid/.codex/worktrees/package-entitlements/VS Code/invitation_digital`

The worktree is intentionally detached and externally managed. Do not create
another worktree or move implementation back to the dirty original checkout.
The untracked `supabase/.temp/` directory predates this work; never stage,
delete, or modify it.

Current verified behavior commit: `3abb1e3c` (final countdown/calendar parity
fix). Task 9 was completed in `0a6d5cdf` and `16f45366`. The full suite passes
150/150; lint, TypeScript, diff checks, and the production build pass. The
exact final documentation commit is recorded in the final-fix report.

## Current architecture and data flow

Keep the following ownership chain intact:

```text
public route
  → resolve invitation publication/expiration and guest
  → normalize public invitation data
  → apply Intimate/Signature/Grand entitlements upstream
  → ThemeRenderer resolves invitation.theme.slug
  → registered theme receives PublicInvitation + Guest
  → buildThemeViewModel derives shared presentation values
  → theme composes its own markup and visual language
  → shared hooks own reusable browser/action behavior
  → existing server actions validate, verify Turnstile, and write data
```

Key boundaries:

- `src/themes/section-contract.ts` owns the canonical 18 public capabilities.
  Every registered theme lists every key explicitly; never generate a manifest
  from the canonical list.
- `src/themes/registry.ts` maps a normalized theme slug to its component,
  preview metadata, category, and explicit manifest.
- `src/themes/ThemeRenderer.tsx` is the only public theme resolver. Unsupported
  slugs retain the existing safe fallback.
- `src/themes/shared/view-model.ts` owns shared derived presentation data such
  as couple name, guest name, primary event, a validated WIB countdown instant,
  calendar event, dress code, and hero/closing images.
- `src/themes/shared/calendar.ts` owns event date/time validation, calendar
  eligibility, WIB timestamp conversion, and pure Google Calendar/ICS generation.
- Shared hooks own cover/audio/focus/analytics, active-section navigation,
  RSVP/wish action state and pagination, pending-error input recovery, and
  clipboard feedback.
- Theme directories own markup, spacing, typography, ornaments, responsive
  composition, and visual feedback only. They do not query Supabase or
  duplicate package, validation, calendar, or server-action logic.
- `listActiveThemes()` remains the admin theme source. The registry is not an
  admin catalogue and no second theme list should be introduced.

## Cross-template feature workflow

When adding a feature or layout capability to any template, follow this order:

1. Decide whether it is a new public capability or a new presentation of an
   existing capability. If new, add one canonical key to the section contract.
2. Update the explicit manifest for **every** registered theme. TypeScript must
   fail until no theme is missing the key.
3. Add/normalize the data and package entitlement upstream. Themes must not
   contain package names, database queries, or customer-specific defaults.
4. Put reusable calculations and interaction state in `src/themes/shared/`.
   Keep only theme-specific DOM/CSS/ornaments inside each theme package.
5. Implement the user outcome in Ivory, Terra, and every future registered
   theme. Layouts may express different art directions, but no template may
   silently lose the feature.
6. Add cross-theme behavioral tests for feature gating, empty/error states,
   payloads, accessibility, and package parity. Source-text assertions alone
   never prove parity.
7. Run focused RED/GREEN, the full suite, lint, TypeScript, production build,
   and representative visual checks before review.
8. Update architecture/design documentation and, for a brand-new theme, add an
   idempotent database catalogue migration with an explicit rollout/rollback
   sequence.

Never solve parity by copying shared business logic between theme folders.

## Terra Botanica construction map

`TerraBotanica.tsx` consumes `buildThemeViewModel()` once, builds navigation
from actual enabled content, and composes the invitation in this order:

```text
CoverGate — photo-free opening, guest personalization, music and focus handoff
  ├─ tb-beranda      Hero — image-led journal opening or botanical sparse state
  ├─ Quote           Optional opening quote; no empty section
  ├─ tb-mempelai     Couple + parents + optional Instagram
  ├─ tb-acara        The Gathering — all readable event rows
  │    ├─ maps       Valid HTTP(S) URL and enabled feature only
  │    └─ calendar   Valid supplied positive same-day interval only
  ├─ tb-countdown    WIB countdown; clamps/stops at zero
  ├─ tb-dress-code   Text-labelled swatches; color is never the only signal
  ├─ tb-cerita       Travel-journal stories, including text-only entries
  ├─ tb-galeri       Organic collage for sparse or package-capacity galleries
  ├─ tb-livestream   Enabled feature plus usable event URL only
  ├─ tb-rsvp         Shared action state + Turnstile, Terra presentation
  ├─ tb-ucapan       Shared action/pagination, latest edits survive errors
  ├─ tb-kado         Shared clipboard feedback; no false “Tersalin” state
  └─ tb-penutup      Conclusive Moss closing with image fallback chain
```

Capabilities such as parents, maps, calendar, and Instagram may be visually
grouped with an adjacent chapter, but remain independently represented by the
canonical manifest and feature tests. Disabled or empty optional capabilities
must produce no dead navigation target and no decorative gap.

## Terra Botanica design grammar

### Visual identity

- Direction: **Editorial Garden** — intimate field journal, contemporary and
  organic, not rustic-boho and not a recolored Ivory clone.
- Display type: Fraunces for names, chapter headings, quotes, expressive dates,
  and the primary interaction moment.
- Supporting type: Manrope for body copy, metadata, controls, inputs, labels,
  countdown units, and accessibility-critical text.
- Palette: Linen `#F2E7D8`, Clay `#B6634B`, Moss `#53634E`, Cacao `#45372C`,
  Sun `#D6A663`, and Bone `#FBF7F0`.
- Composition: asymmetrical editorial spreads, alternating portrait/text
  rhythm, deliberate whitespace, stable image crops, and restrained custom SVG
  botanical silhouettes.
- Memorable interaction: the cover opening and oversized RSVP attendance
  choice. Everything else stays quieter and supports reading.

### Section language

- Cover: photo-free, sculptural botanical forms, one intentional opening motion.
- Hero: the first photography-led spread after the cover.
- Couple: alternating portraits and text; never profile cards.
- Gathering: Clay surround with a Bone reading sheet and flat editorial rows.
- Story: travel-journal rhythm with graceful text-only entries.
- Gallery: one anchor image plus staggered pairs; balance every allowed count.
- RSVP/wishes: flat underline fields, visible labels, 48 px controls, direct
  Indonesian success/error copy, and no dashboard styling.
- Gifts: rule-separated account rows, not repeated cards.
- Closing: deep Moss, restrained typography, intimate and conclusive.

### Avoid

- generic SaaS cards, repeated rounded containers, soft grey shadows, gradients;
- repeated tracked all-caps eyebrow labels or decorative `01/02/03` numbering;
- an animation on every section or generic fade-and-slide entrances;
- admin/shadcn components in the public invitation;
- invented customer copy, photos, dates, accounts, addresses, or links;
- visual changes to Ivory while implementing Terra.

### Required absence and failure behavior

- Missing content uses a composition designed for absence, never fake data.
- Failed images retain their aspect ratio and render an accessible botanical
  fallback; below-hero images lazy-load.
- Remote Supabase images currently remain `unoptimized` because no safe narrow
  allowlist exists; do not broaden configuration without integration evidence.
- Forms retain the newest user edits through pending/error transitions,
  preserve understandable `role="alert"` feedback, and keep Turnstile visible.
- External Maps, Instagram, calendar, and livestream actions render only from
  usable normalized values and use safe external-link behavior.
- All interactive controls require visible keyboard focus and useful accessible
  names. Non-essential motion must honor `prefers-reduced-motion`.

## How agents should validate a design change

For every changed public section:

1. Test actual rendered/mounted behavior and name the regression being caught.
2. Verify disabled, empty, malformed, error, pending, and success states that
   apply to the section.
3. Check long unbroken and natural text without clipping or horizontal scroll.
4. Check 320×568, 390×844, 768×1024, and 1440×900.
5. Check fewer-than-default and package-capacity collections.
6. Check keyboard focus, labels, contrast, reduced motion, and stable media
   dimensions/slow-loading behavior.
7. Compare Ivory before/after whenever shared code changes.
8. Require an independent task review; fix every Critical/Important finding and
   request a scoped re-review before marking the task complete.

## Completed Terra task history

| Task | Outcome | Commit(s) | Verification/review |
| --- | --- | --- | --- |
| 1 | Added the canonical 18-section theme contract, explicit manifests, and preview metadata. | `fbae86ea` | 76/76 tests; independent review clean. |
| 2 | Extracted pure shared theme view-model and calendar builders; moved ICS timestamp creation to the UI boundary. | `3b639f0c`, `2b7cf69e` | 83/83 tests; one Important purity issue fixed and re-reviewed. |
| 3 | Extracted shared cover/audio/focus/analytics, navigation, public-form, pagination, and clipboard behavior; rewired Ivory without visual changes. | `c570bca0` | 91/91 tests; independent review approved. |
| 4 | Added the unregistered Terra foundation, cover, fonts, tokens, navigation, ornaments, focus and reduced-motion behavior. | `7b711fa9` | 100/100 tests; 320/390/768/1440 checks; review clean. |
| 5 | Added Terra hero, quote, couple/parents, story, gallery, closing, image fallbacks, and sparse states. | `361b3760` | 106/106 tests; four viewport checks; no Critical/Important findings. |
| 6 | Added The Gathering: event details, maps, calendar, countdown, dress code, and livestream. Follow-up fixed invalid calendar intervals, WIB countdown semantics, and four-digit day wrapping. | `4c792f21`, `2b2b3212` | 120/120 tests; focused 15/15; UTC checks 5/5; lint/types and four viewports pass; re-review clean. |
| 7 | Added Terra RSVP, wishes, and digital gifts using shared public-form and clipboard behavior. Follow-up fixed pending-request error recovery so newer edits are never overwritten by a stale submission snapshot. | `a94d9139`, `d964bfaa` | 132/132 tests; task gate 60/60; four viewport/interaction checks; Important race fixed and re-review clean. |
| 8 | Registered Terra in application code, added the idempotent local active-theme upsert, verified all package/theme combinations, and documented parity plus safe rollout/rollback. Two test-only follow-ups hardened exact-write, FK-preservation, and comment-bypass contracts. | `5534560b`, `c319d915`, `8d301dfa` | 139/139 tests; task gate 14/14; lint/types/diff/build pass; Important test gap closed after two scoped re-reviews. |
| 9 | Verified responsive, accessibility, performance, and hydrated browser behavior for both themes; isolated Terra feature flags. | `0a6d5cdf`, `16f45366` | 145/145 tests; 24 hydrated theme/viewport/fixture cases plus slow-image and expired-state checks; lint/types/diff/build pass. |
| Final parity fix | Centralized WIB countdown interpretation and valid supplied event intervals; decoupled Ivory calendar availability from countdown while preserving its visual treatment. | `3abb1e3c` | 150/150 tests; cross-theme timezone/calendar regression tests; focused Ivory browser checks at 320 and 1440 px; lint/types/diff/build pass. |

Terra is now registered in application code. The migration file is committed
but has not been applied to Supabase; therefore live admin discovery is not yet
active or verified.

## Remaining rollout notes

- The Task 5 Instagram accessible-name note and Task 8 registry-example note
  were resolved during Task 9. The typed registry and runtime tests now cover
  the current two-theme contract.
- Remote Supabase images intentionally retain existing `unoptimized` delivery
  because `next.config.ts` has no narrow remote allowlist. Stable ratios,
  explicit sizes, lazy loading, and error fallbacks are already implemented.
  Revisit optimization only during integration QA with evidence.

## Required execution workflow

Work one task at a time with subagent-driven development:

1. Read the task in the plan, the spec, this checkpoint, and the SDD ledger.
2. Dispatch one fresh implementer in the isolated worktree.
3. Require behavioral TDD: prove RED before production code and GREEN after.
4. Run the task-specific gate, full `npm test`, lint, TypeScript, and relevant
   responsive/browser checks.
5. Commit only that task.
6. Generate a review package and dispatch an independent reviewer.
7. Fix every Critical or Important finding and request scoped re-review.
8. Update the SDD ledger and this checkpoint when the durable state changes.
9. Stop and confirm with the user before starting the next numbered task.

Tests must exercise exported/runtime/render behavior. Source-string grep alone
does not prove a feature works. Do not perform unrelated refactors.

The ignored execution ledger is at:

`/Users/ekadanararrasyid/.codex/worktrees/package-entitlements/VS Code/.superpowers/sdd/2026-09-24-terra-botanica-theme/progress.md`

## Resolved review notes

- Task 3's deferred cross-theme hook-integration gap is closed. Task 7 mounts
  the real Terra and Ivory RSVP/wish components through the shared hooks and
  verifies action payloads, pagination, state feedback, input recovery, and
  pending-edit concurrency behavior.

## Next step — remote rollout requires user authorization

The local implementation and Task 9 quality gate are complete. Do not push,
apply the Terra migration to remote Supabase, or deploy until the user explicitly
authorizes those actions. The committed migration has not been applied remotely;
live admin theme discovery and customer data integration remain unverified.
