# Temuraya Landing Implementation Plan

Spec: `docs/superpowers/specs/2026-10-05-temuraya-landing-design.md`
Branch: `design/terra-identity-at0kh3` (reset to `main` after each merge)

Each task ends with `npx tsc --noEmit`, `npm run lint`, `npm test` (the
known countdown WIB failure stays the only failure) and a commit. UI tasks
add a Playwright pass at 360, 390, 768, 1024, 1280 px with no horizontal
overflow, using a temporary `src/app/qa-fixture` (excluded via
`.git/info/exclude`, deleted after).

## Task 1: Schema and types

- Migration `2026100500000x_marketing_catalogue.sql`:
  - `invitations.is_demo boolean not null default false`;
  - `themes` columns `tagline`, `event_types`, `screenshot_paths`,
    `demo_invitation_id`, `is_listed`, `sort_order`;
  - tables `package_offers` (seed 3 rows, null prices) and `site_settings`
    (seed single row with the default WhatsApp message);
  - RLS per spec 7.5; `updated_at` triggers.
- Regenerate `src/types/database.ts`.
- Update `docs/DATABASE.md` (tables, RLS, demo rules).
- Tests: migration contract test (columns, defaults, policies present).

## Task 2: Domain layer

- `src/lib/marketing/`:
  - `whatsapp.ts`: `buildWhatsAppOrderUrl({ number, template, theme, packageKey, eventType })`
    with placeholder substitution and E.164 normalisation;
  - `price.ts`: `formatRupiah`, `describePackagePrice(offer)` ("Tanya harga"
    when null);
  - `event-types.ts`: Indonesian labels for the six invitation types.
- `src/lib/validation/invitation.ts`: reserved slug list + message.
- `src/server/marketing/queries.ts`: cached loaders (`unstable_cache` with
  tags `marketing:catalogue`, `marketing:packages`, `marketing:settings`)
  for listed themes, offers, settings, and demo invitation by theme slug.
- Tests: unit tests for all pure helpers and the reserved slug rule.

## Task 3: Demo-safe public behaviour

- Public loader treats `is_demo` invitations as not found at `/[slug]`.
- RSVP and wishes server actions reject demo invitation ids (no insert).
- Analytics recorder skips demo invitations.
- Dashboard summary and invitation list exclude demos; list gains a "Demo"
  status filter.
- Tests for each rejection path.

## Task 4: Admin "Situs" CMS

- Sidebar group "Situs": Paket & Harga, Kontak, Katalog Template.
- Pages + Zod-validated server actions per spec 8; screenshot upload reuses
  the media upload helper (type/size checks); demo picker sets `is_demo` and
  `themes.demo_invitation_id` in one action.
- Every action revalidates the marketing tags.
- Tests: action validation (bad phone number, negative price, unknown
  package/theme), revalidation calls.

## Task 5: Brand tokens and marketing shell

- Move the palette into shared tokens (`--tr-*`) consumed by the admin
  override and marketing pages; admin look unchanged.
- `src/app/(marketing)/layout.tsx`: header, mobile menu sheet, sticky mobile
  WhatsApp bar, footer.
- Components in `src/components/marketing/`: `PhoneMockup`, `TemplateCard`,
  `PackageTable` (tabs on mobile, scroll-snap on tablet, columns on desktop),
  `EventTypeChips`, `OrderButton` (hidden + note when no number).
- `/` stops redirecting to `/admin`; update `tests/admin-entry.test.mjs`.

## Task 6: Landing page `/`

- Sections per spec 6.1 with empty-catalogue fallbacks.
- Metadata, brand OG image.

## Task 7: Catalogue and detail pages

- `/template` with `?acara=` filter and "Segera hadir" empty states.
- `/template/[themeSlug]` with screenshots, per-package demo links, package
  table preselected, order button; `generateStaticParams` from listed themes;
  404 for unlisted.

## Task 8: Demo route

- `/demo/[themeSlug]?paket=…&to=…` rendering through `ThemeRenderer` with
  package-resolved features and limits, `noindex`.
- `DemoBar` client island (package switcher + order button), theme nav
  offset in demo mode, demo notice replacing form submit.
- Tests: package switch changes resolved features; forms show the demo
  notice; unknown theme or missing demo invitation returns 404.

## Task 9: SEO, sitemap, QA, docs

- `sitemap.ts`, `robots.ts`.
- Full responsive QA at the five widths, reduced-motion check, Lighthouse
  spot check on `/`.
- Update `docs/PROJECT_MEMORY.md` checkpoint and `CLAUDE.md`.
- PR, owner review, merge only after the owner says so.

## Owner inputs needed before launch (not blocking the build)

1. WhatsApp number and message wording (Kontak page).
2. Package prices (Paket & Harga page).
3. Demo invitations per template with Canva photos, then mark them demo in
   Katalog Template.
4. Template screenshots, taglines and descriptions.
