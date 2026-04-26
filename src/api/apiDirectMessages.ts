import { supabase } from "../lib/supabase";

export type DmThreadRow = {
  id: string;
  participant_low: string;
  participant_high: string;
  last_message_at: string | null;
  last_message_preview: string | null;
  last_sender_id: string | null;
  created_at: string;
};

export type DmMessageRow = {
  id: string;
  thread_id: string;
  sender_id: string;
  body: string;
  reply_to_id: string | null;
  created_at: string;
};

export async function getOrCreateDmThread(otherUserId: string): Promise<string> {
  const { data: auth } = await supabase.auth.getUser();
  if (auth.user?.id === otherUserId) {
    throw new Error("لا يمكن اختيار نفسك");
  }
  const { data, error } = await supabase.rpc("get_or_create_dm_thread", {
    p_other_user_id: otherUserId,
  });
  if (error) {
    console.error("get_or_create_dm_thread:", error);
    if (error.code === "42P01" || error.message?.includes("function")) {
      throw new Error(
        "نظام الرسائل غير مفعّل. نفّذ هجرة supabase: dm_threads / get_or_create_dm_thread",
      );
    }
    throw new Error("تعذر فتح الحوار");
  }
  if (data == null || data === "") {
    throw new Error("تعذر فتح الحوار");
  }
  return data as string;
}

export async function listMyDmThreads(
  myUserId: string,
): Promise<DmThreadRow[]> {
  const { data, error } = await supabase
    .from("dm_threads")
    .select(
      "id, participant_low, participant_high, last_message_at, last_message_preview, last_sender_id, created_at",
    )
    .or(`participant_low.eq.${myUserId},participant_high.eq.${myUserId}`);

  if (error) {
    console.error("dm_threads:", error);
    if (error.code === "42P01") {
      throw new Error("جدول الرسائل غير موجود. نفّذ هجرة المشروع.");
    }
    throw new Error("تعذر تحميل الحوارات");
  }
  return (data as DmThreadRow[] | null) ?? [];
}

export function otherParticipantId(thread: DmThreadRow, myUserId: string): string {
  return thread.participant_low === myUserId
    ? thread.participant_high
    : thread.participant_low;
}

export async function getDmMessages(threadId: string): Promise<DmMessageRow[]> {
  const { data, error } = await supabase
    .from("dm_messages")
    .select("id, thread_id, sender_id, body, reply_to_id, created_at")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("dm_messages:", error);
    throw new Error("تعذر تحميل الرسائل");
  }
  return (data as DmMessageRow[] | null) ?? [];
}

export type SendDmParams = {
  threadId: string;
  body: string;
  /** للتحقق من اتساق الواجهة (لا يُرسل للخادم إن لم تُوضَع) */
  replyToId?: string | null;
};

export async function sendDmMessage(
  myUserId: string,
  params: SendDmParams,
): Promise<DmMessageRow> {
  const { threadId, body, replyToId } = params;
  const t = body.trim();
  if (!t) {
    throw new Error("نصّ الرسالة فارغ");
  }
  if (replyToId) {
    const { data: r, error: re } = await supabase
      .from("dm_messages")
      .select("id, thread_id")
      .eq("id", replyToId)
      .maybeSingle();
    if (re || !r || (r as { thread_id: string }).thread_id !== threadId) {
      throw new Error("الرد غير صالح في هذا الحوار");
    }
  }
  const { data, error } = await supabase
    .from("dm_messages")
    .insert({
      thread_id: threadId,
      sender_id: myUserId,
      body: t,
      reply_to_id: replyToId ?? null,
    })
    .select("id, thread_id, sender_id, body, reply_to_id, created_at")
    .single();

  if (error) {
    console.error("insert dm_message:", error);
    throw new Error("تعذر إرسال الرسالة");
  }
  return data as DmMessageRow;
}

/**
 * ينشئ سطر قراءة أو يُحدّث `last_read_at` إلى نهاية آخر الرسائل في الحوار
 */
export async function markDmThreadRead(
  myUserId: string,
  threadId: string,
): Promise<void> {
  const { data: lastRow, error: e1 } = await supabase
    .from("dm_messages")
    .select("created_at")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (e1) {
    console.error(e1);
  }
  const at =
    (lastRow as { created_at?: string } | null)?.created_at ??
    new Date().toISOString();

  const { error: e2 } = await supabase.from("dm_thread_read_state").upsert(
    {
      thread_id: threadId,
      user_id: myUserId,
      last_read_at: at,
    },
    { onConflict: "thread_id,user_id" },
  );
  if (e2) {
    console.error("mark read:", e2);
  }
}

export async function getDmUnreadCount(): Promise<number> {
  const { data, error } = await supabase.rpc("dm_unread_incoming_count_for_me");
  if (error) {
    console.error("dm_unread_incoming_count_for_me:", error);
    return 0;
  }
  if (data == null) return 0;
  const n = Number(data);
  return Number.isFinite(n) ? n : 0;
}

