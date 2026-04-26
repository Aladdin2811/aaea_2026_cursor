import { ChevronDown, X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { groupHasActiveChild, navGroups } from "../../navigation/mainNav";

type Props = {
  open: boolean;
  onClose: () => void;
  /** على الشاشات الكبيرة: إخفاء الشريط الجانبي بالكامل لتوسيع المحتوى */
  desktopVisible?: boolean;
};

export function AppSidebar({
  open,
  onClose,
  desktopVisible = true,
}: Props) {
  const location = useLocation();
  const baseId = useId();
  const [openGroupId, setOpenGroupId] = useState<string | null>(() => {
    const pathname =
      typeof window !== "undefined" ? window.location.pathname : "/";
    const active = navGroups.find((g) => groupHasActiveChild(pathname, g));
    return active?.id ?? null;
  });

  /** عند تغيير المسار: يبقى قسم الصفحة الحالية وحده مفتوحاً */
  useEffect(() => {
    const pathname = location.pathname;
    const active = navGroups.find((g) => groupHasActiveChild(pathname, g));
    if (active) setOpenGroupId(active.id);
  }, [location.pathname]);

  /** قسم واحد مفتوح؛ الضغط على نفس الرأس يغلقه، والضغط على آخر يفتحه ويغلق السابق */
  function toggleGroup(id: string) {
    setOpenGroupId((prev) => (prev === id ? null : id));
  }

  const mobileSlide = open
    ? "max-lg:translate-x-0"
    : "max-lg:ltr:-translate-x-full max-lg:rtl:translate-x-full";

  /** على lg: انكماش/توسيع بـ max-width ليعمل الاختفاء والظهور بنفس سلاسة التوسيع */
  const desktopCollapse = desktopVisible
    ? "lg:max-w-60 lg:border-slate-200/80 lg:opacity-100 lg:pointer-events-auto"
    : "lg:max-w-0 lg:border-transparent lg:opacity-0 lg:pointer-events-none";

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ease-in-out lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!open}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 start-0 z-50 flex h-dvh max-h-dvh min-h-0 shrink-0 flex-col overflow-hidden border-e border-slate-200/80 bg-white shadow-xl shadow-slate-200/50 max-lg:w-[min(100%,15rem)] max-lg:transition-transform max-lg:duration-300 max-lg:ease-in-out lg:static lg:z-0 lg:h-dvh lg:min-w-0 lg:w-full lg:border-s-0 lg:border-e lg:shadow-none lg:transition-[max-width,opacity,border-color] lg:duration-300 lg:ease-in-out ${mobileSlide} ${desktopCollapse}`}
        aria-label="التنقل الرئيسي"
      >
        <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col lg:w-60 lg:min-w-60 lg:shrink-0">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-4">
            <div className="flex min-w-0 items-center gap-2">
              <img
                src="/logo-AAEA-w.jpeg"
                alt="شعار الهيئة العربية للطاقة الذرية"
                className="size-9 shrink-0 rounded-lg object-contain"
              />
              <div className="min-w-0 text-start">
                <p className="truncate text-sm font-semibold text-slate-900">
                  الهيئة العربية للطاقة الذرية
                </p>
                <p className="truncate text-xs text-slate-500">
                  جامعة الدول العربية
                </p>
              </div>
            </div>
            <button
              type="button"
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 lg:hidden"
              onClick={onClose}
              aria-label="إغلاق القائمة"
            >
              <X className="size-5" strokeWidth={1.75} />
            </button>
          </div>

          <nav
            className="min-h-0 flex-1 space-y-1.5 overflow-y-auto overflow-x-hidden overscroll-y-contain p-2"
            aria-label="القائمة الرئيسية"
          >
          {navGroups.map((group) => {
            const Icon = group.icon;
            const expanded = openGroupId === group.id;
            const groupActive = groupHasActiveChild(location.pathname, group);
            const panelId = `${baseId}-${group.id}-panel`;

            return (
              <div
                key={group.id}
                className="min-h-0 rounded-xl border border-slate-100/90 bg-slate-50/40 shadow-sm shadow-slate-100/80"
              >
                <button
                  type="button"
                  id={`${baseId}-${group.id}-btn`}
                  aria-expanded={expanded}
                  aria-controls={panelId}
                  onClick={() => toggleGroup(group.id)}
                  className={[
                    "flex w-full items-center gap-2 rounded-lg px-2 py-2.5 text-start transition-colors",
                    groupActive
                      ? "bg-gradient-to-l from-emerald-50/95 to-white text-emerald-900 ring-1 ring-emerald-100/90"
                      : "bg-white text-slate-800 hover:bg-slate-50/90",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "flex size-8 shrink-0 items-center justify-center rounded-md",
                      groupActive
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-100 text-slate-600",
                    ].join(" ")}
                  >
                    <Icon className="size-[1.15rem]" strokeWidth={2} />
                  </span>
                  <span className="min-w-0 flex-1 text-[13px] font-semibold leading-snug tracking-tight">
                    {group.label}
                  </span>
                  <ChevronDown
                    className={`size-4 shrink-0 text-slate-400 transition-transform duration-200 ${
                      expanded ? "rotate-180" : ""
                    }`}
                    strokeWidth={2}
                    aria-hidden
                  />
                </button>

                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={`${baseId}-${group.id}-btn`}
                  className={`grid min-h-0 transition-[grid-template-rows] duration-200 ease-out ${
                    expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="min-h-0 overflow-hidden">
                    <ul className="space-y-0.5 border-t border-slate-100/90 bg-white/70 px-1.5 py-1.5">
                      {group.children.map((child) => (
                        <li key={`${group.id}-${child.to}`}>
                          <NavLink
                            to={child.to}
                            end={child.end}
                            onClick={onClose}
                            className={({ isActive }) =>
                              [
                                "relative block rounded-md py-1.5 ps-5 pe-2 text-[12px] font-normal leading-snug transition-colors",
                                "before:absolute before:inset-y-1.5 before:start-1.5 before:w-0.5 before:rounded-full before:bg-emerald-600 before:transition-opacity",
                                isActive
                                  ? "bg-emerald-50/90 text-emerald-900 before:opacity-100"
                                  : "text-slate-600 before:opacity-0 hover:bg-slate-50 hover:text-slate-900",
                              ].join(" ")
                            }
                          >
                            {child.label}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
          </nav>

          <div className="border-t border-slate-100 p-3">
            <p className="flex min-w-0 items-center gap-1.5 truncate text-xs text-slate-500">
            <span className="min-w-0 truncate whitespace-nowrap">
              AAEA. All rights reserved. © {new Date().getFullYear()}
            </span>
            <img
              src="/logo-AAEA.ico"
              alt=""
              width={20}
              height={20}
              className="size-5 shrink-0"
            />
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
