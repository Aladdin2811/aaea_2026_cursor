import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createDetailed,
  deleteDetailed,
  getAll,
  getForSelect,
  type UpdateDetailedInput,
  updateDetailed,
  type DetailedWithRelations,
} from "../../../api/apiDetailed";
import { supabase } from "../../../lib/supabase";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

export function useFetchDetailed() {
  const { id } = useParams();
  const { isLoading, data, error, isError } = useQuery<DetailedWithRelations[]>({
    queryKey: ["detailed", "by_no3", id],
    queryFn: () => getAll(id!),
    enabled: id != null && id !== "",
    retry: false,
  });

  return { isLoading, data, error, isError };
}

export function useDetailedSelect(no3Id: number | string | undefined) {
  const { isLoading, data, error, isError } = useQuery<DetailedWithRelations[]>({
    queryKey: ["detailed", "for_select", no3Id],
    queryFn: () => getForSelect(no3Id!),
    enabled:
      no3Id != null &&
      no3Id !== "" &&
      !Number.isNaN(Number(no3Id)),
    retry: false,
  });

  return { isLoading, data, error, isError };
}

export function useFetchAccountsForActivityAdvanceSettlement() {
  const { data, error, isLoading } = useQuery({
    queryKey: ["accounts_for_activity_advance_settlement"],
    queryFn: async () => {
      const { data: rows, error: rpcError } = await supabase.rpc(
        "get_accounts_for_activity_advance_settlement",
      );
      if (rpcError) throw rpcError;
      return rows;
    },
    retry: false,
  });

  return { isLoading, data, error };
}

export function useCreateDetailed() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createDetailed,
    onSuccess: () => {
      toast.success("تمت إضافة الحساب التفصيلي بنجاح");
      void qc.invalidateQueries({ queryKey: ["detailed"] });
    },
    onError: (err: Error) =>
      toast.error(err?.message || "تعذرت إضافة الحساب التفصيلي"),
  });
}

export function useUpdateDetailed() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: number; patch: UpdateDetailedInput }) =>
      updateDetailed(id, patch),
    onSuccess: () => {
      toast.success("تم تعديل الحساب التفصيلي بنجاح");
      void qc.invalidateQueries({ queryKey: ["detailed"] });
    },
    onError: (err: Error) =>
      toast.error(err?.message || "تعذر تعديل الحساب التفصيلي"),
  });
}

export function useDeleteDetailed() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteDetailed(id),
    onSuccess: () => {
      toast.success("تم حذف الحساب التفصيلي بنجاح");
      void qc.invalidateQueries({ queryKey: ["detailed"] });
    },
    onError: (err: Error) => toast.error(err?.message || "تعذر حذف الحساب التفصيلي"),
  });
}
