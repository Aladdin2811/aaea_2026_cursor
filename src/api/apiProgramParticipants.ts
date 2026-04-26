import { supabase } from "../lib/supabase";

export type ProgramParticipantsMemberEmbed = {
  id: number;
  member_name: string | null;
};

export type ProgramParticipantsProgramEmbed = {
  id: number;
  program_name: string | null;
  program_code: string | null;
};

export type ProgramParticipantsRow = {
  id: number;
  participant_name: string | null;
  participant_nationality_id: number | null;
  program_id: number | null;
  local_participant: boolean | null;
  arabic_participant: boolean | null;
  /** عمود `other` في القاعدة */
  other: string | null;
};

export type ProgramParticipantsWithRelations = ProgramParticipantsRow & {
  /** `participant_nationality_id` → `members` */
  members:
    | ProgramParticipantsMemberEmbed
    | ProgramParticipantsMemberEmbed[]
    | null;
  programs:
    | ProgramParticipantsProgramEmbed
    | ProgramParticipantsProgramEmbed[]
    | null;
};

export type CreateProgramParticipantsInput = Partial<
  Omit<ProgramParticipantsRow, "id">
> & {
  id?: number;
};

export type UpdateProgramParticipantsInput = Partial<
  Omit<ProgramParticipantsRow, "id">
>;

export type ProgramParticipantsListFilters = {
  program_id?: number | string;
  participant_nationality_id?: number | string;
};

const tableName = "program_participants" as const;

const selectProgramParticipantsEmbed = `
  id,
  participant_name,
  participant_nationality_id,
  program_id,
  local_participant,
  arabic_participant,
  other,
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

async function nextProgramParticipantsId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف لمشارك البرنامج");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(
  filters?: ProgramParticipantsListFilters,
): Promise<ProgramParticipantsWithRelations[]> {
  let query = supabase
    .from(tableName)
    .select(selectProgramParticipantsEmbed)
    .order("program_id", { ascending: true, nullsFirst: false })
    .order("id", { ascending: true });

  if (filters?.program_id != null) {
    query = query.eq(
      "program_id",
      parseNumericId(filters.program_id, "البرنامج"),
    );
  }
  if (filters?.participant_nationality_id != null) {
    query = query.eq(
      "participant_nationality_id",
      parseNumericId(
        filters.participant_nationality_id,
        "الجنسية (الدولة)",
      ),
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات مشاركي البرامج");
  }
  return (data as unknown as ProgramParticipantsWithRelations[] | null) ?? [];
}

export async function getById(
  id: number | string,
): Promise<ProgramParticipantsWithRelations> {
  const rowId = parseNumericId(id, "رقم المشارك");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectProgramParticipantsEmbed)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات المشارك");
  }
  return data as unknown as ProgramParticipantsWithRelations;
}

export async function createProgramParticipants(
  input: CreateProgramParticipantsInput,
): Promise<ProgramParticipantsWithRelations> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextProgramParticipantsId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectProgramParticipantsEmbed)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل مشارك البرنامج");
  }
  return data as unknown as ProgramParticipantsWithRelations;
}

export async function updateProgramParticipants(
  id: number | string,
  patch: UpdateProgramParticipantsInput,
): Promise<ProgramParticipantsWithRelations> {
  const rowId = parseNumericId(id, "رقم المشارك");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectProgramParticipantsEmbed)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل مشارك البرنامج");
  }
  return data as unknown as ProgramParticipantsWithRelations;
}

export async function deleteProgramParticipants(
  id: number | string,
): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم المشارك");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف مشارك البرنامج");
  }
  return data;
}
