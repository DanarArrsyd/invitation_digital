# Terra Botanica Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the Terra Botanica wedding theme and a typed feature-parity foundation that keeps every registered theme synchronized.

**Architecture:** Keep invitation data, package entitlements, validation, and public actions in the existing shared domain. Add a compile-time theme section contract, extract reusable interaction behavior from Nusantara Ivory into headless shared hooks/helpers, and implement Terra Botanica as a separate presentation package with its own markup, tokens, ornaments, and section composition.

**Tech Stack:** Next.js 16.3.5 App Router, React 19.2.8, TypeScript 5, Tailwind CSS 4, Motion 13, Supabase PostgreSQL, Node test runner, Zod 4.

**Spec:** `docs/superpowers/specs/2026-09-24-terra-botanica-theme-design.md`

## Execution checkpoint — 25 September 2026

| Task | Status | Commits |
| --- | --- | --- |
| 1. Typed theme-section contract | Complete | `fbae86ea` |
| 2. Shared presentation view model and calendar builders | Complete | `3b639f0c`, `2b7cf69e` |
| 3. Shared client behavior | Complete | `c570bca0` |
| 4. Terra foundation and cover | Complete | `7b711fa9` |
| 5. Terra narrative and image-led sections | Complete | `361b3760` |
| 6. The Gathering event chapter | Complete | `4c792f21`, `2b2b3212` |
| 7. RSVP, wishes, and digital gifts | Complete | `a94d9139`, `d964bfaa` |
| 8. Registration, local migration, and documentation | Complete | `5534560b`, `c319d915`, `8d301dfa` |
| 9. Responsive, accessibility, performance, and whole-branch validation | **Next** | — |

Current verified implementation HEAD is `8d301dfa`. The full suite passes
139/139; lint, TypeScript, diff checks, and the production build pass. Terra is
registered in application code, but its migration remains local and has not
been applied to Supabase. See `docs/PROJECT_MEMORY.md` for resumable workflow
details and deferred review notes. Do not re-dispatch Tasks 1–8.

## Global Constraints

- Themes receive normalized `PublicInvitation` data and never query Supabase directly.
- Before component work, read `node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-client.md`, `node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md`, and `node_modules/next/dist/docs/01-app/03-api-reference/02-components/font.md` for this installed Next.js version.
- Package availability remains upstream of themes; themes only present enabled capabilities.
- Every registered theme must cover the complete typed public-section contract.
- Terra Botanica uses Fraunces for display text and Manrope for supporting text.
- Terra palette tokens are Linen `#F2E7D8`, Clay `#B6634B`, Moss `#53634E`, Cacao `#45372C`, Sun `#D6A663`, and Bone `#FBF7F0`.
- Do not add a new animation library or other runtime dependency.
- Prefer Server Components and isolate client code to actual interaction.
- All non-essential motion must honor `prefers-reduced-motion`.
- Sponsorship remains a reserved package capability; this plan does not create its data model or public UI.
- No customer self-service customization, arbitrary font/color builder, or drag-and-drop section ordering belongs in this plan.
- Do not apply the Supabase migration to a remote project or deploy production without separate explicit authorization.

## File Structure

### Shared theme foundation

- `src/themes/section-contract.ts` — canonical section keys and complete typed manifests.
- `src/themes/shared/view-model.ts` — normalized presentation calculations used by all themes.
- `src/themes/shared/calendar.ts` — pure calendar date, Google Calendar, and ICS builders.
- `src/themes/shared/use-invitation-cover.ts` — cover, analytics, focus, audio, and reduced-motion state.
- `src/themes/shared/use-active-section.ts` — reusable navigation scrollspy.
- `src/themes/shared/use-public-forms.ts` — RSVP/wish action-state wrappers and wish pagination.
- `src/themes/shared/use-copy-feedback.ts` — clipboard success lifecycle.

### Terra theme package

- `src/themes/terra-botanica/index.ts` — public theme export.
- `src/themes/terra-botanica/TerraBotanica.tsx` — composition root.
- `src/themes/terra-botanica/fonts.ts` — Fraunces and Manrope configuration.
- `src/themes/terra-botanica/ThemeStyles.tsx` — scoped tokens, texture, responsive rules, and reduced-motion rules.
- `src/themes/terra-botanica/CoverGate.tsx` — Terra cover presentation using shared cover behavior.
- `src/themes/terra-botanica/components/*` — Terra-only ornament, section, image, reveal, navigation, and calendar presentation.
- `src/themes/terra-botanica/sections/*` — focused Terra section implementations.

