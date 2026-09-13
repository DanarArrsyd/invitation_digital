# DATABASE.md

## 1. Database Strategy

Database: Supabase PostgreSQL.

The database is designed around a general-purpose `invitations` entity.

Do not create the platform around a `weddings` table.

---

## 2. Core Relationships

```text
profiles
   │
   └── manages invitations

themes
   │
   └── invitations
          │
          ├── invitation_people
          ├── invitation_events
          ├── invitation_stories
          ├── gallery_items
          ├── gift_accounts
          ├── guests
          │      └── rsvps
          ├── wishes
          └── analytics_events
```

---

## 3. Recommended Tables

### profiles

Admin profile linked to Supabase Auth.

```sql
profiles
- id uuid PK references auth.users(id)
- display_name text
- created_at timestamptz
- updated_at timestamptz
```

For MVP, there may be only one admin.

---

### themes

```sql
themes
- id uuid PK
- name text NOT NULL
- slug text UNIQUE NOT NULL
- category text NOT NULL
- description text
- preview_image_path text
- is_active boolean DEFAULT true
- created_at timestamptz
- updated_at timestamptz
```

Pilot theme:

```text
name: Nusantara Ivory
slug: nusantara-ivory
category: wedding
```

---

### invitations

```sql
invitations
- id uuid PK
- type text NOT NULL
- title text NOT NULL
- slug text UNIQUE NOT NULL
- theme_id uuid FK themes(id)
- status text NOT NULL DEFAULT 'draft'
- event_date date
- venue_summary text
- opening_quote text
- opening_message text
- closing_message text
- cover_image_path text
- music_path text
- settings jsonb NOT NULL DEFAULT '{}'
- published_at timestamptz
- expires_at timestamptz
- created_by uuid FK profiles(id)
- created_at timestamptz
- updated_at timestamptz
```

Recommended status values:

```text
draft
published
expired
archived
```

Recommended initial types:

```text
wedding
```

Future:

```text
birthday
engagement
aqiqah
graduation
corporate
```

---

### invitation_people

General-purpose people linked to an invitation.

```sql
invitation_people
- id uuid PK
- invitation_id uuid FK invitations(id) ON DELETE CASCADE
- role text NOT NULL
- full_name text NOT NULL
- nickname text
- father_name text
- mother_name text
- photo_path text
- bio text
- sort_order integer DEFAULT 0
- created_at timestamptz
- updated_at timestamptz
```

Wedding roles:

```text
bride
groom
```

Future examples:

```text
celebrant
host
speaker
```

Do not create dedicated `brides` or `grooms` tables.

---

### invitation_events

```sql
invitation_events
- id uuid PK
- invitation_id uuid FK invitations(id) ON DELETE CASCADE
- event_type text
- title text NOT NULL
- event_date date NOT NULL
- start_time time
- end_time time
- venue_name text
- address text
- maps_url text
- livestream_url text
- sort_order integer DEFAULT 0
- created_at timestamptz
- updated_at timestamptz
```

Wedding examples:

```text
akad
reception
ngunduh_mantu
after_party
```

---

### invitation_stories

```sql
invitation_stories
- id uuid PK
- invitation_id uuid FK invitations(id) ON DELETE CASCADE
- title text NOT NULL
- story_date date
- year_label text
- description text
- image_path text
- sort_order integer DEFAULT 0
- created_at timestamptz
- updated_at timestamptz
```

`year_label` allows values such as:

```text
2019
Early 2024
The Beginning
```

when an exact date is unnecessary.

---

### gallery_items

```sql
gallery_items
- id uuid PK
- invitation_id uuid FK invitations(id) ON DELETE CASCADE
- image_path text NOT NULL
- caption text
- alt_text text
- sort_order integer DEFAULT 0
- created_at timestamptz
```

Initial Rayhana & Febri target:

```text
8 photos
```

Do not enforce a hard database maximum of 8.

---

### gift_accounts

```sql
gift_accounts
- id uuid PK
- invitation_id uuid FK invitations(id) ON DELETE CASCADE
- provider_type text NOT NULL DEFAULT 'bank'
- provider_name text NOT NULL
- account_number text NOT NULL
- account_name text NOT NULL
- logo_path text
- sort_order integer DEFAULT 0
- created_at timestamptz
- updated_at timestamptz
```

Pilot uses bank accounts only.

---

### guests

```sql
guests
- id uuid PK
- invitation_id uuid FK invitations(id) ON DELETE CASCADE
- display_name text NOT NULL
- token text UNIQUE NOT NULL
- notes text
- created_at timestamptz
- updated_at timestamptz
```

Example:

```text
display_name: Bapak Ahmad & Keluarga
token: securely-generated-random-value
```

Public URL:

```text
/rayhana-febri?guest=<token>
```

Do not use guessable sequential tokens.

---

### rsvps

```sql
rsvps
- id uuid PK
- invitation_id uuid FK invitations(id) ON DELETE CASCADE
- guest_id uuid FK guests(id) ON DELETE SET NULL
- guest_name text
- attendance text NOT NULL
- created_at timestamptz
- updated_at timestamptz
```

