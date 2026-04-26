import { useQuery } from "@tanstack/react-query";
import {
  getAll,
  type EmployeesBanksListFilters,
  type EmployeesBanksWithRelations,
} from "../../../api/apiEmployeesBanks";

function firstEmbed<T>(v: T | T[] | null | undefined): T | null {
  if (v == null) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

function sortKeyNullableId(v: number | null | undefined): number {
  if (v == null || !Number.isFinite(v)) return Number.POSITIVE_INFINITY;
  return v;
}

/** غير متقاعد أولاً (`false`/`null`) ثم المتقاعدون (`true`). */
function sortKeyRetired(v: boolean | null | undefined): number {
  return v === true ? 1 : 0;
}

/** ترتيب العرض: غير متقاعد أولاً → الفئة → الدرجة → رقم السجل البنكي. */
function sortEmployeesBanksByJobOrder(
  rows: EmployeesBanksWithRelations[],
): EmployeesBanksWithRelations[] {
  return [...rows].sort((a, b) => {
    const ea = firstEmbed(a.all_employees);
    const eb = firstEmbed(b.all_employees);
    const r = sortKeyRetired(ea?.retired) - sortKeyRetired(eb?.retired);
    if (r !== 0) return r;
    const c =
      sortKeyNullableId(ea?.job_category_id) -
      sortKeyNullableId(eb?.job_category_id);
    if (c !== 0) return c;
    const g =
      sortKeyNullableId(ea?.job_grade_id) -
      sortKeyNullableId(eb?.job_grade_id);
    if (g !== 0) return g;
    return a.id - b.id;
  });
}

/**
 * حسابات الموظفين البنكية — يمرّر الفلاتر الاختيارية إلى `getAll` كما في الـ API.
 * الترتيب الافتراضي للعرض: غير المتقاعدين أولاً (`retired`) ثم `job_category_id` ثم `job_grade_id` ثم `id`.
 */
export function useFetchEmployeesBanks(
  filters?: EmployeesBanksListFilters,
) {
  return useQuery<EmployeesBanksWithRelations[], Error>({
    queryKey: ["employees_banks", filters ?? {}],
    queryFn: () => getAll(filters),
    select: (data) => sortEmployeesBanksByJobOrder(data),
    retry: false,
  });
}
