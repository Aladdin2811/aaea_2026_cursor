import { supabase } from "../lib/supabase";

export type GeneralConferenceMemberEmbed = {
  id: number;
  member_name: string | null;
};

export type GeneralConferenceYearEmbed = {
  id: number;
  year_num: string | null;
  status: boolean | null;
};

export type GeneralConferenceRow = {
  id: number;
  name: string | null;
  year_id: number | null;
  url: string | null;
  city: string | null;
  country_id: number | null;
  presidency: number | null;
  vice_president: number | null;
};

export type GeneralConferenceWithRelations = GeneralConferenceRow & {
  country_member:
    | GeneralConferenceMemberEmbed
    | GeneralConferenceMemberEmbed[]
    | null;
  presidency_member:
    | GeneralConferenceMemberEmbed
    | GeneralConferenceMemberEmbed[]
    | null;
  vice_president_member:
    | GeneralConferenceMemberEmbed
    | GeneralConferenceMemberEmbed[]
    | null;
  years: GeneralConferenceYearEmbed | GeneralConferenceYearEmbed[] | null;
};

export type CreateGeneralConferenceInput = Partial<
  Omit<GeneralConferenceRow, "id">
> & {
  id?: number;
};

export type UpdateGeneralConferenceInput = Partial<
  Omit<GeneralConferenceRow, "id">
>;

export type GeneralConferenceListFilters = {
  year_id?: number | string;
};

const tableName = "general_conference" as const;

const selectGeneralConferenceEmbed = `
  id,
  name,
  year_id,
  url,
  city,
  country_id,
  presidency,
  vice_president,
  years ( id, year_num, status ),
  country_member:members!general_conference_country_id_fkey ( id, member_name ),
  presidency_member:members!general_conference_presidency_fkey ( id, member_name ),
  vice_president_member:members!general_conference_vice_president_fkey ( id, member_name )
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

async function nextGeneralConferenceId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف للمؤتمر العام");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(
  filters?: GeneralConferenceListFilters,
): Promise<GeneralConferenceWithRelations[]> {
  let query = supabase
    .from(tableName)
    .select(selectGeneralConferenceEmbed)
    .order("year_id", { ascending: false, nullsFirst: false })
    .order("id", { ascending: true });

  if (filters?.year_id != null) {
    query = query.eq("year_id", parseNumericId(filters.year_id, "السنة"));
  }

  const { data, error } = await query;

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات المؤتمر العام");
  }
  return (data as unknown as GeneralConferenceWithRelations[] | null) ?? [];
}

export async function getById(
  id: number | string,
): Promise<GeneralConferenceWithRelations> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectGeneralConferenceEmbed)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات المؤتمر العام");
  }
  return data as unknown as GeneralConferenceWithRelations;
}

export async function createGeneralConference(
  input: CreateGeneralConferenceInput,
): Promise<GeneralConferenceWithRelations> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextGeneralConferenceId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectGeneralConferenceEmbed)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل المؤتمر العام");
  }
  return data as unknown as GeneralConferenceWithRelations;
}

export async function updateGeneralConference(
  id: number | string,
  patch: UpdateGeneralConferenceInput,
): Promise<GeneralConferenceWithRelations> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectGeneralConferenceEmbed)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل بيانات المؤتمر العام");
  }
  return data as unknown as GeneralConferenceWithRelations;
}

export async function deleteGeneralConference(
  id: number | string,
): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف المؤتمر العام");
  }
  return data;
}
