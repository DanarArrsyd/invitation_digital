import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { PGlite } from "@electric-sql/pglite";

const catalogue = readFileSync(
  fileURLToPath(new URL("../supabase/migrations/20261020000001_janji_kota_theme.sql", import.meta.url)),
  "utf8",
);
const migration = readFileSync(
  fileURLToPath(new URL("../supabase/migrations/20261020000002_janji_kota_demo.sql", import.meta.url)),
  "utf8",
);

test("Janji Kota production demo migration preserves every existing demo", () => {
  assert.match(migration, /if not exists \(select 1 from public\.invitations where slug = 'demo-janji-kota'\)/i);
  assert.match(migration, /from public\.themes t where t\.slug = 'janji-kota'/i);
  assert.doesNotMatch(migration, /^\s*(?:delete|truncate|update)\s+(?:from\s+)?public\.invitations\b/im);
  assert.doesNotMatch(migration, /where\s+is_demo\b/i);
});

test("Janji Kota catalogue and demo migrations rerun without touching other demos", async (t) => {
  const db = new PGlite();
  t.after(() => db.close());
  await db.exec(`
    create table public.themes (
      id uuid primary key default gen_random_uuid(),
      name text, slug text unique, category text, description text, is_active boolean,
      tagline text, event_types text[], screenshot_paths text[], is_listed boolean,
      sort_order integer, updated_at timestamptz default now()
    );
    create table public.invitations (
      id uuid primary key default gen_random_uuid(),
      type text, title text, slug text unique, theme_id uuid references public.themes(id),
      status text, event_date date, venue_summary text, package_key text, is_demo boolean,
      published_at timestamptz, expires_at timestamptz, cover_image_path text,
      opening_quote text, opening_message text, closing_message text, settings jsonb
    );
    create table public.invitation_people (
      invitation_id uuid references public.invitations(id), role text, full_name text,
      nickname text, father_name text, mother_name text, photo_path text, bio text, sort_order integer
    );
    create table public.invitation_events (
      invitation_id uuid references public.invitations(id), event_type text, title text,
      event_date date, start_time text, end_time text, venue_name text, address text,
      maps_url text, livestream_url text, sort_order integer
    );
    create table public.invitation_stories (
      invitation_id uuid references public.invitations(id), title text, year_label text,
      description text, image_path text, sort_order integer
    );
    create table public.gallery_items (
      invitation_id uuid references public.invitations(id), image_path text,
      alt_text text, aspect_ratio text, sort_order integer
    );
    create table public.gift_accounts (
      invitation_id uuid references public.invitations(id), provider_type text,
      provider_name text, account_number text, account_name text, sort_order integer
    );
    create table public.wishes (
      invitation_id uuid references public.invitations(id), guest_name text,
      message text, is_visible boolean, created_at timestamptz
    );
    insert into public.invitations (type, title, slug, status, is_demo)
    values ('wedding', 'Existing demo', 'demo-existing', 'published', true);
  `);

  await db.exec(catalogue);
  await db.exec(migration);
  await db.exec(catalogue);
  await db.exec(migration);

  const rows = await db.query(`
    select slug, title from public.invitations where is_demo order by slug
  `);
  assert.deepEqual(rows.rows, [
    { slug: "demo-existing", title: "Existing demo" },
    { slug: "demo-janji-kota", title: "Pernikahan Lani & Arga" },
  ]);
  const counts = await db.query(`
    select
      (select count(*)::int from public.themes where slug = 'janji-kota') as themes,
      (select count(*)::int from public.invitation_people p join public.invitations i on i.id = p.invitation_id where i.slug = 'demo-janji-kota') as people,
      (select count(*)::int from public.gallery_items g join public.invitations i on i.id = g.invitation_id where i.slug = 'demo-janji-kota') as gallery
  `);
  assert.deepEqual(counts.rows[0], { themes: 1, people: 2, gallery: 12 });
});
