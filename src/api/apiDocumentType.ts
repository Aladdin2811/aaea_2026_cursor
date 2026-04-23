import { supabase } from "../lib/supabase";

export type DocumentTypeRow = {
  id: number;
  document_type_name: string | null;
  voucher_need: boolean | null;
};

const selectDocumentType = "id, document_type_name, voucher_need";

export async function getAll(): Promise<DocumentTypeRow[]> {
  const { data, error } = await supabase
    .from("document_type")
    .select(selectDocumentType)
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على أنواع القيود");
  }
  return (data as unknown as DocumentTypeRow[] | null) ?? [];
}
