# ARCHITECTURE.md

## 1. System Overview

The application is a reusable digital invitation platform.

Initial product flow:

```text
Marketing Website
      │
      ├── Template catalogue
      ├── Packages
      └── WhatsApp order CTA
              │
              ▼
         Admin receives order
              │
              ▼
        Admin Dashboard
              │
       Create Invitation
              │
              ▼
       Invitation Engine
              │
       Theme Resolution
              │
              ▼
       Public Invitation
```

Customer self-service is intentionally excluded from MVP.

---

## 2. Main Domains

```text
Authentication
Invitations
Themes
People
Events
Stories
Gallery
Gift Accounts
Guests
RSVP
Wishes
Analytics
Media
Publishing
```

---

## 3. Suggested Project Structure

```text
src/
├── app/
│   ├── (marketing)/
│   │   └── page.tsx
│   │
│   ├── (public)/
│   │   └── [slug]/
│   │       ├── page.tsx
│   │       ├── loading.tsx
│   │       └── not-found.tsx
│   │
│   ├── admin/
│   │   ├── login/
│   │   ├── dashboard/
│   │   ├── invitations/
│   │   │   ├── page.tsx
│   │   │   ├── new/
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       ├── people/
│   │   │       ├── events/
│   │   │       ├── content/
│   │   │       ├── gallery/
│   │   │       ├── gifts/
│   │   │       ├── guests/
│   │   │       ├── features/
│   │   │       ├── responses/
│   │   │       └── publish/
│   │   └── themes/
│   │
│   └── api/
│       ├── rsvp/
│       ├── wishes/
│       └── analytics/
│
├── components/
│   ├── admin/
│   ├── marketing/
│   ├── invitation/
│   └── ui/
│
├── themes/
│   ├── registry.ts
│   └── nusantara-ivory/
│       ├── index.ts
│       ├── NusantaraIvory.tsx
│       ├── components/
│       └── styles/
│
├── features/
│   ├── invitations/
│   ├── guests/
│   ├── rsvp/
│   ├── wishes/
│   └── media/
│
├── lib/
│   ├── supabase/
│   ├── validation/
│   ├── turnstile/
│   ├── security/
│   ├── dates/
│   └── utils/
│
├── server/
│   ├── invitations/
│   ├── publishing/
│   ├── rsvp/
│   ├── wishes/
│   └── analytics/
│
└── types/
    ├── invitation.ts
    ├── theme.ts
    └── database.ts
```

The exact structure may evolve, but preserve domain separation.

---

## 4. Invitation Loading Flow

```text
GET /rayhana-febri
       │
       ▼
Resolve invitation by slug
       │
       ├── not found → 404
       │
       ▼
Check status
       │
       ├── draft → public unavailable
       │
       ▼
Check expiration
       │
       ├── expired → expiration page
       │
       ▼
Fetch public normalized data
       │
       ▼
Resolve guest
       │
       ▼
Resolve theme
       │
       ▼
Render ThemeRenderer
```

---

## 5. Normalized Data Contract

Themes must receive normalized data.

Conceptual TypeScript:

```ts
export interface PublicInvitation {
  id: string
  type: InvitationType
  slug: string
  title: string
  status: "published"
  publishedAt: string
  expiresAt: string | null

  theme: {
    slug: string
    settings: Record<string, unknown>
  }

  people: InvitationPerson[]
  events: InvitationEvent[]
  stories: InvitationStory[]
  gallery: GalleryItem[]
  gifts: GiftAccount[]

  content: {
    openingQuote?: string | null
    openingMessage?: string | null
    closingMessage?: string | null
  }

  features: {
    music: boolean
    countdown: boolean
    maps: boolean
    story: boolean
    gallery: boolean
    livestream: boolean
    rsvp: boolean
    wishes: boolean
    gift: boolean
    guestPersonalization: boolean
  }

  media: {
    musicUrl?: string | null
    coverImageUrl?: string | null
  }
}
```

Themes must not care about raw database table shape.

---

## 6. Theme Registry

Use a registry rather than conditional logic scattered around routes.

Example:

```ts
export const themeRegistry = {
  "nusantara-ivory": {
    component: NusantaraIvory,
    category: "wedding",
  },
} as const
```

Theme renderer:

