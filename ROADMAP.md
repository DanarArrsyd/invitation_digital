# ROADMAP.md

## Product Direction

Build a reusable digital invitation platform.

Initial commercial focus:

```text
Wedding invitations
```

Future expansion:

```text
Birthday
Engagement
Aqiqah
Graduation
Corporate Events
Other personal events
```

The product initially operates as a managed service:

```text
Customer sees website
↓
Customer selects package/template
↓
Customer contacts admin via WhatsApp
↓
Admin creates invitation
↓
Customer receives preview
↓
Admin revises
↓
Admin publishes
```

Customer self-service is not part of MVP.

---

# Phase 0 — Foundation

Status: Definition complete.

Deliverables:

- product positioning;
- architecture;
- database model;
- theme architecture;
- admin flow;
- design direction;
- documentation.

Pilot:

```text
Rayhana & Febri
20 October 2026
Puri Nirwaran Residence
Theme: Nusantara Ivory
```

---

# Phase 1 — Technical Foundation

## 1. Project Setup

- Next.js 16.x
- TypeScript
- Tailwind CSS 4.x
- shadcn/ui
- Motion
- Supabase
- environment configuration
- lint/typecheck
- base folder structure

Acceptance:

- application runs locally;
- environment variables documented;
- Supabase clients separated correctly;
- no service-role secret exposed.

---

## 2. Authentication

Implement admin authentication.

MVP:

- login;
- logout;
- protected admin routes.

Acceptance:

- unauthenticated visitor cannot access admin;
- authenticated admin can access dashboard.

---

## 3. Database & Migrations

Implement schema from `DATABASE.md`.

Acceptance:

- migrations reproducible;
- foreign keys correct;
- indexes added;
- RLS enabled;
- pilot seed can be inserted.

---

# Phase 2 — Invitation Admin MVP

## 1. Invitation List

Features:

- list;
- status;
- event date;
- theme;
- edit;
- preview.

Acceptance:

- Rayhana & Febri appears as a draft invitation.

---

## 2. Create/Edit Invitation

Sections:

```text
General
People
Events
Content
Gallery
Gifts
Guests
Features
Publish
```

Acceptance:

- admin can save incomplete draft;
- missing future data does not block draft save.

---

## 3. Media Upload

Features:

- people photo;
- gallery;
- music;
- optional cover.

Acceptance:

- images upload to structured Supabase Storage path;
- invalid files rejected;
- 8 pilot gallery photos supported.

---

# Phase 3 — Theme Engine

## 1. Theme Registry

Implement:

```text
themeRegistry
ThemeRenderer
```

Acceptance:

- invitation chooses theme by slug;
- missing theme fails gracefully.

---

## 2. Nusantara Ivory

Implement:

- ivory opening cover;
- personalized greeting;
- couple;
- parents;
- events;
- countdown;
- maps;
- story;
- gallery;
- livestream conditional section;
- RSVP;
- wishes;
- gift;
- closing;
- music controls.

Acceptance:

- all feature toggles work;
- no customer data hardcoded;
- polished at mobile width.

---

# Phase 4 — Public Interaction

## 1. Guest Personalization

Implement token-based guest resolution.

Acceptance:

```text
/rayhana-febri?guest=<token>
```

shows correct display name.

---

## 2. RSVP

Implement:

```text
Hadir
Tidak Hadir
```

Requirements:

- Zod validation;
- Turnstile;
- controlled DB mutation;
- success/error UI.

Acceptance:

- valid RSVP stored;
- bot verification required;
- admin can view responses.

---

## 3. Wishes

Requirements:

- guest/name;
- message;
- visible immediately;
- Turnstile;
- admin moderation.

Acceptance:

- public wish appears after submission;
- admin can hide/delete;
- hidden wish disappears publicly.

---

# Phase 5 — Publishing

Implement:

- preview;
- draft;
- publish;
- expiration.

Pilot:

```text
expires_at = published_at + 3 months
```

Acceptance:

- draft unavailable publicly;
- published invitation works;
- expired invitation shows expiration state.

---

# Phase 6 — Basic Analytics

Track only useful MVP events:

```text
invitation_open
cover_opened
rsvp_submitted
wish_submitted
```

Admin metrics:

```text
Total Opens
RSVP Count
Attending
Not Attending
Wishes
```

Do not add advanced dashboards yet.

---

# Phase 7 — Marketing Website

After pilot works, build public business site.

Sections:

```text
Hero
Template Preview
Packages
Features
How It Works
FAQ
Testimonials
WhatsApp CTA
```

Goal:

- customer chooses package;
- customer chooses template;
- customer contacts admin via WhatsApp.

---

# Phase 8 — Template Expansion

Initial commercial collection target:

```text
01 Nusantara Ivory
02 Maison / Ivory Minimal
03 Botanical
04 Modern Classic
05 Noir / Dark Editorial
```

Rule:

Fewer excellent themes are preferred over many mediocre themes.

---

# Phase 9 — Commercial Hardening

Before meaningful paid volume:

- review Vercel plan;
- review Supabase plan;
- backup strategy;
- abuse monitoring;
- storage limits;
- analytics retention;
- error monitoring;
- privacy policy;
- terms;
- data handling procedures.

---

# Future Phase — Customer Self Service

Not MVP.

Possible future features:

- customer accounts;
- customer editor;
- payment gateway;
- package activation;
- automatic publishing;
- customer analytics;
- advanced guest manager;
- WhatsApp generator;
- QR invitations;
- custom domain add-on;
- template marketplace.

Only start this phase after the managed-service workflow proves demand.

---

# Non-Goals for MVP

Explicitly exclude:

- customer login;
- drag-and-drop builder;
- page-builder architecture;
- Stripe/Midtrans integration;
- subscription engine;
- custom domains;
- multi-language builder;
- seating chart;
- guest meal preferences;
- team organizations;
- designer marketplace;
- AI template generator;
- complex analytics.

---

# Pilot Success Criteria

Rayhana & Febri is considered a successful pilot when:

1. Invitation can be fully managed from admin.
2. Public invitation is visually polished.
3. Mobile loading is acceptable.
4. Guest personalization works.
5. Music behavior works.
6. Event information can be updated without code edits.
7. Gallery works.
8. Love story can be added later.
9. RSVP works.
10. Wishes work.
11. Gift account works.
12. Livestream can be enabled without code change.
13. Expiration works.
14. The same theme can be reused for a second customer by changing database content only.

The final criterion is critical. If a second customer requires copying and rewriting the entire theme, the architecture has failed.
