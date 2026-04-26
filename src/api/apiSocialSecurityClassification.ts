import { supabase } from "../lib/supabase";

export type SocialSecurityClassificationRow = {
  id: number;
  social_security_classification_name: string | null;
};

/** شكل العلاقة المضمّنة في استعلامات أخرى (`social_security_classification (...)`) */
export type SocialSecurityClassificationEmbedded = Pick<
  SocialSecurityClassificationRow,
  "id" | "social_security_classification_name"
>;

export type CreateSocialSecurityClassificationInput = Partial<
  Omit<SocialSecurityClassificationRow, "id">
> & {
  id?: number;
};

export type UpdateSocialSecurityClassificationInput = Partial<
  Omit<SocialSecurityClassificationRow, "id">
>;

const tableName = "social_security_classification" as const;

const selectSocialSecurityClassification = `
  id,
  social_security_classification_name
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

async function nextSocialSecurityClassificationId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف للتصنيف الفرعي للضمان الاجتماعي");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(): Promise<SocialSecurityClassificationRow[]> {
  const { data, error } = await supabase
    .from(tableName)
    .select(selectSocialSecurityClassification)
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات التصنيفات الفرعية للضمان الاجتماعي");
  }
  return (data as unknown as SocialSecurityClassificationRow[] | null) ?? [];
}

export async function getById(
  id: number | string,
): Promise<SocialSecurityClassificationRow> {
  const rowId = parseNumericId(id, "رقم التصنيف الفرعي");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectSocialSecurityClassification)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات التصنيف الفرعي للضمان الاجتماعي");
  }
  return data as unknown as SocialSecurityClassificationRow;
}

export async function createSocialSecurityClassification(
  input: CreateSocialSecurityClassificationInput,
): Promise<SocialSecurityClassificationRow> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextSocialSecurityClassificationId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectSocialSecurityClassification)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(
      error.message || "لا يمكن تسجيل التصنيف الفرعي للضمان الاجتماعي",
    );
  }
  return data as unknown as SocialSecurityClassificationRow;
}

export async function updateSocialSecurityClassification(
  id: number | string,
  patch: UpdateSocialSecurityClassificationInput,
): Promise<SocialSecurityClassificationRow> {
  const rowId = parseNumericId(id, "رقم التصنيف الفرعي");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectSocialSecurityClassification)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل التصنيف الفرعي للضمان الاجتماعي");
  }
  return data as unknown as SocialSecurityClassificationRow;
}

export async function deleteSocialSecurityClassification(
  id: number | string,
): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم التصنيف الفرعي");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف التصنيف الفرعي للضمان الاجتماعي");
  }
  return data;
}
