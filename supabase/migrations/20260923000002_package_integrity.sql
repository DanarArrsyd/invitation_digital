-- Package changes and conflicting child writes share the invitation row lock.
-- This is additive: existing rows and their settings remain untouched.

create or replace function public.prevent_invitation_event_reparent()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.invitation_id is distinct from old.invitation_id then
    raise exception using errcode = 'P0001',
      message = 'Acara tidak dapat dipindahkan ke undangan lain.';
  end if;
  return new;
end;
$$;

drop trigger if exists prevent_invitation_event_reparent on public.invitation_events;
create trigger prevent_invitation_event_reparent
  before update of invitation_id on public.invitation_events
  for each row execute function public.prevent_invitation_event_reparent();

create or replace function public.enforce_invitation_gallery_capacity()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_package text;
  gallery_limit integer;
  gallery_count bigint;
begin
  if tg_op = 'UPDATE' then
    if new.invitation_id is distinct from old.invitation_id then
      raise exception using errcode = 'P0001',
        message = 'Foto galeri tidak dapat dipindahkan ke undangan lain.';
    end if;
    return new;
  end if;

  select i.package_key into current_package
  from public.invitations i
  where i.id = new.invitation_id
  for update;
  if not found then return new; end if;

  gallery_limit := case current_package
    when 'intimate' then 8
    when 'signature' then 20
    when 'grand' then 40
  end;
  select count(*) into gallery_count
  from public.gallery_items
  where invitation_id = new.invitation_id;
  if gallery_count >= gallery_limit then
    raise exception using errcode = 'P0001',
      message = format('Paket %s mendukung maksimal %s foto galeri.', initcap(current_package), gallery_limit);
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_invitation_gallery_capacity on public.gallery_items;
create trigger enforce_invitation_gallery_capacity
  before insert or update of invitation_id on public.gallery_items
  for each row execute function public.enforce_invitation_gallery_capacity();

create or replace function public.enforce_invitation_package_integrity()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  target_rank integer;
  previous_rank integer;
  event_limit integer;
  gallery_limit integer;
  event_count bigint;
  gallery_count bigint;
  conflicts text[] := array[]::text[];
  feature_name text;
  feature_required text;
  feature_rank integer;
  package_label text := initcap(new.package_key);
  prior_socials jsonb := '{}'::jsonb;
  next_socials jsonb := coalesce(new.settings->'personSocials', '{}'::jsonb);
  prior_dress jsonb;
  next_dress jsonb := new.settings->'dressCode';
  dress_groups jsonb;
  downgrade boolean := false;
begin
  target_rank := case new.package_key when 'intimate' then 1 when 'signature' then 2 when 'grand' then 3 end;
  event_limit := case new.package_key when 'intimate' then 2 when 'signature' then 3 when 'grand' then 5 end;
  gallery_limit := case new.package_key when 'intimate' then 8 when 'signature' then 20 when 'grand' then 40 end;

  if tg_op = 'UPDATE' then
    previous_rank := case old.package_key when 'intimate' then 1 when 'signature' then 2 when 'grand' then 3 end;
    downgrade := target_rank < previous_rank;
    prior_socials := coalesce(old.settings->'personSocials', '{}'::jsonb);
    prior_dress := old.settings->'dressCode';
  end if;

  if downgrade then
    select count(*) into event_count from public.invitation_events where invitation_id = new.id;
    select count(*) into gallery_count from public.gallery_items where invitation_id = new.id;
    if event_count > event_limit then
      conflicts := array_append(conflicts, format('Paket %s mendukung maksimal %s acara.', package_label, event_limit));
    end if;
    if gallery_count > gallery_limit then
      conflicts := array_append(conflicts, format('Paket %s mendukung maksimal %s foto galeri.', package_label, gallery_limit));
    end if;
  end if;

  foreach feature_name in array array['story', 'dressCode', 'livestream', 'wishes'] loop
    feature_required := case feature_name when 'livestream' then 'Grand' else 'Signature' end;
    feature_rank := case feature_name when 'livestream' then 3 else 2 end;
    if new.settings->'features'->>feature_name = 'true'
      and target_rank < feature_rank then
      if downgrade then
        conflicts := array_append(conflicts, format('Fitur %s tidak tersedia di paket %s.', feature_name, package_label));
      else
        raise exception using errcode = 'P0001',
          message = format('Fitur %s membutuhkan paket %s.',
            case feature_name when 'story' then 'Love Story' when 'dressCode' then 'Dress Code'
              when 'wishes' then 'Wishes' else 'Livestream' end, feature_required);
      end if;
    end if;
  end loop;

  if cardinality(conflicts) > 0 then
    raise exception using errcode = 'P0001',
      message = 'Paket tidak dapat diubah karena: ' || array_to_string(conflicts, ' ');
  end if;

  -- A downgrade may retain previously saved presentation content. On Intimate,
  -- only clearing that content is allowed; adding or changing it is rejected.
  if new.package_key = 'intimate' then
    if not (next_socials <@ prior_socials) then
      raise exception using errcode = 'P0001',
        message = 'Instagram membutuhkan paket Signature.';
    end if;

    dress_groups := next_dress->'groups';
    if next_dress is distinct from prior_dress and (
      nullif(btrim(coalesce(next_dress->>'description', '')), '') is not null
      or (jsonb_typeof(dress_groups) = 'array' and jsonb_array_length(dress_groups) > 0)
    ) then
      raise exception using errcode = 'P0001',
        message = 'Dress Code membutuhkan paket Signature.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_invitation_package_integrity on public.invitations;
create trigger enforce_invitation_package_integrity
  before insert or update of package_key, settings on public.invitations
  for each row execute function public.enforce_invitation_package_integrity();

-- The public action checks entitlement before its service-role insert. This
-- lock also protects the interval between that read and the insert itself.
create or replace function public.enforce_invitation_wish_access()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  invitation_row public.invitations%rowtype;
begin
  select i.* into invitation_row
  from public.invitations i
  where i.id = new.invitation_id
  for update;
  if not found then return new; end if;

  if invitation_row.status <> 'published'
    or invitation_row.package_key = 'intimate'
    or invitation_row.settings->'features'->>'wishes' is distinct from 'true' then
    raise exception using errcode = 'P0001',
      message = 'Ucapan tidak tersedia untuk undangan ini.';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_invitation_wish_access on public.wishes;
create trigger enforce_invitation_wish_access
  before insert on public.wishes
  for each row execute function public.enforce_invitation_wish_access();
