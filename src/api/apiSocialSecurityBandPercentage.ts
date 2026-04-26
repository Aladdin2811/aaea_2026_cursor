import { supabase } from "../lib/supabase";
import type { SocialSecurityBandEmbedded } from "./apiSocialSecurityBand";

export type SocialSecurityBandPercentageCategoryEmbed = {
  id: number;
  social_security_category_name: string | null;
};

export type SocialSecurityBandPercentageClassificationEmbed = {
  id: number;
  social_security_classification_name: string | null;
};

export type SocialSecurityBandPercentageRow = {
  id: number;
  social_security_band_id: number | null;
  social_security_category_id: number | null;
  social_security_classification_id: number | null;
  band_percentage: string | number | null;
};

export type SocialSecurityBandPercentageWithRelations =
  SocialSecurityBandPercentageRow & {
    social_security_band:
      | SocialSecurityBandEmbedded
      | SocialSecurityBandEmbedded[]
      | null;
    social_security_category:
      | SocialSecurityBandPercentageCategoryEmbed
      | SocialSecurityBandPercentageCategoryEmbed[]
      | null;
    social_security_classification:
      | SocialSecurityBandPercentageClassificationEmbed
      | SocialSecurityBandPercentageClassificationEmbed[]
      | null;
  };

export type CreateSocialSecurityBandPercentageInput = Partial<
  Omit<SocialSecurityBandPercentageRow, "id">
> & {
  id?: number;
};

export type UpdateSocialSecurityBandPercentageInput = Partial<
  Omit<SocialSecurityBandPercentageRow, "id">
>;

export type SocialSecurityBandPercentageListFilters = {
  social_security_band_id?: number | string;
  social_security_category_id?: number | string;
  social_security_classification_id?: number | string;
};

const tableName = "social_security_band_percentage" as const;

const selectSocialSecurityBandPercentageEmbed = `
  id,
  social_security_band_id,
  social_security_category_id,
  social_security_classification_id,
  band_percentage,
  social_security_band ( id, social_security_band_name ),
  social_security_category ( id, social_security_category_name ),
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

async function nextSocialSecurityBandPercentageId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف لنسبة بند الضمان الاجتماعي");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(
  filters?: SocialSecurityBandPercentageListFilters,
): Promise<SocialSecurityBandPercentageWithRelations[]> {
  let query = supabase
    .from(tableName)
    .select(selectSocialSecurityBandPercentageEmbed)
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
    throw new Error("لا يمكن الحصول على بيانات نسب بنود الضمان الاجتماعي");
  }
  return (
    (data as unknown as SocialSecurityBandPercentageWithRelations[] | null) ??
    []
  );
}

export async function getById(
  id: number | string,
): Promise<SocialSecurityBandPercentageWithRelations> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectSocialSecurityBandPercentageEmbed)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات نسبة بند الضمان الاجتماعي");
  }
  return data as unknown as SocialSecurityBandPercentageWithRelations;
}

export async function createSocialSecurityBandPercentage(
  input: CreateSocialSecurityBandPercentageInput,
): Promise<SocialSecurityBandPercentageWithRelations> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextSocialSecurityBandPercentageId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectSocialSecurityBandPercentageEmbed)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل نسبة بند الضمان الاجتماعي");
  }
  return data as unknown as SocialSecurityBandPercentageWithRelations;
}

export async function updateSocialSecurityBandPercentage(
  id: number | string,
  patch: UpdateSocialSecurityBandPercentageInput,
): Promise<SocialSecurityBandPercentageWithRelations> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectSocialSecurityBandPercentageEmbed)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل نسبة بند الضمان الاجتماعي");
  }
  return data as unknown as SocialSecurityBandPercentageWithRelations;
}

export async function deleteSocialSecurityBandPercentage(
  id: number | string,
): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف نسبة بند الضمان الاجتماعي");
  }
  return data;
}
