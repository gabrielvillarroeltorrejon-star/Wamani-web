<script setup lang="ts">
// Widget oficial: Formulario de Reserva en 4 Pasos + WhatsApp
// Manual de Marca Wamani Experience - Páginas 8 y 9
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useContentStore } from '@/shared/stores/contentStore';

const router = useRouter();
const contentStore = useContentStore();

const todayDate = new Date().toISOString().split('T')[0];
const defaultDate = new Date(Date.now() + 86400000).toISOString().split('T')[0];

const formData = ref({
  inspiration: '',
  experienceType: 'Tour Privado',
  destination: 'Cajón del Maipo',
  date: defaultDate,
  pax: 2,
  customerName: '',
  customerEmail: '',
  customerPhone: ''
});

const isSubmitted = ref(false);

const experienceTypes = [
  { id: 'privado', label: 'Tour Privado', icon: 'bi-person-badge' },
  { id: 'grupal', label: 'Tour Grupal', icon: 'bi-people' },
  { id: 'medida', label: 'Experiencia a Medida', icon: 'bi-stars' },
  { id: 'transfer', label: 'Transfer Privado', icon: 'bi-car-front' }
];

// Opciones de destino (con exclusión de Zona Norte según requerimiento oficial)
const destinationOptions = [
  'Cajón del Maipo',
  'Valparaíso & Costa',
  'Lagos & Volcanes (Pucón / Panguipulli)',
  'Patagonia Austral',
  'Otro'
];

const whatsappUrl = computed(() => {
  const wa = contentStore.content.contact.whatsappNumber || '56985673376';
  const text = encodeURIComponent(
    `Hola Wamani Experience, deseo cotizar una reserva:\n\n` +
    `💭 Inspiración: ${formData.value.inspiration || 'Viaje de naturaleza y aventura'}\n` +
    `🧭 Tipo de experiencia: ${formData.value.experienceType}\n` +
    `📍 Destino: ${formData.value.destination}\n` +
    `📅 Fecha estimada: ${formData.value.date}\n` +
    `👥 Viajeros: ${formData.value.pax} personas\n\n` +
    `Agradecería coordinar los detalles con un asesor. ¡Muchas gracias!`
  );
  return `https://wa.me/${wa}?text=${text}`;
});

const submitReservation = () => {
  // Registrar prospecto de reserva en el store
  contentStore.addBooking({
    customerName: formData.value.customerName || 'Solicitud Web',
    customerEmail: formData.value.customerEmail || 'contacto@wamani.cl',
    customerPhone: formData.value.customerPhone || '+' + (contentStore.content.contact.whatsappNumber || '56985673376'),
    experienceTitle: `${formData.value.experienceType} - ${formData.value.destination}`,
    bookingDate: formData.value.date,
    pax: formData.value.pax,
    totalPrice: 0,
    status: 'pending',
    source: 'manual',
    paymentMethod: 'whatsapp',
    buyOrder: `SOL-${Date.now().toString().slice(-6)}`,
    notes: `Inspiración: "${formData.value.inspiration}" | Destino: ${formData.value.destination} | ${formData.value.pax} pax`,
    passengers: []
  });

  isSubmitted.value = true;
};

const goToWhatsAppDirect = () => {
  window.open(whatsappUrl.value, '_blank');
};
</script>

