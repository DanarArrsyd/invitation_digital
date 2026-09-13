create table public.wishes (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations (id) on delete cascade,
  guest_id uuid references public.guests (id) on delete set null,
  guest_name text not null,
  message text not null,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index wishes_invitation_visible_idx on public.wishes (invitation_id, is_visible);

create trigger set_wishes_updated_at
  before update on public.wishes
  for each row execute function public.set_updated_at();
