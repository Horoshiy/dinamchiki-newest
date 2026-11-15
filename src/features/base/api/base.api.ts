// Эндпоинты «Тайной базы». Детские вызываются с child-токеном,
// тренерские — со staff-токеном. Идентичность ребёнка сервер берёт из JWT.
import { baseRequest } from './base.client'
import type {
  AnswerInput, AttentionRow, BaseMe, BaseMission, BaseProgress, CodeInfo, CodeIssue,
  HistoryDetail, HistoryItem, ListResponse, LoginResponse, StaffAuthResponse,
  StaffChildDetail, StaffChildRow, SubmitResult, TeamAggregate, CoachNote,
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

export function staffTeamAggregate(token: string, teamId: number): Promise<TeamAggregate> {
  return baseRequest<TeamAggregate>(`staff/teams/${teamId}/aggregate`, { token })
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