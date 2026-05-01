-- صلاحيات على مستوى التطبيق + ربط بالأدوار + أدوار متعددة للمستخدم
-- نفّذ بعد وجود public.roles و public.user_profiles.

-- ---------------------------------------------------------------------------
-- 1) جداول
-- ---------------------------------------------------------------------------

create table if not exists public.permissions (
  id serial primary key,
  code text not null unique,
  label_ar text,
  created_at timestamptz not null default now()
);

comment on table public.permissions is 'أكواد صلاحيات ثابتة يقرأها التطبيق (عرض مسار، إجراء، إلخ)';

create table if not exists public.role_permissions (
  role_id integer not null references public.roles (id) on delete cascade,
  permission_id integer not null references public.permissions (id) on delete cascade,
  primary key (role_id, permission_id)
);

comment on table public.role_permissions is 'ربط دور بعدة صلاحيات';

create table if not exists public.user_roles (
  user_id uuid not null references public.user_profiles (id) on delete cascade,
  role_id integer not null references public.roles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, role_id)
);

create index if not exists user_roles_role_id_idx on public.user_roles (role_id);

comment on table public.user_roles is 'أدوار متعددة لكل مستخدم؛ يُكمّل أو يستبدل role_id في user_profiles حسب سياسة التطبيق';

-- ---------------------------------------------------------------------------
-- 2) ترحيل الأدوار الحالية من user_profiles.role_id
-- ---------------------------------------------------------------------------

insert into public.user_roles (user_id, role_id)
select id, role_id
from public.user_profiles
where role_id is not null
on conflict (user_id, role_id) do nothing;

-- ---------------------------------------------------------------------------
-- 3) بذور أولية للصلاحيات (تُوسّع لاحقاً مع كل صفحة)
-- ---------------------------------------------------------------------------

insert into public.permissions (code, label_ar) values
  ('page.financial.transfers', 'المناقلات المنفذة'),
  ('page.financial.budgets', 'الإعتمادات المدرجة'),
  ('page.financial.approved_budgets', 'الموازنات المعتمدة'),
  ('page.members.contributions', 'المساهمات المسددة'),
  ('page.members.root', 'الدول الأعضاء'),
  ('page.settings.users', 'المستخدمين'),
  ('page.settings.roles', 'الصلاحيات')
on conflict (code) do nothing;

-- ربط الدور id = 1 (إن وُجد) بكل الصلاحيات الحالية — يُفترض أنه دور المشرف
insert into public.role_permissions (role_id, permission_id)
select 1, p.id
from public.permissions p
where exists (select 1 from public.roles r where r.id = 1)
on conflict (role_id, permission_id) do nothing;

-- ---------------------------------------------------------------------------
-- 4) دالة لقراءة أكواد صلاحيات المستخدم الحالي (SECURITY DEFINER)
-- ---------------------------------------------------------------------------

create or replace function public.list_my_permission_codes()
returns table(code text)
language sql
stable
security definer
set search_path = public
as $$
  select distinct p.code
  from public.user_roles ur
  join public.role_permissions rp on rp.role_id = ur.role_id
  join public.permissions p on p.id = rp.permission_id
  where ur.user_id = auth.uid();
$$;

revoke all on function public.list_my_permission_codes() from public;
grant execute on function public.list_my_permission_codes() to authenticated;

-- ---------------------------------------------------------------------------
-- 5) RLS
-- ---------------------------------------------------------------------------

alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.user_roles enable row level security;

drop policy if exists "permissions_select_authenticated" on public.permissions;
create policy "permissions_select_authenticated"
  on public.permissions for select
  to authenticated
  using (true);

drop policy if exists "role_permissions_select_member_roles" on public.role_permissions;
create policy "role_permissions_select_member_roles"
  on public.role_permissions for select
  to authenticated
  using (
    exists (
      select 1
      from public.user_roles ur
      where ur.user_id = auth.uid()
        and ur.role_id = role_permissions.role_id
    )
  );

drop policy if exists "user_roles_select_own" on public.user_roles;
create policy "user_roles_select_own"
  on public.user_roles for select
  to authenticated
  using (user_id = auth.uid());
