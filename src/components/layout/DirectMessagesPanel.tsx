import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  Check,
  MessageSquare,
  Pencil,
  PenSquare,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { listUserProfiles, type UserProfileRow } from "../../api/apiUserProfiles";
import { useUser } from "../../features/authentication/useUser";
import {
  useCreateDmThreadAndSendMutation,
  useCreateGroupThreadAndSendMutation,
  useDeleteDmMessageMutation,
  useDmMessagesList,
  useDmMessagesSubscription,
  useDmThreadsWithProfiles,
  useDmUnreadCount,
  useMarkDmReadMutation,
  useSendBroadcastMutation,
  useSendDmMessageMutation,
  useUpdateDmMessageMutation,
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

function toggleInList(ids: string[], id: string): string[] {
  if (ids.includes(id)) return ids.filter((x) => x !== id);
  return [...ids, id];
}

export function DirectMessagesPanel({ open, onClose }: Props) {
  const { user } = useUser();
  const me = user?.id;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<View>("list");
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<DmMessageRow | null>(null);
  const [body, setBody] = useState("");
  const [composeUserFilter, setComposeUserFilter] = useState("");
  /** اختيار مُتعدّد للمستقبلين (بدون «للجميع») */
  const [composeSelectedIds, setComposeSelectedIds] = useState<string[]>([]);
  const [sendToAll, setSendToAll] = useState(false);
  const [groupTitle, setGroupTitle] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");

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
    isPending: create1Pending,
    error: create1Error,
  } = useCreateDmThreadAndSendMutation(me);
  const {
    mutate: createGroupAndSend,
    isPending: createGroupPending,
    error: createGroupError,
  } = useCreateGroupThreadAndSendMutation(me);
  const {
    mutate: sendBroadcast,
    isPending: broadcastPending,
    error: broadcastError,
  } = useSendBroadcastMutation(me);
  const { mutate: updateMessage, isPending: updateMsgPending } =
    useUpdateDmMessageMutation(me);
  const { mutate: deleteMessage, isPending: deleteMsgPending } =
    useDeleteDmMessageMutation(me);

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
      setComposeSelectedIds([]);
      setSendToAll(false);
      setGroupTitle("");
      setEditingMessageId(null);
      setEditDraft("");
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
  }, [view, messages.length, editingMessageId]);

  const canSend = body.trim().length > 0;
  const busy =
    sendPending ||
    create1Pending ||
    createGroupPending ||
    broadcastPending ||
    updateMsgPending ||
    deleteMsgPending;
  const createErr = ((create1Error ?? createGroupError) as { message?: string } | null)
    ?.message;
  const sendErr =
    ((sendError ?? broadcastError ?? createErr) as { message?: string } | null)
      ?.message;

  const composeReady =
    view !== "compose" || sendToAll || composeSelectedIds.length > 0;
  const singleRecipient =
    !sendToAll && composeSelectedIds.length === 1
      ? composeSelectedIds[0]!
    : null;

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

  const onToggleSendToAll = (v: boolean) => {
    setSendToAll(v);
    if (v) {
      setComposeSelectedIds([]);
      setGroupTitle("");
    }
  };

  const onToggleUser = (userId: string) => {
    if (sendToAll) return;
    setComposeSelectedIds((ids) => toggleInList(ids, userId));
  };

  const openThread = (t: DmThreadWithMeta) => {
    setActiveThreadId(t.thread.id);
    setView("thread");
    setReplyTo(null);
  };

  const onSubmitSend = () => {
    if (!canSend || !me) return;
    const t = body.trim();
    if (view === "compose") {
      if (sendToAll) {
        sendBroadcast(
          { body: t },
          {
            onSuccess: (msg) => {
              setBody("");
              onToggleSendToAll(false);
              setView("thread");
              setActiveThreadId(msg.thread_id);
              setReplyTo(null);
              toast.success("أُرسلت الرسالة للجميع");
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
      if (composeSelectedIds.length === 0) return;
      if (singleRecipient) {
        createAndSend(
          { otherUserId: singleRecipient, body: t },
          {
            onSuccess: (d) => {
              setBody("");
              setView("thread");
              setActiveThreadId(d.threadId);
              setComposeSelectedIds([]);
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
      createGroupAndSend(
        {
          memberUserIds: composeSelectedIds,
          body: t,
          title: groupTitle.trim() ? groupTitle.trim() : null,
        },
        {
          onSuccess: (d) => {
            setBody("");
            setView("thread");
            setActiveThreadId(d.threadId);
            setComposeSelectedIds([]);
            setGroupTitle("");
            toast.success("أُرسلت إلى المجموعة");
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
      if (replyTo?.deleted_at) {
        toast.error("لا يمكن الرد على رسالة محذوفة");
        return;
      }
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

  const onStartEdit = useCallback((m: DmMessageRow) => {
    if (m.deleted_at) return;
    setEditingMessageId(m.id);
    setEditDraft(m.body);
  }, []);

  const onSaveEdit = useCallback(() => {
    if (!editingMessageId || !activeThreadId || !me) return;
    const d = editDraft.trim();
    if (!d) {
      toast.error("نصّ الرسالة لا يكون فارغاً");
      return;
    }
    updateMessage(
      { messageId: editingMessageId, body: d, threadId: activeThreadId },
      {
        onSuccess: () => {
          setEditingMessageId(null);
          setEditDraft("");
          toast.success("عُدّلت الرسالة");
        },
        onError: (e) => {
          toast.error(
            e instanceof Error ? e.message : "تعذر تعديل الرسالة",
          );
        },
      },
    );
  }, [editingMessageId, activeThreadId, me, editDraft, updateMessage]);

  const onCancelEdit = useCallback(() => {
    setEditingMessageId(null);
    setEditDraft("");
  }, []);

  const onDeleteOwn = useCallback(
    (m: DmMessageRow) => {
      if (m.deleted_at || !activeThreadId) return;
      if (!window.confirm("حذف هذه الرسالة؟")) return;
      deleteMessage(
        { messageId: m.id, threadId: activeThreadId },
        {
          onSuccess: () => {
            if (replyTo?.id === m.id) setReplyTo(null);
            if (editingMessageId === m.id) onCancelEdit();
            toast.success("حُذفت الرسالة");
          },
          onError: (e) => {
            toast.error(
              e instanceof Error ? e.message : "تعذر حذف الرسالة",
            );
          },
        },
      );
    },
    [activeThreadId, replyTo, editingMessageId, deleteMessage, onCancelEdit],
  );

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
                setEditingMessageId(null);
              }}
            >
              <ArrowLeft className="size-4 shrink-0" strokeWidth={2} />
              <span className="min-w-0 truncate">
                {activeThreadMeta
                  ? activeThreadMeta.displayName
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
                setComposeSelectedIds([]);
                setSendToAll(false);
                setGroupTitle("");
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
                setComposeSelectedIds([]);
                setSendToAll(false);
                setGroupTitle("");
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
                  setComposeSelectedIds([]);
                  setSendToAll(false);
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
                      {t.displayName}
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
                const isDeleted = Boolean(m.deleted_at);
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
                      {m.reply_to_id && !isDeleted && (
                        <p className="mb-0.5 border-b border-white/20 pb-0.5 text-[0.6rem] opacity-90">
                          (رد)
                        </p>
                      )}
                      {isDeleted ? (
                        <p className="text-xs italic text-slate-500">
                          حُذفت هذه الرسالة
                        </p>
                      ) : editingMessageId === m.id && mine ? (
                        <div className="space-y-1">
                          <textarea
                            rows={3}
                            className="w-full resize-y rounded border border-slate-200 bg-white px-2 py-1 text-slate-800"
                            value={editDraft}
                            onChange={(e) => setEditDraft(e.target.value)}
                          />
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              className="rounded p-1 text-slate-500 hover:bg-slate-200"
                              onClick={onCancelEdit}
                              aria-label="إلغاء"
                            >
                              <X className="size-3.5" />
                            </button>
                            <button
                              type="button"
                              className="inline-flex items-center gap-0.5 rounded bg-emerald-600 px-2 py-0.5 text-xs text-white hover:bg-emerald-700"
                              onClick={onSaveEdit}
                              disabled={updateMsgPending}
                            >
                              <Check className="size-3.5" />
                              حفظ
                            </button>
                          </div>
                        </div>
                      ) : mine ? (
                        <p className="w-full break-words">{m.body}</p>
                      ) : (
                        <button
                          type="button"
                          className="w-full break-words text-inherit"
                          onClick={() => setReplyTo(m)}
                          title="رد على هذه"
                        >
                          {m.body}
                        </button>
                      )}
                      {mine && !isDeleted && editingMessageId !== m.id ? (
                        <div className="mt-0.5 flex items-center justify-end gap-0.5">
                          <button
                            type="button"
                            className="inline-flex size-6 items-center justify-center rounded text-slate-500 hover:bg-slate-200 hover:text-slate-800"
                            onClick={() => onStartEdit(m)}
                            aria-label="تعديل"
                          >
                            <Pencil className="size-3" strokeWidth={1.75} />
                          </button>
                          <button
                            type="button"
                            className="inline-flex size-6 items-center justify-center rounded text-slate-500 hover:bg-red-50 hover:text-red-800"
                            onClick={() => onDeleteOwn(m)}
                            aria-label="حذف"
                          >
                            <Trash2 className="size-3" strokeWidth={1.75} />
                          </button>
                        </div>
                      ) : null}
                      <p
                        className={cx(
                          "mt-0.5 text-[0.6rem] opacity-80",
                          mine ? "text-slate-500" : "text-white/80",
                        )}
                      >
                        {formatMsgTime(m.created_at)}
                        {m.edited_at && !isDeleted && (
                          <span className="ms-1">(عُدِّلت)</span>
                        )}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {replyTo && me && !replyTo.deleted_at && (
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
          <p className="px-0.5 text-xs font-medium text-slate-600">المستقبل</p>
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/60 px-2 py-1.5 text-sm">
            <input
              type="checkbox"
              className="size-4 rounded border-slate-300"
              checked={sendToAll}
              onChange={(e) => onToggleSendToAll(e.target.checked)}
            />
            <span className="font-medium text-slate-800">إرسال للجميع</span>
          </label>
          {!sendToAll && (
            <>
              <input
                type="search"
                className="w-full rounded-lg border border-slate-200 bg-slate-50/80 px-2 py-1.5 text-sm"
                placeholder="ابحث بالاسم أو البريد"
                value={composeUserFilter}
                onChange={(e) => setComposeUserFilter(e.target.value)}
                disabled={sendToAll}
              />
              {composeSelectedIds.length > 1 ? (
                <div>
                  <p className="mb-0.5 px-0.5 text-[0.7rem] text-slate-500">اسم المجموعة (اختياري)</p>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm"
                    placeholder="مثال: فريق المشروع"
                    value={groupTitle}
                    onChange={(e) => setGroupTitle(e.target.value)}
                  />
                </div>
              ) : null}
              {loadingUsers ? (
                <p className="text-center text-xs text-slate-500">…</p>
              ) : (
                <div className="max-h-32 overflow-y-auto rounded-lg border border-slate-100">
                  {composeCandidates.length === 0 ? (
                    <p className="p-2 text-center text-xs text-slate-500">لا نتائج</p>
                  ) : (
                    <ul>
                      {composeCandidates.map((u) => {
                        const sel = composeSelectedIds.includes(u.id);
                        return (
                          <li key={u.id}>
                            <button
                              type="button"
                              className={cx(
                                "flex w-full items-center gap-2 border-b border-slate-100 px-2 py-1.5 text-end last:border-0",
                                sel
                                  ? "bg-emerald-100/50 text-emerald-900"
                                  : "hover:bg-slate-50",
                              )}
                              onClick={() => onToggleUser(u.id)}
                            >
                              <span
                                className={cx(
                                  "ms-auto inline-flex size-4 shrink-0 items-center justify-center rounded border",
                                  sel
                                    ? "border-emerald-600 bg-emerald-600"
                                    : "border-slate-300",
                                )}
                                aria-hidden
                              />
                              <span className="min-w-0 flex-1 text-start">
                                <span className="text-sm font-medium text-slate-800">
                                  {formatOptionalText(u.full_name) || u.email}
                                </span>
                                {u.email ? (
                                  <span className="ms-1 block text-[0.7rem] text-slate-500">
                                    {u.email}
                                  </span>
                                ) : null}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}
            </>
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
                view === "compose"
                  ? sendToAll
                    ? "نصّ الرسالة (يصل لجميع المستخدمين)…"
                    : "نصّ الرسالة (اختر «للجميع» أو مستقبلًا واحدًا أو أكثر)…"
                  : "اكتب…"
              }
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (
                    !busy &&
                    (view === "thread" ? activeThreadId : composeReady)
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
                (view === "compose" && !composeReady) ||
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
      <DirectMessagesPanel
        open={open}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}
