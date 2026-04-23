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
};

export type No3WithRelations = No3Row & {
  account_type: AccountTypeEmbed | AccountTypeEmbed[] | null;
  general_account: GeneralAccountEmbed | GeneralAccountEmbed[] | null;
  bab: BabEmbed | BabEmbed[] | null;
  band: No3BandEmbed | No3BandEmbed[] | null;
};

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

/**
 * جلب الأنواع المرتبطة بـ `band_id`
 */
export async function getAll(
  bandId: number | string,
): Promise<No3WithRelations[]> {
  const id = parseNumericId(bandId, "البند");

  const { data, error } = await supabase
    .from("no3")
    .select(selectNo3Embed)
    .eq("band_id", id)
    .eq("status", true)
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات الأنواع");
  }
  return (data as unknown as No3WithRelations[] | null) ?? [];
}

export async function getForSelect(
  bandId: number | string,
): Promise<No3WithRelations[]> {
  const id = parseNumericId(bandId, "البند");

  const { data, error } = await supabase
    .from("no3")
    .select(selectNo3Embed)
    .eq("band_id", id)
    .eq("status", true)
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات الأنواع");
  }
  return (data as unknown as No3WithRelations[] | null) ?? [];
}

export async function getById(id: number | string): Promise<No3WithRelations> {
  const rowId = parseNumericId(id, "رقم النوع");

  const { data, error } = await supabase
    .from("no3")
    .select(selectNo3Embed)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات النوع");
  }
  return data as unknown as No3WithRelations;
}
