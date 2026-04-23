import { supabase } from "../lib/supabase";

export type AccountTypeRow = {
  id: number;
  account_type_name: string | null;
  status: boolean | null;
};

export type CreateAccountTypeInput = {
  account_type_name: string;
  status?: boolean | null;
};

export type UpdateAccountTypeInput = Partial<
  Pick<AccountTypeRow, "account_type_name" | "status">
>;

export async function getAll(): Promise<AccountTypeRow[]> {
  const { data, error } = await supabase
    .from("account_type")
    .select(
      `
      id, 
      account_type_name, 
      status
      `,
    )
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على أنواع الحسابات");
  }
  return (data as AccountTypeRow[] | null) ?? [];
}

export async function createAccountTypeAPI(
  input: CreateAccountTypeInput,
): Promise<unknown> {
  const { data, error } = await supabase.rpc("create_account_type", {
    p_account_type_name: input.account_type_name,
    p_status: input.status ?? null,
  });

  if (error) {
    console.error("Supabase RPC error:", error);
    throw new Error(error.message || "لا يمكن تسجيل نوع حساب جديد");
  }

  return data;
}

export async function deleteAccountType(id: number): Promise<unknown> {
  const { data: related, error: checkError } = await supabase
    .from("journal_details")
    .select("id")
    .eq("account_type_id", id)
    .limit(1);

  if (checkError) {
    console.error(checkError);
    throw new Error("حدث خطأ أثناء التحقق من البيانات المرتبطة");
  }

  if (related && related.length > 0) {
    throw new Error("لا يمكن حذف نوع الحساب لإستخدامه في قيود اليومية");
  }

  const { data, error } = await supabase
    .from("account_type")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف نوع الحساب");
  }
  return data;
}

export async function getById(id: number): Promise<AccountTypeRow> {
  const { data, error } = await supabase
    .from("account_type")
    .select(
      `
      id, 
      account_type_name, 
      status
      `,
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على نوع الحسابات");
  }
  return data as AccountTypeRow;
}

export async function updateAccountType(
  newAccountType: UpdateAccountTypeInput,
  id: number,
): Promise<AccountTypeRow> {
  const { data, error } = await supabase
    .from("account_type")
    .update({ ...newAccountType })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل بيانات نوع الحساب");
  }

  return data as AccountTypeRow;
}
