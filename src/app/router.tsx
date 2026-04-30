import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute.tsx";
import { AppLayout } from "../layouts/AppLayout";
import { DashboardPage } from "../pages/DashboardPage";
import Login from "../pages/Login.tsx";
import { MembersPage } from "../pages/members/MembersPage.tsx";
import { PlaceholderPage } from "../pages/PlaceholderPage";
import AccountTypePage from "../pages/accounts/AccountTypePage";
import GeneralAccountPage from "../pages/accounts/GeneralAccountPage";
import BabPage from "../pages/accounts/BabPage";
import BandPage from "../pages/accounts/BandPage";
import No3Page from "../pages/accounts/No3Page";
import DetailedPage from "../pages/accounts/DetailedPage";
import YearsPage from "../pages/years/YearsPage";
import CurrentYearPage from "../pages/years/CurrentYearPage";
import MonthsPage from "../pages/months/MonthsPage";
import WorldRegionsPage from "../pages/world/WorldRegionsPage";
import WorldClassificationsPage from "../pages/world/WorldClassificationsPage";
import WorldCountriesPage from "../pages/world/WorldCountriesPage";
import FundingTypePage from "../pages/fundingType/FundingTypePage";
import DocumentTypePage from "../pages/documentType/DocumentTypePage";
import ExchangeDocumentTypePage from "../pages/exchangeDocumentType/ExchangeDocumentTypePage";
import ExchangeRatesPage from "../pages/exchangeRates/ExchangeRatesPage";
import CurrencyPage from "../pages/currency/CurrencyPage";
import RolesPage from "../pages/roles/RolesPage";
import UsersPage from "../pages/users/UsersPage.tsx";
import SocialSituationsPage from "../pages/socialSituations/SocialSituationsPage";
import ExpatriatePage from "../pages/expatriate/ExpatriatePage";
import GenderPage from "../pages/gender/GenderPage";
import JobsPage from "../pages/jobs/JobsPage";
import BasicSalariesPage from "../pages/salaries/BasicSalariesPage";
import AllowancesPage from "../pages/allowances/AllowancesPage";
import CertifiedProgramsPage from "../pages/programs/CertifiedProgramsPage.tsx";
import Test from "../pages/Test.tsx";
import { NotFoundPage } from "../pages/NotFoundPage";
import EmployeesPage from "../pages/employees/EmployeesPage.tsx";
import VacationTypePage from "../pages/vacations/VacationTypePage.tsx";
import VacationsBalancesPage from "../pages/vacations/VacationsBalancesPage.tsx";
import VacationsPage from "../pages/vacations/VacationsPage.tsx";
import EmployeesBanksPage from "../pages/employees/EmployeesBanksPage.tsx";
import SocialSecurityExpensesPage from "../pages/socialSecurity/SocialSecurityExpensesPage.tsx";
import SocialSecurityBandPage from "../pages/socialSecurity/SocialSecurityBandPage.tsx";
import SocialSecurityBandLimitPage from "../pages/socialSecurity/SocialSecurityBandLimitPage.tsx";
import SocialSecuritySituationsPage from "../pages/socialSecurity/SocialSecuritySituationsPage.tsx";
import SocialSecurityCurrencyPage from "../pages/socialSecurity/SocialSecurityCurrencyPage.tsx";
import SocialSecurityCurrencyRatePage from "../pages/socialSecurity/SocialSecurityCurrencyRatePage.tsx";
// import SocialSecurityBandPercentagePage from "../pages/socialSecurity/SocialSecurityBandPercentagePage.tsx";
import SocialSecurityContractorsRepaymentPage from "../pages/socialSecurity/SocialSecurityContractorsRepaymentPage.tsx";
import SocialSecurityContributionPage from "../pages/socialSecurity/SocialSecurityContributionPage.tsx";
import SocialSecurityExpensesStatementPage from "../pages/socialSecurity/SocialSecurityExpensesStatementPage.tsx";
import SocialSecurityCategoryPage from "../pages/socialSecurity/SocialSecurityCategoryPage.tsx";
import ReportsStudioPage from "../pages/reports/ReportsStudioPage.tsx";
import MembersApprovedQuotasPage from "../pages/members/MembersApprovedQuotasPage.tsx";
import MembersContributionsPage from "../pages/members/MembersContributionsPage.tsx";
import MembersAdditionalBudgetPage from "../pages/members/MembersAdditionalBudgetPage.tsx";
import MembersAdditionalBudgetPaymentPage from "../pages/members/MembersAdditionalBudgetPaymentPage.tsx";
import ApprovedBudgetsPage from "../pages/financialManagement/ApprovedBudgetsPage.tsx";
import BudgetsPage from "../pages/financialManagement/BudgetsPage.tsx";

