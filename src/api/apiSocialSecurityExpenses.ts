import { supabase } from "../lib/supabase";
import type { MonthsEmbedded } from "./apiMonths";
import type { SocialSecurityBandEmbedded } from "./apiSocialSecurityBand";
import type { SocialSecurityClassificationEmbedded } from "./apiSocialSecurityClassification";

export type SocialSecurityExpenseEmployeeEmbed = {
  id: number;
  employee_name: string | null;
};

export type SocialSecurityExpenseYearEmbed = {
  id: number;
  year_num: string | null;
  status: boolean | null;
};

export type SocialSecurityExpensesRow = {
  id: number;
  employee_id: number | null;
  year_id: number | null;
  month_id: number | null;
  social_security_band_id: number | null;
  social_security_classification_id: number | null;
  original_amount: string | number | null;
  final_amount: string | number | null;
  notes: string | null;
};

export type SocialSecurityExpensesWithRelations = SocialSecurityExpensesRow & {
  months: MonthsEmbedded | MonthsEmbedded[] | null;
  all_employees:
    | SocialSecurityExpenseEmployeeEmbed
    | SocialSecurityExpenseEmployeeEmbed[]
    | null;
  social_security_band:
    | SocialSecurityBandEmbedded
    | SocialSecurityBandEmbedded[]
    | null;
  social_security_classification:
    | SocialSecurityClassificationEmbedded
    | SocialSecurityClassificationEmbedded[]
    | null;
  years: SocialSecurityExpenseYearEmbed | SocialSecurityExpenseYearEmbed[] | null;
};

export type CreateSocialSecurityExpensesInput = Partial<
  Omit<SocialSecurityExpensesRow, "id">
> & {
  id?: number;
};

export type UpdateSocialSecurityExpensesInput = Partial<
  Omit<SocialSecurityExpensesRow, "id">
>;

export type SocialSecurityExpensesListFilters = {
  employee_id?: number | string;
  year_id?: number | string;
  month_id?: number | string;
  social_security_band_id?: number | string;
  social_security_classification_id?: number | string;
};

const tableName = "social_security_expenses" as const;

const selectSocialSecurityExpensesEmbed = `
  id,
  employee_id,
  year_id,
  month_id,
  social_security_band_id,
  social_security_classification_id,
  original_amount,
  final_amount,
  notes,
  months ( id, month_num, month_name1 ),
  all_employees ( id, employee_name ),
  social_security_band ( id, social_security_band_name ),
  social_security_classification ( id, social_security_classification_name ),
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

async function nextSocialSecurityExpensesId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف لمصروف الضمان الاجتماعي");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(
  filters?: SocialSecurityExpensesListFilters,
): Promise<SocialSecurityExpensesWithRelations[]> {
  let query = supabase
    .from(tableName)
    .select(selectSocialSecurityExpensesEmbed)
    .order("year_id", { ascending: true, nullsFirst: false })
    .order("month_id", { ascending: true, nullsFirst: false })
    .order("id", { ascending: true });

  if (filters?.employee_id != null) {
    query = query.eq(
      "employee_id",
      parseNumericId(filters.employee_id, "الموظف"),
    );
  }
  if (filters?.year_id != null) {
    query = query.eq("year_id", parseNumericId(filters.year_id, "السنة"));
  }
  if (filters?.month_id != null) {
    query = query.eq("month_id", parseNumericId(filters.month_id, "الشهر"));
  }
  if (filters?.social_security_band_id != null) {
    query = query.eq(
      "social_security_band_id",
      parseNumericId(filters.social_security_band_id, "بند الضمان الاجتماعي"),
    );
  }
  if (filters?.social_security_classification_id != null) {
    query = query.eq(
      "social_security_classification_id",
      parseNumericId(
        filters.social_security_classification_id,
        "التصنيف الفرعي للضمان",
      ),
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات مصروفات الضمان الاجتماعي");
  }
  return (data as unknown as SocialSecurityExpensesWithRelations[] | null) ?? [];
}

export async function getById(
  id: number | string,
): Promise<SocialSecurityExpensesWithRelations> {
  const rowId = parseNumericId(id, "رقم المصروف");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectSocialSecurityExpensesEmbed)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات مصروف الضمان الاجتماعي");
  }
  return data as unknown as SocialSecurityExpensesWithRelations;
}

export async function createSocialSecurityExpenses(
  input: CreateSocialSecurityExpensesInput,
): Promise<SocialSecurityExpensesWithRelations> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextSocialSecurityExpensesId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectSocialSecurityExpensesEmbed)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل مصروف الضمان الاجتماعي");
  }
  return data as unknown as SocialSecurityExpensesWithRelations;
}

export async function updateSocialSecurityExpenses(
  id: number | string,
  patch: UpdateSocialSecurityExpensesInput,
): Promise<SocialSecurityExpensesWithRelations> {
  const rowId = parseNumericId(id, "رقم المصروف");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectSocialSecurityExpensesEmbed)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل مصروف الضمان الاجتماعي");
  }
  return data as unknown as SocialSecurityExpensesWithRelations;
}

export async function deleteSocialSecurityExpenses(
  id: number | string,
): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم المصروف");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف مصروف الضمان الاجتماعي");
  }
  return data;
}
