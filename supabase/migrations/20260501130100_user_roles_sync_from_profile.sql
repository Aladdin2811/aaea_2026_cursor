-- مزامنة user_roles عند تغيير role_id في user_profiles (واجهة التطبيق الحالية)
create or replace function public.sync_user_roles_from_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.user_roles where user_id = new.id;
  if new.role_id is not null then
    insert into public.user_roles (user_id, role_id)
    values (new.id, new.role_id)
    on conflict (user_id, role_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists user_profiles_sync_user_roles on public.user_profiles;
create trigger user_profiles_sync_user_roles
  after insert or update of role_id on public.user_profiles
  for each row execute function public.sync_user_roles_from_profile();
