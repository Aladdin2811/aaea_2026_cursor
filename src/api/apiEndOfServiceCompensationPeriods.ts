import { supabase } from "../lib/supabase";

export type EndOfServiceCompensationPeriodsRow = {
  id: number;
  period_to_date: string | null;
  months_count: number | null;
};

export type CreateEndOfServiceCompensationPeriodsInput = Partial<
  Omit<EndOfServiceCompensationPeriodsRow, "id">
>;

export type UpdateEndOfServiceCompensationPeriodsInput = Partial<
  Omit<EndOfServiceCompensationPeriodsRow, "id">
>;

const tableName = "end_of_service_compensation_periods" as const;

const selectColumns = "id, period_to_date, months_count";

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

export async function getAll(): Promise<EndOfServiceCompensationPeriodsRow[]> {
  const { data, error } = await supabase
    .from(tableName)
    .select(selectColumns)
    .order("period_to_date", { ascending: false, nullsFirst: false })
    .order("id", { ascending: false });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على فترات تعويض نهاية الخدمة");
  }
  return (data as unknown as EndOfServiceCompensationPeriodsRow[] | null) ?? [];
}

export async function getById(
  id: number | string,
): Promise<EndOfServiceCompensationPeriodsRow> {
  const rowId = parseNumericId(id, "رقم الفترة");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectColumns)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات الفترة");
  }
  return data as unknown as EndOfServiceCompensationPeriodsRow;
}

export async function createEndOfServiceCompensationPeriods(
  input: CreateEndOfServiceCompensationPeriodsInput,
): Promise<EndOfServiceCompensationPeriodsRow> {
  const { data, error } = await supabase
    .from(tableName)
    .insert({ ...input })
    .select(selectColumns)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل فترة تعويض نهاية الخدمة");
  }
  return data as unknown as EndOfServiceCompensationPeriodsRow;
}

export async function updateEndOfServiceCompensationPeriods(
  id: number | string,
  patch: UpdateEndOfServiceCompensationPeriodsInput,
): Promise<EndOfServiceCompensationPeriodsRow> {
  const rowId = parseNumericId(id, "رقم الفترة");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectColumns)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل الفترة");
  }
  return data as unknown as EndOfServiceCompensationPeriodsRow;
}

export async function deleteEndOfServiceCompensationPeriods(
  id: number | string,
): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم الفترة");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف الفترة");
  }
  return data;
}
