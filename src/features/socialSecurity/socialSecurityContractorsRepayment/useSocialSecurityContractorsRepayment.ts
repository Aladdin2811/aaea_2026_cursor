import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSocialSecurityContractorsRepayment,
  deleteSocialSecurityContractorsRepayment,
  getAll,
  getById,
  updateSocialSecurityContractorsRepayment,
  type CreateSocialSecurityContractorsRepaymentInput,
  type SocialSecurityContractorsRepaymentRow,
  type UpdateSocialSecurityContractorsRepaymentInput,
} from "../../../api/apiSocialSecurityContractorsRepayment";
import { toast } from "sonner";

const socialSecurityContractorsRepaymentKey =
  "social_security_contractors_repayment" as const;

export function useFetchSocialSecurityContractorsRepayment() {
  const { isLoading, data, error } = useQuery<
    SocialSecurityContractorsRepaymentRow[],
    Error
  >({
    queryKey: [socialSecurityContractorsRepaymentKey],
    queryFn: getAll,
    retry: false,
  });

  return { isLoading, data, error };
}

export function useFetchSocialSecurityContractorsRepaymentById(
  id: number | string | null,
) {
  return useQuery<SocialSecurityContractorsRepaymentRow, Error>({
    queryKey: [socialSecurityContractorsRepaymentKey, "byId", id],
    queryFn: () => getById(id!),
    enabled: id != null && id !== "",
    retry: false,
  });
}

export function useCreateSocialSecurityContractorsRepayment() {
  const queryClient = useQueryClient();

  const { mutate: createContractorsRepayment, isPending: isCreating } =
    useMutation({
      mutationFn: (input: CreateSocialSecurityContractorsRepaymentInput) =>
        createSocialSecurityContractorsRepayment(input),
      onSuccess: () => {
        toast.success("تم تسجيل سداد المقاولين في الضمان الاجتماعي بنجاح");
        queryClient.invalidateQueries({
          queryKey: [socialSecurityContractorsRepaymentKey],
        });
      },
      onError: (err) =>
        toast.error(
          err instanceof Error
            ? err.message
            : "تعذّر تسجيل سداد المقاولين في الضمان الاجتماعي",
        ),
    });

  return { isCreating, createContractorsRepayment };
}

export function useUpdateSocialSecurityContractorsRepayment() {
  const queryClient = useQueryClient();

  const { mutate: updateContractorsRepayment, isPending: isUpdating } =
    useMutation({
      mutationFn: ({
        id,
        ...patch
      }: { id: number | string } & UpdateSocialSecurityContractorsRepaymentInput) =>
        updateSocialSecurityContractorsRepayment(id, patch),
      onSuccess: () => {
        toast.success("تم تعديل سداد المقاولين في الضمان الاجتماعي بنجاح");
        queryClient.invalidateQueries({
          queryKey: [socialSecurityContractorsRepaymentKey],
        });
      },
      onError: (err) =>
        toast.error(
          err instanceof Error
            ? err.message
            : "تعذّر تعديل سداد المقاولين في الضمان الاجتماعي",
        ),
    });

  return { isUpdating, updateContractorsRepayment };
}

export function useDeleteSocialSecurityContractorsRepayment() {
  const queryClient = useQueryClient();

  const { mutate: deleteContractorsRepayment, isPending: isDeleting } =
    useMutation({
      mutationFn: (id: number | string) =>
        deleteSocialSecurityContractorsRepayment(id),
      onSuccess: () => {
        toast.success("تم حذف سداد المقاولين في الضمان الاجتماعي بنجاح");
        queryClient.invalidateQueries({
          queryKey: [socialSecurityContractorsRepaymentKey],
        });
      },
      onError: (err) =>
        toast.error(
          err instanceof Error
            ? err.message
            : "تعذّر حذف سداد المقاولين في الضمان الاجتماعي",
        ),
    });

  return { isDeleting, deleteContractorsRepayment };
}
