import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createNo3,
  deleteNo3,
  getAll,
  getForSelect,
  getNo3Sum,
  type No3WithRelations,
  type UpdateNo3Input,
  updateNo3,
} from "../../../api/apiNo3";
import { useParams } from "react-router-dom";

function toFiniteYearId(
  yearId: number | string | null | undefined,
): number | null {
  if (yearId == null || yearId === "") return null;
  const n = typeof yearId === "string" ? Number(yearId) : yearId;
  return Number.isFinite(n) ? n : null;
}

function toFiniteNo3Id(
  no3Id: number | string | null | undefined,
): number | null {
  if (no3Id == null || no3Id === "") return null;
  const n = typeof no3Id === "string" ? Number(no3Id) : no3Id;
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * نتيجة دالة `get_no3_sum` في Supabase (رقم واحد).
 * `year_id` = مفتاح السنة في جدول `years`؛ `no3_id` = مفتاح النوع في جدول `no3`.
 *
 * @example useFetchNo3Sum(selectedYearId, 12)
 */
export function useFetchNo3Sum(
  yearId: number | string | null | undefined,
  no3Id: number | string | null | undefined,
) {
  const y = toFiniteYearId(yearId);
  const n = toFiniteNo3Id(no3Id);
  const enabled = y != null && n != null;

  return useQuery<number, Error>({
    queryKey: ["no3", "get_no3_sum", y, n],
    queryFn: async () => {
      if (y == null || n == null) {
        throw new Error("year_id و no3_id مطلوبان");
      }
      return getNo3Sum({ year_id: y, no3_id: n });
    },
    enabled,
    retry: false,
  });
}

export function useFetchNo3() {
  const { id } = useParams();
  const { isLoading, data, error, isError } = useQuery<No3WithRelations[]>({
    queryKey: ["no3", "by_band", id],
    queryFn: () => getAll(id!),
    enabled: id != null && id !== "",
    retry: false,
  });

  return { isLoading, data, error, isError };
}

export function useNo3Select(bandId: number | string | undefined) {
  const { isLoading, data, error, isError } = useQuery<No3WithRelations[]>({
    queryKey: ["no3", "for_select", bandId],
    queryFn: () => getForSelect(bandId!),
    enabled: bandId != null && bandId !== "" && !Number.isNaN(Number(bandId)),
    retry: false,
  });

  return { isLoading, data, error, isError };
}

export function useCreateNo3() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createNo3,
    onSuccess: () => {
      toast.success("تمت إضافة النوع بنجاح");
      void qc.invalidateQueries({ queryKey: ["no3"] });
    },
    onError: (err: Error) => {
      toast.error(err?.message || "تعذّر إضافة النوع");
    },
  });
}

export function useUpdateNo3() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: number; patch: UpdateNo3Input }) =>
      updateNo3(id, patch),
    onSuccess: () => {
      toast.success("تم تعديل النوع بنجاح");
      void qc.invalidateQueries({ queryKey: ["no3"] });
    },
    onError: (err: Error) => {
      toast.error(err?.message || "تعذّر تعديل النوع");
    },
  });
}

export function useDeleteNo3() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteNo3(id),
    onSuccess: () => {
      toast.success("تم حذف النوع بنجاح");
      void qc.invalidateQueries({ queryKey: ["no3"] });
    },
    onError: (err: Error) => {
      toast.error(err?.message || "تعذّر حذف النوع");
    },
  });
}
