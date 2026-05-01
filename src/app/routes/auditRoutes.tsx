import type { RouteObject } from "react-router-dom";
import { ph } from "./ph";

export const auditRoutes: RouteObject[] = [
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
];
