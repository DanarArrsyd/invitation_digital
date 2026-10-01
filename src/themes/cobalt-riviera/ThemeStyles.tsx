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
        --cr-focus-ring: ${colors.cobalt};
        min-height: 100svh;
        overflow-x: clip;
        background: var(--cr-porcelain);
        color: var(--cr-sea-ink);
        font-family: var(--font-cr-body), Georgia, serif;
      }
      .cr-theme, .cr-theme *, .cr-theme *::before, .cr-theme *::after { box-sizing: border-box; }
      .cr-gate { --cr-mobile-nav-clearance: 5.5rem; min-height: 100svh; }
      .cr-cover {
        --cr-focus-ring: var(--cr-citron);
        position: fixed;
        inset: 0;
        z-index: 60;
        min-height: 100svh;
        overflow-x: hidden;
        overflow-y: auto;
        background: var(--cr-cobalt);
        color: var(--cr-porcelain);
        transition: visibility 0s linear 800ms;
      }
      .cr-horizon { position: fixed; inset: 0; overflow: hidden; pointer-events: none; }
      .cr-horizon-shutter {
        position: absolute;
        left: 0;
        width: 100%;
        height: 50%;
        background: var(--cr-cobalt);
        transition: transform 800ms cubic-bezier(.76, 0, .24, 1);
        will-change: transform;
      }
      .cr-shutter-upper { top: 0; }
      .cr-shutter-lower { bottom: 0; }
      .cr-horizon-seam {
        position: absolute;
        top: 50%;
        left: 0;
        width: 100%;
        height: 1px;
        background: var(--cr-porcelain);
        transition: opacity 180ms ease 300ms;
      }
      .cr-cover-frame {
        position: relative;
        z-index: 1;
        display: grid;
        width: min(100%, 96rem);
        min-height: 100svh;
        margin-inline: auto;
        padding: max(1.25rem, env(safe-area-inset-top)) clamp(1.1rem, 6vw, 6rem) max(1.5rem, env(safe-area-inset-bottom));
        grid-template-rows: auto minmax(0, 1fr) auto;
        gap: clamp(1rem, 4svh, 3rem);
        transition: opacity 180ms ease, transform 800ms cubic-bezier(.76, 0, .24, 1);
      }
      .cr-cover-masthead {
        display: flex;
        min-width: 0;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        border-bottom: 1px solid var(--cr-porcelain);
        padding-bottom: .65rem;
        font-family: var(--font-cr-display), Arial, sans-serif;
        font-size: .7rem;
        font-weight: 650;
        letter-spacing: .14em;
        text-transform: uppercase;
      }
      .cr-cover-stage { align-self: center; min-width: 0; }
      .cr-cover-intro {
        margin: 0 0 .65rem;
        font-family: var(--font-cr-body), Georgia, serif;
        font-size: clamp(.9rem, 2.5vw, 1.15rem);
      }
      .cr-cover-names {
        display: flex;
        max-width: 100%;
        margin: 0;
        flex-wrap: wrap;
        align-items: baseline;
        gap: .05em .2em;
        font-family: var(--font-cr-display), Arial, sans-serif;
        font-size: clamp(3.15rem, 17vw, 10rem);
        font-variation-settings: "wght" 640;
        letter-spacing: -.065em;
        line-height: .78;
        overflow-wrap: anywhere;
      }
      .cr-cover-names > span { min-width: 0; overflow-wrap: anywhere; }
      .cr-cover-amp { color: var(--cr-citron); font-size: .48em; letter-spacing: 0; }
      .cr-cover-stage time {
        display: block;
        margin-top: clamp(1rem, 3svh, 2rem);
        font-family: var(--font-cr-display), Arial, sans-serif;
        font-size: .78rem;
        font-weight: 650;
        letter-spacing: .12em;
        text-transform: uppercase;
      }
      .cr-cover-recipient {
        display: grid;
        min-width: 0;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 1rem;
        align-items: end;
        border-top: 1px solid var(--cr-porcelain);
        padding-top: .8rem;
      }
      .cr-cover-recipient p { margin: 0; }
      .cr-cover-recipient > div > p:first-child {
        font-family: var(--font-cr-display), Arial, sans-serif;
        font-size: .68rem;
        font-weight: 650;
        letter-spacing: .12em;
        text-transform: uppercase;
      }
      .cr-cover-guest-name {
        max-width: 42rem;
        margin-top: .35rem !important;
        color: var(--cr-citron);
        font-size: clamp(1rem, 3vw, 1.35rem);
        line-height: 1.15;
        overflow-wrap: anywhere;
      }
      .cr-cover-open {
        display: inline-grid;
        min-width: 7.5rem;
        max-width: 11rem;
        padding: 0;
        border: 0;
        grid-template-columns: 3.25rem minmax(0, 1fr);
        align-items: center;
        gap: .7rem;
        background: transparent;
        color: var(--cr-porcelain);
        cursor: pointer;
        font: 650 .76rem/1.05 var(--font-cr-display), Arial, sans-serif;
        letter-spacing: .08em;
        text-align: left;
        text-transform: uppercase;
      }
      .cr-cover-open .cr-sun-mark {
        width: 3.25rem;
        transition: transform 800ms cubic-bezier(.76, 0, .24, 1);
      }
      .cr-cover-open:active .cr-sun-mark { transform: translateY(-6px); }
      .cr-gate[data-opened="true"] .cr-cover { visibility: hidden; pointer-events: none; }
      .cr-gate[data-opened="true"] .cr-shutter-upper { transform: translateY(-101%); }
      .cr-gate[data-opened="true"] .cr-shutter-lower { transform: translateY(101%); }
      .cr-gate[data-opened="true"] .cr-horizon-seam { opacity: 0; }
      .cr-gate[data-opened="true"] .cr-cover-frame { opacity: 0; transform: translateY(-1rem); }
      .cr-gate[data-opened="true"] .cr-cover-open .cr-sun-mark { transform: translateY(-20px); }
      .cr-content {
        min-height: 100svh;
        padding-bottom: calc(var(--cr-mobile-nav-clearance) + env(safe-area-inset-bottom));
        outline: none;
      }
      .cr-route-anchor { position: absolute; top: 0; }
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
      .cr-hero .cr-section-inner { padding: 0; }
      .cr-hero-layout {
        display: grid;
        min-width: 0;
        min-height: 100svh;
        grid-template-rows: auto auto 1fr;
      }
      .cr-hero-masthead {
        display: flex;
        min-width: 0;
        margin: 0 clamp(1.25rem, 6vw, 6rem);
        padding: 1.25rem 0 .75rem;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        border-bottom: 1px solid var(--cr-sea-ink);
      }
      .cr-hero-image { width: 100%; }
      .cr-hero-horizon {
        position: relative;
        display: grid;
        min-height: clamp(18rem, 62vw, 44rem);
        grid-template-rows: 1.2fr .8fr;
        background: var(--cr-pool);
        overflow: hidden;
      }
      .cr-hero-horizon-sky { background: var(--cr-cobalt); }
      .cr-hero-horizon-ground { border-top: 1px solid var(--cr-sea-ink); background: var(--cr-citron); }
      .cr-hero-horizon-name {
        position: absolute;
        right: -.035em;
        bottom: 22%;
        left: -.035em;
        margin: 0;
        overflow: hidden;
        color: var(--cr-porcelain);
        font-family: var(--font-cr-display), Arial, sans-serif;
        font-size: clamp(4.5rem, 19vw, 15rem);
        font-variation-settings: "wght" 690;
        letter-spacing: -.075em;
        line-height: .7;
        overflow-wrap: anywhere;
        text-overflow: clip;
      }
      .cr-hero-horizon-route {
        position: absolute;
        top: 1rem;
        right: clamp(1rem, 3vw, 2.5rem);
        color: var(--cr-citron);
        font-family: var(--font-cr-display), Arial, sans-serif;
        font-size: .72rem;
        font-weight: 700;
        letter-spacing: .12em;
      }
      .cr-hero-copy {
        display: grid;
        min-width: 0;
        padding: clamp(2rem, 7vw, 6rem) clamp(1.25rem, 6vw, 6rem);
        align-content: start;
        gap: 1rem;
      }
      .cr-hero-index, .cr-person-route, .cr-closing-copy > p:first-child {
        margin: 0;
        font-family: var(--font-cr-display), Arial, sans-serif;
        font-size: .72rem;
        font-weight: 680;
        letter-spacing: .12em;
        text-transform: uppercase;
      }
      .cr-hero-copy h2, .cr-chapter-heading h2, .cr-person-copy h3, .cr-closing-copy h2 {
        margin: 0;
        font-family: var(--font-cr-display), Arial, sans-serif;
        font-variation-settings: "wght" 620;
        letter-spacing: -.055em;
        line-height: .86;
        overflow-wrap: anywhere;
      }
      .cr-hero-copy h2 { max-width: 11ch; font-size: clamp(3rem, 14vw, 9rem); }
      .cr-hero-copy time {
        font-family: var(--font-cr-display), Arial, sans-serif;
        font-size: .78rem;
        font-weight: 650;
        letter-spacing: .11em;
        text-transform: uppercase;
      }
      .cr-hero-copy > p:not(.cr-hero-index):not(.cr-guest) {
        max-width: 52ch;
        margin: 0;
        font-size: clamp(1.05rem, 2vw, 1.35rem);
        line-height: 1.55;
      }
      .cr-hero-copy .cr-guest { color: var(--cr-cobalt); }
      .cr-quote { min-height: auto; }
      .cr-quote .cr-section-inner { min-height: 70svh; }
      .cr-quote-layout {
        display: grid;
        min-height: inherit;
        align-content: center;
        justify-items: center;
        gap: clamp(2rem, 6vw, 4rem);
        text-align: center;
      }
      .cr-quote blockquote {
        max-width: 32ch;
        margin: 0;
        font-family: var(--font-cr-body), Georgia, serif;
        font-size: clamp(1.7rem, 5vw, 3.6rem);
        font-variation-settings: "opsz" 48;
        line-height: 1.1;
        overflow-wrap: anywhere;
      }
      .cr-quote-layout > p {
        margin: 0;
        font-family: var(--font-cr-display), Arial, sans-serif;
        font-size: .68rem;
        font-weight: 650;
        letter-spacing: .14em;
        text-transform: uppercase;
      }
      .cr-couple .cr-section-inner { display: grid; gap: clamp(3rem, 8vw, 7rem); }
      .cr-chapter-heading {
        display: grid;
        max-width: 48rem;
        gap: .8rem;
      }
      .cr-chapter-heading > p { margin: 0; font-style: italic; }
      .cr-chapter-heading h2 { color: var(--cr-cobalt); font-size: clamp(3rem, 10vw, 7rem); }
      .cr-people { display: grid; gap: clamp(4rem, 12vw, 10rem); }
      .cr-person {
        display: grid;
        min-width: 0;
        gap: clamp(1.5rem, 5vw, 4rem);
        align-items: center;
      }
      .cr-person-portrait, .cr-person-monogram { width: 100%; }
      .cr-person-monogram {
        display: grid;
        aspect-ratio: 4 / 5;
        place-items: end start;
        padding: clamp(1.25rem, 5vw, 3.5rem);
        border: 1px solid var(--cr-sea-ink);
        background: var(--cr-pool);
        color: var(--cr-cobalt);
        font: 620 clamp(6rem, 32vw, 15rem)/.7 var(--font-cr-display), Arial, sans-serif;
        overflow: hidden;
      }
      .cr-person-copy {
        display: grid;
        min-width: 0;
        max-width: 72ch;
        gap: 1.25rem;
        overflow-wrap: anywhere;
      }
      .cr-person-copy h3 { color: var(--cr-cobalt); font-size: clamp(2.6rem, 9vw, 6.5rem); }
      .cr-parents { display: grid; gap: .3rem; border-top: 1px solid var(--cr-sea-ink); padding-top: 1rem; }
      .cr-parents p { margin: 0; }
      .cr-parents p:first-child {
        font-family: var(--font-cr-display), Arial, sans-serif;
        font-size: .72rem;
        font-weight: 680;
        letter-spacing: .1em;
        text-transform: uppercase;
      }
      .cr-parent-join { color: var(--cr-tangerine); }
      .cr-person-bio { max-width: 58ch; margin: 0; font-size: 1.05rem; line-height: 1.65; }
      .cr-instagram {
        width: fit-content;
        border-bottom: 2px solid var(--cr-tangerine);
        color: var(--cr-sea-ink);
        font-family: var(--font-cr-display), Arial, sans-serif;
        font-weight: 680;
        text-decoration: none;
        overflow-wrap: anywhere;
      }
      .cr-events .cr-section-inner {
        display: grid;
        min-height: auto;
        gap: clamp(3rem, 8vw, 6rem);
      }
      .cr-events-heading { max-width: 58rem; }
      .cr-event-list { margin: 0; padding: 0; border-top: 1px solid var(--cr-sea-ink); list-style: none; }
      .cr-event {
        display: grid;
        min-width: 0;
        padding: clamp(1.75rem, 5vw, 3.5rem) 0;
        gap: 1.25rem;
        border-bottom: 1px solid var(--cr-sea-ink);
        overflow-wrap: anywhere;
      }
      .cr-event-index, .cr-event-type {
        margin: 0;
        font-family: var(--font-cr-display), Arial, sans-serif;
        font-size: .7rem;
        font-weight: 680;
        letter-spacing: .12em;
        text-transform: uppercase;
      }
      .cr-event-index { color: var(--cr-tangerine); }
      .cr-event-main, .cr-event-place { display: grid; min-width: 0; align-content: start; gap: .65rem; }
      .cr-event-main h3 {
        margin: 0;
        color: var(--cr-cobalt);
        font: 620 clamp(2.2rem, 8vw, 5rem)/.88 var(--font-cr-display), Arial, sans-serif;
        letter-spacing: -.05em;
      }
      .cr-event-main time, .cr-event-time {
        margin: 0;
        font-family: var(--font-cr-display), Arial, sans-serif;
        font-size: .82rem;
        font-weight: 620;
        letter-spacing: .04em;
      }
      .cr-event-venue { margin: 0; font-size: clamp(1.2rem, 3vw, 1.75rem); font-weight: 650; line-height: 1.15; }
      .cr-event-address { max-width: 52ch; margin: 0; line-height: 1.55; }
      .cr-event-actions {
        --cr-focus-ring: ${colors.cobalt};
        display: flex;
        min-height: 48px;
        flex-wrap: wrap;
        align-items: center;
        gap: .35rem 1rem;
      }
      .cr-event-actions a, .cr-calendar-actions button {
        border: 0;
        border-bottom: 2px solid var(--cr-tangerine);
        background: transparent;
        color: var(--cr-sea-ink);
        cursor: pointer;
        font: 680 .78rem/1 var(--font-cr-display), Arial, sans-serif;
        text-decoration: none;
      }
      .cr-calendar-actions { display: flex; flex-wrap: wrap; gap: .35rem 1rem; }
      .cr-countdown { min-height: auto; }
      .cr-countdown .cr-section-inner { display: grid; min-height: 78svh; align-content: center; gap: clamp(3rem, 8vw, 6rem); }
      .cr-countdown-heading { display: grid; max-width: 60rem; gap: .75rem; }
      .cr-countdown-heading p, .cr-livestream-copy p {
        margin: 0;
        color: var(--cr-citron);
        font-family: var(--font-cr-display), Arial, sans-serif;
        font-size: .7rem;
        font-weight: 680;
        letter-spacing: .14em;
        text-transform: uppercase;
      }
      .cr-countdown-heading h2, .cr-livestream-copy h2 {
        margin: 0;
        font: 620 clamp(3rem, 10vw, 7rem)/.84 var(--font-cr-display), Arial, sans-serif;
        letter-spacing: -.055em;
        overflow-wrap: anywhere;
      }
      .cr-countdown-units {
        display: grid;
        margin: 0;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        border-top: 1px solid var(--cr-porcelain);
      }
      .cr-countdown-units > div { min-width: 0; padding: 1rem .5rem 0 0; }
      .cr-countdown-units dd {
        margin: 0;
        color: var(--cr-citron);
        font: 620 clamp(2.5rem, 15vw, 8rem)/.8 var(--font-cr-display), Arial, sans-serif;
        letter-spacing: -.06em;
      }
      .cr-countdown-units dt {
        margin-top: .5rem;
        font: 650 .7rem/1 var(--font-cr-display), Arial, sans-serif;
        letter-spacing: .1em;
        text-transform: uppercase;
      }
      .cr-dress-code { min-height: auto; }
      .cr-dress-code .cr-section-inner { display: grid; min-height: 72svh; align-content: center; gap: clamp(2rem, 6vw, 4rem); }
      .cr-dress-heading h2 { color: var(--cr-sea-ink); }
      .cr-dress-description { max-width: 58ch; margin: 0; font-size: clamp(1.1rem, 2vw, 1.4rem); line-height: 1.55; }
      .cr-dress-groups { display: grid; border-top: 1px solid var(--cr-sea-ink); }
      .cr-dress-group {
        display: grid;
        min-width: 0;
        padding: 1.5rem 0;
        gap: 1rem;
        border-bottom: 1px solid var(--cr-sea-ink);
      }
      .cr-dress-group h3 { margin: 0; font: 680 .78rem/1 var(--font-cr-display), Arial, sans-serif; letter-spacing: .1em; text-transform: uppercase; }
      .cr-dress-group ul { display: flex; margin: 0; padding: 0; flex-wrap: wrap; gap: 1rem; list-style: none; }
      .cr-dress-group li { display: grid; min-width: 5.5rem; grid-template-columns: 2rem minmax(0, 1fr); align-items: center; gap: .55rem; font: 620 .72rem/1 var(--font-cr-display), Arial, sans-serif; }
      .cr-dress-swatch { display: block; width: 2rem; aspect-ratio: 1; border: 1px solid var(--cr-sea-ink); }
      .cr-livestream { --cr-focus-ring: ${colors.citron}; min-height: auto; }
      .cr-livestream .cr-section-inner { display: grid; min-height: 58svh; align-content: center; gap: clamp(2rem, 6vw, 4rem); }
      .cr-livestream-copy { display: grid; max-width: 62rem; gap: .75rem; }
      .cr-livestream-copy > span { max-width: 48ch; font-size: 1.05rem; line-height: 1.55; }
      .cr-livestream ul { margin: 0; padding: 0; border-top: 1px solid var(--cr-porcelain); list-style: none; }
      .cr-livestream li { border-bottom: 1px solid var(--cr-porcelain); }
      .cr-livestream a {
        display: flex;
        width: 100%;
        min-width: 0;
        padding: 1rem 0;
        justify-content: space-between;
        gap: 1rem;
        color: var(--cr-porcelain);
        font: 650 clamp(1rem, 3vw, 1.35rem)/1.15 var(--font-cr-display), Arial, sans-serif;
        text-decoration: none;
        overflow-wrap: anywhere;
      }
      .cr-story { min-height: auto; }
      .cr-story .cr-section-inner { display: grid; gap: clamp(2.5rem, 7vw, 6rem); }
      .cr-story-heading, .cr-gallery-heading {
        display: grid;
        min-width: 0;
        gap: .75rem;
      }
      .cr-story-heading > p, .cr-gallery-heading > p {
        margin: 0;
        font: 680 .74rem/1 var(--font-cr-display), Arial, sans-serif;
        letter-spacing: .1em;
        text-transform: uppercase;
      }
      .cr-story-heading h2, .cr-gallery-heading h2 {
        max-width: 12ch;
        margin: 0;
        font: 620 clamp(3rem, 11vw, 8rem)/.82 var(--font-cr-display), Arial, sans-serif;
        font-variation-settings: "wght" 620;
        letter-spacing: -.06em;
        overflow-wrap: anywhere;
      }
      .cr-story-rail { min-width: 0; }
      .cr-story-list {
        display: grid;
        min-width: 0;
        margin: 0;
        padding: 0;
        gap: clamp(1.25rem, 4vw, 3rem);
        list-style: none;
      }
      .cr-story-entry {
        display: grid;
        min-width: 0;
        background: var(--cr-porcelain);
        color: var(--cr-sea-ink);
      }
      .cr-story-image { width: 100%; }
      .cr-story-copy {
        display: grid;
        min-width: 0;
        padding: clamp(1.5rem, 6vw, 4rem);
        align-content: center;
        gap: .8rem;
        overflow-wrap: anywhere;
      }
      .cr-story-index {
        color: var(--cr-tangerine);
        font: 700 .75rem/1 var(--font-cr-display), Arial, sans-serif;
        letter-spacing: .1em;
      }
      .cr-story-date {
        margin: 0;
        font: 650 .76rem/1.25 var(--font-cr-display), Arial, sans-serif;
        letter-spacing: .08em;
        text-transform: uppercase;
      }
      .cr-story-copy h3 {
        max-width: 16ch;
        margin: 0;
        font: 620 clamp(2.25rem, 8vw, 5.5rem)/.87 var(--font-cr-display), Arial, sans-serif;
        font-variation-settings: "wght" 620;
        letter-spacing: -.055em;
        overflow-wrap: anywhere;
      }
      .cr-story-description { max-width: 62ch; margin: .4rem 0 0; font-size: 1.05rem; line-height: 1.62; }
      .cr-story-text-only .cr-story-copy { min-height: clamp(21rem, 68vw, 36rem); background: var(--cr-citron); }
      .cr-gallery { min-height: auto; }
      .cr-gallery .cr-section-inner { display: grid; gap: clamp(2.5rem, 7vw, 6rem); }
      .cr-gallery-heading { grid-template-columns: minmax(0, 1fr); }
      .cr-gallery-mosaic {
        display: grid;
        min-width: 0;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: clamp(.5rem, 2vw, 1.25rem);
      }
      .cr-gallery-item { min-width: 0; margin: 0; grid-column: span 1; }
      .cr-gallery-anchor { grid-column: 1 / -1; }
      .cr-gallery-item:last-child:nth-child(even) { grid-column: 1 / -1; }
      .cr-gallery-image { width: 100%; }
      .cr-gallery-item figcaption {
        padding-top: .65rem;
        font-size: .95rem;
        line-height: 1.45;
        overflow-wrap: anywhere;
      }
      .cr-rsvp, .cr-wishes, .cr-gift { min-height: auto; }
      .cr-rsvp .cr-section-inner,
      .cr-wishes .cr-section-inner,
      .cr-gift .cr-section-inner {
        display: grid;
        min-width: 0;
        min-height: auto;
        gap: clamp(2.5rem, 7vw, 6rem);
      }
      .cr-interaction-heading {
        display: grid;
        min-width: 0;
        max-width: 58rem;
        align-content: start;
        gap: .9rem;
        overflow-wrap: anywhere;
      }
      .cr-interaction-heading > p {
        margin: 0;
        color: var(--cr-citron);
        font: 680 .72rem/1 var(--font-cr-display), Arial, sans-serif;
        letter-spacing: .12em;
        text-transform: uppercase;
      }
      .cr-interaction-heading h2 {
        max-width: 12ch;
        margin: 0;
        font: 620 clamp(3rem, 11vw, 8rem)/.82 var(--font-cr-display), Arial, sans-serif;
        font-variation-settings: "wght" 620;
        letter-spacing: -.06em;
        overflow-wrap: anywhere;
      }
      .cr-interaction-heading > span { max-width: 52ch; font-size: 1.05rem; line-height: 1.6; }
      .cr-interaction-heading-dark > p { color: var(--cr-cobalt); }
      .cr-rsvp-sheet {
        --cr-focus-ring: var(--cr-cobalt);
        min-width: 0;
        padding: clamp(1.25rem, 5vw, 3.5rem);
        background: var(--cr-porcelain);
        color: var(--cr-sea-ink);
      }
      .cr-form { display: grid; min-width: 0; gap: 1.5rem; }
      .cr-form-field { display: grid; min-width: 0; gap: .55rem; }
      .cr-form-field label, .cr-form-recipient > span, .cr-attendance legend {
        font: 680 .72rem/1 var(--font-cr-display), Arial, sans-serif;
        letter-spacing: .1em;
        text-transform: uppercase;
      }
      .cr-form-control {
        width: 100%;
        min-width: 0;
        min-height: 48px;
        padding: .75rem 0;
        border: 0;
        border-bottom: 1px solid var(--cr-sea-ink);
        background: transparent;
        color: var(--cr-sea-ink);
        font: 1rem/1.5 var(--font-cr-body), Georgia, serif;
      }
      .cr-form-control::placeholder { color: color-mix(in srgb, var(--cr-sea-ink) 62%, transparent); }
      .cr-form-textarea { min-height: 9rem; resize: vertical; }
      .cr-form-recipient { display: grid; min-width: 0; gap: .5rem; border-bottom: 1px solid var(--cr-sea-ink); padding-bottom: 1rem; }
      .cr-form-recipient strong { font-size: clamp(1.2rem, 3vw, 1.65rem); overflow-wrap: anywhere; }
      .cr-attendance { min-width: 0; margin: 0; padding: 0; border: 0; }
      .cr-attendance legend { margin-bottom: .8rem; }
      .cr-attendance-choices { display: grid; min-width: 0; gap: .75rem; }
      .cr-attendance-choice {
        display: grid;
        width: 100%;
        min-width: 0;
        min-height: 56px;
        padding: .85rem 1rem;
        border: 1px solid var(--cr-sea-ink);
        grid-template-columns: minmax(0, 1fr) 1.5rem;
        align-items: center;
        gap: 1rem;
        background: var(--cr-porcelain);
        color: var(--cr-sea-ink);
        cursor: pointer;
        font: 680 .82rem/1.15 var(--font-cr-display), Arial, sans-serif;
        text-align: left;
        transition: background-color 180ms ease, border-color 180ms ease, color 180ms ease;
      }
      .cr-attendance-choice[data-selected="true"] {
        border-color: var(--cr-tangerine);
        background: var(--cr-tangerine);
        color: var(--cr-sea-ink);
      }
      .cr-attendance-check {
        display: grid;
        width: 1.5rem;
        aspect-ratio: 1;
        border: 1px solid currentColor;
        clip-path: circle(50%);
        place-items: center;
        font-size: .8rem;
      }
      .cr-form-submit, .cr-more-wishes, .cr-gift-receipt button {
        min-height: 48px;
        border: 1px solid currentColor;
        background: transparent;
        color: inherit;
        cursor: pointer;
        font: 680 .78rem/1 var(--font-cr-display), Arial, sans-serif;
      }
      .cr-form-submit { width: 100%; padding: .9rem 1rem; background: var(--cr-cobalt); color: var(--cr-porcelain); }
      .cr-form-submit:disabled { cursor: not-allowed; opacity: .58; }
      .cr-form-error { margin: 0; border-left: .35rem solid var(--cr-tangerine); padding: .85rem 1rem; background: var(--cr-porcelain); color: var(--cr-sea-ink); line-height: 1.5; }
      .cr-form-success {
        display: grid;
        min-width: 0;
        grid-template-columns: 2.5rem minmax(0, 1fr);
        align-items: start;
        gap: 1rem;
        overflow-wrap: anywhere;
      }
      .cr-form-success > span { display: grid; width: 2.5rem; aspect-ratio: 1; place-items: center; background: var(--cr-citron); color: var(--cr-sea-ink); font-weight: 800; }
      .cr-form-success strong { font: 620 clamp(1.8rem, 5vw, 3rem)/1 var(--font-cr-display), Arial, sans-serif; }
      .cr-form-success p { margin: .5rem 0 0; line-height: 1.5; }
      .cr-form-success-dark { display: block; margin: 0; border-top: 1px solid var(--cr-sea-ink); padding-top: 1.25rem; }
      .cr-form .cf-turnstile { max-width: 100%; overflow: hidden; }
      .cr-wishes-compose { display: grid; min-width: 0; align-content: start; gap: clamp(2rem, 5vw, 4rem); }
      .cr-wish-form { --cr-focus-ring: var(--cr-cobalt); }
      .cr-wishes-ledger { min-width: 0; }
      .cr-wishes-empty { margin: 0; border-block: 1px solid var(--cr-sea-ink); padding: 2rem 0; font-size: 1.05rem; line-height: 1.6; }
      .cr-wishes-list, .cr-gift-list { min-width: 0; margin: 0; padding: 0; list-style: none; }
      .cr-wish-entry {
        display: grid;
        min-width: 0;
        padding: 1.5rem 0;
        grid-template-columns: 2.75rem minmax(0, 1fr);
        gap: 1rem;
        border-top: 1px solid var(--cr-sea-ink);
        overflow-wrap: anywhere;
      }
      .cr-wish-entry:last-child { border-bottom: 1px solid var(--cr-sea-ink); }
      .cr-wish-route, .cr-gift-route {
        color: var(--cr-tangerine);
        font: 700 .72rem/1 var(--font-cr-display), Arial, sans-serif;
        letter-spacing: .08em;
      }
      .cr-wish-meta { display: flex; min-width: 0; flex-wrap: wrap; justify-content: space-between; gap: .4rem 1rem; }
      .cr-wish-meta strong { font-family: var(--font-cr-display), Arial, sans-serif; }
      .cr-wish-meta time { font-size: .78rem; }
      .cr-wish-entry p { max-width: 62ch; margin: .65rem 0 0; line-height: 1.6; white-space: pre-wrap; }
      .cr-more-wishes { width: 100%; margin-top: 1.25rem; padding: .9rem 1rem; }
      .cr-gift-list { border-top: 1px solid var(--cr-sea-ink); }
      .cr-gift-receipt {
        display: grid;
        min-width: 0;
        padding: clamp(1.5rem, 4vw, 2.5rem) 0;
        gap: 1rem;
        border-bottom: 1px solid var(--cr-sea-ink);
        overflow-wrap: anywhere;
      }
      .cr-gift-details { display: grid; min-width: 0; gap: .5rem; }
      .cr-gift-provider, .cr-gift-number, .cr-gift-owner { margin: 0; }
      .cr-gift-provider { font: 680 .78rem/1.25 var(--font-cr-display), Arial, sans-serif; letter-spacing: .05em; }
      .cr-gift-number { color: var(--cr-cobalt); font: 620 clamp(1.7rem, 7vw, 4.5rem)/.95 var(--font-cr-display), Arial, sans-serif; letter-spacing: -.04em; }
      .cr-gift-owner { line-height: 1.5; }
      .cr-gift-owner span { font-family: var(--font-cr-display), Arial, sans-serif; font-size: .72rem; font-weight: 680; letter-spacing: .08em; text-transform: uppercase; }
      .cr-gift-receipt button { width: 100%; padding: .85rem 1rem; }
      .cr-closing .cr-section-inner { padding: 0; }
      .cr-closing-layout { display: grid; min-height: 100svh; }
      .cr-closing-copy {
        display: grid;
        min-width: 0;
        padding: clamp(3.5rem, 10vw, 8rem) clamp(1.25rem, 6vw, 6rem);
        align-content: center;
        gap: 1.5rem;
      }
      .cr-closing-copy h2 { max-width: 11ch; font-size: clamp(3rem, 12vw, 8rem); }
      .cr-closing-copy > p:not(:first-child) { max-width: 48ch; margin: 0; font-size: 1.1rem; line-height: 1.6; }
      .cr-closing-horizon {
        display: grid;
        min-height: 42svh;
        align-items: end;
        background: var(--cr-pool);
      }
      .cr-closing-horizon span { height: 38%; border-top: 1px solid var(--cr-sea-ink); background: var(--cr-citron); }
      .cr-route-nav {
        --cr-focus-ring: var(--cr-cobalt);
        position: fixed;
        z-index: 40;
        background: var(--cr-porcelain);
        color: var(--cr-sea-ink);
        font-family: var(--font-cr-display), Arial, sans-serif;
      }
      .cr-route-nav ul { display: flex; margin: 0; padding: 0; list-style: none; }
      .cr-route-nav li { flex: 0 0 auto; }
      .cr-route-nav a {
        display: grid;
        min-width: 5.25rem;
        padding: .55rem .8rem;
        grid-template-columns: auto minmax(0, 1fr);
        align-items: center;
        gap: .55rem;
        color: inherit;
        font-size: .7rem;
        font-weight: 560;
        letter-spacing: .04em;
        text-decoration: none;
      }
      .cr-route-glyph { display: grid; width: 1.4rem; place-items: center; font-size: .54rem; line-height: 1; }
      .cr-route-glyph > span:first-child {
        display: block;
        width: .5rem;
        aspect-ratio: 1;
        margin-bottom: .2rem;
        background: var(--cr-tangerine);
        transform: rotate(45deg);
      }
      .cr-route-nav a[aria-current="location"] {
        --cr-focus-ring: var(--cr-sea-ink);
        background: var(--cr-citron);
        font-weight: 720;
      }
      .cr-route-nav a[aria-current="location"] .cr-route-glyph > span:first-child { background: var(--cr-cobalt); }
      .cr-music {
        --cr-focus-ring: var(--cr-sea-ink);
        position: fixed;
        right: max(1rem, env(safe-area-inset-right));
        bottom: calc(var(--cr-mobile-nav-clearance) + env(safe-area-inset-bottom));
        z-index: 41;
        display: grid;
        width: 3rem;
        min-height: 3rem;
        padding: 0;
        border: 1px solid var(--cr-sea-ink);
        place-items: center;
        background: var(--cr-citron);
        color: var(--cr-sea-ink);
        cursor: pointer;
      }
      .cr-music svg { width: 1.1rem; fill: currentColor; }
      .cr-theme :is(a, button, input, textarea, select) { min-height: 48px; }
      :where(.cr-theme) a { display: inline-flex; align-items: center; }
      .cr-theme :is(a, button, input, textarea, select):focus-visible {
        outline: 3px solid var(--cr-focus-ring);
        outline-offset: 4px;
      }
      @media (max-width: 767px) {
        .cr-cover-frame { max-height: none; }
        .cr-cover-recipient { grid-template-columns: minmax(0, 1fr); align-items: start; }
        .cr-cover-open { justify-self: start; }
        .cr-route-nav {
          right: 0;
          bottom: 0;
          left: 0;
          padding-bottom: env(safe-area-inset-bottom);
          border-top: 1px solid var(--cr-sea-ink);
          overflow-x: auto;
          overscroll-behavior-inline: contain;
        }
        .cr-route-nav ul { width: max-content; min-width: 100%; }
        .cr-story-rail {
          width: calc(100% + clamp(1.25rem, 6vw, 6rem));
          padding-bottom: .75rem;
          overflow-x: auto;
          scroll-snap-type: x proximity;
          scrollbar-gutter: stable;
        }
        .cr-story-rail:focus-visible { outline: 3px solid var(--cr-sea-ink); outline-offset: 4px; }
        .cr-story-list {
          width: max-content;
          grid-auto-flow: column;
          grid-auto-columns: minmax(17rem, calc(100vw - clamp(2.5rem, 12vw, 5rem)));
        }
        .cr-story-entry { scroll-snap-align: start; }
      }
      @media (min-width: 768px) {
        .cr-content { padding-bottom: 0; }
        .cr-hero-layout { grid-template-columns: minmax(0, 1.6fr) minmax(18rem, .75fr); grid-template-rows: auto 1fr; }
        .cr-hero-masthead { grid-column: 1 / -1; }
        .cr-hero-image, .cr-hero-horizon { grid-column: 1; min-height: 0; }
        .cr-hero-copy { grid-column: 2; grid-row: 2; align-content: center; }
        .cr-person { grid-template-columns: minmax(0, 1fr) minmax(18rem, .86fr); }
        .cr-person[data-position="right"] { grid-template-columns: minmax(18rem, .86fr) minmax(0, 1fr); }
        .cr-person[data-position="right"] .cr-person-portrait,
        .cr-person[data-position="right"] .cr-person-monogram { grid-column: 2; grid-row: 1; }
        .cr-person[data-position="right"] .cr-person-copy { grid-column: 1; grid-row: 1; }
        .cr-event { grid-template-columns: 3.5rem minmax(15rem, .85fr) minmax(0, 1.15fr); gap: clamp(1.5rem, 4vw, 4rem); }
        .cr-countdown-units { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        .cr-countdown-units > div + div { border-left: 1px solid var(--cr-porcelain); padding-left: clamp(1rem, 3vw, 2.5rem); }
        .cr-dress-group { grid-template-columns: minmax(8rem, .35fr) minmax(0, 1fr); align-items: center; }
        .cr-livestream .cr-section-inner { grid-template-columns: minmax(0, 1.2fr) minmax(18rem, .8fr); align-items: end; }
        .cr-story-rail { overflow: visible; scroll-snap-type: none; }
        .cr-story-entry { grid-template-columns: minmax(0, 1.05fr) minmax(18rem, .95fr); }
        .cr-story-entry[data-layout="copy-first"] .cr-story-image { grid-column: 2; grid-row: 1; }
        .cr-story-entry[data-layout="copy-first"] .cr-story-copy { grid-column: 1; grid-row: 1; }
        .cr-story-text-only { grid-template-columns: minmax(0, 1fr); }
        .cr-story-text-only .cr-story-copy { padding-inline: clamp(3rem, 12vw, 11rem); }
        .cr-gallery-heading { grid-template-columns: minmax(10rem, .3fr) minmax(0, 1fr); align-items: end; }
        .cr-gallery-mosaic { grid-template-columns: repeat(12, minmax(0, 1fr)); }
        .cr-gallery-item, .cr-gallery-item:last-child:nth-child(even) { grid-column: span 6; }
        .cr-gallery-span-5 { grid-column: span 5; }
        .cr-gallery-span-7 { grid-column: span 7; }
        .cr-gallery-span-12, .cr-gallery-anchor { grid-column: 1 / -1; }
        .cr-rsvp .cr-section-inner { grid-template-columns: minmax(0, 1fr) minmax(22rem, .85fr); align-items: start; }
        .cr-rsvp-sheet { margin-top: clamp(3rem, 8vw, 7rem); }
        .cr-attendance-choices { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .cr-wishes .cr-section-inner { grid-template-columns: minmax(20rem, .8fr) minmax(0, 1.2fr); align-items: start; }
        .cr-wishes-ledger { padding-top: clamp(3rem, 8vw, 7rem); }
        .cr-gift .cr-section-inner { grid-template-columns: minmax(16rem, .55fr) minmax(0, 1.45fr); align-items: start; }
        .cr-gift-list { margin-top: clamp(3rem, 8vw, 7rem); }
        .cr-gift-receipt { grid-template-columns: 3.5rem minmax(0, 1fr) auto; align-items: center; gap: clamp(1rem, 3vw, 2rem); }
        .cr-gift-receipt button { width: auto; min-width: 8.5rem; }
        .cr-closing-layout { grid-template-columns: minmax(18rem, .72fr) minmax(0, 1.28fr); }
        .cr-closing-image, .cr-closing-horizon { grid-column: 2; grid-row: 1; }
        .cr-foundation-layout { grid-template-columns: minmax(0, 1fr) minmax(12rem, .35fr); }
        .cr-foundation-header { grid-column: 1 / -1; }
        .cr-foundation-copy { grid-column: 1; }
        .cr-foundation-footer { grid-column: 2; align-self: end; }
        .cr-cover-frame { grid-template-columns: minmax(0, 1.65fr) minmax(16rem, .55fr); }
        .cr-cover-masthead { grid-column: 1 / -1; }
        .cr-cover-stage { grid-column: 1; }
        .cr-cover-recipient { grid-column: 2; align-self: end; grid-template-columns: minmax(0, 1fr); }
        .cr-route-nav {
          top: 50%;
          right: 0;
          border: 1px solid var(--cr-sea-ink);
          border-right: 0;
          transform: translateY(-50%);
        }
        .cr-route-nav ul { max-height: 76vh; flex-direction: column; overflow-y: auto; }
        .cr-route-nav a { min-width: 8rem; }
        .cr-music {
          right: max(9.5rem, calc(8rem + env(safe-area-inset-right)));
          bottom: max(1.25rem, env(safe-area-inset-bottom));
        }
      }
      @media (min-width: 1200px) {
        .cr-hero-copy { padding-inline: clamp(3rem, 5vw, 6rem); }
        .cr-person { padding-right: 8vw; }
        .cr-person[data-position="right"] { padding-right: 0; padding-left: 8vw; }
      }
      .cr-gate[data-reduced-motion="true"] .cr-cover,
      .cr-gate[data-reduced-motion="true"] .cr-horizon-shutter,
      .cr-gate[data-reduced-motion="true"] .cr-horizon-seam,
      .cr-gate[data-reduced-motion="true"] .cr-cover-frame,
      .cr-gate[data-reduced-motion="true"] .cr-cover-open .cr-sun-mark {
        transition: none;
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
