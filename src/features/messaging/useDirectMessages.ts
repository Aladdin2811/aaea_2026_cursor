import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";
import {
  createGroupThread,
  getBroadcastThreadId,
  getDmMessages,
  getDmUnreadCount,
  getOrCreateDmThread,
  listMyDmThreads,
  listThreadMembersUserIds,
  markDmThreadRead,
  otherParticipantId,
  sendDmMessage,
  softDeleteDmMessage,
  updateDmMessage,
  type DmMessageRow,
  type DmThreadKind,
  type DmThreadRow,
} from "../../api/apiDirectMessages";
import {
  getUserProfilesByIds,
  type UserProfileRow,
} from "../../api/apiUserProfiles";

const qk = {
  threads: (userId: string) => ["dm_threads", userId] as const,
  messages: (threadId: string) => ["dm_messages", threadId] as const,
  unread: () => ["dm_unread_count"] as const,
  profiles: (ids: string[]) => ["user_profiles", "ids", ...ids.sort()] as const,
  broadcastId: () => ["dm_broadcast_thread_id"] as const,
};

function sortThreads(rows: DmThreadRow[]): DmThreadRow[] {
  return [...rows].sort((a, b) => {
    const at = a.last_message_at
      ? new Date(a.last_message_at).getTime()
      : new Date(a.created_at).getTime();
    const bt = b.last_message_at
      ? new Date(b.last_message_at).getTime()
      : new Date(b.created_at).getTime();
    return bt - at;
  });
}

function threadKind(t: DmThreadRow): DmThreadKind {
  return t.kind ?? "dm";
}

function buildThreadDisplayName(
  thread: DmThreadRow,
  myUserId: string,
  other: UserProfileRow | null,
  groupPreview: UserProfileRow[],
): string {
  const k = threadKind(thread);
  if (k === "broadcast") {
    return thread.title?.trim() || "الجميع";
  }
  if (k === "group") {
    if (thread.title?.trim()) return thread.title.trim();
    const names = groupPreview
      .filter((p) => p.id !== myUserId)
      .slice(0, 3)
      .map((p) => p.full_name?.trim() || p.email)
      .filter(
        (x): x is string => x != null && x !== "",
      );
    if (names.length) return names.join("، ");
    return "محادثة جماعية";
  }
  const o = other;
  if (o) {
    const n = o.full_name?.trim();
    if (n) return n;
    return o.email?.trim() || "مستخدم";
  }
  return "مستخدم";
}

export type DmThreadWithMeta = {
  thread: DmThreadRow;
  /** 1:1: الطرف الآخر */
  other: UserProfileRow | null;
  isUnread: boolean;
  displayName: string;
  groupMemberPreview: UserProfileRow[];
  kind: DmThreadKind;
};

function hookUnreadInThread(
  t: DmThreadRow,
  me: string,
  myLastRead: string | null,
): boolean {
  if (t.last_message_at == null) return false;
  if (t.last_sender_id === me) return false;
  if (!t.last_message_at) return false;
  const readAt = myLastRead
    ? new Date(myLastRead).getTime()
    : 0;
  return new Date(t.last_message_at).getTime() > readAt;
}

