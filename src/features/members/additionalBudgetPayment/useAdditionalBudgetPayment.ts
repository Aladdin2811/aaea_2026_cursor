import { useQuery } from "@tanstack/react-query";
import {
  getAll,
  type AdditionalBudgetPaymentWithRelations,
} from "../../../api/apiAdditionalBudgetPayment";

export function useFetchAdditionalBudgetPayment() {
  const { isLoading, data, error, isError } = useQuery<
    AdditionalBudgetPaymentWithRelations[]
  >({
    queryKey: ["additional_budget_payment"],
    queryFn: getAll,
    retry: false,
  });

  return { isLoading, data, error, isError };
}
