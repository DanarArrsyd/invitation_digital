export function ThemeStyles() {
  return <style>{`
    .tb-theme {
      --tb-linen: #F2E7D8;
      --tb-clay: #B6634B;
      --tb-moss: #53634E;
      --tb-cacao: #45372C;
      --tb-sun: #D6A663;
      --tb-bone: #FBF7F0;
      --tb-gutter: clamp(1.5rem, 6vw, 5rem);
      --tb-display: var(--font-tb-display), Georgia, serif;
      --tb-body: var(--font-tb-body), Arial, sans-serif;
      background: var(--tb-linen);
      color: var(--tb-cacao);
      font-family: var(--tb-body);
      font-size: 1rem;
      line-height: 1.7;
      overflow-x: clip;
      isolation: isolate;
      overflow-wrap: anywhere;
      color-scheme: light;
    }
    .tb-theme *, .tb-theme *::before, .tb-theme *::after { box-sizing: border-box; }
    .tb-theme [hidden] { display: none !important; }
    .tb-theme h1, .tb-theme h2, .tb-theme h3, .tb-theme p { margin: 0; }
    .tb-theme h1, .tb-theme h2, .tb-theme h3 { font-family: var(--tb-display); font-weight: 400; }
    .tb-theme button, .tb-theme input, .tb-theme textarea, .tb-theme select { font: inherit; }
    .tb-theme button, .tb-theme a { -webkit-tap-highlight-color: transparent; }
    .tb-theme :focus-visible { outline: 3px solid currentColor; outline-offset: 5px; }
    .tb-theme a { color: inherit; text-underline-offset: .25em; }
    .tb-theme .tb-gate { min-height: 100svh; }
    .tb-theme .tb-cover {
      position: fixed; inset: 0; z-index: 50;
      overflow-y: auto; overflow-x: clip;
      background: var(--tb-linen);
      transition: transform 800ms cubic-bezier(.65, 0, .25, 1), opacity 800ms ease, visibility 0s 800ms;
    }
    .tb-theme .tb-gate[data-opened="true"] .tb-cover {
      transform: translateY(-6%); opacity: 0; visibility: hidden; pointer-events: none;
    }
    .tb-theme .tb-cover-sheet { position: relative; min-height: 100svh; }
    .tb-theme .tb-cover-art { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
    .tb-theme .tb-botanical { display: block; pointer-events: none; }
    .tb-theme .tb-cover-clay { position: absolute; width: clamp(150px, 35vw, 480px); right: -12%; top: -18%; color: var(--tb-clay); transform: rotate(33deg); }
    .tb-theme .tb-cover-moss { position: absolute; width: clamp(145px, 32vw, 390px); left: -19%; bottom: -14%; color: var(--tb-moss); transform: rotate(23deg); }
    .tb-theme .tb-cover-line { position: absolute; width: clamp(100px, 19vw, 240px); right: -4%; top: 32%; color: var(--tb-moss); opacity: .32; transform: rotate(-18deg); }
    .tb-theme .tb-cover-layout {
      position: relative; display: grid; align-content: center; gap: clamp(2.5rem, 7vh, 5rem);
      width: min(100%, 1180px); min-height: 100svh; margin-inline: auto;
      padding: max(4.5rem, env(safe-area-inset-top)) max(var(--tb-gutter), env(safe-area-inset-right)) max(4.5rem, env(safe-area-inset-bottom)) max(var(--tb-gutter), env(safe-area-inset-left));
    }
    .tb-theme .tb-cover-title, .tb-theme .tb-cover-recipient { min-width: 0; }
    .tb-theme .tb-journal-label { font-size: .875rem; margin-bottom: 2rem; }
    .tb-theme .tb-cover-names { font-size: clamp(3rem, 13vw, 7rem); line-height: 1.02; letter-spacing: -.055em; max-width: 11ch; }
    .tb-theme .tb-cover-names > span { display: block; }
    .tb-theme .tb-cover-names > span:last-child { margin-left: .38em; }
    .tb-theme .tb-cover-names .tb-cover-amp { font-size: .5em; line-height: 1.3; margin-left: 1.2em; color: var(--tb-moss); }
    .tb-theme .tb-cover-date { display: block; margin-top: 2rem; font-size: .9375rem; }
    .tb-theme .tb-cover-recipient { max-width: 27rem; padding-left: 1.25rem; border-left: 2px solid var(--tb-clay); }
    .tb-theme .tb-cover-recipient > p:first-child { font-size: .875rem; }
    .tb-theme .tb-guest-name { font-weight: 600; margin-top: .35rem; line-height: 1.6; }
    .tb-theme .tb-action { display: inline-flex; justify-content: center; align-items: center; min-height: 52px; min-width: 48px; max-width: 100%; padding: .75rem 1.35rem; border: 1px solid var(--tb-moss); border-radius: 0; background: var(--tb-moss); color: var(--tb-bone); cursor: pointer; text-decoration: none; font-size: .9375rem; font-weight: 600; }
    .tb-theme .tb-cover-recipient .tb-action { margin-top: 1.5rem; }
    .tb-theme .tb-action:hover { background: var(--tb-cacao); border-color: var(--tb-cacao); }
    .tb-theme .tb-action:focus-visible { outline-color: var(--tb-cacao); }
    .tb-theme .tb-content { min-height: 100svh; padding-bottom: calc(7rem + env(safe-area-inset-bottom)); }
    .tb-theme .tb-content:focus-visible { outline-offset: -6px; }
    .tb-theme .tb-shell-heading { padding: 6rem var(--tb-gutter); }
    .tb-theme .tb-shell-heading h2 { font-size: clamp(2.5rem, 8vw, 5rem); }
    .tb-theme .tb-section { padding: clamp(4rem, 10vw, 8rem) var(--tb-gutter); scroll-margin-top: 2rem; }
    .tb-theme .tb-surface-linen { background: var(--tb-linen); }
    .tb-theme .tb-surface-bone { background: var(--tb-bone); }
    .tb-theme .tb-surface-clay { background: var(--tb-clay); color: var(--tb-cacao); }
    .tb-theme .tb-surface-clay > .tb-section-inner { background: var(--tb-bone); padding: clamp(1.5rem, 5vw, 4rem); }
    .tb-theme .tb-surface-moss { background: var(--tb-moss); color: var(--tb-bone); }
    .tb-theme .tb-section-heading { max-width: 48rem; margin-bottom: clamp(2rem, 5vw, 4rem); }
    .tb-theme .tb-section-heading h2 { font-size: clamp(2.25rem, 7vw, 4.5rem); line-height: 1.13; letter-spacing: -.035em; }
    .tb-theme .tb-section-intro { max-width: 62ch; margin-top: 1.5rem; }
    .tb-theme .tb-reveal { min-width: 0; }
    .tb-theme .tb-media { position: relative; aspect-ratio: 4 / 5; overflow: hidden; background: var(--tb-linen); }
    .tb-theme .tb-media img { width: 100%; height: 100%; object-fit: cover; }
    .tb-theme .tb-nav { position: fixed; z-index: 30; bottom: max(.75rem, env(safe-area-inset-bottom)); left: max(1rem, env(safe-area-inset-left)); right: max(1rem, env(safe-area-inset-right)); width: fit-content; max-width: calc(100% - 2rem); margin-inline: auto; background: var(--tb-bone); color: var(--tb-cacao); border: 1px solid var(--tb-moss); }
    .tb-theme .tb-nav ul { display: flex; gap: .25rem; overflow-x: auto; overscroll-behavior-x: contain; list-style: none; padding: .35rem; margin: 0; }
    .tb-theme .tb-nav li { flex: 0 0 auto; }
    .tb-theme .tb-nav a { display: flex; align-items: center; justify-content: center; min-height: 48px; min-width: 48px; padding: .5rem .85rem; text-decoration: none; font-size: .8125rem; }
    .tb-theme .tb-nav a[aria-current="location"] { background: var(--tb-moss); color: var(--tb-bone); text-decoration: underline; }
    .tb-theme .tb-nav a:focus-visible { outline-offset: -3px; }
    .tb-theme .tb-music { position: fixed; z-index: 30; right: max(1rem, env(safe-area-inset-right)); bottom: calc(5.75rem + env(safe-area-inset-bottom)); display: grid; place-items: center; min-width: 48px; min-height: 48px; border: 1px solid var(--tb-moss); background: var(--tb-bone); color: var(--tb-moss); cursor: pointer; }
    @media (min-width: 768px) {
      .tb-theme .tb-cover-layout { grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr); gap: 5rem; align-items: end; }
      .tb-theme .tb-cover-recipient { margin-bottom: 1rem; }
      .tb-theme .tb-cover-clay { right: -8%; top: -25%; }
      .tb-theme .tb-cover-moss { left: -6%; bottom: -34%; }
      .tb-theme .tb-cover-line { top: 12%; right: 14%; opacity: .2; }
    }
    @media (prefers-reduced-motion: reduce) {
      .tb-theme *, .tb-theme *::before, .tb-theme *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; }
      .tb-theme .tb-cover, .tb-theme .tb-gate[data-opened="true"] .tb-cover { transform: none; }
    }
  `}</style>;
}
