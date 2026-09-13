create table public.analytics_events (
  id bigint generated always as identity primary key,
  invitation_id uuid not null references public.invitations (id) on delete cascade,
  event_type text not null,
  session_id text,
  guest_id uuid references public.guests (id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index analytics_events_invitation_created_idx
  on public.analytics_events (invitation_id, created_at);
