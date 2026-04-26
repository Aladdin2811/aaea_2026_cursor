import { supabase } from "../lib/supabase";

export type DocumentTypeRow = {
  id: number;
  document_type_name: string | null;
  voucher_need: boolean | null;
};

export type CreateDocumentTypeInput = Partial<
  Omit<DocumentTypeRow, "id">
> & {
  id?: number;
};

export type UpdateDocumentTypeInput = Partial<Omit<DocumentTypeRow, "id">>;

export type DocumentTypeListFilters = {
  voucher_need?: boolean;
};

const tableName = "document_type" as const;

const selectDocumentType = "id, document_type_name, voucher_need";

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

async function nextDocumentTypeId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف لنوع القيد");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(
  filters?: DocumentTypeListFilters,
): Promise<DocumentTypeRow[]> {
  let query = supabase
    .from(tableName)
    .select(selectDocumentType)
    .order("id", { ascending: true });

  if (filters?.voucher_need !== undefined) {
    query = query.eq("voucher_need", filters.voucher_need);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على أنواع القيود");
  }
  return (data as unknown as DocumentTypeRow[] | null) ?? [];
}

export async function getById(id: number | string): Promise<DocumentTypeRow> {
  const rowId = parseNumericId(id, "رقم نوع القيد");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectDocumentType)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات نوع القيد");
  }
  return data as unknown as DocumentTypeRow;
}

export async function createDocumentType(
  input: CreateDocumentTypeInput,
): Promise<DocumentTypeRow> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextDocumentTypeId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectDocumentType)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل نوع القيد");
  }
  return data as unknown as DocumentTypeRow;
}

export async function updateDocumentType(
  id: number | string,
  patch: UpdateDocumentTypeInput,
): Promise<DocumentTypeRow> {
  const rowId = parseNumericId(id, "رقم نوع القيد");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectDocumentType)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل نوع القيد");
  }
  return data as unknown as DocumentTypeRow;
}

export async function deleteDocumentType(id: number | string): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم نوع القيد");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف نوع القيد");
  }
  return data;
}
