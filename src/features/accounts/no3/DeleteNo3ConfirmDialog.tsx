import type { No3WithRelations } from "../../../api/apiNo3";

type Props = {
  open: boolean;
  row: No3WithRelations | null;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (id: number) => void;
};

export function DeleteNo3ConfirmDialog({
  open,
  row,
  isSubmitting,
  onClose,
  onConfirm,
}: Props) {
  if (!open || !row) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="delete-no3-title">
      <button type="button" className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]" aria-label="إغلاق" onClick={onClose} disabled={isSubmitting} />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xl shadow-slate-300/40" dir="rtl">
        <h2 id="delete-no3-title" className="text-base font-semibold text-slate-900">تأكيد حذف النوع</h2>
        <p className="mt-2 text-sm text-slate-700">
          هل تريد حذف النوع: <span className="font-semibold text-slate-900">{row.no3_name ?? `#${row.id}`}</span>؟
        </p>
        <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:opacity-50" onClick={onClose} disabled={isSubmitting}>إلغاء</button>
          <button type="button" className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-50" onClick={() => onConfirm(row.id)} disabled={isSubmitting}>
            {isSubmitting ? "جاري الحذف…" : "حذف"}
          </button>
        </div>
      </div>
    </div>
  );
}
