import { supabase } from "../lib/supabase";

export type LivingCostIncreaseRow = {
  id: number;
  living_cost_increase_percentage: string | number | null;
};

export type CreateLivingCostIncreaseInput = Partial<
  Omit<LivingCostIncreaseRow, "id">
> & {
  id?: number;
};

export type UpdateLivingCostIncreaseInput = Partial<
  Omit<LivingCostIncreaseRow, "id">
>;

const tableName = "living_cost_increase" as const;

const selectLivingCostIncrease = "id, living_cost_increase_percentage";

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

async function nextLivingCostIncreaseId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error(
      "خطأ أثناء جلب أكبر معرّف لنسبة الزيادة في تعويض غلاء المعيشة",
    );
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(): Promise<LivingCostIncreaseRow[]> {
  const { data, error } = await supabase
    .from(tableName)
    .select(selectLivingCostIncrease)
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(
      "لا يمكن الحصول على بيانات نسبة الزيادة في تعويض غلاء المعيشة",
    );
  }
  return (data as unknown as LivingCostIncreaseRow[] | null) ?? [];
}

export async function getById(
  id: number | string,
): Promise<LivingCostIncreaseRow> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectLivingCostIncrease)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error(
      "لا يمكن الحصول على بيانات نسبة الزيادة في تعويض غلاء المعيشة",
    );
  }
  return data as unknown as LivingCostIncreaseRow;
}

export async function createLivingCostIncrease(
  input: CreateLivingCostIncreaseInput,
): Promise<LivingCostIncreaseRow> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextLivingCostIncreaseId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectLivingCostIncrease)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(
      error.message || "لا يمكن تسجيل نسبة الزيادة في تعويض غلاء المعيشة",
    );
  }
  return data as unknown as LivingCostIncreaseRow;
}

export async function updateLivingCostIncrease(
  id: number | string,
  patch: UpdateLivingCostIncreaseInput,
): Promise<LivingCostIncreaseRow> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectLivingCostIncrease)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل نسبة الزيادة في تعويض غلاء المعيشة");
  }
  return data as unknown as LivingCostIncreaseRow;
}

export async function deleteLivingCostIncrease(
  id: number | string,
): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف نسبة الزيادة في تعويض غلاء المعيشة");
  }
  return data;
}
