import { supabase } from "../lib/supabase";

export type BabRow = {
  id: number;
  bab_name: string | null;
  bab_code: string | null;
  account_type_id: number | null;
  general_account_id: number | null;
  description: string | null;
  havebudget: boolean | null;
  haveprograms: boolean | null;
  status: string | null;
};

export type AccountTypeEmbed = {
  id: number;
  account_type_name: string | null;
};

export type GeneralAccountEmbed = {
  id: number;
  general_account_name: string | null;
  general_account_code: string | null;
};

export type BabWithRelations = BabRow & {
  account_type: AccountTypeEmbed | AccountTypeEmbed[] | null;
  general_account: GeneralAccountEmbed | GeneralAccountEmbed[] | null;
};

const selectBabEmbed = `
  id, 
  bab_name, 
  bab_code, 
  account_type_id, 
  general_account_id, 
  description, 
  havebudget, 
  haveprograms, 
  status,
  account_type (
    id, 
    account_type_name
  ),
  general_account (
    id, 
    general_account_name,
    general_account_code
  )
`;

function parseNumericId(value: number | string, fieldLabel = "المعرّف"): number {
  const n = typeof value === "string" ? Number(value) : value;
  if (typeof n !== "number" || !Number.isFinite(n)) {
    throw new Error(`${fieldLabel} غير صالح`);
  }
  return n;
}

/**
 * جلب أبواب محاسبية مرتبطة بـ `general_account_id`
 */
export async function getAll(
  generalAccountId: number | string,
): Promise<BabWithRelations[]> {
  const gid = parseNumericId(generalAccountId, "الحساب العام");

  const { data, error } = await supabase
    .from("bab")
    .select(selectBabEmbed)
    .eq("general_account_id", gid)
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات الأبواب");
  }
  return (data as unknown as BabWithRelations[] | null) ?? [];
}

/**
 * لقوائم الاختيار: فعّال + مرتبط بالحساب العام
 * (يُفترض أن `status` منطقي في القاعدة؛ غيّر الفلتر إن كان نصياً)
 */
export async function getForSelect(
  generalAccountId: number | string,
): Promise<BabWithRelations[]> {
  const gid = parseNumericId(generalAccountId, "الحساب العام");

  const { data, error } = await supabase
    .from("bab")
    .select(selectBabEmbed)
    .eq("general_account_id", gid)
    .eq("status", true)
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات الأبواب");
  }
  return (data as unknown as BabWithRelations[] | null) ?? [];
}

export async function getBudgetBab(): Promise<BabWithRelations[]> {
  const { data, error } = await supabase
    .from("bab")
    .select(
      `
      id, 
      bab_name, 
      bab_code, 
      account_type_id, 
      general_account_id, 
      description, 
      havebudget, 
      haveprograms, 
      status,
      account_type ( id, account_type_name ),
      general_account ( id, general_account_code, general_account_name )
      `,
    )
    .eq("havebudget", true)
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات الأبواب");
  }
  return (data as unknown as BabWithRelations[] | null) ?? [];
}

export async function getById(
  id: number | string,
): Promise<BabWithRelations> {
  const rowId = parseNumericId(id, "رقم الباب");

  const { data, error } = await supabase
    .from("bab")
    .select(selectBabEmbed)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات الباب");
  }
  return data as unknown as BabWithRelations;
}

export async function deleteBab(id: number | string): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم الباب");

  const { data: related, error: checkError } = await supabase
    .from("journal_details")
    .select("id")
    .eq("bab", rowId)
    .limit(1);

  if (checkError) {
    console.error(checkError);
    throw new Error("حدث خطأ أثناء التحقق من البيانات المرتبطة");
  }

  if (related && related.length > 0) {
    throw new Error("لا يمكن حذف الباب لإستخدامه في قيود اليومية");
  }

  const { data, error } = await supabase
    .from("bab")
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف الباب");
  }
  return data;
}
