import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type CreateSocialSecurityExpensesInput,
  createSocialSecurityExpenses,
  deleteSocialSecurityExpenses,
  getAll,
  getById,
  type SocialSecurityExpensesListFilters,
  type SocialSecurityExpensesWithRelations,
  type UpdateSocialSecurityExpensesInput,
  updateSocialSecurityExpenses,
} from "../../../api/apiSocialSecurityExpenses";
import { toast } from "sonner";

export const socialSecurityExpensesKey = "social_security_expenses" as const;

export function useFetchSocialSecurityExpenses(
  filters?: SocialSecurityExpensesListFilters,
  options?: { enabled?: boolean },
) {
  const enabled = options?.enabled ?? true;
  const { isLoading, data, error } = useQuery<
    SocialSecurityExpensesWithRelations[],
    Error
  >({
    queryKey: [socialSecurityExpensesKey, filters ?? {}],
    queryFn: () => getAll(filters),
    enabled,
    retry: false,
  });

  return { isLoading, data, error };
}

export function useFetchSocialSecurityExpensesById(id: number | string | null) {
  return useQuery<SocialSecurityExpensesWithRelations, Error>({
    queryKey: [socialSecurityExpensesKey, "byId", id],
    queryFn: () => getById(id!),
    enabled: id != null && id !== "",
    retry: false,
  });
}

export function useCreateSocialSecurityExpenses() {
  const queryClient = useQueryClient();

  const {
    mutate,
    mutateAsync,
    isPending: isCreating,
  } = useMutation({
    mutationFn: (input: CreateSocialSecurityExpensesInput) =>
      createSocialSecurityExpenses(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [socialSecurityExpensesKey] });
    },
    onError: (err) =>
      toast.error(
        err instanceof Error
          ? err.message
          : "تعذّر تسجيل مصروف الضمان الاجتماعي",
      ),
  });
  return {
    createExpenses: mutate,
    createExpensesAsync: mutateAsync,
    isCreating,
  };
}

export function useUpdateSocialSecurityExpenses() {
  const queryClient = useQueryClient();

  const { mutate: updateExpenses, isPending: isUpdating } = useMutation({
    mutationFn: ({
      id,
      ...patch
    }: { id: number | string } & UpdateSocialSecurityExpensesInput) =>
      updateSocialSecurityExpenses(id, patch),
    onSuccess: () => {
      toast.success("تم تعديل مصروف الضمان الاجتماعي بنجاح");
      queryClient.invalidateQueries({ queryKey: [socialSecurityExpensesKey] });
    },
    onError: (err) =>
      toast.error(
        err instanceof Error
          ? err.message
          : "تعذّر تعديل مصروف الضمان الاجتماعي",
      ),
  });

  return { isUpdating, updateExpenses };
}

export function useDeleteSocialSecurityExpenses() {
  const queryClient = useQueryClient();

  const { isPending: isDeleting, mutate: deleteExpense } = useMutation({
    mutationFn: (id: number | string) => deleteSocialSecurityExpenses(id),
    onSuccess: () => {
      toast.success("تم حذف مصروف الضمان الاجتماعي بنجاح");
      queryClient.invalidateQueries({
        queryKey: [socialSecurityExpensesKey],
      });
    },
    onError: (err) =>
      toast.error(
        err instanceof Error ? err.message : "تعذّر حذف مصروف الضمان الاجتماعي",
      ),
  });

  return { isDeleting, deleteExpense };
}
