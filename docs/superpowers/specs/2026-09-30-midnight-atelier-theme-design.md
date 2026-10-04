# Midnight Atelier — Theme #003 Design Specification

> **Superseded (visual direction only), 2026-10-04:** typography, palette,
> cover and ornaments now follow `2026-10-03-theme-identity-redesign-design.md`
> §6 ("Malam di Ballroom"). Data, sections, feature gating and accessibility
> below remain authoritative.

## Product role

Midnight Atelier expands the commercial collection with a dark, cinematic
evening invitation. It must feel decisively different from Nusantara Ivory's
warm romantic restraint and Terra Botanica's organic editorial garden, while
presenting the same normalized invitation data and every enabled public
capability.

The theme targets couples who want a formal evening, ballroom, hotel, city, or
fashion-led wedding identity. It is not gothic, nightclub-like, or a black
recolor of an existing theme.

## Design thesis

The invitation is composed as a private couture show programme. The memorable
moment is a photo-free opening cover whose narrow central seam opens like a
stage curtain. After opening, photography, typography, and event information
are treated as a sequence of editorial acts.

The design spends its boldness on the cover transition and oversized display
type. Everything else is quiet, rule-based, readable, and controlled.

## Token system

### Color

| Token | Value | Role |
| --- | --- | --- |
| Ink | `#09090B` | Primary background and closing surface |
| Lacquer | `#171216` | Layered dark reading surface |
| Oxblood | `#541E2B` | Emotional accent and selected chapter surface |
| Champagne | `#C6A15B` | Hairlines, focus accents, small highlights |
| Pearl | `#F3EEE6` | Primary light text and alternate reading surface |
| Smoke | `#AAA3A4` | Supporting text on dark surfaces |

Champagne is a structural accent, never a metallic gradient. Oxblood is used
for one or two major chapter transitions, not every section. Pearl remains the
main reading color. Ink/Pearl, Ink/Champagne, Oxblood/Pearl, and
Lacquer/Pearl combinations must retain accessible text contrast.

### Typography

- **Bodoni Moda Variable** — couple names, chapter titles, expressive dates,
  pull quotes, and the opening interaction.
- **IBM Plex Sans Condensed Variable** — body copy, event information, forms,
  buttons, navigation, countdown units, and accessibility-critical labels.

Display type may be very large, but labels are sentence case by default. Small
uppercase is reserved for true programme metadata, not repeated decorative
eyebrows. Body line length stays below 72 characters.

### Shape and material

- Square or subtly chamfered frames; no repeated rounded cards.
- One-pixel Champagne or Smoke rules encode grouping and sequence.
- Photography uses hard crops, cinematic letterboxing, and stable aspect
  ratios rather than soft masks.
- A restrained monogram and curtain seam are the only recurring ornaments.
- No gradients, glow, star fields, generic gold foil simulation, or floating
  decorative particles.

## Layout concept

Mobile is a vertical programme with dramatic typographic scale changes.
Desktop becomes a sequence of asymmetric stage-like spreads rather than a
centered mobile column stretched across the screen.

```text
MOBILE 390                         DESKTOP 1440
┌──────────────────┐              ┌──────────────────────────────┐
│ mark        date │              │ mark       seam       date  │
│                  │              │                              │
│       NAME       │              │      NAME  │  NAME          │
│         &        │              │            │                 │
│       NAME       │              │       guest + open          │
│                  │              └──────────────────────────────┘
│ guest            │
│ [open invitation]│              ┌──────────────┬───────────────┐
└──────────────────┘              │ full image   │ editorial     │
                                  │              │ title / copy  │
┌──────────────────┐              └──────────────┴───────────────┘
│ cinematic image  │
├──────────────────┤              ┌──────────────────────────────┐
│ editorial copy   │              │ programme rows / chapters   │
└──────────────────┘              └──────────────────────────────┘
```

Primary alignment is left-aligned. Center alignment is limited to the opening
seam, selected quotes, countdown numerals, and the final closing gesture.

## Storyboard and capability parity

The theme explicitly represents all canonical capabilities:

1. **Cover** — photo-free Ink cover, monogram, date, personalized guest, and
   curtain-seam opening interaction with music/focus handoff.
2. **Hero** — full-bleed cinematic frame with oversized couple name and opening
   message; intentional typographic sparse state when no image exists.
3. **Quote** — isolated Pearl/Oxblood typographic interlude; omitted when empty.
4. **Couple** — fashion-editorial portrait diptych with independent readable
   biographies.
5. **Parents** — integrated credits beneath each person, never detached cards.
6. **Events** — an evening programme with one readable act per event.
7. **Countdown** — oversized numerals separated by fine rules, never boxed.
8. **Maps** — safe event-specific action in the programme row.
9. **Calendar** — valid event-specific calendar action using shared builders.
10. **Dress code** — wardrobe-note composition with text-labelled swatches.
11. **Story** — chronological acts; numbering is legitimate because stories
    are an ordered sequence. Text-only entries remain complete.
12. **Gallery** — cinematic contact sheet with one anchor frame and balanced
    layouts for sparse through package-capacity collections.
13. **Livestream** — a quiet broadcast note rendered only with a usable URL.
14. **RSVP** — private guest confirmation on Lacquer, with large attendance
    choices, visible labels, Turnstile, and direct feedback.
15. **Wishes** — guest book as rule-separated editorial entries with shared
    pagination and mutation behavior.
16. **Gift** — discreet account ledger with shared clipboard feedback.
17. **Instagram** — optional person credit link with visible accessible handle.
18. **Closing** — conclusive Ink frame using the shared closing-image fallback
    chain and optional closing message.

## Shared behavior boundary

Midnight Atelier must consume `buildThemeViewModel()` and the existing shared
cover, navigation, calendar, public-form, pagination, and clipboard behavior.
Package checks, database queries, validation, Turnstile, analytics writes, and
customer defaults remain upstream. Theme files own only markup, styling,
responsive composition, ornaments, and theme-specific visual feedback.

## Motion

- One orchestrated 700–950ms cover seam opening.
- Selected image reveals use clip-path or opacity without blocking content.
- Active navigation and form feedback may use short 150–220ms transitions.
- No animation on every section, continuous shimmer, scroll-jacking, or costly
  parallax.
- `prefers-reduced-motion` opens immediately and disables nonessential motion.

## Responsive and absence behavior

- Required viewports: 320×568, 390×844, 768×1024, and 1440×900.
- Long guest, parent, venue, and account text must wrap without horizontal
  overflow.
- Missing photos preserve the composition with typography and rules, never
  invented media.
- Empty or disabled optional sections render no dead navigation item and no
  decorative gap.
- Images reserve stable space, expose meaningful alternatives, lazy-load below
  the hero, and retain an accessible fallback after failure.
- Inputs and primary controls are at least 48px high with visible keyboard
  focus.

## Uniqueness review

The first pass risked becoming a generic black-and-gold luxury template. The
revised direction removes simulated foil, gradients, stars, ornamental frames,
and repeated centered headings. Its identity instead comes from a couture
programme structure, the cover seam, Bodoni-scale typography, strict rules,
cinematic crops, Oxblood chapter transitions, and primarily left-aligned
editorial spreads. Those choices are specific to an evening fashion-led
wedding and do not reproduce Ivory or Terra's composition.

## Catalogue data

- Name: `Midnight Atelier`
- Slug: `midnight-atelier`
- Category: `wedding`
- Preview palette: `#09090B`, `#541E2B`, `#C6A15B`
- Description: `Dark cinematic editorial wedding invitation.`

The database catalogue migration must be idempotent, preserve an existing
theme ID, and activate the slug only after application support is deployed.
