import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useFetchRoles } from "../roles/useRoles";
import { useSignup } from "../authentication/useSignup";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function AddUserDialog({ open, onClose }: Props) {
  const { data: roles, isLoading: rolesLoading } = useFetchRoles();
  const { signup, isLoading } = useSignup();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [roleId, setRoleId] = useState<string>("");

  const activeRoles = useMemo(
    () => (roles ?? []).filter((r) => r.status !== false),
    [roles],
  );

  useEffect(() => {
    if (!open || activeRoles.length === 0) return;
    if (!roleId || !activeRoles.some((r) => String(r.id) === roleId)) {
      setRoleId(String(activeRoles[0]!.id));
    }
  }, [open, activeRoles, roleId]);

  function reset() {
    setFullName("");
    setEmail("");
    setPassword("");
    setPasswordConfirm("");
    setRoleId(activeRoles[0]?.id != null ? String(activeRoles[0].id) : "");
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();
    if (!trimmedName || !trimmedEmail || !password) return;
    if (password.length < 8) return;
    if (password !== passwordConfirm) return;
    const rid = Number.parseInt(roleId, 10);
    if (!Number.isFinite(rid) || rid < 1) return;

    signup(
      { fullName: trimmedName, roleId: rid, email: trimmedEmail, password },
      {
        onSuccess: () => handleClose(),
      },
    );
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-user-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
        aria-label="إغلاق"
        onClick={() => !isLoading && handleClose()}
      />
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl shadow-slate-300/40">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-5">
          <h2 id="add-user-title" className="text-base font-semibold text-slate-900">
            إضافة مستخدم جديد
          </h2>
          <button
            type="button"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50"
            disabled={isLoading}
            onClick={() => !isLoading && handleClose()}
            aria-label="إغلاق"
          >
            <X className="size-5" strokeWidth={1.75} />
          </button>
        </div>

        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="space-y-4 px-4 py-4 sm:px-5"
          dir="rtl"
        >
          <div className="space-y-1.5">
            <label htmlFor="add-user-name" className="text-sm font-medium text-slate-700">
              الاسم الكامل
            </label>
            <input
              id="add-user-name"
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isLoading}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm outline-none ring-emerald-500/20 focus:border-emerald-400 focus:bg-white focus:ring-2"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="add-user-role" className="text-sm font-medium text-slate-700">
              الصلاحية (من جدول الأدوار)
            </label>
            <select
              id="add-user-role"
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              disabled={isLoading || rolesLoading}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm outline-none ring-emerald-500/20 focus:border-emerald-400 focus:bg-white focus:ring-2"
              required
            >
              {activeRoles.length === 0 ? (
                <option value="">لا توجد أدوار مفعّلة — عرّف أدواراً من «الصلاحيات»</option>
              ) : null}
              {activeRoles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.role_name ?? `دور #${r.id}`}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="add-user-email" className="text-sm font-medium text-slate-700">
              البريد الإلكتروني
            </label>
            <input
              id="add-user-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm outline-none ring-emerald-500/20 focus:border-emerald-400 focus:bg-white focus:ring-2"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="add-user-pass" className="text-sm font-medium text-slate-700">
              كلمة المرور (8 أحرف على الأقل)
            </label>
            <input
              id="add-user-pass"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              minLength={8}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm outline-none ring-emerald-500/20 focus:border-emerald-400 focus:bg-white focus:ring-2"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="add-user-pass2" className="text-sm font-medium text-slate-700">
              تأكيد كلمة المرور
            </label>
            <input
              id="add-user-pass2"
              type="password"
              autoComplete="new-password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              disabled={isLoading}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm outline-none ring-emerald-500/20 focus:border-emerald-400 focus:bg-white focus:ring-2"
              required
            />
          </div>

          {password && passwordConfirm && password !== passwordConfirm ? (
            <p className="text-sm text-red-600" role="alert">
              كلمتا المرور غير متطابقتين
            </p>
          ) : null}

          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              disabled={isLoading}
              onClick={() => handleClose()}
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
              disabled={
                isLoading ||
                rolesLoading ||
                activeRoles.length === 0 ||
                password !== passwordConfirm
              }
            >
              {isLoading ? "جاري الإنشاء…" : "إنشاء المستخدم"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
