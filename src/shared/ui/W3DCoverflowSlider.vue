<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import type { Experience } from '@/entities/experience/model/schemas';

const props = defineProps<{
  experiences: Experience[];
  autoPlayInterval?: number;
  title?: string;
  subtitle?: string;
}>();

const emit = defineEmits<{
  (e: 'open', exp: Experience): void;
}>();

const currentIndex = ref(0);
const isHovered = ref(false);
let autoPlayTimer: ReturnType<typeof setInterval> | null = null;

// Touch Swipe State
let touchStartX = 0;
let touchEndX = 0;

const totalExperiences = computed(() => props.experiences.length);

const activeExperience = computed(() => {
  if (!props.experiences.length) return null;
  return props.experiences[currentIndex.value] || props.experiences[0];
});

const nextSlide = () => {
  if (totalExperiences.value === 0) return;
  currentIndex.value = (currentIndex.value + 1) % totalExperiences.value;
};

const prevSlide = () => {
  if (totalExperiences.value === 0) return;
  currentIndex.value = (currentIndex.value - 1 + totalExperiences.value) % totalExperiences.value;
};

const goToSlide = (index: number) => {
  currentIndex.value = index;
};

const handleCardClick = (index: number, exp: Experience) => {
  if (currentIndex.value === index) {
    // Si ya está activa, abrir modal de detalles
    emit('open', exp);
  } else {
    // Si es lateral, traer al centro
    goToSlide(index);
  }
};

// Touch Handlers
const onTouchStart = (e: TouchEvent) => {
  touchStartX = e.touches[0].clientX;
  isHovered.value = true;
};

const onTouchMove = (e: TouchEvent) => {
  touchEndX = e.touches[0].clientX;
};

const onTouchEnd = () => {
  isHovered.value = false;
  const swipeDistance = touchEndX - touchStartX;
  if (Math.abs(swipeDistance) > 35) {
    if (swipeDistance > 0) {
      prevSlide();
    } else {
      nextSlide();
    }
  }
  touchStartX = 0;
  touchEndX = 0;
};

// Helper para calcular posición y transformaciones 3D
const getCardStyle = (index: number) => {
  const total = totalExperiences.value;
  if (total === 0) return {};

  let diff = (index - currentIndex.value) % total;
  if (diff > total / 2) diff -= total;
  if (diff < -total / 2) diff += total;

  // Calculamos el estilo según la distancia al centro con apertura amplia
  if (diff === 0) {
    // Centro Activo
    return {
      transform: 'translateX(0px) translateZ(100px) rotateY(0deg) scale(1.12)',
      zIndex: 10,
      opacity: 1,
      filter: 'brightness(1)',
      cursor: 'pointer',
      visibility: 'visible' as const
    };
  } else if (diff === 1) {
    // Inmediata Derecha
    return {
      transform: 'translateX(clamp(130px, 24vw, 290px)) translateZ(-40px) rotateY(-36deg) scale(0.88)',
      zIndex: 8,
      opacity: 0.85,
      filter: 'brightness(0.68)',
      cursor: 'pointer',
      visibility: 'visible' as const
    };
  } else if (diff === -1) {
    // Inmediata Izquierda
    return {
      transform: 'translateX(clamp(-290px, -24vw, -130px)) translateZ(-40px) rotateY(36deg) scale(0.88)',
      zIndex: 8,
      opacity: 0.85,
      filter: 'brightness(0.68)',
      cursor: 'pointer',
      visibility: 'visible' as const
    };
  } else if (diff === 2) {
    // Extrema Derecha
    return {
      transform: 'translateX(clamp(240px, 44vw, 540px)) translateZ(-140px) rotateY(-46deg) scale(0.72)',
      zIndex: 6,
      opacity: 0.55,
      filter: 'brightness(0.45)',
      cursor: 'pointer',
      visibility: 'visible' as const
    };
  } else if (diff === -2) {
    // Extrema Izquierda
    return {
      transform: 'translateX(clamp(-540px, -44vw, -240px)) translateZ(-140px) rotateY(46deg) scale(0.72)',
      zIndex: 6,
      opacity: 0.55,
      filter: 'brightness(0.45)',
      cursor: 'pointer',
      visibility: 'visible' as const
    };
  } else {
    // Ocultas fuera de vista
    const direction = diff > 0 ? 1 : -1;
    return {
      transform: `translateX(${direction * 700}px) translateZ(-250px) scale(0.5)`,
      zIndex: 1,
      opacity: 0,
      pointerEvents: 'none' as const,
      visibility: 'hidden' as const
    };
  }
};

