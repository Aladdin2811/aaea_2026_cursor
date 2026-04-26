import { supabase } from "../lib/supabase";

export type ExpatriateRow = {
  id: number;
  expatriate_name: string | null;
};

export type CreateExpatriateInput = Partial<Omit<ExpatriateRow, "id">> & {
  id?: number;
};

export type UpdateExpatriateInput = Partial<Omit<ExpatriateRow, "id">>;

const tableName = "expatriate" as const;

const selectExpatriate = "id, expatriate_name";

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

async function nextExpatriateId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف لتعريف الاغتراب");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(): Promise<ExpatriateRow[]> {
  const { data, error } = await supabase
    .from(tableName)
    .select(selectExpatriate)
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات الاغتراب");
  }
  return (data as unknown as ExpatriateRow[] | null) ?? [];
}

export async function getById(id: number | string): Promise<ExpatriateRow> {
  const rowId = parseNumericId(id, "رقم الاغتراب");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectExpatriate)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات الاغتراب");
  }
  return data as unknown as ExpatriateRow;
}

export async function createExpatriate(
  input: CreateExpatriateInput,
): Promise<ExpatriateRow> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextExpatriateId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectExpatriate)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل تعريف الاغتراب");
  }
  return data as unknown as ExpatriateRow;
}

export async function updateExpatriate(
  id: number | string,
  patch: UpdateExpatriateInput,
): Promise<ExpatriateRow> {
  const rowId = parseNumericId(id, "رقم الاغتراب");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectExpatriate)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل بيانات الاغتراب");
  }
  return data as unknown as ExpatriateRow;
}

export async function deleteExpatriate(id: number | string): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم الاغتراب");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف تعريف الاغتراب");
  }
  return data;
}
