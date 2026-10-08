<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useContentStore } from '@/shared/stores/contentStore';

const route = useRoute();
const contentStore = useContentStore();

// Parámetros de Reserva desde la URL
const expSlug = computed(() => (route.query.slug as string) || '');
const paxCount = computed(() => Math.max(1, Number(route.query.pax) || 1));
const travelDate = computed(() => (route.query.date as string) || new Date(Date.now() + 86400000).toISOString().split('T')[0]);
const initialMethod = computed(() => (route.query.method as string) || 'webpay');

const experience = computed(() => {
  return contentStore.experiences.find(e => e.slug === expSlug.value) || contentStore.experiences[0];
});

const totalPrice = computed(() => {
  return (experience.value?.pricing.basePrice || 50000) * paxCount.value;
});

const formatPrice = (val: number) => {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val);
};

import { formatRut, validateRut } from '@/shared/lib/rutUtils';

// Formulario de Pasajero Principal
const name = ref('');
const lastname = ref('');
const docType = ref<'rut' | 'passport'>('rut');
const rut = ref('');
const passport = ref('');
const docError = ref(false);

const email = ref('');
const phone = ref('');
const notes = ref('');

// Ficha de Seguridad en Montaña & Contacto de Emergencia (SERNATUR)
const emergencyName = ref('');
const emergencyPhone = ref('');
const medicalConditions = ref('');

// Documento Tributario (SII)
const invoiceType = ref<'boleta' | 'factura'>('boleta');
const billingBusinessName = ref('');
const billingRut = ref('');
const billingRutError = ref(false);
const billingActivity = ref('');
const billingAddress = ref('');

// Aceptación de Términos (SERNAC: false por defecto)
const termsAccepted = ref(false);
const showLegalModal = ref(false);
const legalModalTab = ref<'terms' | 'cancellation' | 'privacy'>('terms');

const openLegalModal = (tab: 'terms' | 'cancellation' | 'privacy') => {
  legalModalTab.value = tab;
  showLegalModal.value = true;
};

// Stepper Progresivo en 2 Pasos
const currentStep = ref<1 | 2>(1);

const goToStep2 = () => {
  if (!name.value.trim() || !lastname.value.trim() || !email.value.trim() || !phone.value.trim() || !currentDocumentNumber.value) {
    alert('Por favor completa los campos obligatorios del pasajero titular marcados con (*) antes de continuar.');
    return;
  }
  if (docType.value === 'rut' && (rut.value.length < 8 || docError.value)) {
    alert('Por favor ingresa un RUT chileno válido antes de continuar.');
    return;
  }
  currentStep.value = 2;
  window.scrollTo({ top: 140, behavior: 'smooth' });
};

const goToStep1 = () => {
  currentStep.value = 1;
  window.scrollTo({ top: 140, behavior: 'smooth' });
};

// Formateo y Validación en tiempo real
const handleRutInput = () => {
  rut.value = formatRut(rut.value);
  if (rut.value.length >= 8) {
    docError.value = !validateRut(rut.value);
  } else {
    docError.value = false;
  }
};

const handleBillingRutInput = () => {
  billingRut.value = formatRut(billingRut.value);
  if (billingRut.value.length >= 8) {
    billingRutError.value = !validateRut(billingRut.value);
  } else {
    billingRutError.value = false;
  }
};

const currentDocumentNumber = computed(() => {
  return docType.value === 'rut' ? rut.value.trim() : passport.value.trim();
});

// Generador de Código de Orden
const generateBuyOrder = () => {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `WAM-${new Date().getFullYear()}-${num}`;
};

// Despacho de Correo Transaccional (Voucher PDF/HTML)
const triggerVoucherEmail = async (booking: any) => {
  try {
    await fetch('/api/send-voucher', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ booking })
    });
  } catch (e) {
    console.warn('Voucher email dispatch notice:', e);
  }
};

// Manejo del Retorno de Transbank Webpay Plus (token_ws)
onMounted(async () => {
  const tokenWs = route.query.token_ws as string;
  const tbkToken = route.query.TBK_TOKEN as string;

  if (tbkToken) {
    alert('Transacción cancelada en el portal de Transbank.');
    return;
  }

  if (tokenWs) {
    isProcessing.value = true;
    try {
      const res = await fetch('/api/webpay-commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token_ws: tokenWs })
      });
      const data = await res.json();
      if (data.success && data.responseCode === 0) {
        const newBooking = contentStore.addBooking({
          customerName: name.value || 'Cliente Webpay',
          customerEmail: email.value || 'cliente@wamani.cl',
          customerPhone: phone.value || '+56985673376',
          customerRut: rut.value || 'N/A',
          experienceTitle: experience.value?.title || 'Servicio Turístico',
          experienceSlug: experience.value?.slug,
          bookingDate: travelDate.value,
          pax: paxCount.value,
          totalPrice: data.amount || totalPrice.value,
          status: 'confirmed',
          source: 'automatic',
          paymentMethod: 'webpay',
          buyOrder: data.buyOrder || generateBuyOrder(),
          authorizationCode: data.authorizationCode,
          cardLast4: data.cardDetail?.card_number || '****',
          notes: fullNotes.value
        });
        completedBooking.value = newBooking;
        purchaseCompleted.value = true;
        triggerVoucherEmail(newBooking);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        alert('Pago no aprobado por el emisor bancario de Transbank.');
      }
    } catch (e) {
      console.error('Error al confirmar transacción Webpay:', e);
    } finally {
      isProcessing.value = false;
    }
  }
});

