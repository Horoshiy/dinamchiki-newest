<script setup lang="ts">
// Карточка игрока для тренера: профиль, код (выдача/отзыв + QR), ответы по дням,
// заметки. Просмотр прямых ответов пишется в журнал (аудит) на сервере.
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import * as api from '../api/base.api'
import { BaseApiError } from '../api/base.client'
import type { CodeInfo, CodeIssue, StaffAnswer, StaffChildDetail } from '../api/base.types'
import { useBaseAuth } from '../stores/baseAuth'
import RankBadge from '../components/RankBadge.vue'
import BadgeShelf from '../components/BadgeShelf.vue'

const props = defineProps<{ id: string }>()
const auth = useBaseAuth()
const router = useRouter()
const childId = computed(() => Number(props.id))

const detail = ref<StaffChildDetail | null>(null)
const codeInfo = ref<CodeInfo | null>(null)
const loading = ref(false)
const error = ref('')

const issuing = ref(false)
const issued = ref<CodeIssue | null>(null)
const revoking = ref(false)
const confirmRevoke = ref(false)
const copied = ref(false)

const noteText = ref('')
const addingNote = ref(false)
const expandedDay = ref<string | null>(null)

function authFail(e: unknown): boolean {
  if (e instanceof BaseApiError && (e.status === 401 || e.status === 403)) { auth.logoutStaff(); void router.push({ name: 'base-staff' }); return true }
  return false
}

async function load() {
  if (!auth.staffToken) return
  loading.value = true
  error.value = ''
  try {
    const [d, c] = await Promise.all([
      api.staffChild(auth.staffToken, childId.value),
      api.getCode(auth.staffToken, childId.value),
    ])
    detail.value = d
    codeInfo.value = c
  } catch (e) {
    if (authFail(e)) return
    error.value = e instanceof BaseApiError ? e.message : 'Не удалось загрузить карточку.'
  } finally {
    loading.value = false
  }
}

async function issue() {
  if (!auth.staffToken || issuing.value) return
  issuing.value = true
  error.value = ''
  try {
    issued.value = await api.issueCode(auth.staffToken, childId.value)
    if (detail.value) detail.value.has_code = true
    codeInfo.value = await api.getCode(auth.staffToken, childId.value)
  } catch (e) {
    if (authFail(e)) return
    error.value = e instanceof BaseApiError ? e.message : 'Не удалось выдать код.'
  } finally {
    issuing.value = false
  }
}

async function revoke() {
  if (!auth.staffToken || revoking.value) return
  revoking.value = true
  try {
    await api.revokeCode(auth.staffToken, childId.value)
    if (detail.value) detail.value.has_code = false
    codeInfo.value = { exists: false, locked: false }
    issued.value = null
    confirmRevoke.value = false
  } catch (e) {
    if (authFail(e)) return
    error.value = e instanceof BaseApiError ? e.message : 'Не удалось отозвать код.'
  } finally {
    revoking.value = false
  }
}

