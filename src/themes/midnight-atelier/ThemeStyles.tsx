import { MIDNIGHT_ATELIER_TOKENS } from "./tokens";

export function ThemeStyles() {
  const { colors } = MIDNIGHT_ATELIER_TOKENS;

  return (
    <style>{`
      .ma-theme {
        --ma-ink: ${colors.ink};
        --ma-lacquer: ${colors.lacquer};
        --ma-oxblood: ${colors.oxblood};
        --ma-champagne: ${colors.champagne};
        --ma-pearl: ${colors.pearl};
        --ma-smoke: ${colors.smoke};
        --ma-smoke-ink: ${colors.smokeInk};
        /* Light, used sparingly: the heading spotlight and picture lights. */
        --ma-light: rgba(216, 192, 138, .16);
        --ma-light-strong: rgba(216, 192, 138, .32);
        /* Resting opacity of a heading before its spotlight comes up. */
        --ma-dim: .55;
        /* 52px items + 2x4px list padding + 2x1px border. */
        --ma-nav-height: 62px;
        --ma-nav-offset: max(12px, env(safe-area-inset-bottom));
        min-height: 100svh;
        overflow-x: clip;
        background: var(--ma-ink);
        color: var(--ma-pearl);
        --ma-script: var(--font-ma-script), "Snell Roundhand", cursive;
        --ma-display: var(--font-ma-display), Didot, Georgia, serif;
        --ma-body: var(--font-ma-text), Futura, "Century Gothic", Arial, sans-serif;
        font-family: var(--ma-body);
        font-size: 1.0625rem;
      }
      .ma-theme, .ma-theme *, .ma-theme *::before, .ma-theme *::after { box-sizing: border-box; }
      .ma-gate { min-height: 100svh; }
      .ma-cover {
        position: fixed;
        z-index: 50;
        inset: 0;
        overflow-x: clip;
        overflow-y: auto;
        background: var(--ma-ink);
        color: var(--ma-pearl);
      }
      .ma-cover-frame {
        position: relative;
        z-index: 3;
        display: grid;
        width: min(100%, 96rem);
        min-height: 100svh;
        margin-inline: auto;
        padding: clamp(1.25rem, 4vw, 3.5rem);
        transition: opacity .32s ease, transform .58s cubic-bezier(.22, .61, .36, 1);
      }
      .ma-cover-masthead {
        display: flex;
        justify-content: space-between;
        gap: 2rem;
        align-self: start;
        border-bottom: 1px solid var(--ma-champagne);
        padding-bottom: .8rem;
        color: var(--ma-smoke-ink);
        font-size: .75rem;
        letter-spacing: .08em;
      }
      .ma-cover-stage { align-self: center; min-width: 0; text-align: center; }
      .ma-cover-intro { margin: 0 0 1.4rem; color: var(--ma-smoke-ink); font-size: .9rem; }
      .ma-cover-names {
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 0;
        margin: 0;
        font-size: clamp(4.25rem, 17vw, 10.5rem);
        line-height: 1.02;
        overflow-wrap: anywhere;
      }
      .ma-cover-amp {
        font-family: var(--ma-display);
        margin-block: .18em;
        color: var(--ma-champagne);
        font-size: .32em;
        font-style: italic;
        letter-spacing: 0;
        line-height: 1;
      }
      .ma-cover-stage time {
        display: inline-block;
        margin-top: clamp(1.75rem, 5vw, 3rem);
        color: var(--ma-champagne);
        font-size: .82rem;
        letter-spacing: .12em;
      }
      .ma-cover-recipient {
        align-self: end;
        min-width: 0;
        border-top: 1px solid var(--ma-champagne);
        padding-top: 1.25rem;
      }
      .ma-cover-recipient > p:first-child { margin: 0; color: var(--ma-smoke-ink); font-size: .78rem; }
      .ma-cover-guest-name {
        max-width: 34ch;
        margin: .4rem 0 1.4rem;
        font-family: var(--ma-display);
        font-size: clamp(1.25rem, 5vw, 2rem);
        line-height: 1.25;
        overflow-wrap: anywhere;
      }
      .ma-cover-open {
        display: inline-flex;
        min-width: min(100%, 18rem);
        min-height: 52px;
        align-items: center;
        justify-content: space-between;
        gap: 1.5rem;
        padding: .8rem 1rem;
        border: 1px solid var(--ma-champagne);
        border-radius: 0;
        background: var(--ma-pearl);
        color: var(--ma-ink);
        cursor: pointer;
        font: inherit;
      }
      .ma-cover-open span:last-child { color: var(--ma-oxblood); font-size: .75rem; }
      /* Champagne toast: the flutes clink (~.55s), a ring of light pulses and
         bubbles rise; the cover then fades (1000ms + 400ms). It is inert and
         stops taking taps the moment it opens. */
      .ma-gate[data-opened="true"] .ma-cover {
        opacity: 0; visibility: hidden; pointer-events: none;
        transition: opacity 400ms ease 1000ms, visibility 0s 1400ms;
      }
      .ma-gate[data-opened="true"] :is(.ma-cover-masthead, .ma-cover-recipient) { opacity: 0; transition: opacity .3s ease; }
      .ma-gate[data-opened="true"] .ma-cover-names { transform: translateY(-6px); transition: transform .8s cubic-bezier(.22, .61, .36, 1) .2s; }
      .ma-toast { display: block; width: clamp(120px, 34vw, 180px); height: auto; margin: clamp(1.5rem, 5vw, 2.5rem) auto 0; overflow: visible; color: var(--ma-champagne); }
      /* Short phones: a smaller toast keeps "Buka undangan" above the fold. */
      @media (max-height: 700px) { .ma-toast { width: clamp(84px, 24vw, 120px); margin-top: 1rem; } }
      .ma-toast .ma-flute path { stroke: currentColor; stroke-width: 1.2; }
      .ma-toast .ma-flute .ma-flute-wine { fill: rgba(216, 192, 138, .35); stroke: none; }
      .ma-flute { transform-box: view-box; }
      .ma-flute-left { transform-origin: 64px 108px; }
      .ma-flute-right { transform-origin: 96px 108px; }
      .ma-toast-ring { stroke: var(--ma-champagne); stroke-width: 1; opacity: 0; transform-box: fill-box; transform-origin: center; }
      .ma-toast-bubble { fill: var(--ma-champagne); opacity: 0; transform-box: fill-box; }
      .ma-gate[data-opened="true"] .ma-flute-left { animation: ma-clink-left .55s cubic-bezier(.3, 0, .2, 1) forwards; }
      .ma-gate[data-opened="true"] .ma-flute-right { animation: ma-clink-right .55s cubic-bezier(.3, 0, .2, 1) forwards; }
      .ma-gate[data-opened="true"] .ma-toast-ring { animation: ma-ring .6s ease-out .45s forwards; }
      .ma-gate[data-opened="true"] .ma-toast-bubble { animation: ma-bubble 1s ease-out forwards; }
      @keyframes ma-clink-left { 60% { transform: rotate(6deg); } 80% { transform: rotate(4.5deg); } 100% { transform: rotate(5deg); } }
      @keyframes ma-clink-right { 60% { transform: rotate(-6deg); } 80% { transform: rotate(-4.5deg); } 100% { transform: rotate(-5deg); } }
      @keyframes ma-ring { from { opacity: .9; transform: scale(.4); } to { opacity: 0; transform: scale(2.4); } }
      @keyframes ma-bubble { 0% { opacity: 0; transform: translate(0, 0); } 20% { opacity: .9; } 100% { opacity: 0; transform: translate(var(--ma-dx), var(--ma-dy)); } }
      .ma-content:focus { outline: none; }
      .ma-section { position: relative; min-height: 100svh; }
      .ma-section-inner {
        width: min(100%, 90rem);
        min-height: inherit;
        margin-inline: auto;
        padding: clamp(4.5rem, 12vw, 9rem) clamp(1.25rem, 6vw, 7rem);
      }
      .ma-surface-ink { background: var(--ma-ink); color: var(--ma-pearl); }
      .ma-surface-lacquer { background: var(--ma-lacquer); color: var(--ma-pearl); }
      .ma-surface-oxblood { background: var(--ma-oxblood); color: var(--ma-pearl); }
      .ma-surface-pearl { background: var(--ma-pearl); color: var(--ma-ink); }
      .ma-display {
        margin: 0;
        font-family: var(--ma-display);
        font-size: clamp(3.25rem, 12vw, 9rem);
        font-weight: 500;
        letter-spacing: -0.045em;
        line-height: 0.86;
      }
      /* Ballroom voices: Imperial Script for names, Bodoni italic for headings,
         Jost spaced capitals for labels. */
      .ma-theme :is(h2, h3, blockquote) { font-style: italic; }
      .ma-theme .ma-script { font-family: var(--ma-script); font-style: normal; font-weight: 400; letter-spacing: 0; }
      .ma-theme .ma-label { font-family: var(--ma-body); font-size: .75rem; font-style: normal; font-weight: 500; letter-spacing: .18em; text-transform: uppercase; }
      .ma-theme :is(.ma-cover-masthead, .ma-cover-intro, .ma-cover-recipient > p:first-child, .ma-chapter-heading p, .ma-interaction-heading > p, .ma-countdown-intro p, .ma-livestream-copy > p, .ma-event-type, .ma-countdown-units dt, .ma-gift-provider, .ma-parents p:first-child, .ma-dress-group h3, .ma-form-field > span, .ma-attendance legend, .ma-form-recipient > span) { font-family: var(--ma-body); font-style: normal; font-weight: 500; letter-spacing: .16em; text-transform: uppercase; }
      .ma-mark { display: inline-grid; width: 4rem; color: var(--ma-champagne); }
      .ma-mark svg { display: block; width: 100%; stroke: currentColor; stroke-width: 1; }
      .ma-media { position: relative; overflow: hidden; background: var(--ma-lacquer); }
      .ma-media img { object-fit: cover; }
      .ma-hero > .ma-section-inner { display: grid; width: 100%; max-width: none; padding: 0; align-content: start; }
      /* DESIGN.md 9: title block first, then the 3:4 portrait. */
      .ma-hero-image { width: 100%; aspect-ratio: 3 / 4; align-self: start; }
      .ma-hero-copy {
        position: relative;
        z-index: 1;
        min-width: 0;
        padding: clamp(2rem, 8vw, 6rem) clamp(1.25rem, 7vw, 6rem);
        background: var(--ma-oxblood);
      }
      .ma-hero-copy h2 {
        margin: 0;
        font-size: clamp(3.8rem, 15vw, 10rem);
        line-height: 1.05;
        overflow-wrap: anywhere;
        text-wrap: balance;
      }
      .ma-hero-copy p {
        max-width: 44ch;
        margin: clamp(2rem, 6vw, 4rem) 0 0;
        color: var(--ma-pearl);
        font-size: clamp(1.0625rem, 2vw, 1.25rem);
        line-height: 1.7;
        white-space: pre-line;
      }
      .ma-hero-text-only > .ma-section-inner {
        align-content: center;
        gap: clamp(3rem, 10vw, 7rem);
        padding: clamp(5rem, 14vw, 10rem) clamp(1.25rem, 8vw, 8rem);
      }
      .ma-hero-text-only .ma-hero-copy { padding: 0; background: transparent; }
      .ma-hero-text-only .ma-hero-mark { width: clamp(4rem, 10vw, 7rem); }
      .ma-quote { background: var(--ma-pearl); color: var(--ma-oxblood); }
      .ma-quote-inner {
        display: grid;
        width: min(100%, 76rem);
        margin-inline: auto;
        padding: clamp(5rem, 14vw, 10rem) clamp(1.25rem, 8vw, 8rem);
        gap: clamp(2rem, 7vw, 5rem);
        align-items: start;
      }
      .ma-quote .ma-mark { color: var(--ma-oxblood); }
      .ma-quote blockquote {
        max-width: 19ch;
        margin: 0;
        font-family: var(--ma-display);
        font-size: clamp(2.4rem, 8vw, 6rem);
        font-weight: 500;
        letter-spacing: -.035em;
        line-height: 1.02;
        overflow-wrap: anywhere;
      }
      .ma-couple > .ma-section-inner { display: grid; align-content: start; gap: clamp(4rem, 10vw, 8rem); }
      .ma-chapter-heading {
        display: grid;
        gap: .5rem;
        border-bottom: 1px solid var(--ma-oxblood);
        padding-bottom: 1.25rem;
      }
      .ma-chapter-heading p { margin: 0; color: var(--ma-oxblood); font-size: .78rem; letter-spacing: .08em; }
      .ma-chapter-heading h2 {
        margin: 0;
        font-family: var(--ma-display);
        font-size: clamp(3.25rem, 10vw, 7.5rem);
        font-weight: 500;
        letter-spacing: -.045em;
        line-height: .9;
      }
      .ma-people { display: grid; gap: clamp(5rem, 14vw, 10rem); min-width: 0; }
      .ma-person { display: grid; align-content: start; gap: clamp(1.75rem, 5vw, 3.5rem); min-width: 0; }
      .ma-person-portrait { width: 100%; }
      .ma-person-copy { min-width: 0; overflow-wrap: anywhere; }
      .ma-person-copy h3 {
        margin: 0;
        font-size: clamp(2.9rem, 9vw, 5.25rem);
        line-height: 1.1;
        text-wrap: balance;
      }
      .ma-parents {
        display: grid;
        gap: .45rem;
        max-width: 36rem;
        margin-top: 1.75rem;
        border-left: 2px solid var(--ma-oxblood);
        padding-left: 1rem;
      }
      .ma-parents p { margin: 0; }
      .ma-parents p:first-child { color: var(--ma-oxblood); font-size: .78rem; }
      .ma-parents p:last-child { font-family: var(--ma-display); font-size: 1.25rem; line-height: 1.4; }
      .ma-parent-join { color: var(--ma-oxblood); }
      .ma-person-bio { max-width: 52ch; margin: 1.75rem 0 0; line-height: 1.75; white-space: pre-line; }
      .ma-instagram {
        display: inline-flex;
        width: fit-content;
        align-items: center;
        margin-top: 1.25rem;
        border-bottom: 1px solid currentColor;
        color: var(--ma-oxblood);
        font-size: .86rem;
        text-decoration: none;
      }
      .ma-person-text-only { border-top: 1px solid var(--ma-oxblood); padding-top: clamp(2rem, 6vw, 4rem); }
      .ma-person-monogram {
        color: var(--ma-oxblood);
        font-family: var(--ma-display);
        font-size: clamp(7rem, 28vw, 16rem);
        line-height: .65;
      }
      .ma-events > .ma-section-inner { display: grid; align-content: start; gap: clamp(3rem, 9vw, 6rem); }
      .ma-chapter-heading-dark { border-color: var(--ma-champagne); }
      .ma-chapter-heading-dark p { color: var(--ma-champagne); }
      .ma-event-list { display: grid; margin: 0; padding: 0; list-style: none; }
      .ma-event {
        display: grid;
        min-width: 0;
        gap: 1.5rem;
        border-top: 1px solid color-mix(in srgb, var(--ma-champagne) 58%, transparent);
        padding-block: clamp(2rem, 6vw, 4rem);
        overflow-wrap: anywhere;
      }
      .ma-event:last-child { border-bottom: 1px solid color-mix(in srgb, var(--ma-champagne) 58%, transparent); }
      .ma-event-index { color: var(--ma-champagne); font-family: var(--ma-display); font-size: 1.3rem; }
      .ma-event-main, .ma-event-place { min-width: 0; }
      .ma-event-type { margin: 0 0 .75rem; color: var(--ma-champagne); font-size: .75rem; letter-spacing: .08em; }
      .ma-event-main h3 {
        max-width: 15ch;
        margin: 0;
        font-family: var(--ma-display);
        font-size: clamp(2.4rem, 8vw, 5rem);
        font-weight: 500;
        letter-spacing: -.04em;
        line-height: .9;
      }
      .ma-event-main time { display: block; margin-top: 1.5rem; color: var(--ma-smoke-ink); line-height: 1.55; }
      .ma-event-time { margin: .35rem 0 0; color: var(--ma-smoke-ink); font-variant-numeric: tabular-nums; }
      .ma-event-venue { margin: 0; font-family: var(--ma-display); font-size: clamp(1.5rem, 4vw, 2rem); line-height: 1.15; }
      .ma-event-address { max-width: 42ch; margin: .8rem 0 0; color: var(--ma-smoke-ink); line-height: 1.65; }
      .ma-event-actions {
        display: flex;
        min-height: 48px;
        flex-wrap: wrap;
        gap: .75rem 1.25rem;
        margin-top: 1.5rem;
      }
      .ma-event-actions > a, .ma-calendar-actions :is(a, button) {
        display: inline-flex;
        min-height: 48px;
        align-items: center;
        gap: .7rem;
        border: 0;
        border-bottom: 1px solid var(--ma-champagne);
        border-radius: 0;
        background: transparent;
        color: var(--ma-pearl);
        cursor: pointer;
        font: inherit;
        font-size: .78rem;
        text-decoration: none;
      }
      .ma-calendar-actions { display: flex; flex-wrap: wrap; gap: .75rem 1.25rem; }
      .ma-countdown > .ma-section-inner {
        display: grid;
        align-content: center;
        gap: clamp(3.5rem, 10vw, 7rem);
      }
      .ma-countdown-intro { min-width: 0; }
      .ma-countdown-intro p { margin: 0 0 .7rem; color: var(--ma-champagne); font-size: .78rem; letter-spacing: .08em; }
      .ma-countdown-intro h2 {
        max-width: 9ch;
        margin: 0;
        font-family: var(--ma-display);
        font-size: clamp(3.2rem, 11vw, 8rem);
        font-weight: 500;
        letter-spacing: -.05em;
        line-height: .85;
        overflow-wrap: anywhere;
      }
      .ma-countdown-units { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); margin: 0; border-top: 1px solid var(--ma-champagne); }
      .ma-countdown-units > div { min-width: 0; border-bottom: 1px solid var(--ma-champagne); padding: 1.25rem 0; }
      .ma-countdown-units > div:nth-child(odd) { border-right: 1px solid var(--ma-champagne); padding-right: 1rem; }
      .ma-countdown-units > div:nth-child(even) { padding-left: 1rem; }
      .ma-countdown-units dd { margin: 0; font-family: var(--ma-display); font-size: clamp(2.8rem, 12vw, 6rem); line-height: .8; font-variant-numeric: tabular-nums; }
      .ma-countdown-units dt { margin-top: .75rem; color: var(--ma-champagne); font-size: .72rem; }
      .ma-countdown-body { display: grid; min-width: 0; align-content: end; gap: clamp(1.75rem, 5vw, 2.5rem); }
      .ma-countdown .ma-calendar-actions { gap: 0 1.5rem; }
      .ma-countdown .ma-calendar-actions :is(a, button) { flex: 1 1 9rem; justify-content: space-between; }
      .ma-countdown-calendar-only .ma-countdown-body { border-top: 1px solid var(--ma-champagne); padding-top: .5rem; }
      .ma-dress-code > .ma-section-inner { display: grid; align-content: start; gap: clamp(3rem, 8vw, 6rem); }
      .ma-dress-description { max-width: 25ch; margin: 0; font-family: var(--ma-display); font-size: clamp(1.8rem, 5vw, 3.5rem); line-height: 1.12; overflow-wrap: anywhere; }
      .ma-dress-groups { display: grid; gap: 2.5rem; }
      .ma-dress-group { border-top: 1px solid var(--ma-oxblood); padding-top: 1rem; }
      .ma-dress-group h3 { margin: 0 0 1.5rem; color: var(--ma-oxblood); font-size: .82rem; font-weight: 500; }
      .ma-dress-group ul { display: grid; gap: 1rem; margin: 0; padding: 0; list-style: none; }
      .ma-dress-group li { display: flex; min-width: 0; align-items: center; gap: 1rem; font-size: .8rem; font-variant-numeric: tabular-nums; overflow-wrap: anywhere; }
      .ma-dress-swatch { flex: 0 0 auto; width: 48px; height: 48px; border: 1px solid color-mix(in srgb, var(--ma-ink) 35%, transparent); }
      .ma-story > .ma-section-inner { display: grid; align-content: start; gap: clamp(3.5rem, 10vw, 7rem); }
      .ma-story-list { display: grid; margin: 0; padding: 0; list-style: none; }
      .ma-story-entry {
        display: grid;
        min-width: 0;
        grid-template-areas: "index" "copy" "image";
        gap: 1.5rem;
        border-top: 1px solid var(--ma-oxblood);
        padding-block: clamp(2.5rem, 8vw, 6rem);
      }
      .ma-story-entry:last-child { border-bottom: 1px solid var(--ma-oxblood); }
      .ma-story-index { grid-area: index; color: var(--ma-oxblood); font-family: var(--ma-display); font-size: 1.3rem; }
      .ma-story-copy { grid-area: copy; min-width: 0; overflow-wrap: anywhere; }
      .ma-story-date { display: block; margin: 0 0 .8rem; color: var(--ma-oxblood); font-size: .78rem; font-variant-numeric: tabular-nums; }
      .ma-story-copy h3 {
        max-width: 13ch;
        margin: 0;
        font-family: var(--ma-display);
        font-size: clamp(2.6rem, 8vw, 5.5rem);
        font-weight: 500;
        letter-spacing: -.045em;
        line-height: .9;
      }
      .ma-story-description { max-width: 58ch; margin: 1.5rem 0 0; line-height: 1.75; white-space: pre-line; }
      .ma-story-image { grid-area: image; width: 100%; align-self: start; }
      .ma-story-text-only { grid-template-areas: "index" "copy"; }
      .ma-gallery > .ma-section-inner { display: grid; align-content: start; gap: clamp(3.5rem, 10vw, 7rem); }
      .ma-gallery-grid {
        min-width: 0;
      }
      .ma-gallery-columns { margin-top: clamp(2rem, 5vw, 4rem); columns: 1; column-gap: clamp(1rem, 3vw, 2rem); }
      .ma-gallery-item { min-width: 0; margin: 0 0 clamp(2rem, 5vw, 4rem); break-inside: avoid; }
      .ma-gallery-anchor { margin-bottom: 0; }
      .ma-gallery-image { width: 100%; }
      .ma-gallery-item figcaption {
        display: flex;
        min-width: 0;
        gap: 1rem;
        margin-top: .9rem;
        color: var(--ma-smoke-ink);
        font-size: .78rem;
        line-height: 1.5;
        overflow-wrap: anywhere;
      }
      .ma-gallery-item figcaption span { flex: 0 0 auto; color: var(--ma-champagne); font-variant-numeric: tabular-nums; }
      .ma-rsvp > .ma-section-inner,
      .ma-wishes > .ma-section-inner,
      .ma-gift > .ma-section-inner {
        display: grid;
        align-content: start;
        gap: clamp(3.5rem, 9vw, 7rem);
      }
      .ma-interaction-heading { min-width: 0; }
      .ma-interaction-heading > p {
        margin: 0 0 .75rem;
        color: var(--ma-champagne);
        font-size: .76rem;
        letter-spacing: .12em;
        text-transform: uppercase;
      }
      .ma-interaction-heading h2 {
        max-width: 10ch;
        margin: 0;
        font-family: var(--ma-display);
        font-size: clamp(3.2rem, 10vw, 7.5rem);
        font-weight: 500;
        letter-spacing: -.05em;
        line-height: .86;
        overflow-wrap: anywhere;
      }
      .ma-interaction-heading > span {
        display: block;
        max-width: 42ch;
        margin-top: 1.5rem;
        color: var(--ma-smoke-ink);
        line-height: 1.7;
      }
      .ma-wishes .ma-interaction-heading > p,
      .ma-wishes .ma-interaction-heading > span { color: var(--ma-oxblood); }
      .ma-interaction-panel { min-width: 0; }
      .ma-form { display: grid; min-width: 0; gap: 2rem; }
      .ma-form-field { display: grid; min-width: 0; gap: .6rem; }
      .ma-form-field > span,
      .ma-attendance legend,
      .ma-form-recipient > span {
        color: var(--ma-champagne);
        font-size: .74rem;
        letter-spacing: .1em;
        text-transform: uppercase;
      }
      .ma-form-control {
        width: 100%;
        min-height: 48px;
        border: 0;
        border-bottom: 1px solid var(--ma-champagne);
        border-radius: 0;
        padding: .75rem 0;
        background: transparent;
        color: var(--ma-pearl);
        font: inherit;
        line-height: 1.5;
      }
      .ma-form-control::placeholder { color: var(--ma-smoke-ink); opacity: 1; }
      .ma-form-textarea { min-height: 9rem; resize: vertical; }
      .ma-form-recipient {
        display: grid;
        min-width: 0;
        gap: .65rem;
        border-bottom: 1px solid var(--ma-champagne);
        padding-bottom: 1.25rem;
      }
      .ma-form-recipient strong {
        font-family: var(--ma-display);
        font-size: clamp(1.7rem, 5vw, 2.6rem);
        font-weight: 500;
        line-height: 1.1;
        overflow-wrap: anywhere;
      }
      .ma-attendance { min-width: 0; margin: 0; border: 0; padding: 0; }
      .ma-attendance legend { margin-bottom: .8rem; padding: 0; }
      .ma-attendance-choices { display: grid; border-top: 1px solid var(--ma-champagne); }
      .ma-attendance-choice {
        display: flex;
        width: 100%;
        min-height: 64px;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        border: 0;
        border-bottom: 1px solid var(--ma-champagne);
        border-radius: 0;
        padding: 1rem 0;
        background: transparent;
        color: var(--ma-pearl);
        cursor: pointer;
        font: inherit;
        text-align: left;
      }
      .ma-attendance-choice[aria-pressed="true"] { color: var(--ma-champagne); }
      .ma-attendance-choice::after { content: "○"; flex: 0 0 auto; font-size: .72rem; }
      .ma-attendance-choice[data-selected="true"]::after { content: "●"; }
      .ma-form-submit {
        display: flex;
        width: 100%;
        min-height: 52px;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        border: 1px solid var(--ma-champagne);
        border-radius: 0;
        padding: .85rem 1rem;
        background: var(--ma-pearl);
        color: var(--ma-ink);
        cursor: pointer;
        font: inherit;
      }
      .ma-form-submit:disabled { cursor: not-allowed; opacity: .55; }
      .ma-form-error { margin: -1rem 0 0; color: var(--ma-pearl); line-height: 1.6; }
      .ma-form-success {
        min-width: 0;
        border-block: 1px solid var(--ma-champagne);
        padding-block: clamp(2rem, 6vw, 4rem);
        overflow-wrap: anywhere;
      }
      .ma-form-success p { margin: 0; font-family: var(--ma-display); font-size: clamp(2.5rem, 8vw, 5rem); line-height: .9; }
      .ma-form-success span { display: block; margin-top: 1.25rem; color: var(--ma-smoke-ink); line-height: 1.7; }
      .ma-form-success-dark { color: var(--ma-ink); font-family: var(--ma-display); font-size: clamp(1.8rem, 5vw, 3rem); line-height: 1.15; }
      .ma-form-dark .ma-form-field > span,
      .ma-form-dark .ma-form-recipient > span { color: var(--ma-oxblood); }
      .ma-form-dark .ma-form-control,
      .ma-form-dark .ma-form-recipient { border-color: var(--ma-oxblood); color: var(--ma-ink); }
      .ma-form-dark .ma-form-control::placeholder { color: color-mix(in srgb, var(--ma-ink) 70%, transparent); }
      .ma-form-dark .ma-form-submit { background: var(--ma-ink); color: var(--ma-pearl); }
      .ma-form-dark .ma-form-error { color: var(--ma-oxblood); }
      .ma-form .cf-turnstile { max-width: 100%; overflow: hidden; }
      .ma-wishes-compose { display: grid; align-content: start; gap: clamp(2.5rem, 7vw, 4.5rem); min-width: 0; }
      .ma-wishes-ledger { min-width: 0; }
      .ma-wishes-empty {
        margin: 0;
        border-block: 1px solid var(--ma-oxblood);
        padding-block: 2rem;
        font-family: var(--ma-display);
        font-size: clamp(1.6rem, 5vw, 2.8rem);
        line-height: 1.15;
      }
      .ma-wishes-list { margin: 0; padding: 0; border-top: 1px solid var(--ma-oxblood); list-style: none; }
      .ma-wish-entry {
        display: grid;
        min-width: 0;
        grid-template-columns: 2rem minmax(0, 1fr);
        gap: 1rem;
        border-bottom: 1px solid var(--ma-oxblood);
        padding-block: 1.5rem;
        overflow-wrap: anywhere;
      }
      .ma-wish-index { color: var(--ma-oxblood); font-size: .72rem; font-variant-numeric: tabular-nums; }
      .ma-wish-meta { display: flex; min-width: 0; flex-wrap: wrap; justify-content: space-between; gap: .35rem 1rem; }
      .ma-wish-meta strong { font-family: var(--ma-display); font-size: 1.25rem; font-weight: 500; }
      .ma-wish-meta time { color: var(--ma-oxblood); font-size: .72rem; }
      .ma-wish-entry p { margin: 1rem 0 0; line-height: 1.7; white-space: pre-line; }
      .ma-more-wishes {
        width: 100%;
        min-height: 52px;
        margin-top: 1.5rem;
        border: 1px solid var(--ma-oxblood);
        border-radius: 0;
        padding: .75rem 1rem;
        background: transparent;
        color: var(--ma-ink);
        cursor: pointer;
        font: inherit;
      }
      .ma-gift-list { margin: 0; padding: 0; border-top: 1px solid var(--ma-champagne); list-style: none; }
      .ma-gift-ledger {
        display: grid;
        min-width: 0;
        gap: 1.25rem;
        border-bottom: 1px solid var(--ma-champagne);
        padding-block: clamp(1.5rem, 5vw, 2.5rem);
        overflow-wrap: anywhere;
      }
      .ma-gift-index { color: var(--ma-champagne); font-size: .72rem; font-variant-numeric: tabular-nums; }
      .ma-gift-details { min-width: 0; }
      .ma-gift-provider { margin: 0 0 .75rem; color: var(--ma-smoke-ink); font-size: .76rem; letter-spacing: .08em; }
      .ma-gift-number { margin: 0; font-family: var(--ma-display); font-size: clamp(1.8rem, 6vw, 3.6rem); line-height: 1; }
      .ma-gift-owner { margin: .8rem 0 0; color: var(--ma-smoke-ink); line-height: 1.6; }
      .ma-gift-ledger button {
        min-height: 48px;
        width: fit-content;
        border: 1px solid var(--ma-champagne);
        border-radius: 0;
        padding: .75rem 1rem;
        background: transparent;
        color: var(--ma-pearl);
        cursor: pointer;
        font: inherit;
      }
      .ma-livestream > .ma-section-inner { display: grid; align-content: center; gap: clamp(3rem, 9vw, 7rem); }
      .ma-livestream-copy { min-width: 0; }
      .ma-livestream-copy > p { margin: 0 0 .7rem; color: var(--ma-champagne); font-size: .78rem; letter-spacing: .08em; }
      .ma-livestream-copy h2 { max-width: 9ch; margin: 0; font-family: var(--ma-display); font-size: clamp(3.2rem, 11vw, 8rem); font-weight: 500; letter-spacing: -.05em; line-height: .85; overflow-wrap: anywhere; }
      .ma-livestream-copy > span { display: block; max-width: 36ch; margin-top: 1.5rem; color: var(--ma-smoke-ink); line-height: 1.7; }
      .ma-livestream ul { margin: 0; padding: 0; border-top: 1px solid var(--ma-champagne); list-style: none; }
      .ma-livestream li { border-bottom: 1px solid var(--ma-champagne); }
      .ma-livestream a { display: flex; min-height: 64px; align-items: center; justify-content: space-between; gap: 2rem; color: var(--ma-pearl); text-decoration: none; overflow-wrap: anywhere; }
      .ma-closing > .ma-section-inner { display: grid; align-items: center; gap: clamp(3rem, 8vw, 7rem); }
      .ma-closing-copy { min-width: 0; overflow-wrap: anywhere; }
      .ma-closing-copy h2 {
        margin: clamp(2rem, 6vw, 4rem) 0 0;
        font-size: clamp(3.6rem, 12vw, 8.5rem);
        line-height: 1.05;
        text-wrap: balance;
      }
      .ma-closing-copy p { max-width: 46ch; margin: 2rem 0 0; color: var(--ma-smoke-ink); line-height: 1.75; white-space: pre-line; }
      .ma-closing-image { width: min(100%, 34rem); justify-self: end; }
      .ma-closing-text-only > .ma-section-inner { grid-template-columns: minmax(0, 1fr); }
      .ma-image-fallback {
        display: grid;
        width: 100%;
        height: 100%;
        place-items: center;
        align-content: center;
        gap: 1rem;
        color: var(--ma-smoke-ink);
        border: 1px solid var(--ma-smoke);
        font-size: 0.75rem;
        letter-spacing: 0.16em;
        text-transform: uppercase;
      }
      .ma-theme :is(a, button, input, textarea, select) { min-height: 48px; }
      .ma-theme :is(a, button, input, textarea, select):focus-visible {
        outline: 3px solid var(--ma-champagne);
        outline-offset: 4px;
      }
      /* Mobile bottom bar (DESIGN.md 12a); the 768px+ media query turns it into the side rail.
         Declared after the generic 48px control rule so the 52px item height wins. */
      .ma-nav {
        position: fixed;
        z-index: 30;
        right: max(12px, env(safe-area-inset-right));
        bottom: var(--ma-nav-offset);
        left: max(12px, env(safe-area-inset-left));
        background: var(--ma-pearl);
        color: var(--ma-ink);
        border: 1px solid var(--ma-champagne);
      }
      .ma-nav ul {
        display: flex;
        gap: 0;
        margin: 0;
        padding: 4px;
        list-style: none;
      }
      .ma-nav li { flex: 1 1 0; min-width: 0; }
      .ma-nav a {
        display: grid;
        width: 100%;
        min-width: 0;
        min-height: 52px;
        place-items: center;
        align-content: center;
        gap: 3px;
        padding: 4px 2px;
        color: inherit;
        text-decoration: none;
      }
      .ma-nav-icon {
        display: block;
        width: clamp(18px, 5.2vw, 22px);
        height: clamp(18px, 5.2vw, 22px);
        flex: none;
        color: var(--ma-oxblood);
      }
      .ma-nav-label {
        max-width: 100%;
        overflow: hidden;
        font-size: clamp(11px, 3vw, 12px);
        line-height: 1.2;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .ma-nav a[aria-current="location"] { background: var(--ma-ink); color: var(--ma-pearl); }
      .ma-nav a[aria-current="location"] .ma-nav-icon { color: var(--ma-champagne); }
      .ma-music {
        position: fixed;
        z-index: 31;
        right: max(12px, env(safe-area-inset-right));
        bottom: calc(var(--ma-nav-offset) + var(--ma-nav-height) + 12px);
        display: grid;
        width: 48px;
        min-height: 48px;
        place-items: center;
        border: 1px solid var(--ma-champagne);
        border-radius: 0;
        background: var(--ma-ink);
        color: var(--ma-champagne);
        cursor: pointer;
      }
      .ma-music svg { width: 1.1rem; fill: currentColor; }
      @media (max-width: 767px) {
        .ma-cover-frame { grid-template-rows: auto 1fr auto; gap: 2rem; }
        .ma-cover-masthead span:last-child { display: none; }
        .ma-cover-names { font-size: clamp(3.75rem, 19vw, 6.5rem); }
        .ma-content { padding-bottom: calc(var(--ma-nav-height) + var(--ma-nav-offset)); }
        .ma-hero-text-only .ma-hero-copy { min-height: calc(100svh - 62.5vw); margin-top: -1px; align-content: center; }
      }
      @media (min-width: 768px) {
        .ma-cover-frame {
          grid-template-columns: minmax(0, 1.5fr) minmax(18rem, .5fr);
          grid-template-rows: auto 1fr;
          column-gap: clamp(3rem, 8vw, 9rem);
        }
        .ma-cover-masthead { grid-column: 1 / -1; }
        .ma-cover-stage { align-self: center; text-align: left; }
        .ma-cover-names { align-items: flex-start; }
        .ma-cover-recipient { align-self: end; margin-bottom: 1rem; }
        .ma-hero:not(.ma-hero-text-only) > .ma-section-inner {
          grid-template-columns: repeat(12, minmax(0, 1fr));
          align-content: center;
          align-items: center;
          padding: clamp(3rem, 6vw, 6rem) clamp(8rem, 13vw, 12rem) clamp(3rem, 6vw, 6rem) 0;
        }
        .ma-hero:not(.ma-hero-text-only) .ma-hero-copy {
          grid-column: 1 / 8;
          grid-row: 1;
          margin-left: clamp(1.25rem, 5vw, 6rem);
          padding: clamp(2.5rem, 5vw, 5.5rem);
        }
        .ma-hero:not(.ma-hero-text-only) .ma-hero-copy h2 { font-size: clamp(3.8rem, 7.5vw, 8.5rem); }
        .ma-hero-image { grid-column: 7 / -1; grid-row: 1; }
        .ma-nav {
          top: 50%;
          right: max(1rem, env(safe-area-inset-right));
          bottom: auto;
          left: auto;
          width: auto;
          max-width: 10rem;
          transform: translateY(-50%);
        }
        .ma-nav ul { max-height: min(76vh, 38rem); flex-direction: column; padding: .3rem; overflow-x: hidden; overflow-y: auto; }
        .ma-nav li { flex: none; }
        .ma-nav a { grid-template-columns: 20px minmax(0, 1fr); min-width: 8.5rem; align-items: center; justify-items: start; column-gap: .65rem; padding: .35rem .7rem; text-align: left; }
        .ma-nav-icon { width: 20px; height: 20px; }
        .ma-music { top: max(1.25rem, env(safe-area-inset-top)); bottom: auto; }
        .ma-quote-inner { grid-template-columns: 5rem minmax(0, 1fr); }
        .ma-people { grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: start; gap: clamp(2.5rem, 6vw, 6rem); }
        .ma-person[data-position="right"] { margin-top: clamp(5rem, 11vw, 10rem); }
        .ma-person-text-only { min-height: 30rem; align-content: space-between; }
        .ma-events > .ma-section-inner { padding-right: clamp(8rem, 13vw, 12rem); }
        .ma-event { grid-template-columns: 3rem minmax(0, 1fr) minmax(15rem, .75fr); gap: clamp(1.5rem, 4vw, 4rem); }
        .ma-event-place { padding-top: 2rem; }
        .ma-countdown > .ma-section-inner { grid-template-columns: minmax(0, 1fr) minmax(24rem, 1fr); }
        .ma-countdown-units { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        .ma-countdown-body { align-self: end; }
        .ma-countdown .ma-calendar-actions { justify-content: flex-end; }
        .ma-countdown .ma-calendar-actions :is(a, button) { flex: 0 1 auto; }
        .ma-countdown-units > div { border-right: 1px solid var(--ma-champagne); padding: 1.25rem; }
        .ma-countdown-units > div:first-child { padding-left: 0; }
        .ma-countdown-units > div:last-child { border-right: 0; padding-right: 0; }
        .ma-dress-groups { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .ma-story > .ma-section-inner, .ma-gallery > .ma-section-inner { padding-right: clamp(8rem, 13vw, 12rem); }
        .ma-story-entry {
          grid-template-columns: 3rem minmax(16rem, .75fr) minmax(0, 1.25fr);
          grid-template-areas: "index copy image";
          align-items: start;
          gap: clamp(1.5rem, 4vw, 4rem);
        }
        .ma-story-entry[data-layout="image-left"] {
          grid-template-columns: 3rem minmax(0, 1.25fr) minmax(16rem, .75fr);
          grid-template-areas: "index image copy";
        }
        .ma-story-text-only, .ma-story-text-only[data-layout="image-left"] {
          grid-template-columns: 3rem minmax(0, 1fr);
          grid-template-areas: "index copy";
        }
        .ma-story-text-only .ma-story-copy { max-width: 52rem; }
        .ma-gallery-columns { columns: 2; }
        .ma-livestream > .ma-section-inner { grid-template-columns: minmax(0, 1fr) minmax(20rem, .8fr); }
        .ma-rsvp > .ma-section-inner { grid-template-columns: minmax(0, 1fr) minmax(22rem, .8fr); align-items: start; }
        .ma-wishes > .ma-section-inner { grid-template-columns: minmax(20rem, .8fr) minmax(0, 1.2fr); align-items: start; }
        .ma-gift > .ma-section-inner { padding-right: clamp(8rem, 13vw, 12rem); }
        .ma-gift-ledger { grid-template-columns: 2.5rem minmax(0, 1fr) auto; align-items: center; gap: clamp(1.25rem, 4vw, 4rem); }
        .ma-closing > .ma-section-inner { grid-template-columns: minmax(0, 1.1fr) minmax(18rem, .9fr); }
      }
      @media (min-width: 1100px) {
        .ma-hero-text-only > .ma-section-inner { display: grid; grid-template-columns: minmax(0, 1fr) minmax(24rem, .65fr); align-items: end; }
        .ma-hero-text-only .ma-hero-mark { align-self: start; }
        .ma-hero-text-only .ma-hero-copy { grid-column: 2; grid-row: 1; margin-bottom: clamp(3rem, 7vw, 7rem); }
        .ma-gallery-columns { columns: 3; }
      }
      .ma-gate[data-reduced-motion="true"] :is(.ma-cover, .ma-cover-frame, .ma-cover-masthead, .ma-cover-recipient, .ma-cover-names) { transition: none; }
      .ma-gate[data-reduced-motion="true"] :is(.ma-flute, .ma-toast-ring, .ma-toast-bubble) { animation: none; }
      @media (prefers-reduced-motion: reduce) {
        .ma-theme, .ma-theme *, .ma-theme *::before, .ma-theme *::after {
          animation: none !important;
          scroll-behavior: auto !important;
          transition: none !important;
        }
      }
  
      /* Gallery lightbox (shared behaviour: themes/shared/GalleryLightbox). */
      .ma-theme .ma-gallery-zoom { display: block; width: 100%; padding: 0; border: 0; background: none; color: inherit; text-align: inherit; cursor: zoom-in; }
      .ma-theme .ma-gallery-zoom:focus-visible { outline: 2px solid var(--ma-champagne); outline-offset: 4px; }
      .ma-theme .ma-lightbox { width: 100vw; max-width: 100vw; height: 100svh; max-height: 100svh; margin: 0; padding: 0; border: 0; background: transparent; color: var(--ma-pearl); }
      .ma-theme .ma-lightbox::backdrop { background: rgba(10, 8, 8, .95); }
      .ma-theme .ma-lightbox-body { display: flex; height: 100%; flex-direction: column; padding: max(1rem, env(safe-area-inset-top)) clamp(1rem, 5vw, 3rem) max(1rem, env(safe-area-inset-bottom)); pointer-events: none; }
      .ma-theme .ma-lightbox-frame { position: relative; flex: 1; min-height: 0; }
      .ma-theme .ma-lightbox-frame > * { position: absolute; inset: 0; background: transparent; }
      .ma-theme .ma-lightbox-frame img { object-fit: contain; }
      .ma-theme .ma-lightbox-bar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: .75rem; padding-top: 1rem; pointer-events: auto; }
      .ma-theme .ma-lightbox-caption { margin: 0; font-size: .85rem; overflow-wrap: anywhere; }
      .ma-theme .ma-lightbox-btn { min-width: 44px; min-height: 44px; padding: 0 1rem; border: 1px solid rgba(214, 190, 150, .45); background: transparent; color: var(--ma-pearl); cursor: pointer; }
      .ma-theme .ma-lightbox-btn:focus-visible { outline: 2px solid var(--ma-champagne); outline-offset: 3px; }
      .ma-theme .ma-gift-copy-status { margin: .5rem 0 0; font-size: .8rem; color: var(--ma-smoke-ink); }
      .ma-theme .ma-gift-copy-status:empty { margin: 0; }
  `}</style>
  );
}
