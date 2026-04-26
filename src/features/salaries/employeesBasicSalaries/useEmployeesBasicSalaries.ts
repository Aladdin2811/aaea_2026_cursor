import { useQuery } from "@tanstack/react-query";
import {
  getAll,
  type EmployeesBasicSalariesRow,
} from "../../../api/apiEmployeesBasicSalaries";

export function useFetchEmployeesBasicSalaries() {
  const { isLoading, data, error, isError } = useQuery<
    EmployeesBasicSalariesRow[]
  >({
    queryKey: ["employees_basic_salaries"],
    queryFn: () => getAll(),
    retry: false,
  });

  return { isLoading, data, error, isError };
}
