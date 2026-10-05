import { KELIR_KENCANA_TOKENS } from "./tokens";

// The kayon arch that frames the hero photo (pointed top, straight sides).
const KAYON_ARCH =
  "polygon(0% 100%, 0% 42%, .6% 37.8%, 2.3% 33.8%, 5% 30%, 8.5% 26.2%, 12.7% 22.6%, 17.5% 19.1%, 22.7% 15.7%, 28.1% 12.4%, 33.8% 9.2%, 39.4% 6.1%, 44.8% 3%, 50% 0%, 55.2% 3%, 60.6% 6.1%, 66.2% 9.2%, 71.9% 12.4%, 77.3% 15.7%, 82.5% 19.1%, 87.3% 22.6%, 91.5% 26.2%, 95% 30%, 97.7% 33.8%, 99.4% 37.8%, 100% 42%, 100% 100%)";

export function ThemeStyles() {
  const { colors } = KELIR_KENCANA_TOKENS;

  return (
    <style>{`
      .kk-theme {
        --kk-malam: ${colors.malam};
        --kk-kelir: ${colors.kelir};
        --kk-kelir-deep: ${colors.kelirDeep};
        --kk-sogan: ${colors.sogan};
        --kk-sogan-soft: ${colors.soganSoft};
        --kk-prada: ${colors.prada};
        --kk-kencana: ${colors.kencana};
        --kk-kencana-ink: ${colors.kencanaInk};
        --kk-line: rgba(61, 35, 20, .22);
        --kk-hole: var(--kk-kelir);
        --kk-focus-ring: var(--kk-prada);
        --kk-script: var(--font-kk-script), "Snell Roundhand", cursive;
        --kk-display: var(--font-kk-display), "Trajan Pro", Georgia, serif;
        --kk-text: var(--font-kk-body), Georgia, "Times New Roman", serif;
        min-height: 100svh;
        overflow-x: clip;
        background: var(--kk-kelir);
        color: var(--kk-sogan);
        font-family: var(--kk-text);
        font-size: 1.0625rem;
        line-height: 1.65;
      }
      .kk-theme, .kk-theme *, .kk-theme *::before, .kk-theme *::after { box-sizing: border-box; }
      .kk-theme :is(h1, h2, h3, p, ol, ul, blockquote, figure, dl, dd) { margin: 0; }
      .kk-theme :is(ol, ul) { padding: 0; list-style: none; }
      .kk-theme :focus-visible { outline: 2px solid var(--kk-focus-ring); outline-offset: 3px; }
      .kk-theme .kk-script { font-family: var(--kk-script); font-weight: 400; line-height: 1; }
      .kk-theme .kk-eyebrow {
        font-family: var(--kk-display);
        font-size: .75rem;
        letter-spacing: .24em;
        line-height: 1.5;
        text-transform: uppercase;
        color: var(--kk-kencana-ink);
      }
      .kk-theme .kk-act { color: var(--kk-prada); }

      /* ---------- Gate and cover ---------- */
      .kk-gate {
        /* Bottom bar: 52px items plus its 2px prada rule. */
        --kk-nav-height: calc(3.25rem + 2px);
        --kk-nav-clearance: calc(var(--kk-nav-height) + env(safe-area-inset-bottom));
        min-height: 100svh;
      }
      .kk-cover {
        --kk-focus-ring: var(--kk-kencana);
        position: fixed;
        inset: 0;
        z-index: 60;
        overflow-x: hidden;
        overflow-y: auto;
        background: var(--kk-malam);
        color: var(--kk-kelir);
      }
      .kk-cover-frame {
        display: grid;
        width: min(100%, 34rem);
        min-height: 100svh;
        margin-inline: auto;
        padding: max(1.25rem, env(safe-area-inset-top)) clamp(1rem, 5vw, 2rem) max(1.5rem, env(safe-area-inset-bottom));
        align-content: center;
        gap: clamp(1rem, 3.5svh, 2rem);
        text-align: center;
      }
      .kk-stage {
        position: relative;
        width: 100%;
        aspect-ratio: 4 / 3.3;
        overflow: hidden;
        border-block: 6px solid var(--kk-prada);
        /* The blencong is the only light in the theatre. */
        background: radial-gradient(ellipse 62% 58% at 50% 40%, #fbf4e3 0%, var(--kk-kelir) 48%, var(--kk-kelir-deep) 100%);
      }
      .kk-blencong {
        position: absolute;
        top: .55rem;
        left: 50%;
        width: .5rem;
        height: .5rem;
        border-radius: 50%;
        background: var(--kk-kencana);
        transform: translateX(-50%);
      }
      .kk-stage .kk-stage-gunungan {
        position: absolute;
        bottom: -2px;
        left: 50%;
        width: 40%;
        color: var(--kk-sogan);
        transform: translateX(-50%);
        transition: transform 950ms cubic-bezier(.6, .05, .3, 1);
      }
      .kk-stage-figure {
        position: absolute;
        bottom: 0;
        width: 31%;
        transition: transform 900ms cubic-bezier(.3, .1, .2, 1) 350ms;
      }
      .kk-stage-left { left: -2%; }
      .kk-stage-right { right: -2%; }
      .kk-cover-copy { display: grid; gap: .65rem; justify-items: center; transition: opacity 350ms ease; }
      .kk-cover-intro { color: var(--kk-kencana) !important; }
      .kk-cover-names {
        display: flex;
        max-width: 100%;
        flex-wrap: wrap;
        justify-content: center;
        align-items: baseline;
        gap: 0 .2em;
        color: var(--kk-kencana);
        font-size: clamp(3.4rem, 15vw, 5.25rem);
        overflow-wrap: anywhere;
      }
      .kk-cover-names > span { min-width: 0; }
      .kk-cover-amp { font-size: .7em; }
      .kk-cover-date { font-size: 1.0625rem; color: rgba(242, 231, 208, .82); }
      .kk-cover-recipient {
        width: min(100%, 22rem);
        padding-block: .7rem;
        border-block: 1px solid rgba(192, 148, 53, .35);
      }
      .kk-cover-recipient p:first-child { font-size: .9rem; color: rgba(242, 231, 208, .72); }
      .kk-cover-guest-name {
        margin-top: .15rem !important;
        font-family: var(--kk-display);
        font-size: clamp(1.1rem, 4.5vw, 1.35rem);
        line-height: 1.25;
        overflow-wrap: anywhere;
      }
      .kk-cover-open {
        min-height: 3rem;
        padding: .8rem 1.6rem;
        border: 1px solid var(--kk-kencana);
        background: transparent;
        color: var(--kk-kencana);
        font-family: var(--kk-display);
        font-size: .8rem;
        letter-spacing: .22em;
        text-transform: uppercase;
        cursor: pointer;
        transition: background-color 200ms ease, color 200ms ease;
      }
      .kk-cover-open:hover { background: var(--kk-kencana); color: var(--kk-malam); }
      /* Dicabut: the gunungan leaves through the bottom of the screen, the two
         figures step toward the centre, then the theatre fades to the page. */
      .kk-gate[data-opened="true"] .kk-cover {
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
        transition: opacity 450ms ease 1350ms, visibility 0s 1800ms;
      }
      .kk-gate[data-opened="true"] .kk-stage .kk-stage-gunungan { transform: translate(-50%, 112%); }
      .kk-gate[data-opened="true"] .kk-stage-left { transform: translateX(32%); }
      .kk-gate[data-opened="true"] .kk-stage-right { transform: translateX(-32%); }
      .kk-gate[data-opened="true"] .kk-cover-copy { opacity: 0; }
      @media (max-height: 680px) {
        .kk-stage { aspect-ratio: 4 / 2.6; }
        .kk-cover-names { font-size: clamp(3rem, 12vw, 4rem); }
      }

      /* ---------- Figures and ornament ---------- */
      .kk-figure { display: block; }
      .kk-figure-shadow {
        background: var(--kk-sogan);
        opacity: .9;
        -webkit-mask: var(--kk-figure) center bottom / contain no-repeat;
        mask: var(--kk-figure) center bottom / contain no-repeat;
      }
      .kk-figure-colour { background: var(--kk-figure) center bottom / contain no-repeat; }
      .kk-gunungan { display: block; width: 100%; height: auto; }
      .kk-gunungan-hole { fill: var(--kk-hole); }
      .kk-gunungan-rim { stroke: var(--kk-hole); }
      .kk-rule {
        display: grid;
        width: 100%;
        grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
        align-items: center;
        gap: .75rem;
        color: var(--kk-kencana-ink);
      }
      .kk-rule::before, .kk-rule::after { content: ""; height: 1px; background: currentColor; opacity: .45; }
      .kk-rule .kk-gunungan { width: 1.15rem; }

      /* ---------- Content and sections ---------- */
      .kk-content { min-height: 100svh; padding-bottom: var(--kk-nav-clearance); outline: none; background: var(--kk-malam); }
      .kk-section { position: relative; }
      .kk-section-inner {
        display: grid;
        width: min(100%, 46rem);
        margin-inline: auto;
        padding: clamp(3.5rem, 10vw, 6.5rem) clamp(1.25rem, 6vw, 3rem);
        gap: clamp(1.75rem, 5vw, 2.75rem);
      }
      .kk-surface-kelir { background: var(--kk-kelir); }
      .kk-surface-kelir-deep { background: var(--kk-kelir-deep); }
      .kk-surface-malam {
        --kk-hole: var(--kk-malam);
        --kk-focus-ring: var(--kk-kencana);
        background: var(--kk-malam);
        color: var(--kk-kelir);
      }
      .kk-surface-malam .kk-eyebrow { color: var(--kk-kencana); }
      .kk-surface-malam .kk-act { color: var(--kk-kelir); }
      .kk-heading { display: grid; gap: .55rem; justify-items: center; text-align: center; }
      .kk-heading h2, .kk-countdown-heading h2 {
        font-family: var(--kk-display);
        font-size: clamp(1.9rem, 7vw, 2.7rem);
        font-weight: 400;
        line-height: 1.15;
        text-wrap: balance;
      }
      .kk-lede { max-width: 34rem; color: var(--kk-sogan-soft); }
      .kk-surface-malam .kk-lede { color: rgba(242, 231, 208, .78); }
      .kk-text-link {
        justify-self: start;
        padding-bottom: .1rem;
        border-bottom: 1px solid var(--kk-kencana-ink);
        color: inherit;
        font-family: var(--kk-display);
        font-size: .78rem;
        letter-spacing: .18em;
        text-decoration: none;
        text-transform: uppercase;
      }
      .kk-button {
        justify-self: center;
        min-height: 2.875rem;
        padding: .7rem 1.4rem;
        border: 1px solid currentColor;
        background: transparent;
        color: inherit;
        font-family: var(--kk-display);
        font-size: .8rem;
        letter-spacing: .2em;
        text-transform: uppercase;
        cursor: pointer;
      }
      .kk-button-solid { border-color: var(--kk-prada); background: var(--kk-prada); color: var(--kk-kelir); }
      .kk-button:disabled { opacity: .55; cursor: not-allowed; }

      /* Hero (Talu) */
      .kk-hero-layout { display: grid; gap: clamp(1.75rem, 6vw, 3rem); justify-items: center; }
      .kk-hero-copy { display: grid; gap: .75rem; justify-items: center; text-align: center; }
      .kk-hero-copy h2 { font-size: clamp(3.4rem, 15vw, 6.25rem); overflow-wrap: anywhere; }
      .kk-hero-meta { color: var(--kk-sogan-soft); }
      .kk-hero-message { max-width: 32rem; }
      .kk-hero-guest { font-family: var(--kk-display); font-size: 1.0625rem; color: var(--kk-prada); }
      .kk-hero-arch {
        position: relative;
        width: min(80%, 22rem);
        padding: 3px;
        clip-path: ${KAYON_ARCH};
        background: var(--kk-kencana-ink);
      }
      .kk-hero-arch .kk-media { clip-path: ${KAYON_ARCH}; }
      .kk-hero-text-only .kk-rule { width: min(100%, 18rem); }
      .kk-hero-text-only .kk-rule .kk-gunungan { width: 3.5rem; }
      @media (min-width: 900px) {
        .kk-hero .kk-section-inner { width: min(100%, 64rem); }
        .kk-hero-photo .kk-hero-layout { grid-template-columns: minmax(0, 1.1fr) minmax(0, .9fr); align-items: center; }
      }

      /* Quote */
      .kk-quote .kk-section-inner { justify-items: center; }
      .kk-quote blockquote {
        max-width: 34rem;
        font-size: clamp(1.15rem, 3.6vw, 1.35rem);
        font-style: italic;
        line-height: 1.6;
        text-align: center;
        white-space: pre-line;
      }

      /* Couple (Jejer) */
      .kk-people { display: grid; gap: clamp(1.75rem, 5vw, 2.5rem); }
      .kk-person-wrap { display: grid; gap: clamp(1.75rem, 5vw, 2.5rem); }
      .kk-person { display: grid; gap: .9rem; justify-items: center; text-align: center; }
      .kk-person-portrait-row {
        display: grid;
        width: 100%;
        grid-template-columns: minmax(0, 1fr) minmax(0, 10.5rem) minmax(0, 1fr);
        align-items: end;
        gap: clamp(.4rem, 2vw, 1rem);
      }
      .kk-person-portrait-row > * { grid-row: 1; }
      .kk-person-portrait, .kk-person-monogram {
        grid-column: 2;
        width: 100%;
        aspect-ratio: 3 / 4;
        border-radius: 50% / 40%;
        outline: 1px solid var(--kk-kencana-ink);
        outline-offset: 6px;
        overflow: hidden;
      }
      .kk-person-monogram {
        display: grid;
        place-items: center;
        background: var(--kk-kelir-deep);
        color: var(--kk-kencana-ink);
        font-family: var(--kk-script);
        font-size: 4.5rem;
      }
      .kk-person-figure { height: 82%; max-height: 11rem; opacity: .3; }
      .kk-person[data-figure-side="left"] .kk-person-figure { grid-column: 1; justify-self: end; }
      .kk-person[data-figure-side="right"] .kk-person-figure { grid-column: 3; justify-self: start; }
      .kk-person-copy { display: grid; gap: .4rem; justify-items: center; }
      .kk-person-copy h3 { font-size: clamp(2.6rem, 11vw, 3.4rem); color: var(--kk-sogan); overflow-wrap: anywhere; }
      .kk-parents { color: var(--kk-sogan-soft); }
      .kk-person-bio { max-width: 30rem; color: var(--kk-sogan-soft); }
      .kk-instagram { color: var(--kk-prada); font-family: var(--kk-display); letter-spacing: .06em; text-decoration: none; }
      .kk-instagram:hover { text-decoration: underline; }

      /* Events: a pagelaran programme */
      .kk-programme { border-top: 1px solid var(--kk-line); }
      .kk-programme-item {
        display: grid;
        grid-template-columns: 5.25rem minmax(0, 1fr);
        gap: 1rem;
        padding-block: 1.25rem;
        border-bottom: 1px solid var(--kk-line);
      }
      .kk-programme-time { display: grid; align-content: start; gap: .2rem; }
      .kk-programme-start {
        font-family: var(--kk-display);
        font-size: 1.6rem;
        line-height: 1;
        font-variant-numeric: tabular-nums;
      }
      .kk-programme-zone {
        font-family: var(--kk-display);
        font-size: .7rem;
        letter-spacing: .14em;
        text-transform: uppercase;
        color: var(--kk-kencana-ink);
      }
      .kk-programme-body { display: grid; gap: .3rem; min-width: 0; }
      .kk-programme-body h3 {
        font-family: var(--kk-display);
        font-size: 1.15rem;
        font-weight: 400;
        letter-spacing: .12em;
        line-height: 1.3;
        text-transform: uppercase;
        color: var(--kk-prada);
        overflow-wrap: anywhere;
      }
      .kk-programme-body time, .kk-programme-address { color: var(--kk-sogan-soft); }
      .kk-programme-venue { font-weight: 600; overflow-wrap: anywhere; }
      .kk-programme-address { overflow-wrap: anywhere; }
      .kk-programme-body .kk-text-link { margin-top: .35rem; }

      /* Countdown */
      .kk-countdown .kk-section-inner { justify-items: center; text-align: center; }
      .kk-countdown-heading { display: grid; gap: .55rem; }
      .kk-countdown-board { display: grid; width: min(100%, 30rem); gap: 1.5rem; }
      .kk-countdown-units {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        padding-block: 1rem;
        border-block: 1px solid rgba(192, 148, 53, .4);
      }
      .kk-countdown-units > div { display: flex; flex-direction: column; gap: .25rem; }
      .kk-countdown-units dd {
        font-family: var(--kk-display);
        font-size: clamp(2rem, 9vw, 2.75rem);
        line-height: 1;
        font-variant-numeric: tabular-nums;
      }
      .kk-countdown-units dt {
        font-family: var(--kk-display);
        font-size: .7rem;
        letter-spacing: .2em;
        text-transform: uppercase;
        color: var(--kk-kencana);
      }
      .kk-calendar-actions { display: flex; flex-wrap: wrap; justify-content: center; gap: .75rem; }
      .kk-calendar-actions :is(a, button) {
        display: inline-flex;
        min-height: 2.875rem;
        align-items: center;
        gap: .4rem;
        padding: .6rem 1.1rem;
        border: 1px solid var(--kk-kencana);
        background: transparent;
        color: var(--kk-kelir);
        font-family: var(--kk-display);
        font-size: .75rem;
        letter-spacing: .16em;
        text-decoration: none;
        text-transform: uppercase;
        cursor: pointer;
      }

      /* Dress code */
      .kk-dress-description { text-align: center; }
      .kk-dress-groups { display: grid; gap: 1.5rem; }
      .kk-dress-group { display: grid; gap: .6rem; }
      .kk-dress-group h3 { font-family: var(--kk-display); font-size: 1rem; font-weight: 400; letter-spacing: .14em; text-transform: uppercase; }
      .kk-dress-group ul { display: flex; flex-wrap: wrap; gap: .75rem 1.25rem; }
      .kk-dress-group li { display: flex; align-items: center; gap: .5rem; font-size: .95rem; }
      .kk-dress-swatch { width: 1.75rem; height: 1.75rem; border: 1px solid var(--kk-line); }

      /* Story: a timeline with prada diamonds */
      .kk-theme .kk-story-list { display: grid; gap: 1.75rem; padding-left: 1.5rem; border-left: 1px solid rgba(132, 96, 29, .5); }
      .kk-story-entry { position: relative; display: grid; gap: .9rem; }
      .kk-story-entry::before {
        content: "";
        position: absolute;
        top: .4rem;
        left: calc(-1.5rem - 5px);
        width: 9px;
        height: 9px;
        background: var(--kk-prada);
        transform: rotate(45deg);
      }
      .kk-story-copy { display: grid; gap: .3rem; }
      .kk-story-date {
        font-family: var(--kk-display);
        font-size: .78rem;
        letter-spacing: .18em;
        text-transform: uppercase;
        color: var(--kk-kencana-ink);
      }
      .kk-story-copy h3 { font-family: var(--kk-display); font-size: 1.3rem; font-weight: 400; }
      .kk-story-description { color: var(--kk-sogan-soft); }

      /* Gallery mosaic */
      .kk-gallery-mosaic { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: .4rem; }
      .kk-gallery-item { min-width: 0; }
      .kk-gallery-span-12 { grid-column: span 12; }
      .kk-gallery-span-7 { grid-column: span 7; }
      .kk-gallery-span-5 { grid-column: span 5; }
      .kk-gallery-item figcaption { margin-top: .35rem; font-size: .9rem; color: var(--kk-sogan-soft); }
      .kk-gallery .kk-section-inner { width: min(100%, 64rem); }

      /* Media */
      .kk-media { position: relative; width: 100%; overflow: hidden; background: var(--kk-kelir-deep); }
      .kk-media img { object-fit: cover; }
      .kk-image-fallback {
        display: grid;
        height: 100%;
        place-content: center;
        justify-items: center;
        gap: .5rem;
        padding: 1rem;
        color: var(--kk-kencana-ink);
        font-size: .85rem;
        text-align: center;
      }
      .kk-image-fallback .kk-gunungan { width: 2.25rem; }

      /* Livestream */
      .kk-livestream-list { border-top: 1px solid rgba(192, 148, 53, .35); }
      .kk-livestream-list a {
        display: flex;
        min-height: 3.25rem;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        padding-block: .9rem;
        border-bottom: 1px solid rgba(192, 148, 53, .35);
        color: var(--kk-kelir);
        font-family: var(--kk-display);
        letter-spacing: .08em;
        text-decoration: none;
      }

      /* Forms (RSVP and wishes) */
      .kk-form { display: grid; width: min(100%, 32rem); margin-inline: auto; gap: 1.25rem; }
      .kk-form-field { display: grid; gap: .3rem; }
      .kk-form-field label, .kk-attendance legend {
        font-family: var(--kk-display);
        font-size: .75rem;
        letter-spacing: .18em;
        text-transform: uppercase;
        color: var(--kk-kencana-ink);
      }
      .kk-form-control {
        width: 100%;
        padding: .55rem 0;
        border: 0;
        border-bottom: 1px solid var(--kk-sogan-soft);
        border-radius: 0;
        background: transparent;
        color: var(--kk-sogan);
        font: inherit;
      }
      .kk-form-control:focus-visible { outline: none; border-bottom: 2px solid var(--kk-prada); }
      .kk-form-textarea { resize: vertical; min-height: 6.5rem; }
      .kk-form-recipient { display: grid; gap: .2rem; text-align: center; }
      .kk-form-recipient strong { font-family: var(--kk-display); font-size: 1.2rem; font-weight: 400; overflow-wrap: anywhere; }
      .kk-attendance { margin: 0; padding: 0; border: 0; display: grid; gap: .5rem; }
      .kk-attendance-choices { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); border: 1px solid var(--kk-sogan-soft); }
      .kk-attendance-choice {
        min-height: 3rem;
        border: 0;
        background: transparent;
        color: var(--kk-sogan);
        font-family: var(--kk-display);
        font-size: .82rem;
        letter-spacing: .14em;
        text-transform: uppercase;
        cursor: pointer;
      }
      .kk-attendance-choice + .kk-attendance-choice { border-left: 1px solid var(--kk-sogan-soft); }
      .kk-attendance-choice[aria-pressed="true"] { background: var(--kk-sogan); color: var(--kk-kelir); }
      .kk-form-error { color: var(--kk-prada); font-weight: 600; }
      .kk-form-success {
        display: grid;
        gap: .3rem;
        width: min(100%, 32rem);
        margin-inline: auto;
        padding: 1.25rem;
        border-top: 2px solid var(--kk-prada);
        background: var(--kk-kelir-deep);
        text-align: center;
      }
      .kk-form-success strong { font-family: var(--kk-display); font-size: 1.25rem; font-weight: 400; }

      /* Wishes */
      .kk-wishes-ledger { display: grid; gap: 1.25rem; }
      .kk-wishes-list { display: grid; gap: 1.1rem; }
      .kk-wish { padding: .15rem 0 .15rem 1rem; border-left: 2px solid var(--kk-prada); }
      .kk-wish-meta { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: .25rem 1rem; }
      .kk-wish-meta strong { font-family: var(--kk-display); font-size: 1.1rem; font-weight: 400; overflow-wrap: anywhere; }
      .kk-wish-meta time { font-size: .85rem; color: var(--kk-sogan-soft); }
      .kk-wish p { color: var(--kk-sogan-soft); overflow-wrap: anywhere; white-space: pre-line; }
      .kk-wishes-empty { text-align: center; color: var(--kk-sogan-soft); }

      /* Gift: a slip of shaded kelir with a tumpal edge */
      .kk-gift-list { display: grid; gap: 2rem; }
      .kk-gift-slip {
        position: relative;
        display: grid;
        gap: .35rem;
        padding: 1.4rem 1.25rem 1.25rem;
        background: var(--kk-kelir-deep);
      }
      .kk-gift-slip::before {
        content: "";
        position: absolute;
        top: -10px;
        right: 0;
        left: 0;
        height: 10px;
        background:
          linear-gradient(45deg, var(--kk-kelir-deep) 50%, transparent 50%) 0 0 / 12px 10px repeat-x,
          linear-gradient(-45deg, var(--kk-kelir-deep) 50%, transparent 50%) 0 0 / 12px 10px repeat-x;
      }
      .kk-gift-provider {
        font-family: var(--kk-display);
        font-size: .8rem;
        letter-spacing: .2em;
        text-transform: uppercase;
        color: var(--kk-prada);
      }
      .kk-gift-number {
        font-family: var(--kk-display);
        font-size: clamp(1.35rem, 6vw, 1.7rem);
        letter-spacing: .04em;
        font-variant-numeric: tabular-nums;
        overflow-wrap: anywhere;
      }
      .kk-gift-owner { color: var(--kk-sogan-soft); overflow-wrap: anywhere; }
      .kk-gift-slip .kk-button { justify-self: start; margin-top: .5rem; }
      .kk-gift-copy-status { font-size: .85rem; color: var(--kk-sogan-soft); }
      .kk-gift-copy-status:empty { display: none; }

      /* Closing: tancep kayon */
      .kk-closing .kk-section-inner { justify-items: center; text-align: center; gap: 1.25rem; }
      .kk-closing-image { width: min(100%, 36rem); outline: 1px solid rgba(192, 148, 53, .5); outline-offset: 6px; }
      .kk-closing-tableau {
        display: grid;
        width: min(100%, 22rem);
        grid-template-columns: minmax(0, 1fr) 4.75rem minmax(0, 1fr);
        align-items: end;
        gap: .4rem;
        color: var(--kk-kencana);
      }
      .kk-closing-message { max-width: 32rem; color: rgba(242, 231, 208, .82); }
      .kk-closing h2 { font-size: clamp(2.8rem, 12vw, 4.5rem); color: var(--kk-kencana); overflow-wrap: anywhere; }

      /* ---------- Navigation ---------- */
      .kk-route-nav {
        position: fixed;
        right: 0;
        bottom: 0;
        left: 0;
        z-index: 40;
        padding-bottom: env(safe-area-inset-bottom);
        border-top: 2px solid var(--kk-prada);
        background: var(--kk-malam);
        color: rgba(242, 231, 208, .74);
      }
      .kk-route-nav ul { display: flex; margin: 0; padding: 0; list-style: none; overflow-x: auto; overscroll-behavior-x: contain; scroll-snap-type: x proximity; scrollbar-width: none; }
      .kk-route-nav ul::-webkit-scrollbar { display: none; }
      .kk-route-nav li { flex: 1 0 20%; min-width: 0; scroll-snap-align: start; }
      .kk-route-nav li:nth-last-child(n + 6), .kk-route-nav li:nth-last-child(n + 6) ~ li { flex-basis: calc(100% / 5.4); }
      .kk-route-nav a {
        position: relative;
        display: flex;
        min-height: 3.25rem;
        padding: .4rem .2rem;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: .2rem;
        color: inherit;
        font-family: var(--kk-display);
        font-size: clamp(11px, 3vw, 12px);
        letter-spacing: .04em;
        line-height: 1.1;
        text-decoration: none;
      }
      .kk-route-glyph { width: clamp(18px, 5.2vw, 22px); height: clamp(18px, 5.2vw, 22px); }
      .kk-route-glyph .kk-nav-accent { stroke: var(--kk-kencana); }
      .kk-route-label { max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .kk-route-nav a[aria-current="location"] { color: var(--kk-kencana); }
      .kk-route-nav a[aria-current="location"] .kk-nav-accent { stroke: var(--kk-kelir); }
      .kk-route-nav a[aria-current="location"]::before {
        content: "";
        position: absolute;
        top: 0;
        left: 50%;
        border: 5px solid transparent;
        border-top-color: var(--kk-prada);
        transform: translateX(-50%);
      }
      .kk-route-nav a:focus-visible { outline: 2px solid var(--kk-kencana); outline-offset: -3px; }
      @media (min-width: 768px) {
        .kk-route-nav {
          right: 50%;
          left: auto;
          bottom: max(1rem, env(safe-area-inset-bottom));
          width: min(calc(100% - 2rem), 56rem);
          padding-bottom: 0;
          transform: translateX(50%);
        }
        .kk-route-nav li, .kk-route-nav li:nth-last-child(n + 6), .kk-route-nav li:nth-last-child(n + 6) ~ li { flex: 1 1 0; }
        .kk-content { padding-bottom: calc(var(--kk-nav-height) + 1rem); }
      }
      .kk-music {
        position: fixed;
        right: max(.75rem, env(safe-area-inset-right));
        bottom: calc(var(--kk-nav-clearance) + .75rem);
        z-index: 41;
        display: grid;
        width: 2.75rem;
        height: 2.75rem;
        place-items: center;
        border: 1px solid var(--kk-kencana);
        background: var(--kk-malam);
        color: var(--kk-kencana);
        cursor: pointer;
      }
      .kk-music svg { width: 1.1rem; height: 1.1rem; fill: currentColor; }
      @media (min-width: 768px) {
        .kk-music { bottom: calc(var(--kk-nav-height) + 2rem); }
      }

      /* ---------- Reduced motion ---------- */
      .kk-gate[data-reduced-motion="true"] :is(.kk-cover, .kk-cover-copy, .kk-stage-gunungan, .kk-stage-figure) { transition: none; }
      @media (prefers-reduced-motion: reduce) {
        .kk-theme, .kk-theme *, .kk-theme *::before, .kk-theme *::after {
          animation: none !important;
          scroll-behavior: auto !important;
          transition: none !important;
        }
      }

      /* Gallery lightbox (shared behaviour: themes/shared/GalleryLightbox). */
      .kk-theme .kk-gallery-zoom { display: block; width: 100%; height: 100%; padding: 0; border: 0; background: none; color: inherit; text-align: inherit; cursor: zoom-in; }
      .kk-theme .kk-gallery-zoom:focus-visible { outline: 2px solid var(--kk-prada); outline-offset: 3px; }
      .kk-theme .kk-lightbox { width: 100vw; max-width: 100vw; height: 100svh; max-height: 100svh; margin: 0; padding: 0; border: 0; background: transparent; color: var(--kk-kelir); }
      .kk-theme .kk-lightbox::backdrop { background: rgba(28, 21, 16, .95); }
      .kk-theme .kk-lightbox-body { display: flex; height: 100%; flex-direction: column; padding: max(1rem, env(safe-area-inset-top)) clamp(1rem, 5vw, 3rem) max(1rem, env(safe-area-inset-bottom)); pointer-events: none; }
      .kk-theme .kk-lightbox-frame { position: relative; flex: 1; min-height: 0; }
      .kk-theme .kk-lightbox-frame > * { position: absolute; inset: 0; background: transparent; }
      .kk-theme .kk-lightbox-frame img { object-fit: contain; }
      .kk-theme .kk-lightbox-bar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: .75rem; padding-top: 1rem; pointer-events: auto; }
      .kk-theme .kk-lightbox-caption { margin: 0; font-size: .9rem; overflow-wrap: anywhere; }
      .kk-theme .kk-lightbox-btn { min-width: 44px; min-height: 44px; padding: 0 1rem; border: 1px solid rgba(192, 148, 53, .6); background: transparent; color: var(--kk-kelir); font-family: var(--kk-display); letter-spacing: .1em; cursor: pointer; }
      .kk-theme .kk-lightbox-btn:focus-visible { outline: 2px solid var(--kk-kencana); outline-offset: 3px; }
    `}</style>
  );
}
