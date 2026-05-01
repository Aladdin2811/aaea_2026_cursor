import { X } from "lucide-react";
import { useEffect, useState } from "react";
import type {
  CreateTransfersInput,
  TransfersWithRelations,
  UpdateTransfersInput,
} from "../../../../api/apiTransfers";
import AccountTypeSelect from "../../../../components/select/AccountTypeSelect";
import BabSelect from "../../../../components/select/BabSelect";
import BandSelect from "../../../../components/select/BandSelect";
import DetailedSelect from "../../../../components/select/DetailedSelect";
import GeneralAccountSelect from "../../../../components/select/GeneralAccountSelect";
import No3Select from "../../../../components/select/No3Select";

type Mode = "create" | "edit";

type Props = {
  open: boolean;
  mode: Mode;
  initial: TransfersWithRelations | null;
  contextYearId: number | null;
  isSubmitting: boolean;
  onClose: () => void;
  onCreate: (input: CreateTransfersInput) => void;
  onUpdate: (payload: { id: number; patch: UpdateTransfersInput }) => void;
};

type FormState = {
  accountTypeId: number | null;
  generalAccountId: number | null;
  babId: number | null;
  bandId: number | null;
  no3Id: number | null;
  detailedId: number | null;
  transferFrom: string;
  transferTo: string;
  transferDate: string;
  notes: string;
};

function toNumberOrNull(value: string): number | null {
  const v = value.trim();
  if (v === "") return null;
  const n = Number.parseFloat(v);
  return Number.isFinite(n) ? n : null;
}

function initState(row: TransfersWithRelations | null): FormState {
  return {
    accountTypeId: row?.account_type_id ?? null,
    generalAccountId: row?.general_account_id ?? null,
    babId: row?.bab_id ?? null,
    bandId: row?.band_id ?? null,
    no3Id: row?.no3_id ?? null,
    detailedId: row?.detailed_id ?? null,
    transferFrom:
      row?.transfer_from != null && row.transfer_from !== ""
        ? String(row.transfer_from)
        : "",
    transferTo:
      row?.transfer_to != null && row.transfer_to !== "" ? String(row.transfer_to) : "",
    transferDate: row?.transfer_date ?? "",
    notes: row?.notes ?? "",
  };
}

