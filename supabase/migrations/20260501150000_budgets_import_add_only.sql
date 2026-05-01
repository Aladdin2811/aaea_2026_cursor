-- استيراد CSV لجدول budgets بنمط "إضافة فقط"
-- يمنع تكرار السجل إذا كان (year_id, account_id) موجوداً مسبقاً

-- 1) صلاحية الاستيراد
insert into public.permissions (code, label_ar)
values ('table.budgets.import', 'استيراد الإعتمادات المدرجة')
on conflict (code) do nothing;

insert into public.role_permissions (role_id, permission_id, active)
select 1, p.id, true
from public.permissions p
where p.code = 'table.budgets.import'
  and exists (select 1 from public.roles r where r.id = 1)
on conflict (role_id, permission_id) do update
set active = excluded.active;

-- 2) تنظيف أي تكرارات قديمة قبل فرض القيد
delete from public.budgets b
using public.budgets d
where b.id > d.id
  and b.year_id = d.year_id
  and b.account_id = d.account_id;

-- 3) قيد منطقي لمنع تكرار (year_id, account_id)
create unique index if not exists budgets_year_account_unique_idx
  on public.budgets (year_id, account_id)
  where year_id is not null and account_id is not null;

-- 4) دالة استيراد add-only من JSON (قادمة من CSV)
-- ملاحظة: id في budgets ليس identity، لذا نولّده من max(id)+1 داخل العملية.
create or replace function public.import_budgets_add_only(p_rows jsonb)
returns table(inserted_count integer, skipped_count integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_next_id bigint;
  v_inserted integer := 0;
  v_skipped integer := 0;
begin
  if p_rows is null or jsonb_typeof(p_rows) <> 'array' then
    raise exception 'p_rows must be a JSON array';
  end if;

  create temporary table tmp_budgets_import (
    account_type_id bigint,
    general_account_id bigint,
    bab_id bigint,
    band_id bigint,
    no3_id bigint,
    detailed_id bigint,
    year_id bigint,
    budget_amount numeric,
    funding_type_id bigint,
    account_id bigint,
    main_topic_id bigint
  ) on commit drop;

  insert into tmp_budgets_import (
    account_type_id,
    general_account_id,
    bab_id,
    band_id,
    no3_id,
    detailed_id,
    year_id,
    budget_amount,
    funding_type_id,
    account_id,
    main_topic_id
  )
  select
    t.account_type_id,
    t.general_account_id,
    t.bab_id,
    t.band_id,
    t.no3_id,
    t.detailed_id,
    t.year_id,
    t.budget_amount,
    t.funding_type_id,
    t.account_id,
    t.main_topic_id
  from jsonb_to_recordset(p_rows) as t(
    account_type_id bigint,
    general_account_id bigint,
    bab_id bigint,
    band_id bigint,
    no3_id bigint,
    detailed_id bigint,
    year_id bigint,
    budget_amount numeric,
    funding_type_id bigint,
    account_id bigint,
    main_topic_id bigint
  );

  -- تجاهل الصفوف غير الصالحة (لا تحتوي year_id/account_id)
  delete from tmp_budgets_import
  where year_id is null or account_id is null;

  -- قفل خفيف لمنع تضارب توليد id المتسلسل
  lock table public.budgets in share row exclusive mode;
  select coalesce(max(id), 0) into v_next_id from public.budgets;

  with dedup_input as (
    select distinct on (year_id, account_id)
      account_type_id,
      general_account_id,
      bab_id,
      band_id,
      no3_id,
      detailed_id,
      year_id,
      budget_amount,
      funding_type_id,
      account_id,
      main_topic_id
    from tmp_budgets_import
    order by year_id, account_id
  ),
  to_insert as (
    select
      di.*,
      row_number() over (order by di.year_id, di.account_id) as rn
    from dedup_input di
    left join public.budgets b
      on b.year_id = di.year_id
     and b.account_id = di.account_id
    where b.id is null
  )
  insert into public.budgets (
    id,
    account_type_id,
    general_account_id,
    bab_id,
    band_id,
    no3_id,
    detailed_id,
    year_id,
    budget_amount,
    funding_type_id,
    account_id,
    main_topic_id
  )
  select
    v_next_id + rn,
    account_type_id,
    general_account_id,
    bab_id,
    band_id,
    no3_id,
    detailed_id,
    year_id,
    budget_amount,
    funding_type_id,
    account_id,
    main_topic_id
  from to_insert;

  get diagnostics v_inserted = row_count;
  v_skipped := greatest((select count(*) from tmp_budgets_import) - v_inserted, 0);

  return query
  select v_inserted::integer, v_skipped::integer;
end;
$$;

revoke all on function public.import_budgets_add_only(jsonb) from public;
grant execute on function public.import_budgets_add_only(jsonb) to authenticated;
