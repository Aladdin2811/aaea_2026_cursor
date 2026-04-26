import { supabase } from "../lib/supabase";

export type ExchangeDocumentTypeRow = {
  id: number;
  exchange_document_name: string | null;
};

export type CreateExchangeDocumentTypeInput = Partial<
  Omit<ExchangeDocumentTypeRow, "id">
> & {
  id?: number;
};

export type UpdateExchangeDocumentTypeInput = Partial<
  Omit<ExchangeDocumentTypeRow, "id">
>;

const tableName = "exchange_document_type" as const;

const selectExchangeDocumentType = "id, exchange_document_name";

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

async function nextExchangeDocumentTypeId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف لنوع مستند الصرف");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(): Promise<ExchangeDocumentTypeRow[]> {
  const { data, error } = await supabase
    .from(tableName)
    .select(selectExchangeDocumentType)
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على أنواع مستند الصرف");
  }
  return (data as unknown as ExchangeDocumentTypeRow[] | null) ?? [];
}

export async function getById(
  id: number | string,
): Promise<ExchangeDocumentTypeRow> {
  const rowId = parseNumericId(id, "رقم نوع مستند الصرف");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectExchangeDocumentType)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات نوع مستند الصرف");
  }
  return data as unknown as ExchangeDocumentTypeRow;
}

export async function createExchangeDocumentType(
  input: CreateExchangeDocumentTypeInput,
): Promise<ExchangeDocumentTypeRow> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextExchangeDocumentTypeId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectExchangeDocumentType)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل نوع مستند الصرف");
  }
  return data as unknown as ExchangeDocumentTypeRow;
}

export async function updateExchangeDocumentType(
  id: number | string,
  patch: UpdateExchangeDocumentTypeInput,
): Promise<ExchangeDocumentTypeRow> {
  const rowId = parseNumericId(id, "رقم نوع مستند الصرف");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectExchangeDocumentType)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل نوع مستند الصرف");
  }
  return data as unknown as ExchangeDocumentTypeRow;
}

export async function deleteExchangeDocumentType(
  id: number | string,
): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم نوع مستند الصرف");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف نوع مستند الصرف");
  }
  return data;
}
