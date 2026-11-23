<script setup lang="ts">
// Админская: вход по коду из Telegram и сводка разминки дня по группам.
// Показываем детей, ответивших сегодня хотя бы на один вопрос, сгруппированных
// по группам (командам) клуба.
import { computed, onMounted, ref } from 'vue'
import * as api from '../api/base.api'
import { BaseApiError } from '../api/base.client'
import type { AdminWarmup } from '../api/base.types'
import { useBaseAuth } from '../stores/baseAuth'

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
          <h1 class="admin__title">Разминка дня по группам</h1>
          <p v-if="board" class="ab-faint admin__day">{{ fmtDay(board.day_key) }}<template v-if="board.theme"> · {{ board.theme }}</template></p>
        </div>
        <button class="ab-btn ab-btn--ghost ab-btn--sm" type="button" :disabled="loading" @click="loadBoard">↻ Обновить</button>
      </header>

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
@media (max-width: 760px) {
  .admin__item { grid-template-columns: minmax(0, 1fr) auto auto; grid-template-areas: "name time tag" "cells cells cells"; row-gap: 6px; }
  .admin__name { grid-area: name; }
  .admin__time { grid-area: time; }
  .admin__tag { grid-area: tag; justify-self: end; }
}
@media (prefers-reduced-motion: reduce) { .admin__spinner { animation-duration: 2s; } }
</style>
