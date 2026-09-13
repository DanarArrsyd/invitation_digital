-- account_number/account_name stored as text to preserve leading zeros — see DATABASE.md section 8.
create table public.gift_accounts (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations (id) on delete cascade,
  provider_type text not null default 'bank',
  provider_name text not null,
  account_number text not null,
  account_name text not null,
  logo_path text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index gift_accounts_invitation_id_idx on public.gift_accounts (invitation_id);

create trigger set_gift_accounts_updated_at
  before update on public.gift_accounts
  for each row execute function public.set_updated_at();
