# Package Entitlements Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Intimate, Signature, and Grand package entitlements with persistent assignment, safe package changes, server-enforced limits, and package-aware public rendering.

**Architecture:** Store only `package_key` on each invitation and keep the versioned package definitions in one pure TypeScript domain module. Existing `settings.features` remain invitation choices; effective features are the intersection of saved choices and package entitlements. Server mutations enforce capacity and feature rules, while themes continue receiving normalized package-safe data without importing package logic.

**Tech Stack:** Next.js 16.3.5 App Router, React 19 Server Actions, TypeScript 5, Zod 4, Supabase PostgreSQL/Auth/Storage, Node test runner, Tailwind CSS 4, shadcn/ui.

**Spec:** `docs/superpowers/specs/2026-09-22-package-entitlements-foundation-design.md`

## Global Constraints

- Supported package keys are exactly `intimate`, `signature`, and `grand`.
- Existing invitations must be backfilled to `grand`; no existing content or settings may be deleted.
- Database fallback default is `intimate`; the create form still requires an explicit package choice.
- Themes must not import package definitions or contain package-specific branches.
- Package checks must run on the server; disabled controls are only UX reinforcement.
- Upgrades are always allowed. Incompatible downgrades are blocked with a complete conflict list.
- Intimate, Signature, and Grand limits are respectively 2/3/5 events, 8/20/40 gallery images, and 0/5/10 sponsors.
- Responsive behavior, performance, security, Turnstile, social metadata, publishing, guest personalization, and basic RSVP remain universal.
- No customer login, payment, pricing, custom domain, sponsorship UI, video gallery, advanced RSVP, new analytics dashboard, style preset implementation, marketing page, or second theme belongs in this plan.
- Read `node_modules/next/dist/docs/01-app/01-getting-started/07-mutating-data.md` and `node_modules/next/dist/docs/01-app/02-guides/forms.md` before editing Server Actions or forms.
- Never commit `.env.local`, `.vercel/`, `.next/`, or `.codebase-memory/`.

## File Map

**Create**

- `supabase/migrations/20260922000001_invitation_packages.sql` — add and safely backfill `invitations.package_key`.
- `src/lib/packages/entitlements.ts` — package registry, effective feature resolver, capacity checks, downgrade conflict logic, and stable domain errors.
- `src/server/invitations/package-policy.ts` — load package usage and apply safe package changes through Supabase.
- `src/app/admin/(protected)/invitations/[id]/general/PackageForm.tsx` — package selector and package summary in General settings.
- `src/app/admin/(protected)/invitations/[id]/general/package-actions.ts` — validated package change Server Action.
- `tests/package-entitlements.test.mjs` — pure package registry and policy tests.

**Modify**

- `src/types/database.ts` — regenerated Supabase types with `package_key`.
- `src/lib/validation/invitation.ts` — package schemas for creation and package changes.
- `src/server/invitations/mutations.ts` — package-aware defaults, creation, features, and event limits.
- `src/server/media/upload.ts` — gallery batch limit enforcement.
- `src/server/public/normalize.ts` — package-safe effective features.
- `src/app/admin/(protected)/invitations/new/NewInvitationForm.tsx` — required package selection.
- `src/app/admin/(protected)/invitations/new/actions.ts` — parse and forward package key.
- `src/app/admin/(protected)/invitations/[id]/general/page.tsx` — render package form.
- `src/app/admin/(protected)/invitations/[id]/layout.tsx` — active package badge.
- `src/app/admin/(protected)/invitations/[id]/events/page.tsx` — event usage and reached-limit state.
- `src/app/admin/(protected)/invitations/[id]/gallery/page.tsx` — gallery usage and reached-limit state.
- `src/app/admin/(protected)/invitations/[id]/features/page.tsx` — locked feature controls and upgrade labels.
- `src/app/admin/(protected)/invitations/[id]/responses/page.tsx` — Grand-only visitor analytics while retaining universal RSVP counts.
- `ARCHITECTURE.md`, `DATABASE.md`, `ROADMAP.md` — package architecture and phased scope.

---

### Task 1: Persist Invitation Package Keys

**Files:**

- Create: `supabase/migrations/20260922000001_invitation_packages.sql`
- Modify: `src/types/database.ts:356-422`

**Interfaces:**

