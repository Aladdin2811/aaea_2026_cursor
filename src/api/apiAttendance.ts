import { supabase } from "../lib/supabase";

/** تضمين خفيف من `all_employees` عبر `fingerprint_id` */
export type AttendanceAllEmployeesEmbed = {
  id: number;
  fingerprint_id: number;
  employee_name: string | null;
};

export type AttendanceRow = {
  id: number;
  fingerprint_id: number | null;
  date: string | null;
  weekday: string | null;
  /** قيمة `time` من PostgREST غالباً كنص `HH:mm:ss` */
  first_time: string | null;
  last_time: string | null;
  notes: string | null;
};

export type AttendanceWithRelations = AttendanceRow & {
  all_employees:
    | AttendanceAllEmployeesEmbed
    | AttendanceAllEmployeesEmbed[]
    | null;
};

export type CreateAttendanceInput = Partial<Omit<AttendanceRow, "id">>;

export type UpdateAttendanceInput = Partial<Omit<AttendanceRow, "id">>;

export type AttendanceListFilters = {
  fingerprint_id?: number | string;
  /** تطابق يوم واحد `YYYY-MM-DD` */
  date?: string;
};

const tableName = "attendance" as const;

const selectAttendanceEmbed = `
  id,
  fingerprint_id,
  date,
  weekday,
  first_time,
  last_time,
  notes,
  all_employees!attendance_fingerprint_id_fkey ( id, fingerprint_id, employee_name )
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
  filters?: AttendanceListFilters,
): Promise<AttendanceWithRelations[]> {
  let query = supabase
    .from(tableName)
    .select(selectAttendanceEmbed)
    .order("date", { ascending: false, nullsFirst: false })
    .order("id", { ascending: false });

  if (filters?.fingerprint_id != null) {
    query = query.eq(
      "fingerprint_id",
      parseNumericId(filters.fingerprint_id, "معرّف البصمة"),
    );
  }
  if (filters?.date != null && filters.date !== "") {
    query = query.eq("date", filters.date);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات الحضور");
  }
  return (data as unknown as AttendanceWithRelations[] | null) ?? [];
}

export async function getById(
  id: number | string,
): Promise<AttendanceWithRelations> {
  const rowId = parseNumericId(id, "رقم سجل الحضور");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectAttendanceEmbed)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات سجل الحضور");
  }
  return data as unknown as AttendanceWithRelations;
}

export async function createAttendance(
  input: CreateAttendanceInput,
): Promise<AttendanceWithRelations> {
  const { data, error } = await supabase
    .from(tableName)
    .insert({ ...input })
    .select(selectAttendanceEmbed)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل الحضور");
  }
  return data as unknown as AttendanceWithRelations;
}

export async function updateAttendance(
  id: number | string,
  patch: UpdateAttendanceInput,
): Promise<AttendanceWithRelations> {
  const rowId = parseNumericId(id, "رقم سجل الحضور");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectAttendanceEmbed)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل سجل الحضور");
  }
  return data as unknown as AttendanceWithRelations;
}

export async function deleteAttendance(id: number | string): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم سجل الحضور");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف سجل الحضور");
  }
  return data;
}
