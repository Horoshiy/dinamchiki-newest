<script setup lang="ts">
/** Подраздел 13 «Организация питания в образовательной организации». */
import SvedenPage from '@/widgets/sveden/SvedenPage.vue'
import SvedenBlock from '@/widgets/sveden/SvedenBlock.vue'
import {
  CATERING_NOTE, CATERING_RECOMMENDATIONS, CATERING_TRIPS, HEALTH_PROTECTION, ORG,
} from '@/entities/sveden/sveden.data'
</script>

<template>
  <SvedenPage
    :num="13"
    title="Организация питания в образовательной организации"
    crumb="Организация питания"
  >
    <SvedenBlock title="Условия питания обучающихся">
      <p itemprop="meals">{{ CATERING_NOTE }}</p>
      <p class="sv-note">
        Требования к меню горячего питания, диетическому меню и перечням поставщиков
        относятся к общеобразовательным организациям, реализующим программы начального
        общего образования, и на организацию не распространяются.
      </p>
    </SvedenBlock>

    <SvedenBlock title="Условия охраны здоровья обучающихся">
      <div itemprop="health" class="sv-health">
        <article v-for="g in HEALTH_PROTECTION" :key="g.title" class="sv-health__group">
          <h3 class="sv-health__title">{{ g.title }}</h3>
          <ul>
            <li v-for="item in g.items" :key="item">{{ item }}</li>
          </ul>
        </article>
      </div>
    </SvedenBlock>

    <SvedenBlock title="Рекомендации по питанию юных спортсменов">
      <ul>
        <li v-for="r in CATERING_RECOMMENDATIONS" :key="r">{{ r }}</li>
      </ul>
      <p>{{ CATERING_TRIPS }}</p>
    </SvedenBlock>

    <SvedenBlock title="Обратная связь по вопросам питания и здоровья">
      <p itemprop="parent">
        Вопросы по питанию и состоянию здоровья ребёнка родители (законные представители)
        могут задать тренеру-преподавателю группы или по телефону
        <a :href="ORG.phoneHref">{{ ORG.phone }}</a>,
        а также письмом на <a :href="`mailto:${ORG.email}`">{{ ORG.email }}</a>.
      </p>
      <p itemprop="child">
        При наличии у ребёнка хронических заболеваний, аллергических реакций
        или особых требований к питанию необходимо сообщить об этом
        тренеру-преподавателю и администрации организации.
      </p>
    </SvedenBlock>
  </SvedenPage>
</template>

<style scoped lang="scss">
.sv-health { display: flex; flex-direction: column; gap: $space-4; }

.sv-health__group {
  padding: $space-4 $space-5;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
}

.sv-health__title {
  margin: 0 0 $space-2;
  font-size: $font-size-base;
  color: $color-fg-strong;
}

.sv-note { font-size: $font-size-sm; color: $color-fg-muted; }
</style>
