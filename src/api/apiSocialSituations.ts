import { supabase } from "../lib/supabase";

export type SocialSituationsRow = {
  id: number;
  social_situation_name: string | null;
  status: boolean | null;
};

/** شكل العلاقة المضمّنة في استعلامات أخرى (`social_situations (...)`) */
export type SocialSituationsEmbedded = Pick<
  SocialSituationsRow,
  "id" | "social_situation_name"
>;

export type CreateSocialSituationsInput = Partial<
  Omit<SocialSituationsRow, "id">
> & {
  id?: number;
};

export type UpdateSocialSituationsInput = Partial<Omit<SocialSituationsRow, "id">>;

export type SocialSituationsListFilters = {
  activeOnly?: boolean;
};

const tableName = "social_situations" as const;

const selectSocialSituations = `
  id,
  social_situation_name,
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

async function nextSocialSituationsId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف للحالة الاجتماعية");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(
  filters?: SocialSituationsListFilters,
): Promise<SocialSituationsRow[]> {
  let query = supabase
    .from(tableName)
    .select(selectSocialSituations)
    .order("id", { ascending: true });

  if (filters?.activeOnly === true) {
    query = query.eq("status", true);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات الأحوال الاجتماعية");
  }
  return (data as unknown as SocialSituationsRow[] | null) ?? [];
}

export async function getById(id: number | string): Promise<SocialSituationsRow> {
  const rowId = parseNumericId(id, "رقم الحالة الاجتماعية");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectSocialSituations)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات الحالة الاجتماعية");
  }
  return data as unknown as SocialSituationsRow;
}

export async function createSocialSituations(
  input: CreateSocialSituationsInput,
): Promise<SocialSituationsRow> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextSocialSituationsId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectSocialSituations)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل الحالة الاجتماعية");
  }
  return data as unknown as SocialSituationsRow;
}

export async function updateSocialSituations(
  id: number | string,
  patch: UpdateSocialSituationsInput,
): Promise<SocialSituationsRow> {
  const rowId = parseNumericId(id, "رقم الحالة الاجتماعية");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectSocialSituations)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل الحالة الاجتماعية");
  }
  return data as unknown as SocialSituationsRow;
}

export async function deleteSocialSituations(id: number | string): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم الحالة الاجتماعية");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف الحالة الاجتماعية");
  }
  return data;
}
