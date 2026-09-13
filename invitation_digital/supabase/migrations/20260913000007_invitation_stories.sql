create table public.invitation_stories (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations (id) on delete cascade,
  title text not null,
  story_date date,
  year_label text,
  description text,
  image_path text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index invitation_stories_invitation_id_idx on public.invitation_stories (invitation_id);

create trigger set_invitation_stories_updated_at
  before update on public.invitation_stories
  for each row execute function public.set_updated_at();
