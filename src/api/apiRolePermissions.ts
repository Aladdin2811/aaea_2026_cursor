import { supabase } from "../lib/supabase";

export type PermissionRow = {
  id: number;
  code: string;
  label_ar: string | null;
};

export type RolePermissionRow = {
  permission_id: number;
  active: boolean;
};

export async function listPermissions(): Promise<PermissionRow[]> {
  const { data, error } = await supabase
    .from("permissions")
    .select("id, code, label_ar")
    .order("code", { ascending: true });

  if (error) {
    console.error(error);
    throw new Error("تعذّر تحميل قائمة الصلاحيات");
  }
  return (data as PermissionRow[] | null) ?? [];
}

export async function listRolePermissions(
  roleId: number,
): Promise<RolePermissionRow[]> {
  const { data, error } = await supabase
    .from("role_permissions")
    .select("permission_id, active")
    .eq("role_id", roleId);

  if (error) {
    console.error(error);
    throw new Error("تعذّر تحميل صلاحيات الدور");
  }
  return (data as RolePermissionRow[] | null) ?? [];
}

export async function upsertRolePermissionActive(params: {
  roleId: number;
  permissionId: number;
  active: boolean;
}): Promise<void> {
  const { roleId, permissionId, active } = params;
  const { error } = await supabase
    .from("role_permissions")
    .upsert(
      {
        role_id: roleId,
        permission_id: permissionId,
        active,
      },
      { onConflict: "role_id,permission_id" },
    );

  if (error) {
    console.error(error);
    throw new Error("تعذّر تحديث حالة الصلاحية لهذا الدور");
  }
}

export async function upsertRolePermissionsActiveBulk(params: {
  roleId: number;
  permissionIds: number[];
  active: boolean;
}): Promise<void> {
  const { roleId, permissionIds, active } = params;
  if (permissionIds.length === 0) return;

  const payload = permissionIds.map((permissionId) => ({
    role_id: roleId,
    permission_id: permissionId,
    active,
  }));

  const { error } = await supabase
    .from("role_permissions")
    .upsert(payload, { onConflict: "role_id,permission_id" });

  if (error) {
    console.error(error);
    throw new Error("تعذّر تحديث مجموعة الصلاحيات لهذا الدور");
  }
}
