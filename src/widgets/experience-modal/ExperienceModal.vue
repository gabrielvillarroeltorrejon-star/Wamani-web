<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useContentStore } from '@/shared/stores/contentStore';
import { useCartStore } from '@/shared/stores/cartStore';
import type { Experience } from '@/entities/experience/model/schemas';

const props = defineProps<{
  experience: Experience | null;
  initialDate?: string;
  initialPax?: number;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const router = useRouter();
const contentStore = useContentStore();
const cartStore = useCartStore();

const todayDate = new Date().toISOString().split('T')[0];
const defaultNextDay = new Date(Date.now() + 86400000).toISOString().split('T')[0];

const modalDate = ref(props.initialDate || defaultNextDay);
const modalPax = ref(props.initialPax || 1);

// Active thumbnail viewer for gallery
const activeImage = ref<string>('');

watch(() => props.experience, (newExp) => {
  if (newExp) {
    activeImage.value = newExp.coverImage?.url || '';
    modalDate.value = props.initialDate || defaultNextDay;
    modalPax.value = props.initialPax || 1;
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
}, { immediate: true });

const closeModal = () => {
  document.body.style.overflow = '';
  emit('close');
};

const incrementPax = () => {
  if (modalPax.value < 20) modalPax.value++;
};

const decrementPax = () => {
  if (modalPax.value > 1) modalPax.value--;
};

const totalModalPriceCLP = computed(() => {
  const base = props.experience?.pricing?.basePrice || 50000;
  return base * modalPax.value;
});

const totalModalPriceUSD = computed(() => totalModalPriceCLP.value * 0.0011);
const totalModalPriceBRL = computed(() => totalModalPriceCLP.value * 0.0055);

const formatCurrency = (val: number, currency: string = 'CLP') => {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency, maximumFractionDigits: 0 }).format(val);
};

const formatDifficulty = (diff?: string) => {
  if (!diff) return 'Fácil';
  const map: Record<string, string> = {
    easy: 'Fácil',
    moderate: 'Moderada',
    hard: 'Exigente (Alta)',
    expert: 'Desafiante'
  };
  return map[diff.toLowerCase()] || diff;
};

const scrollToReservation = () => {
  const el = document.getElementById('modal-reservation-box');
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
};

const addToCartAction = () => {
  if (!props.experience) return;
  cartStore.addToCart({
    tourId: props.experience.id,
    tourTitle: props.experience.title,
    scheduleId: `sched-${modalDate.value}`,
    scheduleDate: modalDate.value,
    scheduleTime: props.experience.schedule || '08:00',
    tickets: [{
      type: 'adult',
      quantity: modalPax.value,
      unitPrice: props.experience.pricing.basePrice
    }]
  });
  closeModal();
};

const goToWebpay = () => {
  if (!props.experience) return;
  const slug = props.experience.slug;
  const date = modalDate.value;
  const pax = modalPax.value.toString();
  closeModal();
  router.push({
    path: '/checkout',
    query: {
      slug,
      date,
      pax,
      method: 'webpay'
    }
  });
};

