import { supabase } from "../lib/supabase";

export type MonthsRow = {
  id: number;
  month_name1: string | null;
  month_name2: string | null;
  month_name3: string | null;
  month_name4: string | null;
  month_name5: string | null;
  month_num: number | null;
  days_count: number | null;
};

const selectMonths = `
  id,
  month_name1,
  month_name2,
  month_name3,
  month_name4,
  month_name5,
  month_num,
  days_count
`;

export async function getAll(): Promise<MonthsRow[]> {
  const { data, error } = await supabase
    .from("months")
    .select(selectMonths)
    .order("month_num", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات الأشهر");
  }
  return (data as unknown as MonthsRow[] | null) ?? [];
}