### Registry, database, and documentation

- `src/types/theme.ts` — section-manifest and preview metadata on `ThemeDefinition`.
- `src/themes/registry.ts` — registers Ivory and Terra.
- `supabase/migrations/20260924000001_terra_botanica_theme.sql` — idempotently adds the active admin-selectable theme row.
- `ARCHITECTURE.md` and `DESIGN.md` — document shared parity enforcement and Theme #002.

### Tests

- `tests/theme-contract.test.mjs` — registry and section parity.
- `tests/theme-view-model.test.mjs` — deterministic shared presentation calculations and sparse data.
- `tests/theme-shared-behavior.test.mjs` — Ivory uses shared interaction behavior without regressions.
- `tests/terra-botanica-render.test.mjs` — Terra composition, feature guards, empty states, and long content.
- `tests/terra-botanica-registration.test.mjs` — registry and migration integration.
- `tests/terra-botanica-quality.test.mjs` — accessibility, reduced motion, responsive-media, and performance contracts.

## Review Focus

- Missing cover image and a gallery with fewer than eight items must still produce a balanced layout without fake customer data; Task 5 renders sparse fixtures.
- Long guest, couple, parent, venue, and address values must wrap without horizontal overflow; Tasks 4–6 add long-content assertions and Task 8 performs viewport checks.
- Disabled features and enabled features with empty data must not leave orphan navigation items or decorative gaps; Tasks 2, 5, 6, and 7 exercise these states.
- Browser audio autoplay rejection and reduced-motion preference must never block opening the invitation; Task 3 tests the shared cover state and Task 8 checks motion contracts.
- Intimate, Signature, and Grand must produce identical effective features regardless of selected theme; Tasks 1 and 7 pin theme parity to the existing package normalization.

---

### Task 1: Establish the typed theme-section contract

**Files:**
- Create: `src/themes/section-contract.ts`
- Modify: `src/types/theme.ts`
- Modify: `src/themes/registry.ts`
- Create: `tests/theme-contract.test.mjs`

**Interfaces:**
- Consumes: existing `ThemeDefinition`, `ThemeRegistry`, and `NusantaraIvory`.
- Produces: `THEME_SECTION_KEYS`, `ThemeSectionKey`, `ThemeSectionManifest`, and `defineThemeSectionManifest()`; `ThemeDefinition.sections`; `ThemeDefinition.preview`.

- [ ] **Step 1: Write the failing contract test**

Create `tests/theme-contract.test.mjs` using the repository's existing TypeScript transpile helper pattern. Assert the exact canonical keys and require every registry entry to expose all of them:

```js
const expected = [
  "cover", "hero", "quote", "couple", "parents", "events",
  "countdown", "maps", "calendar", "dressCode", "story", "gallery",
  "livestream", "rsvp", "wishes", "gift", "instagram", "closing",
];

test("all registered themes cover the canonical public section contract", () => {
  assert.deepEqual([...THEME_SECTION_KEYS], expected);
  for (const [slug, definition] of Object.entries(themeRegistry)) {
    assert.deepEqual(Object.keys(definition.sections).sort(), [...expected].sort(), slug);
    assert.equal(Object.values(definition.sections).every(Boolean), true, slug);
  }
});
```

Also assert Ivory preview metadata is `{ name: "Nusantara Ivory", palette: ["#FCFAF5", "#AA8D61", "#27231F"] }` and that sponsorship is absent from the current public section keys.

- [ ] **Step 2: Run the focused test and verify failure**

Run: `node --test tests/theme-contract.test.mjs`

Expected: FAIL because the contract and registry metadata do not exist.

- [ ] **Step 3: Add the canonical contract**

Implement `src/themes/section-contract.ts`:

```ts
export const THEME_SECTION_KEYS = [
  "cover", "hero", "quote", "couple", "parents", "events",
  "countdown", "maps", "calendar", "dressCode", "story", "gallery",
  "livestream", "rsvp", "wishes", "gift", "instagram", "closing",
] as const;

export type ThemeSectionKey = (typeof THEME_SECTION_KEYS)[number];
export type ThemeSectionManifest = Record<ThemeSectionKey, true>;

export function defineThemeSectionManifest(
  manifest: ThemeSectionManifest,
): ThemeSectionManifest {
  return manifest;
}
```

Extend `ThemeDefinition` with:

