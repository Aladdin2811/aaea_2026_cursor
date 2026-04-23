import { useMemo, type ReactNode } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { type DetailedWithRelations } from "../../../api/apiDetailed";
import {
  DataTable,
  type DataTableColumn,
} from "../../../components/ui/data-table";
import { TableStatusBadge } from "../../../components/ui/TableStatusBadge";
import { formatOptionalText, stringValue } from "../../../lib/displayValue";
import { useFetchDetailed } from "./useDetailed";

function pickFirst<T>(e: T | T[] | null | undefined): T | null {
  if (e == null) return null;
  return Array.isArray(e) ? (e[0] ?? null) : e;
}

/** رابط صفحة الأنشطة عندما يكون للحساب التفصيلي برامج (`haveprograms`) */
function detailedProgramsActivitiesTo(
  row: DetailedWithRelations,
  no3Id: string | undefined,
  bandId: string | null,
  babId: string | null,
): string | null {
  if (row.haveprograms !== true) return null;
  const params = new URLSearchParams();
  if (no3Id != null && no3Id !== "") params.set("no3", no3Id);
  if (bandId != null && bandId !== "") params.set("band", bandId);
  if (babId != null && babId !== "") params.set("bab", babId);
  const qs = params.toString();
  return qs.length > 0
    ? `/programs/activities/${row.id}?${qs}`
    : `/programs/activities/${row.id}`;
}

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

function buildDetailedColumns(
  no3Id: string | undefined,
  bandId: string | null,
  babId: string | null,
): DataTableColumn<DetailedWithRelations>[] {
  return [
    {
      id: "name",
      header: "إسم الحساب التفصيلي",
      className: "min-w-80",
      thClassName: "!whitespace-normal",
      cell: (row) => {
        const name = stringValue(row.detailed_name);
        const shown = name.trim() === "" ? "—" : name;
        return (
          <span className="block min-w-0 whitespace-normal break-words font-medium leading-snug text-slate-900">
            {shown}
          </span>
        );
      },
      getSortValue: (r) => stringValue(r.detailed_name),
    },
    {
      id: "code",
      header: "الكود",
      className: "min-w-10",
      thClassName: "!whitespace-normal text-center",
      cell: (row) => (
        <span className="block font-mono text-sm tabular-nums text-slate-800 [overflow-wrap:anywhere]">
          {formatOptionalText(row.detailed_code)}
        </span>
      ),
      getSortValue: (r) => stringValue(r.detailed_code),
      contentAlign: "center",
    },
    {
      id: "mainTopic",
      header: <ColHead line1="المحور" line2="الرئيسي" />,
      className: "min-w-10",
      thClassName: "!whitespace-normal",
      cell: (row) => (
        <span className="min-w-0 text-sm text-slate-700">
          {formatOptionalText(
            pickFirst(row.main_topics)?.main_topic_name ?? null,
          )}
        </span>
      ),
      getSortValue: (r) =>
        stringValue(pickFirst(r.main_topics)?.main_topic_name),
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
    {
      id: "show_programs",
      header: "عرض الأنشطة",
      className: "min-w-28",
      thClassName: "!whitespace-normal text-center leading-tight",
      cell: (row) => {
        const to = detailedProgramsActivitiesTo(row, no3Id, bandId, babId);
        if (to == null) {
          return (
            <span className="block text-center text-sm text-slate-400">—</span>
          );
        }
        return (
          <Link
            to={to}
            className="inline-block text-center text-sm font-medium text-emerald-800 no-underline visited:no-underline outline-none hover:underline focus-visible:underline"
          >
            عرض الأنشطة
          </Link>
        );
      },
      getSortValue: (r) => (r.haveprograms ? 1 : 0),
      contentAlign: "center",
    },
  ];
}

function Toolbar({
  bandIdForNo3Page,
  babQuery,
}: {
  bandIdForNo3Page: string | null;
  babQuery: string;
}): ReactNode {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      {bandIdForNo3Page != null ? (
        <Link
          to={`/settings/no3/${bandIdForNo3Page}${babQuery}`}
          className="text-sm font-medium text-emerald-800 underline-offset-2 hover:underline"
        >
          ← العودة إلى الأنواع
        </Link>
      ) : (
        <span
          className="text-sm text-slate-500"
          title="لم يُعثر على معرّف البند"
        >
          ← العودة إلى الأنواع
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

export default function DetailedTable() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { isLoading, data, error, isError } = useFetchDetailed();
  const rows = useMemo(() => data ?? [], [data]);

  /** `/settings/no3/:id` يتوقع `band_id` */
  const bandIdForNo3Page = useMemo((): string | null => {
    const fromQuery = searchParams.get("band");
    if (fromQuery != null && fromQuery !== "") return fromQuery;
    const fromRow = rows.find((r) => r.band_id != null)?.band_id;
    return fromRow != null ? String(fromRow) : null;
  }, [searchParams, rows]);

  const babIdForContext = useMemo((): string | null => {
    const fromQuery = searchParams.get("bab");
    if (fromQuery != null && fromQuery !== "") return fromQuery;
    const fromRow = rows.find((r) => r.bab_id != null)?.bab_id;
    return fromRow != null ? String(fromRow) : null;
  }, [searchParams, rows]);

  const babQuery = useMemo(() => {
    const fromQuery = searchParams.get("bab");
    if (fromQuery != null && fromQuery !== "") {
      return `?bab=${encodeURIComponent(fromQuery)}`;
    }
    const fromRow = rows.find((r) => r.bab_id != null)?.bab_id;
    if (fromRow != null) {
      return `?bab=${encodeURIComponent(String(fromRow))}`;
    }
    return "";
  }, [searchParams, rows]);

  const columns = useMemo(
    () => buildDetailedColumns(id, bandIdForNo3Page, babIdForContext),
    [id, bandIdForNo3Page, babIdForContext],
  );

  if (id == null || id === "") {
    return (
      <div dir="rtl" className="space-y-3 text-slate-700">
        <p>
          لم يُحدَّد النوع. من جدول الأنواع اختر صفّاً، أو استخدم:
          <code className="mx-1 rounded bg-slate-100 px-1.5 py-0.5 text-sm">
            /settings/detailed/رقم_النوع
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
      <DataTable<DetailedWithRelations>
        data={rows}
        columns={columns}
        isLoading={isLoading}
        loadingMessage="جاري تحميل بيانات الحسابات التفصيلية…"
        emptyMessage="لا توجد حسابات تفصيلية مسجّلة لهذا النوع."
        getRowId={(row) => row.id}
        showIndex
        indexHeader="#"
        toolbar={
          <Toolbar bandIdForNo3Page={bandIdForNo3Page} babQuery={babQuery} />
        }
        caption={`الحسابات التفصيلية (النوع ${id})`}
        maxHeight="min(70dvh, 600px)"
        density="comfortable"
        minTableWidth="100%"
      />
    </div>
  );
}
