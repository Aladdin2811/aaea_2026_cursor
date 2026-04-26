import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, MessageSquare, PenSquare, Send, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { listUserProfiles, type UserProfileRow } from "../../api/apiUserProfiles";
import { useUser } from "../../features/authentication/useUser";
import { HeaderIconTooltip } from "../ui/HeaderIconTooltip";
import {
  useCreateDmThreadAndSendMutation,
  useDmMessagesList,
  useDmMessagesSubscription,
  useDmThreadsWithProfiles,
  useDmUnreadCount,
  useMarkDmReadMutation,
  useSendDmMessageMutation,
  type DmMessageRow,
  type DmThreadWithMeta,
} from "../../features/messaging/useDirectMessages";
import { cx } from "../../lib/cx";
import { formatOptionalText } from "../../lib/displayValue";

function formatMsgTime(iso: string): string {
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

type View = "list" | "thread" | "compose";

type Props = {
  open: boolean;
  onClose: () => void;
};

function labelForUser(p: UserProfileRow | null, fallback: string) {
  if (p == null) return fallback;
  const n = p.full_name?.trim();
  if (n) return n;
  return p.email?.trim() || fallback;
}

export function DirectMessagesPanel({ open, onClose }: Props) {
  const { user } = useUser();
  const me = user?.id;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<View>("list");
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<DmMessageRow | null>(null);
  const [body, setBody] = useState("");
  const [composeToId, setComposeToId] = useState<string>("");
  const [composeUserFilter, setComposeUserFilter] = useState("");

  const { data: threads = [], isLoading: loadingThreads, isError: errThreads } =
    useDmThreadsWithProfiles(me, { enabled: open });
  const { data: messages = [], isLoading: loadingMsg } = useDmMessagesList(
    activeThreadId,
    { enabled: open && view === "thread" && Boolean(activeThreadId) },
  );
  const { data: allUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["user_profiles", "messaging_picker"],
    queryFn: listUserProfiles,
    enabled: open && view === "compose",
  });

  const { mutate: markRead } = useMarkDmReadMutation(me);
  const { mutate: send, isPending: sendPending, error: sendError } =
    useSendDmMessageMutation(me);
  const {
    mutate: createAndSend,
    isPending: createPending,
    error: createError,
  } = useCreateDmThreadAndSendMutation(me);

  useDmMessagesSubscription(me, open);
  const qc = useQueryClient();

  const activeThreadMeta = useMemo(
    () => threads.find((t) => t.thread.id === activeThreadId),
    [threads, activeThreadId],
  );

  useEffect(() => {
    if (open) {
      void qc.invalidateQueries({ queryKey: ["dm_unread_count"] });
    }
  }, [open, qc]);

  useEffect(() => {
    if (!open) {
      setView("list");
      setActiveThreadId(null);
      setReplyTo(null);
      setBody("");
    }
  }, [open]);

  useEffect(() => {
    if (!open || view !== "thread" || !activeThreadId || !me) return;
    markRead(activeThreadId);
  }, [open, view, activeThreadId, me, markRead]);

  useEffect(() => {
    if (view === "thread" && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [view, messages.length]);

  const canSend = body.trim().length > 0;
  const busy = sendPending || createPending;
  const sendErr = ((sendError ?? createError) as { message?: string } | null)
    ?.message;

  const composeCandidates = useMemo(() => {
    if (!me) return [] as UserProfileRow[];
    const s = composeUserFilter.trim().toLowerCase();
    return allUsers
      .filter((u) => u.id !== me)
      .filter((u) => {
        if (!s) return true;
        const n = (u.full_name || "").toLowerCase();
        const e = (u.email || "").toLowerCase();
        return n.includes(s) || e.includes(s);
      })
      .slice(0, 200);
  }, [allUsers, me, composeUserFilter]);

  const openThread = (t: DmThreadWithMeta) => {
    setActiveThreadId(t.thread.id);
    setView("thread");
    setReplyTo(null);
  };

  const onSubmitSend = () => {
    if (!canSend || !me) return;
    if (view === "compose" && !composeToId.trim()) return;
    const t = body.trim();
    if (view === "compose" && composeToId) {
      createAndSend(
        { otherUserId: composeToId, body: t },
        {
          onSuccess: (d) => {
            setBody("");
            setView("thread");
            setActiveThreadId(d.threadId);
            setComposeToId("");
            toast.success("تم إرسال الرسالة");
          },
          onError: (e) => {
            toast.error(
              e instanceof Error ? e.message : "تعذر إرسال الرسالة",
            );
          },
        },
      );
      return;
    }
    if (view === "thread" && activeThreadId) {
      send(
        {
          threadId: activeThreadId,
          body: t,
          replyToId: replyTo?.id ?? null,
        },
        {
          onSuccess: () => {
            setBody("");
            setReplyTo(null);
            if (activeThreadId) markRead(activeThreadId);
            toast.success("تم إرسال الرسالة");
          },
          onError: (e) => {
            toast.error(
              e instanceof Error ? e.message : "تعذر إرسال الرسالة",
            );
          },
        },
      );
    }
  };

  if (!open) return null;

  return (
    <div
      className="absolute end-0 top-[calc(100%+0.4rem)] z-50 flex max-h-[min(32rem,85vh)] w-[min(24rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xl ring-1 ring-slate-100/80"
      role="dialog"
      aria-label="الرسائل"
      dir="rtl"
    >
      <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-slate-50/80 px-2 py-2 pe-2 ps-1">
        <div className="min-w-0">
          {view === "list" && (
            <p className="ps-1 text-sm font-semibold text-slate-800">الرسائل</p>
          )}
          {view === "thread" && (
            <button
              type="button"
              className="inline-flex min-w-0 max-w-full items-center gap-1.5 text-sm font-semibold text-slate-800"
              onClick={() => {
                setView("list");
                setActiveThreadId(null);
                setReplyTo(null);
              }}
            >
              <ArrowLeft className="size-4 shrink-0" strokeWidth={2} />
              <span className="min-w-0 truncate">
                {activeThreadMeta
                  ? labelForUser(
                      activeThreadMeta.other,
                      "مستخدم"
                    )
                  : "…"}
              </span>
            </button>
          )}
          {view === "compose" && (
            <button
              type="button"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-800"
              onClick={() => {
                setView("list");
                setComposeToId("");
                setBody("");
              }}
            >
              <ArrowLeft className="size-4" strokeWidth={2} />
              جديد
            </button>
          )}
        </div>
        <div className="flex items-center gap-0.5">
          {view === "list" && (
            <button
              type="button"
              className="inline-flex size-8 items-center justify-center rounded-lg text-slate-600 transition hover:bg-white hover:text-emerald-700"
              title="رسالة جديدة"
              onClick={() => {
                setView("compose");
                setComposeToId("");
                setBody("");
                setReplyTo(null);
                setActiveThreadId(null);
              }}
            >
              <PenSquare className="size-[1.05rem]" strokeWidth={1.75} />
            </button>
          )}
          <button
            type="button"
            className="inline-flex size-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
            onClick={onClose}
            aria-label="إغلاق"
          >
            <X className="size-4" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {view === "list" && (
        <div className="min-h-0 flex-1 overflow-y-auto">
          {loadingThreads ? (
            <p className="px-3 py-5 text-center text-sm text-slate-500">جاري التحميل…</p>
          ) : errThreads ? (
            <p className="px-3 py-4 text-center text-sm text-red-600" role="alert">
              تعذر تحميل الحوارات
            </p>
          ) : threads.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-3 py-8 text-center text-sm text-slate-500">
              <MessageSquare className="size-10 text-slate-300" strokeWidth={1.25} />
              <p>لا توجد محادثات</p>
              <button
                type="button"
                className="text-sm font-medium text-emerald-700 hover:underline"
                onClick={() => {
                  setView("compose");
                  setComposeToId("");
                  setBody("");
                }}
              >
                ابدأ رسالة جديدة
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {threads.map((t) => (
                <li key={t.thread.id}>
                  <button
                    type="button"
                    className={cx(
                      "flex w-full flex-col gap-0.5 px-3 py-2.5 text-end transition",
                      t.isUnread ? "bg-emerald-50/40" : "hover:bg-slate-50",
                    )}
                    onClick={() => void openThread(t)}
                  >
                    <span className="text-sm font-semibold text-slate-900">
                      {labelForUser(
                        t.other,
                        t.thread.participant_low,
                      )}
                      {t.isUnread && (
                        <span className="ms-1 inline-block size-2 rounded-full bg-emerald-500" />
                      )}
                    </span>
                    {t.thread.last_message_preview ? (
                      <span
                        className="line-clamp-2 text-xs text-slate-600"
                        title={t.thread.last_message_preview}
                      >
                        {t.thread.last_message_preview}
                      </span>
                    ) : null}
                    {t.thread.last_message_at ? (
                      <span className="text-[0.65rem] text-slate-400">
                        {formatMsgTime(t.thread.last_message_at)}
                      </span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {view === "thread" && activeThreadId && (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div
            ref={scrollRef}
            className="min-h-0 max-h-[min(18rem,50vh)] flex-1 space-y-2.5 overflow-y-auto px-2 py-2"
          >
            {loadingMsg && messages.length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-500">…</p>
            ) : (
              messages.map((m) => {
                const mine = m.sender_id === me;
                return (
                  <div
                    key={m.id}
                    className={cx("flex w-full", mine ? "justify-start" : "justify-end")}
                  >
                    <div
                      className={cx(
                        "max-w-[90%] rounded-2xl px-3 py-1.5 text-end text-sm",
                        mine
                          ? "border border-slate-200/90 bg-slate-50 text-slate-800"
                          : "bg-gradient-to-l from-emerald-600 to-teal-600 text-white shadow-sm",
                      )}
                    >
                      {m.reply_to_id && (
                        <p className="mb-0.5 border-b border-white/20 pb-0.5 text-[0.6rem] opacity-90">
                          (رد)
                        </p>
                      )}
                      <button
                        type="button"
                        className="w-full break-words text-inherit"
                        onClick={() => (mine ? null : setReplyTo(m))}
                        title={mine ? "" : "رد على هذه"}
                      >
                        {m.body}
                      </button>
                      <p
                        className={cx(
                          "mt-0.5 text-[0.6rem] opacity-80",
                          mine ? "text-slate-500" : "text-white/80",
                        )}
                      >
                        {formatMsgTime(m.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {replyTo && me && (
            <div className="mx-1 mb-0.5 flex items-center justify-between gap-1 rounded-lg bg-emerald-50/80 px-2 py-1 text-xs text-slate-700">
              <span className="min-w-0 truncate" title={replyTo.body}>
                «{replyTo.body}»
              </span>
              <button
                type="button"
                className="shrink-0 text-slate-500 hover:text-slate-800"
                onClick={() => setReplyTo(null)}
                aria-label="إلغاء الرد"
              >
                <X className="size-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {view === "compose" && (
        <div className="shrink-0 space-y-2 border-b border-slate-100 px-2 py-2">
          <p className="px-0.5 text-xs font-medium text-slate-600">إلى</p>
          <input
            type="search"
            className="w-full rounded-lg border border-slate-200 bg-slate-50/80 px-2 py-1.5 text-sm"
            placeholder="ابحث بالاسم أو البريد"
            value={composeUserFilter}
            onChange={(e) => setComposeUserFilter(e.target.value)}
          />
          {loadingUsers ? (
            <p className="text-center text-xs text-slate-500">…</p>
          ) : (
            <div className="max-h-32 overflow-y-auto rounded-lg border border-slate-100">
              {composeCandidates.length === 0 ? (
                <p className="p-2 text-center text-xs text-slate-500">لا نتائج</p>
              ) : (
                <ul>
                  {composeCandidates.map((u) => (
                    <li key={u.id}>
                      <button
                        type="button"
                        className={cx(
                          "w-full border-b border-slate-100 px-2 py-1.5 text-end last:border-0",
                          u.id === composeToId
                            ? "bg-emerald-100/50 text-emerald-900"
                            : "hover:bg-slate-50",
                        )}
                        onClick={() => setComposeToId(u.id)}
                      >
                        <span className="text-sm font-medium text-slate-800">
                          {formatOptionalText(u.full_name) || u.email}
                        </span>
                        {u.email ? (
                          <span className="ms-1 block text-[0.7rem] text-slate-500">
                            {u.email}
                          </span>
                        ) : null}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {((view === "thread" && activeThreadId) || view === "compose") && (
        <div className="shrink-0 border-t border-slate-100 p-2">
          {sendErr ? (
            <p className="mb-1 text-end text-xs text-red-600">{sendErr}</p>
          ) : null}
          <div className="flex items-end gap-1.5">
            <textarea
              rows={2}
              className="min-w-0 flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50/80 px-2 py-1.5 text-sm"
              placeholder={
                view === "compose" ? "نصّ الرسالة (بعد اختيار المستقبل)…" : "اكتب…"
              }
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (
                    !busy &&
                    (view === "thread" ? activeThreadId : !!composeToId)
                  ) {
                    onSubmitSend();
                  }
                }
              }}
            />
            <button
              type="button"
              className="inline-flex size-9 shrink-0 items-center justify-center self-end rounded-xl bg-gradient-to-l from-emerald-600 to-teal-600 text-white shadow disabled:opacity-50"
              disabled={
                !canSend ||
                busy ||
                (view === "compose" && !composeToId) ||
                (view === "thread" && !activeThreadId)
              }
              onClick={onSubmitSend}
              title="إرسال"
              aria-label="إرسال"
            >
              {busy ? (
                <span className="size-4 inline-block animate-pulse" />
              ) : (
                <Send className="size-[1.05rem]" strokeWidth={1.8} />
              )}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export function DirectMessagesInHeader() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data: unread = 0 } = useDmUnreadCount();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  return (
    <div className="relative" ref={ref} dir="rtl">
      <HeaderIconTooltip label="الرسائل" sublabel="إرسال ورد مع المستخدمين">
        <button
          type="button"
          className={cx(
            "relative inline-flex size-9 shrink-0 items-center justify-center rounded-xl text-slate-600 transition hover:bg-white hover:text-emerald-700 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/35 active:scale-[0.97]",
            open && "bg-white text-emerald-700 shadow-sm",
          )}
          aria-label="الرسائل"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <MessageSquare className="size-[1.15rem]" strokeWidth={1.75} />
          {unread > 0 ? (
            <span
              className="absolute end-0.5 top-0.5 min-w-4 rounded-full bg-red-500 px-0.5 text-center text-[0.6rem] font-bold leading-4 text-white ring-2 ring-white"
              aria-label={`${unread} غير مقروء`}
            >
              {unread > 9 ? "9+" : unread}
            </span>
          ) : null}
        </button>
      </HeaderIconTooltip>
      <DirectMessagesPanel
        open={open}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}
