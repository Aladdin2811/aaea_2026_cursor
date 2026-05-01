import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import {
  ACCESS_DENIED_PATH,
  ENABLE_PATH_PERMISSION_CHECK,
} from "../../config/accessPolicy";
import { useSessionPermissions } from "../../features/permissions/useSessionPermissions";
import { requiredPermissionCodesForPath } from "../../navigation/routePermissionRules";
import { RouteOutletFallback } from "../errors/RouteOutletFallback";

type PathPermissionGuardProps = {
  children: ReactNode;
};

function isAccessDeniedPath(pathname: string): boolean {
  const n = pathname.replace(/\/+$/, "") || "/";
  return n === `/${ACCESS_DENIED_PATH}` || n === "/access-denied";
}

export function PathPermissionGuard({ children }: PathPermissionGuardProps) {
  const { pathname } = useLocation();
  const { codes, isLoading, isError } = useSessionPermissions();

  if (!ENABLE_PATH_PERMISSION_CHECK) {
    return children;
  }

  if (isAccessDeniedPath(pathname)) {
    return children;
  }

  if (isLoading) {
    return <RouteOutletFallback />;
  }

  if (isError) {
    return (
      <p dir="rtl" className="text-destructive px-2 py-6 text-center text-sm" role="alert">
        تعذر التحقق من صلاحياتك. حدّث الصفحة أو تواصل مع المشرف.
      </p>
    );
  }

  const required = requiredPermissionCodesForPath(pathname);
  if (required == null || required.length === 0) {
    return children;
  }

  const codeSet = new Set(codes);
  const allowed = required.some((c) => codeSet.has(c));
  if (!allowed) {
    return <Navigate to={`/${ACCESS_DENIED_PATH}`} replace />;
  }

  return children;
}
