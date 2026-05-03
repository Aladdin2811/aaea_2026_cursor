import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createBand,
  deleteBand,
  getAll,
  getBandSum,
  getForSelect,
  type BandWithRelations,
  type UpdateBandInput,
  updateBand,
} from "../../../api/apiBand";
import { useParams } from "react-router-dom";

function toFiniteYearId(
  yearId: number | string | null | undefined,
): number | null {
  if (yearId == null || yearId === "") return null;
  const n = typeof yearId === "string" ? Number(yearId) : yearId;
  return Number.isFinite(n) ? n : null;
}

function toFiniteBandId(
  bandId: number | string | null | undefined,
): number | null {
  if (bandId == null || bandId === "") return null;
  const n = typeof bandId === "string" ? Number(bandId) : bandId;
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * نتيجة دالة `get_band_sum` في Supabase (رقم واحد).
 * `year_id` = مفتاح السنة في جدول `years`؛ `band_id` = مفتاح البند في جدول `band`.
 *
 * @example useFetchBandSum(activeYearId, 82)
 */
export function useFetchBandSum(
  yearId: number | string | null | undefined,
  bandId: number | string | null | undefined,
) {
  const y = toFiniteYearId(yearId);
  const b = toFiniteBandId(bandId);
  const enabled = y != null && b != null;

  return useQuery<number, Error>({
    queryKey: ["band", "get_band_sum", y, b],
    queryFn: async () => {
      if (y == null || b == null) {
        throw new Error("year_id و band_id مطلوبان");
      }
      return getBandSum({ year_id: y, band_id: b });
    },
    enabled,
    retry: false,
  });
}

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
