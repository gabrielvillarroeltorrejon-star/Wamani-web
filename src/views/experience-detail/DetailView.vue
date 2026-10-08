<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useContentStore } from '@/shared/stores/contentStore';
import { useCartStore } from '@/shared/stores/cartStore';

const route = useRoute();
const router = useRouter();
const contentStore = useContentStore();
const cartStore = useCartStore();

const todayDate = new Date().toISOString().split('T')[0];
const defaultNextDay = new Date(Date.now() + 86400000).toISOString().split('T')[0];

const selectedDate = ref(defaultNextDay);
const paxCount = ref(1);

const experience = computed(() => {
  const slug = route.params.slug as string;
  return contentStore.experiences.find(e => e.slug === slug) || contentStore.experiences[0];
});

const incrementPax = () => {
  if (paxCount.value < 20) paxCount.value++;
};

const decrementPax = () => {
  if (paxCount.value > 1) paxCount.value--;
};

const totalPriceCLP = computed(() => {
  return (experience.value?.pricing.basePrice || 50000) * paxCount.value;
});

const totalPriceUSD = computed(() => totalPriceCLP.value * 0.0011);
const totalPriceBRL = computed(() => totalPriceCLP.value * 0.0055);

const formatPrice = (val: number, currency: string = 'CLP') => {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency, maximumFractionDigits: 0 }).format(val);
};

const formatDifficulty = (diff: string) => {
  if (!diff) return 'Fácil';
  const map: Record<string, string> = {
    easy: 'Fácil',
    moderate: 'Moderada',
    hard: 'Exigente (Alta)',
    expert: 'Desafiante'
  };
  return map[diff.toLowerCase()] || diff;
};

const handleAddToCart = () => {
  if (!experience.value) return;
  
  cartStore.addToCart({
    tourId: experience.value.slug, // Temporal: asumiendo slug como ID por ahora
    tourTitle: experience.value.title,
    scheduleId: `sched-${selectedDate.value}`, // Mock schedule ID
    scheduleDate: selectedDate.value,
    scheduleTime: '08:00', // Mock time
    tickets: [
      {
        type: 'adult',
        quantity: paxCount.value,
        unitPrice: experience.value.price
      }
    ]
  });
};

const handleBookWhatsApp = () => {
  if (!experience.value) return;
  const msg = encodeURIComponent(
    `Hola Wamani Experience, deseo reservar el tour: *${experience.value.title}*\n` +
    `📅 Fecha de excursión: *${selectedDate.value}*\n` +
    `👥 Pasajeros: *${paxCount.value} personas*\n` +
    `💰 Monto Total: *${formatPrice(totalPriceCLP.value, 'CLP')}*\n\n` +
    `¿Me confirman disponibilidad y los datos para transferir? Muchas gracias.`
  );
  const wa = contentStore.content.contact.whatsappNumber || '56985673376';
  window.open(`https://wa.me/${wa}?text=${msg}`, '_blank');
};
</script>

