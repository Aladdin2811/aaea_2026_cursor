import { supabase } from "../lib/supabase";
import type {
  AccountTypeEmbed,
  BabEmbed,
  GeneralAccountEmbed,
} from "./apiBand";

export type SubAccountAnalyticalEmbed = {
  id: number;
  analytical_name: string | null;
  analytical_code: string | null;
};

export type SubAccountRow = {
  id: number;
  sub_account_name: string | null;
  sub_account_code: string | null;
  analytical_id: number | null;
  description: string | null;
  status: boolean | null;
  account_type_id: number | null;
  general_account_id: number | null;
  bab_id: number | null;
  nature_of_account: number | null;
  sort: number | null;
};

export type SubAccountWithRelations = SubAccountRow & {
  account_type: AccountTypeEmbed | AccountTypeEmbed[] | null;
  general_account: GeneralAccountEmbed | GeneralAccountEmbed[] | null;
  bab: BabEmbed | BabEmbed[] | null;
  analytical: SubAccountAnalyticalEmbed | SubAccountAnalyticalEmbed[] | null;
};

/** شكل العلاقة المضمّنة في استعلامات أخرى (`sub_account (...)`) */
export type SubAccountEmbedded = Pick<
  SubAccountRow,
  "id" | "sub_account_name" | "sub_account_code"
>;

export type CreateSubAccountInput = Partial<Omit<SubAccountRow, "id">> & {
  id?: number;
};

export type UpdateSubAccountInput = Partial<Omit<SubAccountRow, "id">>;

export type SubAccountListFilters = {
  analytical_id?: number | string;
  account_type_id?: number | string;
  general_account_id?: number | string;
  bab_id?: number | string;
  activeOnly?: boolean;
};

const tableName = "sub_account" as const;

const selectSubAccountEmbed = `
  id,
  sub_account_name,
  sub_account_code,
  analytical_id,
  description,
  status,
  account_type_id,
  general_account_id,
  bab_id,
  nature_of_account,
  sort,
  account_type ( id, account_type_name ),
  general_account ( id, general_account_name, general_account_code ),
  bab ( id, bab_name, bab_code ),
  analytical ( id, analytical_name, analytical_code )
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

async function nextSubAccountId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف للحساب الفرعي");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(
  filters?: SubAccountListFilters,
): Promise<SubAccountWithRelations[]> {
  let query = supabase
    .from(tableName)
    .select(selectSubAccountEmbed)
    .order("bab_id", { ascending: true, nullsFirst: false })
    .order("general_account_id", { ascending: true, nullsFirst: false })
    .order("sort", { ascending: true, nullsFirst: false })
    .order("id", { ascending: true });

  if (filters?.analytical_id != null) {
    query = query.eq(
      "analytical_id",
      parseNumericId(filters.analytical_id, "الحساب التحليلي"),
    );
  }
  if (filters?.account_type_id != null) {
    query = query.eq(
      "account_type_id",
      parseNumericId(filters.account_type_id, "نوع الحساب"),
    );
  }
  if (filters?.general_account_id != null) {
    query = query.eq(
      "general_account_id",
      parseNumericId(filters.general_account_id, "الحساب العام"),
    );
  }
  if (filters?.bab_id != null) {
    query = query.eq("bab_id", parseNumericId(filters.bab_id, "الباب"));
  }
  if (filters?.activeOnly === true) {
    query = query.eq("status", true);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات الحسابات الفرعية");
  }
  return (data as unknown as SubAccountWithRelations[] | null) ?? [];
}

export async function getById(id: number | string): Promise<SubAccountWithRelations> {
  const rowId = parseNumericId(id, "رقم الحساب الفرعي");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectSubAccountEmbed)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات الحساب الفرعي");
  }
  return data as unknown as SubAccountWithRelations;
}

export async function createSubAccount(
  input: CreateSubAccountInput,
): Promise<SubAccountWithRelations> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextSubAccountId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectSubAccountEmbed)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل الحساب الفرعي");
  }
  return data as unknown as SubAccountWithRelations;
}

export async function updateSubAccount(
  id: number | string,
  patch: UpdateSubAccountInput,
): Promise<SubAccountWithRelations> {
  const rowId = parseNumericId(id, "رقم الحساب الفرعي");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectSubAccountEmbed)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل الحساب الفرعي");
  }
  return data as unknown as SubAccountWithRelations;
}

export async function deleteSubAccount(id: number | string): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم الحساب الفرعي");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف الحساب الفرعي");
  }
  return data;
}
