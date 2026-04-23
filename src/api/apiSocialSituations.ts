import { supabase } from "../lib/supabase";

export type SocialSituationsRow = {
  id: number;
  social_situation_name: string | null;
  status: boolean | null;
};

const selectSocialSituations = "id, social_situation_name, status";

export async function getAll(): Promise<SocialSituationsRow[]> {
  const { data, error } = await supabase
    .from("social_situations")
    .select(selectSocialSituations)
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات الأحوال الاجتماعية");
  }
  return (data as unknown as SocialSituationsRow[] | null) ?? [];
}
