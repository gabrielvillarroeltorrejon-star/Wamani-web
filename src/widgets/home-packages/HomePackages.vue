<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useContentStore, type TourPackage } from '@/shared/stores/contentStore';
import { useCartStore } from '@/shared/stores/cartStore';

const contentStore = useContentStore();
const cartStore = useCartStore();
const router = useRouter();

// Paquetes activos
const activePackages = computed(() => {
  return contentStore.tourPackages.filter(p => p.isActive);
});

const totalPackages = computed(() => activePackages.value.length);

// 3D Coverflow State
const currentIndex = ref(0);
const isHovered = ref(false);
let autoPlayTimer: ReturnType<typeof setInterval> | null = null;

// Touch Swipe State
let touchStartX = 0;
let touchEndX = 0;

const activePackage = computed(() => {
  if (!activePackages.value.length) return null;
  return activePackages.value[currentIndex.value] || activePackages.value[0];
});

const nextSlide = () => {
  if (totalPackages.value === 0) return;
  currentIndex.value = (currentIndex.value + 1) % totalPackages.value;
};

const prevSlide = () => {
  if (totalPackages.value === 0) return;
  currentIndex.value = (currentIndex.value - 1 + totalPackages.value) % totalPackages.value;
};

const goToSlide = (index: number) => {
  currentIndex.value = index;
};

const handleCardClick = (index: number, pkg: TourPackage) => {
  if (currentIndex.value === index) {
    // Si ya está activa en el centro, abrir modal de detalles
    openPackageModal(pkg);
  } else {
    // Si es lateral, traer al centro con animación 3D
    goToSlide(index);
  }
};

// Touch Handlers
const onTouchStart = (e: TouchEvent) => {
  touchStartX = e.touches[0].clientX;
  isHovered.value = true;
};

const onTouchMove = (e: TouchEvent) => {
  touchEndX = e.touches[0].clientX;
};

const onTouchEnd = () => {
  isHovered.value = false;
  const swipeDistance = touchEndX - touchStartX;
  if (Math.abs(swipeDistance) > 35) {
    if (swipeDistance > 0) {
      prevSlide();
    } else {
      nextSlide();
    }
  }
  touchStartX = 0;
  touchEndX = 0;
};

// Helper para calcular posición y transformaciones 3D idénticas a Tours Destacados
const getCardStyle = (index: number) => {
  const total = totalPackages.value;
  if (total === 0) return {};

  if (total === 1) {
    return {
      transform: 'translateX(0px) translateZ(100px) rotateY(0deg) scale(1.08)',
      zIndex: 10,
      opacity: 1,
      filter: 'brightness(1)',
      cursor: 'pointer',
      visibility: 'visible' as const
    };
  }

  if (total === 2) {
    if (index === currentIndex.value) {
      return {
        transform: 'translateX(0px) translateZ(100px) rotateY(0deg) scale(1.08)',
        zIndex: 10,
        opacity: 1,
        filter: 'brightness(1)',
        cursor: 'pointer',
        visibility: 'visible' as const
      };
    } else {
      return {
        transform: 'translateX(clamp(140px, 25vw, 300px)) translateZ(-40px) rotateY(-32deg) scale(0.9)',
        zIndex: 8,
        opacity: 0.85,
        filter: 'brightness(0.72)',
        cursor: 'pointer',
        visibility: 'visible' as const
      };
    }
  }

  let diff = (index - currentIndex.value) % total;
  if (diff > total / 2) diff -= total;
  if (diff < -total / 2) diff += total;

  if (diff === 0) {
    // Centro Activo
    return {
      transform: 'translateX(0px) translateZ(100px) rotateY(0deg) scale(1.08)',
      zIndex: 10,
      opacity: 1,
      filter: 'brightness(1)',
      cursor: 'pointer',
      visibility: 'visible' as const
    };
  } else if (diff === 1) {
    // Inmediata Derecha
    return {
      transform: 'translateX(clamp(140px, 25vw, 300px)) translateZ(-40px) rotateY(-36deg) scale(0.88)',
      zIndex: 8,
      opacity: 0.85,
      filter: 'brightness(0.68)',
      cursor: 'pointer',
      visibility: 'visible' as const
    };
  } else if (diff === -1) {
    // Inmediata Izquierda
    return {
      transform: 'translateX(clamp(-300px, -25vw, -140px)) translateZ(-40px) rotateY(36deg) scale(0.88)',
      zIndex: 8,
      opacity: 0.85,
      filter: 'brightness(0.68)',
      cursor: 'pointer',
      visibility: 'visible' as const
    };
  } else if (diff === 2) {
    // Extrema Derecha
    return {
      transform: 'translateX(clamp(250px, 45vw, 550px)) translateZ(-140px) rotateY(-46deg) scale(0.72)',
      zIndex: 6,
      opacity: 0.55,
      filter: 'brightness(0.45)',
      cursor: 'pointer',
      visibility: 'visible' as const
    };
  } else if (diff === -2) {
    // Extrema Izquierda
    return {
      transform: 'translateX(clamp(-550px, -45vw, -250px)) translateZ(-140px) rotateY(46deg) scale(0.72)',
      zIndex: 6,
      opacity: 0.55,
      filter: 'brightness(0.45)',
      cursor: 'pointer',
      visibility: 'visible' as const
    };
  } else {
    // Ocultas fuera de vista
    const direction = diff > 0 ? 1 : -1;
    return {
      transform: `translateX(${direction * 700}px) translateZ(-250px) scale(0.5)`,
      zIndex: 1,
      opacity: 0,
      pointerEvents: 'none' as const,
      visibility: 'hidden' as const
    };
  }
};