- Produces: `invitations.package_key: string` in generated `Row`, `Insert`, and `Update` database types.
- Migration invariant: every pre-existing row becomes `grand`; future inserts without an explicit key fall back to `intimate`.

- [ ] **Step 1: Write the migration**

```sql
alter table public.invitations
  add column package_key text;

update public.invitations
set package_key = 'grand'
where package_key is null;

alter table public.invitations
  add constraint invitations_package_key_check
  check (package_key in ('intimate', 'signature', 'grand'));

alter table public.invitations
  alter column package_key set not null,
  alter column package_key set default 'intimate';
```

- [ ] **Step 2: Validate and apply the linked migration**

Run:

```bash
supabase db lint --linked
supabase db push --linked
supabase migration list --linked
```

Expected: lint reports no new errors, push applies `20260922000001`, and local/remote migration lists contain the same migration.

- [ ] **Step 3: Regenerate database types from the schema**

Run:

```bash
supabase gen types typescript --project-id kcmddkxpwhphyqynghsl > src/types/database.ts
rg -n "package_key" src/types/database.ts
```

Expected: `package_key: string` exists in `Row`; `package_key?: string` exists in `Insert` and `Update`.

- [ ] **Step 4: Verify the migration preserved existing invitations**

Run this read-only SQL in the linked Supabase SQL runner or equivalent CLI query:

```sql
select slug, package_key
from public.invitations
order by created_at;
```

Expected: every existing invitation, including `rayhana-febri`, reports `grand`.

- [ ] **Step 5: Commit the schema slice**

```bash
git add supabase/migrations/20260922000001_invitation_packages.sql src/types/database.ts
git commit -m "feat(packages): persist invitation package" -m "Backfill existing invitations to Grand to preserve current capabilities."
```

---

### Task 2: Build the Typed Package Domain

**Files:**

- Create: `src/lib/packages/entitlements.ts`
- Create: `tests/package-entitlements.test.mjs`

**Interfaces:**

- Produces: `PackageKey`, `PackageCapability`, `PackagePolicyError`, `PACKAGE_KEYS`, `PACKAGE_DEFINITIONS`, `isPackageKey`, `isPackageUpgrade`, `isPackageDowngrade`, `getPackageDefinition`, `getDefaultInvitationFeatures`, `resolveEffectiveInvitationFeatures`, `getRequiredPackageForFeature`, `validatePackageCapacity`, and `findPackageChangeConflicts`.
- Consumes: `InvitationFeatures` from `src/types/invitation.ts` as a type-only import.

- [ ] **Step 1: Write failing registry and feature tests**

Create a TypeScript loader in `tests/package-entitlements.test.mjs`, following existing VM-based tests:

```js
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";
import vm from "node:vm";

function loadEntitlements() {
  const source = ts.transpileModule(
    readFileSync(new URL("../src/lib/packages/entitlements.ts", import.meta.url), "utf8"),
    { compilerOptions: { module: ts.ModuleKind.CommonJS } },
  ).outputText;
  const exports = {};
  vm.runInNewContext(source, {
    exports,
    module: { exports },
    require(name) {
      throw new Error(`Unexpected import: ${name}`);
    },
  });
  return exports;
}

test("defines stable package limits and ordering", () => {
  const { PACKAGE_KEYS, PACKAGE_DEFINITIONS, isPackageUpgrade, isPackageDowngrade } =
    loadEntitlements();
  assert.deepEqual(Array.from(PACKAGE_KEYS), ["intimate", "signature", "grand"]);
  assert.equal(PACKAGE_DEFINITIONS.intimate.limits.maxEvents, 2);
  assert.equal(PACKAGE_DEFINITIONS.signature.limits.maxGalleryImages, 20);
  assert.equal(PACKAGE_DEFINITIONS.grand.limits.maxSponsors, 10);
  assert.equal(isPackageUpgrade("intimate", "signature"), true);
  assert.equal(isPackageDowngrade("grand", "signature"), true);
  assert.equal(isPackageUpgrade("signature", "signature"), false);
});

test("intersects saved invitation features with package entitlements", () => {
  const { resolveEffectiveInvitationFeatures } = loadEntitlements();
  const requested = {
    music: true, countdown: true, maps: true, story: true, gallery: true,
    dressCode: true, livestream: true, rsvp: true, wishes: true, gift: true,
    guestPersonalization: true,
  };
  const intimate = resolveEffectiveInvitationFeatures("intimate", requested);
  assert.equal(intimate.music, true);
  assert.equal(intimate.story, false);
  assert.equal(intimate.wishes, false);
  assert.equal(intimate.livestream, false);
  const grand = resolveEffectiveInvitationFeatures("grand", requested);
  assert.equal(grand.story, true);
  assert.equal(grand.livestream, true);
});
```

