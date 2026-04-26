import { supabase } from "../lib/supabase";

/** تضمينات خفيفة للقوائم والتفاصيل */
export type AllAccountsAccountTypeEmbed = {
  id: number;
  account_type_name: string | null;
};

export type AllAccountsGeneralAccountEmbed = {
  id: number;
  general_account_name: string | null;
};

export type AllAccountsBabEmbed = {
  id: number;
  bab_name: string | null;
};

export type AllAccountsBandEmbed = {
  id: number;
  band_name: string | null;
};

export type AllAccountsNo3Embed = {
  id: number;
  no3_name: string | null;
};

export type AllAccountsDetailedEmbed = {
  id: number;
  detailed_name: string | null;
};

export type AllAccountsMemberEmbed = {
  id: number;
  member_name: string | null;
};

export type AllAccountsMainTopicEmbed = {
  id: number;
  main_topic_name: string | null;
};

export type AllAccountsAnalyticalEmbed = {
  id: number;
};

export type AllAccountsSubAccountEmbed = {
  id: number;
};

export type AllAccountsRow = {
  id: number;
  account_name: string | null;
  code: string | null;
  member_id: number | null;
  account_type_id: number | null;
  general_account_id: number | null;
  bab_id: number | null;
  band_id: number | null;
  no3_id: number | null;
  detailed_id: number | null;
  analytical_id: number | null;
  sub_account_id: number | null;
  description: string | null;
  notes: string | null;
  have_budget: boolean | null;
  have_programs: boolean | null;
  direct_exchange: boolean | null;
  salaries_direct_paid: boolean | null;
  nature_of_account: number | null;
  status: boolean | null;
  main_topic_id: number | null;
  show: boolean | null;
  sort: number | null;
  start_year: number | null;
  end_year: number | null;
};

export type AllAccountsWithRelations = AllAccountsRow & {
  account_type:
    | AllAccountsAccountTypeEmbed
    | AllAccountsAccountTypeEmbed[]
    | null;
  general_account:
    | AllAccountsGeneralAccountEmbed
    | AllAccountsGeneralAccountEmbed[]
    | null;
  bab: AllAccountsBabEmbed | AllAccountsBabEmbed[] | null;
  band: AllAccountsBandEmbed | AllAccountsBandEmbed[] | null;
  no3: AllAccountsNo3Embed | AllAccountsNo3Embed[] | null;
  detailed: AllAccountsDetailedEmbed | AllAccountsDetailedEmbed[] | null;
  members: AllAccountsMemberEmbed | AllAccountsMemberEmbed[] | null;
  main_topics:
    | AllAccountsMainTopicEmbed
    | AllAccountsMainTopicEmbed[]
    | null;
  analytical:
    | AllAccountsAnalyticalEmbed
    | AllAccountsAnalyticalEmbed[]
    | null;
  sub_account:
    | AllAccountsSubAccountEmbed
    | AllAccountsSubAccountEmbed[]
    | null;
};

export type CreateAllAccountsInput = Partial<Omit<AllAccountsRow, "id">> & {
  /** إن وُجد يُستخدم؛ وإلا يُحسب `max(id)+1` */
  id?: number;
};

export type UpdateAllAccountsInput = Partial<Omit<AllAccountsRow, "id">>;

const tableName = "all_accounts" as const;

const selectAllAccountsEmbed = `
  id,
  account_name,
  code,
  member_id,
  account_type_id,
  general_account_id,
  bab_id,
  band_id,
  no3_id,
  detailed_id,
  analytical_id,
  sub_account_id,
  description,
  notes,
  have_budget,
  have_programs,
  direct_exchange,
  salaries_direct_paid,
  nature_of_account,
  status,
  main_topic_id,
  show,
  sort,
  start_year,
  end_year,
  account_type ( id, account_type_name ),
  general_account ( id, general_account_name ),
  bab ( id, bab_name ),
  band ( id, band_name ),
  no3 ( id, no3_name ),
  detailed ( id, detailed_name ),
  members ( id, member_name ),
  main_topics ( id, main_topic_name ),
  analytical ( id ),
  sub_account ( id )
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

async function nextAllAccountsId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف لجدول الحسابات الموحّد");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(): Promise<AllAccountsWithRelations[]> {
  const { data, error } = await supabase
    .from(tableName)
    .select(selectAllAccountsEmbed)
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات الحسابات الموحّدة");
  }
  return (data as unknown as AllAccountsWithRelations[] | null) ?? [];
}

export async function getById(
  id: number | string,
): Promise<AllAccountsWithRelations> {
  const rowId = parseNumericId(id, "رقم الحساب الموحّد");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectAllAccountsEmbed)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات الحساب الموحّد");
  }
  return data as unknown as AllAccountsWithRelations;
}

export async function createAllAccounts(
  input: CreateAllAccountsInput,
): Promise<AllAccountsWithRelations> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextAllAccountsId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectAllAccountsEmbed)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل الحساب الموحّد");
  }
  return data as unknown as AllAccountsWithRelations;
}

export async function updateAllAccounts(
  id: number | string,
  patch: UpdateAllAccountsInput,
): Promise<AllAccountsWithRelations> {
  const rowId = parseNumericId(id, "رقم الحساب الموحّد");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectAllAccountsEmbed)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل الحساب الموحّد");
  }
  return data as unknown as AllAccountsWithRelations;
}

export async function deleteAllAccounts(id: number | string): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم الحساب الموحّد");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف الحساب الموحّد");
  }
  return data;
}
