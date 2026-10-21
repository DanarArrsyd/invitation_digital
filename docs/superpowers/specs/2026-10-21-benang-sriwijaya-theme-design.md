# Benang Sriwijaya — theme #008

Date: 2026-10-21. Wedding-first, with the same six event types and public capabilities as every registered theme.

## Direction

An invitation inspired by Palembang songket's woven structure. The page follows a single vertical thread. Blocks of text and photographs alternate across it; on phones the line remains at the left while the content keeps a generous reading width. The motif is a rhythm of short crossing strokes, never a pasted textile image or an invented ceremonial symbol.

The visual hierarchy is names → date → guest greeting/action on the cover, then couple → events → responses in the page. Photography is large and rectangular. Gold appears only as a fine thread, small rule, or active state. Surfaces are ivory and deep mangosteen, with warm ink for long text. This must not resemble Kelir Kencana's dark theatrical stage or Midnight Atelier's ballroom.

## Tokens and typography

- Ground `#F6F0E6`, reading paper `#FFFBF5`, ink `#30251F`, mangosteen `#512735`, thread `#A97C42`, muted `#725F57`.
- Cormorant Garamond for names and editorial headings; Manrope for body and controls; Tenor Sans for small inscriptions.
- Body text at least 16px. Small labels do not carry essential information alone.

## Storyboard

1. Cover: an upright ivory sheet framed by a pair of hairline woven rails; off-centre names, date, recipient, and a visible opening button. Opening pulls the two rails apart.
2. Hero: words first, then a 3:4 portrait inset beside the central thread.
3. People: alternating portrait/copy compositions, including parent names where provided.
4. Events: a vertical programme with a date on the thread and clear venue, time, Maps, calendar and livestream actions.
5. Story and gallery: alternating large photographs and quieter captions; short galleries remain balanced.
6. RSVP and wishes: flat ivory reading surfaces on mangosteen, with clear form states and Turnstile inside each form.
7. Closing: the thread ends in one small knot-like geometric mark; no claimed cultural symbolism.

Use the normalized invitation view model and shared copy deck, nav tiers, forms, media optimization, music/cover hook and lightbox. Empty optional sections vanish. All 18 capabilities remain available. Support 320px, 390px, tablet, desktop, long names and venues, reduced motion and expired invitations. No database queries inside the theme.

## Release boundary

Ship code, fonts, catalogue migration, an isolated fictional demo migration, developer seed, OG share style and three catalogue screenshots together. Apply theme and demo migrations only after the code is deployed. The new row can be hidden with `is_active=false, is_listed=false` without deleting invitations. No automatic production migration or merge in this task.

## Ivory refresh

Keep Nusantara Ivory's route, data and features. Recompose only the cover as a letter: a fine paper frame, sender/recipient typography and a discreet seal. De-emphasize its large gunungan outline so it reads separately from Kelir Kencana. Refresh its three screenshots after visual QA.

## Demo photography

Both cover portraits depict fictional couples. The generated source images were resized to 900 × 1200 JPEGs at `public/demo/benang-sriwijaya/cover.jpg` and `public/demo/nusantara-ivory/cover.jpg`; no customer photograph was replaced.

- Benang prompt: “Create one photorealistic editorial portrait photograph for a fictional Indonesian wedding invitation demo. A young adult Indonesian couple (one woman, one man), elegant contemporary formalwear with subtle Palembang songket textile details in deep mangosteen and warm ivory, standing together in a refined heritage interior with warm natural side light. Calm intimate mood, candid rather than posed, beautiful authentic skin texture, premium magazine photography, vertical 3:4 framing, both faces clearly visible with ample negative space around them. No text, no logos, no ceremonial regalia, no stereotyped props, no AI-looking smooth skin. This is a fictional demo image, not a real client.”
- Ivory prompt: “Photorealistic premium editorial portrait for a fictional Indonesian wedding invitation demo, Nusantara Ivory. One young adult Indonesian couple, bride in ivory kebaya and groom in elegant cream formalwear, standing together on a light-filled heritage veranda. Warm morning light, subtle jasmine, gentle candid expression, refined and believable, natural skin and fabric texture. Vertical 3:4 composition with both faces clearly visible and ample negative space. No text, logo, heavy gold decoration, ceremonial regalia, or AI-smooth skin.”
