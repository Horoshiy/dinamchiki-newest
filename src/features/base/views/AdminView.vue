<script setup lang="ts">
// Админская: вход по коду из Telegram и сводка разминки дня по группам.
// Показываем детей, ответивших сегодня хотя бы на один вопрос, сгруппированных
// по группам (командам) клуба.
import { computed, onMounted, ref } from 'vue'
import * as api from '../api/base.api'
import { BaseApiError } from '../api/base.client'
import type { AdminWarmup, AdminXPBoard, AdminXPRow } from '../api/base.types'
import { useBaseAuth } from '../stores/baseAuth'
import { fmtQuizPoints } from '../utils/quizPoints'

const auth = useBaseAuth()

// ─── Вход ────────────────────────────────────────────────────────────────────
const code = ref('')
const codeSent = ref(false)
const loginError = ref('')

function onCodeInput(e: Event) {
  const el = e.target as HTMLInputElement
  code.value = el.value.replace(/\D/g, '').slice(0, 4)
}

async function requestCode() {
  if (auth.staffLoading) return
  loginError.value = ''
  try {
    await auth.adminRequestCode()
    codeSent.value = true
  } catch (e) {
    loginError.value = e instanceof BaseApiError ? e.message : 'Не удалось отправить код.'
  }
}

async function verify() {
  if (!code.value.trim() || auth.staffLoading) return
  loginError.value = ''
  try {
    await auth.adminLogin(code.value.trim())
    await loadBoard()
  } catch (e) {
    loginError.value = e instanceof BaseApiError ? e.message : 'Не удалось войти.'
  }
}

// ─── Данные ──────────────────────────────────────────────────────────────────
const board = ref<AdminWarmup | null>(null)
const loading = ref(false)
const error = ref('')
const query = ref('')

async function loadBoard() {
  if (!auth.staffToken) return
  loading.value = true
  error.value = ''
  try {
    board.value = await api.adminWarmupToday(auth.staffToken)
  } catch (e) {
    if (e instanceof BaseApiError && e.status === 401) {
      auth.logoutStaff()
      return
    }
    error.value = e instanceof BaseApiError ? e.message : 'Не удалось загрузить сводку.'
  } finally {
    loading.value = false
  }
}

const filteredGroups = computed(() => {
  const list = board.value?.groups ?? []
  const q = query.value.trim().toLowerCase()
  if (!q) return list
  return list
    .map((g) => ({ ...g, children: g.children.filter((c) => c.full_name.toLowerCase().includes(q)) }))
    .filter((g) => g.children.length)
})

const attentionCount = computed(() =>
  (board.value?.groups ?? []).reduce(
    (sum, g) => sum + g.children.filter((c) => c.needs_attention).length, 0),
)

function fmtDay(dayKey: string): string {
  if (!dayKey) return ''
  const [y, m, d] = dayKey.split('-')
  return `${d}.${m}.${y}`
}

