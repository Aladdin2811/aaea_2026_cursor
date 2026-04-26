import { supabase } from "../lib/supabase";

export type SocialSecurityCurrencyRow = {
  id: number;
  social_security_currency_name: string | null;
};

/** شكل العلاقة المضمّنة في استعلامات أخرى (`social_security_currency (...)`) */
export type SocialSecurityCurrencyEmbedded = Pick<
  SocialSecurityCurrencyRow,
  "id" | "social_security_currency_name"
>;

export type CreateSocialSecurityCurrencyInput = Partial<
  Omit<SocialSecurityCurrencyRow, "id">
> & {
  id?: number;
};

export type UpdateSocialSecurityCurrencyInput = Partial<
  Omit<SocialSecurityCurrencyRow, "id">
>;

const tableName = "social_security_currency" as const;

const selectSocialSecurityCurrency = `
  id,
  social_security_currency_name
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

async function nextSocialSecurityCurrencyId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف لعملة الضمان الاجتماعي");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(): Promise<SocialSecurityCurrencyRow[]> {
  const { data, error } = await supabase
    .from(tableName)
    .select(selectSocialSecurityCurrency)
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات عملات الضمان الاجتماعي");
  }
  return (data as unknown as SocialSecurityCurrencyRow[] | null) ?? [];
}

export async function getById(
  id: number | string,
): Promise<SocialSecurityCurrencyRow> {
  const rowId = parseNumericId(id, "رقم العملة");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectSocialSecurityCurrency)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات عملة الضمان الاجتماعي");
  }
  return data as unknown as SocialSecurityCurrencyRow;
}

export async function createSocialSecurityCurrency(
  input: CreateSocialSecurityCurrencyInput,
): Promise<SocialSecurityCurrencyRow> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextSocialSecurityCurrencyId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectSocialSecurityCurrency)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل عملة الضمان الاجتماعي");
  }
  return data as unknown as SocialSecurityCurrencyRow;
}

export async function updateSocialSecurityCurrency(
  id: number | string,
  patch: UpdateSocialSecurityCurrencyInput,
): Promise<SocialSecurityCurrencyRow> {
  const rowId = parseNumericId(id, "رقم العملة");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectSocialSecurityCurrency)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل عملة الضمان الاجتماعي");
  }
  return data as unknown as SocialSecurityCurrencyRow;
}

export async function deleteSocialSecurityCurrency(
  id: number | string,
): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم العملة");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف عملة الضمان الاجتماعي");
  }
  return data;
}
