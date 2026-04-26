import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

type Props = {
  children: React.ReactNode;
};

export function RequireAuth({ children }: Props) {
  const [state, setState] = useState<"loading" | "authed" | "anon">("loading");

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
