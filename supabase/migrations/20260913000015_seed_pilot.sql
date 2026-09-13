-- Pilot seed: Rayhana & Febri / Nusantara Ivory — see DATABASE.md section 7.
-- Unknown data (full legal names, parents, times, address, love story, gift
-- account, music, livestream URL) is intentionally left NULL/unset and must
-- be filled in later through the admin UI.

insert into public.themes (name, slug, category)
values ('Nusantara Ivory', 'nusantara-ivory', 'wedding')
on conflict (slug) do nothing;

insert into public.invitations (
  type, title, slug, theme_id, status, event_date, venue_summary, settings
)
select
  'wedding',
  'The Wedding of Rayhana & Febri',
  'rayhana-febri',
  t.id,
  'draft',
  date '2026-10-20',
  'Puri Nirwaran Residence',
  jsonb_build_object(
    'features', jsonb_build_object(
      'music', true,
      'countdown', true,
      'maps', true,
      'story', true,
      'gallery', true,
      'livestream', false,
      'rsvp', true,
      'wishes', true,
      'gift', true,
      'guestPersonalization', true
    ),
    'music', jsonb_build_object('autoplayAfterOpen', true, 'loop', true),
    'gallery', jsonb_build_object('initialDisplayLimit', 8),
    'expiration', jsonb_build_object('monthsAfterPublish', 3)
  )
from public.themes t
where t.slug = 'nusantara-ivory'
on conflict (slug) do nothing;

insert into public.invitation_people (invitation_id, role, full_name, sort_order)
select i.id, 'bride', 'Rayhana', 0
from public.invitations i
where i.slug = 'rayhana-febri'
  and not exists (
    select 1 from public.invitation_people p
    where p.invitation_id = i.id and p.role = 'bride'
  );

insert into public.invitation_people (invitation_id, role, full_name, sort_order)
select i.id, 'groom', 'Febri', 1
from public.invitations i
where i.slug = 'rayhana-febri'
  and not exists (
    select 1 from public.invitation_people p
    where p.invitation_id = i.id and p.role = 'groom'
  );
