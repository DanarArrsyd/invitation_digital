# Template QA Matrix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the lightweight QA tool from the template readiness audit (PR 1): a dev-only fixture route that renders any template for any package, invitation type and data condition, plus a Playwright runner that screenshots the matrix and reports failed checks, then record the baseline run.

**Architecture:** A pure builder (`src/lib/qa/fixture-invitation.ts`) turns the existing demo content (`scripts/demo/content.mjs`) into a `PublicInvitation`, applying packages with the same functions production uses. A route (`src/app/qa-matrix/[themeSlug]/page.tsx`) validates query parameters, refuses to run in production, and renders `ThemeRenderer`. A pure case/check module (`scripts/qa/matrix-cases.mjs`) defines the matrix and evaluates a page probe; the runner (`scripts/qa/matrix.mjs`) drives Chromium through an externally installed `playwright-core`.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, Zod, `node --test` with vm/`ts.transpileModule` harnesses, `playwright-core` (outside the project, like `scripts/demo/images.mjs`).

**Spec:** `docs/superpowers/specs/2026-10-11-template-readiness-audit-design.md` (Part 1). Rounds A–C get their own plans after the baseline findings exist.

## Global Constraints

- No new npm dependencies; the runner loads `playwright-core` from outside the project (`require("playwright-core")`, else `process.env.PLAYWRIGHT_CORE`), exactly as `scripts/demo/images.mjs` does.
- `/qa-matrix/*` calls `notFound()` when `process.env.NODE_ENV === "production"`, before reading params or data.
- The fixture never touches Supabase, never writes analytics, never contains customer data; it only reuses `scripts/demo/content.mjs` and `public/demo/<theme>/` images.
- Packages are applied with `resolveEffectiveInvitationFeatures`, `NAV_SECTIONS_BY_PACKAGE` and `PACKAGE_DEFINITIONS[key].limits` (`maxEvents`, `maxGalleryImages`); never re-implement tiers.
- Query parameters: `paket` (`intimate|signature|grand`, default `signature`), `jenis` (an `InvitationType`, default `wedding`), `kondisi` (`lengkap|minim|panjang`, default `lengkap`), `to` (guest name, default `Nama Tamu Anda`; `none` = no guest). Invalid values fall back to the default.
- Viewports (DESIGN.md §28.7): 320×568, 375×812, 768×1024, 1280×800.
- Core matrix = 105 pages; `--full` = 1,080 pages.
- Wedding-only strings checked on non-wedding pages: `/mempelai/i`, `/the wedding of/i`, `/pernikahan/i`. The fixture itself must contain none of them for non-wedding types.
- Nav items on phone widths (< 768 px) are at least 52 px tall.
- Output goes to `qa-output/<timestamp>/` (gitignored). The runner exits 1 when any check fails, 2 when the dev server is unreachable.
- Commit messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` (subagents use their own model name). Ask the owner before merging (merges deploy production).

## Review Focus

1. Odd query strings (`?paket=gold`, `?jenis=`, repeated `?paket=a&paket=b`) must render the defaults, never a 500 — Task 2 tests them.
2. A non-wedding fixture must not carry wedding words from the demo data (gift account "Nama Mempelai Sample", the Ar-Rum quote, "Akad Nikah" titles, "Pernikahan …" title), or the audit blames themes for fixture text — Task 1 tests every non-wedding type.
3. `minim` must produce empty-but-valid arrays and nulls, never `undefined` fields a theme could crash on — Task 1 tests the shape.
4. Running the runner without `npm run dev` must fail fast with a clear message and exit 2, not hang per case — Task 4 implements a preflight and its manual check.
5. An invitation slug `qa-matrix` would be shadowed by the static route — Task 2 adds it to `RESERVED_INVITATION_SLUGS` and tests the rejection.

---

### Task 1: Fixture builder

**Files:**
- Create: `src/lib/qa/fixture-invitation.ts`
- Test: `tests/qa-fixture-invitation.test.mjs`

**Interfaces:**
- Consumes: `PACKAGE_DEFINITIONS`, `resolveEffectiveInvitationFeatures`, `PackageKey` (`src/lib/packages/entitlements.ts`); `NAV_SECTIONS_BY_PACKAGE` (`src/lib/packages/nav-sections.ts`); `DEFAULT_INVITATION_TIME_ZONE` (`src/lib/invitations/time-zones.ts`); types from `src/types/invitation.ts`.
- Produces:
  - `QA_CONDITIONS = ["lengkap", "minim", "panjang"] as const`, `type QaCondition`
  - `QA_DEFAULT_GUEST = "Nama Tamu Anda"`
  - `interface QaDemoSource`, `interface QaDemoLibrary`, `interface QaFixtureOptions { packageKey: PackageKey; type: InvitationType; condition: QaCondition; guestName: string | null }`
  - `buildQaFixture(source: QaDemoSource, library: QaDemoLibrary, options: QaFixtureOptions): { invitation: PublicInvitation; guest: Guest | null }`

- [ ] **Step 1: Write the failing tests**

Create `tests/qa-fixture-invitation.test.mjs`:

```js
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

import ts from "typescript";

import { DEMOS, GIFTS, IMAGE_SLOTS, STORIES, WISHES, imagePath } from "../scripts/demo/content.mjs";

