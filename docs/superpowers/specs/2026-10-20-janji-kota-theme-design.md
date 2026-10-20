# Janji Kota — theme design

Date: 20 October 2026. Status: implementation in review. Slug `janji-kota`, CSS prefix `jk-`.

## Direction

**A city seen through the couple's own photographs.** The invitation moves from a dark, quiet street into daylight and back to the warm light of an evening meeting. Architectural lines frame the content; the people and their moments remain the subject. This is urban documentary, not a transit app, tourist postcard, printed invitation suite, or ballroom programme.

The visual system is concrete white `#F1F0EA`, near-black asphalt `#242A2B`, blue-grey steel `#AAB8BB`, soft fog `#DEE3E1`, and sodium lamp `#E6AE4B`. Amber is a small highlight; body text on pale surfaces is asphalt. Space Grotesk carries names, navigation, and functional copy. Source Serif 4 supplies the quieter personal lines. Photography can be absent without leaving decorative empty frames.

## Journey

1. **Cover — a street opens.** A dark architectural frame holds the names, date, recipient, and explicit open button. A pair of vertical panels withdraws once after the tap. Reduced motion opens immediately.
2. **Arrival.** A documentary portrait in a tall frame stands beside oversized names and an opening note. Without a photograph, the typography owns the space.
3. **People and places.** Portraits alternate with grounded copy. Event details resemble clear wayfinding information with prominent dates and venue names, not miniature maps or invented coordinates.
4. **Moments.** Stories are separate observations; the gallery mixes portrait and landscape images without assuming a full set. Quote and dress code are quieter intervals.
5. **Invitation back to the guest.** RSVP, wishes, livestream, and gifts retain the shared server actions, Turnstile, calendar, lightbox, and clipboard behavior. Their controls use the same city visual language, with visible status and error states.
6. **Closing — the light stays on.** A dark closing field uses one amber line and optional last photograph, with the supplied closing message or shared event-type fallback.

## Product contract

- All 18 registered public capabilities are represented. Feature switches, optional content, and package navigation are resolved upstream; this theme never queries Supabase or reads package names.
- Use the shared event-type copy deck, so the visual design can later host other invitation types without wedding-only strings baked into components.
- Keep the first mobile viewport clear: recipient, names, date when supplied, and the open action. Respect 320px width, long names, slow or missing images, and reduced motion.
- Add demo data and placeholder images, catalogue screenshots, self-hosted fonts, social share style, and idempotent catalogue and targeted demo migrations. No real customer content or remote database changes are part of this implementation.

## Release

Deploy the registry and media support before activating the catalogue row. Apply the two Janji Kota migrations only after review; the general developer seed deletes and recreates every demo and must not be used for this production release. Rollback deactivates the row and preserves referenced theme IDs and customer invitations.
