# CLAUDE.md

## Project Overview

This repository contains a reusable digital invitation platform.

The first production pilot is:

- Invitation: Rayhana & Febri
- Type: Wedding
- Event date: 20 October 2026
- Theme: `nusantara-ivory`
- Venue: Puri Nirwaran Residence
- Primary visual direction: modern Nusantara editorial, subtle, premium, ivory/cream
- Invitation lifetime: 3 months after publish

The product must **not** be architected as a one-off wedding website. The core entity is `invitation`, not `wedding`, because the platform is expected to support other event types later such as birthdays, engagements, aqiqah, graduations, and corporate events.

---

## Primary Goal

Build an MVP that can be used for the Rayhana & Febri wedding while remaining reusable for future customers and themes.

The MVP must allow the admin to:

1. Log in.
2. Create and edit an invitation.
3. Select a theme.
4. Enter couple/people data.
5. Enter event information.
6. Upload photos.
7. Configure optional sections.
8. Add wedding gift bank accounts.
9. Manage guest names.
10. Preview the invitation.
11. Publish it.
12. Monitor RSVP and wishes.
13. Hide or delete inappropriate wishes.
14. Let the invitation expire automatically.

---

## Mandatory Technology Stack

Use:

- Next.js 16.x
- App Router
- TypeScript
- Tailwind CSS 4.x
- shadcn/ui for admin interface only
- Custom invitation components for public themes
- Motion for restrained animation
- Supabase PostgreSQL
- Supabase Auth
- Supabase Storage
- Zod for validation
- Cloudflare Turnstile for public write forms
- Vercel for deployment

Do not replace the stack unless explicitly instructed.

---

## Architecture Principles

### 1. General-purpose invitation architecture

Correct:

```text
Invitation
├── type: wedding
├── theme: nusantara-ivory
├── content
├── events
├── people
├── guests
├── rsvps
└── wishes
```

Incorrect:

```text
WeddingWebsite
BrideTable
GroomTable
WeddingOnlyService
```

Do not create wedding-specific architecture at the platform core.

### 2. Themes are presentation layers

A theme:

- receives normalized invitation data;
- renders that data;
- may define visual defaults;
- must not directly query Supabase;
- must not implement its own database logic;
- must not contain customer-specific hardcoded data.

Example:

```tsx
<NusantaraIvory invitation={invitation} />
```

### 3. Admin and invitation UI are separate design systems

Admin:

- clean;
- compact;
- functional;
- neutral;
- reusable;
- shadcn/ui allowed.

Public invitation:

- custom art direction;
- emotionally driven;
- premium;
- mobile-first;
- no generic SaaS cards;
- no visual resemblance to admin dashboard.

### 4. Do not overengineer

Do not introduce:

- microservices;
- Kubernetes;
- Docker orchestration;
- Redis unless a concrete requirement appears;
- queues unless a concrete requirement appears;
- event sourcing;
- separate backend services without necessity;
- complex state management when local/server state is sufficient.

---

## Coding Rules

### TypeScript

- Strict TypeScript.
- Avoid `any`.
- Define explicit domain types.
- Prefer discriminated unions for invitation types when necessary.
- Validate server inputs with Zod.

### Naming

Use:

```text
invitation
invitationId
themeSlug
eventType
isVisible
publishedAt
expiresAt
```

Avoid unclear abbreviations.

### Components

Prefer small components with clear responsibilities.

Do not build giant files containing the entire invitation.

Example:

```text
themes/nusantara-ivory/
├── NusantaraIvory.tsx
├── CoverSection.tsx
├── CoupleSection.tsx
├── EventSection.tsx
├── StorySection.tsx
├── GallerySection.tsx
├── RsvpSection.tsx
├── WishesSection.tsx
├── GiftSection.tsx
└── ClosingSection.tsx
```

### Server/client components

Default to Server Components.

Use Client Components only when needed for:

- audio playback;
- opening interaction;
- animation requiring browser APIs;
- RSVP forms;
- wishes forms;
- copy-to-clipboard;
- interactive admin controls.

Do not mark entire route trees with `"use client"` unnecessarily.

---

## Public Invitation Rules

The public route should be conceptually:

```text
/[slug]
```

