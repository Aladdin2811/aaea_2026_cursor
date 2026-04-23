/** قيَم JSON/PostgREST قد لا تكون نصاً */
export function stringValue(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return String(value);
}

export function formatOptionalText(value: unknown): string {
  const s = stringValue(value).trim();
  return s === "" ? "—" : s;
}
