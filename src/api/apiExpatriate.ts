import { supabase } from "../lib/supabase";

export type ExpatriateRow = {
  id: number;
  expatriate_name: string | null;
};

const selectExpatriate = "id, expatriate_name";

export async function getAll(): Promise<ExpatriateRow[]> {
  const { data, error } = await supabase
    .from("expatriate")
    .select(selectExpatriate)
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات الاغتراب");
  }
  return (data as unknown as ExpatriateRow[] | null) ?? [];
}
