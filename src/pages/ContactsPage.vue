<script setup lang="ts">
/**
 * Страница «Контакты» (`/contacts`).
 */
import { computed, watch } from 'vue'
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

const { data: contactData, loading: contactLoading, error: contactError } = useContactInfoQuery()
const { data: venuesData,  loading: venuesLoading,  error: venuesError  } = useVenuesQuery()

const loading = computed(() => contactLoading.value || venuesLoading.value)
const error   = computed<Error | null>(() => contactError.value ?? venuesError.value)

const contact = computed<ContactInfo | null>(() => {
  const d = contactData.value as { contactInfo?: ContactInfo } | null
  return d?.contactInfo ?? null
})

const venues = computed<ReadonlyArray<Venue>>(() => {
  const d = venuesData.value as { venues?: ReadonlyArray<Venue> } | null
  return d?.venues ?? []
})

const primaryVenue = computed<Venue | null>(() =>
  venues.value.find((v) => v.isPrimary) ?? null,
)

watch(error, (e) => { if (e) console.warn('[ContactsPage]', e.message) })
</script>

<template>
  <PageContainer>
    <section class="container">
      <PageHeader
        eyebrow="Контакты"
        title="Свяжитесь с нами"
        description="Запишитесь на пробную тренировку, задайте вопрос тренерам или приезжайте в гости — мы всегда рады новым игрокам."
      />
    </section>

    <section v-if="loading" class="container">
      <LoadingSkeleton variant="block" height="400px" />
    </section>

    <section v-else-if="error" class="container">
      <EmptyState
        title="Не удалось загрузить контакты"
        :description="error.message"
        :icon="IconBall"
        variant="card"
      />
    </section>

    <template v-else-if="contact">
      <section class="container">
        <div class="contacts-grid">
          <div>
            <SectionTitle eyebrow="Связь" title="Контактная информация" />
            <ContactInfoBlock :contact="contact" />
          </div>
          <div>
            <SectionTitle id="lead" eyebrow="Заявка" title="Записаться на пробную" />
            <LeadForm />
          </div>
        </div>
      </section>

      <section v-if="primaryVenue" class="container">
        <SectionTitle eyebrow="Как добраться" title="Карта проезда" />
        <MapEmbed
          :address="primaryVenue.address"
          :map-url="primaryVenue.mapUrl"
          :venue-name="primaryVenue.name"
        />
      </section>

      <section v-if="venues.length" class="container">
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
