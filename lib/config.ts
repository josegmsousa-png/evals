export const APP_NAME = 'Avaliações'
export const AREA = 'MV/LV Dispatch'

// Nome mostrado de cada equipa: "MV Dispatch Tejo", "LV Dispatch"…
export function teamLabel(team: { name: string; label?: string } | null) {
  if (!team) return AREA
  return team.label || `MV Dispatch ${team.name}`
}
