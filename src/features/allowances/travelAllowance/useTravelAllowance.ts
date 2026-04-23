import { useQuery } from "@tanstack/react-query";
import {
  getAll,
  type TravelAllowanceRow,
} from "../../../api/apiTravelAllowance";

export function useFetchTravelAllowance() {
  const { isLoading, data, error, isError } = useQuery<TravelAllowanceRow[]>({
    queryKey: ["travel_allowance"],
    queryFn: getAll,
    retry: false,
  });

  return { isLoading, data, error, isError };
}
