// Код игрока — 10 символов Crockford base32 (без I, L, O, U).
// Принимаются только латинские буквы и цифры: кириллица и прочие символы
// отбрасываются на вводе, чтобы русская раскладка не превращалась в другой код.

/** Приводит ввод к каноническому виду кода: до 10 символов A-Z и 0-9. */
export function normalizeAgentCode(raw: string | null | undefined): string {
  if (!raw) return ''
  const upper = raw.toUpperCase()
  let out = ''
  for (const ch of upper) {
    if (!/^[A-Z0-9]$/.test(ch)) continue
    let c = ch
    if (c === 'O') c = '0'
    else if (c === 'I' || c === 'L') c = '1'
    out += c
    if (out.length === 10) break
  }
  return out
}

/**
 * Код в виде поля ввода: группы разделены дефисами, и завершённая группа
 * закрывается дефисом — видно, где группа кончается и где ждёт следующая буква.
 * Например: 2AW5- | 83GT- | PV.
 */
export function formatAgentCode(raw: string | null | undefined): string {
  const c = normalizeAgentCode(raw)
  if (c.length <= 4) return c.length === 4 ? `${c}-` : c
  if (c.length <= 8) return `${c.slice(0, 4)}-${c.slice(4)}${c.length === 8 ? '-' : ''}`
  return `${c.slice(0, 4)}-${c.slice(4, 8)}-${c.slice(8)}`
}
