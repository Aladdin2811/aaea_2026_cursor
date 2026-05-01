import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getActiveYears,
  getActiveYears2,
  getAll,
  updateYear as updateYearAPI,
  type UpdateYearsInput,
  type YearsRow,
} from "../../../api/apiYears";

export function useFetchYears() {
  const { isLoading, data, error, isError } = useQuery<YearsRow[]>({
    queryKey: ["years"],
    queryFn: () => getAll(),
    retry: false,
  });

  return { isLoading, data, error, isError };
}

export function useFetchActivYears() {
  const { isLoading, data, error, isError } = useQuery<YearsRow[]>({
    queryKey: ["activ_years"],
    queryFn: getActiveYears,
    retry: false,
  });

  return { isLoading, data, error, isError };
}

export function useFetchActivYears2() {
  const { isLoading, data, error, isError } = useQuery<YearsRow[]>({
    queryKey: ["activ_years2"],
    queryFn: getActiveYears2,
    retry: false,
  });

  return { isLoading, data, error, isError };
}

export function useUpdateYear() {
  const queryClient = useQueryClient();

  const { mutate: updateYear, isPending: isUpdating } = useMutation({
    mutationFn: ({
      updatedData,
      id,
    }: {
      updatedData: UpdateYearsInput;
      id: number | string;
    }) => updateYearAPI(id, updatedData),
    onMutate: async ({ id, updatedData }) => {
      const rowId = Number(id);
      const keys = [["years"], ["activ_years"], ["activ_years2"]] as const;

      const previous = keys.map((key) => ({
        key,
        data: queryClient.getQueryData<YearsRow[]>(key),
      }));

      for (const { key } of previous) {
        queryClient.setQueryData<YearsRow[]>(key, (old) => {
          if (!old) return old;
          return old.map((row) =>
            row.id === rowId ? { ...row, ...updatedData } : row,
          );
        });
      }

      return { previous };
    },
    onSuccess: () => {
      toast.success("تم تعديل بيانات السنة بنجاح");
      void queryClient.invalidateQueries({ queryKey: ["years"] });
      void queryClient.invalidateQueries({ queryKey: ["activ_years"] });
      void queryClient.invalidateQueries({ queryKey: ["activ_years2"] });
    },
    onError: (err: Error, _vars, ctx) => {
      if (ctx?.previous) {
        for (const item of ctx.previous) {
          queryClient.setQueryData(item.key, item.data);
        }
      }
      toast.error(err?.message ?? "حدث خطأ");
    },
  });

  return { isUpdating, updateYear };
}
