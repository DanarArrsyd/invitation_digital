# Theme Identity Redesign — "Empat kisah, empat dunia"

Date: 2026-10-03
Status: Design approved per section in brainstorming; awaiting spec review
Supersedes (visual direction only): typography, cover/opening and ornament
sections of `2026-09-24-terra-botanica-theme-design.md`,
`2026-09-30-midnight-atelier-theme-design.md`,
`2026-10-01-cobalt-riviera-theme-design.md`, and the Ivory sections of
`docs/DESIGN.md`. Data contract, section manifest, feature gating, package
entitlements and accessibility requirements of those documents stay
authoritative.

## 1. Goal

Give each of the four registered public themes its own elegant, romantic
identity that is unmistakably different from the others, through:

1. a unique three-font system per theme (script for names, display for
   headings/labels, readable text face for body);
2. a re-imagined concept, palette confirmation and ornament set derived from
   the theme name;
3. one theatrical opening animation per theme;
4. 3–4 signature interactions per theme;
5. restrained scroll reveals.

Theme slugs, CSS prefixes, section order, section manifest keys and all public
capabilities stay unchanged. This is a presentation-layer change only.

## 2. Decisions taken in brainstorming

| Topic | Decision |
|---|---|
| Ivory scope | Change Ivory in place. The live Rayhana & Febri invitation (event 20 Oct 2026) receives the new look after merge. |
| Identity | Total reinterpretation; theme names kept. |
| Motion level | "Sinematik terarah": one theatrical opener + signature interactions + scroll reveals; light on mid-range phones; `prefers-reduced-motion` respected. |
| Approach | A — "Empat kisah, empat dunia": each theme is a distinct love-story world. |

Prototypes for every choice are in `.superpowers/brainstorm/74556-1790989646/content/`
(gitignored, local reference only).

## 3. Shared rules (all themes)

