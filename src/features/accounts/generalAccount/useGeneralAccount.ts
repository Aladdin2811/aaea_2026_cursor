import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createGeneralAccount,
  deleteGeneralAccount,
  getAll,
  getAllNoId,
  type UpdateGeneralAccountInput,
  updateGeneralAccount,
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

export function useCreateGeneralAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createGeneralAccount,
    onSuccess: () => {
      toast.success("تمت إضافة الحساب العام بنجاح");
      void qc.invalidateQueries({ queryKey: ["general_account"] });
    },
    onError: (err: Error) => toast.error(err?.message || "تعذرت إضافة الحساب العام"),
  });
}

export function useUpdateGeneralAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      patch,
    }: {
      id: number;
      patch: UpdateGeneralAccountInput;
    }) => updateGeneralAccount(id, patch),
    onSuccess: () => {
      toast.success("تم تعديل الحساب العام بنجاح");
      void qc.invalidateQueries({ queryKey: ["general_account"] });
    },
    onError: (err: Error) => toast.error(err?.message || "تعذر تعديل الحساب العام"),
  });
}

export function useDeleteGeneralAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteGeneralAccount(id),
    onSuccess: () => {
      toast.success("تم حذف الحساب العام بنجاح");
      void qc.invalidateQueries({ queryKey: ["general_account"] });
    },
    onError: (err: Error) => toast.error(err?.message || "تعذر حذف الحساب العام"),
  });
}
