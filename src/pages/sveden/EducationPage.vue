<script setup lang="ts">
/** Подраздел 4 «Образование». */
import SvedenPage from '@/widgets/sveden/SvedenPage.vue'
import SvedenBlock from '@/widgets/sveden/SvedenBlock.vue'
import SvedenTable from '@/widgets/sveden/SvedenTable.vue'
import {
  EDU_PROGRAMS, EDU_TOTALS, EDU_MOVEMENT, EDU_LANGUAGE,
  EDU_ACCREDITATION_NOTE, SVEDEN_ACADEMIC_YEAR,
} from '@/entities/sveden/sveden.data'
</script>

<template>
  <SvedenPage
    :num="4"
    title="Образование"
    crumb="Образование"
    lead="ООО ДФК «Динамчики» реализует дополнительные общеобразовательные общеразвивающие программы физкультурно-спортивной направленности по футболу."
  >
    <SvedenBlock title="Реализуемые образовательные программы">
      <div itemprop="eduAccred">
        <SvedenTable caption="Реализуемые образовательные программы">
          <thead>
            <tr>
              <th>Наименование программы</th>
              <th>Уровень образования</th>
              <th>Форма обучения</th>
              <th>Нормативный срок</th>
              <th class="num">Обучающихся</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in EDU_PROGRAMS" :key="p.id">
              <td>
                <span itemprop="eduName">{{ p.name }}</span>
                <p class="sv-cell-note" itemprop="eduProf">
                  Дополнительная общеобразовательная общеразвивающая программа
                  физкультурно-спортивной направленности
                </p>
              </td>
              <td itemprop="eduLevel">{{ p.level }}</td>
              <td itemprop="eduForm">{{ p.form }}</td>
              <td itemprop="learningTerm">{{ p.term }}</td>
              <td class="num">{{ p.students }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="4">Всего обучающихся</td>
              <td class="num">{{ EDU_TOTALS.students }}</td>
            </tr>
          </tfoot>
        </SvedenTable>
      </div>
      <p class="sv-note">
        Практика образовательными программами не предусмотрена.
        Государственная итоговая аттестация не проводится.
      </p>
    </SvedenBlock>

    <SvedenBlock title="Описание образовательных программ">
      <article v-for="p in EDU_PROGRAMS" :key="p.id" class="sv-prog">
        <h3 class="sv-prog__title">{{ p.name }}</h3>
        <p><strong>Цель программы:</strong> {{ p.purpose }}</p>
        <p>
          <strong>Учебные предметы, курсы, дисциплины (модули):</strong>
          <span itemprop="eduPred">{{ p.subjects.join(', ') }}</span>
        </p>
        <p><strong>Режим занятий:</strong> {{ p.schedule }}</p>
      </article>
    </SvedenBlock>

    <SvedenBlock title="Численность обучающихся">
      <div itemprop="eduChislenEl">
        <SvedenTable caption="Численность обучающихся по образовательным программам">
          <thead>
            <tr>
              <th>Образовательная программа</th>
              <th class="num">За счёт бюджетов</th>
              <th class="num">По договорам об образовании</th>
              <th class="num">Иностранные граждане</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in EDU_PROGRAMS" :key="p.id">
              <td>{{ p.name }}</td>
              <td class="num">0</td>
              <td class="num">{{ p.students }}</td>
              <td class="num">{{ p.foreignStudents }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td>Итого</td>
              <td class="num">{{ EDU_TOTALS.budgetStudents }}</td>
              <td class="num">{{ EDU_TOTALS.students }}</td>
              <td class="num">{{ EDU_TOTALS.foreignStudents }}</td>
            </tr>
          </tfoot>
        </SvedenTable>
      </div>
    </SvedenBlock>

    <SvedenBlock title="Язык образования">
      <p itemprop="languageEl">{{ EDU_LANGUAGE }}</p>
    </SvedenBlock>

    <SvedenBlock :title="`Результаты приёма, перевода и отчисления за ${SVEDEN_ACADEMIC_YEAR} учебный год`">
      <SvedenTable caption="Результаты приёма, перевода и отчисления">
        <thead>
          <tr><th>Показатель</th><th class="num">Человек</th></tr>
        </thead>
        <tbody>
          <tr><td itemprop="eduPriemEl">Принято обучающихся</td><td class="num">{{ EDU_MOVEMENT.admitted }}</td></tr>
          <tr><td itemprop="eduPerevodEl">Переведено на следующий год обучения</td><td class="num">{{ EDU_MOVEMENT.transferred }}</td></tr>
          <tr><td>Отчислено</td><td class="num">{{ EDU_MOVEMENT.expelled }}</td></tr>
        </tbody>
      </SvedenTable>
    </SvedenBlock>

    <SvedenBlock title="Государственная аккредитация">
      <p>{{ EDU_ACCREDITATION_NOTE }}</p>
    </SvedenBlock>
  </SvedenPage>
</template>

<style scoped lang="scss">
.sv-cell-note {
  margin: $space-1 0 0;
  font-size: $font-size-xs;
  color: $color-fg-muted;
  max-width: 42ch;
}

.sv-prog {
  padding: $space-5;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  display: flex;
  flex-direction: column;
  gap: $space-2;
}

.sv-prog__title {
  margin: 0 0 $space-1;
  font-size: $font-size-md;
  color: $color-fg-strong;
}

.sv-note {
  font-size: $font-size-sm;
  color: $color-fg-muted;
}
</style>
