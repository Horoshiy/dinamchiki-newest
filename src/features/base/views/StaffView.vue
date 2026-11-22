<script setup lang="ts">
// Тренерская: вход по SMS, доска дня с ответами всего состава, «требуют внимания»,
// сводка по команде. Прямые ответы дня видны здесь (аудит view_board); карточка
// ребёнка — по клику (аудит view_answers).
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import * as api from '../api/base.api'
import { BaseApiError } from '../api/base.client'
import type { AttentionRow, StaffChildRow } from '../api/base.types'
import { useBaseAuth } from '../stores/baseAuth'

const auth = useBaseAuth()
const router = useRouter()

// ─── Вход ────────────────────────────────────────────────────────────────────
const phone = ref('')
const code = ref('')
const loginStep = ref<'phone' | 'code'>('phone')
const loginError = ref('')

async function requestCode() {
  if (phone.value.replace(/\D/g, '').length < 10 || auth.staffLoading) return
  loginError.value = ''
  try {
    await auth.staffRequestCode(phone.value)
    loginStep.value = 'code'
  } catch (e) {
    loginError.value = e instanceof BaseApiError ? e.message : 'Не удалось отправить код.'
  }
}
async function verify() {
  if (!code.value.trim() || auth.staffLoading) return
  loginError.value = ''
  try {
    await auth.staffLogin(phone.value, code.value.trim())
    await loadDashboard()
  } catch (e) {
    loginError.value = e instanceof BaseApiError ? e.message : 'Не удалось войти.'
  }
}

// ─── Данные ──────────────────────────────────────────────────────────────────
const rows = ref<StaffChildRow[]>([])
const attention = ref<AttentionRow[]>([])
const loading = ref(false)
const error = ref('')
const showAttention = ref(false)
const showProgress = ref(false)

const query = ref('')
const filter = ref<'all' | 'done' | 'pending' | 'attention' | 'nocode'>('all')
const sort = ref<'name' | 'xp' | 'streak' | 'pain' | 'mood'>('name')

const filtered = computed(() => {
  let list = rows.value
  const q = query.value.trim().toLowerCase()
  if (q) list = list.filter((r) => r.full_name.toLowerCase().includes(q))
  if (filter.value === 'done') list = list.filter((r) => r.completed_today)
  else if (filter.value === 'pending') list = list.filter((r) => !r.completed_today)
  else if (filter.value === 'attention') list = list.filter((r) => r.needs_attention_today)
  else if (filter.value === 'nocode') list = list.filter((r) => !r.has_code)
  const sorted = [...list]
  if (sort.value === 'xp') sorted.sort((a, b) => b.xp - a.xp)
  else if (sort.value === 'streak') sorted.sort((a, b) => b.streak_current - a.streak_current)
  else if (sort.value === 'pain') sorted.sort((a, b) => b.pain_today - a.pain_today)
  else if (sort.value === 'mood') sorted.sort((a, b) => a.mood_today - b.mood_today)
  else sorted.sort((a, b) => a.full_name.localeCompare(b.full_name, 'ru'))
  return sorted
})

const doneCount = computed(() => rows.value.filter((r) => r.completed_today).length)
const attentionToday = computed(() => rows.value.filter((r) => r.needs_attention_today).length)

// Средние — только по прошедшим сегодня (иначе «—»): не выдаём конкретного ребёнка.
const completedRows = computed(() => rows.value.filter((r) => r.completed_today))
function avgOf(sel: (r: StaffChildRow) => number): string {
  const list = completedRows.value
  if (!list.length) return '—'
  return (list.reduce((s, r) => s + sel(r), 0) / list.length).toFixed(1)
}
const avgMood = computed(() => avgOf((r) => r.mood_today))
const avgEnergy = computed(() => avgOf((r) => r.energy_today))
const avgPain = computed(() => avgOf((r) => r.pain_today))
const painWarn = computed(() => completedRows.value.length > 0 && Number(avgPain.value) >= 2)

