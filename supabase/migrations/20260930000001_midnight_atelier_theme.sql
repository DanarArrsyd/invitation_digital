insert into public.themes (name, slug, category, description, is_active)
values (
  'Midnight Atelier',
  'midnight-atelier',
  'wedding',
  'Dark cinematic editorial wedding invitation.',
  true
)
on conflict (slug) do update
set name = excluded.name,
    category = excluded.category,
    description = excluded.description,
    is_active = true,
    updated_at = now();
