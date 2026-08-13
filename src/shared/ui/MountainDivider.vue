<script setup lang="ts">
defineProps<{
  dark?: boolean;
}>();
</script>

<template>
  <div class="mountain-divider-container position-relative w-100 overflow-hidden d-block" :class="{ 'is-dark': dark }">
    <div class="container-fluid px-0">
      <!-- Ilustración Vectorial Artística de Cumbres Andinas para sobreponer sobre el Footer -->
      <svg viewBox="0 0 1440 96" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg" class="mountain-svg w-100 d-block">
        <defs>
          <filter id="peakGlowFooter" x="-5%" y="-10%" width="110%" height="130%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#045D56" flood-opacity="0.3" />
          </filter>
        </defs>

        <g filter="url(#peakGlowFooter)">
          <!-- Cumbres del Extremo Izquierdo -->
          <path d="M0,95 L40,65 L70,82 L100,95 Z" class="mountain-dark" />
          <path d="M0,95 L40,65 L32,75 L18,85 Z" class="mountain-highlight" />

          <path d="M50,95 L110,48 L140,70 L170,95 Z" class="mountain-dark" />
          <path d="M50,95 L110,48 L98,60 L80,78 Z" class="mountain-highlight" />

          <path d="M130,95 L185,55 L215,75 L245,95 Z" class="mountain-dark" opacity="0.85" />

          <!-- Cumbres Izquierda-Centro -->
          <path d="M200,95 L275,25 L315,55 L360,95 Z" class="mountain-dark" />
          <path d="M200,95 L275,25 L258,45 L232,70 Z" class="mountain-highlight" />
          <path d="M275,25 L288,40 L275,50 L268,38 Z" class="snow-cap" />

          <path d="M310,95 L375,32 L405,62 L440,95 Z" class="mountain-dark" />
          <path d="M310,95 L375,32 L360,50 L338,72 Z" class="mountain-highlight" />

          <path d="M390,95 L445,48 L475,70 L500,95 Z" class="mountain-dark" opacity="0.85" />

          <!-- Cumbres Principales del Centro -->
          <path d="M460,95 L550,10 L600,48 L650,95 Z" class="mountain-dark" />
          <path d="M460,95 L550,10 L530,35 L498,66 Z" class="mountain-highlight" />
          <path d="M550,10 L565,30 L550,40 L536,28 Z" class="snow-cap" />

          <path d="M580,95 L650,18 L690,52 L730,95 Z" class="mountain-dark" />
          <path d="M580,95 L650,18 L632,38 L608,68 Z" class="mountain-highlight" />

          <path d="M670,95 L725,42 L755,68 L785,95 Z" class="mountain-dark" opacity="0.9" />

          <!-- Cumbres Derecha-Centro -->
          <path d="M740,95 L820,26 L860,56 L910,95 Z" class="mountain-dark" />
          <path d="M740,95 L820,26 L800,46 L775,72 Z" class="mountain-highlight" />

          <path d="M850,95 L915,35 L945,60 L980,95 Z" class="mountain-dark" />
          <path d="M850,95 L915,35 L898,52 L876,74 Z" class="mountain-highlight" />

          <path d="M930,95 L995,22 L1040,52 L1090,95 Z" class="mountain-dark" />
          <path d="M930,95 L995,22 L976,44 L954,70 Z" class="mountain-highlight" />
          <path d="M995,22 L1010,38 L995,46 L982,35 Z" class="snow-cap" />

          <!-- Cumbres del Extremo Derecho -->
          <path d="M1040,95 L1105,45 L1135,68 L1170,95 Z" class="mountain-dark" />
          <path d="M1040,95 L1105,45 L1088,60 L1068,78 Z" class="mountain-highlight" />

          <path d="M1120,95 L1185,40 L1215,62 L1250,95 Z" class="mountain-dark" />
          <path d="M1120,95 L1185,40 L1168,55 L1148,75 Z" class="mountain-highlight" />

          <path d="M1190,95 L1255,52 L1285,72 L1320,95 Z" class="mountain-dark" opacity="0.85" />

          <path d="M1270,95 L1335,48 L1365,68 L1400,95 Z" class="mountain-dark" />
          <path d="M1270,95 L1335,48 L1318,62 L1298,78 Z" class="mountain-highlight" />

          <path d="M1350,95 L1400,65 L1425,80 L1440,95 Z" class="mountain-dark" />
          <path d="M1350,95 L1400,65 L1390,75 L1372,85 Z" class="mountain-highlight" />
        </g>

        <!-- Línea Base Continua pegada al footer sin fisura -->
        <path d="M0,95.5 L1440,95.5" stroke="#045D56" stroke-width="2.5" class="base-stroke" />
      </svg>
    </div>
  </div>
</template>

<style scoped lang="scss">
.mountain-divider-container {
  margin: 0;
  padding: 0;
  line-height: 0;
  margin-bottom: -1px;

  .mountain-svg {
    width: 100%;
    height: 32px;

    @media (min-width: 768px) {
      height: 48px;
    }

    @media (min-width: 1200px) {
      height: 60px;
    }
  }

  .mountain-dark {
    fill: #045D56;
  }

  .mountain-highlight {
    fill: #0FA095;
  }

  .snow-cap {
    fill: #2DD4BF;
  }

  .base-stroke {
    color: #045D56;
  }
}
</style>
