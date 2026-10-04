# Project Memory

Last updated: 3 October 2026 (Asia/Jakarta)

## Purpose

This is the durable resume checkpoint for the invitation platform. Read it
after `CLAUDE.md` and before continuing theme work. Approved specifications and
implementation plans remain the source of truth:

- `docs/superpowers/specs/2026-09-24-terra-botanica-theme-design.md`
- `docs/superpowers/plans/2026-09-24-terra-botanica-theme.md`
- `docs/superpowers/specs/2026-09-30-midnight-atelier-theme-design.md`
- `docs/superpowers/plans/2026-09-30-midnight-atelier-theme.md`
- `docs/superpowers/specs/2026-10-01-cobalt-riviera-theme-design.md`
- `docs/superpowers/plans/2026-10-01-cobalt-riviera-theme.md`

## Product decisions that must survive future sessions

- The platform is a reusable invitation product, not a one-off wedding site.
- Packages are named **Intimate**, **Signature**, and **Grand**.
- Package availability and normalized public data stay upstream of themes.
- Every public feature or layout added to one registered theme must be
  represented in **all registered themes** through the canonical typed section
  contract. Presentation may differ; capability parity may not.
- Existing themes must remain visually unchanged unless shared behavior
  requires a tested parity fix.
- Terra Botanica uses the approved **Editorial Garden** direction: Herr Von
  Muellerhoff / Courier Prime / Spectral, the Herbarium Cinta palette (see the
  2026-10-03 identity spec), asymmetrical editorial composition,
  restrained custom botanical marks, and no generic SaaS-card styling.
- Midnight Atelier uses the approved **dark cinematic couture** direction:
  Bodoni Moda, Barlow Condensed, Ink/Lacquer/Oxblood/Champagne/Pearl/Smoke,
  programme-led editorial composition, and no generic black-and-gold styling.
- Cobalt Riviera uses the approved **sunlit destination editorial** direction:
  wide grotesk display type, Newsreader body text, Cobalt/Porcelain/Sea Ink/
  Tangerine/Citron/Pool, a horizon-shutter cover, panoramic imagery, flat
  itinerary rows, and ceramic-grid rhythm. Literal beach/travel props and
  generic travel cards are outside the approved direction.
- Sponsorship is only a reserved package entitlement. There is no public
  sponsorship data model or UI in this plan.
- Themes receive normalized data and never query Supabase directly.
- Missing optional data renders nothing or an intentional sparse composition;
  never invent customer data.
- Do not push, deploy, or apply a remote Supabase migration without a separate
  explicit user request.

## Working location and repository state

Since 2 October 2026 the repository is a standalone clone of
`github.com/DanarArrsyd/invitation_digital` at
`/Users/ekadanararrasyid/VS Code/invitation_digital`, and `main` is the
source of truth and the production branch (merges auto-deploy on Vercel).

History: the themes were originally built inside a parent `VS Code`
repository under the `invitation_digital/` prefix (the Codex worktree
`~/.codex/worktrees/package-entitlements` still points there). That history
was imported with `git subtree split` and merged in PR #4; the `codex/*`
branches were then deleted. Do not resume work in the old worktree.

Work happens on a feature branch from `main`, merged through a pull request
after lint, typecheck, tests and build pass.

Terra's final verified behavior commit is `3abb1e3c`. Midnight Atelier Tasks
1–7 end at `7644883d`; Task 8 ends at `a788711d`; Task 9 ends at `17964b00`.
Its gate passes 201/201 tests plus lint, TypeScript, diff, and production build,
with hydrated browser coverage recorded below.

Cobalt Riviera Task 1 design specification ends at `582da847`. Its approved
implementation plan is the active work on branch `codex/cobalt-riviera-theme`.
The spec is the visual source of truth. Agents may improve composition within
its upgrade rule but may not introduce a new motif or interaction model without
updating the spec and receiving user approval.

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
- `src/themes/shared/external-url.ts` owns the HTTP(S)-only boundary for Maps
  and livestream actions across every registered theme.
- Theme directories own markup, spacing, typography, ornaments, responsive
  composition, and visual feedback only. They do not query Supabase or
  duplicate package, validation, calendar, or server-action logic.
