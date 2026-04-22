/** صف من جدول member_countries (واجهة التطبيق بأسماء الحقول الموحّدة) */
export type Members = {
  id: string
  sort_order: number
  member_name: string
  member_notes: string
  /** نسبة المساهمة (من contribution_percent) */
  member_ratio: number | null
  reservation_ratio: number
  holde: number
  org_member: boolean
  /** رمز الدولة ISO2 (من iso2) */
  flag: string
  status: boolean
}
