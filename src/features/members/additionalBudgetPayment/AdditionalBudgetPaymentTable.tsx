import { useMemo, type ReactNode } from "react";
import type { AdditionalBudgetPaymentWithRelations } from "../../../api/apiAdditionalBudgetPayment";
import {
  DataTable,
  type DataTableColumn,
} from "../../../components/ui/data-table";
import { downloadUtf8Csv, printRtlTable } from "../../../lib/tableExport";
import {
  firstRelation,
  formatNumeric,
  textOrDash,
  toNumberOrNull,
} from "../../../lib/tableUtils";
import { useFetchAdditionalBudgetPayment } from "./useAdditionalBudgetPayment";

const ADDITIONAL_BUDGET_PAYMENT_EXPORT_HEADERS = [
  "الدولة العضو",
  "حساب المنظمة",
  "الحساب الموحد",
  "رقم المستند",
  "تاريخ المستند",
] as const;

function exportAdditionalBudgetPaymentToExcelCsv(
  rows: AdditionalBudgetPaymentWithRelations[],
): void {
  downloadUtf8Csv(
    "additional_budget_payment.csv",
    [...ADDITIONAL_BUDGET_PAYMENT_EXPORT_HEADERS],
    rows.map((row) => [
      textOrDash(firstRelation(row.members)?.member_name),
      formatNumeric(row.organization_account),
      formatNumeric(row.consolidated_account),
      row.document_num == null ? "—" : String(row.document_num),
      textOrDash(row.document_date),
    ]),
  );
}

function printAdditionalBudgetPaymentTable(
  rows: AdditionalBudgetPaymentWithRelations[],
): void {
  printRtlTable({
    documentTitle: "طباعة المسدد من الموازنة الإضافية",
    caption: "جدول المسدد من الموازنة الإضافية",
    headers: ["#", ...ADDITIONAL_BUDGET_PAYMENT_EXPORT_HEADERS],
    rows: rows.map((row, idx) => [
      String(idx + 1),
      textOrDash(firstRelation(row.members)?.member_name),
      formatNumeric(row.organization_account),
      formatNumeric(row.consolidated_account),
      row.document_num == null ? "—" : String(row.document_num),
      textOrDash(row.document_date),
    ]),
  });
}

const columns: DataTableColumn<AdditionalBudgetPaymentWithRelations>[] = [
  {
    id: "member",
    header: "الدولة العضو",
    cell: (row) => (
      <span className="font-medium text-slate-900">
        {firstRelation(row.members)?.member_name ?? "—"}
      </span>
    ),
    getSortValue: (row) => firstRelation(row.members)?.member_name ?? "",
  },
  {
    id: "organization_account",
    header: "حساب المنظمة",
    cell: (row) => (
      <span
        className="block w-full text-right tabular-nums font-semibold text-slate-900"
        dir="ltr"
      >
        {formatNumeric(row.organization_account)}
      </span>
    ),
    getSortValue: (row) => toNumberOrNull(row.organization_account) ?? -Infinity,
    contentAlign: "start",
  },
  {
    id: "consolidated_account",
    header: "الحساب الموحد",
    cell: (row) => (
      <span
        className="block w-full text-right tabular-nums font-semibold text-slate-900"
        dir="ltr"
      >
        {formatNumeric(row.consolidated_account)}
      </span>
    ),
    getSortValue: (row) => toNumberOrNull(row.consolidated_account) ?? -Infinity,
    contentAlign: "start",
  },
  {
    id: "document_num",
    header: "رقم المستند",
    cell: (row) => (
      <span className="tabular-nums text-slate-800">{row.document_num ?? "—"}</span>
    ),
    getSortValue: (row) => row.document_num ?? -Infinity,
    contentAlign: "center",
  },
  {
    id: "document_date",
    header: "تاريخ المستند",
    cell: (row) => <span className="text-slate-700">{row.document_date ?? "—"}</span>,
    getSortValue: (row) => row.document_date ?? "",
    contentAlign: "center",
  },
];

function ToolbarActions({
  n,
  rows,
}: {
  n: number;
  rows: AdditionalBudgetPaymentWithRelations[];
}): ReactNode {
  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-2">
      <p className="text-sm text-slate-600">
        عدد السجلات: <span className="font-medium tabular-nums text-slate-800">{n}</span>
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => printAdditionalBudgetPaymentTable(rows)}
          disabled={rows.length === 0}
        >
          طباعة
        </button>
        <button
          type="button"
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => exportAdditionalBudgetPaymentToExcelCsv(rows)}
          disabled={rows.length === 0}
        >
          تصدير Excel
        </button>
      </div>
    </div>
  );
}

export default function AdditionalBudgetPaymentTable() {
  const { isLoading, data, error, isError } = useFetchAdditionalBudgetPayment();
  const rows = useMemo(() => data ?? [], [data]);

  if (isError) {
    return (
      <p dir="rtl" className="text-destructive" role="alert">
        {error instanceof Error
          ? error.message
          : "حدث خطأ أثناء تحميل بيانات المسدد من الموازنة الإضافية"}
      </p>
    );
  }

  return (
    <div className="space-y-2" dir="rtl">
      <DataTable<AdditionalBudgetPaymentWithRelations>
        data={rows}
        columns={columns}
        isLoading={isLoading}
        loadingMessage="جاري تحميل بيانات المسدد من الموازنة الإضافية…"
        emptyMessage="لا توجد بيانات للعرض."
        getRowId={(row) => row.id}
        showIndex
        indexHeader="#"
        toolbar={<ToolbarActions n={rows.length} rows={rows} />}
        caption="جدول المسدد من الموازنة الإضافية"
        density="comfortable"
        minTableWidth="100%"
        maxHeight="70dvh"
        stickyHeader
      />
    </div>
  );
}
