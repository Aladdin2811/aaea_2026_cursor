import { supabase } from "../lib/supabase";
import type { JobNatureEmbedded } from "./apiJobNature";

export type JobCategoryRow = {
  id: number;
  job_category_name: string | null;
  job_nature_id: number | null;
  description: string | null;
  status: boolean | null;
  job_nature: JobNatureEmbedded | null;
};

export type JobCategoryEmbedded = Pick<
  JobCategoryRow,
  "id" | "job_category_name"
>;

const selectJobCategory = `
  id,
  job_category_name,
  job_nature_id,
  description,
  status,
  job_nature (
    id,
    job_nature_name
  )
`;

export async function getAll(): Promise<JobCategoryRow[]> {
  const { data, error } = await supabase
    .from("job_category")
    .select(selectJobCategory)
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات الفئات الوظيفية");
  }
  return (data as unknown as JobCategoryRow[] | null) ?? [];
}
