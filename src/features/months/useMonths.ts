import { useQuery } from "@tanstack/react-query";
import { getAll, type MonthsRow } from "../../api/apiMonths";

export function useFetchMonths() {
  const { isLoading, data, error, isError } = useQuery<MonthsRow[]>({
    queryKey: ["months"],
    queryFn: () => getAll(),
    retry: false,
  });

  return { isLoading, data, error, isError };
}
