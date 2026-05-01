import { lazy } from "react";
import type { RouteObject } from "react-router-dom";

const SocialSecurityExpensesPage = lazy(
  () => import("../../pages/socialSecurity/SocialSecurityExpensesPage.tsx"),
);
const SocialSecurityBandPage = lazy(
  () => import("../../pages/socialSecurity/SocialSecurityBandPage.tsx"),
);
const SocialSecurityBandLimitPage = lazy(
  () => import("../../pages/socialSecurity/SocialSecurityBandLimitPage.tsx"),
);
const SocialSecuritySituationsPage = lazy(
  () => import("../../pages/socialSecurity/SocialSecuritySituationsPage.tsx"),
);
const SocialSecurityCurrencyPage = lazy(
  () => import("../../pages/socialSecurity/SocialSecurityCurrencyPage.tsx"),
);
const SocialSecurityCurrencyRatePage = lazy(
  () => import("../../pages/socialSecurity/SocialSecurityCurrencyRatePage.tsx"),
);
const SocialSecurityContractorsRepaymentPage = lazy(
  () =>
    import("../../pages/socialSecurity/SocialSecurityContractorsRepaymentPage.tsx"),
);
const SocialSecurityContributionPage = lazy(
  () => import("../../pages/socialSecurity/SocialSecurityContributionPage.tsx"),
);
const SocialSecurityExpensesStatementPage = lazy(
  () =>
    import("../../pages/socialSecurity/SocialSecurityExpensesStatementPage.tsx"),
);
const SocialSecurityCategoryPage = lazy(
  () => import("../../pages/socialSecurity/SocialSecurityCategoryPage.tsx"),
);

export const socialSecurityRoutes: RouteObject[] = [
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
];
