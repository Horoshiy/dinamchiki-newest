<script setup lang="ts">
// Вход игрока по коду. QR-ссылка (#code=…) входит автоматически.
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useBaseAuth } from '../stores/baseAuth'
import { useBaseSound } from '../stores/baseSound'
import { BaseApiError } from '../api/base.client'
import AgentCodeInput from '../components/AgentCodeInput.vue'
import { normalizeAgentCode } from '../utils/agentCode'

const auth = useBaseAuth()
const sound = useBaseSound()
const router = useRouter()

const code = ref('')
const error = ref('')

async function login() {
  if (normalizeAgentCode(code.value).length !== 10 || auth.childLoading) return
  sound.unlock()
  error.value = ''
  try {
    await auth.loginChild(normalizeAgentCode(code.value))
    sound.play('success')
    void router.push({ name: 'base-mission' })
  } catch (e) {
    sound.play('error')
    error.value = e instanceof BaseApiError ? e.message : 'Не удалось войти. Попробуй ещё раз.'
  }
}

onMounted(() => {
  const fromHash = auth.consumeCodeFromHash()
  if (fromHash) {
    code.value = normalizeAgentCode(fromHash)
    void login()
  }
})
</script>

<template>
  <div class="login">
    <section class="login__hero ab-rise">
      <div class="login__radar" aria-hidden="true">
        <span class="login__radar-sweep" />
        <span class="login__radar-ring" />
        <span class="login__radar-ring login__radar-ring--2" />
        <span class="login__radar-dot" />
      </div>
      <span class="ab-eyebrow">ДФК «Динамчики» · доступ по коду</span>
      <h1 class="login__title">ПОДТРИБУНКА</h1>
    </section>

    <section class="login__panel ab-card ab-rise ab-rise-1">
      <AgentCodeInput v-model="code" :loading="auth.childLoading" @submit="login" />
      <p v-if="error" class="ab-alert ab-alert--error" role="alert">{{ error }}</p>
      <button
        class="ab-btn ab-btn--block" type="button"
        :disabled="normalizeAgentCode(code).length !== 10 || auth.childLoading"
        @click="login"
      >
        {{ auth.childLoading ? 'Проверяем код…' : 'Войти в Подтрибунку' }}
      </button>
      <p class="login__hint ab-faint">Нет кода? Попроси тренера выдать карточку игрока на тренировке.</p>
      <RouterLink :to="{ name: 'base-staff' }" class="login__staff">Я тренер → тренерская</RouterLink>
      <RouterLink :to="{ name: 'base-admin' }" class="login__staff login__admin">Я администратор → админская</RouterLink>
    </section>

    <p class="login__lead ab-rise ab-rise-1">
      Свой клуб под трибуной. Каждый день — новая разминка: расскажи о настрое,
      силах и сне, получай XP, значки и звание. Твои ответы видишь только ты и тренер.
    </p>

    <section class="login__perks ab-rise ab-rise-2">
      <div class="login__perk"><span>🎯</span><b>Разминка дня</b><i>1 минута в день</i></div>
      <div class="login__perk"><span>🏅</span><b>Значки и звания</b><i>расти от новичка до легенды</i></div>
      <div class="login__perk"><span>🔥</span><b>Серия дней</b><i>не пропускай — держи огонь</i></div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.login { display: flex; flex-direction: column; gap: 22px; max-width: 560px; margin: 0 auto; }
.login__hero { position: relative; text-align: center; padding: 20px 0 0; }
.login__title { font-size: clamp(2.6rem, 12vw, 4.4rem); letter-spacing: 0.04em; margin: 12px 0;
  background: linear-gradient(180deg, #fff, var(--ab-cyan)); -webkit-background-clip: text; background-clip: text; color: transparent; }
.login__lead { color: var(--ab-text-dim); font-size: 1rem; line-height: 1.6; max-width: 440px; margin: 0 auto; }
.login__radar { position: relative; width: 120px; height: 120px; margin: 0 auto 6px; border-radius: 50%;
  border: 1px solid var(--ab-line-strong); background: radial-gradient(circle, rgba(53, 224, 255, 0.1), transparent 70%); }
.login__radar-ring { position: absolute; inset: 22px; border-radius: 50%; border: 1px solid var(--ab-line); }
.login__radar-ring--2 { inset: 44px; }
.login__radar-sweep { position: absolute; inset: 0; border-radius: 50%;
  background: conic-gradient(from 0deg, rgba(53, 224, 255, 0.45), transparent 30%); animation: ab-sweep 3.5s linear infinite; }
.login__radar-dot { position: absolute; top: 30px; left: 74px; width: 7px; height: 7px; border-radius: 50%;
  background: var(--ab-lime); box-shadow: 0 0 12px var(--ab-lime); animation: ab-blink 1.8s ease-in-out infinite; }
.login__panel { display: flex; flex-direction: column; gap: 16px; padding: 26px 24px; }
.login__hint { font-size: 0.82rem; margin: 0; text-align: center; }
.login__staff { align-self: center; color: var(--ab-text-dim); font-size: 0.88rem; text-decoration: none; border-bottom: 1px dashed var(--ab-line-strong); }
.login__staff:hover { color: var(--ab-cyan); }
.login__admin { color: var(--ab-text-faint); font-size: 0.82rem; margin-top: -8px; }
.login__perks { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.login__perk { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 4px;
  padding: 16px 10px; border-radius: var(--ab-radius-sm); background: rgba(120, 150, 255, 0.05); border: 1px solid var(--ab-line); }
.login__perk span { font-size: 1.6rem; }
.login__perk b { font-family: var(--ab-font-display); font-size: 0.86rem; }
.login__perk i { font-style: normal; font-size: 0.72rem; color: var(--ab-text-faint); }
@media (max-width: 480px) { .login__perks { grid-template-columns: 1fr; } }
// На телефоне форма входа должна целиком помещаться в первый экран:
// заголовок сжимается, радар и длинный текст уходят под неё.
@media (max-width: 680px) {
  .login { gap: 16px; }
  .login__hero { padding: 6px 0 0; }
  .login__radar { display: none; }
  .login__title { font-size: 1.8rem; margin: 6px 0 0; }
  .login__panel { padding: 20px 18px; gap: 12px; }
  .login__lead { font-size: 0.92rem; line-height: 1.5; }
}
@media (prefers-reduced-motion: reduce) { .login__radar-sweep, .login__radar-dot { animation: none; } }
</style>