- Cross-theme rules from the owner (Oct 2026), binding for every current and
  future template:
  - Calendar actions live only in the countdown section, from the primary
    event (`buildThemeViewModel().calendarEvent`); events show Maps only. The
    section renders calendar-only when there is no countdown target.
  - Floating/route navigation shows a theme-drawn SVG icon per item, mapped
    from the item's `section` key, next to the visible label (Ivory
    `FloatingNav`, Terra/Midnight/Cobalt `components/NavIcon.tsx`).
  - Person roles are a fixed admin choice (`src/lib/invitations/person-role.ts`)
    and public data normalizes stored roles to lowercase keys; themes label
    parents "Putri dari"/"Putra dari" from them. Name headings are never
    capped by a `ch` reading measure.
  - Mobile responsive UI rules (DESIGN.md §9 and §12a): the bottom nav holds
    at most 5 items picked by `pickNavItems` (`themes/shared/nav-priority.ts`),
    spans the width with equal items, never scrolls sideways, icon
    `clamp(18px, 5.2vw, 22px)` over a label of at least 11px, items at least
    52px tall, safe-area offsets, and content reserves bottom space for it.
  - Hero: the pre-wedding photo is 3:4 in every template; on mobile the title
    block comes first and the photo below it.
- `listActiveThemes()` remains the admin theme source. The registry is not an
  admin catalogue and no second theme list should be introduced.

## Cobalt Riviera construction map

`CobaltRiviera.tsx` consumes `buildThemeViewModel()` once and composes the
fourth visual system from the same normalized invitation contract:

```text
CoverGate — horizon shutters, guest personalization, music and focus handoff
  ├─ Hero + quote — panoramic or typographic horizon opening
  ├─ Couple + parents — offset resort editorials and social credits
  ├─ Itinerary — events, Maps, countdown + calendar, dress code, livestream
  ├─ Story — ordered folio with complete text-only entries
  ├─ Gallery — panoramic anchor plus ceramic mosaic
  ├─ RSVP — large checked color fields over shared action state
  ├─ Wishes — route-separated notes over shared action and pagination
  ├─ Gifts — flat folio receipts with truthful shared clipboard feedback
  └─ Closing — Cobalt conclusion through the shared image fallback chain
```

The registry preview uses Cobalt `#1646C8`, Porcelain `#FFF9EE`, and Tangerine
`#F06A3C`. The catalogue migration is
`20261002000001_cobalt_riviera_theme.sql`; it is a single slug upsert that
preserves an existing row ID and all invitation foreign-key references.

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
5. Implement the user outcome in Ivory, Terra, Midnight, and every future
   registered theme. Layouts may express different art directions, but no
   template may silently lose the feature.
6. Add cross-theme behavioral tests for feature gating, empty/error states,
   payloads, accessibility, and package parity. Source-text assertions alone
   never prove parity.
7. Run focused RED/GREEN, the full suite, lint, TypeScript, production build,
   and representative visual checks before review.
8. Update architecture/design documentation and, for a brand-new theme, add an
   idempotent database catalogue migration with an explicit rollout/rollback
   sequence.

Never solve parity by copying shared business logic between theme folders.

## Midnight Atelier construction map

`MidnightAtelier.tsx` consumes the shared normalized data and composes a
distinct couture programme from the same canonical capabilities:

```text
CoverGate — curtain seam, guest personalization, music and focus handoff
  ├─ Hero — cinematic image or intentional dark sparse state
  ├─ Couple + parents — left-aligned editorial portrait spread
  ├─ Programme — events, maps, countdown + calendar, dress code, livestream
  ├─ Story — couture narrative sequence, including text-only entries
  ├─ Gallery — contact-sheet composition for sparse or full collections
  ├─ RSVP — Lacquer interaction using shared action state and Turnstile
  ├─ Wishes — Pearl guestbook using shared action and pagination behavior
  ├─ Gifts — dark ledger with shared clipboard feedback
  └─ Closing — restrained cinematic conclusion
```

Midnight uses Ink `#09090B`, Lacquer `#171216`, Oxblood `#541E2B`, Champagne
`#C6A15B`, Pearl `#F3EEE6`, and Smoke `#AAA3A4`. Bodoni Moda carries display
type and Barlow Condensed carries supporting type. Avoid gradients, fake foil,
stars, repeated ornamental frames, excessive gold, and SaaS cards. Optional
content must disappear cleanly, and nonessential motion must honor reduced
motion preferences.

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
- Direction since Oct 2026: **Herbarium Cinta** — the couple's pressed-flower
  herbarium (spec `docs/superpowers/specs/2026-10-03-theme-identity-redesign-design.md` §5).
- Type: Herr Von Muellerhoff for couple names; Courier Prime for specimen
  labels, dates, buttons and navigation; Spectral for italic headings and body.
