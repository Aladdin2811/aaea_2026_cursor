import { supabase } from "../lib/supabase";

export type DmThreadKind = "dm" | "group" | "broadcast";

export type DmThreadRow = {
  id: string;
  participant_low: string | null;
  participant_high: string | null;
  kind: DmThreadKind;
  title: string | null;
  created_by: string | null;
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
  edited_at: string | null;
  deleted_at: string | null;
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

const threadSelect =
  "id, participant_low, participant_high, kind, title, created_by, last_message_at, last_message_preview, last_sender_id, created_at";

/**
 * جداول `kind` + `dm_thread_members` — تتطلب الهجرة 20260429100000.
 * إن وُجدت فقط 1:1: يعمل التصفح على participant_*، والأعضاء يملَؤون بـ trigger.
 */
export async function listMyDmThreads(
  myUserId: string,
): Promise<DmThreadRow[]> {
  const { data: memberRows, error: e0 } = await supabase
    .from("dm_thread_members")
    .select("thread_id")
    .eq("user_id", myUserId);
  if (e0) {
    if (e0.code === "42P01") {
      // هجرة قديمة: 1:1 فقط
      return listMyDmThreadsLegacy1to1Only(myUserId);
    }
    console.error("dm_thread_members:", e0);
    throw new Error("تعذر تحميل الحوارات");
  }

  const { data: broadcast, error: e1 } = await supabase
    .from("dm_threads")
    .select("id")
    .eq("kind", "broadcast")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (e1) {
    console.error("broadcast thread:", e1);
  }

  const ids = new Set<string>();
  (memberRows ?? []).forEach((r) => {
    if ((r as { thread_id?: string }).thread_id) {
      ids.add((r as { thread_id: string }).thread_id);
    }
  });
  const bId = (broadcast as { id?: string } | null)?.id;
  if (bId) ids.add(bId);
  if (ids.size === 0) return [];

  const { data, error } = await supabase
    .from("dm_threads")
    .select(threadSelect)
    .in("id", [...ids]);

  if (error) {
    if (error.message?.includes("column") && error.message?.includes("kind")) {
      return listMyDmThreadsLegacy1to1Only(myUserId);
    }
    console.error("dm_threads:", error);
    if (error.code === "42P01") {
      throw new Error("جدول الرسائل غير موجود. نفّذ هجرة المشروع.");
    }
    throw new Error("تعذر تحميل الحوارات");
  }
  return (data as DmThreadRow[] | null) ?? [];
}

/** قبل هجرة `kind` — 1:1 فقط. */
async function listMyDmThreadsLegacy1to1Only(
  myUserId: string,
): Promise<DmThreadRow[]> {
  const { data, error } = await supabase
    .from("dm_threads")
    .select(
      "id, participant_low, participant_high, last_message_at, last_message_preview, last_sender_id, created_at",
    )
    .or(
      `participant_low.eq.${myUserId},participant_high.eq.${myUserId}`,
    );
  if (error) {
    console.error("dm_threads legacy:", error);
    throw new Error("تعذر تحميل الحوارات");
  }
  return ((data as unknown) as (Omit<DmThreadRow, "kind" | "title" | "created_by"> & {
    kind?: DmThreadKind;
    title?: null;
    created_by?: null;
  })[] | null)?.map((r) => ({
    ...r,
    kind: (r as { kind?: DmThreadKind }).kind ?? "dm",
    title: (r as { title?: null }).title ?? null,
    created_by: (r as { created_by?: null }).created_by ?? null,
  } as DmThreadRow)) ?? [];
}

export function otherParticipantId(
  thread: DmThreadRow,
  myUserId: string,
): string | null {
  if (thread.kind && thread.kind !== "dm") return null;
  if (thread.participant_low == null || thread.participant_high == null) {
    return null;
  }
  return thread.participant_low === myUserId
    ? thread.participant_high
    : thread.participant_low;
}

export async function listThreadMembersUserIds(
  threadIds: string[],
): Promise<Map<string, string[]>> {
  const m = new Map<string, string[]>();
  if (threadIds.length === 0) return m;
  const { data, error } = await supabase
    .from("dm_thread_members")
    .select("thread_id, user_id")
    .in("thread_id", threadIds);
  if (error) {
    if (error.code === "42P01") return m;
    console.error("listThreadMembersUserIds:", error);
    return m;
  }
  (data ?? []).forEach((r) => {
    const row = r as { thread_id: string; user_id: string };
    if (!m.has(row.thread_id)) m.set(row.thread_id, []);
    m.get(row.thread_id)!.push(row.user_id);
  });
  return m;
}

export async function getBroadcastThreadId(): Promise<string> {
  const { data, error } = await supabase.rpc("get_broadcast_thread_id");
  if (error) {
    console.error("get_broadcast_thread_id:", error);
    if (error.code === "PGRST202" || error.message?.includes("function")) {
      const { data: b } = await supabase
        .from("dm_threads")
        .select("id")
        .eq("kind", "broadcast")
        .limit(1)
        .maybeSingle();
      const id = (b as { id?: string } | null)?.id;
      if (id) return id;
    }
    throw new Error("تعيين خيط «للجميع» غير مكتمل. نفّذ هجرة الرسائل.");
  }
  if (data == null || data === "")
    throw new Error("تعيين خيط «للجميع» غير مكتمل.");
  return data as string;
}

export async function createGroupThread(
  memberUserIds: string[],
  title: string | null,
): Promise<string> {
  const { data, error } = await supabase.rpc("create_group_thread", {
    p_member_ids: memberUserIds,
    p_title: title?.trim() ? title.trim() : null,
  });
  if (error) {
    console.error("create_group_thread:", error);
    throw new Error(
      (error as { message?: string })?.message ?? "تعذر إنشاء المحادثة الجماعية",
    );
  }
  if (data == null || data === "") throw new Error("تعذر إنشاء المحادثة");
  return data as string;
}

export async function getDmMessages(threadId: string): Promise<DmMessageRow[]> {
  const { data, error } = await supabase
    .from("dm_messages")
    .select(
      "id, thread_id, sender_id, body, reply_to_id, created_at, edited_at, deleted_at",
    )
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });

  if (error) {
    if (error.message?.includes("deleted_at") || error.message?.includes("edited_at")) {
      return getDmMessagesWithoutEditCols(threadId);
    }
    console.error("dm_messages:", error);
    throw new Error("تعذر تحميل الرسائل");
  }
  return (data as DmMessageRow[] | null) ?? [];
}

