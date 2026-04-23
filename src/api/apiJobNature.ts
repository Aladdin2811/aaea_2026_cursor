import { supabase } from "../lib/supabase";

export type JobNatureRow = {
  id: number;
  job_nature_name: string | null;
  description: string | null;
  status: boolean | null;
};

/** شكل العلاقة المضمّنة في استعلامات أخرى (`job_nature (...)`) */
export type JobNatureEmbedded = Pick<JobNatureRow, "id" | "job_nature_name">;

const selectJobNature = "id, job_nature_name, description, status";

export async function getAll(): Promise<JobNatureRow[]> {
  const { data, error } = await supabase
    .from("job_nature")
    .select(selectJobNature)
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات نوع طبيعة العمل");
  }
  return (data as unknown as JobNatureRow[] | null) ?? [];
}
