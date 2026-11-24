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
  /** Окно отметки открыто (пн–пт). В выходные — false, вопросы не приходят. */
  checkin_open?: boolean
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
  /** Окно отметки открыто (пн–пт). В выходные — false. */
  checkin_open?: boolean
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
  attendance_today: string
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

// ─── Админская сводка ─────────────────────────────────────────────────────────

export interface AdminWarmupChild {
  child_id: number
  full_name: string
  codename: string
  /** Сколько вопросов разминки ребёнок ответил сегодня. */
  answers: number
  completed_at: string
  mood: number
  energy: number
  pain: number
  needs_attention: boolean
  attendance: string
}

export interface AdminWarmupGroup {
  team_id: number
  name: string
  /** Игроков в группе (с профилем агента). */
  participants: number
  answered: number
  children: AdminWarmupChild[]
}

export interface AdminWarmup {
  day_key: string
  mission_id: number
  theme: string
  weekday: number
  answered: number
  participants: number
  groups: AdminWarmupGroup[]
}

// ─── Воскресный квиз (зачёт общий с ботом) ────────────────────────────────────

export interface QuizSeason {
  id: number
  name: string
  weeks: number
  current_week: number
  playable_from: number
  playable_to: number
  frozen: boolean
  over: boolean
}

export interface QuizParticipant {
  id: number
  category: string
  category_title: string
  points: number
  place: number
  place_total: number
  pending_category?: string
  pending_from_week?: number
  category_locked: boolean
}

export interface QuizJoinOption {
  code: string
  title: string
  recommended: boolean
}

export interface QuizJoin {
  allowed: QuizJoinOption[]
  needs_dob: boolean
  not_published: boolean
}

export interface QuizOffer {
  direction: 'up' | 'down'
  target_category: string
  target_title: string
  from_week: number
  points_now: number
  points_after: number
}

export type QuizWeekStatus = 'open' | 'in_progress' | 'finished' | 'closed'

export interface QuizWeek {
  week: number
  status: QuizWeekStatus
  pos: number
  correct: number
  total: number
}

export interface QuizState {
  season: QuizSeason
  participant: QuizParticipant | null
  join: QuizJoin | null
  weeks: QuizWeek[]
  offer: QuizOffer | null
}

export interface QuizQuestion {
  pos: number
  question_id: number
  text: string
  options: string[]
  has_image: boolean
  total: number
}

export interface QuizMedia {
  type: 'photo' | 'video'
  question_id: number
  kind: 'question' | 'answer'
}

export interface QuizWeekResult {
  week: number
  correct: number
  total: number
  points: number
  place: number
  place_total: number
  xp_granted: number
  offer: QuizOffer | null
}

export interface QuizStart {
  attempt_id: number
  week: number
  category: string
  category_title: string
  pos: number
  total: number
  finished: boolean
  question?: QuizQuestion
  result?: QuizWeekResult
}

export interface QuizAnswer {
  is_correct: boolean
  correct_idx: number
  chosen_idx: number
  explanation: string
  option_note: string
  finished: boolean
  points: number
  place: number
  place_total: number
  answer_media?: QuizMedia
  next_question?: QuizQuestion
  result?: QuizWeekResult
}

export interface QuizReviewItem {
  pos: number
  question_id: number
  text: string
  options: string[]
  has_image: boolean
  answered: boolean
  chosen_idx: number | null
  correct_idx: number | null
  is_correct: boolean | null
  explanation?: string
  option_note?: string
  answer_media?: QuizMedia
}

export interface QuizReview {
  week: number
  finished: boolean
  correct: number
  total: number
  items: QuizReviewItem[]
  result?: QuizWeekResult
}

export interface QuizLeaderboardItem {
  place: number
  name: string
  points: number
  is_me: boolean
}

export interface QuizLeaderboard {
  category: string
  title: string
  current_week: number
  weeks: number
  season_over: boolean
  total: number
  items: QuizLeaderboardItem[]
  me: QuizLeaderboardItem | null
}

export interface QuizLevelResult {
  accepted: boolean
  category: string
  pending_category?: string
  pending_from_week?: number
  points_after?: number
}

// ─── Командная таблица XP ─────────────────────────────────────────────────────

export interface TeamBoardItem {
  place: number
  name: string
  xp: number
  is_me: boolean
}

export interface TeamBoard {
  team_name: string
  total: number
  items: TeamBoardItem[]
  me: TeamBoardItem | null
}