# Cobalt Riviera — Theme #004 Design Specification

> **Superseded (visual direction only), 2026-10-05:** typography, palette,
> cover and ornaments now follow `2026-10-03-theme-identity-redesign-design.md`
> §7 ("Surat Cinta dari Mediterania"). Data, sections, feature gating and
> accessibility below remain authoritative.

## Product role

Cobalt Riviera expands the production collection with a bright destination
wedding identity. It serves couples planning a resort, coastal, outdoor,
poolside, or sunlit city celebration who want confident color without a casual
beach-party look.

The theme must feel decisively different from Nusantara Ivory's warm formal
restraint, Terra Botanica's organic garden journal, and Midnight Atelier's dark
cinematic couture. It presents the same normalized invitation data and every
enabled public capability.

## Design thesis

The invitation is composed as a contemporary Riviera travel folio: a painted
horizon, oversized destination typography, crisp itinerary sheets, sun-washed
photography, and small fragments of route notation. The visual language borrows
from modernist resort wayfinding and Mediterranean ceramic geometry, not
literal shells, palm-tree clip art, passport stamps, or nautical props.

The memorable moment is the opening cover. A circular sun control sits on a
cobalt horizon seam. Activating it raises the sun while two flat shutters part
to reveal the invitation. The action opens the cover, starts music when
enabled, records analytics, and hands keyboard focus to the main content through
the existing shared behavior.

Everything after the opening stays readable and calm. Color blocks encode
chapters, native scrolling carries the story, and photography receives enough
space to feel editorial rather than decorative.

## Experience principles

1. **Color carries mood.** Cobalt is a large architectural surface, not a small
   link accent. Tangerine and citron appear at specific interaction moments.
2. **Information reads like an itinerary.** Dates, venues, maps, and calendar
   actions stay visible and scannable without opening accordions.
3. **One theatrical gesture.** The horizon cover owns the expressive motion.
   Other movement responds to taps, focus, scrolling, or form state.
4. **Destination without costume.** Abstract geometry and route notation
   suggest travel. The theme avoids literal tourism graphics.
5. **Premium means edited.** Each section gets one clear composition. Repeated
   cards, ornamental noise, and competing animations are removed.

## Token system

### Color

| Token | Value | Role |
| --- | --- | --- |
| Cobalt | `#1646C8` | Primary architectural surface and cover shutter |
| Porcelain | `#FFF9EE` | Main reading surface |
| Sea Ink | `#123047` | Primary text and deep contrast surface |
| Tangerine | `#F06A3C` | RSVP selection, focus accents, active moments |
| Citron | `#F3CF4C` | Sun control and restrained highlights |
| Pool | `#81C7D4` | Secondary chapter surface and quiet metadata |

Cobalt/Porcelain, Sea Ink/Porcelain, Sea Ink/Citron, and Sea Ink/Pool must keep
accessible contrast. Tangerine never carries small body text on Porcelain.
Citron is reserved for the cover sun, selected navigation state, and a small
number of interaction confirmations.

No gradients, fake sunlight bloom, glass effects, or metallic simulation.

### Typography

- **Familjen Grotesk Variable** — couple names, major chapter titles,
  expressive dates, cover action, and navigation. Its wide shapes give the
  theme a confident resort-wayfinding voice without copying the serif-led
  collection.
- **Newsreader Variable** — opening quote, body copy, biographies, story text,
  wishes, and intimate closing language.

Both families must ship as bundled font assets. The theme must not fetch fonts
at build time or runtime. Body copy stays below 72 characters per line.
Sentence case is the default. Uppercase is limited to genuine itinerary codes,
short dates, and route metadata.

### Shape and material

- Flat rectangular color fields with occasional quarter-circle cuts.
- One recurring sun disc and one stepped ceramic-line motif.
- Square image frames with intentional hard crops and stable aspect ratios.
- Thin Sea Ink or Porcelain rules encode schedules and grouping.
- Buttons use rectangular geometry with clear pressed and focus states.
- Border radius is limited to the circular sun control and attendance markers.

