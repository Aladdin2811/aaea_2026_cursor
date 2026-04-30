import { supabase } from "../lib/supabase";
import type { AccountTypeEmbed, BabEmbed, GeneralAccountEmbed } from "./apiBand";
import type { No3BandEmbed } from "./apiNo3";

export type BudgetsYearEmbed = {
  id: number;
  year_num: string | null;
  status: boolean | null;
};

export type BudgetsNo3Embed = {
  id: number;
  no3_name: string | null;
  no3_code: string | null;
};

export type BudgetsDetailedEmbed = {
  id: number;
  detailed_name: string | null;
  detailed_code: string | null;
};

export type BudgetsFundingTypeEmbed = {
  id: number;
  funding_type_name: string | null;
};

export type BudgetsMainTopicEmbed = {
  id: number;
  main_topic_name: string | null;
};

export type BudgetsAllAccountsEmbed = {
  id: number;
  account_name: string | null;
  code: string | null;
};

export type BudgetsRow = {
  id: number;
  account_type_id: number | null;
  general_account_id: number | null;
  bab_id: number | null;
  band_id: number | null;
  no3_id: number | null;
  detailed_id: number | null;
  year_id: number | null;
  budget_amount: string | number | null;
  funding_type_id: number | null;
  account_id: number | null;
  main_topic_id: number | null;
};

export type BudgetsWithRelations = BudgetsRow & {
  account_type: AccountTypeEmbed | AccountTypeEmbed[] | null;
  general_account: GeneralAccountEmbed | GeneralAccountEmbed[] | null;
  bab: BabEmbed | BabEmbed[] | null;
  band: No3BandEmbed | No3BandEmbed[] | null;
  no3: BudgetsNo3Embed | BudgetsNo3Embed[] | null;
  detailed: BudgetsDetailedEmbed | BudgetsDetailedEmbed[] | null;
  years: BudgetsYearEmbed | BudgetsYearEmbed[] | null;
  funding_type:
    | BudgetsFundingTypeEmbed
    | BudgetsFundingTypeEmbed[]
    | null;
  all_accounts:
    | BudgetsAllAccountsEmbed
    | BudgetsAllAccountsEmbed[]
    | null;
  main_topics: BudgetsMainTopicEmbed | BudgetsMainTopicEmbed[] | null;
};

export type CreateBudgetsInput = Partial<Omit<BudgetsRow, "id">> & {
  id?: number;
};

export type UpdateBudgetsInput = Partial<Omit<BudgetsRow, "id">>;

export type BudgetsListFilters = {
  year_id?: number | string;
  bab_id?: number | string;
  detailed_id?: number | string;
  funding_type_id?: number | string;
  main_topic_id?: number | string;
};

const tableName = "budgets" as const;

const selectBudgetsEmbed = `
  id,
  account_type_id,
  general_account_id,
  bab_id,
  band_id,
  no3_id,
  detailed_id,
  year_id,
  budget_amount,
  funding_type_id,
  account_id,
  main_topic_id,
  account_type ( id, account_type_name ),
  general_account ( id, general_account_name, general_account_code ),
  bab ( id, bab_name, bab_code ),
  band ( id, band_name, band_code ),
  no3 ( id, no3_name, no3_code ),
  detailed ( id, detailed_name, detailed_code ),
  years ( id, year_num, status ),
  funding_type ( id, funding_type_name ),
  all_accounts!budgets_account_id_fkey ( id, account_name, code ),
  main_topics ( id, main_topic_name )
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

async function nextBudgetsId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف للموازنة");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(
  filters?: BudgetsListFilters,
): Promise<BudgetsWithRelations[]> {
  let query = supabase
    .from(tableName)
    .select(selectBudgetsEmbed)
    .order("band_id", { ascending: true, nullsFirst: false })
    .order("no3_id", { ascending: true, nullsFirst: false })
    .order("detailed_id", { ascending: true, nullsFirst: false })
    .order("id", { ascending: true });

  if (filters?.year_id != null) {
    query = query.eq("year_id", parseNumericId(filters.year_id, "السنة"));
  }
  if (filters?.bab_id != null) {
    query = query.eq("bab_id", parseNumericId(filters.bab_id, "الباب"));
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
  if (filters?.main_topic_id != null) {
    query = query.eq(
      "main_topic_id",
      parseNumericId(filters.main_topic_id, "الموضوع الرئيسي"),
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات الموازنات");
  }
  return (data as unknown as BudgetsWithRelations[] | null) ?? [];
}

export async function getById(id: number | string): Promise<BudgetsWithRelations> {
  const rowId = parseNumericId(id, "رقم الموازنة");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectBudgetsEmbed)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات الموازنة");
  }
  return data as unknown as BudgetsWithRelations;
}

export async function createBudgets(
  input: CreateBudgetsInput,
): Promise<BudgetsWithRelations> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextBudgetsId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectBudgetsEmbed)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل الموازنة");
  }
  return data as unknown as BudgetsWithRelations;
}

export async function updateBudgets(
  id: number | string,
  patch: UpdateBudgetsInput,
): Promise<BudgetsWithRelations> {
  const rowId = parseNumericId(id, "رقم الموازنة");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectBudgetsEmbed)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل الموازنة");
  }
  return data as unknown as BudgetsWithRelations;
}

export async function deleteBudgets(id: number | string): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم الموازنة");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف الموازنة");
  }
  return data;
}