- [ ] **Step 2: Run tests and verify RED**

Run: `node --test tests/package-entitlements.test.mjs`

Expected: FAIL because `src/lib/packages/entitlements.ts` does not exist.

- [ ] **Step 3: Implement the package registry and effective feature resolver**

Use this public shape:

```ts
import type { InvitationFeatures } from "@/types/invitation";

export const PACKAGE_KEYS = ["intimate", "signature", "grand"] as const;
export type PackageKey = (typeof PACKAGE_KEYS)[number];

export type PackageCapability =
  | keyof InvitationFeatures
  | "instagram"
  | "rsvpExport"
  | "sponsorship"
  | "videoGallery"
  | "advancedRsvp"
  | "analytics"
  | "stylePresets";

export interface PackagePolicyError {
  code:
    | "PACKAGE_EVENT_LIMIT_REACHED"
    | "PACKAGE_GALLERY_LIMIT_REACHED"
    | "PACKAGE_FEATURE_NOT_AVAILABLE"
    | "PACKAGE_DOWNGRADE_CONFLICT";
  message: string;
  packageKey: PackageKey;
  current?: number;
  limit?: number;
}

export interface PackageDefinition {
  key: PackageKey;
  label: string;
  description: string;
  recommended: boolean;
  limits: { maxEvents: number; maxGalleryImages: number; maxSponsors: number };
  invitationFeatures: Record<keyof InvitationFeatures, boolean>;
  capabilities: Record<
    "instagram" | "rsvpExport" | "sponsorship" | "videoGallery" |
      "advancedRsvp" | "analytics" | "stylePresets",
    boolean
  >;
}
```

Define Intimate with all universal invitation features enabled except `story`, `dressCode`, `livestream`, and `wishes`. Define Signature with `story`, `dressCode`, and `wishes` enabled but `livestream` disabled. Define Grand with all existing invitation features enabled. Set `instagram`, `rsvpExport`, and `sponsorship` from Signature upward; set the remaining future capabilities only on Grand.

Implement `resolveEffectiveInvitationFeatures` by iterating every key in the package's `invitationFeatures` and returning `Boolean(requested[key] && allowed[key])`. Implement `getDefaultInvitationFeatures` with the current product defaults: universal features on; Signature and Grand default story/wishes on; dress code and livestream remain off until explicitly enabled.

- [ ] **Step 4: Add failing capacity and downgrade tests**

```js
test("rejects additions beyond event and gallery limits", () => {
  const { validatePackageCapacity } = loadEntitlements();
  assert.equal(validatePackageCapacity("intimate", "events", 1, 1), null);
  assert.equal(
    validatePackageCapacity("intimate", "events", 2, 1).code,
    "PACKAGE_EVENT_LIMIT_REACHED",
  );
  assert.equal(
    validatePackageCapacity("signature", "gallery", 19, 2).code,
    "PACKAGE_GALLERY_LIMIT_REACHED",
  );
});

test("reports every incompatible downgrade condition", () => {
  const { findPackageChangeConflicts } = loadEntitlements();
  const conflicts = findPackageChangeConflicts("intimate", {
    eventCount: 3,
    galleryCount: 9,
    enabledFeatures: { story: true, wishes: true },
  });
  assert.deepEqual(
    Array.from(conflicts, (item) => item.kind),
    ["events", "gallery", "feature", "feature"],
  );
});
```

- [ ] **Step 5: Implement capacity and conflict helpers**

`validatePackageCapacity(packageKey, resource, currentCount, incomingCount)` returns `null` within the limit and a stable `PackagePolicyError` outside it. Use Indonesian messages such as:

```text
Paket Intimate mendukung maksimal 2 acara.
Paket Signature mendukung maksimal 20 foto galeri.
```

`findPackageChangeConflicts(targetPackage, snapshot)` must append conflicts in deterministic order: events, gallery, then enabled feature keys in invitation feature order. It must not mutate the snapshot.

- [ ] **Step 6: Run focused and full tests**

