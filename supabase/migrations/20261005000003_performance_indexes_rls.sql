-- Performance pass (Supabase advisors, 2026-10-05). Non-destructive.

-- 1. Cover the foreign keys the advisor flagged, so joins and cascades on
--    guest deletes don't scan whole tables.
create index if not exists analytics_events_guest_id_idx on public.analytics_events (guest_id);
create index if not exists invitations_created_by_idx on public.invitations (created_by);
create index if not exists rsvps_guest_id_idx on public.rsvps (guest_id);
create index if not exists wishes_guest_id_idx on public.wishes (guest_id);

-- 2. Evaluate auth.uid() once per statement instead of once per row.
alter policy profiles_select_own on public.profiles
  using ((select auth.uid()) = id);
alter policy profiles_update_own on public.profiles
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- 3. Signed-in users are admins and already read everything through the
--    *_admin_all policies, so the public read policies only need to apply to
--    anon. Postgres then stops evaluating the published/expiry EXISTS check
--    on every row an admin reads.
alter policy invitations_public_select_published on public.invitations to anon;
alter policy invitation_people_public_select on public.invitation_people to anon;
alter policy invitation_events_public_select on public.invitation_events to anon;
alter policy invitation_stories_public_select on public.invitation_stories to anon;
alter policy gallery_items_public_select on public.gallery_items to anon;
alter policy gift_accounts_public_select on public.gift_accounts to anon;
alter policy wishes_public_select_visible on public.wishes to anon;
alter policy package_offers_public_select on public.package_offers to anon;
alter policy site_settings_public_select on public.site_settings to anon;
alter policy themes_public_select_active on public.themes to anon;
alter policy themes_public_select_listed on public.themes to anon;
