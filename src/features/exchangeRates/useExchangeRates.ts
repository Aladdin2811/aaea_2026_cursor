import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  captureStbAchatNow,
  createCurrencyRate,
  type CreateExchangeRatePayload,
  getAll,
  getCurrencyRateByDay,
  getCurrencyRateByYear,
  getLastCurrencyRate,
  type ExchangeRateBriefRow,
  type ExchangeRatesRow,
} from "../../api/apiExchangeRates";

const exchangeRatesKey = "exchange_rates" as const;
const exchangeRatesByDayKey = "exchange_rates_by_day" as const;
const lastExchangeRatesKey = "last_exchange_rates" as const;

export function useFetchExchangeRates() {
  const { isLoading, data, error, isError } = useQuery<ExchangeRatesRow[]>({
    queryKey: [exchangeRatesKey, "all"],
    queryFn: () => getAll(),
    retry: false,
  });

  return { isLoading, data, error, isError };
}

export function useFetchExchangeRatesByYear(yearId: number | null) {
  const { isLoading, data, error, isError } = useQuery<ExchangeRatesRow[]>({
    queryKey: [exchangeRatesKey, "by_year", yearId],
    queryFn: () => getCurrencyRateByYear(yearId as number),
    enabled:
      yearId != null && Number.isFinite(yearId) && yearId > 0,
    retry: false,
  });

  return { isLoading, data, error, isError };
}

export function useExchangeRatesByDay(day: string | null) {
  const { isLoading, data, error, isError } = useQuery<ExchangeRateBriefRow[]>({
    queryKey: [exchangeRatesByDayKey, day],
    queryFn: () => getCurrencyRateByDay(day as string),
    enabled: !!day?.trim(),
    retry: false,
  });

  return { isLoading, data, error, isError };
}

export function useLastExchangeRate() {
  const { isLoading, data, error, isError } = useQuery<ExchangeRateBriefRow[]>({
    queryKey: [lastExchangeRatesKey],
    queryFn: getLastCurrencyRate,
    retry: false,
  });

  return { isLoading, data, error, isError };
}

export function useCreateExchangeRate() {
  const queryClient = useQueryClient();

  const { mutate: createExchangeRate, isPending: isCreating } = useMutation({
    mutationFn: createCurrencyRate,
    onMutate: async (payload: CreateExchangeRatePayload) => {
      const previousAll = queryClient.getQueryData<ExchangeRatesRow[]>([
        exchangeRatesKey,
        "all",
      ]);
      const previousLast = queryClient.getQueryData<ExchangeRateBriefRow[]>([
        lastExchangeRatesKey,
      ]);
      const previousByDay = queryClient.getQueryData<ExchangeRateBriefRow[]>([
        exchangeRatesByDayKey,
        payload.exchange_rate_day,
      ]);

      const optimistic: ExchangeRateBriefRow = {
        id: -Date.now(),
        exchange_rate_day: payload.exchange_rate_day,
        usd: payload.usd,
        eur: payload.eur,
        year: new Date(payload.exchange_rate_day).getFullYear(),
      };

      queryClient.setQueryData<ExchangeRatesRow[]>(
        [exchangeRatesKey, "all"],
        (old) => [optimistic, ...(old ?? [])],
      );
      queryClient.setQueryData<ExchangeRateBriefRow[]>(
        [lastExchangeRatesKey],
        [optimistic],
      );
      queryClient.setQueryData<ExchangeRateBriefRow[]>(
        [exchangeRatesByDayKey, payload.exchange_rate_day],
        [optimistic],
      );

      return { previousAll, previousLast, previousByDay, payload };
    },
    onSuccess: () => {
      toast.success("تم تسجيل أسعار الصرف الجديدة بنجاح");
      void queryClient.invalidateQueries({ queryKey: [exchangeRatesKey] });
      void queryClient.invalidateQueries({ queryKey: [lastExchangeRatesKey] });
      void queryClient.invalidateQueries({ queryKey: [exchangeRatesByDayKey] });
    },
    onError: (err: Error, _vars, ctx) => {
      queryClient.setQueryData([exchangeRatesKey, "all"], ctx?.previousAll);
      queryClient.setQueryData([lastExchangeRatesKey], ctx?.previousLast);
      if (ctx?.payload?.exchange_rate_day) {
        queryClient.setQueryData(
          [exchangeRatesByDayKey, ctx.payload.exchange_rate_day],
          ctx.previousByDay,
        );
      }
      toast.error(err?.message || "حدث خطأ");
    },
  });
  return { isCreating, createExchangeRate };
}

export function useCaptureStbAchatNow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: captureStbAchatNow,
    onSuccess: (result) => {
      if (result.status === "inserted") {
        toast.success("تم جلب سعر الصرف اليومي بنجاح");
      } else {
        toast.info(result.message || "تم تنفيذ الجلب اليدوي");
      }
      void queryClient.invalidateQueries({ queryKey: [exchangeRatesKey] });
      void queryClient.invalidateQueries({ queryKey: [lastExchangeRatesKey] });
      void queryClient.invalidateQueries({ queryKey: [exchangeRatesByDayKey] });
    },
    onError: (err: Error) => {
      toast.error(err?.message || "تعذّر تشغيل الجلب اليدوي");
    },
  });
}