```ts
preview: {
  name: string;
  palette: readonly [string, string, string];
};
sections: ThemeSectionManifest;
```

Export an explicit Ivory object literal, then supply it to the registry:

```ts
export const NUSANTARA_IVORY_SECTIONS = defineThemeSectionManifest({
  cover: true,
  hero: true,
  quote: true,
  couple: true,
  parents: true,
  events: true,
  countdown: true,
  maps: true,
  calendar: true,
  dressCode: true,
  story: true,
  gallery: true,
  livestream: true,
  rsvp: true,
  wishes: true,
  gift: true,
  instagram: true,
  closing: true,
});
```

Do not generate manifests from `THEME_SECTION_KEYS`: every theme must list every key explicitly so adding a key makes TypeScript fail until each theme is updated.

- [ ] **Step 4: Run contract and type checks**

Run: `node --test tests/theme-contract.test.mjs && npx tsc --noEmit`

Expected: PASS.

- [ ] **Step 5: Commit the contract**

```bash
git add src/themes/section-contract.ts src/types/theme.ts src/themes/registry.ts tests/theme-contract.test.mjs
git commit -m "feat(themes): enforce section parity contract"
```

### Task 2: Centralize the shared presentation view model and calendar builders

**Files:**
- Create: `src/themes/shared/view-model.ts`
- Create: `src/themes/shared/calendar.ts`
- Modify: `src/themes/nusantara-ivory/NusantaraIvory.tsx`
- Modify: `src/themes/nusantara-ivory/components/AddToCalendar.tsx`
- Create: `tests/theme-view-model.test.mjs`

**Interfaces:**
- Consumes: `PublicInvitation`, `Guest`, `getCoupleDisplayName()`, `getDressCode()`, and existing calendar behavior.
- Produces: `ThemeViewModel`, `buildThemeViewModel(invitation, guest)`, `CalendarEventInput`, `buildGoogleCalendarUrl(event)`, and `buildIcsCalendar(event, uid)`.

- [ ] **Step 1: Write failing view-model tests**

Cover deterministic event selection, feature-gated guest personalization, missing dates, empty media, and package-normalized feature flags:

```js
test("view model selects the earliest event without mutating input", () => {
  const invitation = fixture({ events: [lateEvent, earlyEvent] });
  const original = structuredClone(invitation.events);
  const vm = buildThemeViewModel(invitation, guest);
  assert.equal(vm.primaryEvent.id, earlyEvent.id);
  assert.deepEqual(invitation.events, original);
});

test("view model omits invalid optional actions and guest personalization", () => {
  const vm = buildThemeViewModel(fixture({
    eventDate: null,
    events: [],
    media: { coverImageUrl: null, musicUrl: null },
    features: { ...features, countdown: true, guestPersonalization: false },
  }), guest);
  assert.equal(vm.countdownTarget, null);
  assert.equal(vm.calendarEvent, null);
  assert.equal(vm.guestDisplayName, null);
  assert.equal(vm.heroImageUrl, null);
});
```

Test that ICS escaping and Google URL encoding preserve commas, semicolons, line breaks, and long venue strings.

- [ ] **Step 2: Run the focused test and verify failure**

Run: `node --test tests/theme-view-model.test.mjs`

Expected: FAIL because shared modules do not exist.

- [ ] **Step 3: Implement the shared view model**

Define:

```ts
export interface ThemeViewModel {
  coupleDisplayName: string;
  guestDisplayName: string | null;
  primaryEvent: InvitationEvent | null;
  countdownTarget: string | null;
  calendarEvent: CalendarEventInput | null;
  dressCode: DressCodeSettings | null;
  heroImageUrl: string | null;
  closingImageUrl: string | null;
}

export function buildThemeViewModel(
  invitation: PublicInvitation,
  guest: Guest | null,
): ThemeViewModel;
```

Move the pure calendar calculations out of Ivory. Keep `AddToCalendar` as Ivory presentation, but import `CalendarEventInput`, `buildGoogleCalendarUrl()`, and `buildIcsCalendar()` from the shared module. Update `NusantaraIvory` to consume `buildThemeViewModel()`.

- [ ] **Step 4: Run focused tests, existing tests, and types**

Run: `node --test tests/theme-view-model.test.mjs tests/invitation-share.test.mjs && npx tsc --noEmit`

Expected: PASS with Ivory behavior unchanged.

- [ ] **Step 5: Commit the shared calculations**