If project routing needs a namespace, `/invitation/[slug]` is acceptable, but prefer a clean public URL if possible.

Public invitation behavior:

1. Resolve invitation by slug.
2. Validate status.
3. Validate expiration.
4. Fetch normalized public data.
5. Resolve guest personalization.
6. Resolve selected theme.
7. Render theme.
8. Keep dynamic form submissions isolated.

### Opening interaction

The invitation must open with an elegant cover.

For `nusantara-ivory`:

- ivory background;
- no full-screen photo on initial cover;
- wedding title;
- Rayhana & Febri;
- date;
- personalized guest name when available;
- "Buka Undangan" button.

After user interaction:

- reveal invitation;
- start music when enabled;
- maintain a visible play/pause control.

Do not force audio before user interaction.

---

## Feature Toggles

Optional sections must not be removed from code for each customer.

Use settings such as:

```ts
sections: {
  quote: true,
  couple: true,
  events: true,
  countdown: true,
  maps: true,
  story: true,
  gallery: true,
  livestream: false,
  rsvp: true,
  wishes: true,
  gift: true
}
```

The theme must respect these settings.

---

## Pilot Requirements: Rayhana & Febri

Initial data:

```text
Couple: Rayhana & Febri
Event date: 20 October 2026
Venue: Puri Nirwaran Residence
Theme: Nusantara Ivory
Primary colors: Ivory / cream
Style: Subtle modern Nusantara editorial
Gallery: 8 photos initially
Gift: Bank account
RSVP: Hadir / Tidak Hadir
Wishes: Visible immediately after successful submission
Livestream: Supported but OFF by default
Music: Supported; final track TBD
Love Story: Supported; content TBD
Guest personalization: Enabled
Expiration: 3 months after publish
Parents: Displayed
```

Unknown data must remain editable and must not be invented.

---

## Security

Mandatory:

- Supabase RLS for protected data.
- Never expose service-role key to browser.
- Public submissions validated server-side.
- Public RSVP/wishes protected with Turnstile.
- Sanitize user-generated wishes before rendering.
- Rate-limit public write operations if needed.
- Validate uploaded file type and size.
- Admin operations require authenticated user.

Never trust client-side validation alone.

---

## Performance

Public invitation is mobile-first.

Priorities:

1. fast first render;
2. optimized images;
3. lazy-load below-the-fold media;
4. avoid excessive JS;
5. avoid animation libraries for trivial effects;
6. cache mostly-static invitation content;
7. keep RSVP/wishes dynamic.

Target behavior on average mobile connections must remain smooth.

---

## Design Guardrails

Do not use:

- purple-blue AI gradients;
- neon glows;
- excessive glassmorphism;
- generic floating blobs;
- cyberpunk visual language;
- dashboard-like cards on public invitation;
- excessive rounded cards;
- motion on every element.

The Nusantara theme must use cultural references subtly.

Do not paste random batik PNG decorations and call the theme "Nusantara".

---

## Definition of Done for MVP

The MVP is done when:

- admin can authenticate;
- Rayhana & Febri invitation can be created from database content;
- Nusantara Ivory renders through theme engine;
- opening cover works;
- music starts after user interaction;
- guest personalization works;
- event data renders;
- parents render;
- countdown works;
- maps link works;
- gallery supports at least 8 images;
- love story can be toggled;
- livestream can be toggled and defaults OFF;
- RSVP works;
- wishes work;
- admin can hide/delete wishes;
- bank gift account renders;
- preview works;
- publish status works;
- expiration works;
- public page is responsive;
- no Rayhana/Febri-specific content is hardcoded inside theme components.

---

## Agent Behavior

Before implementing a feature:

1. Read relevant documentation files.
2. Preserve the architecture described here.
3. Prefer the simplest maintainable implementation.
4. Do not silently change product scope.
5. Do not introduce dependencies merely for convenience.
6. Keep visual output aligned with `DESIGN.md`.
7. Keep database changes aligned with `DATABASE.md`.
8. Keep roadmap boundaries aligned with `ROADMAP.md`.

When requirements conflict, priority is:

```text
CLAUDE.md
→ ARCHITECTURE.md
→ DATABASE.md
→ DESIGN.md
→ ROADMAP.md
```
