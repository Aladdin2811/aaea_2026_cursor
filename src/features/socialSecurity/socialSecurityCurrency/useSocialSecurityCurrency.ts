import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSocialSecurityCurrency,
  deleteSocialSecurityCurrency,
  getAll,
  getById,
  updateSocialSecurityCurrency,
  type CreateSocialSecurityCurrencyInput,
  type SocialSecurityCurrencyRow,
  type UpdateSocialSecurityCurrencyInput,
} from "../../../api/apiSocialSecurityCurrency";
import { toast } from "sonner";

const socialSecurityCurrencyKey = "social_security_currency" as const;

export function useFetchSocialSecurityCurrency() {
  const { isLoading, data, error } = useQuery<SocialSecurityCurrencyRow[], Error>(
    {
      queryKey: [socialSecurityCurrencyKey],
    queryFn: getAll,
    retry: false,
    },
  );

  return { isLoading, data, error };
}

export function useFetchSocialSecurityCurrencyById(id: number | string | null) {
  return useQuery<SocialSecurityCurrencyRow, Error>({
    queryKey: [socialSecurityCurrencyKey, "byId", id],
    queryFn: () => getById(id!),
    enabled: id != null && id !== "",
    retry: false,
  });
}

export function useCreateSocialSecurityCurrency() {
  const queryClient = useQueryClient();

  const { mutate: createCurrency, isPending: isCreating } = useMutation({
    mutationFn: (input: CreateSocialSecurityCurrencyInput) =>
      createSocialSecurityCurrency(input),
    onSuccess: () => {
      toast.success("تم تسجيل عملة الضمان الاجتماعي بنجاح");
      queryClient.invalidateQueries({ queryKey: [socialSecurityCurrencyKey] });
    },
    onError: (err) =>
      toast.error(
        err instanceof Error ? err.message : "تعذّر تسجيل عملة الضمان الاجتماعي",
      ),
  });

  return { isCreating, createCurrency };
}

export function useUpdateSocialSecurityCurrency() {
  const queryClient = useQueryClient();

  const { mutate: updateCurrency, isPending: isUpdating } = useMutation({
    mutationFn: ({
      id,
      ...patch
    }: { id: number | string } & UpdateSocialSecurityCurrencyInput) =>
      updateSocialSecurityCurrency(id, patch),
    onSuccess: () => {
      toast.success("تم تعديل عملة الضمان الاجتماعي بنجاح");
      queryClient.invalidateQueries({ queryKey: [socialSecurityCurrencyKey] });
    },
    onError: (err) =>
      toast.error(
        err instanceof Error ? err.message : "تعذّر تعديل عملة الضمان الاجتماعي",
      ),
  });

  return { isUpdating, updateCurrency };
}

export function useDeleteSocialSecurityCurrency() {
  const queryClient = useQueryClient();

  const { mutate: deleteCurrency, isPending: isDeleting } = useMutation({
    mutationFn: (id: number | string) => deleteSocialSecurityCurrency(id),
    onSuccess: () => {
      toast.success("تم حذف عملة الضمان الاجتماعي بنجاح");
      queryClient.invalidateQueries({ queryKey: [socialSecurityCurrencyKey] });
    },
    onError: (err) =>
      toast.error(
        err instanceof Error ? err.message : "تعذّر حذف عملة الضمان الاجتماعي",
      ),
  });

  return { isDeleting, deleteCurrency };
}
