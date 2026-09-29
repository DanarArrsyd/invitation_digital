insert into public.themes (name, slug, category, description, is_active)
values (
  'Terra Botanica',
  'terra-botanica',
  'wedding',
  'Organic editorial garden wedding theme.',
  true
)
on conflict (slug) do update
set name = excluded.name,
    category = excluded.category,
    description = excluded.description,
    is_active = true,
    updated_at = now();
