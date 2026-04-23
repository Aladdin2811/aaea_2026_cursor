import { supabase } from "../lib/supabase";

export type JobTitleRow = {
  id: number;
  job_title_name: string | null;
  status: boolean | null;
};

const selectJobTitle = "id, job_title_name, status";

export async function getAll(): Promise<JobTitleRow[]> {
  const { data, error } = await supabase
    .from("job_title")
    .select(selectJobTitle)
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات المسميات الوظيفية");
  }
  return (data as unknown as JobTitleRow[] | null) ?? [];
}