```bash
git add src/themes/shared/view-model.ts src/themes/shared/calendar.ts src/themes/nusantara-ivory/NusantaraIvory.tsx src/themes/nusantara-ivory/components/AddToCalendar.tsx tests/theme-view-model.test.mjs
git commit -m "refactor(themes): share invitation presentation model"
```

### Task 3: Extract reusable client behavior from Ivory

**Files:**
- Create: `src/themes/shared/use-invitation-cover.ts`
- Create: `src/themes/shared/use-active-section.ts`
- Create: `src/themes/shared/use-public-forms.ts`
- Create: `src/themes/shared/use-copy-feedback.ts`
- Modify: `src/themes/nusantara-ivory/CoverGate.tsx`
- Modify: `src/themes/nusantara-ivory/components/FloatingNav.tsx`
- Modify: `src/themes/nusantara-ivory/sections/RsvpSection.tsx`
- Modify: `src/themes/nusantara-ivory/sections/WishesSection.tsx`
- Modify: `src/themes/nusantara-ivory/sections/GiftAccountCard.tsx`
- Create: `tests/theme-shared-behavior.test.mjs`

**Interfaces:**
- Consumes: existing public server actions, `useActionState`, Motion's `useReducedMotion`, Clipboard API, and cover-open analytics action.
- Produces: `useInvitationCover(options)`, `useActiveSection(ids)`, `useRsvpForm()`, `useWishForm()`, `useWishPagination(total, pageSize)`, and `useCopyFeedback(durationMs)`.

- [ ] **Step 1: Write failing shared-behavior contract tests**

Assert Ivory imports shared behavior and no longer imports public actions directly from both form sections:

```js
test("Ivory and future themes consume shared public-form behavior", () => {
  const rsvp = source("src/themes/nusantara-ivory/sections/RsvpSection.tsx");
  const wishes = source("src/themes/nusantara-ivory/sections/WishesSection.tsx");
  assert.match(rsvp, /useRsvpForm/);
  assert.match(wishes, /useWishForm/);
  assert.doesNotMatch(rsvp, /submitRsvpAction/);
  assert.doesNotMatch(wishes, /submitWishAction/);
});
```

Add pure tests for the exported pagination helper `nextVisibleWishCount(current, total, pageSize)`, including totals of `0`, `1`, `5`, `6`, and `500`. Add `attemptAudioPlay()` tests with resolved and rejected `play()` promises; rejection must return `false` without throwing. Add a rejected Clipboard API test that proves copy feedback remains false.

- [ ] **Step 2: Run the focused test and verify failure**

Run: `node --test tests/theme-shared-behavior.test.mjs`

Expected: FAIL because the hooks and imports do not exist.

- [ ] **Step 3: Implement headless shared hooks**

`useInvitationCover()` must return:

```ts
interface InvitationCoverController {
  opened: boolean;
  playing: boolean;
  canPlayMusic: boolean;
  reducedMotion: boolean;
  audioRef: RefObject<HTMLAudioElement | null>;
  contentRef: RefObject<HTMLDivElement | null>;
  openInvitation(): void;
  toggleMusic(): void;
}
```

`openInvitation()` must set `opened` before attempting audio, call the exported `attemptAudioPlay()` helper, keep `playing` false when the browser rejects autoplay, record cover analytics without awaiting it, and move focus to the revealed region. `useActiveSection()` keeps the existing observer plus passive scroll fallback. Public-form hooks wrap the existing server actions without changing action payloads or error messages. `useCopyFeedback()` must catch clipboard rejection and avoid reporting a false success.

- [ ] **Step 4: Rewire Ivory without changing its markup or classes**

Replace internal state/effects in the five Ivory files with the shared hooks. Keep Ivory-specific SVG, animation, classes, section IDs, and copy in the Ivory package.

- [ ] **Step 5: Run regression gates**

Run: `node --test tests/theme-shared-behavior.test.mjs tests/turnstile-widget.test.mjs tests/invitation-share.test.mjs && npm run lint && npx tsc --noEmit`

Expected: PASS. Opening, forms, navigation, and gift copying retain their current behavior.

- [ ] **Step 6: Commit the behavior extraction**

```bash
git add src/themes/shared src/themes/nusantara-ivory tests/theme-shared-behavior.test.mjs
git commit -m "refactor(themes): share interactive invitation behavior"
```

### Task 4: Build the Terra shell, cover, navigation, and visual tokens

