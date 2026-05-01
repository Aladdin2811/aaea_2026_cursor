import { supabase } from "../lib/supabase";

export type ExchangeRatesRow = {
  id: number;
  exchange_rate_day: string;
  usd: string | number;
  eur: string | number;
  year: number;
};

const selectExchangeRatesColumns = `
  id,
  exchange_rate_day,
  usd,
  eur,
  year
`;

function parseNumericId(
  value: number | string,
  fieldLabel = "المعرّف",
): number {
  const n = typeof value === "string" ? Number(value) : value;
  if (typeof n !== "number" || !Number.isFinite(n)) {
    throw new Error(`${fieldLabel} غير صالح`);
  }
  return n;
}

/** يحوّل `years.id` إلى سنة ميلادية عبر `year_num` ليطابق عمود `exchange_rates.year`. */
async function calendarYearFromYearsRowId(yearsRowId: number): Promise<number> {
  const { data, error } = await supabase
    .from("years")
    .select("year_num")
    .eq("id", yearsRowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن تحديد السنة المحاسبية");
  }
  if (data?.year_num == null || String(data.year_num).trim() === "") {
    throw new Error("السنة المحاسبية غير معرّفة");
  }
  const n = Number.parseInt(String(data.year_num).trim(), 10);
  if (!Number.isFinite(n)) {
    throw new Error("تنسيق سنة غير صالح");
  }
  return n;
}

export async function getAll(): Promise<ExchangeRatesRow[]> {
  const { data, error } = await supabase
    .from("exchange_rates")
    .select(selectExchangeRatesColumns)
    .order("exchange_rate_day", { ascending: false });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على أسعار الصرف");
  }
  return (data as unknown as ExchangeRatesRow[] | null) ?? [];
}

export type ExchangeRateBriefRow = ExchangeRatesRow;

export async function getCurrencyRateByYear(
  yearId: number,
): Promise<ExchangeRatesRow[]> {
  const calendarYear = await calendarYearFromYearsRowId(yearId);

  const { data, error } = await supabase
    .from("exchange_rates")
    .select(selectExchangeRatesColumns)
    .eq("year", calendarYear)
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
    .select(selectExchangeRatesColumns)
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
    .select(selectExchangeRatesColumns)
    .order("exchange_rate_day", { ascending: false })
    .limit(1);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على أسعار الصرف");
  }
  return (data as unknown as ExchangeRateBriefRow[] | null) ?? [];
}

export type CreateExchangeRatePayload = {
  exchange_rate_day: string;
  usd: string | number;
  eur: string | number;
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

  const recordToInsert = {
    ...newCurrencyRate,
    year,
  };

  const { data, error } = await supabase
    .from("exchange_rates")
    .insert(recordToInsert)
    .select(selectExchangeRatesColumns)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند تسجيل أسعار الصرف الجديدة");
  }
  return data as unknown as ExchangeRateBriefRow;
}

export async function getExchangeRateById(
  id: number | string,
): Promise<ExchangeRatesRow> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from("exchange_rates")
    .select(selectExchangeRatesColumns)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على سعر الصرف");
  }
  return data as unknown as ExchangeRatesRow;
}

export type UpdateExchangeRatePayload = Partial<
  Pick<ExchangeRatesRow, "exchange_rate_day" | "usd" | "eur" | "year">
>;

export type ExchangeRateCaptureResult = {
  status: string;
  message: string;
};

export async function updateExchangeRate(
  id: number | string,
  patch: UpdateExchangeRatePayload,
): Promise<ExchangeRatesRow> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from("exchange_rates")
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectExchangeRatesColumns)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل سعر الصرف");
  }
  return data as unknown as ExchangeRatesRow;
}

export async function deleteExchangeRate(id: number | string): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم السجل");

  const { data, error } = await supabase
    .from("exchange_rates")
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف سعر الصرف");
  }
  return data;
}

export async function captureStbAchatNow(): Promise<ExchangeRateCaptureResult> {
  const { data, error } = await supabase.functions.invoke("fetch-stb-achat", {
    body: { attempt_no: 1 },
  });
  if (error) {
    console.error(error);
    throw new Error(
      "تعذّر تنفيذ الجلب اليدوي. تأكد من نشر Edge Function: fetch-stb-achat",
    );
  }
  const first = data as ExchangeRateCaptureResult | null;
  return {
    status: first?.status ?? "unknown",
    message: first?.message ?? "تم التنفيذ",
  };
}
