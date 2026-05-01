-- صلاحيات الطباعة والتصدير (XLS) - الدفعة الثانية (جداول شجرة الحسابات)

insert into public.permissions (code, label_ar)
values
  ('table.general_account.print', 'طباعة الحسابات العامة'),
  ('table.general_account.export', 'تصدير الحسابات العامة'),
  ('table.bab.print', 'طباعة الأبواب'),
  ('table.bab.export', 'تصدير الأبواب'),
  ('table.band.print', 'طباعة البنود'),
  ('table.band.export', 'تصدير البنود'),
  ('table.no3.print', 'طباعة الأنواع'),
  ('table.no3.export', 'تصدير الأنواع'),
  ('table.detailed.print', 'طباعة الحسابات التفصيلية'),
  ('table.detailed.export', 'تصدير الحسابات التفصيلية')
on conflict (code) do nothing;

insert into public.role_permissions (role_id, permission_id, active)
select 1, p.id, true
from public.permissions p
where p.code in (
  'table.general_account.print',
  'table.general_account.export',
  'table.bab.print',
  'table.bab.export',
  'table.band.print',
  'table.band.export',
  'table.no3.print',
  'table.no3.export',
  'table.detailed.print',
  'table.detailed.export'
)
and exists (select 1 from public.roles r where r.id = 1)
on conflict (role_id, permission_id) do update
set active = excluded.active;
