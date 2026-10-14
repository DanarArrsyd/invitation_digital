export function ThemeStyles() {
  return <style>{`
    .rc-theme {
      --rc-paper: #FFF8F0; --rc-white: #FFFCF8; --rc-ink: #29242A;
      --rc-raspberry: #792342; --rc-coral: #DC735F; --rc-blush: #F2D5D5;
      --rc-muted: #655B60; --rc-gutter: clamp(1.25rem, 5vw, 4.5rem);
      --rc-nav-space: calc(62px + max(12px, env(safe-area-inset-bottom)));
      --rc-script: var(--font-rc-script), Georgia, serif;
      --rc-label: var(--font-rc-label), Arial, sans-serif;
      --rc-body: var(--font-rc-text), Arial, sans-serif;
      background: var(--rc-paper); color: var(--rc-ink); color-scheme: light;
      font-family: var(--rc-body); font-size: 1.0625rem; line-height: 1.58;
      overflow-x: clip; overflow-wrap: anywhere; isolation: isolate;
    }
    .rc-theme *, .rc-theme *::before, .rc-theme *::after { box-sizing: border-box; }
    .rc-theme [hidden] { display: none !important; }
    .rc-theme :is(h1, h2, h3, p, blockquote, figure) { margin: 0; }
    .rc-theme :is(h1, h2, h3) { font-family: var(--rc-label); line-height: 1.08; }
    .rc-theme .rc-script { font-family: var(--rc-label); font-weight: 700; letter-spacing: -.065em; }
    .rc-theme .rc-label { font-family: var(--rc-label); font-size: .72rem; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; }
    .rc-theme :is(button, input, textarea, select) { font: inherit; }
    .rc-theme :is(button, a) { -webkit-tap-highlight-color: transparent; }
    .rc-theme :focus-visible { outline: 3px solid var(--rc-raspberry); outline-offset: 4px; }
    .rc-theme a { color: inherit; text-underline-offset: .2em; }
    .rc-theme .rc-gate { min-height: 100svh; }
    .rc-theme .rc-cover { position: fixed; inset: 0; z-index: 50; overflow-y: auto; overflow-x: clip; background: var(--rc-paper); transition: transform .5s ease, opacity .5s ease, visibility 0s .5s; }
    .rc-theme .rc-gate[data-opened="true"] .rc-cover { transform: translateX(-4%); opacity: 0; visibility: hidden; pointer-events: none; }
    .rc-theme .rc-cover-sheet { position: relative; min-height: 100svh; display: grid; place-items: center; padding: clamp(.65rem, 2vw, 1.5rem); }
    .rc-theme .rc-cover-sheet::before, .rc-theme .rc-cover-sheet::after { content: ""; position: absolute; inset: clamp(.75rem, 2.5vw, 2rem); pointer-events: none; }
    .rc-theme .rc-cover-sheet::before { background: var(--rc-coral); transform: rotate(-1.8deg) scale(.965); }
    .rc-theme .rc-cover-sheet::after { background: var(--rc-raspberry); transform: rotate(1.2deg) scale(.975); }
    .rc-theme .rc-cover-layout { position: relative; z-index: 1; display: grid; grid-template-rows: auto 1fr auto; width: min(100%, 1180px); min-height: calc(100svh - clamp(1.3rem, 4vw, 3rem)); gap: 1rem; padding: clamp(1.4rem, 4vw, 3rem); background: var(--rc-paper); border: 1px solid var(--rc-ink); }
    .rc-theme .rc-cover-topline { display: flex; justify-content: space-between; gap: 1rem; border-bottom: 1px solid var(--rc-ink); padding-bottom: .7rem; font-size: .66rem; line-height: 1.2; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
    .rc-theme .rc-cover-title { align-self: center; min-width: 0; padding: clamp(1rem, 5vh, 3rem) 0; }
    .rc-theme .rc-cover-title .rc-label { margin-bottom: clamp(.8rem, 3vh, 1.8rem); color: var(--rc-raspberry); }
    .rc-theme .rc-cover-names { max-width: 100%; font-size: clamp(3rem, 10.8vw, 9.4rem); font-weight: 800; letter-spacing: -.085em; overflow-wrap: anywhere; }
    .rc-theme .rc-cover-names > span { display: block; }
    .rc-theme .rc-cover-names em { display: block; width: max-content; margin-left: clamp(1rem, 18vw, 14rem); color: var(--rc-raspberry); font: italic 400 .78em/1 var(--rc-script); }
    .rc-theme .rc-cover-date { display: block; margin-top: clamp(.8rem, 3vh, 1.8rem); font-size: .88rem; font-weight: 700; letter-spacing: .04em; }
    .rc-theme .rc-cover-recipient { display: flex; align-items: end; justify-content: space-between; gap: 1rem; min-width: 0; padding-top: 1rem; border-top: 1px solid var(--rc-ink); }
    .rc-theme .rc-cover-recipient p:first-child { font-size: .76rem; }
    .rc-theme .rc-guest-name { font-weight: 700; }
    .rc-theme .rc-action, .rc-theme .rc-form-submit { min-height: 50px; padding: .65rem 1.25rem; border: 1px solid var(--rc-raspberry); background: var(--rc-raspberry); color: white; font-size: .78rem; font-weight: 700; letter-spacing: .04em; cursor: pointer; }
    .rc-theme .rc-action:hover, .rc-theme .rc-form-submit:hover:not(:disabled) { background: var(--rc-ink); border-color: var(--rc-ink); }
    .rc-theme .rc-action:disabled, .rc-theme .rc-form-submit:disabled { opacity: .65; cursor: default; }
    .rc-theme .rc-content { padding-bottom: var(--rc-nav-space); }
    .rc-theme .rc-section { position: relative; padding: clamp(4rem, 8vw, 8rem) var(--rc-gutter); }
    .rc-theme .rc-section-inner { width: min(100%, 1220px); margin-inline: auto; }
    .rc-theme .rc-surface-paper { background: var(--rc-paper); }
    .rc-theme .rc-surface-white { background: var(--rc-white); }
    .rc-theme .rc-surface-blush { background: var(--rc-blush); }
    .rc-theme .rc-surface-ink { background: var(--rc-raspberry); color: white; }
    .rc-theme .rc-section-heading { display: flex; justify-content: space-between; align-items: end; flex-wrap: wrap; gap: 1rem 2rem; margin-bottom: clamp(2rem, 5vw, 4rem); padding-bottom: .9rem; border-bottom: 1px solid currentColor; }
    .rc-theme .rc-section-heading h2 { font-size: clamp(2.6rem, 6vw, 5.7rem); font-weight: 750; letter-spacing: -.075em; }
    .rc-theme .rc-section-intro { max-width: 25rem; font-size: .95rem; }
    .rc-theme .rc-media { position: relative; overflow: hidden; background: var(--rc-blush); }
    .rc-theme .rc-media img { object-fit: cover; }
    .rc-theme .rc-image-fallback { display: grid; place-content: center; gap: .5rem; width: 100%; height: 100%; padding: 1rem; text-align: center; color: var(--rc-raspberry); }
    .rc-theme .rc-image-fallback-mark, .rc-theme .rc-hero-mark, .rc-theme .rc-closing-mark { font: italic 400 clamp(3rem, 10vw, 7rem)/1 var(--rc-script); }
    .rc-theme .rc-image-fallback span:last-child { font-size: .75rem; }
    .rc-theme .rc-hero .rc-section-inner { display: grid; align-items: center; gap: clamp(2rem, 6vw, 6rem); }
    .rc-theme .rc-hero-copy { max-width: 45rem; }
    .rc-theme .rc-hero-copy h2 { font-size: clamp(3.6rem, 9vw, 8.5rem); line-height: .98; }
    .rc-theme .rc-hero-copy p { max-width: 37rem; margin-top: 2rem; }
    .rc-theme .rc-hero-image { width: min(100%, 520px); aspect-ratio: 3/4; }
    .rc-theme .rc-hero-text-only .rc-section-inner { min-height: 55svh; }
    .rc-theme .rc-hero-mark { justify-self: end; color: var(--rc-coral); }
    .rc-theme .rc-quote { padding: clamp(3rem, 7vw, 6rem) var(--rc-gutter); background: var(--rc-blush); }
    .rc-theme .rc-quote-sheet { display: grid; grid-template-columns: auto 1fr; gap: 1rem; width: min(100%, 960px); margin: auto; }
    .rc-theme .rc-quote-mark { color: var(--rc-raspberry); font: italic 400 5rem/1 var(--rc-script); }
    .rc-theme .rc-quote blockquote { align-self: center; font: italic 400 clamp(1.7rem, 4vw, 3.3rem)/1.2 var(--rc-script); }
    .rc-theme .rc-people { display: grid; gap: 3rem; }
    .rc-theme .rc-person { display: grid; gap: 1.5rem; align-items: center; }
    .rc-theme .rc-person-portrait { width: 100%; aspect-ratio: 4/5; }
    .rc-theme .rc-person-copy h3 { font-size: clamp(2.2rem, 4vw, 4.5rem); }
    .rc-theme .rc-parents { margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid currentColor; }
    .rc-theme .rc-parents p:first-child { font-size: .78rem; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; }
    .rc-theme .rc-person-bio, .rc-theme .rc-instagram { display: block; margin-top: 1rem; }
    .rc-theme .rc-event-list, .rc-theme .rc-story-entries, .rc-theme .rc-wishes-list, .rc-theme .rc-gift-list { margin: 0; padding: 0; list-style: none; }
    .rc-theme .rc-event { display: grid; grid-template-columns: 2.5rem 1fr; gap: .8rem; padding: 1.7rem 0; border-top: 1px solid var(--rc-ink); }
    .rc-theme .rc-event:first-child { padding-top: 0; border-top: 0; }
    .rc-theme .rc-event-index, .rc-theme .rc-story-date { color: var(--rc-raspberry); font-size: .76rem; font-weight: 700; }
    .rc-theme .rc-event-main h3 { margin-bottom: .8rem; font-size: clamp(1.6rem, 3vw, 2.5rem); font-weight: 700; letter-spacing: -.04em; }
    .rc-theme .rc-event-main time, .rc-theme .rc-event-time { display: block; font-weight: 650; }
    .rc-theme .rc-event-place { grid-column: 2; }
    .rc-theme .rc-event-venue { font-weight: 700; }
    .rc-theme .rc-event-address { color: var(--rc-muted); }
    .rc-theme .rc-text-action { display: inline-flex; align-items: center; gap: .5rem; min-height: 44px; margin-top: .6rem; color: var(--rc-raspberry); font-size: .82rem; font-weight: 700; }
    .rc-theme .rc-countdown-units { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .5rem; margin: 0 0 2rem; }
    .rc-theme .rc-countdown-units div { border-top: 1px solid currentColor; padding-top: .7rem; }
    .rc-theme .rc-countdown-units dt { font-size: .7rem; text-transform: uppercase; letter-spacing: .1em; }
    .rc-theme .rc-countdown-units dd { margin: 0; font-size: clamp(2rem, 7vw, 6rem); font-weight: 750; letter-spacing: -.08em; line-height: 1.15; }
    .rc-theme .rc-calendar-actions { display: flex; flex-wrap: wrap; gap: .6rem; }
    .rc-theme .rc-calendar-actions :is(a, button), .rc-theme .rc-livestream a { display: inline-flex; align-items: center; gap: .5rem; min-height: 48px; padding: .6rem .9rem; border: 1px solid currentColor; background: transparent; color: inherit; text-decoration: none; font-size: .82rem; font-weight: 700; cursor: pointer; }
    .rc-theme .rc-dress-description { max-width: 45rem; }
    .rc-theme .rc-dress-groups { display: flex; flex-wrap: wrap; gap: 2rem; margin-top: 2rem; }
    .rc-theme .rc-dress-group h3 { margin-bottom: .5rem; font-size: 1.1rem; }
    .rc-theme .rc-dress-group ul { display: flex; gap: .5rem; padding: 0; margin: 0; list-style: none; }
    .rc-theme .rc-dress-swatch { display: block; width: 2.3rem; height: 2.3rem; border: 1px solid var(--rc-ink); border-radius: 50%; }
    .rc-theme .rc-story-entry { display: grid; gap: 1.5rem; padding: 2rem 0; border-top: 1px solid var(--rc-ink); }
    .rc-theme .rc-story-entry .rc-media { width: 100%; }
    .rc-theme .rc-story-copy h3 { margin: .5rem 0 1rem; font-size: clamp(1.8rem, 3vw, 3rem); letter-spacing: -.05em; }
    .rc-theme .rc-story-description { max-width: 35rem; }
    .rc-theme .rc-gallery-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .75rem; }
    .rc-theme .rc-gallery-item[data-gallery-span="2"] { grid-column: span 2; }
    .rc-theme .rc-gallery-item .rc-media { width: 100%; }
    .rc-theme .rc-gallery-item figcaption { padding: .5rem 0 1rem; font-size: .76rem; }
    .rc-theme .rc-gallery-zoom { display: block; width: 100%; padding: 0; border: 0; background: none; cursor: zoom-in; }
    .rc-theme .rc-gallery-zoom:focus-visible { outline-color: var(--rc-raspberry); }
    .rc-theme .rc-livestream ul { margin: 0; padding: 0; list-style: none; }
    .rc-theme .rc-livestream li + li { margin-top: .75rem; }
    .rc-theme .rc-interaction-intro { max-width: 34rem; }
    .rc-theme .rc-form { display: grid; gap: 1rem; max-width: 37rem; }
    .rc-theme .rc-form-field { display: grid; gap: .45rem; font-size: .8rem; font-weight: 700; }
    .rc-theme .rc-form-field :is(input, textarea) { width: 100%; min-height: 48px; padding: .8rem .9rem; border: 1px solid currentColor; border-radius: 0; background: var(--rc-white); color: var(--rc-ink); font-size: 1rem; font-weight: 400; }
    .rc-theme .rc-form-field textarea { min-height: 8rem; resize: vertical; }
    .rc-theme .rc-form-recipient { display: grid; gap: .3rem; padding: .9rem 0; border-block: 1px solid currentColor; }
    .rc-theme .rc-form-recipient span { font-size: .78rem; }
    .rc-theme .rc-attendance { margin: 0; padding: 0; border: 0; }
    .rc-theme .rc-attendance legend { margin-bottom: .5rem; font-size: .8rem; font-weight: 700; }
    .rc-theme .rc-attendance-choices { display: flex; flex-wrap: wrap; gap: .5rem; }
    .rc-theme .rc-attendance-choices button { min-height: 48px; padding: .6rem 1rem; border: 1px solid currentColor; background: transparent; color: inherit; cursor: pointer; }
    .rc-theme .rc-attendance-choices button[aria-pressed="true"] { background: var(--rc-white); color: var(--rc-raspberry); border-color: var(--rc-white); font-weight: 700; }
    .rc-theme .rc-form-error { color: #FFD4D4; font-weight: 700; }
    .rc-theme .rc-wishes .rc-form-error { color: var(--rc-raspberry); }
    .rc-theme .rc-form-success { padding: 1.5rem; border: 1px solid currentColor; font-weight: 650; }
    .rc-theme .rc-rsvp .rc-form-submit { background: var(--rc-white); border-color: var(--rc-white); color: var(--rc-raspberry); }
    .rc-theme .rc-wishes .rc-form-submit { background: var(--rc-raspberry); border-color: var(--rc-raspberry); color: var(--rc-white); }
    .rc-theme .rc-rsvp .rc-form-submit:hover:not(:disabled), .rc-theme .rc-wishes .rc-form-submit:hover:not(:disabled) { background: var(--rc-ink); border-color: var(--rc-ink); color: white; }
    .rc-theme .rc-wishes-feed { margin-top: 3rem; }
    .rc-theme .rc-wishes-list li { padding: 1rem 0; border-top: 1px solid currentColor; }
    .rc-theme .rc-wish-meta { display: flex; flex-wrap: wrap; justify-content: space-between; gap: .5rem; font-size: .76rem; }
    .rc-theme .rc-wishes-list p { margin-top: .6rem; }
    .rc-theme .rc-wishes-empty { opacity: .85; }
    .rc-theme .rc-more-wishes { min-height: 48px; margin-top: 1rem; border: 1px solid currentColor; padding: .6rem 1rem; background: transparent; color: inherit; cursor: pointer; }
    .rc-theme .rc-wish-confirmation { display: block; margin-top: .5rem; font: italic 400 1.5rem var(--rc-script); }
    .rc-theme .rc-gift-account { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 1rem; padding: 1.2rem 0; border-top: 1px solid var(--rc-ink); }
    .rc-theme .rc-gift-provider { font-size: .75rem; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; }
    .rc-theme .rc-gift-number { margin: .5rem 0; font-size: clamp(1.3rem, 4vw, 2rem); font-weight: 700; }
    .rc-theme .rc-gift-owner { font-size: .85rem; }
    .rc-theme .rc-gift-account > button { align-self: center; min-height: 48px; padding: .6rem 1rem; border: 1px solid var(--rc-raspberry); background: transparent; color: var(--rc-raspberry); font-size: .8rem; font-weight: 700; cursor: pointer; }
    .rc-theme .rc-gift-copy-status { color: var(--rc-raspberry); font-size: .76rem; }
    .rc-theme .rc-gift-copy-status:empty { display: none; }
    .rc-theme .rc-closing .rc-section-inner { display: grid; align-items: center; gap: 2rem; }
    .rc-theme .rc-closing-mark { display: block; color: var(--rc-blush); }
    .rc-theme .rc-closing-copy h2 { max-width: 11ch; margin: 1rem 0; font-size: clamp(3rem, 7vw, 7rem); }
    .rc-theme .rc-closing-copy p { max-width: 35rem; }
    .rc-theme .rc-closing-image { width: min(100%, 400px); }
    .rc-theme .rc-nav { position: fixed; z-index: 45; bottom: max(12px, env(safe-area-inset-bottom)); left: 50%; width: min(calc(100% - 1rem), 850px); transform: translateX(-50%); border: 1px solid var(--rc-ink); background: var(--rc-white); color: var(--rc-ink); }
    .rc-theme .rc-nav ul { display: flex; overflow-x: auto; scrollbar-width: none; scroll-snap-type: x mandatory; margin: 0; padding: 3px; list-style: none; }
    .rc-theme .rc-nav ul::-webkit-scrollbar { display: none; }
    .rc-theme .rc-nav li { flex: 1 0 calc(100% / 5.4); min-width: 0; scroll-snap-align: center; }
    .rc-theme .rc-nav a { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: .1rem; min-height: 52px; padding: .2rem .1rem; color: inherit; font-size: .68rem; line-height: 1.1; font-weight: 700; text-decoration: none; }
    .rc-theme .rc-nav a[aria-current="location"] { background: var(--rc-raspberry); color: white; }
    .rc-theme .rc-nav-icon { width: clamp(18px, 5.2vw, 22px); height: clamp(18px, 5.2vw, 22px); flex: none; }
    .rc-theme .rc-nav-label { white-space: nowrap; }
    .rc-theme .rc-music { position: fixed; z-index: 46; right: 1rem; bottom: calc(var(--rc-nav-space) + 1rem); display: grid; place-items: center; width: 48px; height: 48px; border: 1px solid var(--rc-ink); border-radius: 50%; background: var(--rc-white); color: var(--rc-raspberry); cursor: pointer; }
    .rc-theme .rc-lightbox { width: 100vw; max-width: 100vw; height: 100svh; max-height: 100svh; margin: 0; padding: 0; border: 0; background: transparent; color: white; }
    .rc-theme .rc-lightbox::backdrop { background: rgba(25, 18, 24, .94); }
    .rc-theme .rc-lightbox-body { display: flex; flex-direction: column; height: 100%; padding: max(1rem, env(safe-area-inset-top)) var(--rc-gutter) max(1rem, env(safe-area-inset-bottom)); pointer-events: none; }
    .rc-theme .rc-lightbox-frame { position: relative; flex: 1; min-height: 0; }
    .rc-theme .rc-lightbox-frame > * { position: absolute; inset: 0; background: transparent; }
    .rc-theme .rc-lightbox-frame img { object-fit: contain; }
    .rc-theme .rc-lightbox-bar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: .75rem; padding-top: 1rem; pointer-events: auto; }
    .rc-theme .rc-lightbox-caption { margin: 0; font-size: .82rem; }
    .rc-theme .rc-lightbox-btn { min-width: 44px; min-height: 44px; padding: .5rem; border: 1px solid white; background: transparent; color: white; cursor: pointer; }
    @media (min-width: 768px) {
      .rc-theme .rc-hero .rc-section-inner { grid-template-columns: 1fr minmax(0, .75fr); }
      .rc-theme .rc-person { grid-template-columns: minmax(0, .8fr) 1fr; gap: clamp(2rem, 6vw, 6rem); }
      .rc-theme .rc-person:nth-child(even) .rc-media { order: 2; }
      .rc-theme .rc-event { grid-template-columns: 3rem minmax(0, 1fr) minmax(0, .8fr); }
      .rc-theme .rc-event-place { grid-column: auto; }
      .rc-theme .rc-story-entry { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 3rem; align-items: center; }
      .rc-theme .rc-gallery-grid { gap: 1.25rem; }
      .rc-theme .rc-interaction-body { max-width: 38rem; margin-left: auto; }
      .rc-theme .rc-closing .rc-section-inner { grid-template-columns: 1fr .7fr; }
      .rc-theme .rc-nav li { flex: 1 1 auto; }
      .rc-theme .rc-nav a { padding: .3rem .35rem; }
    }
    @media (max-width: 767px) {
      .rc-theme .rc-cover-recipient { align-items: stretch; flex-direction: column; }
      .rc-theme .rc-action { width: 100%; }
      .rc-theme .rc-nav-label { font-size: .68rem; }
    }
    @media (max-width: 360px) {
      .rc-theme .rc-nav-label { font-size: .66rem; letter-spacing: -.02em; }
      .rc-theme .rc-cover-names { font-size: clamp(2.65rem, 12.5vw, 4rem); }
    }
    @media (max-height: 700px) {
      .rc-theme .rc-cover-layout { row-gap: .5rem; padding-block: .9rem; }
      .rc-theme .rc-cover-title { padding-block: .5rem; }
      .rc-theme .rc-cover-names { font-size: clamp(2.8rem, 9vh, 5.5rem); }
      .rc-theme .rc-cover-date { margin-top: .5rem; }
      .rc-theme .rc-cover-recipient { padding-top: .5rem; }
    }
    @media (prefers-reduced-motion: reduce) {
      .rc-theme *, .rc-theme *::before, .rc-theme *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; }
    }
  `}</style>;
}
