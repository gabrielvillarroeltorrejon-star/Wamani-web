<script setup lang="ts">
import { useContentStore } from '@/shared/stores/contentStore';
import SectionDivider from '@/shared/ui/SectionDivider.vue';

const contentStore = useContentStore();
</script>

<template>
  <section class="hero-section position-relative d-flex align-items-center justify-content-center overflow-hidden">
    <!-- Video de fondo inmersivo de Wamani -->
    <video 
      :key="contentStore.content.home.hero.videoUrl"
      :src="contentStore.content.home.hero.videoUrl" 
      autoplay loop muted playsinline 
      class="hero-video position-absolute top-0 start-0 w-100 h-100 object-fit-cover"
    ></video>
    
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
    </div>

    <!-- Cumbres de la Cordillera pegadas exactamente al final sin bordes negros -->
    <div class="hero-divider-overlay position-absolute start-0 w-100 z-3 m-0 p-0">
      <SectionDivider />
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
  transform: scale(1.05);
  filter: drop-shadow(0 20px 45px rgba(0, 0, 0, 0.85));
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

/* Animaciones */
.slide-up {
  opacity: 0;
  transform: translateY(40px);
  animation: slideUp 1.2s cubic-bezier(0.19, 1, 0.22, 1) forwards;
}

.delay-1 { animation-delay: 0.2s; }
.delay-2 { animation-delay: 0.4s; }

@keyframes slideUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
