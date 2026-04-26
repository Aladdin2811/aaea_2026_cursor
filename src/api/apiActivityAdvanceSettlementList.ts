import { supabase } from "../lib/supabase";

export type ActivityAdvanceSettlementListRow = {
  id: number;
  list_name: string | null;
};

export type CreateActivityAdvanceSettlementListInput = {
  list_name: string | null;
};

export type UpdateActivityAdvanceSettlementListInput = Partial<
  Pick<ActivityAdvanceSettlementListRow, "list_name">
>;

const tableName = "activity_advance_settlement_list" as const;
const selectColumns = "id, list_name";

function parseId(value: number | string, label = "المعرّف"): number {
  const n = typeof value === "string" ? Number(value) : value;
  if (typeof n !== "number" || !Number.isFinite(n)) {
    throw new Error(`${label} غير صالح`);
  }
  return n;
}

export async function getAll(): Promise<ActivityAdvanceSettlementListRow[]> {
  const { data, error } = await supabase
    .from(tableName)
    .select(selectColumns)
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على قوائم تسوية مصروفات الأنشطة");
  }
  return (data as unknown as ActivityAdvanceSettlementListRow[] | null) ?? [];
}

export async function getById(
  id: number | string,
): Promise<ActivityAdvanceSettlementListRow> {
  const rowId = parseId(id, "رقم القائمة");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectColumns)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات القائمة");
  }
  return data as unknown as ActivityAdvanceSettlementListRow;
}

export async function createActivityAdvanceSettlementList(
  input: CreateActivityAdvanceSettlementListInput,
): Promise<ActivityAdvanceSettlementListRow> {
  const { data, error } = await supabase
    .from(tableName)
    .insert({ list_name: input.list_name ?? null })
    .select(selectColumns)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل القائمة");
  }
  return data as unknown as ActivityAdvanceSettlementListRow;
}

export async function updateActivityAdvanceSettlementList(
  id: number | string,
  patch: UpdateActivityAdvanceSettlementListInput,
): Promise<ActivityAdvanceSettlementListRow> {
  const rowId = parseId(id, "رقم القائمة");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectColumns)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل القائمة");
  }
  return data as unknown as ActivityAdvanceSettlementListRow;
}

export async function deleteActivityAdvanceSettlementList(
  id: number | string,
): Promise<unknown> {
  const rowId = parseId(id, "رقم القائمة");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف القائمة");
  }
  return data;
}
