<script setup lang="ts">
import { computed } from 'vue';

type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'outline-primary' | 'outline-accent';
type ButtonSize = 'sm' | 'md' | 'lg';

const props = withDefaults(defineProps<{
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}>(), {
  variant: 'primary',
  size: 'md',
  block: false,
  disabled: false,
  type: 'button'
});

const emit = defineEmits(['click']);

const classes = computed(() => {
  return [
    'btn',
    `btn-${props.variant}`,
    props.size !== 'md' ? `btn-${props.size}` : '',
    props.block ? 'w-100' : '',
    'hover-lift'
  ].filter(Boolean).join(' ');
});

const handleClick = (event: MouseEvent) => {
  if (!props.disabled) {
    emit('click', event);
  }
};
</script>

<template>
  <button 
    :type="type" 
    :class="classes" 
    :disabled="disabled"
    @click="handleClick"
  >
    <slot></slot>
  </button>
</template>

<style scoped>
/* Specific overrides if needed beyond Bootstrap */
button {
  font-weight: 600;
  letter-spacing: 0.02em;
}
</style>
