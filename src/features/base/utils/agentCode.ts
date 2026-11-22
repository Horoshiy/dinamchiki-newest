// Код игрока — 10 символов алфавита Crockford (без O, I, L).
// Клиент приводит ввод к тому же виду, что принимает сервер: заглавные буквы,
// кириллические двойники → латинские, O → 0, I/L → 1. Иначе ребёнок с русской
// раскладкой вводит код и ничего не происходит, а счётчик символов не растёт.

const CYRILLIC_LOOKALIKES: Record<string, string> = {
  'А': 'A', 'В': 'B', 'Е': 'E', 'К': 'K', 'М': 'M', 'Н': 'H', 'О': 'O',
  'Р': 'P', 'С': 'C', 'Т': 'T', 'У': 'Y', 'Х': 'X', 'Ѕ': 'S', 'І': 'I',
  'Ј': 'J', 'Ү': 'Y', 'Ԛ': 'Q', 'Ԝ': 'W',
}

/** Приводит любой ввод к каноническому виду кода: до 10 символов A-Z и 0-9. */
export function normalizeAgentCode(raw: string | null | undefined): string {
  if (!raw) return ''
  const upper = raw.toUpperCase()
  let out = ''
  for (const ch of upper) {
    let c = CYRILLIC_LOOKALIKES[ch] ?? ch
    if (c === 'O') c = '0'
    else if (c === 'I' || c === 'L') c = '1'
    if (!/^[A-Z0-9]$/.test(c)) continue
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
