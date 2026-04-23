import { supabase } from "../lib/supabase";
import type { JobCategoryEmbedded } from "./apiJobCategory";
import type { JobGradeEmbedded } from "./apiJobGrade";
import type { JobNatureEmbedded } from "./apiJobNature";

export type ExpertsBasicSalariesRow = {
  id: number;
  job_nature_id: number | null;
  job_category_id: number | null;
  job_grade_id: number | null;
  maximum: number | null;
  notes: string | null;
  status: boolean | null;
  job_nature: JobNatureEmbedded | null;
  job_category: JobCategoryEmbedded | null;
  job_grade: JobGradeEmbedded | null;
};

const selectExpertsBasicSalaries = `
  id,
  job_nature_id,
  job_category_id,
  job_grade_id,
  maximum,
  notes,
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

export async function getAll(): Promise<ExpertsBasicSalariesRow[]> {
  const { data, error } = await supabase
    .from("experts_basic_salaries")
    .select(selectExpertsBasicSalaries)
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات المكافآت الأساسية للخبراء");
  }
  return (data as unknown as ExpertsBasicSalariesRow[] | null) ?? [];
}
