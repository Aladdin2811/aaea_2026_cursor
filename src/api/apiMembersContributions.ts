import { supabase } from "../lib/supabase";

export type MembersContributionsMemberEmbed = {
  id: number;
  member_name: string | null;
};

export type MembersContributionsYearEmbed = {
  id: number;
  year_num: string | null;
  status: boolean | null;
};

export type MembersContributionsRow = {
  id: number;
  member_id: number | null;
  contribution_year_id: number | null;
  consolidated_account: string | number | null;
  organization_account: string | number | null;
  document_num: number | null;
  document_date: string | null;
  payed_year_id: number | null;
  prepaid: boolean | null;
  notes: string | null;
};

export type MembersContributionsWithRelations = MembersContributionsRow & {
  members:
    | MembersContributionsMemberEmbed
    | MembersContributionsMemberEmbed[]
    | null;
  /** سنة المساهمة (`contribution_year_id`) */
  contribution_year:
    | MembersContributionsYearEmbed
    | MembersContributionsYearEmbed[]
    | null;
  /** سنة الدفع (`payed_year_id`) */
  payed_year:
    | MembersContributionsYearEmbed
    | MembersContributionsYearEmbed[]
    | null;
};

export type CreateMembersContributionsInput = Partial<
  Omit<MembersContributionsRow, "id">
> & {
  id?: number;
};

export type UpdateMembersContributionsInput = Partial<
  Omit<MembersContributionsRow, "id">
>;

export type MembersContributionsListFilters = {
  member_id?: number | string;
  contribution_year_id?: number | string;
  payed_year_id?: number | string;
};

const tableName = "members_contributions" as const;

const selectMembersContributionsEmbed = `
  id,
  member_id,
  contribution_year_id,
  consolidated_account,
  organization_account,
  document_num,
  document_date,
  payed_year_id,
  prepaid,
  notes,
  members ( id, member_name ),
  contribution_year:years!members_contributions_contribution_year_id_fkey ( id, year_num, status ),
  payed_year:years!members_contributions_payed_year_id_fkey ( id, year_num, status )
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

async function nextMembersContributionsId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف لمساهمة العضو");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(
  filters?: MembersContributionsListFilters,
): Promise<MembersContributionsWithRelations[]> {
  let query = supabase
    .from(tableName)
    .select(selectMembersContributionsEmbed)
    .order("member_id", { ascending: true, nullsFirst: false })
    .order("contribution_year_id", { ascending: true, nullsFirst: false })
    .order("id", { ascending: true });

  if (filters?.member_id != null) {
    query = query.eq(
      "member_id",
      parseNumericId(filters.member_id, "الدولة العضو"),
    );
  }
  if (filters?.contribution_year_id != null) {
    query = query.eq(
      "contribution_year_id",
      parseNumericId(filters.contribution_year_id, "سنة المساهمة"),
    );
  }
  if (filters?.payed_year_id != null) {
    query = query.eq(
      "payed_year_id",
      parseNumericId(filters.payed_year_id, "سنة الدفع"),
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات مساهمات الأعضاء");
  }
  return (data as unknown as MembersContributionsWithRelations[] | null) ?? [];
}

export async function getById(
  id: number | string,
): Promise<MembersContributionsWithRelations> {
  const rowId = parseNumericId(id, "رقم مساهمة العضو");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectMembersContributionsEmbed)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات مساهمة العضو");
  }
  return data as unknown as MembersContributionsWithRelations;
}

export async function createMembersContributions(
  input: CreateMembersContributionsInput,
): Promise<MembersContributionsWithRelations> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextMembersContributionsId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectMembersContributionsEmbed)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل مساهمة العضو");
  }
  return data as unknown as MembersContributionsWithRelations;
}

export async function updateMembersContributions(
  id: number | string,
  patch: UpdateMembersContributionsInput,
): Promise<MembersContributionsWithRelations> {
  const rowId = parseNumericId(id, "رقم مساهمة العضو");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectMembersContributionsEmbed)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل مساهمة العضو");
  }
  return data as unknown as MembersContributionsWithRelations;
}

export async function deleteMembersContributions(
  id: number | string,
): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم مساهمة العضو");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف مساهمة العضو");
  }
  return data;
}
