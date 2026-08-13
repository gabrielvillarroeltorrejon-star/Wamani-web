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
  <section id="servicios" class="home-services py-5 bg-light-cream position-relative text-dark">
    <div class="container py-5">
      
      <div class="text-center mb-5">
        <h2 class="display-4 font-brush fw-bold mb-3 text-white" style="font-family: 'Caveat', cursive !important;">{{ contentStore.content.home.services.title }}</h2>
        <p class="lead text-white opacity-85 max-w-700 mx-auto" style="font-size: 1.15rem;">
          {{ contentStore.content.home.services.description }}
        </p>
      </div>

      <div class="services-grid">
        <div v-for="service in contentStore.content.home.services.items" :key="service.id" class="service-grid-item">
          <div class="service-card position-relative overflow-hidden cursor-pointer shadow-lg rounded-custom card-border h-100" @click="openModal(service)">
            <div class="card-image-wrapper position-absolute top-0 start-0 w-100 h-100">
              <img :src="service.coverImage" :alt="service.title" class="w-100 h-100 object-fit-cover transition-all duration-700">
              <div class="card-overlay position-absolute top-0 start-0 w-100 h-100 transition-all duration-500"></div>
            </div>
            <div class="card-content position-relative z-2 d-flex flex-column justify-content-end align-items-center text-center h-100 p-4">
              <!-- Subtítulo en Blanco Puro de Alto Contraste -->
              <span class="font-sans text-uppercase text-white tracking-wide small mb-2 d-block subtitle-anim fw-bold" style="letter-spacing: 0.12em; font-size: 0.8rem; text-shadow: 0 2px 6px rgba(0,0,0,0.85);">
                {{ service.subtitle }}
              </span>
              <!-- Título en Blanco Puro de Alto Contraste -->
              <h3 class="font-brush h3 text-white mb-0 title-anim" style="font-size: 1.85rem; text-shadow: 0 2px 10px rgba(0,0,0,0.9); font-family: 'Caveat', cursive !important;">
                {{ service.title }}
              </h3>
              
              <!-- Botón simulado en Blanco y Turquesa -->
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
    </div>

    <!-- Modal Flotante de Detalles en Verde Bosque #045D56 -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="selectedService" class="service-modal-backdrop position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3 p-md-4 p-lg-5" style="z-index: 1060;">
          <!-- Fondo clickeable para cerrar -->
          <div class="position-absolute top-0 start-0 w-100 h-100 bg-black opacity-75 backdrop-blur" @click="closeModal"></div>
          
          <!-- Contenedor del Modal en Verde Bosque #045D56 -->
          <div class="service-modal-content text-white position-relative shadow-2xl overflow-y-auto max-h-90 w-100 rounded-custom custom-scrollbar" style="max-width: 900px; background-color: #045D56 !important; border: 1px solid rgba(45, 212, 191, 0.35); box-shadow: 0 25px 60px rgba(0,0,0,0.6);">
            
            <!-- Botón Cerrar Flotante Interno -->
            <button @click="closeModal" class="btn btn-close-custom position-absolute top-0 end-0 m-4 z-3 d-flex align-items-center justify-content-center rounded-circle border-0 text-white transition-all shadow-sm">
              <i class="bi bi-x-lg"></i>
            </button>

            <!-- Cabecera Imagen -->
            <div class="modal-header-img position-relative rounded-top-custom overflow-hidden" style="height: 340px;">
              <img :src="selectedService.coverImage" :alt="selectedService.title" class="w-100 h-100 object-fit-cover scale-in-anim">
              <div class="position-absolute top-0 start-0 w-100 h-100 bg-gradient-dark-bottom"></div>
              <div class="position-absolute bottom-0 start-0 p-4 p-md-5 w-100">
                <span class="font-sans text-uppercase text-white tracking-wide small mb-2 d-block fw-bold opacity-90" style="letter-spacing: 0.12em;">{{ selectedService.subtitle }}</span>
                <h2 class="font-brush display-3 mb-0 text-white text-shadow" style="font-family: 'Caveat', cursive !important;">{{ selectedService.title }}</h2>
              </div>
            </div>

            <!-- Cuerpo del Modal en #045D56 -->
            <div class="modal-body p-4 p-md-5" style="background-color: #045D56 !important;">
              
              <!-- Descripción -->
              <div class="mb-5">
                <h4 class="font-brush text-white display-6 mb-4 d-flex align-items-center gap-3" style="font-family: 'Caveat', cursive !important;">
                  <span class="decorative-line"></span>
                  La Experiencia
                </h4>
                <p v-for="(parrafo, idx) in selectedService.description" :key="idx" class="font-sans lead text-white opacity-95 lh-lg mb-4 text-justify" style="font-size: 1.05rem;">
                  {{ parrafo }}
                </p>
                <div v-if="selectedService.targetAudience" class="p-4 rounded-4 border-start border-4 border-accent mt-4 shadow-sm" style="background-color: #033E3B !important; border-color: #2DD4BF !important;">
                  <h5 class="font-sans text-uppercase tracking-wide small mb-2 text-accent fw-bold" style="color: #2DD4BF !important;">Dirigido a:</h5>
                  <p class="font-sans mb-0 text-white opacity-90">{{ selectedService.targetAudience }}</p>
                </div>
              </div>

              <div class="divider-line my-5"></div>

              <!-- Características -->
              <div class="mb-5">
                <h4 class="font-brush text-white display-6 mb-4 d-flex align-items-center gap-3" style="font-family: 'Caveat', cursive !important;">
                  <span class="decorative-line"></span>
                  Características Exclusivas
                </h4>
                <ul class="list-unstyled row g-4">
                  <li v-for="(char, idx) in selectedService.characteristics" :key="idx" class="col-md-6 d-flex align-items-start gap-3">
                    <span class="text-accent mt-1 p-2 rounded-circle shadow-sm d-flex align-items-center justify-content-center" style="background-color: #033E3B; border: 1px solid #2DD4BF; color: #2DD4BF; width: 32px; height: 32px;">
                      <i class="bi bi-check-lg fw-bold"></i>
                    </span>
                    <span class="font-sans text-white opacity-95 lh-lg pt-1">{{ char }}</span>
                  </li>
                </ul>
              </div>

              <!-- Galería Interna -->
              <div v-if="selectedService.gallery && selectedService.gallery.length > 0" class="mb-2">
                <h4 class="font-brush text-white display-6 mb-4 d-flex align-items-center gap-3" style="font-family: 'Caveat', cursive !important;">
                  <span class="decorative-line"></span>
                  Galería
                </h4>
                <div class="row g-3">
                  <div v-for="(img, idx) in selectedService.gallery" :key="idx" class="col-12 col-sm-6 col-md-4">
                    <div class="gallery-img-wrapper rounded-3 overflow-hidden shadow-sm position-relative group" style="height: 200px; border: 1px solid rgba(45, 212, 191, 0.25);">
                      <img :src="img" alt="Gallery image" class="w-100 h-100 object-fit-cover transition-all duration-500 hover-scale">
                      <div class="position-absolute top-0 start-0 w-100 h-100 bg-black opacity-0 hover-opacity-25 transition-all"></div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
            
            <!-- Modal Footer CTA con Conversión Directa -->
            <div class="p-4 p-md-5 text-center border-top border-light border-opacity-15 rounded-bottom-custom" style="background-color: #033E3B !important;">
              <h4 class="font-brush text-white display-5 mb-3" style="font-family: 'Caveat', cursive !important;">¿Listo para vivir la experiencia?</h4>
              <p class="small text-white opacity-85 mb-4 max-w-700 mx-auto">Selecciona tu fecha y cantidad de personas en nuestro catálogo o comunícate con un asesor Wamani para un itinerario a medida.</p>
              
              <div class="d-flex flex-wrap gap-3 justify-content-center">
                <a href="#destinos" class="btn btn-cyan-gradient rounded-pill px-4 py-3 font-sans text-uppercase tracking-wide transition-all d-inline-flex align-items-center gap-2 text-decoration-none fw-bold" @click="closeModal" style="color: #022927 !important; letter-spacing: 0.08em;">
                  <i class="bi bi-calendar3"></i>
                  Ver Fechas y Precios en Catálogo
                </a>
                <a :href="`https://wa.me/${contentStore.content.contact.whatsappNumber || '56985673376'}?text=${encodeURIComponent('Hola Wamani Experience, deseo cotizar el servicio: ' + selectedService.title)}`" target="_blank" class="btn btn-whatsapp-custom rounded-pill px-4 py-3 font-sans text-uppercase tracking-wide transition-all d-inline-flex align-items-center gap-2 text-decoration-none fw-bold" style="letter-spacing: 0.08em;">
                  <i class="bi bi-whatsapp"></i>
                  Cotizar por WhatsApp
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
  color: #2DD4BF !important;
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