export function useDmThreadsWithProfiles(
  myUserId: string | null | undefined,
  options?: { enabled?: boolean },
) {
  const can = Boolean(myUserId) && (options?.enabled !== false);
  return useQuery({
    queryKey: myUserId ? qk.threads(myUserId) : ["dm_threads", "off"],
    enabled: can,
    queryFn: async () => {
      if (!myUserId) return [] as DmThreadWithMeta[];
      const list = await listMyDmThreads(myUserId);
      if (list.length === 0) return [] as DmThreadWithMeta[];
      const ordered = sortThreads(
        list.map((t) => ({ ...t, kind: t.kind ?? "dm" })),
      );
      const { data: readState } = await supabase
        .from("dm_thread_read_state")
        .select("thread_id, last_read_at")
        .eq("user_id", myUserId)
        .in("thread_id", ordered.map((x) => x.id));
      const readMap = new Map(
        (readState ?? []).map(
          (r) => [r.thread_id, r.last_read_at as string] as [string, string],
        ),
      );

      const groupIds = ordered
        .filter((t) => threadKind(t) === "group")
        .map((t) => t.id);
      const membersMap = await listThreadMembersUserIds(groupIds);

      const profileIds = new Set<string>();
      for (const t of ordered) {
        if (threadKind(t) === "dm") {
          const oid = otherParticipantId(t, myUserId);
          if (oid) profileIds.add(oid);
        } else if (threadKind(t) === "group") {
          for (const uid of membersMap.get(t.id) ?? []) {
            if (uid !== myUserId) profileIds.add(uid);
          }
        }
      }
      const profiles = await getUserProfilesByIds([...profileIds]);
      const profileById = new Map(
        profiles.map((p) => [p.id, p] as [string, UserProfileRow]),
      );

      return ordered.map((thread) => {
        const k = threadKind(thread);
        let other: UserProfileRow | null = null;
        const groupMemberPreview: UserProfileRow[] = [];
        if (k === "dm") {
          const oid = otherParticipantId(thread, myUserId);
          if (oid) other = profileById.get(oid) ?? null;
        } else if (k === "group") {
          for (const uid of membersMap.get(thread.id) ?? []) {
            if (uid === myUserId) continue;
            const p = profileById.get(uid);
            if (p) groupMemberPreview.push(p);
          }
        }
        const isUnread = hookUnreadInThread(
          thread,
          myUserId,
          readMap.get(thread.id) ?? null,
        );
        return {
          thread,
          other,
          isUnread,
          groupMemberPreview,
          kind: k,
          displayName: buildThreadDisplayName(
            thread,
            myUserId,
            other,
            groupMemberPreview,
          ),
        } satisfies DmThreadWithMeta;
      });
    },
  });
}

export function useDmMessagesList(
  threadId: string | null | undefined,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: threadId ? qk.messages(threadId) : ["dm_messages", "none"],
    enabled: Boolean(threadId) && (options?.enabled !== false),
    queryFn: () => getDmMessages(threadId!),
  });
}

export function useBroadcastThreadId() {
  return useQuery({
    queryKey: qk.broadcastId(),
    queryFn: getBroadcastThreadId,
    staleTime: 5 * 60_000,
  });
}

export function useDmUnreadCount() {
  return useQuery({
    queryKey: qk.unread(),
    queryFn: getDmUnreadCount,
    refetchInterval: 30_000,
  });
}

export function useMarkDmReadMutation(myUserId: string | null | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (threadId: string) => {
      if (!myUserId) return;
      await markDmThreadRead(myUserId, threadId);
    },
    onSuccess: () => {
      if (myUserId) {
        void qc.invalidateQueries({ queryKey: qk.threads(myUserId) });
      }
      void qc.invalidateQueries({ queryKey: qk.unread() });
    },
  });
}

export function useSendDmMessageMutation(
  myUserId: string | null | undefined,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      threadId: string;
      body: string;
      replyToId?: string | null;
    }) => {
      if (!myUserId) throw new Error("غير مسجّل");
      return sendDmMessage(myUserId, args);
    },
    onSuccess: (_d, v) => {
      void qc.invalidateQueries({ queryKey: qk.messages(v.threadId) });
      if (myUserId) {
        void qc.invalidateQueries({ queryKey: qk.threads(myUserId) });
      }
      void qc.invalidateQueries({ queryKey: qk.unread() });
    },
  });
}

export function useCreateDmThreadAndSendMutation(
  myUserId: string | null | undefined,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { otherUserId: string; body: string }) => {
      if (!myUserId) throw new Error("غير مسجّل");
      const threadId = await getOrCreateDmThread(args.otherUserId);
      const message = await sendDmMessage(myUserId, {
        threadId,
        body: args.body,
      });
      return { threadId, message };
    },
    onSuccess: (d) => {
      if (myUserId) {
        void qc.invalidateQueries({ queryKey: qk.threads(myUserId) });
        void qc.invalidateQueries({ queryKey: qk.messages(d.threadId) });
      }
      void qc.invalidateQueries({ queryKey: qk.unread() });
    },
  });
}

