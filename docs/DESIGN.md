# DESIGN.md

## 1. Design Goal

The public invitation must feel personally art-directed, not generated from a generic template builder.

Theme #001:

```text
Name: Nusantara Ivory
Category: Wedding
Direction: Nusantara Editorial
Mood: Warm, refined, intimate, modern
Cultural intensity: Subtle
Primary palette: Ivory / cream
```

The result should feel appropriate for a premium digital wedding invitation.

---

## 2. Design Philosophy

Use:

- editorial composition;
- generous negative space;
- elegant, theme-specific typography (each theme has its own display/body trio; see `docs/superpowers/specs/2026-10-03-theme-identity-redesign-design.md`);
- Nusantara Ivory: script face for couple names, inscription display face for headings, book serif for body;
- strong photography;
- subtle Indonesian visual references;
- restrained ornament;
- calm motion.

Avoid:

- purple-blue gradients;
- neon;
- glowing effects;
- excessive glassmorphism;
- generic SaaS cards;
- oversized pill buttons everywhere;
- random floating blobs;
- obvious AI-generated visual tropes;
- excessive floral decoration;
- decorative clutter.

---

## 3. Nusantara Direction

"Nusantara" must be expressed subtly.

Acceptable references:

- thin geometric ornament;
- pattern rhythm inspired by Indonesian textiles;
- restrained line motifs;
- arch/frame shapes inspired by architecture or carving;
- fine botanical illustration;
- delicate paper texture;
- editorial use of culturally inspired separators.

Avoid:

- random batik PNG pasted into corners;
- overly literal ethnic costume decoration;
- visual clutter;
- mixing unrelated Indonesian motifs without rationale.

The theme should still work for customers who want Indonesian elegance without a heavily traditional ceremony.

---

## 4. Color System

Suggested base tokens:

```css
--ivory-50:  #FCFAF5;
--ivory-100: #F7F1E7;
--cream-200: #EEE3D1;
--sand-300:  #D8C7AC;

--ink-900:   #27231F;
--brown-800: #453B31;
--brown-600: #766453;

--gold-muted: #AA8D61;
--olive-muted: #7C8069;
```

Exact values may be refined visually.

Rules:

- main backgrounds remain light;
- text contrast must stay readable;
- muted gold is an accent, not the entire UI;
- avoid shiny metallic simulation;
- olive is optional and minimal.

---

## 5. Typography

Use two primary type roles. Each theme's actual font trio is defined in `docs/superpowers/specs/2026-10-03-theme-identity-redesign-design.md`.

**Nusantara Ivory** overrides the roles below with three: a script face (Great Vibes) for couple names and signatures only, an inscription display face (Cinzel) for headings, eyebrows and dates, and a book serif (Lora) for body copy and forms at 16px or larger.

### Display Serif

Used for:

- couple names;
- major section headings;
- dates used decoratively;
- editorial pull quotes.

Desired qualities:

- elegant;
- readable;
- refined;
- high contrast serif acceptable.

### Supporting Sans

Used for:

- venue;
- body copy;
- form labels;
- buttons;
- RSVP;
- metadata.

Desired qualities:

- neutral;
- modern;
- highly readable.

Do not use more than 2 primary font families without a strong reason. A
script face reserved for couple names and signatures may be the third
family; it is never used for body copy, labels or forms. Each theme's trio
is listed in `docs/superpowers/specs/2026-10-03-theme-identity-redesign-design.md`.

---

## 6. Mobile-first Layout

Primary design viewport:

```text
360px–430px
```

The invitation must still work from:

```text
320px mobile
tablet
desktop
```

Do not design desktop first and merely shrink it.

Desktop may use larger margins and expanded editorial compositions, but mobile is the primary experience.

---

## 7. Opening Cover

Pilot requirement:

- ivory background;
- no mandatory photo;
- refined ornament;
- names centered or editorially composed;
- date;
- personalized guest greeting;
- clear "Buka Undangan" button.

Conceptual hierarchy:

```text
THE WEDDING OF

Rayhana
&
Febri

20 · 10 · 2026

Kepada Yth.
[Nama Tamu]

[Buka Undangan]
```

