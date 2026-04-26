import { supabase } from "../lib/supabase";
import type { JobCategoryEmbedded } from "./apiJobCategory";
import type { JobNatureEmbedded } from "./apiJobNature";

export type JobGradeRow = {
  id: number;
  job_grade_name: string | null;
  job_nature_id: number | null;
  job_category_id: number | null;
  status: boolean | null;
  job_nature: JobNatureEmbedded | JobNatureEmbedded[] | null;
  job_category: JobCategoryEmbedded | JobCategoryEmbedded[] | null;
};

/** شكل العلاقة المضمّنة في استعلامات أخرى (`job_grade (...)`) */
export type JobGradeEmbedded = Pick<JobGradeRow, "id" | "job_grade_name">;

export type CreateJobGradeInput = Partial<
  Omit<JobGradeRow, "id" | "job_nature" | "job_category">
> & {
  id?: number;
};

export type UpdateJobGradeInput = Partial<
  Omit<JobGradeRow, "id" | "job_nature" | "job_category">
>;

export type JobGradeListFilters = {
  job_nature_id?: number | string;
  job_category_id?: number | string;
  activeOnly?: boolean;
};

const tableName = "job_grade" as const;

const selectJobGrade = `
  id,
  job_grade_name,
  job_nature_id,
  job_category_id,
  status,
  job_nature (
    id,
    job_nature_name
  ),
  job_category (
    id,
    job_category_name
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

async function nextJobGradeId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف للدرجة الوظيفية");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(
  filters?: JobGradeListFilters,
): Promise<JobGradeRow[]> {
  let query = supabase
    .from(tableName)
    .select(selectJobGrade)
    .order("job_nature_id", { ascending: true, nullsFirst: false })
    .order("job_category_id", { ascending: true, nullsFirst: false })
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
      parseNumericId(filters.job_category_id, "الفئة"),
    );
  }
  if (filters?.activeOnly === true) {
    query = query.eq("status", true);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات الدرجات الوظيفية");
  }
  return (data as unknown as JobGradeRow[] | null) ?? [];
}

export async function getById(id: number | string): Promise<JobGradeRow> {
  const rowId = parseNumericId(id, "رقم الدرجة الوظيفية");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectJobGrade)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات الدرجة الوظيفية");
  }
  return data as unknown as JobGradeRow;
}

export async function createJobGrade(
  input: CreateJobGradeInput,
): Promise<JobGradeRow> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextJobGradeId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectJobGrade)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل الدرجة الوظيفية");
  }
  return data as unknown as JobGradeRow;
}

export async function updateJobGrade(
  id: number | string,
  patch: UpdateJobGradeInput,
): Promise<JobGradeRow> {
  const rowId = parseNumericId(id, "رقم الدرجة الوظيفية");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectJobGrade)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل الدرجة الوظيفية");
  }
  return data as unknown as JobGradeRow;
}

export async function deleteJobGrade(id: number | string): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم الدرجة الوظيفية");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف الدرجة الوظيفية");
  }
  return data;
}
