import { supabase } from "../lib/supabase";

export type GenderRow = {
  id: number;
  gender_name: string | null;
};

const selectGender = "id, gender_name";

export async function getAll(): Promise<GenderRow[]> {
  const { data, error } = await supabase
    .from("gender")
    .select(selectGender)
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات نوع الجنس");
  }
  return (data as unknown as GenderRow[] | null) ?? [];
}
