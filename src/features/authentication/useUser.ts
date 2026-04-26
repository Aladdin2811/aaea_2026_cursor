import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import type { User } from "@supabase/supabase-js";
import { getSessionUserWithProfile } from "../../api/apiAuth";
import { supabase } from "../../lib/supabase";
import { canManageUsers } from "../../config/roleAccess";

function roleIdFromMetadata(user: User | null): number | null {
  if (!user?.user_metadata) return null;
  const m = user.user_metadata as Record<string, unknown>;
  const raw = m.role_id ?? m.appRole;
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string") {
    const n = Number.parseInt(raw, 10);
    return Number.isNaN(n) ? null : n;
  }
  return null;
}

export function useUser() {
  const queryClient = useQueryClient();

  const { isLoading, data } = useQuery({
    queryKey: ["user"],
    queryFn: getSessionUserWithProfile,
  });

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void queryClient.invalidateQueries({ queryKey: ["user"] });
    });
    return () => subscription.unsubscribe();
  }, [queryClient]);

  const user = data?.user ?? null;
  const profile = data?.profile ?? null;

  const roleId = useMemo(
    () => profile?.role_id ?? roleIdFromMetadata(user),
    [profile?.role_id, user],
  );

  const roleName = useMemo(() => {
    if (profile?.roles?.role_name) return profile.roles.role_name;
    if (!user?.user_metadata) return null;
    const m = user.user_metadata as Record<string, unknown>;
    return typeof m.appRole === "string" ? m.appRole : null;
  }, [profile?.roles?.role_name, user]);

  const canManageUsersFlag = useMemo(() => canManageUsers(roleId), [roleId]);

  return {
    isLoading,
    user,
    profile,
    roleId,
    roleName,
    isAuthenticated: Boolean(user),
    canManageUsers: canManageUsersFlag,
  };
}
