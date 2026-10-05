# Temuraya Landing & Template Catalogue

Date: 2026-10-05
Status: Decisions taken with the owner; awaiting spec review
Roadmap: Phase 7 "Marketing Website" in `docs/ROADMAP.md`

## 1. Goal

Turn `/` into the public home of **Temuraya**. Visitors browse the
templates, open a full demo of each one at the package they are considering,
compare packages and prices, and order through WhatsApp. The admin
produces the actual invitation exactly as today.

The site is a landing page and a template catalogue. It is not a customer
self-service product: no accounts, no checkout, no customer editor (those
stay in the roadmap's "Customer Self Service" future phase).

## 2. Decisions

| Topic | Decision |
|---|---|
| Visual direction | **A, "Hutan & Kertas"**: same identity as the admin and login (forest `#1f2b25`, paper `#f4f5f1`, ink `#17201b`, sage `#53634e`). The brand stays quiet so the colourful templates are the star. |
| Ordering | Pre-filled `wa.me` link that names template, package and event type. No lead table in this phase. |
| Prices | Edited by the admin in a CMS page, per package. A package without a price shows "Tanya harga". |
| WhatsApp number | Admin setting, not hardcoded. Until it is set, order buttons are hidden and a neutral "Segera hadir" note shows instead. |
| Demo content | Real invitations in the database flagged as demo, edited with the existing admin editor. Owner supplies the photos (made in Canva). |
| Event types | Filters show every type in the schema. Types without a template are labelled "Segera hadir" rather than hidden or faked. |
| Testimonials | Not shown until real customers exist. |
| Devices | Mobile-first; verified at 360, 390, 768, 1024 and 1280 px. |

## 3. Business flow

```text
Visitor → / or /template → template detail → demo (package switcher)
        → "Pesan template ini"
        → WhatsApp: "Halo Temuraya, saya mau pesan template Terra Botanica
          paket Signature untuk Pernikahan."
        → Admin confirms price, collects data, creates the invitation in
          /admin, sends the link.
```

The WhatsApp message is built from a template string stored in settings with
`{template}`, `{paket}` and `{acara}` placeholders, so the owner can change
the wording without a deploy.

## 4. Routes

| Route | Purpose | Rendering |
|---|---|---|
| `/` | Landing page | Static, revalidated by tag when settings, prices or catalogue change |
| `/template` | Catalogue with event-type filter (`?acara=`) | Static + tag revalidation |
| `/template/[themeSlug]` | Template detail | Static per theme + tag revalidation |
| `/demo/[themeSlug]` | Full demo invitation, `?paket=intimate\|signature\|grand` | Dynamic (package param), cached data |
| `/admin/...` | Unchanged, plus the new "Situs" CMS pages | Dynamic |
| `/[slug]` | Customer invitations, unchanged | Unchanged |

Static segments win over `/[slug]` in the App Router, so a customer slug equal
to a marketing segment would become unreachable. Slug validation gets a
reserved list: `admin`, `template`, `demo`, `paket`, `api`, `login`,
`tentang`, `kontak`, `faq`, `syarat`, `privasi`, `sitemap`, `robots`.

`/` currently redirects to `/admin`; it becomes the landing page. The admin
stays at `/admin`.

## 5. Visual system (direction A)

- **Tokens**: the admin palette moves into shared brand tokens
  (`--tr-forest`, `--tr-paper`, `--tr-ink`, `--tr-sage`, `--tr-line`,
  `--tr-card`) used by both the admin override and the marketing pages. One
  accent only (forest); sage for secondary text. No gradients except the
  admin's existing arch motif.
- **Type**: Geist (already loaded) for everything. Display headlines
  `clamp(2.25rem, 5vw, 4rem)`, tight tracking, max two lines. No serif on the
  brand; serifs belong to the templates.
- **Motif**: the thin arch outlines from the login and dashboard banner,
  used once in the hero and once in the closing CTA.
- **Shape**: 16px radius for cards and mockup frames, full pill for chips,
  12px for buttons, matching the admin.
- **Phone mockup**: a simple bezel frame around template screenshots
  (aspect 9:19.5). Screens are real images of each template, never
  div-built fake UI.
- **Motion**: restrained. Hero mockups cross-fade between templates every
  ~4s (CSS only, paused on hover and under `prefers-reduced-motion`); cards
  lift 2px on hover; sections fade in once. No scroll-jacking.
- **Theme**: light only for the brand pages, matching login and admin.
- **Copy**: Indonesian, plain and specific. No em dashes in UI strings.

## 6. Page content

### 6.1 `/` landing

1. **Header** (sticky, 64px): "T" monogram + Temuraya, links Template,
   Paket, FAQ, and a "Pesan via WhatsApp" button. Mobile: monogram + menu
   sheet; the WhatsApp button moves to a sticky bottom bar.
2. **Hero**: headline (working copy "Undangan digital untuk setiap
   perayaan."), one sentence under 20 words, buttons "Lihat template"
   (primary) and "Cara pesan" (secondary). Right on desktop / below on
   mobile: two overlapping phone mockups cycling template covers.
3. **Event-type chips**: Pernikahan, Lamaran, Ulang tahun, Aqiqah, Wisuda,
   Acara kantor. Chips with templates link to `/template?acara=…`; others
   show "Segera hadir".
4. **Template showcase**: active catalogue themes as cards (phone preview,
   name, tagline, event types), actions "Lihat demo" and "Detail".
   Mobile 1 column (horizontal scroll-snap), tablet 2, desktop 3 or 4.
5. **Cara pesan**: three steps, "Pilih template", "Kirim data acara",
   "Terima link undangan". Plain numbered list, not three equal cards.
6. **Paket**: Intimate, Signature (highlighted "Paling dipilih"), Grand.
   Price or "Tanya harga", short description, feature list derived from
   `PACKAGE_DEFINITIONS` (events, gallery limit, features), CTA per package.
   Mobile: segmented tabs; tablet: horizontal scroll-snap; desktop: three
   columns.
7. **Fitur**: guest name personalisation, RSVP, wishes, music, maps,
   countdown, digital gift, gallery. A bento of 6 tiles max with one real
   screenshot tile.
8. **FAQ**: 6 to 8 questions in an accordion (`<details>`), editable later;
   initial copy written in code.
9. **Closing CTA** on forest background with the arch motif, then a footer
   with the WhatsApp link and copyright.

### 6.2 `/template`

Heading, event-type filter chips, grid of template cards (same card as the
showcase), empty state for types without templates.

### 6.3 `/template/[themeSlug]`

Name, tagline, description, 3 to 5 screenshots (cover, couple, events,
RSVP) in a mobile scroll-snap / desktop grid, "Lihat demo" per package,
the package table with this template preselected, and the order button.

### 6.4 `/demo/[themeSlug]`

The theme renders full-screen through the existing `ThemeRenderer`, using
the demo invitation of that theme. A floating bar (bottom on mobile, top
right on desktop) carries the package switcher and "Pesan template ini".
It sits outside the theme tree and never covers the theme's own nav (the
theme nav moves up by the bar height in demo mode).

- Package switch re-resolves features with
  `resolveInvitationFeatures(packageKey, settings)` and applies the package
  limits (events, gallery count) to what is rendered.
- RSVP and wishes forms behave exactly like the real invitation, so the
  visitor sees each theme's confirmation moment (melati, postmark, dance
  card), but the server actions return success for demo invitations
  without writing anything or spending a Turnstile check. The demo bar
  already says it is a demo.
