import { useQuery } from "@tanstack/react-query";
import { getAll, type FundingTypeRow } from "../../api/apiFundingType";

export function useFetchFundingType() {
  const { isLoading, data, error, isError } = useQuery<FundingTypeRow[]>({
    queryKey: ["funding_type"],
    queryFn: () => getAll(),
    retry: false,
  });

  return { isLoading, data, error, isError };
}
