<script setup lang="ts">
import { ref, computed } from 'vue';
import { useContentStore, type TransportServiceCard } from '@/shared/stores/contentStore';

const contentStore = useContentStore();

// Encabezado dinámico con fallback seguro
const transportHeader = computed(() => {
  return contentStore.content.home?.transport || {
    badge: 'MOVILIDAD PRIVADA & CONFORT',
    title: 'Transporte Exclusivo & Traslados Cordilleranos',
    description: 'Conectamos los principales aeropuertos y destinos del sur de Chile con conductores profesionales, puntualidad rigurosa y vehículos acondicionados para la montaña.',
    services: []
  };
});

// Tarjetas de servicios dinámicas con fallback
const transportServices = computed<TransportServiceCard[]>(() => {
  return contentStore.content.home?.transport?.services || [];
});

// Formulario interactivo rápido de cotización de traslado
const transportOrigin = ref('Aeropuerto Temuco (ZCO)');
const transportDestination = ref('Pucón (Hotel / Cabaña)');
const transportDate = ref(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
const transportPax = ref(2);

const requestTransportWhatsApp = (serviceTitle?: string, customTag?: string) => {
  const origin = transportOrigin.value;
  const dest = transportDestination.value;
  const date = transportDate.value;
  const pax = transportPax.value;
  const tag = customTag || serviceTitle || '';
  const service = tag ? ` (${tag})` : '';

  const msg = encodeURIComponent(
    `🚐 *CONSULTA DE TRANSPORTE PRIVADO WAMANI${service}* 🚐\n` +
    `📍 Origen: *${origin}*\n` +
    `🏁 Destino: *${dest}*\n` +
    `📅 Fecha requerida: *${date}*\n` +
    `👥 Pasajeros: *${pax} personas*\n\n` +
    `Hola Wamani, deseo cotizar este traslado privado. ¿Me podrían indicar tarifa y disponibilidad de chofer? ¡Muchas gracias!`
  );

  const phone = contentStore.content.contact.whatsappNumber || '56985673376';
  window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
};
</script>

<template>
  <section id="transporte" class="home-transport-section py-5 position-relative">
    <div class="container py-4">
      
      <!-- ENCABEZADO EDITORIAL DINÁMICO -->
      <div class="text-center mb-5">
        <span class="badge px-3 py-2 rounded-pill font-sans text-uppercase tracking-wider fw-bold text-accent mb-3" style="background: rgba(231, 220, 195, 0.15); border: 1px solid rgba(231, 220, 195, 0.3); letter-spacing: 0.15em;">
          <i class="bi bi-shield-check me-1"></i> {{ transportHeader.badge }}
        </span>
        <h2 class="display-4 font-brush fw-bold mb-3 text-white" style="font-family: 'Caveat', cursive !important; text-shadow: 0 3px 10px rgba(0,0,0,0.35);">
          {{ transportHeader.title }}
        </h2>
        <p class="lead text-white opacity-90 max-w-700 mx-auto" style="font-size: 1.15rem; color: #FFFFFF !important;">
          {{ transportHeader.description }}
        </p>
      </div>

      <!-- CARDS DINÁMICAS DE SERVICIOS DE TRANSPORTE -->
      <div class="row g-4 mb-5 justify-content-center">
        
        <div 
          v-for="srv in transportServices" 
          :key="srv.id" 
          class="col-12 col-md-6 col-lg-4"
        >
          <div 
            class="transport-card h-100 rounded-4 overflow-hidden d-flex flex-column justify-content-between position-relative shadow-lg"
            :class="{ 'transport-card-featured': !!srv.featuredBadge }"
          >
            <!-- Badge destacado opcional (ej: MÁS SOLICITADO) -->
            <div 
              v-if="srv.featuredBadge" 
              class="featured-badge position-absolute top-0 end-0 m-3 px-3 py-1 rounded-pill small fw-bold text-dark-mountain bg-accent"
              style="z-index: 2;"
            >
              {{ srv.featuredBadge }}
            </div>

            <!-- Imagen de cabecera si existe -->
            <div v-if="srv.imageUrl" class="transport-card-img-wrap position-relative overflow-hidden ratio ratio-16x9">
              <img :src="srv.imageUrl" :alt="srv.title" class="w-100 h-100 object-fit-cover transition-transform">
              <div class="card-img-scrim position-absolute top-0 start-0 w-100 h-100"></div>
            </div>

            <div class="p-4 d-flex flex-column flex-grow-1 justify-content-between">
              <div>
                <!-- Icon box (cuando no hay imagen o como adorno) -->
                <div v-if="!srv.imageUrl" class="transport-icon-box mb-4 d-inline-flex align-items-center justify-content-center rounded-3">
                  <i :class="[srv.icon || 'bi-car-front-fill', 'fs-2', 'text-accent']"></i>
                </div>

                <div class="d-flex align-items-center gap-2 mb-2">
                  <span v-if="srv.imageUrl && srv.icon" class="badge bg-dark bg-opacity-75 text-accent d-inline-flex align-items-center gap-1 small px-2 py-1">
                    <i :class="srv.icon"></i>
                  </span>
                  <span class="badge bg-dark bg-opacity-65 text-accent text-uppercase small px-3 py-1 fw-bold">
                    {{ srv.badge }}
                  </span>
                </div>

                <h3 class="h4 fw-bold text-white mb-3">{{ srv.title }}</h3>
                <p class="text-white-50 small lh-lg mb-4">
                  {{ srv.description }}
                </p>
                
                <ul v-if="srv.features && srv.features.length" class="list-unstyled text-white small mb-4">
                  <li v-for="(feat, fIdx) in srv.features" :key="fIdx" class="d-flex align-items-center gap-2 mb-2">
                    <i class="bi bi-check-circle-fill text-accent flex-shrink-0"></i>
                    <span>{{ feat }}</span>
                  </li>
                </ul>
              </div>

              <button 
                type="button" 
                class="w-100 py-2 fw-bold text-uppercase d-flex align-items-center justify-content-center gap-2 mt-auto"
                :class="srv.buttonStyle === 'solid' || srv.featuredBadge ? 'btn btn-accent text-dark-mountain shadow' : 'btn btn-outline-accent'"
                @click="requestTransportWhatsApp(srv.title, srv.whatsAppTag)"
              >
                <i class="bi bi-whatsapp"></i> {{ srv.buttonText || 'Cotizar Traslado' }}
              </button>
            </div>
          </div>
        </div>

      </div>

      <!-- CAJA INTERACTIVA DE COTIZACIÓN RÁPIDA DE TRASLADO -->
      <div class="quick-quote-container p-4 p-md-5 rounded-4 shadow-lg border border-secondary border-opacity-25" style="background: rgba(13, 91, 87, 0.45); backdrop-filter: blur(12px);">
        <div class="row align-items-center g-4">
          <div class="col-12 col-lg-4">
            <span class="text-accent text-uppercase small fw-bold tracking-wider d-block mb-1">Reserva Directa</span>
            <h4 class="h3 fw-bold text-white mb-2 font-serif">Cotiza tu Traslado al Instante</h4>
            <p class="small text-white opacity-80 mb-0">
              Indícanos tu origen, destino y fecha. Te responderemos en minutos con la mejor tarifa y disponibilidad asegurada.
            </p>
          </div>

          <div class="col-12 col-lg-8">
            <div class="row g-2">
              <div class="col-12 col-sm-6 col-md-3">
                <label class="form-label small text-white fw-semibold mb-1">Origen</label>
                <select v-model="transportOrigin" class="form-select form-select-sm transport-input">
                  <option value="Aeropuerto Temuco (ZCO)">Aeropuerto Temuco (ZCO)</option>
                  <option value="Aeropuerto Puerto Montt (PMC)">Aeropuerto Puerto Montt</option>
                  <option value="Pucón (Centro / Hotel)">Pucón (Centro)</option>
                  <option value="Villarrica">Villarrica</option>
                  <option value="Huilo Huilo / Neltume">Huilo Huilo</option>
                  <option value="Santiago (Especial)">Santiago</option>
                </select>
              </div>

              <div class="col-12 col-sm-6 col-md-3">
                <label class="form-label small text-white fw-semibold mb-1">Destino</label>
                <select v-model="transportDestination" class="form-select form-select-sm transport-input">
                  <option value="Pucón (Hotel / Cabaña)">Pucón (Hotel / Cabaña)</option>
                  <option value="Villarrica">Villarrica</option>
                  <option value="Termas Geométricas">Termas Geométricas</option>
                  <option value="Termas Pucón Indómito / Huife">Termas Huife / Indómito</option>
                  <option value="Huilo Huilo">Huilo Huilo</option>
                  <option value="Aeropuerto Temuco (ZCO)">Aeropuerto Temuco (ZCO)</option>
                </select>
              </div>

              <div class="col-6 col-md-2">
                <label class="form-label small text-white fw-semibold mb-1">Fecha</label>
                <input v-model="transportDate" type="date" class="form-control form-control-sm transport-input">
              </div>

              <div class="col-6 col-md-2">
                <label class="form-label small text-white fw-semibold mb-1">Pasajeros</label>
                <input v-model="transportPax" type="number" min="1" max="25" class="form-control form-control-sm transport-input">
              </div>

              <div class="col-12 col-md-2 d-flex align-items-end">
                <button 
                  type="button" 
                  class="btn btn-accent btn-sm w-100 py-2 fw-bold text-dark-mountain d-flex align-items-center justify-content-center gap-1 shadow"
                  @click="requestTransportWhatsApp()"
                >
                  <i class="bi bi-whatsapp"></i> Cotizar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>

<style scoped>
.home-transport-section {
  background: linear-gradient(180deg, rgba(8, 40, 38, 0.95) 0%, rgba(13, 91, 87, 0.85) 100%);
  position: relative;
}

.max-w-700 {
  max-width: 700px;
}

.transport-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.12);
  transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

