import {
  Banknote,
  Boxes,
  Flag,
  Landmark,
  LayoutDashboard,
  Settings2,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { matchPath } from "react-router-dom";

export type NavChild = {
  to: string;
  label: string;
  end?: boolean;
};

export type NavGroup = {
  id: string;
  label: string;
  icon: LucideIcon;
  children: NavChild[];
};

export const navGroups: NavGroup[] = [
  {
    id: "dashboard",
    label: "لوحة التحكم",
    icon: LayoutDashboard,
    children: [
      { to: "/", label: "الرئيسية", end: true },
      { to: "/dashboard/summary", label: "ملخص ومؤشرات" },
    ],
  },
  {
    id: "members",
    label: "الدول الأعضاء",
    icon: Flag,
    children: [
      { to: "/members", label: "الدول الأعضاء ونسب المساهمات", end: true },
      { to: "/members/approved_quotas", label: "حصص المساهمات المعتمدة" },
      { to: "/members/contributions", label: "المساهمات المسددة", end: true },
      { to: "/members/additional_budget", label: "الموازنة الإضافية المعتمدة" },
      {
        to: "/members/additional_budget_payment",
        label: "المسدد من الموازنة الإضافية",
      },
      { to: "/members/reports", label: "تقارير" },
    ],
  },

  {
    id: "journal",
    label: "قيود اليومية",
    icon: Wallet,
    children: [
      { to: "/journal/new_journal", label: "تسجيل قيد جديد", end: true },
      { to: "/journal/all_journal", label: "القيود المسجلة" },
      { to: "/journal/search_by_beneficiary", label: "بحث بالمستفيد" },
      { to: "/journal/beneficiaries", label: "المستفيدين" },
    ],
  },

  {
    id: "financial_management",
    label: "الشؤون المالية",
    icon: Landmark,
    children: [
      {
        to: "/financial_management/approved_budgets",
        label: "الموازنات المعتمدة",
        end: true,
      },
      { to: "/financial_management/budgets", label: "الإعتمادات المدرجة" },
      { to: "/financial_management/transfers", label: "المناقلات المنفذة" },
      {
        to: "/financial_management/budget_increase",
        label: "ترفيع الإعتمادات",
      },
      { to: "/financial_management/deposit_placing", label: "الودائع" },
      { to: "/financial_management/ledger", label: "الأستاذ المساعد" },

      { to: "/financial_management/account_transaction", label: "حركة حساب" },
      { to: "/financial_management/monthly_report", label: "المنصرف الشهري" },
      { to: "/financial_management/trial_balance", label: "ميزان المراجعة" },
      {
        to: "/financial_management/banks_dealt_with",
        label: "الحسابات المفتوحة لدى البنوك",
      },
    ],
  },
  {
    id: "administrative_management",
    label: "الشؤون الإدارية",
    icon: Banknote,
    children: [
      { to: "/administrative_management/jobs", label: "الوظائف", end: true },
      // { to: "/administrative_management/job_category", label: "الفئات الوظيفة" },
      // { to: "/administrative_management/job_grade", label: "الدرجات الوظيفة" },
      // { to: "/administrative_management/job_title", label: "المسميات الوظيفية" },
      {
        to: "/administrative_management/basic_salaries",
        label: "الرواتب الأساسية",
      },
      // {
      //   to: "/administrative_management/contractors_basic_salaries",
      //   label: "الرواتب الأساسية للمتعاقدين",
      // },
      // {
      //   to: "/administrative_management/experts_basic_salaries",
      //   label: "مكافأت الخبراء",
      // },
      { to: "/administrative_management/allowancesPage", label: "البدلات" },
    ],
  },
  {
    id: "hr",
    label: "الموارد البشرية",
    icon: Users,
    children: [
      { to: "/hr", label: "نظرة عامة", end: true },
      { to: "/hr/employees", label: "الموظفون" },
      { to: "/hr/payroll", label: "الرواتب" },
    ],
  },
  {
    id: "inventory",
    label: "المخزون",
    icon: Boxes,
    children: [
      { to: "/inventory", label: "نظرة عامة", end: true },
      { to: "/inventory/items", label: "الأصناف" },
      { to: "/inventory/purchase-orders", label: "أوامر الشراء" },
    ],
  },
  {
    id: "settings",
    label: "الإعدادات",
    icon: Settings2,
    children: [
      // { to: '/settings', label: 'نظرة عامة', end: true },
      { to: "/settings/current_year", label: "العام المالي الحالي", end: true },
      { to: "/settings/account_type", label: "تصنيف الحسابات" },
      { to: "/settings/world_regions", label: "تصنيف مناطق العالم" },
      { to: "/settings/world_classifications", label: "تصنيف دول العالم" },
      { to: "/settings/world_countries", label: "دول العالم" },
      { to: "/settings/years", label: "السنوات" },
      { to: "/settings/months", label: "الشهور" },
      { to: "/settings/funding_type", label: "مصادر التمويل" },
      { to: "/settings/document_type", label: "أنواع القيود" },
      { to: "/settings/exchange_document_type", label: "أنواع مستند الصرف" },
      { to: "/settings/exchange_rates", label: "أسعار الصرف" },
      { to: "/settings/currency", label: "العملات المتعامل بها" },
      { to: "/settings/users", label: "المستخدمين" },
      { to: "/settings/roles", label: "الصلاحيات" },
      { to: "/settings/social_situations", label: "الأوضاع الإجتماعية" },
      { to: "/settings/expatriate", label: "الإغتراب" },
      { to: "/settings/gender", label: "النوع" },
    ],
  },
];

export function childMatches(pathname: string, child: NavChild): boolean {
  const m = matchPath({ path: child.to, end: child.end ?? false }, pathname);
  return m !== null;
}

export function groupHasActiveChild(
  pathname: string,
  group: NavGroup,
): boolean {
  return group.children.some((c) => childMatches(pathname, c));
}

/** عنوان القسم في الشريط العلوي = نفس عنوان مجموعة القائمة الجانبية */
export function getNavSectionLabel(pathname: string): string {
  return (
    navGroups.find((g) => groupHasActiveChild(pathname, g))?.label ??
    "لوحة التحكم"
  );
}

/** تسمية الرابط الفرعي النشط (كما في القائمة الجانبية)؛ عند تعدد تطابق نادر يُفضَّل الأطول. */
export function getActiveNavChildLabel(pathname: string): string | null {
  const matches: NavChild[] = [];
  for (const g of navGroups) {
    for (const c of g.children) {
      if (childMatches(pathname, c)) matches.push(c);
    }
  }
  if (matches.length === 0) return null;
  matches.sort((a, b) => b.to.length - a.to.length);
  return matches[0].label;
}
