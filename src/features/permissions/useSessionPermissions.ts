import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { listMyPermissionCodes } from "../../api/apiPermissions";
import { ENABLE_PATH_PERMISSION_CHECK } from "../../config/accessPolicy";
import { useUser } from "../authentication/useUser";

/** لإبطال التخزين المؤقت بعد تغيير أدوار المستخدم (للمستخدم الحالي). */
export const MY_PERMISSION_CODES_QUERY_KEY = "my-permission-codes" as const;

export function useSessionPermissions() {
  const { user, isLoading: userLoading } = useUser();
  const uid = user?.id;
  const enabled = ENABLE_PATH_PERMISSION_CHECK && Boolean(uid);

  const query = useQuery({
    queryKey: [MY_PERMISSION_CODES_QUERY_KEY, uid],
    queryFn: listMyPermissionCodes,
    enabled,
    staleTime: 60 * 1000,
  });

  const codes = useMemo(() => {
    if (!enabled) return [];
    return query.data ?? [];
  }, [enabled, query.data]);

  const codeSet = useMemo(() => new Set(codes), [codes]);

  return {
    codes,
    codeSet,
    isLoading: enabled && (userLoading || query.isLoading),
    isError: enabled && query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
