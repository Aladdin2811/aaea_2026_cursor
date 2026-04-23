import { supabase } from "../lib/supabase";
import type { JobCategoryEmbedded } from "./apiJobCategory";
import type { JobNatureEmbedded } from "./apiJobNature";

export type ContractorsBasicSalariesRow = {
  id: number;
  job_nature_id: number | null;
  job_category_id: number | null;
  basic_first_bound: number | null;
  basic_last_bound: number | null;
  living: number | null;
  bonus_amount: number | null;
  notes: string | null;
  status: boolean | null;
  job_nature: JobNatureEmbedded | null;
  job_category: JobCategoryEmbedded | null;
};

const selectContractorsBasicSalaries = `
  id,
  job_nature_id,
  job_category_id,
  basic_first_bound,
  basic_last_bound,
  living,
  bonus_amount,
  notes,
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

export async function getAll(): Promise<ContractorsBasicSalariesRow[]> {
  const { data, error } = await supabase
    .from("contractors_basic_salaries")
    .select(selectContractorsBasicSalaries)
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات الرواتب الأساسية للمتعاقدين");
  }
  return (data as unknown as ContractorsBasicSalariesRow[] | null) ?? [];
}