Avoid repeated rounded cards, drop shadows, wave clip art, scalloped frames,
postage-stamp edges, and decorative dashed flight paths.

## Layout concept

Mobile behaves like a vertical travel folio. Desktop expands into offset
panoramic spreads with strong left alignment and deliberate edge-to-edge color.

```text
MOBILE 390                         DESKTOP 1440
┌──────────────────┐              ┌──────────────────────────────┐
│ date       CR/04 │              │ date                    CR/04│
│                  │              │                              │
│       NAME       │              │ NAME                         │
│         +        │              │             + NAME          │
│       NAME       │              │                              │
│───────  ● ───────│              │──────────────●───────────────│
│ guest            │              │ guest       open invitation │
│ open invitation  │              └──────────────────────────────┘
└──────────────────┘

┌──────────────────┐              ┌─────────────────┬────────────┐
│ panoramic image  │              │ panoramic image │ names/date │
├──────────────────┤              │                 │ message    │
│ names + message  │              └─────────────────┴────────────┘
└──────────────────┘

┌──────────────────┐              ┌──────────┬───────────────────┐
│ itinerary row    │              │ date     │ venue / actions   │
│ date / venue     │              ├──────────┼───────────────────┤
│ actions          │              │ date     │ venue / actions   │
└──────────────────┘              └──────────┴───────────────────┘
```

Primary alignment is left. Center alignment belongs only to the sun control,
selected quotes, countdown values, and the final closing gesture.

## Signature interactions

### Horizon cover

- The closed state is a full-viewport Cobalt field split by one horizontal
  Porcelain seam.
- The Citron sun is a real button with a visible text label adjacent to it.
- Activation lifts the sun 16–24px and parts the upper and lower shutters in a
  700–850ms sequence.
- Content exists in the document before opening; the cover controls visibility
  and focus without delaying data loading.
- Rejected autoplay never blocks the opening. Music controls remain available
  when music is enabled.
- Reduced motion removes travel and opens immediately.

### Route navigation

- Mobile uses a compact bottom route strip with icon plus accessible label.
- Desktop uses a slim vertical route index aligned to the page edge.
- Destinations are built only from enabled sections with usable content.
- The active state changes color and weight without moving layout.
- Navigation never becomes a floating pill or covers form controls.

### Native photo rail

- Selected story/gallery groupings may use CSS scroll snap on mobile.
- Every item remains reachable with touch, keyboard, and normal scrolling.
- No custom drag engine, infinite carousel, or mandatory swipe gesture.
- Desktop resolves the same items into a static editorial mosaic.

### RSVP color field

- Attendance choices are two large flat fields, each at least 56px high.
- Selection changes border, background, text, and an explicit check indicator;
  color is never the only signal.
- Successful submission changes one contained panel, not the whole viewport.
- Pending and error states keep the newest user edits through shared form
  behavior.

## Storyboard and capability parity

Cobalt Riviera explicitly represents all canonical capabilities:

1. **Cover** — photo-free horizon shutters, date, personalized guest, sun
   control, music, analytics, and focus handoff.
2. **Hero** — panoramic photography with an offset name/date block; a bold
   typographic horizon replaces missing media.
3. **Quote** — quiet Newsreader interlude on Porcelain or Pool; omitted when
   empty.
4. **Couple** — offset portraits and biographies composed like paired resort
   editorials, never profile cards.
5. **Parents** — integrated under each person as family credits with complete
   long-name wrapping.
6. **Events** — flat itinerary rows that preserve one through five complete
   event records.
7. **Countdown** — four oversized values arranged along one horizon rule and
   clamped at zero.
8. **Maps** — safe event-specific action beside its venue.
9. **Calendar** — valid event-specific action using shared calendar builders.
10. **Dress code** — a wardrobe strip with text-labelled color chips and an
    optional description.
