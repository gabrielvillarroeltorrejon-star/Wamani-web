<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  noPadding?: boolean;
  interactive?: boolean;
}>(), {
  noPadding: false,
  interactive: false
});

const classes = computed(() => {
  return [
    'card',
    'h-100',
    'border-0',
    props.interactive ? 'hover-lift cursor-pointer' : ''
  ].filter(Boolean).join(' ');
});
</script>

<template>
  <div :class="classes">
    <!-- Header Opcional -->
    <div v-if="$slots.header" class="card-header bg-transparent border-0 pt-4 px-4 pb-0">
      <slot name="header"></slot>
    </div>
    
    <!-- Body -->
    <div :class="['card-body', 'd-flex flex-column h-100', noPadding ? 'p-0' : 'p-4']">
      <slot></slot>
    </div>
    
    <!-- Footer Opcional -->
    <div v-if="$slots.footer" class="card-footer bg-transparent border-0 pb-4 px-4 pt-0">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables';

.card {
  overflow: hidden;
  background-color: $verde-wamani !important;
  border: 1px solid rgba($beige-tierra, 0.3) !important;
  box-shadow: 0 8px 30px rgba(13, 91, 87, 0.35);
  color: $blanco-andino;
  border-radius: $border-radius-lg;
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.4s ease;
}

.cursor-pointer {
  cursor: pointer;
}

.hover-lift:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 36px rgba(13, 91, 87, 0.45);
  border-color: rgba($beige-tierra, 0.6) !important;
}
</style>
