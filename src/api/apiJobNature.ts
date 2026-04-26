import { supabase } from "../lib/supabase";

export type JobNatureRow = {
  id: number;
  job_nature_name: string | null;
  description: string | null;
  status: boolean | null;
};

/** شكل العلاقة المضمّنة في استعلامات أخرى (`job_nature (...)`) */
export type JobNatureEmbedded = Pick<JobNatureRow, "id" | "job_nature_name">;

export type CreateJobNatureInput = Partial<
  Omit<JobNatureRow, "id">
> & {
  id?: number;
};

export type UpdateJobNatureInput = Partial<Omit<JobNatureRow, "id">>;

export type JobNatureListFilters = {
  activeOnly?: boolean;
};

const tableName = "job_nature" as const;

const selectJobNature = `
  id,
  job_nature_name,
  description,
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

async function nextJobNatureId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف لطبيعة العمل");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(
  filters?: JobNatureListFilters,
): Promise<JobNatureRow[]> {
  let query = supabase
    .from(tableName)
    .select(selectJobNature)
    .order("id", { ascending: true });

  if (filters?.activeOnly === true) {
    query = query.eq("status", true);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات نوع طبيعة العمل");
  }
  return (data as unknown as JobNatureRow[] | null) ?? [];
}

export async function getById(id: number | string): Promise<JobNatureRow> {
  const rowId = parseNumericId(id, "رقم طبيعة العمل");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectJobNature)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات طبيعة العمل");
  }
  return data as unknown as JobNatureRow;
}

export async function createJobNature(
  input: CreateJobNatureInput,
): Promise<JobNatureRow> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextJobNatureId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectJobNature)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل طبيعة العمل");
  }
  return data as unknown as JobNatureRow;
}

export async function updateJobNature(
  id: number | string,
  patch: UpdateJobNatureInput,
): Promise<JobNatureRow> {
  const rowId = parseNumericId(id, "رقم طبيعة العمل");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectJobNature)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل طبيعة العمل");
  }
  return data as unknown as JobNatureRow;
}

export async function deleteJobNature(id: number | string): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم طبيعة العمل");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف طبيعة العمل");
  }
  return data;
}