Run:

```bash
node --test tests/package-entitlements.test.mjs
npm test
```

Expected: new package tests and the existing suite pass.

- [ ] **Step 7: Commit the domain slice**

```bash
git add src/lib/packages/entitlements.ts tests/package-entitlements.test.mjs
git commit -m "feat(packages): define entitlement registry"
```

---

### Task 3: Add Safe Package Assignment and Changes

**Files:**

- Create: `src/server/invitations/package-policy.ts`
- Modify: `src/lib/validation/invitation.ts:1-45`
- Modify: `src/server/invitations/mutations.ts:1-97`
- Modify: `src/app/admin/(protected)/invitations/new/actions.ts:1-34`
- Create: `src/app/admin/(protected)/invitations/[id]/general/package-actions.ts`
- Test: `tests/package-entitlements.test.mjs`

**Interfaces:**

- Consumes: `PackageKey`, `getDefaultInvitationFeatures`, and `findPackageChangeConflicts` from Task 2.
- Produces: `packageKeySchema`, `updatePackageSchema`, `getInvitationPackageUsage(invitationId)`, and `updateInvitationPackage({ invitationId, packageKey })`.

- [ ] **Step 1: Add schema tests through the package domain boundary**

Extend the package tests to assert `isPackageKey("signature") === true`, `isPackageKey("premium") === false`, and `findPackageChangeConflicts("signature", compatibleSnapshot)` returns an empty array.

- [ ] **Step 2: Run focused test and verify RED**

Run: `node --test tests/package-entitlements.test.mjs`

Expected: FAIL because `isPackageKey` or compatible downgrade behavior is missing.

- [ ] **Step 3: Add package validation to invitation schemas**

In `src/lib/validation/invitation.ts`:

```ts
export const packageKeySchema = z.enum(["intimate", "signature", "grand"]);

export const createInvitationSchema = z.object({
  title: z.string().trim().min(1, "Judul wajib diisi").max(200),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Slug minimal 3 karakter")
    .max(80)
    .regex(slugPattern, "Slug hanya boleh huruf kecil, angka, dan tanda strip"),
  type: invitationTypeSchema,
  themeId: z.string().uuid("Theme wajib dipilih"),
  packageKey: packageKeySchema,
});

export const updatePackageSchema = z.object({
  invitationId: z.string().uuid(),
  packageKey: packageKeySchema,
});
```

- [ ] **Step 4: Make invitation creation package-aware**

Change `defaultSettings()` to `defaultSettings(packageKey: PackageKey)` and source its features from `getDefaultInvitationFeatures(packageKey)`. Add `packageKey: PackageKey` to `createInvitation` input and insert `package_key: input.packageKey`.

Update `createInvitationAction` to parse `formData.get("packageKey")` and pass `parsed.data.packageKey` to `createInvitation`.

- [ ] **Step 5: Implement package usage loading and safe changes**

In `src/server/invitations/package-policy.ts`, expose:

```ts
export interface InvitationPackageUsage {
  packageKey: PackageKey;
  eventCount: number;
  galleryCount: number;
  enabledFeatures: Partial<InvitationFeatures>;
}

export async function getInvitationPackageUsage(
  invitationId: string,
): Promise<InvitationPackageUsage | { error: string }>;

export async function updateInvitationPackage(input: {
  invitationId: string;
  packageKey: PackageKey;
}): Promise<{ error: string } | null>;
```

Load the invitation's `package_key` and `settings`, plus exact event and gallery counts in parallel. If the target rank is lower, call `findPackageChangeConflicts`. Return one Indonesian error that lists all conflicts. Only update `package_key` when no conflicts exist. Never alter `settings` or child rows.

- [ ] **Step 6: Add the package change Server Action**

`package-actions.ts` must parse `invitationId` and `packageKey`, call `updateInvitationPackage`, revalidate the invitation cache after success, and redirect to:

```text
/admin/invitations/<id>/general?packageSaved=1
```

Errors redirect to the same page with `packageError=<encoded message>`.

- [ ] **Step 7: Run validation**

Run:

```bash
node --test tests/package-entitlements.test.mjs
npx tsc --noEmit
npx eslint src/lib/packages/entitlements.ts src/lib/validation/invitation.ts src/server/invitations/package-policy.ts src/server/invitations/mutations.ts 'src/app/admin/(protected)/invitations/new/actions.ts' 'src/app/admin/(protected)/invitations/[id]/general/package-actions.ts'
```

