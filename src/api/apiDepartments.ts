import { supabase } from "../lib/supabase";

export type DepartmentsEmployeeEmbed = {
  id: number;
  fingerprint_id: number;
  employee_name: string | null;
};

export type DepartmentsRow = {
  id: number;
  department_name: string | null;
  havesections: boolean | null;
  employee_id: number | null;
};

export type DepartmentsWithRelations = DepartmentsRow & {
  all_employees:
    | DepartmentsEmployeeEmbed
    | DepartmentsEmployeeEmbed[]
    | null;
};

export type CreateDepartmentsInput = Partial<
  Omit<DepartmentsRow, "id">
> & {
  id?: number;
};

export type UpdateDepartmentsInput = Partial<Omit<DepartmentsRow, "id">>;

export type DepartmentsListFilters = {
  employee_id?: number | string;
};

const tableName = "departments" as const;

const selectDepartmentsEmbed = `
  id,
  department_name,
  havesections,
  employee_id,
  all_employees!departments_employee_id_fkey ( id, fingerprint_id, employee_name )
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

async function nextDepartmentsId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف للإدارة");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(
  filters?: DepartmentsListFilters,
): Promise<DepartmentsWithRelations[]> {
  let query = supabase
    .from(tableName)
    .select(selectDepartmentsEmbed)
    .order("id", { ascending: true });

  if (filters?.employee_id != null) {
    query = query.eq(
      "employee_id",
      parseNumericId(filters.employee_id, "الموظف"),
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات الإدارات");
  }
  return (data as unknown as DepartmentsWithRelations[] | null) ?? [];
}

export async function getById(
  id: number | string,
): Promise<DepartmentsWithRelations> {
  const rowId = parseNumericId(id, "رقم الإدارة");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectDepartmentsEmbed)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات الإدارة");
  }
  return data as unknown as DepartmentsWithRelations;
}

export async function createDepartments(
  input: CreateDepartmentsInput,
): Promise<DepartmentsWithRelations> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextDepartmentsId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectDepartmentsEmbed)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل الإدارة");
  }
  return data as unknown as DepartmentsWithRelations;
}

export async function updateDepartments(
  id: number | string,
  patch: UpdateDepartmentsInput,
): Promise<DepartmentsWithRelations> {
  const rowId = parseNumericId(id, "رقم الإدارة");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectDepartmentsEmbed)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل بيانات الإدارة");
  }
  return data as unknown as DepartmentsWithRelations;
}

export async function deleteDepartments(id: number | string): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم الإدارة");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف الإدارة");
  }
  return data;
}
