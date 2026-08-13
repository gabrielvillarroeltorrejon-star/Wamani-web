<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useContentStore } from '@/shared/stores/contentStore';
import WCard from '@/shared/ui/WCard.vue';
import WButton from '@/shared/ui/WButton.vue';
import type { Experience } from '@/entities/experience/model/schemas';

const router = useRouter();
const contentStore = useContentStore();

// Fecha de hoy mínima
const todayDate = new Date().toISOString().split('T')[0];
const defaultNextDay = new Date(Date.now() + 86400000).toISOString().split('T')[0];

// Buscador
const searchQuery = ref('');
const searchDate = ref('');
const searchPax = ref(2);
const searchDifficulty = ref('');
const searchCity = ref('');

// Ciudades únicas para el selector
const cities = computed(() => {
  const allDestinations = contentStore.experiences.map(e => e.destinationId);
  return [...new Set(allDestinations)];
});

const getCityName = (id: string) => {
  if (id === 'dest-pucon') return 'Pucón';
  if (id === 'dest-panguipulli') return 'Panguipulli';
  return id.replace('dest-', '').replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase());
};

const resetFilters = () => {
  searchQuery.value = '';
  searchDate.value = '';
  searchPax.value = 2;
  searchDifficulty.value = '';
  searchCity.value = '';
};

// Filtrado reactivo
const filteredExperiences = computed(() => {
  return contentStore.experiences.filter(exp => {
    const matchesSearch = searchQuery.value ? (
      exp.title.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
      exp.tags.some(t => t.toLowerCase().includes(searchQuery.value.toLowerCase()))
    ) : true;
    const matchesDiff = searchDifficulty.value ? exp.difficulty === searchDifficulty.value : true;
    const matchesCity = searchCity.value ? exp.destinationId === searchCity.value : true;
    return matchesSearch && matchesDiff && matchesCity;
  });
});

const displayedDestinations = computed(() => {
  if (searchQuery.value || searchDifficulty.value || searchCity.value) {
    return filteredExperiences.value;
  }
  return contentStore.experiences.slice(0, 6);
});

// Modal Detalle y Reserva
const selectedExperience = ref<Experience | null>(null);
const modalDate = ref(defaultNextDay);
const modalPax = ref(2);

