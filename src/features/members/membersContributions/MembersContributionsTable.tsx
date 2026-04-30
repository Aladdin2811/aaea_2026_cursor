import { useMemo, useState, type ReactNode } from "react";
import type { MembersContributionsWithRelations } from "../../../api/apiMembersContributions";
import {
  DataTable,
  type DataTableColumn,
} from "../../../components/ui/data-table";
import { TableStatusBadge } from "../../../components/ui/TableStatusBadge";
import { useFetchAllMembers } from "../members/useMembers";
import { useFetchMembersContributions } from "./useMembersContributions";
import Select, {
  type GroupBase,
  type SingleValue,
  type StylesConfig,
} from "react-select";

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

function textOrDash(value: string | null | undefined): string {
  const v = (value ?? "").trim();
  return v === "" ? "—" : v;
}

function exportMembersContributionsToExcelCsv(
  rows: MembersContributionsWithRelations[],
): void {
  const headers = [
    "الدولة العضو",
    "سنة المساهمة",
    "سنة السداد",
    "حساب المنظمة",
    "الحساب الموحد",
    "رقم المستند",
    "تاريخ المستند",
    "مدفوع مقدمًا",
  ];

  const lines = rows.map((row) => [
    textOrDash(firstRelation(row.members)?.member_name),
    textOrDash(firstRelation(row.contribution_year)?.year_num),
    textOrDash(firstRelation(row.payed_year)?.year_num),
    formatNumeric(row.organization_account),
    formatNumeric(row.consolidated_account),
    row.document_num == null ? "—" : String(row.document_num),
    textOrDash(row.document_date),
    row.prepaid ? "نعم" : "لا",
  ]);

  const esc = (v: string) => `"${v.replaceAll('"', '""')}"`;
  const csv = [headers, ...lines].map((r) => r.map(esc).join(",")).join("\r\n");
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "members_contributions.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function printMembersContributionsTable(
  rows: MembersContributionsWithRelations[],
): void {
  const popup = window.open("", "_blank");
  if (popup == null) return;

  const headers = [
    "#",
    "الدولة العضو",
    "سنة المساهمة",
    "سنة السداد",
    "حساب المنظمة",
    "الحساب الموحد",
    "رقم المستند",
    "تاريخ المستند",
    "مدفوع مقدمًا",
  ];

  const rowsHtml = rows
    .map((row, idx) => {
      const cells = [
        String(idx + 1),
        textOrDash(firstRelation(row.members)?.member_name),
        textOrDash(firstRelation(row.contribution_year)?.year_num),
        textOrDash(firstRelation(row.payed_year)?.year_num),
        formatNumeric(row.organization_account),
        formatNumeric(row.consolidated_account),
        row.document_num == null ? "—" : String(row.document_num),
        textOrDash(row.document_date),
        row.prepaid ? "نعم" : "لا",
      ];
      return `<tr>${cells.map((c) => `<td>${c}</td>`).join("")}</tr>`;
    })
    .join("");

  popup.document.open();
  popup.document.write(
    `<!doctype html><html dir="rtl"><head><meta charset="utf-8"/><title>طباعة المساهمات المسددة</title><style>body{font-family:Tahoma,Arial,sans-serif;padding:16px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #cbd5e1;padding:6px 8px;text-align:center}th{background:#f1f5f9}caption{font-weight:700;margin-bottom:8px}</style></head><body><table><caption>جدول المساهمات المسددة</caption><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rowsHtml}</tbody></table></body></html>`,
  );
  popup.document.close();
  popup.onload = () => {
    popup.focus();
    popup.print();
  };
}

const columns: DataTableColumn<MembersContributionsWithRelations>[] = [
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
    id: "contribution_year",
    header: "سنة المساهمة",
    cell: (row) => (
      <span className="tabular-nums text-slate-800">
        {firstRelation(row.contribution_year)?.year_num ?? "—"}
      </span>
    ),
    getSortValue: (row) => firstRelation(row.contribution_year)?.year_num ?? "",
    contentAlign: "center",
  },
  {
    id: "payed_year",
    header: "سنة السداد",
    cell: (row) => (
      <span className="tabular-nums text-slate-800">
        {firstRelation(row.payed_year)?.year_num ?? "—"}
      </span>
    ),
    getSortValue: (row) => firstRelation(row.payed_year)?.year_num ?? "",
    contentAlign: "center",
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
    getSortValue: (row) =>
      toNumberOrNull(row.organization_account) ?? -Infinity,
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
    getSortValue: (row) =>
      toNumberOrNull(row.consolidated_account) ?? -Infinity,
    contentAlign: "start",
  },
  {
    id: "document_num",
    header: "رقم المستند",
    cell: (row) => (
      <span className="tabular-nums text-slate-800">
        {row.document_num ?? "—"}
      </span>
    ),
    getSortValue: (row) => row.document_num ?? -Infinity,
    contentAlign: "center",
  },
  {
    id: "document_date",
    header: "تاريخ المستند",
    cell: (row) => (
      <span className="text-slate-700">{row.document_date ?? "—"}</span>
    ),
    getSortValue: (row) => row.document_date ?? "",
    contentAlign: "center",
  },
  {
    id: "prepaid",
    header: "مدفوع مقدمًا",
    cell: (row) => (
      <TableStatusBadge
        value={row.prepaid}
        activeLabel="نعم"
        inactiveLabel="لا"
      />
    ),
    getSortValue: (row) => (row.prepaid ? 1 : 0),
    contentAlign: "center",
  },
];

