import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createBab,
  deleteBab,
  getAll,
  getBudgetBab,
  getForSelect,
  type UpdateBabInput,
  updateBab,
  type BabWithRelations,
} from "../../../api/apiBab";
import { useParams } from "react-router-dom";

export function useFetchBab() {
  const { id } = useParams();
  const { isLoading, data, error, isError } = useQuery<BabWithRelations[]>({
    queryKey: ["bab", "by_general_account", id],
    queryFn: () => getAll(id!),
    enabled: id != null && id !== "",
    retry: false,
  });

  return { isLoading, data, error, isError };
}

export function useBudgetBab() {
  const { isLoading, data, error, isError } = useQuery<BabWithRelations[]>({
    queryKey: ["bab", "budget"],
    queryFn: getBudgetBab,
    retry: false,
  });

  return { isLoading, data, error, isError };
}

export function useBabSelect(generalAccountId: number | string | undefined) {
  const { isLoading, data, error, isError } = useQuery<BabWithRelations[]>({
    queryKey: ["bab", "for_select", generalAccountId],
    queryFn: () => getForSelect(generalAccountId!),
    enabled:
      generalAccountId != null &&
      generalAccountId !== "" &&
      !Number.isNaN(Number(generalAccountId)),
    retry: false,
  });

  return { isLoading, data, error, isError };
}

export function useCreateBab() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createBab,
    onSuccess: () => {
      toast.success("تمت إضافة الباب بنجاح");
      void qc.invalidateQueries({ queryKey: ["bab"] });
    },
    onError: (err: Error) => toast.error(err?.message || "تعذرت إضافة الباب"),
  });
}

export function useUpdateBab() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: number; patch: UpdateBabInput }) =>
      updateBab(id, patch),
    onSuccess: () => {
      toast.success("تم تعديل الباب بنجاح");
      void qc.invalidateQueries({ queryKey: ["bab"] });
    },
    onError: (err: Error) => toast.error(err?.message || "تعذر تعديل الباب"),
  });
}

export function useDeleteBab() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteBab(id),
    onSuccess: () => {
      toast.success("تم حذف الباب بنجاح");
      void qc.invalidateQueries({ queryKey: ["bab"] });
    },
    onError: (err: Error) => toast.error(err?.message || "تعذر حذف الباب"),
  });
}
