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
  <div class="experience-detail-page min-vh-100 font-sans" style="background-color: #83AAA8;">
    
    <!-- Hero Gallery -->
    <div class="gallery-hero position-relative" :style="{ backgroundImage: `url(${experience.coverImage.url})` }">
      <div class="overlay position-absolute top-0 start-0 w-100 h-100 bg-dark opacity-60"></div>
      <div class="container position-relative h-100 d-flex flex-column justify-content-end pb-5 text-white z-index-1">
        <div class="d-flex align-items-center gap-2 mb-2">
          <span class="badge px-3 py-2 rounded-pill font-sans text-uppercase tracking-wide" style="background-color: #045D56; color: #2DD4BF; font-size: 0.75rem;">
            {{ experience.tags ? experience.tags[0] : 'EXPERIENCIA' }}
          </span>
          <span class="badge bg-dark bg-opacity-75 text-white px-3 py-2 rounded-pill">
            <i class="bi bi-geo-alt-fill me-1 text-accent"></i>{{ experience.destinationId }}
          </span>
        </div>
        <h1 class="display-3 fw-bold mb-2 font-brush" style="font-family: 'Caveat', cursive !important;">{{ experience.title }}</h1>
        <p class="lead opacity-90 mb-0 max-w-700">{{ experience.subtitle }}</p>
      </div>
    </div>

    <div class="container py-5">
      <div class="row g-4">
        
        <!-- Contenido Principal -->
        <div class="col-lg-8">
          
          <!-- Barra Rápida de Atributos Clave (Key Facts Grid) -->
          <div class="row g-3 mb-4">
            <div class="col-6 col-md-3">
              <div class="p-3 rounded-4 h-100 text-center d-flex flex-column align-items-center justify-content-center shadow-sm" style="background: rgba(3, 62, 59, 0.85); border: 1px solid rgba(45, 212, 191, 0.35);">
                <i class="bi bi-clock-history fs-3 text-accent mb-1"></i>
                <span class="small text-white opacity-75 text-uppercase fw-semibold" style="font-size: 0.72rem; letter-spacing: 0.05em;">DURACIÓN</span>
                <strong class="text-white fs-6">{{ experience.duration?.value }} {{ experience.duration?.unit === 'hours' ? 'Horas' : 'Días' }}</strong>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="p-3 rounded-4 h-100 text-center d-flex flex-column align-items-center justify-content-center shadow-sm" style="background: rgba(3, 62, 59, 0.85); border: 1px solid rgba(45, 212, 191, 0.35);">
                <i class="bi bi-activity fs-3 text-accent mb-1"></i>
                <span class="small text-white opacity-75 text-uppercase fw-semibold" style="font-size: 0.72rem; letter-spacing: 0.05em;">EXIGENCIA</span>
                <strong class="text-white fs-6">{{ formatDifficulty(experience.difficulty) }}</strong>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="p-3 rounded-4 h-100 text-center d-flex flex-column align-items-center justify-content-center shadow-sm" style="background: rgba(3, 62, 59, 0.85); border: 1px solid rgba(45, 212, 191, 0.35);">
                <i class="bi bi-people-fill fs-3 text-accent mb-1"></i>
                <span class="small text-white opacity-75 text-uppercase fw-semibold" style="font-size: 0.72rem; letter-spacing: 0.05em;">GRUPO</span>
                <strong class="text-white fs-6">Cupos Reducidos</strong>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="p-3 rounded-4 h-100 text-center d-flex flex-column align-items-center justify-content-center shadow-sm" style="background: rgba(3, 62, 59, 0.85); border: 1px solid rgba(45, 212, 191, 0.35);">
                <i class="bi bi-translate fs-3 text-accent mb-1"></i>
                <span class="small text-white opacity-75 text-uppercase fw-semibold" style="font-size: 0.72rem; letter-spacing: 0.05em;">IDIOMAS</span>
                <strong class="text-white fs-6">Español / Inglés</strong>
              </div>
            </div>
          </div>

          <!-- Descripción -->
          <div class="p-4 p-md-5 rounded-4 shadow-sm text-white mb-4" style="background: linear-gradient(145deg, #045D56 0%, #033E3B 100%); border: 1px solid rgba(45, 212, 191, 0.35);">
            <h2 class="h4 fw-bold mb-4 font-brush display-6" style="font-family: 'Caveat', cursive !important; color: #2DD4BF;">Sobre esta Experiencia</h2>
            <p class="text-white opacity-95 lh-lg mb-0" style="font-size: 1.05rem;">{{ experience.description }}</p>
          </div>

          <!-- Itinerario -->
          <div v-if="experience.itinerary && experience.itinerary.length" class="p-4 p-md-5 rounded-4 shadow-sm text-white mb-4" style="background: linear-gradient(145deg, #045D56 0%, #033E3B 100%); border: 1px solid rgba(45, 212, 191, 0.35);">
            <h2 class="h4 fw-bold mb-4 font-brush display-6" style="font-family: 'Caveat', cursive !important; color: #2DD4BF;">Itinerario Detallado</h2>
            <div v-for="(day, index) in experience.itinerary" :key="index" class="mb-4 d-flex gap-3 align-items-start border-bottom border-secondary border-opacity-25 pb-3">
              <div class="flex-shrink-0">
                <div class="rounded-circle d-flex align-items-center justify-content-center fw-bold font-monospace" style="width: 42px; height: 42px; background-color: #2DD4BF; color: #033E3B;">
                  {{ index + 1 }}
                </div>
              </div>
              <div>
                <h4 class="h5 fw-bold text-white mb-1">
                  <span v-if="day.dayOrTime" class="text-accent me-2 font-sans fs-6">[{{ day.dayOrTime }}]</span>
                  {{ day.title }}
                </h4>
                <p class="text-white opacity-85 mb-0 small lh-base">{{ day.description }}</p>
              </div>
            </div>
          </div>

          <!-- Qué incluye / Qué no incluye -->
          <div class="p-4 p-md-5 rounded-4 shadow-sm text-white mb-4" style="background: linear-gradient(145deg, #045D56 0%, #033E3B 100%); border: 1px solid rgba(45, 212, 191, 0.35);">
            <div class="row g-4">
              <div class="col-md-6">
                <h4 class="h6 fw-bold text-success text-uppercase mb-3"><i class="bi bi-check-circle-fill me-2"></i>Qué incluye</h4>
                <ul class="list-unstyled mb-0">
                  <li v-for="(inc, i) in experience.included" :key="i" class="mb-2 small text-white opacity-90 d-flex align-items-start gap-2">
                    <i class="bi bi-check-lg text-accent flex-shrink-0 mt-1"></i>
                    <span>{{ inc }}</span>
                  </li>
                </ul>
              </div>
              <div class="col-md-6">
                <h4 class="h6 fw-bold text-danger text-uppercase mb-3"><i class="bi bi-x-circle-fill me-2"></i>Qué no incluye</h4>
                <ul class="list-unstyled mb-0">
                  <li v-for="(ninc, i) in experience.notIncluded" :key="i" class="mb-2 small text-white opacity-90 d-flex align-items-start gap-2">
                    <i class="bi bi-x text-danger flex-shrink-0 mt-1"></i>
                    <span>{{ ninc }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Qué debes traer contigo / Equipamiento Sugerido -->
          <div class="p-4 p-md-5 rounded-4 shadow-sm text-white mb-4" style="background: linear-gradient(145deg, #045D56 0%, #033E3B 100%); border: 1px solid rgba(45, 212, 191, 0.35);">
            <h3 class="h5 fw-bold mb-3 d-flex align-items-center gap-2 text-white">
              <i class="bi bi-backpack4-fill text-accent fs-4"></i>
              <span>Qué debes traer contigo (Equipamiento sugerido)</span>
            </h3>
            <div class="row g-3 pt-2">
              <div class="col-md-6">
                <ul class="list-unstyled mb-0 small text-white opacity-90 lh-lg">
                  <li class="d-flex align-items-start gap-2 mb-2">
                    <i class="bi bi-check2 text-accent mt-1"></i>
                    <span><strong>Calzado adecuado:</strong> Zapatos de trekking o con suela de buen agarre (con caña para volcanes y terreno rocoso).</span>
                  </li>
                  <li class="d-flex align-items-start gap-2 mb-2">
                    <i class="bi bi-check2 text-accent mt-1"></i>
                    <span><strong>Vestimenta por capas:</strong> Primera capa transpirable, polar intermedio y cortavientos/impermeable.</span>
                  </li>
                  <li class="d-flex align-items-start gap-2">
                    <i class="bi bi-check2 text-accent mt-1"></i>
                    <span><strong>Mochila:</strong> 20 a 30 litros para llevar ración de marcha y abrigo personal.</span>
                  </li>
                </ul>
              </div>
              <div class="col-md-6">
                <ul class="list-unstyled mb-0 small text-white opacity-90 lh-lg">
                  <li class="d-flex align-items-start gap-2 mb-2">
                    <i class="bi bi-check2 text-accent mt-1"></i>
                    <span><strong>Protección solar:</strong> Lentes de sol con filtro UV categoría 3 o 4, bloqueador solar y gorro/jockey.</span>
                  </li>
                  <li class="d-flex align-items-start gap-2 mb-2">
                    <i class="bi bi-check2 text-accent mt-1"></i>
                    <span><strong>Hidratación:</strong> Botella reutilizable con agua (mínimo 1.5 a 2 litros por persona).</span>
                  </li>
                  <li class="d-flex align-items-start gap-2">
                    <i class="bi bi-check2 text-accent mt-1"></i>
                    <span><strong>Ración de marcha:</strong> Frutos secos, barras energéticas o chocolates para energía durante el trayecto.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Galería Fotográfica de la Experiencia -->
          <div v-if="experience.gallery && experience.gallery.length > 0" class="p-4 p-md-5 rounded-4 shadow-sm text-white mb-4" style="background: linear-gradient(145deg, #045D56 0%, #033E3B 100%); border: 1px solid rgba(45, 212, 191, 0.35);">
            <h2 class="h4 fw-bold mb-4 font-brush display-6" style="font-family: 'Caveat', cursive !important; color: #2DD4BF;">Galería Fotográfica</h2>
            <div class="row g-3">
              <div v-for="(img, index) in experience.gallery" :key="index" class="col-6 col-md-4">
                <div class="rounded-4 overflow-hidden shadow-sm ratio ratio-4x3 border border-secondary border-opacity-25" style="background-color: #033E3B;">
                  <img :src="img.url" :alt="img.alt || experience.title" class="w-100 h-100 object-fit-cover hover-zoom" style="transition: transform 0.4s ease;">
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar / Booking Widget -->
        <div id="booking-section" class="col-lg-4">
          <div class="sticky-top" style="top: 100px;">
            <div class="booking-sidebar p-4 p-md-5 rounded-4 shadow-lg text-white" style="background: linear-gradient(145deg, #045D56 0%, #033E3B 100%); border: 1px solid rgba(45, 212, 191, 0.45);">
              
              <span class="badge bg-accent text-dark-mountain fw-bold px-3 py-1 mb-2 text-uppercase" style="font-size: 0.72rem; letter-spacing: 0.1em;">
                Cotización en Vivo
              </span>
              <h3 class="h4 fw-bold text-white mb-4 font-brush display-6" style="font-family: 'Caveat', cursive !important;">Reserva tu Cupo</h3>

              <!-- Social Proof en Vivo -->
              <div class="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom border-secondary border-opacity-25">
                <div class="d-flex align-items-center gap-1 text-warning small">
                  <i class="bi bi-star-fill text-warning"></i>
                  <i class="bi bi-star-fill text-warning"></i>
                  <i class="bi bi-star-fill text-warning"></i>
                  <i class="bi bi-star-fill text-warning"></i>
                  <i class="bi bi-star-fill text-warning"></i>
                  <span class="text-white fw-bold ms-1">4.9/5</span>
                </div>
                <span class="small text-white opacity-75" style="font-size: 0.75rem;">TripAdvisor Verificado</span>
              </div>

              <!-- Controles de Fecha y Pasajeros -->
              <div class="p-3 rounded-4 mb-4" style="background-color: #033E3B; border: 1px solid rgba(45, 212, 191, 0.3);">
                <!-- Fecha -->
                <div class="mb-3">
                  <label class="form-label small fw-bold text-white mb-1 d-flex align-items-center">
                    <i class="bi bi-calendar-event me-2 text-accent"></i>Fecha de Excursión
                  </label>
                  <input 
                    v-model="selectedDate" 
                    type="date" 
                    :min="todayDate" 
                    class="form-control form-control-sm text-white" 
                    style="background-color: #022C2A; border-color: rgba(45, 212, 191, 0.4);"
                  >
                </div>

                <!-- Pasajeros con selector (+ / -) -->
                <div>
                  <label class="form-label small fw-bold text-white mb-1 d-flex justify-content-between align-items-center">
                    <span><i class="bi bi-people-fill me-2 text-accent"></i>Pasajeros</span>
                    <span class="badge bg-accent text-dark-mountain fw-bold">{{ paxCount }} {{ paxCount === 1 ? 'persona' : 'personas' }}</span>
                  </label>
                  <div class="d-flex align-items-center gap-2">
                    <button 
                      type="button" 
                      class="btn btn-sm btn-outline-light rounded-circle fw-bold d-flex align-items-center justify-content-center" 
                      style="width: 36px; height: 36px;"
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
                      class="form-control form-control-sm text-center fw-bold text-white" 
                      style="background-color: #022C2A; border-color: rgba(45, 212, 191, 0.4); max-width: 70px;"
                    >
                    <button 
                      type="button" 
                      class="btn btn-sm btn-outline-light rounded-circle fw-bold d-flex align-items-center justify-content-center" 
                      style="width: 36px; height: 36px;"
                      @click="incrementPax"
                    >
                      <i class="bi bi-plus"></i>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Desglose de Precios -->
              <div class="price-box-card rounded-4 p-4 shadow-sm mb-4" style="background-color: #033E3B; border: 1px solid rgba(45, 212, 191, 0.35);">
                <div class="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom border-secondary border-opacity-25 small">
                  <span class="text-white opacity-75">Tarifa por persona:</span>
                  <span class="fw-bold text-white">{{ formatPrice(experience.pricing.basePrice, 'CLP') }}</span>
                </div>
                <div class="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom border-secondary border-opacity-25 small">
                  <span class="text-white opacity-75">Cantidad de viajeros:</span>
                  <span class="fw-bold text-accent">× {{ paxCount }}</span>
                </div>
                <div class="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom border-secondary border-opacity-25 small">
                  <span class="text-white opacity-75">Dificultad técnica:</span>
                  <span class="fw-bold text-white">{{ formatDifficulty(experience.difficulty) }}</span>
                </div>
                <div class="d-flex justify-content-between align-items-end mt-3">
                  <div>
                    <span class="small text-white opacity-75 d-block text-uppercase" style="font-size: 0.72rem;">Total Calculado</span>
                    <span class="fs-3 fw-bold text-white font-monospace">{{ formatPrice(totalPriceCLP, 'CLP') }}</span>
                  </div>
                  <div class="text-end small">
                    <span class="d-block text-white opacity-75" style="font-size: 0.75rem;">USD {{ formatPrice(totalPriceUSD, 'USD') }}</span>
                    <span class="d-block text-accent" style="font-size: 0.75rem;">BRL {{ formatPrice(totalPriceBRL, 'BRL') }}</span>
                  </div>
                </div>
              </div>

              <!-- Acciones de Pago -->
              <div class="d-flex flex-column gap-3">
                <button class="btn btn-cyan-gradient w-100 py-3 fw-bold fs-6 d-flex align-items-center justify-content-center gap-2 shadow" @click="handleAddToCart">
                  <i class="bi bi-cart-plus-fill fs-5"></i> Añadir al Carrito
                </button>
                <button class="btn btn-whatsapp-custom w-100 py-3 fw-bold fs-6 d-flex align-items-center justify-content-center gap-2 shadow-sm" @click="handleBookWhatsApp">
                  <i class="bi bi-whatsapp fs-5"></i> Reservar vía WhatsApp / Transferencia
                </button>
              </div>

              <!-- Bloque de Garantías y Confianza Oficial Wamani -->
              <div class="mt-4 p-3 rounded-4" style="background-color: rgba(2, 44, 42, 0.85); border: 1px solid rgba(45, 212, 191, 0.3);">
                <span class="small fw-bold text-accent text-uppercase d-flex align-items-center gap-2 mb-2" style="font-size: 0.74rem; letter-spacing: 0.08em;">
                  <i class="bi bi-shield-check fs-6"></i> Garantías Wamani Experience
                </span>
                <ul class="list-unstyled mb-0 small text-white opacity-90 d-flex flex-column gap-2" style="font-size: 0.78rem;">
                  <li class="d-flex align-items-start gap-2">
                    <i class="bi bi-patch-check-fill text-accent mt-0.5"></i>
                    <span><strong>Prestador Oficial SERNATUR:</strong> Registro N° {{ contentStore.content.legal.sernaturRegistry }}.</span>
                  </li>
                  <li class="d-flex align-items-start gap-2">
                    <i class="bi bi-shield-fill-check text-accent mt-0.5"></i>
                    <span><strong>Póliza de Asistencia Incluida:</strong> Cobertura de rescate y accidentes en montaña.</span>
                  </li>
                  <li class="d-flex align-items-start gap-2">
                    <i class="bi bi-cloud-sun-fill text-accent mt-0.5"></i>
                    <span><strong>Garantía Climática / SENAPRED:</strong> Reprogramación 100% o devolución ante alertas y cierres de parques.</span>
                  </li>
                  <li class="d-flex align-items-start gap-2">
                    <i class="bi bi-lock-fill text-accent mt-0.5"></i>
                    <span><strong>Pago Cifrado Transbank:</strong> Acepta tarjetas chilenas e internacionales con estándar PCI-DSS.</span>
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
  background-color: #83AAA8;
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
  color: #2DD4BF !important;
}

.text-dark-mountain {
  color: #033E3B !important;
}

.bg-accent {
  background-color: #2DD4BF !important;
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
  background: linear-gradient(135deg, #2DD4BF 0%, #0FA095 100%) !important;
  color: #022927 !important;
  border: none;

  &:hover {
    background: linear-gradient(135deg, lighten(#2DD4BF, 5%) 0%, #2DD4BF 100%) !important;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(45, 212, 191, 0.4);
  }
}

.hover-zoom:hover {
  transform: scale(1.06);
}
</style>
