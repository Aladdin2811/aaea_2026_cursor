import type { RouteObject } from "react-router-dom";
import { ph } from "./ph";

export const warehouseRoutes: RouteObject[] = [
  {
    path: "warehouse/warehouse_categories",
    element: ph("أنواع أصناف المخزن", "------"),
  },
  {
    path: "warehouse/warehouse_classifications",
    element: ph("تصنيف أصناف المخزن", "------"),
  },
  {
    path: "warehouse/warehouse_addition",
    element: ph("إضافة مخزنية", "------"),
  },
  {
    path: "warehouse/warehouse_disbursed",
    element: ph("صرف من المخزن", "------"),
  },
  {
    path: "warehouse/warehouse_report",
    element: ph("تقارير", "------"),
  },
];
