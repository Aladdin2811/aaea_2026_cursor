import { supabase } from "../lib/supabase";
import type { AccountTypeEmbed, BabEmbed, GeneralAccountEmbed } from "./apiBand";
import type { No3BandEmbed } from "./apiNo3";

export type BudgetIncreaseYearEmbed = {
  id: number;
  year_num: string | null;
  status: boolean | null;
};

export type BudgetIncreaseNo3Embed = {
  id: number;
  no3_name: string | null;
  no3_code: string | null;
};

export type BudgetIncreaseDetailedEmbed = {
  id: number;
  detailed_name: string | null;
  detailed_code: string | null;
};

export type BudgetIncreaseFundingTypeEmbed = {
  id: number;
  funding_type_name: string | null;
};

export type BudgetIncreaseRow = {
  id: number;
  account_type_id: number | null;
  general_account_id: number | null;
  bab_id: number | null;
  band_id: number | null;
  no3_id: number | null;
  detailed_id: number | null;
  year_id: number | null;
  funding_type_id: number | null;
  increase_budget: string | number | null;
  notes: string | null;
  account_id: number | null;
};

export type BudgetIncreaseWithRelations = BudgetIncreaseRow & {
  account_type: AccountTypeEmbed | AccountTypeEmbed[] | null;
  general_account: GeneralAccountEmbed | GeneralAccountEmbed[] | null;
  bab: BabEmbed | BabEmbed[] | null;
  band: No3BandEmbed | No3BandEmbed[] | null;
  no3: BudgetIncreaseNo3Embed | BudgetIncreaseNo3Embed[] | null;
  detailed: BudgetIncreaseDetailedEmbed | BudgetIncreaseDetailedEmbed[] | null;
  years: BudgetIncreaseYearEmbed | BudgetIncreaseYearEmbed[] | null;
  funding_type:
    | BudgetIncreaseFundingTypeEmbed
    | BudgetIncreaseFundingTypeEmbed[]
    | null;
};

export type CreateBudgetIncreaseInput = Partial<
  Omit<BudgetIncreaseRow, "id">
> & {
  id?: number;
};

export type UpdateBudgetIncreaseInput = Partial<
  Omit<BudgetIncreaseRow, "id">
>;

export type BudgetIncreaseListFilters = {
  year_id?: number | string;
  detailed_id?: number | string;
  funding_type_id?: number | string;
};

const tableName = "budget_increase" as const;

const selectBudgetIncreaseEmbed = `
  id,
  account_type_id,
  general_account_id,
  bab_id,
  band_id,
  no3_id,
  detailed_id,
  year_id,
  funding_type_id,
  increase_budget,
  notes,
  account_id,
  account_type ( id, account_type_name ),
  general_account ( id, general_account_name, general_account_code ),
  bab ( id, bab_name, bab_code ),
  band ( id, band_name, band_code ),
  no3 ( id, no3_name, no3_code ),
  detailed ( id, detailed_name, detailed_code ),
  years ( id, year_num, status ),
  funding_type ( id, funding_type_name )
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

async function nextBudgetIncreaseId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف لزيادة الموازنة");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(
  filters?: BudgetIncreaseListFilters,
): Promise<BudgetIncreaseWithRelations[]> {
  let query = supabase
    .from(tableName)
    .select(selectBudgetIncreaseEmbed)
    .order("year_id", { ascending: false, nullsFirst: false })
    .order("id", { ascending: false });

  if (filters?.year_id != null) {
    query = query.eq("year_id", parseNumericId(filters.year_id, "السنة"));
  }
  if (filters?.detailed_id != null) {
    query = query.eq(
      "detailed_id",
      parseNumericId(filters.detailed_id, "الحساب التفصيلي"),
    );
  }
  if (filters?.funding_type_id != null) {
    query = query.eq(
      "funding_type_id",
      parseNumericId(filters.funding_type_id, "مصدر التمويل"),
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات زيادات الموازنة");
  }
  return (data as unknown as BudgetIncreaseWithRelations[] | null) ?? [];
}

export async function getById(
  id: number | string,
): Promise<BudgetIncreaseWithRelations> {
  const rowId = parseNumericId(id, "رقم زيادة الموازنة");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectBudgetIncreaseEmbed)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات زيادة الموازنة");
  }
  return data as unknown as BudgetIncreaseWithRelations;
}

export async function createBudgetIncrease(
  input: CreateBudgetIncreaseInput,
): Promise<BudgetIncreaseWithRelations> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextBudgetIncreaseId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectBudgetIncreaseEmbed)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل زيادة الموازنة");
  }
  return data as unknown as BudgetIncreaseWithRelations;
}

export async function updateBudgetIncrease(
  id: number | string,
  patch: UpdateBudgetIncreaseInput,
): Promise<BudgetIncreaseWithRelations> {
  const rowId = parseNumericId(id, "رقم زيادة الموازنة");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectBudgetIncreaseEmbed)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل زيادة الموازنة");
  }
  return data as unknown as BudgetIncreaseWithRelations;
}

export async function deleteBudgetIncrease(
  id: number | string,
): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم زيادة الموازنة");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف زيادة الموازنة");
  }
  return data;
}