.service-card {
  min-height: 290px;
  background-color: #045D56;
}

.rounded-custom {
  border-radius: 22px;
}

.card-border {
  border: 1px solid rgba(45, 212, 191, 0.25);
}

.card-overlay {
  background: linear-gradient(to top, rgba(4, 93, 86, 0.95) 0%, rgba(4, 93, 86, 0.55) 45%, rgba(0, 0, 0, 0.25) 100%);
}

.transition-all {
  transition: all 0.4s ease;
}

.duration-500 {
  transition-duration: 0.5s;
}

.duration-700 {
  transition-duration: 0.7s;
}

.service-card:hover {
  transform: translateY(-6px);
  border-color: rgba(45, 212, 191, 0.65);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.45) !important;
  
  .card-image-wrapper img {
    transform: scale(1.08);
  }
  
  .card-overlay {
    background: linear-gradient(to top, rgba(4, 93, 86, 0.98) 0%, rgba(4, 93, 86, 0.7) 50%, rgba(3, 62, 59, 0.4) 100%);
  }
  
  .btn-anim {
    opacity: 1 !important;
    transform: translateY(0);
  }
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
  background-color: #2DD4BF;
  box-shadow: 0 0 10px rgba(45, 212, 191, 0.6);
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
  background: rgba(3, 62, 59, 0.5); 
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(45, 212, 191, 0.4); 
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(45, 212, 191, 0.8);
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
  background: linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(4,93,86,1) 100%);
}

.btn-close-custom {
  background-color: rgba(3, 62, 59, 0.85);
  border: 1px solid rgba(45, 212, 191, 0.4) !important;
  width: 44px;
  height: 44px;
  backdrop-filter: blur(6px);
  
  &:hover {
    background-color: #2DD4BF;
    color: #033E3B !important;
    transform: rotate(90deg) scale(1.1);
  }
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
