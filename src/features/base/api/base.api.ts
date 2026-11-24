// Эндпоинты «Подтрибунки». Детские вызываются с child-токеном,
// тренерские — со staff-токеном. Идентичность ребёнка сервер берёт из JWT.
import { baseRequest, BaseApiError } from './base.client'
import { appConfig } from '@/app/config/app.config'
import type {
  AnswerInput, AttentionRow, BaseMe, BaseMission, BaseProgress, CodeInfo, CodeIssue,
  HistoryDetail, HistoryItem, ListResponse, LoginResponse, StaffAuthResponse,
  StaffChildDetail, StaffChildRow, SubmitResult, CoachNote, AdminWarmup,
  QuizState, QuizParticipant, QuizStart, QuizAnswer, QuizReview, QuizLeaderboard, QuizLevelResult,
  TeamBoard,
} from './base.types'

// ─── Вход ────────────────────────────────────────────────────────────────────

export function loginWithCode(code: string): Promise<LoginResponse> {
  return baseRequest<LoginResponse>('auth/login', { method: 'POST', body: { code } })
}

export function staffRequestCode(phone: string): Promise<{ success: boolean }> {
  return baseRequest('staff/auth/request-code', { method: 'POST', body: { phone } })
}

export function staffVerify(phone: string, code: string): Promise<StaffAuthResponse> {
  return baseRequest<StaffAuthResponse>('staff/auth/verify', {
    method: 'POST', body: { phone, code, device_id: 'web-base' },
  })
}

/** Вход тренера по постоянному паролю (вместо кода из Telegram). */
export function staffPasswordLogin(phone: string, password: string): Promise<StaffAuthResponse> {
  return baseRequest<StaffAuthResponse>('staff/auth/login', {
    method: 'POST', body: { phone, password, device_id: 'web-base' },
  })
}

/** Как входить этому номеру: «password» — постоянный пароль, «code» — код из Telegram. */
export function staffAuthMethod(phone: string): Promise<{ success: boolean; method: 'password' | 'code' }> {
  return baseRequest(`staff/auth/method?phone=${encodeURIComponent(phone)}`)
}

// ─── Ребёнок ─────────────────────────────────────────────────────────────────

export function getMe(token: string): Promise<BaseMe> {
  return baseRequest<BaseMe>('me', { token })
}

export function updateMe(token: string, patch: { codename?: string; sound?: boolean }): Promise<BaseMe> {
  return baseRequest<BaseMe>('me', { method: 'PUT', body: patch, token })
}

export function getTodayMission(token: string): Promise<BaseMission> {
  return baseRequest<BaseMission>('mission/today', { token })
}

export function saveDraft(token: string, answers: AnswerInput[]): Promise<{ success: boolean }> {
  return baseRequest('mission/today/draft', { method: 'PUT', body: { answers }, token })
}

export function submitAnswers(token: string, answers: AnswerInput[]): Promise<SubmitResult> {
  return baseRequest<SubmitResult>('mission/today/answers', { method: 'POST', body: { answers }, token })
}

export function getProgress(token: string): Promise<BaseProgress> {
  return baseRequest<BaseProgress>('progress', { token })
}

export function getHistory(token: string, limit = 30, offset = 0): Promise<ListResponse<HistoryItem>> {
  return baseRequest<ListResponse<HistoryItem>>(`history?limit=${limit}&offset=${offset}`, { token })
}

export function getHistoryDay(token: string, dayKey: string): Promise<HistoryDetail> {
  return baseRequest<HistoryDetail>(`history/${encodeURIComponent(dayKey)}`, { token })
}

/** Командная таблица XP: место ребёнка в своей команде и состав команды. */
export function getTeamBoard(token: string): Promise<TeamBoard> {
  return baseRequest<TeamBoard>('team/board', { token })
}

// ─── Тренер/админ ────────────────────────────────────────────────────────────