// ─── Ячейки ответов дня ──────────────────────────────────────────────────────
const MOOD_ICON = ['😴', '😕', '🙂', '😊', '🤩']
const MOOD_WORD = ['устал', 'так себе', 'норм', 'хорошо', 'супер']
const ENERGY_ICON = ['🪫', '🔋', '🔋', '⚡', '⚡']
const ENERGY_WORD = ['мало', 'немного', 'средне', 'много', 'очень']
const PAIN_WORD = ['нет', 'немного', 'болит', 'сильно', 'очень']
function at(arr: string[], v: number): string { return v >= 1 && v <= arr.length ? arr[v - 1] : '' }
function moodIcon(v: number): string { return at(MOOD_ICON, v) || '—' }
function moodWord(v: number): string { return at(MOOD_WORD, v) }
function energyIcon(v: number): string { return at(ENERGY_ICON, v) || '—' }
function energyWord(v: number): string { return at(ENERGY_WORD, v) }
function painWord(v: number): string { return at(PAIN_WORD, v) || '—' }
function sleepLabel(s: string): string {
  if (!s) return '—'
  if (s.startsWith('Много')) return '😴 много'
  if (s.startsWith('Мало')) return '🥱 мало'
  if (s.startsWith('Почти')) return '😵 почти нет'
  return s
}
function fuelLabel(vals: string[]): string {
  if (!vals || !vals.length) return '—'
  return vals.map((v) => (v.includes('Позавтракал') ? '🍎' : v.includes('воду') ? '💧' : '•')).join(' ')
}

function authFail(e: unknown): boolean {
  if (e instanceof BaseApiError && (e.status === 401 || e.status === 403)) {
    auth.logoutStaff()
    return true
  }
  return false
}

async function loadDashboard() {
  if (!auth.staffToken) return
  loading.value = true
  error.value = ''
  try {
    const [ov, at] = await Promise.all([
      api.staffOverview(auth.staffToken, 200),
      api.staffAttention(auth.staffToken),
    ])
    rows.value = ov.items
    attention.value = at.items
  } catch (e) {
    if (authFail(e)) return
    error.value = e instanceof BaseApiError ? e.message : 'Не удалось загрузить тренерскую.'
  } finally {
    loading.value = false
  }
}

function openChild(id: number) {
  void router.push({ name: 'base-staff-child', params: { id } })
}
function fmtDate(d: string): string {
  if (!d) return '—'
  const [, m, day] = d.split('-')
  return `${day}.${m}`
}

onMounted(() => { if (auth.isStaffAuthed) void loadDashboard() })
</script>

