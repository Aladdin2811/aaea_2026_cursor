import { Home, SearchX, Undo2 } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export function NotFoundPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname || "/";

  return (
    <div className="flex min-h-[min(560px,calc(100dvh-6rem))] items-center justify-center py-10">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-200/50 ring-1 ring-slate-100">
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 px-6 pb-10 pt-8 text-white">
          <div className="pointer-events-none absolute -start-20 -top-16 size-64 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -end-12 size-48 rounded-full bg-cyan-300/25 blur-2xl" />
          <div className="relative flex flex-col items-center text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/25 backdrop-blur-sm">
              <SearchX className="size-7" strokeWidth={1.75} aria-hidden />
            </div>
            <p
              className="mt-6 text-6xl font-black tracking-tight text-white/95 sm:text-7xl"
              aria-hidden
            >
              404
            </p>
            <h1 className="mt-1 text-xl font-bold sm:text-2xl">
              الصفحة غير موجودة
            </h1>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-emerald-50/95">
              الرابط الذي طلبته غير مُعرّف في النظام، أو قد يكون قد نُقل. تحقق
              من العنوان أو ارجع إلى الصفحة الرئيسية.
            </p>
          </div>
        </div>

        <div className="space-y-5 px-6 py-7">
          <div className="rounded-xl border border-slate-200/90 bg-slate-50/80 px-3 py-2.5">
            <p className="text-xs font-medium text-slate-500">المسار المطلوب</p>
            <p
              className="mt-1 break-all font-mono text-sm text-slate-800"
              dir="ltr"
            >
              {path}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row-reverse sm:justify-center">
            <Link
              to="/"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 sm:flex-initial"
            >
              <Home className="size-4 shrink-0" strokeWidth={2} aria-hidden />
              الصفحة الرئيسية
            </Link>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 sm:flex-initial"
            >
              <Undo2 className="size-4 shrink-0" strokeWidth={2} aria-hidden />
              رجوع
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
