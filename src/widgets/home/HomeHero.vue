<script setup lang="ts">
/**
 * Hero-секция главной страницы.
 *
 * Левая колонка:
 *   - бейдж-eyebrow с мячом и текстом
 *   - крупный заголовок (3 строки)
 *   - подзаголовок
 *   - 2 CTA (primary + outline)
 *
 * Правая колонка: композиция из фото (одна большая + смещённая плашка с числом/бейджем).
 */
import { computed } from 'vue'
import BaseButton from '@/shared/ui/base/BaseButton.vue'
import IconCalendar from '@/shared/ui/icons/IconCalendar.vue'
import IconUsers from '@/shared/ui/icons/IconUsers.vue'
import IconBall from '@/shared/ui/icons/IconBall.vue'
import { SIGNUP_ROUTE } from '@/shared/config/club'
import { useHomeContentQuery } from '@/shared/api/composables'
import type { PageContent, HeroContent } from '@/entities/content/content.types'
import { clubYears, clubYearsLabel, STUDENTS_TOTAL } from '@/entities/club/club.facts'
import { plural } from '@/shared/lib/plural'

// Возраст клуба — от даты регистрации, учащиеся — из «Сведений».
const years = clubYears()
const yearsLabel = clubYearsLabel(years)
const studentsLabel = plural(STUDENTS_TOTAL, ['юный футболист', 'юных футболиста', 'юных футболистов'])

/** Тексты hero берём из pageContent — правятся контентом, а не кодом. */
const { data } = useHomeContentQuery()

const hero = computed<HeroContent | null>(() => {
  const d = data.value as { pageContent?: PageContent } | null
  return d?.pageContent?.hero ?? null
})
</script>

<template>
  <section class="hero">
    <div class="container hero__inner">
      <!-- Левая колонка — текст -->
      <div class="hero__text">
        <p v-if="hero" class="hero__badge">
          <span class="hero__badge-icon"><IconBall :size="16" /></span>
          {{ hero.eyebrow }}
        </p>
        <h1 class="hero__title">
          {{ hero?.titleLead ?? 'Детский футбольный клуб' }}
          <span class="hero__title-accent">{{ hero?.titleAccent ?? '«Динамчики»' }}</span>
        </h1>
        <p v-if="hero" class="hero__lead">{{ hero.description }}</p>
        <div class="hero__actions">
          <BaseButton :to="SIGNUP_ROUTE" size="lg" variant="solid" :icon-left="IconCalendar">
            Записаться на пробную тренировку
          </BaseButton>
          <BaseButton to="/teams" size="lg" variant="outline" :icon-left="IconUsers">
            Смотреть команды
          </BaseButton>
        </div>
      </div>

      <!-- Правая колонка — визуал -->
      <div class="hero__visual" aria-hidden="true">
        <div class="hero__photo">
          <!-- Иллюстрация (не фото): дети в форме клуба на вечернем стадионе. -->
          <picture class="hero__photo-inner">
            <source
              type="image/webp"
              srcset="/images/hero/hero-kids-480.webp 480w, /images/hero/hero-kids-864.webp 864w"
              sizes="(max-width: 480px) 100vw, 480px"
            />
            <img
              class="hero__photo-img"
              src="/images/hero/hero-kids-864.jpg"
              srcset="/images/hero/hero-kids-480.jpg 480w, /images/hero/hero-kids-864.jpg 864w"
              sizes="(max-width: 480px) 100vw, 480px"
              width="864"
              height="1080"
              alt=""
              fetchpriority="high"
              decoding="async"
            />
          </picture>
        </div>
        <div class="hero__float hero__float--top">
          <span class="hero__float-num">{{ years }}</span>
          <span class="hero__float-label">{{ yearsLabel }}&nbsp;опыта</span>
        </div>
        <div class="hero__float hero__float--bottom">
          <IconUsers :size="20" color="#1e50d8" />
          <span><strong>{{ STUDENTS_TOTAL }}</strong> {{ studentsLabel }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.hero {
  position: relative;
  padding: $space-16 0 $space-20;
  background:
    radial-gradient(circle at 85% 15%, rgba(81, 128, 244, 0.08) 0%, transparent 45%),
    radial-gradient(circle at 10% 90%, rgba(81, 128, 244, 0.06) 0%, transparent 50%),
    $color-white;
  overflow: hidden;

  @media (max-width: $bp-md) {
    padding: $space-10 0 $space-12;
  }
}

.hero__inner {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: $space-12;
  align-items: center;

  @media (max-width: $bp-lg) {
    // minmax(0, 1fr), а не 1fr: у 1fr минимум — min-content, и длинная
    // нераскрывающаяся надпись на кнопке распирала колонку шире вьюпорта.
    grid-template-columns: minmax(0, 1fr);
    gap: $space-10;
  }
}

// ---- Текстовая часть -----------------------------------------------------
.hero__text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: $space-5;
  max-width: 56ch;
}

