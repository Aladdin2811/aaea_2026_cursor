import { useQuery } from "@tanstack/react-query";
import { getAll, type JobTitleRow } from "../../../api/apiJobTitle";

export function useFetchJobTitle() {
  const { isLoading, data, error, isError } = useQuery<JobTitleRow[]>({
    queryKey: ["job_title"],
    queryFn: getAll,
    retry: false,
  });

  return { isLoading, data, error, isError };
}
