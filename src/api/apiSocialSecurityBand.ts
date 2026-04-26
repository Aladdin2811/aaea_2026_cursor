import { supabase } from "../lib/supabase";

export type SocialSecurityBandRow = {
  id: number;
  social_security_band_name: string | null;
};

/** شكل العلاقة المضمّنة في استعلامات أخرى (`social_security_band (...)`) */
export type SocialSecurityBandEmbedded = Pick<
  SocialSecurityBandRow,
  "id" | "social_security_band_name"
>;

export type CreateSocialSecurityBandInput = Partial<
  Omit<SocialSecurityBandRow, "id">
> & {
  id?: number;
};

export type UpdateSocialSecurityBandInput = Partial<
  Omit<SocialSecurityBandRow, "id">
>;

const tableName = "social_security_band" as const;

const selectSocialSecurityBand = `
  id,
  social_security_band_name
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

async function nextSocialSecurityBandId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف لبند الضمان الاجتماعي");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(): Promise<SocialSecurityBandRow[]> {
  const { data, error } = await supabase
    .from(tableName)
    .select(selectSocialSecurityBand)
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات بنود الضمان الاجتماعي");
  }
  return (data as unknown as SocialSecurityBandRow[] | null) ?? [];
}

export async function getById(
  id: number | string,
): Promise<SocialSecurityBandRow> {
  const rowId = parseNumericId(id, "رقم بند الضمان الاجتماعي");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectSocialSecurityBand)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات بند الضمان الاجتماعي");
  }
  return data as unknown as SocialSecurityBandRow;
}

export async function createSocialSecurityBand(
  input: CreateSocialSecurityBandInput,
): Promise<SocialSecurityBandRow> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextSocialSecurityBandId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectSocialSecurityBand)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل بند الضمان الاجتماعي");
  }
  return data as unknown as SocialSecurityBandRow;
}

export async function updateSocialSecurityBand(
  id: number | string,
  patch: UpdateSocialSecurityBandInput,
): Promise<SocialSecurityBandRow> {
  const rowId = parseNumericId(id, "رقم بند الضمان الاجتماعي");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectSocialSecurityBand)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل بند الضمان الاجتماعي");
  }
  return data as unknown as SocialSecurityBandRow;
}

export async function deleteSocialSecurityBand(
  id: number | string,
): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم بند الضمان الاجتماعي");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف بند الضمان الاجتماعي");
  }
  return data;
}
