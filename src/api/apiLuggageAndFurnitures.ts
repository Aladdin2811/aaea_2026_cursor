import { supabase } from "../lib/supabase";
import type { JobCategoryEmbedded } from "./apiJobCategory";

export type SocialSituationEmbedded = {
  id: number;
  social_situation_name: string | null;
};

export type LuggageAndFurnituresRow = {
  id: number;
  job_category_id: number | null;
  social_situation_id: number | null;
  minimum: string | number | null;
  maximum: string | number | null;
  status: boolean | null;
  job_category: JobCategoryEmbedded | JobCategoryEmbedded[] | null;
  social_situations:
    | SocialSituationEmbedded
    | SocialSituationEmbedded[]
    | null;
};

export type CreateLuggageAndFurnituresInput = Partial<
  Omit<LuggageAndFurnituresRow, "id" | "job_category" | "social_situations">
> & {
  id?: number;
};

export type UpdateLuggageAndFurnituresInput = Partial<
  Omit<LuggageAndFurnituresRow, "id" | "job_category" | "social_situations">
>;

export type LuggageAndFurnituresListFilters = {
  job_category_id?: number | string;
  social_situation_id?: number | string;
  activeOnly?: boolean;
};

const tableName = "luggage_and_furnitures" as const;

const selectLuggageAndFurnitures = `
  id,
  job_category_id,
  social_situation_id,
  minimum,
  maximum,
  status,
  job_category (
    id,
    job_category_name
  ),
  social_situations (
    id,
    social_situation_name
  )
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

async function nextLuggageAndFurnituresId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error(
      "خطأ أثناء جلب أكبر معرّف لبدل نقل الأمتعة والأثاث",
    );
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(
  filters?: LuggageAndFurnituresListFilters,
): Promise<LuggageAndFurnituresRow[]> {
  let query = supabase
    .from(tableName)
    .select(selectLuggageAndFurnitures)
    .order("job_category_id", { ascending: true, nullsFirst: false })
    .order("social_situation_id", { ascending: true, nullsFirst: false })
    .order("id", { ascending: true });

  if (filters?.job_category_id != null) {
    query = query.eq(
      "job_category_id",
      parseNumericId(filters.job_category_id, "الفئة الوظيفية"),
    );
  }
  if (filters?.social_situation_id != null) {
    query = query.eq(
      "social_situation_id",
      parseNumericId(filters.social_situation_id, "الحالة الاجتماعية"),
    );
  }
  if (filters?.activeOnly === true) {
    query = query.eq("status", true);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات بدل نقل الأمتعة والأثاث");
  }
  return (data as unknown as LuggageAndFurnituresRow[] | null) ?? [];
}

export async function getById(
  id: number | string,
): Promise<LuggageAndFurnituresRow> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectLuggageAndFurnitures)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات بدل نقل الأمتعة والأثاث");
  }
  return data as unknown as LuggageAndFurnituresRow;
}

export async function createLuggageAndFurnitures(
  input: CreateLuggageAndFurnituresInput,
): Promise<LuggageAndFurnituresRow> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextLuggageAndFurnituresId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectLuggageAndFurnitures)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(
      error.message || "لا يمكن تسجيل بدل نقل الأمتعة والأثاث",
    );
  }
  return data as unknown as LuggageAndFurnituresRow;
}

export async function updateLuggageAndFurnitures(
  id: number | string,
  patch: UpdateLuggageAndFurnituresInput,
): Promise<LuggageAndFurnituresRow> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectLuggageAndFurnitures)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل بدل نقل الأمتعة والأثاث");
  }
  return data as unknown as LuggageAndFurnituresRow;
}

export async function deleteLuggageAndFurnitures(
  id: number | string,
): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف بدل نقل الأمتعة والأثاث");
  }
  return data;
}