function fmtTime(iso: string): string {
  if (!iso) return '—'
  const t = new Date(iso)
  if (Number.isNaN(t.getTime())) return '—'
  return t.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

const MOOD_ICON = ['😴', '😕', '🙂', '😊', '🤩']
const ENERGY_ICON = ['🪫', '🔋', '🔋', '⚡', '⚡']
function iconAt(arr: string[], v: number): string { return v >= 1 && v <= arr.length ? arr[v - 1] : '—' }

/** Сводка доступна только админу; тренерский токен сюда не пускает. */
const isAdmin = computed(() => auth.isStaffAuthed && auth.staffRole === 'admin')

// ─── Вкладки: разминка дня / таблица XP ───────────────────────────────────────
const tab = ref<'warmup' | 'xp'>('warmup')

function switchTab(t: 'warmup' | 'xp') {
  tab.value = t
  if (t === 'xp' && !xpBoard.value) void loadXP()
}

// ─── Таблица XP по командам ───────────────────────────────────────────────────
const xpBoard = ref<AdminXPBoard | null>(null)
const xpTeam = ref(0)
const xpLoading = ref(false)
const xpError = ref('')
const xpQuery = ref('')
const xpSortKey = ref<keyof AdminXPRow>('xp')
const xpSortDir = ref<1 | -1>(-1)

const QUIZ_CAT: Record<string, string> = { k1: '3–6', k2: '7–8', k3: '9–11', k4: '12–15', ad: 'Взрослые' }

async function loadXP() {
  if (!auth.staffToken) return
  xpLoading.value = true
  xpError.value = ''
  try {
    xpBoard.value = await api.adminXPBoard(auth.staffToken, xpTeam.value)
  } catch (e) {
    if (e instanceof BaseApiError && e.status === 401) { auth.logoutStaff(); return }
    xpError.value = e instanceof BaseApiError ? e.message : 'Не удалось загрузить таблицу XP.'
  } finally {
    xpLoading.value = false
  }
}

function sortXP(key: keyof AdminXPRow) {
  if (xpSortKey.value === key) xpSortDir.value = xpSortDir.value === 1 ? -1 : 1
  else { xpSortKey.value = key; xpSortDir.value = key === 'full_name' ? 1 : -1 }
}

const xpRows = computed(() => {
  const list = xpBoard.value?.items ?? []
  const q = xpQuery.value.trim().toLowerCase()
  const filtered = q ? list.filter((r) => r.full_name.toLowerCase().includes(q) || r.codename.toLowerCase().includes(q)) : [...list]
  const key = xpSortKey.value
  const dir = xpSortDir.value
  filtered.sort((a, b) => {
    const av = a[key], bv = b[key]
    if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir
    return String(av).localeCompare(String(bv), 'ru') * dir
  })
  return filtered
})

function fmtLast(dayKey: string): string {
  if (!dayKey) return '—'
  const [y, m, d] = dayKey.split('-')
  return `${d}.${m}.${y.slice(2)}`
}

onMounted(() => { if (isAdmin.value) void loadBoard() })
</script>

<template>
  <div class="admin">
    <!-- ─── Вход администратора ─── -->
    <section v-if="!isAdmin" class="admin-login ab-card ab-rise">
      <span class="ab-eyebrow">Доступ администратора</span>
      <h1 class="admin-login__title">Админская</h1>
      <p class="ab-dim">
        Вход для администратора клуба. Код приходит в Telegram администратора — телефон вводить не нужно.
      </p>

      <template v-if="!codeSent">
        <button class="ab-btn ab-btn--block" type="button" :disabled="auth.staffLoading" @click="requestCode">
          {{ auth.staffLoading ? 'Отправляем…' : 'Получить код в Telegram' }}
        </button>
      </template>
      <template v-else>
        <label class="ab-eyebrow" for="admin-code">Код из Telegram</label>
        <input
          id="admin-code" :value="code" class="ab-input admin-login__code" type="text" inputmode="numeric"
          autocomplete="one-time-code" maxlength="4" placeholder="••••" @input="onCodeInput" @keydown.enter="verify"
        />
        <button class="ab-btn ab-btn--block" type="button" :disabled="!code.trim() || auth.staffLoading" @click="verify">
          {{ auth.staffLoading ? 'Проверяем…' : 'Войти' }}
        </button>
        <button class="admin-login__back" type="button" @click="codeSent = false; code = ''; loginError = ''">← запросить код ещё раз</button>
      </template>

      <p v-if="loginError" class="ab-alert ab-alert--error" role="alert">{{ loginError }}</p>
      <RouterLink :to="{ name: 'base-login' }" class="admin-login__child">Я игрок → вход по коду</RouterLink>
    </section>

    <!-- ─── Сводка ─── -->
    <template v-else>
      <header class="admin__head ab-rise">
        <div>
          <span class="ab-eyebrow">Администратор · {{ auth.staffName }}</span>
          <h1 class="admin__title">{{ tab === 'warmup' ? 'Разминка дня по группам' : 'Таблица XP по командам' }}</h1>
          <p v-if="tab === 'warmup' && board" class="ab-faint admin__day">{{ fmtDay(board.day_key) }}<template v-if="board.theme"> · {{ board.theme }}</template></p>
        </div>
        <button class="ab-btn ab-btn--ghost ab-btn--sm" type="button" :disabled="tab === 'warmup' ? loading : xpLoading" @click="tab === 'warmup' ? loadBoard() : loadXP()">↻ Обновить</button>
      </header>

      <nav class="admin__tabs ab-rise" role="tablist" aria-label="Разделы админской">
        <button type="button" class="admin__tab" :class="{ 'is-active': tab === 'warmup' }" role="tab" :aria-selected="tab === 'warmup'" @click="switchTab('warmup')">📋 Разминка дня</button>
        <button type="button" class="admin__tab" :class="{ 'is-active': tab === 'xp' }" role="tab" :aria-selected="tab === 'xp'" @click="switchTab('xp')">🏆 Таблица XP</button>
      </nav>

      <template v-if="tab === 'warmup'">
      <p v-if="error" class="ab-alert ab-alert--error">{{ error }}</p>

      <section v-if="board" class="admin__summary ab-rise ab-rise-1">
        <span>Ответили <b>{{ board.answered }}</b> из {{ board.participants }}</span>
        <span>Групп <b>{{ board.groups.length }}</b></span>
        <span :class="{ 'is-warn': attentionCount > 0 }">Тревоги <b>{{ attentionCount }}</b></span>
      </section>

      <section class="admin__toolbar ab-rise ab-rise-1">
        <input v-model="query" class="ab-input admin__search" type="search" placeholder="Поиск по имени…" />
      </section>

      <section v-if="loading" class="admin__loading ab-card"><span class="admin__spinner" />Загружаем сводку…</section>
      <section v-else-if="!filteredGroups.length" class="admin__empty ab-card ab-dim">
        {{ board?.answered ? 'Никого не найдено по фильтру.' : 'Сегодня никто ещё не отвечал на разминку.' }}
      </section>

      <section v-for="g in filteredGroups" :key="g.team_id" class="admin__group ab-card ab-rise ab-rise-1">
        <header class="admin__group-head">
          <b>{{ g.name }}</b>
          <span class="admin__group-count">{{ g.answered }} ответили<template v-if="g.participants"> из {{ g.participants }}</template></span>
        </header>
        <ul class="admin__list">
          <li v-for="c in g.children" :key="c.child_id" class="admin__item">
            <span class="admin__name">{{ c.full_name }}</span>
            <span class="admin__cell">{{ c.answers }} <em>ответов</em></span>
            <span class="admin__cell">{{ iconAt(MOOD_ICON, c.mood) }} <em>настрой</em></span>
            <span class="admin__cell">{{ iconAt(ENERGY_ICON, c.energy) }} <em>силы</em></span>
            <span class="admin__cell" :class="{ 'is-warn': c.pain >= 3 }">боль {{ c.pain }}/5</span>
            <span v-if="c.attendance" class="admin__tag" :class="c.attendance === 'Буду' ? 'admin__tag--yes' : 'admin__tag--no'">
              {{ c.attendance === 'Буду' ? '⚽ будет' : '✕ не будет' }}
            </span>
            <span class="admin__time">{{ fmtTime(c.completed_at) }}</span>
          </li>
        </ul>
      </section>
      </template>

      <!-- ─── Таблица XP ─── -->
      <template v-else>
        <p v-if="xpError" class="ab-alert ab-alert--error">{{ xpError }}</p>

        <section class="admin__toolbar ab-rise ab-rise-1">
          <select v-model.number="xpTeam" class="ab-input admin__select" aria-label="Команда" @change="loadXP">
            <option :value="0">Все команды</option>
            <option v-for="t in xpBoard?.teams ?? []" :key="t.id" :value="t.id">{{ t.name }} · {{ t.children }}</option>
          </select>
          <input v-model="xpQuery" class="ab-input admin__search" type="search" placeholder="Поиск по имени или прозвищу…" />
        </section>

        <section v-if="xpBoard" class="admin__summary ab-rise ab-rise-1">
          <span>Детей <b>{{ xpBoard.total }}</b></span>
          <span>Сумма XP <b>{{ xpBoard.xp_sum }}</b></span>
          <span>Среднее <b>{{ xpBoard.xp_avg.toFixed(1) }}</b></span>
        </section>

        <section v-if="xpLoading" class="admin__loading ab-card"><span class="admin__spinner" />Загружаем таблицу…</section>
        <section v-else-if="!xpRows.length" class="admin__empty ab-card ab-dim">
          {{ xpBoard?.total ? 'Никого не найдено по фильтру.' : 'В этой команде пока нет детей.' }}
        </section>

        <div v-else class="admin__table-wrap ab-card ab-rise ab-rise-1">
          <table class="admin__table">
            <thead>
              <tr>
                <th class="is-sortable" :class="{ 'is-sorted': xpSortKey === 'full_name' }" @click="sortXP('full_name')">Игрок <span class="admin__arrow">{{ xpSortKey === 'full_name' ? (xpSortDir === 1 ? '▲' : '▼') : '↕' }}</span></th>
                <th class="is-sortable is-num" :class="{ 'is-sorted': xpSortKey === 'xp' }" @click="sortXP('xp')">XP <span class="admin__arrow">{{ xpSortKey === 'xp' ? (xpSortDir === 1 ? '▲' : '▼') : '↕' }}</span></th>
                <th>Звание</th>
                <th class="is-sortable is-num" :class="{ 'is-sorted': xpSortKey === 'streak_current' }" @click="sortXP('streak_current')">Серия <span class="admin__arrow">{{ xpSortKey === 'streak_current' ? (xpSortDir === 1 ? '▲' : '▼') : '↕' }}</span></th>
                <th class="is-sortable is-num" :class="{ 'is-sorted': xpSortKey === 'missions_total' }" @click="sortXP('missions_total')">Разминок <span class="admin__arrow">{{ xpSortKey === 'missions_total' ? (xpSortDir === 1 ? '▲' : '▼') : '↕' }}</span></th>
                <th class="is-sortable is-num" :class="{ 'is-sorted': xpSortKey === 'quiz_points' }" @click="sortXP('quiz_points')">Квиз <span class="admin__arrow">{{ xpSortKey === 'quiz_points' ? (xpSortDir === 1 ? '▲' : '▼') : '↕' }}</span></th>
                <th class="is-sortable" :class="{ 'is-sorted': xpSortKey === 'last_mission_date' }" @click="sortXP('last_mission_date')">Последний день <span class="admin__arrow">{{ xpSortKey === 'last_mission_date' ? (xpSortDir === 1 ? '▲' : '▼') : '↕' }}</span></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(r, i) in xpRows" :key="r.child_id" :class="{ 'is-top': i === 0 && xpSortKey === 'xp' && xpSortDir === -1 && !xpQuery }">
                <td class="admin__player">
                  <b>{{ r.full_name }}</b>
                  <span v-if="r.codename" class="admin__codename">«{{ r.codename }}»</span>
                  <span v-if="xpTeam === 0 && r.team_name" class="admin__teamname">{{ r.team_name }}</span>
                </td>
                <td class="is-num admin__xp">{{ r.xp }}</td>
                <td class="admin__rank">{{ r.rank }}</td>
                <td class="is-num">{{ r.streak_current }}🔥</td>
                <td class="is-num">{{ r.missions_total }}</td>
                <td class="is-num admin__quiz">
                  <template v-if="r.quiz_category">{{ fmtQuizPoints(r.quiz_points) }} <em>{{ QUIZ_CAT[r.quiz_category] ?? r.quiz_category }}</em></template>
                  <template v-else>—</template>
                </td>
                <td class="admin__last">{{ fmtLast(r.last_mission_date) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </template>
  </div>
</template>

<style scoped lang="scss">
.admin { display: flex; flex-direction: column; gap: 18px; }
.admin-login { display: flex; flex-direction: column; gap: 14px; max-width: 440px; margin: 0 auto; padding: 30px 26px; }
.admin-login__title { font-size: 1.9rem; }
.admin-login__code { letter-spacing: 0.5em; font-family: var(--ab-font-mono); font-size: 1.5rem; text-align: center; }
.admin-login__back, .admin-login__child { background: none; border: none; color: var(--ab-text-dim); font-size: 0.86rem; cursor: pointer; text-align: center; text-decoration: none; }
.admin-login__child { color: var(--ab-cyan); }
.admin__head { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; }
.admin__title { font-size: clamp(1.5rem, 4.5vw, 2rem); }
.admin__day { font-size: 0.84rem; margin: 6px 0 0; }
.admin__summary { display: flex; flex-wrap: wrap; gap: 8px 18px; padding: 12px 16px; border-radius: var(--ab-radius-sm); background: rgba(6, 9, 18, 0.5); border: 1px solid var(--ab-line); font-size: 0.86rem; color: var(--ab-text-dim); }
.admin__summary b { font-family: var(--ab-font-mono); color: var(--ab-cyan); }
.admin__summary .is-warn b { color: var(--ab-raspberry); }
.admin__toolbar { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
.admin__search { flex: 1; min-width: 200px; }
.admin__loading, .admin__empty { display: flex; align-items: center; justify-content: center; gap: 12px; padding: 40px; }
.admin__spinner { width: 30px; height: 30px; border-radius: 50%; border: 3px solid var(--ab-line); border-top-color: var(--ab-cyan); animation: admin-sweep 0.9s linear infinite; }
.admin__group { padding: 16px 18px; }
.admin__group-head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; padding-bottom: 10px; border-bottom: 1px solid var(--ab-line); }
.admin__group-head b { font-family: var(--ab-font-display); font-size: 1.05rem; color: var(--ab-text); }
.admin__group-count { font-size: 0.82rem; color: var(--ab-text-dim); }
.admin__list { list-style: none; margin: 0; padding: 0; }
.admin__item { display: grid; grid-template-columns: minmax(0, 2.4fr) repeat(4, minmax(0, 1fr)) auto auto; gap: 10px; align-items: center; padding: 11px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05); font-size: 0.9rem; }
.admin__item:last-child { border-bottom: none; }
.admin__name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 600; }
.admin__cell { font-size: 0.82rem; color: var(--ab-text-dim); white-space: nowrap; }
.admin__cell em { font-style: normal; color: var(--ab-text-faint); }
.admin__cell.is-warn { color: #ff8fae; font-weight: 700; }
.admin__tag { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 0.72rem; font-weight: 700; white-space: nowrap; }
.admin__tag--yes { background: rgba(61, 220, 132, 0.16); color: var(--ab-success); }
.admin__tag--no { background: rgba(255, 61, 113, 0.14); color: #ff8fae; }
.admin__time { font-family: var(--ab-font-mono); font-size: 0.78rem; color: var(--ab-text-faint); }
@keyframes admin-sweep { to { transform: rotate(360deg); } }

/* ─── Вкладки ─── */
.admin__tabs { display: inline-flex; gap: 4px; padding: 4px; border-radius: 999px; background: rgba(6, 9, 18, 0.6); border: 1px solid var(--ab-line); align-self: flex-start; }
.admin__tab { display: inline-flex; align-items: center; gap: 7px; min-height: 40px; padding: 0 18px; border: none; border-radius: 999px; background: none; color: var(--ab-text-dim); cursor: pointer; font-family: var(--ab-font-display); font-weight: 700; font-size: 0.9rem; transition: all 150ms ease; }
.admin__tab:hover { color: var(--ab-text); }
.admin__tab.is-active { background: linear-gradient(180deg, var(--ab-blue-bright), var(--ab-blue)); color: #fff; box-shadow: 0 4px 16px rgba(30, 80, 216, 0.4); }

/* ─── Таблица XP ─── */
.admin__select { min-width: 220px; cursor: pointer; }
.admin__select option { background: #0c1226; color: var(--ab-text); }
.admin__table-wrap { padding: 6px 10px; overflow-x: auto; scrollbar-width: thin; scrollbar-color: var(--ab-blue) rgba(120, 150, 255, 0.08); }
.admin__table-wrap::-webkit-scrollbar { height: 10px; }
.admin__table-wrap::-webkit-scrollbar-track { background: rgba(120, 150, 255, 0.08); border-radius: 999px; }
.admin__table-wrap::-webkit-scrollbar-thumb { background: linear-gradient(90deg, var(--ab-blue), var(--ab-blue-bright)); border-radius: 999px; }
.admin__table-wrap::-webkit-scrollbar-thumb:hover { background: var(--ab-cyan); }
.admin__table { width: 100%; border-collapse: collapse; font-size: 0.9rem; min-width: 720px; }
.admin__table th { text-align: left; padding: 12px 12px 10px; font-family: var(--ab-font-display); font-size: 0.78rem; letter-spacing: 0.04em; text-transform: uppercase; color: var(--ab-text-dim); border-bottom: 1px solid var(--ab-line-strong); white-space: nowrap; user-select: none; }
.admin__table th.is-num, .admin__table td.is-num { text-align: right; }
.admin__table th.is-sortable { cursor: pointer; transition: color 150ms ease; }
.admin__table th.is-sortable:hover { color: var(--ab-cyan); }
.admin__table th.is-sorted { color: var(--ab-cyan); }
.admin__arrow { font-size: 0.7rem; opacity: 0.8; }
.admin__table td { padding: 11px 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); vertical-align: middle; }
.admin__table tbody tr { transition: background 150ms ease; }
.admin__table tbody tr:hover { background: rgba(120, 150, 255, 0.06); }
.admin__table tbody tr:last-child td { border-bottom: none; }
.admin__table tbody tr.is-top { background: rgba(143, 191, 38, 0.08); }
.admin__table tbody tr.is-top .admin__xp { color: var(--ab-lime); }
.admin__player b { font-weight: 700; }
.admin__codename { display: block; font-size: 0.78rem; color: var(--ab-cyan); }
.admin__teamname { display: block; font-size: 0.74rem; color: var(--ab-text-faint); }
.admin__xp { font-family: var(--ab-font-mono); font-weight: 700; color: var(--ab-cyan); font-size: 1rem; }
.admin__rank { color: var(--ab-text-dim); white-space: nowrap; }
.admin__quiz em { font-style: normal; font-size: 0.72rem; color: var(--ab-text-faint); }
.admin__last { font-family: var(--ab-font-mono); font-size: 0.8rem; color: var(--ab-text-faint); white-space: nowrap; }
@media (max-width: 680px) {
  .admin__tabs { width: 100%; justify-content: center; }
  .admin__tab { flex: 1; justify-content: center; padding: 0 10px; font-size: 0.82rem; }
  .admin__select { min-width: 0; flex: 1; }
}
@media (prefers-reduced-motion: reduce) { .admin__spinner { animation-duration: 2s; } }
@media (max-width: 760px) {
  .admin__item { grid-template-columns: minmax(0, 1fr) auto auto; grid-template-areas: "name time tag" "cells cells cells"; row-gap: 6px; }
  .admin__name { grid-area: name; }
  .admin__time { grid-area: time; }
  .admin__tag { grid-area: tag; justify-self: end; }
}
@media (prefers-reduced-motion: reduce) { .admin__spinner { animation-duration: 2s; } }
</style>
