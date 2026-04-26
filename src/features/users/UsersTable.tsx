import { useMemo, type ReactNode } from "react";
import type { RolesRow } from "../../api/apiRoles";
import type { UserProfileRow } from "../../api/apiUserProfiles";
import {
  DataTable,
  type DataTableColumn,
} from "../../components/ui/data-table";
import { formatOptionalText, stringValue } from "../../lib/displayValue";
import { useUserProfilesQuery, useUpdateUserRole } from "./useUsersAdmin";

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("ar", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function buildColumns(
  roleOptions: RolesRow[],
  updatingUserId: string | undefined,
  onRoleChange: (userId: string, roleId: number | null) => void,
): DataTableColumn<UserProfileRow>[] {
  return [
    {
      id: "full_name",
      header: "الاسم",
      className: "min-w-36",
      thClassName: "!whitespace-normal",
      cell: (row) => (
        <span className="block min-w-0 font-medium text-slate-900">
          {formatOptionalText(row.full_name)}
        </span>
      ),
      getSortValue: (r) => stringValue(r.full_name),
    },
    {
      id: "email",
      header: "البريد",
      className: "min-w-44 max-w-xs",
      thClassName: "!whitespace-normal",
      cell: (row) => (
        <span className="block min-w-0 truncate text-sm text-slate-700" title={row.email ?? ""}>
          {formatOptionalText(row.email)}
        </span>
      ),
      getSortValue: (r) => stringValue(r.email),
    },
    {
      id: "role",
      header: "الصلاحية",
      className: "min-w-44",
      thClassName: "!whitespace-normal",
      cell: (row) => (
        <select
          className="w-full max-w-[14rem] rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-800 outline-none ring-emerald-500/25 focus:border-emerald-400 focus:ring-2 disabled:opacity-60"
          value={row.role_id ?? ""}
          disabled={updatingUserId === row.id}
          aria-label={`تعديل صلاحية ${row.full_name || row.email || row.id}`}
          onChange={(e) => {
            const v = e.target.value;
            onRoleChange(row.id, v === "" ? null : Number(v));
          }}
        >
          <option value="">— بدون دور —</option>
          {roleOptions.map((r) => (
            <option key={r.id} value={r.id}>
              {r.role_name ?? `دور #${r.id}`}
            </option>
          ))}
        </select>
      ),
      getSortValue: (r) => stringValue(r.roles?.role_name ?? r.role_id),
    },
    {
      id: "created_at",
      header: "تاريخ الإضافة",
      className: "min-w-28",
      thClassName: "!whitespace-normal text-center",
      cell: (row) => (
        <span className="tabular-nums text-sm text-slate-600">{formatDate(row.created_at)}</span>
      ),
      getSortValue: (r) => r.created_at,
      contentAlign: "center",
    },
  ];
}

function ToolbarCount({ n }: { n: number }): ReactNode {
  return (
    <p className="text-sm text-slate-600">
      عدد المستخدمين:{" "}
      <span className="font-medium tabular-nums text-slate-800">{n}</span>
    </p>
  );
}

type Props = {
  roleOptions: RolesRow[];
};

export default function UsersTable({ roleOptions }: Props) {
  const { isLoading, data, error, isError } = useUserProfilesQuery();
  const { mutate: updateRole, isPending, variables } = useUpdateUserRole();
  const rows = useMemo(() => data ?? [], [data]);
  const updatingUserId = isPending ? variables?.userId : undefined;

  const columns = useMemo(
    () =>
      buildColumns(roleOptions, updatingUserId, (userId, roleId) => {
        updateRole({ userId, roleId });
      }),
    [roleOptions, updatingUserId, updateRole],
  );

  if (isError) {
    return (
      <p dir="rtl" className="text-destructive" role="alert">
        {error instanceof Error ? error.message : "حدث خطأ أثناء التحميل"}
      </p>
    );
  }

  return (
    <div className="space-y-2" dir="rtl">
      <DataTable<UserProfileRow>
        data={rows}
        columns={columns}
        isLoading={isLoading}
        loadingMessage="جاري تحميل المستخدمين…"
        emptyMessage="لا يوجد مستخدمون في القائمة. نفّذ هجرة قاعدة البيانات أو أضف مستخدماً جديداً."
        getRowId={(row) => row.id}
        showIndex
        indexHeader="#"
        toolbar={
          !isLoading && rows.length > 0 ? <ToolbarCount n={rows.length} /> : null
        }
        caption="جدول المستخدمين والصلاحيات"
        density="comfortable"
        minTableWidth="100%"
      />
    </div>
  );
}
