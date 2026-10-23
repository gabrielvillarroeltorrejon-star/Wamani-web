<script setup lang="ts">
import { ref } from 'vue';
import { useContentStore } from '@/shared/stores/contentStore';

interface ServiceDetail {
  id: string;
  title: string;
  subtitle: string;
  coverImage: string;
  description: string[];
  targetAudience?: string;
  characteristics: string[];
  gallery: string[];
}

const contentStore = useContentStore();

// Estado del Modal
const selectedService = ref<ServiceDetail | null>(null);

const openModal = (service: any) => {
  selectedService.value = service;
  document.body.style.overflow = 'hidden'; // Evitar scroll del fondo
};

const closeModal = () => {
  selectedService.value = null;
  document.body.style.overflow = '';
};
</script>

<template>
  <section id="servicios" class="home-services py-5 position-relative">
    <div class="container py-5">
      
      <div class="text-center mb-5">
        <h2 class="display-4 font-brush fw-bold mb-3 text-white" style="font-family: 'Caveat', cursive !important;">{{ contentStore.content.home.services.title }}</h2>
        <p class="lead text-white opacity-85 max-w-700 mx-auto" style="font-size: 1.15rem;">
          {{ contentStore.content.home.services.description }}
        </p>
      </div>

      <!-- Fila 1: 3 Tarjetas Superiores -->
      <div class="row g-4 justify-content-center mb-4">
        <div 
          v-for="(service, index) in contentStore.content.home.services.items.slice(0, 3)" 
          :key="service.id" 
          class="col-12 col-md-6 col-lg-4"
        >
          <div class="service-card position-relative overflow-hidden cursor-pointer shadow-sm rounded-custom card-border h-100" @click="openModal(service)">
            <div class="card-image-wrapper position-absolute top-0 start-0 w-100 h-100">
              <img :src="service.coverImage" :alt="service.title" class="w-100 h-100 object-fit-cover transition-all duration-700">
              <div class="card-overlay position-absolute top-0 start-0 w-100 h-100 transition-all duration-500"></div>
            </div>
            <div class="card-content position-relative z-2 d-flex flex-column justify-content-end align-items-center text-center h-100 p-4">
              <span class="font-sans text-uppercase text-white tracking-wide small mb-2 d-block subtitle-anim fw-bold" style="letter-spacing: 0.12em; font-size: 0.8rem; text-shadow: 0 2px 6px rgba(0,0,0,0.5);">
                {{ service.subtitle }}
              </span>
              <h3 class="font-sans h3 text-white mb-0 title-anim fw-bold" style="font-size: 1.65rem; text-shadow: 0 2px 10px rgba(0,0,0,0.6);">
                {{ service.title }}
              </h3>
              
              <div class="mt-3 opacity-0 btn-anim">
                <span class="d-inline-flex align-items-center gap-2 font-sans text-uppercase tracking-wide small text-white border-bottom border-white pb-1 px-3 fw-bold" style="font-size: 0.75rem; letter-spacing: 0.1em; text-shadow: 0 1px 4px rgba(0,0,0,0.7);">
                  Ver Detalles 
                  <i class="bi bi-arrow-right"></i>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Fila 2: 2 Tarjetas Inferiores Centradas -->
      <div class="row g-4 justify-content-center">
        <div 
          v-for="(service, index) in contentStore.content.home.services.items.slice(3, 5)" 
          :key="service.id" 
          class="col-12 col-md-6 col-lg-4"
        >
          <div class="service-card position-relative overflow-hidden cursor-pointer shadow-sm rounded-custom card-border h-100" @click="openModal(service)">
            <div class="card-image-wrapper position-absolute top-0 start-0 w-100 h-100">
              <img :src="service.coverImage" :alt="service.title" class="w-100 h-100 object-fit-cover transition-all duration-700">
              <div class="card-overlay position-absolute top-0 start-0 w-100 h-100 transition-all duration-500"></div>
            </div>
            <div class="card-content position-relative z-2 d-flex flex-column justify-content-end align-items-center text-center h-100 p-4">
              <span class="font-sans text-uppercase text-white tracking-wide small mb-2 d-block subtitle-anim fw-bold" style="letter-spacing: 0.12em; font-size: 0.8rem; text-shadow: 0 2px 6px rgba(0,0,0,0.5);">
                {{ service.subtitle }}
              </span>
              <h3 class="font-sans h3 text-white mb-0 title-anim fw-bold" style="font-size: 1.65rem; text-shadow: 0 2px 10px rgba(0,0,0,0.6);">
                {{ service.title }}
              </h3>
              
              <div class="mt-3 opacity-0 btn-anim">
                <span class="d-inline-flex align-items-center gap-2 font-sans text-uppercase tracking-wide small text-white border-bottom border-white pb-1 px-3 fw-bold" style="font-size: 0.75rem; letter-spacing: 0.1em; text-shadow: 0 1px 4px rgba(0,0,0,0.7);">
                  Ver Detalles 
                  <i class="bi bi-arrow-right"></i>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Enlace directo al catálogo y servicios a medida -->
      <div class="text-center mt-5">
        <router-link 
          :to="{ path: '/experiencias', hash: '#servicios' }" 
          class="btn btn-outline-light rounded-pill px-4 py-3 fw-bold text-uppercase d-inline-flex align-items-center gap-2 shadow-sm transition-all"
          style="border-color: #E7DCC3; color: #E7DCC3; font-size: 0.82rem; letter-spacing: 0.1em;"
        >
          <span>Conoce Todos los Formatos & Cotiza a Medida</span>
          <i class="bi bi-arrow-right"></i>
        </router-link>
      </div>
    </div>

    <!-- Modal Flotante de Detalles Compacto en Verde Wamani #147E79 -->
    <Teleport to="body">
      <Transition name="fade">
        <div 
          v-if="selectedService" 
          class="service-modal-backdrop" 
          @click="closeModal"
        >
          <!-- Contenedor del Modal Compacto Flotante -->
          <div 
            class="service-floating-card text-white shadow-2xl" 
            @click.stop
          >
            <!-- Botón Cerrar Flotante Fijo -->
            <button 
              @click="closeModal" 
              class="btn-close-floating shadow-sm" 
              aria-label="Cerrar modal"
            >
              <i class="bi bi-x-lg"></i>
            </button>

            <!-- Cabecera Imagen Fija -->
            <div class="card-fixed-header position-relative overflow-hidden">
              <img :src="selectedService.coverImage" :alt="selectedService.title" class="w-100 h-100 object-fit-cover scale-in-anim">
              <div class="header-overlay position-absolute top-0 start-0 w-100 h-100"></div>
              <div class="position-absolute bottom-0 start-0 p-3 p-sm-4 w-100 pe-5 z-2">
                <span class="font-sans text-uppercase tracking-wider small mb-1 d-block fw-bold text-accent" style="color: #E7DCC3 !important; font-size: 0.74rem;">
                  {{ selectedService.subtitle }}
                </span>
                <h3 class="font-brush fs-2 mb-0 text-white text-shadow lh-1" style="font-family: 'Caveat', cursive !important;">
                  {{ selectedService.title }}
                </h3>
              </div>
            </div>

            <!-- Cuerpo Desplazable con Scroll Interno -->
            <div class="card-scrollable-body p-3 p-sm-4 custom-scrollbar">
              
              <!-- Descripción -->
              <div class="mb-3">
                <h4 class="h6 text-uppercase fw-bold text-white mb-2 d-flex align-items-center gap-2" style="letter-spacing: 0.08em; color: #E7DCC3 !important;">
                  <i class="bi bi-compass"></i> La Experiencia
                </h4>
                <p v-for="(parrafo, idx) in selectedService.description" :key="idx" class="font-sans text-white opacity-95 lh-base mb-2 text-justify" style="font-size: 0.92rem;">
                  {{ parrafo }}
                </p>
                <div v-if="selectedService.targetAudience" class="p-3 rounded-3 border-start border-3 mt-3 shadow-sm" style="background-color: #0D5B57 !important; border-color: #E7DCC3 !important;">
                  <span class="font-sans text-uppercase tracking-wide small mb-1 fw-bold d-block" style="color: #E7DCC3 !important; font-size: 0.72rem;">Dirigido a:</span>
                  <p class="font-sans mb-0 text-white opacity-90 small" style="font-size: 0.85rem;">{{ selectedService.targetAudience }}</p>
                </div>
              </div>

              <!-- Características -->
              <div class="mb-3 pt-2 border-top border-white border-opacity-15">
                <h4 class="h6 text-uppercase fw-bold text-white mb-2 d-flex align-items-center gap-2" style="letter-spacing: 0.08em; color: #E7DCC3 !important;">
                  <i class="bi bi-stars"></i> Características Exclusivas
                </h4>
                <ul class="list-unstyled row g-2 mb-0">
                  <li v-for="(char, idx) in selectedService.characteristics" :key="idx" class="col-12 col-sm-6 d-flex align-items-start gap-2">
                    <span class="mt-1 p-1 rounded-circle shadow-sm d-flex align-items-center justify-content-center flex-shrink-0" style="background-color: #0D5B57; border: 1px solid #E7DCC3; color: #E7DCC3; width: 22px; height: 22px; font-size: 0.7rem;">
                      <i class="bi bi-check-lg fw-bold"></i>
                    </span>
                    <span class="font-sans text-white opacity-95 small lh-sm pt-1" style="font-size: 0.84rem;">{{ char }}</span>
                  </li>
                </ul>
              </div>

              <!-- Galería Compacta -->
              <div v-if="selectedService.gallery && selectedService.gallery.length > 0" class="mb-3 pt-2 border-top border-white border-opacity-15">
                <h4 class="h6 text-uppercase fw-bold text-white mb-2 d-flex align-items-center gap-2" style="letter-spacing: 0.08em; color: #E7DCC3 !important;">
                  <i class="bi bi-images"></i> Galería
                </h4>
                <div class="row g-2">
                  <div v-for="(img, idx) in selectedService.gallery" :key="idx" class="col-4">
                    <div class="gallery-img-wrapper rounded-3 overflow-hidden shadow-sm position-relative" style="height: 90px; border: 1px solid rgba(231, 220, 195, 0.3);">
                      <img :src="img" alt="Gallery image" class="w-100 h-100 object-fit-cover transition-all duration-500 hover-scale">
                    </div>
                  </div>
                </div>
              </div>

              <!-- Footer CTA -->
              <div class="text-center pt-3 pb-1 d-flex flex-wrap gap-2 justify-content-center">
                <router-link to="/experiencias" class="btn btn-secondary rounded-pill px-3 py-2 font-sans small transition-all d-inline-flex align-items-center gap-1 text-decoration-none fw-bold" @click="closeModal">
                  <i class="bi bi-calendar3"></i>
                  <span>Ver en Catálogo</span>
                </router-link>
                <a :href="`https://wa.me/${contentStore.content.contact.whatsappNumber || '56985673376'}?text=${encodeURIComponent('Hola Wamani Experience, deseo cotizar el servicio: ' + selectedService.title)}`" target="_blank" class="btn btn-whatsapp-custom rounded-pill px-3 py-2 font-sans small transition-all d-inline-flex align-items-center gap-1 text-decoration-none fw-bold">
                  <i class="bi bi-whatsapp"></i>
                  <span>Cotizar por WhatsApp</span>
                </a>
              </div>

            </div>

          </div>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables';

