<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import HomeHero from '@/widgets/home-hero/HomeHero.vue';
import HomeWamaniSense from '@/widgets/home-sense/HomeWamaniSense.vue';
import HomeFounders from '@/widgets/home-founders/HomeFounders.vue';
import HomeServices from '@/widgets/home-services/HomeServices.vue';
import HomeDestinations from '@/widgets/home-destinations/HomeDestinations.vue';
import HomePackages from '@/widgets/home-packages/HomePackages.vue';
import HomeGallery from '@/widgets/home-gallery/HomeGallery.vue';
import HomeBookingForm from '@/widgets/home-booking/HomeBookingForm.vue';
import ReviewsCarousel from '@/widgets/reviews/ReviewsCarousel.vue';
import W3DCoverflowSlider from '@/shared/ui/W3DCoverflowSlider.vue';
import { useContentStore } from '@/shared/stores/contentStore';
import { useCartStore } from '@/shared/stores/cartStore';
import type { Experience } from '@/entities/experience/model/schemas';

const router = useRouter();
const contentStore = useContentStore();
const cartStore = useCartStore();

const todayDate = new Date().toISOString().split('T')[0];
const defaultNextDay = new Date(Date.now() + 86400000).toISOString().split('T')[0];

// Excluir Zona Norte según requerimiento oficial
const featuredExperiences = computed(() => 
  contentStore.experiences
    .filter(e => e.macroZone !== 'norte' && e.destinationId !== 'dest-atacama')
    .slice(0, 9)
);

// Modal Detalle y Reserva
const selectedExperience = ref<Experience | null>(null);
const modalDate = ref(defaultNextDay);
const modalPax = ref(1);

const openModal = (exp: Experience) => {
  if (window.innerWidth < 768) {
    router.push({ path: `/experiencias/${exp.slug}` });
    return;
  }
  selectedExperience.value = exp;
  modalDate.value = defaultNextDay;
  modalPax.value = 1;
  document.body.style.overflow = 'hidden';
};

const closeModal = () => {
  selectedExperience.value = null;
  document.body.style.overflow = '';
};

const incrementPax = () => {
  if (modalPax.value < 20) modalPax.value++;
};

const decrementPax = () => {
  if (modalPax.value > 1) modalPax.value--;
};

const totalModalPriceCLP = computed(() => {
  const base = selectedExperience.value?.pricing.basePrice || 50000;
  return base * modalPax.value;
});

const totalModalPriceUSD = computed(() => totalModalPriceCLP.value * 0.0011);
const totalModalPriceBRL = computed(() => totalModalPriceCLP.value * 0.0055);

