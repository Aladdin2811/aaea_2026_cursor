import { useQuery } from "@tanstack/react-query";
import {
  getAll,
  getBudgetBab,
  getForSelect,
  type BabWithRelations,
} from "../../../api/apiBab";
import { useParams } from "react-router-dom";

export function useFetchBab() {
  const { id } = useParams();
  const { isLoading, data, error, isError } = useQuery<BabWithRelations[]>({
    queryKey: ["bab", "by_general_account", id],
    queryFn: () => getAll(id!),
    enabled: id != null && id !== "",
    retry: false,
  });

  return { isLoading, data, error, isError };
}

export function useBudgetBab() {
  const { isLoading, data, error, isError } = useQuery<BabWithRelations[]>({
    queryKey: ["bab", "budget"],
    queryFn: getBudgetBab,
    retry: false,
  });

  return { isLoading, data, error, isError };
}

export function useBabSelect(generalAccountId: number | string | undefined) {
  const { isLoading, data, error, isError } = useQuery<BabWithRelations[]>({
    queryKey: ["bab", "for_select", generalAccountId],
    queryFn: () => getForSelect(generalAccountId!),
    enabled:
      generalAccountId != null &&
      generalAccountId !== "" &&
      !Number.isNaN(Number(generalAccountId)),
    retry: false,
  });

  return { isLoading, data, error, isError };
}