<template>
  <div class="staff">
    <!-- ─── Вход тренера ─── -->
    <section v-if="!auth.isStaffAuthed" class="staff-login ab-card ab-rise">
      <span class="ab-eyebrow">Доступ персонала</span>
      <h1 class="staff-login__title">Тренерская</h1>
      <p class="ab-dim">Вход по номеру телефона и коду из SMS. Доступно тренерам и администраторам клуба.</p>

      <template v-if="loginStep === 'phone'">
        <label class="ab-eyebrow" for="staff-phone">Телефон</label>
        <input id="staff-phone" v-model="phone" class="ab-input" type="tel" inputmode="tel" placeholder="+7 900 000-00-00" @keydown.enter="requestCode" />
        <button class="ab-btn ab-btn--block" type="button" :disabled="phone.replace(/\D/g, '').length < 10 || auth.staffLoading" @click="requestCode">
          {{ auth.staffLoading ? 'Отправляем…' : 'Получить код' }}
        </button>
      </template>
      <template v-else>
        <label class="ab-eyebrow" for="staff-code">Код из SMS на {{ phone }}</label>
        <input id="staff-code" v-model="code" class="ab-input staff-login__code" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="••••" @keydown.enter="verify" />
        <button class="ab-btn ab-btn--block" type="button" :disabled="!code.trim() || auth.staffLoading" @click="verify">
          {{ auth.staffLoading ? 'Проверяем…' : 'Войти в тренерскую' }}
        </button>
        <button class="staff-login__back" type="button" @click="loginStep = 'phone'; code = ''; loginError = ''">← изменить номер</button>
      </template>

      <p v-if="loginError" class="ab-alert ab-alert--error" role="alert">{{ loginError }}</p>
      <RouterLink :to="{ name: 'base-login' }" class="staff-login__child">Я игрок → вход по коду</RouterLink>
    </section>

    <!-- ─── Дашборд ─── -->
    <template v-else>
      <header class="staff__head ab-rise">
        <div>
          <span class="ab-eyebrow">{{ auth.staffRole === 'admin' ? 'Администратор' : 'Тренер' }} · {{ auth.staffName }}</span>
          <h1 class="staff__title">Тренерская</h1>
        </div>
        <button class="ab-btn ab-btn--ghost ab-btn--sm" type="button" :disabled="loading" @click="loadDashboard">↻ Обновить</button>
      </header>

      <!-- Требуют внимания -->
      <section v-if="attention.length" class="staff__attention ab-rise ab-rise-1">
        <button class="staff__attention-head" type="button" @click="showAttention = !showAttention">
          <span class="staff__attention-icon">⚠️</span>
          <span>Требуют внимания: <b>{{ attention.length }}</b> {{ attention.length === 1 ? 'игрок отметил боль' : 'игроков отметили боль' }}</span>
          <span class="staff__attention-toggle">{{ showAttention ? 'скрыть' : 'показать' }}</span>
        </button>
        <ul v-if="showAttention" class="staff__attention-list">
          <li v-for="a in attention" :key="`${a.child_id}-${a.day_key}`">
            <button type="button" @click="openChild(a.child_id)">
              <b>{{ a.full_name }}</b> · боль {{ a.pain_score }}/5 · {{ fmtDate(a.day_key) }}
            </button>
          </li>
        </ul>
      </section>

      <p v-if="error" class="ab-alert ab-alert--error">{{ error }}</p>

      <!-- Сводка дня -->
      <div class="staff__board-summary ab-rise ab-rise-1">
        <span>Ответили <b>{{ doneCount }}</b> из {{ rows.length }}</span>
        <span>Настрой ⌀ <b>{{ avgMood }}</b></span>
        <span>Силы ⌀ <b>{{ avgEnergy }}</b></span>
        <span :class="{ 'is-warn': painWarn }">Боль ⌀ <b>{{ avgPain }}</b></span>
        <span :class="{ 'is-warn': attentionToday > 0 }">Тревоги <b>{{ attentionToday }}</b></span>
      </div>

      <!-- Панель управления -->
      <section class="staff__toolbar ab-rise ab-rise-1">
        <input v-model="query" class="ab-input staff__search" type="search" placeholder="Поиск по имени…" />
        <select v-model="filter" class="ab-input staff__select" aria-label="Фильтр">
          <option value="all">Все игроки</option>
          <option value="done">Прошли сегодня</option>
          <option value="pending">Не прошли сегодня</option>
          <option value="attention">Требуют внимания</option>
          <option value="nocode">Без кода</option>
        </select>
        <select v-model="sort" class="ab-input staff__select" aria-label="Сортировка">
          <option value="name">По имени</option>
          <option value="pain">По боли</option>
          <option value="mood">По настрою</option>
          <option value="xp">По XP</option>
          <option value="streak">По серии</option>
        </select>
        <button class="ab-btn ab-btn--ghost ab-btn--sm staff__progress-toggle" type="button" :aria-pressed="showProgress" @click="showProgress = !showProgress">
          {{ showProgress ? 'Скрыть прогресс' : 'Прогресс' }}
        </button>
      </section>

      <div class="staff__summary ab-faint ab-rise ab-rise-1">
        {{ filtered.length }} из {{ rows.length }} · сегодня прошли {{ doneCount }}
      </div>

      <!-- Доска дня: ответы всего состава -->
      <section v-if="loading" class="staff__loading ab-card"><span class="staff__spinner" />Загружаем игроков…</section>
      <section v-else-if="!filtered.length" class="staff__empty ab-card ab-dim">
        {{ rows.length ? 'Никого не найдено по фильтру.' : 'Пока нет доступных игроков.' }}
      </section>
      <section v-else class="staff__table ab-card ab-rise ab-rise-2">
        <div class="staff__row staff__row--head">
          <span class="staff__c-name">Игрок</span>
          <span class="staff__c-mood">Настрой</span>
          <span class="staff__c-energy">Силы</span>
          <span class="staff__c-pain">Болит</span>
          <span class="staff__c-sleep">Сон</span>
          <span class="staff__c-fuel">Еда/вода</span>
          <span class="staff__c-status">Статус</span>
        </div>
        <div v-for="r in filtered" :key="r.child_id" class="staff__item">
          <button type="button" class="staff__row" :class="{ 'staff__row--idle': !r.completed_today }" @click="openChild(r.child_id)">
            <span class="staff__name staff__c-name">
              <b>{{ r.full_name }}</b>
            </span>
            <span class="staff__cell staff__c-mood">{{ moodIcon(r.mood_today) }} <em>{{ moodWord(r.mood_today) }}</em></span>
            <span class="staff__cell staff__c-energy">{{ energyIcon(r.energy_today) }} <em>{{ energyWord(r.energy_today) }}</em></span>
            <span class="staff__cell staff__c-pain" :class="{ 'is-warn': r.pain_today >= 3 }">{{ painWord(r.pain_today) }}</span>
            <span class="staff__cell staff__c-sleep">{{ sleepLabel(r.sleep_today) }}</span>
            <span class="staff__cell staff__c-fuel">{{ fuelLabel(r.fuel_today) }}</span>
            <span class="staff__c-status">
              <span v-if="r.needs_attention_today" class="staff__tag staff__tag--warn">боль</span>
              <span v-else-if="r.completed_today" class="staff__tag staff__tag--ok">✓ прошёл</span>
              <span v-else class="staff__tag staff__tag--idle">ждём</span>
            </span>
          </button>
          <div v-if="showProgress" class="staff__progress">
            <span class="staff__rank">{{ r.rank }}</span>
            <span class="staff__xp">XP {{ r.xp }}</span>
            <span class="staff__streak">🔥 {{ r.streak_current }}</span>
            <span class="staff__tag" :class="r.has_code ? 'staff__tag--code' : 'staff__tag--idle'">{{ r.has_code ? 'код есть' : 'без кода' }}</span>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped lang="scss">
