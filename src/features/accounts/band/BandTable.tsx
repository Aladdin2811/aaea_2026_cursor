import { useMemo, type ReactNode } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { type BandWithRelations } from "../../../api/apiBand";
import {
  DataTable,
  type DataTableColumn,
} from "../../../components/ui/data-table";
import { TableStatusBadge } from "../../../components/ui/TableStatusBadge";
import { formatOptionalText, stringValue } from "../../../lib/displayValue";
import { useFetchBand } from "./useBand";

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

const columns: DataTableColumn<BandWithRelations>[] = [
  {
    id: "name",
    header: "البند",
    className: "min-w-50",
    thClassName: "!whitespace-normal",
    cell: (row) => {
      const name = stringValue(row.band_name);
      const shown = name.trim() === "" ? "—" : name;
      return (
        <span className="block min-w-0 whitespace-normal break-words font-medium leading-snug text-slate-900">
          {shown}
        </span>
      );
    },
    getSortValue: (r) => stringValue(r.band_name),
  },
  {
    id: "code",
    header: "الكود",
    className: "min-w-10",
    thClassName: "!whitespace-normal text-center",
    cell: (row) => (
      <span className="block font-mono text-sm tabular-nums text-slate-800 [overflow-wrap:anywhere]">
        {formatOptionalText(row.band_code)}
      </span>
    ),
    getSortValue: (r) => stringValue(r.band_code),
    contentAlign: "center",
  },
  // {
  //   id: "bab",
  //   header: "الباب",
  //   cell: (row) => {
  //     const b = pickEmbed(row.bab);
  //     if (b == null) return <span className="text-slate-400">—</span>;
  //     return (
  //       <div className="text-sm text-slate-700">
  //         <span className="me-1 font-mono text-xs text-slate-500">
  //           {formatOptionalText(b.bab_code)}
  //         </span>
  //         <span>{formatOptionalText(b.bab_name)}</span>
  //       </div>
  //     );
  //   },
  //   getSortValue: (r) => {
  //     const b = pickEmbed(r.bab);
  //     return b ? stringValue(b.bab_code) + stringValue(b.bab_name) : "";
  //   },
  // },
  // {
  //   id: "accountType",
  //   header: "تصنيف الحساب",
  //   cell: (row) => (
  //     <span className="text-slate-700">
  //       {formatOptionalText(
  //         stringValue(pickEmbed(row.account_type)?.account_type_name) || null,
  //       )}
  //     </span>
  //   ),
  //   getSortValue: (r) => stringValue(pickEmbed(r.account_type)?.account_type_name),
  // },
  // {
  //   id: "general",
  //   header: "الحساب العام",
  //   cell: (row) => {
  //     const g = pickEmbed(row.general_account);
  //     if (g == null) return <span className="text-slate-400">—</span>;
  //     return (
  //       <div className="line-clamp-2 text-sm text-slate-700">
  //         <span className="me-1 font-mono text-xs text-slate-500">
  //           {formatOptionalText(g.general_account_code)}
  //         </span>
  //         <span>{formatOptionalText(g.general_account_name)}</span>
  //       </div>
  //     );
  //   },
  //   getSortValue: (r) => {
  //     const g = pickEmbed(r.general_account);
  //     return g
  //       ? `${stringValue(g.general_account_code)} ${stringValue(g.general_account_name)}`
  //       : "";
  //   },
  // },
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
  // {
  //   id: "salaries",
  //   header: <ColHead line1="رواتب" line2="مباشرة" />,
  //   className: "min-w-10",
  //   thClassName: "!whitespace-normal text-center leading-tight",
  //   cell: (row) => <TableStatusBadge value={row.salariesdirectpaid} />,
  //   getSortValue: (r) => (r.salariesdirectpaid ? 1 : 0),
  //   contentAlign: "center",
  // },
  {
    id: "journalShow",
    header: <ColHead line1="يظهر" line2="بالقيد" />,
    className: "min-w-10",
    thClassName: "!whitespace-normal text-center leading-tight",
    cell: (row) => <TableStatusBadge value={row.band_journal_show} />,
    getSortValue: (r) => (r.band_journal_show ? 1 : 0),
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

function Toolbar({ generalAccountId }: { generalAccountId: string | null }): ReactNode {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      {generalAccountId != null ? (
        <Link
          to={`/settings/bab/${generalAccountId}`}
          className="text-sm font-medium text-emerald-800 underline-offset-2 hover:underline"
        >
          ← العودة إلى الأبواب
        </Link>
      ) : (
        <span className="text-sm text-slate-500" title="لم يُعثر على معرّف الحساب العام">
          ← العودة إلى الأبواب
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

export default function BandTable() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { isLoading, data, error, isError } = useFetchBand();
  const rows = data ?? [];

  /** رابط /settings/bab/ يتوقع `general_account_id` وليس `bab_id` */
  const generalAccountIdForBabPage = useMemo((): string | null => {
    const fromQuery = searchParams.get("ga");
    if (fromQuery != null && fromQuery !== "") return fromQuery;
    const fromRow = rows.find((r) => r.general_account_id != null)?.general_account_id;
    return fromRow != null ? String(fromRow) : null;
  }, [searchParams, rows]);

  if (id == null || id === "") {
    return (
      <div dir="rtl" className="space-y-3 text-slate-700">
        <p>
          لم يُحدَّد الباب. من جدول الأبواب اختر صفّاً، أو استخدم:
          <code className="mx-1 rounded bg-slate-100 px-1.5 py-0.5 text-sm">
            /settings/band/رقم_الباب
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
      <DataTable<BandWithRelations>
        data={rows}
        columns={columns}
        isLoading={isLoading}
        loadingMessage="جاري تحميل بيانات البنود…"
        emptyMessage="لا توجد بنود مسجّلة لهذا الباب."
        getRowId={(row) => row.id}
        showIndex
        indexHeader="#"
        toolbar={<Toolbar generalAccountId={generalAccountIdForBabPage} />}
        caption={`البنود (الباب ${id})`}
        maxHeight="min(70dvh, 600px)"
        density="comfortable"
        minTableWidth="100%"
      />
    </div>
  );
}
