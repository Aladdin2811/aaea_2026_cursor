import { supabase } from "../lib/supabase";

/** قيم موحّدة لعمود `category` — أضف هنا عند إضافة نوع طلبات اعتماد جديد */
export const NOTIFICATION_CATEGORIES = {
  /** طلبات اعتماد إجازة */
  vacationApproval: "vacation_approval",
  /** مثال لاحق: قيود صرف / تسوية / قرارات */
  // spendRestrictionApproval: "spend_restriction_approval",
} as const;

export type AppNotificationCategory =
  (typeof NOTIFICATION_CATEGORIES)[keyof typeof NOTIFICATION_CATEGORIES] | (string & {});

/** نص يسجّله الموظف عند طلب اعتماد إجازة (يتطابق مع مُشغّل SQL لإفراغ الملاحظة) */
export const VACATION_PENDING_NOTES = "تحت الاعتماد" as const;

export type InAppNotificationRow = {
  id: number;
  recipient_user_id: string;
  category: string;
  title: string;
  body: string | null;
  read_at: string | null;
  created_at: string;
  ref_type: string;
  ref_id: string;
};

const table = "in_app_notifications" as const;

const selectColumns =
  "id, recipient_user_id, category, title, body, read_at, created_at, ref_type, ref_id";

export async function getMyInAppNotifications(): Promise<InAppNotificationRow[]> {
  const { data, error } = await supabase
    .from(table)
    .select(selectColumns)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Supabase in_app_notifications:", error);
    if (error.code === "42P01") {
      throw new Error(
        "جدول in_app_notifications غير موجود. نفّذ هجرات supabase في المشروع.",
      );
    }
    throw new Error("تعذر تحميل التنبيهات");
  }
  return (data as unknown as InAppNotificationRow[] | null) ?? [];
}

export async function getUnreadInAppNotificationCount(): Promise<number> {
  const { count, error } = await supabase
    .from(table)
    .select("id", { count: "exact", head: true })
    .is("read_at", null);

  if (error) {
    console.error(error);
    return 0;
  }
  return count ?? 0;
}

export async function markInAppNotificationRead(id: number): Promise<void> {
  const { error } = await supabase
    .from(table)
    .update({ read_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error(error);
    throw new Error("تعذر تعليم التنبيه كمقروء");
  }
}