.transport-card:hover {
  transform: translateY(-6px);
  border-color: rgba(231, 220, 195, 0.45);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4) !important;
}

.transport-card-featured {
  background: rgba(13, 91, 87, 0.35);
  border: 2px solid rgba(231, 220, 195, 0.4);
}

.transport-card-img-wrap {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.transport-card-img-wrap img {
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.transport-card:hover .transport-card-img-wrap img {
  transform: scale(1.06);
}

.card-img-scrim {
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.05) 0%, rgba(8, 40, 38, 0.65) 100%);
  pointer-events: none;
}

.transport-icon-box {
  width: 54px;
  height: 54px;
  background: rgba(231, 220, 195, 0.12);
  border: 1px solid rgba(231, 220, 195, 0.25);
}

.transport-input {
  background: rgba(255, 255, 255, 0.12) !important;
  border: 1px solid rgba(255, 255, 255, 0.25) !important;
  color: #FFFFFF !important;
  border-radius: 8px;
}

.transport-input:focus {
  background: rgba(255, 255, 255, 0.2) !important;
  border-color: #E7DCC3 !important;
  box-shadow: 0 0 0 0.25rem rgba(231, 220, 195, 0.25) !important;
}

.transport-input option {
  background: #0D5B57;
  color: #FFFFFF;
}
</style>
