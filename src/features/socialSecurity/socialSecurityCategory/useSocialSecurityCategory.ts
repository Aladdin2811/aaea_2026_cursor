import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSocialSecurityCategory,
  deleteSocialSecurityCategory,
  getAll,
  getById,
  updateSocialSecurityCategory,
  type CreateSocialSecurityCategoryInput,
  type SocialSecurityCategoryRow,
  type UpdateSocialSecurityCategoryInput,
} from "../../../api/apiSocialSecurityCategory";
import { toast } from "sonner";

const socialSecurityCategoryKey = "social_security_category" as const;

export function useFetchSocialSecurityCategory() {
  const { isLoading, data, error } = useQuery<SocialSecurityCategoryRow[], Error>(
    {
      queryKey: [socialSecurityCategoryKey],
    queryFn: getAll,
    retry: false,
    },
  );

  return { isLoading, data, error };
}

export function useFetchSocialSecurityCategoryById(id: number | string | null) {
  return useQuery<SocialSecurityCategoryRow, Error>({
    queryKey: [socialSecurityCategoryKey, "byId", id],
    queryFn: () => getById(id!),
    enabled: id != null && id !== "",
    retry: false,
  });
}

export function useCreateSocialSecurityCategory() {
  const queryClient = useQueryClient();

  const { mutate: createCategory, isPending: isCreating } = useMutation({
    mutationFn: (input: CreateSocialSecurityCategoryInput) =>
      createSocialSecurityCategory(input),
    onSuccess: () => {
      toast.success("تم تسجيل تصنيف الضمان الاجتماعي بنجاح");
      queryClient.invalidateQueries({ queryKey: [socialSecurityCategoryKey] });
    },
    onError: (err) =>
      toast.error(
        err instanceof Error ? err.message : "تعذّر تسجيل تصنيف الضمان الاجتماعي",
      ),
  });

  return { isCreating, createCategory };
}

export function useUpdateSocialSecurityCategory() {
  const queryClient = useQueryClient();

  const { mutate: updateCategory, isPending: isUpdating } = useMutation({
    mutationFn: ({
      id,
      ...patch
    }: { id: number | string } & UpdateSocialSecurityCategoryInput) =>
      updateSocialSecurityCategory(id, patch),
    onSuccess: () => {
      toast.success("تم تعديل تصنيف الضمان الاجتماعي بنجاح");
      queryClient.invalidateQueries({ queryKey: [socialSecurityCategoryKey] });
    },
    onError: (err) =>
      toast.error(
        err instanceof Error ? err.message : "تعذّر تعديل تصنيف الضمان الاجتماعي",
      ),
  });

  return { isUpdating, updateCategory };
}

export function useDeleteSocialSecurityCategory() {
  const queryClient = useQueryClient();

  const { mutate: deleteCategory, isPending: isDeleting } = useMutation({
    mutationFn: (id: number | string) => deleteSocialSecurityCategory(id),
    onSuccess: () => {
      toast.success("تم حذف تصنيف الضمان الاجتماعي بنجاح");
      queryClient.invalidateQueries({ queryKey: [socialSecurityCategoryKey] });
    },
    onError: (err) =>
      toast.error(
        err instanceof Error ? err.message : "تعذّر حذف تصنيف الضمان الاجتماعي",
      ),
  });

  return { isDeleting, deleteCategory };
}
