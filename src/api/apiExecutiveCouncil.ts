import { supabase } from "../lib/supabase";

export type ExecutiveCouncilMemberEmbed = {
  id: number;
  member_name: string | null;
};

export type ExecutiveCouncilYearEmbed = {
  id: number;
  year_num: string | null;
  status: boolean | null;
};

export type ExecutiveCouncilRow = {
  id: number;
  name: string | null;
  year_id: number | null;
  url: string | null;
  city: string | null;
  country_id: number | null;
  presidency: number | null;
  vice_president: number | null;
};

export type ExecutiveCouncilWithRelations = ExecutiveCouncilRow & {
  country_member:
    | ExecutiveCouncilMemberEmbed
    | ExecutiveCouncilMemberEmbed[]
    | null;
  presidency_member:
    | ExecutiveCouncilMemberEmbed
    | ExecutiveCouncilMemberEmbed[]
    | null;
  vice_president_member:
    | ExecutiveCouncilMemberEmbed
    | ExecutiveCouncilMemberEmbed[]
    | null;
  years: ExecutiveCouncilYearEmbed | ExecutiveCouncilYearEmbed[] | null;
};

export type CreateExecutiveCouncilInput = Partial<
  Omit<ExecutiveCouncilRow, "id">
> & {
  id?: number;
};

export type UpdateExecutiveCouncilInput = Partial<
  Omit<ExecutiveCouncilRow, "id">
>;

export type ExecutiveCouncilListFilters = {
  year_id?: number | string;
};

const tableName = "executive_council" as const;

const selectExecutiveCouncilEmbed = `
  id,
  name,
  year_id,
  url,
  city,
  country_id,
  presidency,
  vice_president,
  years ( id, year_num, status ),
  country_member:members!executive_council_country_id_fkey ( id, member_name ),
  presidency_member:members!executive_council_presidency_fkey ( id, member_name ),
  vice_president_member:members!executive_council_vice_president_fkey ( id, member_name )
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

async function nextExecutiveCouncilId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف للمجلس التنفيذي");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(
  filters?: ExecutiveCouncilListFilters,
): Promise<ExecutiveCouncilWithRelations[]> {
  let query = supabase
    .from(tableName)
    .select(selectExecutiveCouncilEmbed)
    .order("year_id", { ascending: false, nullsFirst: false })
    .order("id", { ascending: true });

  if (filters?.year_id != null) {
    query = query.eq("year_id", parseNumericId(filters.year_id, "السنة"));
  }

  const { data, error } = await query;

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات المجلس التنفيذي");
  }
  return (data as unknown as ExecutiveCouncilWithRelations[] | null) ?? [];
}

export async function getById(
  id: number | string,
): Promise<ExecutiveCouncilWithRelations> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectExecutiveCouncilEmbed)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات المجلس التنفيذي");
  }
  return data as unknown as ExecutiveCouncilWithRelations;
}

export async function createExecutiveCouncil(
  input: CreateExecutiveCouncilInput,
): Promise<ExecutiveCouncilWithRelations> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextExecutiveCouncilId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectExecutiveCouncilEmbed)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل المجلس التنفيذي");
  }
  return data as unknown as ExecutiveCouncilWithRelations;
}

export async function updateExecutiveCouncil(
  id: number | string,
  patch: UpdateExecutiveCouncilInput,
): Promise<ExecutiveCouncilWithRelations> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectExecutiveCouncilEmbed)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل بيانات المجلس التنفيذي");
  }
  return data as unknown as ExecutiveCouncilWithRelations;
}

export async function deleteExecutiveCouncil(
  id: number | string,
): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف المجلس التنفيذي");
  }
  return data;
}
