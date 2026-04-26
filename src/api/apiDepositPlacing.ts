import { supabase } from "../lib/supabase";
import type { AccountTypeEmbed } from "./apiBand";

export type DepositPlacingYearEmbed = {
  id: number;
  year_num: string | null;
  status: boolean | null;
};

export type DepositPlacingBankEmbed = {
  id: number;
  bank_name: string | null;
};

export type DepositPlacingCurrencyEmbed = {
  id: number;
  currency_name: string | null;
  status: boolean | null;
};

export type DepositPlacingRow = {
  id: number;
  document_num: number | null;
  document_date: string | null;
  year_id: number | null;
  placing_amount: string | number | null;
  interest_rate: string | number | null;
  from_date: string | null;
  to_date: string | null;
  bank_id: number | null;
  notes: string | null;
  status: boolean | null;
  account_type_id: number | null;
  currency_id: number | null;
};

export type DepositPlacingWithRelations = DepositPlacingRow & {
  years: DepositPlacingYearEmbed | DepositPlacingYearEmbed[] | null;
  banks_dealt_with:
    | DepositPlacingBankEmbed
    | DepositPlacingBankEmbed[]
    | null;
  currency: DepositPlacingCurrencyEmbed | DepositPlacingCurrencyEmbed[] | null;
  account_type: AccountTypeEmbed | AccountTypeEmbed[] | null;
};

export type CreateDepositPlacingInput = Partial<
  Omit<DepositPlacingRow, "id">
> & {
  id?: number;
};

export type UpdateDepositPlacingInput = Partial<Omit<DepositPlacingRow, "id">>;

export type DepositPlacingListFilters = {
  year_id?: number | string;
  bank_id?: number | string;
  activeOnly?: boolean;
};

const tableName = "deposit_placing" as const;

const selectDepositPlacingEmbed = `
  id,
  document_num,
  document_date,
  year_id,
  placing_amount,
  interest_rate,
  from_date,
  to_date,
  bank_id,
  notes,
  status,
  account_type_id,
  currency_id,
  years ( id, year_num, status ),
  banks_dealt_with!deposit_placing_bank_id_fkey ( id, bank_name ),
  currency ( id, currency_name, status ),
  account_type ( id, account_type_name )
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

async function nextDepositPlacingId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف لسجل توظيف الوديعة");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(
  filters?: DepositPlacingListFilters,
): Promise<DepositPlacingWithRelations[]> {
  let query = supabase
    .from(tableName)
    .select(selectDepositPlacingEmbed)
    .order("document_date", { ascending: false, nullsFirst: false })
    .order("id", { ascending: false });

  if (filters?.year_id != null) {
    query = query.eq("year_id", parseNumericId(filters.year_id, "السنة"));
  }
  if (filters?.bank_id != null) {
    query = query.eq("bank_id", parseNumericId(filters.bank_id, "البنك"));
  }
  if (filters?.activeOnly === true) {
    query = query.eq("status", true);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات توظيف الودائع");
  }
  return (data as unknown as DepositPlacingWithRelations[] | null) ?? [];
}

export async function getById(
  id: number | string,
): Promise<DepositPlacingWithRelations> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectDepositPlacingEmbed)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات سجل توظيف الوديعة");
  }
  return data as unknown as DepositPlacingWithRelations;
}

export async function createDepositPlacing(
  input: CreateDepositPlacingInput,
): Promise<DepositPlacingWithRelations> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextDepositPlacingId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectDepositPlacingEmbed)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل توظيف الوديعة");
  }
  return data as unknown as DepositPlacingWithRelations;
}

export async function updateDepositPlacing(
  id: number | string,
  patch: UpdateDepositPlacingInput,
): Promise<DepositPlacingWithRelations> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectDepositPlacingEmbed)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل سجل توظيف الوديعة");
  }
  return data as unknown as DepositPlacingWithRelations;
}

export async function deleteDepositPlacing(
  id: number | string,
): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف سجل توظيف الوديعة");
  }
  return data;
}
