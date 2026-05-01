import { lazy } from "react";
import type { RouteObject } from "react-router-dom";
import { ph } from "./ph";

const CertifiedProgramsPage = lazy(
  () => import("../../pages/programs/CertifiedProgramsPage.tsx"),
);

export const programsRoutes: RouteObject[] = [
  {
    path: "programs/certified_programs",
    element: <CertifiedProgramsPage />,
  },
  {
    path: "programs/programs_type",
    element: ph("أنواع الأنشطة والبرامج", "------"),
  },
  {
    path: "programs/programs",
    element: ph("الأنشطة والبرامج المسجلة", "------"),
  },
  {
    path: "programs/program_participants",
    element: ph("المشاركين بالأنشطة والبرامج", "------"),
  },
  {
    path: "programs/programs_experts",
    element: ph("المحاضرين بالأنشطة والبرامج", "------"),
  },
  {
    path: "programs/activity_advance_settlement",
    element: ph("تسوية مصروفات الأنشطة", "------"),
  },
];
