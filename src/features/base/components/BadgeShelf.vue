<script setup lang="ts">
// Полка значков: заработанные светятся, будущие — под замком.
import type { BaseBadge } from '../api/base.types'

defineProps<{ badges: BaseBadge[] }>()
</script>

<template>
  <div class="badge-shelf">
    <div
      v-for="b in badges"
      :key="b.key"
      class="badge-cell"
      :class="{ 'is-earned': b.earned }"
      :title="b.description"
    >
      <div class="badge-cell__icon">
        <span v-if="b.earned">{{ b.icon }}</span>
        <svg v-else viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <path d="M7 10V7a5 5 0 0 1 10 0v3" fill="none" stroke="currentColor" stroke-width="1.8" />
          <rect x="5" y="10" width="14" height="10" rx="2" fill="currentColor" opacity="0.5" />
        </svg>
      </div>
      <span class="badge-cell__title">{{ b.title }}</span>
      <span class="badge-cell__desc">{{ b.description }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.badge-shelf { display: grid; grid-template-columns: repeat(auto-fill, minmax(128px, 1fr)); gap: 12px; }
.badge-cell {
  display: flex; flex-direction: column; align-items: center; text-align: center; gap: 6px;
  padding: 16px 10px; border-radius: var(--ab-radius-sm);
  background: rgba(6, 9, 18, 0.5); border: 1px solid var(--ab-line);
  transition: transform 160ms ease, box-shadow 200ms ease;
}
.badge-cell.is-earned {
  border-color: rgba(198, 242, 78, 0.5);
  background: linear-gradient(180deg, rgba(198, 242, 78, 0.12), rgba(6, 9, 18, 0.5));
  box-shadow: 0 0 0 1px rgba(198, 242, 78, 0.25), 0 8px 26px rgba(143, 191, 38, 0.18);
}
.badge-cell.is-earned:hover { transform: translateY(-3px); }
.badge-cell__icon {
  display: grid; place-items: center; width: 52px; height: 52px; border-radius: 50%;
  font-size: 1.7rem; background: rgba(120, 150, 255, 0.08); color: var(--ab-text-faint);
}
.badge-cell.is-earned .badge-cell__icon { background: rgba(198, 242, 78, 0.16); animation: ab-pop 420ms ease both; }
.badge-cell__title { font-family: var(--ab-font-display); font-weight: 700; font-size: 0.9rem; }
.badge-cell.is-earned .badge-cell__title { color: var(--ab-lime); }
.badge-cell__desc { font-size: 0.74rem; color: var(--ab-text-faint); line-height: 1.35; }
</style>