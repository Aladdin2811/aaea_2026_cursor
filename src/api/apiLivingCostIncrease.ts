import { supabase } from "../lib/supabase";

export type LivingCostIncreaseRow = {
  id: number;
  living_cost_increase_percentage: number | null;
};

const selectLivingCostIncrease = "id, living_cost_increase_percentage";

export async function getAll(): Promise<LivingCostIncreaseRow[]> {
  const { data, error } = await supabase
    .from("living_cost_increase")
    .select(selectLivingCostIncrease)
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(
      "لا يمكن الحصول على بيانات نسبة الزيادة في تعويض غلاء المعيشة",
    );
  }
  return (data as unknown as LivingCostIncreaseRow[] | null) ?? [];
}
