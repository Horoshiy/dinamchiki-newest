<script setup lang="ts">
/** Подраздел 8 «Стипендии и меры поддержки обучающихся». */
import SvedenPage from '@/widgets/sveden/SvedenPage.vue'
import SvedenBlock from '@/widgets/sveden/SvedenBlock.vue'
import { GRANTS_NOTE, SUPPORT_MEASURES } from '@/entities/sveden/sveden.data'
</script>

<template>
  <SvedenPage
    :num="8"
    title="Стипендии и меры поддержки обучающихся"
    crumb="Стипендии и меры поддержки"
  >
    <SvedenBlock title="Наличие и условия предоставления стипендий">
      <p itemprop="grant">{{ GRANTS_NOTE }}</p>
    </SvedenBlock>

    <SvedenBlock title="Меры социальной поддержки">
      <div itemprop="support" class="sv-support">
        <article v-for="m in SUPPORT_MEASURES" :key="m.title" class="sv-support__item">
          <h3 class="sv-support__title">{{ m.title }}</h3>
          <p>{{ m.text }}</p>
        </article>
      </div>
    </SvedenBlock>

    <SvedenBlock title="Общежитие, интернат и плата за проживание">
      <p itemprop="hostelInfo">Общежитие отсутствует.</p>
      <p itemprop="interInfo">Интернат отсутствует.</p>
      <p>
        Количество жилых помещений для иногородних обучающихся —
        <span itemprop="hostelNum">0</span> (в общежитии) и
        <span itemprop="interNum">0</span> (в интернате).
        Плата за проживание не взимается.
      </p>
    </SvedenBlock>
  </SvedenPage>
</template>

<style scoped lang="scss">
.sv-support { display: flex; flex-direction: column; gap: $space-3; }

.sv-support__item {
  padding: $space-4 $space-5;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
}

.sv-support__title {
  margin: 0 0 $space-2;
  font-size: $font-size-base;
  color: $color-fg-strong;
}
</style>
