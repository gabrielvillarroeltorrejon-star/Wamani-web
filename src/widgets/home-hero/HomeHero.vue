<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useContentStore } from '@/shared/stores/contentStore';

const contentStore = useContentStore();
const videoRef = ref<HTMLVideoElement | null>(null);

const videoSrc = computed(() => {
  return contentStore.content.home.hero.videoUrl || '/hero-video.mp4';
});

const forcePlay = () => {
  if (videoRef.value) {
    videoRef.value.muted = true;
    videoRef.value.defaultMuted = true;
    const playPromise = videoRef.value.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Modo ahorro de batería o restricción móvil, se desbloqueará con el primer toque
      });
    }
  }
};

onMounted(() => {
  forcePlay();
  window.addEventListener('touchstart', forcePlay, { once: true, passive: true });
  window.addEventListener('click', forcePlay, { once: true, passive: true });
});
</script>

<template>
  <section class="hero-section position-relative d-flex align-items-center justify-content-center overflow-hidden">
    <!-- Video de fondo inmersivo de Wamani con soporte nativo móvil -->
    <video 
      ref="videoRef"
      :key="videoSrc"
      autoplay 
      loop 
      muted 
      playsinline 
      webkit-playsinline
      x5-playsinline
      preload="metadata"
      poster="/hero-poster.jpg"
      class="hero-video position-absolute top-0 start-0 w-100 h-100 object-fit-cover"
      aria-label="Video de fondo de experiencias en la naturaleza"
    >
      <source :src="videoSrc" type="video/mp4">
    </video>
    
    <div class="overlay position-absolute top-0 start-0 w-100 h-100 z-1"></div>
    
    <div class="container position-relative z-2 text-center text-white d-flex flex-column align-items-center justify-content-center h-100 pt-5 pb-5">
      <!-- Logo Wamani encima del título -->
      <div class="hero-logo-wrapper mb-3 slide-up">
        <img src="/Logo Wamani.png" alt="Wamani Logo" class="hero-brand-logo" />
      </div>

      <!-- Título principal gigante tipo Brush -->
      <h1 class="font-brush hero-title mb-0 slide-up delay-1">
        {{ contentStore.content.home.hero.title }}
      </h1>
      <!-- Subtítulo pequeño tipo Sans-serif espaciado -->
      <p class="hero-subtitle font-sans text-uppercase mt-2 slide-up delay-2">
        {{ contentStore.content.home.hero.subtitle }}
      </p>

      <!-- CTA Button Principal con interacciones Kowalski -->
      <div class="mt-4 slide-up delay-3 d-flex flex-column align-items-center gap-3">
        <a href="#destinos" class="btn btn-hero-glass px-5 py-3 fs-6 font-sans text-uppercase rounded-pill text-decoration-none shadow-sm fw-bold">
          Ver Expediciones
        </a>
        
        <!-- Indicador sutil de scroll -->
        <a href="#destinos" class="hero-scroll-cue text-white text-decoration-none mt-2 d-inline-flex flex-column align-items-center gap-1" aria-label="Explorar expediciones de Chile">
          <i class="bi bi-chevron-down fs-5 scroll-bounce text-white opacity-75"></i>
        </a>
      </div>
    </div>

  </section>
</template>

<style scoped>
.hero-section {
  height: 100vh;
  min-height: 100svh;
  max-height: 980px;
  background-color: var(--bs-dark);
}

@media (max-width: 768px) {
  .hero-section {
    min-height: 540px;
    height: 92vh;
  }
}

.overlay {
  background: linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.6) 100%);
}

.hero-logo-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
}

.hero-brand-logo {
  height: 180px;
  width: auto;
  max-width: 85vw;
  filter: drop-shadow(0 15px 35px rgba(0, 0, 0, 0.7));
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), filter 0.4s ease;
}

.hero-brand-logo:hover {
  transform: scale(1.02);
  filter: drop-shadow(0 20px 45px rgba(0, 0, 0, 0.85));
}

.hero-brand-logo:active {
  transform: scale(0.96);
}

@media (max-width: 991px) {
  .hero-brand-logo {
    height: 135px;
  }
}

@media (max-width: 768px) {
  .hero-brand-logo {
    height: 105px;
  }
}

@media (max-width: 480px) {
  .hero-brand-logo {
    height: 88px;
  }

  .hero-title {
    font-size: clamp(2.8rem, 10vw, 4.2rem) !important;
    transform: rotate(-2deg);
  }

  .hero-subtitle {
    letter-spacing: 0.16em !important;
    font-size: 0.72rem !important;
  }
}

.hero-title {
  font-size: clamp(3.4rem, 11vw, 10.5rem);
  line-height: 1;
  text-shadow: 0 10px 30px rgba(0,0,0,0.35);
  transform: rotate(-3deg);
  word-break: break-word;
}

.hero-subtitle {
  letter-spacing: clamp(0.18em, 1.4vw, 0.45em);
  font-size: clamp(0.72rem, 1.8vw, 0.88rem);
  opacity: 0.9;
  padding: 0 1rem;
  max-width: 100%;
}

.hero-divider-overlay {
  bottom: 0;
  line-height: 0;
}

/* Animaciones Emil Kowalski Style */
.slide-up {
  opacity: 0;
  transform: translateY(30px);
  animation: slideUp 1s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

.delay-1 { animation-delay: 0.15s; }
.delay-2 { animation-delay: 0.3s; }
.delay-3 { animation-delay: 0.45s; }

.hero-scroll-cue {
  opacity: 0.85;
  transition: opacity 0.3s ease, transform 0.3s ease;
  cursor: pointer;
}

.hero-scroll-cue:hover {
  opacity: 1;
  transform: translateY(2px);
}

.scroll-cue-label {
  font-size: clamp(0.65rem, 1.2vw, 0.72rem);
  letter-spacing: 0.25em;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.7);
}

.scroll-bounce {
  animation: scrollBounce 2.5s infinite cubic-bezier(0.45, 0, 0.55, 1);
}

@keyframes scrollBounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(6px);
  }
}

@keyframes slideUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.btn-hero-glass {
  background: rgba(4, 93, 86, 0.45) !important; /* Turquesa oscuro transparente */
  backdrop-filter: blur(12px) !important;
  -webkit-backdrop-filter: blur(12px) !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  color: #FFFFFF !important;
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  
  &:hover {
    background: rgba(4, 93, 86, 0.75) !important;
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  }
  
  &:active {
    transform: scale(0.97) translateY(0);
  }
}
</style>
