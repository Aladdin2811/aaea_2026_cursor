import { supabase } from '../lib/supabase'
import type { Members } from '../types/members'

type MemberCountryRow = {
  id: string
  iso2: string
  name_ar: string
  sort_order: number
  contribution_percent: number | null
  notes: string | null
  is_agency_member: boolean
}

function rowToMember(row: MemberCountryRow): Members {
  return {
    id: row.id,
    sort_order: row.sort_order,
    member_name: row.name_ar,
    member_notes: row.notes ?? '',
    member_ratio:
      row.contribution_percent === null ? null : Number(row.contribution_percent),
    reservation_ratio: 0,
    holde: 0,
    org_member: row.is_agency_member,
    flag: row.iso2,
    status: true,
  }
}

export async function fetchMemberCountries(): Promise<Members[]> {
  const { data, error } = await supabase
    .from('member_countries')
    .select(
      'id, iso2, name_ar, sort_order, contribution_percent, notes, is_agency_member',
    )
    .order('sort_order', { ascending: true })

  if (error) throw error
  return (data as MemberCountryRow[]).map(rowToMember)
}

function toDbPatch(patch: Partial<Members>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  if (patch.sort_order !== undefined) out.sort_order = patch.sort_order
  if (patch.flag !== undefined) out.iso2 = patch.flag
  if (patch.member_name !== undefined) out.name_ar = patch.member_name
  if (patch.member_ratio !== undefined) {
    out.contribution_percent = patch.member_ratio
  }
  if (patch.member_notes !== undefined) out.notes = patch.member_notes
  if (patch.org_member !== undefined) out.is_agency_member = patch.org_member
  return out
}

export async function updateMemberCountry(
  id: string,
  patch: Partial<Members>,
): Promise<void> {
  const dbPatch = toDbPatch(patch)
  if (Object.keys(dbPatch).length === 0) return

  const { error } = await supabase.from('member_countries').update(dbPatch).eq('id', id)

  if (error) throw error
}
