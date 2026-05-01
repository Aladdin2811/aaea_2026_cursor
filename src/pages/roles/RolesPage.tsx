import { Fragment, useMemo, useState } from "react";
import { useFetchRoles } from "../../features/roles/useRoles";
import {
  useBulkSetRolePermissions,
  usePermissionsCatalog,
  useRolePermissions,
  useToggleRolePermission,
} from "../../features/roles/useRolePermissionsAdmin";

export default function RolesPage() {
  const { data: roles, isLoading: rolesLoading, isError: rolesError } = useFetchRoles();
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);

  const selectedRole = useMemo(
    () => (roles ?? []).find((r) => r.id === selectedRoleId) ?? null,
    [roles, selectedRoleId],
  );

  const { data: permissions, isLoading: permissionsLoading, isError: permissionsError } =
    usePermissionsCatalog();
  const { data: rolePermissions, isLoading: rolePermsLoading, isError: rolePermsError } =
    useRolePermissions(selectedRoleId);
  const [search, setSearch] = useState("");
  const { mutate: togglePermission, isPending: isUpdating } =
    useToggleRolePermission(selectedRoleId);
  const { mutate: bulkSet, isPending: isBulkUpdating } =
    useBulkSetRolePermissions(selectedRoleId);

  const activeByPermissionId = useMemo(() => {
    const map = new Map<number, boolean>();
    for (const rp of rolePermissions ?? []) {
      map.set(rp.permission_id, rp.active);
    }
    return map;
  }, [rolePermissions]);
  const filteredPermissions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (q.length === 0) return permissions ?? [];
    return (permissions ?? []).filter((p) => {
      const code = p.code.toLowerCase();
      const label = (p.label_ar ?? "").toLowerCase();
      return code.includes(q) || label.includes(q);
    });
  }, [permissions, search]);

  const groupedPermissions = useMemo(() => {
    const groups = new Map<string, typeof filteredPermissions>();
    for (const perm of filteredPermissions) {
      const parts = perm.code.split(".");
      const group = parts.length >= 2 ? `${parts[0]}.${parts[1]}` : "other";
      const prev = groups.get(group) ?? [];
      prev.push(perm);
      groups.set(group, prev);
    }
    return Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filteredPermissions]);

  const canMutate = !(isUpdating || isBulkUpdating);

  return (
    <div className="grid gap-4 lg:grid-cols-[22rem_minmax(0,1fr)]" dir="rtl">
      <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <h2 className="mb-2 text-sm font-semibold text-slate-900">الأدوار</h2>
        {rolesLoading ? <p className="text-sm text-slate-600">جاري تحميل الأدوار…</p> : null}
        {rolesError ? (
          <p className="text-sm text-destructive">تعذّر تحميل الأدوار.</p>
        ) : null}
        <div className="space-y-2">
          {(roles ?? []).map((role) => {
            const selected = selectedRoleId === role.id;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelectedRoleId(role.id)}
                className={`w-full rounded-lg border px-3 py-2 text-right text-sm transition ${
                  selected
                    ? "border-emerald-400 bg-emerald-50 text-emerald-900"
                    : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                }`}
              >
                <div className="font-medium">{role.role_name ?? `دور #${role.id}`}</div>
                <div className="mt-0.5 text-xs text-slate-500">{role.description ?? "—"}</div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900">
            {selectedRole ? `صلاحيات الدور: ${selectedRole.role_name ?? selectedRole.id}` : "صلاحيات الدور"}
          </h2>
          <span className="text-xs text-slate-500">
            {isUpdating || isBulkUpdating ? "جاري الحفظ…" : "التحديث مباشر"}
          </span>
        </div>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <input
            type="text"
            className="min-w-60 rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="بحث بالكود أو الوصف…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            type="button"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            disabled={!canMutate || selectedRoleId == null || filteredPermissions.length === 0}
            onClick={() =>
              bulkSet({
                permissionIds: filteredPermissions.map((p) => p.id),
                active: true,
              })
            }
          >
            تفعيل الكل
          </button>
          <button
            type="button"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            disabled={!canMutate || selectedRoleId == null || filteredPermissions.length === 0}
            onClick={() =>
              bulkSet({
                permissionIds: filteredPermissions.map((p) => p.id),
                active: false,
              })
            }
          >
            تعطيل الكل
          </button>
        </div>

        {selectedRoleId == null ? (
          <p className="text-sm text-slate-600">اختر دورًا من القائمة لبدء إدارة الصلاحيات.</p>
        ) : null}
        {permissionsLoading || rolePermsLoading ? (
          <p className="text-sm text-slate-600">جاري تحميل الصلاحيات…</p>
        ) : null}
        {permissionsError || rolePermsError ? (
          <p className="text-sm text-destructive">تعذّر تحميل صلاحيات الدور.</p>
        ) : null}

        {selectedRoleId != null && !permissionsLoading && !rolePermsLoading ? (
          <div className="max-h-[70vh] overflow-auto rounded-lg border border-slate-200">
            <table className="w-full min-w-[40rem] border-collapse text-sm">
              <thead className="sticky top-0 z-10 bg-slate-100 text-slate-700">
                <tr>
                  <th className="border-b border-slate-200 px-3 py-2 text-right">الكود</th>
                  <th className="border-b border-slate-200 px-3 py-2 text-right">الوصف</th>
                  <th className="border-b border-slate-200 px-3 py-2 text-center">مفعلة</th>
                </tr>
              </thead>
              <tbody>
                {groupedPermissions.map(([group, rows]) => (
                  <Fragment key={`g-${group}`}>
                    <tr key={`h-${group}`} className="bg-slate-100/80">
                      <td colSpan={3} className="border-b border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700">
                        {group}
                      </td>
                    </tr>
                    {rows.map((perm) => {
                      const active = activeByPermissionId.get(perm.id) ?? false;
                      return (
                        <tr key={perm.id} className="odd:bg-white even:bg-slate-50/50">
                          <td className="border-b border-slate-100 px-3 py-2 font-mono text-xs text-slate-800">
                            {perm.code}
                          </td>
                          <td className="border-b border-slate-100 px-3 py-2 text-slate-700">
                            {perm.label_ar ?? "—"}
                          </td>
                          <td className="border-b border-slate-100 px-3 py-2 text-center">
                            <input
                              type="checkbox"
                              checked={active}
                              disabled={!canMutate}
                              onChange={(e) =>
                                togglePermission({
                                  permissionId: perm.id,
                                  active: e.target.checked,
                                })
                              }
                              aria-label={`تفعيل ${perm.code}`}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </div>
  );
}
