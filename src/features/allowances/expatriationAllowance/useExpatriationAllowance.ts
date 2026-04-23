import { useQuery } from "@tanstack/react-query";
import {
  getAll,
  type ExpatriationAllowanceRow,
} from "../../../api/apiExpatriationAllowance";

export function useFetchExpatriationAllowance() {
  const { isLoading, data, error, isError } = useQuery<
    ExpatriationAllowanceRow[]
  >({
    queryKey: ["expatriation_allowance"],
    queryFn: getAll,
    retry: false,
  });

  return { isLoading, data, error, isError };
}
