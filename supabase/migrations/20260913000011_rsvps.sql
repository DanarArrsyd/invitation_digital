create table public.rsvps (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations (id) on delete cascade,
  guest_id uuid references public.guests (id) on delete set null,
  guest_name text,
  attendance text not null check (attendance in ('attending', 'not_attending')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index rsvps_invitation_id_idx on public.rsvps (invitation_id);

create trigger set_rsvps_updated_at
  before update on public.rsvps
  for each row execute function public.set_updated_at();
