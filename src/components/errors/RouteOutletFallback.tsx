import { Spinner } from "../ui/Spinner";

/**
 * يُعرض أثناء تحميل صفحات المسارات الديناميكية (React.lazy).
 */
export function RouteOutletFallback() {
  return (
    <div
      className="flex min-h-[40vh] flex-col items-center justify-center gap-3 py-12 text-slate-600"
      dir="rtl"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Spinner size="lg" />
      <p className="text-sm">جاري تحميل الصفحة…</p>
    </div>
  );
}
