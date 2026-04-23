import { useQuery } from "@tanstack/react-query";
import {
  getAll,
  type ContractorsBasicSalariesRow,
} from "../../../api/apiContractorsBasicSalaries";

export function useFetchContractorsBasicSalaries() {
  const { isLoading, data, error, isError } = useQuery<
    ContractorsBasicSalariesRow[]
  >({
    queryKey: ["contractors_basic_salaries"],
    queryFn: getAll,
    retry: false,
  });

  return { isLoading, data, error, isError };
}
