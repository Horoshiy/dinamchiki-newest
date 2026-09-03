<script setup lang="ts">
/** Подраздел 5 «Руководство». */
import { RouterLink } from 'vue-router'
import SvedenPage from '@/widgets/sveden/SvedenPage.vue'
import SvedenBlock from '@/widgets/sveden/SvedenBlock.vue'
import SvedenFacts from '@/widgets/sveden/SvedenFacts.vue'
import { HEAD, DEPUTIES, ORG } from '@/entities/sveden/sveden.data'
</script>

<template>
  <SvedenPage :num="5" title="Руководство" crumb="Руководство">
    <SvedenBlock title="Руководитель образовательной организации">
      <div itemprop="rucovodstvo">
        <SvedenFacts
          :items="[
            { label: 'Фамилия, имя, отчество', value: HEAD.fio, itemprop: 'fio' },
            { label: 'Должность', value: HEAD.post, itemprop: 'post' },
            { label: 'Контактный телефон', value: HEAD.phone, itemprop: 'telephone', href: ORG.phoneHref },
            { label: 'Адрес электронной почты', value: HEAD.email, itemprop: 'email', href: `mailto:${HEAD.email}` },
          ]"
        />
      </div>
    </SvedenBlock>

    <SvedenBlock title="Заместители руководителя">
      <div v-for="d in DEPUTIES" :key="d.fio" itemprop="rucovodstvoZam">
        <SvedenFacts
          :items="[
            { label: 'Фамилия, имя, отчество', value: d.fio, itemprop: 'fio' },
            { label: 'Должность', value: d.post, itemprop: 'post' },
            { label: 'Контактный телефон', value: d.phone, itemprop: 'telephone', href: ORG.phoneHref },
            { label: 'Адрес электронной почты', value: d.email, itemprop: 'email', href: `mailto:${d.email}` },
          ]"
        />
      </div>
    </SvedenBlock>

    <SvedenBlock title="Руководители филиалов и представительств">
      <p itemprop="rucovodstvoFil">Филиалов и представительств организация не имеет.</p>
    </SvedenBlock>

    <SvedenBlock>
      <p class="sv-note">
        Сведения о тренерах-преподавателях — в подразделе
        <RouterLink to="/sveden/employees">«Педагогический состав»</RouterLink>.
      </p>
    </SvedenBlock>
  </SvedenPage>
</template>

<style scoped lang="scss">
.sv-note { font-size: $font-size-sm; color: $color-fg-muted; }
</style>
