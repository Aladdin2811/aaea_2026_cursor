import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabase";
import {
  getAll,
  type MembersApprovedQuotasListFilters,
  type MembersApprovedQuotasWithRelations,
} from "../../../api/apiMembersApprovedQuotas";

export function useFetchMembersApprovedQuotas(
  filters?: MembersApprovedQuotasListFilters,
  options?: { enabled?: boolean },
) {
  const { isLoading, data, error, isError } = useQuery<
    MembersApprovedQuotasWithRelations[]
  >({
    queryKey: ["members_approved_quotas", filters ?? {}],
    queryFn: () => getAll(filters),
    enabled: options?.enabled ?? true,
  });

  return { isLoading, data, error, isError };
}

export function useFetchTotalMemberApprovedQuota(memberId?: number | string | null) {
  const { isLoading, data, error } = useQuery({
    queryKey: ["total_member_approved_quota", memberId ?? null],
    queryFn: async () => {
      const { data, error } = await supabase.rpc(
        "get_total_approved_quota_by_member",
        {
          p_member_id: memberId,
        },
      );
      if (error) throw error;
      return data;
    },
    retry: false,
    enabled: memberId != null && memberId !== "",
  });

  return { isLoading, data, error };
}
