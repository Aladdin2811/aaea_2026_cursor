import { supabase } from "../lib/supabase";

export type PaymentMethodRow = {
  id: number;
  payment_method: string | null;
};

/** شكل العلاقة المضمّنة في استعلامات أخرى (`payment_method (...)`) */
export type PaymentMethodEmbedded = Pick<
  PaymentMethodRow,
  "id" | "payment_method"
>;

export type CreatePaymentMethodInput = Partial<
  Omit<PaymentMethodRow, "id">
> & {
  id?: number;
};

export type UpdatePaymentMethodInput = Partial<Omit<PaymentMethodRow, "id">>;

const tableName = "payment_method" as const;

const selectPaymentMethod = `
  id,
  payment_method
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

async function nextPaymentMethodId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف لطريقة الدفع");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(): Promise<PaymentMethodRow[]> {
  const { data, error } = await supabase
    .from(tableName)
    .select(selectPaymentMethod)
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات طرق الدفع");
  }
  return (data as unknown as PaymentMethodRow[] | null) ?? [];
}

export async function getById(
  id: number | string,
): Promise<PaymentMethodRow> {
  const rowId = parseNumericId(id, "رقم طريقة الدفع");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectPaymentMethod)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات طريقة الدفع");
  }
  return data as unknown as PaymentMethodRow;
}

export async function createPaymentMethod(
  input: CreatePaymentMethodInput,
): Promise<PaymentMethodRow> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextPaymentMethodId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectPaymentMethod)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل طريقة الدفع");
  }
  return data as unknown as PaymentMethodRow;
}

export async function updatePaymentMethod(
  id: number | string,
  patch: UpdatePaymentMethodInput,
): Promise<PaymentMethodRow> {
  const rowId = parseNumericId(id, "رقم طريقة الدفع");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectPaymentMethod)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل طريقة الدفع");
  }
  return data as unknown as PaymentMethodRow;
}

export async function deletePaymentMethod(
  id: number | string,
): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم طريقة الدفع");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف طريقة الدفع");
  }
  return data;
}
