import { supabase } from "../lib/supabase";

/**
 * أكواد الصلاحيات الفعّالة للمستخدم الحالي (اتحاد كل أدواره عبر `user_roles`).
 * يعتمد على دالة SQL `list_my_permission_codes` (SECURITY DEFINER).
 */
export async function listMyPermissionCodes(): Promise<string[]> {
  const { data, error } = await supabase.rpc("list_my_permission_codes");

  if (error) {
    if (
      error.code === "PGRST202" ||
      error.message?.includes("Could not find the function")
    ) {
      throw new Error(
        "دالة list_my_permission_codes غير موجودة. نفّذ ملف الهجرة 20260501130000_permissions_user_roles.sql في Supabase.",
      );
    }
    throw new Error(error.message || "تعذر تحميل صلاحيات المستخدم");
  }

  const rows = (data as { code: string }[] | null) ?? [];
  return rows.map((r) => r.code).filter(Boolean);
}
