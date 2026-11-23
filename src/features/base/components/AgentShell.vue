<script setup lang="ts">
// Оболочка «Подтрибунки»: тёмный футбольный фон, верхняя панель, звук, навигация.
// Изолирована от светлой темы сайта — всё под .agent-base.
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import '../styles/base.scss'
import { useBaseAuth } from '../stores/baseAuth'
import { useBaseSound } from '../stores/baseSound'
import SoundToggle from './SoundToggle.vue'
import BaseNav from './BaseNav.vue'

const auth = useBaseAuth()
const sound = useBaseSound()
const route = useRoute()
const router = useRouter()

const isStaffArea = computed(() => route.name === 'base-staff' || route.name === 'base-staff-child')
const isAdminArea = computed(() => route.name === 'base-admin')
const showChildNav = computed(() => auth.isChildAuthed && !isStaffArea.value && !isAdminArea.value)
const showStaffNav = computed(() => auth.isStaffAuthed && (isStaffArea.value || isAdminArea.value))

const brandTo = computed(() => {
  if (isAdminArea.value) return { name: 'base-admin' }
  if (isStaffArea.value) return { name: 'base-staff' }
  return auth.isChildAuthed ? { name: 'base-mission' } : { name: 'base-login' }
})

// Настройка звука с сервера важнее локальной, когда ребёнок вошёл.
watch(() => auth.me?.sound_on, (v) => {
  if (typeof v === 'boolean' && v !== sound.enabled) sound.setEnabled(v)
})

function logout() {
  if (isStaffArea.value || isAdminArea.value) {
    auth.logoutStaff()
    void router.push(isAdminArea.value ? { name: 'base-admin' } : { name: 'base-staff' })
  } else {
    auth.logoutChild()
    void router.push({ name: 'base-login' })
  }
}
</script>

<template>
  <div class="agent-base">
    <div class="ab-bg" aria-hidden="true">
      <span class="ab-orb ab-orb--blue" />
      <span class="ab-orb ab-orb--cyan" />
      <span class="ab-orb ab-orb--lime" />
    </div>

    <div class="ab-content ab-shell">
      <header class="ab-topbar">
        <RouterLink :to="brandTo" class="ab-brand">
          <span class="ab-brand__mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22">
              <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.6" />
              <path d="M12 7.4l3.3 2.4-1.25 3.9h-4.1L8.7 9.8z" fill="currentColor" />
              <path d="M12 3v4.4M4.1 9.6l4.6 1.5M19.9 9.6l-4.6 1.5M7.2 20.2l2.7-3.5M16.8 20.2l-2.7-3.5" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
            </svg>
          </span>
          <span class="ab-brand__text">ПОДТРИБУНКА</span>
        </RouterLink>

        <BaseNav v-if="showChildNav" mode="child" />
        <BaseNav v-else-if="showStaffNav" mode="staff" :admin="auth.staffRole === 'admin'" />

        <div class="ab-topbar__right">
          <span v-if="showStaffNav && auth.staffName" class="ab-staff-name ab-mono">{{ auth.staffName }}</span>
          <SoundToggle />
          <button
            v-if="showChildNav || showStaffNav"
            class="ab-logout" type="button" title="Выйти" @click="logout"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path d="M15 12H4m0 0l3.5-3.5M4 12l3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M10 4h8a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            </svg>
          </button>
        </div>
      </header>

      <main class="ab-main" :class="{ 'ab-main--wide': isStaffArea || isAdminArea }">
        <RouterView />
      </main>

      <footer class="ab-footer ab-faint">
        ДФК «Динамчики» · свой клуб под трибуной · результаты видишь только ты и тренер
      </footer>
    </div>
  </div>
</template>

<style scoped lang="scss">
.ab-shell { display: flex; flex-direction: column; min-height: 100vh; min-height: 100dvh; }
.ab-topbar {
  position: sticky; top: 0; z-index: 20;
  display: flex; align-items: center; gap: 16px;
  padding: 14px clamp(16px, 4vw, 40px);
  padding-top: calc(14px + env(safe-area-inset-top));
  background: rgba(6, 9, 18, 0.72); backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--ab-line);
}
.ab-brand { display: inline-flex; align-items: center; gap: 10px; text-decoration: none; color: var(--ab-text); }
.ab-brand__mark { display: grid; place-items: center; width: 38px; height: 38px; border-radius: 11px;
  color: var(--ab-cyan); background: rgba(53, 224, 255, 0.12); border: 1px solid var(--ab-line-strong); }
.ab-brand__text { font-family: var(--ab-font-display); font-weight: 800; letter-spacing: 0.16em; font-size: 0.95rem; }
.ab-topbar__right { margin-left: auto; display: flex; align-items: center; gap: 10px; }
.ab-staff-name { font-size: 0.8rem; color: var(--ab-text-dim); max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ab-logout { display: grid; place-items: center; width: 44px; height: 44px; border-radius: 12px;
  border: 1px solid var(--ab-line); background: rgba(120, 150, 255, 0.06); color: var(--ab-text-dim); cursor: pointer; transition: all 150ms ease; }
.ab-logout:hover { color: var(--ab-raspberry); border-color: rgba(255, 61, 113, 0.4); }
.ab-main { flex: 1; width: 100%; max-width: 760px; margin: 0 auto; padding: clamp(20px, 4vw, 40px) clamp(16px, 4vw, 40px); }
.ab-main--wide { max-width: 1120px; }
.ab-footer { text-align: center; font-size: 0.74rem; padding: 20px 16px calc(20px + env(safe-area-inset-bottom)); }
@media (max-width: 680px) {
  .ab-brand__text { display: none; }
  .ab-topbar { gap: 10px; }
  .ab-staff-name { display: none; }
}
</style>