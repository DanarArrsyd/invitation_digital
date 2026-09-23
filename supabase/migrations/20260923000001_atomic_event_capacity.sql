-- Serialize inserts for the same invitation so two concurrent requests cannot
-- both consume the final event slot. Keep this SECURITY INVOKER: the existing
-- admin RLS policies still govern access to invitations and events.
create or replace function public.enforce_invitation_event_capacity()
returns trigger
language plpgsql
volatile
security invoker
set search_path = ''
as $$
declare
  package_key text;
  event_limit integer;
  package_label text;
  event_count bigint;
begin
  select i.package_key into package_key
  from public.invitations i
  where id = new.invitation_id
  for update;

  -- Let the foreign key report a missing invitation as usual.
  if not found then
    return new;
  end if;

  event_limit := case package_key
    when 'intimate' then 2
    when 'signature' then 3
    when 'grand' then 5
  end;
  package_label := initcap(package_key);

  select count(*) into event_count
  from public.invitation_events
  where invitation_id = new.invitation_id;

  if event_count >= event_limit then
    raise exception using
      errcode = 'P0001',
      message = format('Paket %s mendukung maksimal %s acara.', package_label, event_limit);
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_invitation_event_capacity on public.invitation_events;
create trigger enforce_invitation_event_capacity
  before insert on public.invitation_events
  for each row execute function public.enforce_invitation_event_capacity();
