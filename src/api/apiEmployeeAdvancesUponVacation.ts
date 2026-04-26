import { supabase } from "../lib/supabase";

export type EmployeeAdvancesUponVacationEmployeeEmbed = {
  id: number;
  fingerprint_id: number;
  employee_name: string | null;
};

export type EmployeeAdvancesUponVacationRow = {
  id: number;
  employee_id: number | null;
  advance_payment_amount: string | number | null;
  advance_payment_date: string | null;
};

export type EmployeeAdvancesUponVacationWithRelations =
  EmployeeAdvancesUponVacationRow & {
    all_employees:
      | EmployeeAdvancesUponVacationEmployeeEmbed
      | EmployeeAdvancesUponVacationEmployeeEmbed[]
      | null;
  };

export type CreateEmployeeAdvancesUponVacationInput = Partial<
  Omit<EmployeeAdvancesUponVacationRow, "id">
> & {
  id?: number;
};

export type UpdateEmployeeAdvancesUponVacationInput = Partial<
  Omit<EmployeeAdvancesUponVacationRow, "id">
>;

export type EmployeeAdvancesUponVacationListFilters = {
  employee_id?: number | string;
};

const tableName = "employee_advances_upon_vacation" as const;

const selectEmployeeAdvancesUponVacationEmbed = `
  id,
  employee_id,
  advance_payment_amount,
  advance_payment_date,
  all_employees ( id, fingerprint_id, employee_name )
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

async function nextEmployeeAdvancesUponVacationId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف لسلف الإجازة");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(
  filters?: EmployeeAdvancesUponVacationListFilters,
): Promise<EmployeeAdvancesUponVacationWithRelations[]> {
  let query = supabase
    .from(tableName)
    .select(selectEmployeeAdvancesUponVacationEmbed)
    .order("employee_id", { ascending: true, nullsFirst: false })
    .order("advance_payment_date", { ascending: false, nullsFirst: false })
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
    throw new Error("لا يمكن الحصول على بيانات سلف الإجازة");
  }
  return (
    (data as unknown as EmployeeAdvancesUponVacationWithRelations[] | null) ??
    []
  );
}

export async function getById(
  id: number | string,
): Promise<EmployeeAdvancesUponVacationWithRelations> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectEmployeeAdvancesUponVacationEmbed)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات سلفة الإجازة");
  }
  return data as unknown as EmployeeAdvancesUponVacationWithRelations;
}

export async function createEmployeeAdvancesUponVacation(
  input: CreateEmployeeAdvancesUponVacationInput,
): Promise<EmployeeAdvancesUponVacationWithRelations> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextEmployeeAdvancesUponVacationId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectEmployeeAdvancesUponVacationEmbed)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل سلفة الإجازة");
  }
  return data as unknown as EmployeeAdvancesUponVacationWithRelations;
}

export async function updateEmployeeAdvancesUponVacation(
  id: number | string,
  patch: UpdateEmployeeAdvancesUponVacationInput,
): Promise<EmployeeAdvancesUponVacationWithRelations> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectEmployeeAdvancesUponVacationEmbed)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل سلفة الإجازة");
  }
  return data as unknown as EmployeeAdvancesUponVacationWithRelations;
}

export async function deleteEmployeeAdvancesUponVacation(
  id: number | string,
): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف سلفة الإجازة");
  }
  return data;
}
