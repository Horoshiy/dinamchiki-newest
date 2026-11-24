<script setup lang="ts">
// Карточка игрока: звание, XP, серия, значки, календарь, прозвище.
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import * as api from '../api/base.api'
import { BaseApiError } from '../api/base.client'
import type { BaseProgress, TeamBoard } from '../api/base.types'
import { useBaseAuth } from '../stores/baseAuth'
import { useBaseSound } from '../stores/baseSound'
import RankBadge from '../components/RankBadge.vue'
import BadgeShelf from '../components/BadgeShelf.vue'
import StreakCalendar from '../components/StreakCalendar.vue'

const auth = useBaseAuth()
const sound = useBaseSound()
const router = useRouter()

const progress = ref<BaseProgress | null>(null)
const teamBoard = ref<TeamBoard | null>(null)
const loading = ref(false)
const error = ref('')
const editing = ref(false)
const codename = ref('')
const saving = ref(false)

const rankPercent = computed(() => {
  const p = progress.value
  if (!p) return 0
  const ladder = p.rank_ladder
  const curIdx = ladder.findIndex((r) => r.current)
  const cur = ladder[curIdx]
  const next = ladder[curIdx + 1]
  if (!cur || !next) return 100
  const span = next.min_xp - cur.min_xp
  return span > 0 ? Math.min(100, Math.round(((p.xp - cur.min_xp) / span) * 100)) : 100
})

async function load() {
  if (!auth.childToken) return
  loading.value = true
  error.value = ''
  try {
    progress.value = await api.getProgress(auth.childToken)
    if (!auth.me) await auth.loadMe().catch(() => {})
    codename.value = auth.me?.codename ?? ''
    // Место в команде — необязательный блок: при ошибке карточка работает.
    teamBoard.value = await api.getTeamBoard(auth.childToken).catch(() => null)
  } catch (e) {
    if (e instanceof BaseApiError && (e.status === 401 || e.status === 403)) { auth.logoutChild(); void router.push({ name: 'base-login' }); return }
    error.value = e instanceof BaseApiError ? e.message : 'Не удалось загрузить карточку.'
  } finally {
    loading.value = false
  }
}

