import { supabase } from "../lib/supabase";

export type RolesRow = {
  id: number;
  role_name: string | null;
  description: string | null;
  status: boolean | null;
};

/** شكل العلاقة المضمّنة في استعلامات أخرى (`roles (...)`) */
export type RolesEmbedded = Pick<RolesRow, "id" | "role_name">;

export type CreateRolesInput = Partial<Omit<RolesRow, "id">> & {
  id?: number;
};

export type UpdateRolesInput = Partial<Omit<RolesRow, "id">>;

export type RolesListFilters = {
  activeOnly?: boolean;
};

const tableName = "roles" as const;

const selectRoles = `
  id,
  role_name,
  description,
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

async function nextRolesId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف للصلاحية");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(filters?: RolesListFilters): Promise<RolesRow[]> {
  let query = supabase
    .from(tableName)
    .select(selectRoles)
    .order("id", { ascending: true });

  if (filters?.activeOnly === true) {
    query = query.eq("status", true);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات الصلاحيات");
  }
  return (data as unknown as RolesRow[] | null) ?? [];
}

export async function getById(id: number | string): Promise<RolesRow> {
  const rowId = parseNumericId(id, "رقم الصلاحية");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectRoles)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات الصلاحية");
  }
  return data as unknown as RolesRow;
}

export async function createRoles(input: CreateRolesInput): Promise<RolesRow> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextRolesId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectRoles)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل الصلاحية");
  }
  return data as unknown as RolesRow;
}

export async function updateRoles(
  id: number | string,
  patch: UpdateRolesInput,
): Promise<RolesRow> {
  const rowId = parseNumericId(id, "رقم الصلاحية");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectRoles)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل الصلاحية");
  }
  return data as unknown as RolesRow;
}

export async function deleteRoles(id: number | string): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم الصلاحية");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف الصلاحية");
  }
  return data;
}
