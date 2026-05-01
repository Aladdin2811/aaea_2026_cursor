import { X } from "lucide-react";
import { useEffect, useState } from "react";
import type {
  AccountTypeRow,
  CreateAccountTypeInput,
  UpdateAccountTypeInput,
} from "../../../api/apiAccountType";

type Props = {
  open: boolean;
  mode: "create" | "edit";
  initial: AccountTypeRow | null;
  isSubmitting: boolean;
  onClose: () => void;
  onCreate: (input: CreateAccountTypeInput) => void;
  onUpdate: (payload: { id: number; newUpdateData: UpdateAccountTypeInput }) => void;
};

type FormState = {
  account_type_name: string;
  status: boolean;
};

function initState(row: AccountTypeRow | null): FormState {
  return {
    account_type_name: row?.account_type_name ?? "",
    status: row?.status ?? true,
  };
}

export function AccountTypeFormDialog({
  open,
  mode,
  initial,
  isSubmitting,
  onClose,
  onCreate,
  onUpdate,
}: Props) {
  const [form, setForm] = useState<FormState>(() => initState(initial));
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setForm(initState(initial));
    setFormError(null);
  }, [open, initial]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="account-type-form-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
        aria-label="إغلاق"
        disabled={isSubmitting}
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl shadow-slate-300/40">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-5">
          <h2 id="account-type-form-title" className="text-base font-semibold text-slate-900">
            {mode === "create" ? "إضافة نوع حساب" : "تعديل نوع الحساب"}
          </h2>
          <button
            type="button"
            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:opacity-40"
            disabled={isSubmitting}
            onClick={onClose}
            aria-label="إغلاق"
          >
            <X className="size-5" strokeWidth={1.75} />
          </button>
        </div>
        <form
          dir="rtl"
          className="space-y-4 px-4 py-4 sm:px-5"
          onSubmit={(event) => {
            event.preventDefault();
            const name = form.account_type_name.trim();
            if (name.length === 0) {
              setFormError("اسم نوع الحساب مطلوب.");
              return;
            }
            setFormError(null);
            if (mode === "create") {
              onCreate({ account_type_name: name, status: form.status });
              return;
            }
            if (initial) {
              onUpdate({
                id: initial.id,
                newUpdateData: { account_type_name: name, status: form.status },
              });
            }
          }}
        >
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-700">اسم نوع الحساب</span>
            <input
              type="text"
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:border-slate-400 focus:outline-none"
              value={form.account_type_name}
              disabled={isSubmitting}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, account_type_name: e.target.value }))
              }
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.status}
              disabled={isSubmitting}
              onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.checked }))}
            />
            <span>مفعل</span>
          </label>
          {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
              disabled={isSubmitting}
              onClick={onClose}
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "جاري الحفظ…" : mode === "create" ? "إضافة" : "حفظ التعديلات"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
