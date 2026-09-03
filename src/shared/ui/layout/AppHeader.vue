<script setup lang="ts">
/**
 * Шапка сайта — единая на всех страницах.
 *
 * Структура (desktop, ≥1024px):
 *   [Logo+name] [Главная меню — 6 пунктов] [Phone] [Записаться]
 *
 * На мобиле (<1024px) центральное меню сворачивается в бургер.
 *
 * Активный пункт подсвечивается синим жирным шрифтом.
 * Под header — тонкая нижняя граница (как в мокапах).
 */
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import LogoMark from '@/shared/ui/icons/LogoMark.vue'
import IconPhone from '@/shared/ui/icons/IconPhone.vue'
import IconMenu from '@/shared/ui/icons/IconMenu.vue'
import IconClose from '@/shared/ui/icons/IconClose.vue'
import BaseButton from '@/shared/ui/base/BaseButton.vue'
import { useUiStore } from '@/stores/ui'
import { CLUB_PHONE_DISPLAY, CLUB_PHONE_HREF, SIGNUP_ROUTE } from '@/shared/config/club'
import BviToggle from '@/features/bvi/BviToggle.vue'

interface NavItem {
  to: string
  label: string
}

const NAV: ReadonlyArray<NavItem> = [
  { to: '/',            label: 'О клубе' },
  { to: '/teams',       label: 'Команды' },
  { to: '/coaches',     label: 'Тренеры' },
  { to: '/tournaments', label: 'Турниры' },
  { to: '/gallery',     label: 'Галерея' },
  { to: '/contacts',    label: 'Контакты' },
  // Пункт 3 приказа Рособрнадзора № 1493: доступ к разделу «Сведения
  // об образовательной организации» обязан быть из основного меню.
  { to: '/sveden',      label: 'Сведения' },
]

const route = useRoute()
const ui = useUiStore()

/**
 * Детальные маршруты в единственном числе, а пункты меню — во множественном
 * (`/coach/:id` против `/coaches`). Без этой карты на любой детальной
 * странице не подсвечивался ни один раздел и посетитель терял ориентир.
 */
const SECTION_BY_DETAIL_PREFIX: Readonly<Record<string, string>> = {
  '/team/': '/teams',
  '/coach/': '/coaches',
  '/tournament/': '/tournaments',
  '/player/': '/teams',
}

/** Раздел верхнего уровня для текущего маршрута. */
const activeSection = computed<string>(() => {
  const path = route.path
  for (const [prefix, section] of Object.entries(SECTION_BY_DETAIL_PREFIX)) {
    if (path.startsWith(prefix)) return section
  }
  return path
})

/** Активный пункт меню: сравниваем с разделом верхнего уровня. */
function isActive(item: NavItem): boolean {
  if (item.to === '/') return activeSection.value === '/'
  const section = activeSection.value
  return section === item.to || section.startsWith(item.to + '/')
}

const phoneDisplay = CLUB_PHONE_DISPLAY
const phoneHref = CLUB_PHONE_HREF

const mobileMenuClasses = computed(() => ['mobile-menu', { 'mobile-menu--open': ui.isMobileMenuOpen }])
</script>

<template>
  <header class="header">
    <div class="container header__inner">
      <!-- Логотип -->
      <RouterLink to="/" class="header__brand" aria-label="ДФК Динамчики — на главную">
        <LogoMark :size="48" />
        <span class="header__brand-text">
          <span class="header__brand-name">Динамчики</span>
          <span class="header__brand-sub">детский футбольный клуб</span>
        </span>
      </RouterLink>

      <!-- Центральное меню (desktop) -->
      <nav class="header__nav" aria-label="Главное меню">
        <RouterLink
          v-for="item in NAV"
          :key="item.to"
          :to="item.to"
          class="header__nav-link"
          :class="{ 'header__nav-link--active': isActive(item) }"
        >
          {{ item.label }}
        </RouterLink>
      </nav>

      <!-- Правая часть -->
      <div class="header__right">
        <BviToggle class="header__bvi" />
        <a :href="phoneHref" class="header__phone" aria-label="Позвонить в клуб">
          <IconPhone :size="20" color="#1e50d8" />
          <span class="header__phone-num">{{ phoneDisplay }}</span>
        </a>
        <BaseButton :to="SIGNUP_ROUTE" size="md" variant="solid" class="header__cta">
          Записаться
        </BaseButton>
        <button
          type="button"
          class="header__burger"
          :aria-expanded="ui.isMobileMenuOpen"
          aria-controls="mobile-menu"
          aria-label="Меню"
          @click="ui.toggleMobileMenu()"
        >
          <IconClose v-if="ui.isMobileMenuOpen" :size="22" />
          <IconMenu v-else :size="22" />
        </button>
      </div>
    </div>

    <!-- Мобильное меню -->
    <div id="mobile-menu" :class="mobileMenuClasses">
      <nav class="mobile-menu__nav" aria-label="Мобильное меню">
        <RouterLink
          v-for="item in NAV"
          :key="item.to"
          :to="item.to"
          class="mobile-menu__link"
          :class="{ 'mobile-menu__link--active': isActive(item) }"
          @click="ui.closeMobileMenu()"
        >
          {{ item.label }}
        </RouterLink>
        <a :href="phoneHref" class="mobile-menu__phone">
          <IconPhone :size="20" color="#1e50d8" /> {{ phoneDisplay }}
        </a>
        <BaseButton :to="SIGNUP_ROUTE" size="md" variant="solid" block @click="ui.closeMobileMenu()">
          Записаться
        </BaseButton>
      </nav>
    </div>
  </header>
