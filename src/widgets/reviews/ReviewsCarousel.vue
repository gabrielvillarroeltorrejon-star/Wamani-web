<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import WCard from '@/shared/ui/WCard.vue';

const mockReviews = ref([
  {
    id: 1,
    name: "Natalia H",
    date: "3 de febrero en",
    title: "Fue una experiencia maravillosa desde que nos recogieron, la parada a desayunar, recorrer tantos bellos lugares,impagabl",
    text: "Fue un tour maravilloso desde el inicio, hasta el fin,se nota la organización de cada...",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80"
  },
  {
    id: 2,
    name: "Karen N",
    date: "3 de febrero en",
    title: "Excelente y recomendable ( cercanía y conocimiento )",
    text: "Fue una experiencia maravillosa,Les puedo comentar que yo he hecho...",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80"
  },
  {
    id: 3,
    name: "Gianna R",
    date: "3 de febrero en",
    title: "Excelente Tour en Pucón 🙌🏻",
    text: "Muy buen tour el de Pucón + Termas Indómito, se disfrutó al máximo, súper atentos,...",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80"
  },
  {
    id: 4,
    name: "Marcela Noelia ... R",
    date: "1 de febrero en",
    title: "MARAVILLOSA EXPERIENCIA! 👌",
    text: "Experiencia 100% recomendada, se preocupan de cada detalle, información...",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80"
  },
  {
    id: 5,
    name: "Carolina M.",
    date: "Marzo 2026",
    title: "Una experiencia absolutamente inolvidable",
    text: "Desde el primer momento la atención fue de primer nivel. Hicimos el ascenso al volcán y los guías fueron...",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&h=150&q=80"
  },
  {
    id: 6,
    name: "Felipe T.",
    date: "Febrero 2026",
    title: "Excelente servicio personalizado",
    text: "Tomamos un tour a la medida por los siete lagos. Fue increíble no tener que preocuparnos de nada...",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80"
  }
]);

// Auto-scroll logic for carousel
const carouselRef = ref<HTMLElement | null>(null);
let autoScrollInterval: ReturnType<typeof setInterval>;

const startAutoScroll = () => {
  autoScrollInterval = setInterval(() => {
    if (!carouselRef.value) return;
    const el = carouselRef.value;
    const scrollAmount = 350; 
    
    if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 10) {
      el.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }, 4000);
};

const pauseAutoScroll = () => {
  clearInterval(autoScrollInterval);
};

const scrollCarousel = (direction: 'left' | 'right') => {
  if (!carouselRef.value) return;
  const el = carouselRef.value;
  const scrollAmount = 380;
  if (direction === 'left') {
    el.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  } else {
    el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }
};

onMounted(() => {
  startAutoScroll();
});

onUnmounted(() => {
  pauseAutoScroll();
});
</script>

