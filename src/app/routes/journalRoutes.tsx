import type { RouteObject } from "react-router-dom";
import { ph } from "./ph";

export const journalRoutes: RouteObject[] = [
  {
    path: "journal/new_journal",
    element: ph("تسجيل قيد جديد", "------"),
  },
  {
    path: "journal/all_journal",
    element: ph("القيود المسجلة", "------"),
  },
  {
    path: "journal/search_by_beneficiary",
    element: ph("بحث بالمستفيد", "------"),
  },
  {
    path: "journal/beneficiaries",
    element: ph("المستفيدين", "------"),
  },
];
