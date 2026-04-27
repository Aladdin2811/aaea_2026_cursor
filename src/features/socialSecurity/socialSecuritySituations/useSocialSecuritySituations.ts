import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSocialSecuritySituations,
  deleteSocialSecuritySituations,
  getAll,
  getById,
  updateSocialSecuritySituations,
  type CreateSocialSecuritySituationsInput,
  type SocialSecuritySituationsRow,
  type UpdateSocialSecuritySituationsInput,
} from "../../../api/apiSocialSecuritySituations";
import { toast } from "sonner";

const socialSecuritySituationsKey = "social_security_situations" as const;

export function useFetchSocialSecuritySituations() {
  const { isLoading, data, error } = useQuery<SocialSecuritySituationsRow[], Error>(
    {
      queryKey: [socialSecuritySituationsKey],
    queryFn: getAll,
    retry: false,
    },
  );

  return { isLoading, data, error };
}

export function useFetchSocialSecuritySituationsById(id: number | string | null) {
  return useQuery<SocialSecuritySituationsRow, Error>({
    queryKey: [socialSecuritySituationsKey, "byId", id],
    queryFn: () => getById(id!),
    enabled: id != null && id !== "",
    retry: false,
  });
}

export function useCreateSocialSecuritySituations() {
  const queryClient = useQueryClient();

  const { mutate: createSituation, isPending: isCreating } = useMutation({
    mutationFn: (input: CreateSocialSecuritySituationsInput) =>
      createSocialSecuritySituations(input),
    onSuccess: () => {
      toast.success("تم تسجيل وضع الضمان الاجتماعي بنجاح");
      queryClient.invalidateQueries({ queryKey: [socialSecuritySituationsKey] });
    },
    onError: (err) =>
      toast.error(
        err instanceof Error ? err.message : "تعذّر تسجيل وضع الضمان الاجتماعي",
      ),
  });

  return { isCreating, createSituation };
}

export function useUpdateSocialSecuritySituations() {
  const queryClient = useQueryClient();

  const { mutate: updateSituation, isPending: isUpdating } = useMutation({
    mutationFn: ({
      id,
      ...patch
    }: { id: number | string } & UpdateSocialSecuritySituationsInput) =>
      updateSocialSecuritySituations(id, patch),
    onSuccess: () => {
      toast.success("تم تعديل وضع الضمان الاجتماعي بنجاح");
      queryClient.invalidateQueries({ queryKey: [socialSecuritySituationsKey] });
    },
    onError: (err) =>
      toast.error(
        err instanceof Error ? err.message : "تعذّر تعديل وضع الضمان الاجتماعي",
      ),
  });

  return { isUpdating, updateSituation };
}

export function useDeleteSocialSecuritySituations() {
  const queryClient = useQueryClient();

  const { mutate: deleteSituation, isPending: isDeleting } = useMutation({
    mutationFn: (id: number | string) => deleteSocialSecuritySituations(id),
    onSuccess: () => {
      toast.success("تم حذف وضع الضمان الاجتماعي بنجاح");
      queryClient.invalidateQueries({ queryKey: [socialSecuritySituationsKey] });
    },
    onError: (err) =>
      toast.error(
        err instanceof Error ? err.message : "تعذّر حذف وضع الضمان الاجتماعي",
      ),
  });

  return { isDeleting, deleteSituation };
}
