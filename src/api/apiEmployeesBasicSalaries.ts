import { supabase } from "../lib/supabase";
import type { JobCategoryEmbedded } from "./apiJobCategory";
import type { JobGradeEmbedded } from "./apiJobGrade";
import type { JobNatureEmbedded } from "./apiJobNature";

export type EmployeesBasicSalariesRow = {
  id: number;
  job_nature_id: number | null;
  job_category_id: number | null;
  job_grade_id: number | null;
  basic_first_bound: string | number | null;
  basic_last_bound: string | number | null;
  living_cost: string | number | null;
  representation: string | number | null;
  housing: string | number | null;
  living: string | number | null;
  total_first_bound: string | number | null;
  total_last_bound: string | number | null;
  bonus_amount: string | number | null;
  bonus_count: number | null;
  status: boolean | null;
  job_nature: JobNatureEmbedded | JobNatureEmbedded[] | null;
  job_category: JobCategoryEmbedded | JobCategoryEmbedded[] | null;
  job_grade: JobGradeEmbedded | JobGradeEmbedded[] | null;
};

export type CreateEmployeesBasicSalariesInput = Partial<
  Omit<
    EmployeesBasicSalariesRow,
    "id" | "job_nature" | "job_category" | "job_grade"
  >
> & {
  id?: number;
};

export type UpdateEmployeesBasicSalariesInput = Partial<
  Omit<
    EmployeesBasicSalariesRow,
    "id" | "job_nature" | "job_category" | "job_grade"
  >
>;

export type EmployeesBasicSalariesListFilters = {
  job_nature_id?: number | string;
  job_category_id?: number | string;
  job_grade_id?: number | string;
  activeOnly?: boolean;
};

const tableName = "employees_basic_salaries" as const;

const selectEmployeesBasicSalaries = `
  id,
  job_nature_id,
  job_category_id,
  job_grade_id,
  basic_first_bound,
  basic_last_bound,
  living_cost,
  representation,
  housing,
  living,
  total_first_bound,
  total_last_bound,
  bonus_amount,
  bonus_count,
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

async function nextEmployeesBasicSalariesId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف للراتب الأساسي للموظف");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(
  filters?: EmployeesBasicSalariesListFilters,
): Promise<EmployeesBasicSalariesRow[]> {
  let query = supabase
    .from(tableName)
    .select(selectEmployeesBasicSalaries)
    .order("job_grade_id", { ascending: true, nullsFirst: false })
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
  if (filters?.job_grade_id != null) {
    query = query.eq(
      "job_grade_id",
      parseNumericId(filters.job_grade_id, "الدرجة"),
    );
  }
  if (filters?.activeOnly === true) {
    query = query.eq("status", true);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات الرواتب الأساسية للموظفين");
  }
  return (data as unknown as EmployeesBasicSalariesRow[] | null) ?? [];
}

export async function getById(
  id: number | string,
): Promise<EmployeesBasicSalariesRow> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectEmployeesBasicSalaries)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات الراتب الأساسي للموظف");
  }
  return data as unknown as EmployeesBasicSalariesRow;
}

export async function createEmployeesBasicSalaries(
  input: CreateEmployeesBasicSalariesInput,
): Promise<EmployeesBasicSalariesRow> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextEmployeesBasicSalariesId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectEmployeesBasicSalaries)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل الراتب الأساسي للموظف");
  }
  return data as unknown as EmployeesBasicSalariesRow;
}

export async function updateEmployeesBasicSalaries(
  id: number | string,
  patch: UpdateEmployeesBasicSalariesInput,
): Promise<EmployeesBasicSalariesRow> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectEmployeesBasicSalaries)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل الراتب الأساسي للموظف");
  }
  return data as unknown as EmployeesBasicSalariesRow;
}

export async function deleteEmployeesBasicSalaries(
  id: number | string,
): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف الراتب الأساسي للموظف");
  }
  return data;
}
