import supabase from "./supabase";

export async function getAll() {
  const { data, error } = await supabase
    .from("account_type")
    .select(
      `
      id, 
      account_type_name, 
      status
      `
    )
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("لا يمكن الحصول على أنواع الحسابات");
  }
  return data;
}