const startAutoPlay = () => {
  stopAutoPlay();
  autoPlayTimer = setInterval(() => {
    if (!isHovered.value) {
      nextSlide();
    }
  }, 4000);
};

const stopAutoPlay = () => {
  if (autoPlayTimer) {
    clearInterval(autoPlayTimer);
    autoPlayTimer = null;
  }
};

onMounted(() => {
  startAutoPlay();
});

onUnmounted(() => {
  stopAutoPlay();
});

// Helper para obtener tour completo por ID
const getTourById = (tourId: string) => {
  return contentStore.experiences.find(e => e.id === tourId || e.slug === tourId);
};

const formatCurrency = (val: number, currency = 'CLP') => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(val);
};

// Modal State y Acciones
const selectedPackage = ref<TourPackage | null>(null);
const modalDate = ref(new Date().toISOString().split('T')[0]);
const todayDate = new Date().toISOString().split('T')[0];
const modalPax = ref(1);

const openPackageModal = (pkg: TourPackage) => {
  selectedPackage.value = pkg;
  modalPax.value = 1;
  modalDate.value = new Date().toISOString().split('T')[0];
  document.body.style.overflow = 'hidden';
};

const closePackageModal = () => {
  selectedPackage.value = null;
  document.body.style.overflow = '';
};

const incrementPax = () => {
  if (modalPax.value < 20) modalPax.value++;
};

const decrementPax = () => {
  if (modalPax.value > 1) modalPax.value--;
};

// Precios calculados
const totalModalPriceCLP = computed(() => {
  if (!selectedPackage.value) return 0;
  return selectedPackage.value.bundlePrice * modalPax.value;
});

const totalOriginalCLP = computed(() => {
  if (!selectedPackage.value) return 0;
  return selectedPackage.value.originalPrice * modalPax.value;
});

const totalSavingsCLP = computed(() => {
  return Math.max(0, totalOriginalCLP.value - totalModalPriceCLP.value);
});

const totalModalPriceUSD = computed(() => totalModalPriceCLP.value * 0.0011);
const totalModalPriceBRL = computed(() => totalModalPriceCLP.value * 0.0055);

