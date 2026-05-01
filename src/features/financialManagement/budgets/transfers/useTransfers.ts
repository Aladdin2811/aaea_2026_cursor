import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTransfers,
  deleteTransfers,
  getAll,
  updateTransfers,
  type CreateTransfersInput,
  type TransfersListFilters,
  type UpdateTransfersInput,
  type TransfersWithRelations,
} from "../../../../api/apiTransfers";
import { toast } from "sonner";

const transfersKey = "transfers" as const;

export function useFetchTransfers(
  filters?: TransfersListFilters,
  options?: { enabled?: boolean },
) {
  const { isLoading, data, error, isError } = useQuery<TransfersWithRelations[]>({
    queryKey: [transfersKey, filters ?? {}],
    queryFn: () => getAll(filters),
    retry: false,
    enabled: options?.enabled ?? true,
    staleTime: 0,
  });

  return { isLoading, data, error, isError };
}

export function useCreateTransfer() {
  const queryClient = useQueryClient();

  const { mutate: createTransfer, isPending: isCreating } = useMutation({
    mutationFn: (input: CreateTransfersInput) => createTransfers(input),
    onSuccess: () => {
      toast.success("تم تسجيل المناقلة بنجاح");
      void queryClient.invalidateQueries({ queryKey: [transfersKey] });
    },
    onError: (err) =>
      toast.error(
        err instanceof Error ? err.message : "تعذر تسجيل المناقلة الجديدة",
      ),
  });

  return { createTransfer, isCreating };
}

export function useUpdateTransfer() {
  const queryClient = useQueryClient();
  const { mutate: updateTransfer, isPending: isUpdating } = useMutation({
    mutationFn: ({
      id,
      patch,
    }: {
      id: number | string;
      patch: UpdateTransfersInput;
    }) => updateTransfers(id, patch),
    onSuccess: () => {
      toast.success("تم تعديل المناقلة بنجاح");
      void queryClient.invalidateQueries({ queryKey: [transfersKey] });
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "تعذر تعديل المناقلة"),
  });

  return { updateTransfer, isUpdating };
}

export function useDeleteTransfer() {
  const queryClient = useQueryClient();
  const { mutate: deleteTransfer, isPending: isDeleting } = useMutation({
    mutationFn: (id: number | string) => deleteTransfers(id),
    onSuccess: () => {
      toast.success("تم حذف المناقلة بنجاح");
      void queryClient.invalidateQueries({ queryKey: [transfersKey] });
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "تعذر حذف المناقلة"),
  });

  return { deleteTransfer, isDeleting };
}