Expected: all commands pass.

- [ ] **Step 8: Commit the assignment slice**

```bash
git add src/lib/validation/invitation.ts src/server/invitations/package-policy.ts src/server/invitations/mutations.ts 'src/app/admin/(protected)/invitations/new/actions.ts' 'src/app/admin/(protected)/invitations/[id]/general/package-actions.ts' tests/package-entitlements.test.mjs
git commit -m "feat(packages): validate package changes"
```

---

### Task 4: Expose Package Selection and Status in Admin

**Files:**

- Modify: `src/app/admin/(protected)/invitations/new/NewInvitationForm.tsx:1-109`
- Create: `src/app/admin/(protected)/invitations/[id]/general/PackageForm.tsx`
- Modify: `src/app/admin/(protected)/invitations/[id]/general/page.tsx:1-100`
- Modify: `src/app/admin/(protected)/invitations/[id]/layout.tsx:1-80`

**Interfaces:**

- Consumes: `PACKAGE_KEYS`, `PACKAGE_DEFINITIONS`, and `PackageKey` from Task 2; `updatePackageAction` from Task 3.
- Produces: required package selection during creation, package change UI, and package badge in the edit header.

- [ ] **Step 1: Add required package selection to creation**

Import the registry and render a package `Select` after the theme selector. Do not assign `defaultValue`. Use this item copy:

```tsx
{PACKAGE_KEYS.map((key) => {
  const definition = PACKAGE_DEFINITIONS[key];
  return (
    <SelectItem key={key} value={key}>
      {definition.label}{definition.recommended ? " — Recommended" : ""}
    </SelectItem>
  );
})}
```

The trigger uses `name="packageKey"`, `id="packageKey"`, and placeholder `Select a package`. Zod remains authoritative when no value is submitted.

- [ ] **Step 2: Implement the package form**

`PackageForm` receives:

```ts
{
  invitationId: string;
  currentPackage: PackageKey;
  error?: string;
  saved?: boolean;
}
```

Render one radio-style card per package inside a form posting to `updatePackageAction`. Each card shows label, description, event limit, gallery limit, and `Recommended` for Signature. Preselect `currentPackage`. Show the downgrade warning: `Downgrade hanya dapat disimpan setelah semua konflik paket diselesaikan.`

- [ ] **Step 3: Render package management on General page**

Extend `searchParams` with `packageError?: string` and `packageSaved?: string`. Render `PackageForm` after `GeneralForm` and before music controls. Pass `invitation.package_key as PackageKey`.

- [ ] **Step 4: Add the package badge to the invitation header**

Change the layout query to select `id, title, status, package_key`. Render a secondary badge with `PACKAGE_DEFINITIONS[invitation.package_key as PackageKey].label` next to the status badge.

- [ ] **Step 5: Validate admin UI**

Run:

```bash
npx eslint 'src/app/admin/(protected)/invitations/new/NewInvitationForm.tsx' 'src/app/admin/(protected)/invitations/[id]/general/PackageForm.tsx' 'src/app/admin/(protected)/invitations/[id]/general/page.tsx' 'src/app/admin/(protected)/invitations/[id]/layout.tsx'
npx tsc --noEmit
npm run build
```

Expected: all commands pass; `/admin/invitations/new` requires a package; an existing invitation displays Grand without changing content.

- [ ] **Step 6: Commit the admin package slice**

```bash
git add 'src/app/admin/(protected)/invitations/new/NewInvitationForm.tsx' 'src/app/admin/(protected)/invitations/[id]/general/PackageForm.tsx' 'src/app/admin/(protected)/invitations/[id]/general/page.tsx' 'src/app/admin/(protected)/invitations/[id]/layout.tsx'
git commit -m "feat(admin): add invitation package controls"
```

---

### Task 5: Enforce and Display Event Limits

**Files:**

- Modify: `src/server/invitations/mutations.ts:252-287`
- Modify: `src/app/admin/(protected)/invitations/[id]/events/page.tsx:1-146`
- Test: `tests/package-entitlements.test.mjs`

**Interfaces:**

- Consumes: `validatePackageCapacity` and `getPackageDefinition` from Task 2.
- Server behavior: only new event inserts consume capacity; edits and deletes remain available at the limit.

