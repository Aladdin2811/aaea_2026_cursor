import { supabase } from "../lib/supabase";

export type WorldRegionRow = {
  id: number;
  world_region_name: string | null;
  status: boolean | null;
};

const selectWorldRegions = "id, world_region_name, status";

export async function getAll(): Promise<WorldRegionRow[]> {
  const { data, error } = await supabase
    .from("world_regions")
    .select(selectWorldRegions)
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات تصنيف المناطق لدول العالم");
  }
  return (data as unknown as WorldRegionRow[] | null) ?? [];
}
