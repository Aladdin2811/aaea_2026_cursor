import { supabase } from "../lib/supabase";

export type EmployeeAdvancesUponAppointmentEmployeeEmbed = {
  id: number;
  fingerprint_id: number;
  employee_name: string | null;
};

export type EmployeeAdvancesUponAppointmentRow = {
  id: number;
  employee_id: number | null;
  advance_payment_amount: string | number | null;
  advance_payment_date: string | null;
};

export type EmployeeAdvancesUponAppointmentWithRelations =
  EmployeeAdvancesUponAppointmentRow & {
    all_employees:
      | EmployeeAdvancesUponAppointmentEmployeeEmbed
      | EmployeeAdvancesUponAppointmentEmployeeEmbed[]
      | null;
  };

export type CreateEmployeeAdvancesUponAppointmentInput = Partial<
  Omit<EmployeeAdvancesUponAppointmentRow, "id">
> & {
  id?: number;
};

export type UpdateEmployeeAdvancesUponAppointmentInput = Partial<
  Omit<EmployeeAdvancesUponAppointmentRow, "id">
>;

export type EmployeeAdvancesUponAppointmentListFilters = {
  employee_id?: number | string;
};

const tableName = "employee_advances_upon_appointment" as const;

const selectEmployeeAdvancesUponAppointmentEmbed = `
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

async function nextEmployeeAdvancesUponAppointmentId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف لسلف التعيين");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(
  filters?: EmployeeAdvancesUponAppointmentListFilters,
): Promise<EmployeeAdvancesUponAppointmentWithRelations[]> {
  let query = supabase
    .from(tableName)
    .select(selectEmployeeAdvancesUponAppointmentEmbed)
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
    throw new Error("لا يمكن الحصول على بيانات سلف التعيين");
  }
  return (
    (data as unknown as EmployeeAdvancesUponAppointmentWithRelations[] | null) ??
    []
  );
}

export async function getById(
  id: number | string,
): Promise<EmployeeAdvancesUponAppointmentWithRelations> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectEmployeeAdvancesUponAppointmentEmbed)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات سلفة التعيين");
  }
  return data as unknown as EmployeeAdvancesUponAppointmentWithRelations;
}

export async function createEmployeeAdvancesUponAppointment(
  input: CreateEmployeeAdvancesUponAppointmentInput,
): Promise<EmployeeAdvancesUponAppointmentWithRelations> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextEmployeeAdvancesUponAppointmentId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectEmployeeAdvancesUponAppointmentEmbed)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل سلفة التعيين");
  }
  return data as unknown as EmployeeAdvancesUponAppointmentWithRelations;
}

export async function updateEmployeeAdvancesUponAppointment(
  id: number | string,
  patch: UpdateEmployeeAdvancesUponAppointmentInput,
): Promise<EmployeeAdvancesUponAppointmentWithRelations> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectEmployeeAdvancesUponAppointmentEmbed)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل سلفة التعيين");
  }
  return data as unknown as EmployeeAdvancesUponAppointmentWithRelations;
}

export async function deleteEmployeeAdvancesUponAppointment(
  id: number | string,
): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف سلفة التعيين");
  }
  return data;
}
