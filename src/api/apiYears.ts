import { supabase } from "../lib/supabase";

export type YearsRow = {
  id: number;
  year_num: string | null;
  status: boolean | null;
};

export type YearUpdatePayload = Partial<
  Pick<YearsRow, "year_num" | "status">
>;

const selectYears = "id, year_num, status";

function parseNumericId(value: number | string, fieldLabel = "المعرّف"): number {
  const n = typeof value === "string" ? Number(value) : value;
  if (typeof n !== "number" || !Number.isFinite(n)) {
    throw new Error(`${fieldLabel} غير صالح`);
  }
  return n;
}

export async function getAll(): Promise<YearsRow[]> {
  const { data, error } = await supabase
    .from("years")
    .select(selectYears)
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات السنوات");
  }
  return (data as unknown as YearsRow[] | null) ?? [];
}

/** السنوات المفعّلة فقط (قوائم الاختيار، التقارير، …) */
export async function getActiveYears(): Promise<YearsRow[]> {
  const { data, error } = await supabase
    .from("years")
    .select(selectYears)
    .eq("status", true)
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات السنوات");
  }
  return (data as unknown as YearsRow[] | null) ?? [];
}

/** نفس منطق `getActiveYears` — يُبقى للتوافق مع استدعاءات قديمة */
export const getActiveYears2 = getActiveYears;

export async function updateYear(
  updatedData: YearUpdatePayload,
  id: number | string,
): Promise<YearsRow[]> {
  const rowId = parseNumericId(id, "رقم السنة");

  const { data, error } = await supabase
    .from("years")
    .update(updatedData)
    .eq("id", rowId)
    .select(selectYears);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن تعديل بيانات السنة");
  }
  return (data as unknown as YearsRow[] | null) ?? [];
}
