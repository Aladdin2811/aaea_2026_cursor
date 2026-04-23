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

const selectCurrentYear = `
  id,
  year_id,
  years ( id, year_num, status )
`;

/**
 * صف السنة الحالية (جدول `current_year` — غالباً صف واحد).
 */
export async function getCurrentYear(): Promise<CurrentYearWithRelations | null> {
  const { data, error } = await supabase
    .from("current_year")
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
 * تحديث السنة الحالية (المعرّف الثابت `id = 1` كما في مخططكم).
 */
export async function updateCurrentYear(
  payload: CurrentYearUpdatePayload,
): Promise<CurrentYearWithRelations | null> {
  const { data, error } = await supabase
    .from("current_year")
    .update(payload)
    .eq("id", 1)
    .select(selectCurrentYear)
    .maybeSingle();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند تعديل بيانات السنة الحالية");
  }
  return data as unknown as CurrentYearWithRelations | null;
}
