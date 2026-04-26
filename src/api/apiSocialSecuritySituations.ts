import { supabase } from "../lib/supabase";

export type SocialSecuritySituationsRow = {
  id: number;
  social_security_situation_name: string | null;
};

/** شكل العلاقة المضمّنة في استعلامات أخرى (`social_security_situations (...)`) */
export type SocialSecuritySituationsEmbedded = Pick<
  SocialSecuritySituationsRow,
  "id" | "social_security_situation_name"
>;

export type CreateSocialSecuritySituationsInput = Partial<
  Omit<SocialSecuritySituationsRow, "id">
> & {
  id?: number;
};

export type UpdateSocialSecuritySituationsInput = Partial<
  Omit<SocialSecuritySituationsRow, "id">
>;

const tableName = "social_security_situations" as const;

const selectSocialSecuritySituations = `
  id,
  social_security_situation_name
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

async function nextSocialSecuritySituationsId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف لوضع الضمان الاجتماعي");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(): Promise<SocialSecuritySituationsRow[]> {
  const { data, error } = await supabase
    .from(tableName)
    .select(selectSocialSecuritySituations)
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات أوضاع الضمان الاجتماعي");
  }
  return (data as unknown as SocialSecuritySituationsRow[] | null) ?? [];
}

export async function getById(
  id: number | string,
): Promise<SocialSecuritySituationsRow> {
  const rowId = parseNumericId(id, "رقم الوضع");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectSocialSecuritySituations)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات وضع الضمان الاجتماعي");
  }
  return data as unknown as SocialSecuritySituationsRow;
}

export async function createSocialSecuritySituations(
  input: CreateSocialSecuritySituationsInput,
): Promise<SocialSecuritySituationsRow> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextSocialSecuritySituationsId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectSocialSecuritySituations)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل وضع الضمان الاجتماعي");
  }
  return data as unknown as SocialSecuritySituationsRow;
}

export async function updateSocialSecuritySituations(
  id: number | string,
  patch: UpdateSocialSecuritySituationsInput,
): Promise<SocialSecuritySituationsRow> {
  const rowId = parseNumericId(id, "رقم الوضع");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectSocialSecuritySituations)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل وضع الضمان الاجتماعي");
  }
  return data as unknown as SocialSecuritySituationsRow;
}

export async function deleteSocialSecuritySituations(
  id: number | string,
): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم الوضع");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف وضع الضمان الاجتماعي");
  }
  return data;
}
