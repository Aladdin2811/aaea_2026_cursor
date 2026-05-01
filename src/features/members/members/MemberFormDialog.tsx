import { X } from "lucide-react";
import { useEffect, useState } from "react";
import type {
  CreateMemberInput,
  MemberRow,
  UpdateMemberInput,
} from "../../../api/apiMembers";

type Props = {
  open: boolean;
  mode: "create" | "edit";
  initial: MemberRow | null;
  isSubmitting: boolean;
  onClose: () => void;
  onCreate: (input: CreateMemberInput) => void;
  onUpdate: (payload: { id: number; patch: UpdateMemberInput }) => void;
};

type FormState = {
  member_name: string;
  member_notes: string;
  status: boolean;
};

function initState(row: MemberRow | null): FormState {
  return {
    member_name: row?.member_name ?? "",
    member_notes: row?.member_notes ?? "",
    status: row?.status ?? true,
  };
}

export function MemberFormDialog({
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
      aria-labelledby="member-form-title"
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
          <h2 id="member-form-title" className="text-base font-semibold text-slate-900">
            {mode === "create" ? "إضافة دولة عضو" : "تعديل بيانات الدولة العضو"}
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
            const member_name = form.member_name.trim();
            if (member_name.length === 0) {
              setFormError("اسم الدولة مطلوب.");
              return;
            }
            setFormError(null);
            if (mode === "create") {
              onCreate({
                member_name,
                member_notes: form.member_notes.trim() || null,
                status: form.status,
              });
              return;
            }
            if (initial) {
              onUpdate({
                id: initial.id,
                patch: {
                  member_name,
                  member_notes: form.member_notes.trim() || null,
                  status: form.status,
                },
              });
            }
          }}
        >
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-700">اسم الدولة</span>
            <input
              type="text"
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:border-slate-400 focus:outline-none"
              value={form.member_name}
              disabled={isSubmitting}
              onChange={(e) => setForm((prev) => ({ ...prev, member_name: e.target.value }))}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-700">ملاحظات</span>
            <textarea
              rows={3}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:border-slate-400 focus:outline-none"
              value={form.member_notes}
              disabled={isSubmitting}
              onChange={(e) => setForm((prev) => ({ ...prev, member_notes: e.target.value }))}
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
