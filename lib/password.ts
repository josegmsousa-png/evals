// Palavra-passe temporária fácil de ditar: ex. "Aval-4821-kq"
export function tempPassword() {
  const n = Math.floor(1000 + Math.random() * 9000)
  const letters = 'abcdefghjkmnpqrstuvwxyz'
  const l = () => letters[Math.floor(Math.random() * letters.length)]
  return `Aval-${n}-${l()}${l()}`
}

export const MIN_PASSWORD = 8
