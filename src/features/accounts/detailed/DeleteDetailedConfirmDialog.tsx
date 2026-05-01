import type { DetailedWithRelations } from "../../../api/apiDetailed";

type Props = {
  open: boolean;
  row: DetailedWithRelations | null;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (id: number) => void;
};

export function DeleteDetailedConfirmDialog({ open, row, isSubmitting, onClose, onConfirm }: Props) {
  if (!open || !row) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl border bg-white p-4 shadow-xl" dir="rtl">
        <h3 className="font-semibold">تأكيد حذف الحساب التفصيلي</h3>
        <p className="mt-2 text-sm">هل تريد حذف: <span className="font-semibold">{row.detailed_name ?? `#${row.id}`}</span>؟</p>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" className="rounded border px-3 py-2" onClick={onClose}>إلغاء</button>
          <button type="button" className="rounded bg-red-600 px-3 py-2 text-white" disabled={isSubmitting} onClick={() => onConfirm(row.id)}>{isSubmitting ? "جاري الحذف..." : "حذف"}</button>
        </div>
      </div>
    </div>
  );
}
