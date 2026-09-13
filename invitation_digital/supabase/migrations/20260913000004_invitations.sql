-- General-purpose invitation entity. Not wedding-specific — see ARCHITECTURE.md.
create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  type text not null check (
    type in ('wedding', 'birthday', 'engagement', 'aqiqah', 'graduation', 'corporate')
  ),
  title text not null,
  slug text not null unique,
  theme_id uuid not null references public.themes (id) on delete restrict,
  status text not null default 'draft' check (
    status in ('draft', 'published', 'expired', 'archived')
  ),
  event_date date,
  venue_summary text,
  opening_quote text,
  opening_message text,
  closing_message text,
  cover_image_path text,
  music_path text,
  settings jsonb not null default '{}'::jsonb,
  published_at timestamptz,
  expires_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index invitations_status_idx on public.invitations (status);
create index invitations_theme_id_idx on public.invitations (theme_id);

create trigger set_invitations_updated_at
  before update on public.invitations
  for each row execute function public.set_updated_at();
