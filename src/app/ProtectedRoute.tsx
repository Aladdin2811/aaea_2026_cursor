import { useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../features/authentication/useUser";
import { Spinner } from "../components/ui/Spinner";
import { useInactivitySessionCountdown } from "../features/authentication/useInactivitySessionCountdown";

type ProtectedRouteProps = {
  children: ReactNode;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const { isLoading, isAuthenticated } = useUser();
  const configuredMinutes = Number(import.meta.env.VITE_SESSION_TIMEOUT_MINUTES);
  const sessionTimeoutMs =
    Number.isFinite(configuredMinutes) && configuredMinutes > 0
      ? configuredMinutes * 60 * 1000
      : 60 * 60 * 1000;

  useInactivitySessionCountdown({
    enabled: isAuthenticated,
    timeoutMs: sessionTimeoutMs,
    onExpire: () => {
      // حساب الوقت من مكوّن الـHeader قد يكون في نفس الوقت، لكن تسجيل الخروج يجب أن يحدث
      // لضمان عدم بقاء المستخدم داخل الصفحات.
      void (async () => {
        // Lazy import to avoid circular deps and keep this file small
        const { supabase } = await import("../lib/supabase");
        const { toast } = await import("sonner");
        await supabase.auth.signOut();
        toast.info("انتهت الجلسة بسبب عدم النشاط");
        navigate("/login", { replace: true });
      })();
    },
  });

  useEffect(() => {
    if (!isAuthenticated && !isLoading)
      navigate("/login", { replace: true });
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex h-dvh items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-600">
          <Spinner size="lg" />
          <p className="text-sm">جاري التحقق من الصلاحيات…</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) return children;

  return null;
}
