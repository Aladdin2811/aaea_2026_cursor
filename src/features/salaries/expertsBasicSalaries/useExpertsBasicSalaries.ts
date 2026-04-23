import { useQuery } from "@tanstack/react-query";
import {
  getAll,
  type ExpertsBasicSalariesRow,
} from "../../../api/apiExpertsBasicSalaries";

export function useFetchExpertsBasicSalaries() {
  const { isLoading, data, error, isError } = useQuery<
    ExpertsBasicSalariesRow[]
  >({
    queryKey: ["experts_basic_salaries"],
    queryFn: getAll,
    retry: false,
  });

  return { isLoading, data, error, isError };
}