- Palette: Linen `#F2EBDD`, Lumut `#4E5B3A`, Clay `#B5653E` (small text uses
  `--tb-clay-ink` `#9A4F2E`), Cacao `#4A3426`, Sun `#D9A441`, Bone `#FBF7EE`.
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

Terra and Midnight are registered in application code and both catalogue rows
were verified active in the production Supabase project on 1 October 2026.
The remote migration ledger predates the repository's renamed baseline and is
not aligned with every local filename. Do not run a bulk `supabase db push` to
repair that drift. Audit and reconcile migration history as a separate task.

## Completed Midnight Atelier task history

| Task | Outcome | Commit | Status |
| --- | --- | --- | --- |
| 1 | Approved and documented the dark cinematic couture direction. | `451f7669` | Complete. |
| 2 | Added tokens, typography, and unregistered theme foundation. | `3fb1338f` | Complete. |
| 3 | Built the Midnight shell, cover, navigation, and motion foundation. | `3ad1a041` | Complete. |
| 4 | Added hero, couple, parents, quote, and closing narrative. | `98334f83` | Complete. |
| 5 | Added programme, events, maps, calendar, countdown, dress code, and livestream. | `c306b6cc` | Complete. |
| 6 | Added couture story and contact-sheet gallery with sparse states. | `7e4ce95a` | Complete. |
| 7 | Added RSVP, wishes, and gift interactions through shared behavior. | `7644883d` | Complete. |
| 8 | Registered the theme, added a safe catalogue migration, expanded parity tests, and updated durable documentation. | `a788711d` | 195/195 tests; lint/types/diff/build pass. |
| 9 | Completed responsive, accessibility, performance, malformed-data, and hydrated browser QA across Midnight, Terra, and Ivory. The discovered Ivory invalid-date crash and unsafe event-link gap were fixed through shared validation boundaries. | `17964b00` | 201/201 tests; 48 hydrated theme/viewport/state cases, 3 slow-image cases, and 1 expired-state case; lint/types/diff/build pass. |

## Remaining rollout notes

- The Task 5 Instagram accessible-name note and Task 8 registry-example note
  were resolved during Task 9. The typed registry and runtime tests now cover
  the then-current three-theme contract; Task 8 now covers the four-theme
  contract including Cobalt Riviera.
- Remote Supabase images intentionally retain existing `unoptimized` delivery
  because `next.config.ts` has no narrow remote allowlist. Stable ratios,
  explicit sizes, lazy loading, and error fallbacks are already implemented.
  Revisit optimization only during integration QA with evidence.

## Cobalt Riviera task history

| Task | Outcome | Commit | Status |
| --- | --- | --- | --- |
| 1 | Approved the sunlit destination editorial direction and defined the guarded task-by-task delivery plan. | `582da847`, current plan commit | Complete. |
| 2 | Added the unregistered 18-section foundation, bundled Familjen Grotesk and Newsreader, scoped palette and accessible primitives, stable media fallback, and behavioral contract tests. | `f1005fb8` | Complete; 206/206 tests, lint, TypeScript, build, and independent review clean. |
| 3 | Added the photo-free horizon cover, shared opening/audio/focus/analytics behavior, mounted-target route navigation, and collision-safe music control. | `0be1400c` | Complete; 214/214 tests, lint, TypeScript, build, and independent review clean. |
| 4 | Added the panoramic hero and typographic missing-media horizon, optional Newsreader quote, offset couple and parent editorial, safe Instagram credits, and the closing field through the shared media fallback chain. | `4ab2550a` | Complete; 219/219 tests, lint, TypeScript, build, diff check, and independent review clean. |
| 5 | Added flat one-to-five-event itinerary rows, safe Maps and calendar actions, a WIB horizon countdown, labelled wardrobe strips, and conditional broadcast rows. | `9bc9593a` | Complete; 229/229 tests, lint, TypeScript, build, diff check, and independent review clean after two Important fixes. |
| 6 | Added the chronological story folio with text-only states and a panoramic-anchor ceramic gallery that preserves ordered media from one through forty images. | `92e74dc4` | Complete; 234/234 tests, lint, TypeScript, build, diff check, and independent review clean. |
| 7 | Added Cobalt RSVP, wishes, and travel-folio gift interactions over the shared action, Turnstile, pagination, and clipboard behavior. Feature-gated guest personalization, explicit attendance checks, truthful pending/error/success states, and 320px-safe controls are covered. | `31e5787f` | Complete; 242/242 tests, focused 16/16, lint, TypeScript, build, diff check, and independent review clean. |
| 8 | Registered Cobalt with approved preview metadata, added an idempotent in-place catalogue upsert, expanded four-theme package/capability parity, and documented safe rollout/rollback. | `f2733a3b` | Complete; focused 56/56 and full 246/246 tests, lint, TypeScript, build, and diff check pass; independent review clean; no push, deploy, or remote migration. |
| 9 | Completed final code and hydrated visual QA, hardened invalid-image fallbacks, and fixed tablet/desktop navigation plus hero collisions across portrait and landscape layouts. | current task commit | Complete; focused quality 7/7 and full 253/253 tests; 320/390/768/1024/1440 browser checks; lint, TypeScript, build, and diff check pass; no push, deploy, or remote migration. |

