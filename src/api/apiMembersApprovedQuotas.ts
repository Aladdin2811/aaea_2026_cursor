import { supabase } from "../lib/supabase";

export type MembersApprovedQuotasMemberEmbed = {
  id: number;
  member_name: string | null;
};

export type MembersApprovedQuotasYearEmbed = {
  id: number;
  year_num: string | null;
  status: boolean | null;
};

export type MembersApprovedQuotasRow = {
  id: number;
  member_id: number | null;
  year_id: number | null;
  approved_quota: string | number | null;
};

export type MembersApprovedQuotasWithRelations = MembersApprovedQuotasRow & {
  members:
    | MembersApprovedQuotasMemberEmbed
    | MembersApprovedQuotasMemberEmbed[]
    | null;
  years:
    | MembersApprovedQuotasYearEmbed
    | MembersApprovedQuotasYearEmbed[]
    | null;
};

export type CreateMembersApprovedQuotasInput = Partial<
  Omit<MembersApprovedQuotasRow, "id">
> & {
  id?: number;
};

export type UpdateMembersApprovedQuotasInput = Partial<
  Omit<MembersApprovedQuotasRow, "id">
>;

export type MembersApprovedQuotasListFilters = {
  member_id?: number | string;
  year_id?: number | string;
};

const tableName = "members_approved_quotas" as const;

const selectMembersApprovedQuotasEmbed = `
  id,
  member_id,
  year_id,
  approved_quota,
  members ( id, member_name ),
  years ( id, year_num, status )
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

async function nextMembersApprovedQuotasId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف للحصة المعتمدة للعضو");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(
  filters?: MembersApprovedQuotasListFilters,
): Promise<MembersApprovedQuotasWithRelations[]> {
  let query = supabase
    .from(tableName)
    .select(selectMembersApprovedQuotasEmbed)
    .order("year_id", { ascending: true, nullsFirst: false })
    .order("member_id", { ascending: true, nullsFirst: false })
    .order("id", { ascending: true });

  if (filters?.member_id != null) {
    query = query.eq(
      "member_id",
      parseNumericId(filters.member_id, "الدولة العضو"),
    );
  }
  if (filters?.year_id != null) {
    query = query.eq("year_id", parseNumericId(filters.year_id, "السنة"));
  }

  const { data, error } = await query;

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات الحصص المعتمدة للأعضاء");
  }
  return (data as unknown as MembersApprovedQuotasWithRelations[] | null) ?? [];
}

export async function getById(
  id: number | string,
): Promise<MembersApprovedQuotasWithRelations> {
  const rowId = parseNumericId(id, "رقم الحصة المعتمدة");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectMembersApprovedQuotasEmbed)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات الحصة المعتمدة");
  }
  return data as unknown as MembersApprovedQuotasWithRelations;
}

export async function createMembersApprovedQuotas(
  input: CreateMembersApprovedQuotasInput,
): Promise<MembersApprovedQuotasWithRelations> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextMembersApprovedQuotasId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectMembersApprovedQuotasEmbed)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل الحصة المعتمدة للعضو");
  }
  return data as unknown as MembersApprovedQuotasWithRelations;
}

export async function updateMembersApprovedQuotas(
  id: number | string,
  patch: UpdateMembersApprovedQuotasInput,
): Promise<MembersApprovedQuotasWithRelations> {
  const rowId = parseNumericId(id, "رقم الحصة المعتمدة");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectMembersApprovedQuotasEmbed)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل الحصة المعتمدة للعضو");
  }
  return data as unknown as MembersApprovedQuotasWithRelations;
}

export async function deleteMembersApprovedQuotas(
  id: number | string,
): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم الحصة المعتمدة");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف الحصة المعتمدة للعضو");
  }
  return data;
}
