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
      .ma-foundation-layout {
        display: grid;
        min-height: calc(100svh - clamp(9rem, 24vw, 18rem));
        align-content: space-between;
        gap: 4rem;
        border-block: 1px solid color-mix(in srgb, var(--ma-champagne) 60%, transparent);
        padding-block: clamp(2rem, 7vw, 5rem);
      }
      .ma-eyebrow, .ma-guest {
        margin: 0;
        color: var(--ma-smoke);
        font-size: 0.78rem;
        font-weight: 500;
        letter-spacing: 0.2em;
        text-transform: uppercase;
      }
      .ma-guest { color: var(--ma-champagne); }
      .ma-mark { display: inline-grid; width: 4rem; color: var(--ma-champagne); }
      .ma-mark svg { display: block; width: 100%; stroke: currentColor; stroke-width: 1; }
      .ma-media { position: relative; overflow: hidden; background: var(--ma-lacquer); }
      .ma-media img { object-fit: cover; }
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
      .ma-theme :is(a, button, input, textarea, select) { min-height: 48px; }
      .ma-theme :is(a, button, input, textarea, select):focus-visible {
        outline: 3px solid var(--ma-champagne);
        outline-offset: 4px;
      }
      @media (min-width: 768px) {
        .ma-foundation-layout { grid-template-columns: minmax(0, 1fr) auto; align-items: end; }
        .ma-foundation-copy { align-self: center; }
        .ma-guest { justify-self: end; writing-mode: vertical-rl; }
      }
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
