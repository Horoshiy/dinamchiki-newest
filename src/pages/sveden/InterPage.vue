<script setup lang="ts">
/** Подраздел 12 «Международное сотрудничество». */
import SvedenPage from '@/widgets/sveden/SvedenPage.vue'
import SvedenBlock from '@/widgets/sveden/SvedenBlock.vue'
import SvedenFacts from '@/widgets/sveden/SvedenFacts.vue'
import { INTERNATIONAL } from '@/entities/sveden/sveden.data'
</script>

<template>
  <SvedenPage
    :num="12"
    title="Международное сотрудничество"
    crumb="Международное сотрудничество"
  >
    <SvedenBlock title="Договоры с иностранными и международными организациями">
      <p itemprop="internationalDog">{{ INTERNATIONAL.contracts }}</p>
      <p>{{ INTERNATIONAL.mobility }}</p>
    </SvedenBlock>

    <SvedenBlock title="Иностранные обучающиеся и работники">
      <SvedenFacts
        :items="[
          { label: 'Численность обучающихся — иностранных граждан', value: String(INTERNATIONAL.foreignStudents) },
          { label: 'Численность иностранных педагогических работников', value: String(INTERNATIONAL.foreignTeachers) },
          { label: 'Численность иностранных научных работников', value: String(INTERNATIONAL.foreignResearchers) },
        ]"
      />
    </SvedenBlock>
  </SvedenPage>
</template>