- Guest personalisation shows a sample name via `?to=` so the cover
  demonstrates it.
- `noindex`, never expires, no analytics events recorded.

## 7. Data model

### 7.1 `invitations.is_demo`

`boolean not null default false`. Demo invitations:

- are created in the admin like any invitation, then marked demo in the new
  catalogue page;
- are excluded from dashboard counts, "Perlu ditindaklanjuti" and the main
  list (a "Demo" filter shows them);
- skip expiration (`expires_at` stays null, publish keeps them live);
- are not reachable at `/[slug]` (the public loader treats `is_demo` as not
  found), only through `/demo/[themeSlug]`.

### 7.2 `themes` additions

| Column | Type | Use |
|---|---|---|
| `tagline` | `text` | One line on cards |
| `event_types` | `text[] not null default '{wedding}'` | Catalogue filter; values from the invitation `type` check |
| `screenshot_paths` | `text[] not null default '{}'` | Detail page gallery, phone mockups (first = cover) |
| `is_listed` | `boolean not null default false` | Shown on the marketing site (separate from `is_active`, which gates the admin theme picker) |
| `sort_order` | `int not null default 0` | Catalogue order |

`description` and `preview_image_path` already exist and are reused.

The demo of a theme is the invitation with `is_demo = true` and that
`theme_id` (unique partial index, one per theme). There is deliberately no
`themes.demo_invitation_id`: a second foreign key between the two tables
makes PostgREST embeds such as `theme:themes(*)` ambiguous (this broke
production briefly on 2026-10-05 before the key was dropped).