async function getDmMessagesWithoutEditCols(
  threadId: string,
): Promise<DmMessageRow[]> {
  const { data, error } = await supabase
    .from("dm_messages")
    .select("id, thread_id, sender_id, body, reply_to_id, created_at")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });
  if (error) {
    console.error("dm_messages (legacy):", error);
    throw new Error("تعذر تحميل الرسائل");
  }
  return ((data as unknown) as (Omit<DmMessageRow, "edited_at" | "deleted_at">)[] | null)?.map(
    (r) => ({ ...r, edited_at: null, deleted_at: null }),
  ) ?? [];
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
      .select("id, thread_id, deleted_at")
      .eq("id", replyToId)
      .maybeSingle();
    if (re || !r) {
      throw new Error("الرد غير صالح");
    }
    const row = r as { thread_id: string; deleted_at?: string | null };
    if (row.thread_id !== threadId) {
      throw new Error("الرد غير صالح في هذا الحوار");
    }
    if (row.deleted_at) {
      throw new Error("لا يمكن الرد على رسالة حُذفت");
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
    .select("id, thread_id, sender_id, body, reply_to_id, created_at, edited_at, deleted_at")
    .single();

  if (error) {
    if (error.message?.includes("edited_at") || error.message?.includes("deleted_at")) {
      return sendDmMessageInsertLegacyOnlyCols(myUserId, params);
    }
    console.error("insert dm_message:", error);
    throw new Error("تعذر إرسال الرسالة");
  }
  return data as DmMessageRow;
}

async function sendDmMessageInsertLegacyOnlyCols(
  myUserId: string,
  params: SendDmParams,
): Promise<DmMessageRow> {
  const { threadId, body, replyToId } = params;
  const t = body.trim();
  if (!t) {
    throw new Error("نصّ الرسالة فارغ");
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
    console.error("insert dm_message legacy:", error);
    throw new Error("تعذر إرسال الرسالة");
  }
  const d = data as DmMessageRow;
  return { ...d, edited_at: null, deleted_at: null };
}

export async function updateDmMessage(
  myUserId: string,
  messageId: string,
  body: string,
): Promise<DmMessageRow> {
  const t = body.trim();
  if (!t) throw new Error("نصّ الرسالة فارغ");
  const { data, error } = await supabase
    .from("dm_messages")
    .update({ body: t, edited_at: new Date().toISOString() })
    .eq("id", messageId)
    .eq("sender_id", myUserId)
    .is("deleted_at", null)
    .select("id, thread_id, sender_id, body, reply_to_id, created_at, edited_at, deleted_at")
    .single();
  if (error) {
    console.error("update dm_message:", error);
    throw new Error("تعذر تعديل الرسالة");
  }
  return data as DmMessageRow;
}

export async function softDeleteDmMessage(
  myUserId: string,
  messageId: string,
): Promise<void> {
  const { error } = await supabase
    .from("dm_messages")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", messageId)
    .eq("sender_id", myUserId)
    .is("deleted_at", null);
  if (error) {
    console.error("delete dm_message:", error);
    throw new Error("تعذر حذف الرسالة");
  }
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
    console.error("mark read select:", e1);
  }
  const at =
    (lastRow as { created_at?: string } | null)?.created_at ??
    new Date().toISOString();
  const { error: e2 } = await supabase.from("dm_thread_read_state").upsert(
    { thread_id: threadId, user_id: myUserId, last_read_at: at },
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
