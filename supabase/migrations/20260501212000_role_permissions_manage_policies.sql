-- إصلاح إدارة صلاحيات الأدوار من صفحة settings/roles
-- السبب: upsert على role_permissions يتطلب سياسات insert/update تحت RLS

alter table public.role_permissions enable row level security;

-- قراءة كل ربط الدور-الصلاحية لمستخدمي إدارة الأدوار
drop policy if exists "role_permissions_select_admin_manage" on public.role_permissions;
create policy "role_permissions_select_admin_manage"
  on public.role_permissions for select
  to authenticated
  using (public.has_permission_code('page.settings.roles'));

-- الإبقاء على سياسة القراءة القديمة (قراءة صلاحيات أدوار المستخدم نفسه) إن كانت موجودة.

drop policy if exists "role_permissions_insert_admin_manage" on public.role_permissions;
create policy "role_permissions_insert_admin_manage"
  on public.role_permissions for insert
  to authenticated
  with check (public.has_permission_code('page.settings.roles'));

drop policy if exists "role_permissions_update_admin_manage" on public.role_permissions;
create policy "role_permissions_update_admin_manage"
  on public.role_permissions for update
  to authenticated
  using (public.has_permission_code('page.settings.roles'))
  with check (public.has_permission_code('page.settings.roles'));

drop policy if exists "role_permissions_delete_admin_manage" on public.role_permissions;
create policy "role_permissions_delete_admin_manage"
  on public.role_permissions for delete
  to authenticated
  using (public.has_permission_code('page.settings.roles'));
