import { supabase } from "../lib/supabase";
import type {
  AccountTypeEmbed,
  BabEmbed,
  GeneralAccountEmbed,
} from "./apiBand";

export type JournalDetailsYearEmbed = {
  id: number;
  year_num: string | null;
  status: boolean | null;
};

export type JournalDetailsJournalMainEmbed = {
  id: number;
  document_num: number;
  document_date: string;
  year_id: number;
  notes: string;
};

export type JournalDetailsFundingTypeEmbed = {
  id: number;
  funding_type_name: string | null;
};

export type JournalDetailsBandEmbed = {
  id: number;
  band_name: string | null;
  band_code: string | null;
};

export type JournalDetailsNo3Embed = {
  id: number;
  no3_name: string | null;
  no3_code: string | null;
};

export type JournalDetailsDetailedEmbed = {
  id: number;
  detailed_name: string | null;
  detailed_code: string | null;
};

export type JournalDetailsProgramEmbed = {
  id: number;
  program_name: string | null;
  program_code: string | null;
};

export type JournalDetailsAnalyticalEmbed = {
  id: number;
  analytical_name: string | null;
  analytical_code: string | null;
};

export type JournalDetailsSubAccountEmbed = {
  id: number;
};

export type JournalDetailsMemberEmbed = {
  id: number;
  member_name: string | null;
};

export type JournalDetailsEmployeeEmbed = {
  id: number;
  employee_name: string | null;
};

export type JournalDetailsAllAccountsEmbed = {
  id: number;
  account_name: string | null;
  code: string | null;
};

export type JournalDetailsDepositPlacingEmbed = {
  id: number;
  document_num: number | null;
  document_date: string | null;
  year_id: number | null;
};

export type JournalDetailsRow = {
  id: number;
  journal_main_id: number | null;
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

export type JournalDetailsWithRelations = JournalDetailsRow & {
  journal_main:
    | JournalDetailsJournalMainEmbed
    | JournalDetailsJournalMainEmbed[]
    | null;
  funding_type:
    | JournalDetailsFundingTypeEmbed
    | JournalDetailsFundingTypeEmbed[]
    | null;
  account_type: AccountTypeEmbed | AccountTypeEmbed[] | null;
  general_account: GeneralAccountEmbed | GeneralAccountEmbed[] | null;
  bab: BabEmbed | BabEmbed[] | null;
  band: JournalDetailsBandEmbed | JournalDetailsBandEmbed[] | null;
  no3: JournalDetailsNo3Embed | JournalDetailsNo3Embed[] | null;
  detailed: JournalDetailsDetailedEmbed | JournalDetailsDetailedEmbed[] | null;
  programs: JournalDetailsProgramEmbed | JournalDetailsProgramEmbed[] | null;
  analytical:
    | JournalDetailsAnalyticalEmbed
    | JournalDetailsAnalyticalEmbed[]
    | null;
  sub_account:
    | JournalDetailsSubAccountEmbed
    | JournalDetailsSubAccountEmbed[]
    | null;
  members: JournalDetailsMemberEmbed | JournalDetailsMemberEmbed[] | null;
  all_employees:
    | JournalDetailsEmployeeEmbed
    | JournalDetailsEmployeeEmbed[]
    | null;
  all_accounts:
    | JournalDetailsAllAccountsEmbed
    | JournalDetailsAllAccountsEmbed[]
    | null;
  deposit_placing:
    | JournalDetailsDepositPlacingEmbed
    | JournalDetailsDepositPlacingEmbed[]
    | null;
  /** `year_id` → `years` */
  journal_line_year:
    | JournalDetailsYearEmbed
    | JournalDetailsYearEmbed[]
    | null;
  /** `contributions_year_id` → `years` */
  contributions_year:
    | JournalDetailsYearEmbed
    | JournalDetailsYearEmbed[]
    | null;
};

export type CreateJournalDetailsInput = Partial<
  Omit<JournalDetailsRow, "id">
> & {
  id?: number;
};

export type UpdateJournalDetailsInput = Partial<Omit<JournalDetailsRow, "id">>;

export type JournalDetailsListFilters = {
  journal_main_id?: number | string;
  year_id?: number | string;
  account_id?: number | string;
  member_id?: number | string;
  employee_id?: number | string;
  funding_type_id?: number | string;
  program_id?: number | string;
};

const tableName = "journal_details" as const;

const selectJournalDetailsEmbed = `
  id,
  journal_main_id,
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
  journal_main ( id, document_num, document_date, year_id, notes ),
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
  journal_line_year:years!journal_details_year_id_fkey ( id, year_num, status ),
  contributions_year:years!journal_details_contributions_year_id_fkey ( id, year_num, status )
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

async function nextJournalDetailsId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف لبند القيد");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(
  filters?: JournalDetailsListFilters,
): Promise<JournalDetailsWithRelations[]> {
  let query = supabase
    .from(tableName)
    .select(selectJournalDetailsEmbed)
    .order("journal_main_id", { ascending: true, nullsFirst: false })
    .order("id", { ascending: true });

  if (filters?.journal_main_id != null) {
    query = query.eq(
      "journal_main_id",
      parseNumericId(filters.journal_main_id, "رأس القيد"),
    );
  }
  if (filters?.year_id != null) {
    query = query.eq("year_id", parseNumericId(filters.year_id, "السنة"));
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

  const { data, error } = await query;

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات تفاصيل القيود");
  }
  return (data as unknown as JournalDetailsWithRelations[] | null) ?? [];
}

export async function getById(
  id: number | string,
): Promise<JournalDetailsWithRelations> {
  const rowId = parseNumericId(id, "رقم البند");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectJournalDetailsEmbed)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات بند القيد");
  }
  return data as unknown as JournalDetailsWithRelations;
}

export async function createJournalDetails(
  input: CreateJournalDetailsInput,
): Promise<JournalDetailsWithRelations> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextJournalDetailsId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectJournalDetailsEmbed)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل بند القيد");
  }
  return data as unknown as JournalDetailsWithRelations;
}

export async function updateJournalDetails(
  id: number | string,
  patch: UpdateJournalDetailsInput,
): Promise<JournalDetailsWithRelations> {
  const rowId = parseNumericId(id, "رقم البند");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectJournalDetailsEmbed)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل بند القيد");
  }
  return data as unknown as JournalDetailsWithRelations;
}

export async function deleteJournalDetails(
  id: number | string,
): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم البند");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف بند القيد");
  }
  return data;
}
