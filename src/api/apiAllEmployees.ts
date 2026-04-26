import { supabase } from "../lib/supabase";

export type AllEmployeesNationalityEmbed = {
  id: number;
  member_name: string | null;
};

export type AllEmployeesJobNatureEmbed = {
  id: number;
  job_nature_name: string | null;
};

export type AllEmployeesJobCategoryEmbed = {
  id: number;
  job_category_name: string | null;
};

export type AllEmployeesJobGradeEmbed = {
  id: number;
  job_grade_name: string | null;
};

export type AllEmployeesJobTitleEmbed = {
  id: number;
  job_title_name: string | null;
};

export type AllEmployeesSocialSituationEmbed = {
  id: number;
  social_situation_name: string | null;
};

export type AllEmployeesGenderEmbed = {
  id: number;
  gender_name: string | null;
};

export type AllEmployeesNatureOfWorkEmbed = {
  id: number;
  nature_of_work_name: string | null;
};

export type AllEmployeesExpatriateEmbed = {
  id: number;
  expatriate_name: string | null;
};

export type AllEmployeesRow = {
  id: number;
  employee_name: string | null;
  nationality_id: number | null;
  date_of_birth: string | null;
  hiring_date: string | null;
  job_nature_id: number | null;
  job_category_id: number | null;
  job_grade_id: number | null;
  job_title_id: number | null;
  social_situation_id: number | null;
  social_security_situation_id: number | null;
  gender_id: number | null;
  nature_of_work_id: number | null;
  retired: boolean | null;
  social_security_subscribe: boolean | null;
  expatriate_id: number | null;
  bonus_count: number | null;
  have_missions: boolean | null;
  social_security_category_id: number | null;
  status: boolean | null;
  notes: string | null;
  fingerprint_id: number;
  advance_implement: boolean | null;
  social_security_payment_method: number | null;
};

export type AllEmployeesWithRelations = AllEmployeesRow & {
  /** `nationality_id` → `members` */
  members:
    | AllEmployeesNationalityEmbed
    | AllEmployeesNationalityEmbed[]
    | null;
  job_nature:
    | AllEmployeesJobNatureEmbed
    | AllEmployeesJobNatureEmbed[]
    | null;
  job_category:
    | AllEmployeesJobCategoryEmbed
    | AllEmployeesJobCategoryEmbed[]
    | null;
  job_grade:
    | AllEmployeesJobGradeEmbed
    | AllEmployeesJobGradeEmbed[]
    | null;
  job_title:
    | AllEmployeesJobTitleEmbed
    | AllEmployeesJobTitleEmbed[]
    | null;
  social_situations:
    | AllEmployeesSocialSituationEmbed
    | AllEmployeesSocialSituationEmbed[]
    | null;
  gender: AllEmployeesGenderEmbed | AllEmployeesGenderEmbed[] | null;
  nature_of_work:
    | AllEmployeesNatureOfWorkEmbed
    | AllEmployeesNatureOfWorkEmbed[]
    | null;
  expatriate:
    | AllEmployeesExpatriateEmbed
    | AllEmployeesExpatriateEmbed[]
    | null;
};

export type CreateAllEmployeesInput = Partial<
  Omit<AllEmployeesRow, "id" | "fingerprint_id">
> & {
  id?: number;
  fingerprint_id?: number;
};

export type UpdateAllEmployeesInput = Partial<
  Omit<AllEmployeesRow, "id" | "fingerprint_id">
>;

const tableName = "all_employees" as const;

const selectAllEmployeesEmbed = `
  id,
  employee_name,
  nationality_id,
  date_of_birth,
  hiring_date,
  job_nature_id,
  job_category_id,
  job_grade_id,
  job_title_id,
  social_situation_id,
  social_security_situation_id,
  gender_id,
  nature_of_work_id,
  retired,
  social_security_subscribe,
  expatriate_id,
  bonus_count,
  have_missions,
  social_security_category_id,
  status,
  notes,
  fingerprint_id,
  advance_implement,
  social_security_payment_method,
  members!all_employees_nationality_id_fkey ( id, member_name ),
  job_nature ( id, job_nature_name ),
  job_category ( id, job_category_name ),
  job_grade ( id, job_grade_name ),
  job_title ( id, job_title_name ),
  social_situations ( id, social_situation_name ),
  gender ( id, gender_name ),
  nature_of_work ( id, nature_of_work_name ),
  expatriate ( id, expatriate_name )
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

async function nextAllEmployeesId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف للموظف");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

async function nextFingerprintId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("fingerprint_id")
    .order("fingerprint_id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف بصمة");
  }
  return maxData != null && maxData.length > 0
    ? Number(maxData[0].fingerprint_id) + 1
    : 1;
}

export async function getAll(): Promise<AllEmployeesWithRelations[]> {
  const { data, error } = await supabase
    .from(tableName)
    .select(selectAllEmployeesEmbed)
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات الموظفين");
  }
  return (data as unknown as AllEmployeesWithRelations[] | null) ?? [];
}

export async function getById(
  id: number | string,
): Promise<AllEmployeesWithRelations> {
  const rowId = parseNumericId(id, "رقم الموظف");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectAllEmployeesEmbed)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات الموظف");
  }
  return data as unknown as AllEmployeesWithRelations;
}

export async function getByFingerprintId(
  fingerprintId: number | string,
): Promise<AllEmployeesWithRelations> {
  const fp = parseNumericId(fingerprintId, "معرّف البصمة");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectAllEmployeesEmbed)
    .eq("fingerprint_id", fp)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات الموظف");
  }
  return data as unknown as AllEmployeesWithRelations;
}

export async function createAllEmployees(
  input: CreateAllEmployeesInput,
): Promise<AllEmployeesWithRelations> {
  const { id: explicitId, fingerprint_id: explicitFp, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextAllEmployeesId();
  const nextFp =
    explicitFp != null && Number.isFinite(Number(explicitFp))
      ? Number(explicitFp)
      : await nextFingerprintId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({
      id: nextId,
      fingerprint_id: nextFp,
      ...fields,
      advance_implement: input.advance_implement ?? false,
    })
    .select(selectAllEmployeesEmbed)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل الموظف");
  }
  return data as unknown as AllEmployeesWithRelations;
}

export async function updateAllEmployees(
  id: number | string,
  fingerprintId: number | string,
  patch: UpdateAllEmployeesInput,
): Promise<AllEmployeesWithRelations> {
  const rowId = parseNumericId(id, "رقم الموظف");
  const fp = parseNumericId(fingerprintId, "معرّف البصمة");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .eq("fingerprint_id", fp)
    .select(selectAllEmployeesEmbed)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل بيانات الموظف");
  }
  return data as unknown as AllEmployeesWithRelations;
}

export async function deleteAllEmployees(
  id: number | string,
  fingerprintId: number | string,
): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم الموظف");
  const fp = parseNumericId(fingerprintId, "معرّف البصمة");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId)
    .eq("fingerprint_id", fp);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف الموظف");
  }
  return data;
}