const addToCartAction = () => {
  if (!selectedPackage.value) return;
  
  cartStore.addToCart({
    tourId: selectedPackage.value.id,
    tourTitle: selectedPackage.value.title,
    scheduleId: `pkg-${modalDate.value}`,
    scheduleDate: modalDate.value,
    scheduleTime: '08:00',
    tickets: [{
      type: 'adult',
      quantity: modalPax.value,
      unitPrice: selectedPackage.value.bundlePrice
    }]
  });
  
  closePackageModal();
  cartStore.toggleCart();
};

const goToWebpay = () => {
  if (!selectedPackage.value) return;
  const pkg = selectedPackage.value;
  closePackageModal();
  router.push({
    path: '/checkout',
    query: {
      slug: pkg.id,
      date: modalDate.value,
      pax: modalPax.value.toString(),
      method: 'webpay',
      isPackage: 'true'
    }
  });
};

const goToWhatsApp = () => {
  if (!selectedPackage.value) return;
  const pkg = selectedPackage.value;
  const formattedTotal = formatCurrency(totalModalPriceCLP.value, 'CLP');

  // Registrar automáticamente prospecto de paquete en el CRM
  contentStore.addBooking({
    customerName: 'Prospecto Paquete (WhatsApp)',
    customerEmail: 'contacto@whatsapp.com',
    customerPhone: '+' + (contentStore.content.contact.whatsappNumber || '56985673376'),
    experienceTitle: pkg.title,
    bookingDate: modalDate.value,
    pax: modalPax.value,
    totalPrice: totalModalPriceCLP.value,
    status: 'pending',
    source: 'whatsapp',
    paymentMethod: 'whatsapp',
    buyOrder: `WAP-${Date.now().toString().slice(-6)}`,
    notes: `Prospecto de paquete multitour vía WhatsApp: ${pkg.title} (${modalPax.value} pax)`,
    passengers: []
  });

  const toursList = pkg.includedTourIds.map((id, idx) => {
    const t = getTourById(id);
    return `   ${idx + 1}. ${t ? t.title : id}`;
  }).join('\n');

  const msg = encodeURIComponent(
    `Hola Wamani Experience, deseo reservar el paquete promocional:\n*${pkg.title}*\n\n` +
    `🎁 *Tours incluidos:*\n${toursList}\n\n` +
    `📅 Fecha de inicio deseada: *${modalDate.value}*\n` +
    `👥 Pasajeros: *${modalPax.value} personas*\n` +
    `💰 Monto Total Estimado: *${formattedTotal}*\n\n` +
    `¿Me podrían confirmar disponibilidad para coordinar las fechas de las excursiones? ¡Muchas gracias!`
  );
  const wa = contentStore.content.contact.whatsappNumber || '56985673376';
  window.open(`https://wa.me/${wa}?text=${msg}`, '_blank');
};
</script>

