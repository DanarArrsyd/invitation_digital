-- Kelir Kencana: wayang kulit theme ("Pagelaran Semalam Suntuk").
-- Spec: docs/superpowers/specs/2026-10-05-kelir-kencana-theme-design.md
--
-- Rollout: idempotent upsert of the catalogue row. The theme code is
-- registered in src/themes/registry.ts; apply this after that code is live.
-- Rollback: `update public.themes set is_listed = false, is_active = false
-- where slug = 'kelir-kencana';` (keep the row if any invitation uses it).
insert into public.themes (
  name, slug, category, description, is_active,
  tagline, event_types, screenshot_paths, is_listed, sort_order
)
values (
  'Kelir Kencana',
  'kelir-kencana',
  'wedding',
  E'Pagelaran wayang kulit di balik kelir yang disinari blencong. Gunungan dicabut saat undangan dibuka, tokoh wayang mendampingi mempelai, dan tancep kayon menutup acara.\n\nCocok untuk pernikahan adat Jawa, tasyakuran, dan acara keluarga yang ingin bernuansa budaya.',
  true,
  'Pagelaran wayang di balik kelir emas.',
  array['wedding', 'engagement', 'aqiqah', 'birthday', 'graduation']::text[],
  array['/demo/kelir-kencana/screen-1.jpg', '/demo/kelir-kencana/screen-2.jpg', '/demo/kelir-kencana/screen-3.jpg']::text[],
  true,
  5
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
