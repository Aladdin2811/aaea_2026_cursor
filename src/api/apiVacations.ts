import { supabase } from "../lib/supabase";

export type VacationsYearEmbed = {
  id: number;
  year_num: string | null;
  status: boolean | null;
};

export type VacationsEmployeeEmbed = {
  id: number;
  fingerprint_id: number;
  employee_name: string | null;
};

export type VacationsVacationTypeEmbed = {
  id: number;
  vacation_type_name: string | null;
  status: boolean | null;
};

export type VacationsRow = {
  id: number;
  year_id: number | null;
  employee_id: number | null;
  vacation_type_id: number | null;
  from_date: string | null;
  to_date: string | null;
  days_count: number | null;
  administrative_approval: boolean | null;
  management_approval: boolean | null;
  notes: string | null;
};

export type VacationsWithRelations = VacationsRow & {
  years: VacationsYearEmbed | VacationsYearEmbed[] | null;
  all_employees:
    | VacationsEmployeeEmbed
    | VacationsEmployeeEmbed[]
    | null;
  vacation_type:
    | VacationsVacationTypeEmbed
    | VacationsVacationTypeEmbed[]
    | null;
};

export type CreateVacationsInput = Partial<Omit<VacationsRow, "id">> & {
  id?: number;
};

export type UpdateVacationsInput = Partial<Omit<VacationsRow, "id">>;

export type VacationsListFilters = {
  year_id?: number | string;
  employee_id?: number | string;
  vacation_type_id?: number | string;
};

const tableName = "vacations" as const;

const selectVacationsEmbed = `
  id,
  year_id,
  employee_id,
  vacation_type_id,
  from_date,
  to_date,
  days_count,
  administrative_approval,
  management_approval,
  notes,
  years ( id, year_num, status ),
  all_employees ( id, fingerprint_id, employee_name ),
  vacation_type ( id, vacation_type_name, status )
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

async function nextVacationsId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف للإجازات");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(
  filters?: VacationsListFilters,
): Promise<VacationsWithRelations[]> {
  let query = supabase
    .from(tableName)
    .select(selectVacationsEmbed)
    .order("year_id", { ascending: false, nullsFirst: false })
    .order("from_date", { ascending: false, nullsFirst: false })
    .order("id", { ascending: false });

  if (filters?.year_id != null) {
    query = query.eq("year_id", parseNumericId(filters.year_id, "السنة"));
  }
  if (filters?.employee_id != null) {
    query = query.eq(
      "employee_id",
      parseNumericId(filters.employee_id, "الموظف"),
    );
  }
  if (filters?.vacation_type_id != null) {
    query = query.eq(
      "vacation_type_id",
      parseNumericId(filters.vacation_type_id, "نوع الإجازة"),
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات الإجازات");
  }
  return (data as unknown as VacationsWithRelations[] | null) ?? [];
}

export async function getById(
  id: number | string,
): Promise<VacationsWithRelations> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectVacationsEmbed)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات الإجازة");
  }
  return data as unknown as VacationsWithRelations;
}

export async function createVacations(
  input: CreateVacationsInput,
): Promise<VacationsWithRelations> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextVacationsId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectVacationsEmbed)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل الإجازة");
  }
  return data as unknown as VacationsWithRelations;
}

export async function updateVacations(
  id: number | string,
  patch: UpdateVacationsInput,
): Promise<VacationsWithRelations> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectVacationsEmbed)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل الإجازة");
  }
  return data as unknown as VacationsWithRelations;
}

export async function deleteVacations(id: number | string): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف الإجازة");
  }
  return data;
}
