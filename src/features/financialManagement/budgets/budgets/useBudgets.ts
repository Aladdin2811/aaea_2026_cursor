import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getBabBudget,
  getModifiedBudgets,
  importBudgetsAddOnly,
  type ImportBudgetsAddOnlyRow,
  type BudgetsListFilters,
  type ModifiedBudgetRow,
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

/**
 * جدول الإعتمادات المعدّلة عبر RPC `get_modified_budgets(p_year_id, p_bab_id)`.
 * يتطلّب `year_id` و`bab_id` في المرشّحات.
 */
export function useFetchBudgets(
  filters?: BudgetsListFilters,
  options?: { enabled?: boolean },
) {
  const hasYearAndBab =
    filters?.year_id != null &&
    filters?.bab_id != null &&
    filters.year_id !== "" &&
    filters.bab_id !== "";

  const enabled = (options?.enabled ?? true) && hasYearAndBab;

  const { isLoading, data, error, isError } = useQuery<ModifiedBudgetRow[]>({
    queryKey: ["budgets", "modified", filters ?? {}],
    queryFn: async () => {
      if (
        filters?.year_id == null ||
        filters?.bab_id == null ||
        filters.year_id === "" ||
        filters.bab_id === ""
      ) {
        throw new Error("year_id و bab_id مطلوبان لجلب الإعتمادات المعدّلة");
      }
      const y =
        typeof filters.year_id === "string"
          ? Number(filters.year_id)
          : filters.year_id;
      const b =
        typeof filters.bab_id === "string"
          ? Number(filters.bab_id)
          : filters.bab_id;
      if (!Number.isFinite(y) || !Number.isFinite(b)) {
        throw new Error("معرّف السنة أو الباب غير صالح");
      }
      return getModifiedBudgets({ year_id: y, bab_id: b });
    },
    retry: false,
    enabled,
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
