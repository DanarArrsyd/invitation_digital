insert into public.themes (name, slug, category, description, is_active)
values (
  'Cobalt Riviera',
  'cobalt-riviera',
  'wedding',
  'Sunlit destination editorial wedding invitation.',
  true
)
on conflict (slug) do update
set name = excluded.name,
    category = excluded.category,
    description = excluded.description,
    is_active = true,
    updated_at = now();
