# AGENTS.md

## Purpose

This file defines how coding agents should work inside this repository.

Agents are expected to produce production-quality code while preserving the product architecture and design direction.

---

## Required Reading Order

Before major work, read:

1. `CLAUDE.md`
2. `ARCHITECTURE.md`
3. `DATABASE.md`
4. `DESIGN.md`
5. `ROADMAP.md`
6. `SKILL.md`

For small scoped changes, read the files relevant to the change.

---

## Agent Responsibilities

### Product/Architecture Agent

Responsible for:

- route structure;
- data flow;
- theme engine;
- server/client boundaries;
- service modules;
- application conventions.

Must not redesign the visual theme without checking `DESIGN.md`.

### Database Agent

Responsible for:

- Supabase schema;
- migrations;
- RLS;
- indexes;
- data integrity;
- public/private query boundaries.

Must not add wedding-only tables when a general invitation model is sufficient.

### Admin UI Agent

Responsible for:

- admin dashboard;
- invitation editor;
- upload controls;
- guest manager;
- RSVP/wishes management;
- preview/publish UX.

Use shadcn/ui where appropriate.

### Theme/Frontend Agent

Responsible for:

- public invitation;
- Nusantara Ivory theme;
- typography;
- spacing;
- responsive behavior;
- motion;
- gallery;
- cover interaction;
- public forms.

Must not make the public invitation resemble a SaaS dashboard.

### QA Agent

Responsible for:

- responsive validation;
- form validation;
- expiration logic;
- feature-toggle behavior;
- guest personalization;
- mobile performance;
- accessibility basics.

---

## Workflow

For each task:

```text
Understand scope
↓
Read relevant docs
↓
Inspect current implementation
↓
Make smallest coherent change
↓
Validate types
↓
Validate lint
↓
Validate behavior
↓
Document important architectural changes
```

Do not perform unrelated refactors during a feature task.

---

## Scope Discipline

### MVP

The MVP exists to successfully launch the Rayhana & Febri invitation and form the reusable core for future invitations.

Agents must prioritize:

- stability;
- reusability;
- visual quality;
- mobile experience;
- fast development;
- simple operations.

### Not MVP

Do not implement unless explicitly requested:

- customer login;
- self-service customer editor;
- drag-and-drop page builder;
- payment gateway;
- automatic checkout;
- subscription billing;
- template marketplace;
- custom domains;
- WhatsApp API automation;
- complex seating management;
- multi-tenant organizations;
- designer marketplace;
- advanced analytics warehouse.

---

## Commit/Change Philosophy

Every change should answer:

- What user/admin problem does this solve?
- Does it preserve general-purpose invitation architecture?
- Does it reduce or increase unnecessary complexity?
- Is this needed for MVP?

Avoid speculative architecture.

---

## Frontend Rules

### Admin

Use:

- shadcn/ui;
- clear forms;
- neutral layout;
- predictable navigation;
- responsive admin experience.

### Public invitation

Use:

- custom components;
- editorial layout;
- custom typography system;
- subtle motion;
- high quality spacing.

Avoid:

- excessive card UI;
- admin components reused directly in public invitation;
- generic SaaS styling;
- stock-looking decorative gradients.

---

## Database Rules

- Use UUID primary keys.
- Use `created_at` and `updated_at` where appropriate.
- Foreign keys must be explicit.
- Use cascade behavior intentionally.
- Use indexes on commonly queried fields.
- Use RLS.
- Public users never receive admin-only data.
- Theme components never query database directly.

---

## Forms

All public write forms must:

1. validate client-side for UX;
2. validate server-side for security;
3. verify Turnstile;
4. enforce reasonable field lengths;
5. sanitize user-generated content;
6. return understandable errors.

---

## Unknown Pilot Data

Do not invent:

- event time;
- exact address;
- parents' names;
- love story;
- song title;
- bank account;
- livestream URL.

Use empty/null values and editable admin fields until provided.

---

## Visual Review Checklist

Before declaring public UI complete:

- Test at 320px width.
- Test common mobile viewport around 390px.
- Test tablet.
- Test desktop.
- Check long guest names.
- Check long parent names.
- Check long venue names.
- Check missing optional sections.
- Check gallery with fewer than 8 photos.
- Check music disabled.
- Check livestream disabled.
- Check expired invitation.
- Check slow image loading.

---

## Acceptance Rule

A feature is not complete merely because it compiles.

It is complete when:

- behavior matches documentation;
- responsive state is usable;
- empty state is handled;
- error state is handled;
- permissions are correct;
- types are correct;
- no unrelated complexity was introduced.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
