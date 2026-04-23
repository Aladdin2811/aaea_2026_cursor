import { useQuery } from "@tanstack/react-query";
import { getAll, type JobCategoryRow } from "../../../api/apiJobCategory";

export function useFetchJobCategory() {
  const { isLoading, data, error, isError } = useQuery<JobCategoryRow[]>({
    queryKey: ["job_category"],
    queryFn: getAll,
    retry: false,
  });

  return { isLoading, data, error, isError };
}
