import { supabase } from "../lib/supabase";
import type {
  AccountTypeEmbed,
  BabEmbed,
  GeneralAccountEmbed,
} from "./apiBand";

export type TempJournalDetailsYearEmbed = {
  id: number;
  year_num: string | null;
  status: boolean | null;
};

export type TempJournalDetailsTempJournalMainEmbed = {
  id: number;
  document_num: number;
  document_date: string;
  year_id: number;
  notes: string;
};

export type TempJournalDetailsFundingTypeEmbed = {
  id: number;
  funding_type_name: string | null;
};

export type TempJournalDetailsBandEmbed = {
  id: number;
  band_name: string | null;
  band_code: string | null;
};

export type TempJournalDetailsNo3Embed = {
  id: number;
  no3_name: string | null;
  no3_code: string | null;
};

export type TempJournalDetailsDetailedEmbed = {
  id: number;
  detailed_name: string | null;
  detailed_code: string | null;
};

export type TempJournalDetailsProgramEmbed = {
  id: number;
  program_name: string | null;
  program_code: string | null;
};

export type TempJournalDetailsAnalyticalEmbed = {
  id: number;
  analytical_name: string | null;
  analytical_code: string | null;
};

export type TempJournalDetailsSubAccountEmbed = {
  id: number;
};

export type TempJournalDetailsMemberEmbed = {
  id: number;
  member_name: string | null;
};

export type TempJournalDetailsEmployeeEmbed = {
  id: number;
  employee_name: string | null;
};

export type TempJournalDetailsAllAccountsEmbed = {
  id: number;
  account_name: string | null;
  code: string | null;
};

export type TempJournalDetailsDepositPlacingEmbed = {
  id: number;
  document_num: number | null;
  document_date: string | null;
  year_id: number | null;
};

export type TempJournalDetailsRow = {
  id: number;
  temp_journal_main_id: number | null;
  funding_type_id: number | null;
  dollars_debit: string | number | null;
  dollars_credit: string | number | null;
  dinar_debit: string | number | null;
  dinar_credit: string | number | null;
  euro_debit: string | number | null;
  euro_credit: string | number | null;
  account_type_id: number | null;
  general_account_id: number | null;
  bab_id: number | null;
  band_id: number | null;
  no3_id: number | null;
  detailed_id: number | null;
  program_id: number | null;
  analytical_id: number | null;
  sub_account_id: number | null;
  member_id: number | null;
  contributions_year_id: number | null;
  employee_id: number | null;
  dispatch_days_count: number | null;
  debit_credit: number | null;
  details_notes: string | null;
  to_edit: boolean | null;
  account_id: number | null;
  year_id: number | null;
  deposit_placing_id: number | null;
  prepaid: boolean | null;
};

export type TempJournalDetailsWithRelations = TempJournalDetailsRow & {
  temp_journal_main:
    | TempJournalDetailsTempJournalMainEmbed
    | TempJournalDetailsTempJournalMainEmbed[]
    | null;
  funding_type:
    | TempJournalDetailsFundingTypeEmbed
    | TempJournalDetailsFundingTypeEmbed[]
    | null;
  account_type: AccountTypeEmbed | AccountTypeEmbed[] | null;
  general_account: GeneralAccountEmbed | GeneralAccountEmbed[] | null;
  bab: BabEmbed | BabEmbed[] | null;
  band: TempJournalDetailsBandEmbed | TempJournalDetailsBandEmbed[] | null;
  no3: TempJournalDetailsNo3Embed | TempJournalDetailsNo3Embed[] | null;
  detailed:
    | TempJournalDetailsDetailedEmbed
    | TempJournalDetailsDetailedEmbed[]
    | null;
  programs: TempJournalDetailsProgramEmbed | TempJournalDetailsProgramEmbed[] | null;
  analytical:
    | TempJournalDetailsAnalyticalEmbed
    | TempJournalDetailsAnalyticalEmbed[]
    | null;
  sub_account:
    | TempJournalDetailsSubAccountEmbed
    | TempJournalDetailsSubAccountEmbed[]
    | null;
  members: TempJournalDetailsMemberEmbed | TempJournalDetailsMemberEmbed[] | null;
  all_employees:
    | TempJournalDetailsEmployeeEmbed
    | TempJournalDetailsEmployeeEmbed[]
    | null;
  all_accounts:
    | TempJournalDetailsAllAccountsEmbed
    | TempJournalDetailsAllAccountsEmbed[]
    | null;
  deposit_placing:
    | TempJournalDetailsDepositPlacingEmbed
    | TempJournalDetailsDepositPlacingEmbed[]
    | null;
  /** `year_id` → `years` */
  journal_line_year:
    | TempJournalDetailsYearEmbed
    | TempJournalDetailsYearEmbed[]
    | null;
  /** `contributions_year_id` → `years` */
  contributions_year:
    | TempJournalDetailsYearEmbed
    | TempJournalDetailsYearEmbed[]
    | null;
};

export type CreateTempJournalDetailsInput = Partial<
  Omit<TempJournalDetailsRow, "id">
> & {
  id?: number;
};

export type UpdateTempJournalDetailsInput = Partial<
  Omit<TempJournalDetailsRow, "id">
>;