<template>
  <div class="experience-detail-page min-vh-100 font-sans">
    
    <!-- Hero Gallery -->
    <div class="gallery-hero position-relative" :style="{ backgroundImage: `url(${experience.coverImage.url})` }">
      <div class="overlay position-absolute top-0 start-0 w-100 h-100 bg-dark opacity-60"></div>
      <div class="container position-relative h-100 d-flex flex-column justify-content-end pb-5 text-white z-index-1">
        <div class="d-flex align-items-center gap-2 mb-3">
          <span class="badge px-3 py-2 rounded-pill font-sans text-uppercase tracking-wide text-accent bg-white shadow-sm fw-bold">
            {{ experience.tags ? experience.tags[0] : 'EXPERIENCIA' }}
          </span>
          <span class="badge bg-dark bg-opacity-75 text-white px-3 py-2 rounded-pill border border-light border-opacity-25 backdrop-blur shadow-sm">
            <i class="bi bi-geo-alt-fill me-1 text-accent"></i>{{ experience.destinationId }}
          </span>
        </div>
        <h1 class="display-3 fw-bold mb-2">{{ experience.title }}</h1>
        <p class="lead opacity-95 mb-0 max-w-700 fw-medium">{{ experience.subtitle }}</p>
      </div>
    </div>

    <div class="container py-5">
      <div class="row g-5">
        
        <!-- Contenido Principal -->
        <div class="col-lg-8">
          
          <!-- Barra Rápida de Atributos Clave (Key Facts Grid) -->
          <div class="row g-3 mb-5">
            <div class="col-6 col-md-3">
              <div class="p-4 rounded-4 h-100 text-center d-flex flex-column align-items-center justify-content-center premium-card transition-all">
                <i class="bi bi-clock-history fs-3 text-accent mb-2"></i>
                <span class="small text-muted text-uppercase fw-bold tracking-wide">DURACIÓN</span>
                <strong class="text-dark fs-6 mt-1">{{ experience.duration?.value }} {{ experience.duration?.unit === 'hours' ? 'Horas' : 'Días' }}</strong>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="p-4 rounded-4 h-100 text-center d-flex flex-column align-items-center justify-content-center premium-card transition-all">
                <i class="bi bi-activity fs-3 text-accent mb-2"></i>
                <span class="small text-muted text-uppercase fw-bold tracking-wide">EXIGENCIA</span>
                <strong class="text-dark fs-6 mt-1">{{ formatDifficulty(experience.difficulty) }}</strong>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="p-4 rounded-4 h-100 text-center d-flex flex-column align-items-center justify-content-center premium-card transition-all">
                <i class="bi bi-people-fill fs-3 text-accent mb-2"></i>
                <span class="small text-muted text-uppercase fw-bold tracking-wide">GRUPO</span>
                <strong class="text-dark fs-6 mt-1">Cupos Reducidos</strong>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="p-4 rounded-4 h-100 text-center d-flex flex-column align-items-center justify-content-center premium-card transition-all">
                <i class="bi bi-translate fs-3 text-accent mb-2"></i>
                <span class="small text-muted text-uppercase fw-bold tracking-wide">IDIOMAS</span>
                <strong class="text-dark fs-6 mt-1">Español / Inglés</strong>
              </div>
            </div>
          </div>

          <!-- Descripción -->
          <div class="p-4 p-md-5 rounded-4 premium-card mb-5">
            <h2 class="h4 fw-bold mb-4 text-dark display-6">Sobre esta Experiencia</h2>
            <p class="text-secondary lh-lg mb-0 fs-6">{{ experience.description }}</p>
          </div>

          <!-- Itinerario -->
          <div v-if="experience.itinerary && experience.itinerary.length" class="p-4 p-md-5 rounded-4 premium-card mb-5">
            <h2 class="h4 fw-bold mb-4 text-dark display-6">Itinerario Detallado</h2>
            <div v-for="(day, index) in experience.itinerary" :key="index" class="mb-4 d-flex gap-4 align-items-start border-bottom border-secondary border-opacity-10 pb-4">
              <div class="flex-shrink-0">
                <div class="rounded-circle d-flex align-items-center justify-content-center fw-bold font-monospace shadow-sm bg-accent text-white" style="width: 48px; height: 48px;">
                  {{ index + 1 }}
                </div>
              </div>
              <div class="mt-1">
                <h4 class="h5 fw-bold text-dark mb-2">
                  <span v-if="day.dayOrTime" class="text-accent me-2 font-sans fs-6">[{{ day.dayOrTime }}]</span>
                  {{ day.title }}
                </h4>
                <p class="text-secondary mb-0 lh-lg">{{ day.description }}</p>
              </div>
            </div>
          </div>

          <!-- Qué incluye / Qué no incluye -->
          <div class="p-4 p-md-5 rounded-4 premium-card mb-5">
            <div class="row g-5">
              <div class="col-md-6">
                <h4 class="h6 fw-bold text-dark text-uppercase mb-4"><i class="bi bi-check-circle-fill me-2 text-accent"></i>Qué incluye</h4>
                <ul class="list-unstyled mb-0">
                  <li v-for="(inc, i) in experience.included" :key="i" class="mb-3 text-secondary d-flex align-items-start gap-3">
                    <i class="bi bi-check-lg text-accent flex-shrink-0 mt-1 fs-5"></i>
                    <span>{{ inc }}</span>
                  </li>
                </ul>
              </div>
              <div class="col-md-6">
                <h4 class="h6 fw-bold text-dark text-uppercase mb-4"><i class="bi bi-x-circle-fill me-2 text-danger"></i>Qué no incluye</h4>
                <ul class="list-unstyled mb-0">
                  <li v-for="(ninc, i) in experience.notIncluded" :key="i" class="mb-3 text-secondary d-flex align-items-start gap-3">
                    <i class="bi bi-x text-danger flex-shrink-0 mt-1 fs-5"></i>
                    <span>{{ ninc }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Qué debes traer contigo / Equipamiento Sugerido -->
          <div class="p-4 p-md-5 rounded-4 premium-card mb-5">
            <h3 class="h5 fw-bold mb-4 d-flex align-items-center gap-3 text-dark">
              <i class="bi bi-backpack4-fill text-accent fs-4"></i>
              <span>Qué debes traer contigo</span>
            </h3>
            <div class="row g-4 pt-2">
              <div class="col-md-6">
                <ul class="list-unstyled mb-0 text-secondary lh-lg">
                  <li class="d-flex align-items-start gap-3 mb-3">
                    <i class="bi bi-check2 text-accent mt-1 fs-5"></i>
                    <span><strong class="text-dark">Calzado adecuado:</strong> Zapatos de trekking o suela de buen agarre.</span>
                  </li>
                  <li class="d-flex align-items-start gap-3 mb-3">
                    <i class="bi bi-check2 text-accent mt-1 fs-5"></i>
                    <span><strong class="text-dark">Vestimenta por capas:</strong> Primera capa, polar intermedio y cortavientos.</span>
                  </li>
                  <li class="d-flex align-items-start gap-3">
                    <i class="bi bi-check2 text-accent mt-1 fs-5"></i>
                    <span><strong class="text-dark">Mochila:</strong> 20 a 30 litros para abrigo personal.</span>
                  </li>
                </ul>
              </div>
              <div class="col-md-6">
                <ul class="list-unstyled mb-0 text-secondary lh-lg">
                  <li class="d-flex align-items-start gap-3 mb-3">
                    <i class="bi bi-check2 text-accent mt-1 fs-5"></i>
                    <span><strong class="text-dark">Protección solar:</strong> Lentes de sol filtro UV, bloqueador y gorro.</span>
                  </li>
                  <li class="d-flex align-items-start gap-3 mb-3">
                    <i class="bi bi-check2 text-accent mt-1 fs-5"></i>
                    <span><strong class="text-dark">Hidratación:</strong> Botella con agua (1.5 a 2 litros).</span>
                  </li>
                  <li class="d-flex align-items-start gap-3">
                    <i class="bi bi-check2 text-accent mt-1 fs-5"></i>
                    <span><strong class="text-dark">Ración de marcha:</strong> Frutos secos o chocolates.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Galería Fotográfica de la Experiencia -->
          <div v-if="experience.gallery && experience.gallery.length > 0" class="p-4 p-md-5 rounded-4 premium-card mb-5">
            <h2 class="h4 fw-bold mb-4 text-dark display-6">Galería Fotográfica</h2>
            <div class="row g-4">
              <div v-for="(img, index) in experience.gallery" :key="index" class="col-6 col-md-4">
                <div class="rounded-4 overflow-hidden shadow-sm ratio ratio-4x3 border border-secondary border-opacity-10 cursor-pointer hover-lift">
                  <img :src="img.url" :alt="img.alt || experience.title" class="w-100 h-100 object-fit-cover hover-zoom">
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar / Booking Widget -->
        <div id="booking-section" class="col-lg-4">
          <div class="sticky-top" style="top: 100px;">
            <div class="booking-sidebar p-4 p-md-5 rounded-4 premium-card">
              
              <span class="badge bg-accent text-white fw-bold px-3 py-1 mb-3 text-uppercase" style="font-size: 0.72rem; letter-spacing: 0.1em;">
                Cotización en Vivo
              </span>
              <h3 class="h4 fw-bold text-dark mb-4 display-6">Reserva tu Cupo</h3>

              <!-- Social Proof en Vivo -->
              <div class="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom border-secondary border-opacity-10">
                <div class="d-flex align-items-center gap-1 text-warning small">
                  <i class="bi bi-star-fill text-warning"></i>
                  <i class="bi bi-star-fill text-warning"></i>
                  <i class="bi bi-star-fill text-warning"></i>
                  <i class="bi bi-star-fill text-warning"></i>
                  <i class="bi bi-star-fill text-warning"></i>
                  <span class="text-dark fw-bold ms-2">4.9/5</span>
                </div>
                <span class="small text-secondary fw-medium" style="font-size: 0.75rem;">TripAdvisor Verificado</span>
              </div>

              <!-- Controles de Fecha y Pasajeros -->
              <div class="p-3 rounded-4 mb-4 border border-secondary border-opacity-10 shadow-sm" style="background-color: #F8FAFC;">
                <!-- Fecha -->
                <div class="mb-4">
                  <label class="form-label small fw-bold text-dark mb-2 d-flex align-items-center">
                    <i class="bi bi-calendar-event me-2 text-accent"></i>Fecha de Excursión
                  </label>
                  <input 
                    v-model="selectedDate" 
                    type="date" 
                    :min="todayDate" 
                    class="form-control text-dark fw-medium premium-input"
                  >
                </div>

                <!-- Pasajeros con selector (+ / -) -->
                <div>
                  <label class="form-label small fw-bold text-dark mb-2 d-flex justify-content-between align-items-center">
                    <span><i class="bi bi-people-fill me-2 text-accent"></i>Pasajeros</span>
                    <span class="badge bg-accent text-white fw-bold">{{ paxCount }} {{ paxCount === 1 ? 'persona' : 'personas' }}</span>
                  </label>
                  <div class="d-flex align-items-center gap-3">
                    <button 
                      type="button" 
                      class="btn btn-outline-secondary rounded-circle fw-bold d-flex align-items-center justify-content-center transition-all" 
                      style="width: 40px; height: 40px;"
                      @click="decrementPax"
                      :disabled="paxCount <= 1"
                    >
                      <i class="bi bi-dash"></i>
                    </button>
                    <input 
                      v-model.number="paxCount" 
                      type="number" 
                      min="1" 
                      max="20" 
                      class="form-control text-center fw-bold text-dark premium-input flex-grow-1"
                    >
                    <button 
                      type="button" 
                      class="btn btn-outline-secondary rounded-circle fw-bold d-flex align-items-center justify-content-center transition-all" 
                      style="width: 40px; height: 40px;"
                      @click="incrementPax"
                    >
                      <i class="bi bi-plus"></i>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Desglose de Precios -->
              <div class="rounded-4 p-4 shadow-sm mb-4 border border-secondary border-opacity-10" style="background-color: #F8FAFC;">
                <div class="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom border-secondary border-opacity-10 small">
                  <span class="text-secondary fw-medium">Tarifa por persona:</span>
                  <span class="fw-bold text-dark">{{ formatPrice(experience.pricing.basePrice, 'CLP') }}</span>
                </div>
                <div class="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom border-secondary border-opacity-10 small">
                  <span class="text-secondary fw-medium">Cantidad de viajeros:</span>
                  <span class="fw-bold text-accent">× {{ paxCount }}</span>
                </div>
                <div class="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom border-secondary border-opacity-10 small">
                  <span class="text-secondary fw-medium">Dificultad técnica:</span>
                  <span class="fw-bold text-dark">{{ formatDifficulty(experience.difficulty) }}</span>
                </div>
                <div class="d-flex justify-content-between align-items-end mt-4">
                  <div>
                    <span class="small text-secondary d-block text-uppercase fw-bold mb-1 tracking-wide" style="font-size: 0.72rem;">Total Calculado</span>
                    <span class="fs-3 fw-bold text-dark font-sans">{{ formatPrice(totalPriceCLP, 'CLP') }}</span>
                  </div>
                  <div class="text-end small">
                    <span class="d-block text-secondary fw-medium mb-1" style="font-size: 0.75rem;">USD {{ formatPrice(totalPriceUSD, 'USD') }}</span>
                    <span class="d-block text-accent fw-bold" style="font-size: 0.75rem;">BRL {{ formatPrice(totalPriceBRL, 'BRL') }}</span>
                  </div>
                </div>
              </div>

              <!-- Acciones de Pago -->
              <div class="d-flex flex-column gap-3">
                <button class="btn btn-cyan-gradient w-100 py-3 fw-bold fs-6 d-flex align-items-center justify-content-center gap-2 shadow-sm transition-all kowalski-btn" @click="handleAddToCart">
                  <i class="bi bi-cart-plus-fill fs-5"></i> Añadir al Carrito
                </button>
                <button class="btn btn-whatsapp-custom w-100 py-3 fw-bold fs-6 d-flex align-items-center justify-content-center gap-2 shadow-sm transition-all kowalski-btn" @click="handleBookWhatsApp">
                  <i class="bi bi-whatsapp fs-5"></i> Reservar vía WhatsApp
                </button>
              </div>

              <!-- Bloque de Garantías y Confianza Oficial Wamani -->
              <div class="mt-4 p-4 rounded-4 shadow-sm border border-secondary border-opacity-10 bg-white">
                <span class="small fw-bold text-dark text-uppercase d-flex align-items-center gap-2 mb-3 tracking-wide" style="font-size: 0.74rem;">
                  <i class="bi bi-shield-check fs-5 text-accent"></i> Garantías Oficiales
                </span>
                <ul class="list-unstyled mb-0 small text-secondary d-flex flex-column gap-3 lh-base" style="font-size: 0.8rem;">
                  <li class="d-flex align-items-start gap-2">
                    <i class="bi bi-patch-check-fill text-accent mt-0.5"></i>
                    <span><strong class="text-dark">Prestador SERNATUR:</strong> Registro N° {{ contentStore.content.legal.sernaturRegistry }}.</span>
                  </li>
                  <li class="d-flex align-items-start gap-2">
                    <i class="bi bi-shield-fill-check text-accent mt-0.5"></i>
                    <span><strong class="text-dark">Seguro Incluido:</strong> Cobertura de rescate en montaña.</span>
                  </li>
                  <li class="d-flex align-items-start gap-2">
                    <i class="bi bi-cloud-sun-fill text-accent mt-0.5"></i>
                    <span><strong class="text-dark">Garantía Climática:</strong> Reprogramación 100% por clima.</span>
                  </li>
                  <li class="d-flex align-items-start gap-2">
                    <i class="bi bi-lock-fill text-accent mt-0.5"></i>
                    <span><strong class="text-dark">Pago Cifrado:</strong> Estándar PCI-DSS.</span>
                  </li>
                </ul>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Barra fija de reserva para móviles -->
    <div class="d-lg-none fixed-bottom p-3 border-top border-secondary border-opacity-50 shadow-2xl z-3" style="background-color: #033E3B !important;">
      <div class="d-flex align-items-center justify-content-between gap-2">
        <div>
          <span class="small text-white opacity-75 d-block" style="font-size: 0.72rem;">Desde</span>
          <strong class="text-accent fs-5 font-monospace">{{ formatPrice(experience.pricing.basePrice, 'CLP') }}</strong>
          <span class="small text-white opacity-75 ms-1" style="font-size: 0.7rem;">/ pax</span>
        </div>
        <a href="#booking-section" class="btn btn-cyan-gradient px-4 py-2 fw-bold text-dark-mountain d-flex align-items-center gap-2 text-decoration-none shadow" style="border-radius: 12px; font-size: 0.9rem;">
          <i class="bi bi-calendar2-check-fill"></i> Reservar Cupos
        </a>
      </div>
    </div>

  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables';

.experience-detail-page {
  background-color: $body-bg;
}

.gallery-hero {
  height: 60vh;
  min-height: 420px;
  background-size: cover;
  background-position: center;
  margin-top: -80px;
  padding-top: 80px;
}

.z-index-1 {
  z-index: 1;
}

.max-w-700 {
  max-width: 700px;
}

.text-accent {
  color: #0FA095 !important;
}

.bg-accent {
  background-color: #0FA095 !important;
}

.premium-card {
  background-color: #FFFFFF;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 4px 24px -4px rgba(0, 0, 0, 0.03);
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.premium-input {
  background-color: #FFFFFF !important;
  border: 1px solid rgba(0, 0, 0, 0.1) !important;
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  
  &:focus {
    border-color: #0FA095 !important;
    box-shadow: 0 0 0 3px rgba(15, 160, 149, 0.2) !important;
  }
}

.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.1);
}

.kowalski-btn {
  &:active {
    transform: scale(0.97) translateY(0);
  }
}

.btn-whatsapp-custom {
  background-color: #25D366;
  color: white;
  border: none;

  &:hover {
    background-color: darken(#25D366, 8%);
    color: white;
  }
}

.btn-cyan-gradient {
  background: linear-gradient(135deg, #0FA095 0%, #077A73 100%) !important;
  color: #FFFFFF !important;
  border: none;

  &:hover {
    background: linear-gradient(135deg, lighten(#0FA095, 5%) 0%, #0FA095 100%) !important;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(15, 160, 149, 0.25);
  }
}

.hover-zoom {
  transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
  
  &:hover {
    transform: scale(1.04);
  }
}
</style>
