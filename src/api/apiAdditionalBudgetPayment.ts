import { supabase } from "../lib/supabase";

export type AdditionalBudgetPaymentMemberEmbed = {
  id: number;
  member_name: string | null;
};

export type AdditionalBudgetPaymentRow = {
  id: number;
  member_id: number | null;
  consolidated_account: string | number | null;
  organization_account: string | number | null;
  document_num: number | null;
  document_date: string | null;
};

export type AdditionalBudgetPaymentWithRelations = AdditionalBudgetPaymentRow & {
  members:
    | AdditionalBudgetPaymentMemberEmbed
    | AdditionalBudgetPaymentMemberEmbed[]
    | null;
};

export type CreateAdditionalBudgetPaymentInput = {
  member_id?: number | null;
  consolidated_account?: string | number | null;
  organization_account?: string | number | null;
  document_num?: number | null;
  document_date?: string | null;
};

export type UpdateAdditionalBudgetPaymentInput = Partial<
  Pick<
    AdditionalBudgetPaymentRow,
    | "member_id"
    | "consolidated_account"
    | "organization_account"
    | "document_num"
    | "document_date"
  >
>;

const tableName = "additional_budget_payment" as const;

const selectAdditionalBudgetPaymentEmbed = `
  id,
  member_id,
  consolidated_account,
  organization_account,
  document_num,
  document_date,
  members ( id, member_name )
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

async function nextAdditionalBudgetPaymentId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف لدفعات الموازنة الإضافية");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(): Promise<AdditionalBudgetPaymentWithRelations[]> {
  const { data, error } = await supabase
    .from(tableName)
    .select(selectAdditionalBudgetPaymentEmbed)
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات دفعات الموازنة الإضافية");
  }
  return (
    (data as unknown as AdditionalBudgetPaymentWithRelations[] | null) ?? []
  );
}

export async function getById(
  id: number | string,
): Promise<AdditionalBudgetPaymentWithRelations> {
  const rowId = parseNumericId(id, "رقم دفعة الموازنة الإضافية");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectAdditionalBudgetPaymentEmbed)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات الدفعة");
  }
  return data as unknown as AdditionalBudgetPaymentWithRelations;
}

export async function createAdditionalBudgetPayment(
  input: CreateAdditionalBudgetPaymentInput,
): Promise<AdditionalBudgetPaymentWithRelations> {
  const nextId = await nextAdditionalBudgetPaymentId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({
      id: nextId,
      member_id: input.member_id ?? null,
      consolidated_account: input.consolidated_account ?? null,
      organization_account: input.organization_account ?? null,
      document_num: input.document_num ?? null,
      document_date: input.document_date ?? null,
    })
    .select(selectAdditionalBudgetPaymentEmbed)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل دفعة الموازنة الإضافية");
  }
  return data as unknown as AdditionalBudgetPaymentWithRelations;
}

export async function updateAdditionalBudgetPayment(
  id: number | string,
  patch: UpdateAdditionalBudgetPaymentInput,
): Promise<AdditionalBudgetPaymentWithRelations> {
  const rowId = parseNumericId(id, "رقم دفعة الموازنة الإضافية");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectAdditionalBudgetPaymentEmbed)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل بيانات الدفعة");
  }
  return data as unknown as AdditionalBudgetPaymentWithRelations;
}

export async function deleteAdditionalBudgetPayment(
  id: number | string,
): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم دفعة الموازنة الإضافية");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف الدفعة");
  }
  return data;
}
