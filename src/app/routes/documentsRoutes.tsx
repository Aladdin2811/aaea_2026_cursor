import type { RouteObject } from "react-router-dom";
import { ph } from "./ph";

export const documentsRoutes: RouteObject[] = [
  {
    path: "documents_regulations/executive_council",
    element: ph("محاضر جلسات المجلس التنفيذي", "------"),
  },
  {
    path: "documents_regulations/general_conference",
    element: ph("محاضر جلسات المؤتمر العام", "------"),
  },
  {
    path: "documents_regulations/regulations",
    element: ph("الأنظمة واللوائح", "------"),
  },
];
