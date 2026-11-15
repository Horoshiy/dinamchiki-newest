<script setup lang="ts">
// Тумблер звука сверху: один клик глушит всё. Синхронизирует настройку
// с профилем ребёнка (если он вошёл), чтобы выбор жил между устройствами.
import { useBaseSound } from '../stores/baseSound'
import { useBaseAuth } from '../stores/baseAuth'

const sound = useBaseSound()
const auth = useBaseAuth()

function toggle() {
  sound.toggle()
  if (sound.enabled) sound.play('select')
  if (auth.isChildAuthed) void auth.setSound(sound.enabled).catch(() => {})
}
</script>

<template>
  <button
    class="sound-toggle"
    :class="{ 'is-off': !sound.enabled }"
    type="button"
    :aria-pressed="sound.enabled"
    :title="sound.enabled ? 'Звук включён — нажми, чтобы выключить' : 'Звук выключен — нажми, чтобы включить'"
    @click="toggle"
  >
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" />
      <template v-if="sound.enabled">
        <path d="M16 8.5a4.5 4.5 0 0 1 0 7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        <path d="M18.5 6a8 8 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      </template>
      <path v-else d="M16 9l5 6M21 9l-5 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
    </svg>
    <span class="sound-toggle__label">{{ sound.enabled ? 'Звук' : 'Тихо' }}</span>
  </button>
</template>

<style scoped lang="scss">
.sound-toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid var(--ab-line-strong);
  background: rgba(53, 224, 255, 0.1);
  color: var(--ab-cyan);
  font-family: var(--ab-font-mono);
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  cursor: pointer;
  transition: all 160ms ease;
}
.sound-toggle:hover { background: rgba(53, 224, 255, 0.2); }
.sound-toggle.is-off { color: var(--ab-text-faint); background: rgba(120, 150, 255, 0.06); }
.sound-toggle__label { text-transform: uppercase; }
@media (max-width: 480px) { .sound-toggle__label { display: none; } }
</style>