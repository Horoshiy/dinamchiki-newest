<script setup lang="ts">
/**
 * LoadingSkeleton — простой скелетон для будущих loading states (Этап 11).
 *
 * Использование:
 *   <LoadingSkeleton :lines="3" />
 *   <LoadingSkeleton variant="circle" :size="48" />
 *   <LoadingSkeleton variant="block" height="120px" />
 *
 * Параметры:
 *   - variant: 'text' (по умолчанию) | 'block' | 'circle'
 *   - count (для text): количество строк
 *   - size (для circle): диаметр
 *   - width/height: для block
 */
withDefaults(
  defineProps<{
    variant?: 'text' | 'block' | 'circle'
    count?: number
    size?: number | string
    width?: string
    height?: string
  }>(),
  { variant: 'text', count: 1, size: 48 },
)
</script>

<template>
  <div v-if="variant === 'text'" class="skeleton-text">
    <span
      v-for="i in count"
      :key="i"
      class="skeleton-line"
      :style="{ width: i === count ? '60%' : '100%' }"
    />
  </div>

  <span
    v-else-if="variant === 'circle'"
    class="skeleton-circle"
    :style="{ width: typeof size === 'number' ? `${size}px` : size, height: typeof size === 'number' ? `${size}px` : size }"
  />

  <span
    v-else
    class="skeleton-block"
    :style="{ width: width ?? '100%', height: height ?? '80px' }"
  />
</template>

<style scoped lang="scss">
.skeleton-text {
  display: flex;
  flex-direction: column;
  gap: $space-2;
}

.skeleton-line,
.skeleton-block,
.skeleton-circle {
  display: block;
  background: linear-gradient(
    90deg,
    $color-ink-100 0%,
    $color-ink-200 50%,
    $color-ink-100 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

.skeleton-line {
  height: 16px;
  border-radius: $radius-sm;
}

.skeleton-block {
  border-radius: $radius-md;
}

.skeleton-circle {
  border-radius: 50%;
}

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
