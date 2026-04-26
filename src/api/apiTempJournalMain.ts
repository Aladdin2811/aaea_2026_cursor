import { supabase } from "../lib/supabase";
import type { AccountTypeEmbed } from "./apiBand";

export type TempJournalMainYearEmbed = {
  id: number;
  year_num: string | null;
  status: boolean | null;
};

export type TempJournalMainBankEmbed = {
  id: number;
  bank_name: string | null;
};

export type TempJournalMainDocumentTypeEmbed = {
  id: number;
  document_type_name: string | null;
  voucher_need: boolean | null;
};

export type TempJournalMainExchangeDocumentTypeEmbed = {
  id: number;
  exchange_document_name: string | null;
};

export type TempJournalMainBeneficiaryEmbed = {
  id: number;
  beneficiary_name: string | null;
};

export type TempJournalMainRow = {
  id: number;
  account_type_id: number;
  document_type_id: number;
  document_num: number;
  document_date: string;
  exchange_document_type_id: number | null;
  bank_id: number | null;
  exchange_num: number | null;
  beneficiary_id: number | null;
  notes: string;
  year_id: number;
  check_cashed: boolean | null;
  financial_approved: boolean | null;
  auditor_approved: boolean | null;
  management_approved: boolean | null;
  user_id: number;
  closing_entry: boolean | null;
  to_edit: boolean | null;
  canceled_check: boolean | null;
  estimated: boolean | null;
  handing_over: boolean | null;
};

export type TempJournalMainWithRelations = TempJournalMainRow & {
  account_type: AccountTypeEmbed | AccountTypeEmbed[] | null;
  document_type:
    | TempJournalMainDocumentTypeEmbed
    | TempJournalMainDocumentTypeEmbed[]
    | null;
  exchange_document_type:
    | TempJournalMainExchangeDocumentTypeEmbed
    | TempJournalMainExchangeDocumentTypeEmbed[]
    | null;
  beneficiary:
    | TempJournalMainBeneficiaryEmbed
    | TempJournalMainBeneficiaryEmbed[]
    | null;
  years: TempJournalMainYearEmbed | TempJournalMainYearEmbed[] | null;
  banks_dealt_with:
    | TempJournalMainBankEmbed
    | TempJournalMainBankEmbed[]
    | null;
};

export type CreateTempJournalMainInput = Partial<
  Omit<TempJournalMainRow, "id">
> & {
  id?: number;
};

export type UpdateTempJournalMainInput = Partial<Omit<TempJournalMainRow, "id">>;

export type TempJournalMainListFilters = {
  year_id?: number | string;
  account_type_id?: number | string;
  document_type_id?: number | string;
  user_id?: number | string;
  beneficiary_id?: number | string;
  bank_id?: number | string;
};

const tableName = "temp_journal_main" as const;

const selectTempJournalMainEmbed = `
  id,
  account_type_id,
  document_type_id,
  document_num,
  document_date,
  exchange_document_type_id,
  bank_id,
  exchange_num,
  beneficiary_id,
  notes,
  year_id,
  check_cashed,
  financial_approved,
  auditor_approved,
  management_approved,
  user_id,
  closing_entry,
  to_edit,
  canceled_check,
  estimated,
  handing_over,
  account_type ( id, account_type_name ),
  document_type ( id, document_type_name, voucher_need ),
  exchange_document_type ( id, exchange_document_name ),
  beneficiary ( id, beneficiary_name ),
  years ( id, year_num, status ),
  banks_dealt_with!temp_journal_main_bank_id_fkey ( id, bank_name )
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

async function nextTempJournalMainId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف لقيد اليومية المؤقت");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(
  filters?: TempJournalMainListFilters,
): Promise<TempJournalMainWithRelations[]> {
  let query = supabase
    .from(tableName)
    .select(selectTempJournalMainEmbed)
    .order("year_id", { ascending: true })
    .order("document_date", { ascending: true })
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
  if (filters?.document_type_id != null) {
    query = query.eq(
      "document_type_id",
      parseNumericId(filters.document_type_id, "نوع المستند"),
    );
  }
  if (filters?.user_id != null) {
    query = query.eq("user_id", parseNumericId(filters.user_id, "المستخدم"));
  }
  if (filters?.beneficiary_id != null) {
    query = query.eq(
      "beneficiary_id",
      parseNumericId(filters.beneficiary_id, "المستفيد"),
    );
  }
  if (filters?.bank_id != null) {
    query = query.eq("bank_id", parseNumericId(filters.bank_id, "البنك"));
  }

  const { data, error } = await query;

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات قيود اليومية المؤقتة");
  }
  return (data as unknown as TempJournalMainWithRelations[] | null) ?? [];
}

export async function getById(
  id: number | string,
): Promise<TempJournalMainWithRelations> {
  const rowId = parseNumericId(id, "رقم القيد");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectTempJournalMainEmbed)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات القيد المؤقت");
  }
  return data as unknown as TempJournalMainWithRelations;
}

export async function createTempJournalMain(
  input: CreateTempJournalMainInput,
): Promise<TempJournalMainWithRelations> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextTempJournalMainId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectTempJournalMainEmbed)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل القيد المؤقت");
  }
  return data as unknown as TempJournalMainWithRelations;
}

export async function updateTempJournalMain(
  id: number | string,
  patch: UpdateTempJournalMainInput,
): Promise<TempJournalMainWithRelations> {
  const rowId = parseNumericId(id, "رقم القيد");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectTempJournalMainEmbed)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل القيد المؤقت");
  }
  return data as unknown as TempJournalMainWithRelations;
}

export async function deleteTempJournalMain(
  id: number | string,
): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم القيد");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف القيد المؤقت");
  }
  return data;
}
