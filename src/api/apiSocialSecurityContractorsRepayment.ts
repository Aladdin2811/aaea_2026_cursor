import { supabase } from "../lib/supabase";

export type SocialSecurityContractorsRepaymentRow = {
  id: number;
  contractors_repayment: string | number | null;
};

export type CreateSocialSecurityContractorsRepaymentInput = Partial<
  Omit<SocialSecurityContractorsRepaymentRow, "id">
> & {
  id?: number;
};

export type UpdateSocialSecurityContractorsRepaymentInput = Partial<
  Omit<SocialSecurityContractorsRepaymentRow, "id">
>;

const tableName = "social_security_contractors_repayment" as const;

const selectSocialSecurityContractorsRepayment =
  "id, contractors_repayment";

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

async function nextSocialSecurityContractorsRepaymentId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error(
      "خطأ أثناء جلب أكبر معرّف لسداد المقاولين في الضمان الاجتماعي",
    );
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(): Promise<
  SocialSecurityContractorsRepaymentRow[]
> {
  const { data, error } = await supabase
    .from(tableName)
    .select(selectSocialSecurityContractorsRepayment)
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(
      "لا يمكن الحصول على بيانات سداد المقاولين في الضمان الاجتماعي",
    );
  }
  return (
    (data as unknown as SocialSecurityContractorsRepaymentRow[] | null) ?? []
  );
}

export async function getById(
  id: number | string,
): Promise<SocialSecurityContractorsRepaymentRow> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectSocialSecurityContractorsRepayment)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error(
      "لا يمكن الحصول على بيانات سداد المقاولين في الضمان الاجتماعي",
    );
  }
  return data as unknown as SocialSecurityContractorsRepaymentRow;
}

export async function createSocialSecurityContractorsRepayment(
  input: CreateSocialSecurityContractorsRepaymentInput,
): Promise<SocialSecurityContractorsRepaymentRow> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextSocialSecurityContractorsRepaymentId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectSocialSecurityContractorsRepayment)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(
      error.message || "لا يمكن تسجيل سداد المقاولين في الضمان الاجتماعي",
    );
  }
  return data as unknown as SocialSecurityContractorsRepaymentRow;
}

export async function updateSocialSecurityContractorsRepayment(
  id: number | string,
  patch: UpdateSocialSecurityContractorsRepaymentInput,
): Promise<SocialSecurityContractorsRepaymentRow> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectSocialSecurityContractorsRepayment)
    .single();

  if (error) {
    console.error(error);
    throw new Error(
      "حدث خطأ عند تعديل سداد المقاولين في الضمان الاجتماعي",
    );
  }
  return data as unknown as SocialSecurityContractorsRepaymentRow;
}

export async function deleteSocialSecurityContractorsRepayment(
  id: number | string,
): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف سداد المقاولين في الضمان الاجتماعي");
  }
  return data;
}
