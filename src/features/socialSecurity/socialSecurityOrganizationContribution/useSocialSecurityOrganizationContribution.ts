import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSocialSecurityOrganizationContribution,
  deleteSocialSecurityOrganizationContribution,
  getAll,
  getById,
  updateSocialSecurityOrganizationContribution,
  type CreateSocialSecurityOrganizationContributionInput,
  type SocialSecurityOrganizationContributionRow,
  type UpdateSocialSecurityOrganizationContributionInput,
} from "../../../api/apiSocialSecurityOrganizationContribution";
import { toast } from "sonner";

const socialSecurityOrganizationContributionKey =
  "social_security_organization_contribution" as const;

export function useFetchSocialSecurityOrganizationContribution() {
  const { isLoading, data, error } = useQuery<
    SocialSecurityOrganizationContributionRow[],
    Error
  >({
    queryKey: [socialSecurityOrganizationContributionKey],
    queryFn: getAll,
    retry: false,
  });

  return { isLoading, data, error };
}

export function useFetchSocialSecurityOrganizationContributionById(
  id: number | string | null,
) {
  return useQuery<SocialSecurityOrganizationContributionRow, Error>({
    queryKey: [socialSecurityOrganizationContributionKey, "byId", id],
    queryFn: () => getById(id!),
    enabled: id != null && id !== "",
    retry: false,
  });
}

export function useCreateSocialSecurityOrganizationContribution() {
  const queryClient = useQueryClient();

  const { mutate: createOrganizationContribution, isPending: isCreating } =
    useMutation({
      mutationFn: (input: CreateSocialSecurityOrganizationContributionInput) =>
        createSocialSecurityOrganizationContribution(input),
      onSuccess: () => {
        toast.success("تم تسجيل نسبة مساهمة المنظمة في الضمان الاجتماعي بنجاح");
        queryClient.invalidateQueries({
          queryKey: [socialSecurityOrganizationContributionKey],
        });
      },
      onError: (err) =>
        toast.error(
          err instanceof Error
            ? err.message
            : "تعذّر تسجيل نسبة مساهمة المنظمة في الضمان الاجتماعي",
        ),
    });

  return { isCreating, createOrganizationContribution };
}

export function useUpdateSocialSecurityOrganizationContribution() {
  const queryClient = useQueryClient();

  const { mutate: updateOrganizationContribution, isPending: isUpdating } =
    useMutation({
      mutationFn: ({
        id,
        ...patch
      }: {
        id: number | string;
      } & UpdateSocialSecurityOrganizationContributionInput) =>
        updateSocialSecurityOrganizationContribution(id, patch),
      onSuccess: () => {
        toast.success("تم تعديل نسبة مساهمة المنظمة في الضمان الاجتماعي بنجاح");
        queryClient.invalidateQueries({
          queryKey: [socialSecurityOrganizationContributionKey],
        });
      },
      onError: (err) =>
        toast.error(
          err instanceof Error
            ? err.message
            : "تعذّر تعديل نسبة مساهمة المنظمة في الضمان الاجتماعي",
        ),
    });

  return { isUpdating, updateOrganizationContribution };
}

export function useDeleteSocialSecurityOrganizationContribution() {
  const queryClient = useQueryClient();

  const { mutate: deleteOrganizationContribution, isPending: isDeleting } =
    useMutation({
      mutationFn: (id: number | string) =>
        deleteSocialSecurityOrganizationContribution(id),
      onSuccess: () => {
        toast.success("تم حذف نسبة مساهمة المنظمة في الضمان الاجتماعي بنجاح");
        queryClient.invalidateQueries({
          queryKey: [socialSecurityOrganizationContributionKey],
        });
      },
      onError: (err) =>
        toast.error(
          err instanceof Error
            ? err.message
            : "تعذّر حذف نسبة مساهمة المنظمة في الضمان الاجتماعي",
        ),
    });

  return { isDeleting, deleteOrganizationContribution };
}