async function saveCodename() {
  const name = codename.value.trim()
  if (!name || name === auth.me?.codename) { editing.value = false; return }
  saving.value = true
  try {
    await auth.setCodename(name)
    sound.play('success')
    editing.value = false
  } catch (e) {
    error.value = e instanceof BaseApiError ? e.message : 'Не удалось сохранить прозвище.'
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="progress">
    <div v-if="loading" class="progress__loading ab-card"><span class="progress__spinner" />Загружаем карточку…</div>
    <div v-else-if="error && !progress" class="ab-card progress__loading">
      <p class="ab-alert ab-alert--error">{{ error }}</p>
      <button class="ab-btn ab-btn--ghost" type="button" @click="load">Повторить</button>
    </div>

    <template v-else-if="progress">
      <!-- Шапка профиля -->
      <section class="progress__hero ab-card ab-rise">
        <RankBadge :rank="progress.rank" :xp="progress.xp" size="lg" />
        <div class="progress__id">
          <template v-if="!editing">
            <h1 class="progress__codename">{{ auth.me?.codename || 'Игрок' }}</h1>
            <button class="progress__edit" type="button" @click="editing = true">✎ своё прозвище</button>
          </template>
          <template v-else>
            <div class="progress__edit-row">
              <input v-model="codename" class="ab-input" maxlength="24" placeholder="Твоё прозвище" @keydown.enter="saveCodename" />
              <button class="ab-btn ab-btn--sm" type="button" :disabled="saving" @click="saveCodename">OK</button>
            </div>
          </template>
          <div class="progress__rankbar">
            <div class="progress__rankbar-track"><span :style="{ width: rankPercent + '%' }" /></div>
            <p v-if="auth.me?.rank_progress && !auth.me.rank_progress.maxed" class="progress__rankhint ab-faint">
              До звания «{{ auth.me.rank_progress.next_title }}» — {{ auth.me.rank_progress.to_next }} XP
            </p>
            <p v-else class="progress__rankhint ab-faint">Максимальное звание. Ты легенда клуба! 🏆</p>
          </div>
        </div>
      </section>

      <p v-if="error" class="ab-alert ab-alert--error">{{ error }}</p>

      <!-- Место в команде по XP -->
      <section v-if="teamBoard?.me" class="progress__team ab-card ab-rise ab-rise-1">
        <div class="progress__team-place">
          <b>{{ teamBoard.me.place }}-е место</b>
          <span>в команде по XP{{ teamBoard.team_name ? ' · ' + teamBoard.team_name : '' }}</span>
        </div>
        <RouterLink :to="{ name: 'base-team' }" class="ab-btn ab-btn--ghost ab-btn--sm progress__team-link">Таблица команды →</RouterLink>
      </section>

      <!-- Быстрые цифры -->
      <section class="progress__stats ab-rise ab-rise-1">
        <div class="progress__stat ab-panel"><b>{{ progress.missions_total }}</b><span>разминок</span></div>
        <div class="progress__stat ab-panel"><b>{{ progress.xp }}</b><span>всего XP</span></div>
        <div class="progress__stat ab-panel"><b>{{ progress.streak_best }}</b><span>рекорд серии</span></div>
        <RouterLink
          v-if="!auth.me?.completed_today && auth.me?.checkin_open !== false"
          :to="{ name: 'base-mission' }" class="progress__cta ab-btn ab-btn--lime ab-btn--sm"
        >Разминка дня →</RouterLink>
        <div v-else-if="auth.me?.checkin_open === false && !auth.me?.completed_today" class="progress__done ab-panel">Сегодня выходной — откроется в понедельник</div>
        <div v-else class="progress__done ab-panel">✓ сегодня выполнено</div>
      </section>

      <!-- Серия -->
      <section class="ab-card progress__block ab-rise ab-rise-2">
        <h2 class="progress__h">Серия дней</h2>
        <StreakCalendar :calendar="progress.calendar" :current="progress.streak_current" :best="progress.streak_best" />
      </section>

      <!-- Лестница званий -->
      <section class="ab-card progress__block ab-rise ab-rise-2">
        <h2 class="progress__h">Путь игрока</h2>
        <ol class="ladder">
          <li v-for="r in progress.rank_ladder" :key="r.title" class="ladder__step" :class="{ 'is-reached': r.reached, 'is-current': r.current }">
            <span class="ladder__mark" />
            <span class="ladder__title">{{ r.title }}</span>
            <span class="ladder__xp ab-mono">{{ r.min_xp }} XP</span>
          </li>
        </ol>
      </section>

      <!-- Значки -->
      <section class="ab-card progress__block ab-rise ab-rise-3">
        <h2 class="progress__h">Значки</h2>
        <BadgeShelf :badges="progress.badges" />
      </section>
    </template>
  </div>
</template>

<style scoped lang="scss">
.progress { display: flex; flex-direction: column; gap: 18px; }
.progress__loading { display: flex; flex-direction: column; align-items: center; gap: 14px; padding: 48px 24px; color: var(--ab-text-dim); }
.progress__spinner { width: 36px; height: 36px; border-radius: 50%; border: 3px solid var(--ab-line); border-top-color: var(--ab-cyan); animation: ab-sweep 0.9s linear infinite; }
.progress__hero { display: flex; align-items: center; gap: 24px; padding: 28px 26px; flex-wrap: wrap; }
.progress__id { flex: 1; min-width: 220px; }
.progress__codename { font-size: clamp(1.6rem, 5vw, 2.2rem); }
.progress__edit { background: none; border: none; color: var(--ab-cyan); font-size: 0.84rem; cursor: pointer; padding: 4px 0; }
.progress__edit-row { display: flex; gap: 10px; align-items: center; }
.progress__rankbar { margin-top: 14px; }
.progress__rankbar-track { height: 10px; border-radius: 999px; background: rgba(120, 150, 255, 0.12); overflow: hidden; }
.progress__rankbar-track span { display: block; height: 100%; border-radius: 999px; background: linear-gradient(90deg, var(--ab-blue-bright), var(--ab-lime)); transition: width 600ms ease; }
.progress__rankhint { font-size: 0.8rem; margin: 8px 0 0; }
.progress__stats { display: flex; flex-wrap: wrap; gap: 12px; align-items: stretch; }
.progress__stat { flex: 1; min-width: 96px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; padding: 16px; }
.progress__stat b { font-family: var(--ab-font-display); font-size: 1.7rem; color: var(--ab-cyan); }
.progress__stat span { font-size: 0.76rem; color: var(--ab-text-faint); }
.progress__cta { align-self: center; text-decoration: none; }
.progress__done { display: grid; place-items: center; padding: 16px; color: var(--ab-lime); font-weight: 700; font-size: 0.9rem; }
.progress__block { padding: 24px; }
.progress__team { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 18px 22px; flex-wrap: wrap; }
.progress__team-place { display: flex; flex-direction: column; gap: 2px; }
.progress__team-place b { font-family: var(--ab-font-display); font-size: 1.3rem; color: var(--ab-cyan); }
.progress__team-place span { font-size: 0.85rem; color: var(--ab-text-dim); }
.progress__team-link { text-decoration: none; }
.progress__h { font-size: 1.2rem; margin-bottom: 18px; }
.ladder { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
.ladder__step { display: flex; align-items: center; gap: 14px; padding: 12px 14px; border-radius: var(--ab-radius-sm); border: 1px solid transparent; color: var(--ab-text-faint); }
.ladder__mark { width: 14px; height: 14px; border-radius: 50%; border: 2px solid var(--ab-line-strong); flex: 0 0 auto; }
.ladder__title { flex: 1; font-family: var(--ab-font-display); font-weight: 700; }
.ladder__xp { font-size: 0.78rem; }
.ladder__step.is-reached { color: var(--ab-text-dim); }
.ladder__step.is-reached .ladder__mark { background: var(--ab-lime); border-color: var(--ab-lime); }
.ladder__step.is-current { color: #fff; border-color: var(--ab-blue-bright); background: rgba(30, 80, 216, 0.18); }
.ladder__step.is-current .ladder__mark { background: var(--ab-cyan); border-color: var(--ab-cyan); box-shadow: 0 0 12px var(--ab-cyan); }
@media (prefers-reduced-motion: reduce) { .progress__spinner { animation-duration: 2s; } }
</style>