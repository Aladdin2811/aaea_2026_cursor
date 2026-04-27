import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSocialSecurityContractorsContribution,
  deleteSocialSecurityContractorsContribution,
  getAll,
  getById,
  updateSocialSecurityContractorsContribution,
  type CreateSocialSecurityContractorsContributionInput,
  type SocialSecurityContractorsContributionRow,
  type UpdateSocialSecurityContractorsContributionInput,
} from "../../../api/apiSocialSecurityContractorsContribution";
import { toast } from "sonner";

const socialSecurityContractorsContributionKey =
  "social_security_contractors_contribution" as const;

export function useFetchSocialSecurityContractorsContribution() {
  const { isLoading, data, error } = useQuery<
    SocialSecurityContractorsContributionRow[],
    Error
  >({
    queryKey: [socialSecurityContractorsContributionKey],
    queryFn: getAll,
    retry: false,
  });

  return { isLoading, data, error };
}

export function useFetchSocialSecurityContractorsContributionById(
  id: number | string | null,
) {
  return useQuery<SocialSecurityContractorsContributionRow, Error>({
    queryKey: [socialSecurityContractorsContributionKey, "byId", id],
    queryFn: () => getById(id!),
    enabled: id != null && id !== "",
    retry: false,
  });
}

export function useCreateSocialSecurityContractorsContribution() {
  const queryClient = useQueryClient();

  const { mutate: createContractorsContribution, isPending: isCreating } =
    useMutation({
      mutationFn: (input: CreateSocialSecurityContractorsContributionInput) =>
        createSocialSecurityContractorsContribution(input),
      onSuccess: () => {
        toast.success("تم تسجيل نسبة مساهمة المقاولين في الضمان الاجتماعي بنجاح");
        queryClient.invalidateQueries({
          queryKey: [socialSecurityContractorsContributionKey],
        });
      },
      onError: (err) =>
        toast.error(
          err instanceof Error
            ? err.message
            : "تعذّر تسجيل نسبة مساهمة المقاولين في الضمان الاجتماعي",
        ),
    });

  return { isCreating, createContractorsContribution };
}

export function useUpdateSocialSecurityContractorsContribution() {
  const queryClient = useQueryClient();

  const { mutate: updateContractorsContribution, isPending: isUpdating } =
    useMutation({
      mutationFn: ({
        id,
        ...patch
      }: { id: number | string } & UpdateSocialSecurityContractorsContributionInput) =>
        updateSocialSecurityContractorsContribution(id, patch),
      onSuccess: () => {
        toast.success("تم تعديل نسبة مساهمة المقاولين في الضمان الاجتماعي بنجاح");
        queryClient.invalidateQueries({
          queryKey: [socialSecurityContractorsContributionKey],
        });
      },
      onError: (err) =>
        toast.error(
          err instanceof Error
            ? err.message
            : "تعذّر تعديل نسبة مساهمة المقاولين في الضمان الاجتماعي",
        ),
    });

  return { isUpdating, updateContractorsContribution };
}

export function useDeleteSocialSecurityContractorsContribution() {
  const queryClient = useQueryClient();

  const { mutate: deleteContractorsContribution, isPending: isDeleting } =
    useMutation({
      mutationFn: (id: number | string) =>
        deleteSocialSecurityContractorsContribution(id),
      onSuccess: () => {
        toast.success("تم حذف نسبة مساهمة المقاولين في الضمان الاجتماعي بنجاح");
        queryClient.invalidateQueries({
          queryKey: [socialSecurityContractorsContributionKey],
        });
      },
      onError: (err) =>
        toast.error(
          err instanceof Error
            ? err.message
            : "تعذّر حذف نسبة مساهمة المقاولين في الضمان الاجتماعي",
        ),
    });

  return { isDeleting, deleteContractorsContribution };
}
