import { X } from "lucide-react";
import { useEffect, useState } from "react";
import type {
  CreateGeneralAccountInput,
  GeneralAccountWithType,
  UpdateGeneralAccountInput,
} from "../../../api/apiGeneralAccount";

type Props = {
  open: boolean;
  mode: "create" | "edit";
  initial: GeneralAccountWithType | null;
  accountTypeId: number | null;
  isSubmitting: boolean;
  onClose: () => void;
  onCreate: (input: CreateGeneralAccountInput) => void;
  onUpdate: (payload: { id: number; patch: UpdateGeneralAccountInput }) => void;
};

export function GeneralAccountFormDialog({
  open,
  mode,
  initial,
  accountTypeId,
  isSubmitting,
  onClose,
  onCreate,
  onUpdate,
}: Props) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(initial?.general_account_name ?? "");
    setCode(initial?.general_account_code ?? "");
    setDescription(initial?.description ?? "");
    setStatus(initial?.status ?? true);
    setError(null);
  }, [open, initial]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-xl rounded-2xl border bg-white p-4 shadow-xl" dir="rtl">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold">{mode === "create" ? "إضافة حساب عام" : "تعديل الحساب العام"}</h3>
          <button type="button" onClick={onClose} className="rounded p-1 hover:bg-slate-100"><X className="size-4" /></button>
        </div>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) {
              setError("اسم الحساب العام مطلوب");
              return;
            }
            setError(null);
            if (mode === "create") {
              onCreate({
                general_account_name: name.trim(),
                general_account_code: code.trim() || null,
                description: description.trim() || null,
                status,
                account_type_id: accountTypeId,
              });
            } else if (initial) {
              onUpdate({
                id: initial.id,
                patch: {
                  general_account_name: name.trim(),
                  general_account_code: code.trim() || null,
                  description: description.trim() || null,
                  status,
                },
              });
            }
          }}
        >
          <input className="w-full rounded border px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} placeholder="اسم الحساب العام" />
          <input className="w-full rounded border px-3 py-2" value={code} onChange={(e) => setCode(e.target.value)} placeholder="الكود" />
          <textarea className="w-full rounded border px-3 py-2" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="الوصف" rows={3} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={status} onChange={(e) => setStatus(e.target.checked)} />
            <span>مفعل</span>
          </label>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <div className="flex justify-end gap-2">
            <button type="button" className="rounded border px-3 py-2" onClick={onClose}>إلغاء</button>
            <button type="submit" className="rounded bg-emerald-600 px-3 py-2 text-white" disabled={isSubmitting}>
              {isSubmitting ? "جاري الحفظ..." : "حفظ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
