/**
 * Theme-scoped design tokens, textures and composition utilities.
 *
 * Rendered as a plain <style> tag inside the theme root so everything stays
 * namespaced under `.ni-theme` — the admin UI and any future theme are
 * untouched. No global stylesheet is modified.
 */
const CSS = `
.ni-theme {
  --ni-ivory: #F8F1E4;
  --ni-ivory-2: #F2E8D6;
  --ni-cream: #E9DCC4;
  --ni-cream-edge: #E2D3B8;
  --ni-sand: #D9C6A5;
  --ni-gold: #A87A3D;
  --ni-gold-soft: #C9A15C;
  --ni-ink: #2B1A10;
  --ni-brown: #5A3A24;
  --ni-brown-soft: #74553D;
  --ni-espresso: #3A2416;
  /* Surat dari Keraton accents: sogan batik brown, wax-seal brick, deep green. */
  --ni-sogan: #6B3E26;
  --ni-bata: #7A2E22;
  --ni-hijau: #2F4A3A;

  --ni-script: var(--font-ni-script), "Snell Roundhand", "Apple Chancery", cursive;
  --ni-display-face: var(--font-ni-display), "Trajan Pro", Georgia, serif;
  --ni-serif: var(--font-ni-body), "Iowan Old Style", Georgia, serif;

  --ni-gutter: clamp(1.25rem, 5vw, 5rem);
  --ni-section-y: clamp(4rem, 7.5vw, 7rem);
  --ni-olive: #7C8069;

  /* Gold for small text: --ni-gold is ~3:1 on ivory and fails WCAG AA below
     large sizes, this darker ink stays >= 4.5:1 on every light panel
     (ivory through the cream gradient edge). --ni-gold stays for rules,
     ornaments and display-size type. */
  --ni-gold-ink: #72552B;
  --ni-line-strong: rgba(168,122,61,0.45);
  --ni-line: rgba(168,122,61,0.3);
  --ni-line-soft: rgba(168,122,61,0.22);
  --ni-on-dark-muted: rgba(252,250,245,0.62);
  --ni-danger: #8C2F1F;

  background-color: var(--ni-ivory);
  color: var(--ni-brown);
  font-family: var(--ni-serif);
  font-weight: 400;
  letter-spacing: 0.01em;
  /* No overflow clipping here: a clip container on the theme root suppresses
     IntersectionObserver for scroll reveals deep in the page. Each section
     clips its own decorative overflow instead. */
}

.ni-theme ::selection { background: var(--ni-sand); color: var(--ni-ink); }

.ni-serif { font-family: var(--ni-serif); font-weight: 400; }

/* Couple names and signatures only — never body, labels or forms. */
.ni-script { font-family: var(--ni-script); font-weight: 400; line-height: 1.05; letter-spacing: 0; text-transform: none; color: var(--ni-ink); }

/* Inscription capitals for dates, buttons and small labels. */
.ni-caps { font-family: var(--ni-display-face); font-weight: 500; }

/* Paper grain — sits above flat fills, never over photos' focal areas. */
.ni-grain::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.24;
  mix-blend-mode: multiply;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='0.22'/%3E%3C/svg%3E");
}

/* Kawung watermark — four-petal palm-fruit motif from Javanese batik, drawn
   as thin line work so it reads as paper texture, never as a pasted print. */
.ni-lattice::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.5;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Cg fill='none' stroke='%23A87A3D' stroke-width='0.6' opacity='0.55'%3E%3Cellipse cx='24' cy='12' rx='6' ry='10'/%3E%3Cellipse cx='24' cy='36' rx='6' ry='10'/%3E%3Cellipse cx='12' cy='24' rx='10' ry='6'/%3E%3Cellipse cx='36' cy='24' rx='10' ry='6'/%3E%3Ccircle cx='24' cy='24' r='1.4'/%3E%3C/g%3E%3C/svg%3E");
  background-size: 48px 48px;
}

.ni-rule {
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--ni-sand) 22%, var(--ni-sand) 78%, transparent);
}

/* Editorial eyebrow label */
.ni-eyebrow {
  font-family: var(--ni-display-face);
  font-size: clamp(0.625rem, 1.4vw, 0.7rem);
  font-weight: 500;
  letter-spacing: 0.23em;
  text-transform: uppercase;
  color: var(--ni-gold-ink);
}

.ni-display {
  font-family: var(--ni-display-face);
  font-weight: 500;
  line-height: 1.12;
  letter-spacing: 0.03em;
  color: var(--ni-ink);
}

.ni-body { line-height: 1.75; color: var(--ni-brown-soft); }

/* Photo frame: square corners, deliberate ratio, warm tint under load. */
.ni-photo {
  background-color: var(--ni-cream);
  object-fit: cover;
  display: block;
  width: 100%;
  height: 100%;
}

.ni-photo-wrap { position: relative; overflow: hidden; background: var(--ni-cream); }

.ni-photo-wrap::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  box-shadow: inset 0 0 0 1px rgba(169, 138, 92, 0.22);
}

/* Dark panels get a warm vignette rather than a flat fill. */
.ni-panel-dark {
  background:
    radial-gradient(120% 90% at 50% 0%, #4A2E1C 0%, var(--ni-espresso) 58%, #2A190F 100%);
  color: var(--ni-ivory-2);
}

.ni-panel-cream {
  background:
    radial-gradient(90% 70% at 20% 0%, #F5ECDD 0%, var(--ni-cream) 70%, var(--ni-cream-edge) 100%);
}

/* Botanical composition is clipped by each section, never by the page. */
.ni-botanical { position: absolute; width: clamp(180px, 28vw, 420px); color: var(--ni-gold); pointer-events: none; }
.ni-botanical-divider { width: 180px; height: 32px; color: var(--ni-gold); pointer-events: none; }
.ni-floral-edge { right: -5%; bottom: -70px; opacity: .22; transform: rotate(-12deg); }
.ni-theme h1, .ni-theme h2, .ni-theme h3, .ni-theme p { overflow-wrap: anywhere; }
.ni-theme :is(a, button, input, textarea):focus-visible { outline: 2px solid var(--ni-brown); outline-offset: 5px; }
.ni-theme :is(input, textarea) { min-width: 0; max-width: 100%; border-radius: 0; }
.ni-theme :is(form, fieldset), .ni-theme .grid > * { min-width: 0; }
.ni-theme .ni-panel-dark .ni-eyebrow { color: var(--ni-gold-soft); }
.ni-cover-stagger { animation: ni-cover-enter .75s cubic-bezier(.22,.61,.36,1) both; }
@keyframes ni-cover-enter { from { opacity: 0; translate: 0 16px; } to { opacity: 1; translate: 0 0; } }
.ni-cover-content { width: 100%; max-width: 640px; }
.ni-cover-content > div { max-width: 100%; }
/* Gunungan gate: two ivory leaves meeting at a gold seam, each clipping half
   of one centred gunungan. The text layer scrolls independently so short
   screens keep the gate fixed behind it. */
.ni-gate { overflow: hidden; }
.ni-gate-leaf { position: absolute; top: 0; bottom: 0; width: 50%; overflow: hidden; background: var(--ni-ivory); }
.ni-gate-leaf--left { left: 0; box-shadow: inset -1px 0 0 var(--ni-line-strong); }
.ni-gate-leaf--right { right: 0; }
.ni-gate-gunungan { position: absolute; top: 50%; width: min(560px, 118vw); height: auto; color: var(--ni-gold); opacity: .5; transform: translate(-50%, -50%); }
.ni-gate-leaf--left .ni-gate-gunungan { left: 100%; }
.ni-gate-leaf--right .ni-gate-gunungan { left: 0; }
.ni-gate-scroll { position: absolute; inset: 0; z-index: 1; overflow-x: hidden; overflow-y: auto; }
.ni-hero { min-height: 80svh; display: grid; align-items: center; }
.ni-hero .ni-hero-floral { width: clamp(280px, 45vw, 620px); left: -8%; right: auto; bottom: -8%; opacity: .13; transform: rotate(-12deg); }
.ni-hero-inner { position: relative; display: grid; align-items: center; gap: 3rem; width: 100%; max-width: 1440px; margin-inline: auto; padding: clamp(3.5rem, 6vw, 6rem) var(--ni-gutter); }
.ni-hero-inner--text { display: block; max-width: 1180px; }
.ni-hero-names { max-width: 14ch; font-size: clamp(3.8rem, 8.5vw, 8.5rem); line-height: 1.05; }
.ni-hero-portrait { width: 100%; max-width: 480px; justify-self: center; min-width: 0; }
.ni-hero-photo-frame { position: relative; overflow: hidden; isolation: isolate; aspect-ratio: 4 / 5; border-radius: 50% 50% 0 0 / 40% 40% 0 0; border: 1px solid var(--ni-gold-soft); background: var(--ni-ivory-2); box-shadow: 0 18px 50px -36px rgba(74,63,52,.3); }
.ni-hero-photo-frame::after { content: ''; position: absolute; inset: 8px; border: 1px solid rgba(168,122,61,.2); border-radius: inherit; pointer-events: none; }
@media (min-width: 768px) {
  .ni-hero-inner:not(.ni-hero-inner--text) { grid-template-columns: minmax(0,1.2fr) minmax(0,1fr); gap: clamp(2rem,5vw,5rem); }
  .ni-hero-portrait { justify-self: end; }
}
@media (max-width: 767px) {
  .ni-hero .ni-hero-floral { top: 2rem; bottom: auto; left: -6rem; width: 380px; opacity: .1; }
}
.ni-couple-grid { display: grid; gap: 3.5rem; margin-top: 3rem; }
.ni-social-link { display: inline-flex; align-items: center; gap: .6rem; min-height: 44px; max-width: 100%; font-size: .85rem; color: var(--ni-brown); text-underline-offset: 5px; }
.ni-social-link svg { flex-shrink: 0; }
.ni-social-link span { overflow-wrap: anywhere; }
.ni-social-link:hover { color: var(--ni-ink); text-decoration: underline; }
.ni-recipient { background: rgba(252,250,245,.65); }
.ni-person { position: relative; min-width: 0; }
.ni-person .ni-botanical { width: 75%; right: -18%; top: -8%; opacity: .26; }
.ni-person-details { position: relative; margin: -2rem 0 0 1.5rem; padding: 1.5rem 0 0 1.5rem; background: var(--ni-ivory); }
.ni-person:nth-child(even) .ni-person-details { margin: -2rem 1.5rem 0 0; padding: 1.5rem 1.5rem 0 0; }
.ni-person-empty { display: grid; grid-template-columns: 5.5rem 1fr; align-items: center; gap: 1.5rem; padding-block: 2rem; border-block: 1px solid var(--ni-sand); }
.ni-monogram { position: relative; display: grid; place-items: center; height: 8rem; border: 1px solid var(--ni-sand); font-size: 4rem; background: var(--ni-ivory-2); overflow: hidden; }
.ni-monogram > svg { position: absolute; top: 6px; left: 6px; width: 1.4rem; height: 1.4rem; opacity: .8; }

/* Signature monogram — the couple-initials badge reused on cover + closing. */
.ni-monogram-badge { display: inline-flex; align-items: center; gap: .7rem; }
.ni-monogram-badge-bar { width: 1px; height: 1.5rem; background: var(--ni-gold); opacity: .55; }
.ni-monogram-badge-letters {
  font-family: var(--ni-display-face);
  font-size: 1.15rem;
  letter-spacing: .1em;
  padding: .55rem 1rem;
  border: 1px solid var(--ni-gold);
  color: var(--ni-brown);
}
.ni-monogram-badge-amp { display: inline-block; margin: 0 .3em; color: var(--ni-gold); font-size: .85em; }
.ni-panel-dark .ni-monogram-badge-letters { color: var(--ni-ivory-2); border-color: var(--ni-gold-soft); }
.ni-panel-dark .ni-monogram-badge-bar { background: var(--ni-gold-soft); }
.ni-panel-dark .ni-monogram-badge-amp { color: var(--ni-gold-soft); }
.ni-events-frame { position: relative; border: 1px solid var(--ni-sand); padding: clamp(1.5rem, 4vw, 4rem); background: rgba(252,250,245,.65); }
.ni-events-frame::before { content: ''; position: absolute; inset: 6px; border: 1px solid rgba(168,122,61,.17); pointer-events: none; }
.ni-event-date { border-bottom: 1px solid var(--ni-sand); padding-bottom: 1.5rem; }
/* Justified rows (GalleryRows.tsx): each item grows in proportion to its
   width/height ratio (--r) from a basis of ratio x row height, so every
   photo in a row ends at the same height. Order stays row-major, nothing is
   cropped to a shared shape, and the ::after spacer keeps the last row at
   its natural size instead of stretching one or two photos edge to edge. */
.ni-gallery-rows { --ni-row-h: clamp(140px, 30vw, 320px); display: flex; flex-wrap: wrap; gap: .75rem; margin-top: 3rem; }
.ni-gallery-rows::after { content: ""; flex-grow: 99999; }
.ni-gallery-rows--single::after { content: none; }
.ni-gallery-rows--single .ni-gallery-item { max-width: 960px; margin-inline: auto; }
/* Grow is ratio x 100: when a row's grow values sum below 1 (one 4:5
   portrait = 0.8), flexbox hands out only that fraction of the free space
   and the row stops short of the edge. */
.ni-gallery-item { flex-grow: calc(var(--r) * 100); flex-basis: calc(var(--r) * var(--ni-row-h)); min-width: 0; margin: 0; }
.ni-gallery-caption { padding-top: .75rem; font-size: .8rem; line-height: 1.5; color: var(--ni-brown-soft); }

.ni-lightbox { width: 100vw; max-width: 100vw; height: 100svh; max-height: 100svh; margin: 0; padding: 0; border: 0; background: transparent; color: var(--ni-ivory-2); }
.ni-lightbox::backdrop { background: rgba(26,21,16,.94); }
.ni-lightbox-body { display: flex; height: 100%; flex-direction: column; padding: max(1rem, env(safe-area-inset-top)) var(--ni-gutter) max(1rem, env(safe-area-inset-bottom)); pointer-events: none; }
.ni-lightbox-frame { position: relative; flex: 1; min-height: 0; }
.ni-lightbox-photo { object-fit: contain; }
.ni-lightbox-bar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: .75rem; padding-top: 1rem; pointer-events: auto; }
.ni-lightbox-caption { font-size: .85rem; color: var(--ni-on-dark-muted); overflow-wrap: anywhere; }
.ni-lightbox-btn { min-width: 44px; min-height: 44px; padding: 0 1rem; border: 1px solid rgba(199,174,133,.45); color: var(--ni-ivory-2); font-size: .72rem; letter-spacing: .2em; text-transform: uppercase; transition: background-color .25s ease; }
.ni-lightbox-btn:hover { background: rgba(199,174,133,.16); }
.ni-dresscode-groups { display: flex; flex-wrap: wrap; justify-content: center; gap: clamp(2.5rem, 8vw, 5rem); }
.ni-dresscode-group { display: flex; flex-direction: column; align-items: center; gap: 1.1rem; }
.ni-dresscode-swatches { display: flex; flex-wrap: wrap; justify-content: center; gap: 1.25rem; }
.ni-dresscode-swatch { display: flex; flex-direction: column; align-items: center; gap: .55rem; }
.ni-dresscode-dot {
  display: block;
  width: 3.1rem;
  height: 3.1rem;
  border-radius: 999px;
  box-shadow: 0 0 0 1px rgba(168,122,61,0.35), 0 6px 16px -10px rgba(74,63,52,0.5);
}
.ni-dresscode-hex { font-size: .62rem; letter-spacing: .08em; color: var(--ni-brown-soft); }
.ni-rsvp-panel { border: 1px solid var(--ni-sand); }
.ni-rsvp-option { position: relative; display: block; cursor: pointer; }
.ni-rsvp-option span { display: flex; font-family: var(--ni-display-face); min-height: 52px; align-items: center; justify-content: center; padding: 0 1rem; border: 1px solid var(--ni-line); color: var(--ni-brown); font-size: .72rem; letter-spacing: .26em; text-transform: uppercase; text-align: center; transition: background-color .3s ease, border-color .3s ease, color .3s ease; }
.ni-rsvp-option:hover span { border-color: var(--ni-line-strong); }
.ni-rsvp-option input:checked + span { background: var(--ni-brown); border-color: var(--ni-brown); color: var(--ni-ivory); }
.ni-rsvp-option input:focus-visible + span { outline: 2px solid var(--ni-brown); outline-offset: 4px; }
.ni-wishes-empty { display: flex; align-items: center; justify-content: center; gap: 2rem; flex-direction: column; min-height: 220px; border-block: 1px solid var(--ni-sand); }
.ni-wishes-empty .ni-botanical { position: relative; width: 125px; height: 160px; opacity: .7; }
@media (min-width: 768px) {
  .ni-couple-grid { grid-template-columns: repeat(2,minmax(0,1fr)); gap: clamp(3rem, 8vw, 8rem); }
  .ni-person:nth-child(even) { margin-top: 7rem; }
  .ni-person-empty:nth-child(even) { margin-top: 3rem; }
  .ni-event-date { border-bottom: 0; border-right: 1px solid var(--ni-sand); padding-right: 2rem; }
}

@media (min-width: 900px) {
  .ni-gallery-rows { gap: 1.25rem; }
}
@media (max-width: 374px) {
  .ni-theme { --ni-gutter: 1.25rem; }
  .ni-theme form { gap: 1.25rem; }
  .ni-rsvp-panel { padding-inline: 1rem; }
  .ni-theme button { letter-spacing: .12em; }
}

/* Bottom bar (DESIGN.md 12a). Phones: a full-width pill rail in a 12px /
   safe-area gutter, five equal items that never scroll. The bar is 64px tall
   (52px items + 5px rail padding + 1px border, twice); --ni-nav-clearance is
   that plus its bottom offset and a 12px breath, so page content and the
   music control both clear it. */
.ni-theme { --ni-nav-clearance: calc(64px + max(12px, env(safe-area-inset-bottom)) + 12px); }
.ni-content[data-ni-nav] { padding-bottom: var(--ni-nav-clearance); }
.ni-floating-nav {
  padding-inline: max(12px, env(safe-area-inset-left)) max(12px, env(safe-area-inset-right));
  padding-bottom: max(12px, env(safe-area-inset-bottom));
  pointer-events: none;
}
.ni-floating-nav-rail {
  display: flex;
  align-items: stretch;
  gap: 0;
  width: 100%;
  padding: 5px;
  overflow: hidden;
  list-style: none;
  pointer-events: auto;
  border-radius: 999px;
  border: 1px solid rgba(168,122,61,0.35);
  background: rgba(252,250,245,0.92);
  box-shadow: 0 18px 44px -22px rgba(42,34,25,0.38), 0 1px 0 rgba(255,255,255,0.6) inset;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}
.ni-floating-nav-rail > li { flex: 1 1 0; min-width: 0; display: flex; }
.ni-floating-nav-btn {
  position: relative;
  display: flex;
  flex: 1 1 auto;
  width: 100%;
  min-width: 0;
  min-height: 52px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 6px 2px;
  border-radius: 999px;
  color: var(--ni-brown-soft);
  transition: color 0.35s ease, transform 0.25s ease;
}
.ni-floating-nav-btn:hover { color: var(--ni-brown); }
.ni-floating-nav-btn:active { transform: scale(0.94); }
.ni-floating-nav-btn[data-active] { color: var(--ni-espresso); }
.ni-floating-nav-glyph { position: relative; z-index: 1; display: grid; place-items: center; transition: transform 0.35s cubic-bezier(.22,.61,.36,1); }
.ni-floating-nav-glyph svg { width: clamp(18px, 5.2vw, 22px); height: clamp(18px, 5.2vw, 22px); }
.ni-floating-nav-btn[data-active] .ni-floating-nav-glyph { transform: translateY(-1px); color: var(--ni-gold-ink); }
.ni-floating-nav-label {
  position: relative;
  z-index: 1;
  max-width: 100%;
  font-size: clamp(11px, 3vw, 12px);
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: 0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ni-floating-nav-btn[data-active] .ni-floating-nav-label { font-weight: 600; }
/* Tablet/desktop: the rail hugs its items, centred, in inscription capitals. */
@media (min-width: 768px) {
  .ni-floating-nav-rail { width: auto; max-width: 100%; padding: 6px; gap: 2px; }
  .ni-floating-nav-rail > li { flex: 0 0 auto; }
  .ni-floating-nav-btn { min-width: 4.6rem; padding: 6px 0.9rem; }
  .ni-floating-nav-glyph svg { width: 20px; height: 20px; }
  .ni-floating-nav-label { font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; }
}
.ni-floating-nav-pill {
  position: absolute;
  inset: 2px;
  z-index: 0;
  border-radius: 999px;
  background: linear-gradient(180deg, var(--ni-ivory-2), var(--ni-cream));
  box-shadow: 0 0 0 1px rgba(168,122,61,0.4) inset, 0 6px 14px -8px rgba(74,63,52,0.45);
}

.ni-addcal-trigger {
  display: inline-flex;
  align-items: center;
  gap: .55rem;
  min-height: 44px;
  padding: .7rem 1.3rem;
  border: 1px solid var(--ni-gold-soft);
  color: var(--ni-ivory-2);
  font-size: .68rem;
  letter-spacing: .18em;
  text-transform: uppercase;
  transition: background-color .3s ease, color .3s ease;
}
.ni-addcal-trigger:hover { background: var(--ni-gold-soft); color: var(--ni-espresso); }
.ni-addcal-menu {
  z-index: 50;
  display: flex;
  min-width: 13rem;
  flex-direction: column;
  border: 1px solid rgba(199,174,133,0.35);
  background: rgba(28,23,17,0.96);
  box-shadow: 0 20px 40px -18px rgba(0,0,0,0.55);
  backdrop-filter: blur(10px);
}
.ni-addcal-item {
  display: flex;
  align-items: center;
  gap: .65rem;
  padding: .8rem 1.1rem;
  border: none;
  background: transparent;
  text-align: left;
  font-family: var(--ni-serif);
  font-size: .78rem;
  letter-spacing: .02em;
  color: var(--ni-ivory-2);
  cursor: pointer;
  transition: background-color .2s ease, color .2s ease;
}
.ni-addcal-item svg { flex-shrink: 0; }
.ni-addcal-item + .ni-addcal-item { border-top: 1px solid rgba(199,174,133,0.2); }
.ni-addcal-item:hover, .ni-addcal-item:focus-visible { background: rgba(199,174,133,0.14); color: var(--ni-gold-soft); }

.ni-melati { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
.ni-melati-petal {
  position: absolute;
  top: -24px;
  opacity: 0;
  fill: #FFFDF6;
  stroke: var(--ni-gold-soft);
  stroke-width: .8;
  animation-name: ni-melati-fall;
  animation-timing-function: cubic-bezier(.3,.1,.6,1);
  animation-fill-mode: forwards;
}
.ni-melati-core { fill: #E2C46B; stroke: none; }
@keyframes ni-melati-fall {
  0% { opacity: 0; transform: translate(0, 0) rotate(0deg); }
  12% { opacity: 1; }
  85% { opacity: .9; }
  100% { opacity: 0; transform: translate(var(--ni-drift), 520px) rotate(var(--ni-spin)); }
}

.ni-wax-seal {
  position: absolute;
  top: -1.1rem;
  right: -.6rem;
  display: grid;
  place-items: center;
  width: 4.4rem;
  height: 4.4rem;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #9A3E2E, var(--ni-bata) 70%);
  box-shadow: inset 0 0 0 4px rgba(243,221,184,.2), 0 3px 8px -2px rgba(0,0,0,.45);
  color: #F3DDB8;
  opacity: 0;
  transform: scale(2.2) rotate(-25deg);
  pointer-events: none;
}
.ni-wax-seal-text { font-family: var(--ni-display-face); font-size: .55rem; letter-spacing: .14em; text-transform: uppercase; }
.ni-wax-seal[data-stamped] { animation: ni-seal-stamp .45s cubic-bezier(.3,1.5,.5,1) forwards; }
@keyframes ni-seal-stamp { to { opacity: 1; transform: scale(1) rotate(-12deg); } }

@media (prefers-reduced-motion: reduce) {
  .ni-theme *,
  .ni-theme *::before,
  .ni-theme *::after {
    animation-duration: 0.001ms !important;
    animation-delay: 0ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
}
`;

export function ThemeStyles() {
  return <style dangerouslySetInnerHTML={{ __html: CSS }} />;
}