function loadTs(path, dependencies = {}) {
  const source = ts.transpileModule(readFileSync(new URL(`../src/${path}`, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  vm.runInNewContext(source, {
    exports,
    module: { exports },
    encodeURIComponent,
    Date,
    require(name) {
      if (Object.hasOwn(dependencies, name)) return dependencies[name];
      throw new Error(`Unexpected import in ${path}: ${name}`);
    },
  });
  return exports;
}

const entitlements = loadTs("lib/packages/entitlements.ts");
const navSections = loadTs("lib/packages/nav-sections.ts");
const timeZones = loadTs("lib/invitations/time-zones.ts");
const { buildQaFixture, QA_CONDITIONS, QA_DEFAULT_GUEST } = loadTs("lib/qa/fixture-invitation.ts", {
  "@/lib/packages/entitlements": entitlements,
  "@/lib/packages/nav-sections": navSections,
  "@/lib/invitations/time-zones": timeZones,
});

const library = { stories: STORIES, gifts: GIFTS, wishes: WISHES, imageSlots: IMAGE_SLOTS, imagePath };
const terra = DEMOS.find((demo) => demo.theme === "terra-botanica");
const build = (options = {}) => buildQaFixture(terra, library, {
  packageKey: "signature", type: "wedding", condition: "lengkap", guestName: QA_DEFAULT_GUEST, ...options,
});
const NON_WEDDING = ["birthday", "engagement", "aqiqah", "graduation", "corporate"];
// The demo seed's switches (scripts/demo/build-seed.mjs FEATURES).
const REQUESTED = {
  music: false, countdown: true, maps: true, story: true, gallery: true, dressCode: true,
  livestream: true, rsvp: true, wishes: true, gift: true, guestPersonalization: true,
};
const WEDDING_ONLY = /mempelai|pernikahan|the wedding of/i;

test("packages are applied with the production tiers and limits", () => {
  for (const packageKey of entitlements.PACKAGE_KEYS) {
    const { invitation } = build({ packageKey });
    const { limits } = entitlements.PACKAGE_DEFINITIONS[packageKey];
    assert.deepEqual([...invitation.navSections], [...navSections.NAV_SECTIONS_BY_PACKAGE[packageKey]]);
    assert.ok(invitation.events.length <= limits.maxEvents, `${packageKey} events`);
    assert.ok(invitation.gallery.length <= limits.maxGalleryImages, `${packageKey} gallery`);
    assert.ok(invitation.gallery.length > 0);
    assert.deepEqual(invitation.features, entitlements.resolveEffectiveInvitationFeatures(packageKey, REQUESTED));
    assert.deepEqual(invitation.theme.settings.features, invitation.features);
  }
});

test("a wedding fixture keeps the demo content as written", () => {
  const { invitation, guest } = build();
  assert.equal(invitation.title, terra.title);
  assert.deepEqual(invitation.people.map((person) => person.role), ["bride", "groom"]);
  assert.equal(invitation.events[0].title, terra.events[0].title);
  assert.equal(invitation.content.openingQuote, terra.opening_quote);
  assert.equal(invitation.theme.slug, "terra-botanica");
  assert.equal(guest.displayName, QA_DEFAULT_GUEST);
});

test("non-wedding fixtures carry no wedding-only words and the right cast", () => {
  for (const demo of DEMOS) {
    for (const type of NON_WEDDING) {
      for (const condition of QA_CONDITIONS) {
        const { invitation, guest } = buildQaFixture(demo, library, { packageKey: "grand", type, condition, guestName: QA_DEFAULT_GUEST });
        assert.equal(invitation.type, type);
        assert.doesNotMatch(JSON.stringify({ invitation, guest }), WEDDING_ONLY, `${demo.theme}/${type}/${condition} leaks wedding copy`);
      }
    }
  }
  assert.deepEqual(build({ type: "birthday" }).invitation.people.map((p) => p.role), ["celebrant"]);
  assert.deepEqual(build({ type: "aqiqah" }).invitation.people.map((p) => p.role), ["celebrant"]);
  assert.deepEqual(build({ type: "graduation" }).invitation.people.map((p) => p.role), ["celebrant"]);
  assert.deepEqual(build({ type: "corporate" }).invitation.people.map((p) => p.role), ["host"]);
  assert.equal(build({ type: "engagement" }).invitation.people.length, 2);
});

test("minim keeps a valid shape with only the essentials", () => {
  const { invitation } = build({ condition: "minim", packageKey: "grand" });
  assert.equal(invitation.events.length, 1);
  for (const key of ["stories", "gallery", "gifts", "wishes"]) assert.deepEqual(invitation[key], [], key);
  assert.equal(invitation.content.openingQuote, null);
  for (const person of invitation.people) {
    assert.equal(person.fatherName, null);
    assert.equal(person.motherName, null);
  }
  for (const [key, value] of Object.entries(invitation)) assert.notEqual(value, undefined, key);
});

test("panjang stresses names, venues, wishes and the guest", () => {
  const { invitation, guest } = build({ condition: "panjang" });
  assert.ok(invitation.people[0].fullName.split(" ").some((word) => word.length >= 40), "an unbroken 40+ character word");
  assert.ok(invitation.events[0].venueName.length >= 50);
  assert.ok(invitation.wishes[0].message.length >= 300);
  assert.ok(guest.displayName.length >= 50);
});

test("a no-guest link renders without a guest", () => {
  assert.equal(build({ guestName: null }).guest, null);
  assert.deepEqual([...QA_CONDITIONS], ["lengkap", "minim", "panjang"]);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/qa-fixture-invitation.test.mjs`
Expected: FAIL with `ENOENT` for `src/lib/qa/fixture-invitation.ts`.

- [ ] **Step 3: Write the builder**

Create `src/lib/qa/fixture-invitation.ts`:

```ts
import { DEFAULT_INVITATION_TIME_ZONE } from "@/lib/invitations/time-zones";
import {
  PACKAGE_DEFINITIONS,
  resolveEffectiveInvitationFeatures,
  type PackageKey,
} from "@/lib/packages/entitlements";
import { NAV_SECTIONS_BY_PACKAGE } from "@/lib/packages/nav-sections";
import type {
  GalleryItem,
  Guest,
  InvitationFeatures,
  InvitationPerson,
  InvitationType,
  PersonRole,
  PublicInvitation,
} from "@/types/invitation";

/**
 * Local QA fixtures (src/app/qa-matrix): the demo content rendered as any
 * package, invitation type and data condition. Packages go through the same
 * functions production uses, so only `type` and `condition` change data on
 * purpose. Never used for a real invitation.
 */

export const QA_CONDITIONS = ["lengkap", "minim", "panjang"] as const;
export type QaCondition = (typeof QA_CONDITIONS)[number];

export const QA_DEFAULT_GUEST = "Nama Tamu Anda";

export interface QaDemoSource {
  theme: string;
  title: string;
  eventDate: string;
  venue: string;
  opening_quote: string | null;
  opening_message: string | null;
  closing_message: string | null;
  people: ReadonlyArray<{ role: string; fullName: string; nickname: string; father: string; mother: string; bio: string }>;
  events: ReadonlyArray<{
    type: string;
    title: string;
    date: string;
    start: string;
    end: string;
    venue: string;
    address: string;
    livestream?: string;
  }>;
  dressCode?: unknown;
}

export interface QaDemoLibrary {
  stories: ReadonlyArray<{ title: string; year: string; description: string }>;
  gifts: ReadonlyArray<{ type: string; provider: string; number: string; name: string }>;
  wishes: ReadonlyArray<{ name: string; message: string }>;
  imageSlots: ReadonlyArray<{ file: string; aspectRatio?: string }>;
  imagePath: (theme: string, file: string) => string;
}

export interface QaFixtureOptions {
  packageKey: PackageKey;
  type: InvitationType;
  condition: QaCondition;
  guestName: string | null;
}

// Same switches as the demo seed (scripts/demo/build-seed.mjs); no music file exists.
const REQUESTED_FEATURES: InvitationFeatures = {
  music: false,
  countdown: true,
  maps: true,
  story: true,
  gallery: true,
  dressCode: true,
  livestream: true,
  rsvp: true,
  wishes: true,
  gift: true,
  guestPersonalization: true,
};

/** Who a non-wedding invitation is about; engagement keeps the couple. */
const SOLO_ROLE: Partial<Record<InvitationType, PersonRole>> = {
  birthday: "celebrant",
  aqiqah: "celebrant",
  graduation: "celebrant",
  corporate: "host",
};

/** Neutral sample copy per type, free of wedding-only words. */
const TYPE_COPY: Record<Exclude<InvitationType, "wedding">, { noun: string; events: readonly [string, string, string] }> = {
  engagement: { noun: "Lamaran", events: ["Lamaran", "Ramah tamah", "Syukuran keluarga"] },
  birthday: { noun: "Ulang Tahun", events: ["Tiup lilin", "Makan malam", "Pesta kebun"] },
  aqiqah: { noun: "Aqiqah", events: ["Pembacaan doa", "Syukuran", "Ramah tamah"] },
  graduation: { noun: "Wisuda", events: ["Prosesi wisuda", "Syukuran", "Makan malam"] },
  corporate: { noun: "Peluncuran", events: ["Pembukaan", "Sesi utama", "Jamuan malam"] },
};

const LONG_WORD = "Kusumawardhaniprameswaridewantarisekararum";
const LONG = {
  name: `Raden Ajeng ${LONG_WORD}`,
  venue: "Gedung Serbaguna Sample dengan Nama yang Sangat Panjang Sekali",
  address: "Jl. Contoh Panjang Sekali No. 123, RT 004/RW 011, Kelurahan Sample, Kecamatan Sample, Kabupaten Sample",
  wish: "Doa terbaik untuk hari yang istimewa ini. ".repeat(8).trim(),
  guest: "Bapak Raden Mas Haryo Wicaksono Adiningrat beserta keluarga besar",
};

const PUBLISHED_AT = "2026-10-01T00:00:00.000Z";

export function buildQaFixture(
  source: QaDemoSource,
  library: QaDemoLibrary,
  options: QaFixtureOptions,
): { invitation: PublicInvitation; guest: Guest | null } {
  const { packageKey, type, condition } = options;
  const definition = PACKAGE_DEFINITIONS[packageKey];
  const wedding = type === "wedding";
  const copy = type === "wedding" ? null : TYPE_COPY[type];
  const minimal = condition === "minim";
  const long = condition === "panjang";
  const image = (file: string) => library.imagePath(source.theme, file);

  const soloRole = SOLO_ROLE[type];
  const cast = soloRole ? source.people.slice(0, 1) : source.people;
  const people: InvitationPerson[] = cast.map((person, index) => ({
    id: `qa-person-${index + 1}`,
    role: soloRole ?? (person.role as PersonRole),
    fullName: long ? (index === 0 ? LONG.name : `${person.fullName} ${LONG_WORD}`) : person.fullName,
    nickname: person.nickname,
    fatherName: minimal ? null : person.father,
    motherName: minimal ? null : person.mother,
    photoUrl: image(`person-${index + 1}.jpg`),
    bio: wedding ? person.bio : null,
    sortOrder: index,
  }));

  const events = source.events
    .slice(0, minimal ? 1 : definition.limits.maxEvents)
    .map((event, index) => {
      const venueName = long ? LONG.venue : event.venue;
      const address = long ? LONG.address : event.address;
      return {
        id: `qa-event-${index + 1}`,
        eventType: event.type,
        title: copy ? copy.events[index % copy.events.length] : event.title,
        eventDate: event.date,
        startTime: `${event.start}:00`,
        endTime: `${event.end}:00`,
        venueName,
        address,
        mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${venueName}, ${address}`)}`,
        livestreamUrl: event.livestream ?? null,
        sortOrder: index,
      };
    });

  const gallery: GalleryItem[] = minimal
    ? []
    : library.imageSlots
        .filter((slot) => slot.aspectRatio)
        .slice(0, definition.limits.maxGalleryImages)
        .map((slot, index) => ({
          id: `qa-gallery-${index + 1}`,
          imageUrl: image(slot.file),
          caption: null,
          altText: `Sample ${index + 1}`,
          aspectRatio: slot.aspectRatio as GalleryItem["aspectRatio"],
          sortOrder: index,
        }));

  const stories = minimal
    ? []
    : library.stories.map((story, index) => ({
        id: `qa-story-${index + 1}`,
        title: story.title,
        storyDate: null,
        yearLabel: story.year,
        description: story.description,
        imageUrl: image(`story-${index + 1}.jpg`),
        sortOrder: index,
      }));

  const gifts = minimal
    ? []
    : library.gifts.map((gift, index) => ({
        id: `qa-gift-${index + 1}`,
        providerType: gift.type,
        providerName: gift.provider,
        accountNumber: gift.number,
        accountName: people[0]?.fullName ?? gift.name,
        logoUrl: null,
        sortOrder: index,
      }));

  const wishes = minimal
    ? []
    : library.wishes.map((wish, index) => ({
        id: `qa-wish-${index + 1}`,
        guestId: null,
        guestName: wish.name,
        message: long && index === 0 ? LONG.wish : wish.message,
        isVisible: true,
        createdAt: new Date(Date.UTC(2026, 9, 1, 12 - index)).toISOString(),
      }));

  const features = resolveEffectiveInvitationFeatures(packageKey, REQUESTED_FEATURES);
  const settings: Record<string, unknown> = { features, timeZone: DEFAULT_INVITATION_TIME_ZONE };
  if (definition.invitationFeatures.dressCode && source.dressCode) settings.dressCode = source.dressCode;

  const invitation: PublicInvitation = {
    id: `qa-${source.theme}`,
    type,
    navSections: NAV_SECTIONS_BY_PACKAGE[packageKey],
    slug: `qa-${source.theme}`,
    title: copy ? `${copy.noun} ${people[0]?.nickname ?? ""}`.trim() : source.title,
    status: "published",
    eventDate: source.eventDate,
    venueSummary: long ? LONG.venue : source.venue,
    publishedAt: PUBLISHED_AT,
    expiresAt: null,
    timeZone: DEFAULT_INVITATION_TIME_ZONE,
    theme: { slug: source.theme, settings },
    people,
    events,
    stories,
    gallery,
    gifts,
    wishes,
    content: {
      openingQuote: wedding && !minimal ? source.opening_quote : null,
      openingMessage: source.opening_message,
      closingMessage: source.closing_message,
    },
    features,
    media: { musicUrl: null, coverImageUrl: image("cover.jpg") },
  };

  const guest: Guest | null = options.guestName === null
    ? null
    : { id: "qa-guest", displayName: long ? LONG.guest : options.guestName, token: "", notes: null };

  return { invitation, guest };
}
```

If `npm run typecheck` later reports a `PublicInvitation` field missing from this object (the type may have gained fields after this plan was written), add it with the value `normalize.ts` would produce for a fresh invitation; do not loosen the type.

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/qa-fixture-invitation.test.mjs`
Expected: PASS (6 tests). Then `npm run typecheck` — clean.

- [ ] **Step 5: Commit**

```bash
git add src/lib/qa/fixture-invitation.ts tests/qa-fixture-invitation.test.mjs
git commit -m "feat(qa): fixture builder for the template QA matrix

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Dev-only fixture route

**Files:**
- Create: `src/app/qa-matrix/[themeSlug]/page.tsx`
- Modify: `src/lib/validation/invitation.ts` (`RESERVED_INVITATION_SLUGS`)
- Test: `tests/qa-matrix-route.test.mjs`

**Interfaces:**
- Consumes: `buildQaFixture`, `QA_CONDITIONS`, `QA_DEFAULT_GUEST` (Task 1); `PACKAGE_KEYS` (`src/lib/packages/entitlements.ts`); `invitationTypeSchema`, `RESERVED_INVITATION_SLUGS` (`src/lib/validation/invitation.ts`); `ThemeRenderer`; `DEMOS`, `STORIES`, `GIFTS`, `WISHES`, `IMAGE_SLOTS`, `imagePath` (`scripts/demo/content.mjs`).
- Produces: `GET /qa-matrix/<themeSlug>?paket=&jenis=&kondisi=&to=` (dev only). The page renders `<div hidden data-qa-nav-sections="hero,couple,…" data-qa-type="<type>">` before the theme; Task 4's probe reads it.

- [ ] **Step 1: Write the failing tests**

Create `tests/qa-matrix-route.test.mjs`:

```js
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import vm from "node:vm";

import ts from "typescript";

const nodeRequire = createRequire(import.meta.url);

function loadTs(path, dependencies = {}, context = {}) {
  const source = ts.transpileModule(readFileSync(new URL(`../src/${path}`, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const exports = {};
  vm.runInNewContext(source, {
    exports,
    module: { exports },
    ...context,
    require(name) {
      if (Object.hasOwn(dependencies, name)) return dependencies[name];
      throw new Error(`Unexpected import in ${path}: ${name}`);
    },
  });
  return exports;
}

const timeZones = loadTs("lib/invitations/time-zones.ts");
const validation = loadTs("lib/validation/invitation.ts", { zod: nodeRequire("zod"), "@/lib/invitations/time-zones": timeZones });
const entitlements = loadTs("lib/packages/entitlements.ts");

function loadPage(nodeEnv) {
  const calls = [];
  class NotFound extends Error {}
  const page = loadTs("app/qa-matrix/[themeSlug]/page.tsx", {
    "next/navigation": { notFound: () => { throw new NotFound("not found"); } },
    zod: nodeRequire("zod"),
    "react/jsx-runtime": nodeRequire("react/jsx-runtime"),
    "@/lib/packages/entitlements": entitlements,
    "@/lib/validation/invitation": validation,
    "@/lib/qa/fixture-invitation": {
      QA_CONDITIONS: ["lengkap", "minim", "panjang"],
      QA_DEFAULT_GUEST: "Nama Tamu Anda",
      buildQaFixture: (source, _library, options) => {
        calls.push({ theme: source.theme, ...options });
        return { invitation: { type: options.type, navSections: ["hero", "couple"] }, guest: null };
      },
    },
    "@/themes/theme-fonts": {},
    "@/themes/ThemeRenderer": { ThemeRenderer: () => null },
    "../../../../scripts/demo/content.mjs": {
      DEMOS: [{ theme: "terra-botanica" }], STORIES: [], GIFTS: [], WISHES: [], IMAGE_SLOTS: [], imagePath: () => "",
    },
  }, { process: { env: { NODE_ENV: nodeEnv } } });
  return { Page: page.default, calls, NotFound };
}

const render = (Page, themeSlug, query = {}) => Page({ params: Promise.resolve({ themeSlug }), searchParams: Promise.resolve(query) });

test("production never renders the QA matrix, before reading anything", async () => {
  const { Page, calls, NotFound } = loadPage("production");
  let paramsRead = false;
  const params = { then: (resolve) => { paramsRead = true; resolve({ themeSlug: "terra-botanica" }); } };
  await assert.rejects(Page({ params, searchParams: Promise.resolve({}) }), NotFound);
  assert.equal(paramsRead, false, "the guard runs before params are awaited");
  assert.equal(calls.length, 0);
});

test("an unknown template is a 404 in development", async () => {
  const { Page, NotFound } = loadPage("development");
  await assert.rejects(render(Page, "not-a-theme"), NotFound);
});

test("odd query values fall back to the defaults instead of failing", async () => {
  const { Page, calls } = loadPage("development");
  await render(Page, "terra-botanica", { paket: "gold", jenis: "", kondisi: ["minim", "panjang"], to: ["a", "b"] });
  assert.deepEqual(calls.at(-1), {
    theme: "terra-botanica", packageKey: "signature", type: "wedding", condition: "lengkap", guestName: "Nama Tamu Anda",
  });
});

test("valid query values reach the fixture, and to=none drops the guest", async () => {
  const { Page, calls } = loadPage("development");
  await render(Page, "terra-botanica", { paket: "grand", jenis: "aqiqah", kondisi: "minim", to: "none" });
  assert.deepEqual(calls.at(-1), {
    theme: "terra-botanica", packageKey: "grand", type: "aqiqah", condition: "minim", guestName: null,
  });
  await render(Page, "terra-botanica", { to: "Bu Sari" });
  assert.equal(calls.at(-1).guestName, "Bu Sari");
});

test("no invitation can take the qa-matrix slug", () => {
  const result = validation.invitationSlugSchema.safeParse("qa-matrix");
  assert.equal(result.success, false);
  assert.match(result.error.issues[0].message, /dipakai halaman Temuraya/);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/qa-matrix-route.test.mjs`
Expected: FAIL with `ENOENT` for `src/app/qa-matrix/[themeSlug]/page.tsx` (and the slug test fails because `qa-matrix` is accepted).

- [ ] **Step 3: Reserve the slug**

In `src/lib/validation/invitation.ts`, add `"qa-matrix",` to `RESERVED_INVITATION_SLUGS` between `"privasi",` and `"robots",` (alphabetical order).

- [ ] **Step 4: Write the route**

Create `src/app/qa-matrix/[themeSlug]/page.tsx`:

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";

import { PACKAGE_KEYS } from "@/lib/packages/entitlements";
import { buildQaFixture, QA_CONDITIONS, QA_DEFAULT_GUEST } from "@/lib/qa/fixture-invitation";
import { invitationTypeSchema } from "@/lib/validation/invitation";
import "@/themes/theme-fonts";
import { ThemeRenderer } from "@/themes/ThemeRenderer";

import { DEMOS, GIFTS, IMAGE_SLOTS, STORIES, WISHES, imagePath } from "../../../../scripts/demo/content.mjs";

/**
 * Local template QA (scripts/qa/matrix.mjs): any template as any package,
 * invitation type and data condition, built from the demo content without
 * Supabase. Production always answers 404.
 */

export const metadata: Metadata = { title: "QA matrix", robots: { index: false, follow: false } };

const querySchema = z.object({
  paket: z.enum(PACKAGE_KEYS).catch("signature"),
  jenis: invitationTypeSchema.catch("wedding"),
  kondisi: z.enum(QA_CONDITIONS).catch("lengkap"),
  to: z.string().trim().min(1).max(80).catch(QA_DEFAULT_GUEST),
});

type QaMatrixPageProps = {
  params: Promise<{ themeSlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function QaMatrixPage({ params, searchParams }: QaMatrixPageProps) {
  if (process.env.NODE_ENV === "production") notFound();

  const { themeSlug } = await params;
  const source = DEMOS.find((demo) => demo.theme === themeSlug);
  if (!source) notFound();

  const query = querySchema.parse(await searchParams);
  const { invitation, guest } = buildQaFixture(
    source,
    { stories: STORIES, gifts: GIFTS, wishes: WISHES, imageSlots: IMAGE_SLOTS, imagePath },
    {
      packageKey: query.paket,
      type: query.jenis,
      condition: query.kondisi,
      guestName: query.to === "none" ? null : query.to,
    },
  );

  return (
    <>
      <div hidden data-qa-nav-sections={invitation.navSections.join(",")} data-qa-type={invitation.type} />
      <ThemeRenderer invitation={invitation} guest={guest} />
    </>
  );
}
```

`z.enum(PACKAGE_KEYS)` takes the readonly tuple directly. If the installed Zod version rejects a readonly tuple, use `z.enum([...PACKAGE_KEYS] as [PackageKey, ...PackageKey[]])` and import `type PackageKey`; do the same for `QA_CONDITIONS`.

- [ ] **Step 5: Run tests to verify they pass**

Run: `node --test tests/qa-matrix-route.test.mjs tests/marketing-helpers.test.mjs`
Expected: PASS. Then `npm run typecheck` — clean. If TypeScript cannot type the `.mjs` import, add `scripts/demo/content.d.mts` declaring the six exports with the `QaDemoSource`/`QaDemoLibrary` shapes rather than casting in the page.

- [ ] **Step 6: Check it in the browser**

Start the dev server (`preview_start` name `web`, or `npm run dev`), open `/qa-matrix/terra-botanica?paket=grand&jenis=birthday`, and confirm: the cover renders with the demo cover image, opening it shows the invitation, and the nav has the Grand stops present in the content. Open `/qa-matrix/unknown` and confirm a 404.

- [ ] **Step 7: Commit**

```bash
git add src/app/qa-matrix src/lib/validation/invitation.ts tests/qa-matrix-route.test.mjs
git commit -m "feat(qa): dev-only /qa-matrix fixture route

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Matrix cases and checks

**Files:**
- Create: `scripts/qa/matrix-cases.mjs`
- Test: `tests/qa-matrix-cases.test.mjs`

**Interfaces:**
- Consumes: `DEMOS` (`scripts/demo/content.mjs`) for the theme list.
- Produces (all exported from `scripts/qa/matrix-cases.mjs`):
  - `THEMES: string[]`, `PACKAGES`, `TYPES`, `CONDITIONS`, `VIEWPORTS: { name: string; width: number; height: number }[]`
  - `NAV_ANCHOR_SUFFIX: Record<NavSectionKey, string>`
  - `buildCases({ full?: boolean, theme?: string, viewport?: string }): Case[]` where `Case = { id, theme, paket, jenis, kondisi, guest: "default" | "none", viewport, reducedMotion: boolean }`
  - `caseUrl(baseUrl: string, c: Case): string`
  - `evaluate(c: Case, probe: Probe): string[]` (failure messages; empty = pass), where `Probe = { scrollWidth, innerWidth, consoleErrors: string[], failedRequests: string[], brokenImages: string[], openButtonVisible: boolean, navSections: string[], presentSections: string[], navLabels: string[], navItemHeights: number[], cutLabels: string[], bodyText: string }`

- [ ] **Step 1: Write the failing tests**

Create `tests/qa-matrix-cases.test.mjs`:

```js
import assert from "node:assert/strict";
import test from "node:test";

import { buildCases, caseUrl, evaluate, THEMES, VIEWPORTS } from "../scripts/qa/matrix-cases.mjs";

test("the core matrix is 105 unique pages over the §28.7 viewports", () => {
  const cases = buildCases();
  assert.equal(cases.length, 105);
  assert.equal(new Set(cases.map((c) => c.id)).size, 105);
  assert.deepEqual(VIEWPORTS.map((v) => `${v.width}x${v.height}`), ["320x568", "375x812", "768x1024", "1280x800"]);
  assert.equal(THEMES.length, 5);
  for (const theme of THEMES) {
    const own = cases.filter((c) => c.theme === theme);
    assert.equal(own.filter((c) => c.jenis !== "wedding").length, 5, `${theme}: every other type`);
    assert.equal(own.filter((c) => c.guest === "none").length, 1);
    assert.equal(own.filter((c) => c.reducedMotion).length, 1);
  }
});

test("the full matrix and the filters", () => {
  assert.equal(buildCases({ full: true }).length, 1080);
  assert.ok(buildCases({ theme: "kelir-kencana" }).every((c) => c.theme === "kelir-kencana"));
  assert.ok(buildCases({ viewport: "320" }).every((c) => c.viewport.width === 320));
  assert.throws(() => buildCases({ theme: "nope" }), /Unknown theme/);
});

test("caseUrl carries every parameter and drops the default guest", () => {
  const [first] = buildCases({ theme: "terra-botanica" });
  assert.equal(caseUrl("http://localhost:3000", first), "http://localhost:3000/qa-matrix/terra-botanica?paket=intimate&jenis=wedding&kondisi=lengkap");
  const noGuest = buildCases({ theme: "terra-botanica" }).find((c) => c.guest === "none");
  assert.match(caseUrl("http://localhost:3000", noGuest), /&to=none$/);
});

const phone = { id: "x", theme: "terra-botanica", paket: "signature", jenis: "wedding", kondisi: "lengkap", guest: "default", viewport: VIEWPORTS[1], reducedMotion: false };
const clean = {
  scrollWidth: 375, innerWidth: 375, consoleErrors: [], failedRequests: [], brokenImages: [], openButtonVisible: true,
  navSections: ["hero", "couple", "events", "gallery", "rsvp", "wishes", "gift"],
  presentSections: ["hero", "couple", "events", "gallery", "wishes", "gift"],
  navLabels: ["Beranda", "Mempelai", "Acara", "Galeri", "Ucapan", "Kado"],
  navItemHeights: [56, 56, 56, 56, 56, 56], cutLabels: [], bodyText: "Mempelai",
};

test("a clean page passes; sections without content are not expected in the nav", () => {
  assert.deepEqual(evaluate(phone, clean), []);
});

test("each check reports its own failure", () => {
  const failures = evaluate({ ...phone, jenis: "birthday" }, {
    ...clean, scrollWidth: 400, consoleErrors: ["boom"], failedRequests: ["/x (HTTP 404)"], brokenImages: ["/a.jpg"],
    openButtonVisible: false, navLabels: ["Beranda"], navItemHeights: [40], cutLabels: ["Mempelai"], bodyText: "The Wedding Of Sekar",
  });
  for (const pattern of [/horizontal overflow/, /console error: boom/, /failed request/, /image failed/, /Buka Undangan/,
    /nav shows 1 stops, expected 6/, /shorter than 52px/, /nav label cut/, /wedding-only copy on a birthday page/]) {
    assert.ok(failures.some((f) => pattern.test(f)), `missing ${pattern}`);
  }
});

test("the 52px rule applies to phones only", () => {
  const desktop = { ...phone, viewport: VIEWPORTS[3] };
  assert.deepEqual(evaluate(desktop, { ...clean, scrollWidth: 1280, innerWidth: 1280, navItemHeights: [40] }), []);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/qa-matrix-cases.test.mjs`
Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `scripts/qa/matrix-cases.mjs`.

- [ ] **Step 3: Write the module**

Create `scripts/qa/matrix-cases.mjs`:

```js
/**
 * Cases and checks for the template QA matrix (scripts/qa/matrix.mjs).
 * Pure: no browser, so tests/qa-matrix-cases.test.mjs can pin the matrix
 * and every check. Viewports and rules follow docs/DESIGN.md §28.7.
 */
import { DEMOS } from "../demo/content.mjs";

export const THEMES = DEMOS.map((demo) => demo.theme);
export const PACKAGES = ["intimate", "signature", "grand"];
export const TYPES = ["wedding", "birthday", "engagement", "aqiqah", "graduation", "corporate"];
export const CONDITIONS = ["lengkap", "minim", "panjang"];
export const VIEWPORTS = [
  { name: "320", width: 320, height: 568 },
  { name: "375", width: 375, height: 812 },
  { name: "768", width: 768, height: 1024 },
  { name: "1280", width: 1280, height: 800 },
];

/** Section anchor suffixes from docs/DESIGN.md §28.2, keyed by NavSectionKey. */
export const NAV_ANCHOR_SUFFIX = {
  hero: "beranda",
  couple: "mempelai",
  events: "acara",
  story: "cerita",
  gallery: "galeri",
  livestream: "livestream",
  rsvp: "rsvp",
  wishes: "ucapan",
  gift: "kado",
};

const WEDDING_ONLY = [/mempelai/i, /the wedding of/i, /pernikahan/i];
const PHONE_MAX_WIDTH = 767;
const MIN_NAV_ITEM_HEIGHT = 52;

function makeCase(theme, { paket = "signature", jenis = "wedding", kondisi = "lengkap", guest = "default", viewport, reducedMotion = false }) {
  const id = [theme, paket, jenis, kondisi, guest, viewport.name, reducedMotion ? "rm" : null].filter(Boolean).join("__");
  return { id, theme, paket, jenis, kondisi, guest, viewport, reducedMotion };
}

export function buildCases({ full = false, theme, viewport } = {}) {
  if (theme && !THEMES.includes(theme)) throw new Error(`Unknown theme "${theme}". Known: ${THEMES.join(", ")}`);
  const themes = theme ? [theme] : THEMES;
  const phone = VIEWPORTS[1];
  const cases = [];

  for (const slug of themes) {
    if (full) {
      for (const paket of PACKAGES) for (const jenis of TYPES) for (const kondisi of CONDITIONS) for (const vp of VIEWPORTS) {
        cases.push(makeCase(slug, { paket, jenis, kondisi, viewport: vp }));
      }
      continue;
    }
    for (const paket of PACKAGES) for (const vp of VIEWPORTS) cases.push(makeCase(slug, { paket, viewport: vp }));
    for (const jenis of TYPES.filter((t) => t !== "wedding")) cases.push(makeCase(slug, { jenis, viewport: phone }));
    for (const kondisi of CONDITIONS.filter((k) => k !== "lengkap")) cases.push(makeCase(slug, { kondisi, viewport: phone }));
    cases.push(makeCase(slug, { guest: "none", viewport: phone }));
    cases.push(makeCase(slug, { viewport: phone, reducedMotion: true }));
  }

  return viewport ? cases.filter((c) => c.viewport.name === viewport) : cases;
}

export function caseUrl(baseUrl, c) {
  const query = new URLSearchParams({ paket: c.paket, jenis: c.jenis, kondisi: c.kondisi });
  if (c.guest === "none") query.set("to", "none");
  return `${baseUrl.replace(/\/$/, "")}/qa-matrix/${c.theme}?${query}`;
}

export function evaluate(c, probe) {
  const failures = [];
  if (probe.scrollWidth > probe.innerWidth) failures.push(`horizontal overflow: ${probe.scrollWidth}px > ${probe.innerWidth}px`);
  for (const error of probe.consoleErrors) failures.push(`console error: ${error}`);
  for (const request of probe.failedRequests) failures.push(`failed request: ${request}`);
  for (const src of probe.brokenImages) failures.push(`image failed: ${src}`);
  if (!probe.openButtonVisible) failures.push('"Buka Undangan" is not inside the first viewport');

  const expected = probe.navSections.filter((key) => probe.presentSections.includes(key));
  if (probe.navLabels.length !== expected.length) {
    failures.push(`nav shows ${probe.navLabels.length} stops, expected ${expected.length} (${expected.join(", ")})`);
  }
  if (c.viewport.width <= PHONE_MAX_WIDTH) {
    const short = probe.navItemHeights.filter((height) => height < MIN_NAV_ITEM_HEIGHT);
    if (short.length) failures.push(`${short.length} nav item(s) shorter than ${MIN_NAV_ITEM_HEIGHT}px`);
  }
  for (const label of probe.cutLabels) failures.push(`nav label cut: ${label}`);
  if (c.jenis !== "wedding") {
    for (const pattern of WEDDING_ONLY) {
      const match = probe.bodyText.match(pattern);
      if (match) failures.push(`wedding-only copy on a ${c.jenis} page: "${match[0]}"`);
    }
  }
  return failures;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/qa-matrix-cases.test.mjs`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add scripts/qa/matrix-cases.mjs tests/qa-matrix-cases.test.mjs
git commit -m "feat(qa): QA matrix cases and page checks

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Runner, wiring and docs

**Files:**
- Create: `scripts/qa/matrix.mjs`
- Modify: `.gitignore`, `package.json` (`scripts`), `docs/DESIGN.md` (§28.7), `docs/PROJECT_MEMORY.md`

**Interfaces:**
- Consumes: `buildCases`, `caseUrl`, `evaluate`, `NAV_ANCHOR_SUFFIX` (Task 3); the route's `data-qa-nav-sections` element (Task 2).
- Produces: `npm run qa:matrix -- [--full] [--theme <slug>] [--viewport 320|375|768|1280] [--base-url <url>] [--chromium <path>]`; writes `qa-output/<timestamp>/{*.png, report.json, summary.md}`; exit 0 pass, 1 failures, 2 server unreachable.

The runner drives a real browser; it has no unit test. Its logic lives in Task 3's tested module, and Step 3 below is the manual check.

- [ ] **Step 1: Write the runner**

Create `scripts/qa/matrix.mjs`:

```js
/**
 * Template QA matrix: renders /qa-matrix/<theme> for every case from
 * matrix-cases.mjs, screenshots the cover and the opened invitation, and
 * reports failed checks. Needs `npm run dev` running and a playwright-core
 * install outside the project (like scripts/demo/images.mjs):
 *
 *   npm run qa:matrix -- [--full] [--theme terra-botanica] [--viewport 375]
 *                        [--base-url http://localhost:3000] [--chromium <path>]
 *
 * Exit 0: every check passed. 1: failures (see summary.md). 2: no server.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { join } from "node:path";

import { buildCases, caseUrl, evaluate, NAV_ANCHOR_SUFFIX } from "./matrix-cases.mjs";

const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require("playwright-core"));
} catch {
  ({ chromium } = require(process.env.PLAYWRIGHT_CORE ?? "playwright"));
}

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const index = args.indexOf(`--${name}`);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};
const baseUrl = option("base-url", "http://localhost:3000");
const cases = buildCases({ full: args.includes("--full"), theme: option("theme"), viewport: option("viewport") });

// Runs inside the page; keep it self-contained.
const PROBE = (suffixes) => {
  const meta = document.querySelector("[data-qa-nav-sections]");
  const nav = document.querySelector('nav[aria-label="Navigasi undangan"]');
  const items = nav ? [...nav.querySelectorAll("a, button")] : [];
  return {
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
    navSections: (meta?.getAttribute("data-qa-nav-sections") ?? "").split(",").filter(Boolean),
    presentSections: Object.entries(suffixes)
      .filter(([, suffix]) => document.querySelector(`[id$="-${suffix}"]`))
      .map(([key]) => key),
    navLabels: items.map((item) => item.textContent.trim()),
    navItemHeights: items.map((item) => item.getBoundingClientRect().height),
    cutLabels: items
      .filter((item) => [...item.querySelectorAll("*")].some((el) =>
        el.children.length === 0 && el.textContent.trim() && el.scrollWidth > el.clientWidth + 1))
      .map((item) => item.textContent.trim()),
    brokenImages: [...document.images]
      .filter((image) => image.complete && image.naturalWidth === 0)
      .map((image) => image.currentSrc || image.src),
    bodyText: document.body.innerText,
  };
};

async function preflight() {
  const url = caseUrl(baseUrl, cases[0]);
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
  } catch (error) {
    console.error(`Cannot open ${url} (${error.message}). Start "npm run dev" first, or pass --base-url.`);
    process.exit(2);
  }
}

async function runCase(browser, c, outDir) {
  const { width, height } = c.viewport;
  const context = await browser.newContext({ viewport: { width, height }, reducedMotion: c.reducedMotion ? "reduce" : "no-preference" });
  const page = await context.newPage();
  const consoleErrors = [];
  const failedRequests = [];
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", (error) => consoleErrors.push(error.message));
  page.on("requestfailed", (request) => failedRequests.push(`${request.url()} (${request.failure()?.errorText ?? "failed"})`));
  page.on("response", (response) => { if (response.status() >= 400) failedRequests.push(`${response.url()} (HTTP ${response.status()})`); });

  try {
    await page.goto(caseUrl(baseUrl, c), { waitUntil: "networkidle", timeout: 60000 });
    const open = page.getByRole("button", { name: /buka undangan/i }).first();
    const box = await open.boundingBox();
    const openButtonVisible = Boolean(box && box.y >= 0 && box.y + box.height <= height);
    await page.screenshot({ path: join(outDir, `${c.id}__cover.png`) });
    await open.click();
    await page.waitForTimeout(c.reducedMotion ? 400 : 2500);
    await page.screenshot({ path: join(outDir, `${c.id}__open.png`), fullPage: true });
    const probe = { ...(await page.evaluate(PROBE, NAV_ANCHOR_SUFFIX)), consoleErrors, failedRequests, openButtonVisible };
    return { id: c.id, url: caseUrl(baseUrl, c), failures: evaluate(c, probe) };
  } catch (error) {
    return { id: c.id, url: caseUrl(baseUrl, c), failures: [`run error: ${error.message.split("\n")[0]}`] };
  } finally {
    await context.close();
  }
}

await preflight();
const outDir = join("qa-output", new Date().toISOString().replace(/[:.]/g, "-"));
await mkdir(outDir, { recursive: true });
const browser = await chromium.launch(option("chromium") ? { executablePath: option("chromium") } : {});
const results = [];
try {
  for (const [index, c] of cases.entries()) {
    const result = await runCase(browser, c, outDir);
    results.push(result);
    console.log(`${String(index + 1).padStart(4)}/${cases.length} ${result.failures.length ? "FAIL" : "ok  "} ${c.id}`);
  }
} finally {
  await browser.close();
}

const failed = results.filter((result) => result.failures.length);
await writeFile(join(outDir, "report.json"), JSON.stringify({ baseUrl, total: results.length, failed: failed.length, results }, null, 2));
await writeFile(join(outDir, "summary.md"), [
  `# QA matrix — ${new Date().toISOString()}`,
  "",
  `${results.length} pages, ${failed.length} with failures. Base URL: ${baseUrl}`,
  "",
  ...failed.flatMap((result) => [`## ${result.id}`, `<${result.url}>`, "", ...result.failures.map((f) => `- ${f}`), ""]),
].join("\n"));
console.log(`\n${results.length} pages, ${failed.length} with failures. Report: ${outDir}/summary.md`);
process.exit(failed.length ? 1 : 0);
```

- [ ] **Step 2: Wire it up**

Append to `.gitignore`:

```gitignore

# template QA matrix output (scripts/qa/matrix.mjs)
qa-output/
```

In `package.json` `scripts`, add after `"test"`:

```json
"qa:matrix": "node scripts/qa/matrix.mjs"
```

In `docs/DESIGN.md` §28.7, add as the first bullet:

```markdown
- Run the QA matrix (`npm run dev`, then `npm run qa:matrix`, with
  `playwright-core` installed outside the project and `--chromium <path>`
  if it has no bundled browser). It renders `/qa-matrix/<theme>` (404 in
  production) for every package, invitation type, data condition and the
  widths below, and fails on overflow, console errors, broken images, an
  off-screen open button, nav/tier mismatches, short or cut nav items, and
  wedding-only copy on other event types. Add a new theme to
  `scripts/demo/content.mjs` and it joins the matrix.
```

In `docs/PROJECT_MEMORY.md`, under "Working notes" of the 5 October checkpoint, add:

```markdown
- Template QA matrix (2026-10-11): `npm run qa:matrix` against `npm run dev`;
  dev-only route `/qa-matrix/<theme>?paket=&jenis=&kondisi=&to=`, output in
  `qa-output/` (gitignored). It replaces the throwaway `src/app/qa-fixture`
  pages for template checks.
```

- [ ] **Step 3: Manual check of the runner**

With no dev server running: `node scripts/qa/matrix.mjs --theme terra-botanica --viewport 375`
Expected: exits 2 with `Cannot open http://localhost:3000/qa-matrix/terra-botanica?... Start "npm run dev" first`.

Start the dev server, then (using the Chrome already on this Mac):

```bash
PLAYWRIGHT_CORE=$(ls -d ~/.npm/_npx/*/node_modules/playwright-core | head -1) node scripts/qa/matrix.mjs --theme terra-botanica --viewport 375 --chromium "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
```

Expected: 12 cases run (3 packages + 5 other types + 2 other conditions + 1 no-guest + 1 reduced motion, all at 375), a `qa-output/<timestamp>/` folder with `__cover.png` and `__open.png` per case, `summary.md`, and an exit code of 0 or 1. Open two screenshots to confirm the cover and the opened invitation look right. Failures here are audit findings, not runner bugs, unless the message is a `run error:`.

- [ ] **Step 4: Full verification**

Run: `npm test`, `npm run lint`, `npm run typecheck`, `npm run build`
Expected: all pass. `npm run build` must not fail on `/qa-matrix` (it renders on demand and answers 404 in production).

- [ ] **Step 5: Commit**

```bash
git add scripts/qa/matrix.mjs .gitignore package.json docs/DESIGN.md docs/PROJECT_MEMORY.md
git commit -m "feat(qa): template QA matrix runner

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Baseline run and audit report

**Files:**
- Create: `docs/qa/2026-10-template-audit.md`

**Interfaces:**
- Consumes: the runner (Task 4).
- Produces: the audit report skeleton plus the baseline findings that the round A–C plans start from.

- [ ] **Step 1: Run the core matrix**

With the dev server running:

```bash
PLAYWRIGHT_CORE=$(ls -d ~/.npm/_npx/*/node_modules/playwright-core | head -1) npm run qa:matrix -- --chromium "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
```

Expected: 105 pages; exit 1 is normal (the known "Mempelai" nav label fails every non-wedding case).

- [ ] **Step 2: Write the report**

Create `docs/qa/2026-10-template-audit.md` with this structure, filling the baseline table from `summary.md` (group identical failures across cases into one row with the case count):

```markdown
# Template Readiness Audit — October 2026

Spec: `docs/superpowers/specs/2026-10-11-template-readiness-audit-design.md`.
Severity: Critical (broken feature or wrong data), Important (§28,
accessibility, visible phone defect), Minor (taste; owner picks).

## Baseline — QA matrix, <date>, `main` <sha>

105 pages, <n> with failures. Screenshots: `qa-output/<timestamp>/` (local).

| Template | Check | Cases | Example case | Proposed round | Severity |
|---|---|---|---|---|---|

## Round A — Technical (§28)

| Template | Location | Finding | Severity | Evidence | Status |
|---|---|---|---|---|---|

## Round B — Visual on phones

| Template | Location | Finding | Severity | Evidence | Status |
|---|---|---|---|---|---|

## Round C — Event types

| Template | Location | Finding | Severity | Evidence | Status |
|---|---|---|---|---|---|
```

- [ ] **Step 3: Commit, push and open the PR**

```bash
git add docs/qa/2026-10-template-audit.md
git commit -m "docs(qa): template audit report with the baseline matrix run

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push -u origin HEAD
gh pr create --base main --title "Template QA matrix (audit PR 1)" --body "$(cat <<'EOF'
Phase 9, sub-project 0, PR 1 (spec docs/superpowers/specs/2026-10-11-template-readiness-audit-design.md, plan docs/superpowers/plans/2026-10-11-template-qa-matrix.md).

- `src/lib/qa/fixture-invitation.ts`: demo content as any package, invitation type and data condition, using the production package functions
- `/qa-matrix/<theme>`: dev-only fixture route, 404 in production; `qa-matrix` reserved as an invitation slug
- `scripts/qa/matrix.mjs` + `matrix-cases.mjs`: 105-page core matrix (1,080 with `--full`) at the §28.7 widths, screenshots and checks; no new dependencies
- `docs/qa/2026-10-template-audit.md`: baseline findings that rounds A–C start from

No change to live invitations.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Report the PR link and the baseline summary to the owner, then stop: rounds A–C each get a plan from these findings, and the owner approves each fix list.
