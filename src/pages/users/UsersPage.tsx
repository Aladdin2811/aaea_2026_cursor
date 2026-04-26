import { UserPlus } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Spinner } from "../../components/ui/Spinner";
import { useUser } from "../../features/authentication/useUser";
import { useFetchRoles } from "../../features/roles/useRoles";
import { AddUserDialog } from "../../features/users/AddUserDialog";
import UsersTable from "../../features/users/UsersTable";

export default function UsersPage() {
  const { isLoading: userLoading, canManageUsers } = useUser();
  const { data: roles, isLoading: rolesLoading } = useFetchRoles();
  const [addOpen, setAddOpen] = useState(false);

  if (userLoading) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3" dir="rtl">
        <Spinner size="lg" />
        <p className="text-sm text-slate-600">جاري التحقق من الصلاحيات…</p>
      </div>
    );
  }

  if (!canManageUsers) {
    return (
      <div
        className="mx-auto max-w-lg space-y-4 rounded-2xl border border-amber-200/80 bg-amber-50/60 px-5 py-6 text-center"
        dir="rtl"
      >
        <h1 className="text-lg font-semibold text-amber-950">لا تملك صلاحية الوصول</h1>
        <p className="text-sm leading-relaxed text-amber-900/90">
          صفحة إدارة المستخدمين مفعّلة فقط لأدوار محددة. راجع المشرف أو عدّل الإعداد في الملف{" "}
          <code className="rounded bg-white/80 px-1 py-0.5 text-xs">src/config/roleAccess.ts</code>
          .
        </p>
        <Link
          to="/settings/roles"
          className="inline-block rounded-xl bg-amber-800 px-4 py-2 text-sm font-medium text-white hover:bg-amber-900"
        >
          الانتقال إلى «الصلاحيات»
        </Link>
      </div>
    );
  }

  const roleOptions = (roles ?? []).filter((r) => r.status !== false);

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-4 py-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">المستخدمون</h1>
          <p className="mt-1 text-sm text-slate-600">
            عرض المستخدمين المسجلين، تعديل الدور المرتبط بجدول الصلاحيات، وإضافة حسابات جديدة.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
          onClick={() => setAddOpen(true)}
          disabled={rolesLoading || roleOptions.length === 0}
          title={
            roleOptions.length === 0
              ? "عرّف دوراً مفعّلاً من صفحة الصلاحيات أولاً"
              : undefined
          }
        >
          <UserPlus className="size-5 shrink-0" strokeWidth={1.75} />
          مستخدم جديد
        </button>
      </div>

      {roleOptions.length === 0 ? (
        <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          لا توجد أدوار مفعّلة في النظام. أضف أدواراً من{" "}
          <Link to="/settings/roles" className="font-medium text-emerald-700 underline">
            إعدادات الصلاحيات
          </Link>{" "}
          قبل إنشاء مستخدمين.
        </p>
      ) : null}

      <UsersTable roleOptions={roleOptions} />

      <AddUserDialog open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
