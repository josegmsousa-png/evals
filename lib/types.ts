export type Profile = {
  id: string
  email: string
  name: string
  role: 'admin' | 'engineer'
  active: boolean
  must_change_password: boolean
  team_id: string | null // null = administrador global
}

export type Team = { id: string; name: string; position: number; label?: string }

export type Technician = { id: string; name: string; active: boolean; team_id: string }

export type Period = { id: string; name: string; deadline: string; team_id: string }

export type Criterion = {
  id: string
  period_id: string
  position: number
  name: string
  description: string
  weight: number
}

export type CriterionScore = { level: number | null; comment: string }

export type Evaluation = {
  id: string
  period_id: string
  engineer_id: string
  technician_id: string
  scores: Record<string, CriterionScore>
  submitted: boolean
  updated_at: string
}
