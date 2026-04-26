import { type ReactNode } from "react";
import { type EmployeesBanksWithRelations } from "../../../api/apiEmployeesBanks";
import {
  DataTable,
  type DataTableColumn,
} from "../../../components/ui/data-table";
import { TableStatusBadge } from "../../../components/ui/TableStatusBadge";
import { formatOptionalText, stringValue } from "../../../lib/displayValue";
import { useFetchEmployeesBanks } from "./useEmployeesBanks";

function firstEmbed<T>(v: T | T[] | null | undefined): T | null {
  if (v == null) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

const columns: DataTableColumn<EmployeesBanksWithRelations>[] = [
  {
    id: "employee_name",
    header: "اسم الموظف",
    className: "min-w-40",
    cell: (row) => (
      <span className="min-w-0 font-medium text-slate-900">
        {formatOptionalText(
          firstEmbed(row.all_employees)?.employee_name,
        )}
      </span>
    ),
    getSortValue: (r) =>
      stringValue(firstEmbed(r.all_employees)?.employee_name),
  },
  {
    id: "fingerprint",
    header: "رقم البصمة",
    className: "min-w-24",
    thClassName: "!whitespace-normal text-center",
    cell: (row) => {
      const fp = firstEmbed(row.all_employees)?.fingerprint_id;
      return (
        <span className="tabular-nums text-slate-800">
          {fp != null ? fp : "—"}
        </span>
      );
    },
    getSortValue: (r) =>
      firstEmbed(r.all_employees)?.fingerprint_id ?? -Infinity,
    contentAlign: "center",
  },
  {
    id: "bank_name",
    header: "البنك",
    className: "min-w-36",
    cell: (row) => (
      <span className="text-slate-800">
        {formatOptionalText(row.bank_name)}
      </span>
    ),
    getSortValue: (r) => stringValue(r.bank_name),
  },
  {
    id: "account",
    header: "رقم الحساب",
    className: "min-w-36",
    cell: (row) => (
      <span className="font-mono text-sm text-slate-800">
        {formatOptionalText(row.bank_account_no)}
      </span>
    ),
    getSortValue: (r) => stringValue(r.bank_account_no),
  },
  {
    id: "status",
    header: "الحالة",
    className: "min-w-24",
    thClassName: "!whitespace-normal text-center",
    cell: (row) => (
      <TableStatusBadge
        value={row.status}
        activeLabel="فعّال"
        inactiveLabel="غير فعّال"
      />
    ),
    getSortValue: (r) => (r.status ? 1 : 0),
    contentAlign: "center",
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

export default function EmployeesBanksTable() {
  const { isLoading, data, error, isError } = useFetchEmployeesBanks();
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
      <DataTable<EmployeesBanksWithRelations>
        data={rows}
        columns={columns}
        isLoading={isLoading}
        loadingMessage="جاري تحميل الحسابات البنكية للموظفين…"
        emptyMessage="لا توجد حسابات بنكية للعرض."
        getRowId={(row) => row.id}
        showIndex
        indexHeader="#"
        toolbar={
          !isLoading && rows.length > 0 ? (
            <ToolbarCount n={rows.length} />
          ) : null
        }
        caption="جدول الحسابات البنكية للموظفين"
        density="comfortable"
        minTableWidth="min(100%, 720px)"
      />
    </div>
  );
}
