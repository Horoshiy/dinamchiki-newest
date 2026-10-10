<script setup lang="ts">
/** Подраздел 9 «Платные образовательные услуги». */
import SvedenPage from '@/widgets/sveden/SvedenPage.vue'
import SvedenBlock from '@/widgets/sveden/SvedenBlock.vue'
import SvedenTable from '@/widgets/sveden/SvedenTable.vue'
import SvedenDocList from '@/widgets/sveden/SvedenDocList.vue'
import {
  EDU_PROGRAMS, PAID_EDU_ORDER, PAID_EDU_DOCS,
  PAID_EDU_PARENTS_NOTE, PAID_EDU_PRICE_NOTE, formatRub,
} from '@/entities/sveden/sveden.data'
</script>

<template>
  <SvedenPage
    :num="9"
    title="Платные образовательные услуги"
    crumb="Платные услуги"
    lead="Организация оказывает платные образовательные услуги по дополнительным общеобразовательным общеразвивающим программам физкультурно-спортивной направленности."
  >
    <SvedenBlock title="Стоимость обучения">
      <SvedenTable caption="Стоимость обучения по образовательным программам">
        <thead>
          <tr>
            <th>Образовательная программа</th>
            <th>Режим занятий</th>
            <th class="num">Стоимость, ₽/месяц</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in EDU_PROGRAMS" :key="p.id">
            <td>{{ p.name }}</td>
            <td>{{ p.schedule }}</td>
            <td class="num">{{ formatRub(p.price) }}</td>
          </tr>
        </tbody>
      </SvedenTable>
      <p class="sv-note">{{ PAID_EDU_PRICE_NOTE }}</p>
    </SvedenBlock>

    <SvedenBlock title="Порядок оказания платных образовательных услуг">
      <ol>
        <li v-for="(step, i) in PAID_EDU_ORDER" :key="i">{{ step }}</li>
      </ol>
    </SvedenBlock>

    <SvedenBlock title="Документы">
      <SvedenDocList :docs="PAID_EDU_DOCS" />
    </SvedenBlock>

    <SvedenBlock title="Плата за присмотр и уход">
      <p itemprop="paidParents">{{ PAID_EDU_PARENTS_NOTE }}</p>
    </SvedenBlock>
  </SvedenPage>
</template>

<style scoped lang="scss">
.sv-note { font-size: $font-size-sm; color: $color-fg-muted; }
</style>