### 7.3 `package_offers`

| Column | Type |
|---|---|
| `package_key` | `text primary key check (package_key in ('intimate','signature','grand'))` |
| `price_idr` | `integer null check (price_idr >= 0)` |
| `price_note` | `text null` (e.g. "per undangan", "mulai dari") |
| `is_visible` | `boolean not null default true` |
| `updated_at` | `timestamptz` |

Entitlements stay in code (`PACKAGE_DEFINITIONS`); this table only carries
commercial fields. Seeded with three rows and null prices.

### 7.4 `site_settings`

Single row (`id boolean primary key default true check (id)`):
`whatsapp_number text null` (E.164 digits, validated with Zod),
`whatsapp_message text not null` (default template from section 3),
`instagram_url text null`, `updated_at`.

### 7.5 RLS

- `package_offers`, `site_settings`: anon/authenticated `select`;
  authenticated `all` (same pattern as `themes_admin_all`).
- `themes`: add anon `select` for `is_listed = true` rows (existing policy
  covers `is_active`).
- Demo invitation content is read with the server-only service client, like
  the existing public loader, so no anon policy change for demos.

## 8. Admin CMS ("Situs" sidebar group)

- **Paket & Harga** (`/admin/site/packages`): three rows, price input in
  rupiah with live formatting, note, visibility switch.
- **Kontak** (`/admin/site/contact`): WhatsApp number, message template with
  placeholder help and a live preview link, Instagram URL.
- **Katalog Template** (`/admin/site/catalog`): per theme: listed switch,
  order, tagline, event types (checkboxes), description, screenshot uploads
  (reusing the media upload actions and size/type validation), and the demo
  invitation picker (lists invitations of that theme; picking one sets
  `is_demo`).

Every save revalidates the marketing cache tags.

## 9. SEO and performance

- Metadata per page, Indonesian titles ("Temuraya | Undangan digital untuk
  setiap perayaan"), brand OG image for marketing pages.
- `sitemap.ts` lists `/`, `/template` and listed template detail pages;
  `robots.ts` disallows `/admin` and `/demo`.
- Marketing pages are Server Components. Client islands only for: mobile
  menu sheet, package tabs on mobile, demo floating bar.
- Screenshots via `next/image` with Supabase loader or sized `<img>` +
  `loading="lazy"` below the fold; hero images `priority`.
- Budget: LCP < 2.5s on mid-range mobile, CLS < 0.1, no new animation
  library.

## 10. Out of scope

Customer accounts, payment, self-service editor, order/lead table,
testimonials, blog, multi-language, dark mode for brand pages, custom
domain purchase (owner handles `temuraya.com`).

## 11. Risks

- **Empty catalogue**: no demo invitation exists until the owner builds
  them. Pages must render cleanly with zero listed templates (hero falls back
  to a single static brand mockup, catalogue shows "Template segera
  tersedia").
- **Wedding-only themes**: current templates use wedding wording ("The
  Wedding Of", "Mempelai"). Listing them under other event types would
  mislead, so `event_types` stays `{wedding}` until themes support other
  types.
- **Demo leakage**: RSVP/wishes from demos must never reach the database;
  enforced in both the UI and the server actions, covered by tests.
