export function ThemeStyles() {
  return <style>{`
    .jk-theme {
      --jk-concrete: #F1F0EA; --jk-light: #FBFAF6; --jk-asphalt: #242A2B;
      --jk-night: #24303A; --jk-lamp: #E6AE4B; --jk-fog: #DEE3E1; --jk-steel: #AAB8BB;
      --jk-muted: #4C5A5B; --jk-gutter: clamp(1.25rem, 5vw, 4.5rem);
      --jk-nav-space: calc(62px + max(12px, env(safe-area-inset-bottom)));
      --jk-script: var(--font-jk-script), Georgia, serif;
      --jk-label: var(--font-jk-label), Arial, sans-serif;
      --jk-body: var(--font-jk-text), Arial, sans-serif;
      background: var(--jk-concrete); color: var(--jk-asphalt); color-scheme: light;
      font-family: var(--jk-body); font-size: 1.0625rem; line-height: 1.58;
      overflow-x: clip; overflow-wrap: anywhere; isolation: isolate;
    }
    .jk-theme *, .jk-theme *::before, .jk-theme *::after { box-sizing: border-box; }
    .jk-theme [hidden] { display: none !important; }
    .jk-theme :is(h1, h2, h3, p, blockquote, figure) { margin: 0; }
    .jk-theme :is(h1, h2, h3) { font-family: var(--jk-label); line-height: 1.08; }
    .jk-theme .jk-script { font-family: var(--jk-label); font-weight: 700; letter-spacing: -.065em; }
    .jk-theme .jk-label { font-family: var(--jk-label); font-size: .72rem; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; }
    .jk-theme :is(button, input, textarea, select) { font: inherit; }
    .jk-theme :is(button, a) { -webkit-tap-highlight-color: transparent; }
    .jk-theme :focus-visible { outline: 3px solid var(--jk-night); outline-offset: 4px; }
    .jk-theme a { color: inherit; text-underline-offset: .2em; }
    .jk-theme .jk-gate { min-height: 100svh; }
    .jk-theme .jk-cover { position: fixed; inset: 0; z-index: 50; overflow-y: auto; overflow-x: clip; background: var(--jk-concrete); transition: transform .5s ease, opacity .5s ease, visibility 0s .5s; }
    .jk-theme .jk-gate[data-opened="true"] .jk-cover { transform: translateX(-4%); opacity: 0; visibility: hidden; pointer-events: none; }
    .jk-theme .jk-cover-frame { position: relative; min-height: 100svh; display: grid; place-items: center; padding: clamp(.65rem, 2vw, 1.5rem); }
    .jk-theme .jk-cover-frame::before, .jk-theme .jk-cover-frame::after { content: ""; position: absolute; inset: clamp(.75rem, 2.5vw, 2rem); pointer-events: none; }
    .jk-theme .jk-cover-frame::before { background: var(--jk-lamp); transform: rotate(-1.8deg) scale(.965); }
    .jk-theme .jk-cover-frame::after { background: var(--jk-night); transform: rotate(1.2deg) scale(.975); }
    .jk-theme .jk-cover-layout { position: relative; z-index: 1; display: grid; grid-template-rows: auto 1fr auto; width: min(100%, 1180px); min-height: calc(100svh - clamp(1.3rem, 4vw, 3rem)); gap: 1rem; padding: clamp(1.4rem, 4vw, 3rem); background: var(--jk-concrete); border: 1px solid var(--jk-asphalt); }
    .jk-theme .jk-cover-topline { display: flex; justify-content: space-between; gap: 1rem; border-bottom: 1px solid var(--jk-asphalt); padding-bottom: .7rem; font-size: .66rem; line-height: 1.2; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
    .jk-theme .jk-cover-title { align-self: center; min-width: 0; padding: clamp(1rem, 5vh, 3rem) 0; }
    .jk-theme .jk-cover-title .jk-label { margin-bottom: clamp(.8rem, 3vh, 1.8rem); color: var(--jk-night); }
    .jk-theme .jk-cover-names { max-width: 100%; font-size: clamp(3rem, 10.8vw, 9.4rem); font-weight: 700; letter-spacing: -.085em; overflow-wrap: anywhere; }
    .jk-theme .jk-cover-names > span { display: block; }
    .jk-theme .jk-cover-names em { display: block; width: max-content; margin-left: clamp(1rem, 18vw, 14rem); color: var(--jk-night); font: italic 400 .78em/1 var(--jk-script); }
    .jk-theme .jk-cover-date { display: block; margin-top: clamp(.8rem, 3vh, 1.8rem); font-size: .88rem; font-weight: 700; letter-spacing: .04em; }
    .jk-theme .jk-cover-recipient { display: flex; align-items: end; justify-content: space-between; gap: 1rem; min-width: 0; padding-top: 1rem; border-top: 1px solid var(--jk-asphalt); }
    .jk-theme .jk-cover-recipient p:first-child { font-size: .76rem; }
    .jk-theme .jk-guest-name { font-weight: 700; }
    .jk-theme .jk-action, .jk-theme .jk-form-submit { min-height: 50px; padding: .65rem 1.25rem; border: 1px solid var(--jk-night); background: var(--jk-night); color: white; font-size: .78rem; font-weight: 700; letter-spacing: .04em; cursor: pointer; }
    .jk-theme .jk-action:hover, .jk-theme .jk-form-submit:hover:not(:disabled) { background: var(--jk-asphalt); border-color: var(--jk-asphalt); }
    .jk-theme .jk-action:disabled, .jk-theme .jk-form-submit:disabled { opacity: .65; cursor: default; }
    .jk-theme .jk-content { padding-bottom: var(--jk-nav-space); }
    .jk-theme .jk-section { position: relative; padding: clamp(4rem, 8vw, 8rem) var(--jk-gutter); }
    .jk-theme .jk-section-inner { width: min(100%, 1220px); margin-inline: auto; }
    .jk-theme .jk-surface-concrete { background: var(--jk-concrete); }
    .jk-theme .jk-surface-light { background: var(--jk-light); }
    .jk-theme .jk-surface-fog { background: var(--jk-fog); }
    .jk-theme .jk-surface-night { background: var(--jk-night); color: white; }
    .jk-theme .jk-section-heading { display: flex; justify-content: space-between; align-items: end; flex-wrap: wrap; gap: 1rem 2rem; margin-bottom: clamp(2rem, 5vw, 4rem); padding-bottom: .9rem; border-bottom: 1px solid currentColor; }
    .jk-theme .jk-section-heading h2 { font-size: clamp(2.6rem, 6vw, 5.7rem); font-weight: 750; letter-spacing: -.075em; }
    .jk-theme .jk-section-intro { max-width: 25rem; font-size: .95rem; }
    .jk-theme .jk-media { position: relative; overflow: hidden; background: var(--jk-fog); }
    .jk-theme .jk-media img { object-fit: cover; }
    .jk-theme .jk-image-fallback { display: grid; place-content: center; gap: .5rem; width: 100%; height: 100%; padding: 1rem; text-align: center; color: var(--jk-night); }
    .jk-theme .jk-image-fallback-mark, .jk-theme .jk-hero-mark, .jk-theme .jk-closing-mark { font: italic 400 clamp(3rem, 10vw, 7rem)/1 var(--jk-script); }
    .jk-theme .jk-image-fallback span:last-child { font-size: .75rem; }
    .jk-theme .jk-hero .jk-section-inner { display: grid; align-items: center; gap: clamp(2rem, 6vw, 6rem); }
    .jk-theme .jk-hero-copy { max-width: 45rem; }
    .jk-theme .jk-hero-copy h2 { font-size: clamp(3.6rem, 9vw, 8.5rem); line-height: .98; }
    .jk-theme .jk-hero-copy p { max-width: 37rem; margin-top: 2rem; }
    .jk-theme .jk-hero-image { width: min(100%, 520px); aspect-ratio: 3/4; }
    .jk-theme .jk-hero-text-only .jk-section-inner { min-height: 55svh; }
    .jk-theme .jk-hero-mark { justify-self: end; color: var(--jk-lamp); }
    .jk-theme .jk-quote { padding: clamp(3rem, 7vw, 6rem) var(--jk-gutter); background: var(--jk-fog); }
    .jk-theme .jk-quote-frame { display: grid; grid-template-columns: auto 1fr; gap: 1rem; width: min(100%, 960px); margin: auto; }
    .jk-theme .jk-quote-mark { color: var(--jk-night); font: italic 400 5rem/1 var(--jk-script); }
    .jk-theme .jk-quote blockquote { align-self: center; font: italic 400 clamp(1.7rem, 4vw, 3.3rem)/1.2 var(--jk-script); }
    .jk-theme .jk-people { display: grid; gap: 3rem; }
    .jk-theme .jk-person { display: grid; gap: 1.5rem; align-items: center; }
    .jk-theme .jk-person-portrait { width: 100%; aspect-ratio: 4/5; }
    .jk-theme .jk-person-copy h3 { font-size: clamp(2.2rem, 4vw, 4.5rem); }
    .jk-theme .jk-parents { margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid currentColor; }
    .jk-theme .jk-parents p:first-child { font-size: .78rem; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; }
    .jk-theme .jk-person-bio, .jk-theme .jk-instagram { display: block; margin-top: 1rem; }
    .jk-theme .jk-event-list, .jk-theme .jk-story-entries, .jk-theme .jk-wishes-list, .jk-theme .jk-gift-list { margin: 0; padding: 0; list-style: none; }
    .jk-theme .jk-event { display: grid; grid-template-columns: 2.5rem 1fr; gap: .8rem; padding: 1.7rem 0; border-top: 1px solid var(--jk-asphalt); }
    .jk-theme .jk-event:first-child { padding-top: 0; border-top: 0; }
    .jk-theme .jk-event-index, .jk-theme .jk-story-date { color: var(--jk-night); font-size: .76rem; font-weight: 700; }
    .jk-theme .jk-event-main h3 { margin-bottom: .8rem; font-size: clamp(1.6rem, 3vw, 2.5rem); font-weight: 700; letter-spacing: -.04em; }
    .jk-theme .jk-event-main time, .jk-theme .jk-event-time { display: block; font-weight: 650; }
    .jk-theme .jk-event-place { grid-column: 2; }
    .jk-theme .jk-event-venue { font-weight: 700; }
    .jk-theme .jk-event-address { color: var(--jk-muted); }
    .jk-theme .jk-text-action { display: inline-flex; align-items: center; gap: .5rem; min-height: 44px; margin-top: .6rem; color: var(--jk-night); font-size: .82rem; font-weight: 700; }
    .jk-theme .jk-countdown-units { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .5rem; margin: 0 0 2rem; }
    .jk-theme .jk-countdown-units div { border-top: 1px solid currentColor; padding-top: .7rem; }
    .jk-theme .jk-countdown-units dt { font-size: .7rem; text-transform: uppercase; letter-spacing: .1em; }
    .jk-theme .jk-countdown-units dd { margin: 0; font-size: clamp(2rem, 7vw, 6rem); font-weight: 750; letter-spacing: -.08em; line-height: 1.15; }
    .jk-theme .jk-calendar-actions { display: flex; flex-wrap: wrap; gap: .6rem; }
    .jk-theme .jk-calendar-actions :is(a, button), .jk-theme .jk-livestream a { display: inline-flex; align-items: center; gap: .5rem; min-height: 48px; padding: .6rem .9rem; border: 1px solid currentColor; background: transparent; color: inherit; text-decoration: none; font-size: .82rem; font-weight: 700; cursor: pointer; }
    .jk-theme .jk-dress-description { max-width: 45rem; }
    .jk-theme .jk-dress-groups { display: flex; flex-wrap: wrap; gap: 2rem; margin-top: 2rem; }
    .jk-theme .jk-dress-group h3 { margin-bottom: .5rem; font-size: 1.1rem; }
    .jk-theme .jk-dress-group ul { display: flex; gap: .5rem; padding: 0; margin: 0; list-style: none; }
    .jk-theme .jk-dress-swatch { display: block; width: 2.3rem; height: 2.3rem; border: 1px solid var(--jk-asphalt); border-radius: 50%; }
    .jk-theme .jk-story-entry { display: grid; gap: 1.5rem; padding: 2rem 0; border-top: 1px solid var(--jk-asphalt); }
    .jk-theme .jk-story-entry .jk-media { width: 100%; }
    .jk-theme .jk-story-copy h3 { margin: .5rem 0 1rem; font-size: clamp(1.8rem, 3vw, 3rem); letter-spacing: -.05em; }
    .jk-theme .jk-story-description { max-width: 35rem; }
    .jk-theme .jk-gallery-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .75rem; }
    .jk-theme .jk-gallery-item[data-gallery-span="2"] { grid-column: span 2; }
    .jk-theme .jk-gallery-item .jk-media { width: 100%; }
    .jk-theme .jk-gallery-item figcaption { padding: .5rem 0 1rem; font-size: .76rem; }
    .jk-theme .jk-gallery-zoom { display: block; width: 100%; padding: 0; border: 0; background: none; cursor: zoom-in; }
    .jk-theme .jk-gallery-zoom:focus-visible { outline-color: var(--jk-night); }
    .jk-theme .jk-livestream ul { margin: 0; padding: 0; list-style: none; }
    .jk-theme .jk-livestream li + li { margin-top: .75rem; }
    .jk-theme .jk-interaction-intro { max-width: 34rem; }
    .jk-theme .jk-form { display: grid; gap: 1rem; max-width: 37rem; }
    .jk-theme .jk-form-field { display: grid; gap: .45rem; font-size: .8rem; font-weight: 700; }
    .jk-theme .jk-form-field :is(input, textarea) { width: 100%; min-height: 48px; padding: .8rem .9rem; border: 1px solid currentColor; border-radius: 0; background: var(--jk-light); color: var(--jk-asphalt); font-size: 1rem; font-weight: 400; }
    .jk-theme .jk-form-field textarea { min-height: 8rem; resize: vertical; }
    .jk-theme .jk-form-recipient { display: grid; gap: .3rem; padding: .9rem 0; border-block: 1px solid currentColor; }
    .jk-theme .jk-form-recipient span { font-size: .78rem; }
    .jk-theme .jk-attendance { margin: 0; padding: 0; border: 0; }
    .jk-theme .jk-attendance legend { margin-bottom: .5rem; font-size: .8rem; font-weight: 700; }
    .jk-theme .jk-attendance-choices { display: flex; flex-wrap: wrap; gap: .5rem; }
    .jk-theme .jk-attendance-choices button { min-height: 48px; padding: .6rem 1rem; border: 1px solid currentColor; background: transparent; color: inherit; cursor: pointer; }
    .jk-theme .jk-attendance-choices button[aria-pressed="true"] { background: var(--jk-light); color: var(--jk-night); border-color: var(--jk-light); font-weight: 700; }
    .jk-theme .jk-form-error { color: #FFD4D4; font-weight: 700; }
    .jk-theme .jk-wishes .jk-form-error { color: var(--jk-night); }
    .jk-theme .jk-form-success { padding: 1.5rem; border: 1px solid currentColor; font-weight: 650; }
    .jk-theme .jk-rsvp .jk-form-submit { background: var(--jk-light); border-color: var(--jk-light); color: var(--jk-night); }
    .jk-theme .jk-wishes .jk-form-submit { background: var(--jk-night); border-color: var(--jk-night); color: var(--jk-light); }
    .jk-theme .jk-rsvp .jk-form-submit:hover:not(:disabled), .jk-theme .jk-wishes .jk-form-submit:hover:not(:disabled) { background: var(--jk-asphalt); border-color: var(--jk-asphalt); color: white; }
    .jk-theme .jk-wishes-feed { margin-top: 3rem; }
    .jk-theme .jk-wishes-list li { padding: 1rem 0; border-top: 1px solid currentColor; }
    .jk-theme .jk-wish-meta { display: flex; flex-wrap: wrap; justify-content: space-between; gap: .5rem; font-size: .76rem; }
    .jk-theme .jk-wishes-list p { margin-top: .6rem; }
    .jk-theme .jk-wishes-empty { opacity: .85; }
    .jk-theme .jk-more-wishes { min-height: 48px; margin-top: 1rem; border: 1px solid currentColor; padding: .6rem 1rem; background: transparent; color: inherit; cursor: pointer; }
    .jk-theme .jk-wish-confirmation { display: block; margin-top: .5rem; font: italic 400 1.5rem var(--jk-script); }
    .jk-theme .jk-gift-account { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 1rem; padding: 1.2rem 0; border-top: 1px solid var(--jk-asphalt); }
    .jk-theme .jk-gift-provider { font-size: .75rem; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; }
    .jk-theme .jk-gift-number { margin: .5rem 0; font-size: clamp(1.3rem, 4vw, 2rem); font-weight: 700; }
    .jk-theme .jk-gift-owner { font-size: .85rem; }
    .jk-theme .jk-gift-account > button { align-self: center; min-height: 48px; padding: .6rem 1rem; border: 1px solid var(--jk-night); background: transparent; color: var(--jk-night); font-size: .8rem; font-weight: 700; cursor: pointer; }
    .jk-theme .jk-gift-copy-status { color: var(--jk-night); font-size: .76rem; }
    .jk-theme .jk-gift-copy-status:empty { display: none; }
    .jk-theme .jk-closing .jk-section-inner { display: grid; align-items: center; gap: 2rem; }
    .jk-theme .jk-closing-mark { display: block; color: var(--jk-fog); }
    .jk-theme .jk-closing-copy h2 { max-width: 11ch; margin: 1rem 0; font-size: clamp(3rem, 7vw, 7rem); }
    .jk-theme .jk-closing-copy p { max-width: 35rem; }
    .jk-theme .jk-closing-image { width: min(100%, 400px); }
    .jk-theme .jk-nav { position: fixed; z-index: 45; bottom: max(12px, env(safe-area-inset-bottom)); left: 50%; width: min(calc(100% - 1rem), 850px); transform: translateX(-50%); border: 1px solid var(--jk-asphalt); background: var(--jk-light); color: var(--jk-asphalt); }
    .jk-theme .jk-nav ul { display: flex; overflow-x: auto; scrollbar-width: none; scroll-snap-type: x mandatory; margin: 0; padding: 3px; list-style: none; }
    .jk-theme .jk-nav ul::-webkit-scrollbar { display: none; }
    .jk-theme .jk-nav li { flex: 1 0 calc(100% / 5.4); min-width: 0; scroll-snap-align: center; }
    .jk-theme .jk-nav a { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: .1rem; min-height: 52px; padding: .2rem .1rem; color: inherit; font-size: .68rem; line-height: 1.1; font-weight: 700; text-decoration: none; }
    .jk-theme .jk-nav a[aria-current="location"] { background: var(--jk-night); color: white; }
    .jk-theme .jk-nav-icon { width: clamp(18px, 5.2vw, 22px); height: clamp(18px, 5.2vw, 22px); flex: none; }
    .jk-theme .jk-nav-label { white-space: nowrap; }
    .jk-theme .jk-music { position: fixed; z-index: 46; right: 1rem; bottom: calc(var(--jk-nav-space) + 1rem); display: grid; place-items: center; width: 48px; height: 48px; border: 1px solid var(--jk-asphalt); border-radius: 50%; background: var(--jk-light); color: var(--jk-night); cursor: pointer; }
    .jk-theme .jk-lightbox { width: 100vw; max-width: 100vw; height: 100svh; max-height: 100svh; margin: 0; padding: 0; border: 0; background: transparent; color: white; }
    .jk-theme .jk-lightbox::backdrop { background: rgba(20, 27, 31, .96); }
    .jk-theme .jk-lightbox-body { display: flex; flex-direction: column; height: 100%; padding: max(1rem, env(safe-area-inset-top)) var(--jk-gutter) max(1rem, env(safe-area-inset-bottom)); pointer-events: none; }
    .jk-theme .jk-lightbox-frame { position: relative; flex: 1; min-height: 0; }
    .jk-theme .jk-lightbox-frame > * { position: absolute; inset: 0; background: transparent; }
    .jk-theme .jk-lightbox-frame img { object-fit: contain; }
    .jk-theme .jk-lightbox-bar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: .75rem; padding-top: 1rem; pointer-events: auto; }
    .jk-theme .jk-lightbox-caption { margin: 0; font-size: .82rem; }
    .jk-theme .jk-lightbox-btn { min-width: 44px; min-height: 44px; padding: .5rem; border: 1px solid white; background: transparent; color: white; cursor: pointer; }
    @media (min-width: 768px) {
      .jk-theme .jk-hero .jk-section-inner { grid-template-columns: 1fr minmax(0, .75fr); }
      .jk-theme .jk-person { grid-template-columns: minmax(0, .8fr) 1fr; gap: clamp(2rem, 6vw, 6rem); }
      .jk-theme .jk-person:nth-child(even) .jk-media { order: 2; }
      .jk-theme .jk-event { grid-template-columns: 3rem minmax(0, 1fr) minmax(0, .8fr); }
      .jk-theme .jk-event-place { grid-column: auto; }
      .jk-theme .jk-story-entry { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 3rem; align-items: center; }
      .jk-theme .jk-gallery-grid { gap: 1.25rem; }
      .jk-theme .jk-interaction-body { max-width: 38rem; margin-left: auto; }
      .jk-theme .jk-closing .jk-section-inner { grid-template-columns: 1fr .7fr; }
      .jk-theme .jk-nav li { flex: 1 1 auto; }
      .jk-theme .jk-nav a { padding: .3rem .35rem; }
    }
    @media (max-width: 767px) {
      .jk-theme .jk-cover-recipient { align-items: stretch; flex-direction: column; }
      .jk-theme .jk-action { width: 100%; }
      .jk-theme .jk-nav-label { font-size: .68rem; }
    }
    @media (max-width: 360px) {
      .jk-theme .jk-nav-label { font-size: .66rem; letter-spacing: -.02em; }
      .jk-theme .jk-cover-names { font-size: clamp(2.65rem, 12.5vw, 4rem); }
    }
    @media (max-height: 700px) {
      .jk-theme .jk-cover-layout { row-gap: .5rem; padding-block: .9rem; }
      .jk-theme .jk-cover-title { padding-block: .5rem; }
      .jk-theme .jk-cover-names { font-size: clamp(2.8rem, 9vh, 5.5rem); }
      .jk-theme .jk-cover-date { margin-top: .5rem; }
      .jk-theme .jk-cover-recipient { padding-top: .5rem; }
    }
    /* Janji Kota: a documentary walk through light, street geometry, and real moments. */
    .jk-theme { --jk-script: var(--font-jk-script), Georgia, serif; --jk-label: var(--font-jk-label), Arial, sans-serif; --jk-body: var(--font-jk-text), Arial, sans-serif; }
    .jk-theme .jk-script { font-family: var(--jk-label); font-weight: 600; letter-spacing: -.07em; }
    .jk-theme .jk-section { border-top: 1px solid rgba(36, 42, 43, .16); }
    .jk-theme .jk-section-heading { align-items: start; border-bottom-color: rgba(36, 42, 43, .28); }
    .jk-theme .jk-section-heading h2 { max-width: 13ch; font-weight: 600; line-height: .98; }
    .jk-theme .jk-section-intro { margin-top: .55rem; color: var(--jk-muted); }
    .jk-theme .jk-surface-night .jk-section-intro { color: var(--jk-fog); }
    .jk-theme .jk-cover { background: var(--jk-asphalt); color: var(--jk-light); transform: none; transition: opacity .65s ease, visibility 0s .65s; }
    .jk-theme .jk-gate[data-opened="true"] .jk-cover { transform: none; opacity: 0; }
    .jk-theme .jk-cover-doors { position: absolute; inset: 0; display: grid; grid-template-columns: 1fr 1fr; pointer-events: none; overflow: hidden; }
    .jk-theme .jk-cover-doors span { border-right: 1px solid rgba(230, 174, 75, .15); background: repeating-linear-gradient(90deg, transparent 0 11.5vw, rgba(255, 255, 255, .035) 11.5vw calc(11.5vw + 1px)); transition: transform .65s cubic-bezier(.24,.67,.24,1); }
    .jk-theme .jk-gate[data-opened="true"] .jk-cover-doors span:first-child { transform: translateX(-100%); }
    .jk-theme .jk-gate[data-opened="true"] .jk-cover-doors span:last-child { transform: translateX(100%); }
    .jk-theme .jk-cover-frame { place-items: stretch; padding: clamp(.9rem, 2vw, 1.8rem); }
    .jk-theme .jk-cover-frame::before, .jk-theme .jk-cover-frame::after { display: none; }
    .jk-theme .jk-cover-layout { width: min(100%, 1320px); min-height: calc(100svh - clamp(1.8rem, 4vw, 3.6rem)); margin: auto; border: 1px solid rgba(251,250,246,.4); background: transparent; padding: clamp(1rem, 4vw, 3.4rem); overflow: hidden; }
    .jk-theme .jk-cover-layout::before { content: ""; position: absolute; inset: 11% 0 auto auto; width: 39%; height: 64%; border-left: 1px solid rgba(251,250,246,.2); border-bottom: 1px solid rgba(251,250,246,.2); pointer-events: none; }
    .jk-theme .jk-cover-layout::after { content: ""; position: absolute; right: -4%; top: 18%; width: 26%; aspect-ratio: 1; border-radius: 50%; border: 1px solid rgba(230,174,75,.45); pointer-events: none; }
    .jk-theme .jk-cover-topline { border-color: rgba(251,250,246,.45); font-size: .7rem; letter-spacing: .12em; }
    .jk-theme .jk-cover-title { position: relative; z-index: 1; width: min(100%, 950px); }
    .jk-theme .jk-cover-lamp { display: block; width: 3.75rem; height: .38rem; margin-bottom: clamp(2rem, 8vh, 5rem); background: var(--jk-lamp); }
    .jk-theme .jk-cover-title .jk-label { color: var(--jk-lamp); }
    .jk-theme .jk-cover-names { font-weight: 600; font-size: clamp(3.3rem, 11vw, 9.8rem); line-height: .92; letter-spacing: -.085em; }
    .jk-theme .jk-cover-names em { width: auto; margin: .04em 0 .04em clamp(1rem, 11vw, 11rem); color: var(--jk-lamp); font: italic 400 .66em/.95 var(--jk-script); }
    .jk-theme .jk-cover-date { color: var(--jk-steel); font-size: .82rem; text-transform: uppercase; letter-spacing: .14em; }
    .jk-theme .jk-cover-recipient { position: relative; z-index: 1; border-color: rgba(251,250,246,.45); }
    .jk-theme .jk-cover-recipient p:first-child { color: var(--jk-steel); }
    .jk-theme .jk-guest-name { max-width: 38ch; font-size: clamp(1rem, 2vw, 1.3rem); font-weight: 500; }
    .jk-theme .jk-action { min-height: 52px; border-color: var(--jk-lamp); background: var(--jk-lamp); color: var(--jk-asphalt); font-size: .85rem; }
    .jk-theme .jk-action:hover { border-color: var(--jk-light); background: var(--jk-light); color: var(--jk-asphalt); }
    .jk-theme .jk-hero { overflow: hidden; }
    .jk-theme .jk-hero .jk-section-inner { position: relative; min-height: 75svh; }
    .jk-theme .jk-hero .jk-section-inner::before { content: "01 / Pertemuan"; position: absolute; top: 0; left: 0; color: var(--jk-muted); font-size: .72rem; letter-spacing: .12em; text-transform: uppercase; }
    .jk-theme .jk-hero-copy { padding-top: 3rem; }
    .jk-theme .jk-hero-copy h2 { font-size: clamp(3.8rem, 9vw, 8.2rem); }
    .jk-theme .jk-hero-copy p { max-width: 32rem; border-left: 3px solid var(--jk-lamp); padding-left: 1.1rem; font: 400 clamp(1.1rem, 2vw, 1.38rem)/1.5 var(--jk-script); }
    .jk-theme .jk-hero-image { justify-self: end; width: min(100%, 490px); box-shadow: -1.1rem 1.1rem 0 var(--jk-steel); }
    .jk-theme .jk-hero-mark { color: var(--jk-night); font: 600 clamp(4rem, 16vw, 12rem)/1 var(--jk-label); letter-spacing: -.1em; opacity: .18; }
    .jk-theme .jk-quote { padding-block: clamp(4rem, 9vw, 9rem); background: var(--jk-night); color: var(--jk-light); }
    .jk-theme .jk-quote-frame { grid-template-columns: 2.5rem 1fr; border-top: 1px solid var(--jk-lamp); padding-top: clamp(2rem, 5vw, 4rem); }
    .jk-theme .jk-quote-mark { color: var(--jk-lamp); font-size: 4rem; }
    .jk-theme .jk-quote blockquote { max-width: 29ch; font: italic 400 clamp(1.8rem, 4.4vw, 4rem)/1.17 var(--jk-script); }
    .jk-theme .jk-person { border-left: 1px solid var(--jk-steel); padding-left: clamp(1rem, 3vw, 2rem); }
    .jk-theme .jk-person-portrait { width: min(100%, 450px); }
    .jk-theme .jk-person-copy h3 { font-weight: 600; letter-spacing: -.065em; }
    .jk-theme .jk-event { grid-template-columns: 3.1rem 1fr; border-top-color: rgba(36,42,43,.4); }
    .jk-theme .jk-event-index { display: grid; place-items: center; width: 2.35rem; height: 2.35rem; border: 1px solid var(--jk-asphalt); color: var(--jk-asphalt); font-size: .72rem; }
    .jk-theme .jk-event-main h3 { max-width: 18ch; font-weight: 600; }
    .jk-theme .jk-event-main time { color: var(--jk-night); }
    .jk-theme .jk-text-action { border-bottom: 1px solid currentColor; color: var(--jk-night); }
    .jk-theme .jk-countdown-units dd { font-weight: 500; }
    .jk-theme .jk-story-entry { border-top-color: var(--jk-steel); }
    .jk-theme .jk-story-copy h3 { font-weight: 600; }
    .jk-theme .jk-gallery-grid { align-items: start; gap: clamp(.7rem, 2.5vw, 1.8rem); }
    .jk-theme .jk-gallery-item:nth-child(3n+2) { margin-top: clamp(0rem, 7vw, 5rem); }
    .jk-theme .jk-gallery-item .jk-media { background: var(--jk-fog); }
    .jk-theme .jk-gallery-item figcaption { border-top: 1px solid var(--jk-steel); margin-top: .4rem; }
    .jk-theme .jk-rsvp { background: var(--jk-night); }
    .jk-theme .jk-rsvp .jk-section-heading { border-color: var(--jk-lamp); }
    .jk-theme .jk-rsvp .jk-section-intro { color: var(--jk-fog); }
    .jk-theme .jk-rsvp .jk-form-submit { background: var(--jk-lamp); border-color: var(--jk-lamp); color: var(--jk-asphalt); }
    .jk-theme .jk-rsvp .jk-attendance-choices button[aria-pressed="true"] { background: var(--jk-lamp); border-color: var(--jk-lamp); color: var(--jk-asphalt); }
    .jk-theme .jk-wishes .jk-form-submit { background: var(--jk-night); border-color: var(--jk-night); }
    .jk-theme .jk-closing { background: var(--jk-asphalt); }
    .jk-theme .jk-closing .jk-section-inner { border-top: 2px solid var(--jk-lamp); padding-top: clamp(2rem, 6vw, 5rem); }
    .jk-theme .jk-closing-mark { color: var(--jk-lamp); }
    .jk-theme .jk-closing-copy h2 { font-weight: 600; }
    .jk-theme .jk-closing-image { box-shadow: 1rem 1rem 0 rgba(230,174,75,.5); }
    .jk-theme .jk-nav { border: 1px solid var(--jk-asphalt); background: var(--jk-asphalt); color: var(--jk-light); }
    .jk-theme .jk-nav a[aria-current="location"] { background: var(--jk-lamp); color: var(--jk-asphalt); }
    .jk-theme .jk-music { border-color: var(--jk-asphalt); background: var(--jk-lamp); color: var(--jk-asphalt); }
    @media (min-width: 768px) {
      .jk-theme .jk-event { grid-template-columns: 3.1rem minmax(0, 1fr) minmax(0, .8fr); }
      .jk-theme .jk-hero .jk-section-inner { grid-template-columns: minmax(0, 1.1fr) minmax(0, .9fr); }
    }
    @media (max-width: 767px) {
      .jk-theme .jk-cover-layout::after { width: 48%; right: -15%; top: 24%; }
      .jk-theme .jk-cover-topline span:last-child { max-width: 11ch; text-align: right; }
      .jk-theme .jk-cover-lamp { margin-bottom: 1.5rem; }
      .jk-theme .jk-hero .jk-section-inner { min-height: auto; }
      .jk-theme .jk-hero-image { margin: 0 1rem 1rem 0; }
      .jk-theme .jk-gallery-item:nth-child(3n+2) { margin-top: 0; }
    }
    @media (prefers-reduced-motion: reduce) {
      .jk-theme *, .jk-theme *::before, .jk-theme *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; }
    }
  `}</style>;
}
