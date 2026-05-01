import type { RouteObject } from "react-router-dom";
import { lazyDefault } from "../lazyRoute";

const AccessDeniedPage = lazyDefault(
  () => import("../../pages/AccessDeniedPage"),
);

/** مسار ثابت لعرض رسالة الرفض؛ يجب استثناؤه من شرط «وجود صلاحية للمسار». */
export const accessDeniedRoute: RouteObject[] = [
  { path: "access-denied", element: <AccessDeniedPage /> },
];
