import { FileSpreadsheet, TrendingDown, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import ActiveYearSelect from "../components/select/ActiveYearSelect";
import { useFetchBandSum } from "../features/accounts/band/useBand";
import { useFetchCurrentYear } from "../features/years/currentYear/useCurrentYear";
import { useFetchNo3Sum } from "../features/accounts/no3/useNo3";
import { useFetchBabExpensesSum } from "../features/accounts/bab/useBab";
import { useFetchBabBudget } from "../features/financialManagement/budgets/budgets/useBudgets";
import DecimalConverter from "../utils/DecimalConverter";

type DashboardNumericQuery = {
  isLoading: boolean;
  isError: boolean;
  data: number | undefined;
};

/** مبالغ من استعلام: … تحميل، — خطأ أو لا بيانات، وإلا `DecimalConverter`. */
function dashboardAmountFromQuery(
  query: DashboardNumericQuery | null | undefined,
  yearSelected: number | null,
  fallback: ReactNode = "—",
): ReactNode {
  if (query == null || yearSelected == null) return fallback;
  if (query.isLoading) return "…";
  if (query.isError) return "—";
  if (query.data == null) return fallback;
  return (
    <DecimalConverter
      number={query.data}
      minimumFractionDigits={2}
      maximumFractionDigits={2}
      className="tabular-nums"
    />
  );
}

const contributionsStats = [
  {
    label: "مساهمات الدول الأعضاء عن السنة المالية الجارية",
    value: "—",
    icon: TrendingUp,
    tone: "from-emerald-500/90 to-teal-600",
  },
  {
    label: "مساهمات الدول الأعضاء عن سنوات مالية سابقة",
    value: "—",
    icon: TrendingDown,
    tone: "from-slate-700 to-slate-900",
  },
  {
    label: "الموازنة الإضافية لسنة 2010",
    value: "—",
    icon: FileSpreadsheet,
    tone: "from-amber-500 to-orange-600",
  },
];

const SelfResourcesStats = [
  {
    label: "الخدمات والأنشطة المقدمة للغير",
    value: "—",
    // hint: "سنربطها بالبيانات لاحقاً",
    // icon: TrendingUp,
    // tone: "from-emerald-500/90 to-teal-600",
  },
  {
    label: "حاصل بيع النشرات والكتب",
    value: "—",
    // hint: "سنربطها بالبيانات لاحقاً",
    // icon: TrendingDown,
    // tone: "from-slate-700 to-slate-900",
  },
  {
    label: "عوائد الإستثمار",
    value: "—",
    // hint: "سنربطها بالبيانات لاحقاً",
    // icon: FileSpreadsheet,
    // tone: "from-amber-500 to-orange-600",
  },
  {
    label: "عوائد الودائع",
    value: "—",
    // hint: "سنربطها بالبيانات لاحقاً",
    // icon: FileSpreadsheet,
    // tone: "from-amber-500 to-orange-600",
  },
  {
    label: "عوائد الإيجارات",
    value: "—",
    // hint: "سنربطها بالبيانات لاحقاً",
    // icon: FileSpreadsheet,
    // tone: "from-amber-500 to-orange-600",
  },
  {
    label: "فرق سعر العملة",
    value: "—",
    // hint: "سنربطها بالبيانات لاحقاً",
    // icon: FileSpreadsheet,
    // tone: "from-amber-500 to-orange-600",
  },
  {
    label: "موارد أخرى متنوعة",
    value: "—",
    // hint: "سنربطها بالبيانات لاحقاً",
    // icon: FileSpreadsheet,
    // tone: "from-amber-500 to-orange-600",
  },
];

const expenses = [
  {
    label: "الباب الأول\n( نفقات الأفراد العاملين )",
    value: "—",
    // hint: "سنربطها بالبيانات لاحقاً",
    // icon: TrendingUp,
    // tone: "from-emerald-500/90 to-teal-600",
  },
  {
    label: "الباب الثاني\n( مصروفات سفر وتنقلات )",
    value: "—",
    // hint: "سنربطها بالبيانات لاحقاً",
    // icon: TrendingDown,
    // tone: "from-slate-700 to-slate-900",
  },
  {
    label: "الباب الثالث\n( المستلزمات الخدمية )",
    value: "—",
    // hint: "سنربطها بالبيانات لاحقاً",
    // icon: FileSpreadsheet,
    // tone: "from-amber-500 to-orange-600",
  },
  {
    label: "الباب الرابع\n( المستلزمات السلعية والصيانة )",
    value: "—",
    // hint: "سنربطها بالبيانات لاحقاً",
    // icon: FileSpreadsheet,
    // tone: "from-amber-500 to-orange-600",
  },
  {
    label: "الباب الخامس\n( المصروفات الرأسمالية )",
    value: "—",
    // hint: "سنربطها بالبيانات لاحقاً",
    // icon: FileSpreadsheet,
    // tone: "from-amber-500 to-orange-600",
  },
  {
    label: "الباب السادس\n( نفقات اجتماعات المجالس الرئيسية )",
    value: "—",
    // hint: "سنربطها بالبيانات لاحقاً",
    // icon: FileSpreadsheet,
    // tone: "from-amber-500 to-orange-600",
  },
  {
    label: "الباب السابع\n( الأنشطة والبرامج )",
    value: "—",
    // hint: "سنربطها بالبيانات لاحقاً",
    // icon: FileSpreadsheet,
    // tone: "from-amber-500 to-orange-600",
  },
];

export function DashboardPage() {
  const { data: currentYearRecord } = useFetchCurrentYear();
  const defaultFinancialYearId = currentYearRecord?.year_id ?? null;

  /** اختيار المستخدم؛ إن وُجدت `current_year` تُستخدم كقيمة ظاهرة واستعلام حتى يغيّر المستخدم */
  const [activeYearId, setActiveYearId] = useState<number | null>(null);

  const selectedFinancialYearId =
    activeYearId ?? defaultFinancialYearId ?? null;

  const currentYearContributions = useFetchBandSum(selectedFinancialYearId, 82);
  const previousYearContributions = useFetchBandSum(
    selectedFinancialYearId,
    83,
  );
  const additionalBudgetContributions = useFetchNo3Sum(
    selectedFinancialYearId,
    209,
  );
  const servicesProvidedToOthers = useFetchBandSum(selectedFinancialYearId, 84);
  const saleOfLeafletsAndBooks = useFetchBandSum(selectedFinancialYearId, 85);
  const investmentReturns = useFetchBandSum(selectedFinancialYearId, 86);
  const depositReturns = useFetchBandSum(selectedFinancialYearId, 87);
  const rentalIncome = useFetchBandSum(selectedFinancialYearId, 88);
  const currencyExchangeDifference = useFetchBandSum(
    selectedFinancialYearId,
    89,
  );
  const otherMiscResources = useFetchBandSum(selectedFinancialYearId, 90);

  const bab1 = useFetchBabBudget(selectedFinancialYearId, 7);
  const bab2 = useFetchBabBudget(selectedFinancialYearId, 8);
  const bab3 = useFetchBabBudget(selectedFinancialYearId, 9);
  const bab4 = useFetchBabBudget(selectedFinancialYearId, 10);
  const bab5 = useFetchBabBudget(selectedFinancialYearId, 11);
  const bab6 = useFetchBabBudget(selectedFinancialYearId, 12);
  const bab7 = useFetchBabBudget(selectedFinancialYearId, 13);

  const babExp1 = useFetchBabExpensesSum(selectedFinancialYearId, 7);
  const babExp2 = useFetchBabExpensesSum(selectedFinancialYearId, 8);
  const babExp3 = useFetchBabExpensesSum(selectedFinancialYearId, 9);
  const babExp4 = useFetchBabExpensesSum(selectedFinancialYearId, 10);
  const babExp5 = useFetchBabExpensesSum(selectedFinancialYearId, 11);
  const babExp6 = useFetchBabExpensesSum(selectedFinancialYearId, 12);
  const babExp7 = useFetchBabExpensesSum(selectedFinancialYearId, 13);

  /** ترتيبها يطابق `expenses` (الباب الأول … السابع) — `bab_id` في قاعدة البيانات 7…13 */
  const expensesBabBudgetQueries = [
    bab1,
    bab2,
    bab3,
    bab4,
    bab5,
    bab6,
    bab7,
  ] as const;

  const expensesBabExpensesSumQueries = [
    babExp1,
    babExp2,
    babExp3,
    babExp4,
    babExp5,
    babExp6,
    babExp7,
  ] as const;

  /** ترتيبها يطابق `SelfResourcesStats` */
  const selfResourcesSumQueries = [
    servicesProvidedToOthers,
    saleOfLeafletsAndBooks,
    investmentReturns,
    depositReturns,
    rentalIncome,
    currencyExchangeDifference,
    otherMiscResources,
  ] as const;

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
      <div className="space-y-2">
        <ActiveYearSelect
          value={selectedFinancialYearId}
          onChange={setActiveYearId}
          labelPosition="inline"
        />
        <hr className="mt-2 mb-3 h-0.5 w-full shrink-0 border-0 bg-emerald-200" />

        <span className="block min-w-0 underline text-lg font-bold text-slate-900">
          مساهمات الدول الأعضاء
        </span>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {contributionsStats.map(
            ({ label, value, icon: Icon, tone }, index) => {
              const sumQuery =
                index === 0
                  ? currentYearContributions
                  : index === 1
                    ? previousYearContributions
                    : index === 2
                      ? additionalBudgetContributions
                      : null;

              const amountNode = dashboardAmountFromQuery(
                sumQuery ?? undefined,
                selectedFinancialYearId,
                value,
              );

              return (
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
                    {amountNode}
                  </p>
                </article>
              );
            },
          )}
        </section>
      </div>
      <hr className="my-6 h-0.5 w-full shrink-0 border-0 bg-emerald-200" />
      <div className="space-y-1">
        <span className="block min-w-0 underline text-lg font-bold text-slate-900">
          إيرادات الموارد الذاتية
        </span>

        <section className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5">
          {SelfResourcesStats.map(({ label, value }, index) => {
            const sumQuery = selfResourcesSumQueries[index];

            const amountNode = dashboardAmountFromQuery(
              sumQuery,
              selectedFinancialYearId,
              value,
            );

            return (
              <article
                key={label}
                className="group relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm shadow-slate-200/40 transition hover:-translate-y-0.5 hover:shadow-md sm:p-3.5"
              >
                <p className="text-xs font-medium leading-snug text-slate-500 sm:text-sm">
                  {label}
                </p>
                <p className="mt-0.5 text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                  {amountNode}
                </p>
              </article>
            );
          })}
        </section>
      </div>

      <hr className="my-6 h-0.5 w-full shrink-0 border-0 bg-emerald-200" />

      <div className="space-y-1">
        <span className="block min-w-0 underline text-lg font-bold text-slate-900">
          الإعنمادات والمصروفات
        </span>

        <section className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-4">
          {expenses.map(({ label, value }, index) => {
            const budgetQuery = expensesBabBudgetQueries[index];
            const commitmentAmountNode = dashboardAmountFromQuery(
              budgetQuery,
              selectedFinancialYearId,
              value,
            );

            /** الأبواب 1–7 (bab1…bab7): تسمية «الإعتماد» ثم «المنصرف» من `get_bab_expenses_sum` */
            const showCommitmentLabel = index < 7;
            const expensesSumQuery = expensesBabExpensesSumQueries[index];
            const spentAmountNode =
              showCommitmentLabel && expensesSumQuery != null
                ? dashboardAmountFromQuery(
                    expensesSumQuery,
                    selectedFinancialYearId,
                    "\u00A0",
                  )
                : null;

            let remainingNode: ReactNode = "";
            let spendingRatioNode: ReactNode = "";
            if (
              showCommitmentLabel &&
              budgetQuery != null &&
              expensesSumQuery != null &&
              selectedFinancialYearId != null
            ) {
              if (budgetQuery.isLoading || expensesSumQuery.isLoading) {
                remainingNode = "…";
                spendingRatioNode = "…";
              } else if (budgetQuery.isError || expensesSumQuery.isError) {
                remainingNode = "—";
                spendingRatioNode = "—";
              } else if (
                budgetQuery.data === undefined ||
                expensesSumQuery.data === undefined
              ) {
                remainingNode = "—";
                spendingRatioNode = "—";
              } else {
                const committed = budgetQuery.data;
                const spent = expensesSumQuery.data;
                remainingNode = (
                  <DecimalConverter
                    number={committed - spent}
                    minimumFractionDigits={2}
                    maximumFractionDigits={2}
                    className="tabular-nums"
                  />
                );
                spendingRatioNode =
                  Math.abs(committed) < Number.EPSILON ? (
                    "—"
                  ) : (
                    <>
                      <DecimalConverter
                        number={(spent / committed) * 100}
                        minimumFractionDigits={2}
                        maximumFractionDigits={2}
                        className="tabular-nums"
                      />
                      {"\u00A0"}٪
                    </>
                  );
              }
            }

            return (
              <article
                key={label}
                className="group relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm shadow-slate-200/40 transition hover:-translate-y-0.5 hover:shadow-md sm:p-3.5"
              >
                <p className="text-center text-xs font-medium leading-snug whitespace-pre-line text-slate-500 sm:text-sm">
                  {label}
                </p>
                {showCommitmentLabel ? (
                  <div className="mt-0.5 flex flex-col gap-1">
                    <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0">
                      <span className="text-[0.6rem] font-medium leading-none text-slate-500 sm:text-xs">
                        الإعتماد :
                      </span>
                      <span className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl tabular-nums">
                        {commitmentAmountNode}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0">
                      <span className="text-[0.6rem] font-medium leading-none text-slate-500 sm:text-xs">
                        المنصرف :
                      </span>
                      <span className="min-w-[2ch] text-lg font-bold tracking-tight text-slate-900 sm:text-xl tabular-nums">
                        {spentAmountNode}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0">
                      <span className="text-[0.6rem] font-medium leading-none text-slate-500 sm:text-xs">
                        المتبقي :
                      </span>
                      <span className="min-w-[2ch] text-base font-bold tracking-tight text-slate-900 sm:text-lg tabular-nums">
                        {remainingNode || "\u00A0"}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0">
                      <span className="text-[0.6rem] font-medium leading-none text-slate-500 sm:text-xs">
                        نسبة الإنفاق :
                      </span>
                      <span className="min-w-[2ch] text-base font-bold tracking-tight text-slate-900 sm:text-lg tabular-nums">
                        {spendingRatioNode || "\u00A0"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="mt-0.5 text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                    {commitmentAmountNode}
                  </p>
                )}
              </article>
            );
          })}
        </section>

        <hr className="my-6 h-0.5 w-full shrink-0 border-0 bg-emerald-200" />
      </div>
      <section className="grid gap-4 lg:grid-cols-5">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-slate-900">
              آخر النشاط
            </h3>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
              تجريبي
            </span>
          </div>
          <ul className="mt-4 divide-y divide-slate-100">
            {[
              "تم إنشاء مسودة تقرير شهري",
              "تذكير: مراجعة حركة الخزينة",
              "طلب شراء بانتظار الاعتماد",
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
          <h3 className="text-base font-semibold text-emerald-900">
            ماذا بعد؟
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-emerald-900/80">
            اختر الوحدة التالية لنبنيها معاً: المحاسبة، الخزينة، الموارد
            البشرية، أو المخزون. كل صفحة ستُضاف هنا بنفس أسلوب التصميم.
          </p>
        </div>
      </section>
    </div>
  );
}
