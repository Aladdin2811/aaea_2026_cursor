import { Navigate, type RouteObject } from "react-router-dom";
import { ph } from "./ph";

export const endOfServiceRoutes: RouteObject[] = [
  {
    path: "end_of_service/end_of_service_employee_contribution",
    element: ph("نسبة مساهمة الموظفين", "------"),
  },
  {
    path: "end_of_service/end_of_service_contractors_contribution",
    element: ph("نسبة مساهمة المتعاقدين", "------"),
  },
  {
    path: "end_of_servic/end_of_service_employee_contribution",
    element: (
      <Navigate to="/end_of_service/end_of_service_employee_contribution" replace />
    ),
  },
  {
    path: "end_of_servic/end_of_service_contractors_contribution",
    element: (
      <Navigate
        to="/end_of_service/end_of_service_contractors_contribution"
        replace
      />
    ),
  },
];
