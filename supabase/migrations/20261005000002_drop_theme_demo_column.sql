-- Production briefly had themes.demo_invitation_id (with a foreign key back to
-- invitations). The foreign key made embeds like invitations -> theme:themes(*)
-- ambiguous in PostgREST, so it was dropped on 2026-10-05 and demos moved to
-- invitations.is_demo. This removes the leftover, unused column.
alter table public.themes drop column if exists demo_invitation_id;