The cover must feel calm and premium.

After click:

- cover transitions away;
- invitation content is revealed;
- music starts if enabled;
- music control becomes available.

---

## 8. Section Order

Default Nusantara Ivory order:

```text
Cover
Hero / Couple Introduction
Opening Quote
Bride & Groom
Parents
Event Details
Countdown
Location / Maps
Love Story
Gallery
Livestream [optional]
RSVP
Wishes
Wedding Gift
Closing
```

Sections must honor feature toggles.

---

## 9. Hero

After opening:

- introduce strong photography;
- avoid excessive text;
- names/date may repeat selectively;
- maintain breathing space.

A large image may be used after the initial ivory cover.

Hero photo rule (every template):

- The pre-wedding hero photo is always cropped **3:4 (portrait)**.
- Mobile (below 768px): the hero title block (eyebrow, couple names, short
  line) comes **first**, the 3:4 photo **below** it, full content width.
- Tablet/desktop may place title and photo side by side, but the photo stays
  3:4 and the title stays first in reading (DOM) order.
- Without a photo the hero is text-only; no placeholder frame.

---

## 10. Couple Section

Avoid generic side-by-side profile cards.

Preferred approaches:

- editorial portrait;
- alternating image/text composition;
- large names (Ivory: script face, Great Vibes);
- parents displayed in supporting text;
- subtle ornament around composition.

Mobile can stack naturally.

Every theme labels parents by role: "Putri dari" for `bride`, "Putra dari"
for `groom`. Roles are a fixed admin choice and are normalized to lowercase
keys before a theme sees them, so a stored "Groom" still reads "Putra dari".
Names must keep a full column on every viewport: a reading measure (`ch`
max-width) applies to parents and bio, never to the name, and long names wrap
in balanced lines instead of being squeezed into a narrow column.

---

## 11. Event Details

Each event should display:

- title;
- date;
- time;
- venue;
- address when available;
- map action.

Events do not carry calendar actions. Do not make event information
decorative at the expense of readability.

---

## 12. Countdown

Countdown must be elegant and low-noise.

Example:

```text
102
Hari

08
Jam

34
Menit
```

Avoid giant boxes resembling ecommerce flash sales.

The "save to calendar" actions (Google Kalender and .ics download) live in the
countdown section, built from the primary (earliest) event, in every theme.
When the countdown feature is off or the date is unusable, the same section
still renders with only the calendar actions and a "save the date" heading.

---

## 12a. Floating Navigation

Every theme's section navigation shows an icon with each visible text label;
text-only navigation is not acceptable. Icons are drawn in the theme's own
visual language (Ivory: fine Nusantara line; Terra: botanical field-journal
line; Midnight: art-deco geometry; Cobalt: nautical/postal line), are mapped
from the section key, are `aria-hidden`, and never replace the visible label.
Tap targets stay at least 44px and the bar never causes horizontal overflow at
320px.

Stops grow with the package (`src/lib/packages/nav-sections.ts`
`NAV_SECTIONS_BY_PACKAGE`, resolved by the public loader into
`invitation.navSections` so themes never see the package):

| Package | Stops |
|---|---|
| Intimate | Beranda, Mempelai, Acara, RSVP, Kado |
| Signature | + Galeri, Ucapan |
| Grand | + Cerita, Streaming |

A higher package always keeps every stop of the one below. A stop drops out
only when its section isn't rendered (feature off or no content). Items keep
page order.

Mobile bar sizing (below 768px, every template):

- The bar spans the screen width inside a gutter of
  `max(12px, env(safe-area-inset-left/right))` and sits
  `max(12px, env(safe-area-inset-bottom))` above the bottom edge.
- Up to five items share the width equally. With more, each item takes
  `calc(100% / 5.4)`, so a sixth item peeks in, and the bar scrolls sideways
  **inside itself** (scrollbar hidden, scroll-snap). The page never scrolls
  horizontally. The active item is kept in view
  (`src/themes/shared/use-nav-rail-scroll.ts`).
