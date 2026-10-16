-- Keep identifiable visit events for 90 complete UTC days. Older events are
-- folded into daily counts before removal; invitation content is untouched.
create index if not exists analytics_events_created_at_idx
  on public.analytics_events (created_at);

create table public.analytics_daily (
  invitation_id uuid not null references public.invitations (id) on delete cascade,
  day date not null,
  total_opens bigint not null default 0 check (total_opens >= 0),
  unique_daily_visitors bigint not null default 0 check (unique_daily_visitors >= 0),
  cover_opened bigint not null default 0 check (cover_opened >= 0),
  primary key (invitation_id, day)
);

alter table public.analytics_daily enable row level security;
grant select on public.analytics_daily to authenticated;
revoke all on public.analytics_daily from anon;

create policy "analytics_daily_admin_select"
  on public.analytics_daily for select
  to authenticated
  using (true);

create or replace function public.archive_old_analytics_events()
returns bigint
language plpgsql
security definer
set search_path = ''
set timezone = 'UTC'
as $$
declare
  archived_rows bigint;
begin
  with retired as (
    delete from public.analytics_events
    where created_at < (current_date - 90)
    returning invitation_id, event_type, session_id,
      (created_at at time zone 'UTC')::date as day
  ), daily as (
    select invitation_id, day,
      count(*) filter (where event_type = 'invitation_open') as total_opens,
      count(distinct session_id) filter (where event_type = 'invitation_open') as unique_daily_visitors,
      count(*) filter (where event_type = 'cover_opened') as cover_opened
    from retired
    group by invitation_id, day
  ), saved as (
    insert into public.analytics_daily
      (invitation_id, day, total_opens, unique_daily_visitors, cover_opened)
    select invitation_id, day, total_opens, unique_daily_visitors, cover_opened
    from daily
    on conflict (invitation_id, day) do update set
      total_opens = public.analytics_daily.total_opens + excluded.total_opens,
      unique_daily_visitors = public.analytics_daily.unique_daily_visitors + excluded.unique_daily_visitors,
      cover_opened = public.analytics_daily.cover_opened + excluded.cover_opened
    returning 1
  )
  select count(*) into archived_rows from retired;

  return archived_rows;
end;
$$;

revoke all on function public.archive_old_analytics_events() from public, anon, authenticated;

create or replace function public.get_invitation_analytics_summary(p_invitation_id uuid)
returns table (total_opens bigint, unique_daily_visitors bigint, cover_opened bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  with archived as (
    select coalesce(sum(d.total_opens), 0) as opens,
      coalesce(sum(d.unique_daily_visitors), 0) as visitors,
      coalesce(sum(d.cover_opened), 0) as covers
    from public.analytics_daily d
    where d.invitation_id = p_invitation_id
  ), recent_days as (
    select (e.created_at at time zone 'UTC')::date as day,
      count(*) filter (where e.event_type = 'invitation_open') as opens,
      count(distinct e.session_id) filter (where e.event_type = 'invitation_open') as visitors,
      count(*) filter (where e.event_type = 'cover_opened') as covers
    from public.analytics_events e
    where e.invitation_id = p_invitation_id
    group by (e.created_at at time zone 'UTC')::date
  ), recent as (
    select coalesce(sum(opens), 0) as opens,
      coalesce(sum(visitors), 0) as visitors,
      coalesce(sum(covers), 0) as covers
    from recent_days
  )
  select archived.opens + recent.opens,
    archived.visitors + recent.visitors,
    archived.covers + recent.covers
  from archived cross join recent;
$$;

revoke all on function public.get_invitation_analytics_summary(uuid) from public, anon;
grant execute on function public.get_invitation_analytics_summary(uuid) to authenticated;

create extension if not exists pg_cron;
select cron.schedule(
  'archive-analytics-events-daily',
  '15 2 * * *',
  'select public.archive_old_analytics_events()'
);