export type TempJournalDetailsListFilters = {
  temp_journal_main_id?: number | string;
  year_id?: number | string;
  contributions_year_id?: number | string;
  account_type_id?: number | string;
  account_id?: number | string;
  member_id?: number | string;
  employee_id?: number | string;
  funding_type_id?: number | string;
  program_id?: number | string;
  deposit_placing_id?: number | string;
};

const tableName = "temp_journal_details" as const;

const selectTempJournalDetailsEmbed = `
  id,
  temp_journal_main_id,
  funding_type_id,
  dollars_debit,
  dollars_credit,
  dinar_debit,
  dinar_credit,
  euro_debit,
  euro_credit,
  account_type_id,
  general_account_id,
  bab_id,
  band_id,
  no3_id,
  detailed_id,
  program_id,
  analytical_id,
  sub_account_id,
  member_id,
  contributions_year_id,
  employee_id,
  dispatch_days_count,
  debit_credit,
  details_notes,
  to_edit,
  account_id,
  year_id,
  deposit_placing_id,
  prepaid,
  temp_journal_main!temp_journal_details_temp_journal_main_id_fkey ( id, document_num, document_date, year_id, notes ),
  funding_type ( id, funding_type_name ),
  account_type ( id, account_type_name ),
  general_account ( id, general_account_name, general_account_code ),
  bab ( id, bab_name, bab_code ),
  band ( id, band_name, band_code ),
  no3 ( id, no3_name, no3_code ),
  detailed ( id, detailed_name, detailed_code ),
  programs ( id, program_name, program_code ),
  analytical ( id, analytical_name, analytical_code ),
  sub_account ( id ),
  members ( id, member_name ),
  all_employees ( id, employee_name ),
  all_accounts ( id, account_name, code ),
  deposit_placing ( id, document_num, document_date, year_id ),
  journal_line_year:years!temp_journal_details_year_id_fkey ( id, year_num, status ),
  contributions_year:years!temp_journal_details_contributions_year_id_fkey ( id, year_num, status )
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

async function nextTempJournalDetailsId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف لبند القيد المؤقت");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(
  filters?: TempJournalDetailsListFilters,
): Promise<TempJournalDetailsWithRelations[]> {
  let query = supabase
    .from(tableName)
    .select(selectTempJournalDetailsEmbed)
    .order("temp_journal_main_id", { ascending: true, nullsFirst: false })
    .order("id", { ascending: true });

  if (filters?.temp_journal_main_id != null) {
    query = query.eq(
      "temp_journal_main_id",
      parseNumericId(filters.temp_journal_main_id, "رأس القيد المؤقت"),
    );
  }
  if (filters?.year_id != null) {
    query = query.eq("year_id", parseNumericId(filters.year_id, "السنة"));
  }
  if (filters?.contributions_year_id != null) {
    query = query.eq(
      "contributions_year_id",
      parseNumericId(filters.contributions_year_id, "سنة المساهمات"),
    );
  }
  if (filters?.account_type_id != null) {
    query = query.eq(
      "account_type_id",
      parseNumericId(filters.account_type_id, "نوع الحساب"),
    );
  }
  if (filters?.account_id != null) {
    query = query.eq("account_id", parseNumericId(filters.account_id, "الحساب"));
  }
  if (filters?.member_id != null) {
    query = query.eq("member_id", parseNumericId(filters.member_id, "الدولة"));
  }
  if (filters?.employee_id != null) {
    query = query.eq(
      "employee_id",
      parseNumericId(filters.employee_id, "الموظف"),
    );
  }
  if (filters?.funding_type_id != null) {
    query = query.eq(
      "funding_type_id",
      parseNumericId(filters.funding_type_id, "نوع التمويل"),
    );
  }
  if (filters?.program_id != null) {
    query = query.eq("program_id", parseNumericId(filters.program_id, "البرنامج"));
  }
  if (filters?.deposit_placing_id != null) {
    query = query.eq(
      "deposit_placing_id",
      parseNumericId(filters.deposit_placing_id, "سند الإيداع"),
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات تفاصيل القيود المؤقتة");
  }
  return (data as unknown as TempJournalDetailsWithRelations[] | null) ?? [];
}

export async function getById(
  id: number | string,
): Promise<TempJournalDetailsWithRelations> {
  const rowId = parseNumericId(id, "رقم البند");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectTempJournalDetailsEmbed)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات بند القيد المؤقت");
  }
  return data as unknown as TempJournalDetailsWithRelations;
}

export async function createTempJournalDetails(
  input: CreateTempJournalDetailsInput,
): Promise<TempJournalDetailsWithRelations> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextTempJournalDetailsId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectTempJournalDetailsEmbed)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل بند القيد المؤقت");
  }
  return data as unknown as TempJournalDetailsWithRelations;
}

export async function updateTempJournalDetails(
  id: number | string,
  patch: UpdateTempJournalDetailsInput,
): Promise<TempJournalDetailsWithRelations> {
  const rowId = parseNumericId(id, "رقم البند");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectTempJournalDetailsEmbed)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل بند القيد المؤقت");
  }
  return data as unknown as TempJournalDetailsWithRelations;
}

export async function deleteTempJournalDetails(
  id: number | string,
): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم البند");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف بند القيد المؤقت");
  }
  return data;
}
