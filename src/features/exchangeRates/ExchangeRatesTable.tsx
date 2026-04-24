import { useMemo, type ReactNode } from "react";
import { type ExchangeRatesRow } from "../../api/apiExchangeRates";
import { Empty } from "../../components/ui/Empty";
import { Spinner } from "../../components/ui/Spinner";
import {
  DataTable,
  type DataTableColumn,
} from "../../components/ui/data-table";
import { formatOptionalText, stringValue } from "../../lib/displayValue";
import DecimalConverter from "../../utils/DecimalConverter";
import { useFetchExchangeRatesByYear } from "./useExchangeRates";
import { useExchangeRatesYearFromLocation } from "./useExchangeRatesYearFromLocation";

function formatRateDate(value: string | null): string {
  if (value == null || String(value).trim() === "") return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return formatOptionalText(value);
  return new Intl.DateTimeFormat("ar-SA-u-ca-gregory", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

function rateDaySortValue(value: string | null): number {
  if (value == null || String(value).trim() === "") return 0;
  const t = new Date(value).getTime();
  return Number.isNaN(t) ? 0 : t;
}

function monthLabel(row: ExchangeRatesRow): string {
  const name = row.months?.month_name1;
  if (name != null && String(name).trim() !== "") return String(name);
  if (row.exchange_rate_month != null) {
    return `معرّف شهر ${row.exchange_rate_month}`;
  }
  return "—";
}

function yearLabel(row: ExchangeRatesRow): string {
  const y = row.years?.year_num;
  if (y != null && String(y).trim() !== "") return String(y);
  if (row.exchange_rate_year != null) {
    return `معرّف سنة ${row.exchange_rate_year}`;
  }
  return "—";
}

const columns: DataTableColumn<ExchangeRatesRow>[] = [
  {
    id: "date",
    header: "تاريخ السعر",
    className: "min-w-44",
    thClassName: "!whitespace-normal",
    cell: (row) => (
      <span className="block min-w-0 font-medium text-slate-900">
        {formatRateDate(row.exchange_rate_day)}
      </span>
    ),
    getSortValue: (r) => rateDaySortValue(r.exchange_rate_day),
  },
  {
    id: "month",
    header: "الشهر",
    className: "min-w-40",
    thClassName: "!whitespace-normal",
    cell: (row) => (
      <span className="block min-w-0 whitespace-normal break-words text-slate-900">
        {monthLabel(row)}
      </span>
    ),
    getSortValue: (r) =>
      stringValue(r.months?.month_name1 ?? r.exchange_rate_month),
  },
  {
    id: "year",
    header: "السنة المحاسبية",
    className: "min-w-28",
    thClassName: "!whitespace-normal text-center",
    cell: (row) => (
      <span className="block min-w-0 font-medium text-slate-900">
        {yearLabel(row)}
      </span>
    ),
    getSortValue: (r) => stringValue(r.years?.year_num ?? r.exchange_rate_year),
    contentAlign: "center",
  },
  {
    id: "usd",
    header: "USD",
    className: "min-w-24 w-28",
    thClassName: "!whitespace-normal text-center",
    cell: (row) => (
      <DecimalConverter
        number={row.usd}
        minimumFractionDigits={0}
        maximumFractionDigits={4}
        className="block min-w-0 font-medium tabular-nums text-slate-900"
      />
    ),
    getSortValue: (r) => r.usd ?? -Infinity,
    contentAlign: "center",
  },
  {
    id: "eur",
    header: "EUR",
    className: "min-w-24 w-28",
    thClassName: "!whitespace-normal text-center",
    cell: (row) => (
      <DecimalConverter
        number={row.eur}
        minimumFractionDigits={0}
        maximumFractionDigits={4}
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

export default function ExchangeRatesTable() {
  const { yearId, yearIdFromParam, loadingCurrent } =
    useExchangeRatesYearFromLocation();
  const { isLoading, data, error, isError } =
    useFetchExchangeRatesByYear(yearId);
  const rows = useMemo(() => data ?? [], [data]);

  const waitingForDefaultYear =
    yearIdFromParam == null && loadingCurrent;
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
        data={rows}
        columns={columns}
        isLoading={false}
        loadingMessage="جاري تحميل أسعار الصرف…"
        emptyMessage="لا توجد أسعار صرف مسجّلة لهذه السنة."
        getRowId={(row) => row.id}
        showIndex
        indexHeader="#"
        toolbar={<ToolbarCount n={rows.length} />}
        caption="جدول أسعار الصرف"
        density="comfortable"
        minTableWidth="100%"
      />
    </div>
  );
}