</template>

<style scoped lang="scss">
.header {
  position: sticky;
  top: 0;
  z-index: $z-header;
  background: $color-white;
  border-bottom: 1px solid $color-border;
  backdrop-filter: saturate(160%) blur(4px);
}

.header__inner {
  display: flex;
  align-items: center;
  gap: $space-6;
  min-height: 88px;
}

// ---- Бренд ----------------------------------------------------------------
.header__brand {
  display: inline-flex;
  align-items: center;
  gap: $space-3;
  color: $color-fg-strong;
  text-decoration: none;
  flex-shrink: 0;

  &:hover .header__brand-name { color: $color-brand-500; }
}

.header__brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.header__brand-name {
  font-family: $font-family-display;
  font-weight: $font-weight-extrabold;
  font-size: $font-size-lg;
  color: $color-brand-500;
  transition: color $transition-base;
}

.header__brand-sub {
  font-size: $font-size-xs;
  color: $color-fg-muted;
  margin-top: 2px;
}

// ---- Навигация ------------------------------------------------------------
.header__nav {
  display: none;
  flex: 1;
  justify-content: center;
  gap: $space-2;

  @media (min-width: $bp-lg) {
    display: flex;
  }
}

.header__nav-link {
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  color: $color-fg;
  // С добавлением пункта «Сведения» меню стало из семи ссылок и на 1280–1440px
  // начало переносить «О клубе» на две строки. Уже paddings + запрет переноса.
  white-space: nowrap;
  padding: $space-2 $space-3;
  border-radius: $radius-md;

  @media (min-width: $bp-2xl) {
    padding: $space-2 $space-4;
  }
  transition: color $transition-base, background $transition-base;

  &:hover {
    color: $color-brand-500;
    background: $color-brand-50;
  }

  &--active {
    color: $color-brand-500;
    font-weight: $font-weight-bold;
  }
}

// ---- Правая часть ---------------------------------------------------------
.header__right {
  display: flex;
  align-items: center;
  gap: $space-3;
  margin-left: auto;
}

.header__phone {
  display: none;
  align-items: center;
  gap: $space-2;
  color: $color-fg-strong;
  font-weight: $font-weight-bold;
  font-size: $font-size-base;
  text-decoration: none;
  white-space: nowrap;

  &:hover { color: $color-brand-500; }

  @media (min-width: $bp-lg) {
    display: inline-flex;
  }
}

.header__cta {
  display: none;

  @media (min-width: $bp-lg) {
    display: inline-flex;
  }
}

.header__burger {
  appearance: none;
  background: transparent;
  border: 1.5px solid $color-border;
  color: $color-brand-500;
  width: 44px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: $radius-md;
  cursor: pointer;
  transition: background $transition-base;

  &:hover { background: $color-brand-50; }

  @media (min-width: $bp-lg) {
    display: none;
  }
}

// ---- Мобильное меню -------------------------------------------------------
.mobile-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: $color-white;
  border-top: 1px solid $color-border;
  border-bottom: 1px solid $color-border;
  box-shadow: $shadow-md;
  max-height: 0;
  overflow: hidden;
  transition: max-height $transition-slow;
  pointer-events: none;

  &--open {
    max-height: calc(100vh - 88px);
    overflow-y: auto;
    pointer-events: auto;
  }

  @media (min-width: $bp-lg) {
    display: none;
  }
}

.mobile-menu__nav {
  display: flex;
  flex-direction: column;
  padding: $space-4 $space-6 $space-6;
  gap: $space-2;
}

.mobile-menu__link {
  padding: $space-3 $space-4;
  font-size: $font-size-md;
  font-weight: $font-weight-semibold;
  color: $color-fg;
  border-radius: $radius-md;
  text-decoration: none;

  &:hover, &--active {
    background: $color-brand-50;
    color: $color-brand-500;
  }
}

.mobile-menu__phone {
  margin-top: $space-3;
  padding: $space-3 $space-4;
  display: flex;
  align-items: center;
  gap: $space-3;
  font-size: $font-size-md;
  font-weight: $font-weight-bold;
  color: $color-fg-strong;
  text-decoration: none;
  border-top: 1px solid $color-border;
}
</style>
