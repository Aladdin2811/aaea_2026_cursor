import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSocialSecurityBandLimit,
  deleteSocialSecurityBandLimit,
  getAll,
  getById,
  updateSocialSecurityBandLimit,
  type CreateSocialSecurityBandLimitInput,
  type SocialSecurityBandLimitListFilters,
  type SocialSecurityBandLimitWithRelations,
  type UpdateSocialSecurityBandLimitInput,
} from "../../../api/apiSocialSecurityBandLimit";
import { toast } from "sonner";

const socialSecurityBandLimitKey = "social_security_band_limit" as const;

export function useFetchSocialSecurityBandLimit(
  filters?: SocialSecurityBandLimitListFilters,
) {
  const { isLoading, data, error } = useQuery<
    SocialSecurityBandLimitWithRelations[],
    Error
  >({
    queryKey: [socialSecurityBandLimitKey, filters ?? {}],
    queryFn: () => getAll(filters),
    retry: false,
  });

  return { isLoading, data, error };
}

export function useFetchSocialSecurityBandLimitById(id: number | string | null) {
  return useQuery<SocialSecurityBandLimitWithRelations, Error>({
    queryKey: [socialSecurityBandLimitKey, "byId", id],
    queryFn: () => getById(id!),
    enabled: id != null && id !== "",
    retry: false,
  });
}

export function useCreateSocialSecurityBandLimit() {
  const queryClient = useQueryClient();

  const { mutate: createBandLimit, isPending: isCreating } = useMutation({
    mutationFn: (input: CreateSocialSecurityBandLimitInput) =>
      createSocialSecurityBandLimit(input),
    onSuccess: () => {
      toast.success("تم تسجيل سقف الضمان الاجتماعي بنجاح");
      queryClient.invalidateQueries({ queryKey: [socialSecurityBandLimitKey] });
    },
    onError: (err) =>
      toast.error(
        err instanceof Error ? err.message : "تعذّر تسجيل سقف الضمان الاجتماعي",
      ),
  });

  return { isCreating, createBandLimit };
}

export function useUpdateSocialSecurityBandLimit() {
  const queryClient = useQueryClient();

  const { mutate: updateBandLimit, isPending: isUpdating } = useMutation({
    mutationFn: ({
      id,
      ...patch
    }: { id: number | string } & UpdateSocialSecurityBandLimitInput) =>
      updateSocialSecurityBandLimit(id, patch),
    onSuccess: () => {
      toast.success("تم تعديل سقف الضمان الاجتماعي بنجاح");
      queryClient.invalidateQueries({ queryKey: [socialSecurityBandLimitKey] });
    },
    onError: (err) =>
      toast.error(
        err instanceof Error ? err.message : "تعذّر تعديل سقف الضمان الاجتماعي",
      ),
  });

  return { isUpdating, updateBandLimit };
}

export function useDeleteSocialSecurityBandLimit() {
  const queryClient = useQueryClient();

  const { mutate: deleteBandLimit, isPending: isDeleting } = useMutation({
    mutationFn: (id: number | string) => deleteSocialSecurityBandLimit(id),
    onSuccess: () => {
      toast.success("تم حذف سقف الضمان الاجتماعي بنجاح");
      queryClient.invalidateQueries({ queryKey: [socialSecurityBandLimitKey] });
    },
    onError: (err) =>
      toast.error(
        err instanceof Error ? err.message : "تعذّر حذف سقف الضمان الاجتماعي",
      ),
  });

  return { isDeleting, deleteBandLimit };
}
