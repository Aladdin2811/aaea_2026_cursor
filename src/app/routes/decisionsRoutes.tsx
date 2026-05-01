import type { RouteObject } from "react-router-dom";
import { ph } from "./ph";

export const decisionsRoutes: RouteObject[] = [
  {
    path: "decisions/decisions_travel",
    element: ph("قرارات الإيفاد للأنشطة", "------"),
  },
  {
    path: "decisions/decisions_emergency_advance",
    element: ph("قرارات السلف الطارئة", "------"),
  },
];
