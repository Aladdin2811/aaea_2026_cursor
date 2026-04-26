import { supabase } from "../lib/supabase";

export type SocialSecurityEmployeeContributionRow = {
  id: number;
  employee_contribution_percentage: string | number | null;
};

export type CreateSocialSecurityEmployeeContributionInput = Partial<
  Omit<SocialSecurityEmployeeContributionRow, "id">
> & {
  id?: number;
};

export type UpdateSocialSecurityEmployeeContributionInput = Partial<
  Omit<SocialSecurityEmployeeContributionRow, "id">
>;

const tableName = "social_security_employee_contribution" as const;

const selectSocialSecurityEmployeeContribution =
  "id, employee_contribution_percentage";

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

async function nextSocialSecurityEmployeeContributionId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error(
      "خطأ أثناء جلب أكبر معرّف لنسبة مساهمة الموظف في الضمان الاجتماعي",
    );
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(): Promise<
  SocialSecurityEmployeeContributionRow[]
> {
  const { data, error } = await supabase
    .from(tableName)
    .select(selectSocialSecurityEmployeeContribution)
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(
      "لا يمكن الحصول على بيانات نسب مساهمة الموظف في الضمان الاجتماعي",
    );
  }
  return (
    (data as unknown as SocialSecurityEmployeeContributionRow[] | null) ?? []
  );
}

export async function getById(
  id: number | string,
): Promise<SocialSecurityEmployeeContributionRow> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectSocialSecurityEmployeeContribution)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error(
      "لا يمكن الحصول على بيانات نسبة مساهمة الموظف في الضمان الاجتماعي",
    );
  }
  return data as unknown as SocialSecurityEmployeeContributionRow;
}

export async function createSocialSecurityEmployeeContribution(
  input: CreateSocialSecurityEmployeeContributionInput,
): Promise<SocialSecurityEmployeeContributionRow> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextSocialSecurityEmployeeContributionId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectSocialSecurityEmployeeContribution)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(
      error.message || "لا يمكن تسجيل نسبة مساهمة الموظف في الضمان الاجتماعي",
    );
  }
  return data as unknown as SocialSecurityEmployeeContributionRow;
}

export async function updateSocialSecurityEmployeeContribution(
  id: number | string,
  patch: UpdateSocialSecurityEmployeeContributionInput,
): Promise<SocialSecurityEmployeeContributionRow> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectSocialSecurityEmployeeContribution)
    .single();

  if (error) {
    console.error(error);
    throw new Error(
      "حدث خطأ عند تعديل نسبة مساهمة الموظف في الضمان الاجتماعي",
    );
  }
  return data as unknown as SocialSecurityEmployeeContributionRow;
}

export async function deleteSocialSecurityEmployeeContribution(
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
      "حدث خطأ عند حذف نسبة مساهمة الموظف في الضمان الاجتماعي",
    );
  }
  return data;
}
