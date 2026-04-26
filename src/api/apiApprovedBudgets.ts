import { supabase } from "../lib/supabase";

export type ApprovedBudgetsYearEmbed = {
  id: number;
  year_num: string | null;
  status: boolean | null;
};

export type ApprovedBudgetsRow = {
  id: number;
  year_id: number | null;
  approved_budget_amount: string | number | null;
  notes: string | null;
};

export type ApprovedBudgetsWithRelations = ApprovedBudgetsRow & {
  years: ApprovedBudgetsYearEmbed | ApprovedBudgetsYearEmbed[] | null;
};

export type CreateApprovedBudgetsInput = Partial<
  Omit<ApprovedBudgetsRow, "id">
> & {
  id?: number;
};

export type UpdateApprovedBudgetsInput = Partial<
  Omit<ApprovedBudgetsRow, "id">
>;

export type ApprovedBudgetsListFilters = {
  year_id?: number | string;
};

const tableName = "approved_budgets" as const;

const selectApprovedBudgetsEmbed = `
  id,
  year_id,
  approved_budget_amount,
  notes,
  years ( id, year_num, status )
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

async function nextApprovedBudgetsId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف للموازنة المعتمدة");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(
  filters?: ApprovedBudgetsListFilters,
): Promise<ApprovedBudgetsWithRelations[]> {
  let query = supabase
    .from(tableName)
    .select(selectApprovedBudgetsEmbed)
    .order("id", { ascending: true });

  if (filters?.year_id != null) {
    query = query.eq("year_id", parseNumericId(filters.year_id, "السنة"));
  }

  const { data, error } = await query;

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات الموازنات المعتمدة");
  }
  return (data as unknown as ApprovedBudgetsWithRelations[] | null) ?? [];
}

export async function getById(
  id: number | string,
): Promise<ApprovedBudgetsWithRelations> {
  const rowId = parseNumericId(id, "رقم الموازنة المعتمدة");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectApprovedBudgetsEmbed)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات الموازنة المعتمدة");
  }
  return data as unknown as ApprovedBudgetsWithRelations;
}

export async function createApprovedBudgets(
  input: CreateApprovedBudgetsInput,
): Promise<ApprovedBudgetsWithRelations> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextApprovedBudgetsId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectApprovedBudgetsEmbed)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل الموازنة المعتمدة");
  }
  return data as unknown as ApprovedBudgetsWithRelations;
}

export async function updateApprovedBudgets(
  id: number | string,
  patch: UpdateApprovedBudgetsInput,
): Promise<ApprovedBudgetsWithRelations> {
  const rowId = parseNumericId(id, "رقم الموازنة المعتمدة");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectApprovedBudgetsEmbed)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل الموازنة المعتمدة");
  }
  return data as unknown as ApprovedBudgetsWithRelations;
}

export async function deleteApprovedBudgets(
  id: number | string,
): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم الموازنة المعتمدة");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف الموازنة المعتمدة");
  }
  return data;
}
