import { supabase } from "../lib/supabase";

export type ProgramsTypeRow = {
  id: number;
  program_type_name: string | null;
  status: boolean | null;
};

/** شكل العلاقة المضمّنة في استعلامات أخرى (`programs_type (...)`) */
export type ProgramsTypeEmbedded = Pick<
  ProgramsTypeRow,
  "id" | "program_type_name"
>;

export type CreateProgramsTypeInput = Partial<
  Omit<ProgramsTypeRow, "id">
> & {
  id?: number;
};

export type UpdateProgramsTypeInput = Partial<Omit<ProgramsTypeRow, "id">>;

export type ProgramsTypeListFilters = {
  activeOnly?: boolean;
};

const tableName = "programs_type" as const;

const selectProgramsType = `
  id,
  program_type_name,
  status
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

async function nextProgramsTypeId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف لنوع البرنامج");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(
  filters?: ProgramsTypeListFilters,
): Promise<ProgramsTypeRow[]> {
  let query = supabase
    .from(tableName)
    .select(selectProgramsType)
    .order("id", { ascending: true });

  if (filters?.activeOnly === true) {
    query = query.eq("status", true);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات أنواع البرامج");
  }
  return (data as unknown as ProgramsTypeRow[] | null) ?? [];
}

export async function getById(id: number | string): Promise<ProgramsTypeRow> {
  const rowId = parseNumericId(id, "رقم نوع البرنامج");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectProgramsType)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات نوع البرنامج");
  }
  return data as unknown as ProgramsTypeRow;
}

export async function createProgramsType(
  input: CreateProgramsTypeInput,
): Promise<ProgramsTypeRow> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextProgramsTypeId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectProgramsType)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل نوع البرنامج");
  }
  return data as unknown as ProgramsTypeRow;
}

export async function updateProgramsType(
  id: number | string,
  patch: UpdateProgramsTypeInput,
): Promise<ProgramsTypeRow> {
  const rowId = parseNumericId(id, "رقم نوع البرنامج");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectProgramsType)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل نوع البرنامج");
  }
  return data as unknown as ProgramsTypeRow;
}

export async function deleteProgramsType(id: number | string): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم نوع البرنامج");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف نوع البرنامج");
  }
  return data;
}
