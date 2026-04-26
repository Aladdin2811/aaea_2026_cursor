import { supabase } from "../lib/supabase";

export type AdditionalBudgetMemberEmbed = {
  id: number;
  member_name: string | null;
};

export type AdditionalBudgetYearEmbed = {
  id: number;
  year_num: string | null;
  status: boolean | null;
};

export type AdditionalBudgetRow = {
  id: number;
  member_id: number | null;
  year_id: number | null;
  additional_budget_amount: string | number | null;
};

export type AdditionalBudgetWithRelations = AdditionalBudgetRow & {
  members:
    | AdditionalBudgetMemberEmbed
    | AdditionalBudgetMemberEmbed[]
    | null;
  years: AdditionalBudgetYearEmbed | AdditionalBudgetYearEmbed[] | null;
};

export type CreateAdditionalBudgetInput = {
  member_id?: number | null;
  year_id?: number | null;
  additional_budget_amount?: string | number | null;
};

export type UpdateAdditionalBudgetInput = Partial<
  Pick<
    AdditionalBudgetRow,
    "member_id" | "year_id" | "additional_budget_amount"
  >
>;

const tableName = "additional_budget" as const;

const selectAdditionalBudgetEmbed = `
  id,
  member_id,
  year_id,
  additional_budget_amount,
  members ( id, member_name ),
  years ( id, year_num, status )
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

async function nextAdditionalBudgetId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف للموازنة الإضافية");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(): Promise<AdditionalBudgetWithRelations[]> {
  const { data, error } = await supabase
    .from(tableName)
    .select(selectAdditionalBudgetEmbed)
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات الموازنات الإضافية");
  }
  return (data as unknown as AdditionalBudgetWithRelations[] | null) ?? [];
}

export async function getById(
  id: number | string,
): Promise<AdditionalBudgetWithRelations> {
  const rowId = parseNumericId(id, "رقم الموازنة الإضافية");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectAdditionalBudgetEmbed)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات الموازنة الإضافية");
  }
  return data as unknown as AdditionalBudgetWithRelations;
}

export async function createAdditionalBudget(
  input: CreateAdditionalBudgetInput,
): Promise<AdditionalBudgetWithRelations> {
  const nextId = await nextAdditionalBudgetId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({
      id: nextId,
      member_id: input.member_id ?? null,
      year_id: input.year_id ?? null,
      additional_budget_amount: input.additional_budget_amount ?? null,
    })
    .select(selectAdditionalBudgetEmbed)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل الموازنة الإضافية");
  }
  return data as unknown as AdditionalBudgetWithRelations;
}

export async function updateAdditionalBudget(
  id: number | string,
  patch: UpdateAdditionalBudgetInput,
): Promise<AdditionalBudgetWithRelations> {
  const rowId = parseNumericId(id, "رقم الموازنة الإضافية");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectAdditionalBudgetEmbed)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل الموازنة الإضافية");
  }
  return data as unknown as AdditionalBudgetWithRelations;
}

export async function deleteAdditionalBudget(id: number | string): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم الموازنة الإضافية");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف الموازنة الإضافية");
  }
  return data;
}
