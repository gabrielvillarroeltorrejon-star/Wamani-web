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

<style scoped>
.card {
  overflow: hidden;
  background-color: #045D56 !important;
  border: 1px solid rgba(45, 212, 191, 0.15);
  box-shadow: 0 8px 30px rgba(4, 93, 86, 0.25);
  color: #FFFFFF;
}
.cursor-pointer {
  cursor: pointer;
}
</style>
