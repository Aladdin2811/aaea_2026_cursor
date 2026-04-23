import { supabase } from "../lib/supabase";
import type { MonthsRow } from "./apiMonths";
import type { YearsRow } from "./apiYears";

export type ExchangeRatesRow = {
  id: number;
  exchange_rate_day: string | null;
  usd: number | null;
  eur: number | null;
  exchange_rate_month: number | null;
  exchange_rate_year: number | null;
  months: MonthsRow | null;
  years: YearsRow | null;
};

const selectExchangeRatesWithRelations = `
  id,
  exchange_rate_day,
  usd,
  eur,
  exchange_rate_month,
  exchange_rate_year,
  months (
    id,
    month_name1,
    month_name2,
    month_name3,
    month_name4,
    month_name5,
    month_num,
    days_count
  ),
  years (
    id,
    year_num,
    status
  )
`;

export async function getAll(): Promise<ExchangeRatesRow[]> {
  const { data, error } = await supabase
    .from("exchange_rates")
    .select(selectExchangeRatesWithRelations)
    .order("exchange_rate_day", { ascending: false });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على أسعار الصرف");
  }
  return (data as unknown as ExchangeRatesRow[] | null) ?? [];
}

export type ExchangeRateBriefRow = {
  id: number;
  exchange_rate_day: string | null;
  usd: number | null;
  eur: number | null;
  exchange_rate_month: number | null;
  exchange_rate_year: number | null;
};

const selectExchangeRateBrief =
  "id, exchange_rate_day, usd, eur, exchange_rate_month, exchange_rate_year";

export async function getCurrencyRateByYear(
  yearId: number,
): Promise<ExchangeRatesRow[]> {
  const { data, error } = await supabase
    .from("exchange_rates")
    .select(selectExchangeRatesWithRelations)
    .eq("exchange_rate_year", yearId)
    .order("exchange_rate_day", { ascending: false });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على أسعار الصرف");
  }
  return (data as unknown as ExchangeRatesRow[] | null) ?? [];
}

export async function getCurrencyRateByDay(
  day: string,
): Promise<ExchangeRateBriefRow[]> {
  const { data, error } = await supabase
    .from("exchange_rates")
    .select(selectExchangeRateBrief)
    .eq("exchange_rate_day", day);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على أسعار الصرف");
  }
  return (data as unknown as ExchangeRateBriefRow[] | null) ?? [];
}

export async function getLastCurrencyRate(): Promise<ExchangeRateBriefRow[]> {
  const { data, error } = await supabase
    .from("exchange_rates")
    .select(selectExchangeRateBrief)
    .order("exchange_rate_day", { ascending: false })
    .limit(1);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على أسعار الصرف");
  }
  return (data as unknown as ExchangeRateBriefRow[] | null) ?? [];
}

export type CreateExchangeRatePayload = Record<string, unknown> & {
  exchange_rate_day: string;
};

export async function createCurrencyRate(
  newCurrencyRate: CreateExchangeRatePayload,
): Promise<ExchangeRateBriefRow> {
  const rateDate = new Date(newCurrencyRate.exchange_rate_day);
  const year = rateDate.getFullYear();

  const { data: existingData, error: checkError } = await supabase
    .from("exchange_rates")
    .select("id")
    .eq("exchange_rate_day", newCurrencyRate.exchange_rate_day)
    .limit(1);

  if (checkError) {
    console.error("Supabase error during check:", checkError);
    throw new Error("حدث خطأ أثناء التحقق من التاريخ");
  }

  if (existingData && existingData.length > 0) {
    const formattedDate = `${String(rateDate.getDate()).padStart(
      2,
      "0",
    )}-${String(rateDate.getMonth() + 1).padStart(
      2,
      "0",
    )}-${rateDate.getFullYear()}`;
    throw new Error(
      `تم تسجيل أسعار الصرف مسبقاً لهذا التاريخ (${formattedDate})`,
    );
  }

  const { data: maxData, error: maxError } = await supabase
    .from("exchange_rates")
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error("Supabase error getting max id:", maxError);
    throw new Error("حدث خطأ أثناء جلب أكبر قيمة للـ id");
  }

  const nextId = maxData?.length ? maxData[0].id + 1 : 1;

  const recordToInsert = {
    id: nextId,
    ...newCurrencyRate,
    year,
  };

  const { data, error } = await supabase
    .from("exchange_rates")
    .insert([recordToInsert])
    .select(selectExchangeRateBrief)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند تسجيل أسعار الصرف الجديدة");
  }
  return data as unknown as ExchangeRateBriefRow;
}
