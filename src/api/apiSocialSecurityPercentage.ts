import { supabase } from "../lib/supabase";

export type SocialSecurityPercentageRow = {
  id: number;
  percentage_limit: string | number | null;
};

export type CreateSocialSecurityPercentageInput = Partial<
  Omit<SocialSecurityPercentageRow, "id">
> & {
  id?: number;
};

export type UpdateSocialSecurityPercentageInput = Partial<
  Omit<SocialSecurityPercentageRow, "id">
>;

const tableName = "social_security_percentage" as const;

const selectSocialSecurityPercentage = "id, percentage_limit";

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

async function nextSocialSecurityPercentageId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف لسقف نسبة الضمان الاجتماعي");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(): Promise<SocialSecurityPercentageRow[]> {
  const { data, error } = await supabase
    .from(tableName)
    .select(selectSocialSecurityPercentage)
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات أسقف نسب الضمان الاجتماعي");
  }
  return (data as unknown as SocialSecurityPercentageRow[] | null) ?? [];
}

export async function getById(
  id: number | string,
): Promise<SocialSecurityPercentageRow> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectSocialSecurityPercentage)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات سقف نسبة الضمان الاجتماعي");
  }
  return data as unknown as SocialSecurityPercentageRow;
}

export async function createSocialSecurityPercentage(
  input: CreateSocialSecurityPercentageInput,
): Promise<SocialSecurityPercentageRow> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextSocialSecurityPercentageId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectSocialSecurityPercentage)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل سقف نسبة الضمان الاجتماعي");
  }
  return data as unknown as SocialSecurityPercentageRow;
}

export async function updateSocialSecurityPercentage(
  id: number | string,
  patch: UpdateSocialSecurityPercentageInput,
): Promise<SocialSecurityPercentageRow> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectSocialSecurityPercentage)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل سقف نسبة الضمان الاجتماعي");
  }
  return data as unknown as SocialSecurityPercentageRow;
}

export async function deleteSocialSecurityPercentage(
  id: number | string,
): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف سقف نسبة الضمان الاجتماعي");
  }
  return data;
}
