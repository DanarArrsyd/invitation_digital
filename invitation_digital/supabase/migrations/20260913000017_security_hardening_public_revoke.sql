-- PUBLIC still had implicit EXECUTE from the default grant; revoke it too.
revoke execute on function public.handle_new_user() from public;
