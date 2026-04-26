import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type {
  CertifiedProgramWithRelations,
  CreateCertifiedProgramInput,
  UpdateCertifiedProgramInput,
} from "../../api/apiCertifiedPrograms";
import { Spinner } from "../../components/ui/Spinner";
import { useFetchActivYears } from "../years/year/useYears";
import {
  useDetailedBriefForNo3,
  useNo3ForProgramsSelect,
} from "./useCertifiedPrograms";

type Props = {
  open: boolean;
  mode: "create" | "edit";
  initial: CertifiedProgramWithRelations | null;
  /** عند الإنشاء: تثبيت السنة على سنة العرض الحالية */
  contextYearId?: number | null;
  onClose: () => void;
  isSubmitting: boolean;
  onSubmit: (payload: CreateCertifiedProgramInput | UpdateCertifiedProgramInput) => void;
};

function parseOptionalInt(value: string): number | null {
  const t = value.trim();
  if (t === "") return null;
  const n = Number.parseInt(t, 10);
  return Number.isFinite(n) ? n : null;
}

export function CertifiedProgramFormDialog({
  open,
  mode,
  initial,
  contextYearId,
  onClose,
  isSubmitting,
  onSubmit,
}: Props) {
  const { isLoading: yearsLoading, data: years } = useFetchActivYears();
  const { isLoading: no3Loading, data: no3List } = useNo3ForProgramsSelect();

  const [programName, setProgramName] = useState("");
  const [objectives, setObjectives] = useState("");
  const [yearId, setYearId] = useState("");
  const [no3Id, setNo3Id] = useState("");
  const [detailedId, setDetailedId] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);

  const no3Numeric = useMemo(() => parseOptionalInt(no3Id), [no3Id]);
  const { isLoading: detailedLoading, data: detailedList } =
    useDetailedBriefForNo3(no3Numeric);

  const lockYearToContext =
    mode === "create" &&
    contextYearId != null &&
    Number.isFinite(contextYearId) &&
    contextYearId > 0;

  useEffect(() => {
    if (!open) return;
    setNameError(null);
    if (mode === "edit" && initial) {
      setProgramName(initial.program_name ?? "");
      setObjectives(initial.objectives ?? "");
      setYearId(initial.year_id != null ? String(initial.year_id) : "");
      setNo3Id(initial.no3_id != null ? String(initial.no3_id) : "");
      setDetailedId(initial.detailed_id != null ? String(initial.detailed_id) : "");
    } else {
      setProgramName("");
      setObjectives("");
      setYearId(
        lockYearToContext && contextYearId != null
          ? String(contextYearId)
          : "",
      );
      setNo3Id("");
      setDetailedId("");
    }
  }, [open, mode, initial, lockYearToContext, contextYearId]);

  function handleNo3Change(value: string) {
    setNo3Id(value);
    setDetailedId("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = programName.trim();
    if (!trimmed) {
      setNameError("اسم البرنامج / النشاط مطلوب");
      return;
    }
    setNameError(null);
    const payload = {
      program_name: trimmed,
      objectives: objectives.trim() || null,
      year_id: parseOptionalInt(yearId),
      no3_id: parseOptionalInt(no3Id),
      detailed_id: parseOptionalInt(detailedId),
    };
    onSubmit(payload);
  }

  if (!open) return null;

  const yearRows = years ?? [];
  const no3Rows = no3List ?? [];
  const detailedRows = detailedList ?? [];

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cert-prog-form-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
        aria-label="إغلاق"
        onClick={() => !isSubmitting && onClose()}
      />
      <div className="relative z-10 flex max-h-[min(92vh,44rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl shadow-slate-300/40">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-5">
          <div>
            <h2 id="cert-prog-form-title" className="text-base font-semibold text-slate-900">
              {mode === "create" ? "نشاط معتمد جديد" : "تعديل نشاط معتمد"}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              اربط النشاط بالسنة المحاسبية والنوع (no3) والحساب التفصيلي عند الحاجة.
            </p>
          </div>
          <button
            type="button"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50"
            disabled={isSubmitting}
            onClick={() => !isSubmitting && onClose()}
            aria-label="إغلاق"
          >
            <X className="size-5" strokeWidth={1.75} />
          </button>
        </div>

        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="flex min-h-0 flex-1 flex-col"
          dir="rtl"
        >
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-y-contain px-4 py-4 sm:px-5">
            <div className="space-y-1.5">
              <label htmlFor="cp-name" className="text-sm font-medium text-slate-700">
                اسم البرنامج / النشاط <span className="text-red-600">*</span>
              </label>
              <input
                id="cp-name"
                type="text"
                value={programName}
                onChange={(e) => {
                  setProgramName(e.target.value);
                  if (nameError) setNameError(null);
                }}
                disabled={isSubmitting}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm outline-none ring-emerald-500/20 focus:border-emerald-400 focus:bg-white focus:ring-2"
                aria-invalid={Boolean(nameError)}
              />
              {nameError ? (
                <p className="text-sm text-red-600" role="alert">
                  {nameError}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="cp-obj" className="text-sm font-medium text-slate-700">
                الأهداف
              </label>
              <textarea
                id="cp-obj"
                rows={4}
                value={objectives}
                onChange={(e) => setObjectives(e.target.value)}
                disabled={isSubmitting}
                placeholder="صف أهداف النشاط أو البرنامج…"
                className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm outline-none ring-emerald-500/20 focus:border-emerald-400 focus:bg-white focus:ring-2"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <label htmlFor="cp-year" className="text-sm font-medium text-slate-700">
                  السنة المحاسبية
                </label>
                <div className="relative">
                  <select
                    id="cp-year"
                    value={yearId}
                    onChange={(e) => setYearId(e.target.value)}
                    disabled={isSubmitting || yearsLoading || lockYearToContext}
                    title={
                      lockYearToContext
                        ? "السنة مرتبطة بسنة العرض في الصفحة"
                        : undefined
                    }
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 pe-9 text-sm outline-none ring-emerald-500/20 focus:border-emerald-400 focus:bg-white focus:ring-2 disabled:opacity-60"
                  >
                    <option value="">— بدون سنة —</option>
                    {yearRows.map((y) => (
                      <option key={y.id} value={String(y.id)}>
                        {y.year_num ?? `سنة #${y.id}`}
                      </option>
                    ))}
                  </select>
                  {yearsLoading ? (
                    <span className="pointer-events-none absolute end-2 top-1/2 -translate-y-1/2">
                      <Spinner size="sm" />
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="cp-no3" className="text-sm font-medium text-slate-700">
                  نوع الحساب (no3)
                </label>
                <div className="relative">
                  <select
                    id="cp-no3"
                    value={no3Id}
                    onChange={(e) => handleNo3Change(e.target.value)}
                    disabled={isSubmitting || no3Loading}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 pe-9 text-sm outline-none ring-emerald-500/20 focus:border-emerald-400 focus:bg-white focus:ring-2 disabled:opacity-60"
                  >
                    <option value="">— اختر النوع —</option>
                    {no3Rows.map((n) => (
                      <option key={n.id} value={String(n.id)}>
                        {[n.no3_name, n.no3_code].filter(Boolean).join(" — ") ||
                          `نوع #${n.id}`}
                      </option>
                    ))}
                  </select>
                  {no3Loading ? (
                    <span className="pointer-events-none absolute end-2 top-1/2 -translate-y-1/2">
                      <Spinner size="sm" />
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="cp-det" className="text-sm font-medium text-slate-700">
                  الحساب التفصيلي
                </label>
                <div className="relative">
                  <select
                    id="cp-det"
                    value={detailedId}
                    onChange={(e) => setDetailedId(e.target.value)}
                    disabled={
                      isSubmitting ||
                      !no3Numeric ||
                      detailedLoading ||
                      detailedRows.length === 0
                    }
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 pe-9 text-sm outline-none ring-emerald-500/20 focus:border-emerald-400 focus:bg-white focus:ring-2 disabled:opacity-60"
                  >
                    <option value="">
                      {!no3Numeric
                        ? "اختر النوع أولاً"
                        : detailedRows.length === 0 && !detailedLoading
                          ? "لا توجد حسابات تفصيلية"
                          : "— بدون تفصيلي —"}
                    </option>
                    {detailedRows.map((d) => (
                      <option key={d.id} value={String(d.id)}>
                        {[d.detailed_name, d.detailed_code].filter(Boolean).join(" — ") ||
                          `تفصيلي #${d.id}`}
                      </option>
                    ))}
                  </select>
                  {detailedLoading && no3Numeric ? (
                    <span className="pointer-events-none absolute end-2 top-1/2 -translate-y-1/2">
                      <Spinner size="sm" />
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/40 px-4 py-3 sm:px-5">
            <button
              type="button"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              disabled={isSubmitting}
              onClick={() => onClose()}
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? "جاري الحفظ…" : mode === "create" ? "تسجيل" : "حفظ التعديلات"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
