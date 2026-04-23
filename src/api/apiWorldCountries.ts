import { supabase } from "../lib/supabase";

export type WorldRegionEmbed = {
  id: number;
  world_region_name: string | null;
};

export type WorldClassificationEmbed = {
  id: number;
  world_classification_name: string | null;
};

export type WorldCountryRow = {
  id: number;
  world_country_name: string | null;
  world_region_id: number | null;
  world_classification_id: number | null;
  status: boolean | null;
  sort: number | null;
};

export type WorldCountryWithRelations = WorldCountryRow & {
  world_regions: WorldRegionEmbed | WorldRegionEmbed[] | null;
  world_classifications:
    | WorldClassificationEmbed
    | WorldClassificationEmbed[]
    | null;
};

const selectWorldCountryEmbed = `
  id,
  world_country_name,
  world_region_id,
  world_classification_id,
  status,
  sort,
  world_regions ( id, world_region_name ),
  world_classifications ( id, world_classification_name )
`;

function parseNumericId(
  value: number | string,
  fieldLabel = "المعرّف",
): number {
  const n = typeof value === "string" ? Number(value) : value;
  if (typeof n !== "number" || !Number.isFinite(n)) {
    throw new Error(`${fieldLabel} غير صالح`);
  }
  return n;
}

export async function getAll(): Promise<WorldCountryWithRelations[]> {
  const { data, error } = await supabase
    .from("world_countries")
    .select(selectWorldCountryEmbed)
    .order("sort", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على أسماء دول العالم");
  }
  return (data as unknown as WorldCountryWithRelations[] | null) ?? [];
}

export async function getForSelect(
  worldClassificationId: number | string,
): Promise<WorldCountryWithRelations[]> {
  const id = parseNumericId(
    worldClassificationId,
    "تصنيف دول العالم",
  );

  const { data, error } = await supabase
    .from("world_countries")
    .select(selectWorldCountryEmbed)
    .eq("world_classification_id", id)
    .eq("status", true)
    .order("sort", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على أسماء دول العالم");
  }
  return (data as unknown as WorldCountryWithRelations[] | null) ?? [];
}
