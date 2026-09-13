create table public.invitation_events (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations (id) on delete cascade,
  event_type text,
  title text not null,
  event_date date not null,
  start_time time,
  end_time time,
  venue_name text,
  address text,
  maps_url text,
  livestream_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index invitation_events_invitation_id_idx on public.invitation_events (invitation_id);

create trigger set_invitation_events_updated_at
  before update on public.invitation_events
  for each row execute function public.set_updated_at();
