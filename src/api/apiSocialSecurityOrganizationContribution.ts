import { supabase } from "../lib/supabase";

export type SocialSecurityOrganizationContributionRow = {
  id: number;
  organization_contribution_percentage: string | number | null;
};

export type CreateSocialSecurityOrganizationContributionInput = Partial<
  Omit<SocialSecurityOrganizationContributionRow, "id">
> & {
  id?: number;
};

export type UpdateSocialSecurityOrganizationContributionInput = Partial<
  Omit<SocialSecurityOrganizationContributionRow, "id">
>;

const tableName = "social_security_organization_contribution" as const;

const selectSocialSecurityOrganizationContribution =
  "id, organization_contribution_percentage";

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

async function nextSocialSecurityOrganizationContributionId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error(
      "خطأ أثناء جلب أكبر معرّف لنسبة مساهمة المنظمة في الضمان الاجتماعي",
    );
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(): Promise<
  SocialSecurityOrganizationContributionRow[]
> {
  const { data, error } = await supabase
    .from(tableName)
    .select(selectSocialSecurityOrganizationContribution)
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(
      "لا يمكن الحصول على بيانات نسب مساهمة المنظمة في الضمان الاجتماعي",
    );
  }
  return (
    (data as unknown as SocialSecurityOrganizationContributionRow[] | null) ??
    []
  );
}

export async function getById(
  id: number | string,
): Promise<SocialSecurityOrganizationContributionRow> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectSocialSecurityOrganizationContribution)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error(
      "لا يمكن الحصول على بيانات نسبة مساهمة المنظمة في الضمان الاجتماعي",
    );
  }
  return data as unknown as SocialSecurityOrganizationContributionRow;
}

export async function createSocialSecurityOrganizationContribution(
  input: CreateSocialSecurityOrganizationContributionInput,
): Promise<SocialSecurityOrganizationContributionRow> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextSocialSecurityOrganizationContributionId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectSocialSecurityOrganizationContribution)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(
      error.message ||
        "لا يمكن تسجيل نسبة مساهمة المنظمة في الضمان الاجتماعي",
    );
  }
  return data as unknown as SocialSecurityOrganizationContributionRow;
}

export async function updateSocialSecurityOrganizationContribution(
  id: number | string,
  patch: UpdateSocialSecurityOrganizationContributionInput,
): Promise<SocialSecurityOrganizationContributionRow> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectSocialSecurityOrganizationContribution)
    .single();

  if (error) {
    console.error(error);
    throw new Error(
      "حدث خطأ عند تعديل نسبة مساهمة المنظمة في الضمان الاجتماعي",
    );
  }
  return data as unknown as SocialSecurityOrganizationContributionRow;
}

export async function deleteSocialSecurityOrganizationContribution(
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
      "حدث خطأ عند حذف نسبة مساهمة المنظمة في الضمان الاجتماعي",
    );
  }
  return data;
}
