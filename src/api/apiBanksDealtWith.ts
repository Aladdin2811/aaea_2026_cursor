import { supabase } from "../lib/supabase";
import type { AccountTypeEmbed } from "./apiBand";

export type BanksDealtWithCurrencyEmbed = {
  id: number;
  currency_name: string | null;
  status: boolean | null;
};

export type BanksDealtWithRow = {
  id: number;
  bank_name: string | null;
  account_type_id: number | null;
  currency_id: number | null;
  account_number: string | null;
  status: boolean | null;
  old_id: number | null;
};

export type BanksDealtWithWithRelations = BanksDealtWithRow & {
  account_type: AccountTypeEmbed | AccountTypeEmbed[] | null;
  currency:
    | BanksDealtWithCurrencyEmbed
    | BanksDealtWithCurrencyEmbed[]
    | null;
};

export type CreateBanksDealtWithInput = Partial<
  Omit<BanksDealtWithRow, "id">
> & {
  id?: number;
};

export type UpdateBanksDealtWithInput = Partial<
  Omit<BanksDealtWithRow, "id">
>;

export type BanksDealtWithListFilters = {
  account_type_id?: number | string;
  currency_id?: number | string;
  activeOnly?: boolean;
};

const tableName = "banks_dealt_with" as const;

const selectBanksDealtWithEmbed = `
  id,
  bank_name,
  account_type_id,
  currency_id,
  account_number,
  status,
  old_id,
  account_type ( id, account_type_name ),
  currency ( id, currency_name, status )
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

async function nextBanksDealtWithId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف للبنك");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(
  filters?: BanksDealtWithListFilters,
): Promise<BanksDealtWithWithRelations[]> {
  let query = supabase
    .from(tableName)
    .select(selectBanksDealtWithEmbed)
    .order("id", { ascending: true });

  if (filters?.account_type_id != null) {
    query = query.eq(
      "account_type_id",
      parseNumericId(filters.account_type_id, "نوع الحساب"),
    );
  }
  if (filters?.currency_id != null) {
    query = query.eq(
      "currency_id",
      parseNumericId(filters.currency_id, "العملة"),
    );
  }
  if (filters?.activeOnly === true) {
    query = query.eq("status", true);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات البنوك المتعامل معها");
  }
  return (data as unknown as BanksDealtWithWithRelations[] | null) ?? [];
}

export async function getById(
  id: number | string,
): Promise<BanksDealtWithWithRelations> {
  const rowId = parseNumericId(id, "رقم البنك");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectBanksDealtWithEmbed)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات البنك");
  }
  return data as unknown as BanksDealtWithWithRelations;
}

export async function createBanksDealtWith(
  input: CreateBanksDealtWithInput,
): Promise<BanksDealtWithWithRelations> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextBanksDealtWithId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectBanksDealtWithEmbed)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل البنك");
  }
  return data as unknown as BanksDealtWithWithRelations;
}

export async function updateBanksDealtWith(
  id: number | string,
  patch: UpdateBanksDealtWithInput,
): Promise<BanksDealtWithWithRelations> {
  const rowId = parseNumericId(id, "رقم البنك");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectBanksDealtWithEmbed)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل بيانات البنك");
  }
  return data as unknown as BanksDealtWithWithRelations;
}

export async function deleteBanksDealtWith(
  id: number | string,
): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم البنك");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف البنك");
  }
  return data;
}