- Each item: icon `clamp(18px, 5.2vw, 22px)` above the label, label
  `clamp(11px, 3vw, 12px)` (never below 11px), single line, ellipsis as a last
  resort; item height at least 52px.
- The active item is marked by colour/fill with AA contrast, not by an
  underline alone.
- Page content reserves bottom padding equal to the bar height plus its offset
  so the last section and form controls are never hidden behind the bar.
- Tablet/desktop may switch to the theme's rail or wider bar showing every
  stop.

---

## 13. Love Story

Use editorial timeline styling.

Concept:

```text
2019
First Meet

2023
Growing Together

2026
Forever Begins
```

Allow:

- image;
- year/date label;
- title;
- story text.

Do not visually resemble project management timelines.

---

## 14. Gallery

Initial target: 8 photos.

Preferred:

- editorial/masonry-inspired composition;
- deliberate aspect-ratio variation;
- one or two strong anchor images;
- comfortable spacing.

Avoid:

- plain 3x3 social-media grid as default;
- loading all full-resolution images immediately.

---

## 15. RSVP

MVP choices:

```text
Hadir
Tidak Hadir
```

Form should feel integrated with theme, not like an admin form.

Fields:

- guest name when needed;
- attendance;
- submit.

After submission:

- show clear confirmation;
- prevent accidental repeated spam.

---

## 16. Wishes

Fields:

- name;
- message.

Publicly show approved/visible wishes in an elegant list.

Requirements:

- messages readable;
- long messages wrap correctly;
- no giant speech-bubble UI;
- pagination/load-more can be introduced if needed.

---

## 17. Wedding Gift

Pilot:

- bank account only.

Display:

- bank/provider;
- account name;
- account number;
- copy button.

Copy interaction should provide visible success feedback.

---

## 18. Livestream

Supported by architecture but OFF for pilot until needed.

When enabled:

- present link clearly;
- do not embed heavy video automatically unless explicitly required.

---

## 19. Music Control

Behavior:

- starts only after opening interaction;
- loop when configured;
- visible play/pause control;
- no intrusive large player.

Control may use a compact fixed button.

---

## 20. Motion

Allowed:

- fade;
- gentle translate;
- subtle scale;
- controlled stagger;
- mild parallax where performance remains good.

Avoid:

- bouncing;
- spinning;
- flying ornaments;
- animation on every element;
- slow intro sequences that block content.

Motion should support hierarchy, not perform for attention.

Respect reduced-motion preferences.

---

## 21. Admin Design

Admin is not wedding-themed.

Use:

- neutral background;
- clean navigation;
- restrained border radius;
- compact controls;
- shadcn/ui;
- clear status badges;
- readable tables/forms.

Admin priorities:

```text
Efficiency > decoration
Clarity > novelty
```

---

## 22. Admin Invitation Editor

Recommended sections:

```text
General
People
Events
Content
Gallery
Gifts
Guests
Features
Responses
Publish
```

Header:

```text
Rayhana & Febri
Draft

[Save Draft] [Preview] [Publish]
```

---

## 23. Accessibility Basics

- maintain readable contrast;
- buttons must have clear labels;
- images require meaningful alt text where applicable;
- forms require labels;
- focus styles must remain visible;
- do not rely only on color;
- respect `prefers-reduced-motion`.

---

## 24. Responsive QA

Check:

- 320px;
- 375/390px;
- 430px;
- tablet;
- desktop.

Also test:

- very long guest names;
- long parent names;
- long venue names;
- missing photo;
- missing love story;
- one event;
- multiple events;
- gallery fewer than 8;
- gallery more than 8;
- music disabled;
- gift disabled;
- livestream disabled.

---

## 25. Terra Botanica — Theme #002

Terra Botanica is an organic editorial garden wedding invitation: warm,
tactile, asymmetrical, and composed like a destination wedding travel journal.
It must be visually distinct from Nusantara Ivory while presenting the same
enabled public capabilities. The primary mobile range is 320–430px; desktop
uses deliberate editorial spreads rather than a stretched mobile column.

