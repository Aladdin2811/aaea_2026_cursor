import {
  Briefcase,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  KeyRound,
  LogOut,
  Menu,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "../../lib/supabase";
import { useUser } from "../../features/authentication/useUser";
import { useInactivitySessionCountdown } from "../../features/authentication/useInactivitySessionCountdown";
import { cx } from "../../lib/cx";
import {
  getActiveNavChildLabel,
  getNavSectionLabel,
} from "../../navigation/mainNav";
import { InAppNotificationBell } from "./InAppNotificationBell";
import { DirectMessagesInHeader } from "./DirectMessagesPanel";

/** أحرف مختصرة للصورة الرمزية (يدعم العربية بشكل معقول) */
function getInitials(fullName: string): string {
  const t = fullName.trim();
  if (!t) return "?";
  const parts = t.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const first = Array.from(parts[0]!)[0] ?? "";
    const last = Array.from(parts[parts.length - 1]!)[0] ?? "";
    const s = `${first}${last}`;
    return s || "?";
  }
  return Array.from(t).slice(0, 2).join("");
}

function formatHMS(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(
    s,
  ).padStart(2, "0")}`;
}

type Props = {
  onMenuClick: () => void;
  /** شريط التنقل الثابت على الشاشات الكبيرة */
  sidebarDesktopVisible?: boolean;
  onToggleDesktopSidebar?: () => void;
};

export function AppHeader({
  onMenuClick,
  sidebarDesktopVisible = true,
  onToggleDesktopSidebar,
}: Props) {
  const { user, profile } = useUser();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const displayName =
    profile?.full_name?.trim() ||
    (typeof user?.user_metadata?.fullName === "string"
      ? user.user_metadata.fullName.trim()
      : "") ||
    "";
  const userEmail = user?.email?.trim() ?? "";
  const profileLabel = displayName || userEmail.split("@")[0] || "مستخدم";
  const jobName = profile?.job_name?.trim() || null;
  const nameInitials = getInitials(displayName || profileLabel);
  const title = useMemo(() => getNavSectionLabel(pathname), [pathname]);
  const subtitle = useMemo(() => getActiveNavChildLabel(pathname), [pathname]);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [passwordEditorOpen, setPasswordEditorOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const configuredMinutes = Number(
    import.meta.env.VITE_SESSION_TIMEOUT_MINUTES,
  );
  const sessionTimeoutMs =
    Number.isFinite(configuredMinutes) && configuredMinutes > 0
      ? configuredMinutes * 60 * 1000
      : 60 * 60 * 1000;

  const { remainingSeconds } = useInactivitySessionCountdown({
    enabled: Boolean(user),
    timeoutMs: sessionTimeoutMs,
  });

  useEffect(() => {
    if (!userMenuOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!userMenuRef.current?.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [userMenuOpen]);

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  };

  const handlePasswordUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const pwd = newPassword.trim();
    if (pwd.length < 8) {
      toast.error("يجب ألا تقل كلمة المرور عن 8 أحرف");
      return;
    }
    if (pwd !== confirmPassword.trim()) {
      toast.error("تأكيد كلمة المرور غير متطابق");
      return;
    }

    setPasswordSaving(true);
    const { error } = await supabase.auth.updateUser({ password: pwd });
    setPasswordSaving(false);

    if (error) {
      toast.error(error.message || "تعذر تحديث كلمة المرور");
      return;
    }

    setNewPassword("");
    setConfirmPassword("");
    setPasswordEditorOpen(false);
    toast.success("تم تحديث كلمة المرور بنجاح");
  };

  return (
    <header className="sticky top-0 z-30 overflow-visible border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex w-[100%] max-w-full items-center gap-3 px-4 py-2 sm:px-6 lg:px-8">
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm hover:bg-slate-50 lg:hidden"
          onClick={onMenuClick}
          aria-label="فتح القائمة"
        >
          <Menu className="size-5" strokeWidth={1.75} />
        </button>

        {onToggleDesktopSidebar ? (
          <button
            type="button"
            className="hidden items-center justify-center rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm hover:bg-slate-50 lg:inline-flex"
            onClick={onToggleDesktopSidebar}
            aria-label={
              sidebarDesktopVisible
                ? "إخفاء القائمة الجانبية"
                : "إظهار القائمة الجانبية"
            }
            aria-pressed={sidebarDesktopVisible}
          >
            {sidebarDesktopVisible ? (
              <ChevronRight className="size-5" strokeWidth={2} aria-hidden />
            ) : (
              <ChevronLeft className="size-5" strokeWidth={2} aria-hidden />
            )}
          </button>
        ) : null}

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold text-slate-900 sm:text-xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="hidden truncate text-sm text-slate-500 sm:block">
              {subtitle}
            </p>
          ) : null}
        </div>

        {/* <div className="hidden max-w-xs flex-1 sm:flex">
          <label className="relative w-full">
            <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3 text-slate-400">
              <Search className="size-4" strokeWidth={1.75} />
            </span>
            <input
              type="search"
              placeholder="بحث سريع…"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2 pe-3 ps-9 text-sm text-slate-800 outline-none ring-emerald-500/30 placeholder:text-slate-400 focus:border-emerald-300 focus:bg-white focus:ring-2"
              readOnly
              title="سيتم تفعيل البحث لاحقاً"
            />
          </label>
        </div> */}

        <div className="flex min-w-0 shrink-0 flex-row items-center gap-2 sm:gap-2.5">
          {/* المستخدم — شريحة واحدة تفتح القائمة */}
          <div className="order-3 relative min-w-0" ref={userMenuRef}>
            <button
              type="button"
              className={cx(
                "flex max-w-full min-w-0 items-center gap-2 rounded-2xl border bg-white py-1 pe-2 ps-1 shadow-sm transition",
                "hover:border-emerald-200/90 hover:bg-gradient-to-l hover:from-emerald-50/40 hover:to-white hover:shadow-md",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30",
                userMenuOpen
                  ? "border-emerald-300/60 ring-2 ring-emerald-500/15"
                  : "border-slate-200/80",
              )}
              aria-expanded={userMenuOpen}
              aria-haspopup="menu"
              aria-label={`قائمة الحساب، ${displayName ? `مرحبا ${displayName}` : profileLabel}`}
              onClick={() => setUserMenuOpen((v) => !v)}
            >
              <span
                className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 text-white shadow-inner shadow-emerald-900/20"
                aria-hidden
              >
                {jobName ? (
                  <Briefcase
                    className="size-[1.1rem] opacity-95"
                    strokeWidth={1.9}
                  />
                ) : (
                  <span className="text-[0.7rem] font-bold leading-none">
                    {nameInitials}
                  </span>
                )}
              </span>
              <span className="hidden min-w-0 flex-1 flex-col items-end gap-0.5 text-end sm:flex">
                <span className="text-[0.65rem] font-semibold tracking-wide text-slate-400">
                  مرحبا
                </span>
                <span
                  className="max-w-[6.5rem] truncate text-sm font-semibold text-slate-800 md:max-w-[10rem] lg:max-w-[13rem]"
                  title={profileLabel}
                >
                  {profileLabel}
                </span>
                {jobName ? (
                  <span
                    className="max-w-[6.5rem] truncate text-[0.7rem] font-medium leading-tight text-emerald-800/80 md:max-w-[10rem] lg:max-w-[13rem]"
                    title={jobName}
                  >
                    {jobName}
                  </span>
                ) : null}
              </span>
              <ChevronDown
                strokeWidth={2}
                className={cx(
                  "hidden size-4 shrink-0 text-slate-400 transition sm:block",
                  userMenuOpen && "rotate-180 text-emerald-600",
                )}
                aria-hidden
              />
            </button>

            {userMenuOpen ? (
              <div
                className="absolute end-0 top-[calc(100%+0.45rem)] z-50 w-[min(18rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xl shadow-slate-300/25 ring-1 ring-slate-100/80"
                role="menu"
                aria-label="قائمة المستخدم"
              >
                <div className="border-b border-slate-100 bg-gradient-to-l from-slate-50/90 to-white px-3 py-3">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {profileLabel}
                  </p>
                  {jobName ? (
                    <p
                      className="mt-1 line-clamp-2 text-xs font-medium leading-snug text-emerald-800/90"
                      title={jobName}
                    >
                      {jobName}
                    </p>
                  ) : null}
                  {userEmail ? (
                    <p
                      className="mt-0.5 truncate text-xs text-slate-500"
                      title={userEmail}
                    >
                      {userEmail}
                    </p>
                  ) : null}
                </div>
                <div className="border-b border-slate-100 p-2">
                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-start text-sm font-medium text-slate-700 transition hover:bg-emerald-50/80 hover:text-emerald-800"
                    onClick={() => setPasswordEditorOpen((v) => !v)}
                  >
                    <KeyRound
                      className="size-4 shrink-0 opacity-80"
                      strokeWidth={1.75}
                    />
                    تغيير كلمة المرور
                  </button>
                  {passwordEditorOpen ? (
                    <form
                      onSubmit={(e) => void handlePasswordUpdate(e)}
                      className="mt-2 space-y-2 px-1 pb-1"
                    >
                      <input
                        type="password"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm text-slate-900 outline-none ring-emerald-500/25 placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-2"
                        placeholder="كلمة المرور الجديدة (8 أحرف على الأقل)"
                        autoComplete="new-password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={passwordSaving}
                      />
                      <input
                        type="password"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm text-slate-900 outline-none ring-emerald-500/25 placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-2"
                        placeholder="تأكيد كلمة المرور"
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={passwordSaving}
                      />
                      <button
                        type="submit"
                        className="w-full rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:pointer-events-none disabled:opacity-60"
                        disabled={passwordSaving}
                      >
                        {passwordSaving ? "جارٍ الحفظ..." : "حفظ كلمة المرور"}
                      </button>
                    </form>
                  ) : null}
                </div>
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-2.5 px-3 py-2.5 text-start text-sm font-medium text-slate-700 transition hover:bg-red-50/80 hover:text-red-800"
                  onClick={() => void handleLogout()}
                >
                  <LogOut
                    className="size-4 shrink-0 opacity-80"
                    strokeWidth={1.75}
                  />
                  تسجيل الخروج
                </button>
              </div>
            ) : null}
          </div>

          {user ? (
            <div
              className="order-2 flex items-center gap-2 rounded-2xl border border-slate-200/70 bg-white/80 px-3 py-1.5 shadow-sm shadow-slate-200/30"
              aria-label="وقت الجلسة المتبقي"
              role="status"
            >
              <Clock3 className="size-4 text-emerald-700" strokeWidth={1.75} />
              <div className="flex items-baseline gap-2">
                <span className="hidden text-[0.65rem] font-semibold text-slate-500 sm:inline">
                  متبقي
                </span>
                <span className="font-mono text-sm font-semibold text-slate-900">
                  {formatHMS(remainingSeconds)}
                </span>
              </div>
            </div>
          ) : null}

          {/* إجراءات سريعة — مجموعة بصرية واحدة */}
          <div
            className="order-1 flex items-center gap-0.5 rounded-2xl border border-slate-200/70 bg-slate-50/70 p-0.5 shadow-sm shadow-slate-200/30"
            role="toolbar"
            aria-label="اختصارات"
          >
            <DirectMessagesInHeader />
            <InAppNotificationBell />
          </div>
        </div>
      </div>
    </header>
  );
}
