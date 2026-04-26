import { useQuery } from "@tanstack/react-query";
import { getAll, type NatureOfWorkRow } from "../../../api/apiNatureOfWork";

export function useFetchNatureOfWork() {
  const { isLoading, data, error, isError } = useQuery<NatureOfWorkRow[]>({
    queryKey: ["nature_of_work"],
    queryFn: () => getAll(),
    retry: false,
  });

  return { isLoading, data, error, isError };
}
