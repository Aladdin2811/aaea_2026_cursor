import { useQuery } from "@tanstack/react-query";
import {
  getAll,
  type MembersContributionsListFilters,
  type MembersContributionsWithRelations,
} from "../../../api/apiMembersContributions";

export function useFetchMembersContributions(
  filters?: MembersContributionsListFilters,
  options?: { enabled?: boolean },
) {
  const { isLoading, data, error, isError } = useQuery<
    MembersContributionsWithRelations[]
  >({
    queryKey: ["members_contributions", filters ?? {}],
    queryFn: () => getAll(filters),
    enabled: options?.enabled ?? true,
    staleTime: 0,
  });

  return { isLoading, data, error, isError };
}
