create table public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations (id) on delete cascade,
  image_path text not null,
  caption text,
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index gallery_items_invitation_id_idx on public.gallery_items (invitation_id);
