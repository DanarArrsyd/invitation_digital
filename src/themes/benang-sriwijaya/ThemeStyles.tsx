export function ThemeStyles() {
  return <style>{`
    .bs-theme {
      --bs-ground: #F6F0E6; --bs-light: #FFFBF5; --bs-ink: #30251F;
      --bs-plum: #512735; --bs-thread: #A97C42; --bs-blush: #EFE1D9; --bs-rule: #C4AA9A;
      --bs-muted: #725F57; --bs-gutter: clamp(1.25rem, 5vw, 4.5rem);
      --bs-nav-space: calc(62px + max(12px, env(safe-area-inset-bottom)));
      --bs-script: var(--font-bs-script), Georgia, serif;
      --bs-label: var(--font-bs-label), Arial, sans-serif;
      --bs-body: var(--font-bs-text), Arial, sans-serif;
      background: var(--bs-ground); color: var(--bs-ink); color-scheme: light;
      font-family: var(--bs-body); font-size: 1.0625rem; line-height: 1.58;
      overflow-x: clip; overflow-wrap: anywhere; isolation: isolate;
    }
    .bs-theme *, .bs-theme *::before, .bs-theme *::after { box-sizing: border-box; }
    .bs-theme [hidden] { display: none !important; }
    .bs-theme :is(h1, h2, h3, p, blockquote, figure) { margin: 0; }
    .bs-theme :is(h1, h2, h3) { font-family: var(--bs-label); line-height: 1.08; }
    .bs-theme .bs-script { font-family: var(--bs-label); font-weight: 700; letter-spacing: -.065em; }
    .bs-theme .bs-label { font-family: var(--bs-label); font-size: .72rem; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; }
    .bs-theme :is(button, input, textarea, select) { font: inherit; }
    .bs-theme :is(button, a) { -webkit-tap-highlight-color: transparent; }
    .bs-theme :focus-visible { outline: 3px solid var(--bs-plum); outline-offset: 4px; }
    .bs-theme a { color: inherit; text-underline-offset: .2em; }
    .bs-theme .bs-gate { min-height: 100svh; }
    .bs-theme .bs-cover { position: fixed; inset: 0; z-index: 50; overflow-y: auto; overflow-x: clip; background: var(--bs-ground); transition: transform .5s ease, opacity .5s ease, visibility 0s .5s; }
    .bs-theme .bs-gate[data-opened="true"] .bs-cover { transform: translateX(-4%); opacity: 0; visibility: hidden; pointer-events: none; }
    .bs-theme .bs-cover-frame { position: relative; min-height: 100svh; display: grid; place-items: center; padding: clamp(.65rem, 2vw, 1.5rem); }
    .bs-theme .bs-cover-frame::before, .bs-theme .bs-cover-frame::after { content: ""; position: absolute; inset: clamp(.75rem, 2.5vw, 2rem); pointer-events: none; }
    .bs-theme .bs-cover-frame::before { background: var(--bs-thread); transform: rotate(-1.8deg) scale(.965); }
    .bs-theme .bs-cover-frame::after { background: var(--bs-plum); transform: rotate(1.2deg) scale(.975); }
    .bs-theme .bs-cover-layout { position: relative; z-index: 1; display: grid; grid-template-rows: auto 1fr auto; width: min(100%, 1180px); min-height: calc(100svh - clamp(1.3rem, 4vw, 3rem)); gap: 1rem; padding: clamp(1.4rem, 4vw, 3rem); background: var(--bs-ground); border: 1px solid var(--bs-ink); }
    .bs-theme .bs-cover-topline { display: flex; justify-content: space-between; gap: 1rem; border-bottom: 1px solid var(--bs-ink); padding-bottom: .7rem; font-size: .66rem; line-height: 1.2; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
    .bs-theme .bs-cover-title { align-self: center; min-width: 0; padding: clamp(1rem, 5vh, 3rem) 0; }
    .bs-theme .bs-cover-title .bs-label { margin-bottom: clamp(.8rem, 3vh, 1.8rem); color: var(--bs-plum); }
    .bs-theme .bs-cover-names { max-width: 100%; font-size: clamp(3rem, 10.8vw, 9.4rem); font-weight: 700; letter-spacing: -.085em; overflow-wrap: anywhere; }
    .bs-theme .bs-cover-names > span { display: block; }
    .bs-theme .bs-cover-names em { display: block; width: max-content; margin-left: clamp(1rem, 18vw, 14rem); color: var(--bs-plum); font: italic 400 .78em/1 var(--bs-script); }
    .bs-theme .bs-cover-date { display: block; margin-top: clamp(.8rem, 3vh, 1.8rem); font-size: .88rem; font-weight: 700; letter-spacing: .04em; }
    .bs-theme .bs-cover-recipient { display: flex; align-items: end; justify-content: space-between; gap: 1rem; min-width: 0; padding-top: 1rem; border-top: 1px solid var(--bs-ink); }
    .bs-theme .bs-cover-recipient p:first-child { font-size: .76rem; }
    .bs-theme .bs-guest-name { font-weight: 700; }
    .bs-theme .bs-action, .bs-theme .bs-form-submit { min-height: 50px; padding: .65rem 1.25rem; border: 1px solid var(--bs-plum); background: var(--bs-plum); color: white; font-size: .78rem; font-weight: 700; letter-spacing: .04em; cursor: pointer; }
    .bs-theme .bs-action:hover, .bs-theme .bs-form-submit:hover:not(:disabled) { background: var(--bs-ink); border-color: var(--bs-ink); }
    .bs-theme .bs-action:disabled, .bs-theme .bs-form-submit:disabled { opacity: .65; cursor: default; }
    .bs-theme .bs-content { padding-bottom: var(--bs-nav-space); }
    .bs-theme .bs-section { position: relative; padding: clamp(4rem, 8vw, 8rem) var(--bs-gutter); }
    .bs-theme .bs-section-inner { width: min(100%, 1220px); margin-inline: auto; }
    .bs-theme .bs-surface-ground { background: var(--bs-ground); }
    .bs-theme .bs-surface-light { background: var(--bs-light); }
    .bs-theme .bs-surface-blush { background: var(--bs-blush); }
    .bs-theme .bs-surface-plum { background: var(--bs-plum); color: white; }
    .bs-theme .bs-section-heading { display: flex; justify-content: space-between; align-items: end; flex-wrap: wrap; gap: 1rem 2rem; margin-bottom: clamp(2rem, 5vw, 4rem); padding-bottom: .9rem; border-bottom: 1px solid currentColor; }
    .bs-theme .bs-section-heading h2 { font-size: clamp(2.6rem, 6vw, 5.7rem); font-weight: 750; letter-spacing: -.075em; }
    .bs-theme .bs-section-intro { max-width: 25rem; font-size: .95rem; }
    .bs-theme .bs-media { position: relative; overflow: hidden; background: var(--bs-blush); }
    .bs-theme .bs-media img { object-fit: cover; }
    .bs-theme .bs-image-fallback { display: grid; place-content: center; gap: .5rem; width: 100%; height: 100%; padding: 1rem; text-align: center; color: var(--bs-plum); }
    .bs-theme .bs-image-fallback-mark, .bs-theme .bs-hero-mark, .bs-theme .bs-closing-mark { font: italic 400 clamp(3rem, 10vw, 7rem)/1 var(--bs-script); }
    .bs-theme .bs-image-fallback span:last-child { font-size: .75rem; }
    .bs-theme .bs-hero .bs-section-inner { display: grid; align-items: center; gap: clamp(2rem, 6vw, 6rem); }
    .bs-theme .bs-hero-copy { max-width: 45rem; }
    .bs-theme .bs-hero-copy h2 { font-size: clamp(3.6rem, 9vw, 8.5rem); line-height: .98; }
    .bs-theme .bs-hero-copy p { max-width: 37rem; margin-top: 2rem; }
    .bs-theme .bs-hero-image { width: min(100%, 520px); aspect-ratio: 3/4; }
    .bs-theme .bs-hero-text-only .bs-section-inner { min-height: 55svh; }
    .bs-theme .bs-hero-mark { justify-self: end; color: var(--bs-thread); }
    .bs-theme .bs-quote { padding: clamp(3rem, 7vw, 6rem) var(--bs-gutter); background: var(--bs-blush); }
    .bs-theme .bs-quote-frame { display: grid; grid-template-columns: auto 1fr; gap: 1rem; width: min(100%, 960px); margin: auto; }
    .bs-theme .bs-quote-mark { color: var(--bs-plum); font: italic 400 5rem/1 var(--bs-script); }
    .bs-theme .bs-quote blockquote { align-self: center; font: italic 400 clamp(1.7rem, 4vw, 3.3rem)/1.2 var(--bs-script); }
    .bs-theme .bs-people { display: grid; gap: 3rem; }
    .bs-theme .bs-person { display: grid; gap: 1.5rem; align-items: center; }
    .bs-theme .bs-person-portrait { width: 100%; aspect-ratio: 4/5; }
    .bs-theme .bs-person-copy h3 { font-size: clamp(2.2rem, 4vw, 4.5rem); }
    .bs-theme .bs-parents { margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid currentColor; }
    .bs-theme .bs-parents p:first-child { font-size: .78rem; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; }
    .bs-theme .bs-person-bio, .bs-theme .bs-instagram { display: block; margin-top: 1rem; }
    .bs-theme .bs-event-list, .bs-theme .bs-story-entries, .bs-theme .bs-wishes-list, .bs-theme .bs-gift-list { margin: 0; padding: 0; list-style: none; }
    .bs-theme .bs-event { display: grid; grid-template-columns: 2.5rem 1fr; gap: .8rem; padding: 1.7rem 0; border-top: 1px solid var(--bs-ink); }
    .bs-theme .bs-event:first-child { padding-top: 0; border-top: 0; }
    .bs-theme .bs-event-index, .bs-theme .bs-story-date { color: var(--bs-plum); font-size: .76rem; font-weight: 700; }
    .bs-theme .bs-event-main h3 { margin-bottom: .8rem; font-size: clamp(1.6rem, 3vw, 2.5rem); font-weight: 700; letter-spacing: -.04em; }
    .bs-theme .bs-event-main time, .bs-theme .bs-event-time { display: block; font-weight: 650; }
    .bs-theme .bs-event-place { grid-column: 2; }
    .bs-theme .bs-event-venue { font-weight: 700; }
    .bs-theme .bs-event-address { color: var(--bs-muted); }
    .bs-theme .bs-text-action { display: inline-flex; align-items: center; gap: .5rem; min-height: 44px; margin-top: .6rem; color: var(--bs-plum); font-size: .82rem; font-weight: 700; }
    .bs-theme .bs-countdown-units { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .5rem; margin: 0 0 2rem; }
    .bs-theme .bs-countdown-units div { border-top: 1px solid currentColor; padding-top: .7rem; }
    .bs-theme .bs-countdown-units dt { font-size: .7rem; text-transform: uppercase; letter-spacing: .1em; }
    .bs-theme .bs-countdown-units dd { margin: 0; font-size: clamp(2rem, 7vw, 6rem); font-weight: 750; letter-spacing: -.08em; line-height: 1.15; }
    .bs-theme .bs-calendar-actions { display: flex; flex-wrap: wrap; gap: .6rem; }
    .bs-theme .bs-calendar-actions :is(a, button), .bs-theme .bs-livestream a { display: inline-flex; align-items: center; gap: .5rem; min-height: 48px; padding: .6rem .9rem; border: 1px solid currentColor; background: transparent; color: inherit; text-decoration: none; font-size: .82rem; font-weight: 700; cursor: pointer; }
    .bs-theme .bs-dress-description { max-width: 45rem; }
    .bs-theme .bs-dress-groups { display: flex; flex-wrap: wrap; gap: 2rem; margin-top: 2rem; }
    .bs-theme .bs-dress-group h3 { margin-bottom: .5rem; font-size: 1.1rem; }
    .bs-theme .bs-dress-group ul { display: flex; gap: .5rem; padding: 0; margin: 0; list-style: none; }
    .bs-theme .bs-dress-swatch { display: block; width: 2.3rem; height: 2.3rem; border: 1px solid var(--bs-ink); border-radius: 50%; }
    .bs-theme .bs-story-entry { display: grid; gap: 1.5rem; padding: 2rem 0; border-top: 1px solid var(--bs-ink); }
    .bs-theme .bs-story-entry .bs-media { width: 100%; }
    .bs-theme .bs-story-copy h3 { margin: .5rem 0 1rem; font-size: clamp(1.8rem, 3vw, 3rem); letter-spacing: -.05em; }
    .bs-theme .bs-story-description { max-width: 35rem; }
    .bs-theme .bs-gallery-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .75rem; }
    .bs-theme .bs-gallery-item[data-gallery-span="2"] { grid-column: span 2; }
    .bs-theme .bs-gallery-item .bs-media { width: 100%; }
    .bs-theme .bs-gallery-item figcaption { padding: .5rem 0 1rem; font-size: .76rem; }
    .bs-theme .bs-gallery-zoom { display: block; width: 100%; padding: 0; border: 0; background: none; cursor: zoom-in; }
    .bs-theme .bs-gallery-zoom:focus-visible { outline-color: var(--bs-plum); }
    .bs-theme .bs-livestream ul { margin: 0; padding: 0; list-style: none; }
    .bs-theme .bs-livestream li + li { margin-top: .75rem; }
    .bs-theme .bs-interaction-intro { max-width: 34rem; }
    .bs-theme .bs-form { display: grid; gap: 1rem; max-width: 37rem; }
    .bs-theme .bs-form-field { display: grid; gap: .45rem; font-size: .8rem; font-weight: 700; }
    .bs-theme .bs-form-field :is(input, textarea) { width: 100%; min-height: 48px; padding: .8rem .9rem; border: 1px solid currentColor; border-radius: 0; background: var(--bs-light); color: var(--bs-ink); font-size: 1rem; font-weight: 400; }
    .bs-theme .bs-form-field textarea { min-height: 8rem; resize: vertical; }
    .bs-theme .bs-form-recipient { display: grid; gap: .3rem; padding: .9rem 0; border-block: 1px solid currentColor; }
    .bs-theme .bs-form-recipient span { font-size: .78rem; }
    .bs-theme .bs-attendance { margin: 0; padding: 0; border: 0; }
    .bs-theme .bs-attendance legend { margin-bottom: .5rem; font-size: .8rem; font-weight: 700; }
    .bs-theme .bs-attendance-choices { display: flex; flex-wrap: wrap; gap: .5rem; }
    .bs-theme .bs-attendance-choices button { min-height: 48px; padding: .6rem 1rem; border: 1px solid currentColor; background: transparent; color: inherit; cursor: pointer; }
    .bs-theme .bs-attendance-choices button[aria-pressed="true"] { background: var(--bs-light); color: var(--bs-plum); border-color: var(--bs-light); font-weight: 700; }
    .bs-theme .bs-form-error { color: #FFD4D4; font-weight: 700; }
    .bs-theme .bs-wishes .bs-form-error { color: var(--bs-plum); }
    .bs-theme .bs-form-success { padding: 1.5rem; border: 1px solid currentColor; font-weight: 650; }
    .bs-theme .bs-rsvp .bs-form-submit { background: var(--bs-light); border-color: var(--bs-light); color: var(--bs-plum); }
    .bs-theme .bs-wishes .bs-form-submit { background: var(--bs-plum); border-color: var(--bs-plum); color: var(--bs-light); }
    .bs-theme .bs-rsvp .bs-form-submit:hover:not(:disabled), .bs-theme .bs-wishes .bs-form-submit:hover:not(:disabled) { background: var(--bs-ink); border-color: var(--bs-ink); color: white; }
    .bs-theme .bs-wishes-feed { margin-top: 3rem; }
    .bs-theme .bs-wishes-list li { padding: 1rem 0; border-top: 1px solid currentColor; }
    .bs-theme .bs-wish-meta { display: flex; flex-wrap: wrap; justify-content: space-between; gap: .5rem; font-size: .76rem; }
    .bs-theme .bs-wishes-list p { margin-top: .6rem; }
    .bs-theme .bs-wishes-empty { opacity: .85; }
    .bs-theme .bs-more-wishes { min-height: 48px; margin-top: 1rem; border: 1px solid currentColor; padding: .6rem 1rem; background: transparent; color: inherit; cursor: pointer; }
    .bs-theme .bs-wish-confirmation { display: block; margin-top: .5rem; font: italic 400 1.5rem var(--bs-script); }
    .bs-theme .bs-gift-account { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 1rem; padding: 1.2rem 0; border-top: 1px solid var(--bs-ink); }
    .bs-theme .bs-gift-provider { font-size: .75rem; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; }
    .bs-theme .bs-gift-number { margin: .5rem 0; font-size: clamp(1.3rem, 4vw, 2rem); font-weight: 700; }
    .bs-theme .bs-gift-owner { font-size: .85rem; }
    .bs-theme .bs-gift-account > button { align-self: center; min-height: 48px; padding: .6rem 1rem; border: 1px solid var(--bs-plum); background: transparent; color: var(--bs-plum); font-size: .8rem; font-weight: 700; cursor: pointer; }
    .bs-theme .bs-gift-copy-status { color: var(--bs-plum); font-size: .76rem; }
    .bs-theme .bs-gift-copy-status:empty { display: none; }
    .bs-theme .bs-closing .bs-section-inner { display: grid; align-items: center; gap: 2rem; }
    .bs-theme .bs-closing-mark { display: block; color: var(--bs-blush); }
    .bs-theme .bs-closing-copy h2 { max-width: 11ch; margin: 1rem 0; font-size: clamp(3rem, 7vw, 7rem); }
    .bs-theme .bs-closing-copy p { max-width: 35rem; }
    .bs-theme .bs-closing-image { width: min(100%, 400px); }
    .bs-theme .bs-nav { position: fixed; z-index: 45; bottom: max(12px, env(safe-area-inset-bottom)); left: 50%; width: min(calc(100% - 1rem), 850px); transform: translateX(-50%); border: 1px solid var(--bs-ink); background: var(--bs-light); color: var(--bs-ink); }
    .bs-theme .bs-nav ul { display: flex; overflow-x: auto; scrollbar-width: none; scroll-snap-type: x mandatory; margin: 0; padding: 3px; list-style: none; }
    .bs-theme .bs-nav ul::-webkit-scrollbar { display: none; }
    .bs-theme .bs-nav li { flex: 1 0 calc(100% / 5.4); min-width: 0; scroll-snap-align: center; }
    .bs-theme .bs-nav a { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: .1rem; min-height: 52px; padding: .2rem .1rem; color: inherit; font-size: .68rem; line-height: 1.1; font-weight: 700; text-decoration: none; }
    .bs-theme .bs-nav a[aria-current="location"] { background: var(--bs-plum); color: white; }
    .bs-theme .bs-nav-icon { width: clamp(18px, 5.2vw, 22px); height: clamp(18px, 5.2vw, 22px); flex: none; }
    .bs-theme .bs-nav-label { white-space: nowrap; }
    .bs-theme .bs-music { position: fixed; z-index: 46; right: 1rem; bottom: calc(var(--bs-nav-space) + 1rem); display: grid; place-items: center; width: 48px; height: 48px; border: 1px solid var(--bs-ink); border-radius: 50%; background: var(--bs-light); color: var(--bs-plum); cursor: pointer; }
    .bs-theme .bs-lightbox { width: 100vw; max-width: 100vw; height: 100svh; max-height: 100svh; margin: 0; padding: 0; border: 0; background: transparent; color: white; }
    .bs-theme .bs-lightbox::backdrop { background: rgba(20, 27, 31, .96); }
    .bs-theme .bs-lightbox-body { display: flex; flex-direction: column; height: 100%; padding: max(1rem, env(safe-area-inset-top)) var(--bs-gutter) max(1rem, env(safe-area-inset-bottom)); pointer-events: none; }
    .bs-theme .bs-lightbox-frame { position: relative; flex: 1; min-height: 0; }
    .bs-theme .bs-lightbox-frame > * { position: absolute; inset: 0; background: transparent; }
    .bs-theme .bs-lightbox-frame img { object-fit: contain; }
    .bs-theme .bs-lightbox-bar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: .75rem; padding-top: 1rem; pointer-events: auto; }
    .bs-theme .bs-lightbox-caption { margin: 0; font-size: .82rem; }
    .bs-theme .bs-lightbox-btn { min-width: 44px; min-height: 44px; padding: .5rem; border: 1px solid white; background: transparent; color: white; cursor: pointer; }
    @media (min-width: 768px) {
      .bs-theme .bs-hero .bs-section-inner { grid-template-columns: 1fr minmax(0, .75fr); }
      .bs-theme .bs-person { grid-template-columns: minmax(0, .8fr) 1fr; gap: clamp(2rem, 6vw, 6rem); }
      .bs-theme .bs-person:nth-child(even) .bs-media { order: 2; }
      .bs-theme .bs-event { grid-template-columns: 3rem minmax(0, 1fr) minmax(0, .8fr); }
      .bs-theme .bs-event-place { grid-column: auto; }
      .bs-theme .bs-story-entry { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 3rem; align-items: center; }
      .bs-theme .bs-gallery-grid { gap: 1.25rem; }
      .bs-theme .bs-interaction-body { max-width: 38rem; margin-left: auto; }
      .bs-theme .bs-closing .bs-section-inner { grid-template-columns: 1fr .7fr; }
      .bs-theme .bs-nav li { flex: 1 1 auto; }
      .bs-theme .bs-nav a { padding: .3rem .35rem; }
    }
    @media (max-width: 767px) {
      .bs-theme .bs-cover-recipient { align-items: stretch; flex-direction: column; }
      .bs-theme .bs-action { width: 100%; }
      .bs-theme .bs-nav-label { font-size: .68rem; }
    }
    @media (max-width: 360px) {
      .bs-theme .bs-nav-label { font-size: .66rem; letter-spacing: -.02em; }
      .bs-theme .bs-cover-names { font-size: clamp(2.65rem, 12.5vw, 4rem); }
    }
    @media (max-height: 700px) {
      .bs-theme .bs-cover-layout { row-gap: .5rem; padding-block: .9rem; }
      .bs-theme .bs-cover-title { padding-block: .5rem; }
      .bs-theme .bs-cover-names { font-size: clamp(2.8rem, 9vh, 5.5rem); }
      .bs-theme .bs-cover-date { margin-top: .5rem; }
      .bs-theme .bs-cover-recipient { padding-top: .5rem; }
    }
    /* Benang Sriwijaya: the vertical thread organizes each chapter. */
    .bs-theme { --bs-script: var(--font-bs-script), Georgia, serif; --bs-label: var(--font-bs-label), Arial, sans-serif; --bs-body: var(--font-bs-text), Arial, sans-serif; }
    .bs-theme .bs-script { font-family: var(--bs-label); font-weight: 600; letter-spacing: -.07em; }
    .bs-theme .bs-section { border-top: 1px solid rgba(36, 42, 43, .16); }
    .bs-theme .bs-section-heading { align-items: start; border-bottom-color: rgba(36, 42, 43, .28); }
    .bs-theme .bs-section-heading h2 { max-width: 13ch; font-weight: 600; line-height: .98; }
    .bs-theme .bs-section-intro { margin-top: .55rem; color: var(--bs-muted); }
    .bs-theme .bs-surface-plum .bs-section-intro { color: var(--bs-blush); }
    .bs-theme .bs-cover { background: var(--bs-ink); color: var(--bs-light); transform: none; transition: opacity .65s ease, visibility 0s .65s; }
    .bs-theme .bs-gate[data-opened="true"] .bs-cover { transform: none; opacity: 0; }
    .bs-theme .bs-cover-doors { position: absolute; inset: 0; display: grid; grid-template-columns: 1fr 1fr; pointer-events: none; overflow: hidden; }
    .bs-theme .bs-cover-doors span { border-right: 1px solid rgba(230, 174, 75, .15); background: repeating-linear-gradient(90deg, transparent 0 11.5vw, rgba(255, 255, 255, .035) 11.5vw calc(11.5vw + 1px)); transition: transform .65s cubic-bezier(.24,.67,.24,1); }
    .bs-theme .bs-gate[data-opened="true"] .bs-cover-doors span:first-child { transform: translateX(-100%); }
    .bs-theme .bs-gate[data-opened="true"] .bs-cover-doors span:last-child { transform: translateX(100%); }
    .bs-theme .bs-cover-frame { place-items: stretch; padding: clamp(.9rem, 2vw, 1.8rem); }
    .bs-theme .bs-cover-frame::before, .bs-theme .bs-cover-frame::after { display: none; }
    .bs-theme .bs-cover-layout { width: min(100%, 1320px); min-height: calc(100svh - clamp(1.8rem, 4vw, 3.6rem)); margin: auto; border: 1px solid rgba(251,250,246,.4); background: transparent; padding: clamp(1rem, 4vw, 3.4rem); overflow: hidden; }
    .bs-theme .bs-cover-layout::before { content: ""; position: absolute; inset: 11% 0 auto auto; width: 39%; height: 64%; border-left: 1px solid rgba(251,250,246,.2); border-bottom: 1px solid rgba(251,250,246,.2); pointer-events: none; }
    .bs-theme .bs-cover-layout::after { content: ""; position: absolute; right: -4%; top: 18%; width: 26%; aspect-ratio: 1; border-radius: 50%; border: 1px solid rgba(230,174,75,.45); pointer-events: none; }
    .bs-theme .bs-cover-topline { border-color: rgba(251,250,246,.45); font-size: .7rem; letter-spacing: .12em; }
    .bs-theme .bs-cover-title { position: relative; z-index: 1; width: min(100%, 950px); }
    .bs-theme .bs-cover-thread { display: block; width: 3.75rem; height: .38rem; margin-bottom: clamp(2rem, 8vh, 5rem); background: var(--bs-thread); }
    .bs-theme .bs-cover-title .bs-label { color: var(--bs-thread); }
    .bs-theme .bs-cover-names { font-weight: 600; font-size: clamp(3.3rem, 11vw, 9.8rem); line-height: .92; letter-spacing: -.085em; }
    .bs-theme .bs-cover-names em { width: auto; margin: .04em 0 .04em clamp(1rem, 11vw, 11rem); color: var(--bs-thread); font: italic 400 .66em/.95 var(--bs-script); }
    .bs-theme .bs-cover-date { color: var(--bs-rule); font-size: .82rem; text-transform: uppercase; letter-spacing: .14em; }
    .bs-theme .bs-cover-recipient { position: relative; z-index: 1; border-color: rgba(251,250,246,.45); }
    .bs-theme .bs-cover-recipient p:first-child { color: var(--bs-rule); }
    .bs-theme .bs-guest-name { max-width: 38ch; font-size: clamp(1rem, 2vw, 1.3rem); font-weight: 500; }
    .bs-theme .bs-action { min-height: 52px; border-color: var(--bs-thread); background: var(--bs-thread); color: var(--bs-ink); font-size: .85rem; }
    .bs-theme .bs-action:hover { border-color: var(--bs-light); background: var(--bs-light); color: var(--bs-ink); }
    .bs-theme .bs-hero { overflow: hidden; }
    .bs-theme .bs-hero .bs-section-inner { position: relative; min-height: 75svh; }
    .bs-theme .bs-hero .bs-section-inner::before { content: "01 / Pertemuan"; position: absolute; top: 0; left: 0; color: var(--bs-muted); font-size: .72rem; letter-spacing: .12em; text-transform: uppercase; }
    .bs-theme .bs-hero-copy { padding-top: 3rem; }
    .bs-theme .bs-hero-copy h2 { font-size: clamp(3.8rem, 9vw, 8.2rem); }
    .bs-theme .bs-hero-copy p { max-width: 32rem; border-left: 3px solid var(--bs-thread); padding-left: 1.1rem; font: 400 clamp(1.1rem, 2vw, 1.38rem)/1.5 var(--bs-script); }
    .bs-theme .bs-hero-image { justify-self: end; width: min(100%, 490px); box-shadow: -1.1rem 1.1rem 0 var(--bs-rule); }
    .bs-theme .bs-hero-mark { color: var(--bs-plum); font: 600 clamp(4rem, 16vw, 12rem)/1 var(--bs-label); letter-spacing: -.1em; opacity: .18; }
    .bs-theme .bs-quote { padding-block: clamp(4rem, 9vw, 9rem); background: var(--bs-plum); color: var(--bs-light); }
    .bs-theme .bs-quote-frame { grid-template-columns: 2.5rem 1fr; border-top: 1px solid var(--bs-thread); padding-top: clamp(2rem, 5vw, 4rem); }
    .bs-theme .bs-quote-mark { color: var(--bs-thread); font-size: 4rem; }
    .bs-theme .bs-quote blockquote { max-width: 29ch; font: italic 400 clamp(1.8rem, 4.4vw, 4rem)/1.17 var(--bs-script); }
    .bs-theme .bs-person { border-left: 1px solid var(--bs-rule); padding-left: clamp(1rem, 3vw, 2rem); }
    .bs-theme .bs-person-portrait { width: min(100%, 450px); }
    .bs-theme .bs-person-copy h3 { font-weight: 600; letter-spacing: -.065em; }
    .bs-theme .bs-event { grid-template-columns: 3.1rem 1fr; border-top-color: rgba(36,42,43,.4); }
    .bs-theme .bs-event-index { display: grid; place-items: center; width: 2.35rem; height: 2.35rem; border: 1px solid var(--bs-ink); color: var(--bs-ink); font-size: .72rem; }
    .bs-theme .bs-event-main h3 { max-width: 18ch; font-weight: 600; }
    .bs-theme .bs-event-main time { color: var(--bs-plum); }
    .bs-theme .bs-text-action { border-bottom: 1px solid currentColor; color: var(--bs-plum); }
    .bs-theme .bs-countdown-units dd { font-weight: 500; }
    .bs-theme .bs-story-entry { border-top-color: var(--bs-rule); }
    .bs-theme .bs-story-copy h3 { font-weight: 600; }
    .bs-theme .bs-gallery-grid { align-items: start; gap: clamp(.7rem, 2.5vw, 1.8rem); }
    .bs-theme .bs-gallery-item:nth-child(3n+2) { margin-top: clamp(0rem, 7vw, 5rem); }
    .bs-theme .bs-gallery-item .bs-media { background: var(--bs-blush); }
    .bs-theme .bs-gallery-item figcaption { border-top: 1px solid var(--bs-rule); margin-top: .4rem; }
    .bs-theme .bs-rsvp { background: var(--bs-plum); }
    .bs-theme .bs-rsvp .bs-section-heading { border-color: var(--bs-thread); }
    .bs-theme .bs-rsvp .bs-section-intro { color: var(--bs-blush); }
    .bs-theme .bs-rsvp .bs-form-submit { background: var(--bs-thread); border-color: var(--bs-thread); color: var(--bs-ink); }
    .bs-theme .bs-rsvp .bs-attendance-choices button[aria-pressed="true"] { background: var(--bs-thread); border-color: var(--bs-thread); color: var(--bs-ink); }
    .bs-theme .bs-wishes .bs-form-submit { background: var(--bs-plum); border-color: var(--bs-plum); }
    .bs-theme .bs-closing { background: var(--bs-ink); }
    .bs-theme .bs-closing .bs-section-inner { border-top: 2px solid var(--bs-thread); padding-top: clamp(2rem, 6vw, 5rem); }
    .bs-theme .bs-closing-mark { color: var(--bs-thread); }
    .bs-theme .bs-closing-copy h2 { font-weight: 600; }
    .bs-theme .bs-closing-image { box-shadow: 1rem 1rem 0 rgba(230,174,75,.5); }
    .bs-theme .bs-nav { border: 1px solid var(--bs-ink); background: var(--bs-ink); color: var(--bs-light); }
    .bs-theme .bs-nav a[aria-current="location"] { background: var(--bs-thread); color: var(--bs-ink); }
    .bs-theme .bs-music { border-color: var(--bs-ink); background: var(--bs-thread); color: var(--bs-ink); }
    @media (min-width: 768px) {
      .bs-theme .bs-event { grid-template-columns: 3.1rem minmax(0, 1fr) minmax(0, .8fr); }
      .bs-theme .bs-hero .bs-section-inner { grid-template-columns: minmax(0, 1.1fr) minmax(0, .9fr); }
    }
    @media (max-width: 767px) {
      .bs-theme .bs-cover-layout::after { width: 48%; right: -15%; top: 24%; }
      .bs-theme .bs-cover-topline { gap: .4rem; font-size: .54rem; letter-spacing: .07em; }
      .bs-theme .bs-cover-topline span:last-child { white-space: nowrap; text-align: right; }
      .bs-theme .bs-cover-thread { margin-bottom: 1.5rem; }
      .bs-theme .bs-hero .bs-section-inner { min-height: auto; }
      .bs-theme .bs-hero-image { margin: 0 1rem 1rem 0; }
      .bs-theme .bs-gallery-item:nth-child(3n+2) { margin-top: 0; }
    }
    /* Woven editorial identity. The rules are abstract geometry, not borrowed motifs. */
    .bs-theme .bs-script { font-family: var(--bs-script); font-weight: 500; letter-spacing: -.045em; }
    .bs-theme :is(h1, h2, h3) { font-family: var(--bs-script); font-weight: 500; }
    .bs-theme .bs-label { font-family: var(--bs-label); font-weight: 400; letter-spacing: .17em; }
    .bs-theme .bs-section { border-top: 0; }
    .bs-theme .bs-section::before { content: ""; position: absolute; z-index: 1; top: 0; bottom: 0; left: max(1rem, calc((100% - 1340px) / 2)); width: 1px; background: var(--bs-thread); opacity: .65; pointer-events: none; }
    .bs-theme .bs-section-inner { position: relative; z-index: 2; padding-left: clamp(.8rem, 2vw, 1.8rem); }
    .bs-theme .bs-section-heading { border-bottom-color: var(--bs-rule); }
    .bs-theme .bs-section-heading h2 { font-family: var(--bs-script); font-size: clamp(3.2rem, 7vw, 6.8rem); font-weight: 500; letter-spacing: -.045em; }
    .bs-theme .bs-cover { background: var(--bs-ground); color: var(--bs-ink); }
    .bs-theme .bs-cover-doors span { border-color: rgba(169,124,66,.22); background: repeating-linear-gradient(0deg, transparent 0 15px, rgba(169,124,66,.08) 15px 16px); }
    .bs-theme .bs-cover-frame { padding: clamp(.65rem, 2vw, 1.25rem); }
    .bs-theme .bs-cover-layout { max-width: 900px; min-height: calc(100svh - clamp(1.3rem,4vw,2.5rem)); padding: clamp(1.15rem, 4vw, 3.5rem); border: 1px solid var(--bs-thread); background: var(--bs-light); box-shadow: inset 0 0 0 7px var(--bs-light), inset 0 0 0 8px rgba(169,124,66,.45); }
    .bs-theme .bs-cover-layout::before { inset: 0 auto 0 clamp(.8rem, 3.5vw, 2.3rem); width: 1px; height: auto; border: 0; background: var(--bs-thread); opacity: .6; }
    .bs-theme .bs-cover-layout::after { inset: 0 clamp(.8rem, 3.5vw, 2.3rem) 0 auto; width: 1px; height: auto; border: 0; border-radius: 0; background: var(--bs-thread); opacity: .6; }
    .bs-theme .bs-cover-topline { border-color: var(--bs-rule); color: var(--bs-plum); font-family: var(--bs-label); font-weight: 400; }
    .bs-theme .bs-cover-title { width: 100%; padding-inline: clamp(.25rem, 4vw, 2rem); }
    .bs-theme .bs-cover-weave { display: flex; gap: .35rem; align-items: center; width: 5.5rem; height: 1.1rem; margin-bottom: clamp(1rem, 4vh, 2.5rem); border-block: 1px solid var(--bs-thread); }
    .bs-theme .bs-cover-weave i { display: block; width: 1px; height: 100%; background: var(--bs-thread); transform: rotate(25deg); }
    .bs-theme .bs-cover-title .bs-label { color: var(--bs-plum); }
    .bs-theme .bs-cover-names { font-family: var(--bs-script); font-size: clamp(3.65rem, 12vw, 9.4rem); font-weight: 500; line-height: .83; letter-spacing: -.06em; }
    .bs-theme .bs-cover-names > span:nth-of-type(2) { padding-left: clamp(1.2rem, 13vw, 7rem); }
    .bs-theme .bs-cover-names em { margin: -.08em 0 -.08em clamp(.5rem, 10vw, 6rem); color: var(--bs-thread); font-size: .62em; }
    .bs-theme .bs-cover-date { color: var(--bs-plum); font-family: var(--bs-label); font-size: .76rem; font-weight: 400; letter-spacing: .15em; }
    .bs-theme .bs-cover-recipient { align-items: end; padding-inline: clamp(.25rem, 4vw, 2rem); border-color: var(--bs-rule); }
    .bs-theme .bs-cover-recipient p:first-child { color: var(--bs-muted); }
    .bs-theme .bs-guest-name { font-weight: 600; }
    .bs-theme .bs-action { border-color: var(--bs-plum); background: var(--bs-plum); color: var(--bs-light); }
    .bs-theme .bs-action:hover { border-color: var(--bs-ink); background: var(--bs-ink); color: var(--bs-light); }
    .bs-theme .bs-hero .bs-section-inner::before { content: "01 / Awal cerita"; color: var(--bs-plum); }
    .bs-theme .bs-hero-copy h2 { font-size: clamp(3.7rem, 9vw, 8rem); }
    .bs-theme .bs-hero-copy p { border-left: 1px solid var(--bs-thread); font-family: var(--bs-body); font-size: 1.1rem; }
    .bs-theme .bs-hero-image { box-shadow: none; outline: 1px solid var(--bs-thread); outline-offset: .55rem; }
    .bs-theme .bs-hero-mark { font-family: var(--bs-script); font-weight: 500; color: var(--bs-thread); }
    .bs-theme .bs-quote { background: var(--bs-plum); color: var(--bs-light); }
    .bs-theme .bs-quote blockquote { font-size: clamp(2rem, 5vw, 4.6rem); }
    .bs-theme .bs-person { border: 0; padding: 0; }
    .bs-theme .bs-people { gap: clamp(4rem, 9vw, 9rem); }
    .bs-theme .bs-person:nth-child(even) { background: var(--bs-blush); padding: clamp(1rem, 4vw, 3rem); }
    .bs-theme .bs-person-copy h3 { font-size: clamp(2.6rem, 5vw, 5.3rem); font-weight: 500; letter-spacing: -.04em; }
    .bs-theme .bs-event-list { border-left: 1px solid var(--bs-thread); padding-left: clamp(1.2rem, 3vw, 2.6rem); }
    .bs-theme .bs-event { position: relative; border-top-color: var(--bs-rule); }
    .bs-theme .bs-event::before { content: ""; position: absolute; left: calc(-1 * clamp(1.2rem, 3vw, 2.6rem) - 4px); top: 2rem; width: 7px; height: 7px; background: var(--bs-plum); transform: rotate(45deg); }
    .bs-theme .bs-event-main h3, .bs-theme .bs-story-copy h3 { font-family: var(--bs-script); font-size: clamp(2rem, 4vw, 3.4rem); font-weight: 500; letter-spacing: -.02em; }
    .bs-theme .bs-event-index { width: auto; border: 0; color: var(--bs-plum); font-family: var(--bs-label); }
    .bs-theme .bs-countdown-units dd { font-family: var(--bs-script); font-weight: 500; letter-spacing: -.04em; }
    .bs-theme .bs-story-entry:nth-child(even) .bs-media { order: 2; }
    .bs-theme .bs-gallery-grid { grid-template-columns: repeat(6, minmax(0, 1fr)); }
    .bs-theme .bs-gallery-item { grid-column: span 3; }
    .bs-theme .bs-gallery-item[data-gallery-span="2"] { grid-column: span 4; }
    .bs-theme .bs-gallery-item:nth-child(3n + 2) { grid-column: span 2; margin-top: 3rem; }
    .bs-theme .bs-rsvp { background: var(--bs-plum); }
    .bs-theme .bs-rsvp .bs-form-submit, .bs-theme .bs-rsvp .bs-attendance-choices button[aria-pressed="true"] { background: var(--bs-light); border-color: var(--bs-light); color: var(--bs-plum); }
    .bs-theme .bs-wishes .bs-form-submit { background: var(--bs-plum); border-color: var(--bs-plum); }
    .bs-theme .bs-closing { background: var(--bs-plum); }
    .bs-theme .bs-closing .bs-section-inner { border-top: 1px solid var(--bs-thread); }
    .bs-theme .bs-closing-copy h2 { font-family: var(--bs-script); font-weight: 500; }
    .bs-theme .bs-closing-image { box-shadow: none; outline: 1px solid var(--bs-thread); outline-offset: .5rem; }
    .bs-theme .bs-nav { border-color: var(--bs-thread); background: var(--bs-light); color: var(--bs-ink); }
    .bs-theme .bs-nav a[aria-current="location"] { background: var(--bs-plum); color: var(--bs-light); }
    .bs-theme .bs-music { background: var(--bs-light); border-color: var(--bs-thread); color: var(--bs-plum); }
    @media (max-width: 767px) {
      .bs-theme .bs-cover-layout { box-shadow: inset 0 0 0 3px var(--bs-light), inset 0 0 0 4px rgba(169,124,66,.45); }
      .bs-theme .bs-cover-title { padding-inline: .25rem; }
      .bs-theme .bs-cover-names > span:nth-of-type(2) { padding-left: clamp(.7rem, 8vw, 3rem); }
      .bs-theme .bs-cover-recipient { align-items: stretch; padding-inline: .25rem; }
      .bs-theme .bs-section::before { left: .8rem; }
      .bs-theme .bs-gallery-item:nth-child(3n + 2) { margin-top: 0; }
    }
    @media (max-height: 700px) {
      .bs-theme .bs-cover-weave { margin-bottom: .5rem; }
      .bs-theme .bs-cover-names { font-size: clamp(2.7rem, 9vh, 5rem); }
    }
    @media (prefers-reduced-motion: reduce) {
      .bs-theme *, .bs-theme *::before, .bs-theme *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; }
    }
  `}</style>;
}
