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
- elegant serif typography;
- clean supporting sans-serif;
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

Use two primary type roles.

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

Do not use more than 2 primary font families without a strong reason.

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
- large serif names;
- parents displayed in supporting text;
- subtle ornament around composition.

Mobile can stack naturally.

---

## 11. Event Details

Each event should display:

- title;
- date;
- time;
- venue;
- address when available;
- map action.

Do not make event information decorative at the expense of readability.

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
