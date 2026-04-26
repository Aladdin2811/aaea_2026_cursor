import { supabase } from "../lib/supabase";

export type CheckTypeRow = {
  id: number;
  check_type_name: string | null;
};

export type CreateCheckTypeInput = Partial<Omit<CheckTypeRow, "id">>;

export type UpdateCheckTypeInput = Partial<Omit<CheckTypeRow, "id">>;

const tableName = "check_type" as const;

const selectCheckType = "id, check_type_name";

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

export async function getAll(): Promise<CheckTypeRow[]> {
  const { data, error } = await supabase
    .from(tableName)
    .select(selectCheckType)
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على أنواع الشيكات");
  }
  return (data as unknown as CheckTypeRow[] | null) ?? [];
}

export async function getById(id: number | string): Promise<CheckTypeRow> {
  const rowId = parseNumericId(id, "رقم نوع الشيك");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectCheckType)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات نوع الشيك");
  }
  return data as unknown as CheckTypeRow;
}

export async function createCheckType(
  input: CreateCheckTypeInput,
): Promise<CheckTypeRow> {
  const { data, error } = await supabase
    .from(tableName)
    .insert({ ...input })
    .select(selectCheckType)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل نوع الشيك");
  }
  return data as unknown as CheckTypeRow;
}

export async function updateCheckType(
  id: number | string,
  patch: UpdateCheckTypeInput,
): Promise<CheckTypeRow> {
  const rowId = parseNumericId(id, "رقم نوع الشيك");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectCheckType)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل نوع الشيك");
  }
  return data as unknown as CheckTypeRow;
}

export async function deleteCheckType(id: number | string): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم نوع الشيك");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف نوع الشيك");
  }
  return data;
}
