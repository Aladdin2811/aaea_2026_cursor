import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getActiveYears,
  getActiveYears2,
  getAll,
  updateYear as updateYearAPI,
  type YearUpdatePayload,
  type YearsRow,
} from "../../../api/apiYears";

export function useFetchYears() {
  const { isLoading, data, error, isError } = useQuery<YearsRow[]>({
    queryKey: ["years"],
    queryFn: getAll,
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
      updatedData: YearUpdatePayload;
      id: number | string;
    }) => updateYearAPI(updatedData, id),
    onSuccess: () => {
      toast.success("تم تعديل بيانات السنة بنجاح");
      void queryClient.invalidateQueries({ queryKey: ["years"] });
      void queryClient.invalidateQueries({ queryKey: ["activ_years"] });
      void queryClient.invalidateQueries({ queryKey: ["activ_years2"] });
    },
    onError: (err: Error) => {
      toast.error(err?.message ?? "حدث خطأ");
    },
  });

  return { isUpdating, updateYear };
}
