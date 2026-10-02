# Cobalt Riviera Implementation Plan

## Goal

Add `cobalt-riviera` as the fourth production wedding theme while preserving
the normalized invitation contract, package behavior, public-form security,
and visual output of Nusantara Ivory, Terra Botanica, and Midnight Atelier.

The approved source of truth is:

`docs/superpowers/specs/2026-10-01-cobalt-riviera-theme-design.md`

Implementation may improve composition, spacing, responsive rhythm, and
interaction feedback when browser evidence supports the change. It must not
replace the approved sunlit destination editorial direction with another
theme, literal beach decoration, or generic travel UI.

## Execution rules

- Complete one numbered task at a time and confirm with the user before the
  next task.
- Use subagent-driven development with a fresh implementer and an independent
  reviewer for each task.
- Use behavioral TDD: show RED, implement the smallest coherent change, then
  show GREEN.
- Do not register or activate an incomplete theme.
- Do not query Supabase, import package definitions, or duplicate server
  validation inside the theme.
- Reuse shared behavior and normalized data, not markup from another theme.
- Keep all 18 canonical capabilities explicit in the manifest.
- Any new public capability must land in all registered themes in the same
  change. Cobalt may not create a private feature fork.
- Read the installed Next.js guides for client directives, Image, and fonts
  before component implementation.
- Do not push, merge, deploy, or mutate remote Supabase without an explicit
  rollout request.

## Visual guardrails

Every implementation review must check the rendered result against these
approved identifiers:

- large Cobalt architectural surfaces;
- Porcelain reading fields and Sea Ink typography;
- Tangerine interaction moments and a restrained Citron sun;
- wide grotesk display typography with Newsreader body text;
- one horizon-shutter cover gesture;
- panoramic imagery, flat itinerary rows, route rules, and ceramic-grid rhythm;
- hard rectangular crops and deliberate quarter-circle geometry;
- no gradients, glass effects, repeated rounded cards, passport stamps,
  flight-path decoration, shells, palm clip art, or generic wave graphics.

### Upgrade rule

A visual upgrade may be implemented directly only when it:

1. strengthens an approved identifier above;
2. uses existing normalized data and shared behavior;
3. does not add a runtime dependency or inaccessible interaction;
4. works with missing media and long content;
5. passes comparison at 320, 390, 768, and 1440 widths.

A new motif, new interaction model, new feature, or changed data requirement
must update the design spec and receive user approval first.

## Planned file structure

```text
src/themes/cobalt-riviera/
├── index.ts
├── CobaltRiviera.tsx
├── fonts.ts
├── ThemeStyles.tsx
├── CoverGate.tsx
├── components/
│   ├── RivieraImage.tsx
│   ├── Section.tsx
│   ├── SectionHeading.tsx
│   ├── RouteNavigation.tsx
│   ├── SunMark.tsx
│   └── AddToCalendar.tsx
└── sections/
    ├── HeroSection.tsx
    ├── QuoteSection.tsx
    ├── CoupleSection.tsx
    ├── EventsSection.tsx
    ├── CountdownSection.tsx
    ├── DressCodeSection.tsx
    ├── StorySection.tsx
    ├── GallerySection.tsx
    ├── LivestreamSection.tsx
    ├── RsvpSection.tsx
    ├── WishesSection.tsx
    ├── GiftSection.tsx
    └── ClosingSection.tsx
```

Theme files own presentation only. Shared calendar, URL safety, cover/audio,
active navigation, forms, pagination, clipboard feedback, and derived view
model behavior remain under `src/themes/shared/`.

## Task 1 — Approved design system and delivery plan

- Lock the product role, token system, typography, layout concept, signature
  interactions, storyboard, motion budget, absence behavior, performance
  budget, and uniqueness review.
- Map every canonical capability to a Cobalt-specific presentation.
- Define the upgrade boundary, safe catalogue slug, rollout, and rollback.

Acceptance: the spec is implementation-ready, commercially distinct, and does
not read as a blue recolor, beach template, or travel dashboard.

Status: design spec committed as `582da847`; implementation plan is the current
task deliverable.

## Task 2 — Contract tests and unregistered foundation

- Add Cobalt fixtures and behavioral foundation tests.
- Add an explicit 18-key manifest that TypeScript must validate.
- Create the unregistered theme directory and public export.
- Add bundled Familjen Grotesk and Newsreader font assets/configuration.
- Add scoped tokens, base styles, section primitive, stable image fallback,
  SunMark, route rule, and ceramic-line ornament.
- Prove the foundation adds no registry entry and changes no existing theme.

Acceptance: focused tests prove the complete manifest, bundled fonts, approved
palette, focus treatment, reduced-motion boundary, stable media, and
presentation-only source boundary.

## Task 3 — Shell, horizon cover, navigation, and music

- Compose the Cobalt shell from `buildThemeViewModel()`.
- Implement the photo-free horizon cover and labelled Citron sun button.
- Reuse shared cover/audio/focus/analytics behavior.
- Implement the 700–850ms shutter sequence and instant reduced-motion path.
- Add route navigation derived only from enabled content.
- Add the fixed music control without obscuring navigation or forms.

Acceptance: personalized and generic guests, long names, rejected autoplay,
focus handoff, reduced motion, repeated activation, disabled music, and absent
route targets pass mounted tests at mobile and desktop widths.

## Task 4 — Hero, quote, couple, parents, Instagram, and closing

- Add the panoramic hero and typographic missing-image horizon.
- Add the Newsreader quote interlude.
- Add offset couple portraits, biographies, parent credits, and accessible
  Instagram handles.
