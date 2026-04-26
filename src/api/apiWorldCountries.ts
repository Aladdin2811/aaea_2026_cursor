import { supabase } from "../lib/supabase";

export type WorldRegionEmbed = {
  id: number;
  world_region_name: string | null;
  status: boolean | null;
};

export type WorldClassificationEmbed = {
  id: number;
  world_classification_name: string | null;
  status: boolean | null;
};

export type WorldCountryRow = {
  id: number;
  world_country_name: string | null;
  world_region_id: number | null;
  world_classification_id: number | null;
  status: boolean | null;
  sort: number | null;
};

export type WorldCountryWithRelations = WorldCountryRow & {
  world_regions: WorldRegionEmbed | WorldRegionEmbed[] | null;
  world_classifications:
    | WorldClassificationEmbed
    | WorldClassificationEmbed[]
    | null;
};

export type CreateWorldCountryInput = Partial<Omit<WorldCountryRow, "id">> & {
  id?: number;
};

export type UpdateWorldCountryInput = Partial<Omit<WorldCountryRow, "id">>;

export type WorldCountryListFilters = {
  world_region_id?: number | string;
  world_classification_id?: number | string;
  activeOnly?: boolean;
};

const tableName = "world_countries" as const;

const selectWorldCountryEmbed = `
  id,
  world_country_name,
  world_region_id,
  world_classification_id,
  status,
  sort,
  world_regions ( id, world_region_name, status ),
  world_classifications ( id, world_classification_name, status )
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

async function nextWorldCountryId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف لدول العالم");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(
  filters?: WorldCountryListFilters,
): Promise<WorldCountryWithRelations[]> {
  let query = supabase
    .from(tableName)
    .select(selectWorldCountryEmbed)
    .order("sort", { ascending: true, nullsFirst: false })
    .order("id", { ascending: true });

  if (filters?.world_region_id != null) {
    query = query.eq(
      "world_region_id",
      parseNumericId(filters.world_region_id, "المنطقة"),
    );
  }
  if (filters?.world_classification_id != null) {
    query = query.eq(
      "world_classification_id",
      parseNumericId(filters.world_classification_id, "التصنيف"),
    );
  }
  if (filters?.activeOnly === true) {
    query = query.eq("status", true);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات أسماء دول العالم");
  }
  return (data as unknown as WorldCountryWithRelations[] | null) ?? [];
}

export async function getById(
  id: number | string,
): Promise<WorldCountryWithRelations> {
  const rowId = parseNumericId(id, "رقم الدولة");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectWorldCountryEmbed)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات الدولة");
  }
  return data as unknown as WorldCountryWithRelations;
}

export async function getForSelect(
  worldClassificationId: number | string,
): Promise<WorldCountryWithRelations[]> {
  const id = parseNumericId(
    worldClassificationId,
    "تصنيف دول العالم",
  );

  const { data, error } = await supabase
    .from(tableName)
    .select(selectWorldCountryEmbed)
    .eq("world_classification_id", id)
    .eq("status", true)
    .order("sort", { ascending: true, nullsFirst: false })
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات أسماء دول العالم");
  }
  return (data as unknown as WorldCountryWithRelations[] | null) ?? [];
}

export async function createWorldCountry(
  input: CreateWorldCountryInput,
): Promise<WorldCountryWithRelations> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextWorldCountryId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectWorldCountryEmbed)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل الدولة");
  }
  return data as unknown as WorldCountryWithRelations;
}

export async function updateWorldCountry(
  id: number | string,
  patch: UpdateWorldCountryInput,
): Promise<WorldCountryWithRelations> {
  const rowId = parseNumericId(id, "رقم الدولة");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectWorldCountryEmbed)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل الدولة");
  }
  return data as unknown as WorldCountryWithRelations;
}

export async function deleteWorldCountry(id: number | string): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم الدولة");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف الدولة");
  }
  return data;
}
