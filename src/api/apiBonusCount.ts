import { supabase } from "../lib/supabase";
import type {
  AllEmployeesJobCategoryEmbed,
  AllEmployeesJobGradeEmbed,
  AllEmployeesJobNatureEmbed,
} from "./apiAllEmployees";

export type BonusCountYearEmbed = {
  id: number;
  year_num: string | null;
  status: boolean | null;
};

export type BonusCountEmployeeEmbed = {
  id: number;
  fingerprint_id: number;
  employee_name: string | null;
};

export type BonusCountRow = {
  id: number;
  year_id: number | null;
  employee_id: number | null;
  job_nature_id: number | null;
  job_category_id: number | null;
  job_grade_id: number | null;
  /** عمود `bonus_count` في الجدول (عدد المكافآت) */
  bonus_count: number | null;
  notes: string | null;
  end_of_service_date: string | null;
};

export type BonusCountWithRelations = BonusCountRow & {
  years: BonusCountYearEmbed | BonusCountYearEmbed[] | null;
  all_employees:
    | BonusCountEmployeeEmbed
    | BonusCountEmployeeEmbed[]
    | null;
  job_nature:
    | AllEmployeesJobNatureEmbed
    | AllEmployeesJobNatureEmbed[]
    | null;
  job_category:
    | AllEmployeesJobCategoryEmbed
    | AllEmployeesJobCategoryEmbed[]
    | null;
  job_grade:
    | AllEmployeesJobGradeEmbed
    | AllEmployeesJobGradeEmbed[]
    | null;
};

export type CreateBonusCountInput = Partial<Omit<BonusCountRow, "id">>;

export type UpdateBonusCountInput = Partial<Omit<BonusCountRow, "id">>;

export type BonusCountListFilters = {
  year_id?: number | string;
  employee_id?: number | string;
};

const tableName = "bonus_count" as const;

const selectBonusCountEmbed = `
  id,
  year_id,
  employee_id,
  job_nature_id,
  job_category_id,
  job_grade_id,
  bonus_count,
  notes,
  end_of_service_date,
  years ( id, year_num, status ),
  all_employees ( id, fingerprint_id, employee_name ),
  job_nature ( id, job_nature_name ),
  job_category ( id, job_category_name ),
  job_grade ( id, job_grade_name )
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

export async function getAll(
  filters?: BonusCountListFilters,
): Promise<BonusCountWithRelations[]> {
  let query = supabase
    .from(tableName)
    .select(selectBonusCountEmbed)
    .order("year_id", { ascending: false, nullsFirst: false })
    .order("id", { ascending: false });

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
    throw new Error("لا يمكن الحصول على بيانات أعداد المكافآت");
  }
  return (data as unknown as BonusCountWithRelations[] | null) ?? [];
}

export async function getById(
  id: number | string,
): Promise<BonusCountWithRelations> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectBonusCountEmbed)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات السجل");
  }
  return data as unknown as BonusCountWithRelations;
}

export async function createBonusCount(
  input: CreateBonusCountInput,
): Promise<BonusCountWithRelations> {
  const { data, error } = await supabase
    .from(tableName)
    .insert({ ...input })
    .select(selectBonusCountEmbed)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل عدد المكافأة");
  }
  return data as unknown as BonusCountWithRelations;
}

export async function updateBonusCount(
  id: number | string,
  patch: UpdateBonusCountInput,
): Promise<BonusCountWithRelations> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectBonusCountEmbed)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل السجل");
  }
  return data as unknown as BonusCountWithRelations;
}

export async function deleteBonusCount(id: number | string): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف السجل");
  }
  return data;
}
