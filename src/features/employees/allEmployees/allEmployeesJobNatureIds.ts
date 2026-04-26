/**
 * معرّفات `job_nature_id` المستخدمة لتقسيم سجلّات `all_employees`.
 * يجب أن تطابق الصفوف في جدول `job_nature` لديك (صفحة إدارة طبيعة العمل).
 */
export const ALL_EMPLOYEES_JOB_NATURE_ID = {
  employee: 1,
  contractor: 3,
  expert: 2,
} as const;
