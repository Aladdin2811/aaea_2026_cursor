import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../features/authentication/LoginForm";
import { useUser } from "../features/authentication/useUser";

export default function Login() {
  const navigate = useNavigate();
  const { isLoading, isAuthenticated } = useUser();

  useEffect(
    function () {
      if (!isLoading && isAuthenticated) navigate("/", { replace: true });
    },
    [isLoading, isAuthenticated, navigate],
  );

  if (isLoading) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-600">جاري التحقق من االصلاحيات…</p>
      </main>
    );
  }

  if (isAuthenticated) return null;

  return (
    <main className="flex min-h-dvh flex-col items-center gap-8 bg-slate-50 px-4 pb-10 pt-[3vh]">
      <img
        src="/logo-AAEA-w.jpeg"
        alt=""
        className="h-[15rem] w-auto max-w-full object-contain"
      />
      <h1 className="text-lg font-semibold text-slate-800">
        تسجيل بيانات المستخدم
      </h1>
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </main>
  );
}