- Add the Cobalt closing field with the shared image fallback chain.
- Keep image geometry stable during slow load and failure.

Acceptance: full, sparse, missing-photo, failed-image, partial-person, and long
parent/name content stay readable at all required viewports without copying
another theme's composition.

## Task 5 — Itinerary, maps, calendar, countdown, dress code, livestream

- Implement one flat itinerary row per event, from one through five events.
- Keep event dates, times, venues, addresses, Maps, and calendar actions visible
  without accordion disclosure.
- Reuse shared WIB date/time, calendar, and HTTP(S)-only URL behavior.
- Add horizon countdown, wardrobe strip, and conditional broadcast row.
- Preserve useful event details when optional values are invalid or absent.

Acceptance: valid, partial, malformed, long, disabled, countdown-zero, and
unsafe-URL cases pass without orphan actions, crashes, clipping, or dead route
items.

## Task 6 — Story folio and ceramic-grid gallery

- Implement chronological story spreads including complete text-only entries.
- Use native CSS scroll snap as an enhancement on mobile, never as the only
  way to reach content.
- Implement panoramic anchor and ceramic-grid gallery layouts for one through
  forty images.
- Preserve order, captions, crop intent, lazy loading, keyboard reachability,
  and stable failure frames.

Acceptance: sparse and package-capacity collections render without layout
holes, trapped scrolling, eager below-fold loading, or horizontal overflow.

## Task 7 — RSVP, wishes, and gifts

- Implement Cobalt presentation over the existing shared form/action state.
- Add large attendance color fields with a visible check indicator.
- Preserve visible labels, Turnstile, understandable alerts, and newest edits
  through pending/error transitions.
- Add route-separated wishes with shared pagination.
- Add travel-folio gift receipts with truthful shared clipboard feedback.

Acceptance: mounted behavior tests cover payloads, selection, pending, error,
success, concurrency, pagination, clipboard rejection, long content, keyboard
focus, and minimum 48px controls.

## Task 8 — Registry, catalogue migration, parity, and documentation

- Register Cobalt with its explicit manifest and approved preview metadata.
- Add an idempotent catalogue upsert that preserves existing IDs and references.
- Expand cross-theme tests for four themes, every package, and every canonical
  capability.
- Verify admin discovery still uses `listActiveThemes()`.
- Update architecture, design, roadmap, and project memory.
- Document exact deployment, activation, verification, and rollback order.

Acceptance: all four slugs resolve through `ThemeRenderer`; incomplete or
unsupported slugs retain the safe fallback; migration and rollback contracts
are explicit and no production mutation has occurred.

## Task 9 — Full responsive, accessibility, performance, and regression QA

- Run full tests, lint, standalone TypeScript, diff, and production-build gates.
- Run hydrated browser checks at 320×568, 390×844, 768×1024, and 1440×900.
- Cover full, sparse, disabled, malformed, expired, slow-image, long-content,
  reduced-motion, keyboard-focus, rejected-audio, and mobile-performance states.
- Verify the cover action remains reachable with a long guest name at 320px.
- Compare Ivory, Terra, Midnight, and Cobalt after every shared-code change.
- Capture screenshots of closed cover, opened mobile, and opened desktop states.
- Require independent review and close every Critical or Important finding.

Acceptance: no Critical/Important regression remains, the temporary QA route is
removed, all rollout evidence is captured, and production activation has not
occurred without explicit authorization.

## Test strategy

Planned focused suites:

- `tests/cobalt-riviera-foundation.test.mjs`
- `tests/cobalt-riviera-shell.test.mjs`
- `tests/cobalt-riviera-narrative.test.mjs`
- `tests/cobalt-riviera-itinerary.test.mjs`
- `tests/cobalt-riviera-story-gallery.test.mjs`
- `tests/cobalt-riviera-interactions.test.mjs`
- `tests/cobalt-riviera-registration.test.mjs`
- `tests/cobalt-riviera-quality.test.mjs`

Tests must exercise rendered or mounted behavior. Source-text checks may guard
forbidden dependencies and styling contracts but cannot prove capability
parity by themselves.

## Risks and controls

| Risk | Control |
| --- | --- |
| Bright palette loses premium restraint | Limit Citron/Tangerine to named roles and review screenshots at every task. |
| Cover motion becomes a loading barrier | Keep content mounted, reuse shared focus behavior, and provide instant reduced motion. |
| Destination language becomes literal or kitschy | Reject tourism props; use horizon, typography, route rules, and geometry only. |
| Native scroll snap traps users | Keep normal overflow, keyboard reachability, and a static desktop composition. |
| Fourth theme duplicates shared logic | Enforce source-boundary tests and review every new helper location. |
| Shared change regresses production themes | Run representative four-theme fixtures before each task commit. |
| Font payload hurts mobile load | Bundle only required subsets/weights and measure final production build output. |

## Rollout order

1. Push the reviewed branch and create/update its pull request.
2. Deploy application support containing the registered renderer.
3. Confirm production build, public routes, and existing themes are healthy.
4. Apply only the reviewed idempotent Cobalt catalogue upsert.
5. Verify the active row through public/RLS discovery.
6. Verify authenticated admin selection and preview.
7. Publish a dedicated Cobalt invitation only after its content is reviewed.

Rollback starts by deactivating the `cobalt-riviera` catalogue row. Existing
invitations must be reassigned only with separate authorization. Roll back the
application deployment after catalogue deactivation. There is no destructive
down migration.
