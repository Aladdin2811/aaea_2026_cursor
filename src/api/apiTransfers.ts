import { supabase } from "../lib/supabase";
import type {
  AccountTypeEmbed,
  BabEmbed,
  GeneralAccountEmbed,
} from "./apiBand";
import type { No3BandEmbed } from "./apiNo3";

export type TransfersYearEmbed = {
  id: number;
  year_num: string | null;
  status: boolean | null;
};

export type TransfersNo3Embed = {
  id: number;
  no3_name: string | null;
  no3_code: string | null;
};

export type TransfersDetailedEmbed = {
  id: number;
  detailed_name: string | null;
  detailed_code: string | null;
};

export type TransfersAllAccountsEmbed = {
  id: number;
  account_name: string | null;
  code: string | null;
};

export type TransfersRow = {
  id: number;
  year_id: number | null;
  transfer_from: string | number | null;
  transfer_to: string | number | null;
  transfer_date: string | null;
  account_type_id: number | null;
  general_account_id: number | null;
  bab_id: number | null;
  band_id: number | null;
  no3_id: number | null;
  detailed_id: number | null;
  notes: string | null;
  account_id: number | null;
};

export type TransfersWithRelations = TransfersRow & {
  years: TransfersYearEmbed | TransfersYearEmbed[] | null;
  account_type: AccountTypeEmbed | AccountTypeEmbed[] | null;
  general_account: GeneralAccountEmbed | GeneralAccountEmbed[] | null;
  bab: BabEmbed | BabEmbed[] | null;
  band: No3BandEmbed | No3BandEmbed[] | null;
  no3: TransfersNo3Embed | TransfersNo3Embed[] | null;
  detailed: TransfersDetailedEmbed | TransfersDetailedEmbed[] | null;
  all_accounts:
    | TransfersAllAccountsEmbed
    | TransfersAllAccountsEmbed[]
    | null;
};

export type CreateTransfersInput = Partial<Omit<TransfersRow, "id">> & {
  id?: number;
};

export type UpdateTransfersInput = Partial<Omit<TransfersRow, "id">>;

export type TransfersListFilters = {
  year_id?: number | string;
  account_type_id?: number | string;
  general_account_id?: number | string;
  bab_id?: number | string;
  band_id?: number | string;
  no3_id?: number | string;
  detailed_id?: number | string;
  account_id?: number | string;
};

const tableName = "transfers" as const;

const selectTransfersEmbed = `
  id,
  year_id,
  transfer_from,
  transfer_to,
  transfer_date,
  account_type_id,
  general_account_id,
  bab_id,
  band_id,
  no3_id,
  detailed_id,
  notes,
  account_id,
  years ( id, year_num, status ),
  account_type ( id, account_type_name ),
  general_account ( id, general_account_name, general_account_code ),
  bab ( id, bab_name, bab_code ),
  band ( id, band_name, band_code ),
  no3 ( id, no3_name, no3_code ),
  detailed ( id, detailed_name, detailed_code ),
  all_accounts ( id, account_name, code )
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

async function nextTransfersId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف للتحويلات");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(
  filters?: TransfersListFilters,
): Promise<TransfersWithRelations[]> {
  let query = supabase
    .from(tableName)
    .select(selectTransfersEmbed)
    .order("year_id", { ascending: true, nullsFirst: false })
    .order("transfer_date", { ascending: false, nullsFirst: false })
    .order("id", { ascending: true });

  if (filters?.year_id != null) {
    query = query.eq("year_id", parseNumericId(filters.year_id, "السنة"));
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
  if (filters?.band_id != null) {
    query = query.eq("band_id", parseNumericId(filters.band_id, "البند"));
  }
  if (filters?.no3_id != null) {
    query = query.eq("no3_id", parseNumericId(filters.no3_id, "النوع"));
  }
  if (filters?.detailed_id != null) {
    query = query.eq(
      "detailed_id",
      parseNumericId(filters.detailed_id, "الحساب التفصيلي"),
    );
  }
  if (filters?.account_id != null) {
    query = query.eq("account_id", parseNumericId(filters.account_id, "الحساب"));
  }

  const { data, error } = await query;

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات التحويلات");
  }
  return (data as unknown as TransfersWithRelations[] | null) ?? [];
}

export async function getById(id: number | string): Promise<TransfersWithRelations> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectTransfersEmbed)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات التحويل");
  }
  return data as unknown as TransfersWithRelations;
}

export async function createTransfers(
  input: CreateTransfersInput,
): Promise<TransfersWithRelations> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextTransfersId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectTransfersEmbed)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل التحويل");
  }
  return data as unknown as TransfersWithRelations;
}

export async function updateTransfers(
  id: number | string,
  patch: UpdateTransfersInput,
): Promise<TransfersWithRelations> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectTransfersEmbed)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل التحويل");
  }
  return data as unknown as TransfersWithRelations;
}

export async function deleteTransfers(id: number | string): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف التحويل");
  }
  return data;
}
