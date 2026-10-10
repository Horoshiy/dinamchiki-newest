<script setup lang="ts">
/**
 * Подвал сайта — единый на всех страницах.
 *
 * Структура:
 *   - верх: 4 колонки (бренд+описание, навигация, тренировки, контакты)
 *   - низ: копирайт, соцсети, ссылка на политику
 */
import { RouterLink } from 'vue-router'
import LogoMark from '@/shared/ui/icons/LogoMark.vue'
import IconPhone from '@/shared/ui/icons/IconPhone.vue'
import BviToggle from '@/features/bvi/BviToggle.vue'
import { computed } from 'vue'
import { CLUB_TELEGRAM_CHANNEL_HREF } from '@/shared/config/club'
import { useClubContacts } from '@/entities/contact/useClubContacts'

// Телефон, почта, WhatsApp и Telegram — из базы. Канал в Telegram
// (t.me/dinamchiki) остаётся константой: это публикации, а не переписка,
// и в contactInfo он лежит отдельным полем socials, которого фолбэк не знает.
const { phoneDisplay, phoneHref, email, emailHref, telegramHref, whatsappHref, maxHref } =
  useClubContacts()

interface FooterColumn {
  title: string
  links: Array<{ label: string; to?: string; href?: string }>
}

const columns = computed<ReadonlyArray<FooterColumn>>(() => [
  {
    title: 'Навигация',
    links: [
      { label: 'О клубе',       to: '/' },
      { label: 'Команды',       to: '/teams' },
      { label: 'Тренеры',       to: '/coaches' },
      { label: 'Турниры',       to: '/tournaments' },
      { label: 'Контакты',      to: '/contacts' },
      { label: 'Сведения об образовательной организации', to: '/sveden' },
    ],
  },
  {
    title: 'Программы',
    // Четыре программы по лицензии № 4557, а не выдуманные «5–7 / 8–10 / 11–13».
    links: [
      // Раньше все четыре пункта вели на один и тот же /teams — это был
      // не список программ, а четыре одинаковые ссылки.
      { label: 'Футбол 3–5 лет',   to: '/teams?age=3-5' },
      { label: 'Футбол 6–7 лет',   to: '/teams?age=6-7' },
      { label: 'Футбол 8–10 лет',  to: '/teams?age=8-10' },
      { label: 'Футбол 11–14 лет', to: '/teams?age=11-14' },
      { label: 'Стоимость обучения', to: '/sveden/paid_edu' },
    ],
  },
  {
    title: 'Контакты',
    links: [
      { label: phoneDisplay.value, href: phoneHref.value },
      { label: email.value,        href: emailHref.value },
      { label: 'Telegram — написать', href: telegramHref.value },
      { label: 'Telegram-канал',      href: CLUB_TELEGRAM_CHANNEL_HREF },
      { label: 'MAX — написать',      href: maxHref.value },
      { label: 'WhatsApp',            href: whatsappHref.value },
    ],
  },
])

const year = new Date().getFullYear()
</script>

