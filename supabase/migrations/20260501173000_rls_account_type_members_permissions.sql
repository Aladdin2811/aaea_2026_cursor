-- RLS صارم لجدولي account_type و members بناءً على permissions/role_permissions/user_roles
-- ملاحظة: هذا الملف يحذف أي سياسات سابقة على الجدولين (بما فيها سياسة ALL المفتوحة)

-- ---------------------------------------------------------------------------
-- 1) أكواد الصلاحيات المطلوبة
-- ---------------------------------------------------------------------------
insert into public.permissions (code, label_ar)
values
  ('table.account_type.read', 'عرض أنواع الحسابات'),
  ('table.account_type.create', 'إضافة نوع حساب'),
  ('table.account_type.update', 'تعديل نوع حساب'),
  ('table.account_type.delete', 'حذف نوع حساب'),
  ('table.members.read', 'عرض الدول الأعضاء'),
  ('table.members.create', 'إضافة دولة عضو'),
  ('table.members.update', 'تعديل دولة عضو'),
  ('table.members.delete', 'حذف دولة عضو')
on conflict (code) do nothing;

-- ربط الدور id = 1 (إن وُجد) بجميع الصلاحيات الجديدة
insert into public.role_permissions (role_id, permission_id)
select 1, p.id
from public.permissions p
where p.code in (
  'table.account_type.read',
  'table.account_type.create',
  'table.account_type.update',
  'table.account_type.delete',
  'table.members.read',
  'table.members.create',
  'table.members.update',
  'table.members.delete'
)
  and exists (select 1 from public.roles r where r.id = 1)
on conflict (role_id, permission_id) do nothing;

-- ---------------------------------------------------------------------------
-- 2) تفعيل RLS
-- ---------------------------------------------------------------------------
alter table public.account_type enable row level security;
alter table public.members enable row level security;

-- ---------------------------------------------------------------------------
-- 3) إزالة أي سياسات قديمة على الجدولين
-- ---------------------------------------------------------------------------
do $$
declare
  p record;
begin
  for p in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('account_type', 'members')
  loop
    execute format(
      'drop policy if exists %I on %I.%I',
      p.policyname,
      p.schemaname,
      p.tablename
    );
  end loop;
end
$$;

-- ---------------------------------------------------------------------------
-- 4) دالة مساعدة: هل يملك المستخدم الحالي كود صلاحية معيّن؟
-- ---------------------------------------------------------------------------
create or replace function public.has_permission_code(required_code text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.role_permissions rp on rp.role_id = ur.role_id
    join public.permissions p on p.id = rp.permission_id
    where ur.user_id = auth.uid()
      and p.code = required_code
  );
$$;

revoke all on function public.has_permission_code(text) from public;
grant execute on function public.has_permission_code(text) to authenticated;

-- ---------------------------------------------------------------------------
-- 5) سياسات account_type
-- ---------------------------------------------------------------------------
create policy "account_type_select_by_permission"
  on public.account_type
  for select
  to authenticated
  using (public.has_permission_code('table.account_type.read'));

create policy "account_type_insert_by_permission"
  on public.account_type
  for insert
  to authenticated
  with check (public.has_permission_code('table.account_type.create'));

create policy "account_type_update_by_permission"
  on public.account_type
  for update
  to authenticated
  using (public.has_permission_code('table.account_type.update'))
  with check (public.has_permission_code('table.account_type.update'));

create policy "account_type_delete_by_permission"
  on public.account_type
  for delete
  to authenticated
  using (public.has_permission_code('table.account_type.delete'));

-- ---------------------------------------------------------------------------
-- 6) سياسات members
-- ---------------------------------------------------------------------------
create policy "members_select_by_permission"
  on public.members
  for select
  to authenticated
  using (public.has_permission_code('table.members.read'));

create policy "members_insert_by_permission"
  on public.members
  for insert
  to authenticated
  with check (public.has_permission_code('table.members.create'));

create policy "members_update_by_permission"
  on public.members
  for update
  to authenticated
  using (public.has_permission_code('table.members.update'))
  with check (public.has_permission_code('table.members.update'));

create policy "members_delete_by_permission"
  on public.members
  for delete
  to authenticated
  using (public.has_permission_code('table.members.delete'));
