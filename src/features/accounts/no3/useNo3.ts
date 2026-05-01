import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createNo3,
  deleteNo3,
  getAll,
  getForSelect,
  type No3WithRelations,
  type UpdateNo3Input,
  updateNo3,
} from "../../../api/apiNo3";
import { useParams } from "react-router-dom";

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
    enabled:
      bandId != null &&
      bandId !== "" &&
      !Number.isNaN(Number(bandId)),
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
