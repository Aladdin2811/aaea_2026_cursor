import { supabase } from "../lib/supabase";
import type { JobCategoryEmbedded } from "./apiJobCategory";
import type { JobNatureEmbedded } from "./apiJobNature";

export type JobGradeRow = {
  id: number;
  job_grade_name: string | null;
  job_nature_id: number | null;
  job_category_id: number | null;
  status: boolean | null;
  job_nature: JobNatureEmbedded | null;
  job_category: JobCategoryEmbedded | null;
};

/** شكل العلاقة المضمّنة في استعلامات أخرى (`job_grade (...)`) */
export type JobGradeEmbedded = Pick<JobGradeRow, "id" | "job_grade_name">;

const selectJobGrade = `
  id,
  job_grade_name,
  job_nature_id,
  job_category_id,
  status,
  job_nature (
    id,
    job_nature_name
  ),
  job_category (
    id,
    job_category_name
  )
`;

export async function getAll(): Promise<JobGradeRow[]> {
  const { data, error } = await supabase
    .from("job_grade")
    .select(selectJobGrade)
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات الدرجات الوظيفية");
  }
  return (data as unknown as JobGradeRow[] | null) ?? [];
}
