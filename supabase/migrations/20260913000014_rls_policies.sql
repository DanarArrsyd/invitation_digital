-- RLS strategy per DATABASE.md section 6 / ARCHITECTURE.md section 15.
--
-- Single-admin MVP: any authenticated user is treated as the platform admin
-- (no multi-role system). Public (anon) access is read-only, and only for
-- data belonging to a published, non-expired invitation.
--
-- guests, rsvps and analytics_events are NOT exposed to anon at all — guest
-- token resolution and public RSVP/wish/analytics writes happen through
-- server code using the service-role client (see lib/supabase/admin.ts),
-- validated with Zod + Turnstile before any insert. This avoids both an
-- unrestricted anonymous insert policy and a full-table anonymous read of
-- guest data.

alter table public.profiles enable row level security;
alter table public.themes enable row level security;
alter table public.invitations enable row level security;
alter table public.invitation_people enable row level security;
alter table public.invitation_events enable row level security;
alter table public.invitation_stories enable row level security;
alter table public.gallery_items enable row level security;
alter table public.gift_accounts enable row level security;
alter table public.guests enable row level security;
alter table public.rsvps enable row level security;
alter table public.wishes enable row level security;
alter table public.analytics_events enable row level security;

-- profiles: admin manages only their own row.
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- themes: public can browse active themes; admin manages all.
create policy "themes_public_select_active"
  on public.themes for select
  to anon, authenticated
  using (is_active = true);

create policy "themes_admin_all"
  on public.themes for all
  to authenticated
  using (true)
  with check (true);

-- invitations: public can read only published, non-expired invitations.
create policy "invitations_public_select_published"
  on public.invitations for select
  to anon, authenticated
  using (
    status = 'published'
    and (expires_at is null or expires_at > now())
  );

create policy "invitations_admin_all"
  on public.invitations for all
  to authenticated
  using (true)
  with check (true);

-- Child content tables: public read only through a published, non-expired
-- parent invitation; admin has full access.
create policy "invitation_people_public_select"
  on public.invitation_people for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.invitations i
      where i.id = invitation_people.invitation_id
        and i.status = 'published'
        and (i.expires_at is null or i.expires_at > now())
    )
  );

create policy "invitation_people_admin_all"
  on public.invitation_people for all
  to authenticated
  using (true)
  with check (true);

create policy "invitation_events_public_select"
  on public.invitation_events for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.invitations i
      where i.id = invitation_events.invitation_id
        and i.status = 'published'
        and (i.expires_at is null or i.expires_at > now())
    )
  );

create policy "invitation_events_admin_all"
  on public.invitation_events for all
  to authenticated
  using (true)
  with check (true);

create policy "invitation_stories_public_select"
  on public.invitation_stories for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.invitations i
      where i.id = invitation_stories.invitation_id
        and i.status = 'published'
        and (i.expires_at is null or i.expires_at > now())
    )
  );

create policy "invitation_stories_admin_all"
  on public.invitation_stories for all
  to authenticated
  using (true)
  with check (true);

create policy "gallery_items_public_select"
  on public.gallery_items for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.invitations i
      where i.id = gallery_items.invitation_id
        and i.status = 'published'
        and (i.expires_at is null or i.expires_at > now())
    )
  );

create policy "gallery_items_admin_all"
  on public.gallery_items for all
  to authenticated
  using (true)
  with check (true);

create policy "gift_accounts_public_select"
  on public.gift_accounts for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.invitations i
      where i.id = gift_accounts.invitation_id
        and i.status = 'published'
        and (i.expires_at is null or i.expires_at > now())
    )
  );

create policy "gift_accounts_admin_all"
  on public.gift_accounts for all
  to authenticated
  using (true)
  with check (true);

-- wishes: public may read only visible wishes of a published invitation.
-- No public insert policy — inserts happen server-side (service role).
create policy "wishes_public_select_visible"
  on public.wishes for select
  to anon, authenticated
  using (
    is_visible = true
    and exists (
      select 1 from public.invitations i
      where i.id = wishes.invitation_id
        and i.status = 'published'
        and (i.expires_at is null or i.expires_at > now())
    )
  );

create policy "wishes_admin_all"
  on public.wishes for all
  to authenticated
  using (true)
  with check (true);

-- guests: no anon policy at all (default deny). Admin manages guest lists;
-- public token resolution goes through the service-role server client.
create policy "guests_admin_all"
  on public.guests for all
  to authenticated
  using (true)
  with check (true);

-- rsvps: no anon policy (writes happen server-side). Admin reads/moderates.
create policy "rsvps_admin_all"
  on public.rsvps for all
  to authenticated
  using (true)
  with check (true);

-- analytics_events: no anon policy (writes happen server-side). Admin reads only.
create policy "analytics_events_admin_select"
  on public.analytics_events for select
  to authenticated
  using (true);