- **Fonts**: no font is shared between themes. Script faces are used only for
  couple names, signatures and short accents, never for body or form labels.
  Body text is ≥16px (≥17px on Midnight's dark background). Fonts are
  self-hosted via `@fontsource` and wired through `src/themes/theme-fonts.ts` +
  each theme's `fonts.css`; nothing is loaded from Google Fonts at runtime.
- **Motion**: animate only `transform`, `opacity`, `clip-path`,
  `stroke-dashoffset`, and CSS custom properties driving those. No layout
  animation, no canvas, no animation library beyond the existing Motion
  dependency. Particle effects (petals, seeds, bubbles, glints) are capped at
  ~20 DOM nodes and removed after they finish.
- **Reduced motion**: with `prefers-reduced-motion: reduce`, the opener resolves
  immediately to the opened state, scroll-linked effects render their final
  state, and celebration effects are skipped while their confirmation text
  still appears. The wax seal is a confirmation mark, so under reduced motion
  it appears instantly instead of being hidden.
- **Opener contract**: one tap on the cover → `openInvitation()` from
  `useInvitationCover` (music starts in the same user gesture) → theme opener
  animation ≈1–1.4s → content revealed and focused. The opener must not delay
  the audio call or block keyboard activation; the cover keeps a real
  "Buka Undangan" button with an accessible name.
- **Signature interactions are presentation**, not new capabilities. They hang
  off existing state: RSVP success (`useRsvpForm`), wish success
  (`useWishForm`), copy success (`useCopyFeedback`), section visibility, and
  scroll position. In-view triggers use Motion's existing `whileInView` /
  `useInView` (no new hook). Celebrations are components mounted by the
  success state they celebrate, so they run once per success and return
  nothing under reduced motion. Terra added two shared mechanics:
  `use-scroll-progress.ts` (rAF-throttled 0–1 progress written to a CSS
  custom property, also recomputed when the body resizes, e.g. when the
  cover reveals the content) and `use-in-view-once.ts` (IntersectionObserver
  that arms only once the element is reported off-screen, so server and
  client markup agree and content already on screen never flashes). Terra
  uses its own hook rather than Motion because Terra stays CSS-driven and
  its test harnesses stub Motion.
- **Docs**: `docs/DESIGN.md` §5 ("no more than 2 primary font families")
  gains the exception that a script face reserved for names is the third
  family.
- **Cover rule** (CLAUDE.md): Ivory's cover keeps an ivory background, so the
  gunungan gate leaves are ivory paper with gold gunungan line art; sogan is
  used for the gunungan's inner lines and dark panels, not the full cover.
- **Guardrails** (CLAUDE.md): no neon glow, no purple-blue gradients, no
  generic blobs, no pasted batik PNGs; cultural motifs are drawn as SVG/CSS.
- **Parity**: every theme keeps every capability. Cross-theme tests prove
  reduced-motion behaviour and that celebrations never hide confirmation text.

## 4. Nusantara Ivory — "Surat dari Keraton"

A royal Javanese letter: inscription capitals, flowing script, wayang
symbolism, warm ivory paper.

- **Fonts**: Great Vibes (names) · Cinzel (headings, eyebrows, dates) · Lora
  (body). Packages: `@fontsource/great-vibes`, `@fontsource-variable/cinzel`,
  `@fontsource-variable/lora`. Replaces Cormorant Garamond + Jost.
- **Palette**: gading `#F8F1E4`, sogan `#6B3E26`, emas tua `#A87A3D`, merah bata
  `#7A2E22`, hijau tua `#2F4A3A` (small accents). Exact AA-checked ink tokens
  are derived during implementation from the existing `--ni-*` set.
- **Motifs/elements**: kawung (faint watermark + divider centre), gunungan
  (opener and section markers), single gold rule; thin double-line frame in the
  style of a keraton manuscript for couple photos and event cards, sharp
  corners. Small Javanese greetings as accents ("Sugeng rawuh"). Thanks are
  written "Terima kasih" (owner decision, Oct 2026: no "Matur nuwun").
- **Opener — Gunungan terbelah**: the cover is a two-leaf ivory gate carrying
  a gold-line gunungan split down its centre; on tap the cover text fades and
  the two leaves slide apart left/right (≈1s) like a dalang opening the play,
  revealing the hero.
- **Signature interactions**:
  1. *Hujan melati* (RSVP): after a successful "Hadir" RSVP, ~12 jasmine
     blossoms (SVG) drift down, then "Terima kasih" appears. Not shown for
     "Tidak Hadir", judged by the attendance that was submitted.
  2. *Garis canting* (all section headings): when a heading enters view, its
     gold rule and kawung centre are drawn like a canting stroke
     (`stroke-dashoffset`), replacing the generic fade.
  3. *Cap lilin "Tersalin"* (gift): on successful copy, a brick-red wax seal
     stamps onto the account card. The manual-copy fallback message stays.

**Deferred** (not built in the first Ivory PR): the "Sugeng rawuh" greeting,
gunungan section markers, the double-line frame for couple photos, and any
`--ni-hijau` accent usage (the token exists but is unused).

## 5. Terra Botanica — "Herbarium Cinta"

The couple's herbarium: pressed flowers, numbered specimen labels, paper tape,
typewritten archive notes.

- **Fonts**: Herr Von Muellerhoff (names) · Courier Prime (labels, dates,
  eyebrows) · Spectral (headings in italic, body). Packages:
  `@fontsource/herr-von-muellerhoff`, `@fontsource/courier-prime`,
  `@fontsource/spectral`. Replaces Fraunces + Manrope.
- **Palette**: linen `#F2EBDD`, lumut `#4E5B3A`, tanah liat `#B5653E`, kakao
  `#4A3426`, matahari `#D9A441`, tulang `#FBF7EE`.
- **Elements**: fine dotted paper texture (CSS), yellow paper tape, hand-made
  SVG pressed flowers (no stock imagery), single-rule specimen labels with
  numbers, print-style photos with white borders and slight tilt, Latin flower
  names as accents ("Rosa amoris").
- **Opener — Benih tumbuh dan mekar**: from a single seed point the stem draws
  upward, leaves pop, petals open one by one, then the names fade in
  (≈1.4s total, SVG stroke + transform only).
- **Signature interactions**:
  1. *Sulur mengikuti scroll* (page edge): one vine along the page margin grows
     with scroll progress; leaves/flowers appear at each section; complete at
     the closing section.
  2. *Label mesin ketik* (events, story, photo labels): specimen labels type
     out character by character once when they enter view. The full text is
     in the DOM from the start (screen readers read it; the effect is a visual
     clip/reveal).
  3. *Dandelion ditiup* (wishes): after a successful wish, dandelion seeds lift
     off and drift away.
  4. *Foto ditempel selotip* (gallery): photos settle into place, tilted, with
     tape, as the gallery enters view; tapping still opens the shared lightbox.

## 6. Midnight Atelier — "Malam di Ballroom"

A black-tie evening ball: crystal light, champagne, oxblood velvet. The only
dark theme.

- **Fonts**: Imperial Script (names) · Bodoni Moda (headings, italic) · Jost
  (labels in spaced capitals, body at ≥17px). Packages:
  `@fontsource/imperial-script`, existing `@fontsource-variable/bodoni-moda`,
  `@fontsource-variable/jost` (freed by Ivory). Replaces IBM Plex Sans
  Condensed.
- **Palette**: tinta `#14121A`, oxblood `#5E1A22`, champagne `#D8C08A`, mutiara
  `#EDE6DA`, asap `#6E6873`.
- **Elements**: gold-line chandelier, champagne flutes, oxblood diamond
  divider, thin gold frames. Light is expressed with warm radial gradients
  ("spotlight"), used sparingly; never neon glow.
- **Opener — Bersulang champagne**: two flutes tilt toward each other and
  clink, a light ring pulses, bubbles rise, and the names appear above them.
  Replaces the curtain-seam cover.
- **Signature interactions**:
  1. *Lampu sorot panggung* (all headings): headings rest dim and are lit by a
     stage spotlight as they reach mid-viewport. Contrast of the dim state
     still meets AA for large text.
  2. *Kartu dansa* (RSVP): after "Hadir", a tasselled dance card appears and
     the guest's name, status and party size are "written" in script.
  3. *Gelembung ucapan* (wishes): the submitted wish rises and fades with
     champagne bubbles, echoing the opener; it then appears in the list.
  4. *Lampu pigura* (gallery): framed photos on a dark wall are lit one by one
     by picture lights as the gallery enters view.

Implementation notes (Midnight PR): RSVP collects no party size, so the dance
card writes the guest's name and attendance only. The new wish reaches the
list through the existing server revalidation, not an optimistic insert.
Asap is a rule colour; small secondary text uses `#A9A2AD`. In-view effects
use `themes/shared/use-in-view-once.ts` (Midnight stays CSS-driven).
Guest-facing labels are Bahasa Indonesia (owner decision). **Deferred:** the
gold-line chandelier ornament.

## 7. Cobalt Riviera — "Surat Cinta dari Mediterania"

A summer postcard from the Amalfi coast: majolica tiles, lemons, stamps, sea.
The brightest theme.

- **Fonts**: Corinthia Bold (names) · Familjen Grotesk (spaced-capital labels)
  · Newsreader (headings in italic, body ≥17px). Package:
  `@fontsource/corinthia`; Familjen and Newsreader are already installed.
- **Palette**: kobalt `#1D3E9E`, porselen `#F7F4EC`, tinta laut `#0E2350`,
  jeruk `#E8743B`, citron `#E9D35B`, kolam `#8EC5D6`. Existing `--cr-*` tokens
  are re-pointed, not renamed.
- **Elements**: majolica tile pattern (pure CSS), lemon, wave line, stamp and
  postmark, white-bordered postcard photos, tiled card corners, sharp corners
  (the theme's no-`border-radius` rule stays). Small Italian greetings as
  accents ("Saluti", "Grazie").
- **Opener — Ombak surut**: full-screen cobalt sea with "Saluti dalla Costa";
  on tap two foam-edged wave layers recede upward and the names appear on the
  porcelain "sand". Replaces the horizon-shutter cover.
- **Signature interactions**:
  1. *Ombak pembatas* (section dividers): two wave lines sway gently and
     continuously (SVG transform; paused when off-screen).
  2. *Pagi ke senja* (page background): sky hue shifts from morning to sunset
     and the sun sinks toward the sea with scroll progress.
  3. *Cap pos "Diterima"* (RSVP): an orange round postmark stamps onto the
     confirmation card.
  4. *Pesan dalam botol* (wishes): the wish rolls into a bottle that bobs and
     drifts away; the wish then appears in the list.

Implementation notes (Cobalt PR): jeruk is 2.7:1 on porselen, so text uses
`#9A3D14`; the sky is two flat layers (porselen, senja `#F8DCC4`) cross-faded
by opacity, AA-tested along the whole ramp, and reduced motion pins sunset.
The sun sinks in the left page gutter. Dividers pause off screen with a direct
observer (no reveal, so not `use-in-view-once`). The postmark stamps every
successful RSVP and names the submitted attendance; RSVP has no party size.
The sent wish reaches the list through server revalidation. Italian accents
are limited to a tagged "Saluti"; thanks stay "Terima kasih".

## 8. Font budget

| Theme | Script | Display | Body |
|---|---|---|---|
| Ivory | Great Vibes | Cinzel | Lora |
| Terra | Herr Von Muellerhoff | Courier Prime | Spectral |
| Midnight | Imperial Script | Bodoni Moda | Jost |
| Cobalt | Corinthia | Familjen Grotesk | Newsreader |

Removed packages after rollout: `cormorant-garamond`, `fraunces`, `manrope`,
`ibm-plex-sans-condensed`. Only the Latin subset and the weights actually used
are imported. `theme-fonts.ts` keeps loading all four themes' faces (needed by
the admin preview); per-theme font splitting is out of scope.

## 9. Rollout

One PR per theme, each with its own visual QA (mobile 375px + desktop, light
OS setting + reduced motion), cross-theme test updates, and updates to that
theme's spec and `docs/PROJECT_MEMORY.md`. Order: Ivory, Terra, Midnight,
Cobalt. Ask before every merge: merging to `main` auto-deploys production,
and the Ivory PR changes the live Rayhana & Febri invitation 17 days before the
event.

## 10. Testing

- Unit: `use-scroll-progress` (with Terra); each celebration component
  renders nothing under reduced motion.
- Cross-theme behavioural (extends `tests/*.test.mjs` harnesses): each theme's
  cover still exposes an accessible open button and calls `openInvitation`
  once; RSVP/wish confirmations remain visible with celebrations; copy
  fallback still selects text; gallery triggers still open the lightbox.
- Font wiring guard: each theme's `fonts.css` maps to faces imported in
  `theme-fonts.ts`, and no face is mapped by two themes.
- Manual/visual: opener at 375px, reduced-motion pass, contrast spot checks on
  the new palettes, Lighthouse mobile performance not worse than current main.

## 11. Out of scope

New public capabilities, admin UI changes, per-invitation font selection,
database changes, new theme slugs, and sound effects.

## 12. Risks

- **Live pilot**: Ivory changes reach real guests. Mitigation: Ivory PR gets a
  production-like preview check of the Rayhana & Febri data via admin preview
  before merge; rollback is a single revert.
- **Script legibility**: scripts are limited to names; every name also exists
  as plain text for screen readers via the existing heading markup.
- **Low-end phones**: celebrations are capped and one-shot; scroll effects use
  a single rAF loop writing CSS variables.
