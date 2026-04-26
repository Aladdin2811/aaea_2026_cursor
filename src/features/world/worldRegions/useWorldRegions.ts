import { useQuery } from "@tanstack/react-query";
import { getAll, type WorldRegionRow } from "../../../api/apiWorldRegions";

export function useFetchWorldRegions() {
  const { isLoading, data, error, isError } = useQuery<WorldRegionRow[]>({
    queryKey: ["world_regions"],
    queryFn: () => getAll(),
    retry: false,
  });

  return { isLoading, data, error, isError };
}
