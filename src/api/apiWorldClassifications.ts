import { supabase } from "../lib/supabase";

export type WorldClassificationRow = {
  id: number;
  world_classification_name: string | null;
  status: boolean | null;
};

const selectWorldClassifications =
  "id, world_classification_name, status";

export async function getAll(): Promise<WorldClassificationRow[]> {
  const { data, error } = await supabase
    .from("world_classifications")
    .select(selectWorldClassifications)
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على تصنيف دول العالم");
  }
  return (data as unknown as WorldClassificationRow[] | null) ?? [];
}