Next step: wait for user confirmation, then execute the documented Cobalt
Riviera rollout sequence. Do not push, deploy, apply the remote catalogue
migration, or activate production until explicitly requested.

## Cobalt Riviera rollout and rollback

The rollout order is strict:

1. Push the reviewed branch and update its pull request.
2. Deploy application support while the catalogue row is absent or inactive.
3. Verify all four registered slugs and the safe unsupported-theme fallback.
4. Apply only `20261002000001_cobalt_riviera_theme.sql`; do not use a bulk
   `supabase db push` against the drifted remote migration ledger.
5. Verify the exact row with
   `select id, name, slug, category, is_active from public.themes where slug = 'cobalt-riviera';`
   and confirm it is publicly discoverable under the active-theme RLS policy.
6. Confirm authenticated admin selection still flows through
   `listActiveThemes()`, then preview a dedicated Cobalt invitation.
7. Publish only after its content is approved.

Rollback begins with
`update public.themes set is_active = false, updated_at = now() where slug = 'cobalt-riviera';`.
Verify the row is inactive and absent from public/admin active-theme discovery.
Never delete the row or rewrite its ID. Audit and reassign referencing
invitations only with separate authorization, then roll back application code.
No remote step has been performed during Task 8.

## Cobalt Riviera production rollout — 2026-10-02

- Branch `codex/cobalt-riviera-theme` was pushed at reviewed commit `e529748f`.
- Pull request: https://github.com/DanarArrsyd/invitation_digital/pull/3 (delta against `codex/terra-botanica-theme`, because the remote `main` history is unrelated).
- Vercel production deployment `dpl_GX3dFa4CgKdHHgij7iS8VnGn5peR` reached `READY` and owns `https://invitation-digital-delta.vercel.app`.
- Smoke checks returned HTTP 200 for `/`, `/admin/login`, `/sample-1`, `/sample-2`, and `/rayhana-febry`; recent production logs showed info-level requests without runtime errors.
- Supabase project `kcmddkxpwhphyqynghsl`: applied only the Cobalt catalogue migration. The recorded migration is `20261002012904_cobalt_riviera_theme`; row `2344901c-5f17-49bc-8ba8-6e7092ce7c4f` is active and visible through the `anon` role.
- No Cobalt customer invitation was created or published; the theme is catalogue-ready and remains subject to content approval for the first dedicated invitation.
- Note: GitHub's automatic Vercel preview context for PR #3 reported an error before READY, while the explicit production deployment above built and reached READY successfully. Resolve that preview integration status before merging the PR.

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

## UI/UX redesign — 2–3 October 2026

Phased redesign from the UI/UX audit, each phase merged through its own PR:

| Phase | PR | Scope |
| --- | --- | --- |
| Repo cleanup | #4, #5 | Port Cobalt/Midnight history; docs into `docs/`; README; tooling |
| 1 Foundation | #6 | Admin font fix (`--font-sans` self-reference rendered Times); theme fonts via `src/themes/theme-fonts.ts`; admin status tokens; `--ni-*` tokens and AA contrast |
| 2 Admin components | #7 | `FormField`, `FormMessage`, `PageHeader`, `InvitationStatusBadge` (`lib/invitations/status.ts`); confirm dialogs on every delete |
| 3 Admin shell | #8 | One sidebar; `(protected)/(shell)` route group; preview renders full-bleed outside the shell |
| 4 Admin pages | #9 | Bulk guest paste, RSVP per guest, publish readiness checklist (`lib/invitations/readiness.ts`), Indonesian copy |
| 5 Ivory template | #10 | `next/image` for uploads, guest-action nav priority, text hero without photo, justified gallery honouring ratios, lightbox |
| 6 Guest forms | #11 | RSVP native radios, attendance recovery after errors, focus on confirmation, wish counter, copy fallback |
| 7 Polish + parity | this branch | Shared Reveal watcher; dead cover motion removed; lightbox and copy fallback brought to Terra, Midnight and Cobalt |

