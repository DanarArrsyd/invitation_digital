-- Benang Sriwijaya: woven editorial wedding invitation.
-- Apply only after application support and screenshots are deployed.
-- Rollback by setting is_active/is_listed false for this slug; preserve its ID.
insert into public.themes (
  name, slug, category, description, is_active,
  tagline, event_types, screenshot_paths, is_listed, sort_order
)
values (
  'Benang Sriwijaya',
  'benang-sriwijaya',
  'wedding',
  E'Terinspirasi dari ritme tenun songket Palembang: helai garis, ruang foto yang lapang, dan kilau emas secukupnya. Sebuah undangan yang hangat dan anggun.\n\nCocok untuk pasangan yang ingin pernikahan elegan dengan sentuhan Indonesia.',
  true,
  'Dua kisah, satu helai janji.',
  array['wedding', 'engagement', 'birthday', 'aqiqah', 'graduation', 'corporate']::text[],
  array['/demo/benang-sriwijaya/screen-1.jpg', '/demo/benang-sriwijaya/screen-2.jpg', '/demo/benang-sriwijaya/screen-3.jpg']::text[],
  true,
  8
)
on conflict (slug) do update
set name = excluded.name,
    category = excluded.category,
    description = excluded.description,
    tagline = excluded.tagline,
    event_types = excluded.event_types,
    screenshot_paths = excluded.screenshot_paths,
    is_active = true,
    is_listed = excluded.is_listed,
    sort_order = excluded.sort_order,
    updated_at = now();
