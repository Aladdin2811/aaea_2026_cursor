import { supabase } from "../lib/supabase";

export type CurrencyRow = {
  id: number;
  currency_name: string | null;
  status: boolean | null;
};

const selectCurrency = "id, currency_name, status";

export async function getAll(): Promise<CurrencyRow[]> {
  const { data, error } = await supabase
    .from("currency")
    .select(selectCurrency)
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات العملات المتعامل بها");
  }
  return (data as unknown as CurrencyRow[] | null) ?? [];
}
