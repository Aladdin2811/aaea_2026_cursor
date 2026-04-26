import { supabase } from "../lib/supabase";
import { getNextTableId } from "../lib/nextTableId";

/** صف جدول الأنشطة المعتمدة (certified_programs) */
export type CertifiedProgramRow = {
  id: number;
  program_name: string | null;
  objectives: string | null;
  year_id: number | null;
  no3_id: number | null;
  detailed_id: number | null;
};

export type CertifiedProgramYearEmbed = {
  id: number;
  year_num: string | null;
  status: boolean | null;
};

export type CertifiedProgramNo3Embed = {
  id: number;
  no3_name: string | null;
  no3_code: string | null;
};

export type CertifiedProgramDetailedEmbed = {
  id: number;
  detailed_name: string | null;
  detailed_code: string | null;
};

export type CertifiedProgramWithRelations = CertifiedProgramRow & {
  years: CertifiedProgramYearEmbed | null;
  no3: CertifiedProgramNo3Embed | null;
  detailed: CertifiedProgramDetailedEmbed | null;
};

export type CreateCertifiedProgramInput = {
  /** إن وُجد يُستخدم؛ وإلا يُحسب عبر `getNextTableId` */
  id?: number;
  program_name?: string | null;
  objectives?: string | null;
  year_id?: number | null;
  no3_id?: number | null;
  detailed_id?: number | null;
};

export type UpdateCertifiedProgramInput = Partial<
  Pick<
    CertifiedProgramRow,
    "program_name" | "objectives" | "year_id" | "no3_id" | "detailed_id"
  >
>;

const selectCertifiedProgramEmbed = `
  id,
  program_name,
  objectives,
  year_id,
  no3_id,
  detailed_id,
  years ( id, year_num, status ),
  no3 ( id, no3_name, no3_code ),
  detailed ( id, detailed_name, detailed_code )
`;

const tableName = "certified_programs" as const;

function normalizeOne<T>(v: T | T[] | null | undefined): T | null {
  if (v == null) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

function normalizeCertifiedProgramRow(
  row: CertifiedProgramRow & {
    years?: unknown;
    no3?: unknown;
    detailed?: unknown;
  },
): CertifiedProgramWithRelations {
  return {
    ...row,
    years: normalizeOne(
      row.years as
        | CertifiedProgramYearEmbed
        | CertifiedProgramYearEmbed[]
        | null,
    ),
    no3: normalizeOne(
      row.no3 as CertifiedProgramNo3Embed | CertifiedProgramNo3Embed[] | null,
    ),
    detailed: normalizeOne(
      row.detailed as
        | CertifiedProgramDetailedEmbed
        | CertifiedProgramDetailedEmbed[]
        | null,
    ),
  };
}

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

/** جلب جميع الأنشطة المعتمدة مع أسماء السنة والنوع والتفصيلي */
export async function getAll(): Promise<CertifiedProgramWithRelations[]> {
  const { data, error } = await supabase
    .from(tableName)
    .select(selectCertifiedProgramEmbed)
    .order("year_id", { ascending: true, nullsFirst: false })
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(
      "لا يمكن الحصول على بيانات الأنشطة المعتمدة. تأكد من وجود علاقات (FK) بين الجدول وجداول years و no3 و detailed في Supabase.",
    );
  }
  return ((data ?? []) as unknown[]).map((r) =>
    normalizeCertifiedProgramRow(
      r as CertifiedProgramRow & Record<string, unknown>,
    ),
  );
}

/** جلب الأنشطة المعتمدة لسنة محاسبية محددة (`year_id`) */
export async function getByYearId(
  yearId: number | string,
): Promise<CertifiedProgramWithRelations[]> {
  const yid = parseNumericId(yearId, "السنة المحاسبية");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectCertifiedProgramEmbed)
    .eq("year_id", yid)
    .order("year_id", { ascending: true, nullsFirst: false })
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(
      "لا يمكن الحصول على الأنشطة المعتمدة لهذه السنة. تأكد من العلاقات في قاعدة البيانات.",
    );
  }
  return ((data ?? []) as unknown[]).map((r) =>
    normalizeCertifiedProgramRow(
      r as CertifiedProgramRow & Record<string, unknown>,
    ),
  );
}

export async function getById(
  id: number | string,
): Promise<CertifiedProgramWithRelations> {
  const rowId = parseNumericId(id, "رقم النشاط");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectCertifiedProgramEmbed)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات النشاط المعتمد");
  }
  return normalizeCertifiedProgramRow(
    data as CertifiedProgramRow & Record<string, unknown>,
  );
}

export async function createCertifiedProgram(
  input: CreateCertifiedProgramInput,
): Promise<CertifiedProgramWithRelations> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await getNextTableId(tableName);
  const payload = { ...fields, id: nextId };

  const { data, error } = await supabase
    .from(tableName)
    .insert(payload)
    .select(selectCertifiedProgramEmbed)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل نشاط معتمد جديد");
  }
  return normalizeCertifiedProgramRow(
    data as CertifiedProgramRow & Record<string, unknown>,
  );
}

export async function updateCertifiedProgram(
  id: number | string,
  patch: UpdateCertifiedProgramInput,
): Promise<CertifiedProgramWithRelations> {
  const rowId = parseNumericId(id, "رقم النشاط");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectCertifiedProgramEmbed)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن تعديل بيانات النشاط المعتمد");
  }
  return normalizeCertifiedProgramRow(
    data as CertifiedProgramRow & Record<string, unknown>,
  );
}

export async function deleteCertifiedProgram(
  id: number | string,
): Promise<void> {
  const rowId = parseNumericId(id, "رقم النشاط");

  const { error } = await supabase.from(tableName).delete().eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن حذف النشاط المعتمد");
  }
}