async function copyLink() {
  if (!issued.value) return
  try {
    await navigator.clipboard.writeText(issued.value.login_url)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch { /* clipboard недоступен — ссылка видна на экране */ }
}

async function addNote() {
  const text = noteText.value.trim()
  if (!text || !auth.staffToken || addingNote.value || !detail.value) return
  addingNote.value = true
  try {
    const note = await api.addNote(auth.staffToken, childId.value, text)
    detail.value.notes.unshift(note)
    noteText.value = ''
  } catch (e) {
    if (authFail(e)) return
    error.value = e instanceof BaseApiError ? e.message : 'Не удалось сохранить заметку.'
  } finally {
    addingNote.value = false
  }
}

function answerText(a: StaffAnswer): string {
  if (a.kind === 'scale' || a.kind === 'body') return `${a.value_int}/5`
  if (a.kind === 'multi') return a.values.join(', ') || '—'
  return a.value_text || '—'
}
function fmtDate(d: string): string {
  if (!d) return '—'
  const [y, m, day] = d.split('-')
  return `${day}.${m}.${y}`
}
function fmtTime(t: string): string {
  const d = new Date(t)
  return isNaN(d.getTime()) ? '' : d.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

onMounted(load)
</script>

<template>
  <div class="child">
    <RouterLink :to="{ name: 'base-staff' }" class="child__back">← в тренерскую</RouterLink>

    <div v-if="loading" class="child__loading ab-card"><span class="child__spinner" />Загружаем карточку…</div>
    <div v-else-if="error && !detail" class="ab-card child__loading">
      <p class="ab-alert ab-alert--error">{{ error }}</p>
      <button class="ab-btn ab-btn--ghost" type="button" @click="load">Повторить</button>
    </div>

    <template v-else-if="detail">
      <!-- Профиль -->
      <section class="child__hero ab-card ab-rise">
        <RankBadge :rank="detail.rank" :xp="detail.xp" size="md" />
        <div class="child__id">
          <h1 class="child__name">{{ detail.full_name }}</h1>
          <div class="child__metrics">
            <span>🔥 серия {{ detail.streak_current }}</span>
            <span>🏅 рекорд {{ detail.streak_best }}</span>
            <span>⚡ {{ detail.xp }} XP</span>
          </div>
        </div>
      </section>

      <p v-if="error" class="ab-alert ab-alert--error">{{ error }}</p>

      <!-- Код игрока -->
      <section class="child__code ab-card ab-rise ab-rise-1">
        <h2 class="child__h">Код игрока</h2>
        <div v-if="issued" class="child__issued">
          <p class="ab-alert ab-alert--warn">Код показывается один раз. Передай его игроку лично или покажи QR.</p>
          <div class="child__issued-code ab-mono">{{ issued.code }}</div>
          <img v-if="issued.qr_png" class="child__qr" :src="`data:image/png;base64,${issued.qr_png}`" alt="QR-код для входа" width="200" height="200" />
          <div class="child__issued-url ab-mono">{{ issued.login_url }}</div>
          <div class="child__issued-actions">
            <button class="ab-btn ab-btn--sm" type="button" @click="copyLink">{{ copied ? '✓ Скопировано' : 'Скопировать ссылку' }}</button>
            <button class="ab-btn ab-btn--ghost ab-btn--sm" type="button" @click="issued = null">Готово</button>
          </div>
        </div>
        <template v-else>
          <div v-if="codeInfo?.exists" class="child__code-info">
            <span class="staff-tag staff-tag--code">активен</span>
            <span class="ab-mono">{{ codeInfo.hint }}</span>
            <span v-if="codeInfo.locked" class="staff-tag staff-tag--warn">заблокирован</span>
            <span class="ab-faint">создан {{ fmtTime(codeInfo.created_at || '') }}</span>
            <span v-if="codeInfo.last_used_at" class="ab-faint">вход {{ fmtTime(codeInfo.last_used_at) }}</span>
          </div>
          <p v-else class="ab-dim">Код ещё не выдан — игрок не сможет войти.</p>
          <div class="child__code-actions">
            <button class="ab-btn ab-btn--sm" type="button" :disabled="issuing" @click="issue">
              {{ issuing ? 'Выпускаем…' : codeInfo?.exists ? 'Перевыпустить код' : 'Выдать код' }}
            </button>
            <template v-if="codeInfo?.exists">
              <button v-if="!confirmRevoke" class="ab-btn ab-btn--ghost ab-btn--sm" type="button" @click="confirmRevoke = true">Отозвать</button>
              <button v-else class="ab-btn ab-btn--danger ab-btn--sm" type="button" :disabled="revoking" @click="revoke">
                {{ revoking ? 'Отзываем…' : 'Точно отозвать?' }}
              </button>
            </template>
          </div>
        </template>
      </section>

      <!-- Ответы по дням -->
      <section class="child__subs ab-card ab-rise ab-rise-2">
        <div class="child__subs-head">
          <h2 class="child__h">Ответы по дням</h2>
          <span class="child__audit ab-faint">🔒 просмотр записывается в журнал</span>
        </div>
        <p v-if="!detail.submissions.length" class="ab-dim">Игрок ещё не проходил разминки.</p>
        <div v-for="s in detail.submissions" :key="s.day_key" class="child__sub" :class="{ 'is-warn': s.needs_attention }">
          <button class="child__sub-head" type="button" @click="expandedDay = expandedDay === s.day_key ? null : s.day_key">
            <span class="child__sub-date">{{ fmtDate(s.day_key) }}</span>
            <span class="child__sub-metrics">
              <span title="Настрой">🙂 {{ s.mood }}/5</span>
              <span title="Силы">⚡ {{ s.energy }}/5</span>
              <span title="Боль" :class="{ 'is-pain': s.pain_score >= 3 }">🩹 {{ s.pain_score }}/5</span>
            </span>
            <span v-if="s.needs_attention" class="staff-tag staff-tag--warn">боль</span>
            <span class="child__sub-xp ab-mono">+{{ s.xp_granted }} XP</span>
            <span class="child__sub-toggle">{{ expandedDay === s.day_key ? '−' : '+' }}</span>
          </button>
          <ul v-if="expandedDay === s.day_key" class="child__answers">
            <li v-for="(a, i) in s.answers" :key="i">
              <span class="child__answer-q">{{ a.text }}</span>
              <span class="child__answer-v">{{ answerText(a) }}</span>
            </li>
          </ul>
        </div>
      </section>

      <!-- Значки -->
      <section class="ab-card child__block ab-rise ab-rise-2">
        <h2 class="child__h">Значки</h2>
        <BadgeShelf :badges="detail.badges" />
      </section>

      <!-- Заметки тренера -->
      <section class="child__notes ab-card ab-rise ab-rise-3">
        <h2 class="child__h">Заметки тренера</h2>
        <div class="child__note-form">
          <textarea v-model="noteText" class="ab-input" rows="2" maxlength="1000" placeholder="Заметка видна только персоналу…" />
          <button class="ab-btn ab-btn--sm" type="button" :disabled="!noteText.trim() || addingNote" @click="addNote">
            {{ addingNote ? 'Сохраняем…' : 'Добавить' }}
          </button>
        </div>
        <ul v-if="detail.notes.length" class="child__note-list">
          <li v-for="n in detail.notes" :key="n.id">
            <p>{{ n.text }}</p>
            <span class="ab-faint">{{ fmtTime(n.created_at) }}</span>
          </li>
        </ul>
        <p v-else class="ab-faint">Заметок пока нет.</p>
      </section>
    </template>
  </div>
</template>

<style scoped lang="scss">
.child { display: flex; flex-direction: column; gap: 18px; }
.child__back { color: var(--ab-text-dim); text-decoration: none; font-size: 0.9rem; align-self: flex-start; }
.child__back:hover { color: var(--ab-cyan); }
.child__loading { display: flex; flex-direction: column; align-items: center; gap: 14px; padding: 48px 24px; color: var(--ab-text-dim); }
.child__spinner { width: 34px; height: 34px; border-radius: 50%; border: 3px solid var(--ab-line); border-top-color: var(--ab-cyan); animation: ab-sweep 0.9s linear infinite; }
.child__hero { display: flex; align-items: center; gap: 22px; padding: 26px; flex-wrap: wrap; }
.child__name { font-size: clamp(1.5rem, 5vw, 2rem); }
.child__metrics { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 12px; font-size: 0.9rem; color: var(--ab-text-dim); }
.child__h { font-size: 1.15rem; margin-bottom: 16px; }
.child__block { padding: 24px; }
.child__code { padding: 24px; }
.child__code-info { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin-bottom: 16px; font-size: 0.88rem; }
.child__code-actions { display: flex; flex-wrap: wrap; gap: 10px; }
.child__issued { display: flex; flex-direction: column; align-items: center; gap: 14px; text-align: center; }
.child__issued-code { font-size: 2rem; letter-spacing: 0.2em; color: var(--ab-lime); padding: 12px 20px; border-radius: var(--ab-radius-sm); background: rgba(198, 242, 78, 0.1); border: 1px dashed rgba(198, 242, 78, 0.5); }
.child__qr { border-radius: 12px; background: #fff; padding: 8px; }
.child__issued-url { font-size: 0.76rem; color: var(--ab-text-dim); word-break: break-all; max-width: 320px; }
.child__issued-actions { display: flex; gap: 10px; }
.child__subs { padding: 24px; }
.child__subs-head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.child__audit { font-size: 0.74rem; }
.child__sub { border: 1px solid var(--ab-line); border-radius: var(--ab-radius-sm); margin-bottom: 8px; overflow: hidden; }
.child__sub.is-warn { border-color: rgba(255, 61, 113, 0.45); }
.child__sub-head { display: flex; align-items: center; gap: 14px; width: 100%; padding: 14px 16px; background: none; border: none; color: var(--ab-text); cursor: pointer; text-align: left; font-size: 0.9rem; flex-wrap: wrap; }
.child__sub-head:hover { background: rgba(120, 150, 255, 0.07); }
.child__sub-date { font-family: var(--ab-font-display); font-weight: 700; min-width: 88px; }
.child__sub-metrics { display: flex; gap: 12px; color: var(--ab-text-dim); font-size: 0.84rem; }
.child__sub-metrics .is-pain { color: var(--ab-raspberry); font-weight: 700; }
.child__sub-xp { margin-left: auto; color: var(--ab-lime); font-size: 0.8rem; }
.child__sub-toggle { font-size: 1.2rem; color: var(--ab-text-faint); width: 20px; text-align: center; }
.child__answers { list-style: none; margin: 0; padding: 0 16px 14px; display: flex; flex-direction: column; gap: 8px; }
.child__answers li { display: flex; justify-content: space-between; gap: 16px; padding: 8px 12px; border-radius: 8px; background: rgba(6, 9, 18, 0.5); font-size: 0.88rem; }
.child__answer-q { color: var(--ab-text-dim); }
.child__answer-v { font-weight: 700; color: var(--ab-cyan); text-align: right; }
.child__notes { padding: 24px; }
.child__note-form { display: flex; gap: 10px; align-items: flex-start; margin-bottom: 16px; }
.child__note-form .ab-input { flex: 1; }
.child__note-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
.child__note-list li { padding: 12px 16px; border-radius: var(--ab-radius-sm); background: rgba(6, 9, 18, 0.5); border: 1px solid var(--ab-line); }
.child__note-list p { margin: 0 0 6px; font-size: 0.92rem; line-height: 1.45; }
.child__note-list span { font-size: 0.74rem; }
.staff-tag { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 0.72rem; font-weight: 700; }
.staff-tag--code { background: rgba(53, 224, 255, 0.14); color: var(--ab-cyan); }
.staff-tag--warn { background: rgba(255, 61, 113, 0.18); color: #ff8fae; }
@media (prefers-reduced-motion: reduce) { .child__spinner { animation-duration: 2s; } }
</style>