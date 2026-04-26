import { supabase } from "../lib/supabase";

export type DepartmentsSectionsDepartmentEmbed = {
  id: number;
  department_name: string | null;
};

export type DepartmentsSectionsEmployeeEmbed = {
  id: number;
  fingerprint_id: number;
  employee_name: string | null;
};

export type DepartmentsSectionsRow = {
  id: number;
  section_name: string | null;
  department_id: number | null;
  employee_id: number | null;
};

export type DepartmentsSectionsWithRelations = DepartmentsSectionsRow & {
  departments:
    | DepartmentsSectionsDepartmentEmbed
    | DepartmentsSectionsDepartmentEmbed[]
    | null;
  all_employees:
    | DepartmentsSectionsEmployeeEmbed
    | DepartmentsSectionsEmployeeEmbed[]
    | null;
};

export type CreateDepartmentsSectionsInput = Partial<
  Omit<DepartmentsSectionsRow, "id">
> & {
  id?: number;
};

export type UpdateDepartmentsSectionsInput = Partial<
  Omit<DepartmentsSectionsRow, "id">
>;

export type DepartmentsSectionsListFilters = {
  department_id?: number | string;
  employee_id?: number | string;
};

const tableName = "departments_sections" as const;

const selectDepartmentsSectionsEmbed = `
  id,
  section_name,
  department_id,
  employee_id,
  departments ( id, department_name ),
  all_employees!departments_sections_employee_id_fkey ( id, fingerprint_id, employee_name )
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

async function nextDepartmentsSectionsId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف للقسم");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(
  filters?: DepartmentsSectionsListFilters,
): Promise<DepartmentsSectionsWithRelations[]> {
  let query = supabase
    .from(tableName)
    .select(selectDepartmentsSectionsEmbed)
    .order("department_id", { ascending: true, nullsFirst: false })
    .order("id", { ascending: true });

  if (filters?.department_id != null) {
    query = query.eq(
      "department_id",
      parseNumericId(filters.department_id, "الإدارة"),
    );
  }
  if (filters?.employee_id != null) {
    query = query.eq(
      "employee_id",
      parseNumericId(filters.employee_id, "الموظف"),
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات أقسام الإدارات");
  }
  return (data as unknown as DepartmentsSectionsWithRelations[] | null) ?? [];
}

export async function getById(
  id: number | string,
): Promise<DepartmentsSectionsWithRelations> {
  const rowId = parseNumericId(id, "رقم القسم");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectDepartmentsSectionsEmbed)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات القسم");
  }
  return data as unknown as DepartmentsSectionsWithRelations;
}

export async function createDepartmentsSections(
  input: CreateDepartmentsSectionsInput,
): Promise<DepartmentsSectionsWithRelations> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextDepartmentsSectionsId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectDepartmentsSectionsEmbed)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل القسم");
  }
  return data as unknown as DepartmentsSectionsWithRelations;
}

export async function updateDepartmentsSections(
  id: number | string,
  patch: UpdateDepartmentsSectionsInput,
): Promise<DepartmentsSectionsWithRelations> {
  const rowId = parseNumericId(id, "رقم القسم");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectDepartmentsSectionsEmbed)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل بيانات القسم");
  }
  return data as unknown as DepartmentsSectionsWithRelations;
}

export async function deleteDepartmentsSections(
  id: number | string,
): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم القسم");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف القسم");
  }
  return data;
}
