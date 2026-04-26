import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";
import {
  getDmMessages,
  getDmUnreadCount,
  getOrCreateDmThread,
  listMyDmThreads,
  markDmThreadRead,
  otherParticipantId,
  sendDmMessage,
  type DmMessageRow,
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

export type DmThreadWithMeta = {
  thread: DmThreadRow;
  other: UserProfileRow | null;
  isUnread: boolean;
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
      const ordered = sortThreads(list);
      const otherIds = ordered.map((t) => otherParticipantId(t, myUserId));
      const { data: readState } = await supabase
        .from("dm_thread_read_state")
        .select("thread_id, last_read_at")
        .eq("user_id", myUserId)
        .in("thread_id", list.map((x) => x.id));
      const readMap = new Map(
        (readState ?? []).map(
          (r) => [r.thread_id, r.last_read_at as string] as [string, string],
        ),
      );
      if (otherIds.length === 0) return [] as DmThreadWithMeta[];
      const profiles = await getUserProfilesByIds(otherIds);
      const profileById = new Map(
        profiles.map((p) => [p.id, p] as [string, UserProfileRow]),
      );
      return ordered.map((thread) => {
        const oid = otherParticipantId(thread, myUserId);
        return {
          thread,
          other: profileById.get(oid) ?? null,
          isUnread: hookUnreadInThread(
            thread,
            myUserId,
            readMap.get(thread.id) ?? null,
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

/** اشتراك real-time في إدراج الرسائل */
export function useDmMessagesSubscription(
  myUserId: string | null | undefined,
  open: boolean,
) {
  const qc = useQueryClient();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!myUserId || !open) return;
    const ch = supabase
      .channel(`dm-global-${myUserId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "dm_messages",
        },
        (payload) => {
          const row = payload.new as { thread_id?: string };
          if (row?.thread_id) {
            void qc.invalidateQueries({ queryKey: qk.messages(row.thread_id) });
            void qc.invalidateQueries({ queryKey: qk.threads(myUserId) });
            void qc.invalidateQueries({ queryKey: qk.unread() });
          }
        },
      )
      .subscribe();
    channelRef.current = ch;
    return () => {
      void supabase.removeChannel(ch);
      channelRef.current = null;
    };
  }, [myUserId, open, qc]);
}

export { otherParticipantId, type DmMessageRow, type DmThreadRow };
