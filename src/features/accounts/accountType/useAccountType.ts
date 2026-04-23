import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getAll,
  createAccountTypeAPI,
  deleteAccountType as deleteAccountTypeAPI,
  updateAccountType as updateAccountTypeAPI,
  getById,
  type UpdateAccountTypeInput,
  type AccountTypeRow,
} from "../../../api/apiAccountType";

export function useCreateAccountType() {
  const queryClient = useQueryClient();

  const { mutate: createAccountType, isPending: isCreating } = useMutation({
    mutationFn: createAccountTypeAPI,
    onSuccess: () => {
      toast.success("تم تسجيل نوع حساب جديد بنجاح");
      void queryClient.invalidateQueries({ queryKey: ["account_type"] });
    },
    onError: (err: Error) => {
      toast.error(err?.message || "حدث خطأ");
    },
  });

  return { isCreating, createAccountType };
}

export function useFetchAccountType() {
  const { isLoading, data, error, isError } = useQuery<AccountTypeRow[]>({
    queryKey: ["account_type"],
    queryFn: getAll,
    retry: false,
  });
  return { isLoading, data, error, isError };
}

export function useUpdateAccountType() {
  const queryClient = useQueryClient();
  const { mutate: updateAccountType, isPending: isUpdating } = useMutation({
    mutationFn: ({
      newUpdateData,
      id,
    }: {
      newUpdateData: UpdateAccountTypeInput;
      id: number;
    }) => updateAccountTypeAPI(newUpdateData, id),
    onSuccess: () => {
      toast.success("تم تعديل نوع الحساب بنجاح");
      void queryClient.invalidateQueries({ queryKey: ["account_type"] });
    },
    onError: (err: Error) => toast.error(err?.message || "حدث خطأ"),
  });

  return { isUpdating, updateAccountType };
}

export function useDeleteAccountType() {
  const queryClient = useQueryClient();

  const { isPending: isDeleting, mutate: deleteAccountType } = useMutation({
    mutationFn: (id: number) => deleteAccountTypeAPI(id),
    onSuccess: () => {
      toast.success("تم حذف نوع الحساب بنجاح");
      void queryClient.invalidateQueries({
        queryKey: ["account_type"],
      });
    },
    onError: (err: Error) => toast.error(err?.message || "حدث خطأ"),
  });

  return { isDeleting, deleteAccountType };
}

export function useAccountTypeById(id: number | undefined) {
  const { isLoading, data, error } = useQuery({
    queryKey: ["account_type", id],
    queryFn: () => {
      if (id == null) {
        return Promise.reject(new Error("لا يوجد معرّف"));
      }
      return getById(id);
    },
    enabled: id != null,
    retry: false,
  });

  return { isLoading, data, error };
}
