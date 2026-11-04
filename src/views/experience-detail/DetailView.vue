<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useContentStore } from '@/shared/stores/contentStore';
import { useCartStore } from '@/shared/stores/cartStore';
import { formatDestinationName, formatDifficulty, formatCLP, formatLanguages } from '@/shared/lib/formatters';

const route = useRoute();
const router = useRouter();
const contentStore = useContentStore();
const cartStore = useCartStore();

const todayDate = new Date().toISOString().split('T')[0];
const defaultNextDay = new Date(Date.now() + 86400000).toISOString().split('T')[0];

const selectedDate = ref(defaultNextDay);
const paxCount = ref(1);

const copyLinkToast = ref(false);

const experience = computed(() => {
  const slug = route.params.slug as string;
  if (!slug) return contentStore.experiences[0];
  const found = contentStore.experiences.find(e => e.slug === slug || e.id === slug);
  return found || contentStore.experiences[0];
});

const heroBannerBackground = computed(() => {
  const exp = experience.value as any;
  if (exp?.heroBannerUrl) return exp.heroBannerUrl;
  if (typeof exp?.coverImage === 'string') return exp.coverImage;
  if (exp?.coverImage?.url) return exp.coverImage.url;
  return 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1920&q=85';
});

const displayedGuarantees = computed(() => {
  if (experience.value?.guarantees && experience.value.guarantees.length > 0) {
    return experience.value.guarantees;
  }
  return [
    `Prestador SERNATUR: Registro Oficial de Turismo N° ${contentStore.content.legal.sernaturRegistry || '84219'}`,
    'Seguro Incluido: Cobertura de rescate y asistencia en montaña',
    'Garantía Climática: Reprogramación 100% garantizada por clima',
    'Pago Cifrado: Transbank Webpay Plus estándar PCI-DSS'
  ];
});

const shareTour = async () => {
  const url = window.location.href;
  if (navigator.share) {
    try {
      await navigator.share({
        title: `${experience.value?.title} - Wamani Experience`,
        text: `Descubre ${experience.value?.title} en Wamani Experience:`,
        url
      });
      return;
    } catch {
      // Continuar al fallback de clipboard si el usuario cancela o falla
    }
  }

  try {
    await navigator.clipboard.writeText(url);
    copyLinkToast.value = true;
    setTimeout(() => { copyLinkToast.value = false; }, 3000);
  } catch {
    prompt('Copia este enlace directo del tour:', url);
  }
};

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

const formattedUSD = computed(() => `US$ ${Math.round(totalPriceUSD.value)}`);
const formattedBRL = computed(() => `R$ ${Math.round(totalPriceBRL.value)}`);

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
    tourId: experience.value.id,
    tourTitle: experience.value.title,
    scheduleId: `sched-${selectedDate.value}`,
    scheduleDate: selectedDate.value,
    scheduleTime: experience.value.schedule || '08:00',
    tickets: [
      {
        type: 'adult',
        quantity: paxCount.value,
        unitPrice: experience.value.pricing.basePrice
      }
    ]
  });
};

const handleGoToWebpay = () => {
  if (!experience.value) return;
  router.push({
    path: '/checkout',
    query: {
      slug: experience.value.slug,
      date: selectedDate.value,
      pax: paxCount.value.toString(),
      method: 'webpay'
    }
  });
};

