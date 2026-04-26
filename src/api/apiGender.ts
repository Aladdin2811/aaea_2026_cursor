import { supabase } from "../lib/supabase";

export type GenderRow = {
  id: number;
  gender_name: string | null;
};

export type CreateGenderInput = Partial<Omit<GenderRow, "id">> & {
  id?: number;
};

export type UpdateGenderInput = Partial<Omit<GenderRow, "id">>;

const tableName = "gender" as const;

const selectGender = "id, gender_name";

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

async function nextGenderId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف لنوع الجنس");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(): Promise<GenderRow[]> {
  const { data, error } = await supabase
    .from(tableName)
    .select(selectGender)
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات نوع الجنس");
  }
  return (data as unknown as GenderRow[] | null) ?? [];
}

export async function getById(id: number | string): Promise<GenderRow> {
  const rowId = parseNumericId(id, "رقم نوع الجنس");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectGender)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات نوع الجنس");
  }
  return data as unknown as GenderRow;
}

export async function createGender(input: CreateGenderInput): Promise<GenderRow> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextGenderId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectGender)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل نوع الجنس");
  }
  return data as unknown as GenderRow;
}

export async function updateGender(
  id: number | string,
  patch: UpdateGenderInput,
): Promise<GenderRow> {
  const rowId = parseNumericId(id, "رقم نوع الجنس");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectGender)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل نوع الجنس");
  }
  return data as unknown as GenderRow;
}

export async function deleteGender(id: number | string): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم نوع الجنس");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف نوع الجنس");
  }
  return data;
}
