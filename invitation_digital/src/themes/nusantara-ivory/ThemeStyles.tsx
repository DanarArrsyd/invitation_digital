/**
 * Theme-scoped design tokens, textures and composition utilities.
 *
 * Rendered as a plain <style> tag inside the theme root so everything stays
 * namespaced under `.ni-theme` — the admin UI and any future theme are
 * untouched. No global stylesheet is modified.
 */
const CSS = `
.ni-theme {
  --ni-ivory: #FCFAF5;
  --ni-ivory-2: #F7F1E7;
  --ni-cream: #EFE5D4;
  --ni-sand: #DCCCB0;
  --ni-gold: #A98A5C;
  --ni-gold-soft: #C7AE85;
  --ni-ink: #241F19;
  --ni-brown: #4A3F34;
  --ni-brown-soft: #7C6B58;
  --ni-espresso: #2A2219;

  --ni-serif: var(--font-nusantara-serif), "Iowan Old Style", Georgia, serif;
  --ni-sans: var(--font-nusantara-sans), ui-sans-serif, system-ui, sans-serif;

  --ni-gutter: clamp(1.25rem, 5vw, 5rem);
  --ni-section-y: clamp(4rem, 7.5vw, 7rem);
  --ni-olive: #7C8069;

  background-color: var(--ni-ivory);
  color: var(--ni-brown);
  font-family: var(--ni-sans);
  font-weight: 400;
  letter-spacing: 0.01em;
  /* No overflow clipping here: a clip container on the theme root suppresses
     IntersectionObserver for scroll reveals deep in the page. Each section
     clips its own decorative overflow instead. */
}

.ni-theme ::selection { background: var(--ni-sand); color: var(--ni-ink); }

.ni-serif { font-family: var(--ni-serif); font-weight: 400; }

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

/* Nusantara lattice — thin geometric rhythm drawn from carving/textile grids. */
.ni-lattice::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.5;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Cg fill='none' stroke='%23A98A5C' stroke-width='0.6' opacity='0.5'%3E%3Cpath d='M0 32 L32 0 L64 32 L32 64 Z'/%3E%3Cpath d='M32 22 L42 32 L32 42 L22 32 Z'/%3E%3C/g%3E%3C/svg%3E");
  background-size: 64px 64px;
}

.ni-rule {
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--ni-sand) 22%, var(--ni-sand) 78%, transparent);
}

/* Editorial eyebrow label */
.ni-eyebrow {
  font-family: var(--ni-sans);
  font-size: clamp(0.625rem, 1.4vw, 0.7rem);
  font-weight: 400;
  letter-spacing: 0.38em;
  text-transform: uppercase;
  color: var(--ni-gold);
}

.ni-display {
  font-family: var(--ni-serif);
  font-weight: 400;
  line-height: 0.92;
  letter-spacing: -0.015em;
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
    radial-gradient(120% 90% at 50% 0%, #3A3025 0%, var(--ni-espresso) 58%, #1E1913 100%);
  color: var(--ni-ivory-2);
}

.ni-panel-cream {
  background:
    radial-gradient(90% 70% at 20% 0%, #F6EEE1 0%, var(--ni-cream) 70%, #E7DAC5 100%);
}

/* Botanical composition is clipped by each section, never by the page. */
.ni-botanical { position: absolute; width: clamp(180px, 28vw, 420px); color: var(--ni-gold); pointer-events: none; }
.ni-botanical-divider { width: 180px; height: 32px; color: var(--ni-gold); pointer-events: none; }
.ni-floral-edge { right: -5%; bottom: -70px; opacity: .22; transform: rotate(-12deg); }
.ni-theme h1, .ni-theme h2, .ni-theme h3, .ni-theme p { overflow-wrap: anywhere; }
.ni-theme :is(a, button, input, textarea):focus-visible { outline: 2px solid var(--ni-brown); outline-offset: 5px; }
.ni-theme :is(input, textarea) { min-width: 0; max-width: 100%; border-radius: 0; }
.ni-theme :is(form, fieldset), .ni-theme .grid > * { min-width: 0; }
.ni-theme .ni-eyebrow { color: #806741; letter-spacing: .23em; }
.ni-theme .ni-panel-dark .ni-eyebrow { color: var(--ni-gold-soft); }
.ni-story > .ni-botanical { left: -6%; right: auto; bottom: -10%; transform: rotate(24deg); opacity: .12; }
.ni-rsvp > .ni-botanical { top: -50px; bottom: auto; left: -8%; right: auto; transform: rotate(100deg); opacity: .18; }
.ni-events > .ni-botanical { top: 0; bottom: auto; width: 270px; opacity: .22; }
.ni-cover-stagger { animation: ni-cover-enter .75s cubic-bezier(.22,.61,.36,1) both; }
@keyframes ni-cover-enter { from { opacity: 0; translate: 0 16px; } to { opacity: 1; translate: 0 0; } }
.ni-cover-arch { height: calc(100% - 3rem); }
.ni-cover-content { width: 100%; max-width: 640px; }
.ni-cover-content > div { max-width: 100%; }
.ni-cover-floral-left { left: -55px; bottom: -45px; opacity: .45; }
.ni-cover-floral-right { right: -65px; top: -80px; transform: rotate(180deg); opacity: .3; }
.ni-hero { min-height: 80svh; display: grid; align-items: center; }
.ni-hero .ni-hero-floral { width: clamp(280px, 45vw, 620px); left: -8%; right: auto; bottom: -8%; opacity: .13; transform: rotate(-12deg); }
.ni-hero-inner { position: relative; display: grid; align-items: center; gap: 3rem; width: 100%; max-width: 1440px; margin-inline: auto; padding: clamp(3.5rem, 6vw, 6rem) var(--ni-gutter); }
.ni-hero-names { max-width: 12ch; font-size: clamp(3.5rem, 7.5vw, 8rem); line-height: .95; }
.ni-hero-portrait { width: 100%; max-width: 480px; justify-self: center; min-width: 0; }
.ni-hero-photo-frame { position: relative; overflow: hidden; isolation: isolate; aspect-ratio: 4 / 5; border-radius: 50% 50% 0 0 / 40% 40% 0 0; border: 1px solid var(--ni-gold-soft); background: var(--ni-ivory-2); box-shadow: 0 18px 50px -36px rgba(74,63,52,.3); }
.ni-hero-photo-frame::after { content: ''; position: absolute; inset: 8px; border: 1px solid rgba(169,138,92,.2); border-radius: inherit; pointer-events: none; }
@media (min-width: 768px) {
  .ni-hero-inner { grid-template-columns: minmax(0,1.2fr) minmax(0,1fr); gap: clamp(2rem,5vw,5rem); }
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
.ni-monogram { position: relative; display: grid; place-items: center; height: 8rem; border: 1px solid var(--ni-sand); font-size: 4rem; background: var(--ni-ivory-2); }
.ni-events-frame { position: relative; border: 1px solid var(--ni-sand); padding: clamp(1.5rem, 4vw, 4rem); background: rgba(252,250,245,.65); }
.ni-events-frame::before { content: ''; position: absolute; inset: 6px; border: 1px solid rgba(169,138,92,.17); pointer-events: none; }
.ni-event-date { border-bottom: 1px solid var(--ni-sand); padding-bottom: 1.5rem; }
.ni-gallery-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 1rem; align-items: start; margin-top: 3rem; }
.ni-gallery-grid > :nth-child(3n+1) { grid-column: span 2; }
.ni-gallery-grid > :only-child { max-width: 960px; width: 100%; margin-inline: auto; }
.ni-gallery-caption { padding-top: .75rem; font-size: .8rem; line-height: 1.5; color: var(--ni-brown-soft); }
.ni-gallery-photo { aspect-ratio: 3/4; }
.ni-gallery-grid > :nth-child(3n+1) .ni-gallery-photo { aspect-ratio: 16/10; }
.ni-rsvp-panel { border: 1px solid var(--ni-sand); }
.ni-theme .ni-rsvp-panel button[aria-pressed='true'] { background: var(--ni-brown) !important; border-color: var(--ni-brown) !important; }
.ni-wishes-empty { display: flex; align-items: center; justify-content: center; gap: 2rem; flex-direction: column; min-height: 220px; border-block: 1px solid var(--ni-sand); }
.ni-wishes-empty .ni-botanical { position: relative; width: 125px; height: 160px; opacity: .7; }
@media (min-width: 768px) {
  .ni-couple-grid { grid-template-columns: repeat(2,minmax(0,1fr)); gap: clamp(3rem, 8vw, 8rem); }
  .ni-person:nth-child(even) { margin-top: 7rem; }
  .ni-person-empty:nth-child(even) { margin-top: 3rem; }
  .ni-event-date { border-bottom: 0; border-right: 1px solid var(--ni-sand); padding-right: 2rem; }
  .ni-gallery-grid { grid-template-columns: repeat(12,minmax(0,1fr)); gap: 2rem; }
  .ni-gallery-grid > * .ni-gallery-photo { aspect-ratio: 3/4; }
  .ni-gallery-grid > :nth-child(4n+1) { grid-column: span 7; }
  .ni-gallery-grid > :nth-child(4n+2) { grid-column: span 5; padding-top: 5rem; }
  .ni-gallery-grid > :nth-child(4n+3) { grid-column: span 5; }
  .ni-gallery-grid > :nth-child(4n+4) { grid-column: span 7; padding-top: 4rem; }
  .ni-gallery-grid > :nth-child(4n+1) .ni-gallery-photo { aspect-ratio: 4/5; }
  .ni-gallery-grid > :nth-child(4n+3) .ni-gallery-photo { aspect-ratio: 1; }
  .ni-gallery-grid > :nth-child(4n+4) .ni-gallery-photo { aspect-ratio: 16/10; }
  .ni-gallery-grid > :only-child { grid-column: 1/-1; }
  .ni-gallery-grid > :only-child .ni-gallery-photo { aspect-ratio: 16/10; }
}
@media (max-width: 374px) {
  .ni-theme { --ni-gutter: 1.25rem; }
  .ni-theme form { gap: 1.25rem; }
  .ni-rsvp-panel { padding-inline: 1rem; }
  .ni-theme button { letter-spacing: .12em; }
}

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
