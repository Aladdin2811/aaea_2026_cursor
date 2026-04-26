import { useMemo, useState, type ReactNode } from "react";
import { type VacationsBalancesWithRelations } from "../../../api/apiVacationsBalances";
import ActiveYearSelect from "../../../components/select/ActiveYearSelect";
import {
  DataTable,
  type DataTableColumn,
} from "../../../components/ui/data-table";
import { formatOptionalText, stringValue } from "../../../lib/displayValue";
import { useFetchCurrentYear } from "../../years/currentYear/useCurrentYear";
import { useFetchVacationsBalances } from "./useVacationsBalances";

function firstEmbed<T>(v: T | T[] | null | undefined): T | null {
  if (v == null) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

function displayBalance(v: string | number | null | undefined): string {
  if (v == null) return "—";
  if (typeof v === "number" && !Number.isFinite(v)) return "—";
  const s = String(v).trim();
  return s === "" ? "—" : s;
}

const columns: DataTableColumn<VacationsBalancesWithRelations>[] = [
  // {
  //   id: "year",
  //   header: "السنة",
  //   className: "min-w-20",
  //   thClassName: "!whitespace-normal text-center",
  //   cell: (row) => (
  //     <span className="tabular-nums text-slate-800">
  //       {formatOptionalText(firstEmbed(row.years)?.year_num)}
  //     </span>
  //   ),
  //   getSortValue: (r) => stringValue(firstEmbed(r.years)?.year_num),
  //   contentAlign: "center",
  // },
  {
    id: "employee_name",
    header: "اسم الموظف",
    className: "min-w-40",
    cell: (row) => (
      <span className="min-w-0 font-medium text-slate-900">
        {formatOptionalText(firstEmbed(row.all_employees)?.employee_name)}
      </span>
    ),
    getSortValue: (r) =>
      stringValue(firstEmbed(r.all_employees)?.employee_name),
  },
  // {
  //   id: "fingerprint",
  //   header: "رقم البصمة",
  //   className: "min-w-24",
  //   thClassName: "!whitespace-normal text-center",
  //   cell: (row) => {
  //     const fp = firstEmbed(row.all_employees)?.fingerprint_id;
  //     return (
  //       <span className="tabular-nums text-slate-800">
  //         {fp != null ? fp : "—"}
  //       </span>
  //     );
  //   },
  //   getSortValue: (r) =>
  //     firstEmbed(r.all_employees)?.fingerprint_id ?? -Infinity,
  //   contentAlign: "center",
  // },
  {
    id: "vacations_balance",
    header: "الرصيد",
    className: "min-w-24",
    thClassName: "!whitespace-normal text-center",
    cell: (row) => (
      <span className="tabular-nums text-slate-800">
        {displayBalance(row.vacations_balance)}
      </span>
    ),
    getSortValue: (r) => {
      const v = r.vacations_balance;
      if (v == null) return -Infinity;
      const n = typeof v === "number" ? v : Number(v);
      return Number.isFinite(n) ? n : stringValue(v);
    },
    contentAlign: "center",
  },
  {
    id: "regular",
    header: "اعتيادي",
    className: "min-w-20",
    thClassName: "!whitespace-normal text-center",
    cell: (row) => (
      <span className="tabular-nums text-slate-800">
        {displayBalance(row.regular)}
      </span>
    ),
    getSortValue: (r) => {
      const v = r.regular;
      if (v == null) return -Infinity;
      const n = typeof v === "number" ? v : Number(v);
      return Number.isFinite(n) ? n : stringValue(v);
    },
    contentAlign: "center",
  },
  {
    id: "adventitious",
    header: "عارض",
    className: "min-w-20",
    thClassName: "!whitespace-normal text-center",
    cell: (row) => (
      <span className="tabular-nums text-slate-800">
        {displayBalance(row.adventitious)}
      </span>
    ),
    getSortValue: (r) => {
      const v = r.adventitious;
      if (v == null) return -Infinity;
      const n = typeof v === "number" ? v : Number(v);
      return Number.isFinite(n) ? n : stringValue(v);
    },
    contentAlign: "center",
  },
  {
    id: "sick",
    header: "مرضي",
    className: "min-w-20",
    thClassName: "!whitespace-normal text-center",
    cell: (row) => (
      <span className="tabular-nums text-slate-800">
        {displayBalance(row.sick)}
      </span>
    ),
    getSortValue: (r) => {
      const v = r.sick;
      if (v == null) return -Infinity;
      const n = typeof v === "number" ? v : Number(v);
      return Number.isFinite(n) ? n : stringValue(v);
    },
    contentAlign: "center",
  },
  {
    id: "notes",
    header: "ملاحظات",
    className: "min-w-36",
    cell: (row) => (
      <span className="text-slate-700">{formatOptionalText(row.notes)}</span>
    ),
    getSortValue: (r) => stringValue(r.notes),
  },
];

function ToolbarCount({ n }: { n: number }): ReactNode {
  return (
    <p className="text-sm text-slate-600">
      عدد السجلات:{" "}
      <span className="font-medium tabular-nums text-slate-800">{n}</span>
    </p>
  );
}

export default function VacationsBalancesTable() {
  const [selectedYearId, setSelectedYearId] = useState<number | null>(null);
  const { data: currentYearRow, isLoading: loadingCurrentYear } =
    useFetchCurrentYear();

  const resolvedYearId = useMemo((): number | null => {
    if (selectedYearId != null) return selectedYearId;
    const id = currentYearRow?.year_id;
    if (id != null && id > 0) return id;
    return null;
  }, [selectedYearId, currentYearRow?.year_id]);

  const fetchEnabled = resolvedYearId != null;
  const { isLoading, isFetching, data, error, isError } =
    useFetchVacationsBalances(
      fetchEnabled ? { year_id: resolvedYearId! } : undefined,
      { enabled: fetchEnabled },
    );

  const yearContextLoading = selectedYearId == null && loadingCurrentYear;
  const listLoading = fetchEnabled && (isLoading || isFetching);
  const tableLoading = yearContextLoading || listLoading;

  const rows = data ?? [];

  if (isError) {
    return (
      <p dir="rtl" className="text-destructive" role="alert">
        {error instanceof Error ? error.message : "حدث خطأ أثناء التحميل"}
      </p>
    );
  }

  return (
    <div className="space-y-2" dir="rtl">
      <DataTable<VacationsBalancesWithRelations>
        data={rows}
        columns={columns}
        isLoading={tableLoading}
        loadingMessage="جاري تحميل أرصدة الإجازات…"
        emptyMessage="لا توجد أرصدة إجازات للعرض لهذا العام."
        getRowId={(row) => row.id}
        showIndex
        indexHeader="#"
        toolbar={
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
            <div className="relative z-[25] w-fit max-w-full min-w-0">
              <ActiveYearSelect
                value={resolvedYearId}
                onChange={(id) => {
                  setSelectedYearId(id);
                }}
                disabled={selectedYearId == null && loadingCurrentYear}
                labelPosition="inline"
                placeholder="اختر العام المالي"
                aria-label="تصفية أرصدة الإجازات حسب العام المالي"
              />
            </div>
            {!tableLoading && rows.length > 0 ? (
              <ToolbarCount n={rows.length} />
            ) : null}
          </div>
        }
        caption="جدول أرصدة الإجازات"
        density="comfortable"
        minTableWidth="min(100%, 960px)"
      />
    </div>
  );
}
