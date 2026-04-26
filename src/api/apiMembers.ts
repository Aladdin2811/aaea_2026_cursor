import { supabase } from "../lib/supabase";

export type MemberRow = {
  id: number;
  member_name: string | null;
  member_notes: string | null;
  member_ratio: string | number | null;
  reservation_ratio: string | number | null;
  holde: string | number | null;
  org_member: boolean | null;
  flag: string | null;
  status: boolean | null;
};

/** شكل العلاقة المضمّنة في استعلامات أخرى (`members (...)`) */
export type MemberEmbedded = Pick<MemberRow, "id" | "member_name">;

export type CreateMemberInput = Partial<Omit<MemberRow, "id">> & {
  id?: number;
};

export type UpdateMemberInput = Partial<Omit<MemberRow, "id">>;

export type MembersListFilters = {
  activeOnly?: boolean;
  /** عند `true` يقتصر على `org_member === true` */
  orgMemberOnly?: boolean;
};

const tableName = "members" as const;

const selectMembers = `
  id,
  member_name,
  member_notes,
  member_ratio,
  reservation_ratio,
  holde,
  org_member,
  flag,
  status
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

async function nextMemberId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف للدولة العضو");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(
  filters?: MembersListFilters,
): Promise<MemberRow[]> {
  let query = supabase
    .from(tableName)
    .select(selectMembers)
    .order("id", { ascending: true });

  if (filters?.activeOnly === true) {
    query = query.eq("status", true);
  }
  if (filters?.orgMemberOnly === true) {
    query = query.eq("org_member", true);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(
      "لا يمكن الحصول على بيانات الدول الأعضاء بجامعة الدول العربية",
    );
  }
  return (data as unknown as MemberRow[] | null) ?? [];
}

/** أعضاء الهيئة فقط (`org_member = true`) */
export async function orgMember(): Promise<MemberRow[]> {
  return getAll({ orgMemberOnly: true });
}

export async function getById(id: number | string): Promise<MemberRow> {
  const rowId = parseNumericId(id, "رقم الدولة العضو");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectMembers)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error(
      "لا يمكن الحصول على بيانات الدولة العضو بجامعة الدول العربية",
    );
  }
  return data as unknown as MemberRow;
}

export async function createMember(input: CreateMemberInput): Promise<MemberRow> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextMemberId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectMembers)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل الدولة العضو");
  }
  return data as unknown as MemberRow;
}

export async function updateMember(
  id: number | string,
  patch: UpdateMemberInput,
): Promise<MemberRow> {
  const rowId = parseNumericId(id, "رقم الدولة العضو");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectMembers)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل بيانات الدولة العضو");
  }
  return data as unknown as MemberRow;
}

export async function deleteMember(id: number | string): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم الدولة العضو");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف الدولة العضو");
  }
  return data;
}
