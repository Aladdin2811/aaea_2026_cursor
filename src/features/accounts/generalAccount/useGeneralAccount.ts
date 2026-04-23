import { useQuery } from "@tanstack/react-query";
import {
  getAll,
  getAllNoId,
  type GeneralAccountWithType,
} from "../../../api/apiGeneralAccount";
import { useParams } from "react-router-dom";

export function useFetchGeneralAccount() {
  const { id } = useParams();
  const { isLoading, data, error, isError } = useQuery<GeneralAccountWithType[]>({
    queryKey: ["general_account", "by_type", id],
    queryFn: () => getAll(id!),
    enabled: id != null && id !== "",
    retry: false,
  });

  return { isLoading, data, error, isError };
}

export function useFetchGeneralAccountNoId() {
  const { isLoading, data, error, isError } = useQuery<GeneralAccountWithType[]>({
    queryKey: ["general_account", "all"],
    queryFn: () => getAllNoId(),
    retry: false,
  });

  return { isLoading, data, error, isError };
}

export function useGeneralAccountSelect(accountTypeId: number | string | undefined) {
  const { isLoading, data, error, isError } = useQuery<GeneralAccountWithType[]>({
    queryKey: ["general_account", "by_type", accountTypeId],
    queryFn: () => getAll(accountTypeId!),
    enabled:
      accountTypeId != null &&
      accountTypeId !== "" &&
      !Number.isNaN(Number(accountTypeId)),
    retry: false,
  });

  return { isLoading, data, error, isError };
}