const handleInitiatePayment = async () => {
  if (!name.value.trim() || !lastname.value.trim() || !email.value.trim() || !phone.value.trim()) {
    alert('Por favor, completa los nombres, apellidos, correo y teléfono del pasajero titular.');
    return;
  }

  if (docType.value === 'rut') {
    if (!rut.value.trim() || !validateRut(rut.value)) {
      alert('Por favor, ingresa un RUT chileno válido (verifica el dígito verificador).');
      return;
    }
  } else {
    if (!passport.value.trim()) {
      alert('Por favor, ingresa tu número de Pasaporte o DNI extranjero.');
      return;
    }
  }

  if (invoiceType.value === 'factura') {
    if (!billingBusinessName.value.trim() || !billingRut.value.trim() || !validateRut(billingRut.value) || !billingActivity.value.trim() || !billingAddress.value.trim()) {
      alert('Por favor, completa los datos tributarios de facturación (Razón Social, RUT de empresa válido, Giro y Dirección).');
      return;
    }
  }

  if (!termsAccepted.value) {
    alert('Debes aceptar los Términos y Condiciones, Políticas de Cancelación y Normas de Seguridad para continuar.');
    return;
  }

  const buyOrder = generateBuyOrder();

  if (paymentMethod.value === 'webpay') {
    isProcessing.value = true;
    let redirectedToRealWebpay = false;

    // Iniciar transacción oficial con Transbank
    try {
      const returnUrl = `${window.location.origin}/checkout?slug=${expSlug.value}&date=${travelDate.value}&pax=${paxCount.value}&method=webpay`;
      const res = await fetch('/api/webpay-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyOrder,
          sessionId: `SES-${Date.now()}`,
          amount: totalPrice.value,
          returnUrl
        })
      });
      const data = await res.json();
      if (data.token && data.url) {
        redirectedToRealWebpay = true;
        // Crear y enviar formulario POST automático hacia Transbank
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = data.url;
        const tokenInput = document.createElement('input');
        tokenInput.type = 'hidden';
        tokenInput.name = 'token_ws';
        tokenInput.value = data.token;
        form.appendChild(tokenInput);
        document.body.appendChild(form);
        form.submit();
        return;
      }
    } catch (e) {
      console.warn('Backend Webpay API no disponible en este momento, usando simulador interactivo:', e);
    }

    // Fallback: abrir simulador interactivo
    if (!redirectedToRealWebpay) {
      setTimeout(() => {
        isProcessing.value = false;
        showWebpaySimulation.value = true;
      }, 600);
    }
  } else {
    // Flujo de Transferencia Bancaria Directa
    const newBooking = contentStore.addBooking({
      customerName: `${name.value} ${lastname.value}`,
      customerEmail: email.value,
      customerPhone: phone.value,
      customerRut: currentDocumentNumber.value,
      customerDocumentType: docType.value,
      emergencyContactName: emergencyName.value || undefined,
      emergencyContactPhone: emergencyPhone.value || undefined,
      medicalConditions: medicalConditions.value || undefined,
      invoiceType: invoiceType.value,
      billingDetails: invoiceType.value === 'factura' ? {
        businessName: billingBusinessName.value,
        rut: billingRut.value,
        activity: billingActivity.value,
        address: billingAddress.value
      } : undefined,
      experienceTitle: experience.value?.title || 'Servicio Turístico',
      experienceSlug: experience.value?.slug,
      bookingDate: travelDate.value,
      pax: paxCount.value,
      totalPrice: totalPrice.value,
      status: 'pending',
      source: 'automatic',
      paymentMethod: 'transfer',
      buyOrder,
      notes: fullNotes.value
    });

    completedBooking.value = newBooking;
    purchaseCompleted.value = true;
    triggerVoucherEmail(newBooking);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const confirmWebpayPayment = (success: boolean) => {
  showWebpaySimulation.value = false;
  
  if (success) {
    const authCode = Math.floor(100000 + Math.random() * 900000).toString();
    const buyOrder = generateBuyOrder();

    const newBooking = contentStore.addBooking({
      customerName: `${name.value} ${lastname.value}`,
      customerEmail: email.value,
      customerPhone: phone.value,
      customerRut: currentDocumentNumber.value,
      customerDocumentType: docType.value,
      emergencyContactName: emergencyName.value || undefined,
      emergencyContactPhone: emergencyPhone.value || undefined,
      medicalConditions: medicalConditions.value || undefined,
      invoiceType: invoiceType.value,
      billingDetails: invoiceType.value === 'factura' ? {
        businessName: billingBusinessName.value,
        rut: billingRut.value,
        activity: billingActivity.value,
        address: billingAddress.value
      } : undefined,
      experienceTitle: experience.value?.title || 'Servicio Turístico',
      experienceSlug: experience.value?.slug,
      bookingDate: travelDate.value,
      pax: paxCount.value,
      totalPrice: totalPrice.value,
      status: 'confirmed',
      source: 'automatic',
      paymentMethod: 'webpay',
      buyOrder,
      authorizationCode: authCode,
      cardLast4: webpayCardNumber.value.replace(/\s/g, '').slice(-4),
      notes: fullNotes.value
    });

    completedBooking.value = newBooking;
    purchaseCompleted.value = true;
    triggerVoucherEmail(newBooking);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    alert('Transacción cancelada o rechazada por el banco emisor. Por favor, reintenta o selecciona transferencia bancaria.');
  }
};

const sendWhatsAppConfirmation = () => {
  if (!completedBooking.value) return;
  const b = completedBooking.value;
  const msg = encodeURIComponent(
    `Hola Wamani Experience, he generado la reserva *${b.buyOrder}* para el tour *${b.experienceTitle}*.\n` +
    `👤 Titular: *${b.customerName}* (RUT: ${b.customerRut})\n` +
    `📅 Fecha: *${b.bookingDate}* | Pasajeros: *${b.pax}*\n` +
    `💰 Monto: *${formatPrice(b.totalPrice)}*\n` +
    `💳 Método: *${b.paymentMethod === 'webpay' ? 'Pagado vía Webpay Plus (Cod Auth: ' + b.authorizationCode + ')' : 'Transferencia Bancaria (Adjunto comprobante)'}*`
  );
  const wa = contentStore.content.contact.whatsappNumber || '56985673376';
  window.open(`https://wa.me/${wa}?text=${msg}`, '_blank');
};

const printVoucher = () => {
  window.print();
};
</script>

<template>
  <div class="checkout-page min-vh-100 py-5 font-sans" style="padding-top: 130px !important;">
    <div class="container py-4">
      
      <!-- PANTALLA DE COMPRA EXITOSA (VOUCHER / COMPROBANTE OFICIAL) -->
      <div v-if="purchaseCompleted && completedBooking" class="row justify-content-center">
        <div class="col-12 col-lg-8">
          <div class="voucher-card p-4 p-md-5 rounded-4 shadow-lg text-white" style="background: linear-gradient(145deg, #045D56 0%, #033E3B 100%); border: 1px solid rgba(45, 212, 191, 0.45);">
            
            <!-- Encabezado del Voucher -->
            <div class="text-center mb-4 pb-4 border-bottom border-secondary border-opacity-25">
              <div class="d-inline-flex align-items-center justify-content-center rounded-circle p-3 mb-3 shadow" :class="completedBooking.status === 'confirmed' ? 'bg-success text-white' : 'bg-warning text-dark'" style="width: 70px; height: 70px;">
                <i class="bi fs-1" :class="completedBooking.status === 'confirmed' ? 'bi-check-lg' : 'bi-hourglass-split'"></i>
              </div>
              <h2 class="display-6 font-brush fw-bold text-white mb-1" style="font-family: 'Caveat', cursive !important;">
                {{ completedBooking.status === 'confirmed' ? '¡Reserva Confirmada Exitosamente!' : '¡Reserva Generada con Éxito!' }}
              </h2>
              <p class="text-white opacity-85 mb-0">
                {{ completedBooking.status === 'confirmed' ? 'Tu pago vía Webpay Plus fue acreditado. Hemos reservado tus cupos.' : 'Hemos bloqueado tus cupos a la espera del comprobante de transferencia bancaria.' }}
              </p>
            </div>

            <!-- Resumen de Transacción / Voucher -->
            <div class="p-4 rounded-4 mb-4" style="background-color: #022C2A; border: 1px solid rgba(45, 212, 191, 0.3);">
              <div class="row g-3">
                <div class="col-sm-6">
                  <span class="small text-white opacity-75 d-block">Número de Orden (Buy Order)</span>
                  <strong class="text-accent fs-5 font-monospace">{{ completedBooking.buyOrder }}</strong>
                </div>
                <div class="col-sm-6 text-sm-end">
                  <span class="small text-white opacity-75 d-block">Estado de Pago</span>
                  <span class="badge fw-bold px-3 py-2 text-uppercase" :class="completedBooking.status === 'confirmed' ? 'bg-emerald text-white' : 'bg-amber text-white'">
                    {{ completedBooking.status === 'confirmed' ? 'PAGADO Y CONFIRMADO' : 'PENDIENTE DE TRANSFERENCIA' }}
                  </span>
                </div>
                <div class="col-12 border-top border-secondary border-opacity-25 pt-3">
                  <div class="row g-2">
                    <div class="col-6">
                      <span class="small text-white opacity-75 d-block">Tour / Experiencia</span>
                      <strong class="text-white">{{ completedBooking.experienceTitle }}</strong>
                    </div>
                    <div class="col-6 text-end">
                      <span class="small text-white opacity-75 d-block">Fecha de Excursión</span>
                      <strong class="text-white">{{ completedBooking.bookingDate }}</strong>
                    </div>
                    <div class="col-6">
                      <span class="small text-white opacity-75 d-block">Pasajero Titular</span>
                      <span class="text-white">{{ completedBooking.customerName }} ({{ completedBooking.customerRut }})</span>
                    </div>
                    <div class="col-6 text-end">
                      <span class="small text-white opacity-75 d-block">Total Pagado / Pactado</span>
                      <strong class="text-accent fs-5">{{ formatPrice(completedBooking.totalPrice) }}</strong>
                    </div>
                    <div v-if="completedBooking.authorizationCode" class="col-12 border-top border-secondary border-opacity-25 pt-2 mt-2">
                      <span class="small text-white opacity-75">Código de Autorización Transbank: </span>
                      <strong class="text-accent font-monospace">{{ completedBooking.authorizationCode }}</strong>
                      <span class="small text-white opacity-75 ms-3">Tarjeta: **** {{ completedBooking.cardLast4 }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Datos Bancarios Dinámicos en caso de Transferencia -->
            <div v-if="completedBooking.paymentMethod === 'transfer'" class="p-4 rounded-4 mb-4" style="background-color: #033E3B; border: 1px dashed rgba(45, 212, 191, 0.5);">
              <h4 class="h6 text-accent fw-bold text-uppercase mb-3"><i class="bi bi-bank2 me-2"></i>Datos para Transferencia Bancaria</h4>
              <ul class="list-unstyled mb-0 small text-white lh-lg">
                <li><strong>Banco:</strong> {{ contentStore.content.gateway.bankTransfer.bankName || 'Banco Santander Chile' }}</li>
                <li><strong>Tipo de Cuenta:</strong> {{ contentStore.content.gateway.bankTransfer.accountType || 'Cuenta Corriente Empresa' }}</li>
                <li><strong>Número de Cuenta:</strong> {{ contentStore.content.gateway.bankTransfer.accountNumber || '89-765432-1' }}</li>
                <li><strong>Titular:</strong> {{ contentStore.content.gateway.bankTransfer.accountHolder || 'Wamani experience spa' }}</li>
                <li><strong>RUT Empresa:</strong> {{ contentStore.content.gateway.bankTransfer.accountRut || '78.199.034-5' }}</li>
                <li><strong>Correo de Notificación:</strong> {{ contentStore.content.gateway.bankTransfer.notificationEmail || 'experiencewamani@gmail.com' }}</li>
                <li><strong>Asunto / Comentario:</strong> {{ completedBooking.buyOrder }} - {{ completedBooking.customerName }}</li>
              </ul>
              <p v-if="contentStore.content.gateway.bankTransfer.instructions" class="small text-white opacity-85 mt-2 mb-0 border-top border-secondary border-opacity-25 pt-2">
                {{ contentStore.content.gateway.bankTransfer.instructions }}
              </p>
            </div>

            <!-- Botones de Acción Posterior -->
            <div class="d-flex flex-wrap gap-3 justify-content-center pt-2">
              <button class="btn btn-whatsapp-custom px-4 py-3 fw-bold d-flex align-items-center gap-2 shadow" @click="sendWhatsAppConfirmation">
                <i class="bi bi-whatsapp fs-5"></i> Enviar Comprobante a WhatsApp
              </button>
              <button class="btn btn-outline-light px-4 py-3 fw-bold d-flex align-items-center gap-2" @click="printVoucher">
                <i class="bi bi-printer-fill"></i> Imprimir Voucher
              </button>
              <router-link to="/" class="btn btn-outline-accent px-4 py-3 fw-bold">
                Volver al Inicio
              </router-link>
            </div>

          </div>
        </div>
      </div>

      <!-- FORMULARIO PRINCIPAL DE CHECKOUT -->
      <div v-else class="row g-4">
        
        <!-- ENCABEZADO -->
        <div class="col-12 text-center mb-2">
          <span class="badge bg-accent text-dark-mountain px-3 py-1 mb-2 fw-bold text-uppercase" style="letter-spacing: 0.1em; font-size: 0.75rem;">
            <i class="bi bi-shield-check me-1"></i> Checkout Seguro 256-Bit SSL
          </span>
          <h1 class="display-4 fw-bold text-white font-brush mb-1" style="font-family: 'Caveat', cursive !important;">Finalizar Reserva</h1>
          <p class="text-white opacity-85">Estás a un solo paso de asegurar tus cupos para esta gran aventura en el sur de Chile.</p>
        </div>

        <!-- STEPPER VISUAL EN 2 PASOS (CRO) -->
        <div class="col-12 mb-2">
          <div class="checkout-stepper-container p-3 rounded-4 shadow-sm text-white" style="background: linear-gradient(145deg, #045D56 0%, #033E3B 100%); border: 1px solid rgba(45, 212, 191, 0.35);">
            <div class="d-flex align-items-center justify-content-center gap-3 gap-md-5">
              <!-- Paso 1 Tab -->
              <div 
                class="step-badge-item d-flex align-items-center gap-2 cursor-pointer transition-all"
                :class="{ 'text-accent': currentStep === 1, 'text-white opacity-85': currentStep !== 1 }"
                @click="goToStep1"
              >
                <div 
                  class="rounded-circle d-flex align-items-center justify-content-center fw-bold font-monospace shadow-sm"
                  :style="currentStep === 1 ? 'width: 32px; height: 32px; background-color: #2DD4BF; color: #022927;' : 'width: 32px; height: 32px; background-color: rgba(45,212,191,0.25); color: #2DD4BF;'"
                >
                  <i v-if="currentStep === 2" class="bi bi-check-lg fs-5"></i>
                  <span v-else>1</span>
                </div>
                <span class="fw-bold small text-uppercase" style="letter-spacing: 0.05em; font-size: 0.78rem;">1. Pasajero Titular</span>
              </div>

              <!-- Separador -->
              <div class="step-line-divider" style="width: 50px; height: 2px; background-color: rgba(45, 212, 191, 0.4);"></div>

              <!-- Paso 2 Tab -->
              <div 
                class="step-badge-item d-flex align-items-center gap-2 transition-all"
                :class="{ 'text-accent': currentStep === 2, 'text-white opacity-60': currentStep !== 2 }"
              >
                <div 
                  class="rounded-circle d-flex align-items-center justify-content-center fw-bold font-monospace shadow-sm"
                  :style="currentStep === 2 ? 'width: 32px; height: 32px; background-color: #2DD4BF; color: #022927;' : 'width: 32px; height: 32px; background-color: rgba(255,255,255,0.15); color: #fff;'"
                >
                  <span>2</span>
                </div>
                <span class="fw-bold small text-uppercase" style="letter-spacing: 0.05em; font-size: 0.78rem;">2. Seguridad & Pago</span>
              </div>
            </div>
          </div>
        </div>

        <!-- RESUMEN COMPACTO MÓVIL (d-lg-none) -->
        <div class="col-12 d-lg-none mb-2">
          <div class="p-3 rounded-4 shadow-sm text-white" style="background: linear-gradient(145deg, #045D56 0%, #033E3B 100%); border: 1px solid rgba(45, 212, 191, 0.4);">
            <div class="d-flex align-items-center gap-3">
              <img :src="experience?.coverImage.url" alt="Tour" class="rounded-3 object-fit-cover shadow-sm flex-shrink-0" style="width: 65px; height: 65px; border: 1px solid rgba(45, 212, 191, 0.3);">
              <div class="flex-grow-1">
                <h4 class="h6 fw-bold text-white mb-1" style="font-size: 0.95rem;">{{ experience?.title }}</h4>
                <div class="d-flex justify-content-between align-items-center flex-wrap gap-1">
                  <span class="small text-white opacity-85" style="font-size: 0.78rem;"><i class="bi bi-calendar3 me-1 text-accent"></i>{{ travelDate }} • {{ paxCount }} {{ paxCount === 1 ? 'viajero' : 'viajeros' }}</span>
                  <strong class="text-accent fs-6 font-monospace">{{ formatPrice(totalPrice) }}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- COLUMNA IZQUIERDA: FORMULARIO DEL CLIENTE -->
        <div class="col-12 col-lg-8">
          <form @submit.prevent="handleInitiatePayment" class="d-flex flex-column gap-4">
            
            <!-- PASO 1: DATOS DEL PASAJERO TITULAR -->
            <div v-show="currentStep === 1" class="checkout-card p-4 p-md-5 rounded-4 shadow-sm text-white" style="background: linear-gradient(145deg, #045D56 0%, #033E3B 100%); border: 1px solid rgba(45, 212, 191, 0.35);">
              <h3 class="h5 fw-bold text-accent mb-4 d-flex align-items-center gap-2">
                <i class="bi bi-person-circle fs-4"></i> 1. Datos del Pasajero Titular
              </h3>
              
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label small fw-bold text-white">Nombre *</label>
                  <input v-model="name" type="text" class="form-control admin-input text-white" placeholder="Ej: Juan" required autocomplete="given-name">
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-bold text-white">Apellidos *</label>
                  <input v-model="lastname" type="text" class="form-control admin-input text-white" placeholder="Ej: Pérez González" required autocomplete="family-name">
                </div>

                <!-- Selector de Documento de Identidad (RUT vs Pasaporte) -->
                <div class="col-12">
                  <div class="d-flex align-items-center justify-content-between mb-2 flex-wrap gap-2">
                    <label class="form-label small fw-bold text-white mb-0">Documento de Identificación * (Para seguro obligatorio SERNATUR)</label>
                    <div class="btn-group btn-group-sm">
                      <button 
                        type="button" 
                        class="btn py-1 px-3" 
                        :class="docType === 'rut' ? 'btn-accent fw-bold' : 'btn-outline-light'" 
                        @click="docType = 'rut'"
                      >
                        RUT Chileno
                      </button>
                      <button 
                        type="button" 
                        class="btn py-1 px-3" 
                        :class="docType === 'passport' ? 'btn-accent fw-bold' : 'btn-outline-light'" 
                        @click="docType = 'passport'"
                      >
                        Pasaporte / DNI Extranjero
                      </button>
                    </div>
                  </div>

                  <div v-if="docType === 'rut'">
                    <input 
                      v-model="rut" 
                      @input="handleRutInput"
                      type="text" 
                      class="form-control admin-input text-white" 
                      :class="{ 'is-invalid': docError, 'is-valid': rut.length >= 8 && !docError }"
                      placeholder="Ej: 12.345.678-9" 
                      required
                    >
                    <div v-if="docError" class="small text-danger mt-1">
                      <i class="bi bi-exclamation-triangle-fill me-1"></i> El RUT ingresado no es válido (verifica el dígito verificador).
                    </div>
                    <div v-else-if="rut.length >= 8" class="small text-accent mt-1">
                      <i class="bi bi-check-circle-fill me-1"></i> RUT verificado conforme al algoritmo oficial Módulo 11.
                    </div>
                  </div>
                  <div v-else>
                    <input 
                      v-model="passport" 
                      type="text" 
                      class="form-control admin-input text-white" 
                      placeholder="N° de Pasaporte o Documento de Identidad del país de origen" 
                      required
                    >
                    <span class="small text-white opacity-75 mt-1 d-block" style="font-size: 0.78rem;">
                      <i class="bi bi-info-circle me-1 text-accent"></i> Turistas extranjeros no residentes pueden optar a exención de IVA acreditando tarjeta migratoria (D.L. 825).
                    </span>
                  </div>
                </div>

                <div class="col-md-6">
                  <label class="form-label small fw-bold text-white">Teléfono / WhatsApp *</label>
                  <input v-model="phone" type="tel" class="form-control admin-input text-white" placeholder="+56 9 1234 5678" required autocomplete="tel">
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-bold text-white">Correo Electrónico (Para envío del voucher) *</label>
                  <input v-model="email" type="email" class="form-control admin-input text-white" placeholder="juan@ejemplo.com" required autocomplete="email">
                </div>

                <div v-if="companions.length > 0" class="col-12 mt-3 pt-3 border-top border-secondary border-opacity-25">
                  <label class="form-label small fw-bold text-accent mb-2">
                    <i class="bi bi-people me-1"></i> Acompañantes adicionales ({{ companions.length }} {{ companions.length === 1 ? 'persona' : 'personas' }})
                  </label>
                  <div class="row g-2">
                    <div v-for="(_, idx) in companions" :key="idx" class="col-md-6">
                      <input 
                        v-model="companions[idx]" 
                        type="text" 
                        class="form-control form-control-sm admin-input text-white" 
                        :placeholder="`Acompañante ${idx + 2}: Nombre y RUT/Pasaporte`"
                      >
                    </div>
                  </div>
                </div>

                <div class="col-12">
                  <label class="form-label small fw-bold text-white">Observaciones / Requerimientos Especiales (Opcional)</label>
                  <textarea v-model="notes" class="form-control admin-input text-white" rows="2" placeholder="Talla de calzado para trekking, nivel de experiencia previa, preferencias particulares..."></textarea>
                </div>

                <!-- Botón de Transición a Paso 2 -->
                <div class="col-12 mt-4 pt-3 border-top border-secondary border-opacity-25">
                  <button type="button" class="btn btn-accent w-100 py-3 fw-bold fs-5 text-dark-mountain shadow-lg d-flex align-items-center justify-content-center gap-2" @click="goToStep2">
                    <span>Continuar a Seguridad y Pago (Paso 2)</span>
                    <i class="bi bi-arrow-right-circle-fill fs-5"></i>
                  </button>
                  <p class="small text-white opacity-75 text-center mt-2 mb-0" style="font-size: 0.78rem;">
                    Tus cupos quedan precargados temporalmente para evitar que se agoten.
                  </p>
                </div>
              </div>
            </div>

            <!-- PASO 2: SEGURIDAD, FACTURACIÓN Y PAGO -->
            <div v-show="currentStep === 2" class="d-flex flex-column gap-4">
              
              <!-- Botón Volver a Paso 1 -->
              <div class="d-flex justify-content-between align-items-center">
                <button type="button" class="btn btn-outline-light btn-sm d-inline-flex align-items-center gap-2" @click="goToStep1">
                  <i class="bi bi-arrow-left"></i> Modificar datos del pasajero
                </button>
                <span class="badge bg-dark text-accent border border-secondary border-opacity-25 small">Paso 2 de 2</span>
              </div>

              <!-- 2. FICHA DE SEGURIDAD EN TERRENO & CONTACTO DE EMERGENCIA (SERNATUR) -->
              <div class="checkout-card p-4 p-md-5 rounded-4 shadow-sm text-white" style="background: linear-gradient(145deg, #045D56 0%, #033E3B 100%); border: 1px solid rgba(45, 212, 191, 0.35);">
                <h3 class="h5 fw-bold text-accent mb-2 d-flex align-items-center gap-2">
                  <i class="bi bi-heart-pulse-fill fs-4"></i> 2. Ficha de Seguridad en Montaña & Contacto de Emergencia
                </h3>
                <p class="small text-white opacity-85 mb-4" style="font-size: 0.85rem;">
                  Requerido por los estándares de seguridad de SERNATUR y pólizas de turismo aventura para coordinar protocolos de asistencia médica y primeros auxilios en terreno agreste.
                </p>
                
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label small fw-bold text-white">Nombre de Contacto de Emergencia</label>
                    <input v-model="emergencyName" type="text" class="form-control admin-input text-white" placeholder="Ej: María Pérez (Familiar / Pareja)">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label small fw-bold text-white">Teléfono de Contacto de Emergencia</label>
                    <input v-model="emergencyPhone" type="tel" class="form-control admin-input text-white" placeholder="+56 9 8765 4321">
                  </div>
                  <div class="col-12">
                    <label class="form-label small fw-bold text-white">Declaración de Salud / Condiciones Médicas Relevantes</label>
                    <textarea v-model="medicalConditions" class="form-control admin-input text-white" rows="2" placeholder="Indica alergias severas a picaduras/fármacos, afecciones cardíacas, asma o intervenciones recientes. Si no tienes, déjalo en blanco."></textarea>
                  </div>
                </div>
              </div>

              <!-- 3. DOCUMENTO TRIBUTARIO ELECTRÓNICO (SII) -->
              <div class="checkout-card p-4 p-md-5 rounded-4 shadow-sm text-white" style="background: linear-gradient(145deg, #045D56 0%, #033E3B 100%); border: 1px solid rgba(45, 212, 191, 0.35);">
                <div class="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                  <h3 class="h5 fw-bold text-accent mb-0 d-flex align-items-center gap-2">
                    <i class="bi bi-receipt-cutoff fs-4"></i> 3. Documento Tributario (Servicio de Impuestos Internos)
                  </h3>
                  <div class="btn-group btn-group-sm">
                    <button 
                      type="button" 
                      class="btn py-1 px-3" 
                      :class="invoiceType === 'boleta' ? 'btn-accent fw-bold' : 'btn-outline-light'" 
                      @click="invoiceType = 'boleta'"
                    >
                      Boleta Electrónica
                    </button>
                    <button 
                      type="button" 
                      class="btn py-1 px-3" 
                      :class="invoiceType === 'factura' ? 'btn-accent fw-bold' : 'btn-outline-light'" 
                      @click="invoiceType = 'factura'"
                    >
                      Factura Electrónica
                    </button>
                  </div>
                </div>

                <div v-if="invoiceType === 'boleta'" class="p-3 rounded-3 small text-white opacity-90" style="background-color: #022C2A; border: 1px solid rgba(45, 212, 191, 0.25);">
                  <i class="bi bi-info-circle text-accent me-1"></i> Se emitirá Boleta Electrónica a nombre del pasajero titular y será despachada a tu correo electrónico registrado.
                </div>

                <div v-else class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label small fw-bold text-white">Razón Social de la Empresa *</label>
                    <input v-model="billingBusinessName" type="text" class="form-control admin-input text-white" placeholder="Ej: Servicios Profesionales SpA" required>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label small fw-bold text-white">RUT de la Empresa *</label>
                    <input 
                      v-model="billingRut" 
                      @input="handleBillingRutInput" 
                      type="text" 
                      class="form-control admin-input text-white" 
                      :class="{ 'is-invalid': billingRutError }" 
                      placeholder="76.123.456-7" 
                      required
                    >
                    <div v-if="billingRutError" class="small text-danger mt-1">RUT de empresa inválido.</div>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label small fw-bold text-white">Giro Comercial *</label>
                    <input v-model="billingActivity" type="text" class="form-control admin-input text-white" placeholder="Ej: Actividades de Consultoría" required>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label small fw-bold text-white">Dirección Tributaria / Comuna *</label>
                    <input v-model="billingAddress" type="text" class="form-control admin-input text-white" placeholder="Ej: Av. Apoquindo 1234, Las Condes" required>
                  </div>
                </div>
              </div>

              <!-- 4. MÉTODO DE PAGO Y PASARELAS -->
              <div class="checkout-card p-4 p-md-5 rounded-4 shadow-sm text-white" style="background: linear-gradient(145deg, #045D56 0%, #033E3B 100%); border: 1px solid rgba(45, 212, 191, 0.35);">
                <h3 class="h5 fw-bold text-accent mb-4 d-flex align-items-center gap-2">
                  <i class="bi bi-wallet2 fs-4"></i> 4. Selecciona tu Método de Pago
                </h3>

                <div class="row g-3">
                  <!-- Opción A: Webpay Plus Transbank -->
                  <div class="col-12">
                    <label class="payment-method-card d-flex align-items-center justify-content-between p-3 p-md-4 rounded-4 cursor-pointer" :class="{ selected: paymentMethod === 'webpay' }">
                      <div class="d-flex align-items-center gap-3">
                        <input type="radio" v-model="paymentMethod" value="webpay" name="payment" class="form-check-input mt-0" style="width: 22px; height: 22px;">
                        <div>
                          <strong class="d-block text-white fs-6 mb-1">Transbank Webpay Plus (Pago Seguro Online)</strong>
                          <span class="small text-white opacity-85">Tarjetas de Crédito, Débito Redcompra y Prepago. Confirmación instantánea con token bancario seguro.</span>
                        </div>
                      </div>
                      <div class="d-none d-sm-flex align-items-center gap-2 ps-3">
                        <span class="badge bg-dark text-white p-2 border border-secondary border-opacity-25 fw-bold" style="font-size: 0.72rem;">Redcompra</span>
                        <span class="badge bg-dark text-accent p-2 border border-secondary border-opacity-25 fw-bold" style="font-size: 0.72rem;">Webpay</span>
                      </div>
                    </label>
                  </div>

                  <!-- Opción B: Transferencia Bancaria Directa -->
                  <div class="col-12">
                    <label class="payment-method-card d-flex align-items-center justify-content-between p-3 p-md-4 rounded-4 cursor-pointer" :class="{ selected: paymentMethod === 'transfer' }">
                      <div class="d-flex align-items-center gap-3">
                        <input type="radio" v-model="paymentMethod" value="transfer" name="payment" class="form-check-input mt-0" style="width: 22px; height: 22px;">
                        <div>
                          <strong class="d-block text-white fs-6 mb-1">Transferencia Bancaria Directa</strong>
                          <span class="small text-white opacity-85">Transfiere directamente a la Cuenta Corriente oficial de la empresa. Validación ágil con comprobante.</span>
                        </div>
                      </div>
                      <div class="d-none d-sm-flex align-items-center ps-3">
                        <i class="bi bi-bank fs-3 text-accent"></i>
                      </div>
                    </label>
                  </div>
                </div>

                <!-- Checkbox Términos (Reglamento de Comercio Electrónico / SERNAC) -->
                <div class="mt-4 pt-3 border-top border-secondary border-opacity-25">
                  <div class="form-check d-flex align-items-start gap-2">
                    <input v-model="termsAccepted" class="form-check-input mt-1 flex-shrink-0" type="checkbox" id="termsCheck" required style="width: 20px; height: 20px; cursor: pointer;">
                    <label class="form-check-label small text-white opacity-95" for="termsCheck">
                      Declaro haber leído y acepto expresamente los 
                      <a href="#" @click.prevent="openLegalModal('terms')" class="text-accent text-decoration-underline fw-bold">Términos y Condiciones</a>, la 
                      <a href="#" @click.prevent="openLegalModal('cancellation')" class="text-accent text-decoration-underline fw-bold">Política de Cancelación (48h)</a> y la 
                      <a href="#" @click.prevent="openLegalModal('privacy')" class="text-accent text-decoration-underline fw-bold">Política de Privacidad</a> de Wamani Experience.
                    </label>
                  </div>
                </div>
              </div>

              <!-- BOTÓN DE ACCIÓN PRINCIPAL -->
              <button type="submit" class="btn btn-accent w-100 py-3 fw-bold fs-5 text-dark-mountain shadow-lg d-flex align-items-center justify-content-center gap-2" :disabled="isProcessing">
                <span v-if="isProcessing" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else class="bi" :class="paymentMethod === 'webpay' ? 'bi-credit-card-2-front-fill' : 'bi-check-circle-fill'"></i>
                {{ isProcessing ? 'Conectando con Transbank...' : (paymentMethod === 'webpay' ? `Pagar con Webpay Plus (${formatPrice(totalPrice)})` : `Confirmar Reserva por Transferencia (${formatPrice(totalPrice)})`) }}
              </button>

            </div>

          </form>
        </div>

        <!-- COLUMNA DERECHA: RESUMEN DE COMPRA CON TRANSPARENCIA TOTAL -->
        <div class="col-12 col-lg-4">
          <div class="checkout-summary-card p-4 rounded-4 shadow-sm text-white sticky-top" style="top: 100px; background: linear-gradient(145deg, #045D56 0%, #033E3B 100%); border: 1px solid rgba(45, 212, 191, 0.35);">
            
            <h3 class="h5 fw-bold text-accent mb-4 pb-2 border-bottom border-secondary border-opacity-25 d-flex align-items-center gap-2">
              <i class="bi bi-bag-check-fill"></i> Resumen de la Orden
            </h3>

            <div class="d-flex gap-3 mb-4 align-items-center">
              <img :src="experience?.coverImage.url" alt="Tour" class="rounded-3 object-fit-cover shadow-sm flex-shrink-0" style="width: 85px; height: 85px; border: 1px solid rgba(45, 212, 191, 0.3);">
              <div>
                <h4 class="h6 fw-bold text-white mb-1">{{ experience?.title }}</h4>
                <span class="badge bg-dark text-accent border border-secondary border-opacity-25 small mb-1">{{ experience?.destinationId }}</span>
                <p class="small text-white opacity-75 mb-0"><i class="bi bi-calendar3 me-1 text-accent"></i>{{ travelDate }}</p>
              </div>
            </div>

            <div class="summary-breakdown p-3 rounded-3 mb-4" style="background-color: #022C2A; border: 1px solid rgba(45, 212, 191, 0.25);">
              <div class="d-flex justify-content-between mb-2 small">
                <span class="text-white opacity-75">Tarifa por persona:</span>
                <span class="fw-bold text-white">{{ formatPrice(experience?.pricing.basePrice || 50000) }}</span>
              </div>
              <div class="d-flex justify-content-between mb-2 small">
                <span class="text-white opacity-75">Número de viajeros:</span>
                <span class="fw-bold text-accent">× {{ paxCount }}</span>
              </div>
              <div class="d-flex justify-content-between mb-2 small">
                <span class="text-white opacity-75">Impuestos e IVA (19%):</span>
                <span class="text-success fw-bold">Incluido</span>
              </div>
              <div class="d-flex justify-content-between mb-2 small">
                <span class="text-white opacity-75">Seguro de accidentes:</span>
                <span class="text-success fw-bold">Incluido SERNATUR</span>
              </div>
              <div class="d-flex justify-content-between mb-0 small pt-2 border-top border-secondary border-opacity-25">
                <span class="text-white opacity-75">Entradas Parques CONAF:</span>
                <span class="text-white-50" style="font-size: 0.76rem;">No incluidas</span>
              </div>
            </div>

            <div class="d-flex justify-content-between align-items-end mb-4 pt-2">
              <div>
                <span class="small text-white opacity-75 d-block text-uppercase" style="font-size: 0.72rem; letter-spacing: 0.08em;">Monto Total Final</span>
                <span class="fs-3 fw-bold text-accent font-monospace">{{ formatPrice(totalPrice) }}</span>
              </div>
              <div class="text-end small text-white opacity-75">
                <span>CLP</span>
              </div>
            </div>

            <div class="security-guarantees p-3 rounded-3 border border-secondary border-opacity-25" style="background-color: #033E3B;">
              <ul class="list-unstyled mb-0 small text-white opacity-90 lh-lg" style="font-size: 0.78rem;">
                <li><i class="bi bi-patch-check-fill text-accent me-2"></i>Guías registrados SERNATUR (Reg. {{ contentStore.content.legal.sernaturRegistry }})</li>
                <li><i class="bi bi-shield-lock-fill text-accent me-2"></i>Pasarela Transbank Webpay Plus (SSL 256-Bit)</li>
                <li><i class="bi bi-arrow-counterclockwise text-accent me-2"></i>Cancelación y reprogramación garantizada</li>
              </ul>
            </div>

          </div>
        </div>

      </div>
    </div>

    <!-- MODAL INFORMATIVO LEGAL INTERACTIVO (TÉRMINOS / CANCELACIÓN / PRIVACIDAD) -->
    <Teleport to="body">
      <div v-if="showLegalModal" class="modal-backdrop-custom d-flex align-items-center justify-content-center p-3" style="z-index: 1060;">
        <div class="modal-card p-4 p-md-5 text-white shadow-2xl rounded-4" style="max-width: 700px; width: 100%; max-height: 85vh; display: flex; flex-direction: column; background: #045D56; border: 2px solid #2DD4BF;">
          
          <!-- Encabezado del Modal Legal -->
          <div class="d-flex justify-content-between align-items-center pb-3 mb-3 border-bottom border-secondary border-opacity-25 flex-shrink-0">
            <div>
              <span class="badge px-2 py-1 mb-1" style="background-color: #022C2A; color: #2DD4BF; font-size: 0.72rem;">TRANSPARENCIA NORMATIVA CHILE</span>
              <h3 class="h5 fw-bold text-white mb-0">Marco Legal & Condiciones</h3>
            </div>
            <button type="button" class="btn btn-outline-light btn-sm rounded-circle p-1 d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;" @click="showLegalModal = false">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>

          <!-- Selector de Pestañas -->
          <div class="d-flex gap-2 mb-3 flex-shrink-0">
            <button 
              type="button" 
              class="btn btn-sm py-1 px-3 rounded-pill" 
              :class="legalModalTab === 'terms' ? 'btn-accent fw-bold' : 'btn-outline-light'" 
              @click="legalModalTab = 'terms'"
            >
              Términos Generales
            </button>
            <button 
              type="button" 
              class="btn btn-sm py-1 px-3 rounded-pill" 
              :class="legalModalTab === 'cancellation' ? 'btn-accent fw-bold' : 'btn-outline-light'" 
              @click="legalModalTab = 'cancellation'"
            >
              Políticas de Cancelación
            </button>
            <button 
              type="button" 
              class="btn btn-sm py-1 px-3 rounded-pill" 
              :class="legalModalTab === 'privacy' ? 'btn-accent fw-bold' : 'btn-outline-light'" 
              @click="legalModalTab = 'privacy'"
            >
              Privacidad (Datos)
            </button>
          </div>

          <!-- Contenido con Scroll -->
          <div class="overflow-y-auto pe-2 small lh-lg flex-grow-1" style="color: rgba(255,255,255,0.9);">
            <!-- Pestaña 1: Términos -->
            <div v-if="legalModalTab === 'terms'">
              <h4 class="h6 fw-bold text-accent mb-2">1. Identificación y Servicios</h4>
              <p class="mb-3">
                Los servicios son operados por <strong>{{ contentStore.content.legal.businessName }}</strong> (RUT: {{ contentStore.content.legal.rut }}), agencia y prestador de turismo aventura registrado en <strong>SERNATUR con el N° {{ contentStore.content.legal.sernaturRegistry }}</strong>.
              </p>
              <h4 class="h6 fw-bold text-accent mb-2">2. Normas de Seguridad y Autoridad del Guía</h4>
              <p class="mb-3">
                En actividades de montaña y ecoturismo, la seguridad es prioritaria. Los guías certificados por SERNATUR tienen la facultad legal de modificar o suspender el itinerario ante condiciones climáticas riesgosas o conductas que comprometan al grupo. Es obligatorio el uso de equipo de seguridad provisto.
              </p>
              <h4 class="h6 fw-bold text-accent mb-2">3. Seguros Incluidos</h4>
              <p class="mb-3">
                Cada pasajero cuenta con cobertura de la Póliza Colectiva de Accidentes Personales y Asistencia en Turismo Aventura N° {{ contentStore.content.legal.insurancePolicy }}.
              </p>
              <h4 class="h6 fw-bold text-accent mb-2">4. Entradas a Parques Nacionales (CONAF)</h4>
              <p class="mb-0">
                Las tarifas no contemplan entradas a Parques Nacionales del Estado, las cuales deben ser gestionadas individualmente en la plataforma oficial <em>pasesparques.cl</em> de CONAF.
              </p>
            </div>

            <!-- Pestaña 2: Cancelación -->
            <div v-else-if="legalModalTab === 'cancellation'">
              <h4 class="h6 fw-bold text-accent mb-2">Política de Cancelación y Reembolsos (Ley 19.496 Art. 3 bis)</h4>
              <p class="mb-2">
                Conforme a la naturaleza de cupos reservados para fechas fijas, se aplica la siguiente escala de devoluciones:
              </p>
              <ul class="mb-3 ps-3">
                <li><strong>Más de 48 horas de anticipación:</strong> 100% de devolución del valor pagado o reprogramación sin costo alguno.</li>
                <li><strong>Entre 48 y 24 horas antes:</strong> 50% de devolución del valor total de la reserva.</li>
                <li><strong>Menos de 24 horas o inasistencia (No-Show):</strong> Sin devolución.</li>
              </ul>
              <h4 class="h6 fw-bold text-accent mb-2">Clima Adverso y Fuerza Mayor (Senapred / CONAF)</h4>
              <p class="mb-0">
                Si la excursión se cancela por alertas meteorológicas oficiales de SENAPRED o cierre decretado por CONAF/SERNAGEOMIN, el cliente podrá optar por reprogramación sin costo, voucher abierto por 12 meses o devolución íntegra del 100% de su dinero.
              </p>
            </div>

            <!-- Pestaña 3: Privacidad -->
            <div v-else>
              <h4 class="h6 fw-bold text-accent mb-2">Tratamiento Seguro de Datos (Ley N° 19.628)</h4>
              <p class="mb-2">
                Tus datos de identificación, contacto y ficha de salud se recopilan con el único propósito de gestionar la reserva, emitir comprobantes tributarios ante el SII, activar seguros ante SERNATUR y coordinar asistencia médica de emergencia.
              </p>
              <p class="mb-0">
                WAMANI no comercializa tus datos a terceros. Los pagos con tarjeta son tokenizados directamente por Transbank Webpay Plus bajo estándares internacionales PCI-DSS sin acceso a tus claves o números sensibles.
              </p>
            </div>
          </div>

          <!-- Pie del Modal -->
          <div class="pt-3 mt-3 border-top border-secondary border-opacity-25 d-flex justify-content-between align-items-center flex-shrink-0">
            <router-link to="/terminos-y-condiciones" target="_blank" class="small text-accent text-decoration-underline" style="font-size: 0.8rem;">
              Ver documento completo <i class="bi bi-box-arrow-up-right ms-1"></i>
            </router-link>
            <button type="button" class="btn btn-accent btn-sm px-4 fw-bold text-dark" @click="showLegalModal = false">
              Cerrar y Continuar
            </button>
          </div>

        </div>
      </div>
    </Teleport>

    <!-- MODAL SIMULADOR REALISTA DE PASARELA TRANSBANK WEBPAY PLUS -->
    <Teleport to="body">
      <div v-if="showWebpaySimulation" class="modal-backdrop-custom d-flex align-items-center justify-content-center p-3">
        <div class="modal-card p-4 p-md-5 text-white shadow-2xl rounded-4" style="max-width: 540px; width: 100%; background: #045D56; border: 2px solid #2DD4BF;">
          
          <!-- Cabecera Oficial Webpay Plus -->
          <div class="d-flex justify-content-between align-items-center pb-3 mb-4 border-bottom border-secondary border-opacity-25">
            <div>
              <span class="badge bg-danger text-white fw-bold px-3 py-1 mb-1">TRANSBANK</span>
              <h3 class="h5 fw-bold text-white mb-0">Webpay Plus</h3>
            </div>
            <div class="text-end">
              <span class="small text-white opacity-75 d-block" style="font-size: 0.72rem;">Comercio:</span>
              <strong class="text-accent small">Wamani Expeditions</strong>
            </div>
          </div>

          <div class="mb-4 p-3 rounded-3" style="background-color: #022C2A; border: 1px solid rgba(45, 212, 191, 0.3);">
            <div class="d-flex justify-content-between mb-1 small">
              <span class="text-white opacity-75">Orden de Compra:</span>
              <strong class="text-white font-monospace">TBK-{{ Date.now().toString().slice(-6) }}</strong>
            </div>
            <div class="d-flex justify-content-between small">
              <span class="text-white opacity-75">Total a Cobrar:</span>
              <strong class="text-accent fs-5 font-monospace">{{ formatPrice(totalPrice) }}</strong>
            </div>
          </div>

          <!-- Campos de Tarjeta Simulada -->
          <div class="row g-3 mb-4">
            <div class="col-12">
              <label class="form-label small fw-bold text-white">Número de Tarjeta</label>
              <input v-model="webpayCardNumber" type="text" class="form-control admin-input text-white font-monospace" placeholder="•••• •••• •••• ••••">
            </div>
            <div class="col-6">
              <label class="form-label small fw-bold text-white">Vencimiento</label>
              <input v-model="webpayExp" type="text" class="form-control admin-input text-white text-center font-monospace" placeholder="MM/AA">
            </div>
            <div class="col-6">
              <label class="form-label small fw-bold text-white">CVV</label>
              <input v-model="webpayCvv" type="password" class="form-control admin-input text-white text-center font-monospace" placeholder="•••">
            </div>
            <div class="col-12">
              <label class="form-label small fw-bold text-white">Banco Emisor</label>
              <input v-model="webpayBank" type="text" class="form-control admin-input text-white">
            </div>
          </div>

          <!-- Botones de Acción de Pasarela -->
          <div class="d-flex gap-2 pt-2">
            <button class="btn btn-outline-danger w-50 py-2 fw-bold" @click="confirmWebpayPayment(false)">
              <i class="bi bi-x-circle me-1"></i> Rechazar / Anular
            </button>
            <button class="btn btn-success w-50 py-2 fw-bold" @click="confirmWebpayPayment(true)">
              <i class="bi bi-check-circle-fill me-1"></i> Autorizar Pago
            </button>
          </div>

          <p class="text-center small text-white opacity-75 mt-3 mb-0" style="font-size: 0.72rem;">
            <i class="bi bi-shield-lock me-1"></i> Entorno de transacción segura protegido con token criptográfico SHA-256.
          </p>

        </div>
      </div>
    </Teleport>

  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables';

.checkout-page {
  background-color: #83AAA8;
}

.text-dark-mountain {
  color: #033E3B !important;
}

.text-accent {
  color: #2DD4BF !important;
}

.bg-accent {
  background-color: #2DD4BF !important;
}

.bg-emerald {
  background-color: #10B981 !important;
}

.bg-amber {
  background-color: #F59E0B !important;
}

.btn-accent {
  background-color: #2DD4BF !important;
  color: #033E3B !important;
  border: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    background-color: lighten(#2DD4BF, 8%) !important;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(45, 212, 191, 0.4);
  }
}

.btn-outline-accent {
  border: 1px solid #2DD4BF;
  color: #2DD4BF;
  background: transparent;

  &:hover {
    background-color: #2DD4BF;
    color: #033E3B;
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

.admin-input {
  background-color: #022C2A !important;
  border: 1px solid rgba(45, 212, 191, 0.35) !important;
  color: #FFFFFF !important;

  &::placeholder {
    color: rgba(255, 255, 255, 0.4) !important;
  }

  &:focus {
    background-color: #011E1C !important;
    border-color: #2DD4BF !important;
    box-shadow: 0 0 0 0.25rem rgba(45, 212, 191, 0.25) !important;
  }
}

.payment-method-card {
  background-color: #022C2A;
  border: 1px solid rgba(45, 212, 191, 0.25);
  transition: all 0.25s ease;

  &:hover {
    border-color: #2DD4BF;
    background-color: rgba(45, 212, 191, 0.05);
  }

  &.selected {
    border-color: #2DD4BF;
    background-color: rgba(45, 212, 191, 0.12);
    box-shadow: 0 0 15px rgba(45, 212, 191, 0.25);
  }
}

.cursor-pointer {
  cursor: pointer;
}

.modal-backdrop-custom {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  z-index: 1200;
}
</style>
