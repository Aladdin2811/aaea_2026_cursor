import { supabase } from "../lib/supabase";

export type ExchangeDocumentTypeRow = {
  id: number;
  exchange_document_name: string | null;
};

const selectExchangeDocumentType = "id, exchange_document_name";

export async function getAll(): Promise<ExchangeDocumentTypeRow[]> {
  const { data, error } = await supabase
    .from("exchange_document_type")
    .select(selectExchangeDocumentType)
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على أنواع مستند الصرف");
  }
  return (data as unknown as ExchangeDocumentTypeRow[] | null) ?? [];
}