<template>
  <footer class="footer">
    <div class="container">
      <div class="footer__top">
        <!-- Бренд-блок -->
        <div class="footer__brand">
          <RouterLink to="/" class="footer__brand-link" aria-label="На главную">
            <LogoMark :size="48" variant="white" />
            <span class="footer__brand-text">
              <span class="footer__brand-name">Динамчики</span>
              <span class="footer__brand-sub">детский футбольный клуб</span>
            </span>
          </RouterLink>
          <p class="footer__brand-desc">
            Профессиональные тренировки, участие в турнирах и всестороннее
            развитие юных футболистов от 3 до 14 лет.
          </p>
          <a :href="phoneHref" class="footer__phone">
            <IconPhone :size="18" color="#1e50d8" />
            {{ phoneDisplay }}
          </a>
        </div>

        <!-- Колонки ссылок -->
        <div v-for="col in columns" :key="col.title" class="footer__col">
          <h4 class="footer__col-title">{{ col.title }}</h4>
          <ul class="footer__list">
            <li v-for="link in col.links" :key="link.label">
              <RouterLink v-if="link.to" :to="link.to" class="footer__link">{{ link.label }}</RouterLink>
              <a v-else :href="link.href" class="footer__link">{{ link.label }}</a>
            </li>
          </ul>
        </div>
      </div>

      <div class="footer__bottom">
        <p class="footer__copy">© {{ year }} ДФК «Динамчики». Все права защищены.</p>
        <p class="footer__legal">
          <RouterLink to="/privacy" class="footer__link footer__link--muted">Политика конфиденциальности</RouterLink>
          <span class="footer__sep" aria-hidden="true">·</span>
          <RouterLink to="/consent" class="footer__link footer__link--muted">Согласие на обработку данных</RouterLink>
          <span class="footer__sep" aria-hidden="true">·</span>
          <!--
            Указание на версию для слабовидящих размечается атрибутом
            itemprop="copy" — он входит в проверочную таблицу каждого
            подраздела «Сведений об образовательной организации», а подвал
            присутствует и на главной, и на всех страницах раздела.
          -->
          <BviToggle variant="text" markup />
        </p>
      </div>
    </div>
  </footer>
</template>

<style scoped lang="scss">
.footer {
  background: $color-ink-900;
  color: $color-white;
  padding: $space-16 0 $space-8;
  margin-top: auto;
}

.footer__top {
  display: grid;
  grid-template-columns: 1.6fr repeat(3, 1fr);
  gap: $space-8;
  padding-bottom: $space-12;
  border-bottom: 1px solid rgba($color-white, 0.12);

  @media (max-width: $bp-lg) {
    grid-template-columns: 1fr 1fr;
    gap: $space-8 $space-6;
  }
  @media (max-width: $bp-md) {
    grid-template-columns: 1fr;
  }
}

.footer__brand-link {
  display: inline-flex;
  align-items: center;
  gap: $space-3;
  color: $color-white;
  text-decoration: none;
  margin-bottom: $space-4;
}

.footer__brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.footer__brand-name {
  font-family: $font-family-display;
  font-weight: $font-weight-extrabold;
  font-size: $font-size-lg;
}

.footer__brand-sub {
  font-size: $font-size-xs;
  color: rgba($color-white, 0.7);
  margin-top: 2px;
}

.footer__brand-desc {
  font-size: $font-size-sm;
  color: rgba($color-white, 0.7);
  line-height: $line-height-base;
  max-width: 36ch;
  margin: 0 0 $space-5;
}

.footer__phone {
  display: inline-flex;
  align-items: center;
  gap: $space-2;
  font-weight: $font-weight-bold;
  color: $color-white;
  text-decoration: none;
  font-size: $font-size-md;

  &:hover { color: $color-brand-200; }
}

.footer__col-title {
  font-size: $font-size-sm;
  font-weight: $font-weight-bold;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: $color-brand-200;
  margin: 0 0 $space-4;
}

.footer__list {
  display: flex;
  flex-direction: column;
  gap: $space-3;
  margin: 0;
  padding: 0;
}

.footer__link {
  font-size: $font-size-sm;
  color: rgba($color-white, 0.85);
  text-decoration: none;
  transition: color $transition-base;

  &:hover { color: $color-brand-200; }

  &--muted {
    color: rgba($color-white, 0.5);
    font-size: $font-size-xs;
  }
}

.footer__bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: $space-4;
  padding-top: $space-6;
  flex-wrap: wrap;
}

.footer__copy,
.footer__legal {
  font-size: $font-size-xs;
  color: rgba($color-white, 0.5);
  margin: 0;
}

.footer__legal {
  display: inline-flex;
  align-items: center;
  gap: $space-2;
  flex-wrap: wrap;
}

.footer__sep { color: rgba($color-white, 0.3); }
</style>
