import type { RouteObject } from "react-router-dom";
import { lazyNamed } from "../lazyRoute";
import { accessDeniedRoute } from "./accessDeniedRoute";
import { administrativeRoutes } from "./administrativeRoutes";
import { auditRoutes } from "./auditRoutes";
import { dashboardRoutes } from "./dashboardRoutes";
import { decisionsRoutes } from "./decisionsRoutes";
import { documentsRoutes } from "./documentsRoutes";
import { endOfServiceRoutes } from "./endOfServiceRoutes";
import { financialManagementRoutes } from "./financialManagementRoutes";
import { journalRoutes } from "./journalRoutes";
import { libraryRoutes } from "./libraryRoutes";
import { membersRoutes } from "./membersRoutes";
import { programsRoutes } from "./programsRoutes";
import { settingsRoutes } from "./settingsRoutes";
import { socialSecurityRoutes } from "./socialSecurityRoutes";
import { warehouseRoutes } from "./warehouseRoutes";

const NotFoundPage = lazyNamed(
  () => import("../../pages/NotFoundPage"),
  "NotFoundPage",
);

export const protectedChildRoutes: RouteObject[] = [
  ...dashboardRoutes,
  ...membersRoutes,
  ...decisionsRoutes,
  ...programsRoutes,
  ...journalRoutes,
  ...financialManagementRoutes,
  ...administrativeRoutes,
  ...endOfServiceRoutes,
  ...socialSecurityRoutes,
  ...auditRoutes,
  ...warehouseRoutes,
  ...libraryRoutes,
  ...documentsRoutes,
  ...settingsRoutes,
  ...accessDeniedRoute,
  { path: "*", element: <NotFoundPage /> },
];
