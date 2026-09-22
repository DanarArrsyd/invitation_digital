# Package Entitlements Foundation Design

Date: 2026-09-22
Status: Proposed for implementation

## 1. Objective

Add a reusable package entitlement foundation for digital invitations. Every invitation belongs to one of three packages:

- `intimate`
- `signature`
- `grand`

The package defines the maximum content capacity and features available to an invitation. Themes remain presentation layers and must not contain package rules.

This phase prepares the platform for future customer self-service without implementing customer accounts, payments, pricing, or a customer editor.

## 2. Scope

This phase includes:

- a package key stored on each invitation;
- a typed package registry in application code;
- package selection when an invitation is created;
- package display and controlled package changes in admin;
- server-side enforcement for existing event, gallery, and feature mutations;
- effective feature resolution for public rendering;
- clear admin states for unavailable features and reached limits;
- compatibility for the existing Nusantara Ivory pilot;
- automated tests for entitlements and enforcement.

This phase does not include:

- customer login or self-service editing;
- checkout, payments, subscriptions, or package pricing;
- custom domains;
- implementation of sponsorship, video gallery, advanced RSVP, analytics dashboards, or style presets;
- a marketing package comparison page;
- a second visual theme.

Features that do not exist yet are represented in the package contract so future work has a stable entitlement model. Their product implementation remains separate.

## 3. Product Rules

Quality and platform safety are available to every package and are never paywalled:

- responsive layout;
- performance optimization;
- security and Turnstile protection;
- social share metadata;
- preview and publishing;
- unique invitation links;
- basic guest personalization;
- basic RSVP response access.

Package limits are product limits, not database deletion rules. The system must never remove customer content automatically when a package changes.

## 4. Package Matrix

| Capability | Intimate | Signature | Grand |
|---|---:|---:|---:|
| Maximum events | 2 | 3 | 5 |
| Maximum gallery images | 8 | 20 | 40 |
| Maximum sponsors | 0 | 5 | 10 |
| Opening cover | Yes | Yes | Yes |
| Couple and parent information | Yes | Yes | Yes |
| Maps and Add to Calendar | Yes | Yes | Yes |
| Countdown | Yes | Yes | Yes |
| Personalized guest links | Yes | Yes | Yes |
| Basic RSVP | Yes | Yes | Yes |
| Background music | Yes | Yes | Yes |
| Digital gift | Yes | Yes | Yes |
| Love story | No | Yes | Yes |
| Wishes or guestbook | No | Yes | Yes |
| Dress code | No | Yes | Yes |
| Couple Instagram links | No | Yes | Yes |
| RSVP export | No | Yes | Yes |
| Sponsorship section | No | Yes | Yes |
| Livestream | No | No | Yes |
| Video gallery | No | No | Yes |
| Advanced RSVP | No | No | Yes |
| Visitor and RSVP analytics | No | No | Yes |
| Color and font presets | No | No | Yes |
| Platform branding | Hidden | Hidden | Hidden |

`Signature` is the recommended package. `Grand` is the complete package.

## 5. Data Model

Add `package_key text` to `invitations` with allowed values `intimate`, `signature`, and `grand`.

Migration behavior:

1. Add the column as nullable.
2. Backfill all existing invitations to `grand` so the pilot loses no capability.
3. Add a check constraint for the three supported keys.
4. Set the column to `NOT NULL`.
5. Set the database default to `intimate` as a safe fallback.

Use text plus a check constraint instead of a PostgreSQL enum. This keeps future package renames or additions reversible.

Do not create a `packages` table in this phase. Package definitions are product code, not user-managed content. A database table would introduce runtime configuration, validation, and synchronization complexity without a current use case.

## 6. Package Domain Model

Create a package domain module independent from themes and UI. It owns:

- `PackageKey`;
- package labels and descriptions;
- numeric limits;
- feature entitlements;
- package ordering;
- helpers for entitlement checks;
- helpers for resolving effective invitation features.

Conceptual contract:

```ts
type PackageKey = "intimate" | "signature" | "grand";

interface PackageEntitlements {
  maxEvents: number;
  maxGalleryImages: number;
  maxSponsors: number;
  features: {
    story: boolean;
    wishes: boolean;
    dressCode: boolean;
    instagram: boolean;
    rsvpExport: boolean;
    sponsorship: boolean;
    livestream: boolean;
    videoGallery: boolean;
    advancedRsvp: boolean;
    analytics: boolean;
    stylePresets: boolean;
  };
}
```

Existing invitation feature toggles remain customer choices in `settings.features`. Package entitlements are the ceiling. Effective public behavior is calculated as:

```text
effective feature = selected feature AND package entitlement
```

