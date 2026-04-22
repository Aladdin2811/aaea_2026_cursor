import type { Members } from '../types/members'

/**
 * دول جامعة الدول العربية (22) مع بيانات تجريبية.
 * org_member: عضوية الهيئة العربية للطاقة الذرية (قائمة مرجعية شائعة — 14 دولة).
 * يُراجع رسمياً ويُستبدل من Supabase لاحقاً.
 */
const AAEA_MEMBERS = new Set([
  'BH',
  'EG',
  'IQ',
  'JO',
  'KW',
  'LB',
  'LY',
  'MR',
  'PS',
  'SA',
  'SD',
  'SY',
  'TN',
  'YE',
])

/** نسب توضيحية لأعضاء الهيئة فقط (مجموعها ≈ 100) */
const DEMO_CONTRIBUTION: Record<string, number> = {
  BH: 7.0,
  EG: 9.5,
  IQ: 7.2,
  JO: 7.5,
  KW: 7.8,
  LB: 6.8,
  LY: 6.5,
  MR: 6.0,
  PS: 6.0,
  SA: 9.0,
  SD: 6.5,
  SY: 6.0,
  TN: 8.0,
  YE: 6.2,
}

const rows: Pick<Members, 'id' | 'flag' | 'member_name' | 'sort_order'>[] = [
  { id: 'dz', flag: 'DZ', member_name: 'الجزائر', sort_order: 1 },
  { id: 'bh', flag: 'BH', member_name: 'البحرين', sort_order: 2 },
  { id: 'km', flag: 'KM', member_name: 'جزر القمر', sort_order: 3 },
  { id: 'dj', flag: 'DJ', member_name: 'جيبوتي', sort_order: 4 },
  { id: 'eg', flag: 'EG', member_name: 'مصر', sort_order: 5 },
  { id: 'iq', flag: 'IQ', member_name: 'العراق', sort_order: 6 },
  { id: 'jo', flag: 'JO', member_name: 'الأردن', sort_order: 7 },
  { id: 'kw', flag: 'KW', member_name: 'الكويت', sort_order: 8 },
  { id: 'lb', flag: 'LB', member_name: 'لبنان', sort_order: 9 },
  { id: 'ly', flag: 'LY', member_name: 'ليبيا', sort_order: 10 },
  { id: 'mr', flag: 'MR', member_name: 'موريتانيا', sort_order: 11 },
  { id: 'ma', flag: 'MA', member_name: 'المغرب', sort_order: 12 },
  { id: 'om', flag: 'OM', member_name: 'عُمان', sort_order: 13 },
  { id: 'ps', flag: 'PS', member_name: 'فلسطين', sort_order: 14 },
  { id: 'qa', flag: 'QA', member_name: 'قطر', sort_order: 15 },
  { id: 'sa', flag: 'SA', member_name: 'المملكة العربية السعودية', sort_order: 16 },
  { id: 'so', flag: 'SO', member_name: 'الصومال', sort_order: 17 },
  { id: 'sd', flag: 'SD', member_name: 'السودان', sort_order: 18 },
  { id: 'sy', flag: 'SY', member_name: 'سوريا', sort_order: 19 },
  { id: 'tn', flag: 'TN', member_name: 'تونس', sort_order: 20 },
  { id: 'ae', flag: 'AE', member_name: 'الإمارات العربية المتحدة', sort_order: 21 },
  { id: 'ye', flag: 'YE', member_name: 'اليمن', sort_order: 22 },
]

function demoNotes(flag: string, isMember: boolean): string {
  if (!isMember) return '—'
  if (flag === 'TN') return 'مقر الهيئة الدائم (تونس).'
  return ''
}

export const initialMemberCountries: Members[] = rows.map((r) => {
  const org_member = AAEA_MEMBERS.has(r.flag)
  return {
    id: r.id,
    sort_order: r.sort_order,
    member_name: r.member_name,
    member_notes: demoNotes(r.flag, org_member),
    member_ratio: org_member ? (DEMO_CONTRIBUTION[r.flag] ?? null) : null,
    reservation_ratio: 0,
    holde: 0,
    org_member,
    flag: r.flag,
    status: true,
  }
})

/** قيم التبديل لـ «عضو بالهيئة» — تبقى متوافقة مع المنطق السابق عند المزامنة مع قاعدة البيانات */
export function getAgencyTogglePatch(
  rowId: string,
  checked: boolean,
): Partial<Members> {
  const init = initialMemberCountries.find((x) => x.id === rowId)
  if (!checked) {
    return { org_member: false, member_ratio: null, member_notes: '—' }
  }
  if (!init) {
    return { org_member: true, member_ratio: 7, member_notes: '' }
  }
  const wasOriginal = init.org_member
  return {
    org_member: true,
    member_ratio: wasOriginal ? init.member_ratio : 7,
    member_notes: wasOriginal
      ? init.member_notes
      : init.flag === 'TN'
        ? 'مقر الهيئة الدائم (تونس).'
        : '',
  }
}
