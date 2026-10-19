<script setup lang="ts">
import { useContentStore } from '@/shared/stores/contentStore';

const contentStore = useContentStore();
</script>

<template>
  <div class="about-view">
    <!-- Hero Section -->
    <section class="about-hero position-relative d-flex align-items-center justify-content-center text-center" :style="{ backgroundImage: 'url(' + (contentStore.content.about.heroImage || '/961c6329-cc6b-4e0d-bff5-df7f6ce1f26b.jpg') + ')' }">
      <div class="overlay position-absolute top-0 start-0 w-100 h-100"></div>
      <div class="container position-relative z-2">
        <h1 class="font-brush hero-title mb-3 slide-up text-white">{{ contentStore.content.about.heroTitle }}</h1>
        <p class="font-sans text-uppercase tracking-wide opacity-75 slide-up text-white" style="letter-spacing: 0.2em;">{{ contentStore.content.about.heroSubtitle }}</p>
      </div>
    </section>

    <!-- Historia Section (Asimétrica con Imagen) -->
    <section class="history-section py-5 my-0">
      <div class="container py-4">
        <div class="row align-items-center g-5">
          <div class="col-lg-6 position-relative">
            <!-- Bloque decorativo detrás de la imagen -->
            <div class="position-absolute top-0 start-0 w-75 h-100 rounded-4" style="background-color: #E7DCC3; margin-left: -20px; margin-top: -20px; z-index: 0;"></div>
            <img :src="contentStore.content.about.historyImage" :alt="contentStore.content.about.historyTitle" class="img-fluid rounded-4 shadow-lg object-fit-cover w-100 position-relative z-1 history-main-img">
          </div>
          <div class="col-lg-6 px-lg-5">
            <span class="small text-uppercase fw-bold d-block mb-2" style="color: #147E79; letter-spacing: 0.12em;">Nuestra Historia</span>
            <h2 class="display-4 fw-bold mb-2 font-sans" style="color: #147E79;">{{ contentStore.content.about.historyTitle }}</h2>
            <h3 class="fs-2 mb-4 brand-slogan" style="color: #147E79;">{{ contentStore.content.about.historySubtitle }}</h3>
            <p class="font-sans lead fw-medium lh-lg mb-4" style="color: #4C4C4C !important; font-size: 1.15rem;">
              {{ contentStore.content.about.historyText1 }}
            </p>
            <p class="font-sans fw-medium lh-lg" style="color: #4C4C4C !important; font-size: 1.05rem;">
              {{ contentStore.content.about.historyText2 }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Misión y Visión (Contenedores Cuadrados y Centrados) -->
    <section class="mission-vision-section py-5" style="background-color: #FAF8F5;">
      <div class="container py-4">
        <div class="row g-4 g-lg-5 justify-content-center">
          
          <!-- Contenedor 1: Nuestra Misión -->
          <div class="col-12 col-md-6 col-lg-6 col-xl-5 d-flex justify-content-center">
            <div class="mv-card p-4 p-md-5 w-100 position-relative overflow-hidden d-flex flex-column align-items-center justify-content-center text-center">
              <div class="position-relative z-2 d-flex flex-column align-items-center justify-content-center">
                <h3 class="display-5 mb-2 text-white font-sans fw-bold">
                  Nuestra Misión
                </h3>
                
                <div class="mv-divider mb-4 mx-auto" style="background: #E7DCC3;"></div>

                <p class="font-sans text-white fw-medium lh-lg mb-0 mv-text" style="color: #FFFFFF !important; font-size: 1.05rem;">
                  {{ contentStore.content.about.mission }}
                </p>
              </div>
            </div>
          </div>

          <!-- Contenedor 2: Nuestra Visión -->
          <div class="col-12 col-md-6 col-lg-6 col-xl-5 d-flex justify-content-center">
            <div class="mv-card p-4 p-md-5 w-100 position-relative overflow-hidden d-flex flex-column align-items-center justify-content-center text-center">
              <div class="position-relative z-2 d-flex flex-column align-items-center justify-content-center">
                <h3 class="display-5 mb-2 text-white font-sans fw-bold">
                  Nuestra Visión
                </h3>

                <div class="mv-divider mb-4 mx-auto" style="background: #E7DCC3;"></div>

                <p class="font-sans text-white fw-medium lh-lg mb-0 mv-text" style="color: #FFFFFF !important; font-size: 1.05rem;">
                  {{ contentStore.content.about.vision }}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- Equipo & Guías Certificados -->
    <section v-if="contentStore.content.about.advisors && contentStore.content.about.advisors.length > 0" id="guias" class="advisors-section py-5 my-0" style="background-color: #FFFFFF;">
      <div class="container py-4">
        <div class="text-center mb-5">
          <div class="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-3" style="background: rgba(20, 126, 121, 0.08); border: 1px solid rgba(20, 126, 121, 0.2);">
            <i class="bi bi-people-fill" style="color: #147E79;"></i>
            <span class="small text-uppercase fw-bold" style="letter-spacing: 0.1em; font-size: 0.75rem; color: #147E79;">Equipo & Fundadores</span>
          </div>
          <h2 class="display-5 font-sans fw-bold mb-2" style="color: #147E79;">{{ contentStore.content.about.advisorsTitle || 'Nuestros Guías & Equipo' }}</h2>
          <p class="font-sans lead fw-medium max-w-700 mx-auto" style="font-size: 1.15rem; color: #4C4C4C !important;">
            {{ contentStore.content.about.advisorsSubtitle }}
          </p>
        </div>

        <div class="row g-4 justify-content-center">
          <div v-for="adv in contentStore.content.about.advisors" :key="adv.id" class="col-12 col-md-6 col-lg-4">
            <div class="advisor-card h-100 rounded-4 overflow-hidden shadow-sm position-relative d-flex flex-column border-0" style="background-color: #FFFFFF;">
              <div class="advisor-img-wrapper position-relative overflow-hidden" style="height: 290px; background-color: #E7DCC3;">
                <img 
                  :src="adv.image || 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=80'" 
                  :alt="adv.name" 
                  class="w-100 h-100 object-fit-cover transition-all hover-scale"
                  @error="(e: Event) => ((e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=80')"
                />
                <div class="position-absolute top-0 start-0 w-100 h-100" style="background: linear-gradient(to top, rgba(20, 126, 121, 0.95) 0%, rgba(20, 126, 121, 0.3) 50%, transparent 100%);"></div>
                <div class="position-absolute bottom-0 start-0 p-4 w-100">
                  <h3 class="h4 text-white mb-0 font-sans fw-bold">{{ adv.name }}</h3>
                  <span class="font-sans text-uppercase tracking-wide small d-block mt-1 fw-bold" style="font-size: 0.78rem; color: #E7DCC3 !important; letter-spacing: 0.08em;">
                    <i class="bi bi-patch-check-fill me-1"></i>{{ adv.role }}
                  </span>
                </div>
              </div>
              <div class="p-4 flex-grow-1 d-flex flex-column justify-content-between" style="border: 1px solid rgba(231, 220, 195, 0.5); border-top: none;">
                <p class="font-sans fw-medium lh-lg mb-0" style="font-size: 0.95rem; color: #4C4C4C !important;">
                  {{ adv.bio }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Calidad y Acreditaciones -->
    <section class="quality-section py-5 my-0">
      <div class="container text-center py-5">
        <h2 class="font-brush display-3 text-white mb-2" style="font-family: 'Caveat', cursive !important;">Excelencia</h2>
        <h3 class="font-brush display-4 mb-4 text-white" style="font-family: 'Caveat', cursive !important;">Compromiso Total</h3>
        
        <div class="row justify-content-center mb-5">
          <div class="col-lg-8">
            <p class="font-sans lead text-white fw-medium lh-lg" style="color: #FFFFFF !important; font-size: 1.15rem;">
              El enfoque principal de Wamani Experience es destacar por la <strong class="text-white">calidad inigualable de nuestros servicios</strong>. 
              Cuidamos cada detalle para que tu única preocupación sea disfrutar del paisaje.
            </p>
          </div>
        </div>
        
        <!-- Sernatur & Marca Chile -->
        <div class="d-flex flex-wrap justify-content-center align-items-center gap-5 mt-5">
          <div class="accreditation-card text-center">
            <div class="icon-circle mb-4 mx-auto d-flex align-items-center justify-content-center rounded-circle overflow-hidden p-3 shadow-lg">
              <img :src="contentStore.content.about.accreditations.sernatur.imageUrl" alt="SERNATUR" class="w-100 h-100 object-fit-contain" style="filter: brightness(0) invert(1); transform: scale(1.12);" />
            </div>
            <h4 class="font-sans text-uppercase tracking-wide text-white fw-bold mb-1" style="font-size: 1.05rem; letter-spacing: 0.12em; color: #FFFFFF !important;">{{ contentStore.content.about.accreditations.sernatur.text }}</h4>
            <p class="small text-white fw-medium mb-1" style="font-size: 0.95rem; color: #FFFFFF !important;">{{ contentStore.content.about.accreditations.sernatur.subtext }}</p>
            <p class="small text-accent fw-bold mb-1" style="font-size: 0.85rem;">Reg. N° {{ contentStore.content.legal.sernaturRegistry }}</p>
            <a :href="contentStore.content.legal.sernaturUrl" target="_blank" rel="noopener noreferrer" class="small text-white opacity-75 text-decoration-underline" style="font-size: 0.78rem;">
              Verificar en SERNATUR <i class="bi bi-box-arrow-up-right ms-1"></i>
            </a>
          </div>
          
          <div class="accreditation-card text-center">
            <div class="icon-square mb-4 mx-auto d-flex align-items-center justify-content-center rounded-4 overflow-hidden p-3 shadow-lg">
              <img :src="contentStore.content.about.accreditations.marcaChile.imageUrl" alt="MARCA CHILE" class="w-100 h-100 object-fit-contain rounded-3" />
            </div>
            <h4 class="font-sans text-uppercase tracking-wide text-white fw-bold mb-1" style="font-size: 1.05rem; letter-spacing: 0.12em; color: #FFFFFF !important;">{{ contentStore.content.about.accreditations.marcaChile.text }}</h4>
            <p class="small text-white fw-medium mb-0" style="font-size: 0.95rem; color: #FFFFFF !important;">{{ contentStore.content.about.accreditations.marcaChile.subtext }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.about-view {
  min-height: 100vh;
  background-color: var(--bs-light);
  color: #045D56;
}

.about-hero {
  min-height: 60vh;
  background: url('/961c6329-cc6b-4e0d-bff5-df7f6ce1f26b.jpg') center/cover no-repeat;
  background-attachment: fixed;
}

.overlay {
  background: linear-gradient(to bottom, rgba(26,26,26,0.6) 0%, rgba(131, 170, 168, 1) 100%);
}

.hero-title {
  font-size: 5rem;
}

@media (min-width: 768px) {
  .hero-title {
    font-size: 8rem;
  }
}

.text-gold {
  color: #2DD4BF;
}

.text-accent {
  color: #2DD4BF !important;
}

.history-main-img {
  height: clamp(340px, 45vw, 600px);
}

.tracking-wide {
  letter-spacing: 0.1em;
}

.max-w-700 {
  max-width: 700px;
}

/* ----------------------------------------------------
   Misión y Visión (Tarjetas Cuadradas y Centradas)
---------------------------------------------------- */
.mv-card {
  background: linear-gradient(145deg, #045D56 0%, #033E3B 100%);
  border: 1px solid rgba(45, 212, 191, 0.35);
  border-radius: 32px;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.25);
  min-height: 400px;
  max-width: 540px;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s ease, box-shadow 0.4s ease;
}

.mv-card:hover {
  transform: translateY(-8px);
  border-color: rgba(45, 212, 191, 0.7);
  box-shadow: 0 30px 65px rgba(0, 0, 0, 0.35);
}

.mv-card-glow {
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(45, 212, 191, 0.15) 0%, transparent 70%);
  pointer-events: none;
  z-index: 1;
}

.mv-divider {
  width: 70px;
  height: 3px;
  background: linear-gradient(90deg, transparent 0%, #2DD4BF 50%, transparent 100%);
  border-radius: 2px;
  box-shadow: 0 0 12px rgba(45, 212, 191, 0.7);
}

.title-glow {
  text-shadow: 0 3px 12px rgba(0, 0, 0, 0.5);
  font-family: 'Caveat', cursive !important;
}

.mv-text {
  font-size: 1.15rem;
  line-height: 1.9;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}

/* Acreditaciones */
.icon-circle, .icon-square {
  width: 175px;
  height: 175px;
  background-color: #045D56 !important;
  border: 1px solid rgba(45, 212, 191, 0.35) !important;
  box-shadow: 0 14px 35px rgba(0, 0, 0, 0.25);
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease, box-shadow 0.3s ease;
}

.accreditation-card:hover .icon-circle,
.accreditation-card:hover .icon-square {
  transform: translateY(-6px) scale(1.05);
  border-color: #2DD4BF !important;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.35);
}

.min-h-200 {
  min-height: 200px;
}

/* Tarjetas de Asesores */
.advisor-card {
  border: 1px solid rgba(45, 212, 191, 0.3);
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s ease, box-shadow 0.4s ease;
}

.advisor-card:hover {
  transform: translateY(-8px);
  border-color: rgba(45, 212, 191, 0.7);
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.45) !important;
}

.hover-scale {
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.advisor-card:hover .hover-scale {
  transform: scale(1.08);
}
</style>
