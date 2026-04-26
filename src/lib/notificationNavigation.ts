import {
  NOTIFICATION_CATEGORIES,
  type InAppNotificationRow,
} from "../api/apiInAppNotifications";

/**
 * تحويل تنبيه لمسار داخل التطبيق عند الضغط. أضف فروعاً لكل
 * (category, ref_type) تدعمه الواجهات.
 */
export function getHrefForInAppNotification(
  n: Pick<InAppNotificationRow, "category" | "ref_type" | "ref_id">,
): string | null {
  if (
    n.category === NOTIFICATION_CATEGORIES.vacationApproval &&
    n.ref_type === "vacation" &&
    n.ref_id
  ) {
    return `/administrative_management/vacations?highlight=${encodeURIComponent(n.ref_id)}`;
  }
  return null;
}