Shared pieces added for parity: `themes/shared/use-gallery-lightbox.ts`,
`themes/shared/GalleryLightbox.tsx`, `useCopyFeedback().failed` and
`copy(text, fallbackElement)`. `tests/gallery-gift-parity.test.mjs` mounts
every theme's real gallery and gift components.

Open items:

- Per-invitation time zone (WIB/WITA/WIT) shipped in PR #13
  (`lib/invitations/time-zones.ts`, `settings.timeZone`).
- Terra keeps its RSVP pressed-button pair (presentation), Ivory uses
  radios; both submit the same payload through `useRsvpForm`.

Visual QA without touching customer data: never open a live customer
invitation from local dev (each visit writes analytics). Use a throwaway
`src/app/qa-fixture/page.tsx` rendering `ThemeRenderer` with fixture data
and local SVGs in `public/qa/` (both listed in `.git/info/exclude`), then
delete them.

### Theme identity redesign (Oct 2026)

Spec: `docs/superpowers/specs/2026-10-03-theme-identity-redesign-design.md`.
One PR per theme, Ivory → Terra → Midnight → Cobalt; each theme gets its own
plan in `docs/superpowers/plans/` after the previous one merges.

- Ivory "Surat dari Keraton": Great Vibes / Cinzel / Lora; gading-sogan
  palette (`--ni-sogan`, `--ni-bata`, `--ni-hijau`, `--ni-cream-edge`);
  kawung watermark; gunungan gate cover; canting heading rule
  (`CantingRule`); melati after an attending RSVP (`MelatiShower`); wax seal
  on copy (`WaxSeal`). Plan: `docs/superpowers/plans/2026-10-03-ivory-identity.md`.
  `tests/nusantara-ivory-identity.test.mjs` pins contrast, script names,
  gate, rule, melati and seal.
- Deferred Ivory items: see spec §4 Deferred.
- Jost stays installed for Midnight; `cormorant-garamond` removed.
- `tests/font-delivery.test.mjs` fails if two themes map the same family.
- Ivory shipped in PR #14 (merge `07951a4`, production deployed 2026-10-03).
  Owner still to check the live Rayhana & Febri page via admin preview and a
  real phone.
- Terra "Herbarium Cinta": seed-to-bloom cover, scroll vine (`GrowingVine`,
  `themes/shared/use-scroll-progress.ts`), typed labels (`TypedText`,
  `themes/shared/use-in-view-once.ts`), dandelion after a sent wish, taped
  gallery prints. Plan: `docs/superpowers/plans/2026-10-03-terra-identity.md`.
  `@fontsource-variable/fraunces` and `manrope` removed.

#### Checkpoint — Midnight "Malam di Ballroom" (starting, 2026-10-04)

- Terra merged in PR #15 (merge `7750e29`); production deploy
  `dpl_2Ee2LkVNKNrUBmw8bBinXoqwKGmo` READY on
  `invitation-digital-delta.vercel.app`; `/admin/login` and `/sample-1`
  (Terra) return 200. Owner still to check on a real phone.
- Branch `design/terra-identity-at0kh3` reset to `main` `7750e29` for the
  Midnight work (the designated branch name is kept).
- Plan: `docs/superpowers/plans/2026-10-04-midnight-identity.md`. Already done
  for Midnight before the plan: art-deco nav icons, calendar in the
  countdown, 5-item mobile nav sizing, 3:4 title-first hero.

#### Checkpoint — Terra "Herbarium Cinta" (merged, 2026-10-04)

- Branch `design/terra-identity-at0kh3` (pushed; continues the earlier
  `design/terra-identity`), based on `main` `07951a4`. All 10 plan tasks
  done; the PR to `main` waits for the owner's explicit "merge" (merging
  deploys production).
