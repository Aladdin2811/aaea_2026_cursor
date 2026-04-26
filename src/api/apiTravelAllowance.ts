import { supabase } from "../lib/supabase";
import type { JobCategoryEmbedded } from "./apiJobCategory";
import type { JobGradeEmbedded } from "./apiJobGrade";
import type { JobNatureEmbedded } from "./apiJobNature";
import type { WorldRegionRow } from "./apiWorldRegions";

export type WorldRegionEmbedded = Pick<
  WorldRegionRow,
  "id" | "world_region_name"
>;

export type TravelAllowanceRow = {
  id: number;
  job_nature_id: number | null;
  job_category_id: number | null;
  job_grade_id: number | null;
  world_region_id: number | null;
  amount: string | number | null;
  status: boolean | null;
  job_nature: JobNatureEmbedded | JobNatureEmbedded[] | null;
  job_category: JobCategoryEmbedded | JobCategoryEmbedded[] | null;
  job_grade: JobGradeEmbedded | JobGradeEmbedded[] | null;
  world_regions: WorldRegionEmbedded | WorldRegionEmbedded[] | null;
};

export type CreateTravelAllowanceInput = Partial<
  Omit<
    TravelAllowanceRow,
    | "id"
    | "job_nature"
    | "job_category"
    | "job_grade"
    | "world_regions"
  >
> & {
  id?: number;
};

export type UpdateTravelAllowanceInput = Partial<
  Omit<
    TravelAllowanceRow,
    | "id"
    | "job_nature"
    | "job_category"
    | "job_grade"
    | "world_regions"
  >
>;

export type TravelAllowanceListFilters = {
  job_nature_id?: number | string;
  job_category_id?: number | string;
  job_grade_id?: number | string;
  world_region_id?: number | string;
  activeOnly?: boolean;
};

const tableName = "travel_allowance" as const;

const selectTravelAllowance = `
  id,
  job_nature_id,
  job_category_id,
  job_grade_id,
  world_region_id,
  amount,
  status,
  job_nature (
    id,
    job_nature_name
  ),
  job_category (
    id,
    job_category_name
  ),
  job_grade (
    id,
    job_grade_name
  ),
  world_regions (
    id,
    world_region_name
  )
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

async function nextTravelAllowanceId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف لتعويض بدل السفر");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(
  filters?: TravelAllowanceListFilters,
): Promise<TravelAllowanceRow[]> {
  let query = supabase
    .from(tableName)
    .select(selectTravelAllowance)
    .order("job_nature_id", { ascending: true, nullsFirst: false })
    .order("job_category_id", { ascending: true, nullsFirst: false })
    .order("job_grade_id", { ascending: true, nullsFirst: false })
    .order("world_region_id", { ascending: true, nullsFirst: false })
    .order("id", { ascending: true });

  if (filters?.job_nature_id != null) {
    query = query.eq(
      "job_nature_id",
      parseNumericId(filters.job_nature_id, "طبيعة العمل"),
    );
  }
  if (filters?.job_category_id != null) {
    query = query.eq(
      "job_category_id",
      parseNumericId(filters.job_category_id, "الفئة الوظيفية"),
    );
  }
  if (filters?.job_grade_id != null) {
    query = query.eq(
      "job_grade_id",
      parseNumericId(filters.job_grade_id, "الدرجة الوظيفية"),
    );
  }
  if (filters?.world_region_id != null) {
    query = query.eq(
      "world_region_id",
      parseNumericId(filters.world_region_id, "منطقة العالم"),
    );
  }
  if (filters?.activeOnly === true) {
    query = query.eq("status", true);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات تعويض بدل السفر");
  }
  return (data as unknown as TravelAllowanceRow[] | null) ?? [];
}

export async function getById(
  id: number | string,
): Promise<TravelAllowanceRow> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectTravelAllowance)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات تعويض بدل السفر");
  }
  return data as unknown as TravelAllowanceRow;
}

export async function createTravelAllowance(
  input: CreateTravelAllowanceInput,
): Promise<TravelAllowanceRow> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextTravelAllowanceId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectTravelAllowance)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل تعويض بدل السفر");
  }
  return data as unknown as TravelAllowanceRow;
}

export async function updateTravelAllowance(
  id: number | string,
  patch: UpdateTravelAllowanceInput,
): Promise<TravelAllowanceRow> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectTravelAllowance)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل تعويض بدل السفر");
  }
  return data as unknown as TravelAllowanceRow;
}

export async function deleteTravelAllowance(
  id: number | string,
): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف تعويض بدل السفر");
  }
  return data;
}
