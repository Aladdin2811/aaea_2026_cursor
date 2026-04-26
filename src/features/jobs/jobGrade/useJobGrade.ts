import { useQuery } from "@tanstack/react-query";
import { getAll, type JobGradeRow } from "../../../api/apiJobGrade";

export function useFetchJobGrade() {
  const { isLoading, data, error, isError } = useQuery<JobGradeRow[]>({
    queryKey: ["job_grade"],
    queryFn: () => getAll(),
    retry: false,
  });

  return { isLoading, data, error, isError };
}
