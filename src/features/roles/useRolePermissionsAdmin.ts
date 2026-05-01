import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  listPermissions,
  listRolePermissions,
  upsertRolePermissionActive,
  upsertRolePermissionsActiveBulk,
  type PermissionRow,
  type RolePermissionRow,
} from "../../api/apiRolePermissions";

export function usePermissionsCatalog() {
  const query = useQuery<PermissionRow[]>({
    queryKey: ["permissions-catalog"],
    queryFn: listPermissions,
    retry: false,
  });
  return query;
}

export function useRolePermissions(roleId: number | null) {
  const query = useQuery<RolePermissionRow[]>({
    queryKey: ["role-permissions", roleId],
    queryFn: () => listRolePermissions(roleId as number),
    enabled: roleId != null,
    retry: false,
  });
  return query;
}

export function useToggleRolePermission(roleId: number | null) {
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({
      permissionId,
      active,
    }: {
      permissionId: number;
      active: boolean;
    }) => {
      if (roleId == null) throw new Error("لم يتم تحديد دور");
      return upsertRolePermissionActive({
        roleId,
        permissionId,
        active,
      });
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["role-permissions", roleId] });
    },
    onError: (err: Error) => {
      toast.error(err?.message || "حدث خطأ أثناء تحديث الصلاحية");
    },
  });
  return mutation;
}

export function useBulkSetRolePermissions(roleId: number | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      permissionIds,
      active,
    }: {
      permissionIds: number[];
      active: boolean;
    }) => {
      if (roleId == null) throw new Error("لم يتم تحديد دور");
      return upsertRolePermissionsActiveBulk({ roleId, permissionIds, active });
    },
    onSuccess: (_, vars) => {
      void qc.invalidateQueries({ queryKey: ["role-permissions", roleId] });
      toast.success(
        vars.active ? "تم تفعيل الصلاحيات المحددة" : "تم تعطيل الصلاحيات المحددة",
      );
    },
    onError: (err: Error) => {
      toast.error(err?.message || "حدث خطأ أثناء تحديث الصلاحيات");
    },
  });
}
