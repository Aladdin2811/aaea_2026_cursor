-- دوال مساعدة يستدعيها get_modified_budgets (يمكن استبدالها لاحقاً بمنطق أدق)
CREATE OR REPLACE FUNCTION public.get_transfer_to_for_budget(
  p_year_id bigint,
  p_account_id bigint
)
RETURNS numeric
LANGUAGE sql
SET search_path = ''
AS $$
  SELECT COALESCE(SUM(t.transfer_to::numeric), 0)::numeric
  FROM public.transfers t
  WHERE t.year_id = p_year_id
    AND t.account_id = p_account_id;
$$;

CREATE OR REPLACE FUNCTION public.get_transfer_from_for_budget(
  p_year_id bigint,
  p_account_id bigint
)
RETURNS numeric
LANGUAGE sql
SET search_path = ''
AS $$
  SELECT COALESCE(SUM(t.transfer_from::numeric), 0)::numeric
  FROM public.transfers t
  WHERE t.year_id = p_year_id
    AND t.account_id = p_account_id;
$$;

CREATE OR REPLACE FUNCTION public.get_increase_budget_for_budget(
  p_year_id bigint,
  p_account_id bigint
)
RETURNS numeric
LANGUAGE sql
SET search_path = ''
AS $$
  SELECT COALESCE(SUM(bi.increase_budget::numeric), 0)::numeric
  FROM public.budget_increase bi
  WHERE bi.year_id = p_year_id
    AND bi.account_id = p_account_id;
$$;

DROP FUNCTION IF EXISTS public.get_modified_budgets(bigint, bigint);

CREATE OR REPLACE FUNCTION public.get_modified_budgets(
  p_year_id bigint,
  p_bab_id bigint
)
RETURNS TABLE (
  code text,
  band_name text,
  no3_name text,
  detailed_name text,
  budget_amount numeric,
  transfer_to numeric,
  transfer_from numeric,
  increase_budget numeric,
  modified_budget numeric
)
LANGUAGE sql
SET search_path = ''
AS $$
  SELECT
    allac.code,
    bnd.band_name,
    no3.no3_name,
    det.detailed_name,
    bdg.budget_amount,
    COALESCE(public.get_transfer_to_for_budget(p_year_id, bdg.account_id), 0),
    COALESCE(public.get_transfer_from_for_budget(p_year_id, bdg.account_id), 0),
    COALESCE(public.get_increase_budget_for_budget(p_year_id, bdg.account_id), 0),
    (
      bdg.budget_amount
      + COALESCE(public.get_transfer_to_for_budget(p_year_id, bdg.account_id), 0)
      + COALESCE(public.get_increase_budget_for_budget(p_year_id, bdg.account_id), 0)
    )
    - COALESCE(public.get_transfer_from_for_budget(p_year_id, bdg.account_id), 0)
  FROM public.budgets bdg
  JOIN public.band bnd ON bnd.id = bdg.band_id
  LEFT JOIN public.no3 no3 ON no3.id = bdg.no3_id
  LEFT JOIN public.detailed det ON det.id = bdg.detailed_id
  JOIN public.all_accounts allac ON allac.id = bdg.account_id
  WHERE bdg.year_id = p_year_id
    AND bdg.bab_id = p_bab_id
  ORDER BY bdg.band_id, bdg.no3_id, bdg.detailed_id;
$$;

GRANT EXECUTE ON FUNCTION public.get_modified_budgets(bigint, bigint) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_modified_budgets(bigint, bigint) TO service_role;
