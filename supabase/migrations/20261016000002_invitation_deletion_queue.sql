-- A database deletion and its Storage cleanup job must be committed together.
-- The job survives the invitation FK cascades and is removed only after every
-- object under the invitation's Storage prefix has been removed.
create table public.invitation_deletion_jobs (
  invitation_id uuid primary key,
  slug text not null,
  created_at timestamptz not null default now(),
  last_error text
);

alter table public.invitation_deletion_jobs enable row level security;
grant select on public.invitation_deletion_jobs to authenticated;
revoke all on public.invitation_deletion_jobs from anon;

create policy "invitation_deletion_jobs_admin_select"
  on public.invitation_deletion_jobs for select
  to authenticated
  using (exists (select 1 from public.profiles where id = (select auth.uid())));

create or replace function public.queue_invitation_deletion(
  p_invitation_id uuid,
  p_confirmation_slug text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  target record;
begin
  if (select auth.uid()) is null or not exists (
    select 1 from public.profiles where id = (select auth.uid())
  ) then
    raise exception 'Akses admin diperlukan.';
  end if;

  select slug, status, is_demo into target
  from public.invitations
  where id = p_invitation_id
  for update;

  if not found then
    raise exception 'Undangan tidak ditemukan.';
  end if;
  if target.is_demo then
    raise exception 'Undangan demo tidak dapat dihapus dari sini.';
  end if;
  if target.status = 'published' then
    raise exception 'Tarik undangan dari publik sebelum menghapusnya.';
  end if;
  if target.slug is distinct from p_confirmation_slug then
    raise exception 'Konfirmasi slug tidak cocok.';
  end if;

  insert into public.invitation_deletion_jobs (invitation_id, slug)
  values (p_invitation_id, target.slug);

  delete from public.invitations where id = p_invitation_id;
  return target.slug;
end;
$$;

revoke all on function public.queue_invitation_deletion(uuid, text) from public, anon;
grant execute on function public.queue_invitation_deletion(uuid, text) to authenticated;
