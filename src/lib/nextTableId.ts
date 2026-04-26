import { supabase } from "./supabase";

/**
 * يحدد المعرف التالي لصف جديد: أكبر قيمة لعمود `id` في الجدول + 1،
 * أو `1` إذا كان الجدول فارغاً أو القيمة غير رقمية.
 *
 * لا يعتمد على التسلسل التلقائي (serial/identity) في قاعدة البيانات.
 */
export async function getNextTableId(tableName: string): Promise<number> {
  const { data, error } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (error) {
    console.error(`getNextTableId(${tableName}):`, error);
    throw new Error(`تعذر تحديد المعرف التالي للجدول`);
  }

  const rows = data as unknown as { id: number | string | null }[] | null;
  const raw = rows?.[0]?.id;
  const n =
    typeof raw === "number"
      ? raw
      : typeof raw === "string"
        ? Number(raw)
        : Number.NaN;
  if (raw === undefined || raw === null || !Number.isFinite(n)) {
    return 1;
  }
  return Math.trunc(n) + 1;
}