<template>
  <section id="reserva" class="booking-section py-5 position-relative" style="background-color: #FAF8F5;">
    <div class="container py-4" style="max-width: 860px;">
      
      <!-- Encabezado -->
      <div class="text-center mb-5">
        <div class="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-3" style="background: rgba(20, 126, 121, 0.08); border: 1px solid rgba(20, 126, 121, 0.2);">
          <i class="bi bi-calendar2-check-fill" style="color: #147E79;"></i>
          <span class="small text-uppercase fw-bold" style="color: #147E79; letter-spacing: 0.12em; font-size: 0.78rem;">Planifica tu Viaje</span>
        </div>

        <h2 class="display-5 fw-bold mb-2 font-sans" style="color: #147E79;">
          Comienza tu reserva
        </h2>
        <p class="brand-slogan fs-4 mb-0" style="color: #147E79;">
          Vive la experiencia. Vive Wamani.
        </p>
      </div>

      <!-- Estado Exitoso -->
      <div v-if="isSubmitted" class="card p-4 p-md-5 rounded-4 text-center border-0 shadow-sm" style="background-color: #FFFFFF;">
        <div class="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle" style="width: 70px; height: 70px; background-color: rgba(20, 126, 121, 0.1); color: #147E79;">
          <i class="bi bi-check-circle-fill fs-1"></i>
        </div>
        <h3 class="h4 fw-bold font-sans mb-2" style="color: #147E79;">¡Solicitud Enviada con Éxito!</h3>
        <p class="mb-4" style="color: #4C4C4C;">
          Un asesor de Wamani Experience revisará tu solicitud y se pondrá en contacto contigo a la brevedad.
        </p>
        <div class="d-flex flex-wrap justify-content-center gap-3">
          <a :href="whatsappUrl" target="_blank" class="btn btn-whatsapp-custom py-3 px-4 d-inline-flex align-items-center gap-2">
            <i class="bi bi-whatsapp fs-5"></i> Continuar por WhatsApp
          </a>
          <button @click="isSubmitted = false" class="btn btn-secondary-wamani py-3 px-4">
            Enviar otra solicitud
          </button>
        </div>
      </div>

      <!-- Formulario de 4 Pasos -->
      <form v-else @submit.prevent="submitReservation" class="booking-card p-4 p-md-5 rounded-4 shadow-sm border-0" style="background-color: #FFFFFF;">
        
        <!-- 1. Cuéntanos qué te inspira viajar -->
        <div class="step-group mb-4 pb-3 border-bottom border-light-subtle">
          <label class="form-label fw-bold d-flex align-items-center gap-2 mb-2 font-sans" style="color: #147E79; font-size: 1.05rem;">
            <span>1. Cuéntanos qué te inspira viajar:</span>
          </label>
          <p class="small text-muted mb-2" style="color: #4C4C4C !important;">
            Comparte tus intereses, el tipo de paisaje o vivencia que buscas despertar en este viaje.
          </p>
          <textarea 
            v-model="formData.inspiration"
            class="form-control rounded-3 p-3" 
            rows="3"
            placeholder="Quiero vivir una experiencia de montaña, vino y cultura…"
            style="border-color: #E7DCC3;"
            required
          ></textarea>
        </div>

        <!-- 2. Selecciona tu tipo de experiencia -->
        <div class="step-group mb-4 pb-3 border-bottom border-light-subtle">
          <label class="form-label fw-bold d-block mb-3 font-sans" style="color: #147E79; font-size: 1.05rem;">
            2. Selecciona tu tipo de experiencia:
          </label>
          <div class="row g-2">
            <div v-for="type in experienceTypes" :key="type.id" class="col-6 col-md-3">
              <label 
                class="experience-pill w-100 p-3 rounded-3 text-center cursor-pointer d-flex flex-column align-items-center justify-content-center gap-1 transition-all h-100"
                :class="{ 'active': formData.experienceType === type.label }"
              >
                <input 
                  type="radio" 
                  v-model="formData.experienceType" 
                  :value="type.label" 
                  class="d-none"
                />
                <i :class="['bi', type.icon, 'fs-5']"></i>
                <span class="small fw-bold">{{ type.label }}</span>
              </label>
            </div>
          </div>
        </div>

        <!-- 3. Indícanos el destino -->
        <div class="step-group mb-4 pb-3 border-bottom border-light-subtle">
          <label class="form-label fw-bold mb-2 font-sans" style="color: #147E79; font-size: 1.05rem;">
            3. Indícanos el destino:
          </label>
          <select 
            v-model="formData.destination" 
            class="form-select p-3 rounded-3 fw-medium"
            style="border-color: #E7DCC3;"
            required
          >
            <option v-for="dest in destinationOptions" :key="dest" :value="dest">
              {{ dest }}
            </option>
          </select>
        </div>

        <!-- 4. Fecha estimada y número de viajeros -->
        <div class="step-group mb-4 pb-3 border-bottom border-light-subtle">
          <label class="form-label fw-bold mb-3 font-sans" style="color: #147E79; font-size: 1.05rem;">
            4. Fecha estimada y número de viajeros:
          </label>
          <div class="row g-3">
            <div class="col-12 col-md-6">
              <label class="small text-muted mb-1 d-block" style="color: #4C4C4C !important;">
                <i class="bi bi-calendar-event me-1" style="color: #147E79;"></i> Fecha estimada
              </label>
              <input 
                v-model="formData.date" 
                type="date" 
                :min="todayDate" 
                class="form-control p-3 rounded-3" 
                style="border-color: #E7DCC3;"
                required
              />
            </div>
            <div class="col-12 col-md-6">
              <label class="small text-muted mb-1 d-block" style="color: #4C4C4C !important;">
                <i class="bi bi-people-fill me-1" style="color: #147E79;"></i> Número de viajeros
              </label>
              <input 
                v-model.number="formData.pax" 
                type="number" 
                min="1" 
                max="50" 
                class="form-control p-3 rounded-3" 
                placeholder="2"
                style="border-color: #E7DCC3;"
                required
              />
            </div>
          </div>
        </div>

        <!-- Atención Exclusiva & Contacto Directo WhatsApp -->
        <div class="exclusive-box p-4 rounded-4 mb-4" style="background-color: #E7DCC3;">
          <div class="d-flex align-items-center gap-2 mb-2">
            <i class="bi bi-chat-dots-fill fs-5" style="color: #147E79;"></i>
            <h4 class="h6 fw-bold mb-0 font-sans" style="color: #147E79;">Atención exclusiva</h4>
          </div>
          <p class="small mb-3" style="color: #4C4C4C; line-height: 1.6;">
            Un miembro de nuestro equipo se pondrá en contacto contigo para coordinar cada detalle y acompañarte en el proceso de reserva.
          </p>

          <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 pt-3 border-top border-secondary border-opacity-25">
            <div class="small fw-medium" style="color: #4C4C4C;">
              <div><i class="bi bi-envelope-fill me-2" style="color: #147E79;"></i>experiencewamani@gmail.com</div>
              <div><i class="bi bi-geo-alt-fill me-2" style="color: #147E79;"></i>Chile – Sudamérica</div>
            </div>
            <button 
              type="button" 
              class="btn btn-whatsapp-custom py-2 px-3 fw-bold d-inline-flex align-items-center gap-2" 
              @click="goToWhatsAppDirect"
            >
              <i class="bi bi-whatsapp"></i> Habla directamente con un asesor
            </button>
          </div>
        </div>

        <!-- Mensaje de Marca: Viajar con Sentido -->
        <div class="text-center mb-4 px-2">
          <span class="d-block small text-uppercase fw-bold mb-1" style="color: #147E79; letter-spacing: 0.1em; font-size: 0.8rem;">
            🌱 Viajar con sentido
          </span>
          <p class="small mb-0" style="color: #4C4C4C; line-height: 1.6;">
            Cada experiencia Wamani apoya la conservación de entornos naturales y comunidades locales, promoviendo un turismo responsable y transformador.
          </p>
        </div>

        <!-- Botones de Acción Oficiales -->
        <div class="d-flex flex-column flex-sm-row justify-content-center gap-3">
          <button type="submit" class="btn btn-primary-wamani py-3 px-4 fs-6">
            Enviar mi solicitud
          </button>
          <router-link to="/experiencias" class="btn btn-secondary-wamani py-3 px-4 fs-6">
            Ver experiencias disponibles
          </router-link>
        </div>

      </form>
    </div>
  </section>
</template>

<style scoped>
.booking-card {
  border: 1px solid rgba(231, 220, 195, 0.7) !important;
}

.experience-pill {
  background-color: #FAF8F5;
  border: 1px solid #E7DCC3;
  color: #4C4C4C;
  cursor: pointer;
  user-select: none;
}

.experience-pill:hover {
  background-color: rgba(20, 126, 121, 0.05);
  border-color: #147E79;
}

.experience-pill.active {
  background-color: #147E79;
  border-color: #147E79;
  color: #FFFFFF;
}

.experience-pill.active i {
  color: #E7DCC3 !important;
}
</style>
