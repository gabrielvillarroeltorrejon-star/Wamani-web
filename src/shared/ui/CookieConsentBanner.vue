<script setup lang="ts">
import { ref, onMounted } from 'vue';

const isVisible = ref(false);

onMounted(() => {
  const consent = localStorage.getItem('wamani_cookie_consent');
  if (!consent) {
    // Mostrar después de un breve instante para una mejor UX
    setTimeout(() => {
      isVisible.value = true;
    }, 1200);
  }
});

const acceptAll = () => {
  localStorage.setItem('wamani_cookie_consent', 'all');
  isVisible.value = false;
};

const acceptEssential = () => {
  localStorage.setItem('wamani_cookie_consent', 'essential');
  isVisible.value = false;
};
</script>

<template>
  <Transition name="fade-slide">
    <aside 
      v-if="isVisible" 
      class="cookie-banner position-fixed bottom-0 start-0 w-100 z-3 p-3 p-md-4"
      role="region"
      aria-label="Aviso de Cookies y Privacidad"
    >
      <div class="container">
        <div class="cookie-card p-3 p-md-4 rounded-4 shadow-2xl text-white d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3" style="background: linear-gradient(135deg, #033E3B 0%, #022C2A 100%); border: 1px solid rgba(45, 212, 191, 0.45); box-shadow: 0 10px 40px rgba(0,0,0,0.45);">
          
          <div class="d-flex align-items-start gap-3">
            <div class="cookie-icon flex-shrink-0 mt-1 d-none d-sm-flex align-items-center justify-content-center rounded-circle" style="width: 44px; height: 44px; background: rgba(45, 212, 191, 0.15); color: #2DD4BF;">
              <i class="bi bi-shield-check fs-4"></i>
            </div>
            <div>
              <p class="mb-1 fw-bold text-accent" style="font-size: 0.95rem; letter-spacing: 0.05em;">
                Privacidad y Cookies en Wamani Experience
              </p>
              <p class="mb-0 small text-white opacity-85 lh-base" style="font-size: 0.85rem;">
                Utilizamos cookies técnicas y analíticas para optimizar tu experiencia de reserva, garantizar la seguridad de tus transacciones y recordar tus preferencias. Conoce más en nuestra 
                <router-link to="/politica-de-cookies" class="text-accent text-decoration-underline ms-1">Política de Cookies</router-link>.
              </p>
            </div>
          </div>

          <div class="d-flex align-items-center gap-2 flex-shrink-0 justify-content-end">
            <button 
              type="button" 
              class="btn btn-outline-light btn-sm px-3 py-2 fw-medium rounded-3" 
              style="font-size: 0.82rem;" 
              @click="acceptEssential"
              aria-label="Aceptar solo cookies esenciales"
            >
              Solo Esenciales
            </button>
            <button 
              type="button" 
              class="btn btn-sm px-4 py-2 fw-bold text-dark rounded-3 shadow-sm" 
              style="background-color: #2DD4BF; color: #022927 !important; font-size: 0.82rem;" 
              @click="acceptAll"
              aria-label="Aceptar todas las cookies"
            >
              Aceptar Todo
            </button>
          </div>

        </div>
      </div>
    </aside>
  </Transition>
</template>

<style scoped>
.z-3 {
  z-index: 1050;
}
.text-accent {
  color: #2DD4BF !important;
}
.cookie-banner {
  pointer-events: none;
}
.cookie-card {
  pointer-events: auto;
}
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(30px);
}
</style>