export function useCreateGroupThreadAndSendMutation(
  myUserId: string | null | undefined,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      memberUserIds: string[];
      body: string;
      title: string | null;
    }) => {
      if (!myUserId) throw new Error("غير مسجّل");
      const threadId = await createGroupThread(
        args.memberUserIds,
        args.title,
      );
      const message = await sendDmMessage(myUserId, {
        threadId,
        body: args.body,
      });
      return { threadId, message };
    },
    onSuccess: (d) => {
      if (myUserId) {
        void qc.invalidateQueries({ queryKey: qk.threads(myUserId) });
        void qc.invalidateQueries({ queryKey: qk.messages(d.threadId) });
      }
      void qc.invalidateQueries({ queryKey: qk.unread() });
    },
  });
}

export function useSendBroadcastMutation(
  myUserId: string | null | undefined,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { body: string }) => {
      if (!myUserId) throw new Error("غير مسجّل");
      const threadId = await getBroadcastThreadId();
      return sendDmMessage(myUserId, { threadId, body: args.body });
    },
    onSuccess: (msg) => {
      if (myUserId) {
        void qc.invalidateQueries({ queryKey: qk.threads(myUserId) });
        void qc.invalidateQueries({ queryKey: qk.messages(msg.thread_id) });
      }
      void qc.invalidateQueries({ queryKey: qk.unread() });
    },
  });
}

export function useUpdateDmMessageMutation(
  myUserId: string | null | undefined,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { messageId: string; body: string; threadId: string }) => {
      if (!myUserId) throw new Error("غير مسجّل");
      return updateDmMessage(myUserId, args.messageId, args.body);
    },
    onSuccess: (_d, v) => {
      void qc.invalidateQueries({ queryKey: qk.messages(v.threadId) });
      if (myUserId) {
        void qc.invalidateQueries({ queryKey: qk.threads(myUserId) });
      }
    },
  });
}

export function useDeleteDmMessageMutation(
  myUserId: string | null | undefined,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { messageId: string; threadId: string }) => {
      if (!myUserId) throw new Error("غير مسجّل");
      return softDeleteDmMessage(myUserId, args.messageId);
    },
    onSuccess: (_d, v) => {
      void qc.invalidateQueries({ queryKey: qk.messages(v.threadId) });
      if (myUserId) {
        void qc.invalidateQueries({ queryKey: qk.threads(myUserId) });
      }
      void qc.invalidateQueries({ queryKey: qk.unread() });
    },
  });
}

/** اشتراك real-time: إدراج/تحديث للرسائل */
export function useDmMessagesSubscription(
  myUserId: string | null | undefined,
  open: boolean,
) {
  const qc = useQueryClient();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!myUserId || !open) return;
    const onInvalidate = (row: { thread_id?: string }) => {
      if (row?.thread_id) {
        void qc.invalidateQueries({ queryKey: qk.messages(row.thread_id) });
        void qc.invalidateQueries({ queryKey: qk.threads(myUserId) });
        void qc.invalidateQueries({ queryKey: qk.unread() });
      }
    };
    const ch = supabase
      .channel(`dm-global-${myUserId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "dm_messages",
        },
        (payload) => onInvalidate(payload.new as { thread_id?: string }),
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "dm_messages",
        },
        (payload) => onInvalidate(payload.new as { thread_id?: string }),
      )
      .subscribe();
    channelRef.current = ch;
    return () => {
      void supabase.removeChannel(ch);
      channelRef.current = null;
    };
  }, [myUserId, open, qc]);
}

export {
  otherParticipantId,
  type DmMessageRow,
  type DmThreadRow,
  type DmThreadKind,
};
