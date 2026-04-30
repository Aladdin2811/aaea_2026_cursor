import { useQuery } from "@tanstack/react-query";
import { getAll } from "../../../services/apiTransfers";

export function useFetchTransfers() {
  const { isLoading, data, error } = useQuery({
    queryKey: ["transfers"],
    queryFn: getAll,
    retry: false,
  });

  return { isLoading, data, error };
}
