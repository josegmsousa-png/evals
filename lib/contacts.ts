// Lê listas coladas do Outlook: "NOME" <email>; Nome <email>; email; "Nome, email" por linha
export type Contact = { name: string; email: string }

const EMAIL = /[^\s<>"';,]+@[^\s<>"';,]+\.[^\s<>"';,]+/
const LOWER = new Set(['de', 'da', 'do', 'das', 'dos', 'e'])

// "RICARDO FRANCA GONÇALVES" → "Ricardo Franca Gonçalves"
export function titleCase(name: string) {
  return name.toLocaleLowerCase('pt-PT').split(/\s+/).filter(Boolean)
    .map((w, i) => (i > 0 && LOWER.has(w) ? w : w[0].toLocaleUpperCase('pt-PT') + w.slice(1)))
    .join(' ')
}

export function parseContacts(text: string): Contact[] {
  const seen = new Set<string>()
  const out: Contact[] = []
  for (const part of text.split(/[;\n]+/)) {
    const match = part.match(EMAIL)
    if (!match) continue
    const email = match[0].toLowerCase()
    if (seen.has(email)) continue
    seen.add(email)
    const raw = part.replace(match[0], '').replace(/[<>"',]/g, ' ').trim()
    out.push({ name: raw ? titleCase(raw) : '', email })
  }
  return out
}
