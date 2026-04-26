import { supabase } from "../lib/supabase";

export type UserProfileRole = {
  id: number;
  role_name: string | null;
  description: string | null;
};

export type UserProfileRow = {
  id: string;
  email: string | null;
  full_name: string;
  role_id: number | null;
  created_at: string;
  roles: UserProfileRole | null;
};

const profileSelect =
  "id, email, full_name, role_id, created_at, roles!user_profiles_role_id_fkey ( id, role_name, description )";

export async function listUserProfiles(): Promise<UserProfileRow[]> {
  const { data, error } = await supabase
    .from("user_profiles")
    .select(profileSelect)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase user_profiles:", error);
    throw new Error(
      error.code === "42P01"
        ? "جدول user_profiles غير موجود. نفّذ ملف الهجرة في مجلد supabase/migrations من لوحة Supabase."
        : "تعذر تحميل قائمة المستخدمين",
    );
  }

  const rows = (data as unknown as UserProfileRow[] | null) ?? [];
  return rows.map((r) => ({
    ...r,
    roles: Array.isArray(r.roles) ? r.roles[0] ?? null : r.roles,
  }));
}

export async function getUserProfileForUser(
  userId: string,
): Promise<UserProfileRow | null> {
  const { data, error } = await supabase
    .from("user_profiles")
    .select(profileSelect)
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Supabase user_profiles:", error);
    throw new Error("تعذر تحميل ملف المستخدم");
  }

  if (!data) return null;
  const row = data as unknown as UserProfileRow;
  return {
    ...row,
    roles: Array.isArray(row.roles) ? row.roles[0] ?? null : row.roles,
  };
}

export async function updateUserProfileRole(
  userId: string,
  roleId: number | null,
): Promise<void> {
  const { error } = await supabase
    .from("user_profiles")
    .update({ role_id: roleId })
    .eq("id", userId);

  if (error) {
    console.error("Supabase update user_profiles:", error);
    throw new Error("تعذر تحديث صلاحية المستخدم");
  }
}
