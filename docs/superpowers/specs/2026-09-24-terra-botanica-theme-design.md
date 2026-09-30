# Terra Botanica Theme Design

**Date:** 2026-09-24

**Status:** Approved for implementation planning

**Theme slug:** `terra-botanica`

**Category:** Wedding
**Direction:** Organic editorial garden

## Purpose

Add a second commercial wedding theme that feels fundamentally different from Nusantara Ivory while preserving one reusable invitation product. Terra Botanica should feel warm, natural, tactile, and editorial rather than traditional, formal, or decorative-heavy.

This work also establishes the rule that every current and future theme supports the same product features. A feature or section added to one theme must receive an equivalent presentation in every other theme.

## Success Criteria

- Terra Botanica has a clearly different visual identity and composition from Nusantara Ivory.
- Every feature currently available to an invitation can render in both themes.
- Package entitlements remain controlled by the shared invitation domain, never by individual themes.
- Adding a required section without implementing it for every registered theme causes a type or test failure.
- Optional, disabled, and incomplete content produces intentional empty states without broken spacing.
- The public invitation remains fast and usable from 320 px mobile through desktop.

## Product Rules

### One product, multiple presentations

Themes receive the same normalized `PublicInvitation` data. They do not query Supabase, own package rules, or contain customer-specific data.

The theme layer may vary:

- section order;
- composition;
- typography;
- palette;
- ornament;
- image treatment;
- motion;
- control styling.

The theme layer must not vary product capability. An enabled feature must appear exactly once in every theme unless the normalized data is insufficient to render it safely.

### Feature parity invariant

A shared, typed theme-section contract is the canonical list of public capabilities. At minimum it covers:

- cover and guest personalization;
- hero and couple introduction;
- parents;
- events;
- countdown;
- maps and add to calendar;
- dress code;
- livestream;
- love story;
- gallery;
- RSVP;
- wishes or guestbook;
- digital gifts;
- Instagram links;
- closing.

Adding a new public section requires all registered themes to provide its renderer or explicitly use an approved shared fallback. Silent omission is not allowed.

Sponsorship is currently an entitlement reserved for future implementation, not a public invitation data feature. This theme project does not invent its data model or UI. When sponsorship becomes a concrete public feature, it must be added to the shared section contract and implemented for every registered theme in the same change.

Package availability remains upstream of themes. Intimate, Signature, and Grand determine which normalized capabilities are enabled; the selected theme determines only how enabled capabilities look.

## Visual Direction

### Personality

Terra Botanica is an organic destination-wedding editorial. It should feel like a carefully art-directed travel journal created in warm natural light.

Key qualities:

- warm;
- tactile;
- natural;
- intimate;
- contemporary;
- expressive but controlled.

Avoid:

- replacing Ivory colors while preserving its layout;
- generic watercolor floral corners;
- pasted botanical PNG decoration;
- rustic craft aesthetics;
- excessive greenery;
- generic wedding-template cards;
- heavy parallax or decorative animation.

### Palette

| Token | Hex | Role |
| --- | --- | --- |
| Linen | `#F2E7D8` | Primary light surface |
| Clay | `#B6634B` | Strong warm accent and chapter background |
| Moss | `#53634E` | Deep botanical surface and action accent |
| Cacao | `#45372C` | Primary text and darkest neutral |
| Sun | `#D6A663` | Restrained highlight |
| Bone | `#FBF7F0` | High-contrast reading surface |

Contrast must remain readable. Clay, Moss, and Cacao may be used as large surfaces only with verified foreground contrast.

### Typography

- **Display:** Fraunces for names, section headings, pull quotes, and decorative dates.
- **Supporting:** Manrope for event details, controls, form fields, countdowns, metadata, and body copy.

Use no additional primary font family. Font loading should follow the existing Next.js font strategy and avoid layout shift.

### Photography

Photography should favor natural light, warm film-like color, close crops, environmental details, and candid movement. Images may be masked with restrained organic shapes, but the original subject must remain legible.

Terra must also work when only a cover image and a small gallery are available. The opening cover does not require a photo.

### Ornament

- abstract leaf and clay silhouettes;
- custom lightweight botanical line-art SVG;
- restrained paper grain;
- asymmetrical frames and dividers.

Ornaments are theme assets, not content. They must not block text, create horizontal overflow, or require large raster downloads.

### Motion

- reveal durations between 600 and 900 ms;
- small botanical drift of roughly 2–6 px;
- organic mask reveals for selected photography;
- no continuous high-cost animation;
- no scroll-jacking;
- all non-essential motion disabled under `prefers-reduced-motion`.

## Page Storyboard

### 1. Opening cover

Use Linen as the base, with large Moss and Clay organic silhouettes. Present the invitation label, couple names, date, personalized guest greeting, and a clear open action. Opening starts music only when music is enabled and browser policy allows it.

The cover must remain complete and premium without a photograph.

### 2. Hero

Reveal a large cinematic photograph after the cover. Use a short editorial statement rather than dense copy. The hero establishes the photographic character that the cover intentionally withholds.

### 3. Couple and parents

Compose portraits and text as an editorial spread, never as profile cards. Couple names, Instagram links, short information, and parent names must remain readable with long values.

### 4. The Gathering

Group event details, countdown, location, maps, add-to-calendar, dress code, and livestream into a coherent event chapter. Each event stays individually readable and actionable. Decorative composition must never obscure date, time, venue, or address.

