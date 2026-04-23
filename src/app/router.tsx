import { createBrowserRouter } from "react-router-dom";
import { RequireAuth } from "../components/auth/RequireAuth";
import { AppLayout } from "../layouts/AppLayout";
import { DashboardPage } from "../pages/DashboardPage";
import { LoginPage } from "../pages/LoginPage";
import { MembersPage } from "../pages/MembersPage";
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
import SocialSituationsPage from "../pages/socialSituations/SocialSituationsPage";
import ExpatriatePage from "../pages/expatriate/ExpatriatePage";
import GenderPage from "../pages/gender/GenderPage";
import JobsPage from "../pages/jobs/JobsPage";
import BasicSalariesPage from "../pages/salaries/BasicSalariesPage";
import AllowancesPage from "../pages/allowances/AllowancesPage";

const ph = (title: string, description: string) => (
  <PlaceholderPage title={title} description={description} />
);

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      {
        path: "dashboard/summary",
        element: ph(
          "ملخص ومؤشرات",
          "نظرة سريعة على المؤشرات والأرقام الرئيسية.",
        ),
      },

      {
        path: "members/contributions",
        element: ph("المساهمات", "اشتراكات ومستحقات الدول الأعضاء."),
      },
      {
        path: "members/approved_quotas",
        element: ph("المساهمات", "اشتراكات ومستحقات الدول الأعضاء."),
      },
      {
        path: "members/additional_budget",
        element: ph("المساهمات", "اشتراكات ومستحقات الدول الأعضاء."),
      },
      {
        path: "members/additional_budget_payment",
        element: ph("المساهمات", "اشتراكات ومستحقات الدول الأعضاء."),
      },
      {
        path: "members/reports",
        element: ph("تقارير الدول", "تقارير وإحصاءات تخص الدول الأعضاء."),
      },
      { path: "members", element: <MembersPage /> },

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

      {
        path: "financial_management/approved_budgets",
        element: ph("الموازنات المعتمدة", "------"),
      },
      {
        path: "financial_management/budgets",
        element: ph("الإعتمادات المدرجة", "------"),
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

      {
        path: "administrative_management/jobs",
        element: <JobsPage />,
      },
      // {
      //   path: "administrative_management/job_category",
      //   element: ph("الفئات الوظيفة", "------"),
      // },
      // {
      //   path: "administrative_management/job_grade",
      //   element: ph("الدرجات الوظيفة", "------"),
      // },
      // {
      //   path: "administrative_management/job_title",
      //   element: ph("المسميات الوظيفية", "------"),
      // },
      {
        path: "administrative_management/basic_salaries",
        element: <BasicSalariesPage />,
      },
      // {
      //   path: "administrative_management/contractors_basic_salaries",
      //   element: ph("الرواتب الأساسية للمتعاقدين", "------"),
      // },
      // {
      //   path: "administrative_management/experts_basic_salaries",
      //   element: ph("مكافأت الخبراء", "------"),
      // },
      {
        path: "administrative_management/AllowancesPage",
        element: <AllowancesPage />,
      },

      {
        path: "treasury/banks",
        element: ph("الحسابات البنكية", "التسويات والتحويلات البنكية."),
      },
      {
        path: "treasury",
        element: ph(
          "الخزينة والبنوك",
          "حركة النقد، التحويلات، والتسويات البنكية.",
        ),
      },

      {
        path: "hr/employees",
        element: ph("الموظفون", "بيانات الموظفين والملفات."),
      },
      {
        path: "hr/payroll",
        element: ph("الرواتب", "مسير الرواتب والاستقطاعات."),
      },
      {
        path: "hr",
        element: ph("الموارد البشرية", "الموظفون، الحضور، والرواتب."),
      },

      {
        path: "inventory/items",
        element: ph("الأصناف", "تعريف الأصناف والوحدات."),
      },
      {
        path: "inventory/purchase-orders",
        element: ph("أوامر الشراء", "متابعة أوامر الشراء والاستلام."),
      },
      {
        path: "inventory",
        element: ph(
          "المخزون والمشتريات",
          "الأصناف، المستودعات، وأوامر الشراء.",
        ),
      },

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
        element: ph("المستخدمين", "------"),
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
    ],
  },
]);
