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

Palette: Ink `#09090B` (primary ground), Lacquer `#171216` (layered dark
surface), Oxblood `#541E2B` (ceremonial accent), Champagne `#C6A15B` (rules and
small highlights), Pearl `#F3EEE6` (reading surface), and Smoke `#AAA3A4`
(secondary text). Bodoni Moda provides the high-contrast display voice;
Barlow Condensed provides compact supporting labels and readable metadata.

Storyboard: a curtain-like opening seam; a cinematic hero; left-aligned
editorial couple and event spreads; a programme-inspired countdown and event
chapter; a couture story sequence; a contact-sheet gallery; a Lacquer RSVP
moment; a Pearl guestbook; a dark ledger for gifts; and a restrained closing.
Use precise hairline rules, purposeful negative space, strong image crops, and
small typographic contrasts. Avoid gradients, fake foil effects, star fields,
repeated ornamental frames, excessive gold, and generic SaaS cards.

Optional content must disappear without leaving dead navigation or accidental
gaps. Sparse states should still feel composed and must never invent customer
details. Motion stays cinematic but selective: controlled curtain movement,
small image reveals, and restrained text transitions. Disable nonessential
motion under `prefers-reduced-motion`; maintain visible focus, readable
contrast, stable media dimensions, and usable forms from 320px through desktop.

---

## 27. Cobalt Riviera — Theme #004

Cobalt Riviera is a sunlit destination editorial invitation: bright,
architectural, and composed like a contemporary Riviera travel folio. It
presents the same normalized data and all 18 canonical capabilities as every
registered theme without becoming a generic blue beach or travel template.

Palette: Cobalt `#1646C8` (architectural field), Porcelain `#FFF9EE` (reading
surface), Sea Ink `#123047` (text), Tangerine `#F06A3C` (active interaction),
Citron `#F3CF4C` (sun control), and Pool `#81C7D4` (quiet secondary field).
Familjen Grotesk Variable carries names, chapter titles, and itinerary display;
Newsreader Variable carries body copy and intimate text.

Storyboard: a photo-free horizon-shutter cover with one labelled Citron sun
control; a panoramic hero; offset couple and parent editorials; flat itinerary
rows with visible Maps and calendar actions; a horizon countdown and wardrobe
strip; chronological story folios; a panoramic-anchor ceramic gallery; large
attendance color fields; route-separated wishes; travel-folio gift receipts;
and a restrained Cobalt closing field.

Use hard rectangular crops, quarter-circle geometry, thin route rules, strong
left alignment, and flat color chapters. Avoid gradients, glass, shadows,
rounded card repetition, shells, palms, waves, passport stamps, decorative
flight paths, and any invented customer data. The horizon cover owns the one
theatrical motion; all other feedback stays short and functional, and reduced
motion preserves every action. Empty, malformed, and disabled content must
leave no dead route item or decorative gap, while controls remain at least
48px and usable from 320px through desktop.
