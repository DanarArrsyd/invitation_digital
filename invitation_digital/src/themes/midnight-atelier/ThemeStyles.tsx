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
        min-height: 100svh;
        overflow-x: clip;
        background: var(--ma-ink);
        color: var(--ma-pearl);
        font-family: var(--font-ma-body), sans-serif;
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
        transition: visibility 0s linear .95s;
      }
      .ma-curtain { position: fixed; inset: 0; overflow: hidden; pointer-events: none; }
      .ma-curtain-panel {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 50.1%;
        transition: transform .95s cubic-bezier(.77, 0, .175, 1);
      }
      .ma-curtain-left { left: 0; background: var(--ma-ink); border-right: 1px solid var(--ma-champagne); }
      .ma-curtain-right { right: 0; background: var(--ma-lacquer); border-left: 1px solid var(--ma-champagne); }
      .ma-curtain-seam {
        position: absolute;
        z-index: 2;
        top: 50%;
        left: 50%;
        display: grid;
        width: clamp(4.5rem, 10vw, 7rem);
        aspect-ratio: 1;
        place-items: center;
        border: 1px solid var(--ma-champagne);
        background: var(--ma-ink);
        transform: translate(-50%, -50%);
        transition: opacity .24s ease .18s;
      }
      .ma-curtain-seam .ma-mark { width: 55%; }
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
        color: var(--ma-smoke);
        font-size: .75rem;
        letter-spacing: .08em;
      }
      .ma-cover-stage { align-self: center; min-width: 0; text-align: center; }
      .ma-cover-intro { margin: 0 0 1.4rem; color: var(--ma-smoke); font-size: .9rem; }
      .ma-cover-names {
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 0;
        margin: 0;
        font-family: var(--font-ma-display), serif;
        font-size: clamp(4rem, 15vw, 10rem);
        font-weight: 500;
        letter-spacing: -.055em;
        line-height: .76;
        overflow-wrap: anywhere;
      }
      .ma-cover-amp {
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
      .ma-cover-recipient > p:first-child { margin: 0; color: var(--ma-smoke); font-size: .78rem; }
      .ma-cover-guest-name {
        max-width: 34ch;
        margin: .4rem 0 1.4rem;
        font-family: var(--font-ma-display), serif;
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
      .ma-gate[data-opened="true"] .ma-cover { visibility: hidden; pointer-events: none; }
      .ma-gate[data-opened="true"] .ma-curtain-left { transform: translateX(-101%); }
      .ma-gate[data-opened="true"] .ma-curtain-right { transform: translateX(101%); }
      .ma-gate[data-opened="true"] .ma-curtain-seam { opacity: 0; transition-delay: 0s; }
      .ma-gate[data-opened="true"] .ma-cover-frame { opacity: 0; transform: scale(.985); }
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
        font-family: var(--font-ma-display), serif;
        font-size: clamp(3.25rem, 12vw, 9rem);
        font-weight: 500;
        letter-spacing: -0.045em;
        line-height: 0.86;
      }
      .ma-mark { display: inline-grid; width: 4rem; color: var(--ma-champagne); }
      .ma-mark svg { display: block; width: 100%; stroke: currentColor; stroke-width: 1; }
      .ma-media { position: relative; overflow: hidden; background: var(--ma-lacquer); }
      .ma-media img { object-fit: cover; }
      .ma-hero > .ma-section-inner { display: grid; width: 100%; max-width: none; padding: 0; align-content: start; }
      .ma-hero-image { width: 100%; aspect-ratio: 16 / 10; min-height: 18rem; align-self: start; }
      .ma-hero-copy {
        position: relative;
        z-index: 1;
        min-width: 0;
        padding: clamp(2rem, 8vw, 6rem) clamp(1.25rem, 7vw, 6rem);
        background: var(--ma-oxblood);
      }
      .ma-hero-copy h2 {
        max-width: 9ch;
        margin: 0;
        font-family: var(--font-ma-display), serif;
        font-size: clamp(3.6rem, 13vw, 10rem);
        font-weight: 500;
        letter-spacing: -.055em;
        line-height: .82;
        overflow-wrap: anywhere;
      }
      .ma-hero-copy p {
        max-width: 44ch;
        margin: clamp(2rem, 6vw, 4rem) 0 0;
        color: var(--ma-pearl);
        font-size: clamp(1rem, 2vw, 1.2rem);
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
        font-family: var(--font-ma-display), serif;
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
        font-family: var(--font-ma-display), serif;
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
        max-width: 11ch;
        margin: 0;
        font-family: var(--font-ma-display), serif;
        font-size: clamp(2.5rem, 8vw, 5rem);
        font-weight: 500;
        letter-spacing: -.04em;
        line-height: .92;
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
      .ma-parents p:last-child { font-family: var(--font-ma-display), serif; font-size: 1.25rem; line-height: 1.4; }
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
        font-family: var(--font-ma-display), serif;
        font-size: clamp(7rem, 28vw, 16rem);
        line-height: .65;
      }
      .ma-closing > .ma-section-inner { display: grid; align-items: center; gap: clamp(3rem, 8vw, 7rem); }
      .ma-closing-copy { min-width: 0; overflow-wrap: anywhere; }
      .ma-closing-copy h2 {
        max-width: 10ch;
        margin: clamp(2rem, 6vw, 4rem) 0 0;
        font-family: var(--font-ma-display), serif;
        font-size: clamp(3.4rem, 11vw, 8rem);
        font-weight: 500;
        letter-spacing: -.05em;
        line-height: .85;
      }
      .ma-closing-copy p { max-width: 46ch; margin: 2rem 0 0; color: var(--ma-smoke); line-height: 1.75; white-space: pre-line; }
      .ma-closing-image { width: min(100%, 34rem); justify-self: end; }
      .ma-closing-text-only > .ma-section-inner { grid-template-columns: minmax(0, 1fr); }
      .ma-image-fallback {
        display: grid;
        width: 100%;
        height: 100%;
        place-items: center;
        align-content: center;
        gap: 1rem;
        color: var(--ma-smoke);
        border: 1px solid color-mix(in srgb, var(--ma-champagne) 50%, transparent);
        font-size: 0.75rem;
        letter-spacing: 0.16em;
        text-transform: uppercase;
      }
      .ma-nav {
        position: fixed;
        z-index: 30;
        right: max(1rem, env(safe-area-inset-right));
        bottom: max(.75rem, env(safe-area-inset-bottom));
        left: max(1rem, env(safe-area-inset-left));
        max-width: calc(100% - 2rem);
        background: var(--ma-pearl);
        color: var(--ma-ink);
        border: 1px solid var(--ma-champagne);
      }
      .ma-nav ul {
        display: flex;
        gap: 0;
        margin: 0;
        padding: .3rem;
        overflow-x: auto;
        overscroll-behavior-x: contain;
        list-style: none;
      }
      .ma-nav li { flex: 0 0 auto; }
      .ma-nav a {
        display: grid;
        min-width: 64px;
        min-height: 48px;
        place-items: center;
        align-content: center;
        gap: .05rem;
        padding: .35rem .7rem;
        color: inherit;
        text-decoration: none;
      }
      .ma-nav a span:first-child { color: var(--ma-oxblood); font-size: .62rem; font-variant-numeric: tabular-nums; }
      .ma-nav a span:last-child { font-size: .72rem; }
      .ma-nav a[aria-current="location"] { background: var(--ma-ink); color: var(--ma-pearl); }
      .ma-nav a[aria-current="location"] span:first-child { color: var(--ma-champagne); }
      .ma-music {
        position: fixed;
        z-index: 31;
        right: max(1rem, env(safe-area-inset-right));
        bottom: calc(5.25rem + env(safe-area-inset-bottom));
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
      .ma-theme :is(a, button, input, textarea, select) { min-height: 48px; }
      .ma-theme :is(a, button, input, textarea, select):focus-visible {
        outline: 3px solid var(--ma-champagne);
        outline-offset: 4px;
      }
      @media (max-width: 767px) {
        .ma-cover-frame { grid-template-rows: auto 1fr auto; gap: 2rem; }
        .ma-cover-masthead span:last-child { display: none; }
        .ma-cover-names { font-size: clamp(3.5rem, 20vw, 6.25rem); }
        .ma-hero-copy { min-height: calc(100svh - 62.5vw); margin-top: -1px; align-content: center; }
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
        .ma-nav {
          top: 50%;
          right: max(1rem, env(safe-area-inset-right));
          bottom: auto;
          left: auto;
          width: auto;
          max-width: 10rem;
          transform: translateY(-50%);
        }
        .ma-nav ul { max-height: min(76vh, 38rem); flex-direction: column; overflow-x: hidden; overflow-y: auto; }
        .ma-nav a { grid-template-columns: 1.5rem minmax(0, 1fr); min-width: 8.5rem; justify-items: start; text-align: left; }
        .ma-music { top: max(1.25rem, env(safe-area-inset-top)); bottom: auto; }
        .ma-quote-inner { grid-template-columns: 5rem minmax(0, 1fr); }
        .ma-people { grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: start; gap: clamp(2.5rem, 6vw, 6rem); }
        .ma-person[data-position="right"] { margin-top: clamp(5rem, 11vw, 10rem); }
        .ma-person-text-only { min-height: 30rem; align-content: space-between; }
        .ma-closing > .ma-section-inner { grid-template-columns: minmax(0, 1.1fr) minmax(18rem, .9fr); }
      }
      @media (min-width: 1100px) {
        .ma-hero > .ma-section-inner { grid-template-columns: repeat(12, minmax(0, 1fr)); align-items: end; }
        .ma-hero-image { grid-column: 1 / 10; grid-row: 1; min-height: 42rem; }
        .ma-hero-copy { grid-column: 8 / -1; grid-row: 1; margin-bottom: clamp(3rem, 7vw, 7rem); padding: clamp(3rem, 5vw, 5.5rem); }
        .ma-hero-text-only > .ma-section-inner { display: grid; grid-template-columns: minmax(0, 1fr) minmax(24rem, .65fr); align-items: end; }
        .ma-hero-text-only .ma-hero-mark { align-self: start; }
        .ma-hero-text-only .ma-hero-copy { grid-column: 2; }
      }
      .ma-gate[data-reduced-motion="true"] .ma-cover,
      .ma-gate[data-reduced-motion="true"] .ma-curtain-panel,
      .ma-gate[data-reduced-motion="true"] .ma-curtain-seam,
      .ma-gate[data-reduced-motion="true"] .ma-cover-frame { transition: none; }
      @media (prefers-reduced-motion: reduce) {
        .ma-theme, .ma-theme *, .ma-theme *::before, .ma-theme *::after {
          animation: none !important;
          scroll-behavior: auto !important;
          transition: none !important;
        }
      }
    `}</style>
  );
}