- Commits: fonts `4deb1c3`; palette + paper texture + identity harness
  `407aa0c`; script names `fb66ae4`; shared hooks `f8a6198`; seed bloom
  `0ca3f56`; growing vine `38eacac`; typed labels `cf10a0e`; dandelion
  `3bce6de`; taped photos `7ca0328`. Fixes beyond the plan:
  - `8f51e88` `useScrollProgress` recomputes on body resize, so the vine is
    not full-grown after the cover opens.
  - `e4d2827` typed labels use a `"0px"` root margin so one at the page end
    cannot stay clipped.
  - Task 9 adds a reduced-motion override so photos show settled before the
    observer fires.
  - `useInViewOnce` arms (`watching`) only after the observer first reports
    the element off-screen; an element already on screen is `seen` without
    arming and renders as is (no hide-then-reveal flash on restored scroll
    or `#tb-galeri`).
  - Courier now covers Maps, calendar, gift copy, attendance legend and
    choices.
- Verification: `npm test` 311/312 (the one failure is the pre-existing
  environmental countdown timezone test: the nested `node --test` prints TAP,
  not `✔`, when piped on Node 22; its probe passes); lint, typecheck and
  `npm run build` clean.
- Visual QA (temporary fixture, Chromium at 320, 375 and 1280): names
  Herr Von Muellerhoff, labels/actions Courier Prime, headings italic
  Spectral, body Spectral 16px; one tap opens and the cover is inert at
  once, lifts by ~1.7s; vine 0 after opening, ~0.5 mid-page, 1 at the end,
  stays in the left gutter; event labels type out; gallery drops in and
  settles; no horizontal overflow at any width; reduced motion hides the
  cover at once, labels unclipped, no dandelion; dandelion is 20 nodes and
  stays on screen at 320px.
- Owner revisions after the first preview (2026-10-04/05), all on this
  branch and in PR #15:
  - Groom showed "Orang tua": stored role "Groom"; roles now normalized in
    public data and a fixed admin choice (`b8ecf78`, loaders `5c232f2`).
  - Terra text-only couple squeezed to a far-right column; fixed (`b8ecf78`).
  - Calendar moved into the countdown in Terra, Midnight, Cobalt (Ivory
    already did it); themed SVG nav icons in all three.
  - Shared `pickNavItems` (≤5) and the mobile bar/hero rules (`6fd4cb4`)
    applied to all four themes; hero photo 3:4 with the title first on
    mobile.
  - Browser QA at 320/375/1280 for all four themes: no overflow, 5 nav items
    each with an icon, no cut labels, ≥52px items on phones, title before a
    3:4 photo (Ivory's arch frame is 3:4; its image bleeds for parallax),
    calendar only in the countdown, groom reads "Putra dari".
- Remaining notes (not blocking):
  - After the seeds fade the bare dandelion stalk and its 120x130 space
    remain under the thank-you text; on desktop seeds briefly cross the
    wishes column.
  - Terra test harnesses still mock `next/font/google` Fraunces/Manrope
    (harmless, unused).
  - The countdown timezone test should assert on the probe's exit status
    instead of the `✔` glyph (separate fix).
- Workflow: superpowers subagent-driven development (fresh implementer per
  task, review per task). Local SDD scratch (`.superpowers/`) is gitignored.
- Terra-specific constraints learned: Terra source must not contain `<img`
  or `querySelector`; Terra effects are CSS + the shared
  `use-in-view-once` / `use-scroll-progress` hooks, not Motion components;
  server and first client markup must match under reduced motion.
- After Terra merges: write and run the Midnight plan, then Cobalt, from spec
  §6–7 (choices already approved: Midnight = Imperial Script / Bodoni Moda /
  Jost, champagne-toast opener, spotlight headings, dance card RSVP,
  bubbles on wishes, picture lights in gallery; Cobalt = Corinthia /
  Familjen Grotesk / Newsreader, receding-wave opener, wave dividers,
  morning-to-sunset scroll, postmark RSVP, message-in-a-bottle wishes).

## Resolved review notes

- Task 3's deferred cross-theme hook-integration gap is closed. Task 7 mounts
  the real Terra and Ivory RSVP/wish components through the shared hooks and
  verifies action payloads, pagination, state feedback, input recovery, and
  pending-edit concurrency behavior.

## Production rollout — complete

Commit `2b7f7065` was pushed to `codex/terra-botanica-theme` and deployed to
Vercel production on 1 October 2026. Deployment
`dpl_DXPp8K1RntxvJRQBQs7viy8gVL9q` reached `READY` and owns the
`invitation-digital-delta.vercel.app` alias. The root and admin login route
returned HTTP 200, and the reviewed Midnight catalogue upsert returned an
active production row. Authenticated admin selection still requires a manual
signed-in confirmation; do not claim it from the unauthenticated smoke test.
