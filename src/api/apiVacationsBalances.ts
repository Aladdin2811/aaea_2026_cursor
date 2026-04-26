import { supabase } from "../lib/supabase";

export type VacationsBalancesYearEmbed = {
  id: number;
  year_num: string | null;
  status: boolean | null;
};

export type VacationsBalancesEmployeeEmbed = {
  id: number;
  fingerprint_id: number;
  employee_name: string | null;
  job_nature_id: number | null;
  job_category_id: number | null;
  job_grade_id: number | null;
};

export type VacationsBalancesRow = {
  id: number;
  employee_id: number | null;
  year_id: number | null;
  vacations_balance: string | number | null;
  notes: string | null;
  regular: string | number | null;
  adventitious: string | number | null;
  sick: string | number | null;
};

export type VacationsBalancesWithRelations = VacationsBalancesRow & {
  years: VacationsBalancesYearEmbed | VacationsBalancesYearEmbed[] | null;
  all_employees:
    | VacationsBalancesEmployeeEmbed
    | VacationsBalancesEmployeeEmbed[]
    | null;
};

export type CreateVacationsBalancesInput = Partial<
  Omit<VacationsBalancesRow, "id">
> & {
  id?: number;
};

export type UpdateVacationsBalancesInput = Partial<
  Omit<VacationsBalancesRow, "id">
>;

export type VacationsBalancesListFilters = {
  year_id?: number | string;
  employee_id?: number | string;
};

const tableName = "vacations_balances" as const;

const selectVacationsBalancesEmbed = `
  id,
  employee_id,
  year_id,
  vacations_balance,
  notes,
  regular,
  adventitious,
  sick,
  years ( id, year_num, status ),
  all_employees ( id, fingerprint_id, employee_name, job_nature_id, job_category_id, job_grade_id )
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

async function nextVacationsBalancesId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف لأرصدة الإجازات");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(
  filters?: VacationsBalancesListFilters,
): Promise<VacationsBalancesWithRelations[]> {
  let query = supabase
    .from(tableName)
    .select(selectVacationsBalancesEmbed)
    .order("year_id", { ascending: true, nullsFirst: false })
    .order("employee_id", { ascending: true, nullsFirst: false })
    .order("id", { ascending: true });

  if (filters?.year_id != null) {
    query = query.eq("year_id", parseNumericId(filters.year_id, "السنة"));
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
    throw new Error("لا يمكن الحصول على بيانات أرصدة الإجازات");
  }
  return (data as unknown as VacationsBalancesWithRelations[] | null) ?? [];
}

export async function getById(
  id: number | string,
): Promise<VacationsBalancesWithRelations> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectVacationsBalancesEmbed)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات رصيد الإجازات");
  }
  return data as unknown as VacationsBalancesWithRelations;
}

export async function createVacationsBalances(
  input: CreateVacationsBalancesInput,
): Promise<VacationsBalancesWithRelations> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextVacationsBalancesId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectVacationsBalancesEmbed)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل رصيد الإجازات");
  }
  return data as unknown as VacationsBalancesWithRelations;
}

export async function updateVacationsBalances(
  id: number | string,
  patch: UpdateVacationsBalancesInput,
): Promise<VacationsBalancesWithRelations> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectVacationsBalancesEmbed)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل رصيد الإجازات");
  }
  return data as unknown as VacationsBalancesWithRelations;
}

export async function deleteVacationsBalances(
  id: number | string,
): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف رصيد الإجازات");
  }
  return data;
}