type MemberOption = { value: number; label: string };

const memberSelectStyles: StylesConfig<
  MemberOption,
  false,
  GroupBase<MemberOption>
> = {
  container: (base) => ({ ...base, minWidth: "16rem" }),
  control: (base, state) => ({
    ...base,
    minHeight: 38,
    borderRadius: 8,
    borderColor: state.isFocused ? "#94a3b8" : "#cbd5e1",
    boxShadow: state.isFocused ? "0 0 0 1px #94a3b8" : "none",
  }),
  menu: (base) => ({ ...base, zIndex: 50 }),
  menuPortal: (base) => ({ ...base, zIndex: 50 }),
  indicatorSeparator: () => ({ display: "none" }),
};

function Toolbar({
  n,
  memberId,
  onMemberChange,
  rows,
}: {
  n: number;
  memberId: number | null;
  onMemberChange: (memberId: number | null) => void;
  rows: MembersContributionsWithRelations[];
}): ReactNode {
  const { isLoading: membersLoading, data: membersData } = useFetchAllMembers();
  const members = membersData ?? [];
  const options = useMemo<MemberOption[]>(
    () =>
      members.map((m) => ({
        value: m.id,
        label:
          m.member_name && m.member_name.trim() !== ""
            ? m.member_name
            : `دولة #${m.id}`,
      })),
    [members],
  );
  const selected = useMemo(
    () => options.find((o) => o.value === memberId) ?? null,
    [options, memberId],
  );

  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-700">الدولة:</label>
          <Select<MemberOption, false>
            inputId="members-contributions-member-filter"
            instanceId="members-contributions-member-filter"
            aria-label="الدولة"
            isRtl
            isSearchable
            isClearable
            isLoading={membersLoading}
            isDisabled={membersLoading}
            options={options}
            value={selected}
            onChange={(option: SingleValue<MemberOption>) =>
              onMemberChange(option?.value ?? null)
            }
            placeholder="اختر الدولة"
            noOptionsMessage={() => "لا توجد دول"}
            loadingMessage={() => "جاري التحميل…"}
            menuPosition="fixed"
            menuPortalTarget={
              typeof document !== "undefined" ? document.body : null
            }
            styles={memberSelectStyles}
          />
        </div>
      </div>
      <p className="text-sm text-slate-600">
        عدد السجلات:{" "}
        <span className="font-medium tabular-nums text-slate-800">{n}</span>
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => printMembersContributionsTable(rows)}
          disabled={rows.length === 0}
        >
          طباعة
        </button>
        <button
          type="button"
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => exportMembersContributionsToExcelCsv(rows)}
          disabled={rows.length === 0}
        >
          تصدير Excel
        </button>
      </div>
    </div>
  );
}

export default function MembersContributionsTable() {
  const [memberId, setMemberId] = useState<number | null>(null);

  const filters = useMemo(
    () => ({
      ...(memberId != null ? { member_id: memberId } : {}),
    }),
    [memberId],
  );

  const readyToFetch = memberId != null;
  const { isLoading, data, error, isError } = useFetchMembersContributions(
    filters,
    {
      enabled: readyToFetch,
    },
  );
  const rows = data ?? [];

  if (isError) {
    return (
      <p dir="rtl" className="text-destructive" role="alert">
        {error instanceof Error
          ? error.message
          : "حدث خطأ أثناء تحميل بيانات المساهمات المسددة"}
      </p>
    );
  }

  return (
    <div className="space-y-2" dir="rtl">
      <DataTable<MembersContributionsWithRelations>
        data={rows}
        columns={columns}
        isLoading={isLoading}
        loadingMessage="جاري تحميل بيانات المساهمات المسددة…"
        emptyMessage={
          !readyToFetch
            ? "اختر الدولة أولاً لعرض بيانات المساهمات المسددة."
            : "لا توجد بيانات مساهمات مسددة للعرض."
        }
        getRowId={(row) => row.id}
        showIndex
        indexHeader="#"
        toolbar={
          <Toolbar
            n={rows.length}
            memberId={memberId}
            onMemberChange={setMemberId}
            rows={rows}
          />
        }
        caption="جدول المساهمات المسددة"
        density="comfortable"
        minTableWidth="100%"
        maxHeight="70dvh"
        stickyHeader
      />
    </div>
  );
}
