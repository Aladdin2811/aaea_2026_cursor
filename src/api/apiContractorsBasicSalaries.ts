import { supabase } from "../lib/supabase";
import type { JobCategoryEmbedded } from "./apiJobCategory";
import type { JobNatureEmbedded } from "./apiJobNature";

export type ContractorsBasicSalariesRow = {
  id: number;
  job_nature_id: number | null;
  job_category_id: number | null;
  basic_first_bound: string | number | null;
  basic_last_bound: string | number | null;
  living: string | number | null;
  bonus_amount: string | number | null;
  notes: string | null;
  status: boolean | null;
  job_nature: JobNatureEmbedded | JobNatureEmbedded[] | null;
  job_category: JobCategoryEmbedded | JobCategoryEmbedded[] | null;
};

export type CreateContractorsBasicSalariesInput = Partial<
  Omit<ContractorsBasicSalariesRow, "id" | "job_nature" | "job_category">
> & {
  id?: number;
};

export type UpdateContractorsBasicSalariesInput = Partial<
  Omit<ContractorsBasicSalariesRow, "id" | "job_nature" | "job_category">
>;

export type ContractorsBasicSalariesListFilters = {
  job_nature_id?: number | string;
  job_category_id?: number | string;
  activeOnly?: boolean;
};

const tableName = "contractors_basic_salaries" as const;

const selectContractorsBasicSalaries = `
  id,
  job_nature_id,
  job_category_id,
  basic_first_bound,
  basic_last_bound,
  living,
  bonus_amount,
  notes,
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

async function nextContractorsBasicSalariesId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف لراتب المتعاقد الأساسي");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(
  filters?: ContractorsBasicSalariesListFilters,
): Promise<ContractorsBasicSalariesRow[]> {
  let query = supabase
    .from(tableName)
    .select(selectContractorsBasicSalaries)
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
    throw new Error("لا يمكن الحصول على بيانات الرواتب الأساسية للمتعاقدين");
  }
  return (data as unknown as ContractorsBasicSalariesRow[] | null) ?? [];
}

export async function getById(
  id: number | string,
): Promise<ContractorsBasicSalariesRow> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectContractorsBasicSalaries)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات الراتب الأساسي للمتعاقد");
  }
  return data as unknown as ContractorsBasicSalariesRow;
}

export async function createContractorsBasicSalaries(
  input: CreateContractorsBasicSalariesInput,
): Promise<ContractorsBasicSalariesRow> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextContractorsBasicSalariesId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectContractorsBasicSalaries)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل الراتب الأساسي للمتعاقد");
  }
  return data as unknown as ContractorsBasicSalariesRow;
}

export async function updateContractorsBasicSalaries(
  id: number | string,
  patch: UpdateContractorsBasicSalariesInput,
): Promise<ContractorsBasicSalariesRow> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectContractorsBasicSalaries)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل الراتب الأساسي للمتعاقد");
  }
  return data as unknown as ContractorsBasicSalariesRow;
}

export async function deleteContractorsBasicSalaries(
  id: number | string,
): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف الراتب الأساسي للمتعاقد");
  }
  return data;
}
