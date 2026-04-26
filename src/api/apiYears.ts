import { supabase } from "../lib/supabase";

export type YearsRow = {
  id: number;
  year_num: string | null;
  status: boolean | null;
};

/** شكل العلاقة المضمّنة في استعلامات أخرى (`years (...)`) */
export type YearsEmbedded = Pick<YearsRow, "id" | "year_num" | "status">;

export type UpdateYearsInput = Partial<Pick<YearsRow, "year_num" | "status">>;

/** اسم بديل لـ `UpdateYearsInput` للتوافق مع الاستيرادات القديمة */
export type YearUpdatePayload = UpdateYearsInput;

export type CreateYearsInput = Partial<Omit<YearsRow, "id">> & {
  id?: number;
};

export type YearsListFilters = {
  activeOnly?: boolean;
};

const tableName = "years" as const;

const selectYears = "id, year_num, status";

function parseNumericId(
  value: number | string,
  fieldLabel = "المعرّف",
): number {
  const n = typeof value === "string" ? Number(value) : value;
  if (typeof n !== "number" || !Number.isFinite(n)) {
    throw new Error(`${fieldLabel} غير صالح`);
  }
  return n;
}

async function nextYearsId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف للسنة");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(
  filters?: YearsListFilters,
): Promise<YearsRow[]> {
  let query = supabase
    .from(tableName)
    .select(selectYears)
    .order("id", { ascending: true });

  if (filters?.activeOnly === true) {
    query = query.eq("status", true);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات السنوات");
  }
  return (data as unknown as YearsRow[] | null) ?? [];
}

/** السنوات المفعّلة فقط (قوائم الاختيار، التقارير، …) */
export async function getActiveYears(): Promise<YearsRow[]> {
  return getAll({ activeOnly: true });
}

/** نفس منطق `getActiveYears` — يُبقى للتوافق مع استدعاءات قديمة */
export const getActiveYears2 = getActiveYears;

export async function getById(id: number | string): Promise<YearsRow> {
  const rowId = parseNumericId(id, "رقم السنة");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectYears)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات السنة");
  }
  return data as unknown as YearsRow;
}

export async function createYear(input: CreateYearsInput): Promise<YearsRow> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextYearsId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectYears)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل السنة");
  }
  return data as unknown as YearsRow;
}

export async function updateYear(
  id: number | string,
  patch: UpdateYearsInput,
): Promise<YearsRow> {
  const rowId = parseNumericId(id, "رقم السنة");

  const { data, error } = await supabase
    .from(tableName)
    .update(patch)
    .eq("id", rowId)
    .select(selectYears)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن تعديل بيانات السنة");
  }
  return data as unknown as YearsRow;
}

export async function deleteYear(id: number | string): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم السنة");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف السنة");
  }
  return data;
}
