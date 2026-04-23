import { supabase } from "../lib/supabase";

export type MemberRow = {
  id: number;
  member_name: string | null;
  member_notes: string | null;
  member_ratio: number | null;
  reservation_ratio: number | null;
  holde: unknown;
  org_member: boolean | null;
  flag: string | null;
  status: boolean | null;
};

export async function getAll(): Promise<MemberRow[]> {
  const { data, error } = await supabase
    .from("members")
    .select(
      `
      id,
      member_name,
      member_notes,
      member_ratio, 
      reservation_ratio, 
      holde, 
      org_member, 
      flag, 
      status
      `,
    )
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(
      "لا يمكن الحصول على بيانات الدول الأعضاء بجامعة الدول العربية",
    );
  }
  return (data as MemberRow[] | null) ?? [];
}

export async function orgMember(): Promise<MemberRow[]> {
  const { data, error } = await supabase
    .from("members")
    .select(
      `
      id,
      member_name,
      member_notes,
      member_ratio, 
      reservation_ratio, 
      holde, 
      org_member, 
      flag, 
      status
      `,
    )
    .eq("org_member", true)
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(
      "لا يمكن الحصول على بيانات الدول الأعضاء بجامعة الدول العربية",
    );
  }
  return (data as MemberRow[] | null) ?? [];
}
