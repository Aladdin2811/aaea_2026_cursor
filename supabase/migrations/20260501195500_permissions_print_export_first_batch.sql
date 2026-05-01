-- إضافة صلاحيات الطباعة والتصدير (XLS) للدفعة الأولى من الجداول

insert into public.permissions (code, label_ar)
values
  ('table.account_type.print', 'طباعة أنواع الحسابات'),
  ('table.account_type.export', 'تصدير أنواع الحسابات'),
  ('table.members.print', 'طباعة الدول الأعضاء'),
  ('table.members.export', 'تصدير الدول الأعضاء'),
  ('table.transfers.print', 'طباعة المناقلات'),
  ('table.transfers.export', 'تصدير المناقلات'),
  ('table.vacations.print', 'طباعة الإجازات'),
  ('table.vacations.export', 'تصدير الإجازات'),
  ('table.certified_programs.print', 'طباعة الأنشطة المعتمدة'),
  ('table.certified_programs.export', 'تصدير الأنشطة المعتمدة'),
  ('table.social_security_expenses.print', 'طباعة مصروفات الضمان الاجتماعي'),
  ('table.social_security_expenses.export', 'تصدير مصروفات الضمان الاجتماعي')
on conflict (code) do nothing;

insert into public.role_permissions (role_id, permission_id, active)
select 1, p.id, true
from public.permissions p
where p.code in (
  'table.account_type.print',
  'table.account_type.export',
  'table.members.print',
  'table.members.export',
  'table.transfers.print',
  'table.transfers.export',
  'table.vacations.print',
  'table.vacations.export',
  'table.certified_programs.print',
  'table.certified_programs.export',
  'table.social_security_expenses.print',
  'table.social_security_expenses.export'
)
and exists (select 1 from public.roles r where r.id = 1)
on conflict (role_id, permission_id) do update
set active = excluded.active;
