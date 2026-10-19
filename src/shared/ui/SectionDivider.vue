<script setup lang="ts">
defineProps<{
  dark?: boolean;
}>();
</script>

<template>
  <div class="andes-art-divider position-relative w-100 overflow-hidden d-block" :class="{ 'is-dark': dark }">
    <!-- Línea Sutil con Degradé según la Paleta Oficial Wamani -->
    <div class="subtle-gradient-top-line"></div>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables';

.andes-art-divider {
  margin: 0;
  padding: 0;
  line-height: 0;

  .subtle-gradient-top-line {
    width: 100%;
    height: 4px;
    border-radius: 4px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba($verde-wamani, 0.25) 15%,
      $verde-wamani 40%,
      $beige-tierra 50%,
      $verde-wamani 60%,
      rgba($verde-wamani, 0.25) 85%,
      transparent 100%
    );
    box-shadow: 0 0 12px rgba($beige-tierra, 0.4);
  }

  &.is-dark {
    .subtle-gradient-top-line {
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgba($beige-tierra, 0.2) 15%,
        $verde-wamani 40%,
        $beige-tierra 50%,
        $verde-wamani 60%,
        rgba($beige-tierra, 0.2) 85%,
        transparent 100%
      );
      box-shadow: 0 0 12px rgba($beige-tierra, 0.45);
    }
  }
}
</style>
