import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import {
  createVacations,
  deleteVacations,
  getAll,
  getById,
  updateVacations,
  type CreateVacationsInput,
  type UpdateVacationsInput,
  type VacationsListFilters,
  type VacationsWithRelations,
} from "../../../api/apiVacations";
import supabase from "../../../lib/supabase";
import { toast } from "sonner";

const vacationsKey = "vacations" as const;
const inAppNotificationsKey = "in_app_notifications" as const;

function invalidateInAppNotifications(qc: QueryClient) {
  void qc.invalidateQueries({ queryKey: [inAppNotificationsKey] });
}

function fromDateSortKey(iso: string | null | undefined): number {
  if (iso == null || String(iso).trim() === "") {
    return Number.POSITIVE_INFINITY;
  }
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? Number.POSITIVE_INFINITY : t;
}

/** من الأقدم إلى الأحدث: `from_date` تصاعدياً ثم `id` تصاعدياً. */
function sortVacationsOldestFirst(
  rows: VacationsWithRelations[],
): VacationsWithRelations[] {
  return [...rows].sort((a, b) => {
    const c = fromDateSortKey(a.from_date) - fromDateSortKey(b.from_date);
    if (c !== 0) return c;
    return a.id - b.id;
  });
}

/**
 * الإجازات — `getAll` مع الفلاتر الاختيارية (`year_id`، `employee_id`، `vacation_type_id`).
 * ترتيب العرض: من الأقدم إلى الأحدث (تاريخ البداية تصاعدياً).
 * يُنصح بتمرير `enabled: false` حتى يُحدَّد العام والموظف للبحث.
 */
export function useFetchVacations(
  filters?: VacationsListFilters,
  options?: { enabled?: boolean },
) {
  const enabled = options?.enabled ?? true;
  return useQuery<VacationsWithRelations[], Error>({
    queryKey: [vacationsKey, filters ?? {}],
    queryFn: () => getAll(filters),
    enabled,
    select: (data) => sortVacationsOldestFirst(data),
    retry: false,
  });
}

export function useFetchVacationsCount(
  yearId: number | null,
  employeeId: number | null,
) {
  return useQuery<unknown, Error>({
    queryKey: [vacationsKey, "count", yearId, employeeId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_vacations_count", {
        p_year_id: yearId,
        p_employee_id: employeeId,
      });
      if (error) throw error;
      return data;
    },
    retry: false,
    enabled:
      yearId != null &&
      employeeId != null &&
      Number.isFinite(yearId) &&
      Number.isFinite(employeeId),
  });
}

export function useFetchRemaningVacations(
  yearId: number | null,
  employeeId: number | null,
) {
  return useQuery<unknown, Error>({
    queryKey: [vacationsKey, "remaning", yearId, employeeId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_remaning_vacations", {
        p_year_id: yearId,
        p_employee_id: employeeId,
      });
      if (error) throw error;
      return data;
    },
    retry: false,
    enabled:
      yearId != null &&
      employeeId != null &&
      Number.isFinite(yearId) &&
      Number.isFinite(employeeId),
  });
}

export function useCreateVacation() {
  const queryClient = useQueryClient();

  const { mutate: createVacation, isPending: isCreating } = useMutation({
    mutationFn: (input: CreateVacationsInput) => createVacations(input),
    onSuccess: () => {
      toast.success("تم تسجيل الإجازة الجديدة بنجاح");
      void queryClient.invalidateQueries({ queryKey: [vacationsKey] });
      invalidateInAppNotifications(queryClient);
    },
    onError: (err) =>
      toast.error(
        err instanceof Error ? err.message : "تعذّر تسجيل الإجازة",
      ),
  });
  return { isCreating, createVacation };
}

export function useUpdateVacation() {
  const queryClient = useQueryClient();
  const { mutate: updateVacation, isPending: isUpdating } = useMutation({
    mutationFn: ({
      id,
      ...patch
    }: { id: number | string } & UpdateVacationsInput) =>
      updateVacations(id, patch),
    onSuccess: () => {
      toast.success("تم تعديل الإجازة بنجاح");
      void queryClient.invalidateQueries({ queryKey: [vacationsKey] });
      invalidateInAppNotifications(queryClient);
    },
    onError: (err) =>
      toast.error(
        err instanceof Error ? err.message : "تعذّر تعديل الإجازة",
      ),
  });

  return { isUpdating, updateVacation };
}

export function useDeleteVacation() {
  const queryClient = useQueryClient();

  const { isPending: isDeleting, mutate: deleteVacation } = useMutation({
    mutationFn: (id: number | string) => deleteVacations(id),
    onSuccess: () => {
      toast.success("تم حذف الإجازة بنجاح");
      void queryClient.invalidateQueries({ queryKey: [vacationsKey] });
      invalidateInAppNotifications(queryClient);
    },
    onError: (err) =>
      toast.error(
        err instanceof Error ? err.message : "تعذّر حذف الإجازة",
      ),
  });

  return { isDeleting, deleteVacation };
}

export function useFetchVacationById(id: number | string | null | undefined) {
  const valid =
    id != null &&
    id !== "" &&
    (typeof id === "number"
      ? Number.isFinite(id)
      : !Number.isNaN(Number(id)));

  return useQuery<VacationsWithRelations, Error>({
    queryKey: [vacationsKey, "byId", id],
    queryFn: () => getById(id as number | string),
    enabled: valid,
    retry: false,
  });
}
