import { type ReactNode } from "react";
import { type AllEmployeesWithRelations } from "../../../api/apiAllEmployees";
import {
  DataTable,
  type DataTableColumn,
} from "../../../components/ui/data-table";
// import { TableStatusBadge } from "../../../components/ui/TableStatusBadge";
import { formatOptionalText, stringValue } from "../../../lib/displayValue";
import {
  useFetchAllEmployeesSegment,
  type AllEmployeesListKind,
} from "./useEmployees";

function firstEmbed<T>(v: T | T[] | null | undefined): T | null {
  if (v == null) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

function formatDate(iso: string | null | undefined): string {
  if (iso == null || iso === "") return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("ar", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

const columns: DataTableColumn<AllEmployeesWithRelations>[] = [
  {
    id: "name",
    header: "الاسم",
    className: "min-w-65",
    cell: (row) => (
      <span className="min-w-0 font-medium text-slate-900">
        {formatOptionalText(row.employee_name)}
      </span>
    ),
    getSortValue: (r) => stringValue(r.employee_name),
  },
  // {
  //   id: "fingerprint",
  //   header: "رقم البصمة",
  //   className: "min-w-24",
  //   thClassName: "!whitespace-normal text-center",
  //   cell: (row) => (
  //     <span className="tabular-nums text-slate-800">{row.fingerprint_id}</span>
  //   ),
  //   getSortValue: (r) => r.fingerprint_id,
  //   contentAlign: "center",
  // },
  {
    id: "nationality",
    header: "الدولة",
    className: "min-w-50",
    cell: (row) => (
      <span className="text-slate-800">
        {formatOptionalText(firstEmbed(row.members)?.member_name)}
      </span>
    ),
    getSortValue: (r) => stringValue(firstEmbed(r.members)?.member_name),
  },
  // {
  //   id: "dob",
  //   header: "تاريخ الميلاد",
  //   className: "min-w-28",
  //   thClassName: "!whitespace-normal text-center",
  //   cell: (row) => (
  //     <span className="tabular-nums text-sm text-slate-700">
  //       {formatDate(row.date_of_birth)}
  //     </span>
  //   ),
  //   getSortValue: (r) => stringValue(r.date_of_birth),
  //   contentAlign: "center",
  // },
  {
    id: "hiring",
    header: "تاريخ الإلتحاق بالعمل",
    className: "min-w-28",
    thClassName: "!whitespace-normal text-center",
    cell: (row) => (
      <span className="tabular-nums text-sm text-slate-700">
        {formatDate(row.hiring_date)}
      </span>
    ),
    getSortValue: (r) => stringValue(r.hiring_date),
    contentAlign: "center",
  },
  // {
  //   id: "job_nature",
  //   header: "طبيعة العمل",
  //   className: "min-w-32",
  //   thClassName: "!whitespace-normal",
  //   cell: (row) => (
  //     <span className="text-slate-800">
  //       {formatOptionalText(firstEmbed(row.job_nature)?.job_nature_name)}
  //     </span>
  //   ),
  //   getSortValue: (r) => stringValue(firstEmbed(r.job_nature)?.job_nature_name),
  // },
  {
    id: "job_category",
    header: "الفئة",
    className: "min-w-28",
    thClassName: "!whitespace-normal",
    cell: (row) => (
      <span className="text-slate-800">
        {formatOptionalText(firstEmbed(row.job_category)?.job_category_name)}
      </span>
    ),
    getSortValue: (r) =>
      stringValue(firstEmbed(r.job_category)?.job_category_name),
  },
  {
    id: "job_grade",
    header: "الدرجة",
    className: "min-w-45",
    thClassName: "!whitespace-normal",
    cell: (row) => (
      <span className="text-slate-800">
        {formatOptionalText(firstEmbed(row.job_grade)?.job_grade_name)}
      </span>
    ),
    getSortValue: (r) => stringValue(firstEmbed(r.job_grade)?.job_grade_name),
  },
  {
    id: "job_title",
    header: "المسمى الوظيفي",
    className: "min-w-36",
    thClassName: "!whitespace-normal",
    cell: (row) => (
      <span className="text-slate-800">
        {formatOptionalText(firstEmbed(row.job_title)?.job_title_name)}
      </span>
    ),
    getSortValue: (r) => stringValue(firstEmbed(r.job_title)?.job_title_name),
  },
  // {
  //   id: "gender",
  //   header: "الجنس",
  //   className: "min-w-24",
  //   cell: (row) => (
  //     <span className="text-slate-800">
  //       {formatOptionalText(firstEmbed(row.gender)?.gender_name)}
  //     </span>
  //   ),
  //   getSortValue: (r) => stringValue(firstEmbed(r.gender)?.gender_name),
  // },
  // {
  //   id: "nature_of_work",
  //   header: "طبيعة الأداء",
  //   className: "min-w-28",
  //   thClassName: "!whitespace-normal",
  //   cell: (row) => (
  //     <span className="text-slate-800">
  //       {formatOptionalText(
  //         firstEmbed(row.nature_of_work)?.nature_of_work_name,
  //       )}
  //     </span>
  //   ),
  //   getSortValue: (r) =>
  //     stringValue(firstEmbed(r.nature_of_work)?.nature_of_work_name),
  // },
  // {
  //   id: "retired",
  //   header: "متقاعد",
  //   className: "min-w-24",
  //   thClassName: "!whitespace-normal text-center",
  //   cell: (row) => (
  //     <TableStatusBadge
  //       value={row.retired}
  //       activeLabel="نعم"
  //       inactiveLabel="لا"
  //     />
  //   ),
  //   getSortValue: (r) => (r.retired ? 1 : 0),
  //   contentAlign: "center",
  // },
  // {
  //   id: "status",
  //   header: "الحالة",
  //   className: "min-w-24",
  //   thClassName: "!whitespace-normal text-center",
  //   cell: (row) => (
  //     <TableStatusBadge
  //       value={row.status}
  //       activeLabel="فعّال"
  //       inactiveLabel="غير فعّال"
  //     />
  //   ),
  //   getSortValue: (r) => (r.status ? 1 : 0),
  //   contentAlign: "center",
  // },
  // {
  //   id: "missions",
  //   header: "مهمّات",
  //   className: "min-w-24",
  //   thClassName: "!whitespace-normal text-center",
  //   cell: (row) => (
  //     <TableStatusBadge
  //       value={row.have_missions}
  //       activeLabel="نعم"
  //       inactiveLabel="لا"
  //     />
  //   ),
  //   getSortValue: (r) => (r.have_missions ? 1 : 0),
  //   contentAlign: "center",
  // },
  // {
  //   id: "notes",
  //   header: "ملاحظات",
  //   className: "min-w-40",
  //   cell: (row) => (
  //     <span className="text-slate-600">{row.notes?.trim() || "—"}</span>
  //   ),
  //   getSortValue: (r) => r.notes ?? "",
  // },
];

function ToolbarCount({ n }: { n: number }): ReactNode {
  return (
    <p className="text-sm text-slate-600">
      عدد السجلات:{" "}
      <span className="font-medium tabular-nums text-slate-800">{n}</span>
    </p>
  );
}

export type AllEmployeesSegmentTableProps = {
  jobNatureId: number;
  caption: string;
  emptyMessage: string;
  loadingMessage: string;
  listKind?: AllEmployeesListKind;
};

export function AllEmployeesSegmentTable({
  jobNatureId,
  caption,
  emptyMessage,
  loadingMessage,
  listKind = "current",
}: AllEmployeesSegmentTableProps) {
  const { isLoading, data, error, isError } = useFetchAllEmployeesSegment({
    jobNatureId,
    listKind,
  });
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
      <DataTable<AllEmployeesWithRelations>
        data={rows}
        columns={columns}
        isLoading={isLoading}
        loadingMessage={loadingMessage}
        emptyMessage={emptyMessage}
        getRowId={(row) => row.id}
        showIndex
        indexHeader="#"
        toolbar={
          !isLoading && rows.length > 0 ? (
            <ToolbarCount n={rows.length} />
          ) : null
        }
        caption={caption}
        density="comfortable"
        minTableWidth="min(100%, 1280px)"
      />
    </div>
  );
}
