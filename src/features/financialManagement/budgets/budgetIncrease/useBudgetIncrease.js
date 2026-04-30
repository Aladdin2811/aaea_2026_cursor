import { useQuery } from "@tanstack/react-query";
import { getAll } from "../../../services/apiBudgetIncrease";

export function useFetchBudgetIncrease() {
  const { isLoading, data, error } = useQuery({
    queryKey: ["budget_increase"],
    queryFn: getAll,
    retry: false,
  });

  return { isLoading, data, error };
}
