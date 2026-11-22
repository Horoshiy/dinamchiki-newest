// Типы ответов «Подтрибунки» — зеркалят JSON бэкенда (docs/api/base.yaml).

export interface AnswerInput {
  question_id: number
  value_int?: number
  value_text?: string
  values?: string[]
}

export type QuestionKind = 'scale' | 'single' | 'multi' | 'text' | 'body'

export interface BaseQuestion {
  id: number
  template_key: string
  kind: QuestionKind
  text: string
  options: string[]
  is_required: boolean
  max_len: number
  position: number
}

export interface BaseReward {
  motivation: string
  joke: string
  xp_granted: number
  needs_attention: boolean
  attention_message?: string
}

export interface BaseMission {
  mission_id: number
  day_key: string
  weekday: number
  theme: string
  slogan: string
  questions: BaseQuestion[]
  completed: boolean
  draft?: AnswerInput[]
  reward?: BaseReward
}

export interface BaseBadge {
  key: string
  title: string
  description: string
  icon: string
  threshold: number
  earned: boolean
}

export interface RankProgress {
  current: string
  next_title?: string
  next_min_xp?: number
  to_next: number
  maxed: boolean
}

export interface BaseMe {
  child_id: number
  codename: string
  rank: string
  xp: number
  streak_current: number
  streak_best: number
  completed_today: boolean
  needs_attention_today: boolean
  sound_on: boolean
  rank_progress: RankProgress
  badges: BaseBadge[]
  slogan: string
}

export interface SubmitResult {
  already: boolean
  xp_granted: number
  total_xp: number
  streak: number
  streak_best: number
  rank: string
  new_badges: BaseBadge[]
  needs_attention: boolean
  motivation: string
  joke: string
  attention_message?: string
}

export interface RankStep {
  title: string
  min_xp: number
  reached: boolean
  current: boolean
}

export interface DayStat {
  day_key: string
  completed: boolean
}

export interface BaseProgress {
  xp: number
  rank: string
  streak_current: number
  streak_best: number
  missions_total: number
  rank_ladder: RankStep[]
  badges: BaseBadge[]
  calendar: DayStat[]
}

export interface HistoryItem {
  day_key: string
  mood: number
  energy: number
  pain_score: number
  xp_granted: number
  needs_attention: boolean
  completed_at: string
}

export interface HistoryAnswer {
  question_id: number
  template_key: string
  text: string
  kind: QuestionKind
  value_int: number
  value_text: string
  values: string[]
}

export interface HistoryDetail {
  day_key: string
  theme: string
  mood: number
  energy: number
  pain_score: number
  xp_granted: number
  needs_attention: boolean
  reward: BaseReward
  answers: HistoryAnswer[]
}

export interface LoginResponse {
  success: boolean
  token?: string
  child_id?: number
  codename?: string
  rank?: string
  error?: string
}

// ─── Тренерский дашборд ──────────────────────────────────────────────────────

export interface StaffAuthResponse {
  success: boolean
  token?: string
  user_id?: number
  role?: 'coach' | 'admin'
  name?: string
  error?: string
}

export interface StaffChildRow {
  child_id: number
  full_name: string
  codename: string
  rank: string
  xp: number
  streak_current: number
  completed_today: boolean
  needs_attention_today: boolean
  has_code: boolean
  last_mission_date: string
  mood_today: number
  energy_today: number
  pain_today: number
  sleep_today: string
  fuel_today: string[]
}

export interface StaffAnswer {
  template_key: string
  text: string
  kind: QuestionKind
  value_int: number
  value_text: string
  values: string[]
}

export interface StaffSubmission {
  day_key: string
  mood: number
  energy: number
  pain_score: number
  xp_granted: number
  needs_attention: boolean
  completed_at: string
  answers: StaffAnswer[]
}

export interface CoachNote {
  id: number
  text: string
  created_at: string
}

export interface StaffChildDetail {
  child_id: number
  full_name: string
  codename: string
  rank: string
  xp: number
  streak_current: number
  streak_best: number
  has_code: boolean
  badges: BaseBadge[]
  submissions: StaffSubmission[]
  notes: CoachNote[]
}

export interface CodeIssue {
  success: boolean
  child_id: number
  code: string
  hint: string
  login_url: string
  qr_png: string
}

export interface CodeInfo {
  exists: boolean
  hint?: string
  created_at?: string
  last_used_at?: string
  locked: boolean
}

export interface AttentionRow {
  child_id: number
  full_name: string
  day_key: string
  pain_score: number
  completed_at: string
}

export interface ListResponse<T> {
  success: boolean
  items: T[]
  total: number
  limit: number
  offset: number
}