const openModal = (exp: Experience) => {
  selectedExperience.value = exp;
  modalDate.value = searchDate.value || defaultNextDay;
  modalPax.value = searchPax.value || 2;
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

const goToWebpay = () => {
  if (!selectedExperience.value) return;
  closeModal();
  router.push({
    path: '/checkout',
    query: {
      slug: selectedExperience.value.slug,
      date: modalDate.value,
      pax: modalPax.value.toString(),
      method: 'webpay'
    }
  });
};
</script>

<template>
  <section id="destinos" class="home-destinations py-5">
    <div class="container py-5">
      
      <!-- ENCABEZADO Y BUSCADOR CENTRADO ESTILO WAMANI DE LUJO -->
      <div class="catalog-header-container text-center mb-5">
        <h2 class="display-4 font-brush text-white fw-bold mb-2" style="font-family: 'Caveat', cursive !important; text-shadow: 0 3px 10px rgba(0,0,0,0.35);">
          Explorar Todas las Experiencias
        </h2>
        <p class="lead text-white fw-medium mb-4" style="font-size: 1.2rem; color: #FFFFFF !important; text-shadow: 0 1px 4px rgba(0,0,0,0.3);">
          Descubre aventuras únicas en los paisajes más imponentes del sur de Chile, define tu fecha y cotiza en vivo
        </p>

        <!-- CONTENEDOR BUSCADOR EN VERDE BOSQUE #045D56 -->
        <div class="search-filter-box mx-auto p-3 p-md-4 rounded-4 shadow-lg">
          <div class="row g-3 align-items-center">
            
            <!-- 1. Input de Búsqueda -->
            <div class="col-12 col-md-4">
              <div class="input-icon-wrapper position-relative">
                <i class="bi bi-search search-icon"></i>
                <input 
                  v-model="searchQuery" 
                  type="search" 
                  class="form-control custom-search-input text-white fw-medium" 
                  placeholder="Tour, volcán o actividad..."
                >
              </div>
            </div>

            <!-- 2. Selector de Fecha de Viaje -->
            <div class="col-12 col-sm-6 col-md-3">
              <div class="input-icon-wrapper position-relative">
                <i class="bi bi-calendar3 select-icon"></i>
                <input 
                  v-model="searchDate" 
                  type="date" 
                  :min="todayDate" 
                  class="form-control custom-select-input text-white fw-medium" 
                  title="Fecha estimada de excursión"
                >
              </div>
            </div>

            <!-- 3. Selector de Pasajeros -->
            <div class="col-12 col-sm-6 col-md-2">
              <div class="input-icon-wrapper position-relative">
                <i class="bi bi-people-fill select-icon"></i>
                <select v-model="searchPax" class="form-select custom-select-input text-white fw-medium">
                  <option :value="1">1 Persona</option>
                  <option :value="2">2 Personas</option>
                  <option :value="3">3 Personas</option>
                  <option :value="4">4 Personas</option>
                  <option :value="5">5 Personas</option>
                  <option :value="6">6 Personas</option>
                  <option :value="8">8 Personas</option>
                  <option :value="10">10+ Grupo</option>
                </select>
              </div>
            </div>

            <!-- 4. Selector de Ciudad -->
            <div class="col-12 col-sm-6" :class="searchQuery || searchCity || searchDifficulty || searchDate ? 'col-md-2' : 'col-md-3'">
              <div class="input-icon-wrapper position-relative">
                <i class="bi bi-geo-alt-fill select-icon"></i>
                <select v-model="searchCity" class="form-select custom-select-input text-white fw-medium">
                  <option value="">Destinos</option>
                  <option v-for="city in cities" :key="city" :value="city">{{ getCityName(city) }}</option>
                </select>
              </div>
            </div>

            <!-- Botón Limpiar Filtros -->
            <div class="col-12 col-md-1 d-flex align-items-center justify-content-center" v-if="searchQuery || searchCity || searchDifficulty || searchDate">
              <button 
                class="btn btn-outline-light btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center fw-bold" 
                @click="resetFilters" 
                title="Limpiar filtros"
                style="width: 42px; height: 42px;"
              >
                <i class="bi bi-x-lg"></i>
              </button>
            </div>

          </div>

          <!-- Contador de Resultados & Configuración de Viaje -->
          <div class="d-flex flex-wrap justify-content-between align-items-center mt-3 pt-3 border-top border-light border-opacity-25 px-1 gap-2">
            <span class="small text-white fw-semibold">
              <i class="bi bi-compass me-1 text-accent" style="color: #2DD4BF !important;"></i> Mostrando <strong class="text-white fw-bold">{{ filteredExperiences.length }}</strong> experiencias disponibles
            </span>
            <div class="d-flex align-items-center gap-2">
              <span class="badge bg-dark bg-opacity-75 text-white border border-secondary border-opacity-50 small px-3 py-1 fw-bold">
                <i class="bi bi-person-fill text-accent me-1"></i> Cotizando para <strong class="text-white">{{ searchPax }} {{ searchPax === 1 ? 'persona' : 'personas' }}</strong>
              </span>
              <span v-if="searchDate" class="badge bg-dark bg-opacity-75 text-accent border border-secondary border-opacity-50 small px-3 py-1 fw-bold">
                <i class="bi bi-calendar-event me-1"></i> {{ searchDate }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-4">
        <div v-for="exp in displayedDestinations" :key="exp.id" class="col-12 col-md-6 col-lg-4">
          <WCard no-padding class="h-100 cursor-pointer catalog-card border-0" @click="openModal(exp)">
            <div class="position-relative overflow-hidden">
              <img :src="exp.coverImage.url" :alt="exp.coverImage.alt" class="w-100 object-fit-cover transition-transform" style="height: 220px;">
              <div class="card-image-overlay"></div>
              <span class="badge bg-dark bg-opacity-85 text-accent position-absolute top-0 start-0 m-3 px-3 py-2 text-uppercase tracking-wide fw-bold border border-secondary border-opacity-40" style="font-size: 0.72rem; color: #2DD4BF !important;">
                <i class="bi bi-geo-alt-fill me-1"></i>{{ exp.destinationId }}
              </span>
            </div>
            <div class="p-4 d-flex flex-column flex-grow-1 justify-content-between">
              <div>
                <p class="small text-accent mb-1 text-uppercase fw-bold" style="color: #2DD4BF !important; font-size: 0.78rem; letter-spacing: 0.08em;">{{ exp.tags ? exp.tags[0] : 'EXPERIENCIA' }}</p>
                <h3 class="h5 font-brush fw-bold mb-2 text-white" style="font-size: 1.65rem; color: #FFFFFF !important; text-shadow: 0 1px 3px rgba(0,0,0,0.4);">{{ exp.title }}</h3>
                <p class="small mb-3 text-truncate fw-medium" style="color: #FFFFFF !important; font-size: 0.88rem; opacity: 1;">{{ exp.summary }}</p>
              </div>
              
              <div class="mt-auto pt-3 border-top border-light border-opacity-25 d-flex justify-content-between align-items-center">
                <div>
                  <span class="small d-block fw-semibold" style="font-size: 0.8rem; color: #FFFFFF !important;">{{ searchPax > 1 ? `Total (${searchPax} pax)` : 'Por persona' }}</span>
                  <span class="fw-bold text-accent fs-5" style="color: #2DD4BF !important;">{{ formatCurrency((exp.pricing ? exp.pricing.basePrice : 50000) * searchPax, 'CLP') }}</span>
                </div>
                <WButton variant="primary" size="sm" class="px-3 py-2 btn-cyan-gradient fw-bold">Ver y Reservar</WButton>
              </div>
            </div>
          </WCard>
        </div>
      </div>
      
      <div class="text-center mt-5">
        <router-link to="/experiencias" class="btn btn-outline-dark rounded-pill px-5 py-3 fw-bold text-uppercase" style="letter-spacing: 0.1em; background-color: #045D56; color: #FFFFFF; border-color: rgba(45,212,191,0.5);">
          Ver Todo El Portafolio
        </router-link>
      </div>
      
    </div>
  </section>

  <!-- MODAL FLOTANTE DE COMPRA DIRECTO EN INICIO -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="selectedExperience" class="custom-modal-backdrop" @click="closeModal">
        <div class="custom-modal-content" @click.stop>
          <button class="modal-close-btn" @click="closeModal" aria-label="Cerrar modal">
            <i class="bi bi-x-lg"></i>
          </button>

          <div class="row g-0 h-100">
            <!-- COLUMNA IZQUIERDA: INFORMACIÓN -->
            <div class="col-lg-7 custom-modal-info p-4 p-md-5 overflow-auto custom-scrollbar" style="background-color: #FFFFFF !important; color: #045D56 !important;">
              
              <!-- Galería -->
              <div class="modal-gallery mb-4">
                <div class="row g-2">
                  <div class="col-12">
                    <img :src="selectedExperience.coverImage.url" class="w-100 rounded-4 object-fit-cover shadow-sm" style="height: 280px;" alt="Principal">
                  </div>
                  <div class="col-6 col-sm-4" v-for="(img, idx) in selectedExperience.gallery" :key="idx">
                    <img :src="img.url" class="w-100 rounded-3 object-fit-cover shadow-sm" style="height: 110px;" :alt="img.alt">
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
              <p class="lead mb-4 fw-semibold" style="color: #033E3B !important; font-size: 1.15rem;">{{ selectedExperience.subtitle }}</p>

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
            <div class="col-lg-5 custom-modal-sidebar p-4 p-md-5 d-flex flex-column justify-content-between" style="background-color: #045D56 !important; color: #FFFFFF !important;">
              
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
                        style="width: 36px; height: 36px;"
                        @click="decrementPax"
                        :disabled="modalPax <= 1"
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
                        style="width: 36px; height: 36px;"
                        @click="incrementPax"
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
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables';

.max-w-700 {
  max-width: 700px;
}

.card-image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, transparent 50%, rgba(26, 26, 26, 0.4) 100%);
  transition: all 0.4s ease;
  pointer-events: none;
  z-index: 1;
}