const handleBookWhatsApp = () => {
  if (!experience.value) return;

  // Registrar prospecto de venta en el CRM
  contentStore.addBooking({
    customerName: 'Prospecto WhatsApp',
    customerEmail: 'contacto@whatsapp.com',
    customerPhone: '+' + (contentStore.content.contact.whatsappNumber || '56985673376'),
    experienceTitle: experience.value.title,
    bookingDate: selectedDate.value,
    pax: paxCount.value,
    totalPrice: totalPriceCLP.value,
    status: 'pending',
    source: 'whatsapp',
    paymentMethod: 'whatsapp',
    buyOrder: `WAP-${Date.now().toString().slice(-6)}`,
    notes: `Lead iniciado desde detalle de tour para ${paxCount.value} pax (${selectedDate.value})`,
    passengers: []
  });

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
    
    <!-- Hero Gallery / Cabecera Panorámica del Tour -->
    <div class="gallery-hero position-relative" :style="{ backgroundImage: `url(${heroBannerBackground})` }">
      <!-- Capa de Oscurecimiento y Contraste Profesional -->
      <div class="hero-gradient-overlay position-absolute top-0 start-0 w-100 h-100"></div>

      <!-- Contenedor Centrado (Título, Subtítulo y Badges Debajo con diseño uniforme) -->
      <div class="container position-relative h-100 d-flex flex-column align-items-center justify-content-center py-5 text-center text-white z-index-1">
        
        <!-- Título Principal Centrado -->
        <h1 class="display-3 fw-bold mb-3 text-white text-center tour-hero-title">
          {{ experience.title }}
        </h1>

        <!-- Subtítulo Centrado Ubicado Debajo del Título -->
        <p class="lead fw-semibold text-center tour-hero-subtitle max-w-800 mx-auto mb-4">
          {{ experience.subtitle }}
        </p>

        <!-- Fila de Badges y Botón de Compartir (DEBAJO del Subtítulo, diseño uniforme, mismo tamaño y mayor separación) -->
        <div class="d-flex flex-wrap align-items-center justify-content-center hero-pills-row">
          <span class="badge hero-pill-badge shadow-sm">
            <i class="bi bi-tag-fill"></i>
            <span class="text-uppercase tracking-wider">{{ experience.tags && experience.tags.length ? experience.tags[0] : (experience.categories && experience.categories.length ? experience.categories[0] : 'EXPERIENCIA') }}</span>
          </span>
          <span class="badge hero-pill-badge shadow-sm">
            <i class="bi bi-geo-alt-fill"></i>
            <span>{{ formatDestinationName(experience.destinationId) }}</span>
          </span>
          <button 
            type="button" 
            class="btn hero-pill-badge shadow-sm text-decoration-none"
            @click="shareTour"
            title="Compartir o copiar enlace del tour"
          >
            <i :class="copyLinkToast ? 'bi bi-check2-circle text-success' : 'bi bi-share-fill'"></i>
            <span>{{ copyLinkToast ? '¡Enlace Copiado!' : 'Compartir Tour' }}</span>
          </button>
        </div>

      </div>
    </div>

    <div class="container py-5">
      <div class="row g-5">
        
        <!-- Contenido Principal -->
        <div class="col-lg-8">
          
          <!-- Barra Rápida de Atributos Clave (Key Facts Grid) -->
          <div class="row g-3 mb-5">
            <div class="col-6 col-md-3">
              <div class="p-4 rounded-4 h-100 text-center d-flex flex-column align-items-center justify-content-center key-fact-card transition-all">
                <i class="bi bi-clock-history fs-3 text-beige mb-2"></i>
                <span class="small text-beige-muted text-uppercase fw-bold tracking-wide">DURACIÓN</span>
                <strong class="text-white fs-6 mt-1">{{ experience.duration?.value }} {{ experience.duration?.unit === 'hours' ? 'Horas' : 'Días' }}</strong>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="p-4 rounded-4 h-100 text-center d-flex flex-column align-items-center justify-content-center key-fact-card transition-all">
                <i class="bi bi-activity fs-3 text-beige mb-2"></i>
                <span class="small text-beige-muted text-uppercase fw-bold tracking-wide">EXIGENCIA</span>
                <strong class="text-white fs-6 mt-1">{{ formatDifficulty(experience.difficulty) }}</strong>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="p-4 rounded-4 h-100 text-center d-flex flex-column align-items-center justify-content-center key-fact-card transition-all">
                <i class="bi bi-people-fill fs-3 text-beige mb-2"></i>
                <span class="small text-beige-muted text-uppercase fw-bold tracking-wide">GRUPO</span>
                <strong class="text-white fs-6 mt-1">Cupos Reducidos</strong>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="p-4 rounded-4 h-100 text-center d-flex flex-column align-items-center justify-content-center key-fact-card transition-all">
                <i class="bi bi-translate fs-3 text-beige mb-2"></i>
                <span class="small text-beige-muted text-uppercase fw-bold tracking-wide">IDIOMAS</span>
                <strong class="text-white fs-6 mt-1">{{ formatLanguages(experience.languages) }}</strong>
              </div>
            </div>
          </div>

          <!-- Descripción -->
          <div class="p-4 p-md-5 rounded-4 premium-green-card mb-5">
            <h2 class="h4 fw-bold mb-4 text-beige display-6">Sobre esta Experiencia</h2>
            <p class="text-beige-content lh-lg mb-0 fs-6">{{ experience.description }}</p>
          </div>

          <!-- Itinerario -->
          <div v-if="experience.itinerary && experience.itinerary.length" class="p-4 p-md-5 rounded-4 premium-green-card mb-5">
            <h2 class="h4 fw-bold mb-4 text-beige display-6">Itinerario Detallado</h2>
            <div v-for="(day, index) in experience.itinerary" :key="index" class="mb-4 d-flex gap-4 align-items-start border-bottom border-light border-opacity-15 pb-4">
              <div class="flex-shrink-0">
                <div class="rounded-circle d-flex align-items-center justify-content-center fw-bold font-monospace shadow-sm" style="width: 48px; height: 48px; background-color: #E7DCC3 !important; color: #0D5B57 !important;">
                  {{ index + 1 }}
                </div>
              </div>
              <div class="mt-1">
                <h4 class="h5 fw-bold text-white mb-2">
                  <span v-if="day.dayOrTime" class="text-beige me-2 font-sans fs-6">[{{ day.dayOrTime }}]</span>
                  {{ day.title }}
                </h4>
                <p class="text-beige-content mb-0 lh-lg">{{ day.description }}</p>
              </div>
            </div>
          </div>

          <!-- Qué incluye / Qué no incluye -->
          <div class="p-4 p-md-5 rounded-4 premium-green-card mb-5">
            <div class="row g-5">
              <div class="col-md-6">
                <h4 class="h6 fw-bold text-beige text-uppercase mb-4 d-flex align-items-center gap-2">
                  <i class="bi bi-check-circle-fill text-beige fs-5"></i>
                  <span>Qué incluye</span>
                </h4>
                <ul class="list-unstyled mb-0 feature-checklist">
                  <li v-for="(inc, i) in experience.included" :key="i" class="feature-item">
                    <span class="feature-icon-box">
                      <i class="bi bi-check-lg text-beige"></i>
                    </span>
                    <span class="feature-text">{{ inc }}</span>
                  </li>
                </ul>
              </div>
              <div class="col-md-6">
                <h4 class="h6 fw-bold text-beige text-uppercase mb-4 d-flex align-items-center gap-2">
                  <i class="bi bi-x-circle-fill text-beige fs-5"></i>
                  <span>Qué no incluye</span>
                </h4>
                <ul class="list-unstyled mb-0 feature-checklist">
                  <li v-for="(ninc, i) in experience.notIncluded" :key="i" class="feature-item opacity-90">
                    <span class="feature-icon-box">
                      <i class="bi bi-x-lg text-beige"></i>
                    </span>
                    <span class="feature-text">{{ ninc }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Qué debes traer contigo / Equipamiento Sugerido -->
          <div class="p-4 p-md-5 rounded-4 premium-green-card mb-5">
            <h3 class="h5 fw-bold mb-4 d-flex align-items-center gap-3 text-beige">
              <i class="bi bi-backpack4-fill text-beige fs-4"></i>
              <span>Qué debes traer contigo</span>
            </h3>
            <div class="row g-4 pt-2">
              <div class="col-md-6">
                <ul class="list-unstyled mb-0 feature-checklist">
                  <li class="feature-item">
                    <span class="feature-icon-box">
                      <i class="bi bi-check2 text-beige"></i>
                    </span>
                    <span class="feature-text"><strong class="text-white">Calzado adecuado:</strong> Zapatos de trekking o suela de buen agarre.</span>
                  </li>
                  <li class="feature-item">
                    <span class="feature-icon-box">
                      <i class="bi bi-check2 text-beige"></i>
                    </span>
                    <span class="feature-text"><strong class="text-white">Vestimenta por capas:</strong> Primera capa, polar intermedio y cortavientos.</span>
                  </li>
                  <li class="feature-item">
                    <span class="feature-icon-box">
                      <i class="bi bi-check2 text-beige"></i>
                    </span>
                    <span class="feature-text"><strong class="text-white">Mochila:</strong> 20 a 30 litros para abrigo personal.</span>
                  </li>
                </ul>
              </div>
              <div class="col-md-6">
                <ul class="list-unstyled mb-0 feature-checklist">
                  <li class="feature-item">
                    <span class="feature-icon-box">
                      <i class="bi bi-check2 text-beige"></i>
                    </span>
                    <span class="feature-text"><strong class="text-white">Protección solar:</strong> Lentes de sol filtro UV, bloqueador y gorro.</span>
                  </li>
                  <li class="feature-item">
                    <span class="feature-icon-box">
                      <i class="bi bi-check2 text-beige"></i>
                    </span>
                    <span class="feature-text"><strong class="text-white">Hidratación:</strong> Botella con agua (1.5 a 2 litros).</span>
                  </li>
                  <li class="feature-item">
                    <span class="feature-icon-box">
                      <i class="bi bi-check2 text-beige"></i>
                    </span>
                    <span class="feature-text"><strong class="text-white">Ración de marcha:</strong> Frutos secos o chocolates.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Galería Fotográfica de la Experiencia -->
          <div v-if="experience.gallery && experience.gallery.length > 0" class="p-4 p-md-5 rounded-4 premium-green-card mb-5">
            <h2 class="h4 fw-bold mb-4 text-beige display-6">Galería Fotográfica</h2>
            <div class="row g-4">
              <div v-for="(img, index) in experience.gallery" :key="index" class="col-6 col-md-4">
                <div class="rounded-4 overflow-hidden shadow-sm ratio ratio-4x3 border border-light border-opacity-20 cursor-pointer hover-lift">
                  <img :src="img.url" :alt="img.alt || experience.title" class="w-100 h-100 object-fit-cover hover-zoom">
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar / Booking Widget -->
        <div id="booking-section" class="col-lg-4">
          <div class="sticky-top" style="top: 100px;">
            <div class="booking-sidebar p-4 p-md-5 rounded-4 premium-green-card">
              
              <span class="badge fw-bold px-3 py-1 mb-3 text-uppercase" style="font-size: 0.72rem; letter-spacing: 0.1em; background-color: #E7DCC3 !important; color: #0D5B57 !important;">
                Cotización en Vivo
              </span>
              <h3 class="h4 fw-bold text-beige mb-4 display-6">Reserva tu Cupo</h3>

              <!-- Controles de Fecha y Pasajeros -->
              <div class="p-3 rounded-4 mb-4 border border-light border-opacity-20 shadow-sm" style="background-color: #083D39;">
                <!-- Fecha -->
                <div class="mb-4">
                  <label class="form-label small fw-bold text-beige mb-2 d-flex align-items-center">
                    <i class="bi bi-calendar-event me-2 text-beige"></i>Fecha de Excursión
                  </label>
                  <input 
                    v-model="selectedDate" 
                    type="date" 
                    :min="todayDate" 
                    class="form-control text-white fw-medium premium-green-input"
                  >
                </div>

                <!-- Pasajeros con selector (+ / -) -->
                <div>
                  <label class="form-label small fw-bold text-beige mb-2 d-flex justify-content-between align-items-center">
                    <span><i class="bi bi-people-fill me-2 text-beige"></i>Pasajeros</span>
                    <span class="badge fw-bold" style="background-color: #E7DCC3 !important; color: #0D5B57 !important;">{{ paxCount }} {{ paxCount === 1 ? 'persona' : 'personas' }}</span>
                  </label>
                  <div class="d-flex align-items-center gap-3">
                    <button 
                      type="button" 
                      class="btn btn-outline-light rounded-circle fw-bold d-flex align-items-center justify-content-center transition-all" 
                      style="width: 40px; height: 40px; border-color: rgba(231,220,195,0.4); color: #E7DCC3;"
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
                      class="form-control text-center fw-bold text-white premium-green-input flex-grow-1"
                    >
                    <button 
                      type="button" 
                      class="btn btn-outline-light rounded-circle fw-bold d-flex align-items-center justify-content-center transition-all" 
                      style="width: 40px; height: 40px; border-color: rgba(231,220,195,0.4); color: #E7DCC3;"
                      @click="incrementPax"
                    >
                      <i class="bi bi-plus"></i>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Desglose de Precios -->
              <div class="rounded-4 p-4 shadow-sm mb-4 border border-light border-opacity-20" style="background-color: #083D39;">
                <div class="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom border-light border-opacity-15 small">
                  <span class="text-beige fw-medium">Tarifa por persona:</span>
                  <span class="fw-bold text-white">{{ formatPrice(experience.pricing.basePrice, 'CLP') }}</span>
                </div>
                <div class="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom border-light border-opacity-15 small">
                  <span class="text-beige fw-medium">Cantidad de viajeros:</span>
                  <span class="fw-bold text-white">× {{ paxCount }}</span>
                </div>
                <div class="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom border-light border-opacity-15 small">
                  <span class="text-beige fw-medium">Dificultad técnica:</span>
                  <span class="fw-bold text-white">{{ formatDifficulty(experience.difficulty) }}</span>
                </div>
                <!-- Total Principal en CLP -->
                <div class="mt-4 pt-3 border-top border-light border-opacity-15">
                  <span class="small text-beige d-block text-uppercase fw-bold mb-1 tracking-wide" style="font-size: 0.72rem;">Total Calculado</span>
                  <span class="fs-2 fw-bold text-white font-sans">{{ formatPrice(totalPriceCLP, 'CLP') }}</span>
                </div>

                <!-- Referencia de Precios en Otras Monedas para Extranjeros -->
                <div class="mt-3 pt-3 border-top border-light border-opacity-15">
                  <div class="d-flex align-items-center justify-content-between mb-2">
                    <span class="small fw-semibold text-beige d-flex align-items-center gap-1.5" style="font-size: 0.75rem;">
                      <i class="bi bi-globe2 text-warning"></i>
                      <span>Referencia en otras monedas:</span>
                    </span>
                    <span class="small text-white opacity-65" style="font-size: 0.68rem;">(Aproximado)</span>
                  </div>
                  <div class="d-flex align-items-center gap-2">
                    <div class="flex-fill p-2.5 rounded-3 text-center border border-light border-opacity-20 shadow-sm" style="background: rgba(6, 30, 28, 0.75);">
                      <span class="d-block text-beige-muted small text-uppercase fw-bold mb-0.5" style="font-size: 0.68rem; letter-spacing: 0.04em;">
                        Dólar (USD)
                      </span>
                      <strong class="text-white font-sans" style="font-size: 0.95rem;">{{ formattedUSD }}</strong>
                    </div>
                    <div class="flex-fill p-2.5 rounded-3 text-center border border-light border-opacity-20 shadow-sm" style="background: rgba(6, 30, 28, 0.75);">
                      <span class="d-block text-beige-muted small text-uppercase fw-bold mb-0.5" style="font-size: 0.68rem; letter-spacing: 0.04em;">
                        Reales (BRL)
                      </span>
                      <strong class="text-white font-sans" style="font-size: 0.95rem;">{{ formattedBRL }}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Acciones de Pago -->
              <div class="d-flex flex-column gap-3">
                <button class="btn btn-beige-solid w-100 py-3 px-4 fw-bold fs-6 d-flex align-items-center justify-content-center gap-2.5 shadow-sm rounded-pill transition-all kowalski-btn" @click="handleGoToWebpay">
                  <span class="fw-bold fs-6">Pagar con</span>
                  <img src="/webpay-logo-transparent.png" alt="Webpay.cl Transbank" style="height: 30px; width: auto; object-fit: contain;" />
                </button>
                <button class="btn btn-outline-beige w-100 py-3 fw-bold fs-6 d-flex align-items-center justify-content-center gap-2 shadow-sm rounded-pill transition-all kowalski-btn" @click="handleAddToCart">
                  <i class="bi bi-cart-plus-fill fs-5"></i> Añadir al Carrito
                </button>
                <button class="btn btn-whatsapp-custom w-100 py-3 fw-bold fs-6 d-flex align-items-center justify-content-center gap-2 shadow-sm rounded-pill transition-all kowalski-btn" @click="handleBookWhatsApp">
                  <i class="bi bi-whatsapp fs-5"></i> Reservar vía WhatsApp
                </button>
              </div>

              <!-- Bloque de Garantías y Confianza Oficial Wamani (Personalizables en Admin) -->
              <div class="mt-4 p-4 rounded-4 shadow-sm border border-light border-opacity-20" style="background-color: #083D39;">
                <span class="small fw-bold text-beige text-uppercase d-flex align-items-center gap-2 mb-3 tracking-wide" style="font-size: 0.74rem;">
                  <i class="bi bi-shield-check fs-5 text-beige"></i> Garantías Oficiales del Tour
                </span>
                <ul class="list-unstyled mb-0 small text-beige-content d-flex flex-column gap-3 lh-base" style="font-size: 0.82rem;">
                  <li v-for="(g, gIdx) in displayedGuarantees" :key="gIdx" class="d-flex align-items-start gap-2">
                    <span class="d-inline-flex align-items-center justify-content-center flex-shrink-0" style="width: 18px; height: 18px; margin-top: 1px;">
                      <i class="bi bi-patch-check-fill text-warning fs-6" style="line-height: 1;"></i>
                    </span>
                    <span class="flex-grow-1" style="line-height: 1.45;">
                      <strong v-if="g.includes(':')" class="text-white">{{ g.split(':')[0] }}:</strong>
                      {{ g.includes(':') ? g.slice(g.indexOf(':') + 1) : g }}
                    </span>
                  </li>
                </ul>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Barra fija de reserva para móviles -->
    <div class="d-lg-none fixed-bottom p-3 border-top border-light border-opacity-25 shadow-2xl z-3" style="background-color: #0D5B57 !important;">
      <div class="d-flex align-items-center justify-content-between gap-2">
        <div>
          <span class="small text-beige opacity-85 d-block" style="font-size: 0.72rem; color: #E7DCC3 !important;">Desde</span>
          <strong class="fs-5 font-monospace text-white">{{ formatPrice(experience.pricing.basePrice, 'CLP') }}</strong>
          <span class="small text-beige opacity-85 ms-1" style="font-size: 0.7rem; color: #E7DCC3 !important;">/ pax</span>
        </div>
        <a href="#booking-section" class="btn btn-beige-gold px-4 py-2 fw-bold d-flex align-items-center gap-2 text-decoration-none shadow rounded-pill" style="font-size: 0.9rem;">
          <i class="bi bi-calendar2-check-fill"></i> Reservar Cupos
        </a>
      </div>
    </div>

  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables';

.experience-detail-page {
  background-color: $verde-wamani !important;
}

.gallery-hero {
  min-height: 480px;
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  margin-top: -80px;
  padding-top: 100px;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.hero-gradient-overlay {
  background: linear-gradient(
    180deg, 
    rgba(6, 26, 25, 0.55) 0%, 
    rgba(6, 26, 25, 0.38) 50%, 
    rgba(3, 16, 15, 0.84) 100%
  );
}

.tour-hero-title {
  font-family: 'Caveat', cursive !important;
  font-size: clamp(2.5rem, 5vw, 4.5rem) !important;
  line-height: 1.12;
  color: #FFFFFF !important;
  text-shadow: 0 4px 24px rgba(0, 0, 0, 0.95), 0 2px 8px rgba(0, 0, 0, 0.85);
  max-width: 950px;
}

.tour-hero-subtitle {
  color: #E7DCC3 !important;
  font-size: clamp(1.15rem, 2vw, 1.5rem);
  text-shadow: 0 2px 14px rgba(0, 0, 0, 0.95);
  font-family: 'Montserrat', sans-serif !important;
  font-weight: 600;
  line-height: 1.45;
}

.hero-pills-row {
  gap: 1.25rem !important; // Mayor separación estética entre pastillas
  margin-top: 0.5rem;
}

.hero-pill-badge {
  background-color: #0A4945 !important;
  color: #F7F4EC !important;
  border: 1px solid rgba(231, 220, 195, 0.35) !important;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3) !important;
  backdrop-filter: blur(8px);
  font-family: 'Montserrat', sans-serif !important;
  font-size: 0.86rem !important;
  font-weight: 700 !important;
  letter-spacing: 0.03em;
  
  // Mismo tamaño simétrico para todas (ancho y alto estandarizados)
  min-width: 185px;
  height: 48px;
  padding: 0 1.35rem !important;
  border-radius: 9999px !important;
  box-sizing: border-box;
  
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  cursor: pointer;
  white-space: nowrap;

  i {
    color: #E7DCC3 !important;
    font-size: 1rem;
    flex-shrink: 0;
    transition: transform 0.25s ease, color 0.25s ease;
  }

  span {
    color: #F7F4EC !important;
    line-height: 1;
  }

  &:hover {
    background-color: #0D5B57 !important;
    border-color: #E7DCC3 !important;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.45), 0 0 12px rgba(231, 220, 195, 0.35) !important;
    transform: translateY(-2px);
    color: #FFFFFF !important;

    i {
      color: #FFFFFF !important;
      transform: scale(1.12);
    }

    span {
      color: #FFFFFF !important;
    }
  }

  &:active {
    transform: scale(0.97) translateY(0);
  }
}

@media (max-width: 576px) {
  .hero-pills-row {
    gap: 0.75rem !important;
  }
  .hero-pill-badge {
    min-width: 150px;
    height: 44px;
    font-size: 0.8rem !important;
    padding: 0 1rem !important;
  }
}

.hover-scale:hover {
  transform: translateY(-2px) scale(1.03);
}

.max-w-800 {
  max-width: 800px;
}

.z-index-1 {
  z-index: 1;
}

.text-beige {
  color: #E7DCC3 !important;
}

.text-beige-muted {
  color: #E7DCC3 !important;
  opacity: 0.85;
}

.text-beige-content {
  color: #F7F4EC !important;
  font-size: 1.02rem;
  line-height: 1.8;
}

.feature-checklist {
  .feature-item {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    margin-bottom: 0.85rem;
    color: #F7F4EC;
    font-size: 1.02rem;
    line-height: 1.6;

    &:last-child {
      margin-bottom: 0;
    }

    .feature-icon-box {
      width: 20px;
      height: 20px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 3px;

      i {
        color: #E7DCC3 !important;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 1.15rem;
        line-height: 1;

        &::before {
          vertical-align: 0 !important;
          line-height: 1 !important;
        }
      }
    }

    .feature-text {
      flex: 1;
      line-height: 1.6;
    }
  }
}

.premium-green-card {
  background-color: #0A4945 !important;
  border: 1px solid rgba(231, 220, 195, 0.32) !important;
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.28) !important;
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  color: #F7F4EC !important;
}

.key-fact-card {
  background-color: #0A4945 !important;
  border: 1px solid rgba(231, 220, 195, 0.32) !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.22) !important;
  border-radius: 20px;
  color: #F7F4EC !important;

  &:hover {
    transform: translateY(-4px);
    border-color: rgba(231, 220, 195, 0.75) !important;
    box-shadow: 0 14px 34px rgba(0, 0, 0, 0.35) !important;
  }
}

