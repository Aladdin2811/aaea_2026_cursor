import { useQuery } from "@tanstack/react-query";
import { getAll, type CurrencyRow } from "../../api/apiCurrency";

export function useFetchCurrency() {
  const { isLoading, data, error, isError } = useQuery<CurrencyRow[]>({
    queryKey: ["currency"],
    queryFn: getAll,
    retry: false,
  });

  return { isLoading, data, error, isError };
}
