# Kelir Kencana — theme identity and design spec

Date: 2026-10-05. Status: approved by the owner through mockup v5
(claude.ai artifact "Kelir Kencana Mockup"). Slug `kelir-kencana`, CSS prefix
`kk-`. Follows `docs/DESIGN.md` §28 (New Template Checklist).

## 1. Direction: "Pagelaran Semalam Suntuk"

The invitation reads as one night of wayang kulit. The guest sits in front of
the **kelir** (the lit cotton screen), the **blencong** lamp warms it, and the
**gunungan** (kayon) opens and closes the lakon. Inside, the page is the lit
screen; the cover and the closing are the dark theatre around it.

Signature moments (and only these move):

1. **Cover — gunungan dicabut.** Dark stage, a lit kelir panel with a prada
   red rail top and bottom, a gunungan in the centre flanked by two wayang
   figures drawn as shadows. On "Buka Undangan" the gunungan slides down out
   of the panel and the figures step toward the centre.
2. **Closing — tancep kayon.** Back on the dark stage, the gold gunungan is
   planted between the same figures in full colour (the view from the
   dalang's side of the screen).

Narrative labels come from the order of a pagelaran and are event-neutral:
**Talu** (opening, hero), **Jejer** (first scene, the people), **Tancep
Kayon** (closing). Other sections use plain Indonesian labels.

## 2. Palette (tokens `--kk-*`)

| Token | Hex | Role |
|---|---|---|
| malam | `#1C1510` | Cover, closing, livestream, nav bar ground |
| kelir | `#F2E7D0` | Reading surface |
| kelirDeep | `#E8D7B4` | Secondary field (gift slip, quote, dress code) |
| sogan | `#3D2314` | Body text, shadow figures, gunungan on kelir |
| soganSoft | `#6B4A33` | Secondary text (AA on kelir) |
| prada | `#8E2B1F` | Rails, primary action, event titles, active nav marker |
| kencana | `#C09435` | Gold on malam (names, gunungan); ornament only on kelir |
| kencanaInk | `#84601D` | Gold text on kelir (AA, 4.6:1) |

No gradients except the blencong light on the cover panel (one soft radial
glow, the only light source in the theme). No neon, no glass, no rounded
cards.

## 3. Type

| Role | Face | Package |
|---|---|---|
| Script (names only) | Mea Culpa | `@fontsource/mea-culpa` |
| Display (headings, labels in spaced caps) | Marcellus | `@fontsource/marcellus` |
| Text (body ≥ 17px, italic quote) | Gelasio | `@fontsource-variable/gelasio` (+ italic axis) |

## 4. Ornament

- **Gunungan**: one SVG drawn in code (`components/Gunungan.tsx`): leaf
  outline, a tatahan dot pattern punched through, a dotted rim, a tree of
  life and a gate (kori). `currentColor` for the body and `--kk-hole` for
  the punched holes, so the same mark works as a shadow on kelir and as gold
  on malam. Used on the cover, as the section rule and in the closing.
- **Tumpal**: a row of small triangles (CSS) as the edge of the gift slip and
  as a divider.
- **Wayang figures**: two owner-supplied PNGs
  (`public/themes/kelir-kencana/wayang-satria.webp`, `wayang-putri.webp`).
  On kelir they render as shadows through `mask-image`; in the closing in
  full colour; in Jejer faded (30%) beside each person's portrait, facing
  the portrait. The figure on the groom/first person is "satria", on the
  bride/second person "putri". Non-wedding invitations keep the figures in
  cover and closing only. The current files are 400 px; the owner will
  supply ≥1000 px replacements (same file names) before launch.

## 5. Sections (all registered sections; canonical anchors)

| Anchor | Surface | Notes |
|---|---|---|
| cover | malam | Kelir panel, gunungan exit downward, guest name, button |
| `kk-beranda` | kelir | Eyebrow "Talu", names, date, 3:4 photo clipped to a kayon arch |
| `kk-quote` | kelirDeep | Quote in Gelasio italic between two small gunungan rules |
| `kk-mempelai` | kelir | "Jejer"; oval portrait + faded figure, role label, parents, bio, Instagram |
| `kk-acara` | kelir | Programme list: time column, prada title, venue, Maps link |
| `kk-countdown` | malam | Four units in Marcellus, add-to-calendar |
| `kk-dress-code` | kelirDeep | Swatches with visible labels |
| `kk-cerita` | kelir | Timeline with prada diamond markers |
| `kk-galeri` | kelir | Mosaic, no rounded corners, shared lightbox |
| `kk-livestream` | malam | Link list |
| `kk-rsvp` | kelir | Underlined fields, segmented Hadir/Tidak Hadir, Turnstile inside form |
| `kk-ucapan` | kelir | Form + wish list with prada left rule |
| `kk-kado` | kelir | Account on a kelirDeep slip with tumpal edge, copy button |
| `kk-penutup` | malam | Tancep kayon: figures + gold gunungan, names, message, optional photo |

Copy follows `invitation.type`: wedding wording ("Pagelaran Pernikahan",
"Mempelai") only for weddings; otherwise "Pagelaran" / "Yang mengundang".

## 6. Navigation

Package tiers through `pickNavItems(candidates, invitation.navSections)`.
Phone: bottom bar on malam with a prada top rule, active item in kencana with
a small prada triangle marker; more than five items scroll sideways
(`calc(100% / 5.4)`). Tablet/desktop: centred bar. Icons drawn in a single
line language on a 24 px grid.

## 7. Motion

CSS only. Cover exit (gunungan down, figures inward), a short fade between
cover and content. `prefers-reduced-motion` removes both.

## 8. Catalogue

Tagline "Pagelaran wayang di balik kelir emas." Event types: wedding,
engagement, aqiqah, birthday, graduation. Sort order 5. Demo content follows
`scripts/demo/content.mjs` conventions.
