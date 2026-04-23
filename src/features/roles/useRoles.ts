import { useQuery } from "@tanstack/react-query";
import { getAll, type RolesRow } from "../../api/apiRoles";

export function useFetchRoles() {
  const { isLoading, data, error, isError } = useQuery<RolesRow[]>({
    queryKey: ["roles"],
    queryFn: getAll,
    retry: false,
  });

  return { isLoading, data, error, isError };
}
