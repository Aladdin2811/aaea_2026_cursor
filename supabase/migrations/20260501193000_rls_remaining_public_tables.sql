-- تطبيق RLS موحّد على بقية جداول public (عدا الجداول التي تمت معالجتها سابقاً)
-- يعتمد على الدالة: public.has_permission_code(text)

do $$
declare
  t record;
  pol record;
begin
  -- 1) إنشاء أكواد الصلاحيات لباقي الجداول
  for t in
    select tablename
    from pg_tables
    where schemaname = 'public'
      and tablename not in (
        'account_type',
        'members',
        'permissions',
        'role_permissions',
        'user_roles'
      )
  loop
    insert into public.permissions (code, label_ar)
    values
      (format('table.%s.read', t.tablename), format('عرض سجلات %s', t.tablename)),
      (format('table.%s.create', t.tablename), format('إضافة سجل إلى %s', t.tablename)),
      (format('table.%s.update', t.tablename), format('تعديل سجلات %s', t.tablename)),
      (format('table.%s.delete', t.tablename), format('حذف سجلات %s', t.tablename))
    on conflict (code) do nothing;
  end loop;

  -- 2) ربط الدور id=1 بكل الصلاحيات الجديدة (إن وُجد)
  insert into public.role_permissions (role_id, permission_id)
  select 1, p.id
  from public.permissions p
  where (
    p.code like 'table.%.read'
    or p.code like 'table.%.create'
    or p.code like 'table.%.update'
    or p.code like 'table.%.delete'
  )
    and exists (select 1 from public.roles r where r.id = 1)
  on conflict (role_id, permission_id) do nothing;

  -- 3) تفعيل RLS + حذف السياسات القديمة + إنشاء سياسات موحدة
  for t in
    select tablename
    from pg_tables
    where schemaname = 'public'
      and tablename not in (
        'account_type',
        'members',
        'permissions',
        'role_permissions',
        'user_roles'
      )
  loop
    execute format('alter table public.%I enable row level security', t.tablename);

    -- حذف جميع السياسات الحالية على الجدول
    for pol in
      select policyname
      from pg_policies
      where schemaname = 'public'
        and tablename = t.tablename
    loop
      execute format(
        'drop policy if exists %I on public.%I',
        pol.policyname,
        t.tablename
      );
    end loop;

    execute format(
      'create policy rls_select_by_permission on public.%I for select to authenticated using (public.has_permission_code(%L))',
      t.tablename,
      format('table.%s.read', t.tablename)
    );
    execute format(
      'create policy rls_insert_by_permission on public.%I for insert to authenticated with check (public.has_permission_code(%L))',
      t.tablename,
      format('table.%s.create', t.tablename)
    );
    execute format(
      'create policy rls_update_by_permission on public.%I for update to authenticated using (public.has_permission_code(%L)) with check (public.has_permission_code(%L))',
      t.tablename,
      format('table.%s.update', t.tablename),
      format('table.%s.update', t.tablename)
    );
    execute format(
      'create policy rls_delete_by_permission on public.%I for delete to authenticated using (public.has_permission_code(%L))',
      t.tablename,
      format('table.%s.delete', t.tablename)
    );
  end loop;
end
$$;
