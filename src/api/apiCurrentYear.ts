import { supabase } from "../lib/supabase";
import type { YearsRow } from "./apiYears";

export type CurrentYearRow = {
  id: number;
  year_id: number | null;
};

export type CurrentYearWithRelations = CurrentYearRow & {
  years: YearsRow | YearsRow[] | null;
};

export type CurrentYearUpdatePayload = {
  year_id: number | null;
};

const tableName = "current_year" as const;

const selectCurrentYear = `
  id,
  year_id,
  years ( id, year_num, status )
`;

/**
 * صف السنة الحالية (جدول `current_year` — يُفترض صف واحد أو يُؤخذ الأصغر `id`).
 */
export async function getCurrentYear(): Promise<CurrentYearWithRelations | null> {
  const { data, error } = await supabase
    .from(tableName)
    .select(selectCurrentYear)
    .order("id", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على السنة الحالية");
  }
  return data as unknown as CurrentYearWithRelations | null;
}

/**
 * تحديث صف السنة الحالية: الصف ذو أصغر `id` (بدون افتراض `id = 1`).
 */
export async function updateCurrentYear(
  payload: CurrentYearUpdatePayload,
): Promise<CurrentYearWithRelations | null> {
  const { data: existing, error: readError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (readError) {
    console.error("Supabase error:", readError);
    throw new Error("لا يمكن تحديد سجل السنة الحالية");
  }
  if (existing == null) {
    throw new Error("لا يوجد صف مسجّل في جدول السنة الحالية");
  }

  const { data, error } = await supabase
    .from(tableName)
    .update(payload)
    .eq("id", existing.id)
    .select(selectCurrentYear)
    .maybeSingle();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند تعديل بيانات السنة الحالية");
  }
  return data as unknown as CurrentYearWithRelations | null;
}