- [ ] **Step 1: Add the exact boundary tests**

```js
test("allows event edits conceptually without consuming capacity", () => {
  const { validatePackageCapacity } = loadEntitlements();
  assert.equal(validatePackageCapacity("intimate", "events", 2, 0), null);
  assert.equal(validatePackageCapacity("intimate", "events", 2, 1).limit, 2);
  assert.equal(validatePackageCapacity("grand", "events", 4, 1), null);
});
```

- [ ] **Step 2: Run focused test and verify behavior before wiring**

Run: `node --test tests/package-entitlements.test.mjs`

Expected: PASS for the pure policy; no server mutation uses it yet.

- [ ] **Step 3: Enforce the limit in `upsertEvent`**

When `input.id` is absent, query the invitation's `package_key` and exact event count. Call:

```ts
const policyError = validatePackageCapacity(
  invitation.package_key as PackageKey,
  "events",
  count ?? 0,
  1,
);
if (policyError) return { error: policyError.message };
```

Do not run the capacity query for edits. Preserve the existing insert/update logic after the guard.

- [ ] **Step 4: Add event usage and reached-limit UX**

On `EventsPage`, calculate the package definition from `invitation.package_key`. Show:

```text
2 dari 2 acara digunakan · Paket Intimate
```

Wrap only the new-event form fields in `<fieldset disabled={limitReached}>`. Existing event edit/delete forms remain enabled. When reached, show `Batas acara paket tercapai. Hapus acara atau upgrade paket.` instead of an active Add button.

- [ ] **Step 5: Validate event behavior**

Run:

```bash
node --test tests/package-entitlements.test.mjs
npx eslint src/server/invitations/mutations.ts 'src/app/admin/(protected)/invitations/[id]/events/page.tsx'
npx tsc --noEmit
```

Expected: tests pass, new inserts return the package message at capacity, and edits remain valid.

- [ ] **Step 6: Commit event enforcement**

```bash
git add src/server/invitations/mutations.ts 'src/app/admin/(protected)/invitations/[id]/events/page.tsx' tests/package-entitlements.test.mjs
git commit -m "feat(packages): enforce event limits"
```

---

### Task 6: Enforce and Display Gallery Limits

**Files:**

- Modify: `src/server/media/upload.ts:120-156`
- Modify: `src/app/admin/(protected)/invitations/[id]/gallery/page.tsx:1-62`
- Test: `tests/package-entitlements.test.mjs`

**Interfaces:**

- Consumes: `validatePackageCapacity`, `PackageKey`, and `getPackageDefinition` from Task 2.
- Server behavior: reject the whole upload batch before the first storage write when `existing + incoming > maxGalleryImages`.

- [ ] **Step 1: Add multi-file boundary tests**

```js
test("checks the whole gallery batch before upload", () => {
  const { validatePackageCapacity } = loadEntitlements();
  assert.equal(validatePackageCapacity("intimate", "gallery", 6, 2), null);
  const error = validatePackageCapacity("intimate", "gallery", 6, 3);
  assert.equal(error.code, "PACKAGE_GALLERY_LIMIT_REACHED");
  assert.equal(error.current, 6);
  assert.equal(error.limit, 8);
});
```

- [ ] **Step 2: Enforce the batch limit before storage writes**

At the start of `uploadGalleryItems`, query both:

```ts
const [{ data: invitation, error: invitationError }, { count, error: countError }] =
  await Promise.all([
    supabase.from("invitations").select("package_key").eq("id", invitationId).single(),
    supabase.from("gallery_items").select("id", { count: "exact", head: true }).eq("invitation_id", invitationId),
  ]);
```

Return database errors unchanged. Call `validatePackageCapacity(packageKey, "gallery", count ?? 0, files.length)` before entering the upload loop. This guarantees no partial upload occurs for a known package overflow.

- [ ] **Step 3: Add gallery usage and reached-limit UX**

Replace `target pilot: 8` with package-aware copy:

```text
8 dari 8 foto · Paket Intimate · drag foto untuk mengubah urutan
```

Keep gallery edit, reorder, and delete controls active. Disable the upload fieldset and show `Batas galeri paket tercapai. Hapus foto atau upgrade paket.` when full.

- [ ] **Step 4: Validate gallery behavior**

Run:

```bash
node --test tests/package-entitlements.test.mjs
npx eslint src/server/media/upload.ts 'src/app/admin/(protected)/invitations/[id]/gallery/page.tsx'
npx tsc --noEmit
```

Expected: tests pass; an over-limit batch returns before `uploadObject` is called.

- [ ] **Step 5: Commit gallery enforcement**

```bash
git add src/server/media/upload.ts 'src/app/admin/(protected)/invitations/[id]/gallery/page.tsx' tests/package-entitlements.test.mjs
git commit -m "feat(packages): enforce gallery limits"
```

---

### Task 7: Enforce Feature Entitlements End to End

**Files:**

- Modify: `src/server/invitations/mutations.ts:119-143`
- Modify: `src/server/public/normalize.ts:1-169`
- Modify: `src/app/admin/(protected)/invitations/[id]/features/page.tsx:1-61`
- Modify: `src/app/admin/(protected)/invitations/[id]/responses/page.tsx:1-150`
- Test: `tests/package-entitlements.test.mjs`
- Test: `tests/package-feature-normalization.test.mjs`

**Interfaces:**

- Consumes: `resolveEffectiveInvitationFeatures`, `getRequiredPackageForFeature`, `PACKAGE_DEFINITIONS`, and `PackageKey` from Task 2.
- Produces: package-safe saved toggles, sanitized public theme settings, visible locked states, and Grand-only visitor analytics.

- [ ] **Step 1: Add failing disallowed-feature tests**

Extend `tests/package-entitlements.test.mjs`:

```js
test("identifies the package needed for gated features", () => {
  const { getRequiredPackageForFeature } = loadEntitlements();
  assert.equal(getRequiredPackageForFeature("story"), "signature");
  assert.equal(getRequiredPackageForFeature("wishes"), "signature");
  assert.equal(getRequiredPackageForFeature("livestream"), "grand");
  assert.equal(getRequiredPackageForFeature("music"), "intimate");
});
```

Run: `node --test tests/package-entitlements.test.mjs`

Expected: FAIL until the helper is complete.

- [ ] **Step 2: Reject unavailable saved toggles**

Change `updateInvitationFeatures` to select `settings, package_key`. Resolve the allowed features for that package. If any submitted `true` value is disallowed, return:

```text
Fitur Love Story membutuhkan paket Signature.
```

Do not write partial settings. If all toggles are allowed, preserve unrelated settings exactly as the current mutation does.

- [ ] **Step 3: Render locked controls in Features admin**

For each feature key, calculate its required package and whether the active package grants it. Render the switch disabled when unavailable and append copy such as `Tersedia di Signature`. Keep locked rows visible. Use saved values only for granted features.

- [ ] **Step 4: Add public normalization regression coverage**

Create `tests/package-feature-normalization.test.mjs` with a VM loader based on `tests/public-invitation-cache.test.mjs`. Mock an Intimate invitation whose saved settings enable `story`, `wishes`, and `livestream`, and whose settings contain `personSocials` and `dressCode`. Assert the normalized result keeps `music`, `rsvp`, and `gift` true; forces those three gated features false; and omits `personSocials` and `dressCode` from `theme.settings`. Add a Grand case that preserves all five values.

- [ ] **Step 5: Apply defense-in-depth during normalization**

In `loadNormalizedInvitation`, first merge database settings with `DEFAULT_FEATURES`, then call:

```ts
const features = resolveEffectiveInvitationFeatures(
  invitation.package_key as PackageKey,
  { ...DEFAULT_FEATURES, ...settings.features },
);
```

Build `effectiveSettings` before returning the normalized object. For Intimate, omit `personSocials` and `dressCode`; Signature and Grand preserve both. Assign `theme.settings: effectiveSettings`. Do not expose `packageKey` to themes. The package value is only an input to normalization.

- [ ] **Step 6: Gate visitor analytics without hiding RSVP data**

On `ResponsesPage`, load the invitation package alongside responses. Only call `getInvitationAnalyticsSummary` for Grand. All packages still show RSVP totals and rows. Signature and Intimate render a visible locked analytics panel labeled `Visitor analytics tersedia di Grand`; do not query `analytics_events` for locked packages.

- [ ] **Step 7: Run feature tests and project gates**

Run:

```bash
node --test tests/package-entitlements.test.mjs tests/package-feature-normalization.test.mjs
npm test
npx eslint src/server/invitations/mutations.ts src/server/public/normalize.ts 'src/app/admin/(protected)/invitations/[id]/features/page.tsx' 'src/app/admin/(protected)/invitations/[id]/responses/page.tsx' tests/package-feature-normalization.test.mjs
npx tsc --noEmit
npm run build
```

Expected: every command passes; Intimate cannot expose Signature/Grand features even with stale settings.

- [ ] **Step 8: Commit feature enforcement**

```bash
git add src/server/invitations/mutations.ts src/server/public/normalize.ts 'src/app/admin/(protected)/invitations/[id]/features/page.tsx' 'src/app/admin/(protected)/invitations/[id]/responses/page.tsx' tests/package-entitlements.test.mjs tests/package-feature-normalization.test.mjs
git commit -m "feat(packages): enforce feature access"
```

---

### Task 8: Document, Verify, Push, and Deploy

**Files:**

- Modify: `ARCHITECTURE.md`
- Modify: `DATABASE.md`
- Modify: `ROADMAP.md`

**Interfaces:**

- Consumes: all prior tasks.
- Produces: documented package architecture, verified repository state, GitHub `main`, applied Supabase migration, and a Ready Vercel production deployment.

- [ ] **Step 1: Update architecture documentation**

Add a Package Entitlements section to `ARCHITECTURE.md` containing this boundary:

```text
Invitation package_key
        |
Package registry and server policy
        |
Saved invitation feature choices
        |
Effective normalized features
        |
Theme renderer
```

State that package logic never lives in themes and that customer self-service remains outside this foundation.

- [ ] **Step 2: Update database and roadmap documentation**

Add `package_key text NOT NULL DEFAULT 'intimate'` and its allowed values to `DATABASE.md`. Add the package foundation as completed/in-progress infrastructure in `ROADMAP.md`, while keeping payments and customer self-service in future phases.

- [ ] **Step 3: Run fresh final verification**

Run from `invitation_digital/`:

```bash
git diff --check
npm test
npm run lint
npx tsc --noEmit
npm run build
supabase migration list --linked
```

Expected: zero diff errors, all tests pass, lint/typecheck/build exit 0, and local/remote migrations match.

- [ ] **Step 4: Perform focused manual acceptance**

Verify in admin:

1. New invitation cannot submit without package selection.
2. Existing pilot displays Grand.
3. Intimate rejects a third event.
4. Intimate rejects a gallery batch above eight total images before upload.
5. Intimate visibly locks Love Story, Wishes, Dress Code, and Livestream.
6. Signature allows Love Story, Wishes, and Dress Code but locks Livestream.
7. Grand allows every existing toggle.
8. Editing and deleting content remains possible at package limits.
9. Incompatible downgrade lists every conflict and preserves all data.
10. Public Intimate rendering cannot show stale gated features.

- [ ] **Step 5: Commit documentation and any final verification-only adjustments**

```bash
git add ARCHITECTURE.md DATABASE.md ROADMAP.md
git commit -m "docs(packages): document entitlement model"
```

Do not amend earlier commits. If verification requires a code fix, use a separate Conventional Commit matching the fix.

- [ ] **Step 6: Push the project subtree to GitHub**

Run from `/Users/ekadanararrasyid/VS Code`:

```bash
split_sha=$(git subtree split --prefix=invitation_digital HEAD)
git push invitation-digital-origin "$split_sha:main"
git ls-remote invitation-digital-origin refs/heads/main
```

Expected: remote `main` equals `split_sha`. Do not stage or commit unrelated parent-repository changes.

- [ ] **Step 7: Wait for and verify Vercel production deployment**

Run from `invitation_digital/`:

```bash
deployment_host="$(vercel ls invitation-digital 2>&1 | rg -o 'invitation-digital-[a-z0-9-]+\.vercel\.app' | head -n 1)"
test -n "$deployment_host"
vercel inspect "https://$deployment_host" --wait
vercel inspect https://invitation-digital-delta.vercel.app
```

Expected: new deployment and production alias both report `Ready`.

- [ ] **Step 8: Check production errors and smoke routes**

Run:

```bash
vercel logs --deployment "$deployment_host" --since 10m --level error --limit 100 --json
curl -fsSI https://invitation-digital-delta.vercel.app/admin/login
```

Expected: no new deployment errors and the login route returns a successful HTTP response.