**Files:**
- Create: `src/themes/terra-botanica/index.ts`
- Create: `src/themes/terra-botanica/TerraBotanica.tsx`
- Create: `src/themes/terra-botanica/fonts.ts`
- Create: `src/themes/terra-botanica/ThemeStyles.tsx`
- Create: `src/themes/terra-botanica/CoverGate.tsx`
- Create: `src/themes/terra-botanica/components/Botanical.tsx`
- Create: `src/themes/terra-botanica/components/FloatingNav.tsx`
- Create: `src/themes/terra-botanica/components/Reveal.tsx`
- Create: `src/themes/terra-botanica/components/Section.tsx`
- Create: `src/themes/terra-botanica/components/SectionHeading.tsx`
- Create: `tests/terra-botanica-render.test.mjs`

**Interfaces:**
- Consumes: `ThemeComponentProps`, `buildThemeViewModel()`, `useInvitationCover()`, and `useActiveSection()`.
- Produces: `TerraBotanica`, Terra root class `tb-theme`, stable section IDs prefixed with `tb-`, and reusable Terra layout primitives.

- [ ] **Step 1: Add failing shell and cover assertions**

Create a full-feature invitation fixture and assert the source/render contract includes:

```js
assert.match(html, /tb-theme/);
assert.match(html, /The Wedding Journal/);
assert.match(html, /Buka Undangan/);
assert.match(html, /Kepada Yth\./);
assert.match(html, /Nama Tamu Yang Sangat Panjang/);
assert.doesNotMatch(html, /undefined|null/);
```

Add a sparse fixture with no cover image and confirm the cover still renders names, date fallback behavior, guest fallback, and the open action.

- [ ] **Step 2: Run the focused test and verify failure**

Run: `node --test --test-name-pattern="shell|cover" tests/terra-botanica-render.test.mjs`

Expected: FAIL because Terra files do not exist.

- [ ] **Step 3: Implement fonts and scoped visual tokens**

Configure `Fraunces` and `Manrope` through `next/font/google`. `ThemeStyles` must scope all tokens below `.tb-theme`, include the approved six colors, safe-area padding, `overflow-x: clip`, stable media aspect ratios, and a complete `@media (prefers-reduced-motion: reduce)` override.

- [ ] **Step 4: Implement the cover and shell**

Use the shared cover controller but custom Terra presentation: Linen surface, Clay/Moss organic silhouettes, botanical line art, editorial names, date, personalized greeting, and a 48 px minimum open action. Do not require a photo. Keep audio and analytics behavior shared.

Start `TerraBotanica` with the approved composition root and navigation candidates derived only from enabled features and available data.

- [ ] **Step 5: Run focused tests, lint, and types**

Run: `node --test --test-name-pattern="shell|cover" tests/terra-botanica-render.test.mjs && npm run lint && npx tsc --noEmit`

Expected: PASS.

- [ ] **Step 6: Commit the Terra foundation**

```bash
git add src/themes/terra-botanica tests/terra-botanica-render.test.mjs
git commit -m "feat(theme): add terra botanica foundation"
```

### Task 5: Build Terra narrative and image-led sections

**Files:**
- Create: `src/themes/terra-botanica/components/EditorialImage.tsx`
- Create: `src/themes/terra-botanica/sections/HeroSection.tsx`
- Create: `src/themes/terra-botanica/sections/QuoteSection.tsx`
- Create: `src/themes/terra-botanica/sections/CoupleSection.tsx`
- Create: `src/themes/terra-botanica/sections/StorySection.tsx`
- Create: `src/themes/terra-botanica/sections/GallerySection.tsx`
- Create: `src/themes/terra-botanica/sections/ClosingSection.tsx`
- Modify: `src/themes/terra-botanica/TerraBotanica.tsx`
- Modify: `tests/terra-botanica-render.test.mjs`

**Interfaces:**
- Consumes: normalized people, stories, gallery, content, media, theme settings, and `getPersonInstagram()`.
- Produces: narrative section IDs `tb-beranda`, `tb-mempelai`, `tb-cerita`, `tb-galeri`, and `tb-penutup`.

- [ ] **Step 1: Add failing narrative tests**

Add fixtures for two people with long parent names, zero stories, one story without an image, a three-image gallery, and an empty gallery. Assert:

```js
assert.equal(count(html, 'id="tb-mempelai"'), 1);
assert.match(html, /instagram\.com\/nara/);
assert.doesNotMatch(emptyStoryHtml, /id="tb-cerita"/);
assert.equal(count(smallGalleryHtml, /data-gallery-item/g), 3);
assert.doesNotMatch(emptyGalleryHtml, /id="tb-galeri"/);
```