11. **Story** — chronological postcard spreads with complete text-only states;
    mobile may use accessible native scroll snap.
12. **Gallery** — panoramic anchor plus ceramic-grid mosaic balanced from one
    image through package capacity.
13. **Livestream** — a concise broadcast row rendered only for a usable URL.
14. **RSVP** — Tangerine/Cobalt attendance fields, visible labels, Turnstile,
    and direct shared form feedback.
15. **Wishes** — Porcelain guest notes separated by route rules with shared
    action and pagination behavior.
16. **Gift** — account details presented as travel-folio receipts with shared
    clipboard feedback and no false success state.
17. **Instagram** — optional accessible handle integrated into each person's
    editorial credit.
18. **Closing** — Cobalt conclusion using the shared closing-image fallback and
    optional closing message.

## Shared behavior boundary

Cobalt Riviera consumes `buildThemeViewModel()` and the existing shared cover,
audio, focus, analytics, navigation, calendar, URL safety, form, pagination,
and clipboard behavior.

Package checks, database queries, validation, Turnstile verification, public
write actions, analytics persistence, and customer defaults remain upstream.
Theme files own markup, styling, responsive composition, ornaments, and
theme-specific visual feedback only.

Any future public capability added while building Cobalt must be implemented
in Nusantara Ivory, Terra Botanica, Midnight Atelier, and Cobalt Riviera in the
same change. Cobalt does not create a private feature fork.

## Motion budget

- One 700–850ms horizon-cover sequence.
- Short 150–220ms feedback for route state, buttons, copy confirmation, and
  attendance selection.
- Optional image masking uses transform, opacity, or clip-path only and never
  blocks reading.
- No scroll-jacking, continuous parallax, autoplay carousel, floating
  particles, cursor replacement, or animation on every section.
- Reduced motion removes nonessential transitions and preserves every action.

## Responsive and absence behavior

- Required viewports: 320×568, 390×844, 768×1024, and 1440×900.
- The closed cover keeps its action reachable with long guest names at 320px.
- Long guest, parent, venue, story, wish, and account text wraps without
  horizontal overflow.
- Missing photography preserves the composition through color, type, and
  geometry without inventing media.
- Empty or disabled optional content produces no dead route item, blank
  chapter, or decorative gap.
- Images reserve stable space, provide meaningful alternatives, lazy-load
  below the hero, and keep an accessible fallback when loading fails.
- Controls are at least 48px high, keyboard focus is visible, and body text
  retains readable contrast under every color field.
- Native scrolling remains usable while fonts and images load slowly.

## Performance budget

- Reuse shared hooks and server-normalized data; do not add a theme-wide state
  library.
- Keep the cover interaction in one small client boundary.
- Use CSS for shutter, sun, route, and mosaic presentation.
- Do not initialize observers, audio, forms, or galleries for disabled
  capabilities.
- Do not add a carousel dependency or WebGL/canvas effect.
- Bundle only the font weights and scripts the theme renders.

## Uniqueness review

The first idea risked becoming a generic blue destination template filled with
waves, postcards, stamps, and rounded travel cards. The revised direction
removes those literal props. Its identity comes from a geometric painted
horizon, wide grotesk typography, one sun-control opening gesture, panoramic
photography, flat itinerary rows, color-block chapters, and a ceramic-grid
rhythm.

The result is brighter and more playful than the existing collection without
turning into a festival microsite. It does not borrow Ivory's centered serif
romance, Terra's botanical forms, or Midnight's couture programme and dark
palette.

## Catalogue data

- Name: `Cobalt Riviera`
- Slug: `cobalt-riviera`
- Category: `wedding`
- Preview palette: `#1646C8`, `#FFF9EE`, `#F06A3C`
- Description: `Sunlit destination editorial wedding invitation.`

The database catalogue migration must be idempotent, preserve an existing
theme ID, and activate the slug only after application support is deployed and
the full parity gate passes.