// Grid Tarjetas Catalog
.catalog-card {
  background-color: #045D56 !important; /* Verde bosque profundo Wamani */
  border-radius: $border-radius-lg !important; /* Usar border-radius unificado de 20px */
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  color: #ffffff;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
    
    .transition-transform {
      transform: scale(1.05);
    }
    
    .card-image-overlay {
      background: linear-gradient(to bottom, rgba(26, 26, 26, 0.1) 0%, rgba($primary, 0.75) 100%);
    }
  }
  
  .transition-transform {
    transition: transform 0.5s ease;
  }
  
  /* Ajustar textos internos para alto contraste en fondo oscuro */
  h3, .h5 {
    color: #ffffff !important;
  }
  
  .text-muted, p:not(.text-accent) {
    color: #BCE2E0 !important; /* Verde agua claro, súper legible */
  }
  
  .text-accent {
    color: #2DD4BF !important; /* Acento verde agua brillante */
  }
  
  .border-top {
    border-top-color: rgba(255, 255, 255, 0.1) !important;
  }
  
  .text-dark {
    color: #ffffff !important; /* El precio cambia a blanco */
  }
}

// Modal Flotante
.custom-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  z-index: 1050;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  
  @media (min-width: 768px) {
    padding: 2rem;
  }
}

.custom-modal-content {
  background: #F4FAF8;
  width: 100%;
  max-width: 1200px;
  height: 100%;
  max-height: 90vh;
  border-radius: 1.5rem;
  position: relative;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0,0,0,0.25);
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-close-btn {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #ffffff;
  border: 2px solid $primary;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: $primary;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transition: all 0.2s ease;
  
  &:hover {
    background: $primary;
    color: #ffffff;
    transform: scale(1.05);
  }
}

.custom-modal-info {
  height: 100%;
}

.custom-modal-sidebar {
  height: 100%;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba($primary, 0.3);
    border-radius: 10px;
  }
}

.custom-scrollbar {
  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba($primary, 0.4);
    border-radius: 10px;
    
    &:hover {
      background: rgba($primary, 0.8);
    }
  }
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
    background: #eee;
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
    }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

</style>
