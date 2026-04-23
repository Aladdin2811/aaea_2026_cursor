import { supabase } from "../lib/supabase";
import type { JobCategoryEmbedded } from "./apiJobCategory";
import type { JobGradeEmbedded } from "./apiJobGrade";
import type { JobNatureEmbedded } from "./apiJobNature";

export type EmployeesBasicSalariesRow = {
  id: number;
  job_nature_id: number | null;
  job_category_id: number | null;
  job_grade_id: number | null;
  basic_first_bound: number | null;
  basic_last_bound: number | null;
  living_cost: number | null;
  representation: number | null;
  housing: number | null;
  living: number | null;
  total_first_bound: number | null;
  total_last_bound: number | null;
  bonus_amount: number | null;
  bonus_count: number | null;
  status: boolean | null;
  job_nature: JobNatureEmbedded | null;
  job_category: JobCategoryEmbedded | null;
  job_grade: JobGradeEmbedded | null;
};

const selectEmployeesBasicSalaries = `
  id,
  job_nature_id,
  job_category_id,
  job_grade_id,
  basic_first_bound,
  basic_last_bound,
  living_cost,
  representation,
  housing,
  living,
  total_first_bound,
  total_last_bound,
  bonus_amount,
  bonus_count,
  status,
  job_nature (
    id,
    job_nature_name
  ),
  job_category (
    id,
    job_category_name
  ),
  job_grade (
    id,
    job_grade_name
  )
`;

export async function getAll(): Promise<EmployeesBasicSalariesRow[]> {
  const { data, error } = await supabase
    .from("employees_basic_salaries")
    .select(selectEmployeesBasicSalaries)
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات الرواتب الأساسية للموظفين");
  }
  return (data as unknown as EmployeesBasicSalariesRow[] | null) ?? [];
}
