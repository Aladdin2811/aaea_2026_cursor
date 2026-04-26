import { supabase } from "../lib/supabase";

export type JobTitleRow = {
  id: number;
  job_title_name: string | null;
  status: boolean | null;
};

/** شكل العلاقة المضمّنة في استعلامات أخرى (`job_title (...)`) */
export type JobTitleEmbedded = Pick<JobTitleRow, "id" | "job_title_name">;

export type CreateJobTitleInput = Partial<Omit<JobTitleRow, "id">> & {
  id?: number;
};

export type UpdateJobTitleInput = Partial<Omit<JobTitleRow, "id">>;

export type JobTitleListFilters = {
  activeOnly?: boolean;
};

const tableName = "job_title" as const;

const selectJobTitle = `
  id,
  job_title_name,
  status
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

async function nextJobTitleId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف للمسمى الوظيفي");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(
  filters?: JobTitleListFilters,
): Promise<JobTitleRow[]> {
  let query = supabase
    .from(tableName)
    .select(selectJobTitle)
    .order("id", { ascending: true });

  if (filters?.activeOnly === true) {
    query = query.eq("status", true);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات المسميات الوظيفية");
  }
  return (data as unknown as JobTitleRow[] | null) ?? [];
}

export async function getById(id: number | string): Promise<JobTitleRow> {
  const rowId = parseNumericId(id, "رقم المسمى الوظيفي");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectJobTitle)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات المسمى الوظيفي");
  }
  return data as unknown as JobTitleRow;
}

export async function createJobTitle(
  input: CreateJobTitleInput,
): Promise<JobTitleRow> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextJobTitleId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectJobTitle)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل المسمى الوظيفي");
  }
  return data as unknown as JobTitleRow;
}

export async function updateJobTitle(
  id: number | string,
  patch: UpdateJobTitleInput,
): Promise<JobTitleRow> {
  const rowId = parseNumericId(id, "رقم المسمى الوظيفي");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectJobTitle)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل المسمى الوظيفي");
  }
  return data as unknown as JobTitleRow;
}

export async function deleteJobTitle(id: number | string): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم المسمى الوظيفي");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف المسمى الوظيفي");
  }
  return data;
}
