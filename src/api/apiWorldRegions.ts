import { supabase } from "../lib/supabase";

export type WorldRegionRow = {
  id: number;
  world_region_name: string | null;
  status: boolean | null;
};

/** شكل العلاقة المضمّنة في استعلامات أخرى (`world_regions (...)`) */
export type WorldRegionEmbedded = Pick<
  WorldRegionRow,
  "id" | "world_region_name"
>;

export type CreateWorldRegionInput = Partial<Omit<WorldRegionRow, "id">> & {
  id?: number;
};

export type UpdateWorldRegionInput = Partial<Omit<WorldRegionRow, "id">>;

export type WorldRegionListFilters = {
  activeOnly?: boolean;
};

const tableName = "world_regions" as const;

const selectWorldRegions = "id, world_region_name, status";

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

async function nextWorldRegionId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف لمناطق دول العالم");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(
  filters?: WorldRegionListFilters,
): Promise<WorldRegionRow[]> {
  let query = supabase
    .from(tableName)
    .select(selectWorldRegions)
    .order("id", { ascending: true });

  if (filters?.activeOnly === true) {
    query = query.eq("status", true);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات تصنيف المناطق لدول العالم");
  }
  return (data as unknown as WorldRegionRow[] | null) ?? [];
}

export async function getById(id: number | string): Promise<WorldRegionRow> {
  const rowId = parseNumericId(id, "رقم المنطقة");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectWorldRegions)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات منطقة دول العالم");
  }
  return data as unknown as WorldRegionRow;
}

export async function createWorldRegion(
  input: CreateWorldRegionInput,
): Promise<WorldRegionRow> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextWorldRegionId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectWorldRegions)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل منطقة دول العالم");
  }
  return data as unknown as WorldRegionRow;
}

export async function updateWorldRegion(
  id: number | string,
  patch: UpdateWorldRegionInput,
): Promise<WorldRegionRow> {
  const rowId = parseNumericId(id, "رقم المنطقة");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectWorldRegions)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل منطقة دول العالم");
  }
  return data as unknown as WorldRegionRow;
}

export async function deleteWorldRegion(id: number | string): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم المنطقة");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف منطقة دول العالم");
  }
  return data;
}