const ph = (title: string, description: string) => (
  <PlaceholderPage title={title} description={description} />
);

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      {
        path: "test",
        element: <Test />,
      },
      {
        path: "dashboard/summary",
        element: ph(
          "ملخص ومؤشرات",
          "نظرة سريعة على المؤشرات والأرقام الرئيسية.",
        ),
      },

      //==========================================================================

      {
        path: "members/contributions",
        element: <MembersContributionsPage />,
      },
      {
        path: "members/approved_quotas",
        element: <MembersApprovedQuotasPage />,
      },
      {
        path: "members/additional_budget",
        element: <MembersAdditionalBudgetPage />,
      },
      {
        path: "members/additional_budget_payment",
        element: <MembersAdditionalBudgetPaymentPage />,
      },
      {
        path: "members/reports",
        element: ph("تقارير الدول", "تقارير وإحصاءات تخص الدول الأعضاء."),
      },
      { path: "members", element: <MembersPage /> },

      //==========================================================================

      {
        path: "decisions/decisions_travel",
        element: ph("قرارات الإيفاد للأنشطة", "------"),
      },
      {
        path: "decisions/decisions_emergency_advance",
        element: ph("قرارات السلف الطارئة", "------"),
      },

      //==========================================================================

      {
        path: "programs/certified_programs",
        element: <CertifiedProgramsPage />,
      },
      {
        path: "programs/programs_type",
        element: ph("أنواع الأنشطة والبرامج", "------"),
      },
      {
        path: "programs/programs",
        element: ph("الأنشطة والبرامج المسجلة", "------"),
      },
      {
        path: "programs/program_participants",
        element: ph("المشاركين بالأنشطة والبرامج", "------"),
      },
      {
        path: "programs/programs_experts",
        element: ph("المحاضرين بالأنشطة والبرامج", "------"),
      },
      {
        path: "programs/activity_advance_settlement",
        element: ph("تسوية مصروفات الأنشطة", "------"),
      },

      //==========================================================================

      {
        path: "journal/new_journal",
        element: ph("تسجيل قيد جديد", "------"),
      },
      {
        path: "journal/all_journal",
        element: ph("القيود المسجلة", "------"),
      },
      {
        path: "journal/search_by_beneficiary",
        element: ph("بحث بالمستفيد", "------"),
      },
      {
        path: "journal/beneficiaries",
        element: ph("المستفيدين", "------"),
      },

      //==========================================================================

      {
        path: "financial_management/approved_budgets",
        element: <ApprovedBudgetsPage />,
      },
      {
        path: "financial_management/budgets",
        element: <BudgetsPage />,
      },
      {
        path: "financial_management/transfers",
        element: ph("المناقلات المنفذة", "------"),
      },
      {
        path: "financial_management/budget_increase",
        element: ph("ترفيع الإعتمادات", "------"),
      },
      {
        path: "financial_management/deposit_placing",
        element: ph("الودائع", "------"),
      },
      {
        path: "financial_management/ledger",
        element: ph("الأستاذ المساعد", "------"),
      },
      {
        path: "financial_management/account_transaction",
        element: ph("حركة حساب", "------"),
      },
      {
        path: "financial_management/monthly_report",
        element: ph("المنصرف الشهري", "------"),
      },
      {
        path: "financial_management/trial_balance",
        element: ph("ميزان المراجعة", "------"),
      },
      {
        path: "financial_management/banks_dealt_with",
        element: ph("الحسابات المفتوحة لدى البنوك", "------"),
      },

      //==========================================================================

      {
        path: "administrative_management/jobs",
        element: <JobsPage />,
      },
      {
        path: "administrative_management/basic_salaries",
        element: <BasicSalariesPage />,
      },
      {
        path: "administrative_management/AllowancesPage",
        element: <AllowancesPage />,
      },
      {
        path: "administrative_management/employees",
        element: <EmployeesPage />,
      },
      {
        path: "administrative_management/employees_banks",
        element: <EmployeesBanksPage />,
      },
      {
        path: "administrative_management/vacation_type",
        element: <VacationTypePage />,
      },
      {
        path: "administrative_management/vacations_balances",
        element: <VacationsBalancesPage />,
      },
      {
        path: "administrative_management/vacations",
        element: <VacationsPage />,
      },
      {
        path: "administrative_management/deduction_from_salary",
        element: ph("الخصم من الراتب", "------"),
      },
      {
        path: "administrative_management/employees_payroll",
        element: ph("إصدار رواتب الموظفين", "------"),
      },
      {
        path: "administrative_management/contractors_payroll",
        element: ph("إصدار رواتب المتعاقدين", "------"),
      },
      {
        path: "administrative_management/experts_payroll",
        element: ph("إصدار مكافآت الخبراء", "------"),
      },

      //==========================================================================

      {
        path: "end_of_servic/end_of_service_employee_contribution",
        element: ph("نسبة مساهمة الموظفين", "------"),
      },
      {
        path: "end_of_servic/end_of_service_contractors_contribution",
        element: ph("نسبة مساهمة المتعاقدين", "------"),
      },

      //==========================================================================

      {
        path: "social_security/social_security_expenses",
        element: <SocialSecurityExpensesPage />,
      },
      {
        path: "social_security/social_security_expenses_statement",
        element: <SocialSecurityExpensesStatementPage />,
      },
      {
        path: "social_security/social_security_contribution",
        element: <SocialSecurityContributionPage />,
      },
      {
        path: "social_security/social_security_class_category",
        element: <SocialSecurityCategoryPage />,
      },
      {
        path: "social_security/social_security_band",
        element: <SocialSecurityBandPage />,
      },
      // {
      //   path: "social_security/social_security_band_percentage",
      //   element: <SocialSecurityBandPercentagePage />,
      // },
      {
        path: "social_security/social_security_band_limit",
        element: <SocialSecurityBandLimitPage />,
      },
      {
        path: "social_security/social_security_contractors_repayment",
        element: <SocialSecurityContractorsRepaymentPage />,
      },
      {
        path: "social_security/social_security_situations",
        element: <SocialSecuritySituationsPage />,
      },
      {
        path: "social_security/social_security_currency",
        element: <SocialSecurityCurrencyPage />,
      },
      {
        path: "social_security/social_security_currency_rate",
        element: <SocialSecurityCurrencyRatePage />,
      },

      //==========================================================================

      {
        path: "audit/audit_table_1",
        element: ph("مساهمات الدول في موازنة المنظمة (1)", "------"),
      },
      {
        path: "audit/audit_table_2",
        element: ph("الدول المسددة لمساهماتها عن السنة الحالية (2)", "------"),
      },
      {
        path: "audit/audit_table_3",
        element: ph("التوزيع الزمني لمتحصلات مساهمات الدول (3)", "------"),
      },
      {
        path: "audit/audit_table_4",
        element: ph("متأخرات الدول فى موازنات المنظمة (4)", "------"),
      },
      {
        path: "audit/audit_table_5",
        element: ph("المساهمات غير المسددة (5)", "------"),
      },
      {
        path: "audit/audit_table_6",
        element: ph("تطور مجموع الإيرادات (6)", "------"),
      },
      {
        path: "audit/audit_table_7",
        element: ph("تفصيل الموارد الذاتية (7)", "------"),
      },
      {
        path: "audit/audit_table_8",
        element: ph("مقارنة بين المحصل والتقديرات (8)", "------"),
      },
      {
        path: "audit/audit_table_9",
        element: ph("الميزانية المعتمدة والمصروفات (9)", "------"),
      },
      {
        path: "audit/audit_table_10",
        element: ph(
          "الإعتمادات والمصروفات الفعلية ونسب الإنفاق (10)",
          "------",
        ),
      },
      {
        path: "audit/audit_table_11",
        element: ph("تحليل الوضعية المالية (11)", "------"),
      },
      {
        path: "audit/audit_table_14",
        element: ph(
          "تطور الوضعية المالية لصندوق مكافأة نهاية الخدمة (14)",
          "------",
        ),
      },
      {
        path: "audit/audit_table_15",
        element: ph("حساب صندوق مكافأة نهاية الخدمة (15)", "------"),
      },
      {
        path: "audit/audit_table_16",
        element: ph("حساب صندوق الضمان الإجتماعي (16)", "------"),
      },

      //==========================================================================

      {
        path: "warehouse/warehouse_categories",
        element: ph("أنواع أصناف المخزن", "------"),
      },
      {
        path: "warehouse/warehouse_classifications",
        element: ph("تصنيف أصناف المخزن", "------"),
      },
      {
        path: "warehouse/warehouse_addition",
        element: ph("إضافة مخزنية", "------"),
      },
      {
        path: "warehouse/warehouse_disbursed",
        element: ph("صرف من المخزن", "------"),
      },
      {
        path: "warehouse/warehouse_report",
        element: ph("تقارير", "------"),
      },

      //==========================================================================

      {
        path: "library/library_classifications",
        element: ph("تصنيفات المكتبة", "------"),
      },
      {
        path: "library/library_addition",
        element: ph("إضافة مكتبية", "------"),
      },
      {
        path: "library/library_borrowing",
        element: ph("إستعارة مكتبية", "------"),
      },
      {
        path: "library/library_items",
        element: ph("موجودات المكتبة", "------"),
      },

      //==========================================================================

      {
        path: "documents_regulations/executive_council",
        element: ph("محاضر جلسات المجلس التنفيذي", "------"),
      },
      {
        path: "documents_regulations/general_conference",
        element: ph("محاضر جلسات المؤتمر العام", "------"),
      },
      {
        path: "documents_regulations/regulations",
        element: ph("الأنظمة واللوائح", "------"),
      },

      //==========================================================================

      {
        path: "settings/current_year",
        element: <CurrentYearPage />,
      },
      {
        path: "settings/account_type",
        element: <AccountTypePage />,
      },
      {
        path: "settings/general_account/:id?",
        element: <GeneralAccountPage />,
      },
      {
        path: "settings/bab/:id?",
        element: <BabPage />,
      },
      {
        path: "settings/band/:id?",
        element: <BandPage />,
      },
      {
        path: "settings/no3/:id?",
        element: <No3Page />,
      },
      {
        path: "settings/detailed/:id?",
        element: <DetailedPage />,
      },
      {
        path: "programs/activities/:detailedId",
        element: ph("عرض الأنشطة", "أنشطة البرامج المرتبطة بالحساب التفصيلي."),
      },
      {
        path: "settings/world_regions",
        element: <WorldRegionsPage />,
      },
      {
        path: "settings/world_classifications",
        element: <WorldClassificationsPage />,
      },
      {
        path: "settings/world_countries",
        element: <WorldCountriesPage />,
      },
      {
        path: "settings/years",
        element: <YearsPage />,
      },
      {
        path: "settings/months",
        element: <MonthsPage />,
      },
      {
        path: "settings/funding_type",
        element: <FundingTypePage />,
      },
      {
        path: "settings/document_type",
        element: <DocumentTypePage />,
      },
      {
        path: "settings/exchange_document_type",
        element: <ExchangeDocumentTypePage />,
      },
      {
        path: "settings/exchange_rates/:id?",
        element: <ExchangeRatesPage />,
      },
      {
        path: "settings/currency",
        element: <CurrencyPage />,
      },
      {
        path: "settings/users",
        element: <UsersPage />,
      },
      {
        path: "settings/roles",
        element: <RolesPage />,
      },
      {
        path: "settings/social_situations",
        element: <SocialSituationsPage />,
      },
      {
        path: "settings/expatriate",
        element: <ExpatriatePage />,
      },
      {
        path: "settings/gender",
        element: <GenderPage />,
      },
      {
        path: "settings/reports",
        element: <ReportsStudioPage />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
