-- إضافة حالة تفعيل على ربط الدور بالصلاحية بدل الحذف الفعلي

alter table public.role_permissions
add column if not exists active boolean not null default true;

comment on column public.role_permissions.active is
'عند false تُعطَّل الصلاحية لهذا الدور بدون حذف السجل';

-- دالة قراءة صلاحيات المستخدم الحالي: تعتمد فقط على الربط الفعّال
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
  where ur.user_id = auth.uid()
    and rp.active = true;
$$;

revoke all on function public.list_my_permission_codes() from public;
grant execute on function public.list_my_permission_codes() to authenticated;

-- دالة فحص صلاحية محددة: تعتمد فقط على الربط الفعّال
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
      and rp.active = true
  );
$$;

revoke all on function public.has_permission_code(text) from public;
grant execute on function public.has_permission_code(text) to authenticated;
