import { supabase } from "../lib/supabase";

export type EndOfServiceContractorsContributionRow = {
  id: number;
  contractors_contribution_percentage: string | number | null;
};

export type CreateEndOfServiceContractorsContributionInput = Partial<
  Omit<EndOfServiceContractorsContributionRow, "id">
> & {
  id?: number;
};

export type UpdateEndOfServiceContractorsContributionInput = Partial<
  Omit<EndOfServiceContractorsContributionRow, "id">
>;

const tableName = "end_of_service_contractors_contribution" as const;

const selectColumns = "id, contractors_contribution_percentage";

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

async function nextEndOfServiceContractorsContributionId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف لسجل مساهمة المتعاقدين");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(): Promise<
  EndOfServiceContractorsContributionRow[]
> {
  const { data, error } = await supabase
    .from(tableName)
    .select(selectColumns)
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات مساهمة المتعاقدين (نهاية الخدمة)");
  }
  return (
    (data as unknown as EndOfServiceContractorsContributionRow[] | null) ?? []
  );
}

export async function getById(
  id: number | string,
): Promise<EndOfServiceContractorsContributionRow> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectColumns)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات السجل");
  }
  return data as unknown as EndOfServiceContractorsContributionRow;
}

export async function createEndOfServiceContractorsContribution(
  input: CreateEndOfServiceContractorsContributionInput,
): Promise<EndOfServiceContractorsContributionRow> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextEndOfServiceContractorsContributionId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectColumns)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل مساهمة المتعاقدين");
  }
  return data as unknown as EndOfServiceContractorsContributionRow;
}

export async function updateEndOfServiceContractorsContribution(
  id: number | string,
  patch: UpdateEndOfServiceContractorsContributionInput,
): Promise<EndOfServiceContractorsContributionRow> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectColumns)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل مساهمة المتعاقدين");
  }
  return data as unknown as EndOfServiceContractorsContributionRow;
}

export async function deleteEndOfServiceContractorsContribution(
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
