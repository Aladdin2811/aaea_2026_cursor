import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSocialSecurityBandPercentage,
  deleteSocialSecurityBandPercentage,
  getAll,
  getById,
  updateSocialSecurityBandPercentage,
  type CreateSocialSecurityBandPercentageInput,
  type SocialSecurityBandPercentageListFilters,
  type SocialSecurityBandPercentageWithRelations,
  type UpdateSocialSecurityBandPercentageInput,
} from "../../../api/apiSocialSecurityBandPercentage";
import { toast } from "sonner";

const socialSecurityBandPercentageKey = "social_security_band_percentage" as const;

export function useFetchSocialSecurityBandPercentage(
  filters?: SocialSecurityBandPercentageListFilters,
) {
  const { isLoading, data, error } = useQuery<
    SocialSecurityBandPercentageWithRelations[],
    Error
  >({
    queryKey: [socialSecurityBandPercentageKey, filters ?? {}],
    queryFn: () => getAll(filters),
    retry: false,
  });

  return { isLoading, data, error };
}

export function useFetchSocialSecurityBandPercentageById(
  id: number | string | null,
) {
  return useQuery<SocialSecurityBandPercentageWithRelations, Error>({
    queryKey: [socialSecurityBandPercentageKey, "byId", id],
    queryFn: () => getById(id!),
    enabled: id != null && id !== "",
    retry: false,
  });
}

export function useCreateSocialSecurityBandPercentage() {
  const queryClient = useQueryClient();

  const { mutate: createBandPercentage, isPending: isCreating } = useMutation({
    mutationFn: (input: CreateSocialSecurityBandPercentageInput) =>
      createSocialSecurityBandPercentage(input),
    onSuccess: () => {
      toast.success("تم تسجيل نسبة بند الضمان الاجتماعي بنجاح");
      queryClient.invalidateQueries({
        queryKey: [socialSecurityBandPercentageKey],
      });
    },
    onError: (err) =>
      toast.error(
        err instanceof Error
          ? err.message
          : "تعذّر تسجيل نسبة بند الضمان الاجتماعي",
      ),
  });

  return { isCreating, createBandPercentage };
}

export function useUpdateSocialSecurityBandPercentage() {
  const queryClient = useQueryClient();

  const { mutate: updateBandPercentage, isPending: isUpdating } = useMutation({
    mutationFn: ({
      id,
      ...patch
    }: { id: number | string } & UpdateSocialSecurityBandPercentageInput) =>
      updateSocialSecurityBandPercentage(id, patch),
    onSuccess: () => {
      toast.success("تم تعديل نسبة بند الضمان الاجتماعي بنجاح");
      queryClient.invalidateQueries({
        queryKey: [socialSecurityBandPercentageKey],
      });
    },
    onError: (err) =>
      toast.error(
        err instanceof Error
          ? err.message
          : "تعذّر تعديل نسبة بند الضمان الاجتماعي",
      ),
  });

  return { isUpdating, updateBandPercentage };
}

export function useDeleteSocialSecurityBandPercentage() {
  const queryClient = useQueryClient();

  const { mutate: deleteBandPercentage, isPending: isDeleting } = useMutation({
    mutationFn: (id: number | string) => deleteSocialSecurityBandPercentage(id),
    onSuccess: () => {
      toast.success("تم حذف نسبة بند الضمان الاجتماعي بنجاح");
      queryClient.invalidateQueries({
        queryKey: [socialSecurityBandPercentageKey],
      });
    },
    onError: (err) =>
      toast.error(
        err instanceof Error ? err.message : "تعذّر حذف نسبة بند الضمان الاجتماعي",
      ),
  });

  return { isDeleting, deleteBandPercentage };
}
