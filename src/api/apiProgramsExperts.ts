import { supabase } from "../lib/supabase";

export type ProgramsExpertsMemberEmbed = {
  id: number;
  member_name: string | null;
};

export type ProgramsExpertsProgramEmbed = {
  id: number;
  program_name: string | null;
  program_code: string | null;
};

export type ProgramsExpertsRow = {
  id: number;
  expert_name: string | null;
  program_id: number | null;
  expert_nationality_id: number | null;
};

export type ProgramsExpertsWithRelations = ProgramsExpertsRow & {
  /** `expert_nationality_id` → `members` */
  members:
    | ProgramsExpertsMemberEmbed
    | ProgramsExpertsMemberEmbed[]
    | null;
  programs:
    | ProgramsExpertsProgramEmbed
    | ProgramsExpertsProgramEmbed[]
    | null;
};

export type CreateProgramsExpertsInput = Partial<
  Omit<ProgramsExpertsRow, "id">
> & {
  id?: number;
};

export type UpdateProgramsExpertsInput = Partial<Omit<ProgramsExpertsRow, "id">>;

export type ProgramsExpertsListFilters = {
  program_id?: number | string;
  expert_nationality_id?: number | string;
};

const tableName = "programs_experts" as const;

const selectProgramsExpertsEmbed = `
  id,
  expert_name,
  program_id,
  expert_nationality_id,
  members ( id, member_name ),
  programs ( id, program_name, program_code )
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

async function nextProgramsExpertsId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف لخبير البرنامج");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(
  filters?: ProgramsExpertsListFilters,
): Promise<ProgramsExpertsWithRelations[]> {
  let query = supabase
    .from(tableName)
    .select(selectProgramsExpertsEmbed)
    .order("program_id", { ascending: true, nullsFirst: false })
    .order("id", { ascending: true });

  if (filters?.program_id != null) {
    query = query.eq(
      "program_id",
      parseNumericId(filters.program_id, "البرنامج"),
    );
  }
  if (filters?.expert_nationality_id != null) {
    query = query.eq(
      "expert_nationality_id",
      parseNumericId(filters.expert_nationality_id, "الجنسية (الدولة)"),
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات خبراء البرامج");
  }
  return (data as unknown as ProgramsExpertsWithRelations[] | null) ?? [];
}

export async function getById(
  id: number | string,
): Promise<ProgramsExpertsWithRelations> {
  const rowId = parseNumericId(id, "رقم الخبير");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectProgramsExpertsEmbed)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات خبير البرنامج");
  }
  return data as unknown as ProgramsExpertsWithRelations;
}

export async function createProgramsExperts(
  input: CreateProgramsExpertsInput,
): Promise<ProgramsExpertsWithRelations> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextProgramsExpertsId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectProgramsExpertsEmbed)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل خبير البرنامج");
  }
  return data as unknown as ProgramsExpertsWithRelations;
}

export async function updateProgramsExperts(
  id: number | string,
  patch: UpdateProgramsExpertsInput,
): Promise<ProgramsExpertsWithRelations> {
  const rowId = parseNumericId(id, "رقم الخبير");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectProgramsExpertsEmbed)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل خبير البرنامج");
  }
  return data as unknown as ProgramsExpertsWithRelations;
}

export async function deleteProgramsExperts(
  id: number | string,
): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم الخبير");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف خبير البرنامج");
  }
  return data;
}
