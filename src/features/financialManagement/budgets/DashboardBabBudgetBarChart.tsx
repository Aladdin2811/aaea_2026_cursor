import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type BabBudgetBarPoint = {
  /** تسمية مختصرة للباب (محور سيني) */
  name: string;
  /** إجمالي الإعتمادات للباب */
  commitment: number;
  /** إجمالي المنصرف */
  spent: number;
};

type Props = {
  yearId: number | null;
  points: BabBudgetBarPoint[];
  isLoading: boolean;
  hasError: boolean;
};

function formatTooltipValue(value: unknown): string {
  const n =
    typeof value === "number"
      ? value
      : value != null && value !== ""
        ? Number.parseFloat(String(value))
        : NaN;
  return Number.isFinite(n)
    ? n.toLocaleString("ar-TN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "—";
}

export default function DashboardBabBudgetBarChart({
  yearId,
  points,
  isLoading,
  hasError,
}: Props) {
  if (yearId == null) {
    return (
      <div
        dir="rtl"
        className="rounded-2xl border border-slate-200/80 bg-white p-6 text-center text-sm text-slate-600 shadow-sm"
      >
        اختر السنة المالية لعرض مخطط أبواب الإعتماد والمنصرف.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        dir="rtl"
        className="rounded-2xl border border-slate-200/80 bg-white p-8 text-center text-sm text-slate-600 shadow-sm"
      >
        جاري تحميل بيانات الأبواب…
      </div>
    );
  }

  if (hasError) {
    return (
      <div
        dir="rtl"
        className="rounded-2xl border border-red-200 bg-red-50/80 p-6 text-center text-sm text-red-800 shadow-sm"
        role="alert"
      >
        تعذّر تحميل بيانات الإعتماد أو المنصرف لأحد الأبواب.
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-200/40 sm:p-5"
    >
      <h3 className="text-base font-semibold text-slate-900">
        الإعتمادات والمنصرف حسب الأبواب
      </h3>
      <p className="mt-0.5 text-xs text-slate-500">
        مقارنة إجمالي الإعتماد المدرج مع إجمالي المنصرف لكل باب خلال السنة المختارة
      </p>
      <div className="mt-4 h-80 w-full min-w-0" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={points}
            margin={{ top: 8, right: 12, left: 8, bottom: 72 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: "#64748b" }}
              angle={-32}
              textAnchor="end"
              height={88}
              interval={0}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#64748b" }}
              tickFormatter={(v) =>
                typeof v === "number" ? v.toLocaleString("en-US") : String(v)
              }
            />
            <Tooltip
              formatter={(value, name) => [
                formatTooltipValue(value),
                String(name) === "commitment" ? "الإعتماد" : "المنصرف",
              ]}
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                fontSize: 12,
              }}
            />
            <Legend
              formatter={(value) =>
                value === "commitment" ? "الإعتماد" : "المنصرف"
              }
              wrapperStyle={{ fontSize: 12 }}
            />
            <Bar
              dataKey="commitment"
              name="commitment"
              fill="#059669"
              maxBarSize={44}
            />
            <Bar
              dataKey="spent"
              name="spent"
              fill="#ea580c"
              maxBarSize={44}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
