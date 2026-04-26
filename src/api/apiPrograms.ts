import { supabase } from "../lib/supabase";

/** فلتر مساواة بسيط لـ `getAll` */
export type ProgramFilter = {
  field: string;
  value: string | number | boolean;
};

/** صف جدول `programs` حسب مخطط القاعدة */
export type ProgramsRow = {
  id: number;
  program_name: string | null;
  program_code: string | null;
  program_type_id: number | null;
  year_id: number | null;
  account_type_id: number | null;
  general_account_id: number | null;
  bab_id: number | null;
  band_id: number | null;
  no3_id: number | null;
  detailed_id: number | null;
  world_classification_id: number | null;
  world_country_id: number | null;
  city: string | null;
  from_date: string | null;
  to_date: string | null;
  budget: string | number | null;
  certified: boolean | null;
  remotely: boolean | null;
  executed: boolean | null;
  general_secretariat: boolean | null;
  status: boolean | null;
  emp1: number | null;
  emp2: number | null;
  emp3: number | null;
  emp4: number | null;
  emp5: number | null;
  emp6: number | null;
  zoom: boolean | null;
  notes: string | null;
  employees_id: number[] | null;
  certified_program_id: number | null;
  supported: boolean | null;
};

export type ProgramTypeEmbed = {
  id: number;
  program_type_name: string | null;
};

export type ProgramAccountTypeEmbed = {
  id: number;
  account_type_name: string | null;
};

export type ProgramGeneralAccountEmbed = {
  id: number;
  general_account_name: string | null;
};

export type ProgramBabEmbed = {
  id: number;
  bab_name: string | null;
};

export type ProgramBandEmbed = {
  id: number;
  band_name: string | null;
};

export type ProgramNo3Embed = {
  id: number;
  no3_name: string | null;
};

export type ProgramDetailedEmbed = {
  id: number;
  detailed_name: string | null;
};

export type ProgramWorldClassificationEmbed = {
  id: number;
  world_classification_name: string | null;
};

export type ProgramWorldCountryEmbed = {
  id: number;
  world_country_name: string | null;
};

export type ProgramYearEmbed = {
  id: number;
  year_num: string | null;
  status: boolean | null;
};

export type ProgramCertifiedProgramEmbed = {
  id: number;
  program_name: string | null;
  objectives: string | null;
  year_id: number | null;
};

export type ProgramEmployeeEmbed = {
  id: number;
  employee_name: string | null;
};

/** شكل العلاقة المضمّنة في استعلامات أخرى (`programs (...)`) */
export type ProgramsEmbedded = Pick<
  ProgramsRow,
  "id" | "program_name" | "program_code"
>;

/** PostgREST قد يُرجع كائناً أو مصفوفة حسب تعريف العلاقة */
export type ProgramsWithRelations = ProgramsRow & {
  programs_type: ProgramTypeEmbed | ProgramTypeEmbed[] | null;
  account_type: ProgramAccountTypeEmbed | ProgramAccountTypeEmbed[] | null;
  general_account:
    | ProgramGeneralAccountEmbed
    | ProgramGeneralAccountEmbed[]
    | null;
  bab: ProgramBabEmbed | ProgramBabEmbed[] | null;
  band: ProgramBandEmbed | ProgramBandEmbed[] | null;
  no3: ProgramNo3Embed | ProgramNo3Embed[] | null;
  detailed: ProgramDetailedEmbed | ProgramDetailedEmbed[] | null;
  world_classifications:
    | ProgramWorldClassificationEmbed
    | ProgramWorldClassificationEmbed[]
    | null;
  world_countries:
    | ProgramWorldCountryEmbed
    | ProgramWorldCountryEmbed[]
    | null;
  years: ProgramYearEmbed | ProgramYearEmbed[] | null;
  certified_programs:
    | ProgramCertifiedProgramEmbed
    | ProgramCertifiedProgramEmbed[]
    | null;
  /** `emp1` — قيد `programs_supervising_activity_fkey` */
  supervising_employee:
    | ProgramEmployeeEmbed
    | ProgramEmployeeEmbed[]
    | null;
  employee_emp2: ProgramEmployeeEmbed | ProgramEmployeeEmbed[] | null;
  employee_emp3: ProgramEmployeeEmbed | ProgramEmployeeEmbed[] | null;
  employee_emp4: ProgramEmployeeEmbed | ProgramEmployeeEmbed[] | null;
  employee_emp5: ProgramEmployeeEmbed | ProgramEmployeeEmbed[] | null;
  employee_emp6: ProgramEmployeeEmbed | ProgramEmployeeEmbed[] | null;
};

const tableName = "programs" as const;

const selectProgramsColumns = `
      id,
      program_name,
      program_code,
      program_type_id,
      year_id,
      account_type_id,
      general_account_id,
      bab_id,
      band_id,
      no3_id,
      detailed_id,
      world_classification_id,
      world_country_id,
      city,
      from_date,
      to_date,
      budget,
      certified,
      remotely,
      executed,
      general_secretariat,
      status,
      emp1,
      emp2,
      emp3,
      emp4,
      emp5,
      emp6,
      zoom,
      notes,
      employees_id,
      certified_program_id,
      supported
`;

