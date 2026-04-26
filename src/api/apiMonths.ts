import { supabase } from "../lib/supabase";

export type MonthsRow = {
  id: number;
  month_name1: string | null;
  month_name2: string | null;
  month_name3: string | null;
  month_name4: string | null;
  month_name5: string | null;
  /** عمود `text` في القاعدة — قد يُخزَّن كرقم نصي (مثل `"1"` أو `"01"`) */
  month_num: string | null;
  days_count: number | null;
};

/** شكل العلاقة المضمّنة في استعلامات أخرى (`months (...)`) */
export type MonthsEmbedded = Pick<
  MonthsRow,
  "id" | "month_num" | "month_name1"
>;

export type CreateMonthsInput = Partial<Omit<MonthsRow, "id">> & {
  id?: number;
};

export type UpdateMonthsInput = Partial<Omit<MonthsRow, "id">>;

const tableName = "months" as const;

const selectMonths = `
  id,
  month_name1,
  month_name2,
  month_name3,
  month_name4,
  month_name5,
  month_num,
  days_count
`;

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

async function nextMonthsId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف للشهر");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(): Promise<MonthsRow[]> {
  const { data, error } = await supabase
    .from(tableName)
    .select(selectMonths)
    .order("month_num", { ascending: true, nullsFirst: false })
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات الأشهر");
  }
  return (data as unknown as MonthsRow[] | null) ?? [];
}

export async function getById(id: number | string): Promise<MonthsRow> {
  const rowId = parseNumericId(id, "رقم الشهر");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectMonths)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات الشهر");
  }
  return data as unknown as MonthsRow;
}

export async function createMonths(input: CreateMonthsInput): Promise<MonthsRow> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextMonthsId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectMonths)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل الشهر");
  }
  return data as unknown as MonthsRow;
}

export async function updateMonths(
  id: number | string,
  patch: UpdateMonthsInput,
): Promise<MonthsRow> {
  const rowId = parseNumericId(id, "رقم الشهر");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectMonths)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل الشهر");
  }
  return data as unknown as MonthsRow;
}

export async function deleteMonths(id: number | string): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم الشهر");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف الشهر");
  }
  return data;
}
