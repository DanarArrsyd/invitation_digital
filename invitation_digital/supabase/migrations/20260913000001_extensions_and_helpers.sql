-- Extensions
create extension if not exists pgcrypto with schema extensions;

-- Shared trigger to keep updated_at current on row updates.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
