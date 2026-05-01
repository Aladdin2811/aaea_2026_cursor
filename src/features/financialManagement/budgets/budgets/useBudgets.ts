import { useQuery } from "@tanstack/react-query";
import {
  getAll,
  type BudgetsListFilters,
  type BudgetsWithRelations,
} from "../../../../api/apiBudgets";

export function useFetchBudgets(
  filters?: BudgetsListFilters,
  options?: { enabled?: boolean },
) {
  const { isLoading, data, error, isError } = useQuery<BudgetsWithRelations[]>({
    queryKey: ["budgets", filters ?? {}],
    queryFn: () => getAll(filters),
    retry: false,
    enabled: options?.enabled ?? true,
    staleTime: 0,
  });

  return { isLoading, data, error, isError };
}
