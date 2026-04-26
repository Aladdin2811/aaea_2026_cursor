import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createVacationsBalances,
  deleteVacationsBalances,
  getAll,
  getById,
  updateVacationsBalances,
  type CreateVacationsBalancesInput,
  type UpdateVacationsBalancesInput,
  type VacationsBalancesListFilters,
  type VacationsBalancesWithRelations,
} from "../../../api/apiVacationsBalances";
import { toast } from "sonner";

const vacationsBalancesKey = "vacations_balances" as const;

function firstEmbed<T>(v: T | T[] | null | undefined): T | null {
  if (v == null) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

function sortKeyNullableId(v: number | null | undefined): number {
  if (v == null || !Number.isFinite(v)) return Number.POSITIVE_INFINITY;
  return v;
}

/**
 * ترتيب العرض: `job_nature_id` → `job_category_id` → `job_grade_id` → `id` السجل.
 */
function sortVacationBalancesByJobOrder(
  rows: VacationsBalancesWithRelations[],
): VacationsBalancesWithRelations[] {
  return [...rows].sort((a, b) => {
    const ea = firstEmbed(a.all_employees);
    const eb = firstEmbed(b.all_employees);
    const n =
      sortKeyNullableId(ea?.job_nature_id) -
      sortKeyNullableId(eb?.job_nature_id);
    if (n !== 0) return n;
    const c =
      sortKeyNullableId(ea?.job_category_id) -
      sortKeyNullableId(eb?.job_category_id);
    if (c !== 0) return c;
    const g =
      sortKeyNullableId(ea?.job_grade_id) - sortKeyNullableId(eb?.job_grade_id);
    if (g !== 0) return g;
    return a.id - b.id;
  });
}

/**
 * أرصدة الإجازات — تمرير الفلاتر الاختيارية إلى `getAll` كما في الـ API
 * (`year_id`، `employee_id`).
 * ترتيب العرض الافتراضي: طبيعة العمل → الفئة → الدرجة → معرّف السجل.
 * استخدم `enabled: false` لعدم جلب البيانات قبل اختيار/تحديد العام.
 */
export function useFetchVacationsBalances(
  filters?: VacationsBalancesListFilters,
  options?: { enabled?: boolean },
) {
  const enabled = options?.enabled ?? true;
  return useQuery<VacationsBalancesWithRelations[], Error>({
    queryKey: [vacationsBalancesKey, filters ?? {}],
    queryFn: () => getAll(filters),
    enabled,
    select: (data) => sortVacationBalancesByJobOrder(data),
    retry: false,
  });
}

export function useFetchVacationBalanceById(id: number | string | null) {
  return useQuery<VacationsBalancesWithRelations, Error>({
    queryKey: [vacationsBalancesKey, "byId", id],
    queryFn: () => getById(id!),
    enabled: id != null && id !== "",
    retry: false,
  });
}

export function useCreateVacationsBalance() {
  const queryClient = useQueryClient();

  const { mutate: createBalance, isPending: isCreating } = useMutation({
    mutationFn: (input: CreateVacationsBalancesInput) =>
      createVacationsBalances(input),
    onSuccess: () => {
      toast.success("تم تسجيل رصيد الإجازات بنجاح");
      queryClient.invalidateQueries({ queryKey: [vacationsBalancesKey] });
    },
    onError: (err) =>
      toast.error(
        err instanceof Error ? err.message : "تعذّر تسجيل رصيد الإجازات",
      ),
  });
  return { isCreating, createBalance };
}

export function useUpdateVacationsBalance() {
  const queryClient = useQueryClient();

  const { mutate: updateBalance, isPending: isUpdating } = useMutation({
    mutationFn: ({
      id,
      ...patch
    }: { id: number | string } & UpdateVacationsBalancesInput) =>
      updateVacationsBalances(id, patch),
    onSuccess: () => {
      toast.success("تم تعديل رصيد الإجازات بنجاح");
      queryClient.invalidateQueries({ queryKey: [vacationsBalancesKey] });
    },
    onError: (err) =>
      toast.error(
        err instanceof Error ? err.message : "تعذّر تعديل رصيد الإجازات",
      ),
  });

  return { isUpdating, updateBalance };
}

export function useDeleteVacationsBalance() {
  const queryClient = useQueryClient();

  const { mutate: deleteBalance, isPending: isDeleting } = useMutation({
    mutationFn: (id: number | string) => deleteVacationsBalances(id),
    onSuccess: () => {
      toast.success("تم حذف رصيد الإجازات بنجاح");
      queryClient.invalidateQueries({ queryKey: [vacationsBalancesKey] });
    },
    onError: (err) =>
      toast.error(
        err instanceof Error ? err.message : "تعذّر حذف رصيد الإجازات",
      ),
  });

  return { isDeleting, deleteBalance };
}
