import { useQuery } from "@tanstack/react-query";
import {
  getAll,
  type AdditionalBudgetWithRelations,
} from "../../../api/apiAdditionalBudget";

export function useFetchAdditionalBudget() {
  const { isLoading, data, error, isError } = useQuery<
    AdditionalBudgetWithRelations[]
  >({
    queryKey: ["additional_budget"],
    queryFn: getAll,
    retry: false,
  });

  return { isLoading, data, error, isError };
}
