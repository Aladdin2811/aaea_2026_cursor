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

  //==========================================================================

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

  //==========================================================================

  {
    id: "decisions",
    label: "القرارات",
    icon: Wallet,
    children: [
      {
        to: "/decisions/decisions_travel",
        label: "قرارات الإيفاد للأنشطة",
        end: true,
      },
      {
        to: "/decisions/decisions_emergency_advance",
        label: "قرارات السلف الطارئة",
      },
    ],
  },

  //==========================================================================

  {
    id: "programs",
    label: "الأنشطة والبرامج",
    icon: Wallet,
    children: [
      {
        to: "/programs/certified_programs",
        label: "الأنشطة المعتمدة",
        end: true,
      },
      { to: "/programs/programs_type", label: "أنواع الأنشطة والبرامج" },
      { to: "/programs/programs", label: "الأنشطة والبرامج المسجلة" },
      {
        to: "/programs/program_participants",
        label: "المشاركين بالأنشطة والبرامج",
      },
      {
        to: "/programs/programs_experts",
        label: "المحاضرين بالأنشطة والبرامج",
      },
      {
        to: "/programs/activity_advance_settlement",
        label: "تسوية مصروفات الأنشطة",
      },
    ],
  },

  //==========================================================================

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

  //==========================================================================

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

  //==========================================================================

  {
    id: "administrative_management",
    label: "الشؤون الإدارية",
    icon: Banknote,
    children: [
      { to: "/administrative_management/jobs", label: "الوظائف", end: true },
      {
        to: "/administrative_management/basic_salaries",
        label: "الرواتب الأساسية",
      },
      { to: "/administrative_management/allowancesPage", label: "البدلات" },
      { to: "/administrative_management/employees", label: "الموظفين" },
      {
        to: "/administrative_management/employees_banks",
        label: "الحسابات البنكية للموظفين",
      },
      {
        to: "/administrative_management/vacation_type",
        label: "أنواع الإجازات",
      },
      {
        to: "/administrative_management/vacations_balances",
        label: "أرصدة الإجازات",
      },
      {
        to: "/administrative_management/vacations",
        label: "الإجازات الممنوحة",
      },
      {
        to: "/administrative_management/deduction_from_salary",
        label: "الخصم من الراتب",
      },
      {
        to: "/administrative_management/employees_payroll",
        label: "إصدار رواتب الموظفين",
      },
      {
        to: "/administrative_management/contractors_payroll",
        label: "إصدار رواتب المتعاقدين",
      },
      {
        to: "/administrative_management/experts_payroll",
        label: "إصدار مكافآت الخبراء",
      },
    ],
  },

  //==========================================================================

  {
    id: "end_of_servic",
    label: "ص نهاية الخدمة",
    icon: Banknote,
    children: [
      {
        to: "/end_of_servic/end_of_service_employee_contribution",
        label: "نسبة مساهمة الموظفين",
        end: true,
      },
      {
        to: "/end_of_servic/end_of_service_contractors_contribution",
        label: "نسبة مساهمة المتعاقدين",
      },
    ],
  },

  //==========================================================================

  {
    id: "social_security",
    label: "ص الضمان الإجتماعي",
    icon: Banknote,
    children: [
      {
        to: "/social_security/social_security_expenses",
        label: "مصروفات التعويض الصحي",
        end: true,
      },
      {
        to: "/social_security/social_security_expenses_statement",
        label: "كشف مصروفات التعويض الصحي",
      },
      {
        to: "/social_security/social_security_contribution",
        label: "نسب المساهمة",
      },
      {
        to: "/social_security/social_security_class_category",
        label: "تصنيف وفئات المستفيدين بالضمان",
      },
      {
        to: "/social_security/social_security_band",
        label: "بنود الضمان",
      },
      // {
      //   to: "/social_security/social_security_band_percentage",
      //   label: "نسب تعويض بنود الضمان",
      // },
      {
        to: "/social_security/social_security_band_limit",
        label: "نسب التعويض وأسقف بنود الضمان",
      },
      {
        to: "/social_security/social_security_contractors_repayment",
        label: "نسب تعويض المتعاقدين بالضمان",
      },
      {
        to: "/social_security/social_security_situations",
        label: "الحالات الإجتماعية للضمان",
      },
      {
        to: "/social_security/social_security_currency",
        label: "العملات المتعامل بها",
      },
      {
        to: "/social_security/social_security_currency_rate",
        label: "سعر الصرف للضمان",
      },
    ],
  },

  //==========================================================================

  {
    id: "audit",
    label: "الرقابة الداخلية",
    icon: Users,
    children: [
      {
        to: "/audit/audit_table_1",
        label: "مساهمات الدول في موازنة المنظمة (1)",
        end: true,
      },
      {
        to: "/audit/audit_table_2",
        label: "الدول المسددة لمساهماتها عن السنة الحالية (2)",
      },
      {
        to: "/audit/audit_table_3",
        label: "التوزيع الزمني لمتحصلات مساهمات الدول (3)",
      },
      {
        to: "/audit/audit_table_4",
        label: "متأخرات الدول فى موازنات المنظمة (4)",
      },
      {
        to: "/audit/audit_table_5",
        label: "المساهمات غير المسددة (5)",
      },
      {
        to: "/audit/audit_table_6",
        label: "تطور مجموع الإيرادات (6)",
      },
      {
        to: "/audit/audit_table_7",
        label: "تفصيل الموارد الذاتية (7)",
      },
      {
        to: "/audit/audit_table_8",
        label: "مقارنة بين المحصل والتقديرات (8)",
      },
      {
        to: "/audit/audit_table_9",
        label: "الميزانية المعتمدة والمصروفات (9)",
      },
      {
        to: "/audit/audit_table_10",
        label: "الإعتمادات والمصروفات الفعلية ونسب الإنفاق (10)",
      },
      {
        to: "/audit/audit_table_11",
        label: "تحليل الوضعية المالية (11)",
      },
      {
        to: "/audit/audit_table_14",
        label: "تطور الوضعية المالية لصندوق مكافأة نهاية الخدمة (14)",
      },
      {
        to: "/audit/audit_table_15",
        label: "حساب صندوق مكافأة نهاية الخدمة (15)",
      },
      {
        to: "/audit/audit_table_16",
        label: "حساب صندوق الضمان الإجتماعي (16)",
      },
    ],
  },

  //==========================================================================

  {
    id: "warehouse",
    label: "المخزن",
    icon: Users,
    children: [
      {
        to: "/warehouse/warehouse_categories",
        label: "أنواع أصناف المخزن",
        end: true,
      },
      {
        to: "/warehouse/warehouse_classifications",
        label: "تصنيف أصناف المخزن",
      },
      { to: "/warehouse/warehouse_addition", label: "إضافة مخزنية" },
      { to: "/warehouse/warehouse_disbursed", label: "صرف من المخزن" },
      { to: "/warehouse/warehouse_report", label: "تقارير" },
    ],
  },

  //==========================================================================

  {
    id: "library",
    label: "المكتبة",
    icon: Boxes,
    children: [
      {
        to: "/library/library_classifications",
        label: "تصنيفات المكتبة",
        end: true,
      },
      { to: "/library/library_addition", label: "إضافة مكتبية" },
      { to: "/library/library_borrowing", label: "إستعارة مكتبية" },
      { to: "/library/library_items", label: "موجودات المكتبة" },
    ],
  },

  //==========================================================================

  {
    id: "documents_regulations",
    label: "وثائق ولوائح",
    icon: Boxes,
    children: [
      {
        to: "/documents_regulations/executive_council",
        label: "محاضر جلسات المجلس التنفيذي",
        end: true,
      },
      {
        to: "/documents_regulations/general_conference",
        label: "محاضر جلسات المؤتمر العام",
      },
      { to: "/documents_regulations/regulations", label: "الأنظمة واللوائح" },
    ],
  },

  //==========================================================================

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
      { to: "/settings/reports", label: "تصميم التقارير" },
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
