import { useMemo, type ReactNode } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { type No3WithRelations } from "../../../api/apiNo3";
import {
  DataTable,
  type DataTableColumn,
} from "../../../components/ui/data-table";
import { TableStatusBadge } from "../../../components/ui/TableStatusBadge";
import { formatOptionalText, stringValue } from "../../../lib/displayValue";
import { useFetchNo3 } from "./useNo3";

/** رأس عمود على سطرين (مناسب للعناوين الطويلة) */
function ColHead({
  line1,
  line2,
}: {
  line1: string;
  line2: string;
}): ReactNode {
  return (
    <span className="inline-block w-full min-w-0 text-center text-[0.7rem] font-semibold leading-[1.2] sm:text-xs">
      <span className="block">{line1}</span>
      <span className="block">{line2}</span>
    </span>
  );
}

/** صف يفتح الحسابات التفصيلية: حالة فعّالة وبدون صرف مباشر */
function isNo3RowLinkedToDetailed(row: No3WithRelations): boolean {
  return row.status === true && row.directexchange === false;
}

function no3RowDetailedTo(
  row: No3WithRelations,
  bandId: string | undefined,
  babId: string | null,
): string | null {
  if (!isNo3RowLinkedToDetailed(row)) return null;
  const params = new URLSearchParams();
  if (bandId != null && bandId !== "") params.set("band", bandId);
  if (babId != null && babId !== "") params.set("bab", babId);
  const qs = params.toString();
  return qs.length > 0
    ? `/settings/detailed/${row.id}?${qs}`
    : `/settings/detailed/${row.id}`;
}

function buildNo3Columns(
  bandId: string | undefined,
  babId: string | null,
): DataTableColumn<No3WithRelations>[] {
  return [
  {
    id: "name",
    header: "إسم النوع",
    className: "min-w-50",
    thClassName: "!whitespace-normal",
    cell: (row) => {
      const name = stringValue(row.no3_name);
      const shown = name.trim() === "" ? "—" : name;
      const label = (
        <span className="block min-w-0 whitespace-normal break-words font-medium leading-snug text-slate-900">
          {shown}
        </span>
      );
      const to = no3RowDetailedTo(row, bandId, babId);
      if (to == null) return label;
      return (
        <Link
          to={to}
          className="block min-w-0 text-inherit no-underline visited:no-underline outline-none hover:no-underline focus-visible:no-underline"
          onClick={(e) => e.stopPropagation()}
        >
          {label}
        </Link>
      );
    },
    getSortValue: (r) => stringValue(r.no3_name),
  },
  {
    id: "code",
    header: "الكود",
    className: "min-w-10",
    thClassName: "!whitespace-normal text-center",
    cell: (row) => (
      <span className="block font-mono text-sm tabular-nums text-slate-800 [overflow-wrap:anywhere]">
        {formatOptionalText(row.no3_code)}
      </span>
    ),
    getSortValue: (r) => stringValue(r.no3_code),
    contentAlign: "center",
  },
  {
    id: "havebudget",
    header: <ColHead line1="له" line2="موازنة" />,
    className: "min-w-10",
    thClassName: "!whitespace-normal text-center leading-tight",
    cell: (row) => <TableStatusBadge value={row.havebudget} />,
    getSortValue: (r) => (r.havebudget ? 1 : 0),
    contentAlign: "center",
  },
  {
    id: "haveprograms",
    header: <ColHead line1="له" line2="برامج" />,
    className: "min-w-10",
    thClassName: "!whitespace-normal text-center leading-tight",
    cell: (row) => <TableStatusBadge value={row.haveprograms} />,
    getSortValue: (r) => (r.haveprograms ? 1 : 0),
    contentAlign: "center",
  },
  {
    id: "directexchange",
    header: <ColHead line1="صرف" line2="مباشر" />,
    className: "min-w-10",
    thClassName: "!whitespace-normal text-center leading-tight",
    cell: (row) => <TableStatusBadge value={row.directexchange} />,
    getSortValue: (r) => (r.directexchange ? 1 : 0),
    contentAlign: "center",
  },
  {
    id: "journalShow",
    header: <ColHead line1="يظهر" line2="بالقيد" />,
    className: "min-w-10",
    thClassName: "!whitespace-normal text-center leading-tight",
    cell: (row) => <TableStatusBadge value={row.no3_journal_show} />,
    getSortValue: (r) => (r.no3_journal_show ? 1 : 0),
    contentAlign: "center",
  },
  {
    id: "status",
    header: "الحالة",
    className: "min-w-10",
    thClassName: "!whitespace-normal text-center leading-tight",
    cell: (row) => <TableStatusBadge value={row.status} />,
    getSortValue: (r) => stringValue(r.status),
    contentAlign: "center",
  },
  {
    id: "description",
    header: "الوصف",
    className: "min-w-40 max-w-sm",
    thClassName: "!whitespace-normal",
    cell: (row) => (
      <span className="min-w-0 text-xs leading-snug text-slate-600 [overflow-wrap:anywhere] [word-break:break-word]">
        {formatOptionalText(row.description)}
      </span>
    ),
    getSortValue: (r) => stringValue(r.description),
  },
];
}

