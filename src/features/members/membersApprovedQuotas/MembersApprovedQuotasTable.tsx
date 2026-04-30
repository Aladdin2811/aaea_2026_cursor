import { useMemo, useState, type ReactNode } from "react";
import type { MembersApprovedQuotasWithRelations } from "../../../api/apiMembersApprovedQuotas";
import {
  DataTable,
  type DataTableColumn,
} from "../../../components/ui/data-table";
import { useFetchYears } from "../../years/year/useYears";
import { useFetchMembersApprovedQuotas } from "./useMembersApprovedQuotas";

function firstRelation<T>(value: T | T[] | null): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function toNumberOrNull(
  value: string | number | null | undefined,
): number | null {
  if (value == null || value === "") return null;
  const n = typeof value === "string" ? Number.parseFloat(value) : value;
  return Number.isFinite(n) ? n : null;
}

function formatNumeric(value: string | number | null | undefined): string {
  const n = toNumberOrNull(value);
  if (n == null || n === 0) return "—";
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

const columns: DataTableColumn<MembersApprovedQuotasWithRelations>[] = [
  {
    id: "member",
    header: "الدول الأعضاء بجامعة الدول العربية",
    cell: (row) => {
      const member = firstRelation(row.members);
      return (
        <span className="font-medium text-slate-900">
          {member?.member_name ?? "—"}
        </span>
      );
    },
    getSortValue: (row) => firstRelation(row.members)?.member_name ?? "",
  },
  {
    id: "year",
    header: "السنة",
    cell: (row) => {
      const year = firstRelation(row.years);
      return (
        <span className="tabular-nums text-slate-800">
          {year?.year_num ?? "—"}
        </span>
      );
    },
    getSortValue: (row) => firstRelation(row.years)?.year_num ?? "",
    contentAlign: "center",
  },
  {
    id: "approved_quota",
    header: "الحصة المعتمدة",
    cell: (row) => (
      <span className="block w-full text-right tabular-nums font-semibold text-slate-900" dir="ltr">
        {formatNumeric(row.approved_quota)}
      </span>
    ),
    getSortValue: (row) => toNumberOrNull(row.approved_quota) ?? -Infinity,
    contentAlign: "start",
  },
  // {
  //   id: "year_status",
  //   header: "حالة السنة",
  //   cell: (row) => {
  //     const year = firstRelation(row.years);
  //     return (
  //       <TableStatusBadge
  //         value={year?.status ?? null}
  //         activeLabel="نشطة"
  //         inactiveLabel="غير نشطة"
  //       />
  //     );
  //   },
  //   getSortValue: (row) => (firstRelation(row.years)?.status ? 1 : 0),
  //   contentAlign: "center",
  // },
];

type YearFilterProps = {
  value: number | null;
  onChange: (yearId: number | null) => void;
};

function YearFilter({ value, onChange }: YearFilterProps) {
  const { isLoading, data, error, isError } = useFetchYears();
  const options = useMemo(() => data ?? [], [data]);

  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor="members-approved-quotas-year-filter"
        className="text-sm text-slate-700"
      >
        السنة:
      </label>
      <select
        id="members-approved-quotas-year-filter"
        className="min-w-44 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-800 focus:border-slate-400 focus:outline-none"
        value={value ?? ""}
        onChange={(event) => {
          const selected = event.target.value;
          onChange(selected === "" ? null : Number(selected));
        }}
        disabled={isLoading}
      >
        <option value="">كل السنوات</option>
        {options.map((y) => (
          <option key={y.id} value={y.id}>
            {y.year_num && y.year_num.trim() !== ""
              ? y.year_num
              : `سنة #${y.id}`}
          </option>
        ))}
      </select>
      {isError ? (
        <span className="text-xs text-destructive" role="alert">
          {error instanceof Error ? error.message : "تعذر تحميل السنوات"}
        </span>
      ) : null}
    </div>
  );
}

function Toolbar({
  n,
  yearId,
  onYearChange,
}: {
  n: number;
  yearId: number | null;
  onYearChange: (yearId: number | null) => void;
}): ReactNode {
  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-2">
      <YearFilter value={yearId} onChange={onYearChange} />
      <p className="text-sm text-slate-600">
        عدد السجلات:{" "}
        <span className="font-medium tabular-nums text-slate-800">{n}</span>
      </p>
    </div>
  );
}

export default function MembersApprovedQuotasTable() {
  const [yearId, setYearId] = useState<number | null>(null);
  const filters = useMemo(
    () => (yearId == null ? undefined : { year_id: yearId }),
    [yearId],
  );
  const { isLoading, data, error, isError } = useFetchMembersApprovedQuotas(
    filters,
    { enabled: yearId != null },
  );
  const rows = data ?? [];

  if (isError) {
    return (
      <p dir="rtl" className="text-destructive" role="alert">
        {error instanceof Error
          ? error.message
          : "حدث خطأ أثناء تحميل حصص المساهمات المعتمدة"}
      </p>
    );
  }

  return (
    <div className="space-y-2" dir="rtl">
      <DataTable<MembersApprovedQuotasWithRelations>
        data={rows}
        columns={columns}
        isLoading={isLoading}
        loadingMessage="جاري تحميل بيانات حصص المساهمات المعتمدة…"
        emptyMessage={
          yearId == null
            ? "اختر السنة أولاً لعرض بيانات حصص المساهمات المعتمدة."
            : "لا توجد بيانات حصص معتمدة للعرض."
        }
        getRowId={(row) => row.id}
        showIndex
        indexHeader="#"
        toolbar={
          <Toolbar n={rows.length} yearId={yearId} onYearChange={setYearId} />
        }
        caption="جدول حصص المساهمات المعتمدة"
        density="comfortable"
        minTableWidth="100%"
        maxHeight="70dvh"
        stickyHeader
      />
    </div>
  );
}
