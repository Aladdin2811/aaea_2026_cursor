import { useMemo } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useFetchExchangeRatesByYear } from "./useExchangeRates";

type ChartPoint = {
  dateKey: string;
  label: string;
  usd: number | null;
  eur: number | null;
};

function toFiniteNumber(
  value: string | number | null | undefined,
): number | null {
  if (value == null || value === "") return null;
  const n = typeof value === "string" ? Number.parseFloat(value) : value;
  return Number.isFinite(n) ? n : null;
}

function formatDayLabel(isoDay: string): string {
  const d = new Date(`${isoDay}T12:00:00`);
  if (Number.isNaN(d.getTime())) return isoDay;
  return d.toLocaleDateString("ar-TN", {
    day: "numeric",
    month: "short",
  });
}

type Props = {
  /** `years.id` كما في `ActiveYearSelect` — يُحوَّل داخلياً إلى سنة ميلادية للاستعلام */
  yearId: number | null;
};

export default function DashboardExchangeRatesChart({ yearId }: Props) {
  const { isLoading, data, isError } = useFetchExchangeRatesByYear(yearId);

  const chartData = useMemo((): ChartPoint[] => {
    const rows = data ?? [];
    const points: ChartPoint[] = [];
    for (const row of rows) {
      const usd = toFiniteNumber(row.usd);
      const eur = toFiniteNumber(row.eur);
      if (usd == null && eur == null) continue;
      points.push({
        dateKey: row.exchange_rate_day,
        label: formatDayLabel(row.exchange_rate_day),
        usd,
        eur,
      });
    }
    points.sort((a, b) => a.dateKey.localeCompare(b.dateKey));
    return points;
  }, [data]);

  if (yearId == null) {
    return (
      <div
        dir="rtl"
        className="rounded-2xl border border-slate-200/80 bg-white p-6 text-center text-sm text-slate-600 shadow-sm"
      >
        اختر السنة المالية لعرض منحنى سعر الصرف.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        dir="rtl"
        className="rounded-2xl border border-slate-200/80 bg-white p-8 text-center text-sm text-slate-600 shadow-sm"
      >
        جاري تحميل أسعار الصرف…
      </div>
    );
  }

  if (isError) {
    return (
      <div
        dir="rtl"
        className="rounded-2xl border border-red-200 bg-red-50/80 p-6 text-center text-sm text-red-800 shadow-sm"
        role="alert"
      >
        تعذّر تحميل بيانات أسعار الصرف لهذه السنة.
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div
        dir="rtl"
        className="rounded-2xl border border-slate-200/80 bg-white p-6 text-center text-sm text-slate-600 shadow-sm"
      >
        لا توجد بيانات أسعار صرف مسجّلة لهذه السنة (دولار / يورو مقابل الدينار
        التونسي).
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-200/40 sm:p-5"
    >
      <p className="mt-0.5 text-xs text-slate-500">
        الدولار الأمريكي واليورو — حسب أيام التسجيل خلال السنة المختارة
      </p>
      <div className="mt-4 h-72 w-full min-w-0" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 8, right: 12, left: 4, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "#64748b" }}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#64748b" }}
              domain={["auto", "auto"]}
              tickFormatter={(v) =>
                typeof v === "number" ? v.toLocaleString("en-US") : String(v)
              }
            />
            <Tooltip
              formatter={(value, name) => {
                const num =
                  typeof value === "number"
                    ? value
                    : value != null && value !== ""
                      ? Number.parseFloat(String(value))
                      : NaN;
                const text = Number.isFinite(num)
                  ? num.toLocaleString("ar-TN", {
                      minimumFractionDigits: 3,
                      maximumFractionDigits: 4,
                    })
                  : "—";
                const label =
                  String(name) === "usd" ? "دولار (USD)" : "يورو (EUR)";
                return [text, label];
              }}
              labelFormatter={(_, payload) =>
                payload?.[0]?.payload?.dateKey != null
                  ? String(payload[0].payload.dateKey)
                  : ""
              }
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                fontSize: 12,
              }}
            />
            <Legend
              formatter={(value) =>
                value === "usd" ? "دولار أمريكي / د.ت" : "يورو / د.ت"
              }
              wrapperStyle={{ fontSize: 12 }}
            />
            <Line
              type="monotone"
              dataKey="usd"
              name="usd"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ r: 2.5 }}
              activeDot={{ r: 4 }}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="eur"
              name="eur"
              stroke="#d97706"
              strokeWidth={2}
              dot={{ r: 2.5 }}
              activeDot={{ r: 4 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
