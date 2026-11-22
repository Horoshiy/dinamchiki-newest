// Сессии «Подтрибунки»: ребёнок (код игрока) и тренер (SMS-код).
// Оба токена живут в localStorage: child — 30 дней, staff — 365 (тренер
// остаётся залогинен, пока сам не нажмёт «выйти» в шапке).
import { defineStore } from 'pinia'
import * as api from '../api/base.api'
import { BaseApiError } from '../api/base.client'
import type { BaseMe } from '../api/base.types'
import { normalizeAgentCode } from '../utils/agentCode'

const CHILD_KEY = 'dinamchiki-base-child-token'
const STAFF_KEY = 'dinamchiki-base-staff-token'
const STAFF_ROLE_KEY = 'dinamchiki-base-staff-role'
const STAFF_NAME_KEY = 'dinamchiki-base-staff-name'

function readStorage(store: Storage | undefined, key: string): string | null {
  try { return store?.getItem(key) ?? null } catch { return null }
}
function writeStorage(store: Storage | undefined, key: string, value: string | null) {
  try {
    if (value === null) store?.removeItem(key)
    else store?.setItem(key, value)
  } catch { /* приватный режим */ }
}
const ls = typeof localStorage !== 'undefined' ? localStorage : undefined

export const useBaseAuth = defineStore('baseAuth', {
  state: () => ({
    childToken: readStorage(ls, CHILD_KEY),
    me: null as BaseMe | null,
    staffToken: readStorage(ls, STAFF_KEY),
    staffRole: readStorage(ls, STAFF_ROLE_KEY) as 'coach' | 'admin' | null,
    staffName: readStorage(ls, STAFF_NAME_KEY),
    childLoading: false,
    staffLoading: false,
  }),
  getters: {
    isChildAuthed: (s) => !!s.childToken,
    isStaffAuthed: (s) => !!s.staffToken,
  },
  actions: {
    /** Достаёт код из fragment ссылки QR (#code=…) и очищает адресную строку. */
    consumeCodeFromHash(): string | null {
      if (typeof location === 'undefined') return null
      const m = /[#&]code=([A-Za-z0-9-]+)/.exec(location.hash)
      if (!m) return null
      const code = m[1]
      try { history.replaceState(null, '', location.pathname + location.search) } catch { /* noop */ }
      return code
    },

    async loginChild(code: string) {
      this.childLoading = true
      try {
        const res = await api.loginWithCode(normalizeAgentCode(code))
        if (!res.success || !res.token) throw new BaseApiError(401, res.error || 'Код не подошёл.')
        this.childToken = res.token
        writeStorage(ls, CHILD_KEY, res.token)
        await this.loadMe()
      } finally {
        this.childLoading = false
      }
    },

    async loadMe() {
      if (!this.childToken) return
      try {
        this.me = await api.getMe(this.childToken)
      } catch (e) {
        if (e instanceof BaseApiError && (e.status === 401 || e.status === 403)) this.logoutChild()
        throw e
      }
    },

    async setCodename(codename: string) {
      if (!this.childToken) return
      this.me = await api.updateMe(this.childToken, { codename })
    },

    async setSound(sound: boolean) {
      if (!this.childToken) return
      this.me = await api.updateMe(this.childToken, { sound })
    },

    logoutChild() {
      this.childToken = null
      this.me = null
      writeStorage(ls, CHILD_KEY, null)
    },

    async staffRequestCode(phone: string) {
      this.staffLoading = true
      try {
        await api.staffRequestCode(phone)
      } finally {
        this.staffLoading = false
      }
    },

    async staffLogin(phone: string, code: string) {
      this.staffLoading = true
      try {
        const res = await api.staffVerify(phone, code)
        if (!res.success || !res.token) throw new BaseApiError(401, res.error || 'Не удалось войти.')
        this.staffToken = res.token
        this.staffRole = res.role ?? 'coach'
        this.staffName = res.name ?? 'Тренер'
        writeStorage(ls, STAFF_KEY, res.token)
        writeStorage(ls, STAFF_ROLE_KEY, this.staffRole)
        writeStorage(ls, STAFF_NAME_KEY, this.staffName)
      } finally {
        this.staffLoading = false
      }
    },

    logoutStaff() {
      this.staffToken = null
      this.staffRole = null
      this.staffName = null
      writeStorage(ls, STAFF_KEY, null)
      writeStorage(ls, STAFF_ROLE_KEY, null)
      writeStorage(ls, STAFF_NAME_KEY, null)
    },

    /** Вызывается при 401/403 на тренерских запросах — сессия истекла. */
    handleStaffAuthError(e: unknown) {
      if (e instanceof BaseApiError && (e.status === 401 || e.status === 403)) this.logoutStaff()
    },
  },
})