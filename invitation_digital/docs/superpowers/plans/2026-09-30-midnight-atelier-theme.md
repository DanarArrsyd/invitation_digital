# Midnight Atelier Implementation Plan

## Goal

Add `midnight-atelier` as the third production wedding theme without changing
the normalized invitation contract, package behavior, or the visual output of
Nusantara Ivory and Terra Botanica.

## Execution rules

- Complete one numbered task at a time and confirm with the user before the
  next task.
- Use behavioral TDD: demonstrate RED, implement the smallest coherent change,
  then demonstrate GREEN.
- Do not register or activate an incomplete theme.
- Do not query Supabase or import package definitions from the theme.
- Every canonical capability stays explicit in the theme manifest.
- Reuse shared behavior, not existing theme markup.
- Do not push, merge, deploy, or mutate remote Supabase without an explicit
  request for that rollout stage.

## Task 1 — Design system and delivery plan

- Lock the product role, token system, typography, layout concept, storyboard,
  motion rules, absence behavior, and uniqueness review.
- Map all 18 canonical capabilities to a Midnight-specific presentation.
- Define the safe catalogue slug and rollout order.

Acceptance: the approved spec is implementation-ready and does not read as a
recolored Ivory/Terra or generic black-and-gold template.

## Task 2 — Contract tests and unregistered foundation

- Add Midnight fixtures and behavioral contract tests.
- Add an explicit 18-key manifest that TypeScript must validate.
- Create the unregistered theme directory, exported entry point, bundled fonts,
  tokens, base styles, section primitive, image fallback, and lightweight
  structural ornaments.

Acceptance: focused tests prove the manifest is complete and the foundation
does not alter either registered theme.

## Task 3 — Cover, shell, navigation, and music

- Implement the photo-free couture-programme cover.
- Reuse shared cover/audio/focus/analytics and active-navigation behavior.
- Implement the curtain-seam interaction, reduced-motion path, fixed music
  control, and navigation derived only from enabled content.

Acceptance: cover interaction, personalized guest, rejected audio, focus
handoff, reduced motion, and absent navigation targets are tested at mobile and
desktop widths.

## Task 4 — Hero, quote, couple, parents, and closing

- Add the cinematic hero and photo-free sparse state.
- Add quote interlude, portrait diptych, parents, Instagram credits, and closing
  image fallback chain.
- Preserve stable image frames and accessible failure fallbacks.

Acceptance: missing/partial/long content and image failures remain readable at
all required viewports.

## Task 5 — Events, maps, calendar, countdown, dress code, livestream

- Implement the evening-programme event chapter.
- Reuse shared calendar/WIB rules and render safe actions per event.
- Add countdown, wardrobe note, and conditional livestream treatment.

Acceptance: one/five events, invalid dates, invalid URLs, disabled features,
long venues, countdown zero, and reduced motion are covered.

## Task 6 — Story and gallery

- Implement ordered story acts including text-only entries.
- Implement cinematic contact-sheet gallery layouts for 1 through 40 images.
- Preserve captions, order, crop intent, lazy loading, and stable failure
  frames.

Acceptance: sparse and package-capacity collections render without clipping,
layout holes, or eager below-fold loading.

## Task 7 — RSVP, wishes, and gifts

- Implement Midnight presentation over shared form/action state.
- Preserve newest user edits through pending/error transitions.
- Keep Turnstile, accessible feedback, wish pagination, and clipboard truth.

Acceptance: mounted interaction tests cover payloads, error/pending/success,
pagination, clipboard rejection, long content, and 48px controls.

## Task 8 — Registry, catalogue migration, and cross-theme parity

- Register Midnight with preview metadata and its explicit manifest.
- Add an idempotent active-theme upsert that preserves IDs and references.
- Expand cross-theme tests for every package and canonical capability.
- Update architecture, design, roadmap, and project memory.

Acceptance: all three themes resolve through `ThemeRenderer`, the admin source
remains `listActiveThemes()`, and migration/rollback contracts are explicit.

## Task 9 — Full responsive, accessibility, and performance QA

- Run full test, lint, TypeScript, diff, and production-build gates.
- Run hydrated browser checks at 320, 390, 768, and 1440 widths.
- Cover full, sparse, disabled, malformed, expired, slow-image, long-content,
  reduced-motion, keyboard-focus, and mobile-performance states.
- Compare Ivory and Terra before/after shared-code changes.

Acceptance: no Critical/Important regression remains and rollout evidence is
captured before any remote release.

## Rollout order

1. Deploy application support containing the registered renderer.
2. Confirm the production deployment and registry build are healthy.
3. Apply the idempotent catalogue migration to make Midnight selectable.
4. Verify public/RLS theme discovery and an authenticated admin preview.

Rollback starts by deactivating the Midnight catalogue row. Reassign any
referencing invitations only with separate authorization, then roll back
application code. There is no destructive down migration.