Universal features such as maps, countdown, music, gifts, guest personalization, and basic RSVP remain available in every package. They may still be switched off when the invitation design does not need them.

## 7. Creation and Package Changes

The new invitation form requires explicit package selection. The UI presents `Signature` as recommended but does not silently select a commercial package on behalf of the operator.

The invitation edit header displays the active package. Admin can change the package from the general settings page.

Upgrade rules:

- upgrades are always allowed;
- newly available optional features remain disabled until explicitly enabled;
- existing content is preserved.

Downgrade rules:

- a downgrade is blocked when current event, gallery, or future sponsor counts exceed the target package limit;
- a downgrade is blocked when unavailable feature toggles remain enabled;
- the error lists every conflict that must be resolved;
- the system never deletes or truncates content automatically.

This behavior is safer than silently hiding ceremony details, photos, or guest content.

## 8. Enforcement

Package checks must live in server/domain services, not only in disabled buttons.

### Events

- Creating a new event checks the current count against `maxEvents`.
- Editing an existing event remains allowed at the limit.
- The server returns a clear Indonesian error when the limit is reached.

### Gallery

- Upload validates `existing count + incoming file count` before uploading any file.
- The entire batch is rejected when it would exceed the limit.
- Editing, reordering, or deleting existing images remains allowed.

### Feature settings

- The update service rejects enabled features not granted by the package.
- The admin form renders unavailable toggles as disabled with the required package label.
- Public normalization intersects saved toggles with entitlements as defense in depth.

### Future capabilities

Sponsorship, video gallery, advanced RSVP, analytics dashboards, and style presets must call the same package domain helpers when implemented. No future feature may duplicate package rules inside a theme.

## 9. Public Rendering and Themes

The normalized public invitation receives effective features only. Nusantara Ivory and future themes continue to render normalized data without knowing package names.

This boundary remains:

```text
database invitation
        |
package entitlement resolver
        |
normalized public invitation
        |
theme renderer
```

Themes must not import the package registry, query the database, or display upgrade messaging.

## 10. Admin Experience

Admin pages show:

- active package badge;
- current usage such as `6 of 8 gallery images`;
- disabled feature toggles with `Signature` or `Grand` requirement;
- limit messages before content entry where practical;
- server errors when concurrent or stale actions exceed a limit.

Locked controls remain visible. Visibility teaches the package difference and avoids making missing features look like application bugs.

## 11. Compatibility and Rollback

Existing invitations are assigned `grand` during migration. Existing settings and content remain unchanged.

Rollback is safe because:

- package rules do not alter or delete invitation content;
- the migration can drop the constraint and `package_key` column;
- existing `settings.features` data remains intact;
- themes remain independent from the package model.

## 12. Error Handling

Package errors use a stable domain error shape containing:

- error code;
- human-readable Indonesian message;
- relevant package;
- current usage and limit when applicable.

Expected codes include:

- `PACKAGE_EVENT_LIMIT_REACHED`;
- `PACKAGE_GALLERY_LIMIT_REACHED`;
- `PACKAGE_FEATURE_NOT_AVAILABLE`;
- `PACKAGE_DOWNGRADE_CONFLICT`.

Unexpected database or storage errors keep their existing handling and must not be mislabeled as package errors.

## 13. Test Strategy

Add tests for:

- complete package registry values;
- package ordering and upgrade detection;
- effective feature intersection;
- Intimate, Signature, and Grand event limits;
- gallery batch limit validation;
- edits and deletes remaining available at a limit;
- unavailable feature rejection;
- downgrade conflict reporting;
- existing invitation migration to Grand;
- public normalization never exposing disallowed features.

Run the existing test suite, ESLint, TypeScript validation, and production build before completion.

## 14. Delivery Flow

Implementation should proceed in these slices:

1. Add migration and generated database types.
2. Add package registry and pure entitlement helpers with tests.
3. Add package selection and display in admin.
4. Enforce event and gallery limits on the server.
5. Enforce feature entitlements and effective public features.
6. Add downgrade validation and admin usage messaging.
7. Run full verification and deploy.

Each slice must preserve existing invitation behavior. The Rayhana and Febri pilot remains Grand throughout the transition.

## 15. Acceptance Criteria

The foundation is complete when:

- every invitation has a valid package key;
- existing invitations retain all current capabilities;
- new invitations require a package choice;
- event and gallery limits cannot be bypassed through server actions;
- unavailable feature toggles cannot be saved;
- public themes receive package-safe effective features;
- upgrades preserve content and unlock eligibility;
- incompatible downgrades are blocked without data loss;
- package rules exist in one typed domain module;
- no theme contains package-specific branching;
- tests, lint, typecheck, and production build pass.
