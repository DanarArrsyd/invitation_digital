alter table public.invitations
  add column package_key text;

update public.invitations
set package_key = 'grand'
where package_key is null;

alter table public.invitations
  add constraint invitations_package_key_check
  check (package_key in ('intimate', 'signature', 'grand'));

alter table public.invitations
  alter column package_key set not null,
  alter column package_key set default 'intimate';