### 5. Love story

Render story entries like a travel journal with alternating rhythm, photographs when supplied, and graceful handling for text-only entries.

### 6. Gallery

Use an organic editorial collage that supports the package gallery limits. Keep image dimensions stable, use responsive delivery, and lazy-load images outside the first viewport. A small gallery must still form a balanced composition.

### 7. Interaction chapter

RSVP, wishes, digital gifts, and livestream actions use Terra's flat editorial controls and underline fields. Shared validation, Turnstile, submission logic, and error messages remain outside the theme-specific presentation layer.

### 8. Closing

Finish on a deep Moss surface with restrained typography, couple names, and closing copy. The ending should feel intimate and conclusive rather than like a footer.

## Responsive Behavior

The primary design range is 320–430 px. Desktop becomes a deliberate two-column editorial composition where appropriate, not a stretched mobile layout.

Required checks:

- 320 px mobile;
- approximately 390 px mobile;
- tablet;
- desktop;
- long guest names;
- long couple and parent names;
- long venue names and addresses;
- one event and the maximum event count;
- gallery below eight images and at package capacity;
- disabled music and optional sections;
- expired invitation state;
- slow image loading.

## Architecture

### Shared normalized input

`ThemeRenderer` continues to resolve a registered theme using normalized public invitation data. Database queries, package entitlement checks, publication state, and guest resolution occur before the theme component renders.

### Shared behavior, theme-owned presentation

Move reusable interaction behavior out of the Ivory directory when it is needed by both themes. Likely shared concerns include:

- cover state and opening analytics;
- audio lifecycle;
- active-section navigation behavior;
- add-to-calendar generation;
- RSVP submission behavior;
- wish submission behavior;
- gift-account copy behavior;
- common accessibility utilities.

The shared layer owns behavior and accessible state. Each theme owns markup composition and visual styling. Shared behavior must not force both themes into identical layouts.

### Theme contract

Introduce a typed section-key or equivalent compile-time contract representing all supported public sections. Each theme definition must satisfy that contract through dedicated renderers or an approved shared renderer.

The theme registry should continue to provide theme identity and component resolution, and gain any preview metadata required by the admin theme selector. Terra is registered under `terra-botanica`.

### Section order

Themes may define their own order from the common section set. Terra's default order is:

1. Cover
2. Hero
3. Opening quote
4. Couple and parents
5. Events
6. Countdown
7. Maps and calendar
8. Dress code
9. Love story
10. Gallery
11. Livestream
12. RSVP
13. Wishes
14. Digital gifts
15. Closing

Grouping may combine adjacent capabilities visually, but each enabled capability remains testable and addressable.

## Data Flow

1. Resolve the invitation, publication state, expiration, and guest.
2. Load normalized public invitation data.
3. Apply package entitlements and feature toggles in the shared domain.
4. Resolve the registered theme.
5. Pass normalized data and shared interactive handlers to the theme.
6. Render each enabled section using the theme's complete section implementation.

No additional database schema is required solely for Terra Botanica. Theme-specific settings may be introduced later only when a concrete editable setting is approved; they must remain typed and backward-compatible.

## Empty and Error States

- Unsupported theme slugs use the existing safe unsupported-theme behavior.
- Disabled sections render nothing and leave no decorative gap.
- Missing optional text or media uses a composition designed for absence rather than placeholder customer data.
- Missing required event data must preserve readable partial information and omit invalid actions.
- Failed RSVP or wish submissions preserve user input and show understandable errors.
- Failed audio autoplay leaves a visible manual music control when music is enabled.
- Image failures preserve layout dimensions and accessible fallback text where appropriate.

## Performance and Accessibility

- Prefer Server Components; keep client boundaries around actual interaction.
- Do not add a new animation library.
- Use CSS and lightweight SVG for ornament.
- Use responsive image sizing and lazy loading below the fold.
- Avoid initializing disabled features.
- Preserve semantic headings, labels, focus states, keyboard access, and readable contrast.
- Honor reduced motion.
- Avoid cumulative layout shift from fonts and media.

## Testing

Automated coverage must include:

- theme registry resolution for Ivory and Terra;
- compile-time or runtime section-contract completeness;
- a parity test proving every registered theme covers every required section key;
- all feature toggles enabled and disabled;
- Intimate, Signature, and Grand entitlement behavior remaining theme-independent;
- missing optional data;
- RSVP and wish behavior through shared interaction logic;
- reduced-motion behavior where practical;
- no duplicate rendering of grouped capabilities.

Manual visual acceptance must follow the responsive checklist and compare both themes after any shared-section change.

## Delivery Scope

Included:

- shared theme feature contract;
- extraction of behavior required by both themes;
- Terra Botanica theme components and assets;
- registry and admin selector metadata;
- feature-parity and theme rendering tests;
- responsive and performance validation.

Excluded:

- customer self-service theme customization;
- arbitrary color or font builders;
- drag-and-drop section ordering;
- new package features unrelated to theme parity;
- Nocturne Royale and Cobalt Muse implementation;
- database changes without a separately approved requirement.

## Future Themes

Nocturne Royale and Cobalt Muse remain the recommended subsequent directions. They must use the same normalized input, shared behaviors, feature contract, and parity tests established by this work.
