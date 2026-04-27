import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSocialSecurityClassification,
  deleteSocialSecurityClassification,
  getAll,
  getById,
  updateSocialSecurityClassification,
  type CreateSocialSecurityClassificationInput,
  type SocialSecurityClassificationRow,
  type UpdateSocialSecurityClassificationInput,
} from "../../../api/apiSocialSecurityClassification";
import { toast } from "sonner";

const socialSecurityClassificationKey = "social_security_classification" as const;

export function useFetchSocialSecurityClassification() {
  const { isLoading, data, error } = useQuery<
    SocialSecurityClassificationRow[],
    Error
  >({
    queryKey: [socialSecurityClassificationKey],
    queryFn: getAll,
    retry: false,
  });

  return { isLoading, data, error };
}

export function useFetchSocialSecurityClassificationById(
  id: number | string | null,
) {
  return useQuery<SocialSecurityClassificationRow, Error>({
    queryKey: [socialSecurityClassificationKey, "byId", id],
    queryFn: () => getById(id!),
    enabled: id != null && id !== "",
    retry: false,
  });
}

export function useCreateSocialSecurityClassification() {
  const queryClient = useQueryClient();

  const { mutate: createClassification, isPending: isCreating } = useMutation({
    mutationFn: (input: CreateSocialSecurityClassificationInput) =>
      createSocialSecurityClassification(input),
    onSuccess: () => {
      toast.success("تم تسجيل التصنيف الفرعي للضمان الاجتماعي بنجاح");
      queryClient.invalidateQueries({
        queryKey: [socialSecurityClassificationKey],
      });
    },
    onError: (err) =>
      toast.error(
        err instanceof Error
          ? err.message
          : "تعذّر تسجيل التصنيف الفرعي للضمان الاجتماعي",
      ),
  });

  return { isCreating, createClassification };
}

export function useUpdateSocialSecurityClassification() {
  const queryClient = useQueryClient();

  const { mutate: updateClassification, isPending: isUpdating } = useMutation({
    mutationFn: ({
      id,
      ...patch
    }: { id: number | string } & UpdateSocialSecurityClassificationInput) =>
      updateSocialSecurityClassification(id, patch),
    onSuccess: () => {
      toast.success("تم تعديل التصنيف الفرعي للضمان الاجتماعي بنجاح");
      queryClient.invalidateQueries({
        queryKey: [socialSecurityClassificationKey],
      });
    },
    onError: (err) =>
      toast.error(
        err instanceof Error
          ? err.message
          : "تعذّر تعديل التصنيف الفرعي للضمان الاجتماعي",
      ),
  });

  return { isUpdating, updateClassification };
}

export function useDeleteSocialSecurityClassification() {
  const queryClient = useQueryClient();

  const { mutate: deleteClassification, isPending: isDeleting } = useMutation({
    mutationFn: (id: number | string) => deleteSocialSecurityClassification(id),
    onSuccess: () => {
      toast.success("تم حذف التصنيف الفرعي للضمان الاجتماعي بنجاح");
      queryClient.invalidateQueries({
        queryKey: [socialSecurityClassificationKey],
      });
    },
    onError: (err) =>
      toast.error(
        err instanceof Error
          ? err.message
          : "تعذّر حذف التصنيف الفرعي للضمان الاجتماعي",
      ),
  });

  return { isDeleting, deleteClassification };
}
