import { supabase } from "../lib/supabase";
import type { JobCategoryEmbedded } from "./apiJobCategory";

export type SocialSituationEmbedded = {
  id: number;
  social_situation_name: string | null;
};

export type LuggageAndFurnituresRow = {
  id: number;
  job_category_id: number | null;
  social_situation_id: number | null;
  minimum: number | null;
  maximum: number | null;
  status: boolean | null;
  job_category: JobCategoryEmbedded | null;
  social_situations: SocialSituationEmbedded | null;
};

const selectLuggageAndFurnitures = `
  id,
  job_category_id,
  social_situation_id,
  minimum,
  maximum,
  status,
  job_category (
    id,
    job_category_name
  ),
  social_situations (
    id,
    social_situation_name
  )
`;

export async function getAll(): Promise<LuggageAndFurnituresRow[]> {
  const { data, error } = await supabase
    .from("luggage_and_furnitures")
    .select(selectLuggageAndFurnitures)
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات بدل نقل الأمتعة والأثاث");
  }
  return (data as unknown as LuggageAndFurnituresRow[] | null) ?? [];
}
