import { supabase } from "../lib/supabase";

export type FundingTypeRow = {
  id: number;
  funding_type_name: string | null;
};

export type CreateFundingTypeInput = Partial<
  Omit<FundingTypeRow, "id">
> & {
  id?: number;
};

export type UpdateFundingTypeInput = Partial<Omit<FundingTypeRow, "id">>;

const tableName = "funding_type" as const;

const selectFundingType = "id, funding_type_name";

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

async function nextFundingTypeId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف لمصدر التمويل");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(): Promise<FundingTypeRow[]> {
  const { data, error } = await supabase
    .from(tableName)
    .select(selectFundingType)
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات مصادر التمويل");
  }
  return (data as unknown as FundingTypeRow[] | null) ?? [];
}

export async function getById(id: number | string): Promise<FundingTypeRow> {
  const rowId = parseNumericId(id, "رقم مصدر التمويل");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectFundingType)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات مصدر التمويل");
  }
  return data as unknown as FundingTypeRow;
}

export async function createFundingType(
  input: CreateFundingTypeInput,
): Promise<FundingTypeRow> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextFundingTypeId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectFundingType)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل مصدر التمويل");
  }
  return data as unknown as FundingTypeRow;
}

export async function updateFundingType(
  id: number | string,
  patch: UpdateFundingTypeInput,
): Promise<FundingTypeRow> {
  const rowId = parseNumericId(id, "رقم مصدر التمويل");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectFundingType)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل مصدر التمويل");
  }
  return data as unknown as FundingTypeRow;
}

export async function deleteFundingType(id: number | string): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم مصدر التمويل");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف مصدر التمويل");
  }
  return data;
}
