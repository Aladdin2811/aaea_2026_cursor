import type { RouteObject } from "react-router-dom";
import { ph } from "./ph";

export const libraryRoutes: RouteObject[] = [
  {
    path: "library/library_classifications",
    element: ph("تصنيفات المكتبة", "------"),
  },
  {
    path: "library/library_addition",
    element: ph("إضافة مكتبية", "------"),
  },
  {
    path: "library/library_borrowing",
    element: ph("إستعارة مكتبية", "------"),
  },
  {
    path: "library/library_items",
    element: ph("موجودات المكتبة", "------"),
  },
];