Palette: Linen `#F2E7D8` (light base), Clay `#B6634B` (warm chapter accent),
Moss `#53634E` (deep botanical surface and actions), Cacao `#45372C` (text),
Sun `#D6A663` (small highlights), and Bone `#FBF7F0` (reading surface).
Maintain readable foreground contrast on Clay and Moss. Fraunces is the
display face for names, headings, dates, and pull quotes; Manrope is the
supporting face for body text, details, forms, and controls.

Storyboard: a photo-optional Linen cover with restrained Moss and Clay
silhouettes and guest greeting; a photographic hero; an editorial couple and
parents spread; a gathering chapter for events, countdown, maps, calendar,
dress code, and livestream; a travel-journal story; an organic gallery collage;
flat editorial RSVP, wishes, and gift controls; and an intimate Moss closing.
Use lightweight custom botanical line art, asymmetrical frames, and subtle
paper grain. Avoid generic floral corners, heavy greenery, rustic craft styling,
and SaaS cards. Missing optional content should leave a deliberate sparse
composition without invented customer details.

Motion uses selected 600–900ms reveals, roughly 2–6px botanical drift, and
occasional organic image masks. Avoid continuous costly animation and scroll
jacking; disable nonessential motion under `prefers-reduced-motion`. Keep
forms, focus states, imagery, and long text usable at 320px through desktop.

---

## 26. Midnight Atelier — Theme #003

Midnight Atelier is a dark cinematic couture invitation: intimate, dramatic,
and composed like a private evening programme. It must not become a generic
black-and-gold wedding template or a recolored version of another theme. It
presents the same enabled public capabilities as every registered theme while
using its own chapter rhythm and visual hierarchy.

Since October 2026 Midnight follows **Malam di Ballroom** (spec
`docs/superpowers/specs/2026-10-03-theme-identity-redesign-design.md` §6): a
black-tie evening ball of crystal light, champagne and oxblood velvet.

Palette: Tinta `#14121A` (ground), lifted Tinta `#1E1A24` (layered surfaces),
Oxblood `#5E1A22`, Champagne `#D8C08A` (rules, small highlights, light),
Mutiara `#EDE6DA` (text on dark, reading surfaces) and Asap `#6E6873` (rules
only; small secondary text uses `#A9A2AD`). Imperial Script is reserved for
couple names; Bodoni Moda italic carries headings; Jost carries body text at
17px or larger and spaced-capital labels.

Storyboard: a champagne-toast cover (two flutes clink, a ring of light,
rising bubbles); chapter headings lit by a stage spotlight; a dance card after
an attending RSVP; a sent wish rising with champagne bubbles; framed photos lit
one by one by picture lights. Light is drawn with warm radial gradients only
in the spotlight and picture lights. Avoid any other gradient, neon glow, fake
foil, star fields, repeated ornamental frames, excessive gold and SaaS cards.

Optional content must disappear without leaving dead navigation or accidental
gaps. Sparse states should still feel composed and must never invent customer
details. Motion stays cinematic but selective: the champagne toast,
small image reveals, and restrained text transitions. Disable nonessential
motion under `prefers-reduced-motion`; maintain visible focus, readable
contrast, stable media dimensions, and usable forms from 320px through desktop.

---

## 27. Cobalt Riviera — Theme #004

Cobalt Riviera is a sunlit destination editorial invitation: bright,
architectural, and composed like a contemporary Riviera travel folio. It
presents the same normalized data and all 18 canonical capabilities as every
registered theme without becoming a generic blue beach or travel template.

Since October 2026 Cobalt follows **Surat Cinta dari Mediterania** (spec
`docs/superpowers/specs/2026-10-03-theme-identity-redesign-design.md` §7): a
summer postcard from the coast — majolica blue, lemons, stamps and sea. It is
the brightest theme.

Palette: Kobalt `#1D3E9E` (sea and architectural chapters), Porselen
`#F7F4EC` (reading surface, morning sky), Tinta laut `#0E2350` (text, night
chapters), Jeruk `#E8743B` (fills, rules, postmark ring; text uses `#9A3D14`),
Citron `#E9D35B` (sun, highlights), Kolam `#8EC5D6` (quiet secondary field)
and Senja `#F8DCC4` (sunset sky). Corinthia is reserved for couple names;
Newsreader italic carries headings and numerals; Newsreader carries body text
at 17px or larger; Familjen Grotesk carries spaced-capital labels.