.hero__badge {
  display: inline-flex;
  align-items: center;
  gap: $space-2;
  padding: $space-2 $space-4;
  background: $color-brand-50;
  color: $color-brand-700;
  border-radius: $radius-pill;
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  margin: 0;
}

.hero__badge-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  background: $color-brand-500;
  color: $color-white;
  border-radius: 50%;
}

.hero__title {
  font-family: $font-family-display;
  font-weight: $font-weight-extrabold;
  font-size: clamp(2.25rem, 4.5vw, 3.75rem);
  line-height: 1.05;
  letter-spacing: -0.02em;
  color: $color-ink-900;
  margin: 0;
}

.hero__title-accent {
  display: block;
  color: $color-brand-500;
  margin-top: $space-2;
}

.hero__lead {
  font-size: $font-size-md;
  color: $color-fg-muted;
  line-height: $line-height-base;
  margin: 0;
  max-width: 50ch;
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: $space-3;
  margin-top: $space-3;

  @media (max-width: $bp-sm) {
    width: 100%;
    flex-direction: column;

    // Кнопка на всю ширину — значит, длинный текст должен переноситься,
    // а не задавать минимальную ширину блока (.btn по умолчанию nowrap).
    :deep(.btn) {
      width: 100%;
      white-space: normal;
    }
  }
}

// ---- Визуальная часть ----------------------------------------------------
.hero__visual {
  position: relative;
  min-height: 460px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero__photo {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 5;
  max-width: 480px;
  border-radius: $radius-xl;
  overflow: hidden;
  box-shadow: $shadow-lg;
  // пока грузится иллюстрация — фирменный градиент
  background: linear-gradient(135deg, $color-brand-500 0%, #143494 100%);
  // диагональный срез слева — как на мокапах
  clip-path: polygon(0 0, 100% 5%, 100% 95%, 0 100%);
}

.hero__photo-inner {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}


.hero__photo-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}


.hero__float {
  position: absolute;
  background: $color-white;
  border-radius: $radius-lg;
  box-shadow: $shadow-md;
  padding: $space-3 $space-4;
  display: flex;
  align-items: center;
  gap: $space-3;
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  color: $color-fg-strong;

  &--top {
    top: 6%;
    left: -16px;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    padding: $space-4 $space-5;
  }

  &--bottom {
    bottom: 10%;
    right: -8px;

    strong {
      color: $color-brand-500;
      font-weight: $font-weight-bold;
    }
  }

  // На узких экранах плавающие бейджи наезжали на подпись к фото
  // («208 юных футболистов» закрывал «Тренировка U-10 · Стадион Динамо»),
  // а отрицательные отступы вытаскивали их за край вьюпорта.
  // Поэтому на мобиле они перестают плавать и встают в ряд под фото.
  @media (max-width: $bp-md) {
    position: static;
    box-shadow: $shadow-sm;

    &--top,
    &--bottom {
      top: auto;
      bottom: auto;
      left: auto;
      right: auto;
      flex-direction: row;
      align-items: center;
      gap: $space-2;
      padding: $space-3 $space-4;
    }
  }
}

.hero__float-num {
  font-family: $font-family-display;
  font-weight: $font-weight-extrabold;
  font-size: $font-size-2xl;
  color: $color-brand-500;
  line-height: 1;
}

.hero__float-label {
  font-size: $font-size-xs;
  color: $color-fg-muted;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

@media (max-width: $bp-lg) {
  .hero__visual { min-height: 380px; }
  .hero__photo  { max-width: 420px; margin: 0 auto; }
}

@media (max-width: $bp-md) {
  // Визуал становится обычной колонкой: фото, под ним — бейджи в ряд.
  .hero__visual {
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: $space-3;
  }

  .hero__photo {
    max-width: 100%;
    aspect-ratio: 4 / 3;
  }

  .hero__float-num {
    font-size: $font-size-xl;
  }
}

@media (max-width: $bp-sm) {
  // На самых узких экранах два бейджа в ряд уже не помещаются.
  .hero__visual { gap: $space-2; }
}
</style>
