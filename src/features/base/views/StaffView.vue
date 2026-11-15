<script setup lang="ts">
// Штаб тренера: вход по SMS, обзор агентов, «требуют внимания», сводка по команде.
// Прямые ответы — только в карточке ребёнка (с аудитом). Здесь — сводка без ответов.
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import * as api from '../api/base.api'
import { BaseApiError } from '../api/base.client'
import type { AttentionRow, StaffChildRow, TeamAggregate } from '../api/base.types'
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

const query = ref('')
const filter = ref<'all' | 'done' | 'pending' | 'attention' | 'nocode'>('all')
const sort = ref<'name' | 'xp' | 'streak'>('name')

const teamId = ref('')
const agg = ref<TeamAggregate | null>(null)
const aggLoading = ref(false)
const aggError = ref('')

const filtered = computed(() => {
  let list = rows.value
  const q = query.value.trim().toLowerCase()
  if (q) list = list.filter((r) => r.full_name.toLowerCase().includes(q) || r.codename.toLowerCase().includes(q))
  if (filter.value === 'done') list = list.filter((r) => r.completed_today)
  else if (filter.value === 'pending') list = list.filter((r) => !r.completed_today)
  else if (filter.value === 'attention') list = list.filter((r) => r.needs_attention_today)
  else if (filter.value === 'nocode') list = list.filter((r) => !r.has_code)
  const sorted = [...list]
  if (sort.value === 'xp') sorted.sort((a, b) => b.xp - a.xp)
  else if (sort.value === 'streak') sorted.sort((a, b) => b.streak_current - a.streak_current)
  else sorted.sort((a, b) => a.full_name.localeCompare(b.full_name, 'ru'))
  return sorted
})

const doneCount = computed(() => rows.value.filter((r) => r.completed_today).length)

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
    error.value = e instanceof BaseApiError ? e.message : 'Не удалось загрузить штаб.'
  } finally {
    loading.value = false
  }
}

