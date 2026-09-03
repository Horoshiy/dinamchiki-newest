<script setup lang="ts">
/** Подраздел 3 «Документы». */
import SvedenPage from '@/widgets/sveden/SvedenPage.vue'
import SvedenBlock from '@/widgets/sveden/SvedenBlock.vue'
import SvedenDocList from '@/widgets/sveden/SvedenDocList.vue'
import { DOCUMENTS, DOCUMENTS_PENDING } from '@/entities/sveden/sveden.data'
</script>

<template>
  <SvedenPage
    :num="3"
    title="Документы"
    crumb="Документы"
    lead="Копии уставных, нормативных и иных документов образовательной организации."
  >
    <SvedenBlock title="Основные документы">
      <SvedenDocList :docs="DOCUMENTS" />
    </SvedenBlock>

    <SvedenBlock title="Сведения об отсутствующих документах">
      <SvedenDocList :docs="DOCUMENTS_PENDING" />
    </SvedenBlock>
  </SvedenPage>
</template>
