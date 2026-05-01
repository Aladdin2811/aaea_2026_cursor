import { AlertTriangle, X } from "lucide-react";
import type { AccountTypeRow } from "../../../api/apiAccountType";

type Props = {
  open: boolean;
  row: AccountTypeRow | null;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function DeleteAccountTypeConfirmDialog({
  open,
  row,
  isDeleting,
  onCancel,
  onConfirm,
}: Props) {
  if (!open || !row) return null;
  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-account-type-title"
      aria-describedby="delete-account-type-desc"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
        aria-label="إلغاء"
        disabled={isDeleting}
        onClick={onCancel}
      />
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl shadow-slate-300/40">
        <div className="flex shrink-0 items-start gap-3 border-b border-red-100 bg-red-50/40 px-4 py-4 sm:px-5">
          <span className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-700">
            <AlertTriangle className="size-5" strokeWidth={1.75} />
          </span>
          <div className="min-w-0 flex-1 pe-1">
            <h2 id="delete-account-type-title" className="text-base font-semibold text-slate-900">
              حذف نوع الحساب؟
            </h2>
            <p id="delete-account-type-desc" className="mt-1 text-sm leading-relaxed text-slate-600">
              سيتم حذف هذا السجل نهائيًا ولا يمكن التراجع عن العملية.
            </p>
          </div>
          <button
            type="button"
            className="shrink-0 rounded-lg p-1.5 text-slate-500 transition hover:bg-white/80 hover:text-slate-800 disabled:opacity-40"
            disabled={isDeleting}
            onClick={onCancel}
            aria-label="إغلاق"
          >
            <X className="size-5" strokeWidth={1.75} />
          </button>
        </div>
        <div className="space-y-2 border-b border-slate-100 bg-slate-50/30 px-4 py-3 sm:px-5" dir="rtl">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">بيانات السجل</p>
          <dl className="grid gap-2 text-sm">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <dt className="text-slate-500">الاسم</dt>
              <dd className="min-w-0 break-words font-medium text-slate-900">
                {row.account_type_name ?? `#${row.id}`}
              </dd>
            </div>
          </dl>
        </div>
        <div className="flex flex-col-reverse gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-end sm:gap-3 sm:px-5">
          <button
            type="button"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 sm:w-auto"
            disabled={isDeleting}
            onClick={onCancel}
          >
            إلغاء
          </button>
          <button
            type="button"
            className="w-full rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-50 sm:w-auto"
            disabled={isDeleting}
            onClick={onConfirm}
          >
            {isDeleting ? "جاري الحذف…" : "حذف نهائيًا"}
          </button>
        </div>
      </div>
    </div>
  );
}
