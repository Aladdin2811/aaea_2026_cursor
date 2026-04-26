import { supabase } from "../lib/supabase";

export type CurrencyRow = {
  id: number;
  currency_name: string | null;
  status: boolean | null;
};

export type CreateCurrencyInput = Partial<Omit<CurrencyRow, "id">> & {
  id?: number;
};

export type UpdateCurrencyInput = Partial<Omit<CurrencyRow, "id">>;

export type CurrencyListFilters = {
  activeOnly?: boolean;
};

const tableName = "currency" as const;

const selectCurrency = "id, currency_name, status";

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

async function nextCurrencyId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف للعملة");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(
  filters?: CurrencyListFilters,
): Promise<CurrencyRow[]> {
  let query = supabase
    .from(tableName)
    .select(selectCurrency)
    .order("id", { ascending: true });

  if (filters?.activeOnly === true) {
    query = query.eq("status", true);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات العملات المتعامل بها");
  }
  return (data as unknown as CurrencyRow[] | null) ?? [];
}

export async function getById(id: number | string): Promise<CurrencyRow> {
  const rowId = parseNumericId(id, "رقم العملة");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectCurrency)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات العملة");
  }
  return data as unknown as CurrencyRow;
}

export async function createCurrency(
  input: CreateCurrencyInput,
): Promise<CurrencyRow> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextCurrencyId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectCurrency)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل العملة");
  }
  return data as unknown as CurrencyRow;
}

export async function updateCurrency(
  id: number | string,
  patch: UpdateCurrencyInput,
): Promise<CurrencyRow> {
  const rowId = parseNumericId(id, "رقم العملة");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectCurrency)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل بيانات العملة");
  }
  return data as unknown as CurrencyRow;
}

export async function deleteCurrency(id: number | string): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم العملة");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف العملة");
  }
  return data;
}
