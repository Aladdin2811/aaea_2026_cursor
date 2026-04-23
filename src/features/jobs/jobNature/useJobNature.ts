import { useQuery } from "@tanstack/react-query";
import { getAll, type JobNatureRow } from "../../../api/apiJobNature";

export function useFetchJobNature() {
  const { isLoading, data, error, isError } = useQuery<JobNatureRow[]>({
    queryKey: ["job_nature"],
    queryFn: getAll,
    retry: false,
  });

  return { isLoading, data, error, isError };
}
