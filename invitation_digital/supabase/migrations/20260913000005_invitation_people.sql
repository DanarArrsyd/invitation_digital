-- General-purpose people (bride/groom today; celebrant/host/speaker for future event types).
create table public.invitation_people (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations (id) on delete cascade,
  role text not null,
  full_name text not null,
  nickname text,
  father_name text,
  mother_name text,
  photo_path text,
  bio text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index invitation_people_invitation_id_idx on public.invitation_people (invitation_id);

create trigger set_invitation_people_updated_at
  before update on public.invitation_people
  for each row execute function public.set_updated_at();
