/** ISO 3166-1 alpha-2 → regional indicator flag emoji */
export function flagEmojiFromIso2(code: string): string {
  const upper = code.trim().toUpperCase()
  if (upper.length !== 2) return '🏳️'
  const base = 0x1f1e6
  const a = upper.codePointAt(0)! - 65
  const b = upper.codePointAt(1)! - 65
  if (a < 0 || a > 25 || b < 0 || b > 25) return '🏳️'
  return String.fromCodePoint(base + a, base + b)
}
