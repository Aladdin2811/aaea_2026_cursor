import { supabase } from "../lib/supabase";

export type WorldClassificationRow = {
  id: number;
  world_classification_name: string | null;
  status: boolean | null;
};

/** شكل العلاقة المضمّنة في استعلامات أخرى (`world_classifications (...)`) */
export type WorldClassificationEmbedded = Pick<
  WorldClassificationRow,
  "id" | "world_classification_name"
>;

export type CreateWorldClassificationInput = Partial<
  Omit<WorldClassificationRow, "id">
> & {
  id?: number;
};

export type UpdateWorldClassificationInput = Partial<
  Omit<WorldClassificationRow, "id">
>;

export type WorldClassificationListFilters = {
  activeOnly?: boolean;
};

const tableName = "world_classifications" as const;

const selectWorldClassifications =
  "id, world_classification_name, status";

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

async function nextWorldClassificationId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف لتصنيف دول العالم");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(
  filters?: WorldClassificationListFilters,
): Promise<WorldClassificationRow[]> {
  let query = supabase
    .from(tableName)
    .select(selectWorldClassifications)
    .order("id", { ascending: true });

  if (filters?.activeOnly === true) {
    query = query.eq("status", true);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات تصنيفات دول العالم");
  }
  return (data as unknown as WorldClassificationRow[] | null) ?? [];
}

export async function getById(
  id: number | string,
): Promise<WorldClassificationRow> {
  const rowId = parseNumericId(id, "رقم التصنيف");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectWorldClassifications)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات تصنيف دول العالم");
  }
  return data as unknown as WorldClassificationRow;
}

export async function createWorldClassification(
  input: CreateWorldClassificationInput,
): Promise<WorldClassificationRow> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextWorldClassificationId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectWorldClassifications)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل تصنيف دول العالم");
  }
  return data as unknown as WorldClassificationRow;
}

export async function updateWorldClassification(
  id: number | string,
  patch: UpdateWorldClassificationInput,
): Promise<WorldClassificationRow> {
  const rowId = parseNumericId(id, "رقم التصنيف");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectWorldClassifications)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل تصنيف دول العالم");
  }
  return data as unknown as WorldClassificationRow;
}

export async function deleteWorldClassification(
  id: number | string,
): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم التصنيف");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف تصنيف دول العالم");
  }
  return data;
}