.premium-green-input {
  background-color: #052624 !important;
  border: 1px solid rgba(231, 220, 195, 0.3) !important;
  color: #FFFFFF !important;
  
  &:focus {
    border-color: #E7DCC3 !important;
    box-shadow: 0 0 0 3px rgba(231, 220, 195, 0.25) !important;
    background-color: #072F2D !important;
  }
}

.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.25);
}

.kowalski-btn {
  &:active {
    transform: scale(0.97) translateY(0);
  }
}

.btn-beige-solid,
.btn-beige-gold {
  background: #E7DCC3 !important;
  background-color: #E7DCC3 !important;
  color: #0D5B57 !important;
  border: 1px solid #E7DCC3 !important;
  font-weight: 700;
  border-radius: 9999px !important;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25) !important;
  cursor: pointer;

  span {
    color: #0D5B57 !important;
  }

  &:hover {
    background: #F7F1E1 !important;
    background-color: #F7F1E1 !important;
    border-color: #F7F1E1 !important;
    color: #083D39 !important;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(231, 220, 195, 0.6) !important;

    span {
      color: #083D39 !important;
    }
  }

  &:active {
    transform: scale(0.97) translateY(0);
  }
}

.btn-outline-beige {
  background: transparent !important;
  color: #E7DCC3 !important;
  border: 1.5px solid #E7DCC3 !important;

  &:hover {
    background: rgba(231, 220, 195, 0.15) !important;
    color: #FFFFFF !important;
    border-color: #FFFFFF !important;
    transform: translateY(-2px);
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

.hover-zoom {
  transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
  
  &:hover {
    transform: scale(1.04);
  }
}
</style>
