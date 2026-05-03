import { supabase } from "../lib/supabase";
import type {
  AccountTypeEmbed,
  BabEmbed,
  GeneralAccountEmbed,
} from "./apiBand";

export type No3BandEmbed = {
  id: number;
  band_name: string | null;
  band_code: string | null;
};

export type No3Row = {
  id: number;
  no3_name: string | null;
  no3_code: string | null;
  account_type_id: number | null;
  general_account_id: number | null;
  bab_id: number | null;
  band_id: number | null;
  description: string | null;
  havebudget: boolean | null;
  haveprograms: boolean | null;
  directexchange: boolean | null;
  salariesdirectpaid: boolean | null;
  no3_journal_show: boolean | null;
  status: boolean | null;
  sort: number | null;
  nature_of_account: number | null;
  member_id: number | null;
};

export type No3WithRelations = No3Row & {
  account_type: AccountTypeEmbed | AccountTypeEmbed[] | null;
  general_account: GeneralAccountEmbed | GeneralAccountEmbed[] | null;
  bab: BabEmbed | BabEmbed[] | null;
  band: No3BandEmbed | No3BandEmbed[] | null;
};

/** شكل العلاقة المضمّنة في استعلامات أخرى (`no3 (...)`) */
export type No3Embedded = Pick<No3Row, "id" | "no3_name" | "no3_code">;

export type CreateNo3Input = Partial<Omit<No3Row, "id">> & {
  id?: number;
};

export type UpdateNo3Input = Partial<Omit<No3Row, "id">>;

export type No3ByBandOptions = {
  /**
   * عند `false` يُرجع كل الصفوف بغض النظر عن `status`.
   * الافتراضي `true` للتوافق مع السلوك السابق.
   */
  activeOnly?: boolean;
};

const tableName = "no3" as const;

const selectNo3Embed = `
  id,
  no3_name,
  no3_code,
  account_type_id,
  general_account_id,
  bab_id,
  band_id,
  description,
  havebudget,
  haveprograms,
  directexchange,
  salariesdirectpaid,
  no3_journal_show,
  status,
  sort,
  nature_of_account,
  member_id,
  account_type ( id, account_type_name ),
  general_account ( id, general_account_name, general_account_code ),
  bab ( id, bab_name, bab_code ),
  band ( id, band_name, band_code )
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

async function nextNo3Id(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف للنوع");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

/**
 * جلب الأنواع المرتبطة بـ `band_id` (افتراضياً النشطة فقط: `status === true`).
 */
export async function getAll(
  bandId: number | string,
  options?: No3ByBandOptions,
): Promise<No3WithRelations[]> {
  const id = parseNumericId(bandId, "البند");

  let query = supabase
    .from(tableName)
    .select(selectNo3Embed)
    .eq("band_id", id)
    .order("sort", { ascending: true, nullsFirst: false })
    .order("id", { ascending: true });

  if (options?.activeOnly !== false) {
    query = query.eq("status", true);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات الأنواع");
  }
  return (data as unknown as No3WithRelations[] | null) ?? [];
}

export async function getForSelect(
  bandId: number | string,
  options?: No3ByBandOptions,
): Promise<No3WithRelations[]> {
  return getAll(bandId, options);
}

export async function getById(id: number | string): Promise<No3WithRelations> {
  const rowId = parseNumericId(id, "رقم النوع");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectNo3Embed)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات النوع");
  }
  return data as unknown as No3WithRelations;
}

export async function createNo3(input: CreateNo3Input): Promise<No3WithRelations> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextNo3Id();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectNo3Embed)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل النوع");
  }
  return data as unknown as No3WithRelations;
}

export async function updateNo3(
  id: number | string,
  patch: UpdateNo3Input,
): Promise<No3WithRelations> {
  const rowId = parseNumericId(id, "رقم النوع");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectNo3Embed)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل النوع");
  }
  return data as unknown as No3WithRelations;
}

export async function deleteNo3(id: number | string): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم النوع");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف النوع");
  }
  return data;
}

export type No3BriefRow = Pick<No3Row, "id" | "no3_name" | "no3_code">;

const selectNo3Brief = "id, no3_name, no3_code";

/** أنواع مفعّلة مرتبطة بالبرامج (`haveprograms`) — قوائم الأنشطة المعتمدة وغيرها */
export async function getActiveWithProgramsFlag(): Promise<No3BriefRow[]> {
  const { data, error } = await supabase
    .from(tableName)
    .select(selectNo3Brief)
    .eq("status", true)
    .eq("haveprograms", true)
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على أنواع الأنشطة");
  }
  return (data as unknown as No3BriefRow[] | null) ?? [];
}

function parseRpcNumericResult(data: unknown): number {
  if (data == null) return 0;
  if (typeof data === "number" && Number.isFinite(data)) return data;
  if (typeof data === "string") {
    const n = Number(data);
    return Number.isFinite(n) ? n : 0;
  }
  if (Array.isArray(data) && data.length > 0) {
    return parseRpcNumericResult(data[0]);
  }
  if (typeof data === "object" && data !== null && !Array.isArray(data)) {
    const o = data as Record<string, unknown>;
    const keys = Object.keys(o);
    if (keys.length === 1 && keys[0]) {
      return parseRpcNumericResult(o[keys[0]!]);
    }
    for (const k of ["get_no3_sum", "sum", "total", "no3_sum"]) {
      if (k in o) return parseRpcNumericResult(o[k]);
    }
    const v = Object.values(o).find(
      (x) => typeof x === "number" || typeof x === "string",
    );
    if (v !== undefined) return parseRpcNumericResult(v);
  }
  return 0;
}

/** يُمرَّر إلى الدالة كـ `p_year_id` و `p_no3_id` في Postgres. */
export type GetNo3SumRpcArgs = {
  year_id: number;
  no3_id: number;
};

/**
 * استدعاء دالة Postgres `get_no3_sum(p_year_id, p_no3_id)` عبر PostgREST.
 */
export async function getNo3Sum(
  rpcArgs: GetNo3SumRpcArgs,
): Promise<number> {
  const { data, error } = await supabase.rpc("get_no3_sum", {
    p_year_id: rpcArgs.year_id,
    p_no3_id: rpcArgs.no3_id,
  });
  if (error) {
    console.error("Supabase get_no3_sum:", error);
    throw new Error(error.message || "تعذر جلب مجموع النوع");
  }
  return parseRpcNumericResult(data);
}
