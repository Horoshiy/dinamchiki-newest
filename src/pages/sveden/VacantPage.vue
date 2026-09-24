<script setup lang="ts">
/** Подраздел 11 «Вакантные места для приёма (перевода) обучающихся». */
import SvedenPage from '@/widgets/sveden/SvedenPage.vue'
import SvedenBlock from '@/widgets/sveden/SvedenBlock.vue'
import SvedenTable from '@/widgets/sveden/SvedenTable.vue'
import { EDU_PROGRAMS, EDU_TOTALS, ENROLL_STEPS, ENROLL_DOCS, ENROLL_DOCS_NOTE } from '@/entities/sveden/sveden.data'
</script>

<template>
  <SvedenPage
    :num="11"
    title="Вакантные места для приёма (перевода) обучающихся"
    crumb="Вакантные места"
    lead="Количество свободных мест для приёма и перевода по каждой образовательной программе."
  >
    <SvedenBlock title="Вакантные места">
      <div itemprop="vacant">
        <SvedenTable caption="Вакантные места по образовательным программам">
          <thead>
            <tr>
              <th>Образовательная программа</th>
              <th>Уровень образования</th>
              <th>Форма обучения</th>
              <th class="num">За счёт бюджетов</th>
              <th class="num">По договорам</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in EDU_PROGRAMS" :key="p.id">
              <td itemprop="eduName">{{ p.name }}</td>
              <td itemprop="eduLevel">{{ p.level }}</td>
              <td itemprop="eduForm">{{ p.form }}</td>
              <td class="num">
                <span itemprop="numberBFVacant">0</span> /
                <span itemprop="numberBRVacant">0</span> /
                <span itemprop="numberBMVacant">0</span>
              </td>
              <td class="num" itemprop="numberPVacant">{{ p.vacantPaid }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3">Итого</td>
              <td class="num">0</td>
              <td class="num">{{ EDU_TOTALS.vacantPaid }}</td>
            </tr>
          </tfoot>
        </SvedenTable>
      </div>
      <p class="sv-note">
        В колонке «За счёт бюджетов» указаны места, финансируемые из федерального,
        регионального и местного бюджетов. Организация обучение за счёт бюджетных
        ассигнований не осуществляет.
      </p>
    </SvedenBlock>

    <SvedenBlock title="Как записаться">
      <ol>
        <li v-for="(s, i) in ENROLL_STEPS" :key="i">{{ s }}</li>
      </ol>
    </SvedenBlock>

    <SvedenBlock title="Документы для зачисления">
      <ul>
        <li v-for="d in ENROLL_DOCS" :key="d">{{ d }}</li>
      </ul>
      <p class="sv-note">{{ ENROLL_DOCS_NOTE }}</p>
      <p class="sv-note">
        Перевод обучающихся из других образовательных организаций осуществляется
        при наличии свободных мест в соответствующих группах.
      </p>
    </SvedenBlock>
  </SvedenPage>
</template>

<style scoped lang="scss">
.sv-note { font-size: $font-size-sm; color: $color-fg-muted; }
</style>
