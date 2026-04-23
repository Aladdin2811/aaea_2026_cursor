import { useQuery } from "@tanstack/react-query";
import { getAll, type GenderRow } from "../../api/apiGender";

export function useFetchGender() {
  const { isLoading, data, error, isError } = useQuery<GenderRow[]>({
    queryKey: ["gender"],
    queryFn: getAll,
    retry: false,
  });

  return { isLoading, data, error, isError };
}
