import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSocialSecurityEmployeeContribution,
  deleteSocialSecurityEmployeeContribution,
  getAll,
  getById,
  updateSocialSecurityEmployeeContribution,
  type CreateSocialSecurityEmployeeContributionInput,
  type SocialSecurityEmployeeContributionRow,
  type UpdateSocialSecurityEmployeeContributionInput,
} from "../../../api/apiSocialSecurityEmployeeContribution";
import { toast } from "sonner";

const socialSecurityEmployeeContributionKey =
  "social_security_employee_contribution" as const;

export function useFetchSocialSecurityEmployeeContribution() {
  const { isLoading, data, error } = useQuery<
    SocialSecurityEmployeeContributionRow[],
    Error
  >({
    queryKey: [socialSecurityEmployeeContributionKey],
    queryFn: getAll,
    retry: false,
  });

  return { isLoading, data, error };
}

export function useFetchSocialSecurityEmployeeContributionById(
  id: number | string | null,
) {
  return useQuery<SocialSecurityEmployeeContributionRow, Error>({
    queryKey: [socialSecurityEmployeeContributionKey, "byId", id],
    queryFn: () => getById(id!),
    enabled: id != null && id !== "",
    retry: false,
  });
}

export function useCreateSocialSecurityEmployeeContribution() {
  const queryClient = useQueryClient();

  const { mutate: createEmployeeContribution, isPending: isCreating } =
    useMutation({
      mutationFn: (input: CreateSocialSecurityEmployeeContributionInput) =>
        createSocialSecurityEmployeeContribution(input),
      onSuccess: () => {
        toast.success("تم تسجيل نسبة مساهمة الموظف في الضمان الاجتماعي بنجاح");
        queryClient.invalidateQueries({
          queryKey: [socialSecurityEmployeeContributionKey],
        });
      },
      onError: (err) =>
        toast.error(
          err instanceof Error
            ? err.message
            : "تعذّر تسجيل نسبة مساهمة الموظف في الضمان الاجتماعي",
        ),
    });

  return { isCreating, createEmployeeContribution };
}

export function useUpdateSocialSecurityEmployeeContribution() {
  const queryClient = useQueryClient();

  const { mutate: updateEmployeeContribution, isPending: isUpdating } =
    useMutation({
      mutationFn: ({
        id,
        ...patch
      }: { id: number | string } & UpdateSocialSecurityEmployeeContributionInput) =>
        updateSocialSecurityEmployeeContribution(id, patch),
      onSuccess: () => {
        toast.success("تم تعديل نسبة مساهمة الموظف في الضمان الاجتماعي بنجاح");
        queryClient.invalidateQueries({
          queryKey: [socialSecurityEmployeeContributionKey],
        });
      },
      onError: (err) =>
        toast.error(
          err instanceof Error
            ? err.message
            : "تعذّر تعديل نسبة مساهمة الموظف في الضمان الاجتماعي",
        ),
    });

  return { isUpdating, updateEmployeeContribution };
}

export function useDeleteSocialSecurityEmployeeContribution() {
  const queryClient = useQueryClient();

  const { mutate: deleteEmployeeContribution, isPending: isDeleting } =
    useMutation({
      mutationFn: (id: number | string) =>
        deleteSocialSecurityEmployeeContribution(id),
      onSuccess: () => {
        toast.success("تم حذف نسبة مساهمة الموظف في الضمان الاجتماعي بنجاح");
        queryClient.invalidateQueries({
          queryKey: [socialSecurityEmployeeContributionKey],
        });
      },
      onError: (err) =>
        toast.error(
          err instanceof Error
            ? err.message
            : "تعذّر حذف نسبة مساهمة الموظف في الضمان الاجتماعي",
        ),
    });

  return { isDeleting, deleteEmployeeContribution };
}
