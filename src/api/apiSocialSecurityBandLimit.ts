import { supabase } from "../lib/supabase";
import type { SocialSecurityBandEmbedded } from "./apiSocialSecurityBand";

export type SocialSecurityBandLimitCategoryEmbed = {
  id: number;
  social_security_category_name: string | null;
};

export type SocialSecurityBandLimitCurrencyEmbed = {
  id: number;
  social_security_currency_name: string | null;
};

export type SocialSecurityBandLimitSituationEmbed = {
  id: number;
  social_security_situation_name: string | null;
};

export type SocialSecurityBandLimitClassificationEmbed = {
  id: number;
  social_security_classification_name: string | null;
};

export type SocialSecurityBandLimitRow = {
  id: number;
  social_security_band_id: number | null;
  social_security_category_id: number | null;
  social_security_band_limit: string | number | null;
  social_security_currency_id: number | null;
  social_security_situation_id: number | null;
  social_security_notes: string | null;
  social_security_classification_id: number | null;
  social_security_band_percentage: number | null;
};

export type SocialSecurityBandLimitWithRelations = SocialSecurityBandLimitRow & {
  social_security_band:
    | SocialSecurityBandEmbedded
    | SocialSecurityBandEmbedded[]
    | null;
  social_security_category:
    | SocialSecurityBandLimitCategoryEmbed
    | SocialSecurityBandLimitCategoryEmbed[]
    | null;
  social_security_currency:
    | SocialSecurityBandLimitCurrencyEmbed
    | SocialSecurityBandLimitCurrencyEmbed[]
    | null;
  social_security_situations:
    | SocialSecurityBandLimitSituationEmbed
    | SocialSecurityBandLimitSituationEmbed[]
    | null;
  social_security_classification:
    | SocialSecurityBandLimitClassificationEmbed
    | SocialSecurityBandLimitClassificationEmbed[]
    | null;
};

export type CreateSocialSecurityBandLimitInput = Partial<
  Omit<SocialSecurityBandLimitRow, "id">
> & {
  id?: number;
};

export type UpdateSocialSecurityBandLimitInput = Partial<
  Omit<SocialSecurityBandLimitRow, "id">
>;

export type SocialSecurityBandLimitListFilters = {
  social_security_band_id?: number | string;
  social_security_category_id?: number | string;
  social_security_currency_id?: number | string;
  social_security_situation_id?: number | string;
  social_security_classification_id?: number | string;
};

const tableName = "social_security_band_limit" as const;

const selectSocialSecurityBandLimitEmbed = `
  id,
  social_security_band_id,
  social_security_category_id,
  social_security_band_limit,
  social_security_currency_id,
  social_security_situation_id,
  social_security_notes,
  social_security_classification_id,
  social_security_band_percentage,
  social_security_band ( id, social_security_band_name ),
  social_security_category ( id, social_security_category_name ),
  social_security_currency ( id, social_security_currency_name ),
  social_security_situations ( id, social_security_situation_name ),
  social_security_classification ( id, social_security_classification_name )
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

async function nextSocialSecurityBandLimitId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف لسقف الضمان الاجتماعي");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(
  filters?: SocialSecurityBandLimitListFilters,
): Promise<SocialSecurityBandLimitWithRelations[]> {
  let query = supabase
    .from(tableName)
    .select(selectSocialSecurityBandLimitEmbed)
    .order("social_security_band_id", { ascending: true, nullsFirst: false })
    .order("id", { ascending: true });

  if (filters?.social_security_band_id != null) {
    query = query.eq(
      "social_security_band_id",
      parseNumericId(filters.social_security_band_id, "بند الضمان الاجتماعي"),
    );
  }
  if (filters?.social_security_category_id != null) {
    query = query.eq(
      "social_security_category_id",
      parseNumericId(filters.social_security_category_id, "تصنيف الضمان"),
    );
  }
  if (filters?.social_security_currency_id != null) {
    query = query.eq(
      "social_security_currency_id",
      parseNumericId(filters.social_security_currency_id, "عملة الضمان"),
    );
  }
  if (filters?.social_security_situation_id != null) {
    query = query.eq(
      "social_security_situation_id",
      parseNumericId(filters.social_security_situation_id, "وضع الضمان"),
    );
  }
  if (filters?.social_security_classification_id != null) {
    query = query.eq(
      "social_security_classification_id",
      parseNumericId(
        filters.social_security_classification_id,
        "تصنيف فرعي للضمان",
      ),
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات أسقف الضمان الاجتماعي");
  }
  return (data as unknown as SocialSecurityBandLimitWithRelations[] | null) ?? [];
}

export async function getById(
  id: number | string,
): Promise<SocialSecurityBandLimitWithRelations> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectSocialSecurityBandLimitEmbed)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات سقف الضمان الاجتماعي");
  }
  return data as unknown as SocialSecurityBandLimitWithRelations;
}

export async function createSocialSecurityBandLimit(
  input: CreateSocialSecurityBandLimitInput,
): Promise<SocialSecurityBandLimitWithRelations> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextSocialSecurityBandLimitId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectSocialSecurityBandLimitEmbed)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل سقف الضمان الاجتماعي");
  }
  return data as unknown as SocialSecurityBandLimitWithRelations;
}

export async function updateSocialSecurityBandLimit(
  id: number | string,
  patch: UpdateSocialSecurityBandLimitInput,
): Promise<SocialSecurityBandLimitWithRelations> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectSocialSecurityBandLimitEmbed)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل سقف الضمان الاجتماعي");
  }
  return data as unknown as SocialSecurityBandLimitWithRelations;
}

export async function deleteSocialSecurityBandLimit(
  id: number | string,
): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف سقف الضمان الاجتماعي");
  }
  return data;
}
