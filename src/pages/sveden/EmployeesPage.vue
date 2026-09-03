<script setup lang="ts">
/** Подраздел 6 «Педагогический состав». */
import SvedenPage from '@/widgets/sveden/SvedenPage.vue'
import SvedenBlock from '@/widgets/sveden/SvedenBlock.vue'
import SvedenTable from '@/widgets/sveden/SvedenTable.vue'
import { TEACHERS, TEACHERS_SUMMARY } from '@/entities/sveden/sveden.data'
</script>

<template>
  <SvedenPage
    :num="6"
    title="Педагогический состав"
    crumb="Педагогический состав"
    lead="Персональный состав педагогических работников с указанием уровня образования, квалификации и опыта работы."
  >
    <SvedenBlock title="Общая информация">
      <ul>
        <li>Общая численность педагогических работников: {{ TEACHERS_SUMMARY.total }}</li>
        <li>С высшим образованием: {{ TEACHERS_SUMMARY.higherEducation }}</li>
        <li>Имеющих учёную степень или учёное звание: {{ TEACHERS_SUMMARY.withDegree }}</li>
      </ul>
    </SvedenBlock>

    <SvedenBlock title="Персональный состав педагогических работников">
      <div itemprop="teachingStaff">
        <SvedenTable caption="Персональный состав педагогических работников">
          <thead>
            <tr>
              <th>ФИО</th>
              <th>Должность</th>
              <th>Преподаваемые дисциплины</th>
              <th>Образование и квалификация</th>
              <th>Учёная степень / звание</th>
              <th class="num">Стаж, лет</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in TEACHERS" :key="t.fio">
              <td itemprop="fio">{{ t.fio }}</td>
              <td itemprop="post">{{ t.post }}</td>
              <td itemprop="teachingDiscipline">{{ t.disciplines }}</td>
              <td itemprop="teachingLevel">{{ t.level }}</td>
              <td>
                <span itemprop="degree">{{ t.degree }}</span> /
                <span itemprop="academStat">{{ t.academicStatus }}</span>
              </td>
              <td class="num" itemprop="specExperience">{{ t.experience }}</td>
            </tr>
          </tbody>
        </SvedenTable>
      </div>
      <p class="sv-note" itemprop="teachingOp">
        Все педагогические работники ведут дополнительные общеобразовательные
        общеразвивающие программы физкультурно-спортивной направленности по футболу.
      </p>
      <p class="sv-note" itemprop="profDevelopment">
        Педагогические работники регулярно проходят повышение квалификации;
        документы об образовании и стаже хранятся в организации.
      </p>
    </SvedenBlock>
  </SvedenPage>
</template>

<style scoped lang="scss">
.sv-note { font-size: $font-size-sm; color: $color-fg-muted; }
</style>