Storyboard: a cobalt sea cover whose two foam-edged waves recede to leave the
names on porcelain sand; two wave lines swaying at each chapter's top edge
(only while on screen); a sky behind the porcelain chapters that warms from
morning to sunset as the guest scrolls, with a small sun sinking down the page
margin; an orange "Diterima" postmark beside the RSVP confirmation; a sent
wish rolled into a bottle that bobs and drifts away. Small Italian accents
("Saluti") are tagged `lang="it"`; every label is Bahasa Indonesia.

Use flat colour fields, hard rectangular crops, thin route rules, wave lines
and strong left alignment. Avoid gradients, glass, shadows, rounded cards,
shells, palms, decorative flight paths and any invented customer data. The
receding waves own the one theatrical motion; dividers and the sky are quiet,
and reduced motion shows the final sky, still waves and the postmark at rest
while preserving every action. Empty, malformed, and disabled content must
leave no dead route item or decorative gap, while controls remain at least
48px and usable from 320px through desktop.

---


## 27a. Admin editor layout (Oct 2026)

Admin pages (shadcn, forest/paper tokens) follow one pattern:

- Editor sections are `SettingsSection`s from `src/components/admin/settings-section.tsx`:
  title and a short "what and why" on the left (16rem), a `Panel` on the
  right with `FieldGrid` (two columns from `sm`) and a `PanelFooter` holding
  `UnsavedHint` and the save button. On phones the footer sticks to the
  bottom while its form is in view.
- Lists of items (events, people, gifts, stories) are one `Panel` per item
  with a `PanelHeader` (index, title, meta, delete), plus a dashed "Tambah"
  panel last. Package limits show as a `UsageMeter` under the description.
- Uploads use `FileDrop` (a real file input dressed as a drop area).
- Controls: inputs, selects 40px, radius 10px, card fill, sage focus ring;
  buttons 36px default, 40px `lg`.
- The editor header shows cover, status, package, theme, event date with
  H-countdown and publish readiness (`getPublishReadiness`); the detail
  query is request-cached so the layout and page share one fetch.
- The invitation list is a table (lg) / stacked rows (phones) with status
  counts, "Acara terdekat" sort and an RSVP-over-guests bar.

## 28. New Template Checklist (every future template)

Rules learned while shipping Ivory, Terra, Midnight and Cobalt and the
Temuraya catalogue (Oct 2026). A new template is not done until every item
holds. Tests already enforce several of them; a red test means the template
is incomplete, not that the test is wrong.

### 28.1 Identity

