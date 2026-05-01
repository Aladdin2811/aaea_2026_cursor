import { lazy } from "react";
import type { RouteObject } from "react-router-dom";
import { lazyNamed } from "../lazyRoute";
import { ph } from "./ph";

const MembersPage = lazyNamed(
  () => import("../../pages/members/MembersPage.tsx"),
  "MembersPage",
);
const MembersApprovedQuotasPage = lazy(
  () => import("../../pages/members/MembersApprovedQuotasPage.tsx"),
);
const MembersContributionsPage = lazy(
  () => import("../../pages/members/MembersContributionsPage.tsx"),
);
const MembersAdditionalBudgetPage = lazy(
  () => import("../../pages/members/MembersAdditionalBudgetPage.tsx"),
);
const MembersAdditionalBudgetPaymentPage = lazy(
  () => import("../../pages/members/MembersAdditionalBudgetPaymentPage.tsx"),
);

export const membersRoutes: RouteObject[] = [
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
];
