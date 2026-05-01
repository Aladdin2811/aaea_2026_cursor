import type { RouteObject } from "react-router-dom";
import { lazyDefault } from "../lazyRoute";
import { ph } from "./ph";

const CurrentYearPage = lazyDefault(
  () => import("../../pages/years/CurrentYearPage"),
);
const AccountTypePage = lazyDefault(
  () => import("../../pages/accounts/AccountTypePage"),
);
const GeneralAccountPage = lazyDefault(
  () => import("../../pages/accounts/GeneralAccountPage"),
);
const BabPage = lazyDefault(() => import("../../pages/accounts/BabPage"));
const BandPage = lazyDefault(() => import("../../pages/accounts/BandPage"));
const No3Page = lazyDefault(() => import("../../pages/accounts/No3Page"));
const DetailedPage = lazyDefault(
  () => import("../../pages/accounts/DetailedPage"),
);
const YearsPage = lazyDefault(() => import("../../pages/years/YearsPage"));
const MonthsPage = lazyDefault(() => import("../../pages/months/MonthsPage"));
const WorldRegionsPage = lazyDefault(
  () => import("../../pages/world/WorldRegionsPage"),
);
const WorldClassificationsPage = lazyDefault(
  () => import("../../pages/world/WorldClassificationsPage"),
);
const WorldCountriesPage = lazyDefault(
  () => import("../../pages/world/WorldCountriesPage"),
);
const FundingTypePage = lazyDefault(
  () => import("../../pages/fundingType/FundingTypePage"),
);
const DocumentTypePage = lazyDefault(
  () => import("../../pages/documentType/DocumentTypePage"),
);
const ExchangeDocumentTypePage = lazyDefault(
  () => import("../../pages/exchangeDocumentType/ExchangeDocumentTypePage"),
);
const ExchangeRatesPage = lazyDefault(
  () => import("../../pages/exchangeRates/ExchangeRatesPage"),
);
const CurrencyPage = lazyDefault(
  () => import("../../pages/currency/CurrencyPage"),
);
const RolesPage = lazyDefault(() => import("../../pages/roles/RolesPage"));
const UsersPage = lazyDefault(() => import("../../pages/users/UsersPage.tsx"));
const SocialSituationsPage = lazyDefault(
  () => import("../../pages/socialSituations/SocialSituationsPage"),
);
const ExpatriatePage = lazyDefault(
  () => import("../../pages/expatriate/ExpatriatePage"),
);
const GenderPage = lazyDefault(() => import("../../pages/gender/GenderPage"));
const ReportsStudioPage = lazyDefault(
  () => import("../../pages/reports/ReportsStudioPage.tsx"),
);

export const settingsRoutes: RouteObject[] = [
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
];
