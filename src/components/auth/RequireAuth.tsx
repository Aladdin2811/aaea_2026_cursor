import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";

type Props = {
  children: React.ReactNode;
};

export function RequireAuth({ children }: Props) {
  const [state, setState] = useState<"loading" | "authed" | "anon">("loading");
  const configuredMinutes = Number(import.meta.env.VITE_SESSION_TIMEOUT_MINUTES);
  const sessionTimeoutMs =
    Number.isFinite(configuredMinutes) && configuredMinutes > 0
      ? configuredMinutes * 60 * 1000
      : 60 * 60 * 1000;

  useEffect(() => {
    let cancelled = false;

    void supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setState(data.session ? "authed" : "anon");
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return;
      setState(session ? "authed" : "anon");
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (state !== "authed") return;

    let timer: ReturnType<typeof setTimeout> | null = null;
    const logoutForInactivity = () => {
      void supabase.auth.signOut().finally(() => {
        setState("anon");
        toast.info("انتهت الجلسة بسبب عدم النشاط");
      });
    };

    const resetTimer = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(logoutForInactivity, sessionTimeoutMs);
    };

    const events: Array<keyof WindowEventMap> = [
      "click",
      "keydown",
      "mousemove",
      "scroll",
      "touchstart",
    ];

    events.forEach((eventName) =>
      window.addEventListener(eventName, resetTimer, { passive: true }),
    );
    resetTimer();

    return () => {
      if (timer) clearTimeout(timer);
      events.forEach((eventName) =>
        window.removeEventListener(eventName, resetTimer),
      );
    };
  }, [sessionTimeoutMs, state]);

  if (state === "loading") {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-slate-50 text-slate-600">
        <div
          className="size-9 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600"
          aria-hidden
        />
        <p className="text-sm">جاري التحقق من الصلاحيه</p>
      </div>
    );
  }

  if (state === "anon") {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
