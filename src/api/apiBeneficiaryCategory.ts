import { supabase } from "../lib/supabase";

export type BeneficiaryCategoryRow = {
  id: number;
  beneficiary_category_name: string | null;
  status: boolean | null;
};

export type CreateBeneficiaryCategoryInput = Partial<
  Omit<BeneficiaryCategoryRow, "id">
> & {
  id?: number;
};

export type UpdateBeneficiaryCategoryInput = Partial<
  Omit<BeneficiaryCategoryRow, "id">
>;

export type BeneficiaryCategoryListFilters = {
  activeOnly?: boolean;
};

const tableName = "beneficiary_category" as const;

const selectBeneficiaryCategory = `
  id,
  beneficiary_category_name,
  status
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

async function nextBeneficiaryCategoryId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف لتصنيف المستفيد");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(
  filters?: BeneficiaryCategoryListFilters,
): Promise<BeneficiaryCategoryRow[]> {
  let query = supabase
    .from(tableName)
    .select(selectBeneficiaryCategory)
    .order("id", { ascending: true });

  if (filters?.activeOnly === true) {
    query = query.eq("status", true);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على تصنيفات المستفيدين");
  }
  return (data as unknown as BeneficiaryCategoryRow[] | null) ?? [];
}

export async function getById(
  id: number | string,
): Promise<BeneficiaryCategoryRow> {
  const rowId = parseNumericId(id, "رقم التصنيف");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectBeneficiaryCategory)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات التصنيف");
  }
  return data as unknown as BeneficiaryCategoryRow;
}

export async function createBeneficiaryCategory(
  input: CreateBeneficiaryCategoryInput,
): Promise<BeneficiaryCategoryRow> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextBeneficiaryCategoryId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectBeneficiaryCategory)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل التصنيف");
  }
  return data as unknown as BeneficiaryCategoryRow;
}

export async function updateBeneficiaryCategory(
  id: number | string,
  patch: UpdateBeneficiaryCategoryInput,
): Promise<BeneficiaryCategoryRow> {
  const rowId = parseNumericId(id, "رقم التصنيف");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectBeneficiaryCategory)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل التصنيف");
  }
  return data as unknown as BeneficiaryCategoryRow;
}

export async function deleteBeneficiaryCategory(
  id: number | string,
): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم التصنيف");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف التصنيف");
  }
  return data;
}