<template>
  <section v-if="activePackages.length > 0" id="paquetes" class="packages-3d-section py-5 px-2 px-md-4">
    <div class="container-fluid px-lg-4">
      
      <!-- CONTENEDOR COVERFLOW 3D EN MARCO VERDE OSCURO (IDÉNTICO A TOURS DESTACADOS) -->
      <div 
        class="coverflow-3d-wrapper position-relative"
        @mouseenter="isHovered = true"
        @mouseleave="isHovered = false"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
      >
        <!-- Fondo Ambiental Difuminado Dinámico -->
        <div class="coverflow-ambient-bg" v-if="activePackage">
          <img 
            :src="activePackage.imageUrl" 
            :alt="activePackage.title"
            class="ambient-img"
          >
          <div class="ambient-overlay"></div>
        </div>

        <!-- TÍTULO INTEGRADO DENTRO DEL MARCO -->
        <div class="coverflow-header text-center mb-2 z-3 position-relative">
          <span class="badge bg-accent text-dark-mountain fw-bold px-3 py-1 mb-2 text-uppercase" style="font-size: 0.75rem; letter-spacing: 0.12em;">
            <i class="bi bi-stars me-1"></i> Ofertas Especiales
          </span>
          <h2 class="coverflow-section-title font-brush display-3 text-white mb-1" style="font-family: 'Caveat', cursive !important; text-shadow: 0 3px 12px rgba(0,0,0,0.85);">
            Paquetes & Combos de Expedición
          </h2>
          <p class="text-white fw-semibold small mb-0 font-sans" style="color: #FFFFFF !important; font-size: 0.95rem; text-shadow: 0 2px 6px rgba(0,0,0,0.85);">
            Combina múltiples experiencias guiadas y disfruta de tarifas preferenciales exclusivas en el sur de Chile
          </p>
        </div>

        <!-- Escenario 3D Central con Despliegue Sincronizado -->
        <div class="coverflow-stage">
          <div 
            v-for="(pkg, idx) in activePackages" 
            :key="pkg.id"
            class="coverflow-card"
            :style="getCardStyle(idx)"
            @click="handleCardClick(idx, pkg)"
          >
            <!-- Badge Superior -->
            <div class="position-absolute top-0 start-0 m-3 z-3 d-flex flex-wrap gap-2">
              <span v-if="pkg.badgeText" class="badge bg-accent text-dark-mountain px-3 py-2 fw-bold text-uppercase rounded-pill shadow-sm" style="font-size: 0.72rem; letter-spacing: 0.08em;">
                <i class="bi bi-tag-fill me-1"></i> {{ pkg.badgeText }}
              </span>
              <span class="badge bg-dark bg-opacity-75 text-white px-2 py-1 fw-semibold rounded-pill border border-secondary border-opacity-25 shadow-sm" style="font-size: 0.7rem;">
                {{ pkg.includedTourIds.length }} Tours
              </span>
            </div>

            <!-- Imagen de Portada -->
            <img 
              :src="pkg.imageUrl" 
              :alt="pkg.title"
              class="coverflow-card-img"
              loading="lazy"
            >

            <!-- Contenido y Textos Inferiores -->
            <div class="coverflow-info">
              <h3 class="coverflow-title font-brush">{{ pkg.title }}</h3>
              
              <!-- Tours Incluidos Mini Resumen -->
              <div class="included-mini-list mb-2 text-white opacity-90 small">
                <div 
                  v-for="tId in pkg.includedTourIds.slice(0, 2)" 
                  :key="tId"
                  class="d-flex align-items-center gap-1 text-truncate"
                  style="font-size: 0.78rem;"
                >
                  <i class="bi bi-check2 text-accent"></i>
                  <span class="text-truncate">{{ getTourById(tId)?.title || tId }}</span>
                </div>
              </div>

              <!-- Precios y Llamado a la Acción -->
              <div class="d-flex justify-content-between align-items-end pt-2 border-top border-secondary border-opacity-25">
                <div>
                  <span class="text-decoration-line-through text-white opacity-50 small d-block" style="font-size: 0.75rem;">
                    {{ formatCurrency(pkg.originalPrice) }}
                  </span>
                  <div class="d-flex align-items-baseline gap-1">
                    <span class="fs-4 fw-bold text-accent lh-1">{{ formatCurrency(pkg.bundlePrice) }}</span>
                    <span class="text-white opacity-75 small" style="font-size: 0.75rem;">p/p</span>
                  </div>
                </div>
                
                <span class="btn btn-sm btn-accent text-dark-mountain fw-bold rounded-pill px-3 py-1 shadow-sm" style="font-size: 0.72rem;">
                  Ver Combo <i class="bi bi-arrow-right ms-1"></i>
                </span>
              </div>
            </div>

            <!-- Borde sutil de brillo -->
            <div class="coverflow-glow-border"></div>
          </div>
        </div>

        <!-- Flechas Circulares de Navegación (< y >) -->
        <button 
          class="coverflow-nav-btn prev-btn" 
          @click.stop="prevSlide" 
          aria-label="Paquete anterior"
        >
          <i class="bi bi-chevron-left"></i>
        </button>
        
        <button 
          class="coverflow-nav-btn next-btn" 
          @click.stop="nextSlide" 
          aria-label="Siguiente paquete"
        >
          <i class="bi bi-chevron-right"></i>
        </button>

        <!-- Indicadores de Puntos Inferiores -->
        <div class="coverflow-indicators d-flex justify-content-center gap-2 mt-2 z-3">
          <button 
            v-for="(_, index) in activePackages" 
            :key="`dot-${index}`"
            class="coverflow-dot"
            :class="{ active: index === currentIndex }"
            @click="goToSlide(index)"
            :aria-label="`Ir a paquete ${index + 1}`"
          ></button>
        </div>
      </div>
    </div>

    <!-- MODAL DETALLADO DE PAQUETE (TELEPORT AL BODY) -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="selectedPackage" class="custom-modal-backdrop" @click="closePackageModal">
          <div class="custom-modal-content" @click.stop>
            
            <!-- BOTÓN CERRAR -->
            <button class="modal-close-btn" @click="closePackageModal" aria-label="Cerrar ventana">
              <i class="bi bi-x-lg"></i>
            </button>

            <div class="row g-0 modal-main-row">
              
              <!-- COLUMNA IZQUIERDA: DETALLES DE LOS TOURS INCLUIDOS -->
              <div class="col-lg-7 custom-modal-info p-4 p-md-5 custom-scrollbar" style="background-color: #FFFFFF !important; color: #045D56 !important;">
                
                <!-- Encabezado del Paquete -->
                <div class="mb-4">
                  <div class="d-flex flex-wrap gap-2 mb-2">
                    <span v-if="selectedPackage.badgeText" class="badge bg-accent text-dark-mountain fw-bold px-3 py-1 text-uppercase" style="font-size: 0.72rem; letter-spacing: 0.1em;">
                      {{ selectedPackage.badgeText }}
                    </span>
                    <span class="badge bg-dark-mountain text-white fw-bold px-3 py-1 text-uppercase" style="font-size: 0.72rem;">
                      Combo Multitour
                    </span>
                  </div>
                  <h2 class="display-6 fw-bold mb-2" style="color: #033E3B !important;">{{ selectedPackage.title }}</h2>
                  <p class="lead fw-normal text-muted mb-3" style="font-size: 1.05rem;">{{ selectedPackage.description }}</p>

                  <!-- BANNER DE AHORRO DESTACADO -->
                  <div class="p-3 rounded-4 d-flex align-items-center gap-3 mb-4" style="background: rgba(45, 212, 191, 0.15); border: 1px solid rgba(4, 93, 86, 0.2);">
                    <i class="bi bi-piggy-bank-fill fs-2 text-dark-mountain"></i>
                    <div>
                      <div class="fw-bold text-dark-mountain mb-0">¡Ahorras {{ formatCurrency(totalSavingsCLP) }} en total!</div>
                      <div class="small text-muted">Tarifa combinada preferencial para {{ modalPax }} {{ modalPax === 1 ? 'persona' : 'personas' }}.</div>
                    </div>
                  </div>
                </div>

                <!-- LISTA DETALLADA DE TOURS INCLUIDOS -->
                <h4 class="h5 fw-bold mb-3 d-flex align-items-center" style="color: #045D56 !important;">
                  <i class="bi bi-card-checklist me-2 text-accent"></i>
                  Detalle de los {{ selectedPackage.includedTourIds.length }} Tours Incluidos:
                </h4>

                <div class="d-flex flex-column gap-3 mb-4">
                  <div 
                    v-for="(tourId, idx) in selectedPackage.includedTourIds" 
                    :key="tourId"
                    class="p-3 rounded-4 border d-flex flex-column flex-sm-row gap-3 align-items-start transition-all"
                    style="border-color: rgba(4, 93, 86, 0.15) !important; background: #FAFAFA;"
                  >
                    <!-- Miniatura del Tour -->
                    <div class="flex-shrink-0 rounded-3 overflow-hidden" style="width: 100px; height: 80px;">
                      <img 
                        :src="getTourById(tourId)?.coverImage?.url || selectedPackage.imageUrl" 
                        :alt="getTourById(tourId)?.title || tourId"
                        class="w-100 h-100 object-fit-cover"
                      >
                    </div>

                    <!-- Datos del Tour -->
                    <div class="flex-grow-1">
                      <div class="d-flex justify-content-between align-items-start mb-1">
                        <span class="badge bg-secondary bg-opacity-10 text-dark-mountain fw-bold px-2 py-0 small" style="font-size: 0.68rem;">
                          Tour #{{ idx + 1 }}
                        </span>
                        <span class="fw-bold small text-dark-mountain">
                          Valor regular: {{ formatCurrency(getTourById(tourId)?.pricing.basePrice || 0) }}
                        </span>
                      </div>
                      <h5 class="h6 fw-bold mb-1" style="color: #033E3B !important;">
                        {{ getTourById(tourId)?.title || tourId }}
                      </h5>
                      <p class="small text-muted mb-2 line-clamp-2" style="font-size: 0.82rem;">
                        {{ getTourById(tourId)?.summary || getTourById(tourId)?.description || 'Experiencia guiada con traslados y equipamiento.' }}
                      </p>

                      <!-- Tags del tour -->
                      <div class="d-flex flex-wrap gap-2">
                        <span v-if="getTourById(tourId)?.duration" class="badge bg-light text-dark-mountain border px-2 py-1" style="font-size: 0.68rem;">
                          <i class="bi bi-clock me-1 text-accent"></i>{{ getTourById(tourId)?.duration.value }} {{ getTourById(tourId)?.duration.unit === 'hours' ? 'horas' : 'días' }}
                        </span>
                        <span v-if="getTourById(tourId)?.difficulty" class="badge bg-light text-dark-mountain border px-2 py-1" style="font-size: 0.68rem;">
                          <i class="bi bi-activity me-1 text-accent"></i>Dificultad: {{ getTourById(tourId)?.difficulty }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Garantías y Beneficios -->
                <div class="p-3 rounded-4" style="background: rgba(4, 93, 86, 0.05);">
                  <div class="row g-2 text-dark-mountain small">
                    <div class="col-sm-6 d-flex align-items-center gap-2">
                      <i class="bi bi-shield-check text-success fs-5"></i>
                      <span><strong>Fechas Flexibles:</strong> Coordina los días de cada tour con tu asesor.</span>
                    </div>
                    <div class="col-sm-6 d-flex align-items-center gap-2">
                      <i class="bi bi-calendar-check text-success fs-5"></i>
                      <span><strong>Vigencia 6 meses:</strong> Tienes hasta medio año para completar los tours.</span>
                    </div>
                  </div>
                </div>

              </div>

              <!-- COLUMNA DERECHA: SIDEBAR DE RESERVA DIRECTA -->
              <div class="col-lg-5 custom-modal-sidebar p-4 p-md-5 d-flex flex-column justify-content-between" style="background-color: #045D56 !important; color: #FFFFFF !important;">
                
                <div>
                  <span class="badge bg-accent text-dark-mountain fw-bold px-3 py-1 mb-2 text-uppercase" style="font-size: 0.72rem; letter-spacing: 0.1em;">
                    Reserva de Paquete
                  </span>
                  <h3 class="font-brush fw-bold display-6 mb-3 text-white" style="font-family: 'Caveat', cursive !important; color: #FFFFFF !important;">Configura tu Viaje</h3>

                  <!-- CONTROLES DE FECHA Y PASAJEROS -->
                  <div class="p-3 rounded-4 mb-4" style="background-color: #033E3B; border: 1px solid rgba(45, 212, 191, 0.35);">
                    <!-- Selector de Fecha inicial -->
                    <div class="mb-3">
                      <label class="form-label small fw-bold text-white mb-1 d-flex align-items-center" style="color: #FFFFFF !important;">
                        <i class="bi bi-calendar-event me-2 text-accent"></i>Fecha Estimada de Inicio
                      </label>
                      <input 
                        v-model="modalDate" 
                        type="date" 
                        :min="todayDate" 
                        class="form-control form-control-sm text-white fw-bold" 
                        style="background-color: #022C2A; border-color: rgba(45, 212, 191, 0.4); color: #FFFFFF !important;"
                        required
                      >
                      <span class="small opacity-75 d-block mt-1" style="font-size: 0.72rem;">* La fecha exacta de cada excursión la coordinamos contigo según el clima.</span>
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
                      <span class="small text-white fw-semibold">Tarifa Combo por persona</span>
                      <span class="fw-bold text-white">{{ formatCurrency(selectedPackage.bundlePrice, 'CLP') }}</span>
                    </div>
                    <div class="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom border-secondary border-opacity-25">
                      <span class="small text-white fw-semibold">Cantidad de viajeros</span>
                      <span class="fw-bold text-accent">× {{ modalPax }}</span>
                    </div>
                    <div class="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom border-secondary border-opacity-25">
                      <span class="small text-white opacity-75">Ahorro total combo</span>
                      <span class="badge bg-success text-white fw-bold">- {{ formatCurrency(totalSavingsCLP, 'CLP') }}</span>
                    </div>
                    
                    <div class="d-flex justify-content-between align-items-end mt-3 mb-2">
                      <div>
                        <span class="d-block text-white small text-uppercase tracking-wide fw-bold" style="font-size: 0.72rem;">Total a Pagar</span>
                        <span class="fw-bold text-white fs-2 lh-1">{{ formatCurrency(totalModalPriceCLP, 'CLP') }}</span>
                      </div>
                      <div class="text-end">
                        <span class="d-block small text-white fw-semibold" style="font-size: 0.78rem;">USD {{ formatCurrency(totalModalPriceUSD, 'USD') }}</span>
                        <span class="d-block small text-accent fw-bold" style="font-size: 0.78rem;">BRL {{ formatCurrency(totalModalPriceBRL, 'BRL') }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- ACCIONES DE COMPRA -->
                <div class="d-flex flex-column gap-3">
                  <button class="btn btn-outline-accent w-100 py-3 fw-bold fs-6 d-flex align-items-center justify-content-center gap-2 shadow-sm bg-transparent" @click="addToCartAction">
                    <i class="bi bi-cart-plus-fill fs-5"></i> Agregar Paquete al Carrito
                  </button>
                  <button class="btn btn-cyan-gradient w-100 py-3 fw-bold fs-6 d-flex align-items-center justify-content-center gap-2 shadow" @click="goToWebpay">
                    <i class="bi bi-credit-card-2-front-fill fs-5"></i> Pagar con Webpay Plus
                  </button>
                  <button class="btn btn-whatsapp-custom w-100 py-3 fw-bold fs-6 d-flex align-items-center justify-content-center gap-2 shadow-sm" @click="goToWhatsApp">
                    <i class="bi bi-whatsapp fs-5"></i> Reservar vía Transferencia / WhatsApp
                  </button>
                  <div class="d-flex align-items-center justify-content-center gap-2 text-white small mt-1 fw-medium">
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
  </section>
</template>

<style scoped lang="scss">
.packages-3d-section {
  background-color: transparent;
}

// Marco 3D Verde Oscuro (Idéntico a Tours Destacados)
.coverflow-3d-wrapper {
  width: 100%;
  min-height: 85vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 3rem 1.5rem 2rem 1.5rem;
  border-radius: 28px;
  overflow: hidden;
  position: relative;
  background: rgba(4, 93, 86, 0.4);
  backdrop-filter: blur(18px);
  border: 1px solid rgba(45, 212, 191, 0.25);
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.35);
  user-select: none;

  @media (max-width: 768px) {
    min-height: 75vh;
    padding: 2rem 0.75rem 1.5rem 0.75rem;
    border-radius: 20px;
  }
}

.coverflow-header {
  .coverflow-section-title {
    font-size: clamp(2.2rem, 4vw, 3.8rem);
    text-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
    letter-spacing: 0.02em;
  }
}

// Fondo Dinámico Suave
.coverflow-ambient-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  overflow: hidden;
  pointer-events: none;

  .ambient-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: blur(45px) brightness(0.4);
    transform: scale(1.2);
    transition: all 0.8s ease;
  }

  .ambient-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at center, rgba(4, 93, 86, 0.35) 0%, rgba(3, 62, 59, 0.9) 100%);
  }
}