- One clear art direction with its own name and story (e.g. Terra "Herbarium
  Cinta", Cobalt "Surat Cinta dari Mediterania"), written up in a spec under
  `docs/superpowers/specs/` before code.
- Its own type pairing (script + display + text), self-hosted from
  `@fontsource/*` and registered in `src/themes/theme-fonts.ts` plus the
  theme's `fonts.css`. Never `next/font/google` (build-time download).
- Its own palette as CSS tokens with a theme prefix (`--ni-`, `--tb-`,
  `--ma-`, `--cr-`). Text and active nav states meet AA contrast.
- Motion is signature moments only (cover opener, one or two section
  effects), built from CSS or the shared hooks (`use-in-view-once`,
  `use-scroll-progress`). Respect `prefers-reduced-motion`; server markup and
  the first client render must match.
- Cultural references stay subtle (§3, guardrails in CLAUDE.md): no pasted
  batik PNGs, neon, purple-blue gradients or dashboard cards.

### 28.2 Data contract

- The theme receives `PublicInvitation` only; no Supabase, no customer
  hardcoding, no package key (the public payload must not reveal what the
  couple bought).
- Every optional section follows `invitation.features` and renders nothing
  when its content is empty. Feature toggles are never removed per customer.
- Copy follows `invitation.type`: wedding eyebrows ("The Wedding Of",
  "Mempelai") only for weddings; other event types read naturally.
- Section anchors use the theme prefix and these suffixes so nav, tests and
  share links agree: `-beranda`, `-mempelai`, `-acara`, `-cerita`, `-galeri`,
  `-livestream`, `-rsvp`, `-ucapan`, `-kado`.

### 28.3 Navigation (see §12a)

- Build candidates in page order, each guarded by its feature and content,
  then `pickNavItems(candidates, invitation.navSections)`. Never cap or rank
  items inside the theme.
- Package tiers come from `src/lib/packages/nav-sections.ts`: Intimate 5,
  Signature 7, Grand 9. Each tier keeps the one below. A Streaming stop
  appears only on Grand, and only when an event has a usable livestream link
  (`hasLivestreamLink`).
- An icon for every `NavSectionKey` (TypeScript requires the full record),
  drawn in the theme's own line language, `aria-hidden`, label always
  visible.
- Phone bar: up to five equal items; with more, `flex: 1 0 calc(100% / 5.4)`
  inside a sideways-scrolling list (hidden scrollbar, scroll-snap), items
  carry `data-nav-id`, and `useNavRailScroll` keeps the active item in view.
  The page never scrolls horizontally at 320px.
- Tablet/desktop: a centred bar or side rail that shows every stop.

### 28.4 Media and performance

- All photos go through `next/image` with `fill` + accurate `sizes`, and
  `unoptimized={!isOptimizableImage(src)}`, so bucket uploads and `/demo`
  files are resized per device. Never ship originals.
- Hero photo 3:4 on phones with the title block first; below-the-fold media
  lazy; a failed image keeps the composition with a themed placeholder.
- No JS animation libraries for trivial effects; client components only for
  interaction (cover, audio, forms, copy, nav).

### 28.5 Guest interaction

- Action glyphs (Maps, livestream, calendar) come from
  `src/themes/shared/action-icons.tsx`: thin drawn arrows plus the Google and
  Apple marks. Never type ↗ or ↓ in markup; iOS draws ↗ as a blue emoji.

- Cover: no full-screen photo on the initial cover for Ivory-style themes,
  guest name when present, an explicit open button; music only starts after
  that tap and keeps a visible play/pause control.
- RSVP and wishes use the shared hooks (`use-public-forms`) and put
  `<TurnstileWidget />` inside the `<form>`. It renders explicitly on mount
  and resets after each submit, so forms that mount late (after the cover,
  on package switch) still send a token. All messages are Indonesian; no raw
  validation text ever reaches a guest.
- Demo invitations accept RSVP/wishes without writing and without Turnstile.

### 28.6 Catalogue, demo and sharing

- Database: an idempotent migration adding the `themes` row (slug, name,
  tagline, description, `event_types`, `sort_order`, `is_listed`), with a
  rollout/rollback note. Never add a foreign key from `themes` to
  `invitations`.
- Demo: add the theme to `scripts/demo/content.mjs` (demo copy and
  `PALETTES`), run `node scripts/demo/images.mjs <chromium>` for the
  "Sample N" photos and `node scripts/demo/build-seed.mjs` for the seed SQL.
- Catalogue screenshots `public/demo/<theme>/screen-1..3.jpg`: 390×844
  viewport at 2× (780×1688): cover, opened hero, one signature section.
- Share banner: add the theme to `THEME_SHARE_STYLES` in
  `src/lib/og/share-styles.ts` (background, panel, ink, muted, accent,
  script). If the script face is new, copy its static latin `.woff` into
  `assets/og-fonts/` and add it to `SCRIPT_FILES` in `src/lib/og/assets.ts`.
  Without an entry the theme falls back to the Temuraya banner, and a test
  fails.

### 28.7 QA before review

- Widths 320, 375, 768 and 1280, for Intimate, Signature and Grand: no
  horizontal overflow, nav stops match the tier, labels never cut, items at
  least 52px tall on phones.
- Reduced motion, missing optional content, long names and venues, guest
  and no-guest links.
- `npm test`, lint, TypeScript, and a Vercel preview build. After merge,
  marketing and demo data caches refresh within 10 minutes (`revalidate
  600`); judge cached pages after that.
