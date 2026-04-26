import { supabase } from "../lib/supabase";

export type SocialSecurityCategoryRow = {
  id: number;
  social_security_category_name: string | null;
  notes: string | null;
};

/** شكل العلاقة المضمّنة في استعلامات أخرى (`social_security_category (...)`) */
export type SocialSecurityCategoryEmbedded = Pick<
  SocialSecurityCategoryRow,
  "id" | "social_security_category_name"
>;

export type CreateSocialSecurityCategoryInput = Partial<
  Omit<SocialSecurityCategoryRow, "id">
> & {
  id?: number;
};

export type UpdateSocialSecurityCategoryInput = Partial<
  Omit<SocialSecurityCategoryRow, "id">
>;

const tableName = "social_security_category" as const;

const selectSocialSecurityCategory = `
  id,
  social_security_category_name,
  notes
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

async function nextSocialSecurityCategoryId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف لتصنيف الضمان الاجتماعي");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(): Promise<SocialSecurityCategoryRow[]> {
  const { data, error } = await supabase
    .from(tableName)
    .select(selectSocialSecurityCategory)
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات تصنيفات الضمان الاجتماعي");
  }
  return (data as unknown as SocialSecurityCategoryRow[] | null) ?? [];
}

export async function getById(
  id: number | string,
): Promise<SocialSecurityCategoryRow> {
  const rowId = parseNumericId(id, "رقم التصنيف");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectSocialSecurityCategory)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات تصنيف الضمان الاجتماعي");
  }
  return data as unknown as SocialSecurityCategoryRow;
}

export async function createSocialSecurityCategory(
  input: CreateSocialSecurityCategoryInput,
): Promise<SocialSecurityCategoryRow> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextSocialSecurityCategoryId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectSocialSecurityCategory)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل تصنيف الضمان الاجتماعي");
  }
  return data as unknown as SocialSecurityCategoryRow;
}

export async function updateSocialSecurityCategory(
  id: number | string,
  patch: UpdateSocialSecurityCategoryInput,
): Promise<SocialSecurityCategoryRow> {
  const rowId = parseNumericId(id, "رقم التصنيف");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectSocialSecurityCategory)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل تصنيف الضمان الاجتماعي");
  }
  return data as unknown as SocialSecurityCategoryRow;
}

export async function deleteSocialSecurityCategory(
  id: number | string,
): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم التصنيف");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف تصنيف الضمان الاجتماعي");
  }
  return data;
}
