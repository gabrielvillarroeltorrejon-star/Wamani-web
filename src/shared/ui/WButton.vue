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
  ariaLabel?: string;
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
    :aria-label="ariaLabel"
    @click="handleClick"
  >
    <slot></slot>
  </button>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables';

button {
  font-family: $font-family-sans-serif;
  font-weight: 600;
  letter-spacing: 0.04em;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

// Botón Principal: Verde Wamani (#147E79), texto Blanco Andino (#FFFFFF)
:deep(.btn-primary) {
  background-color: $verde-wamani !important;
  color: $blanco-andino !important;
  border: 1px solid rgba($blanco-andino, 0.2) !important;
  box-shadow: 0 4px 12px rgba(20, 126, 121, 0.35);

  &:hover {
    background-color: $verde-wamani-light !important;
    color: $blanco-andino !important;
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(20, 126, 121, 0.45);
  }
}

// Botón Secundario: Beige Tierra (#E7DCC3), texto Gris Piedra (#4C4C4C)
:deep(.btn-secondary),
:deep(.btn-accent) {
  background-color: $beige-tierra !important;
  color: $gris-piedra !important;
  border: 1px solid rgba($gris-piedra, 0.15) !important;
  box-shadow: 0 4px 12px rgba(76, 76, 76, 0.12);

  &:hover {
    background-color: darken($beige-tierra, 6%) !important;
    color: $gris-piedra-dark !important;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(76, 76, 76, 0.2);
  }
}

:deep(.btn-outline-primary) {
  background-color: transparent !important;
  color: $verde-wamani !important;
  border: 2px solid $verde-wamani !important;

  &:hover {
    background-color: $verde-wamani !important;
    color: $blanco-andino !important;
  }
}

:deep(.btn-outline-accent) {
  background-color: transparent !important;
  color: $beige-tierra !important;
  border: 2px solid $beige-tierra !important;

  &:hover {
    background-color: $beige-tierra !important;
    color: $gris-piedra !important;
  }
}
</style>
