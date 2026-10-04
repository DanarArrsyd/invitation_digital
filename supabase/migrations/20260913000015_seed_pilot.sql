-- Originally seeded a sample "Rayhana & Febri" invitation. That data was a
-- demo, never a real customer, and was removed from production on 2026-10-04,
-- so this migration now only guarantees the Nusantara Ivory theme row exists.
-- Invitations are created through the admin UI.

insert into public.themes (name, slug, category)
values ('Nusantara Ivory', 'nusantara-ivory', 'wedding')
on conflict (slug) do nothing;
