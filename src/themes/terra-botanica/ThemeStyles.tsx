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
    .tb-theme .tb-section { padding: clamp(4rem, 10vw, 8rem) var(--tb-gutter); scroll-margin-top: 2rem; }
    .tb-theme .tb-section-inner { max-width: 1180px; margin-inline: auto; min-width: 0; }
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
    .tb-theme .tb-media img { display: block; width: 100%; height: 100%; object-fit: cover; }
    .tb-theme .tb-image-fallback { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; padding: 1rem; color: var(--tb-moss); text-align: center; font-size: .8125rem; }
    .tb-theme .tb-image-fallback .tb-botanical { width: min(24%, 100px); max-height: 50%; }
    .tb-theme .tb-hero { padding-top: clamp(1.5rem, 4vw, 4rem); }
    .tb-theme .tb-hero-image { border-radius: 0 0 20% 0; }
    .tb-theme .tb-hero-copy { display: grid; gap: 1.5rem; margin-top: 2rem; }
    .tb-theme .tb-hero-copy h2 { max-width: 15ch; font-size: clamp(2.8rem, 9vw, 6.5rem); line-height: 1.05; letter-spacing: -.05em; }
    .tb-theme .tb-hero-copy p { max-width: 38ch; white-space: pre-line; }
    .tb-theme .tb-hero-text-only { padding-top: clamp(4rem, 10vw, 8rem); }
    .tb-theme .tb-hero-botanical { width: clamp(70px, 15vw, 150px); margin-left: auto; margin-bottom: 2rem; color: var(--tb-moss); }
    .tb-theme .tb-quote { padding: clamp(2.5rem, 7vw, 6rem) var(--tb-gutter); background: var(--tb-clay); }
    .tb-theme .tb-quote-sheet { display: grid; gap: 1.5rem; max-width: 1000px; margin-inline: auto; padding: clamp(1.75rem, 6vw, 5rem); background: var(--tb-bone); }
    .tb-theme .tb-quote-botanical { width: 48px; color: var(--tb-moss); }
    .tb-theme .tb-quote blockquote { margin: 0; max-width: 32ch; font-family: var(--tb-display); font-size: clamp(1.7rem, 4vw, 3.5rem); line-height: 1.4; white-space: pre-line; }
    .tb-theme .tb-people { display: grid; gap: clamp(4rem, 10vw, 9rem); }
    .tb-theme .tb-person { display: grid; gap: 2rem; align-items: center; min-width: 0; }
    .tb-theme .tb-person-portrait { width: 88%; }
    .tb-theme .tb-person:nth-child(even) .tb-person-portrait { margin-left: auto; border-radius: 0 25% 0 0; }
    .tb-theme .tb-person:first-child .tb-person-portrait { border-radius: 25% 0 0 0; }
    .tb-theme .tb-person-copy { min-width: 0; max-width: 42ch; }
    .tb-theme .tb-person-copy h3 { font-size: clamp(2.2rem, 6vw, 4.3rem); line-height: 1.12; letter-spacing: -.035em; }
    .tb-theme .tb-parents { margin-top: 1.5rem; }
    .tb-theme .tb-parents > p:first-child { font-size: .875rem; margin-bottom: .35rem; }
    .tb-theme .tb-parents > p:last-child > span { display: block; }
    .tb-theme .tb-parent-join { display: block; font-family: var(--tb-display); color: var(--tb-moss); }
    .tb-theme .tb-person-bio { margin-top: 1.5rem; white-space: pre-line; }
    .tb-theme .tb-instagram { display: inline-flex; align-items: center; min-height: 48px; max-width: 100%; margin-top: .75rem; font-size: .875rem; }
    .tb-theme .tb-story-entries { display: grid; gap: clamp(3.5rem, 8vw, 7rem); list-style: none; padding: 0; margin: 0; }
    .tb-theme .tb-story-entry { display: grid; gap: 1.75rem; min-width: 0; align-items: center; }
    .tb-theme .tb-story-copy { min-width: 0; max-width: 54ch; }
    .tb-theme .tb-story-date { display: block; margin-bottom: .75rem; color: var(--tb-moss); }
    .tb-theme .tb-story-copy h3 { font-size: clamp(1.85rem, 4.5vw, 3rem); line-height: 1.25; letter-spacing: -.025em; }
    .tb-theme .tb-story-description { margin-top: 1.25rem; white-space: pre-line; }
    .tb-theme .tb-story-text-only { padding-block: 1rem; padding-left: clamp(1.5rem, 6vw, 4rem); border-left: 2px solid var(--tb-clay); }
    .tb-theme .tb-gallery-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: start; column-gap: clamp(1rem, 4vw, 3.5rem); row-gap: clamp(2rem, 5vw, 5rem); }
    .tb-theme .tb-gallery-item { margin: 0; min-width: 0; }
    .tb-theme .tb-gallery-item[data-gallery-span="2"] { grid-column: span 2; width: 92%; justify-self: center; }
    .tb-theme .tb-gallery-item[data-gallery-span="1"] + .tb-gallery-item[data-gallery-span="1"] { margin-top: clamp(2rem, 6vw, 5rem); }
    .tb-theme .tb-gallery-item figcaption { margin-top: .85rem; font-size: .8125rem; line-height: 1.6; }
    .tb-theme .tb-gathering .tb-section-heading { max-width: none; border-bottom: 1px solid var(--tb-clay); padding-bottom: 2rem; }
    .tb-theme .tb-gathering .tb-section-intro { font-size: .875rem; letter-spacing: .02em; }
    .tb-theme .tb-event-list { margin: 0; padding: 0; list-style: none; }
    .tb-theme .tb-event { display: grid; grid-template-columns: 3ch minmax(0, 1fr); gap: 1.5rem; padding: clamp(2rem, 5vw, 3.5rem) 0; border-bottom: 1px solid rgba(69, 55, 44, .35); min-width: 0; }
    .tb-theme .tb-event:last-child { border-bottom: 0; padding-bottom: 0; }
    .tb-theme .tb-event-index { color: var(--tb-clay); font-size: .875rem; font-weight: 700; letter-spacing: .08em; padding-top: .65rem; }
    .tb-theme .tb-event-main, .tb-theme .tb-event-place { min-width: 0; overflow-wrap: anywhere; }
    .tb-theme .tb-event-main h3 { font-size: clamp(2rem, 7vw, 4rem); line-height: 1.12; letter-spacing: -.035em; }
    .tb-theme .tb-event-main time { display: block; margin-top: 1rem; font-size: .9375rem; font-weight: 700; }
    .tb-theme .tb-event-time { font-size: .875rem; }
    .tb-theme .tb-event-place { grid-column: 2; border-left: 2px solid var(--tb-clay); padding-left: 1.25rem; align-self: end; }
    .tb-theme .tb-event-venue { font-size: 1.125rem; font-weight: 700; line-height: 1.5; }
    .tb-theme .tb-event-address { margin-top: .5rem; font-size: .875rem; }
    .tb-theme .tb-text-action, .tb-theme .tb-calendar-actions a, .tb-theme .tb-calendar-actions button { display: inline-flex; align-items: center; gap: .5rem; min-height: 44px; text-decoration: underline; text-underline-offset: .3em; font-size: .8125rem; font-weight: 700; }
    .tb-theme .tb-text-action { margin-top: 1rem; }
    .tb-theme .tb-calendar-actions { display: flex; flex-wrap: wrap; column-gap: 1.5rem; row-gap: .25rem; margin-top: .5rem; }
    .tb-theme .tb-calendar-actions button { padding: 0; border: 0; background: none; color: inherit; cursor: pointer; }
    .tb-theme .tb-countdown > .tb-section-inner { display: grid; gap: 1rem; }
    .tb-theme .tb-countdown .tb-section-heading { margin-bottom: 0; }
    .tb-theme .tb-countdown-units { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .5rem; margin: 0; }
    .tb-theme .tb-countdown-units > div { display: flex; flex-direction: column; min-width: 0; border-top: 2px solid var(--tb-clay); padding-top: 1rem; }
    .tb-theme .tb-countdown-units dd { margin: 0; font-family: var(--tb-display); font-size: clamp(1.5rem, 8vw, 5rem); line-height: 1; }
    .tb-theme .tb-countdown-units dt { order: 2; margin-top: .75rem; font-size: .8125rem; }
    .tb-theme .tb-dress-code > .tb-section-inner { max-width: 960px; }
    .tb-theme .tb-dress-description { max-width: 56ch; }
    .tb-theme .tb-dress-groups { display: grid; gap: 2.5rem; margin-top: 2.5rem; }
    .tb-theme .tb-dress-group { padding-top: 1.25rem; border-top: 1px solid var(--tb-clay); }
    .tb-theme .tb-dress-group h3 { font-size: 1.5rem; }
    .tb-theme .tb-dress-group ul { display: flex; flex-wrap: wrap; gap: 1.25rem; list-style: none; padding: 0; margin: 1rem 0 0; }
    .tb-theme .tb-dress-group li { display: flex; align-items: center; gap: .65rem; font-size: .8125rem; }
    .tb-theme .tb-dress-swatch { display: inline-block; width: 2.25rem; height: 2.25rem; border: 1px solid var(--tb-cacao); border-radius: 50%; flex: 0 0 auto; }
    .tb-theme .tb-livestream ul { list-style: none; padding: 0; margin: 0; }
    .tb-theme .tb-livestream li { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: baseline; gap: .5rem 2rem; padding: 1.25rem 0; border-top: 1px solid var(--tb-linen); }
    .tb-theme .tb-livestream a { display: inline-flex; min-width: 0; min-height: 44px; align-items: center; gap: .5rem; overflow-wrap: anywhere; font-family: var(--tb-display); font-size: clamp(1.5rem, 4vw, 2rem); }
    .tb-theme .tb-closing > .tb-section-inner { display: grid; gap: 3rem; align-items: center; }
    .tb-theme .tb-closing-copy { min-width: 0; }
    .tb-theme .tb-closing-botanical { width: 60px; margin-bottom: 2rem; color: var(--tb-linen); }
    .tb-theme .tb-closing h2 { max-width: 12ch; font-size: clamp(2.75rem, 8vw, 6rem); line-height: 1.12; letter-spacing: -.04em; }
    .tb-theme .tb-closing p { margin-top: 2rem; max-width: 42ch; white-space: pre-line; }
    .tb-theme .tb-closing-image { width: 82%; margin-left: auto; border-radius: 0 0 28% 0; }
    .tb-theme .tb-nav { position: fixed; z-index: 30; bottom: max(.75rem, env(safe-area-inset-bottom)); left: max(1rem, env(safe-area-inset-left)); right: max(1rem, env(safe-area-inset-right)); width: fit-content; max-width: calc(100% - 2rem); margin-inline: auto; background: var(--tb-bone); color: var(--tb-cacao); border: 1px solid var(--tb-moss); }
    .tb-theme .tb-nav ul { display: flex; gap: .25rem; overflow-x: auto; overscroll-behavior-x: contain; list-style: none; padding: .35rem; margin: 0; }
    .tb-theme .tb-nav li { flex: 0 0 auto; }
    .tb-theme .tb-nav a { display: flex; align-items: center; justify-content: center; min-height: 48px; min-width: 48px; padding: .5rem .85rem; text-decoration: none; font-size: .8125rem; }
    .tb-theme .tb-nav a[aria-current="location"] { background: var(--tb-moss); color: var(--tb-bone); text-decoration: underline; }
    .tb-theme .tb-nav a:focus-visible { outline-offset: -3px; }
    .tb-theme .tb-music { position: fixed; z-index: 30; right: max(1rem, env(safe-area-inset-right)); bottom: calc(5.75rem + env(safe-area-inset-bottom)); display: grid; place-items: center; min-width: 48px; min-height: 48px; border: 1px solid var(--tb-moss); background: var(--tb-bone); color: var(--tb-moss); cursor: pointer; }
    @media (min-width: 768px) {
      .tb-theme .tb-event { grid-template-columns: 3ch minmax(0, 1.15fr) minmax(0, .85fr); gap: clamp(1.5rem, 4vw, 4rem); }
      .tb-theme .tb-event-place { grid-column: 3; }
      .tb-theme .tb-countdown > .tb-section-inner { grid-template-columns: minmax(0, .8fr) minmax(0, 1.2fr); align-items: end; }
      .tb-theme .tb-dress-groups { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .tb-theme .tb-hero-copy { grid-template-columns: minmax(0, 1.3fr) minmax(0, .7fr); align-items: end; gap: 4rem; margin-top: 3rem; }
      .tb-theme .tb-quote-sheet { grid-template-columns: 80px minmax(0, 1fr); gap: 3rem; align-items: start; margin-left: max(0px, calc((100% - 1180px) / 2)); }
      .tb-theme .tb-quote-botanical { width: 80px; }
      .tb-theme .tb-person { grid-template-columns: minmax(0, 1.05fr) minmax(0, .95fr); gap: clamp(3rem, 7vw, 7rem); }
      .tb-theme .tb-person-portrait { width: 100%; }
      .tb-theme .tb-person:nth-child(even) .tb-person-portrait { grid-column: 2; grid-row: 1; }
      .tb-theme .tb-person:nth-child(even) .tb-person-copy { grid-column: 1; grid-row: 1; padding-left: 10%; }
      .tb-theme .tb-person-text-only { display: block; max-width: 48rem; }
      .tb-theme .tb-person-text-only:nth-child(even) { margin-left: auto; }
      .tb-theme .tb-story-entry { grid-template-columns: minmax(0, 1.1fr) minmax(0, .9fr); gap: clamp(2.5rem, 6vw, 6rem); }
      .tb-theme .tb-story-entry:nth-child(even) .tb-media { grid-column: 2; grid-row: 1; }
      .tb-theme .tb-story-entry:nth-child(even) .tb-story-copy { grid-column: 1; grid-row: 1; }
      .tb-theme .tb-story-text-only { display: block; max-width: 54rem; margin-left: 12%; }
      .tb-theme .tb-gallery-item[data-gallery-span="2"] { width: 82%; }
      .tb-theme .tb-closing > .tb-section-inner { grid-template-columns: minmax(0, 1.15fr) minmax(0, .85fr); gap: 5rem; }
      .tb-theme .tb-closing-text-only > .tb-section-inner { grid-template-columns: minmax(0, 1fr); }
      .tb-theme .tb-closing-image { width: 100%; }
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