export function staffOverview(token: string, limit = 50, offset = 0): Promise<ListResponse<StaffChildRow>> {
  return baseRequest<ListResponse<StaffChildRow>>(`staff/overview?limit=${limit}&offset=${offset}`, { token })
}

export function staffAttention(token: string): Promise<ListResponse<AttentionRow>> {
  return baseRequest<ListResponse<AttentionRow>>('staff/attention?limit=100', { token })
}

export function staffChild(token: string, childId: number): Promise<StaffChildDetail> {
  return baseRequest<StaffChildDetail>(`staff/children/${childId}`, { token })
}

export function issueCode(token: string, childId: number): Promise<CodeIssue> {
  return baseRequest<CodeIssue>(`staff/children/${childId}/code`, { method: 'POST', token })
}

export function getCode(token: string, childId: number): Promise<CodeInfo> {
  return baseRequest<CodeInfo>(`staff/children/${childId}/code`, { token })
}

export function revokeCode(token: string, childId: number): Promise<{ success: boolean }> {
  return baseRequest(`staff/children/${childId}/code`, { method: 'DELETE', token })
}

export function addNote(token: string, childId: number, text: string): Promise<CoachNote> {
  return baseRequest<CoachNote>(`staff/children/${childId}/note`, { method: 'POST', body: { text }, token })
}

// ─── Админ ────────────────────────────────────────────────────────────────────

/** Запрос кода входа админу: уходит в его Telegram, телефон в запросе не нужен. */
export function adminRequestCode(): Promise<{ success: boolean }> {
  return baseRequest('admin/auth/request-code', { method: 'POST' })
}

export function adminVerify(code: string): Promise<StaffAuthResponse> {
  return baseRequest<StaffAuthResponse>('admin/auth/verify', {
    method: 'POST', body: { code, device_id: 'web-base' },
  })
}

/** Кто сегодня ответил хотя бы на один вопрос разминки, по группам. */
export function adminWarmupToday(token: string): Promise<AdminWarmup> {
  return baseRequest<AdminWarmup>('admin/warmup/today', { token })
}

// ─── Воскресный квиз (зачёт общий с ботом) ────────────────────────────────────

export function getQuizState(token: string): Promise<QuizState> {
  return baseRequest<QuizState>('quiz/state', { token })
}

export function joinQuiz(token: string, category: string, confirm = false): Promise<QuizParticipant> {
  return baseRequest<QuizParticipant>('quiz/join', { method: 'POST', body: { category, confirm }, token })
}

export function startQuizWeek(token: string, week: number): Promise<QuizStart> {
  return baseRequest<QuizStart>(`quiz/weeks/${week}/start`, { method: 'POST', token })
}

export function getQuizWeek(token: string, week: number): Promise<QuizReview> {
  return baseRequest<QuizReview>(`quiz/weeks/${week}`, { token })
}

export function answerQuiz(token: string, attemptId: number, pos: number, optionIdx: number): Promise<QuizAnswer> {
  return baseRequest<QuizAnswer>(`quiz/attempts/${attemptId}/answer`, {
    method: 'POST', body: { pos, option_idx: optionIdx }, token,
  })
}

export function getQuizLeaderboard(token: string, category: string): Promise<QuizLeaderboard> {
  return baseRequest<QuizLeaderboard>(`quiz/leaderboard?category=${encodeURIComponent(category)}`, { token })
}

export function decideQuizLevel(token: string, action: 'accept' | 'decline'): Promise<QuizLevelResult> {
  return baseRequest<QuizLevelResult>('quiz/level', { method: 'POST', body: { action }, token })
}

/** Картинка вопроса / медиа ответа. Bearer не уходит в <img>, забираем blob'ом. */
export async function fetchQuizMedia(token: string, questionId: number, kind: 'question' | 'answer'): Promise<string> {
  const base = appConfig.baseApi.replace(/\/+$/, '')
  const res = await fetch(`${base}/quiz/media/${questionId}?kind=${kind}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new BaseApiError(res.status, 'Не удалось загрузить картинку')
  return URL.createObjectURL(await res.blob())
}