import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getAll,
  importBudgetsAddOnly,
  type ImportBudgetsAddOnlyRow,
  type BudgetsListFilters,
  type BudgetsWithRelations,
} from "../../../../api/apiBudgets";

export function useFetchBudgets(
  filters?: BudgetsListFilters,
  options?: { enabled?: boolean },
) {
  const { isLoading, data, error, isError } = useQuery<BudgetsWithRelations[]>({
    queryKey: ["budgets", filters ?? {}],
    queryFn: () => getAll(filters),
    retry: false,
    enabled: options?.enabled ?? true,
    staleTime: 0,
  });

  return { isLoading, data, error, isError };
}

export function useImportBudgetsAddOnly() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (rows: ImportBudgetsAddOnlyRow[]) => importBudgetsAddOnly(rows),
    onSuccess: (result) => {
      void qc.invalidateQueries({ queryKey: ["budgets"] });
      toast.success(`تم الاستيراد بنجاح: ${result.inserted_count} صف`);
    },
    onError: (err: Error) => {
      toast.error(err?.message || "تعذّر استيراد الإعتمادات");
    },
  });
}