// Escenario 3D Central
.coverflow-stage {
  position: relative;
  height: clamp(400px, 56vh, 540px);
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 1400px;
  perspective-origin: 50% 50%;
  transform-style: preserve-3d;
  z-index: 5;
  margin: 1rem 0;

  @media (max-width: 768px) {
    height: 360px;
    margin: 0.5rem 0;
  }
}

// Tarjetas 3D
.coverflow-card {
  position: absolute;
  width: clamp(230px, 25vw, 330px);
  height: clamp(350px, 51vh, 490px);
  border-radius: 20px;
  overflow: hidden;
  background-color: #033E3B;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.6);
  transform-origin: center center;
  transition: transform 0.45s cubic-bezier(0.25, 1, 0.5, 1),
              opacity 0.45s cubic-bezier(0.25, 1, 0.5, 1),
              filter 0.45s cubic-bezier(0.25, 1, 0.5, 1),
              box-shadow 0.45s ease;
  will-change: transform, opacity;
  touch-action: pan-y;

  @media (max-width: 768px) {
    width: clamp(200px, 60vw, 250px);
    height: 340px;
    border-radius: 16px;
  }

  .coverflow-card-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    pointer-events: none;
  }

  // Gradiente y Textos Inferiores
  .coverflow-info {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 3rem 1.75rem 1.75rem 1.75rem;
    background: linear-gradient(
      to top,
      rgba(3, 62, 59, 0.98) 0%,
      rgba(3, 62, 59, 0.8) 50%,
      rgba(3, 62, 59, 0.2) 75%,
      transparent 100%
    );
    z-index: 2;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;

    @media (max-width: 768px) {
      padding: 1.5rem 1rem 1rem 1rem;
    }

    .coverflow-title {
      font-size: clamp(1.4rem, 2vw, 1.9rem);
      line-height: 1.15;
      color: #FFFFFF !important;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.7);
      margin-bottom: 0.4rem;

      @media (max-width: 768px) {
        font-size: 1.3rem;
        margin-bottom: 0.2rem;
      }
    }
  }

  .coverflow-glow-border {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border: 1px solid rgba(45, 212, 191, 0.25);
    border-radius: inherit;
    pointer-events: none;
    transition: border-color 0.4s ease;
  }

  &:hover {
    .coverflow-glow-border {
      border-color: rgba(45, 212, 191, 0.7);
    }
  }
}