.staff { display: flex; flex-direction: column; gap: 18px; }
.staff-login { display: flex; flex-direction: column; gap: 14px; max-width: 440px; margin: 0 auto; padding: 30px 26px; }
.staff-login__title { font-size: 1.9rem; }
.staff-login__code { letter-spacing: 0.4em; font-family: var(--ab-font-mono); font-size: 1.4rem; text-align: center; }
.staff-login__back, .staff-login__child { background: none; border: none; color: var(--ab-text-dim); font-size: 0.86rem; cursor: pointer; text-align: center; text-decoration: none; }
.staff-login__child { color: var(--ab-cyan); }
.staff__head { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; }
.staff__title { font-size: clamp(1.6rem, 5vw, 2.2rem); }
.staff__attention { border-radius: var(--ab-radius-sm); border: 1px solid rgba(255, 176, 32, 0.45); background: rgba(255, 176, 32, 0.1); overflow: hidden; }
.staff__attention-head { display: flex; align-items: center; gap: 12px; width: 100%; padding: 16px 18px; background: none; border: none; color: #ffe9c2; cursor: pointer; font-size: 0.98rem; text-align: left; }
.staff__attention-icon { font-size: 1.3rem; }
.staff__attention-toggle { margin-left: auto; font-size: 0.8rem; color: var(--ab-amber); text-decoration: underline; }
.staff__attention-list { list-style: none; margin: 0; padding: 0 18px 14px; display: flex; flex-direction: column; gap: 6px; }
.staff__attention-list button { background: none; border: none; color: var(--ab-text); cursor: pointer; font-size: 0.9rem; padding: 4px 0; }
.staff__attention-list button:hover { color: var(--ab-amber); }
.staff__board-summary { display: flex; flex-wrap: wrap; gap: 8px 18px; padding: 12px 16px; border-radius: var(--ab-radius-sm); background: rgba(6, 9, 18, 0.5); border: 1px solid var(--ab-line); font-size: 0.86rem; color: var(--ab-text-dim); }
.staff__board-summary b { font-family: var(--ab-font-mono); color: var(--ab-cyan); }
.staff__board-summary .is-warn b { color: var(--ab-raspberry); }
.staff__toolbar { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
.staff__search { flex: 1; min-width: 200px; }
.staff__select { flex: 0 0 auto; width: auto; min-width: 150px; cursor: pointer; }
.staff__progress-toggle { flex: 0 0 auto; }
.staff__summary { font-size: 0.82rem; }
.staff__loading, .staff__empty { display: flex; align-items: center; justify-content: center; gap: 12px; padding: 40px; }
.staff__spinner { width: 30px; height: 30px; border-radius: 50%; border: 3px solid var(--ab-line); border-top-color: var(--ab-cyan); animation: ab-sweep 0.9s linear infinite; }
.staff__table { padding: 8px; overflow: hidden; }
.staff__item { border-radius: var(--ab-radius-sm); }
.staff__row { display: grid; grid-template-columns: minmax(0, 2.2fr) repeat(5, minmax(0, 1fr)) minmax(0, 1fr); gap: 10px; align-items: center; width: 100%; padding: 14px 16px; border: none; border-radius: var(--ab-radius-sm); background: none; color: var(--ab-text); text-align: left; cursor: pointer; font-size: 0.92rem; transition: background 140ms ease; }
.staff__row:not(.staff__row--head):hover { background: rgba(120, 150, 255, 0.1); }
.staff__row--idle { opacity: 0.55; }
.staff__row--head { cursor: default; font-family: var(--ab-font-mono); font-size: 0.7rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ab-text-faint); border-bottom: 1px solid var(--ab-line); border-radius: 0; }
.staff__name { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.staff__name b { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.staff__cell { min-width: 0; font-size: 0.84rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.staff__cell em { font-style: normal; color: var(--ab-text-dim); }
.staff__cell.is-warn { color: #ff8fae; font-weight: 700; }
.staff__progress { display: flex; flex-wrap: wrap; gap: 8px 14px; align-items: center; padding: 0 16px 12px; font-size: 0.8rem; }
.staff__rank { color: var(--ab-cyan); }
.staff__xp { font-family: var(--ab-font-mono); color: var(--ab-lime); }
.staff__streak { color: var(--ab-text-dim); }
.staff__tag { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 0.72rem; font-weight: 700; }
.staff__tag--ok { background: rgba(61, 220, 132, 0.16); color: var(--ab-success); }
.staff__tag--warn { background: rgba(255, 61, 113, 0.18); color: #ff8fae; }
.staff__tag--idle { background: rgba(120, 150, 255, 0.1); color: var(--ab-text-faint); }
.staff__tag--code { background: rgba(53, 224, 255, 0.14); color: var(--ab-cyan); }
@media (max-width: 760px) {
  .staff__row--head { display: none; }
  .staff__row {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto;
    grid-template-areas:
      "name name status"
      "mood energy pain"
      "sleep fuel fuel";
    gap: 6px 10px; padding: 12px 14px;
  }
  .staff__c-name { grid-area: name; }
  .staff__c-mood { grid-area: mood; }
  .staff__c-energy { grid-area: energy; }
  .staff__c-pain { grid-area: pain; }
  .staff__c-sleep { grid-area: sleep; }
  .staff__c-fuel { grid-area: fuel; }
  .staff__c-status { grid-area: status; justify-self: end; }
  .staff__cell { white-space: normal; }
  .staff__progress { padding: 0 14px 12px; }
}
@media (prefers-reduced-motion: reduce) { .staff__spinner { animation-duration: 2s; } }
</style>