export function TransferFormDialog({
  open,
  mode,
  initial,
  contextYearId,
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
  }, [open, initial, mode]);

  if (!open) return null;

  const title = mode === "create" ? "تسجيل مناقلة جديدة" : "تعديل بيانات المناقلة";

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="transfer-form-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
        aria-label="إغلاق"
        disabled={isSubmitting}
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl shadow-slate-300/40">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-5">
          <h2 id="transfer-form-title" className="text-base font-semibold text-slate-900">
            {title}
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
            setFormError(null);

            if (contextYearId == null) {
              setFormError("اختر السنة أولاً قبل الحفظ.");
              return;
            }
            if (form.accountTypeId == null) {
              setFormError("يرجى اختيار نوع الحساب.");
              return;
            }
            if (form.generalAccountId == null) {
              setFormError("يرجى اختيار الحساب العام.");
              return;
            }
            if (form.babId == null || form.bandId == null || form.no3Id == null) {
              setFormError("يرجى استكمال اختيار الباب والبند والنوع.");
              return;
            }
            if (form.detailedId == null) {
              setFormError("يرجى اختيار الحساب التفصيلي.");
              return;
            }
            const payload: UpdateTransfersInput = {
              year_id: contextYearId,
              account_type_id: form.accountTypeId,
              general_account_id: form.generalAccountId,
              bab_id: form.babId,
              band_id: form.bandId,
              no3_id: form.no3Id,
              detailed_id: form.detailedId,
              transfer_from: toNumberOrNull(form.transferFrom),
              transfer_to: toNumberOrNull(form.transferTo),
              transfer_date:
                form.transferDate.trim() === "" ? null : form.transferDate.trim(),
              notes: form.notes.trim() === "" ? null : form.notes.trim(),
            };

            if (mode === "create") {
              onCreate(payload);
            } else if (initial) {
              onUpdate({ id: initial.id, patch: payload });
            }
          }}
        >
          <div className="grid gap-3 sm:grid-cols-6">
            <label className="flex flex-col gap-1 text-sm sm:col-span-6">
              <span className="text-slate-700">السنة</span>
              <input
                type="text"
                className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-slate-800"
                value={contextYearId ?? ""}
                readOnly
              />
            </label>

            <div className="min-w-0 sm:col-span-3">
              <AccountTypeSelect
                value={form.accountTypeId}
                onlyActive={false}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    accountTypeId: value,
                    generalAccountId: null,
                    babId: null,
                    bandId: null,
                    no3Id: null,
                    detailedId: null,
                  }))
                }
                disabled={isSubmitting}
              />
            </div>

            <div className="min-w-0 sm:col-span-3">
              <GeneralAccountSelect
                value={form.generalAccountId}
                onlyActive={false}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    generalAccountId: value,
                    babId: null,
                    bandId: null,
                    no3Id: null,
                    detailedId: null,
                  }))
                }
                accountTypeId={form.accountTypeId}
                disabled={isSubmitting}
              />
            </div>

            <div className="min-w-0 sm:col-span-6">
              <BabSelect
                value={form.babId}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    babId: value,
                    bandId: null,
                    no3Id: null,
                    detailedId: null,
                  }))
                }
                generalAccountId={form.generalAccountId}
                disabled={isSubmitting}
              />
            </div>

            <div className="min-w-0 sm:col-span-3">
              <BandSelect
                value={form.bandId}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    bandId: value,
                    no3Id: null,
                    detailedId: null,
                  }))
                }
                babId={form.babId}
                disabled={isSubmitting}
              />
            </div>

            <div className="min-w-0 sm:col-span-3">
              <No3Select
                value={form.no3Id}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    no3Id: value,
                    detailedId: null,
                  }))
                }
                bandId={form.bandId}
                disabled={isSubmitting}
              />
            </div>

            <div className="min-w-0 sm:col-span-6">
              <DetailedSelect
                value={form.detailedId}
                fullWidth
                onChange={(value) => setForm((prev) => ({ ...prev, detailedId: value }))}
                no3Id={form.no3Id}
                disabled={isSubmitting}
              />
            </div>

            <label className="flex flex-col gap-1 text-sm sm:col-span-2">
              <span className="text-slate-700">منقول منه</span>
              <input
                type="number"
                step="0.01"
                inputMode="decimal"
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:border-slate-400 focus:outline-none"
                value={form.transferFrom}
                disabled={isSubmitting}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, transferFrom: e.target.value }))
                }
              />
            </label>

            <label className="flex flex-col gap-1 text-sm sm:col-span-2">
              <span className="text-slate-700">منقول إليه</span>
              <input
                type="number"
                step="0.01"
                inputMode="decimal"
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:border-slate-400 focus:outline-none"
                value={form.transferTo}
                disabled={isSubmitting}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, transferTo: e.target.value }))
                }
              />
            </label>

            <label className="flex flex-col gap-1 text-sm sm:col-span-2">
              <span className="text-slate-700">التاريخ</span>
              <input
                type="date"
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:border-slate-400 focus:outline-none"
                value={form.transferDate}
                disabled={isSubmitting}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, transferDate: e.target.value }))
                }
              />
            </label>

            <label className="flex flex-col gap-1 text-sm sm:col-span-6">
              <span className="text-slate-700">ملاحظات</span>
              <textarea
                rows={3}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:border-slate-400 focus:outline-none"
                value={form.notes}
                disabled={isSubmitting}
                onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
              />
            </label>
          </div>

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
              {isSubmitting
                ? "جاري الحفظ…"
                : mode === "create"
                  ? "حفظ المناقلة"
                  : "حفظ التعديلات"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
