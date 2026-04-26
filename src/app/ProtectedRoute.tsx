import { useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../features/authentication/useUser";
import { Spinner } from "../components/ui/Spinner";

type ProtectedRouteProps = {
  children: ReactNode;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const { isLoading, isAuthenticated } = useUser();

  useEffect(
    function () {
      if (!isAuthenticated && !isLoading) navigate("/login", { replace: true });
    },
    [isAuthenticated, isLoading, navigate],
  );

  if (isLoading) {
    return (
      <div className="flex h-dvh items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-600">
          <Spinner size="lg" />
          <p className="text-sm">جاري التحقق من الجلسة…</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) return children;

  return null;
}
