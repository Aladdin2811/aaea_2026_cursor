import { supabase } from "../lib/supabase";

export type DeductionFromSalaryEmployeeEmbed = {
  id: number;
  fingerprint_id: number;
  employee_name: string | null;
};

export type DeductionFromSalaryMonthEmbed = {
  id: number;
  /** يطابق عمود `months.month_num` (نص في القاعدة) */
  month_num: string | null;
  month_name1: string | null;
};

export type DeductionFromSalaryYearEmbed = {
  id: number;
  year_num: string | null;
  status: boolean | null;
};

export type DeductionFromSalaryRow = {
  id: number;
  employee_id: number | null;
  discount_hours: string | number | null;
  discount_days: string | number | null;
  month_id: number | null;
  year_id: number | null;
  notes: string | null;
};

export type DeductionFromSalaryWithRelations = DeductionFromSalaryRow & {
  all_employees:
    | DeductionFromSalaryEmployeeEmbed
    | DeductionFromSalaryEmployeeEmbed[]
    | null;
  months: DeductionFromSalaryMonthEmbed | DeductionFromSalaryMonthEmbed[] | null;
  years: DeductionFromSalaryYearEmbed | DeductionFromSalaryYearEmbed[] | null;
};

export type CreateDeductionFromSalaryInput = Partial<
  Omit<DeductionFromSalaryRow, "id">
> & {
  id?: number;
};

export type UpdateDeductionFromSalaryInput = Partial<
  Omit<DeductionFromSalaryRow, "id">
>;

export type DeductionFromSalaryListFilters = {
  year_id?: number | string;
  month_id?: number | string;
  employee_id?: number | string;
};

const tableName = "deduction_from_salary" as const;

const selectDeductionFromSalaryEmbed = `
  id,
  employee_id,
  discount_hours,
  discount_days,
  month_id,
  year_id,
  notes,
  all_employees!deduction_from_salary_employee_id_fkey ( id, fingerprint_id, employee_name ),
  months ( id, month_num, month_name1 ),
  years ( id, year_num, status )
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

async function nextDeductionFromSalaryId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف لخصم الراتب");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(
  filters?: DeductionFromSalaryListFilters,
): Promise<DeductionFromSalaryWithRelations[]> {
  let query = supabase
    .from(tableName)
    .select(selectDeductionFromSalaryEmbed)
    .order("year_id", { ascending: false, nullsFirst: false })
    .order("month_id", { ascending: true, nullsFirst: false })
    .order("id", { ascending: false });

  if (filters?.year_id != null) {
    query = query.eq("year_id", parseNumericId(filters.year_id, "السنة"));
  }
  if (filters?.month_id != null) {
    query = query.eq("month_id", parseNumericId(filters.month_id, "الشهر"));
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
    throw new Error("لا يمكن الحصول على بيانات الخصومات من الراتب");
  }
  return (data as unknown as DeductionFromSalaryWithRelations[] | null) ?? [];
}

export async function getById(
  id: number | string,
): Promise<DeductionFromSalaryWithRelations> {
  const rowId = parseNumericId(id, "رقم الخصم");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectDeductionFromSalaryEmbed)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات الخصم");
  }
  return data as unknown as DeductionFromSalaryWithRelations;
}

export async function createDeductionFromSalary(
  input: CreateDeductionFromSalaryInput,
): Promise<DeductionFromSalaryWithRelations> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextDeductionFromSalaryId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectDeductionFromSalaryEmbed)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل الخصم من الراتب");
  }
  return data as unknown as DeductionFromSalaryWithRelations;
}

export async function updateDeductionFromSalary(
  id: number | string,
  patch: UpdateDeductionFromSalaryInput,
): Promise<DeductionFromSalaryWithRelations> {
  const rowId = parseNumericId(id, "رقم الخصم");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectDeductionFromSalaryEmbed)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل الخصم من الراتب");
  }
  return data as unknown as DeductionFromSalaryWithRelations;
}

export async function deleteDeductionFromSalary(
  id: number | string,
): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم الخصم");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف الخصم من الراتب");
  }
  return data;
}
