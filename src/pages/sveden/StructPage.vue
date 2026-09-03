<script setup lang="ts">
/** Подраздел 2 «Структура и органы управления образовательной организацией». */
import SvedenPage from '@/widgets/sveden/SvedenPage.vue'
import SvedenBlock from '@/widgets/sveden/SvedenBlock.vue'
import SvedenTable from '@/widgets/sveden/SvedenTable.vue'
import { MANAGEMENT_BODIES, ORG, HEAD } from '@/entities/sveden/sveden.data'
</script>

<template>
  <SvedenPage
    :num="2"
    title="Структура и органы управления образовательной организацией"
    crumb="Структура и органы управления"
    lead="Управление ООО ДФК «Динамчики» осуществляется в соответствии с законодательством Российской Федерации и Уставом организации."
  >
    <SvedenBlock title="Органы управления">
      <div itemprop="structOrgUprav">
        <SvedenTable caption="Органы управления организацией">
          <thead>
            <tr>
              <th>Наименование органа управления</th>
              <th>Руководитель</th>
              <th>Место нахождения</th>
              <th>Электронная почта</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="b in MANAGEMENT_BODIES" :key="b.name">
              <td>
                <span itemprop="name">{{ b.name }}</span>
                <p class="sv-cell-note">{{ b.note }}</p>
              </td>
              <td>
                <template v-if="b.name === 'Генеральный директор'">
                  <span itemprop="fio">{{ HEAD.fio }}</span><br>
                  <span itemprop="post">{{ HEAD.post }}</span>
                </template>
                <template v-else>—</template>
              </td>
              <td itemprop="addressStr">{{ ORG.address }}</td>
              <td itemprop="email">{{ ORG.email }}</td>
            </tr>
          </tbody>
        </SvedenTable>
      </div>
    </SvedenBlock>

    <SvedenBlock title="Структурные подразделения, филиалы и представительства">
      <!--
        Скрывать размеченные данные нельзя: п. 27 приказа № 1493 требует, чтобы
        они были доступны для просмотра посетителями сайта. Поэтому оба факта
        написаны отдельными видимыми строками.
      -->
      <p itemprop="filInfo">
        Филиалов организация не имеет. Структурных подразделений нет,
        положения о структурных подразделениях не принимались.
      </p>
      <p itemprop="repInfo">Представительств организация не имеет.</p>
    </SvedenBlock>
  </SvedenPage>
</template>

<style scoped lang="scss">
.sv-cell-note {
  margin: $space-1 0 0;
  font-size: $font-size-xs;
  color: $color-fg-muted;
  max-width: 40ch;
}
</style>
