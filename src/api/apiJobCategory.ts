import { supabase } from "../lib/supabase";
import type { JobNatureEmbedded } from "./apiJobNature";

export type JobCategoryRow = {
  id: number;
  job_category_name: string | null;
  job_nature_id: number | null;
  description: string | null;
  status: boolean | null;
  job_nature: JobNatureEmbedded | JobNatureEmbedded[] | null;
};

export type JobCategoryEmbedded = Pick<
  JobCategoryRow,
  "id" | "job_category_name"
>;

export type CreateJobCategoryInput = Partial<
  Omit<JobCategoryRow, "id" | "job_nature">
> & {
  id?: number;
};

export type UpdateJobCategoryInput = Partial<
  Omit<JobCategoryRow, "id" | "job_nature">
>;

export type JobCategoryListFilters = {
  job_nature_id?: number | string;
  activeOnly?: boolean;
};

const tableName = "job_category" as const;

const selectJobCategory = `
  id,
  job_category_name,
  job_nature_id,
  description,
  status,
  job_nature (
    id,
    job_nature_name
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

async function nextJobCategoryId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف للفئة الوظيفية");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(
  filters?: JobCategoryListFilters,
): Promise<JobCategoryRow[]> {
  let query = supabase
    .from(tableName)
    .select(selectJobCategory)
    .order("job_nature_id", { ascending: true, nullsFirst: false })
    .order("id", { ascending: true });

  if (filters?.job_nature_id != null) {
    query = query.eq(
      "job_nature_id",
      parseNumericId(filters.job_nature_id, "طبيعة العمل"),
    );
  }
  if (filters?.activeOnly === true) {
    query = query.eq("status", true);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات الفئات الوظيفية");
  }
  return (data as unknown as JobCategoryRow[] | null) ?? [];
}

export async function getById(id: number | string): Promise<JobCategoryRow> {
  const rowId = parseNumericId(id, "رقم الفئة الوظيفية");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectJobCategory)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات الفئة الوظيفية");
  }
  return data as unknown as JobCategoryRow;
}

export async function createJobCategory(
  input: CreateJobCategoryInput,
): Promise<JobCategoryRow> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextJobCategoryId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectJobCategory)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل الفئة الوظيفية");
  }
  return data as unknown as JobCategoryRow;
}

export async function updateJobCategory(
  id: number | string,
  patch: UpdateJobCategoryInput,
): Promise<JobCategoryRow> {
  const rowId = parseNumericId(id, "رقم الفئة الوظيفية");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectJobCategory)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل الفئة الوظيفية");
  }
  return data as unknown as JobCategoryRow;
}

export async function deleteJobCategory(id: number | string): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم الفئة الوظيفية");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف الفئة الوظيفية");
  }
  return data;
}
