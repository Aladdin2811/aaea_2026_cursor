import { useQuery } from "@tanstack/react-query";
import { getAll, type ExpatriateRow } from "../../api/apiExpatriate";

export function useFetchExpatriate() {
  const { isLoading, data, error, isError } = useQuery<ExpatriateRow[]>({
    queryKey: ["expatriate"],
    queryFn: getAll,
    retry: false,
  });

  return { isLoading, data, error, isError };
}
