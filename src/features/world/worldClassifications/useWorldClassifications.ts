import { useQuery } from "@tanstack/react-query";
import {
  getAll,
  type WorldClassificationRow,
} from "../../../api/apiWorldClassifications";

export function useFetchWorldClassifications() {
  const { isLoading, data, error, isError } = useQuery<WorldClassificationRow[]>({
    queryKey: ["world_classifications"],
    queryFn: getAll,
    retry: false,
  });

  return { isLoading, data, error, isError };
}