const startAutoPlay = () => {
  stopAutoPlay();
  const interval = props.autoPlayInterval || 1500;
  autoPlayTimer = setInterval(() => {
    if (!isHovered.value) {
      nextSlide();
    }
  }, interval);
};

const stopAutoPlay = () => {
  if (autoPlayTimer) {
    clearInterval(autoPlayTimer);
    autoPlayTimer = null;
  }
};

onMounted(() => {
  startAutoPlay();
});

onUnmounted(() => {
  stopAutoPlay();
});
</script>

<template>
  <div 
    class="coverflow-3d-wrapper position-relative"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
  >
    <!-- Fondo Ambiental Difuminado Dinámico -->
    <div class="coverflow-ambient-bg" v-if="activeExperience">
      <img 
        :src="activeExperience.coverImage.url" 
        :alt="activeExperience.title"
        class="ambient-img"
      >
      <div class="ambient-overlay"></div>
    </div>

    <!-- TÍTULO INTEGRADO DENTRO DEL CARRUSEL -->
    <div class="coverflow-header text-center mb-2 z-3 position-relative">
      <h2 class="coverflow-section-title font-brush display-3 text-white mb-1" style="font-family: 'Caveat', cursive !important; text-shadow: 0 3px 12px rgba(0,0,0,0.85);">
        {{ title || 'Tours Destacados' }}
      </h2>
      <p class="text-white fw-semibold small mb-0 font-sans" style="color: #FFFFFF !important; font-size: 0.95rem; text-shadow: 0 2px 6px rgba(0,0,0,0.85);">
        {{ subtitle || 'Explora nuestras experiencias más exclusivas y cotizadas' }}
      </p>
    </div>

    <!-- Escenario 3D Central con Altura Dinámica -->
    <div class="coverflow-stage">
      <div 
        v-for="(exp, idx) in experiences" 
        :key="exp.id"
        class="coverflow-card"
        :style="getCardStyle(idx)"
        @click="handleCardClick(idx, exp)"
      >
        <!-- Imagen de Portada -->
        <img 
          :src="exp.coverImage.url" 
          :alt="exp.coverImage.alt || exp.title"
          class="coverflow-card-img"
          loading="lazy"
        >

        <!-- Contenido y Textos Inferiores -->
        <div class="coverflow-info">
          <h3 class="coverflow-title font-brush">{{ exp.title }}</h3>
          <p class="coverflow-subtitle">{{ exp.subtitle || exp.summary }}</p>
        </div>

        <!-- Borde sutil de brillo -->
        <div class="coverflow-glow-border"></div>
      </div>
    </div>

    <!-- Flechas Circulares de Navegación (< y >) -->
    <button 
      class="coverflow-nav-btn prev-btn" 
      @click.stop="prevSlide" 
      aria-label="Experiencia anterior"
    >
      <i class="bi bi-chevron-left"></i>
    </button>
    
    <button 
      class="coverflow-nav-btn next-btn" 
      @click.stop="nextSlide" 
      aria-label="Siguiente experiencia"
    >
      <i class="bi bi-chevron-right"></i>
    </button>

    <!-- Indicadores de Puntos Inferiores -->
    <div class="coverflow-indicators d-flex justify-content-center gap-2 mt-2 z-3">
      <button 
        v-for="(_, index) in experiences" 
        :key="`dot-${index}`"
        class="coverflow-dot"
        :class="{ active: index === currentIndex }"
        @click="goToSlide(index)"
        :aria-label="`Ir a tour ${index + 1}`"
      ></button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.coverflow-3d-wrapper {
  width: 100%;
  min-height: 85vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 3rem 1.5rem 2rem 1.5rem;
  border-radius: 28px;
  overflow: hidden;
  position: relative;
  background: rgba(4, 93, 86, 0.4);
  backdrop-filter: blur(18px);
  border: 1px solid rgba(45, 212, 191, 0.25);
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.35);
  user-select: none;

  @media (max-width: 768px) {
    min-height: 75vh;
    padding: 2rem 0.75rem 1.5rem 0.75rem;
    border-radius: 20px;
  }
}

.coverflow-header {
  .coverflow-section-title {
    font-size: clamp(2.2rem, 4vw, 3.8rem);
    text-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
    letter-spacing: 0.02em;
  }
}