Verify every image has useful `alt`, explicit `sizes`, and a stable aspect-ratio wrapper.

- [ ] **Step 2: Run narrative tests and verify failure**

Run: `node --test --test-name-pattern="narrative|gallery|sparse" tests/terra-botanica-render.test.mjs`

Expected: FAIL because narrative sections do not exist.

- [ ] **Step 3: Implement editorial narrative sections**

Use image-first asymmetric compositions, not Ivory component reuse. `CoupleSection` must render parents and optional Instagram safely. `StorySection` must support text-only entries. `GallerySection` must compute a balanced CSS-grid rhythm for any allowed item count and use responsive lazy images below the first visible item. `ClosingSection` uses the last gallery image, then cover image, then a photo-free Moss layout.

- [ ] **Step 4: Run focused and gallery regressions**

Run: `node --test tests/terra-botanica-render.test.mjs tests/gallery-order.test.mjs tests/instagram.test.mjs && npm run lint && npx tsc --noEmit`

Expected: PASS.

- [ ] **Step 5: Commit narrative sections**

```bash
git add src/themes/terra-botanica tests/terra-botanica-render.test.mjs
git commit -m "feat(theme): add terra editorial story sections"
```

### Task 6: Build The Gathering event chapter

**Files:**
- Create: `src/themes/terra-botanica/components/AddToCalendar.tsx`
- Create: `src/themes/terra-botanica/sections/EventsSection.tsx`
- Create: `src/themes/terra-botanica/sections/CountdownSection.tsx`
- Create: `src/themes/terra-botanica/sections/DressCodeSection.tsx`
- Create: `src/themes/terra-botanica/sections/LivestreamSection.tsx`
- Modify: `src/themes/terra-botanica/TerraBotanica.tsx`
- Modify: `tests/terra-botanica-render.test.mjs`

**Interfaces:**
- Consumes: shared `CalendarEventInput` and calendar builders, normalized events, `ThemeViewModel.countdownTarget`, `ThemeViewModel.dressCode`, and `features.maps`/`features.livestream`.
- Produces: `tb-acara`, `tb-countdown`, `tb-dress-code`, and `tb-livestream`.

- [ ] **Step 1: Add failing event and optional-feature tests**

Exercise one event, five events, a very long venue/address, missing map URL, missing livestream URL, disabled maps, disabled countdown, and absent dress-code content. Assert no invalid anchor is rendered and no empty optional section remains.

```js
assert.match(fullHtml, /The Gathering/);
assert.equal(count(fullHtml, /data-event-item/g), 5);
assert.doesNotMatch(noMapHtml, /Buka Maps/);
assert.doesNotMatch(noDressCodeHtml, /id="tb-dress-code"/);
assert.doesNotMatch(noLivestreamUrlHtml, /id="tb-livestream"/);
```

- [ ] **Step 2: Run event tests and verify failure**

Run: `node --test --test-name-pattern="event|countdown|dress|livestream" tests/terra-botanica-render.test.mjs`

Expected: FAIL.

- [ ] **Step 3: Implement The Gathering**

Render all events in readable Clay/Bone editorial rows. Show maps only when both the feature and a valid normalized URL exist. Use the shared calendar data/builders with Terra markup. Countdown must avoid zero-date construction and stop its timer after reaching zero. Dress-code swatches must retain text labels. Livestream appears only when an event supplies a URL.

- [ ] **Step 4: Run event, entitlement, and type gates**

Run: `node --test tests/terra-botanica-render.test.mjs tests/package-feature-normalization.test.mjs tests/package-entitlements.test.mjs && npm run lint && npx tsc --noEmit`

Expected: PASS.

- [ ] **Step 5: Commit The Gathering**

```bash
git add src/themes/terra-botanica tests/terra-botanica-render.test.mjs
git commit -m "feat(theme): add terra gathering sections"
```

### Task 7: Build Terra RSVP, wishes, and digital gift sections

**Files:**
- Create: `src/themes/terra-botanica/sections/RsvpSection.tsx`
- Create: `src/themes/terra-botanica/sections/WishesSection.tsx`
- Create: `src/themes/terra-botanica/sections/GiftSection.tsx`
- Create: `src/themes/terra-botanica/sections/GiftAccountCard.tsx`
- Modify: `src/themes/terra-botanica/TerraBotanica.tsx`
- Modify: `tests/terra-botanica-render.test.mjs`
- Modify: `tests/theme-shared-behavior.test.mjs`

