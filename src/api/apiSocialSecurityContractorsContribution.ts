import { supabase } from "../lib/supabase";

export type SocialSecurityContractorsContributionRow = {
  id: number;
  contractors_contribution_percentage: string | number | null;
};

export type CreateSocialSecurityContractorsContributionInput = Partial<
  Omit<SocialSecurityContractorsContributionRow, "id">
> & {
  id?: number;
};

export type UpdateSocialSecurityContractorsContributionInput = Partial<
  Omit<SocialSecurityContractorsContributionRow, "id">
>;

const tableName = "social_security_contractors_contribution" as const;

const selectSocialSecurityContractorsContribution =
  "id, contractors_contribution_percentage";

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

async function nextSocialSecurityContractorsContributionId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error(
      "خطأ أثناء جلب أكبر معرّف لنسبة مساهمة المقاولين في الضمان الاجتماعي",
    );
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(): Promise<
  SocialSecurityContractorsContributionRow[]
> {
  const { data, error } = await supabase
    .from(tableName)
    .select(selectSocialSecurityContractorsContribution)
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(
      "لا يمكن الحصول على بيانات نسب مساهمة المقاولين في الضمان الاجتماعي",
    );
  }
  return (
    (data as unknown as SocialSecurityContractorsContributionRow[] | null) ??
    []
  );
}

export async function getById(
  id: number | string,
): Promise<SocialSecurityContractorsContributionRow> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectSocialSecurityContractorsContribution)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error(
      "لا يمكن الحصول على بيانات نسبة مساهمة المقاولين في الضمان الاجتماعي",
    );
  }
  return data as unknown as SocialSecurityContractorsContributionRow;
}

export async function createSocialSecurityContractorsContribution(
  input: CreateSocialSecurityContractorsContributionInput,
): Promise<SocialSecurityContractorsContributionRow> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextSocialSecurityContractorsContributionId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectSocialSecurityContractorsContribution)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(
      error.message || "لا يمكن تسجيل نسبة مساهمة المقاولين في الضمان الاجتماعي",
    );
  }
  return data as unknown as SocialSecurityContractorsContributionRow;
}

export async function updateSocialSecurityContractorsContribution(
  id: number | string,
  patch: UpdateSocialSecurityContractorsContributionInput,
): Promise<SocialSecurityContractorsContributionRow> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectSocialSecurityContractorsContribution)
    .single();

  if (error) {
    console.error(error);
    throw new Error(
      "حدث خطأ عند تعديل نسبة مساهمة المقاولين في الضمان الاجتماعي",
    );
  }
  return data as unknown as SocialSecurityContractorsContributionRow;
}

export async function deleteSocialSecurityContractorsContribution(
  id: number | string,
): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(
      "حدث خطأ عند حذف نسبة مساهمة المقاولين في الضمان الاجتماعي",
    );
  }
  return data;
}
