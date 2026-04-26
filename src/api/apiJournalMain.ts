import { supabase } from "../lib/supabase";
import type { AccountTypeEmbed } from "./apiBand";

export type JournalMainYearEmbed = {
  id: number;
  year_num: string | null;
  status: boolean | null;
};

export type JournalMainBankEmbed = {
  id: number;
  bank_name: string | null;
};

export type JournalMainDocumentTypeEmbed = {
  id: number;
  document_type_name: string | null;
  voucher_need: boolean | null;
};

export type JournalMainExchangeDocumentTypeEmbed = {
  id: number;
  exchange_document_name: string | null;
};

export type JournalMainBeneficiaryEmbed = {
  id: number;
  beneficiary_name: string | null;
};

export type JournalMainRow = {
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

export type JournalMainWithRelations = JournalMainRow & {
  account_type: AccountTypeEmbed | AccountTypeEmbed[] | null;
  document_type:
    | JournalMainDocumentTypeEmbed
    | JournalMainDocumentTypeEmbed[]
    | null;
  exchange_document_type:
    | JournalMainExchangeDocumentTypeEmbed
    | JournalMainExchangeDocumentTypeEmbed[]
    | null;
  beneficiary: JournalMainBeneficiaryEmbed | JournalMainBeneficiaryEmbed[] | null;
  years: JournalMainYearEmbed | JournalMainYearEmbed[] | null;
  banks_dealt_with:
    | JournalMainBankEmbed
    | JournalMainBankEmbed[]
    | null;
};

export type CreateJournalMainInput = Partial<
  Omit<JournalMainRow, "id">
> & {
  id?: number;
};

export type UpdateJournalMainInput = Partial<Omit<JournalMainRow, "id">>;

export type JournalMainListFilters = {
  year_id?: number | string;
  account_type_id?: number | string;
  document_type_id?: number | string;
  user_id?: number | string;
  beneficiary_id?: number | string;
  bank_id?: number | string;
};

const tableName = "journal_main" as const;

const selectJournalMainEmbed = `
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
  banks_dealt_with!journal_main_bank_id_fkey ( id, bank_name )
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

async function nextJournalMainId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف لقيد اليومية");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(
  filters?: JournalMainListFilters,
): Promise<JournalMainWithRelations[]> {
  let query = supabase
    .from(tableName)
    .select(selectJournalMainEmbed)
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
    throw new Error("لا يمكن الحصول على بيانات قيود اليومية");
  }
  return (data as unknown as JournalMainWithRelations[] | null) ?? [];
}

export async function getById(
  id: number | string,
): Promise<JournalMainWithRelations> {
  const rowId = parseNumericId(id, "رقم القيد");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectJournalMainEmbed)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات القيد");
  }
  return data as unknown as JournalMainWithRelations;
}

export async function createJournalMain(
  input: CreateJournalMainInput,
): Promise<JournalMainWithRelations> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextJournalMainId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectJournalMainEmbed)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل القيد");
  }
  return data as unknown as JournalMainWithRelations;
}

export async function updateJournalMain(
  id: number | string,
  patch: UpdateJournalMainInput,
): Promise<JournalMainWithRelations> {
  const rowId = parseNumericId(id, "رقم القيد");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectJournalMainEmbed)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل القيد");
  }
  return data as unknown as JournalMainWithRelations;
}

export async function deleteJournalMain(id: number | string): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم القيد");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف القيد");
  }
  return data;
}
