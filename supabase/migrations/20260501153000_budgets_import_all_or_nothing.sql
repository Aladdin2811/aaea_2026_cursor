-- تحويل استيراد budgets إلى نمط صارم: كل الدفعة أو لا شيء
-- إذا وجد تكرار داخل الملف أو مع البيانات الحالية (year_id + account_id) يتم إلغاء العملية بالكامل

create or replace function public.import_budgets_add_only(p_rows jsonb)
returns table(inserted_count integer, skipped_count integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_next_id bigint;
  v_total integer;
  v_distinct integer;
  v_conflicts integer;
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

  -- وجود صفوف ناقصة يوقف العملية بالكامل
  if exists (
    select 1
    from tmp_budgets_import
    where year_id is null or account_id is null
  ) then
    raise exception 'فشل الاستيراد: يوجد صف بدون year_id أو account_id';
  end if;

  select count(*) into v_total from tmp_budgets_import;
  if v_total = 0 then
    raise exception 'فشل الاستيراد: لا توجد صفوف صالحة';
  end if;

  -- تكرار داخل الملف نفسه يوقف العملية
  select count(*) into v_distinct
  from (
    select distinct year_id, account_id
    from tmp_budgets_import
  ) d;

  if v_distinct <> v_total then
    raise exception 'فشل الاستيراد: يوجد تكرار داخل الملف لنفس (year_id, account_id)';
  end if;

  -- تكرار مع البيانات الموجودة يوقف العملية
  select count(*) into v_conflicts
  from tmp_budgets_import t
  join public.budgets b
    on b.year_id = t.year_id
   and b.account_id = t.account_id;

  if v_conflicts > 0 then
    raise exception 'فشل الاستيراد: بعض الصفوف مكررة وموجودة مسبقاً (% صف)', v_conflicts;
  end if;

  lock table public.budgets in share row exclusive mode;
  select coalesce(max(id), 0) into v_next_id from public.budgets;

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
    v_next_id + row_number() over (order by year_id, account_id),
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
  from tmp_budgets_import;

  return query
  select v_total::integer, 0::integer;
end;
$$;

revoke all on function public.import_budgets_add_only(jsonb) from public;
grant execute on function public.import_budgets_add_only(jsonb) to authenticated;
