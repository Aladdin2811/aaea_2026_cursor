import { supabase } from "../lib/supabase";

export type NatureOfWorkRow = {
  id: number;
  nature_of_work_name: string | null;
  nature_of_work_amount: string | number | null;
};

/** شكل العلاقة المضمّنة في استعلامات أخرى (`nature_of_work (...)`) */
export type NatureOfWorkEmbedded = Pick<
  NatureOfWorkRow,
  "id" | "nature_of_work_name"
>;

export type CreateNatureOfWorkInput = Partial<
  Omit<NatureOfWorkRow, "id">
> & {
  id?: number;
};

export type UpdateNatureOfWorkInput = Partial<Omit<NatureOfWorkRow, "id">>;

const tableName = "nature_of_work" as const;

const selectNatureOfWork = `
  id,
  nature_of_work_name,
  nature_of_work_amount
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

async function nextNatureOfWorkId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف لطبيعة العمل");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(): Promise<NatureOfWorkRow[]> {
  const { data, error } = await supabase
    .from(tableName)
    .select(selectNatureOfWork)
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات بدل طبيعة العمل");
  }
  return (data as unknown as NatureOfWorkRow[] | null) ?? [];
}

export async function getById(id: number | string): Promise<NatureOfWorkRow> {
  const rowId = parseNumericId(id, "رقم طبيعة العمل");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectNatureOfWork)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات طبيعة العمل");
  }
  return data as unknown as NatureOfWorkRow;
}

export async function createNatureOfWork(
  input: CreateNatureOfWorkInput,
): Promise<NatureOfWorkRow> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextNatureOfWorkId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectNatureOfWork)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل طبيعة العمل");
  }
  return data as unknown as NatureOfWorkRow;
}

export async function updateNatureOfWork(
  id: number | string,
  patch: UpdateNatureOfWorkInput,
): Promise<NatureOfWorkRow> {
  const rowId = parseNumericId(id, "رقم طبيعة العمل");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectNatureOfWork)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل طبيعة العمل");
  }
  return data as unknown as NatureOfWorkRow;
}

export async function deleteNatureOfWork(id: number | string): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم طبيعة العمل");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف طبيعة العمل");
  }
  return data;
}
