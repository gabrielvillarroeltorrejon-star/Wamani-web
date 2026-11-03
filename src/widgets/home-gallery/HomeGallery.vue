<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useContentStore } from '@/shared/stores/contentStore';

const contentStore = useContentStore();

// Lógica de Carrusel Automático y Navegación
const carouselRef = ref<HTMLElement | null>(null);
let autoScrollTimer: ReturnType<typeof setInterval> | null = null;
const isHovered = ref(false);

const startAutoScroll = () => {
  stopAutoScroll();
  autoScrollTimer = setInterval(() => {
    if (!carouselRef.value || isHovered.value) return;
    const el = carouselRef.value;
    const scrollStep = 370; // Ancho aproximado de tarjeta + gap
    
    // Si llegó al final, volver suavemente al inicio
    if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 15) {
      el.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      el.scrollBy({ left: scrollStep, behavior: 'smooth' });
    }
  }, 3500);
};

const stopAutoScroll = () => {
  if (autoScrollTimer) {
    clearInterval(autoScrollTimer);
    autoScrollTimer = null;
  }
};

const scrollCarousel = (direction: 'left' | 'right') => {
  if (!carouselRef.value) return;
  const el = carouselRef.value;
  const scrollStep = 370;
  if (direction === 'left') {
    if (el.scrollLeft <= 10) {
      el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
    } else {
      el.scrollBy({ left: -scrollStep, behavior: 'smooth' });
    }
  } else {
    if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 15) {
      el.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      el.scrollBy({ left: scrollStep, behavior: 'smooth' });
    }
  }
};

const handleMouseEnter = () => {
  isHovered.value = true;
};

const handleMouseLeave = () => {
  isHovered.value = false;
};

onMounted(() => {
  startAutoScroll();
});

onUnmounted(() => {
  stopAutoScroll();
});
</script>

<template>
  <section id="galeria" class="home-gallery-section py-5 position-relative overflow-hidden">
    <div class="container py-4">
      
      <!-- ENCABEZADO EDITORIAL (Sin botones de filtro) -->
      <div class="text-center mb-5">
        <span class="badge px-3 py-2 rounded-pill font-sans text-uppercase tracking-wider fw-bold text-accent mb-3" style="background: rgba(231, 220, 195, 0.15); border: 1px solid rgba(231, 220, 195, 0.3); letter-spacing: 0.15em;">
          <i class="bi bi-camera-fill me-1"></i> FOTOGRAFÍA & PAISAJES
        </span>
        <h2 class="display-4 font-brush fw-bold mb-3 text-white" style="font-family: 'Caveat', cursive !important; text-shadow: 0 3px 10px rgba(0,0,0,0.35);">
          Galería Visual de Expediciones
        </h2>
        <p class="lead text-white opacity-90 max-w-700 mx-auto mb-0" style="font-size: 1.15rem; color: #FFFFFF !important;">
          Postales reales capturadas por nuestros guías y viajeros en los rincones más salvajes y sobrecogedores del sur de Chile.
        </p>
      </div>

      <!-- CONTENEDOR DEL CARRUSEL CON BOTONES DE NAVEGACIÓN -->
      <div 
        class="gallery-carousel-wrapper position-relative"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
        @touchstart="handleMouseEnter"
        @touchend="handleMouseLeave"
      >
        <!-- Botón Mover a la Izquierda -->
        <button 
          type="button" 
          class="gallery-nav-btn prev-btn shadow-lg"
          @click="scrollCarousel('left')"
          aria-label="Fotografía anterior"
        >
          <i class="bi bi-chevron-left"></i>
        </button>

        <!-- Track del Carrusel (Movimiento Automático + Manual) -->
        <div 
          ref="carouselRef" 
          class="gallery-carousel-track d-flex gap-4 py-2 px-1"
        >
          <div 
            v-for="(img, idx) in contentStore.galleryImages" 
            :key="img.id || idx" 
            class="gallery-card-item flex-shrink-0"
          >
            <!-- TARJETA FIJA / NO CLICKEABLE -->
            <div class="gallery-card rounded-4 overflow-hidden position-relative shadow">
              <!-- Imagen de Fondo -->
              <img 
                :src="img.url" 
                :alt="img.title" 
                class="gallery-card-img w-100 h-100 object-fit-cover" 
                loading="lazy"
              >
              
              <!-- Gradiente de Contraste para Lectura Perfecta -->
              <div class="gallery-card-overlay position-absolute bottom-0 start-0 w-100 p-4 d-flex flex-column justify-content-end text-white">
                <!-- Título Completo (Sin cortes) -->
                <h4 class="h5 fw-bold mb-2 font-serif text-white gallery-title">
                  {{ img.title }}
                </h4>
                
                <!-- Leyenda / Descripción Completa (Sin cortes ni elipsis) -->
                <p v-if="img.caption" class="gallery-caption mb-0 text-beige lh-base">
                  {{ img.caption }}
                </p>
              </div>
            </div>
          </div>

          <div v-if="contentStore.galleryImages.length === 0" class="w-100 text-center py-5 text-white opacity-75">
            <i class="bi bi-images fs-1 text-accent d-block mb-3"></i>
            Aún no hay fotografías publicadas en la galería oficial.
          </div>
        </div>

        <!-- Botón Mover a la Derecha -->
        <button 
          type="button" 
          class="gallery-nav-btn next-btn shadow-lg"
          @click="scrollCarousel('right')"
          aria-label="Siguiente fotografía"
        >
          <i class="bi bi-chevron-right"></i>
        </button>
      </div>

    </div>
  </section>
