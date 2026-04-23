import { supabase } from "../lib/supabase";
import type { JobCategoryEmbedded } from "./apiJobCategory";
import type { JobGradeEmbedded } from "./apiJobGrade";
import type { JobNatureEmbedded } from "./apiJobNature";
import type { WorldRegionRow } from "./apiWorldRegions";

export type WorldRegionEmbedded = Pick<
  WorldRegionRow,
  "id" | "world_region_name"
>;

export type TravelAllowanceRow = {
  id: number;
  job_nature_id: number | null;
  job_category_id: number | null;
  job_grade_id: number | null;
  world_region_id: number | null;
  amount: number | null;
  status: boolean | null;
  job_nature: JobNatureEmbedded | null;
  job_category: JobCategoryEmbedded | null;
  job_grade: JobGradeEmbedded | null;
  world_regions: WorldRegionEmbedded | null;
};

const selectTravelAllowance = `
  id,
  job_nature_id,
  job_category_id,
  job_grade_id,
  world_region_id,
  amount,
  status,
  job_nature (
    id,
    job_nature_name
  ),
  job_category (
    id,
    job_category_name
  ),
  job_grade (
    id,
    job_grade_name
  ),
  world_regions (
    id,
    world_region_name
  )
`;

export async function getAll(): Promise<TravelAllowanceRow[]> {
  const { data, error } = await supabase
    .from("travel_allowance")
    .select(selectTravelAllowance)
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات تعويض بدل السفر");
  }
  return (data as unknown as TravelAllowanceRow[] | null) ?? [];
}