function Toolbar({
  babIdForBandPage,
}: {
  babIdForBandPage: string | null;
}): ReactNode {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      {babIdForBandPage != null ? (
        <Link
          to={`/settings/band/${babIdForBandPage}`}
          className="text-sm font-medium text-emerald-800 underline-offset-2 hover:underline"
        >
          ← العودة إلى البنود
        </Link>
      ) : (
        <span
          className="text-sm text-slate-500"
          title="لم يُعثر على معرّف الباب"
        >
          ← العودة إلى البنود
        </span>
      )}
      <Link
        to="/settings/account_type"
        className="text-sm text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
      >
        تصنيف الحسابات
      </Link>
    </div>
  );
}

export default function No3Table() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { isLoading, data, error, isError } = useFetchNo3();
  const rows = useMemo(() => data ?? [], [data]);

  /** `/settings/band/:id` يتوقع `bab_id` */
  const babIdForBandPage = useMemo((): string | null => {
    const fromQuery = searchParams.get("bab");
    if (fromQuery != null && fromQuery !== "") return fromQuery;
    const fromRow = rows.find((r) => r.bab_id != null)?.bab_id;
    return fromRow != null ? String(fromRow) : null;
  }, [searchParams, rows]);

  const columns = useMemo(
    () => buildNo3Columns(id, babIdForBandPage),
    [id, babIdForBandPage],
  );

  if (id == null || id === "") {
    return (
      <div dir="rtl" className="space-y-3 text-slate-700">
        <p>
          لم يُحدَّد البند. من جدول البنود اختر صفّاً، أو استخدم:
          <code className="mx-1 rounded bg-slate-100 px-1.5 py-0.5 text-sm">
            /settings/no3/رقم_البند
          </code>
        </p>
        <Link
          to="/settings/account_type"
          className="font-medium text-emerald-800 underline-offset-2 hover:underline"
        >
          الانتقال إلى تصنيف الحسابات
        </Link>
      </div>
    );
  }

  if (isError) {
    return (
      <p dir="rtl" className="text-destructive" role="alert">
        {error instanceof Error ? error.message : "حدث خطأ أثناء التحميل"}
      </p>
    );
  }

  return (
    <div className="space-y-2" dir="rtl">
      <DataTable<No3WithRelations>
        data={rows}
        columns={columns}
        isLoading={isLoading}
        loadingMessage="جاري تحميل بيانات الأنواع…"
        emptyMessage="لا توجد أنواع مسجّلة لهذا البند."
        getRowId={(row) => row.id}
        showIndex
        indexHeader="#"
        toolbar={<Toolbar babIdForBandPage={babIdForBandPage} />}
        caption={`الأنواع (البند ${id})`}
        maxHeight="min(70dvh, 600px)"
        density="comfortable"
        minTableWidth="100%"
        onRowClick={(row) => {
          const to = no3RowDetailedTo(row, id, babIdForBandPage);
          if (to != null) navigate(to);
        }}
        rowClassName={(row) =>
          no3RowDetailedTo(row, id, babIdForBandPage) != null
            ? "cursor-pointer"
            : undefined
        }
      />
    </div>
  );
}
