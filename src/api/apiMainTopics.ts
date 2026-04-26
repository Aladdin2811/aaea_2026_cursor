import { supabase } from "../lib/supabase";

export type MainTopicsRow = {
  id: number;
  main_topic_name: string | null;
};

/** شكل العلاقة المضمّنة في استعلامات أخرى (`main_topics (...)`) */
export type MainTopicsEmbedded = Pick<MainTopicsRow, "id" | "main_topic_name">;

export type CreateMainTopicsInput = Partial<Omit<MainTopicsRow, "id">> & {
  id?: number;
};

export type UpdateMainTopicsInput = Partial<Omit<MainTopicsRow, "id">>;

const tableName = "main_topics" as const;

const selectMainTopics = `
  id,
  main_topic_name
`;

function parseNumericId(
  value: number | string,
  fieldLabel = "المعرّف",
): number {
  const n = typeof value === "string" ? Number(value) : value;
  if (typeof n !== "number" || !Number.isFinite(n)) {
    throw new Error(`${fieldLabel} غير صالح`);
  }
  return n;
}

async function nextMainTopicsId(): Promise<number> {
  const { data: maxData, error: maxError } = await supabase
    .from(tableName)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    throw new Error("خطأ أثناء جلب أكبر معرّف للموضوع الرئيسي");
  }
  return maxData != null && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;
}

export async function getAll(): Promise<MainTopicsRow[]> {
  const { data, error } = await supabase
    .from(tableName)
    .select(selectMainTopics)
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على بيانات المواضيع الرئيسية");
  }
  return (data as unknown as MainTopicsRow[] | null) ?? [];
}

export async function getById(id: number | string): Promise<MainTopicsRow> {
  const rowId = parseNumericId(id, "رقم الموضوع الرئيسي");

  const { data, error } = await supabase
    .from(tableName)
    .select(selectMainTopics)
    .eq("id", rowId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("لا يمكن الحصول على بيانات الموضوع الرئيسي");
  }
  return data as unknown as MainTopicsRow;
}

export async function createMainTopics(
  input: CreateMainTopicsInput,
): Promise<MainTopicsRow> {
  const { id: explicitId, ...fields } = input;
  const nextId =
    explicitId != null && Number.isFinite(Number(explicitId))
      ? Number(explicitId)
      : await nextMainTopicsId();

  const { data, error } = await supabase
    .from(tableName)
    .insert({ id: nextId, ...fields })
    .select(selectMainTopics)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "لا يمكن تسجيل الموضوع الرئيسي");
  }
  return data as unknown as MainTopicsRow;
}

export async function updateMainTopics(
  id: number | string,
  patch: UpdateMainTopicsInput,
): Promise<MainTopicsRow> {
  const rowId = parseNumericId(id, "رقم الموضوع الرئيسي");

  const { data, error } = await supabase
    .from(tableName)
    .update({ ...patch })
    .eq("id", rowId)
    .select(selectMainTopics)
    .single();

  if (error) {
    console.error(error);
    throw new Error("حدث خطأ عند تعديل الموضوع الرئيسي");
  }
  return data as unknown as MainTopicsRow;
}

export async function deleteMainTopics(id: number | string): Promise<unknown> {
  const rowId = parseNumericId(id, "رقم الموضوع الرئيسي");

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", rowId);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("حدث خطأ عند حذف الموضوع الرئيسي");
  }
  return data;
}
