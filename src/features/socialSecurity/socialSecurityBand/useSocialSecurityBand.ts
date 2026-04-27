import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSocialSecurityBand,
  deleteSocialSecurityBand,
  getAll,
  getById,
  updateSocialSecurityBand,
  type CreateSocialSecurityBandInput,
  type SocialSecurityBandRow,
  type UpdateSocialSecurityBandInput,
} from "../../../api/apiSocialSecurityBand";
import { toast } from "sonner";

const socialSecurityBandKey = "social_security_band" as const;

export function useFetchSocialSecurityBand() {
  const { isLoading, data, error } = useQuery<SocialSecurityBandRow[], Error>({
    queryKey: [socialSecurityBandKey],
    queryFn: getAll,
    retry: false,
  });

  return { isLoading, data, error };
}

export function useFetchSocialSecurityBandById(id: number | string | null) {
  return useQuery<SocialSecurityBandRow, Error>({
    queryKey: [socialSecurityBandKey, "byId", id],
    queryFn: () => getById(id!),
    enabled: id != null && id !== "",
    retry: false,
  });
}

export function useCreateSocialSecurityBand() {
  const queryClient = useQueryClient();

  const { mutate: createBand, isPending: isCreating } = useMutation({
    mutationFn: (input: CreateSocialSecurityBandInput) =>
      createSocialSecurityBand(input),
    onSuccess: () => {
      toast.success("تم تسجيل بند الضمان الاجتماعي بنجاح");
      queryClient.invalidateQueries({ queryKey: [socialSecurityBandKey] });
    },
    onError: (err) =>
      toast.error(
        err instanceof Error ? err.message : "تعذّر تسجيل بند الضمان الاجتماعي",
      ),
  });

  return { isCreating, createBand };
}

export function useUpdateSocialSecurityBand() {
  const queryClient = useQueryClient();

  const { mutate: updateBand, isPending: isUpdating } = useMutation({
    mutationFn: ({
      id,
      ...patch
    }: { id: number | string } & UpdateSocialSecurityBandInput) =>
      updateSocialSecurityBand(id, patch),
    onSuccess: () => {
      toast.success("تم تعديل بند الضمان الاجتماعي بنجاح");
      queryClient.invalidateQueries({ queryKey: [socialSecurityBandKey] });
    },
    onError: (err) =>
      toast.error(
        err instanceof Error ? err.message : "تعذّر تعديل بند الضمان الاجتماعي",
      ),
  });

  return { isUpdating, updateBand };
}

export function useDeleteSocialSecurityBand() {
  const queryClient = useQueryClient();

  const { mutate: deleteBand, isPending: isDeleting } = useMutation({
    mutationFn: (id: number | string) => deleteSocialSecurityBand(id),
    onSuccess: () => {
      toast.success("تم حذف بند الضمان الاجتماعي بنجاح");
      queryClient.invalidateQueries({ queryKey: [socialSecurityBandKey] });
    },
    onError: (err) =>
      toast.error(
        err instanceof Error ? err.message : "تعذّر حذف بند الضمان الاجتماعي",
      ),
  });

  return { isDeleting, deleteBand };
}
