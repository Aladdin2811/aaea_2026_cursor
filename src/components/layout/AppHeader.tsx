import {
  Bell,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  MessageSquare,
  // Search,
  User,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import {
  getActiveNavChildLabel,
  getNavSectionLabel,
} from "../../navigation/mainNav";

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
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const title = useMemo(() => getNavSectionLabel(pathname), [pathname]);
  const subtitle = useMemo(() => getActiveNavChildLabel(pathname), [pathname]);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

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

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
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
            title={
              sidebarDesktopVisible
                ? "إخفاء القائمة الجانبية وتوسيع المحتوى"
                : "إظهار القائمة الجانبية"
            }
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

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50"
            aria-label="الرسائل"
            title="الرسائل"
          >
            <MessageSquare className="size-5" strokeWidth={1.75} />
          </button>

          <button
            type="button"
            className="relative inline-flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50"
            aria-label="التنبيهات"
          >
            <Bell className="size-5" strokeWidth={1.75} />
            <span className="absolute end-2 top-2 size-2 rounded-full bg-emerald-500 ring-2 ring-white" />
          </button>

          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              className="inline-flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50"
              aria-label="الحساب"
              aria-expanded={userMenuOpen}
              aria-haspopup="menu"
              onClick={() => setUserMenuOpen((v) => !v)}
            >
              <User className="size-5" strokeWidth={1.75} />
            </button>
            {userMenuOpen ? (
              <div
                className="absolute end-0 top-[calc(100%+0.5rem)] z-50 min-w-44 rounded-xl border border-slate-200/90 bg-white py-1 shadow-lg shadow-slate-200/60"
                role="menu"
                aria-label="قائمة المستخدم"
              >
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-start text-sm text-slate-700 hover:bg-slate-50"
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
        </div>
      </div>
    </header>
  );
}
