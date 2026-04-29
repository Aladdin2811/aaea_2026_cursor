import { Bell } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useFetchMyInAppNotifications,
  useMarkInAppNotificationRead,
  useUnreadInAppNotificationCount,
} from "../../features/notifications/useInAppNotifications";
import { getHrefForInAppNotification } from "../../lib/notificationNavigation";
import { cx } from "../../lib/cx";

function formatNotifTime(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString("ar", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return "";
  }
}

/** وصف قصير لعمود category (يمكن توسعته لاحقاً) */
function categoryHint(category: string): string {
  if (category === "vacation_approval") return "إجازة";
  if (category.includes("spend") || category.includes("صرف")) return "صرف/قيود";
  if (category.includes("recon") || category.includes("تسوية")) return "تسوية";
  if (category.includes("decision") || category.includes("قرار")) return "قرار";
  return category;
}

export function InAppNotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: unread = 0 } = useUnreadInAppNotificationCount();
  const { data: items = [], isLoading, isError } = useFetchMyInAppNotifications();
  const { mutate: markRead } = useMarkInAppNotificationRead();

  useEffect(() => {
    if (!open) return;
    void queryClient.invalidateQueries({ queryKey: ["in_app_notifications"] });
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open, queryClient]);

  return (
    <div className="relative" ref={ref} dir="rtl">
      <button
        type="button"
        className={cx(
          "relative inline-flex size-9 shrink-0 items-center justify-center rounded-xl text-slate-600 transition hover:bg-white hover:text-emerald-700 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/35 active:scale-[0.97]",
          open && "bg-white text-emerald-700 shadow-sm",
        )}
        aria-label="تنبيهات الاعتماد"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <Bell className="size-[1.15rem]" strokeWidth={1.75} />
        {unread > 0 ? (
          <span
            className="absolute end-1 top-1 min-w-4 rounded-full bg-red-500 px-0.5 text-center text-[0.6rem] font-bold leading-4 text-white ring-2 ring-white"
            aria-label={`${unread} غير مقروء`}
          >
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          className="absolute end-0 top-[calc(100%+0.4rem)] z-50 w-[min(24rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xl ring-1 ring-slate-100/80"
          role="region"
          aria-label="قائمة التنبيهات"
        >
          <div className="border-b border-slate-100 bg-slate-50/80 px-3 py-2">
            <p className="text-sm font-semibold text-slate-800">
              التنبيهات
            </p>
            {/* <p className="text-xs text-slate-500">
              طلبات بانتظار الاعتماد (إجازات، قيود، تسوية، قرارات… حسب ربط كل وحدة)
            </p> */}
          </div>
          <div className="max-h-[min(20rem,50vh)] overflow-y-auto">
            {isLoading ? (
              <p className="px-3 py-4 text-center text-sm text-slate-500">
                جاري التحميل…
              </p>
            ) : isError ? (
              <p className="px-3 py-4 text-center text-sm text-red-600" role="alert">
                تعذر تحميل التنبيهات
              </p>
            ) : items.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-slate-500">
                لا توجد تنبيهات
              </p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {items.map((n) => {
                  const href = getHrefForInAppNotification(n);
                  return (
                    <li key={n.id}>
                      <button
                        type="button"
                        className="flex w-full flex-col items-start gap-0.5 px-3 py-2.5 text-end transition hover:bg-slate-50"
                        onClick={() => {
                          const go = () => {
                            if (href) {
                              navigate(href);
                            }
                            setOpen(false);
                          };
                          if (!n.read_at) {
                            markRead(n.id, { onSuccess: go });
                          } else {
                            go();
                          }
                        }}
                      >
                        <span className="flex w-full items-center justify-between gap-2">
                          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[0.65rem] font-medium text-slate-600">
                            {categoryHint(n.category)}
                          </span>
                        </span>
                        <span className="text-sm font-medium text-slate-900">
                          {n.title}
                        </span>
                        {n.body ? (
                          <span className="line-clamp-2 text-xs text-slate-600">
                            {n.body}
                          </span>
                        ) : null}
                        <span className="text-[0.65rem] text-slate-400">
                          {formatNotifTime(n.created_at)}
                          {!n.read_at ? " · جديد" : null}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