const goToWhatsApp = (expTitle: string) => {
  const formattedTotal = formatCurrency(totalModalPriceCLP.value, 'CLP');

  // Registrar automáticamente prospecto en el CRM
  contentStore.addBooking({
    customerName: 'Prospecto WhatsApp',
    customerEmail: 'contacto@whatsapp.com',
    customerPhone: '+' + (contentStore.content.contact.whatsappNumber || '56985673376'),
    experienceTitle: expTitle,
    bookingDate: modalDate.value,
    pax: modalPax.value,
    totalPrice: totalModalPriceCLP.value,
    status: 'pending',
    source: 'whatsapp',
    paymentMethod: 'whatsapp',
    buyOrder: `WAP-${Date.now().toString().slice(-6)}`,
    notes: `Lead iniciado desde modal para ${modalPax.value} pax (${modalDate.value})`,
    passengers: []
  });

  const msg = encodeURIComponent(
    `Hola Wamani Experience, deseo reservar el tour: *${expTitle}*\n` +
    `📅 Fecha de excursión: *${modalDate.value}*\n` +
    `👥 Pasajeros: *${modalPax.value} personas*\n` +
    `💰 Monto Total Estimado: *${formattedTotal}*\n\n` +
    `¿Me podrían confirmar disponibilidad y los datos para transferir? Muchas gracias.`
  );
  const wa = contentStore.content.contact.whatsappNumber || '56985673376';
  window.open(`https://wa.me/${wa}?text=${msg}`, '_blank');
};
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="experience" class="custom-modal-backdrop" @click="closeModal">
        <div class="custom-modal-content" @click.stop>
          
          <!-- BOTÓN CERRAR FLOTANTE STICKY -->
          <button class="modal-close-btn" @click="closeModal" aria-label="Cerrar modal">
            <i class="bi bi-x-lg"></i>
          </button>

          <!-- CONTENIDO UNIFICADO EN UNA SOLA COLUMNA CON SCROLL ÚNICO -->
          <div class="modal-single-flow">
            
            <!-- PARTE SUPERIOR: DETALLES, GALERÍA Y CONTENIDO DE LA EXPERIENCIA -->
            <div class="custom-modal-info p-4 p-md-5">
              
              <!-- Galería de Fotos -->
              <div class="modal-gallery mb-4">
                <div class="row g-2">
                  <div class="col-12">
                    <img 
                      :src="activeImage || experience.coverImage.url" 
                      class="w-100 rounded-4 object-fit-cover shadow-sm transition-all" 
                      style="height: 340px; max-height: 42vh;" 
                      alt="Imagen principal"
                    >
                  </div>
                  <div 
                    class="col-4 col-sm-3 cursor-pointer" 
                    v-for="(img, idx) in [experience.coverImage, ...(experience.gallery || [])]" 
                    :key="idx"
                    @click="activeImage = img.url"
                  >
                    <div 
                      class="rounded-3 overflow-hidden border shadow-sm transition-all"
                      :class="{ 'ring-accent': activeImage === img.url }"
                      style="height: 95px;"
                    >
                      <img 
                        :src="img.url" 
                        class="w-100 h-100 object-fit-cover" 
                        loading="lazy" 
                        :alt="img.alt || `Foto ${idx + 1}`"
                      >
                    </div>
                  </div>
                </div>
              </div>

              <!-- Metadatos y Botón de Salto Rápido a Reserva -->
              <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
                <div class="d-flex align-items-center flex-wrap gap-2">
                  <span class="badge px-3 py-2 rounded-pill font-sans text-uppercase tracking-wide fw-bold" style="background-color: #147E79; color: #E7DCC3; font-size: 0.75rem;">
                    {{ experience.categories ? experience.categories[0] : 'EXPERIENCIA' }}
                  </span>
                  <span class="small fw-semibold" style="color: #147E79 !important;">
                    <i class="bi bi-clock me-1 text-accent"></i> {{ experience.duration.value }} {{ experience.duration.unit === 'hours' ? 'horas' : 'días' }}
                  </span>
                  <span class="small fw-semibold" style="color: #147E79 !important;">
                    <i class="bi bi-bar-chart-fill me-1 text-accent"></i> {{ formatDifficulty(experience.difficulty) }}
                  </span>
                </div>

                <button 
                  type="button" 
                  class="btn btn-sm rounded-pill px-3 py-1 fw-bold text-decoration-none shadow-sm d-inline-flex align-items-center gap-2 border-0" 
                  style="background-color: #E7DCC3; color: #0D5B57; font-size: 0.82rem;"
                  @click="scrollToReservation"
                >
                  <i class="bi bi-calendar2-check-fill"></i> Ir a Configurar Reserva ↓
                </button>
              </div>

              <!-- Título y Bajada -->
              <h2 class="font-brush fw-bold display-5 mb-2 mt-1" style="color: #147E79 !important; font-family: 'Caveat', cursive !important;">
                {{ experience.title }}
              </h2>
              <p class="lead mb-4 fw-semibold" style="color: #232323 !important; font-size: 1.15rem;">
                {{ experience.subtitle }}
              </p>

              <!-- Descripción Principal -->
              <div class="mb-4">
                <h4 class="fw-bold h5 mb-3" style="color: #147E79 !important;">Descripción</h4>
                <p class="lh-lg fw-medium" style="color: #4C4C4C !important; font-size: 1rem;">
                  {{ experience.description }}
                </p>
              </div>

              <!-- Itinerario (si existe) -->
              <div class="mb-4" v-if="experience.itinerary && experience.itinerary.length">
                <h4 class="fw-bold h5 mb-3" style="color: #147E79 !important;">Itinerario</h4>
                <div class="itinerary-timeline">
                  <div v-for="(item, idx) in experience.itinerary" :key="idx" class="itinerary-item">
                    <div class="itinerary-time fw-bold" style="color: #147E79 !important;">{{ item.dayOrTime }}</div>
                    <div class="itinerary-content pb-3">
                      <h5 class="fw-bold h6 mb-1" style="color: #147E79 !important;">{{ item.title }}</h5>
                      <p class="small mb-0 fw-medium" style="color: #4C4C4C !important;">{{ item.description }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Qué incluye y Qué no incluye -->
              <div class="row g-3 mb-4">
                <div class="col-md-6" v-if="experience.included && experience.included.length">
                  <div class="p-3 rounded-4 h-100" style="background-color: rgba(20, 126, 121, 0.05); border: 1px solid rgba(20, 126, 121, 0.12);">
                    <h4 class="fw-bold h6 mb-3 text-success d-flex align-items-center gap-2">
                      <i class="bi bi-check-circle-fill"></i> Qué incluye
                    </h4>
                    <ul class="list-unstyled mb-0">
                      <li v-for="(inc, i) in experience.included" :key="i" class="mb-2 small fw-semibold d-flex align-items-start gap-2" style="color: #147E79 !important;">
                        <i class="bi bi-check2 text-success fs-6 flex-shrink-0 mt-0"></i> 
                        <span>{{ inc }}</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div class="col-md-6" v-if="experience.notIncluded && experience.notIncluded.length">
                  <div class="p-3 rounded-4 h-100" style="background-color: rgba(220, 53, 69, 0.04); border: 1px solid rgba(220, 53, 69, 0.12);">
                    <h4 class="fw-bold h6 mb-3 text-danger d-flex align-items-center gap-2">
                      <i class="bi bi-x-circle-fill"></i> Qué no incluye
                    </h4>
                    <ul class="list-unstyled mb-0">
                      <li v-for="(ninc, i) in experience.notIncluded" :key="i" class="mb-2 small fw-semibold d-flex align-items-start gap-2" style="color: #4C4C4C !important;">
                        <i class="bi bi-x text-danger fs-6 flex-shrink-0 mt-0"></i> 
                        <span>{{ ninc }}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <!-- Puntos Clave: Encuentro y Cancelación -->
              <div class="p-3 rounded-4 border-top border-secondary border-opacity-25" style="background-color: #FAFAFA;">
                <p class="small mb-1 fw-semibold" style="color: #4C4C4C !important;">
                  <strong style="color: #147E79;">Punto de encuentro:</strong> {{ experience.meetingPoint || 'Oficina Wamani, Centro de Pucón' }}
                </p>
                <p class="small mb-0 fw-semibold" style="color: #4C4C4C !important;">
                  <strong style="color: #147E79;">Política de Cancelación:</strong> {{ experience.cancellationPolicy || 'Cancelación gratuita con 48 hrs de anticipación.' }}
                </p>
              </div>

            </div>

            <!-- PARTE INFERIOR: ÁREA DE CONFIGURA TU VIAJE Y PAGO (UNA SOLA TARJETA FLOTANTE) -->
            <div id="modal-reservation-box" class="custom-modal-sidebar p-4 p-md-5">
              
              <div class="mb-4 text-center text-md-start">
                <span class="badge fw-bold px-3 py-1 mb-2 text-uppercase" style="font-size: 0.72rem; letter-spacing: 0.1em; background-color: #E7DCC3; color: #0D5B57;">
                  Área de Reserva Segura
                </span>
                <h3 class="font-brush fw-bold display-6 mb-1 text-white" style="font-family: 'Caveat', cursive !important;">
                  Configura tu Viaje
                </h3>
                <p class="small text-white text-opacity-75 mb-0">
                  Selecciona la fecha y cantidad de viajeros para calcular tu tarifa y reservar en tiempo real.
                </p>
              </div>

              <!-- CONTROLES Y RESUMEN DE PAGO EN FILA RESPONSIVA -->
              <div class="row g-3 g-md-4 mb-4 align-items-stretch">
                <!-- Columna Izquierda: Fecha y Pasajeros -->
                <div class="col-md-6 d-flex flex-column gap-3">
                  <!-- Selector de Fecha -->
                  <div class="p-3 rounded-4" style="background-color: #0A4744; border: 1px solid rgba(231, 220, 195, 0.35);">
                    <label class="form-label small fw-bold text-white mb-2 d-flex align-items-center" style="color: #FFFFFF !important;">
                      <i class="bi bi-calendar-event me-2" style="color: #E7DCC3;"></i>Fecha de Excursión
                    </label>
                    <input 
                      v-model="modalDate" 
                      type="date" 
                      :min="todayDate" 
                      class="form-control text-white fw-bold" 
                      style="background-color: #073330; border-color: rgba(231, 220, 195, 0.4); color: #FFFFFF !important;"
                      required
                    >
                  </div>

                  <!-- Selector de Pasajeros (+ / -) -->
                  <div class="p-3 rounded-4" style="background-color: #0A4744; border: 1px solid rgba(231, 220, 195, 0.35);">
                    <label class="form-label small fw-bold text-white mb-2 d-flex justify-content-between align-items-center" style="color: #FFFFFF !important;">
                      <span><i class="bi bi-people-fill me-2" style="color: #E7DCC3;"></i>Número de Pasajeros</span>
                      <span class="badge fw-bold" style="background-color: #E7DCC3; color: #0D5B57;">{{ modalPax }} {{ modalPax === 1 ? 'persona' : 'personas' }}</span>
                    </label>
                    <div class="d-flex align-items-center justify-content-between gap-2">
                      <button 
                        type="button" 
                        class="btn btn-outline-light rounded-circle fw-bold d-flex align-items-center justify-content-center shadow-sm" 
                        style="width: 44px; height: 44px;"
                        @click="decrementPax"
                        :disabled="modalPax <= 1"
                        aria-label="Reducir pasajeros"
                      >
                        <i class="bi bi-dash fs-5"></i>
                      </button>
                      <div class="text-center flex-grow-1">
                        <span class="fs-2 fw-bold text-white lh-1">{{ modalPax }}</span>
                        <span class="d-block small text-white text-opacity-75" style="font-size: 0.75rem;">{{ modalPax === 1 ? 'viajero' : 'viajeros' }}</span>
                      </div>
                      <button 
                        type="button" 
                        class="btn btn-outline-light rounded-circle fw-bold d-flex align-items-center justify-content-center shadow-sm" 
                        style="width: 44px; height: 44px;"
                        @click="incrementPax"
                        aria-label="Aumentar pasajeros"
                      >
                        <i class="bi bi-plus fs-5"></i>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Columna Derecha: Tarifa y Totales -->
                <div class="col-md-6">
                  <div class="price-box-card rounded-4 p-4 shadow-sm h-100 d-flex flex-column justify-content-between" style="background-color: #0D5B57; border: 1px solid rgba(231, 220, 195, 0.35);">
                    <div>
                      <div class="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom border-white border-opacity-15">
                        <span class="small text-white fw-semibold" style="color: #FFFFFF !important;">Tarifa por persona</span>
                        <span class="fw-bold text-white" style="color: #FFFFFF !important;">{{ formatCurrency(experience.pricing.basePrice, 'CLP') }}</span>
                      </div>
                      <div class="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom border-white border-opacity-15">
                        <span class="small text-white fw-semibold" style="color: #FFFFFF !important;">Cantidad de viajeros</span>
                        <span class="fw-bold" style="color: #E7DCC3;">× {{ modalPax }}</span>
                      </div>
                    </div>
                    
                    <div class="d-flex justify-content-between align-items-end mt-3 pt-2 border-top border-white border-opacity-15">
                      <div>
                        <span class="d-block text-white small text-uppercase tracking-wide fw-bold" style="font-size: 0.72rem; color: #FFFFFF !important;">Total a Pagar</span>
                        <span class="fw-bold text-white fs-2 lh-1" style="color: #FFFFFF !important;">{{ formatCurrency(totalModalPriceCLP, 'CLP') }}</span>
                      </div>
                      <div class="text-end">
                        <span class="d-block small text-white fw-semibold" style="font-size: 0.78rem; color: #FFFFFF !important;">USD {{ formatCurrency(totalModalPriceUSD, 'USD') }}</span>
                        <span class="d-block small fw-bold" style="font-size: 0.78rem; color: #E7DCC3;">BRL {{ formatCurrency(totalModalPriceBRL, 'BRL') }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- BOTONES Y ACCIONES DE COMPRA -->
              <div class="d-flex flex-column gap-3">
                <div class="row g-2">
                  <div class="col-12 col-sm-6">
                    <button class="btn btn-outline-accent w-100 py-3 fw-bold fs-6 d-flex align-items-center justify-content-center gap-2 shadow-sm bg-transparent" @click="addToCartAction">
                      <i class="bi bi-cart-plus-fill fs-5"></i> Agregar al Carrito
                    </button>
                  </div>
                  <div class="col-12 col-sm-6">
                    <button class="btn btn-cyan-gradient w-100 py-3 fw-bold fs-6 d-flex align-items-center justify-content-center gap-2 shadow" @click="goToWebpay">
                      <i class="bi bi-credit-card-2-front-fill fs-5"></i> Pagar con Webpay Plus
                    </button>
                  </div>
                </div>
                
                <button class="btn btn-whatsapp-custom w-100 py-3 fw-bold fs-6 d-flex align-items-center justify-content-center gap-2 shadow-sm" @click="goToWhatsApp(experience.title)">
                  <i class="bi bi-whatsapp fs-5"></i> Reservar vía Transferencia / WhatsApp
                </button>
                
                <div class="d-flex align-items-center justify-content-center gap-2 text-white small mt-1 fw-medium" style="color: #FFFFFF !important;">
                  <i class="bi bi-shield-lock-fill" style="color: #E7DCC3;"></i>
                  <span>Transacción protegida por cifrado SSL 256-bit y Webpay Oficial</span>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables';

.ring-accent {
  box-shadow: 0 0 0 3px #147E79 !important;
}

.transition-all {
  transition: all 0.25s cubic-bezier(0.32, 0.72, 0, 1);
}

.cursor-pointer {
  cursor: pointer;
}

.itinerary-timeline {
  position: relative;
  padding-left: 1rem;
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 2px;
    background: #E5E7EB;
  }
  
  .itinerary-item {
    position: relative;
    padding-left: 1.5rem;
    
    &::before {
      content: '';
      position: absolute;
      left: -5px;
      top: 5px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: $primary;
      border: 3px solid white;
      box-shadow: 0 0 0 1px rgba($primary, 0.2);
    }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>