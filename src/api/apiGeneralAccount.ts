import { supabase } from "../lib/supabase";

export type GeneralAccountRow = {
  id: number;
  general_account_name: string | null;
  general_account_code: string | null;
  account_type_id: number | null;
  description: string | null;
  notes: string | null;
  status: boolean | null;
  sort: number | null;
  nature_of_account: number | null;
};

/** صف مُرتبط من `account_type` عند الاستعلام */
export type AccountTypeEmbed = {
  id: number;
  account_type_name: string | null;
};

export type GeneralAccountWithType = GeneralAccountRow & {
  /** PostgREST قد يُرجع كائناً أو مصفوفة حسب العلاقة */
  account_type: AccountTypeEmbed | AccountTypeEmbed[] | null;
};
export type CreateGeneralAccountInput = Partial<Omit<GeneralAccountRow, "id">> & {
  id?: number;
};
export type UpdateGeneralAccountInput = Partial<Omit<GeneralAccountRow, "id">>;

const tableName = "general_account" as const;

const selectWithType = `
  id, 
  general_account_name, 
  general_account_code, 
  account_type_id, 
  description, 
  notes,
  status,
  sort,
  nature_of_account,
  account_type (
    id, 
    account_type_name
  )
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
 * جلب الحسابات العامة مرتبطة بـ `account_type_id`
 */
export async function getAll(
  accountTypeId: number | string,
): Promise<GeneralAccountWithType[]> {
  const id = parseNumericId(accountTypeId, "نوع الحساب");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectWithType)
    .eq("account_type_id", id)
    .order("sort", { ascending: true, nullsFirst: false })
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات الحسابات العامة");
  }
  return (data as unknown as GeneralAccountWithType[] | null) ?? [];
}

export async function getAllNoId(): Promise<GeneralAccountWithType[]> {
  const { data, error } = await supabase
    .from(tableName)
    .select(selectWithType)
    .order("sort", { ascending: true, nullsFirst: false })
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات الحسابات العامة");
  }
  return (data as unknown as GeneralAccountWithType[] | null) ?? [];
}

export async function getById(
  id: number | string,
): Promise<GeneralAccountWithType> {
  const rowId = parseNumericId(id, "رقم الحساب العام");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectWithType)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات الحساب العام");
  }
  return data as unknown as GeneralAccountWithType;
}

export async function createGeneralAccount(
  input: CreateGeneralAccountInput,
): Promise<GeneralAccountWithType> {
  const payload = { ...input };
  delete payload.id;
  const { data, error } = await supabase
    .from(tableName)
    .insert(payload)
    .select(selectWithType)
    .single();
  if (error) {
    console.error(error);
    throw new Error("لا يمكن إضافة الحساب العام");
  }
  return data as unknown as GeneralAccountWithType;
}

export async function updateGeneralAccount(
  id: number | string,
  patch: UpdateGeneralAccountInput,
): Promise<GeneralAccountWithType> {
  const rowId = parseNumericId(id, "رقم الحساب العام");
  const { data, error } = await supabase
    .from(tableName)
    .update(patch)
    .eq("id", rowId)
    .select(selectWithType)
    .single();
  if (error) {
    console.error(error);
    throw new Error("لا يمكن تعديل الحساب العام");
  }
  return data as unknown as GeneralAccountWithType;
}

export async function deleteGeneralAccount(id: number | string): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم الحساب العام");
  const { data, error } = await supabase.from(tableName).delete().eq("id", rowId);
  if (error) {
    console.error(error);
    throw new Error("لا يمكن حذف الحساب العام");
  }
  return data;
}
