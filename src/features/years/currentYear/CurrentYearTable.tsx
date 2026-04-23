import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { CurrentYearWithRelations } from "../../../api/apiCurrentYear";
import type { YearsRow } from "../../../api/apiYears";
import {
  DataTable,
  type DataTableColumn,
} from "../../../components/ui/data-table";
import { formatOptionalText, stringValue } from "../../../lib/displayValue";
import { useFetchActivYears } from "../year/useYears";
import { useFetchCurrentYear, useUpdateCurrentYear } from "./useCurrentYear";

function pickFirst<T>(e: T | T[] | null | undefined): T | null {
  if (e == null) return null;
  return Array.isArray(e) ? (e[0] ?? null) : e;
}

const columns: DataTableColumn<CurrentYearWithRelations>[] = [
  {
    id: "year",
    header: "العام المالي الحالي",
    className: "min-w-40",
    thClassName: "!whitespace-normal",
    cell: (row) => {
      const y = pickFirst(row.years);
      return (
        <span className="block font-mono text-base font-semibold tabular-nums text-slate-900">
          {formatOptionalText(y?.year_num ?? null)}
        </span>
      );
    },
    getSortValue: (r) => stringValue(pickFirst(r.years)?.year_num),
    contentAlign: "center",
  },
  // {
  //   id: "status",
  //   header: "حالة السنة في السجل",
  //   className: "min-w-28",
  //   thClassName: "!whitespace-normal text-center",
  //   cell: (row) => (
  //     <TableStatusBadge value={pickFirst(row.years)?.status ?? null} />
  //   ),
  //   getSortValue: (r) => stringValue(pickFirst(r.years)?.status),
  //   contentAlign: "center",
  // },
];

function YearPickerToolbar({
  years,
  draftYearId,
  onDraftChange,
  onSave,
  canSave,
  isUpdating,
}: {
  years: YearsRow[];
  draftYearId: string;
  onDraftChange: (id: string) => void;
  onSave: () => void;
  canSave: boolean;
  isUpdating: boolean;
}): ReactNode {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3" dir="rtl">
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:flex-row sm:items-end">
        <label className="block min-w-0 flex-1 text-sm text-slate-600">
          <span className="mb-1 block font-medium text-slate-800">
            اختيار العام المالي الحالي
          </span>
          <select
            className="w-full max-w-xs rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-emerald-500/20 focus:border-emerald-400 focus:ring-2"
            value={draftYearId}
            onChange={(e) => onDraftChange(e.target.value)}
            disabled={isUpdating || years.length === 0}
          >
            <option value="">— اختر سنة —</option>
            {years.map((y) => (
              <option key={y.id} value={String(y.id)}>
                {formatOptionalText(y.year_num) || `سنة #${y.id}`}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="inline-flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-emerald-900/20 transition-opacity hover:opacity-95 disabled:pointer-events-none disabled:opacity-50"
          disabled={!canSave || isUpdating}
          onClick={onSave}
        >
          {isUpdating ? "جاري الحفظ…" : "حفظ"}
        </button>
      </div>
    </div>
  );
}

export default function CurrentYearTable() {
  const { isLoading, data, error, isError } = useFetchCurrentYear();
  const { data: activeYears = [], isLoading: yearsLoading } =
    useFetchActivYears();
  const { updateCurrentYear, isUpdating } = useUpdateCurrentYear();

  const [draftYearId, setDraftYearId] = useState("");

  useEffect(() => {
    if (data?.year_id != null) {
      setDraftYearId(String(data.year_id));
    } else {
      setDraftYearId("");
    }
  }, [data]);

  const rows = useMemo(() => (data != null ? [data] : []), [data]);

  const currentYearIdStr = data?.year_id != null ? String(data.year_id) : "";

  const canSave =
    draftYearId !== "" &&
    draftYearId !== currentYearIdStr &&
    !Number.isNaN(Number(draftYearId));

  const handleSave = () => {
    if (!canSave) return;
    updateCurrentYear({ year_id: Number(draftYearId) });
  };

  if (isError) {
    return (
      <p dir="rtl" className="text-destructive" role="alert">
        {error instanceof Error ? error.message : "حدث خطأ أثناء التحميل"}
      </p>
    );
  }

  return (
    <div className="space-y-2" dir="rtl">
      <DataTable<CurrentYearWithRelations>
        data={rows}
        columns={columns}
        isLoading={isLoading || yearsLoading}
        loadingMessage="جاري تحميل بيانات العام المالي الحالي…"
        emptyMessage="لا يوجد سجل للعام المالي الحالي في قاعدة البيانات. أضف صفاً في جدول current_year أو راجع الإعدادات."
        getRowId={(row) => row.id}
        toolbar={
          data != null ? (
            <YearPickerToolbar
              years={activeYears}
              draftYearId={draftYearId}
              onDraftChange={setDraftYearId}
              onSave={handleSave}
              canSave={canSave}
              isUpdating={isUpdating}
            />
          ) : null
        }
        caption="العام المالي الحالي"
        maxHeight="min(40dvh, 320px)"
        density="comfortable"
        minTableWidth="100%"
      />
    </div>
  );
}
