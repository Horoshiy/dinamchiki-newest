<script setup lang="ts">
/**
 * Согласие на обработку персональных данных (`/consent`).
 *
 * Отдельный документ, а не абзац политики: с 01.09.2025 согласие
 * оформляется отдельно от иных документов (ч. 1 ст. 9 152-ФЗ).
 */
import { RouterLink } from 'vue-router'
import PageHeader from '@/shared/ui/layout/PageHeader.vue'
import PageContainer from '@/shared/ui/layout/PageContainer.vue'
import {
  ACTIONS,
  LEAD_DATA,
  LEAD_RETENTION,
  LEGAL_REVISION,
  OPERATOR,
  PURPOSES,
} from '@/entities/legal/legal.data'

// Статистика посещений идёт по cookie, а не по данным формы — в согласие
// на обработку заявки она не входит.
const LEAD_PURPOSES = PURPOSES.slice(0, 2)
</script>

<template>
  <PageContainer>
    <section class="container">
      <PageHeader
        eyebrow="Документы"
        title="Согласие на обработку персональных данных"
        :description="`Редакция от ${LEGAL_REVISION}`"
      />
    </section>

    <section class="container">
      <div class="legal">
        <p>
          Нажимая кнопку отправки заявки на сайте, под которой размещена ссылка
          на этот текст, я свободно, своей волей и в своём интересе даю
          согласие {{ OPERATOR.name }} (ИНН {{ OPERATOR.inn }}, ОГРН {{ OPERATOR.ogrn }},
          адрес: {{ OPERATOR.address }}) на обработку моих персональных данных
          на следующих условиях.
        </p>

        <h2>Какие данные</h2>
        <p>{{ LEAD_DATA.join(', ') }}.</p>

        <h2>Цели</h2>
        <ul>
          <li v-for="p in LEAD_PURPOSES" :key="p">{{ p }}.</li>
        </ul>

        <h2>Действия</h2>
        <p>
          {{ ACTIONS.charAt(0).toUpperCase() + ACTIONS.slice(1) }} — с использованием
          средств автоматизации и без них. Распространение данных
          неограниченному кругу лиц не допускается.
        </p>

        <h2>Срок и отзыв</h2>
        <p>
          Согласие действует {{ LEAD_RETENTION }}, а если заключён договор —
          на срок его действия. Согласие можно отозвать в любой момент,
          написав на <a :href="`mailto:${OPERATOR.email}`">{{ OPERATOR.email }}</a>
          или отправив письмо по адресу оператора. После отзыва данные
          уничтожаются в течение 30 дней, если их хранение не требуется по закону.
        </p>

        <p class="legal__note">
          Как мы обрабатываем и защищаем данные, описано в
          <RouterLink to="/privacy">Политике обработки персональных данных</RouterLink>.
        </p>
      </div>
    </section>
  </PageContainer>
</template>

<style scoped lang="scss">
.legal {
  max-width: 760px;
  color: $color-fg;
  line-height: 1.65;

  h2 {
    font-size: $font-size-xl;
    color: $color-fg-strong;
    margin: $space-8 0 $space-3;
  }

  p, ul { margin: 0 0 $space-3; }
  ul { padding-left: $space-6; }
  li + li { margin-top: $space-1; }

  a { color: $color-brand-600; }
}

.legal__note {
  margin-top: $space-8;
  font-size: $font-size-sm;
  color: $color-fg-muted;
}
</style>