const selectProgramsEmbed = `
      ${selectProgramsColumns},
      programs_type (
        id,
        program_type_name
      ),
      account_type (
        id,
        account_type_name
      ),
      general_account (
        id,
        general_account_name
      ),
      bab (
        id,
        bab_name
      ),
      band (
        id,
        band_name
      ),
      no3 (
        id,
        no3_name
      ),
      detailed (
        id,
        detailed_name
      ),
      world_classifications (
        id,
        world_classification_name
      ),
      world_countries (
        id,
        world_country_name
      ),
      years ( id, year_num, status ),
      certified_programs ( id, program_name, objectives, year_id ),
      supervising_employee:all_employees!programs_supervising_activity_fkey ( id, employee_name ),
      employee_emp2:all_employees!programs_emp2_fkey ( id, employee_name ),
      employee_emp3:all_employees!programs_emp3_fkey ( id, employee_name ),
      employee_emp4:all_employees!programs_emp4_fkey ( id, employee_name ),
      employee_emp5:all_employees!programs_emp5_fkey ( id, employee_name ),
      employee_emp6:all_employees!programs_emp6_fkey ( id, employee_name )
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

async function nextProgramsId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف للبرنامج");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(
  filterArray: ProgramFilter[],
): Promise<ProgramsWithRelations[]> {
  let query = supabase.from(tableName).select(selectProgramsEmbed);

  for (const filter of filterArray) {
    query = query.eq(filter.field, filter.value);
  }

  const { data, error } = await query
    .order("from_date", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات البرامج");
  }
  return (data as unknown as ProgramsWithRelations[] | null) ?? [];
}

export type CreateProgramInput = Partial<Omit<ProgramsRow, "id">> & {
  id?: number;
};

/**
 * إنشاء أو تعديل برنامج. عند غياب `id` يُنشأ صف جديد مع `id` تسلسلي يدوي (كما في المنطق السابق).
 */
export async function createUpdateProgram(
  newProgram: CreateProgramInput,
  id: number | null | undefined,
): Promise<ProgramsRow> {
  const nextId = await nextProgramsId();

  if (id == null || id === undefined) {
    const insertId =
      newProgram.id != null && Number.isFinite(Number(newProgram.id))
        ? Number(newProgram.id)
        : nextId;
    const { id: _omit, ...rest } = newProgram;

    const { data, error } = await supabase
      .from(tableName)
      .insert([{ id: insertId, ...rest }])
      .select(selectProgramsColumns)
      .single();

    if (error) {
      console.error("Supabase error:", error);
      throw new Error("حدث خطأ عند تسجيل النشاط الجديد");
    }
    return data as unknown as ProgramsRow;
  }

  const { id: _rowIdFromPayload, ...patch } = newProgram;
  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", id)
    .select(selectProgramsColumns)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند تعديل بيانات النشاط");
  }
  return data as unknown as ProgramsRow;
}

export async function createProgram(
  newProgram: CreateProgramInput,
): Promise<ProgramsRow> {
  const nextId = await nextProgramsId();
  const insertId =
    newProgram.id != null && Number.isFinite(Number(newProgram.id))
      ? Number(newProgram.id)
      : nextId;
  const { id: _omit, ...rest } = newProgram;

  const { data, error } = await supabase
    .from(tableName)
    .insert([{ id: insertId, ...rest }])
    .select(selectProgramsColumns)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند تسجيل النشاط الجديد");
  }

  return data as unknown as ProgramsRow;
}

export type UpdateProgramInput = Partial<Omit<ProgramsRow, "id">>;

export async function updateProgram(
  id: number,
  updatedProgram: UpdateProgramInput,
): Promise<ProgramsRow> {
  const { data, error } = await supabase
    .from(tableName)
    .update({ ...updatedProgram })
    .eq("id", id)
    .select(selectProgramsColumns)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند تعديل بيانات النشاط");
  }

  return data as unknown as ProgramsRow;
}

export async function deleteProgram(id: number | string): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم البرنامج");

  const { data: related, error: checkError } = await supabase
    .from("journal_details")
    .select("id")
    .eq("program_id", rowId)
    .limit(1);

  if (checkError) {
    console.error(checkError);
    throw new Error("حدث خطأ أثناء التحقق من البيانات المرتبطة");
  }

  if (related && related.length > 0) {
    throw new Error("لا يمكن حذف النشاط لإستخدامه في قيود اليومية");
  }

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف النشاط");
  }
  return data;
}

export async function getById(
  id: number | string,
): Promise<ProgramsWithRelations> {
  const rowId = parseNumericId(id, "رقم البرنامج");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectProgramsEmbed)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات البرنامج");
  }
  return data as unknown as ProgramsWithRelations;
}
