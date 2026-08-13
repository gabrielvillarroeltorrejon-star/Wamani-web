<script setup lang="ts">
import { computed } from 'vue';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'sand' | 'accent';

const props = withDefaults(defineProps<{
  variant?: BadgeVariant;
  pill?: boolean;
}>(), {
  variant: 'primary',
  pill: true
});

const classes = computed(() => {
  return [
    'badge',
    `text-bg-${props.variant}`,
    props.pill ? 'rounded-pill' : '',
    'px-3', 'py-2', 'fw-medium'
  ].filter(Boolean).join(' ');
});
</script>

<template>
  <span :class="classes">
    <slot></slot>
  </span>
</template>

<style scoped>
.badge {
  letter-spacing: 0.05em;
  text-transform: uppercase;
  font-size: 0.7rem;
}
</style>
