import { useQuery } from "@tanstack/react-query";
import {
  getAll,
  type ApprovedBudgetsListFilters,
  type ApprovedBudgetsWithRelations,
} from "../../../../api/apiApprovedBudgets";

export function useFetchApprovedBudgets(
  filters?: ApprovedBudgetsListFilters,
  options?: { enabled?: boolean },
) {
  const { isLoading, data, error, isError } = useQuery<
    ApprovedBudgetsWithRelations[]
  >({
    queryKey: ["approved_budgets", filters ?? {}],
    queryFn: () => getAll(filters),
    retry: false,
    enabled: options?.enabled ?? true,
    staleTime: 0,
  });

  return { isLoading, data, error, isError };
}