const formatCurrency = (val: number, currency: string) => {
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

const goToWhatsApp = (expTitle: string) => {
  const formattedTotal = formatCurrency(totalModalPriceCLP.value, 'CLP');

  // Registrar automáticamente prospecto de venta en el CRM
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
    notes: `Lead iniciado desde portada para ${modalPax.value} pax (${modalDate.value})`,
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

const addToCartAction = () => {
  if (!selectedExperience.value) return;
  cartStore.addToCart({
    tourId: selectedExperience.value.id,
    tourTitle: selectedExperience.value.title,
    scheduleId: `sched-${modalDate.value}`,
    scheduleDate: modalDate.value,
    scheduleTime: selectedExperience.value.schedule || '08:00',
    tickets: [{
      type: 'adult',
      quantity: modalPax.value,
      unitPrice: selectedExperience.value.pricing.basePrice
    }]
  });
  closeModal();
};

const goToWebpay = () => {
  if (!selectedExperience.value) return;
  const slug = selectedExperience.value.slug;
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

onMounted(() => {
  if (contentStore.content.home.reviews.elfsightWidgetId && !document.getElementById('elfsight-platform-script')) {
    const script = document.createElement('script');
    script.id = 'elfsight-platform-script';
    script.src = 'https://elfsightcdn.com/platform.js';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }
});
</script>

<template>
  <div>
    <!-- 1. Hero Principal con Video Destino y enlace a página aparte -->
    <HomeHero />

    <!-- 2. Presentación DESTINOS WAMANI (El sentido Wamani + Cita complementaria) -->
    <HomeWamaniSense />

    <!-- 3. Presentación NOSOTROS (Fundadores Camilo Tamayo & Benjamín Meneses) -->
    <HomeFounders />

    <!-- 4. TOURS DESTACADOS (SLIDER 3D COVERFLOW) -->
    <section class="featured-3d-section py-4 px-2 px-md-4" style="background-color: #FAF8F5;">
      <div class="container-fluid px-lg-4">
        <W3DCoverflowSlider 
          :experiences="featuredExperiences" 
          @open="openModal" 
        />
      </div>
    </section>

    <!-- 5. Nuestros Servicios -->
    <HomeServices />
    
    <!-- 6. Buscador y Destinos (Zona Norte Ocultada y Desactivada) -->
    <HomeDestinations />

    <!-- 7. Paquetes Promocionales -->
    <HomePackages />

    <!-- 8. Galería Fotográfica Natural (8 Fotos auténticas sin posar) -->
    <HomeGallery />

    <!-- 9. Nuestros Guías Certificados SERNATUR -->
    <section v-if="contentStore.content.about.advisors && contentStore.content.about.advisors.length > 0" id="guias" class="py-5" style="background-color: #FAF8F5;">
      <div class="container py-4">
        <div class="text-center mb-5">
          <div class="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-3" style="background: rgba(20, 126, 121, 0.08); border: 1px solid rgba(20, 126, 121, 0.2);">
            <i class="bi bi-patch-check-fill" style="color: #147E79;"></i>
            <span class="small text-uppercase fw-bold" style="letter-spacing: 0.1em; font-size: 0.75rem; color: #147E79;">Equipo & Guías SERNATUR</span>
          </div>
          <h2 class="display-5 font-sans fw-bold mb-2" style="color: #147E79;">
            {{ contentStore.content.about.advisorsTitle || 'Nuestros Guías & Equipo' }}
          </h2>
          <p class="lead fw-medium max-w-700 mx-auto" style="font-size: 1.15rem; color: #4C4C4C !important;">
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
              <div class="p-4 flex-grow-1 d-flex flex-column justify-content-between">
                <p class="font-sans fw-medium lh-lg mb-0" style="font-size: 0.95rem; color: #4C4C4C !important;">
                  {{ adv.bio }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 10. Opiniones y Social Proof -->
    <section id="opiniones" class="py-5" style="background-color: #FFFFFF;">
      <div class="container py-5" style="max-width: 1100px;">
        
        <div class="text-center mb-5">
          <div class="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-3" style="background: rgba(20, 126, 121, 0.08); border: 1px solid rgba(20, 126, 121, 0.2);">
            <i class="bi bi-star-fill" style="color: #147E79;"></i>
            <span class="small text-uppercase fw-bold" style="letter-spacing: 0.1em; font-size: 0.75rem; color: #147E79;">Testimonios Verificados</span>
          </div>
          <h2 class="display-5 font-sans fw-bold mb-3" style="color: #147E79;">{{ contentStore.content.home.reviews.title }}</h2>
          <p class="lead fw-medium max-w-700 mx-auto" style="font-size: 1.15rem; color: #4C4C4C !important;">
            {{ contentStore.content.home.reviews.description }}
          </p>
        </div>

        <!-- Elfsight TripAdvisor Reviews Widget -->
        <div v-if="contentStore.content.home.reviews.elfsightWidgetId" class="elfsight-widget-wrapper mb-4">
          <div :key="contentStore.content.home.reviews.elfsightWidgetId" :class="'elfsight-app-' + contentStore.content.home.reviews.elfsightWidgetId" data-elfsight-app-lazy></div>
        </div>
        <!-- Fallback Custom TripAdvisor Carousel -->
        <ReviewsCarousel v-else />
      </div>
    </section>

    <!-- 11. Formulario Oficial de Reserva en 4 Pasos + WhatsApp -->
    <HomeBookingForm />

    <!-- MODAL FLOTANTE DE COMPRA DIRECTO EN INICIO -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="selectedExperience" class="custom-modal-backdrop" @click="closeModal">
          <div class="custom-modal-content" @click.stop>
            <button class="modal-close-btn" @click="closeModal" aria-label="Cerrar modal">
              <i class="bi bi-x-lg"></i>
            </button>

            <div class="row g-0 modal-main-row">
              <!-- COLUMNA IZQUIERDA: INFORMACIÓN -->
              <div class="col-lg-7 custom-modal-info p-4 p-md-5 custom-scrollbar" style="background-color: #FFFFFF !important; color: #045D56 !important;">
                
                <!-- Galería -->
                <div class="modal-gallery mb-4">
                  <div class="row g-2">
                    <div class="col-12">
                      <img :src="selectedExperience.coverImage.url" class="w-100 rounded-4 object-fit-cover shadow-sm" width="800" height="280" style="height: 280px;" alt="Principal">
                    </div>
                    <div class="col-6 col-sm-4" v-for="(img, idx) in selectedExperience.gallery" :key="idx">
                      <img :src="img.url" class="w-100 rounded-3 object-fit-cover shadow-sm" width="300" height="110" loading="lazy" style="height: 110px;" :alt="img.alt">
                    </div>
                  </div>
                </div>

                <div class="d-flex align-items-center gap-2 mb-2">
                  <span class="badge px-3 py-2 rounded-pill font-sans text-uppercase tracking-wide fw-bold" style="background-color: #045D56; color: #2DD4BF; font-size: 0.75rem;">
                    {{ selectedExperience.categories ? selectedExperience.categories[0] : 'EXPERIENCIA' }}
                  </span>
                  <span class="small ms-2 fw-semibold" style="color: #045D56 !important;"><i class="bi bi-clock me-1 text-accent"></i> {{ selectedExperience.duration.value }} {{ selectedExperience.duration.unit === 'hours' ? 'horas' : 'días' }}</span>
                  <span class="small ms-2 fw-semibold" style="color: #045D56 !important;"><i class="bi bi-bar-chart-fill me-1 text-accent"></i> {{ formatDifficulty(selectedExperience.difficulty) }}</span>
                </div>
                
                <h2 class="font-brush fw-bold display-5 mb-2 mt-2" style="color: #045D56 !important; font-family: 'Caveat', cursive !important;">{{ selectedExperience.title }}</h2>
                <p class="lead mb-3 fw-semibold" style="color: #033E3B !important; font-size: 1.15rem;">{{ selectedExperience.subtitle }}</p>

                <!-- Acceso Directo de Reserva para Móviles/Tablets Verticales -->
                <div class="d-lg-none mb-4 p-3 rounded-4" style="background-color: #045D56;">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="text-white small">Desde</span>
                    <strong class="text-accent fs-5">{{ formatCurrency(selectedExperience.pricing.basePrice, 'CLP') }} / pax</strong>
                  </div>
                  <a href="#modal-reservation-box" class="btn btn-accent w-100 py-3 fw-bold text-dark-mountain shadow-sm d-flex align-items-center justify-content-center gap-2 text-decoration-none" style="background-color: #2DD4BF !important; color: #022927 !important; border-radius: 12px;">
                    <i class="bi bi-calendar2-check-fill fs-5"></i> Configurar Fecha y Reservar
                  </a>
                </div>

                <div class="mb-4">
                  <h4 class="fw-bold h5 mb-3" style="color: #045D56 !important;">Descripción</h4>
                  <p class="lh-lg fw-medium" style="color: #022C2A !important; font-size: 1rem;">{{ selectedExperience.description }}</p>
                </div>

                <div class="mb-4" v-if="selectedExperience.itinerary && selectedExperience.itinerary.length">
                  <h4 class="fw-bold h5 mb-3" style="color: #045D56 !important;">Itinerario</h4>
                  <div class="itinerary-timeline">
                    <div v-for="(item, idx) in selectedExperience.itinerary" :key="idx" class="itinerary-item">
                      <div class="itinerary-time fw-bold" style="color: #0FA095 !important;">{{ item.dayOrTime }}</div>
                      <div class="itinerary-content pb-3">
                        <h5 class="fw-bold h6 mb-1" style="color: #045D56 !important;">{{ item.title }}</h5>
                        <p class="small mb-0 fw-medium" style="color: #022C2A !important;">{{ item.description }}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="row mb-4">
                  <div class="col-md-6">
                    <h4 class="fw-bold h6 mb-3 text-success"><i class="bi bi-check-circle-fill me-2"></i>Qué incluye</h4>
                    <ul class="list-unstyled">
                      <li v-for="(inc, i) in selectedExperience.included" :key="i" class="mb-2 small fw-semibold" style="color: #045D56 !important;">
                        <i class="bi bi-check-circle-fill text-success me-2"></i> {{ inc }}
                      </li>
                    </ul>
                  </div>
                  <div class="col-md-6 mt-3 mt-md-0">
                    <h4 class="fw-bold h6 mb-3 text-danger"><i class="bi bi-x-circle-fill me-2"></i>Qué no incluye</h4>
                    <ul class="list-unstyled">
                      <li v-for="(ninc, i) in selectedExperience.notIncluded" :key="i" class="mb-2 small fw-semibold" style="color: #033E3B !important;">
                        <i class="bi bi-x-circle-fill text-danger me-2"></i> {{ ninc }}
                      </li>
                    </ul>
                  </div>
                </div>

                <div class="pt-3 border-top border-secondary border-opacity-25">
                  <p class="small mb-1 fw-semibold" style="color: #033E3B !important;"><strong>Punto de encuentro:</strong> {{ selectedExperience.meetingPoint || 'Oficina Wamani, Centro de Pucón' }}</p>
                  <p class="small mb-0 fw-semibold" style="color: #033E3B !important;"><strong>Cancelación:</strong> {{ selectedExperience.cancellationPolicy || 'Cancelación gratuita con 48 hrs de anticipación.' }}</p>
                </div>

              </div>

              <!-- COLUMNA DERECHA: SIDEBAR DE RESERVA DIRECTA -->
              <div id="modal-reservation-box" class="col-lg-5 custom-modal-sidebar p-4 p-md-5 d-flex flex-column justify-content-between" style="background-color: #045D56 !important; color: #FFFFFF !important;">
                
                <div>
                  <span class="badge bg-accent text-dark-mountain fw-bold px-3 py-1 mb-2 text-uppercase" style="font-size: 0.72rem; letter-spacing: 0.1em;">
                    Área de Reserva Segura
                  </span>
                  <h3 class="font-brush fw-bold display-6 mb-3 text-white" style="font-family: 'Caveat', cursive !important; color: #FFFFFF !important;">Configura tu Viaje</h3>

                  <!-- CONTROLES DE FECHA Y PASAJEROS -->
                  <div class="p-3 rounded-4 mb-4" style="background-color: #033E3B; border: 1px solid rgba(45, 212, 191, 0.35);">
                    <!-- Selector de Fecha -->
                    <div class="mb-3">
                      <label class="form-label small fw-bold text-white mb-1 d-flex align-items-center" style="color: #FFFFFF !important;">
                        <i class="bi bi-calendar-event me-2 text-accent"></i>Fecha de Excursión
                      </label>
                      <input 
                        v-model="modalDate" 
                        type="date" 
                        :min="todayDate" 
                        class="form-control form-control-sm text-white fw-bold" 
                        style="background-color: #022C2A; border-color: rgba(45, 212, 191, 0.4); color: #FFFFFF !important;"
                        required
                      >
                    </div>

                    <!-- Selector de Pasajeros (+ / -) -->
                    <div>
                      <label class="form-label small fw-bold text-white mb-1 d-flex justify-content-between align-items-center" style="color: #FFFFFF !important;">
                        <span><i class="bi bi-people-fill me-2 text-accent"></i>Número de Pasajeros</span>
                        <span class="badge bg-accent text-dark-mountain fw-bold">{{ modalPax }} {{ modalPax === 1 ? 'persona' : 'personas' }}</span>
                      </label>
                      <div class="d-flex align-items-center gap-2">
                        <button 
                          type="button" 
                          class="btn btn-sm btn-outline-light rounded-circle fw-bold d-flex align-items-center justify-content-center" 
                          style="width: 44px; height: 44px;"
                          @click="decrementPax"
                          :disabled="modalPax <= 1"
                          aria-label="Reducir pasajeros"
                        >
                          <i class="bi bi-dash"></i>
                        </button>
                        <input 
                          v-model.number="modalPax" 
                          type="number" 
                          min="1" 
                          max="20" 
                          class="form-control form-control-sm text-center fw-bold text-white" 
                          style="background-color: #022C2A; border-color: rgba(45, 212, 191, 0.4); max-width: 70px; color: #FFFFFF !important;"
                        >
                        <button 
                          type="button" 
                          class="btn btn-sm btn-outline-light rounded-circle fw-bold d-flex align-items-center justify-content-center" 
                          style="width: 44px; height: 44px;"
                          @click="incrementPax"
                          aria-label="Aumentar pasajeros"
                        >
                          <i class="bi bi-plus"></i>
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- DESGLOSE DE PRECIOS CALCULADOS EN VIVO -->
                  <div class="price-box-card rounded-4 p-4 shadow-sm mb-4" style="background-color: #033E3B; border: 1px solid rgba(45, 212, 191, 0.35);">
                    <div class="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom border-secondary border-opacity-25">
                      <span class="small text-white fw-semibold" style="color: #FFFFFF !important;">Tarifa por persona</span>
                      <span class="fw-bold text-white" style="color: #FFFFFF !important;">{{ formatCurrency(selectedExperience.pricing.basePrice, 'CLP') }}</span>
                    </div>
                    <div class="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom border-secondary border-opacity-25">
                      <span class="small text-white fw-semibold" style="color: #FFFFFF !important;">Cantidad de viajeros</span>
                      <span class="fw-bold text-accent">× {{ modalPax }}</span>
                    </div>
                    
                    <div class="d-flex justify-content-between align-items-end mt-3 mb-2">
                      <div>
                        <span class="d-block text-white small text-uppercase tracking-wide fw-bold" style="font-size: 0.72rem; color: #FFFFFF !important;">Total a Pagar</span>
                        <span class="fw-bold text-white fs-2 lh-1" style="color: #FFFFFF !important;">{{ formatCurrency(totalModalPriceCLP, 'CLP') }}</span>
                      </div>
                      <div class="text-end">
                        <span class="d-block small text-white fw-semibold" style="font-size: 0.78rem; color: #FFFFFF !important;">USD {{ formatCurrency(totalModalPriceUSD, 'USD') }}</span>
                        <span class="d-block small text-accent fw-bold" style="font-size: 0.78rem;">BRL {{ formatCurrency(totalModalPriceBRL, 'BRL') }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- ACCIONES DE COMPRA -->
                <div class="d-flex flex-column gap-3">
                  <button class="btn btn-outline-accent w-100 py-3 fw-bold fs-6 d-flex align-items-center justify-content-center gap-2 shadow-sm bg-transparent" @click="addToCartAction">
                    <i class="bi bi-cart-plus-fill fs-5"></i> Agregar al Carrito
                  </button>
                  <button class="btn btn-cyan-gradient w-100 py-3 fw-bold fs-6 d-flex align-items-center justify-content-center gap-2 shadow" @click="goToWebpay">
                    <i class="bi bi-credit-card-2-front-fill fs-5"></i> Pagar con Webpay Plus
                  </button>
                  <button class="btn btn-whatsapp-custom w-100 py-3 fw-bold fs-6 d-flex align-items-center justify-content-center gap-2 shadow-sm" @click="goToWhatsApp(selectedExperience.title)">
                    <i class="bi bi-whatsapp fs-5"></i> Reservar vía Transferencia / WhatsApp
                  </button>
                  <div class="d-flex align-items-center justify-content-center gap-2 text-white small mt-1 fw-medium" style="color: #FFFFFF !important;">
                    <i class="bi bi-shield-lock-fill text-accent"></i>
                    <span>Transacción protegida por cifrado SSL 256-bit</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.max-w-700 {
  max-width: 700px;
}

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