.max-w-700 {
  max-width: 700px;
}

.text-accent {
  color: $beige-tierra !important;
}

/* Grilla Custom (3 arriba, 2 centrados abajo) */
.services-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1.5rem;
}

.service-grid-item {
  width: calc(33.333% - 1rem);
  
  @media (max-width: 991px) {
    width: calc(50% - 0.75rem);
  }
  
  @media (max-width: 767px) {
    width: 100%;
  }
}

.fade-in-up {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.service-card {
  aspect-ratio: 1 / 1;
  min-height: 340px;
  background-color: $verde-wamani; /* Color Oficial Verde Wamani */
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  display: flex;
  flex-direction: column;
}

.rounded-custom {
  border-radius: 24px;
}

.card-border {
  border: 1px solid rgba($beige-tierra, 0.25);
}

.card-overlay {
  background: linear-gradient(to top, rgba(13, 91, 87, 0.95) 0%, rgba(13, 91, 87, 0.3) 50%, rgba(0, 0, 0, 0.08) 100%);
}

.transition-all {
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.duration-500 {
  transition-duration: 0.5s;
}

.duration-700 {
  transition-duration: 0.7s;
}

.service-card:hover {
  transform: translateY(-8px);
  border-color: rgba($beige-tierra, 0.6);
  box-shadow: 0 16px 40px -8px rgba(13, 91, 87, 0.35) !important;
  
  .card-image-wrapper img {
    transform: scale(1.05);
  }
  
  .card-overlay {
    background: linear-gradient(to top, rgba(13, 91, 87, 0.95) 0%, rgba(20, 126, 121, 0.5) 50%, rgba(0, 0, 0, 0.15) 100%);
  }
  
  .btn-anim {
    opacity: 1 !important;
    transform: translateY(0);
  }
}

.service-card:active {
  transform: scale(0.97) translateY(0);
  box-shadow: 0 4px 12px rgba(13, 91, 87, 0.2) !important;
}

.btn-anim {
  transform: translateY(15px);
  transition: all 0.4s ease;
}

.tracking-wide {
  letter-spacing: 0.1em;
}

.decorative-line {
  display: inline-block;
  width: 40px;
  height: 3px;
  border-radius: 2px;
  background-color: $beige-tierra;
  box-shadow: 0 0 10px rgba($beige-tierra, 0.5);
}

.text-shadow {
  text-shadow: 0 4px 15px rgba(0,0,0,0.6);
}

.text-justify {
  text-align: justify;
}

.rounded-top-custom {
  border-top-left-radius: 22px;
  border-top-right-radius: 22px;
}

.rounded-bottom-custom {
  border-bottom-left-radius: 22px;
  border-bottom-right-radius: 22px;
}

.hover-scale:hover {
  transform: scale(1.08);
}

.hover-opacity-25:hover {
  opacity: 0.2 !important;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba($verde-wamani-dark, 0.5); 
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba($beige-tierra, 0.5); 
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: $beige-tierra;
}

.scale-in-anim {
  animation: scaleIn 10s infinite alternate linear;
}

@keyframes scaleIn {
  0% { transform: scale(1); }
  100% { transform: scale(1.1); }
}

.backdrop-blur {
  backdrop-filter: blur(8px);
}

.max-h-90 {
  max-height: 90vh;
}

.bg-gradient-dark-bottom {
  background: linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(20, 126, 121, 1) 100%);
}

.btn-close-custom {
  background-color: rgba($verde-wamani-dark, 0.85);
  border: 1px solid rgba($beige-tierra, 0.4) !important;
  width: 44px;
  height: 44px;
  backdrop-filter: blur(6px);
  
  &:hover {
    background-color: $beige-tierra;
    color: $gris-piedra !important;
    transform: rotate(90deg) scale(1.1);
  }
}

.service-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 2050;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(10, 50, 48, 0.85);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.service-floating-card {
  width: 100%;
  max-width: 580px;
  max-height: 85vh;
  max-height: 85dvh;
  background-color: #147E79 !important;
  border: 1.5px solid rgba(231, 220, 195, 0.5) !important;
  border-radius: 24px !important;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.75) !important;
  overflow: hidden !important;
  display: flex;
  flex-direction: column;
  position: relative;
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.btn-close-floating {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 30;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.35);
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.25s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.9);
    transform: rotate(90deg) scale(1.05);
    border-color: #E7DCC3;
  }
}

.card-fixed-header {
  height: 160px;
  min-height: 160px;
  flex-shrink: 0;
  position: relative;

  .header-overlay {
    background: linear-gradient(180deg, rgba(0, 0, 0, 0.15) 0%, rgba(13, 91, 87, 0.95) 100%);
  }
}

.card-scrollable-body {
  overflow-y: auto !important;
  flex: 1 1 auto;
  -webkit-overflow-scrolling: touch;
  background-color: #147E79 !important;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.15);
    border-radius: 10px;
  }
  &::-webkit-scrollbar-thumb {
    background: #E7DCC3;
    border-radius: 10px;
    &:hover {
      background: #FFFFFF;
    }
  }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Vue Transitions para Modal */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-active .service-modal-content,
.fade-leave-active .service-modal-content {
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.fade-enter-from .service-modal-content,
.fade-leave-to .service-modal-content {
  transform: translateY(30px) scale(0.95);
}
</style>
