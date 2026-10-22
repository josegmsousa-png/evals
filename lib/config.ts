export const APP_NAME = 'Avaliações'
export const AREA = 'MV Dispatch'

export function teamLabel(team: { name: string } | null) {
  return team ? `${AREA} ${team.name}` : AREA
}
