import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSocialSecurityCurrencyRate,
  deleteSocialSecurityCurrencyRate,
  getAll,
  getById,
  updateSocialSecurityCurrencyRate,
  type CreateSocialSecurityCurrencyRateInput,
  type SocialSecurityCurrencyRateRow,
  type UpdateSocialSecurityCurrencyRateInput,
} from "../../../api/apiSocialSecurityCurrencyRate";
import { toast } from "sonner";

const socialSecurityCurrencyRateKey = "social_security_currency_rate" as const;

export function useFetchSocialSecurityCurrencyRate() {
  const { isLoading, data, error } = useQuery<
    SocialSecurityCurrencyRateRow[],
    Error
  >({
    queryKey: [socialSecurityCurrencyRateKey],
    queryFn: getAll,
    retry: false,
  });

  return { isLoading, data, error };
}

export function useFetchSocialSecurityCurrencyRateById(
  id: number | string | null,
) {
  return useQuery<SocialSecurityCurrencyRateRow, Error>({
    queryKey: [socialSecurityCurrencyRateKey, "byId", id],
    queryFn: () => getById(id!),
    enabled: id != null && id !== "",
    retry: false,
  });
}

export function useCreateSocialSecurityCurrencyRate() {
  const queryClient = useQueryClient();

  const { mutate: createCurrencyRate, isPending: isCreating } = useMutation({
    mutationFn: (input: CreateSocialSecurityCurrencyRateInput) =>
      createSocialSecurityCurrencyRate(input),
    onSuccess: () => {
      toast.success("تم تسجيل سعر عملة الضمان الاجتماعي بنجاح");
      queryClient.invalidateQueries({ queryKey: [socialSecurityCurrencyRateKey] });
    },
    onError: (err) =>
      toast.error(
        err instanceof Error ? err.message : "تعذّر تسجيل سعر عملة الضمان الاجتماعي",
      ),
  });

  return { isCreating, createCurrencyRate };
}

export function useUpdateSocialSecurityCurrencyRate() {
  const queryClient = useQueryClient();

  const { mutate: updateCurrencyRate, isPending: isUpdating } = useMutation({
    mutationFn: ({
      id,
      ...patch
    }: { id: number | string } & UpdateSocialSecurityCurrencyRateInput) =>
      updateSocialSecurityCurrencyRate(id, patch),
    onSuccess: () => {
      toast.success("تم تعديل سعر عملة الضمان الاجتماعي بنجاح");
      queryClient.invalidateQueries({ queryKey: [socialSecurityCurrencyRateKey] });
    },
    onError: (err) =>
      toast.error(
        err instanceof Error ? err.message : "تعذّر تعديل سعر عملة الضمان الاجتماعي",
      ),
  });

  return { isUpdating, updateCurrencyRate };
}

export function useDeleteSocialSecurityCurrencyRate() {
  const queryClient = useQueryClient();

  const { mutate: deleteCurrencyRate, isPending: isDeleting } = useMutation({
    mutationFn: (id: number | string) => deleteSocialSecurityCurrencyRate(id),
    onSuccess: () => {
      toast.success("تم حذف سعر عملة الضمان الاجتماعي بنجاح");
      queryClient.invalidateQueries({ queryKey: [socialSecurityCurrencyRateKey] });
    },
    onError: (err) =>
      toast.error(
        err instanceof Error ? err.message : "تعذّر حذف سعر عملة الضمان الاجتماعي",
      ),
  });

  return { isDeleting, deleteCurrencyRate };
}
