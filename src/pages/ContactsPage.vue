<script setup lang="ts">
/**
 * Страница «Контакты» (`/contacts`).
 */
import { computed } from 'vue'
import PageHeader from '@/shared/ui/layout/PageHeader.vue'
import PageContainer from '@/shared/ui/layout/PageContainer.vue'
import SectionTitle from '@/shared/ui/base/SectionTitle.vue'
import EmptyState from '@/shared/ui/base/EmptyState.vue'
import LoadingSkeleton from '@/shared/ui/base/LoadingSkeleton.vue'
import ContactInfoBlock from '@/widgets/contact/ContactInfoBlock.vue'
import LeadForm from '@/widgets/contact/LeadForm.vue'
import MapEmbed from '@/widgets/contact/MapEmbed.vue'
import VenueCard from '@/widgets/contact/VenueCard.vue'
import IconBall from '@/shared/ui/icons/IconBall.vue'
import { useContactInfoQuery, useVenuesQuery } from '@/shared/api/composables'
import type { ContactInfo, Venue } from '@/entities/contact/contact.types'
import { LOAD_ERROR_HINT } from '@/shared/config/club'

const { data: contactData, loading: contactLoading, error: contactError } = useContactInfoQuery()
const { data: venuesData,  loading: venuesLoading,  error: venuesError  } = useVenuesQuery()


const contact = computed<ContactInfo | null>(() => {
  const d = contactData.value as { contactInfo?: ContactInfo } | null
  return d?.contactInfo ?? null
})

const venues = computed<ReadonlyArray<Venue>>(() => {
  const d = venuesData.value as { venues?: ReadonlyArray<Venue> } | null
  return d?.venues ?? []
})
</script>

<template>
  <PageContainer>
    <section class="container">
      <PageHeader
        eyebrow="Контакты"
        title="Свяжитесь с нами"
        description="Первая тренировка бесплатная и ни к чему не обязывает. Запишитесь, задайте вопрос тренерам или приезжайте в гости — мы всегда рады новым игрокам."
      />
    </section>

    <!-- Форма заявки не зависит от загрузки контактов: если API лёг,
         главное действие страницы всё равно доступно. -->
    <section class="container">
      <div class="contacts-grid">
        <div>
          <SectionTitle eyebrow="Связь" title="Контактная информация" />
          <LoadingSkeleton v-if="contactLoading" variant="block" height="400px" />
          <EmptyState
            v-else-if="contactError || !contact"
            title="Не удалось загрузить контакты"
            :description="LOAD_ERROR_HINT"
            :icon="IconBall"
            variant="card"
          />
          <ContactInfoBlock v-else :contact="contact" />
        </div>
        <div>
          <SectionTitle id="lead" eyebrow="Заявка" title="Записаться на бесплатную пробную" />
          <LeadForm />
        </div>
      </div>
    </section>

    <template v-if="!venuesLoading && !venuesError && venues.length">
      <section class="container">
        <SectionTitle eyebrow="Как добраться" title="Площадки на карте" />
        <MapEmbed :venues="venues" />
      </section>

      <section class="container">
        <SectionTitle eyebrow="Филиалы" title="Все площадки клуба" />
        <div class="contacts-venues">
          <VenueCard
            v-for="v in venues"
            :key="v.id"
            :venue="v"
          />
        </div>
      </section>
    </template>
  </PageContainer>
</template>

<style scoped lang="scss">
.contacts-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: $space-10;
  align-items: flex-start;

  // У элементов grid по умолчанию min-width: auto — колонка не может стать
  // уже своего содержимого. Форма с паддингом 32px не сжималась и распирала
  // страницу на узких экранах при увеличенном системном шрифте.
  > * {
    min-width: 0;
  }

  @media (max-width: $bp-lg) {
    grid-template-columns: minmax(0, 1fr);
    gap: $space-8;
  }
}

.contacts-venues {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(320px, 100%), 1fr));
  gap: $space-5;
}
</style>