// Botones de Navegación (< y >)
.coverflow-nav-btn {
  position: absolute;
  top: 52%;
  transform: translateY(-50%);
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: rgba(3, 62, 59, 0.8);
  border: 1px solid rgba(45, 212, 191, 0.5);
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.35rem;
  z-index: 20;
  cursor: pointer;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);

  &.prev-btn {
    left: 2rem;
  }

  &.next-btn {
    right: 2rem;
  }

  &:hover {
    background: #2DD4BF;
    color: #033E3B;
    border-color: #2DD4BF;
    box-shadow: 0 0 22px rgba(45, 212, 191, 0.85);
    transform: translateY(-50%) scale(1.12);
  }

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    font-size: 1.1rem;

    &.prev-btn { left: 0.5rem; }
    &.next-btn { right: 0.5rem; }
  }
}

// Puntos Indicadores
.coverflow-indicators {
  position: relative;
  z-index: 10;

  .coverflow-dot {
    width: 10px;
    height: 10px;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.25);
    border: none;
    padding: 0;
    cursor: pointer;
    transition: all 0.3s ease;

    &.active {
      width: 36px;
      background: linear-gradient(90deg, #0FA095, #2DD4BF);
      box-shadow: 0 0 12px rgba(45, 212, 191, 0.8);
    }

    &:hover:not(.active) {
      background: rgba(255, 255, 255, 0.5);
    }
  }
}
</style>
