import { supabase } from "../lib/supabase";
import type {
  AccountTypeEmbed,
  BabEmbed,
  GeneralAccountEmbed,
} from "./apiBand";

export type AnalyticalRow = {
  id: number;
  analytical_name: string | null;
  analytical_code: string | null;
  description: string | null;
  havebudget: boolean | null;
  directexchange: boolean | null;
  status: boolean | null;
  account_type_id: number | null;
  general_account_id: number | null;
  bab_id: number | null;
  nature_of_account: number | null;
  sort: number | null;
};

export type AnalyticalWithRelations = AnalyticalRow & {
  account_type: AccountTypeEmbed | AccountTypeEmbed[] | null;
  general_account: GeneralAccountEmbed | GeneralAccountEmbed[] | null;
  bab: BabEmbed | BabEmbed[] | null;
};

export type CreateAnalyticalInput = Partial<Omit<AnalyticalRow, "id">> & {
  id?: number;
};

export type UpdateAnalyticalInput = Partial<Omit<AnalyticalRow, "id">>;

export type AnalyticalListFilters = {
  bab_id?: number | string;
  general_account_id?: number | string;
  /** عند `true` يقتصر على الصفوف ذات `status === true` */
  activeOnly?: boolean;
};

const tableName = "analytical" as const;

const selectAnalyticalEmbed = `
  id,
  analytical_name,
  analytical_code,
  description,
  havebudget,
  directexchange,
  status,
  account_type_id,
  general_account_id,
  bab_id,
  nature_of_account,
  sort,
  account_type ( id, account_type_name ),
  general_account ( id, general_account_name, general_account_code ),
  bab ( id, bab_name, bab_code )
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

async function nextAnalyticalId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف للحساب التحليلي");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(
  filters?: AnalyticalListFilters,
): Promise<AnalyticalWithRelations[]> {
  let query = supabase
    .from(tableName)
    .select(selectAnalyticalEmbed)
    .order("sort", { ascending: true, nullsFirst: false })
    .order("id", { ascending: true });

  if (filters?.bab_id != null) {
    query = query.eq("bab_id", parseNumericId(filters.bab_id, "الباب"));
  }
  if (filters?.general_account_id != null) {
    query = query.eq(
      "general_account_id",
      parseNumericId(filters.general_account_id, "الحساب العام"),
    );
  }
  if (filters?.activeOnly === true) {
    query = query.eq("status", true);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات الحسابات التحليلية");
  }
  return (data as unknown as AnalyticalWithRelations[] | null) ?? [];
}

export async function getById(
  id: number | string,
): Promise<AnalyticalWithRelations> {
  const rowId = parseNumericId(id, "رقم الحساب التحليلي");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectAnalyticalEmbed)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات الحساب التحليلي");
  }
  return data as unknown as AnalyticalWithRelations;
}

export async function createAnalytical(
  input: CreateAnalyticalInput,
): Promise<AnalyticalWithRelations> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextAnalyticalId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectAnalyticalEmbed)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل الحساب التحليلي");
  }
  return data as unknown as AnalyticalWithRelations;
}

export async function updateAnalytical(
  id: number | string,
  patch: UpdateAnalyticalInput,
): Promise<AnalyticalWithRelations> {
  const rowId = parseNumericId(id, "رقم الحساب التحليلي");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectAnalyticalEmbed)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل بيانات الحساب التحليلي");
  }
  return data as unknown as AnalyticalWithRelations;
}

export async function deleteAnalytical(id: number | string): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم الحساب التحليلي");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف الحساب التحليلي");
  }
  return data;
}
