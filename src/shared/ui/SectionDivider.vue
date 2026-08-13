<script setup lang="ts">
defineProps<{
  dark?: boolean;
}>();
</script>

<template>
  <div class="andes-art-divider position-relative w-100 overflow-hidden d-block" :class="{ 'is-dark': dark }">
    <!-- Línea Sutil con Degradé según la Paleta Wamani -->
    <div class="subtle-gradient-top-line"></div>
  </div>
</template>

<style scoped lang="scss">
.andes-art-divider {
  margin: 0;
  padding: 0;
  line-height: 0;

  .subtle-gradient-top-line {
    width: 100%;
    height: 5px;
    border-radius: 4px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(4, 93, 86, 0.35) 15%,
      #0FA095 40%,
      #2DD4BF 50%,
      #0FA095 60%,
      rgba(4, 93, 86, 0.35) 85%,
      transparent 100%
    );
    box-shadow: 0 0 14px rgba(45, 212, 191, 0.6);
  }

  /* Estilos para Fondo Oscuro (sección Nosotros) */
  &.is-dark {
    .subtle-gradient-top-line {
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(45, 212, 191, 0.2) 15%,
        #0FA095 40%,
        #2DD4BF 50%,
        #0FA095 60%,
        rgba(45, 212, 191, 0.2) 85%,
        transparent 100%
      );
      box-shadow: 0 0 10px rgba(45, 212, 191, 0.6);
    }
  }
}
</style>
