import { supabase } from "../lib/supabase";

export type RolesRow = {
  id: number;
  role_name: string | null;
  description: string | null;
  status: boolean | null;
};

const selectRoles = "id, role_name, description, status";

export async function getAll(): Promise<RolesRow[]> {
  const { data, error } = await supabase
    .from("roles")
    .select(selectRoles)
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات الصلاحيات");
  }
  return (data as unknown as RolesRow[] | null) ?? [];
}