Allowed MVP values:

```text
attending
not_attending
```

A unique rule may later be added depending on whether each guest link should have only one active RSVP.

For MVP, server logic should avoid accidental duplicate spam.

---

### wishes

```sql
wishes
- id uuid PK
- invitation_id uuid FK invitations(id) ON DELETE CASCADE
- guest_id uuid FK guests(id) ON DELETE SET NULL
- guest_name text NOT NULL
- message text NOT NULL
- is_visible boolean NOT NULL DEFAULT true
- created_at timestamptz
- updated_at timestamptz
```

Public page only fetches:

```text
is_visible = true
```

Admin can:

- hide;
- show;
- delete.

---

### analytics_events

Keep analytics minimal.

```sql
analytics_events
- id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY
- invitation_id uuid FK invitations(id) ON DELETE CASCADE
- event_type text NOT NULL
- session_id text
- guest_id uuid FK guests(id) ON DELETE SET NULL
- metadata jsonb DEFAULT '{}'
- created_at timestamptz
```

MVP event examples:

```text
invitation_open
cover_opened
rsvp_submitted
wish_submitted
```

Do not build a full analytics warehouse.

---

## 4. Invitation Settings JSON

Example:

```json
{
  "features": {
    "music": true,
    "countdown": true,
    "maps": true,
    "story": true,
    "gallery": true,
    "livestream": false,
    "rsvp": true,
    "wishes": true,
    "gift": true,
    "guestPersonalization": true
  },
  "music": {
    "autoplayAfterOpen": true,
    "loop": true
  },
  "gallery": {
    "initialDisplayLimit": 8
  },
  "expiration": {
    "monthsAfterPublish": 3
  }
}
```

Optional profile presentation metadata also uses this existing JSON column:

```json
{
  "personSocials": {
    "<invitation_person_uuid>": {
      "instagram": "https://www.instagram.com/<username>/"
    }
  }
}
```

Instagram is optional and edited per saved person in the admin People page.
An empty value hides the public link. The normalized theme receives this metadata
through `theme.settings`; no schema migration or person-table column is required.
Admin saves verify the person belongs to the invitation and preserve unrelated settings.

Settings are for flexible configuration.

Do not put core searchable relational data into JSON merely to avoid schema design.

---

## 5. Indexes

Recommended indexes:

```sql
CREATE INDEX invitations_status_idx
ON invitations(status);

CREATE INDEX invitations_theme_id_idx
ON invitations(theme_id);

CREATE INDEX invitation_people_invitation_id_idx
ON invitation_people(invitation_id);

CREATE INDEX invitation_events_invitation_id_idx
ON invitation_events(invitation_id);

CREATE INDEX invitation_stories_invitation_id_idx
ON invitation_stories(invitation_id);

CREATE INDEX gallery_items_invitation_id_idx
ON gallery_items(invitation_id);

CREATE INDEX gift_accounts_invitation_id_idx
ON gift_accounts(invitation_id);

CREATE INDEX guests_invitation_id_idx
ON guests(invitation_id);

CREATE INDEX rsvps_invitation_id_idx
ON rsvps(invitation_id);

CREATE INDEX wishes_invitation_visible_idx
ON wishes(invitation_id, is_visible);

CREATE INDEX analytics_events_invitation_created_idx
ON analytics_events(invitation_id, created_at);
```

The unique constraints on `invitations.slug`, `themes.slug`, and `guests.token` create useful indexes automatically.

---

## 6. RLS Strategy

Enable RLS on application tables.

### Public reads

Public users may read only data required for published, non-expired invitations.

Where complex joins make direct public RLS cumbersome, prefer secure server-side queries using appropriately scoped server credentials rather than exposing unrestricted table access.

### Public writes

Do not allow unrestricted anonymous insert policies directly from browser if avoidable.

Preferred:

```text
Browser
→ protected server endpoint/action
→ Turnstile validation
→ Zod validation
→ controlled insert
```

### Admin

Authenticated admins can manage invitations.

For MVP with one admin, policies can be simple but must still require authenticated identity.

---

## 7. Pilot Seed Data

Known values:

```text
Invitation:
  type: wedding
  title: The Wedding of Rayhana & Febri
  slug: rayhana-febri
  status: draft
  event_date: 2026-10-20
  venue_summary: Puri Nirwaran Residence
  theme: nusantara-ivory

People:
  bride: Rayhana
  groom: Febri

Settings:
  music: true
  countdown: true
  maps: true
  story: true
  gallery: true
  livestream: false
  rsvp: true
  wishes: true
  gift: true
  guestPersonalization: true
```

Unknown values remain NULL until supplied.

---

## 8. Data Integrity Rules

- Invitation slug must be unique.
- Theme slug must be unique.
- Guest token must be unique.
- Gallery sort order should be stable.
- Event records belong to one invitation.
- People records belong to one invitation.
- Child records should cascade on invitation deletion unless historical retention is introduced later.
- Gift account number is stored as text, never numeric.
- Phone-like, bank-like, and identifier fields should usually be text to preserve leading zeros.
