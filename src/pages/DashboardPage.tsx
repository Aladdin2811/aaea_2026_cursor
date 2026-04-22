import { FileSpreadsheet, TrendingDown, TrendingUp } from 'lucide-react'

const stats = [
  {
    label: 'إيرادات الشهر',
    value: '—',
    hint: 'سنربطها بالبيانات لاحقاً',
    icon: TrendingUp,
    tone: 'from-emerald-500/90 to-teal-600',
  },
  {
    label: 'المصروفات',
    value: '—',
    hint: 'مؤشرات سريعة وواضحة',
    icon: TrendingDown,
    tone: 'from-slate-700 to-slate-900',
  },
  {
    label: 'الفواتير المعلّقة',
    value: '—',
    hint: 'متابعة دورة التحصيل',
    icon: FileSpreadsheet,
    tone: 'from-amber-500 to-orange-600',
  },
]

export function DashboardPage() {
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-6 text-white shadow-lg shadow-emerald-900/20 sm:p-8">
        <div className="pointer-events-none absolute -start-24 -top-24 size-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -end-16 size-56 rounded-full bg-cyan-400/20 blur-2xl" />
        <div className="relative flex flex-col items-center gap-4 text-center">
          <div className="mx-auto max-w-4xl space-y-2">
            {/* <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
              <Sparkles className="size-3.5" strokeWidth={2} />
              بداية منظّمة
            </p> */}
            <h2 className="text-2xl font-bold leading-tight sm:text-3xl">
              مرحباً بك في البرنامج المالي والإداري للهيئة العربية للطاقة الذرية
            </h2>
            {/* <p className="max-w-xl text-sm leading-relaxed text-emerald-50/95">
              واجهة عربية، تنقل بسيط، وتصميم هادئ لمتابعة المؤشرات والمهام
              اليومية دون ضجيج بصري. الخطوة التالية: نربط الأرقام الحقيقية
              ونضيف الصفحات واحدة تلو الأخرى.
            </p> */}
          </div>
          {/* <Link
            to="/accounting"
            className="self-start rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-emerald-800 shadow-sm transition hover:bg-emerald-50"
          >
            استكشف المحاسبة
          </Link> */}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map(({ label, value, hint, icon: Icon, tone }) => (
          <article
            key={label}
            className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/40 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div
              className={`mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md ${tone}`}
            >
              <Icon className="size-5" strokeWidth={1.75} />
            </div>
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              {value}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">{hint}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-5">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-slate-900">آخر النشاط</h3>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
              تجريبي
            </span>
          </div>
          <ul className="mt-4 divide-y divide-slate-100">
            {[
              'تم إنشاء مسودة تقرير شهري',
              'تذكير: مراجعة حركة الخزينة',
              'طلب شراء بانتظار الاعتماد',
            ].map((item) => (
              <li
                key={item}
                className="flex items-start justify-between gap-3 py-3 text-sm text-slate-700"
              >
                <span>{item}</span>
                <span className="shrink-0 text-xs text-slate-400">قريباً</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-dashed border-emerald-200/80 bg-emerald-50/40 p-5 lg:col-span-2">
          <h3 className="text-base font-semibold text-emerald-900">ماذا بعد؟</h3>
          <p className="mt-2 text-sm leading-relaxed text-emerald-900/80">
            اختر الوحدة التالية لنبنيها معاً: المحاسبة، الخزينة، الموارد
            البشرية، أو المخزون. كل صفحة ستُضاف هنا بنفس أسلوب التصميم.
          </p>
        </div>
      </section>
    </div>
  )
}
