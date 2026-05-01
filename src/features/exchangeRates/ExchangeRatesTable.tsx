import { useMemo, type ReactNode } from "react";
import { type ExchangeRatesRow } from "../../api/apiExchangeRates";
import { Empty } from "../../components/ui/Empty";
import { Spinner } from "../../components/ui/Spinner";
import {
  DataTable,
  type DataTableColumn,
} from "../../components/ui/data-table";
import { formatOptionalText } from "../../lib/displayValue";
import DateConverter from "../../utils/DateConverter";
import DecimalConverter from "../../utils/DecimalConverter";
import { useFetchExchangeRatesByYear } from "./useExchangeRates";
import { useExchangeRatesYearFromLocation } from "./useExchangeRatesYearFromLocation";

function rateDaySortValue(value: string): number {
  if (String(value).trim() === "") return 0;
  const t = new Date(value).getTime();
  return Number.isNaN(t) ? 0 : t;
}

// function monthLabel(row: ExchangeRatesRow): string {
//   if (String(row.exchange_rate_day).trim() === "") return "—";
//   const d = new Date(row.exchange_rate_day);
//   if (Number.isNaN(d.getTime())) return "—";
//   return new Intl.DateTimeFormat("ar-TN-u-ca-gregory-nu-arab", {
//     month: "long",
//   }).format(d);
// }

// function yearLabel(row: ExchangeRatesRow): string {
//   return new Intl.NumberFormat("ar-TN-u-nu-arab").format(row.year);
// }

const columns: DataTableColumn<ExchangeRatesRow>[] = [
  // {
  //   id: "year",
  //   header: "السنة المحاسبية",
  //   className: "min-w-28",
  //   thClassName: "!whitespace-normal text-center",
  //   cell: (row) => (
  //     <span className="block min-w-0 font-medium text-slate-900">
  //       {yearLabel(row)}
  //     </span>
  //   ),
  //   getSortValue: (r) => r.year,
  //   contentAlign: "center",
  // },
  // {
  //   id: "month",
  //   header: "الشهر",
  //   className: "min-w-40",
  //   thClassName: "!whitespace-normal",
  //   cell: (row) => (
  //     <span className="block min-w-0 whitespace-normal break-words text-slate-900">
  //       {monthLabel(row)}
  //     </span>
  //   ),
  //   getSortValue: (r) => monthLabel(r),
  // },
  {
    id: "date",
    header: "تاريخ السعر",
    className: "w-1/3 min-w-0",
    thClassName: "!whitespace-normal",
    cell: (row) => (
      <span className="block min-w-0 font-medium text-slate-900">
        <DateConverter
          dateString={row.exchange_rate_day}
          fallback={formatOptionalText(row.exchange_rate_day)}
          className="block"
          format="short"
        />
      </span>
    ),
    getSortValue: (r) => rateDaySortValue(r.exchange_rate_day),
  },
  {
    id: "usd",
    header: "USD",
    className: "w-1/3 min-w-0",
    thClassName: "!whitespace-normal text-center",
    cell: (row) => (
      <DecimalConverter
        number={row.usd}
        minimumFractionDigits={0}
        maximumFractionDigits={3}
        className="block min-w-0 font-medium tabular-nums text-slate-900"
      />
    ),
    getSortValue: (r) => r.usd ?? -Infinity,
    contentAlign: "center",
  },
  {
    id: "eur",
    header: "EUR",
    className: "w-1/3 min-w-0",
    thClassName: "!whitespace-normal text-center",
    cell: (row) => (
      <DecimalConverter
        number={row.eur}
        minimumFractionDigits={0}
        maximumFractionDigits={3}
        className="block min-w-0 font-medium tabular-nums text-slate-900"
      />
    ),
    getSortValue: (r) => r.eur ?? -Infinity,
    contentAlign: "center",
  },
];

function ToolbarCount({ n }: { n: number }): ReactNode {
  return (
    <p className="text-sm text-slate-600">
      عدد السجلات:{" "}
      <DecimalConverter
        number={n}
        decimalPlaces={0}
        className="inline font-medium tabular-nums text-slate-800"
      />
    </p>
  );
}

function monthNumberFromDay(value: string): number | null {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.getMonth() + 1;
}

export default function ExchangeRatesTable({
  selectedMonth,
}: {
  selectedMonth: number | null;
}) {
  const { yearId, yearIdFromParam, loadingCurrent } =
    useExchangeRatesYearFromLocation();
  const { isLoading, data, error, isError } =
    useFetchExchangeRatesByYear(yearId);
  const rows = useMemo(() => data ?? [], [data]);
  const filteredRows = useMemo(
    () =>
      selectedMonth == null
        ? []
        : rows
            .filter(
              (row) =>
                monthNumberFromDay(row.exchange_rate_day) === selectedMonth,
            )
            .sort(
              (a, b) =>
                rateDaySortValue(a.exchange_rate_day) -
                rateDaySortValue(b.exchange_rate_day),
            ),
    [rows, selectedMonth],
  );

  const waitingForDefaultYear = yearIdFromParam == null && loadingCurrent;
  const loadingRates = yearId != null && isLoading;

  if (waitingForDefaultYear || loadingRates) {
    return (
      <div
        className="flex min-h-[220px] items-center justify-center py-12"
        dir="rtl"
      >
        <Spinner size="lg" />
      </div>
    );
  }

  if (yearId == null) {
    return (
      <Empty
        title="لا توجد سنة محاسبية للعرض"
        description="لم يُضبَط العام المالي الحالي أو لا توجد سنوات مفعّلة. راجع إعدادات السنة الحالية والسنوات."
      />
    );
  }

  if (isError) {
    return (
      <p dir="rtl" className="text-destructive" role="alert">
        {error instanceof Error ? error.message : "حدث خطأ أثناء التحميل"}
      </p>
    );
  }

  if (!rows.length) {
    return (
      <Empty
        title="لا توجد أسعار صرف"
        description="لم يُسجَّل أي سعر صرف لهذه السنة المحاسبية."
      />
    );
  }

  return (
    <div className="space-y-2" dir="rtl">
      <DataTable<ExchangeRatesRow>
        data={filteredRows}
        columns={columns}
        isLoading={false}
        loadingMessage="جاري تحميل أسعار الصرف…"
        emptyMessage={
          selectedMonth == null
            ? "اختر الشهر لعرض أسعار الصرف."
            : "لا توجد أسعار صرف مسجّلة للشهر المحدد."
        }
        getRowId={(row) => row.id}
        showIndex
        indexHeader="#"
        toolbar={<ToolbarCount n={filteredRows.length} />}
        caption="جدول أسعار الصرف"
        density="comfortable"
        minTableWidth="100%"
      />
    </div>
  );
}
