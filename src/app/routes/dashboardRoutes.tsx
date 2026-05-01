import { lazy } from "react";
import type { RouteObject } from "react-router-dom";
import { lazyNamed } from "../lazyRoute";
import { ph } from "./ph";

const DashboardPage = lazyNamed(
  () => import("../../pages/DashboardPage"),
  "DashboardPage",
);
const Test = lazy(() => import("../../pages/Test.tsx"));

export const dashboardRoutes: RouteObject[] = [
  { index: true, element: <DashboardPage /> },
  { path: "test", element: <Test /> },
  {
    path: "dashboard/summary",
    element: ph(
      "ملخص ومؤشرات",
      "نظرة سريعة على المؤشرات والأرقام الرئيسية.",
    ),
  },
];
