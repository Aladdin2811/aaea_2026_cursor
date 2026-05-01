import { lazy } from "react";
import type { RouteObject } from "react-router-dom";
import { ph } from "./ph";

const JobsPage = lazy(() => import("../../pages/jobs/JobsPage"));
const BasicSalariesPage = lazy(
  () => import("../../pages/salaries/BasicSalariesPage"),
);
const AllowancesPage = lazy(
  () => import("../../pages/allowances/AllowancesPage"),
);
const EmployeesPage = lazy(
  () => import("../../pages/employees/EmployeesPage.tsx"),
);
const EmployeesBanksPage = lazy(
  () => import("../../pages/employees/EmployeesBanksPage.tsx"),
);
const VacationTypePage = lazy(
  () => import("../../pages/vacations/VacationTypePage.tsx"),
);
const VacationsBalancesPage = lazy(
  () => import("../../pages/vacations/VacationsBalancesPage.tsx"),
);
const VacationsPage = lazy(
  () => import("../../pages/vacations/VacationsPage.tsx"),
);

export const administrativeRoutes: RouteObject[] = [
  {
    path: "administrative_management/jobs",
    element: <JobsPage />,
  },
  {
    path: "administrative_management/basic_salaries",
    element: <BasicSalariesPage />,
  },
  {
    path: "administrative_management/AllowancesPage",
    element: <AllowancesPage />,
  },
  {
    path: "administrative_management/employees",
    element: <EmployeesPage />,
  },
  {
    path: "administrative_management/employees_banks",
    element: <EmployeesBanksPage />,
  },
  {
    path: "administrative_management/vacation_type",
    element: <VacationTypePage />,
  },
  {
    path: "administrative_management/vacations_balances",
    element: <VacationsBalancesPage />,
  },
  {
    path: "administrative_management/vacations",
    element: <VacationsPage />,
  },
  {
    path: "administrative_management/deduction_from_salary",
    element: ph("الخصم من الراتب", "------"),
  },
  {
    path: "administrative_management/employees_payroll",
    element: ph("إصدار رواتب الموظفين", "------"),
  },
  {
    path: "administrative_management/contractors_payroll",
    element: ph("إصدار رواتب المتعاقدين", "------"),
  },
  {
    path: "administrative_management/experts_payroll",
    element: ph("إصدار مكافآت الخبراء", "------"),
  },
];
