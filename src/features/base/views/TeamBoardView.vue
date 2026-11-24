<script setup lang="ts">
// Командная таблица XP: кто из команды впереди. Своё место подсвечено.
import { onMounted, ref } from 'vue'
import * as api from '../api/base.api'
import { BaseApiError } from '../api/base.client'
import type { TeamBoard } from '../api/base.types'
import { useBaseAuth } from '../stores/baseAuth'

const auth = useBaseAuth()
const board = ref<TeamBoard | null>(null)
const loading = ref(false)
const error = ref('')

async function load() {
  if (!auth.childToken) return
  loading.value = true
  error.value = ''
  try {
    board.value = await api.getTeamBoard(auth.childToken)
  } catch (e) {
    error.value = e instanceof BaseApiError ? e.message : 'Не удалось загрузить таблицу команды.'
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="team">
    <div v-if="loading" class="team__loading ab-card"><span class="team__spinner" />Загружаем команду…</div>
    <div v-else-if="error" class="team__loading ab-card">
      <p class="ab-alert ab-alert--error">{{ error }}</p>
      <button class="ab-btn ab-btn--ghost" type="button" @click="load">Повторить</button>
    </div>

    <template v-else-if="board">
      <section class="team__head ab-card ab-rise">
        <span class="ab-eyebrow">Моя команда</span>
        <h1 class="team__title">{{ board.team_name || 'Команда' }}</h1>
        <p class="ab-dim team__sub">Таблица по XP Подтрибунки: разминки, квиз и значки.</p>
        <RouterLink :to="{ name: 'base-progress' }" class="ab-btn ab-btn--ghost ab-btn--sm team__back">← В карточку</RouterLink>
      </section>

      <section class="team__table ab-card ab-rise ab-rise-1">
        <p v-if="board.total === 0" class="ab-dim">В команде пока никого нет.</p>
        <ol v-else class="team__list">
          <li v-for="row in board.items" :key="row.place" class="team__row" :class="{ 'is-me': row.is_me }">
            <span class="team__place">{{ row.place }}</span>
            <span class="team__name">{{ row.name }}<template v-if="row.is_me"> ◀</template></span>
            <span class="team__xp">{{ row.xp }} XP</span>
          </li>
        </ol>
      </section>
    </template>
  </div>
</template>

<style scoped lang="scss">
.team { display: flex; flex-direction: column; gap: 18px; }
.team__loading { display: flex; flex-direction: column; align-items: center; gap: 14px; padding: 48px 24px; }
.team__spinner { width: 36px; height: 36px; border-radius: 50%; border: 3px solid var(--ab-line); border-top-color: var(--ab-cyan); animation: ab-sweep 0.9s linear infinite; }
.team__head { padding: 24px; display: flex; flex-direction: column; align-items: flex-start; gap: 8px; }
.team__title { margin: 0; font-size: clamp(1.4rem, 4vw, 1.9rem); }
.team__sub { margin: 0; font-size: 0.92rem; }
.team__back { margin-top: 8px; text-decoration: none; }
.team__table { padding: 20px; }
.team__list { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }
.team__row { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: var(--ab-radius-sm); background: rgba(120, 150, 255, 0.05); border: 1px solid transparent; }
.team__row.is-me { border-color: var(--ab-blue-bright); background: rgba(59, 109, 255, 0.16); }
.team__place { flex: none; width: 28px; font-family: var(--ab-font-display); font-weight: 800; color: var(--ab-text-dim); }
.team__row.is-me .team__place { color: var(--ab-cyan); }
.team__name { flex: 1; font-weight: 600; }
.team__xp { font-weight: 800; color: var(--ab-lime); }
@media (prefers-reduced-motion: reduce) { .team__spinner { animation-duration: 2s; } }
</style>