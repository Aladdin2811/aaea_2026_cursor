import { supabase } from "../lib/supabase";

export type FundingTypeRow = {
  id: number;
  funding_type_name: string | null;
};

const selectFundingType = "id, funding_type_name";

export async function getAll(): Promise<FundingTypeRow[]> {
  const { data, error } = await supabase
    .from("funding_type")
    .select(selectFundingType)
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات مصادر التمويل");
  }
  return (data as unknown as FundingTypeRow[] | null) ?? [];
}
