import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getAll,
  getBabBudget,
  importBudgetsAddOnly,
  type ImportBudgetsAddOnlyRow,
  type BudgetsListFilters,
  type BudgetsWithRelations,
} from "../../../../api/apiBudgets";

function toFiniteYearId(
  yearId: number | string | null | undefined,
): number | null {
  if (yearId == null || yearId === "") return null;
  const n = typeof yearId === "string" ? Number(yearId) : yearId;
  return Number.isFinite(n) ? n : null;
}

function toFiniteBabId(
  babId: number | string | null | undefined,
): number | null {
  if (babId == null || babId === "") return null;
  const n = typeof babId === "string" ? Number(babId) : babId;
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * نتيجة دالة `get_bab_budget` في Supabase (رقم واحد).
 * `year_id` = مفتاح السنة في جدول `years`؛ `bab_id` = مفتاح الباب في جدول `bab`.
 *
 * @example useFetchBabBudget(selectedYearId, 3)
 */
export function useFetchBabBudget(
  yearId: number | string | null | undefined,
  babId: number | string | null | undefined,
) {
  const y = toFiniteYearId(yearId);
  const b = toFiniteBabId(babId);
  const enabled = y != null && b != null;

  return useQuery<number, Error>({
    queryKey: ["budgets", "get_bab_budget", y, b],
    queryFn: async () => {
      if (y == null || b == null) {
        throw new Error("year_id و bab_id مطلوبان");
      }
      return getBabBudget({ year_id: y, bab_id: b });
    },
    enabled,
    retry: false,
  });
}

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
