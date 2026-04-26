import { supabase } from "../lib/supabase";

export type BeneficiaryCategoryEmbed = {
  id: number;
  beneficiary_category_name: string | null;
};

export type BeneficiaryRow = {
  id: number;
  beneficiary_name: string | null;
  beneficiary_check_name: string | null;
  beneficiary_category_id: number | null;
  status: boolean | null;
  notes: string | null;
  account_num: string | null;
};

export type BeneficiaryWithRelations = BeneficiaryRow & {
  beneficiary_category:
    | BeneficiaryCategoryEmbed
    | BeneficiaryCategoryEmbed[]
    | null;
};

export type CreateBeneficiaryInput = Partial<
  Omit<BeneficiaryRow, "id">
> & {
  id?: number;
};

export type UpdateBeneficiaryInput = Partial<Omit<BeneficiaryRow, "id">>;

export type BeneficiaryListFilters = {
  beneficiary_category_id?: number | string;
  activeOnly?: boolean;
};

const tableName = "beneficiary" as const;

const selectBeneficiaryEmbed = `
  id,
  beneficiary_name,
  beneficiary_check_name,
  beneficiary_category_id,
  status,
  notes,
  account_num,
  beneficiary_category ( id, beneficiary_category_name )
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

async function nextBeneficiaryId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف للمستفيد");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(
  filters?: BeneficiaryListFilters,
): Promise<BeneficiaryWithRelations[]> {
  let query = supabase
    .from(tableName)
    .select(selectBeneficiaryEmbed)
    .order("id", { ascending: true });

  if (filters?.beneficiary_category_id != null) {
    query = query.eq(
      "beneficiary_category_id",
      parseNumericId(filters.beneficiary_category_id, "تصنيف المستفيد"),
    );
  }
  if (filters?.activeOnly === true) {
    query = query.eq("status", true);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات المستفيدين");
  }
  return (data as unknown as BeneficiaryWithRelations[] | null) ?? [];
}

export async function getById(
  id: number | string,
): Promise<BeneficiaryWithRelations> {
  const rowId = parseNumericId(id, "رقم المستفيد");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectBeneficiaryEmbed)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات المستفيد");
  }
  return data as unknown as BeneficiaryWithRelations;
}

export async function createBeneficiary(
  input: CreateBeneficiaryInput,
): Promise<BeneficiaryWithRelations> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextBeneficiaryId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectBeneficiaryEmbed)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل المستفيد");
  }
  return data as unknown as BeneficiaryWithRelations;
}

export async function updateBeneficiary(
  id: number | string,
  patch: UpdateBeneficiaryInput,
): Promise<BeneficiaryWithRelations> {
  const rowId = parseNumericId(id, "رقم المستفيد");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectBeneficiaryEmbed)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل بيانات المستفيد");
  }
  return data as unknown as BeneficiaryWithRelations;
}

export async function deleteBeneficiary(id: number | string): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم المستفيد");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف المستفيد");
  }
  return data;
}
