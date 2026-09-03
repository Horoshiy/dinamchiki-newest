<script setup lang="ts">
/** Подраздел 10 «Финансово-хозяйственная деятельность». */
import { computed } from 'vue'
import SvedenPage from '@/widgets/sveden/SvedenPage.vue'
import SvedenBlock from '@/widgets/sveden/SvedenBlock.vue'
import SvedenTable from '@/widgets/sveden/SvedenTable.vue'
import SvedenDocList from '@/widgets/sveden/SvedenDocList.vue'
import {
  FINANCE_VOLUME, FINANCE_INCOME, FINANCE_EXPENSES,
  SVEDEN_FINANCIAL_YEAR, formatRub,
} from '@/entities/sveden/sveden.data'

// Итоги считаются, а не пишутся руками: на действующем сайте в этом месте
// остался плейсхолдер «ИТОГО поступлений: [общая сумма] руб.».
const incomeTotal = computed(() => FINANCE_INCOME.reduce((s, r) => s + r.amount, 0))
const expenseTotal = computed(() => FINANCE_EXPENSES.reduce((s, r) => s + r.amount, 0))
</script>

<template>
  <SvedenPage
    :num="10"
    title="Финансово-хозяйственная деятельность"
    crumb="Финансово-хозяйственная деятельность"
    :lead="`Отчётный период — ${SVEDEN_FINANCIAL_YEAR} год.`"
  >
    <SvedenBlock title="Объём образовательной деятельности, финансовое обеспечение которой осуществляется">
      <SvedenTable caption="Объём образовательной деятельности">
        <thead>
          <tr><th>Источник финансирования</th><th class="num">Сумма</th></tr>
        </thead>
        <tbody>
          <tr><td>За счёт бюджетных ассигнований федерального бюджета</td><td class="num" itemprop="finBFVolume">{{ formatRub(FINANCE_VOLUME.federal) }}</td></tr>
          <tr><td>За счёт бюджетов субъектов Российской Федерации</td><td class="num" itemprop="finBRVolume">{{ formatRub(FINANCE_VOLUME.regional) }}</td></tr>
          <tr><td>За счёт местных бюджетов</td><td class="num" itemprop="finBMVolume">{{ formatRub(FINANCE_VOLUME.municipal) }}</td></tr>
          <tr><td>По договорам об оказании платных образовательных услуг</td><td class="num" itemprop="finPVolume">{{ formatRub(FINANCE_VOLUME.contracts) }}</td></tr>
        </tbody>
      </SvedenTable>
    </SvedenBlock>

    <SvedenBlock :title="`Поступление финансовых и материальных средств за ${SVEDEN_FINANCIAL_YEAR} год`">
      <div itemprop="finPost">
        <SvedenTable caption="Поступление средств">
          <thead>
            <tr><th>Источник</th><th class="num">Сумма</th></tr>
          </thead>
          <tbody>
            <tr v-for="r in FINANCE_INCOME" :key="r.title">
              <td>{{ r.title }}</td>
              <td class="num">{{ formatRub(r.amount) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr><td>Итого поступлений</td><td class="num">{{ formatRub(incomeTotal) }}</td></tr>
          </tfoot>
        </SvedenTable>
      </div>
    </SvedenBlock>

    <SvedenBlock :title="`Расходование финансовых и материальных средств за ${SVEDEN_FINANCIAL_YEAR} год`">
      <div itemprop="finRas">
        <SvedenTable caption="Расходование средств">
          <thead>
            <tr><th>Статья расходов</th><th class="num">Сумма</th></tr>
          </thead>
          <tbody>
            <tr v-for="r in FINANCE_EXPENSES" :key="r.title">
              <td>{{ r.title }}</td>
              <td class="num">{{ formatRub(r.amount) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr><td>Итого расходов</td><td class="num">{{ formatRub(expenseTotal) }}</td></tr>
          </tfoot>
        </SvedenTable>
      </div>
      <p class="sv-note" itemprop="finYear">Отчётный финансовый год: {{ SVEDEN_FINANCIAL_YEAR }}.</p>
    </SvedenBlock>

    <SvedenBlock title="План финансово-хозяйственной деятельности">
      <SvedenDocList
        :docs="[{
          title: 'План финансово-хозяйственной деятельности',
          description: 'Утверждённый план с указанием статей доходов и расходов на текущий год',
          itemprop: 'finPlanDocLink',
        }]"
      />
    </SvedenBlock>
  </SvedenPage>
</template>

<style scoped lang="scss">
.sv-note { font-size: $font-size-sm; color: $color-fg-muted; }
</style>
