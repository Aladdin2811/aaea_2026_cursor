import { supabase } from "../lib/supabase";

export type EmployeeOtherAdjustmentsEmployeeEmbed = {
  id: number;
  fingerprint_id: number;
  employee_name: string | null;
};

export type EmployeeOtherAdjustmentsRow = {
  id: number;
  employee_id: number | null;
  other_adjustments_amount: string | number | null;
  other_adjustments_date: string | null;
};

export type EmployeeOtherAdjustmentsWithRelations =
  EmployeeOtherAdjustmentsRow & {
    all_employees:
      | EmployeeOtherAdjustmentsEmployeeEmbed
      | EmployeeOtherAdjustmentsEmployeeEmbed[]
      | null;
  };

export type CreateEmployeeOtherAdjustmentsInput = Partial<
  Omit<EmployeeOtherAdjustmentsRow, "id">
> & {
  id?: number;
};

export type UpdateEmployeeOtherAdjustmentsInput = Partial<
  Omit<EmployeeOtherAdjustmentsRow, "id">
>;

export type EmployeeOtherAdjustmentsListFilters = {
  employee_id?: number | string;
};

const tableName = "employee_other_adjustments" as const;

const selectEmployeeOtherAdjustmentsEmbed = `
  id,
  employee_id,
  other_adjustments_amount,
  other_adjustments_date,
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

async function nextEmployeeOtherAdjustmentsId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف لتعديلات الموظف الأخرى");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(
  filters?: EmployeeOtherAdjustmentsListFilters,
): Promise<EmployeeOtherAdjustmentsWithRelations[]> {
  let query = supabase
    .from(tableName)
    .select(selectEmployeeOtherAdjustmentsEmbed)
    .order("employee_id", { ascending: true, nullsFirst: false })
    .order("other_adjustments_date", { ascending: false, nullsFirst: false })
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
    throw new Error("لا يمكن الحصول على بيانات التعديلات الأخرى للموظف");
  }
  return (
    (data as unknown as EmployeeOtherAdjustmentsWithRelations[] | null) ?? []
  );
}

export async function getById(
  id: number | string,
): Promise<EmployeeOtherAdjustmentsWithRelations> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectEmployeeOtherAdjustmentsEmbed)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات التعديل الآخر");
  }
  return data as unknown as EmployeeOtherAdjustmentsWithRelations;
}

export async function createEmployeeOtherAdjustments(
  input: CreateEmployeeOtherAdjustmentsInput,
): Promise<EmployeeOtherAdjustmentsWithRelations> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextEmployeeOtherAdjustmentsId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectEmployeeOtherAdjustmentsEmbed)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل التعديل الآخر");
  }
  return data as unknown as EmployeeOtherAdjustmentsWithRelations;
}

export async function updateEmployeeOtherAdjustments(
  id: number | string,
  patch: UpdateEmployeeOtherAdjustmentsInput,
): Promise<EmployeeOtherAdjustmentsWithRelations> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectEmployeeOtherAdjustmentsEmbed)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تحديث التعديل الآخر");
  }
  return data as unknown as EmployeeOtherAdjustmentsWithRelations;
}

export async function deleteEmployeeOtherAdjustments(
  id: number | string,
): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف التعديل الآخر");
  }
  return data;
}