// Fondo Dinámico Suave
.coverflow-ambient-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  overflow: hidden;
  pointer-events: none;

  .ambient-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: blur(45px) brightness(0.4);
    transform: scale(1.2);
    transition: all 0.8s ease;
  }

  .ambient-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at center, rgba(4, 93, 86, 0.35) 0%, rgba(3, 62, 59, 0.9) 100%);
  }
}

// Escenario con Perspectiva 3D Realista
.coverflow-stage {
  position: relative;
  height: clamp(400px, 56vh, 540px);
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 1400px;
  perspective-origin: 50% 50%;
  transform-style: preserve-3d;
  z-index: 5;
  margin: 1rem 0;

  @media (max-width: 768px) {
    height: 360px;
    margin: 0.5rem 0;
  }
}

// Tarjetas 3D
.coverflow-card {
  position: absolute;
  width: clamp(220px, 24vw, 320px);
  height: clamp(340px, 50vh, 480px);
  border-radius: 20px;
  overflow: hidden;
  background-color: #033E3B;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.6);
  transform-origin: center center;
  transition: transform 0.45s cubic-bezier(0.25, 1, 0.5, 1),
              opacity 0.45s cubic-bezier(0.25, 1, 0.5, 1),
              filter 0.45s cubic-bezier(0.25, 1, 0.5, 1),
              box-shadow 0.45s ease;
  will-change: transform, opacity;
  touch-action: pan-y;

  @media (max-width: 768px) {
    width: clamp(190px, 58vw, 240px);
    height: 330px;
    border-radius: 16px;
  }

  .coverflow-card-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    pointer-events: none;
  }



  // Gradiente y Textos
  .coverflow-info {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 3rem 1.75rem 1.75rem 1.75rem;
    background: linear-gradient(
      to top,
      rgba(3, 62, 59, 0.98) 0%,
      rgba(3, 62, 59, 0.75) 45%,
      rgba(3, 62, 59, 0.2) 75%,
      transparent 100%
    );
    z-index: 2;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;

    @media (max-width: 768px) {
      padding: 1.5rem 1rem 1rem 1rem;
    }

    .coverflow-title {
      font-size: clamp(1.4rem, 2vw, 2rem);
      line-height: 1.15;
      color: #FFFFFF !important;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.7);
      margin-bottom: 0.4rem;

      @media (max-width: 768px) {
        font-size: 1.3rem;
        margin-bottom: 0.2rem;
      }
    }

    .coverflow-subtitle {
      font-size: 0.88rem;
      color: #FFFFFF !important;
      font-weight: 500;
      margin-bottom: 0;
      line-height: 1.35;
      text-shadow: 0 1px 6px rgba(0, 0, 0, 0.8);

      @media (max-width: 768px) {
        font-size: 0.78rem;
      }
    }
  }

  .coverflow-glow-border {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border: 1px solid rgba(45, 212, 191, 0.25);
    border-radius: inherit;
    pointer-events: none;
    transition: border-color 0.4s ease;
  }

  &:hover {
    .coverflow-glow-border {
      border-color: rgba(45, 212, 191, 0.7);
    }
  }
}

// Botones de Navegación (< y >)
.coverflow-nav-btn {
  position: absolute;
  top: 52%;
  transform: translateY(-50%);
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: rgba(3, 62, 59, 0.8);
  border: 1px solid rgba(45, 212, 191, 0.5);
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.35rem;
  z-index: 20;
  cursor: pointer;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);

  &.prev-btn {
    left: 2rem;
  }

  &.next-btn {
    right: 2rem;
  }

  &:hover {
    background: #2DD4BF;
    color: #033E3B;
    border-color: #2DD4BF;
    box-shadow: 0 0 22px rgba(45, 212, 191, 0.85);
    transform: translateY(-50%) scale(1.12);
  }

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    font-size: 1.1rem;

    &.prev-btn { left: 0.5rem; }
    &.next-btn { right: 0.5rem; }
  }
}

// Puntos Indicadores
.coverflow-indicators {
  position: relative;
  z-index: 10;

  .coverflow-dot {
    width: 10px;
    height: 10px;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.25);
    border: none;
    padding: 0;
    cursor: pointer;
    transition: all 0.3s ease;

    &.active {
      width: 36px;
      background: linear-gradient(90deg, #0FA095, #2DD4BF);
      box-shadow: 0 0 12px rgba(45, 212, 191, 0.8);
    }

    &:hover:not(.active) {
      background: rgba(255, 255, 255, 0.5);
    }
  }
}
</style>