```tsx
const themeDefinition = themeRegistry[invitation.theme.slug]

if (!themeDefinition) {
  return <UnsupportedTheme />
}

const Theme = themeDefinition.component

return <Theme invitation={invitation} guest={guest} />
```

---

## 7. Theme Rules

A theme may:

- define visual hierarchy;
- define typography;
- define decoration;
- define transitions;
- choose layout of normalized content.

A theme may not:

- query Supabase;
- access service-role keys;
- create RSVP records directly;
- create wishes directly;
- know admin internals;
- hardcode customer content.

---

## 8. Guest Personalization

Preferred production pattern:

```text
/rayhana-febri?guest=<token>
```

Flow:

```text
token
↓
server resolves guest record
↓
display_name
↓
render "Kepada Yth."
```

For MVP development, `?to=` may be supported temporarily, but token-based links should be preferred for managed guest lists.

Benefits:

- cleaner URLs;
- guest names are not manually encoded;
- links can be tracked later;
- display names remain editable.

---

## 9. Public Writes

### RSVP

```text
Browser Form
↓
Client Validation
↓
Turnstile
↓
Server Route / Server Action
↓
Zod Validation
↓
Supabase Insert
↓
Success State
```

Values:

```text
attending
not_attending
```

Do not add guest count in MVP.

### Wishes

```text
Browser Form
↓
Validation
↓
Turnstile
↓
Sanitize
↓
Insert wish with is_visible = true
↓
Render in public wishes list
```

Admin can:

- hide;
- unhide;
- delete.

---

## 10. Publishing

Invitation statuses:

```text
draft
published
expired
archived
```

Recommended behavior:

### Draft

- editable;
- previewable by admin;
- not publicly accessible.

### Published

- public URL active;
- `published_at` stored;
- `expires_at` generated if missing.

For pilot:

```text
expires_at = published_at + 3 months
```

### Expired

- public invitation content no longer displayed;
- route may show a branded expiration state.

### Archived

- admin-only historical record.

A scheduled background job is not required for MVP if expiration can be determined at request time.

Example:

```ts
const expired =
  invitation.expiresAt &&
  new Date(invitation.expiresAt) < new Date()
```

Status may later be synchronized.

---

## 11. Storage Architecture

Suggested buckets:

```text
invitation-media
```

Object layout:

```text
invitations/
└── <invitation-id>/
    ├── people/
    ├── gallery/
    ├── cover/
    └── music/
```

Example:

```text
invitations/uuid/gallery/01.webp
```

Store object paths in database rather than unnecessary duplicated public URLs when practical.

---

## 12. Caching

Mostly-static content:

- invitation data;
- people;
- event details;
- stories;
- theme;
- gallery metadata;
- gifts.

Dynamic content:

- RSVP;
- wishes;
- analytics.

Do not force all invitation rendering to be fully dynamic solely because wishes exist.

Separate dynamic fetching/mutations where practical.

---

## 13. Admin Flow

```text
Login
↓
Dashboard
↓
Invitations
↓
Create Invitation
↓
General
↓
People
↓
Events
↓
Content
↓
Gallery
↓
Gifts
↓
Guests
↓
Theme / Features
↓
Preview
↓
Publish
```

Inside invitation edit header:

```text
Invitation Name
Status
[Save Draft] [Preview] [Publish]
```

---

## 14. Admin Navigation

MVP sidebar:

```text
Dashboard
Invitations
Themes
Settings
```

RSVP, wishes, guests, and analytics live under each invitation detail.

Avoid a crowded global sidebar.

---

## 15. Security Boundary

Browser may access:

- public invitation data intended for public view;
- authenticated admin data according to RLS;
- public forms through protected endpoints.

Browser must never receive:

- Supabase service role key;
- unrestricted admin queries;
- private configuration secrets.

---

## 16. Future Extension Path

The architecture must permit:

```text
Invitation
├── wedding
├── birthday
├── engagement
├── aqiqah
├── graduation
└── corporate
```

New event types should extend domain behavior without requiring a rewrite of the invitation core.

Likewise:

```text
themes/
├── nusantara-ivory
├── maison
├── botanical
├── modern-classic
└── noir
```

A new theme should ideally require:

1. theme registration;
2. theme components;
3. optional theme-specific settings.

It must not require database duplication.
