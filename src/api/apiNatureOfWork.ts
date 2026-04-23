import { supabase } from "../lib/supabase";

export type NatureOfWorkRow = {
  id: number;
  nature_of_work_name: string | null;
  nature_of_work_amount: number | null;
};

const selectNatureOfWork = "id, nature_of_work_name, nature_of_work_amount";

export async function getAll(): Promise<NatureOfWorkRow[]> {
  const { data, error } = await supabase
    .from("nature_of_work")
    .select(selectNatureOfWork)
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات بدل طبيعة العمل");
  }
  return (data as unknown as NatureOfWorkRow[] | null) ?? [];
}
