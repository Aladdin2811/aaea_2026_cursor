import { type ReactNode } from "react";
import { type MemberRow } from "../../../api/apiMembers";
import { DataTable, type DataTableColumn } from "../../../components/ui/data-table";
import { TableStatusBadge } from "../../../components/ui/TableStatusBadge";
import { useFetchAllMembers } from "./useMembers";

const columns: DataTableColumn<MemberRow>[] = [
  {
    id: "name",
    header: "الدولة",
    cell: (row) => (
      <span className="min-w-0 font-medium text-slate-900">{row.member_name ?? "—"}</span>
    ),
    getSortValue: (r) => r.member_name ?? "",
  },
  {
    id: "flag",
    header: "العلم",
    cell: (row) => <FlagCell value={row.flag} />,
    getSortValue: (r) => r.flag ?? "",
    contentAlign: "center",
    className: "w-20 min-w-20",
  },
  {
    id: "ratio",
    header: "نسبة المساهمة",
    cell: (row) => (
      <span className="tabular-nums text-slate-800">{row.member_ratio ?? "—"}</span>
    ),
    getSortValue: (r) => r.member_ratio,
    contentAlign: "end",
  },
  {
    id: "reservation",
    header: "نسبة متحفظ عليها",
    cell: (row) => <span className="tabular-nums">{row.reservation_ratio ?? "—"}</span>,
    getSortValue: (r) => r.reservation_ratio,
    contentAlign: "end",
  },
  {
    id: "org",
    header: "عضو بالهيئة",
    cell: (row) => (
      <TableStatusBadge
        value={row.org_member}
        activeLabel="عضو بالهيئة"
        inactiveLabel="ليس عضواً"
      />
    ),
    getSortValue: (r) => (r.org_member ? 1 : 0),
    contentAlign: "center",
  },
  {
    id: "notes",
    header: "ملاحظات",
    cell: (row) => <span className="text-slate-600">{row.member_notes || "—"}</span>,
    getSortValue: (r) => r.member_notes ?? "",
    className: "min-w-48",
  },
];

function FlagCell({ value }: { value: string | null }) {
  if (value == null || value === "") {
    return <span className="text-slate-400">—</span>;
  }
  const trimmed = value.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/")) {
    return (
      <img
        src={trimmed}
        alt=""
        className="inline-block h-6 max-w-10 rounded-sm object-cover shadow-sm"
        loading="lazy"
        decoding="async"
      />
    );
  }
  return (
    <span className="text-xl leading-none" title={trimmed}>
      {trimmed}
    </span>
  );
}

function ToolbarCount({ n }: { n: number }): ReactNode {
  return (
    <p className="text-sm text-slate-600">
      عدد السجلات: <span className="font-medium tabular-nums text-slate-800">{n}</span>
    </p>
  );
}

export default function MembersTable() {
  const { isLoading, data, error, isError } = useFetchAllMembers();
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
      <DataTable<MemberRow>
        data={rows}
        columns={columns}
        isLoading={isLoading}
        loadingMessage="جاري تحميل بيانات الدول الأعضاء بجامعة الدول العربية…"
        emptyMessage="لا توجد بيانات أعضاء للعرض."
        getRowId={(row) => row.id}
        showIndex
        indexHeader="#"
        toolbar={!isLoading && rows.length > 0 ? <ToolbarCount n={rows.length} /> : null}
        caption="جدول الدول الأعضاء"
        maxHeight="min(70dvh, 600px)"
        density="comfortable"
        minTableWidth="100%"
      />
    </div>
  );
}
