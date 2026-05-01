import { lazy } from "react";
import type { RouteObject } from "react-router-dom";
import { ph } from "./ph";

const ApprovedBudgetsPage = lazy(
  () => import("../../pages/financialManagement/ApprovedBudgetsPage.tsx"),
);
const BudgetsPage = lazy(
  () => import("../../pages/financialManagement/BudgetsPage.tsx"),
);
const TransfersPage = lazy(
  () => import("../../pages/financialManagement/TransfersPage.tsx"),
);

export const financialManagementRoutes: RouteObject[] = [
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
    element: <TransfersPage />,
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
];
