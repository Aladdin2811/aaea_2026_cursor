import { supabase } from "../lib/supabase";

export type ExpatriationAllowanceRow = {
  id: number;
  expatriation_allowance_percentage: string | number | null;
};

export type CreateExpatriationAllowanceInput = Partial<
  Omit<ExpatriationAllowanceRow, "id">
> & {
  id?: number;
};

export type UpdateExpatriationAllowanceInput = Partial<
  Omit<ExpatriationAllowanceRow, "id">
>;

const tableName = "expatriation_allowance" as const;

const selectExpatriationAllowance = "id, expatriation_allowance_percentage";

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

async function nextExpatriationAllowanceId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف لبدل الاغتراب");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(): Promise<ExpatriationAllowanceRow[]> {
  const { data, error } = await supabase
    .from(tableName)
    .select(selectExpatriationAllowance)
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات بدل الاغتراب");
  }
  return (data as unknown as ExpatriationAllowanceRow[] | null) ?? [];
}

export async function getById(
  id: number | string,
): Promise<ExpatriationAllowanceRow> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectExpatriationAllowance)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات بدل الاغتراب");
  }
  return data as unknown as ExpatriationAllowanceRow;
}

export async function createExpatriationAllowance(
  input: CreateExpatriationAllowanceInput,
): Promise<ExpatriationAllowanceRow> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextExpatriationAllowanceId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectExpatriationAllowance)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل بدل الاغتراب");
  }
  return data as unknown as ExpatriationAllowanceRow;
}

export async function updateExpatriationAllowance(
  id: number | string,
  patch: UpdateExpatriationAllowanceInput,
): Promise<ExpatriationAllowanceRow> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectExpatriationAllowance)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل بدل الاغتراب");
  }
  return data as unknown as ExpatriationAllowanceRow;
}

export async function deleteExpatriationAllowance(
  id: number | string,
): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف بدل الاغتراب");
  }
  return data;
}
