import { useQuery } from "@tanstack/react-query";
import {
  getAll,
  type AllEmployeesWithRelations,
} from "../../../api/apiAllEmployees";
import supabase from "../../../lib/supabase";

/** سابق = متقاعد صراحةً، أو معطّل (`status === false`). */
function rowIsFormer(r: AllEmployeesWithRelations): boolean {
  return r.retired === true || r.status === false;
}

export type AllEmployeesListKind = "current" | "former";

function filterSegmentRows(
  rows: AllEmployeesWithRelations[],
  jobNatureId: number,
  listKind: AllEmployeesListKind,
): AllEmployeesWithRelations[] {
  return rows.filter((r) => {
    if (r.job_nature_id !== jobNatureId) return false;
    const former = rowIsFormer(r);
    if (listKind === "former") return former;
    return !former;
  });
}

function sortKeyNullableId(v: number | null): number {
  if (v == null || !Number.isFinite(v)) return Number.POSITIVE_INFINITY;
  return v;
}

function compareHiringDate(
  a: string | null,
  b: string | null,
): number {
  const aEmpty = a == null || a === "";
  const bEmpty = b == null || b === "";
  if (aEmpty && bEmpty) return 0;
  if (aEmpty) return 1;
  if (bEmpty) return -1;
  return a.localeCompare(b);
}

/** ترتيب عرض الجداول: الفئة → الدرجة → تاريخ التوظيف (تصاعدي). */
function sortEmployeesDisplayOrder(
  rows: AllEmployeesWithRelations[],
): AllEmployeesWithRelations[] {
  return [...rows].sort((a, b) => {
    const c = sortKeyNullableId(a.job_category_id) - sortKeyNullableId(
      b.job_category_id,
    );
    if (c !== 0) return c;
    const g =
      sortKeyNullableId(a.job_grade_id) - sortKeyNullableId(b.job_grade_id);
    if (g !== 0) return g;
    const h = compareHiringDate(a.hiring_date, b.hiring_date);
    if (h !== 0) return h;
    return a.id - b.id;
  });
}

export type UseAllEmployeesSegmentOptions = {
  jobNatureId: number;
  /** `current`: نشط وغير متقاعد · `former`: متقاعد أو غير فعّال */
  listKind?: AllEmployeesListKind;
};

/** قائمة كاملة من `all_employees` (مع العلاقات) — نفس مفتاح الاستعلام لجميع التصفيات. */
export function useFetchAllEmployees() {
  return useQuery({
    queryKey: ["all_employees"],
    queryFn: getAll,
  });
}

/**
 * جزء من `all_employees` حسب `job_nature_id` والقائمة (حاليون / سابقون).
 * يشارك التخزين المؤقت مع `useFetchAllEmployees` (queryKey واحد).
 */
export function useFetchAllEmployeesSegment({
  jobNatureId,
  listKind = "current",
}: UseAllEmployeesSegmentOptions) {
  return useQuery({
    queryKey: ["all_employees"],
    queryFn: getAll,
    select: (data) =>
      sortEmployeesDisplayOrder(
        filterSegmentRows(data, jobNatureId, listKind),
      ),
  });
}

export function useFetchAdvanceImplementEmployee() {
  return useQuery({
    queryKey: ["advance_implement_employee"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc(
        "get_advance_implement_employee",
      );
      if (error) throw error;
      return data;
    },
    retry: false,
  });
}
