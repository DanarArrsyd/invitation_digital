-- Temuraya marketing site: template catalogue, demo invitations, package
-- prices and contact settings. See
-- docs/superpowers/specs/2026-10-05-temuraya-landing-design.md section 7.

-- Demo invitations are edited like any invitation but are only reachable
-- through /demo/[themeSlug]; they never expire and never accept responses.
alter table public.invitations
  add column is_demo boolean not null default false;

create index invitations_is_demo_idx on public.invitations (is_demo) where is_demo;

-- One demo per theme; /demo/[themeSlug] renders it. Kept on invitations
-- (not as themes.demo_invitation_id) so invitations and themes keep a single
-- relationship and PostgREST embeds like theme:themes(*) stay unambiguous.
create unique index invitations_one_demo_per_theme_idx
  on public.invitations (theme_id) where is_demo;

-- Catalogue fields. is_listed (marketing site) is separate from is_active
-- (admin theme picker).
alter table public.themes
  add column tagline text,
  add column event_types text[] not null default '{wedding}',
  add column screenshot_paths text[] not null default '{}',
  add column is_listed boolean not null default false,
  add column sort_order integer not null default 0;

alter table public.themes
  add constraint themes_event_types_valid check (
    event_types <@ array['wedding', 'birthday', 'engagement', 'aqiqah', 'graduation', 'corporate']::text[]
  );

-- Commercial fields per package. Entitlements stay in code
-- (src/lib/packages/entitlements.ts); a null price shows "Tanya harga".
create table public.package_offers (
  package_key text primary key check (package_key in ('intimate', 'signature', 'grand')),
  price_idr integer check (price_idr >= 0),
  price_note text,
  is_visible boolean not null default true,
  updated_at timestamptz not null default now()
);

create trigger set_package_offers_updated_at
  before update on public.package_offers
  for each row execute function public.set_updated_at();

insert into public.package_offers (package_key)
values ('intimate'), ('signature'), ('grand')
on conflict (package_key) do nothing;

-- Single-row site settings.
create table public.site_settings (
  id boolean primary key default true check (id),
  whatsapp_number text check (whatsapp_number ~ '^[1-9][0-9]{7,14}$'),
  whatsapp_message text not null default 'Halo Temuraya, saya mau pesan template {template} paket {paket} untuk {acara}.',
  instagram_url text,
  updated_at timestamptz not null default now()
);

create trigger set_site_settings_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

insert into public.site_settings (id) values (true) on conflict (id) do nothing;

-- RLS: the marketing site reads these anonymously; only signed-in admins write.
alter table public.package_offers enable row level security;
alter table public.site_settings enable row level security;

create policy "package_offers_public_select"
  on public.package_offers for select
  to anon, authenticated
  using (true);

create policy "package_offers_admin_all"
  on public.package_offers for all
  to authenticated
  using (true)
  with check (true);

create policy "site_settings_public_select"
  on public.site_settings for select
  to anon, authenticated
  using (true);

create policy "site_settings_admin_all"
  on public.site_settings for all
  to authenticated
  using (true)
  with check (true);

create policy "themes_public_select_listed"
  on public.themes for select
  to anon, authenticated
  using (is_listed = true);