<template>
  <div class="carousel-container position-relative">
    <!-- Botón de Navegación Izquierda -->
    <button class="carousel-nav-btn prev-btn" @click="scrollCarousel('left')" aria-label="Anterior">
      <i class="fa-solid fa-chevron-left"></i>
    </button>
    
    <div class="reviews-carousel pb-4 px-2" ref="carouselRef" @mouseenter="pauseAutoScroll" @mouseleave="startAutoScroll" @touchstart="pauseAutoScroll" @touchend="startAutoScroll">
      <div v-for="review in mockReviews" :key="review.id" class="review-item">
        <WCard class="h-100 border-0 shadow-sm review-card d-flex flex-column align-items-center text-center p-4">
          <!-- Estrellas Amarillas -->
          <div class="stars d-flex gap-1 justify-content-center mb-3">
            <i v-for="n in review.rating" :key="n" class="bi bi-star-fill text-warning" style="font-size: 1.1rem;"></i>
          </div>
          
          <!-- Título del review (Negrita en Blanco Puro) -->
          <h4 class="h6 fw-bold mb-2 text-white px-1" style="color: #FFFFFF !important; font-size: 1.05rem;">"{{ review.title }}"</h4>
          
          <!-- Extracto del review (Blanco Puro) -->
          <p class="text-white small lh-lg flex-grow-1 mb-2 text-center fw-medium" style="color: #FFFFFF !important; font-size: 0.88rem; max-height: 120px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical;">
            {{ review.text }}
          </p>
          
          <!-- Enlace Leer Más en Turquesa -->
          <a href="https://www.tripadvisor.cl/Attraction_Review-g294305-d33952297-Reviews-Wamani_experience-Santiago_Santiago_Metropolitan_Region.html" target="_blank" class="text-accent text-decoration-none small fw-bold d-block mb-3" style="color: #2DD4BF !important;">Leer más en TripAdvisor <i class="bi bi-arrow-up-right-square ms-1"></i></a>
          
          <!-- Autor y Avatar -->
          <div class="d-flex flex-column align-items-center mt-auto pt-3 border-top border-light border-opacity-25 w-100">
            <img :src="review.avatar" :alt="review.name" class="rounded-circle object-fit-cover shadow-sm mb-2" style="width: 48px; height: 48px; border: 2px solid #2DD4BF;" />
            <h5 class="fw-bold mb-0 text-white" style="font-size: 0.95rem; color: #FFFFFF !important;">{{ review.name }}</h5>
            <span class="small text-white opacity-75 mt-1" style="font-size: 0.75rem;">{{ review.date }}</span>
            
            <!-- Loguito TripAdvisor -->
            <div class="d-flex align-items-center justify-content-center gap-1 mt-2 text-white fw-semibold" style="font-size: 0.78rem;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="#2DD4BF" xmlns="http://www.w3.org/2000/svg" class="d-inline-block align-middle me-1">
                <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-3.5 17c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5zm0-4c-.827 0-1.5.673-1.5 1.5s.673 1.5 1.5 1.5 1.5-.673 1.5-1.5-.673-1.5-1.5-1.5zm7 4c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5zm0-4c-.827 0-1.5.673-1.5 1.5s.673 1.5 1.5 1.5 1.5-.673 1.5-1.5-.673-1.5-1.5-1.5zm.5-4h-8v-2h8v2z"/>
              </svg>
              <span style="color: #2DD4BF;">Tripadvisor Verificado</span>
            </div>
          </div>
        </WCard>
      </div>
    </div>

    <!-- Botón de Navegación Derecha -->
    <button class="carousel-nav-btn next-btn" @click="scrollCarousel('right')" aria-label="Siguiente">
      <i class="fa-solid fa-chevron-right"></i>
    </button>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables';

.carousel-container {
  width: 100%;
}

.reviews-carousel {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  gap: 1.5rem;
  padding: 1rem 0.5rem;
  
  &::-webkit-scrollbar {
    height: 8px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(0,0,0,0.05);
    border-radius: 10px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba($primary, 0.4);
    border-radius: 10px;
    
    &:hover {
      background: $primary;
    }
  }
  
  .review-item {
    flex: 0 0 300px;
    scroll-snap-align: center;
    
    @media (min-width: 768px) {
      flex: 0 0 360px;
    }
  }

  .review-card {
    background-color: #ffffff;
    border-radius: $border-radius-lg;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    border: 1px solid rgba(0, 0, 0, 0.03) !important;
    
    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 30px rgba(0,0,0,0.1) !important;
    }
  }
}

.carousel-nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(3, 62, 59, 0.85); /* Fondo verde bosque translúcido */
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0,0,0,0.15);
  
  &:hover {
    background: $primary;
    color: white;
    transform: translateY(-50%) scale(1.1);
  }
  
  &:active {
    transform: translateY(-50%) scale(0.95);
  }
}

.prev-btn {
  left: -15px;
  @media (min-width: 768px) {
    left: -25px;
  }
}

.next-btn {
  right: -15px;
  @media (min-width: 768px) {
    right: -25px;
  }
}
</style>