async function loadAggregate() {
  const id = Number(teamId.value)
  if (!id || !auth.staffToken) return
  aggLoading.value = true
  aggError.value = ''
  agg.value = null
  try {
    agg.value = await api.staffTeamAggregate(auth.staffToken, id)
  } catch (e) {
    if (authFail(e)) return
    aggError.value = e instanceof BaseApiError ? e.message : 'Не удалось загрузить сводку.'
  } finally {
    aggLoading.value = false
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
      <h1 class="staff-login__title">Штаб тренера</h1>
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
          {{ auth.staffLoading ? 'Проверяем…' : 'Войти в штаб' }}
        </button>
        <button class="staff-login__back" type="button" @click="loginStep = 'phone'; code = ''; loginError = ''">← изменить номер</button>
      </template>

      <p v-if="loginError" class="ab-alert ab-alert--error" role="alert">{{ loginError }}</p>
      <RouterLink :to="{ name: 'base-login' }" class="staff-login__child">Я агент → вход по коду</RouterLink>
    </section>

    <!-- ─── Дашборд ─── -->
    <template v-else>
      <header class="staff__head ab-rise">
        <div>
          <span class="ab-eyebrow">{{ auth.staffRole === 'admin' ? 'Администратор' : 'Тренер' }} · {{ auth.staffName }}</span>
          <h1 class="staff__title">Штаб базы</h1>
        </div>
        <button class="ab-btn ab-btn--ghost ab-btn--sm" type="button" :disabled="loading" @click="loadDashboard">↻ Обновить</button>
      </header>

      <!-- Требуют внимания -->
      <section v-if="attention.length" class="staff__attention ab-rise ab-rise-1">
        <button class="staff__attention-head" type="button" @click="showAttention = !showAttention">
          <span class="staff__attention-icon">⚠️</span>
          <span>Требуют внимания: <b>{{ attention.length }}</b> {{ attention.length === 1 ? 'агент отметил боль' : 'агентов отметили боль' }}</span>
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

      <!-- Панель управления -->
      <section class="staff__toolbar ab-rise ab-rise-1">
        <input v-model="query" class="ab-input staff__search" type="search" placeholder="Поиск по имени или позывному…" />
        <select v-model="filter" class="ab-input staff__select" aria-label="Фильтр">
          <option value="all">Все агенты</option>
          <option value="done">Прошли сегодня</option>
          <option value="pending">Не прошли сегодня</option>
          <option value="attention">Требуют внимания</option>
          <option value="nocode">Без кода</option>
        </select>
        <select v-model="sort" class="ab-input staff__select" aria-label="Сортировка">
          <option value="name">По имени</option>
          <option value="xp">По XP</option>
          <option value="streak">По серии</option>
        </select>
      </section>

      <div class="staff__summary ab-faint ab-rise ab-rise-1">
        {{ filtered.length }} из {{ rows.length }} · сегодня прошли {{ doneCount }}
      </div>

      <!-- Таблица агентов -->
      <section v-if="loading" class="staff__loading ab-card"><span class="staff__spinner" />Загружаем агентов…</section>
      <section v-else-if="!filtered.length" class="staff__empty ab-card ab-dim">
        {{ rows.length ? 'Никого не найдено по фильтру.' : 'Пока нет доступных агентов.' }}
      </section>
      <section v-else class="staff__table ab-card ab-rise ab-rise-2">
        <div class="staff__row staff__row--head">
          <span>Агент</span><span>Звание</span><span>XP</span><span>Серия</span><span>Сегодня</span><span>Код</span>
        </div>
        <button v-for="r in filtered" :key="r.child_id" type="button" class="staff__row" @click="openChild(r.child_id)">
          <span class="staff__name">
            <b>{{ r.full_name }}</b>
            <i class="ab-mono">{{ r.codename }}</i>
          </span>
          <span class="staff__rank">{{ r.rank }}</span>
          <span class="staff__xp">{{ r.xp }}</span>
          <span class="staff__streak">🔥 {{ r.streak_current }}</span>
          <span>
            <span v-if="r.needs_attention_today" class="staff__tag staff__tag--warn">боль</span>
            <span v-else-if="r.completed_today" class="staff__tag staff__tag--ok">✓ прошёл</span>
            <span v-else class="staff__tag staff__tag--idle">ждём</span>
          </span>
          <span>
            <span v-if="r.has_code" class="staff__tag staff__tag--code">есть</span>
            <span v-else class="staff__tag staff__tag--idle">нет</span>
          </span>
        </button>
      </section>

      <!-- Сводка по команде -->
      <section class="staff__agg ab-card ab-rise ab-rise-3">
        <h2 class="staff__h">Сводка по команде</h2>
        <p class="ab-faint staff__agg-hint">Средние за 14 дней. Показываем только если ответили ≥ 3 агентов — иначе среднее выдаёт конкретного ребёнка.</p>
        <div class="staff__agg-form">
          <input v-model="teamId" class="ab-input" type="number" min="1" placeholder="ID команды" @keydown.enter="loadAggregate" />
          <button class="ab-btn ab-btn--sm" type="button" :disabled="!teamId || aggLoading" @click="loadAggregate">Показать</button>
        </div>
        <p v-if="aggError" class="ab-alert ab-alert--error">{{ aggError }}</p>
        <template v-if="agg">
          <p v-if="agg.insufficient" class="ab-alert ab-alert--info">{{ agg.message || 'Мало данных.' }}</p>
          <template v-else>
            <div class="staff__agg-stats">
              <div class="staff__agg-stat"><b>{{ agg.avg_mood }}</b><span>настрой</span></div>
              <div class="staff__agg-stat"><b>{{ agg.avg_energy }}</b><span>энергия</span></div>
              <div class="staff__agg-stat" :class="{ 'is-warn': agg.avg_pain >= 2 }"><b>{{ agg.avg_pain }}</b><span>боль</span></div>
              <div class="staff__agg-stat"><b>{{ agg.responded_count }}/{{ agg.children_count }}</b><span>ответили</span></div>
              <div class="staff__agg-stat" :class="{ 'is-warn': agg.attention_count > 0 }"><b>{{ agg.attention_count }}</b><span>тревог</span></div>
            </div>
            <div class="staff__bars">
              <div v-for="d in agg.daily" :key="d.day_key" class="staff__bar" :title="`${d.day_key}: ответили ${d.completed}`">
                <span class="staff__bar-fill" :style="{ height: d.completed ? (d.avg_mood / 5 * 100) + '%' : '4%' }" :class="{ 'is-empty': !d.completed }" />
                <span class="staff__bar-day">{{ d.day_key.slice(8, 10) }}</span>
              </div>
            </div>
          </template>
        </template>
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
.staff__toolbar { display: flex; gap: 10px; flex-wrap: wrap; }
.staff__search { flex: 1; min-width: 200px; }
.staff__select { flex: 0 0 auto; width: auto; min-width: 150px; cursor: pointer; }
.staff__summary { font-size: 0.82rem; }
.staff__loading, .staff__empty { display: flex; align-items: center; justify-content: center; gap: 12px; padding: 40px; }
.staff__spinner { width: 30px; height: 30px; border-radius: 50%; border: 3px solid var(--ab-line); border-top-color: var(--ab-cyan); animation: ab-sweep 0.9s linear infinite; }
.staff__table { padding: 8px; overflow: hidden; }
.staff__row { display: grid; grid-template-columns: 2.2fr 1.3fr 0.7fr 0.8fr 1.1fr 0.7fr; gap: 10px; align-items: center; width: 100%; padding: 14px 16px; border: none; border-radius: var(--ab-radius-sm); background: none; color: var(--ab-text); text-align: left; cursor: pointer; font-size: 0.92rem; transition: background 140ms ease; }
.staff__row:not(.staff__row--head):hover { background: rgba(120, 150, 255, 0.1); }
.staff__row--head { cursor: default; font-family: var(--ab-font-mono); font-size: 0.7rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ab-text-faint); border-bottom: 1px solid var(--ab-line); border-radius: 0; }
.staff__name { display: flex; flex-direction: column; gap: 2px; }
.staff__name i { font-style: normal; font-size: 0.74rem; color: var(--ab-text-faint); }
.staff__rank { color: var(--ab-cyan); font-size: 0.84rem; }
.staff__xp { font-family: var(--ab-font-mono); color: var(--ab-lime); }
.staff__streak { font-size: 0.84rem; }
.staff__tag { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 0.72rem; font-weight: 700; }
.staff__tag--ok { background: rgba(61, 220, 132, 0.16); color: var(--ab-success); }
.staff__tag--warn { background: rgba(255, 61, 113, 0.18); color: #ff8fae; }
.staff__tag--idle { background: rgba(120, 150, 255, 0.1); color: var(--ab-text-faint); }
.staff__tag--code { background: rgba(53, 224, 255, 0.14); color: var(--ab-cyan); }
.staff__agg { padding: 24px; }
.staff__h { font-size: 1.2rem; margin-bottom: 8px; }
.staff__agg-hint { font-size: 0.82rem; margin: 0 0 16px; }
.staff__agg-form { display: flex; gap: 10px; max-width: 320px; margin-bottom: 16px; }
.staff__agg-stats { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 18px; }
.staff__agg-stat { flex: 1; min-width: 90px; display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 14px; border-radius: var(--ab-radius-sm); background: rgba(6, 9, 18, 0.5); border: 1px solid var(--ab-line); }
.staff__agg-stat b { font-family: var(--ab-font-display); font-size: 1.5rem; color: var(--ab-cyan); }
.staff__agg-stat span { font-size: 0.74rem; color: var(--ab-text-faint); }
.staff__agg-stat.is-warn b { color: var(--ab-raspberry); }
.staff__bars { display: flex; align-items: flex-end; gap: 5px; height: 120px; }
.staff__bar { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; gap: 4px; height: 100%; }
.staff__bar-fill { width: 100%; border-radius: 4px 4px 0 0; background: linear-gradient(180deg, var(--ab-cyan), var(--ab-blue)); min-height: 4px; transition: height 400ms ease; }
.staff__bar-fill.is-empty { background: rgba(120, 150, 255, 0.12); }
.staff__bar-day { font-family: var(--ab-font-mono); font-size: 0.6rem; color: var(--ab-text-faint); }
@media (max-width: 760px) {
  .staff__row { grid-template-columns: 1.8fr 1fr 0.6fr; grid-auto-rows: min-content; }
  .staff__row--head span:nth-child(n+4) { display: none; }
  .staff__row:not(.staff__row--head) span:nth-child(4) { display: none; }
  .staff__rank { font-size: 0.76rem; }
}
@media (prefers-reduced-motion: reduce) { .staff__spinner { animation-duration: 2s; } }
</style>