</template>

<style scoped lang="scss">
.home-gallery-section {
  background: #092F2D;
  position: relative;
}

.max-w-700 {
  max-width: 700px;
}

.gallery-carousel-wrapper {
  position: relative;
  width: 100%;
}

.gallery-carousel-track {
  overflow-x: auto;
  scroll-behavior: smooth;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; // Firefox
  
  &::-webkit-scrollbar {
    display: none; // Chrome, Safari, Edge
  }
}

.gallery-card-item {
  scroll-snap-align: start;
  width: 360px;
  max-width: 85vw;
}

/* TARJETA FIJA / NO CLICKEABLE */
.gallery-card {
  height: 420px;
  background: #0D5B57;
  border: 1px solid rgba(231, 220, 195, 0.28);
  cursor: default; // Fija, no clickeable
  user-select: none;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    border-color: rgba(231, 220, 195, 0.6);
    box-shadow: 0 16px 36px rgba(0, 0, 0, 0.45) !important;
  }
}

.gallery-card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* GRADIENTE DE FONDO PARA TEXTO 100% VISIBLE Y LEGIBLE */
.gallery-card-overlay {
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0) 0%,
    rgba(9, 47, 45, 0.45) 30%,
    rgba(9, 47, 45, 0.88) 65%,
    #072624 100%
  );
  min-height: 160px;
  box-sizing: border-box;
}

.gallery-title {
  color: #FFFFFF !important;
  font-size: 1.18rem;
  line-height: 1.35;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
  word-wrap: break-word;
}

.gallery-caption {
  color: #E7DCC3 !important;
  font-size: 0.88rem;
  line-height: 1.5;
  opacity: 0.95;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
  word-wrap: break-word;
  white-space: normal;
}

/* BOTONES DE NAVEGACIÓN DEL CARRUSEL (EMIL KOWALSKI STYLE) */
.gallery-nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #0A4945;
  border: 1.5px solid #E7DCC3;
  color: #E7DCC3;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);

  &:hover {
    background: #E7DCC3;
    color: #0D5B57;
    border-color: #E7DCC3;
    transform: translateY(-50%) scale(1.08);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  }

  &:active {
    transform: translateY(-50%) scale(0.94);
  }

  &.prev-btn {
    left: -20px;
  }

  &.next-btn {
    right: -20px;
  }
}

@media (max-width: 991.98px) {
  .gallery-card-item {
    width: 320px;
  }
  
  .gallery-card {
    height: 400px;
  }

  .gallery-nav-btn {
    width: 42px;
    height: 42px;
    font-size: 1.1rem;

    &.prev-btn {
      left: 4px;
    }

    &.next-btn {
      right: 4px;
    }
  }
}

@media (max-width: 575.98px) {
  .gallery-card-item {
    width: 290px;
  }
  
  .gallery-card {
    height: 380px;
  }
}
</style>
