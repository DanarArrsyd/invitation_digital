-- Rona Cetak: contemporary two-ink printed invitation.
-- Apply after the application code and static demo screenshots are deployed.
-- Rollback: update public.themes set is_listed = false, is_active = false
-- where slug = 'rona-cetak'; retain rows already referenced by invitations.
insert into public.themes (
  name, slug, category, description, is_active,
  tagline, event_types, screenshot_paths, is_listed, sort_order
)
values (
  'Rona Cetak',
  'rona-cetak',
  'wedding',
  E'Undangan seperti rangkaian kartu cetak kontemporer: tipografi tegas, kertas hangat, tinta raspberry dan aksen koral. Detail acara terbaca seperti program yang dibuat khusus untuk para tamu.\n\nCocok untuk pernikahan modern yang hangat dan ekspresif.',
  true,
  'Kisah berdua dalam tinta dan kertas.',
  array['wedding', 'engagement', 'birthday', 'aqiqah', 'graduation', 'corporate']::text[],
  array['/demo/rona-cetak/screen-1.jpg', '/demo/rona-cetak/screen-2.jpg', '/demo/rona-cetak/screen-3.jpg']::text[],
  true,
  6
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
