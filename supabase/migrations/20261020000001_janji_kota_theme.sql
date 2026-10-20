-- Janji Kota: urban documentary wedding invitation.
-- Apply only after application support and screenshots are deployed.
-- Rollback by setting is_active/is_listed false for this slug; preserve its ID.
insert into public.themes (
  name, slug, category, description, is_active,
  tagline, event_types, screenshot_paths, is_listed, sort_order
)
values (
  'Janji Kota',
  'janji-kota',
  'wedding',
  E'Kisah dua orang di tengah kota: foto candid, garis arsitektur, dan cahaya lampu yang hangat. Nama dan momen pribadi menjadi pusat undangan, sementara rincian acara tetap terang dan mudah dibaca.\n\nCocok untuk pasangan yang ingin pernikahan modern dan personal.',
  true,
  'Di tengah kota, kita bertemu.',
  array['wedding', 'engagement', 'birthday', 'aqiqah', 'graduation', 'corporate']::text[],
  array['/demo/janji-kota/screen-1.jpg', '/demo/janji-kota/screen-2.jpg', '/demo/janji-kota/screen-3.jpg']::text[],
  true,
  7
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
