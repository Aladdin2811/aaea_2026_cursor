import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createBand,
  deleteBand,
  getAll,
  getForSelect,
  type BandWithRelations,
  type UpdateBandInput,
  updateBand,
} from "../../../api/apiBand";
import { useParams } from "react-router-dom";

export function useFetchBand() {
  const { id } = useParams();
  const { isLoading, data, error, isError } = useQuery<BandWithRelations[]>({
    queryKey: ["band", "by_bab", id],
    queryFn: () => getAll(id!),
    enabled: id != null && id !== "",
    retry: false,
  });

  return { isLoading, data, error, isError };
}

export function useBandSelect(babId: number | string | undefined) {
  const { isLoading, data, error, isError } = useQuery<BandWithRelations[]>({
    queryKey: ["band", "for_select", babId],
    queryFn: () => getForSelect(babId!),
    enabled:
      babId != null &&
      babId !== "" &&
      !Number.isNaN(Number(babId)),
    retry: false,
  });

  return { isLoading, data, error, isError };
}

export function useCreateBand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createBand,
    onSuccess: () => {
      toast.success("تمت إضافة البند بنجاح");
      void qc.invalidateQueries({ queryKey: ["band"] });
    },
    onError: (err: Error) => toast.error(err?.message || "تعذرت إضافة البند"),
  });
}

export function useUpdateBand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: number; patch: UpdateBandInput }) =>
      updateBand(id, patch),
    onSuccess: () => {
      toast.success("تم تعديل البند بنجاح");
      void qc.invalidateQueries({ queryKey: ["band"] });
    },
    onError: (err: Error) => toast.error(err?.message || "تعذر تعديل البند"),
  });
}

export function useDeleteBand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteBand(id),
    onSuccess: () => {
      toast.success("تم حذف البند بنجاح");
      void qc.invalidateQueries({ queryKey: ["band"] });
    },
    onError: (err: Error) => toast.error(err?.message || "تعذر حذف البند"),
  });
}
