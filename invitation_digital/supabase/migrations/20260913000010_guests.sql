create table public.guests (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations (id) on delete cascade,
  display_name text not null,
  token text not null unique,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index guests_invitation_id_idx on public.guests (invitation_id);

create trigger set_guests_updated_at
  before update on public.guests
  for each row execute function public.set_updated_at();
