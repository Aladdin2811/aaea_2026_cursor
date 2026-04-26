import { useQuery } from "@tanstack/react-query";
import {
  getAll,
  type LivingCostIncreaseRow,
} from "../../../api/apiLivingCostIncrease";

export function useFetchLivingCostIncrease() {
  const { isLoading, data, error, isError } = useQuery<LivingCostIncreaseRow[]>(
    {
      queryKey: ["living_cost_increase"],
      queryFn: () => getAll(),
      retry: false,
    },
  );

  return { isLoading, data, error, isError };
}
