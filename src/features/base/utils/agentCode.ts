// Код игрока — 10 символов алфавита Crockford (без I, L, O, U).
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

/** Расставляет дефисы в виде карточки: XXXX-XXXX-XX. */
export function formatAgentCode(raw: string | null | undefined): string {
  const c = normalizeAgentCode(raw)
  return [c.slice(0, 4), c.slice(4, 8), c.slice(8, 10)].filter(Boolean).join('-')
}
