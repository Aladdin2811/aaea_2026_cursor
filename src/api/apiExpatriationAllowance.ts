import { supabase } from "../lib/supabase";

export type ExpatriationAllowanceRow = {
  id: number;
  expatriation_allowance_percentage: number | null;
};

const selectExpatriationAllowance = "id, expatriation_allowance_percentage";

export async function getAll(): Promise<ExpatriationAllowanceRow[]> {
  const { data, error } = await supabase
    .from("expatriation_allowance")
    .select(selectExpatriationAllowance)
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات بدل الاغتراب");
  }
  return (data as unknown as ExpatriationAllowanceRow[] | null) ?? [];
}
