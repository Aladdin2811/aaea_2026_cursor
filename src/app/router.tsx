import { createBrowserRouter } from "react-router-dom";
import { RequireAuth } from "../components/auth/RequireAuth";
import { AppLayout } from "../layouts/AppLayout";
import { DashboardPage } from "../pages/DashboardPage";
import { LoginPage } from "../pages/LoginPage";
import { MembersPage } from "../pages/MembersPage";
import { PlaceholderPage } from "../pages/PlaceholderPage";
import AccountTypePage from "../pages/AccountTypePage";
import GeneralAccountPage from "../pages/GeneralAccountPage";
import BabPage from "../pages/BabPage";
import BandPage from "../pages/BandPage";

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
        path: "administrative_management/job_nature",
        element: ph("أنواع الوظائف", "------"),
      },
      {
        path: "administrative_management/job_category",
        element: ph("الفئات الوظيفة", "------"),
      },
      {
        path: "administrative_management/job_grade",
        element: ph("الدرجات الوظيفة", "------"),
      },
      {
        path: "administrative_management/job_title",
        element: ph("المسميات الوظيفية", "------"),
      },
      {
        path: "administrative_management/employees_basic_salaries",
        element: ph("الرواتب الأساسية للموظفين", "------"),
      },
      {
        path: "administrative_management/contractors_basic_salaries",
        element: ph("الرواتب الأساسية للمتعاقدين", "------"),
      },
      {
        path: "administrative_management/experts_basic_salaries",
        element: ph("مكافأت الخبراء", "------"),
      },
      {
        path: "administrative_management/allowances",
        element: ph("البدلات", "------"),
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
        element: ph("العام المالي الحالي", "------"),
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
        path: "settings/world_regions",
        element: ph("تصنيف مناطق العالم", "------"),
      },
      {
        path: "settings/world_classifications",
        element: ph("تصنيف دول العالم", "------"),
      },
      {
        path: "settings/world_countries",
        element: ph("دول العالم", "------"),
      },
      {
        path: "settings/years",
        element: ph("السنوات", "------"),
      },
      {
        path: "settings/months",
        element: ph("الشهور", "------"),
      },
      {
        path: "settings/funding_type",
        element: ph("مصادر التمويل", "------"),
      },
      {
        path: "settings/document_type",
        element: ph("أنواع القيود", "------"),
      },
      {
        path: "settings/exchange_document_type",
        element: ph("أنواع مستند الصرف", "------"),
      },
      {
        path: "settings/exchange_rates",
        element: ph("أسعار الصرف", "------"),
      },
      {
        path: "settings/currency",
        element: ph("العملات المتعامل بها", "------"),
      },
      {
        path: "settings/users",
        element: ph("المستخدمين", "------"),
      },
      {
        path: "settings/roles",
        element: ph("الصلاحيات", "------"),
      },
      {
        path: "settings/social_situations",
        element: ph("الأوضاع الإجتماعية", "------"),
      },
      {
        path: "settings/expatriate",
        element: ph("الإغتراب", "------"),
      },
      {
        path: "settings/gender",
        element: ph("النوع", "------"),
      },
    ],
  },
]);