**Interfaces:**
- Consumes: shared public-form and clipboard hooks, existing Turnstile widget, normalized wishes/gifts, invitation ID/slug, and optional guest token/name.
- Produces: `tb-rsvp`, `tb-ucapan`, and `tb-kado` with the exact existing server-action field names.

- [ ] **Step 1: Add failing interactive-section tests**

Assert both themes use the same shared hooks and Terra preserves server-action field names:

```js
for (const file of [terraRsvp, terraWishes]) {
  assert.match(file, /name="invitationId"/);
  assert.match(file, /name="slug"/);
  assert.match(file, /name="guestToken"/);
  assert.match(file, /TurnstileWidget/);
}
assert.match(terraRsvp, /name="attendance"/);
assert.match(terraWishes, /name="message"/);
```

Test no-gift, one-gift, empty-wishes, more-than-five-wishes, guest-personalized, error, pending, and success presentation contracts.

- [ ] **Step 2: Run interactive tests and verify failure**

Run: `node --test --test-name-pattern="RSVP|wish|gift|shared" tests/terra-botanica-render.test.mjs tests/theme-shared-behavior.test.mjs`

Expected: FAIL.

- [ ] **Step 3: Implement Terra interaction presentation**

Use flat editorial underline inputs, visible labels, 48 px controls, `aria-pressed` attendance choices, `role="alert"` errors, and existing Indonesian success/error copy. Keep Turnstile visible according to the existing widget configuration. Gift copy failure must not show “Tersalin”. Do not add sponsorship markup.

- [ ] **Step 4: Run public-form and security regressions**

Run: `node --test tests/terra-botanica-render.test.mjs tests/theme-shared-behavior.test.mjs tests/turnstile-widget.test.mjs tests/package-final-review.test.mjs && npm run lint && npx tsc --noEmit`

Expected: PASS.

- [ ] **Step 5: Commit interactive sections**

```bash
git add src/themes/terra-botanica tests/terra-botanica-render.test.mjs tests/theme-shared-behavior.test.mjs
git commit -m "feat(theme): add terra guest interactions"
```

### Task 8: Register Terra and make it admin-selectable

**Files:**
- Modify: `src/themes/registry.ts`
- Create: `supabase/migrations/20260924000001_terra_botanica_theme.sql`
- Create: `tests/terra-botanica-registration.test.mjs`
- Modify: `tests/theme-contract.test.mjs`
- Modify: `ARCHITECTURE.md`
- Modify: `DESIGN.md`

**Interfaces:**
- Consumes: `TerraBotanica`, `ThemeRegistry`, `listActiveThemes()`, and the existing `themes.slug` uniqueness constraint.
- Produces: registry slug `terra-botanica`; active database theme named `Terra Botanica`; admin discovery through existing theme queries and selects.

- [ ] **Step 1: Write failing registration and migration tests**

Assert the registry contains both themes, Terra has the full manifest, and SQL is idempotent:

```js
assert.deepEqual(Object.keys(themeRegistry).sort(), ["nusantara-ivory", "terra-botanica"]);
assert.equal(themeRegistry["terra-botanica"].preview.name, "Terra Botanica");
assert.equal(themeRegistry["terra-botanica"].category, "wedding");
assert.match(sql, /insert into public\.themes/i);
assert.match(sql, /'Terra Botanica',\s*'terra-botanica',\s*'wedding'/i);
assert.match(sql, /on conflict \(slug\) do update/i);
```

Also load package normalization for all three package keys with both theme slugs and assert the effective features are equal for the same package.

- [ ] **Step 2: Run registration tests and verify failure**

Run: `node --test tests/terra-botanica-registration.test.mjs tests/theme-contract.test.mjs`

Expected: FAIL because Terra is not registered or seeded.

- [ ] **Step 3: Register the component and add the migration**

Add:

```sql
insert into public.themes (name, slug, category, description, is_active)
values (
  'Terra Botanica',
  'terra-botanica',
  'wedding',
  'Organic editorial garden wedding theme.',
  true
)
on conflict (slug) do update
set name = excluded.name,
    category = excluded.category,
    description = excluded.description,
    is_active = true,
    updated_at = now();
```

Register Terra with preview palette `["#F2E7D8", "#B6634B", "#53634E"]` and the following explicit manifest:

