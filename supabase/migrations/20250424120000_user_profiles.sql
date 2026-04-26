-- جدول ملفات المستخدمين (مرتبط بـ auth.users) + مهيّئ عند التسجيل
-- نفّذ من SQL Editor في Supabase أو عبر CLI بعد التحقق من وجود جدول public.roles

create table if not exists public.user_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text not null default '',
  role_id integer references public.roles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists user_profiles_role_id_idx on public.user_profiles (role_id);

comment on table public.user_profiles is 'نسخة قابلة للاستعلام من بيانات المستخدم والدور؛ تُملأ تلقائياً عند إنشاء حساب في auth.users';

-- تحديث updated_at
create or replace function public.set_user_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists user_profiles_set_updated_at on public.user_profiles;
create trigger user_profiles_set_updated_at
  before update on public.user_profiles
  for each row execute function public.set_user_profiles_updated_at();

-- مهيّئ: نسخ من raw_user_meta_data بعد إنشاء المستخدم
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  rid integer;
begin
  begin
    rid := nullif(trim(coalesce(new.raw_user_meta_data->>'role_id', '')), '')::integer;
  exception when others then
    rid := null;
  end;

  insert into public.user_profiles (id, email, full_name, role_id)
  values (
    new.id,
    new.email,
    coalesce(nullif(trim(new.raw_user_meta_data->>'fullName'), ''), ''),
    rid
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = excluded.full_name,
    role_id = coalesce(excluded.role_id, public.user_profiles.role_id);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- صفوف للمستخدمين الموجودين مسبقاً (مرة واحدة بعد إنشاء الجدول)
insert into public.user_profiles (id, email, full_name, role_id)
select
  u.id,
  u.email,
  coalesce(nullif(trim(u.raw_user_meta_data->>'fullName'), ''), ''),
  case
    when nullif(trim(u.raw_user_meta_data->>'role_id'), '') is not null
      and (u.raw_user_meta_data->>'role_id') ~ '^[0-9]+$'
    then (u.raw_user_meta_data->>'role_id')::integer
    else null
  end
from auth.users u
where not exists (select 1 from public.user_profiles p where p.id = u.id);

alter table public.user_profiles enable row level security;

-- قراءة لجميع المستخدمين المسجلين (تطبيق داخلي؛ يمكن تشديدها لاحقاً)
drop policy if exists "user_profiles_select_authenticated" on public.user_profiles;
create policy "user_profiles_select_authenticated"
  on public.user_profiles for select
  to authenticated
  using (true);

-- إدراج يدوي نادر؛ المهيّئ يعمل بصلاحية definer
drop policy if exists "user_profiles_insert_authenticated" on public.user_profiles;
create policy "user_profiles_insert_authenticated"
  on public.user_profiles for insert
  to authenticated
  with check (auth.uid() = id);

-- تحديث: مسموح لجميع المسجلين (بيئة موثوقة). للإنتاج الصارم استخدم سياسة «مدير فقط».
drop policy if exists "user_profiles_update_authenticated" on public.user_profiles;
create policy "user_profiles_update_authenticated"
  on public.user_profiles for update
  to authenticated
  using (true)
  with check (true);
