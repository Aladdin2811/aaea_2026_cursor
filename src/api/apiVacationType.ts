import { supabase } from "../lib/supabase";

export type VacationTypeRow = {
  id: number;
  vacation_type_name: string | null;
  status: boolean | null;
};

export type CreateVacationTypeInput = Partial<Omit<VacationTypeRow, "id">> & {
  id?: number;
};

export type UpdateVacationTypeInput = Partial<Omit<VacationTypeRow, "id">>;

export type VacationTypeListFilters = {
  activeOnly?: boolean;
};

const tableName = "vacation_type" as const;

const selectVacationType = "id, vacation_type_name, status";

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

async function nextVacationTypeId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف لنوع الإجازة");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(
  filters?: VacationTypeListFilters,
): Promise<VacationTypeRow[]> {
  let query = supabase
    .from(tableName)
    .select(selectVacationType)
    .order("id", { ascending: true });

  if (filters?.activeOnly === true) {
    query = query.eq("status", true);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات أنواع الإجازة");
  }
  return (data as unknown as VacationTypeRow[] | null) ?? [];
}

export async function getById(id: number | string): Promise<VacationTypeRow> {
  const rowId = parseNumericId(id, "رقم نوع الإجازة");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectVacationType)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات نوع الإجازة");
  }
  return data as unknown as VacationTypeRow;
}

export async function createVacationType(
  input: CreateVacationTypeInput,
): Promise<VacationTypeRow> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextVacationTypeId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectVacationType)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل نوع الإجازة");
  }
  return data as unknown as VacationTypeRow;
}

export async function updateVacationType(
  id: number | string,
  patch: UpdateVacationTypeInput,
): Promise<VacationTypeRow> {
  const rowId = parseNumericId(id, "رقم نوع الإجازة");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectVacationType)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل نوع الإجازة");
  }
  return data as unknown as VacationTypeRow;
}

export async function deleteVacationType(id: number | string): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم نوع الإجازة");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف نوع الإجازة");
  }
  return data;
}
