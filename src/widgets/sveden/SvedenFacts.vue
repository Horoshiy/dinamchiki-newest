<script setup lang="ts">
/**
 * Список «характеристика → значение» с микроразметкой.
 *
 * `itemprop` вешается на элемент со значением: проверка Рособрнадзора ищет
 * именно размеченное значение, а подпись — для человека.
 */
export interface Fact {
  label: string
  value: string
  itemprop?: string
  /** Значение — ссылка (телефон, почта, документ). */
  href?: string
}

defineProps<{ items: ReadonlyArray<Fact> }>()
</script>

<template>
  <dl class="sv-facts">
    <div v-for="(f, i) in items" :key="i" class="sv-facts__row">
      <dt class="sv-facts__label">{{ f.label }}</dt>
      <dd class="sv-facts__value">
        <a v-if="f.href" :href="f.href" :itemprop="f.itemprop">{{ f.value }}</a>
        <span v-else :itemprop="f.itemprop">{{ f.value }}</span>
      </dd>
    </div>
  </dl>
</template>

<style scoped lang="scss">
.sv-facts {
  margin: 0;
  display: flex;
  flex-direction: column;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  overflow: hidden;
}

.sv-facts__row {
  display: grid;
  grid-template-columns: minmax(180px, 34%) minmax(0, 1fr);
  gap: $space-4;
  padding: $space-4 $space-5;
  border-bottom: 1px solid $color-border;

  &:last-child { border-bottom: none; }
  &:nth-child(odd) { background: $color-bg-soft; }

  @media (max-width: $bp-md) {
    grid-template-columns: 1fr;
    gap: $space-1;
  }
}

.sv-facts__label {
  margin: 0;
  font-size: $font-size-sm;
  color: $color-fg-muted;
}

.sv-facts__value {
  margin: 0;
  color: $color-fg-strong;
  font-weight: $font-weight-medium;
  overflow-wrap: anywhere;
}
</style>
