import { supabase } from "../lib/supabase";
import type {
  AccountTypeEmbed,
  BabEmbed,
  GeneralAccountEmbed,
} from "./apiBand";
import type { No3BandEmbed } from "./apiNo3";

export type DetailedNo3Embed = {
  id: number;
  no3_name: string | null;
  no3_code: string | null;
};

export type MainTopicEmbed = {
  id: number;
  main_topic_name: string | null;
};

export type DetailedRow = {
  id: number;
  detailed_name: string | null;
  detailed_code: string | null;
  account_type_id: number | null;
  general_account_id: number | null;
  bab_id: number | null;
  band_id: number | null;
  no3_id: number | null;
  description: string | null;
  havebudget: boolean | null;
  haveprograms: boolean | null;
  directexchange: boolean | null;
  salariesdirectpaid: boolean | null;
  status: boolean | null;
  main_topic_id: number | null;
  sort: number | null;
  member_id: number | null;
  nature_of_account: number | null;
};

export type DetailedWithRelations = DetailedRow & {
  account_type: AccountTypeEmbed | AccountTypeEmbed[] | null;
  general_account: GeneralAccountEmbed | GeneralAccountEmbed[] | null;
  bab: BabEmbed | BabEmbed[] | null;
  band: No3BandEmbed | No3BandEmbed[] | null;
  no3: DetailedNo3Embed | DetailedNo3Embed[] | null;
  main_topics: MainTopicEmbed | MainTopicEmbed[] | null;
};

/** صف خفيف لقوائم الاختيار (بدون انضمامات ثقيلة) */
export type DetailedBriefRow = {
  id: number;
  detailed_name: string | null;
  detailed_code: string | null;
};

const selectDetailedBrief = "id, detailed_name, detailed_code";

const selectDetailedEmbed = `
  id,
  detailed_name,
  detailed_code,
  account_type_id,
  general_account_id,
  bab_id,
  band_id,
  no3_id,
  description,
  havebudget,
  haveprograms,
  directexchange,
  salariesdirectpaid,
  status,
  main_topic_id,
  sort,
  member_id,
  nature_of_account,
  account_type ( id, account_type_name ),
  general_account ( id, general_account_name, general_account_code ),
  bab ( id, bab_name, bab_code ),
  band ( id, band_name, band_code ),
  no3 ( id, no3_name, no3_code ),
  main_topics ( id, main_topic_name )
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

/**
 * جلب الحسابات التفصيلية المرتبطة بـ `no3_id`
 */
export async function getAll(
  no3Id: number | string,
): Promise<DetailedWithRelations[]> {
  const id = parseNumericId(no3Id, "النوع");

  const { data, error } = await supabase
    .from("detailed")
    .select(selectDetailedEmbed)
    .eq("no3_id", id)
    .eq("status", true)
    .order("sort", { ascending: true, nullsFirst: false })
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات الحسابات التفصيلية");
  }
  return (data as unknown as DetailedWithRelations[] | null) ?? [];
}

export async function getForSelect(
  no3Id: number | string,
): Promise<DetailedWithRelations[]> {
  const id = parseNumericId(no3Id, "النوع");

  const { data, error } = await supabase
    .from("detailed")
    .select(selectDetailedEmbed)
    .eq("no3_id", id)
    .eq("status", true)
    .order("sort", { ascending: true, nullsFirst: false })
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات الحسابات التفصيلية");
  }
  return (data as unknown as DetailedWithRelations[] | null) ?? [];
}

/** حسابات تفصيلية مفعّلة لنوع معيّن — للقوائم المنسدلة فقط */
export async function getBriefForSelect(
  no3Id: number | string,
): Promise<DetailedBriefRow[]> {
  const id = parseNumericId(no3Id, "النوع");

  const { data, error } = await supabase
    .from("detailed")
    .select(selectDetailedBrief)
    .eq("no3_id", id)
    .eq("status", true)
    .order("sort", { ascending: true, nullsFirst: false })
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على الحسابات التفصيلية");
  }
  return (data as unknown as DetailedBriefRow[] | null) ?? [];
}

export async function getById(
  id: number | string,
): Promise<DetailedWithRelations> {
  const rowId = parseNumericId(id, "رقم الحساب التفصيلي");

  const { data, error } = await supabase
    .from("detailed")
    .select(selectDetailedEmbed)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات الحساب التفصيلي");
  }
  return data as unknown as DetailedWithRelations;
}
