<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import HomeHero from '@/widgets/home-hero/HomeHero.vue';
import HomeServices from '@/widgets/home-services/HomeServices.vue';
import HomeDestinations from '@/widgets/home-destinations/HomeDestinations.vue';
import HomePackages from '@/widgets/home-packages/HomePackages.vue';
import ReviewsCarousel from '@/widgets/reviews/ReviewsCarousel.vue';
import W3DCoverflowSlider from '@/shared/ui/W3DCoverflowSlider.vue';
import ExperienceModal from '@/widgets/experience-modal/ExperienceModal.vue';
import { useContentStore } from '@/shared/stores/contentStore';
import { useCartStore } from '@/shared/stores/cartStore';
import type { Experience } from '@/entities/experience/model/schemas';

const router = useRouter();
const contentStore = useContentStore();
const cartStore = useCartStore();

const todayDate = new Date().toISOString().split('T')[0];
const defaultNextDay = new Date(Date.now() + 86400000).toISOString().split('T')[0];

const featuredExperiences = computed(() => contentStore.experiences.slice(0, 9));

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
    <!-- 1. Hero Principal con cumbres sobrepuestas en el borde inferior del video -->
    <HomeHero />

    <!-- 2. TOURS DESTACADOS (SLIDER 3D COVERFLOW ARRIBA DE NUESTROS SERVICIOS) -->
    <section class="featured-3d-section py-4 px-2 px-md-4">
      <div class="container-fluid px-lg-4">
        <W3DCoverflowSlider 
          :experiences="featuredExperiences" 
          @open="openModal" 
        />
      </div>
    </section>

    <!-- 3. Nuestros Servicios -->
    <HomeServices />
    
    <!-- 4. Buscador y Destinos -->
    <HomeDestinations />

    <!-- 4.5. Paquetes Promocionales -->
    <HomePackages />

    <!-- 5. Opiniones y Social Proof -->
    <section id="opiniones" class="py-5">
      <div class="container py-5" style="max-width: 1100px;">
        
        <div class="text-center mb-5">
          <h2 class="display-4 font-brush fw-bold mb-3 text-white" style="font-family: 'Caveat', cursive !important;">{{ contentStore.content.home.reviews.title }}</h2>
          <p class="lead text-white fw-medium max-w-700 mx-auto" style="font-size: 1.15rem; color: #FFFFFF !important;">
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

    <!-- MODAL FLOTANTE DE EXPERIENCIA UNIFICADO (UNA SOLA TARJETA CON UN SOLO SCROLL) -->
    <ExperienceModal :experience="selectedExperience" :initial-date="defaultNextDay" :initial-pax="1" @close="closeModal" />
  </div>
</template>

<style scoped>
.max-w-700 {
  max-width: 700px;
}
</style>
