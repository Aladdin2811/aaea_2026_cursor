import { Link } from "react-router-dom";
import { ShieldX } from "lucide-react";

/**
 * تُعرض عند محاولة الوصول إلى مسار دون الصلاحية المطلوبة.
 * لا تُضاف إلى القائمة الجانبية؛ الوصول عبر التوجيه البرمجي فقط.
 */
export default function AccessDeniedPage() {
  return (
    <div
      className="mx-auto flex max-w-lg flex-col items-center gap-4 rounded-2xl border border-amber-200/90 bg-amber-50/50 px-6 py-10 text-center shadow-sm"
      dir="rtl"
    >
      <span className="flex size-14 items-center justify-center rounded-full bg-amber-100 text-amber-800">
        <ShieldX className="size-8" strokeWidth={1.75} aria-hidden />
      </span>
      <h1 className="text-lg font-semibold text-slate-900">
        ليس لديك صلاحية
      </h1>
      <p className="text-sm leading-relaxed text-slate-600">
        لا تملك الصلاحية اللازمة للوصول إلى هذه الصفحة. إذا كنت بحاجة إلى الوصول،
        تواصل مع مشرف النظام لتعيين الصلاحيات المناسبة لدورك.
      </p>
      <Link
        to="/"
        className="mt-2 inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
      >
        العودة إلى الرئيسية
      </Link>
      <p className="text-xs text-slate-400">
        الوصول إلى هذا المسار غير مصرّح به وفق سياسة الصلاحيات.
      </p>
    </div>
  );
}
