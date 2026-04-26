import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createCurrencyRate,
  getAll,
  getCurrencyRateByDay,
  getCurrencyRateByYear,
  getLastCurrencyRate,
  type ExchangeRateBriefRow,
  type ExchangeRatesRow,
} from "../../api/apiExchangeRates";

export function useFetchExchangeRates() {
  const { isLoading, data, error, isError } = useQuery<ExchangeRatesRow[]>({
    queryKey: ["all_exchange_rates"],
    queryFn: () => getAll(),
    retry: false,
  });

  return { isLoading, data, error, isError };
}

export function useFetchExchangeRatesByYear(yearId: number | null) {
  const { isLoading, data, error, isError } = useQuery<ExchangeRatesRow[]>({
    queryKey: ["exchange_rates", yearId],
    queryFn: () => getCurrencyRateByYear(yearId as number),
    enabled:
      yearId != null && Number.isFinite(yearId) && yearId > 0,
    retry: false,
  });

  return { isLoading, data, error, isError };
}

export function useExchangeRatesByDay(day: string | null) {
  const { isLoading, data, error, isError } = useQuery<ExchangeRateBriefRow[]>({
    queryKey: ["exchange_rates_by_day", day],
    queryFn: () => getCurrencyRateByDay(day as string),
    enabled: !!day?.trim(),
    retry: false,
  });

  return { isLoading, data, error, isError };
}

export function useLastExchangeRate() {
  const { isLoading, data, error, isError } = useQuery<ExchangeRateBriefRow[]>({
    queryKey: ["last_exchange_rates"],
    queryFn: getLastCurrencyRate,
    retry: false,
  });

  return { isLoading, data, error, isError };
}

export function useCreateExchangeRate() {
  const queryClient = useQueryClient();

  const { mutate: createExchangeRate, isPending: isCreating } = useMutation({
    mutationFn: createCurrencyRate,
    onSuccess: () => {
      toast.success("تم تسجيل أسعار الصرف الجديدة بنجاح");
      void queryClient.invalidateQueries({ queryKey: ["exchange_rates"] });
      void queryClient.invalidateQueries({ queryKey: ["all_exchange_rates"] });
      void queryClient.invalidateQueries({ queryKey: ["last_exchange_rates"] });
      void queryClient.invalidateQueries({ queryKey: ["exchange_rates_by_day"] });
    },
    onError: (err: Error) => {
      toast.error(err?.message || "حدث خطأ");
    },
  });
  return { isCreating, createExchangeRate };
}