```ts
export const TERRA_BOTANICA_SECTIONS = defineThemeSectionManifest({
  cover: true,
  hero: true,
  quote: true,
  couple: true,
  parents: true,
  events: true,
  countdown: true,
  maps: true,
  calendar: true,
  dressCode: true,
  story: true,
  gallery: true,
  livestream: true,
  rsvp: true,
  wishes: true,
  gift: true,
  instagram: true,
  closing: true,
});
```

Do not generate the manifest from the canonical key list. Do not change the existing admin forms; their database-driven theme lists should discover the new active row automatically.

- [ ] **Step 4: Document Theme #002 and parity architecture**

Update `DESIGN.md` with Terra's approved art direction, tokens, typography, storyboard, and motion rules. Update `ARCHITECTURE.md` with the section contract, shared behavior boundary, and requirement that a feature addition updates every registered theme.

- [ ] **Step 5: Run registration, package, and type gates**

Run: `node --test tests/terra-botanica-registration.test.mjs tests/theme-contract.test.mjs tests/package-feature-normalization.test.mjs && npm run lint && npx tsc --noEmit`

Expected: PASS.

- [ ] **Step 6: Commit registration and documentation**

```bash
git add src/themes/registry.ts supabase/migrations/20260924000001_terra_botanica_theme.sql tests/terra-botanica-registration.test.mjs tests/theme-contract.test.mjs ARCHITECTURE.md DESIGN.md
git commit -m "feat(theme): register terra botanica"
```

### Task 9: Validate responsive, accessibility, and performance contracts

**Files:**
- Create: `tests/terra-botanica-quality.test.mjs`
- Modify: `src/themes/terra-botanica/ThemeStyles.tsx`
- Modify: Terra component files only where validation finds a defect.

**Interfaces:**
- Consumes: completed Terra package and the full registered-theme contract.
- Produces: automated quality gates and a visually accepted Terra theme.

- [ ] **Step 1: Add failing quality-contract tests**

Assert:

```js
assert.match(styles, /prefers-reduced-motion:\s*reduce/);
assert.match(styles, /overflow-x:\s*clip/);
assert.doesNotMatch(themeSources, /<img\b/);
assert.doesNotMatch(themeSources, /querySelector|supabase|createSupabase/);
assert.match(coverSource, /min-h-\[48px\]|min-height:\s*48px/);
assert.match(formSources, /role="alert"/);
assert.match(formSources, /<label|aria-label/);
```

Add contract checks that every feature-controlled section is guarded by its normalized feature flag and rendered at most once.

- [ ] **Step 2: Run quality tests and verify any failures**

Run: `node --test tests/terra-botanica-quality.test.mjs`

Expected: FAIL on any missing quality contract; if all production code already satisfies a check, first verify the test fails by temporarily targeting a known absent marker, then restore the intended assertion.

- [ ] **Step 3: Fix only evidenced quality defects**

Address failures in the narrowest Terra file. Ensure no horizontal overflow at 320 px, stable media boxes on slow loading, visible keyboard focus, readable contrast, reduced-motion overrides, and no disabled-feature initialization.

- [ ] **Step 4: Run the complete automated gate**

Run:

```bash
git diff --check
npm test
npm run lint
npx tsc --noEmit
npm run build
```

Expected: all tests pass, lint and TypeScript are clean, and the production build succeeds.

- [ ] **Step 5: Perform manual visual acceptance**

Run the production build locally and inspect both `nusantara-ivory` and `terra-botanica` with representative fixtures at:

- 320 × 568;
- 390 × 844;
- 768 × 1024;
- 1440 × 900.

Verify long guest/couple/parent/venue names, one and maximum events, sparse and full gallery, music disabled, optional sections disabled, reduced motion, expired invitation routing, and slow-image placeholders. Confirm Ivory remains visually unchanged.

- [ ] **Step 6: Commit quality fixes and tests**

```bash
git add tests/terra-botanica-quality.test.mjs src/themes/terra-botanica
git commit -m "test(theme): verify terra responsive quality"
```

## Completion Gate

Before calling the implementation complete:

1. Request a focused review of every task as it lands.
2. Request one whole-branch review against this plan and the linked spec.
3. Resolve all Critical and Important findings.
4. Re-run `git diff --check && npm test && npm run lint && npx tsc --noEmit && npm run build` from a clean working tree except known ignored Supabase temp files.
5. Report the exact commit range and verification counts.
6. Do not push, apply the remote migration, or deploy until the user explicitly requests those actions.
