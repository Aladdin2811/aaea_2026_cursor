import { supabase } from "../lib/supabase";

export type SocialSecurityCurrencyRateRow = {
  id: number;
  currency_rate: string | number | null;
};

export type CreateSocialSecurityCurrencyRateInput = Partial<
  Omit<SocialSecurityCurrencyRateRow, "id">
> & {
  id?: number;
};

export type UpdateSocialSecurityCurrencyRateInput = Partial<
  Omit<SocialSecurityCurrencyRateRow, "id">
>;

const tableName = "social_security_currency_rate" as const;

const selectSocialSecurityCurrencyRate = "id, currency_rate";

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

async function nextSocialSecurityCurrencyRateId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف لسعر عملة الضمان الاجتماعي");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(): Promise<SocialSecurityCurrencyRateRow[]> {
  const { data, error } = await supabase
    .from(tableName)
    .select(selectSocialSecurityCurrencyRate)
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات أسعار عملة الضمان الاجتماعي");
  }
  return (data as unknown as SocialSecurityCurrencyRateRow[] | null) ?? [];
}

export async function getById(
  id: number | string,
): Promise<SocialSecurityCurrencyRateRow> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectSocialSecurityCurrencyRate)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات سعر عملة الضمان الاجتماعي");
  }
  return data as unknown as SocialSecurityCurrencyRateRow;
}

export async function createSocialSecurityCurrencyRate(
  input: CreateSocialSecurityCurrencyRateInput,
): Promise<SocialSecurityCurrencyRateRow> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextSocialSecurityCurrencyRateId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectSocialSecurityCurrencyRate)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل سعر عملة الضمان الاجتماعي");
  }
  return data as unknown as SocialSecurityCurrencyRateRow;
}

export async function updateSocialSecurityCurrencyRate(
  id: number | string,
  patch: UpdateSocialSecurityCurrencyRateInput,
): Promise<SocialSecurityCurrencyRateRow> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectSocialSecurityCurrencyRate)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل سعر عملة الضمان الاجتماعي");
  }
  return data as unknown as SocialSecurityCurrencyRateRow;
}

export async function deleteSocialSecurityCurrencyRate(
  id: number | string,
): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف سعر عملة الضمان الاجتماعي");
  }
  return data;
}
