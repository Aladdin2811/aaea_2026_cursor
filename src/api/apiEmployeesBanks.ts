import { supabase } from "../lib/supabase";

export type EmployeesBanksEmployeeEmbed = {
  id: number;
  fingerprint_id: number;
  employee_name: string | null;
  job_category_id: number | null;
  job_grade_id: number | null;
  retired: boolean | null;
};

export type EmployeesBanksRow = {
  id: number;
  employee_id: number | null;
  bank_name: string | null;
  bank_account_no: string | null;
  status: boolean | null;
};

export type EmployeesBanksWithRelations = EmployeesBanksRow & {
  all_employees:
    | EmployeesBanksEmployeeEmbed
    | EmployeesBanksEmployeeEmbed[]
    | null;
};

export type CreateEmployeesBanksInput = Partial<
  Omit<EmployeesBanksRow, "id">
> & {
  id?: number;
};

export type UpdateEmployeesBanksInput = Partial<Omit<EmployeesBanksRow, "id">>;

export type EmployeesBanksListFilters = {
  employee_id?: number | string;
  activeOnly?: boolean;
};

const tableName = "employees_banks" as const;

const selectEmployeesBanksEmbed = `
  id,
  employee_id,
  bank_name,
  bank_account_no,
  status,
  all_employees!employees_banks_employee_id_fkey ( id, fingerprint_id, employee_name, job_category_id, job_grade_id, retired )
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

async function nextEmployeesBanksId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف لحساب بنكي للموظف");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(
  filters?: EmployeesBanksListFilters,
): Promise<EmployeesBanksWithRelations[]> {
  let query = supabase
    .from(tableName)
    .select(selectEmployeesBanksEmbed)
    .order("employee_id", { ascending: true, nullsFirst: false })
    .order("id", { ascending: true });

  if (filters?.employee_id != null) {
    query = query.eq(
      "employee_id",
      parseNumericId(filters.employee_id, "الموظف"),
    );
  }
  if (filters?.activeOnly === true) {
    query = query.eq("status", true);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات حسابات الموظفين البنكية");
  }
  return (data as unknown as EmployeesBanksWithRelations[] | null) ?? [];
}

export async function getById(
  id: number | string,
): Promise<EmployeesBanksWithRelations> {
  const rowId = parseNumericId(id, "رقم الحساب البنكي");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectEmployeesBanksEmbed)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات الحساب البنكي");
  }
  return data as unknown as EmployeesBanksWithRelations;
}

export async function createEmployeesBanks(
  input: CreateEmployeesBanksInput,
): Promise<EmployeesBanksWithRelations> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextEmployeesBanksId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectEmployeesBanksEmbed)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل الحساب البنكي للموظف");
  }
  return data as unknown as EmployeesBanksWithRelations;
}

export async function updateEmployeesBanks(
  id: number | string,
  patch: UpdateEmployeesBanksInput,
): Promise<EmployeesBanksWithRelations> {
  const rowId = parseNumericId(id, "رقم الحساب البنكي");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectEmployeesBanksEmbed)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل الحساب البنكي للموظف");
  }
  return data as unknown as EmployeesBanksWithRelations;
}

export async function deleteEmployeesBanks(
  id: number | string,
): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم الحساب البنكي");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف الحساب البنكي للموظف");
  }
  return data;
}
