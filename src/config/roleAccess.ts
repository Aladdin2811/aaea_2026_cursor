/**
 * التحكم في من يصل إلى «المستخدمين» وتعديل أدوارهم.
 *
 * - عند `false`: أي مستخدم مسجّل يصل للصفحة (مناسب للتجربة أو قبل ضبط الأدوار).
 * - عند `true`: يُسمح فقط لمن `role_id` في الجدول أدناه (من جدول `roles`).
 *
 * بعد أول تشغيل لـ SQL الخاص بـ `user_profiles`، عيّن `role_id` لمستخدمك في الجدول
 * أو في User metadata (`role_id`) ليطابق أحد المعرفات هنا.
 */
export const ENABLE_USER_MANAGEMENT_ACCESS_CONTROL = false;

/** معرفات الأدوار من `public.roles.id` المسموح لها بإدارة المستخدمين */
export const USER_MANAGEMENT_ROLE_IDS: readonly number[] = [1];

export function canManageUsers(roleId: number | null): boolean {
  if (!ENABLE_USER_MANAGEMENT_ACCESS_CONTROL) return true;
  if (roleId == null) return false;
  return USER_MANAGEMENT_ROLE_IDS.includes(roleId);
}
