-- يضمن وجود FK `user_profiles.role_id` → `public.roles(id)` باسم متوقّع لـ PostgREST
-- (يصلح PGRST200: Could not find a relationship between 'user_profiles' and 'roles')
-- نفّذ بعد وجود الجدولين `user_profiles` و `roles`. لا يكرّر القيد إن وُجد بنفس الاسم.

do $$
begin
  if not exists (
    select 1
    from pg_constraint c
    join pg_class t on c.conrelid = t.oid
    join pg_namespace n on n.oid = t.relnamespace
    where n.nspname = 'public'
      and t.relname = 'user_profiles'
      and c.conname = 'user_profiles_role_id_fkey'
  ) then
    alter table public.user_profiles
      add constraint user_profiles_role_id_fkey
      foreign key (role_id) references public.roles (id) on delete set null;
  end if;
end $$;
