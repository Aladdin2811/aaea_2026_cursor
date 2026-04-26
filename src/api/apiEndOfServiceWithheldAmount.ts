import { supabase } from "../lib/supabase";

export type EndOfServiceWithheldAmountEmployeeEmbed = {
  id: number;
  fingerprint_id: number;
  employee_name: string | null;
};

export type EndOfServiceWithheldAmountRow = {
  id: number;
  employee_id: number | null;
  withheld_amount: string | number | null;
};

export type EndOfServiceWithheldAmountWithRelations =
  EndOfServiceWithheldAmountRow & {
    all_employees:
      | EndOfServiceWithheldAmountEmployeeEmbed
      | EndOfServiceWithheldAmountEmployeeEmbed[]
      | null;
  };

export type CreateEndOfServiceWithheldAmountInput = Partial<
  Omit<EndOfServiceWithheldAmountRow, "id">
>;

export type UpdateEndOfServiceWithheldAmountInput = Partial<
  Omit<EndOfServiceWithheldAmountRow, "id">
>;

export type EndOfServiceWithheldAmountListFilters = {
  employee_id?: number | string;
};

const tableName = "end_of_service_withheld_amount" as const;

const selectEndOfServiceWithheldAmountEmbed = `
  id,
  employee_id,
  withheld_amount,
  all_employees!end_of_service_withheld_amount_employee_id_fkey ( id, fingerprint_id, employee_name )
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

export async function getAll(
  filters?: EndOfServiceWithheldAmountListFilters,
): Promise<EndOfServiceWithheldAmountWithRelations[]> {
  let query = supabase
    .from(tableName)
    .select(selectEndOfServiceWithheldAmountEmbed)
    .order("id", { ascending: false });

  if (filters?.employee_id != null) {
    query = query.eq(
      "employee_id",
      parseNumericId(filters.employee_id, "الموظف"),
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات المبالغ المحجوزة (نهاية الخدمة)");
  }
  return (
    (data as unknown as EndOfServiceWithheldAmountWithRelations[] | null) ?? []
  );
}

export async function getById(
  id: number | string,
): Promise<EndOfServiceWithheldAmountWithRelations> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectEndOfServiceWithheldAmountEmbed)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات السجل");
  }
  return data as unknown as EndOfServiceWithheldAmountWithRelations;
}

export async function createEndOfServiceWithheldAmount(
  input: CreateEndOfServiceWithheldAmountInput,
): Promise<EndOfServiceWithheldAmountWithRelations> {
  const { data, error } = await supabase
    .from(tableName)
    .insert({ ...input })
    .select(selectEndOfServiceWithheldAmountEmbed)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل المبلغ المحجوز");
  }
  return data as unknown as EndOfServiceWithheldAmountWithRelations;
}

export async function updateEndOfServiceWithheldAmount(
  id: number | string,
  patch: UpdateEndOfServiceWithheldAmountInput,
): Promise<EndOfServiceWithheldAmountWithRelations> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectEndOfServiceWithheldAmountEmbed)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل المبلغ المحجوز");
  }
  return data as unknown as EndOfServiceWithheldAmountWithRelations;
}

export async function deleteEndOfServiceWithheldAmount(
  id: number | string,
): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف السجل");
  }
  return data;
}
