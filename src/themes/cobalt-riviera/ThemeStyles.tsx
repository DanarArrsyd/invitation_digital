import { COBALT_RIVIERA_TOKENS } from "./tokens";

export function ThemeStyles() {
  const { colors } = COBALT_RIVIERA_TOKENS;

  return (
    <style>{`
      .cr-theme {
        --cr-cobalt: ${colors.cobalt};
        --cr-porcelain: ${colors.porcelain};
        --cr-sea-ink: ${colors.seaInk};
        --cr-tangerine: ${colors.tangerine};
        --cr-citron: ${colors.citron};
        --cr-pool: ${colors.pool};
        min-height: 100svh;
        overflow-x: clip;
        background: var(--cr-porcelain);
        color: var(--cr-sea-ink);
        font-family: var(--font-cr-body), Georgia, serif;
      }
      .cr-theme, .cr-theme *, .cr-theme *::before, .cr-theme *::after { box-sizing: border-box; }
      .cr-section { position: relative; min-height: 100svh; }
      .cr-section-inner {
        width: min(100%, 96rem);
        min-height: inherit;
        margin-inline: auto;
        padding: clamp(4rem, 10vw, 8rem) clamp(1.25rem, 6vw, 6rem);
      }
      .cr-surface-cobalt {
        --cr-focus-ring: var(--cr-citron);
        background: var(--cr-cobalt);
        color: var(--cr-porcelain);
      }
      .cr-surface-porcelain {
        --cr-focus-ring: var(--cr-cobalt);
        background: var(--cr-porcelain);
        color: var(--cr-sea-ink);
      }
      .cr-surface-sea-ink {
        --cr-focus-ring: var(--cr-citron);
        background: var(--cr-sea-ink);
        color: var(--cr-porcelain);
      }
      .cr-surface-pool {
        --cr-focus-ring: var(--cr-sea-ink);
        background: var(--cr-pool);
        color: var(--cr-sea-ink);
      }
      .cr-display {
        max-width: 10ch;
        margin: 0;
        font-family: var(--font-cr-display), Arial, sans-serif;
        font-size: clamp(3.8rem, 16vw, 11rem);
        font-variation-settings: "wght" 610;
        letter-spacing: -.065em;
        line-height: .78;
        overflow-wrap: anywhere;
      }
      .cr-foundation-layout {
        display: grid;
        min-height: calc(100svh - clamp(8rem, 20vw, 16rem));
        grid-template-rows: auto 1fr auto;
        gap: clamp(2rem, 7vw, 6rem);
        align-items: start;
      }
      .cr-foundation-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        border-bottom: 1px solid currentColor;
        padding-bottom: .75rem;
      }
      .cr-kicker, .cr-guest {
        margin: 0;
        font-family: var(--font-cr-display), Arial, sans-serif;
        font-size: .8rem;
        font-weight: 600;
        letter-spacing: .12em;
        text-transform: uppercase;
      }
      .cr-foundation-copy { align-self: center; min-width: 0; }
      .cr-foundation-copy .cr-route-rule { margin-top: clamp(2rem, 6vw, 4rem); }
      .cr-foundation-footer {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr);
        gap: 1.25rem;
        align-items: center;
      }
      .cr-guest { color: var(--cr-citron); overflow-wrap: anywhere; }
      .cr-sun-mark { display: inline-grid; width: clamp(3.5rem, 10vw, 5.5rem); color: var(--cr-citron); }
      .cr-sun-mark svg { display: block; width: 100%; fill: currentColor; }
      .cr-sun-mark path { fill: none; stroke: var(--cr-sea-ink); stroke-width: 1.5; }
      .cr-route-rule {
        display: grid;
        width: min(100%, 36rem);
        grid-template-columns: 1fr auto 1fr;
        align-items: center;
        gap: .75rem;
        color: var(--cr-tangerine);
      }
      .cr-route-rule span:nth-child(1), .cr-route-rule span:nth-child(3) { height: 1px; background: currentColor; }
      .cr-route-rule span:nth-child(2) { width: .7rem; aspect-ratio: 1; background: currentColor; transform: rotate(45deg); }
      .cr-ceramic-line { display: inline-grid; width: min(100%, 15rem); color: currentColor; }
      .cr-ceramic-line svg { display: block; width: 100%; fill: none; stroke: currentColor; stroke-width: 2; }
      .cr-media { position: relative; overflow: hidden; background: var(--cr-pool); }
      .cr-media img { object-fit: cover; }
      .cr-image-fallback {
        display: grid;
        width: 100%;
        height: 100%;
        place-items: center;
        align-content: center;
        gap: 1rem;
        border: 1px solid var(--cr-sea-ink);
        color: var(--cr-sea-ink);
        font-family: var(--font-cr-display), Arial, sans-serif;
        font-size: .75rem;
        letter-spacing: .1em;
        text-transform: uppercase;
      }
      .cr-theme :is(a, button, input, textarea, select) { min-height: 48px; }
      .cr-theme a { display: inline-flex; align-items: center; }
      .cr-theme :is(a, button, input, textarea, select):focus-visible {
        outline: 3px solid var(--cr-focus-ring);
        outline-offset: 4px;
      }
      @media (min-width: 768px) {
        .cr-foundation-layout { grid-template-columns: minmax(0, 1fr) minmax(12rem, .35fr); }
        .cr-foundation-header { grid-column: 1 / -1; }
        .cr-foundation-copy { grid-column: 1; }
        .cr-foundation-footer { grid-column: 2; align-self: end; }
      }
      @media (prefers-reduced-motion: reduce) {
        .cr-theme, .cr-theme *, .cr-theme *::before, .cr-theme *::after {
          animation: none !important;
          scroll-behavior: auto !important;
          transition: none !important;
        }
      }
    `}</style>
  );
}
