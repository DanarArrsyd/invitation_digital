-- Address Supabase security advisors: pin search_path, and stop the
-- SECURITY DEFINER trigger function from being callable as a public RPC.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from anon, authenticated;
