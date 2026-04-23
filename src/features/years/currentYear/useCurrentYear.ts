import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getCurrentYear,
  updateCurrentYear as updateCurrentYearAPI,
  type CurrentYearUpdatePayload,
  type CurrentYearWithRelations,
} from "../../../api/apiCurrentYear";

export function useFetchCurrentYear() {
  const { isLoading, data, error, isError } =
    useQuery<CurrentYearWithRelations | null>({
      queryKey: ["current_year"],
      queryFn: getCurrentYear,
      retry: false,
    });

  return { isLoading, data, error, isError };
}

export function useUpdateCurrentYear() {
  const queryClient = useQueryClient();

  const { mutate: updateCurrentYear, isPending: isUpdating } = useMutation({
    mutationFn: (payload: CurrentYearUpdatePayload) =>
      updateCurrentYearAPI(payload),
    onSuccess: () => {
      toast.success("تم تعديل العام المالي الحالي بنجاح");
      void queryClient.invalidateQueries({ queryKey: ["current_year"] });
      void queryClient.invalidateQueries({ queryKey: ["years"] });
      void queryClient.invalidateQueries({ queryKey: ["activ_years"] });
      void queryClient.invalidateQueries({ queryKey: ["activ_years2"] });
    },
    onError: (err: Error) => {
      toast.error(err?.message ?? "حدث خطأ");
    },
  });

  return { isUpdating, updateCurrentYear };
}
