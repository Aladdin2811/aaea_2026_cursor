import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getAll,
  createUpdateProgram,
  deleteProgram as deleteProgramAPI,
  type CreateProgramInput,
  type ProgramFilter,
  type ProgramsWithRelations,
  type UpdateProgramInput,
} from "../../../api/apiPrograms";
import { supabase } from "../../../lib/supabase";

export function useCreateProgram() {
  const queryClient = useQueryClient();

  const { mutate: createProgram, isPending: isCreating } = useMutation({
    mutationFn: (newProgram: CreateProgramInput) =>
      createUpdateProgram(newProgram, undefined),
    onSuccess: () => {
      toast.success("تم تسجيل نشاط جديد بنجاح");
      void queryClient.invalidateQueries({ queryKey: ["programs"] });
    },
    onError: (err: Error) => {
      toast.error(err?.message || "حدث خطأ");
    },
  });

  return { isCreating, createProgram };
}

export function useFetchPrograms(filterArray: ProgramFilter[]) {
  const { isLoading, data, error, isError } = useQuery<ProgramsWithRelations[]>({
    queryKey: ["programs", filterArray],
    queryFn: () => getAll(filterArray),
    retry: false,
    enabled: filterArray.length > 0,
  });

  return { isLoading, data, error, isError };
}

/** نطاق جلب البرامج: سنة + أحد مستويات الحساب (الأدق يُفضَّل) */
export type ProgramsSelectScope = {
  yearId: number | string | undefined;
  detailedId?: number | string | null;
  bandId?: number | string | null;
  babId?: number | string | null;
};

function parseScopeId(
  v: number | string | null | undefined,
): number | null {
  if (v == null || v === "") return null;
  const n = typeof v === "string" ? Number(v) : v;
  if (typeof n !== "number" || !Number.isFinite(n)) return null;
  return n;
}

/**
 * باب بهذا المعرّف: البرامج لا تُجلب بـ `bab_id` وحده — يُشترط اختيار `band_id`
 * (أو الحساب التفصيلي) قبل الجلب.
 */
export const PROGRAMS_SELECT_BAB_REQUIRES_BAND_ID = 8;

/** `year_id` + (`detailed_id` | `band_id` | `bab_id`) — الأدق أولاً */
export function buildProgramsSelectFilters(
  scope: ProgramsSelectScope,
): ProgramFilter[] | null {
  const year = parseScopeId(scope.yearId);
  if (year == null) return null;

  const filters: ProgramFilter[] = [{ field: "year_id", value: year }];
  const detailed = parseScopeId(scope.detailedId);
  const band = parseScopeId(scope.bandId);
  const bab = parseScopeId(scope.babId);

  if (detailed != null) {
    filters.push({ field: "detailed_id", value: detailed });
    return filters;
  }
  if (band != null) {
    filters.push({ field: "band_id", value: band });
    return filters;
  }
  if (bab != null) {
    if (bab === PROGRAMS_SELECT_BAB_REQUIRES_BAND_ID) {
      return null;
    }
    filters.push({ field: "bab_id", value: bab });
    return filters;
  }
  return null;
}

/** جاهزية النطاق لاستدعاء `getAll` (سنة + مستوى حساب صالح) */
export function programsSelectScopeReady(
  scope: ProgramsSelectScope,
): boolean {
  return buildProgramsSelectFilters(scope) != null;
}

/** برامج حسب سنة + باب أو بند أو حساب تفصيلي — لقوائم الاختيار */
export function useProgramsSelect(scope: ProgramsSelectScope) {
  const filters = useMemo(
    () => buildProgramsSelectFilters(scope),
    [scope.yearId, scope.babId, scope.bandId, scope.detailedId],
  );

  const { isLoading, data, error, isError } = useQuery<ProgramsWithRelations[]>({
    queryKey: [
      "programs",
      "for_select",
      scope.yearId,
      scope.babId,
      scope.bandId,
      scope.detailedId,
    ],
    queryFn: () => getAll(filters!),
    enabled: filters != null && filters.length >= 2,
    retry: false,
  });

  return { isLoading, data, error, isError };
}

export function useUpdateProgram() {
  const queryClient = useQueryClient();

  const { mutate: updateProgram, isPending: isEditing } = useMutation({
    mutationFn: ({
      newEditData,
      id,
    }: {
      newEditData: UpdateProgramInput;
      id: number;
    }) => createUpdateProgram(newEditData, id),
    onSuccess: () => {
      toast.success("تم تعديل النشاط بنجاح");
      void queryClient.invalidateQueries({ queryKey: ["programs"] });
    },
    onError: (err: Error) => {
      toast.error(err?.message || "حدث خطأ");
    },
  });

  return { isEditing, updateProgram };
}

export function useDeleteProgram() {
  const queryClient = useQueryClient();

  const { isPending: isDeleting, mutate: deleteProgram } = useMutation({
    mutationFn: (id: number) => deleteProgramAPI(id),
    onSuccess: () => {
      toast.success("تم حذف النشاط بنجاح");
      void queryClient.invalidateQueries({ queryKey: ["programs"] });
    },
    onError: (err: Error) => {
      toast.error(err?.message || "حدث خطأ");
    },
  });

  return { isDeleting, deleteProgram };
}

export function useProgramsForCurrentYear() {
  const { data, error, isLoading } = useQuery({
    queryKey: ["programs_for_current_year"],
    queryFn: async () => {
      const { data: rows, error: rpcError } = await supabase.rpc(
        "get_programs_for_current_year",
      );
      if (rpcError) throw rpcError;
      return rows;
    },
    retry: false,
  });

  return { isLoading, data, error };
}
