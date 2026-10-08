<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import CartDrawer from '@/widgets/cart-drawer/CartDrawer.vue'
import WhatsAppButton from '@/shared/ui/WhatsAppButton.vue'
import MountainDivider from '@/shared/ui/MountainDivider.vue'
import CookieConsentBanner from '@/shared/ui/CookieConsentBanner.vue'
import { useContentStore } from '@/shared/stores/contentStore'

const route = useRoute()
const contentStore = useContentStore()

const isMobileMenuOpen = ref(false)
const isScrolled = ref(false)

const handleScroll = () => {
  isScrolled.value = window.scrollY > 40
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
  document.body.style.overflow = isMobileMenuOpen.value ? 'hidden' : ''
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
  document.body.style.overflow = ''
}

watch(() => route.fullPath, () => {
  closeMobileMenu()
})

const changeLanguage = (langCode: string) => {
  const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
  if (select) {
    select.value = langCode;
    select.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
    
    // Forzar el disparo nativo si el Event simple no lo agarra
    if (typeof (document as any).createEvent === 'function') {
      const event = (document as any).createEvent('HTMLEvents');
      event.initEvent('change', true, true);
      select.dispatchEvent(event);
    }
  } else {
    // Fallback absoluto: Cookie + Reload
    const domain = window.location.hostname;
    document.cookie = `googtrans=/es/${langCode}; path=/;`;
    if (domain !== 'localhost') {
      document.cookie = `googtrans=/es/${langCode}; domain=.${domain}; path=/;`;
    }
    window.location.reload();
  }
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // Configuración global para Google Translate
  (window as any).googleTranslateElementInit = () => {
    new (window as any).google.translate.TranslateElement({
      pageLanguage: 'es',
      includedLanguages: 'es,en,pt,fr,zh-CN,it',
      layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE
    }, 'google_translate_element');
  };

  // Inyectar el script de Google Translate si no existe
  if (!document.getElementById('google-translate-script')) {
    const script = document.createElement('script');
    script.id = 'google-translate-script';
    script.type = 'text/javascript';
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.head.appendChild(script);
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div class="app-layout">
    <!-- Navbar Fija Inteligente (Transparente al inicio, con fondo blur al hacer scroll) -->
    <header 
      v-if="route.name !== 'admin'" 
      class="navbar-sticky-wrapper fixed-top w-100 z-3 transition-all"
      :class="{ 'navbar-scrolled shadow-lg': isScrolled, 'navbar-transparent py-3 py-lg-4': !isScrolled }"
    >
      <div class="container-fluid px-3 px-md-5 d-flex justify-content-between align-items-center position-relative">
        
        <!-- Logo compacto que emerge suavemente al hacer scroll -->
        <router-link 
          to="/" 
          class="navbar-scrolled-logo d-flex align-items-center gap-2 text-decoration-none"
          :class="{ 'opacity-100': isScrolled, 'opacity-0 pointer-events-none': !isScrolled }"
        >
          <img src="/Logo Wamani.png" alt="Wamani Logo" height="34" width="34" class="d-inline-block" />
          <span class="font-serif fw-bold text-white fs-6 d-none d-sm-inline" style="letter-spacing: 0.12em;">WAMANI</span>
        </router-link>

        <!-- Navegación Desktop Centrada -->
        <nav class="d-none d-lg-flex gap-4 gap-xl-5 text-uppercase font-sans fw-medium mx-auto" style="font-size: 0.85rem; letter-spacing: 0.12em;">
          <router-link to="/" class="text-white text-decoration-none nav-link-custom">Inicio</router-link>
          <router-link to="/experiencias" class="text-white text-decoration-none nav-link-custom">Expediciones</router-link>
          <router-link :to="{ path: '/', hash: '#servicios' }" class="text-white text-decoration-none nav-link-custom">Servicios</router-link>
          <router-link :to="{ path: '/', hash: '#destinos' }" class="text-white text-decoration-none nav-link-custom">Destinos</router-link>
          <router-link :to="{ path: '/', hash: '#opiniones' }" class="text-white text-decoration-none nav-link-custom">Reseñas</router-link>
          <router-link to="/nosotros" class="text-white text-decoration-none nav-link-custom">Nosotros</router-link>
        </nav>

        <!-- Controles Desktop (CTA + Idiomas) -->
        <div class="d-none d-lg-flex align-items-center gap-3">
          <!-- CTA Directo de Reserva -->
          <router-link to="/experiencias" class="btn btn-sm btn-accent-navbar fw-bold text-uppercase d-inline-flex align-items-center gap-2 text-decoration-none shadow-sm">
            <span>Ver Expediciones</span>
            <i class="bi bi-compass"></i>
          </router-link>

          <!-- Idiomas Desktop -->
          <div class="dropdown">
            <button class="btn btn-link text-white p-0 border-0 fs-5 lh-1 dropdown-toggle text-decoration-none d-flex align-items-center gap-1" type="button" data-bs-toggle="dropdown" aria-expanded="false" title="Cambiar idioma">
              <i class="fa-solid fa-globe opacity-90"></i>
            </button>
            <ul class="dropdown-menu dropdown-menu-end shadow-sm border-0">
              <li><a class="dropdown-item" href="#" @click.prevent="changeLanguage('es')"><span class="fi fi-es me-2"></span> Español</a></li>
              <li><a class="dropdown-item" href="#" @click.prevent="changeLanguage('en')"><span class="fi fi-gb me-2"></span> Inglés</a></li>
              <li><a class="dropdown-item" href="#" @click.prevent="changeLanguage('pt')"><span class="fi fi-br me-2"></span> Português</a></li>
              <li><a class="dropdown-item" href="#" @click.prevent="changeLanguage('fr')"><span class="fi fi-fr me-2"></span> Français</a></li>
              <li><a class="dropdown-item" href="#" @click.prevent="changeLanguage('it')"><span class="fi fi-it me-2"></span> Italiano</a></li>
              <li><a class="dropdown-item" href="#" @click.prevent="changeLanguage('zh-CN')"><span class="fi fi-cn me-2"></span> 中文</a></li>
            </ul>
          </div>
        </div>

        <!-- Controles Mobile / Tablet (d-flex d-lg-none) -->
        <div class="d-flex d-lg-none w-100 justify-content-end align-items-center gap-3">
          <router-link to="/experiencias" class="btn btn-sm btn-accent-navbar fw-bold text-uppercase px-3 py-1 d-inline-flex align-items-center gap-1 text-decoration-none" style="font-size: 0.72rem;">
            <span>Tours</span>
            <i class="bi bi-compass"></i>
          </router-link>

          <div class="dropdown">
            <button class="btn btn-link text-white p-0 border-0 fs-5 lh-1 dropdown-toggle text-decoration-none" type="button" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Cambiar idioma">
              <i class="fa-solid fa-globe opacity-90"></i>
            </button>
            <ul class="dropdown-menu dropdown-menu-end shadow-sm border-0">
              <li><a class="dropdown-item" href="#" @click.prevent="changeLanguage('es')"><span class="fi fi-es me-2"></span> Español</a></li>
              <li><a class="dropdown-item" href="#" @click.prevent="changeLanguage('en')"><span class="fi fi-gb me-2"></span> Inglés</a></li>
              <li><a class="dropdown-item" href="#" @click.prevent="changeLanguage('pt')"><span class="fi fi-br me-2"></span> Português</a></li>
              <li><a class="dropdown-item" href="#" @click.prevent="changeLanguage('fr')"><span class="fi fi-fr me-2"></span> Français</a></li>
              <li><a class="dropdown-item" href="#" @click.prevent="changeLanguage('it')"><span class="fi fi-it me-2"></span> Italiano</a></li>
              <li><a class="dropdown-item" href="#" @click.prevent="changeLanguage('zh-CN')"><span class="fi fi-cn me-2"></span> 中文</a></li>
            </ul>
          </div>

          <!-- Botón Hamburguesa -->
          <button class="btn btn-link text-white p-1 border-0 fs-2 lh-1" @click="toggleMobileMenu" aria-label="Abrir menú">
            <i class="bi bi-list"></i>
          </button>
        </div>

        <!-- Traductor real oculto -->
        <div id="google_translate_element" class="position-absolute opacity-0" style="pointer-events: none; width: 1px; height: 1px; overflow: hidden;"></div>

      </div>
    </header>

    <!-- MENÚ LATERAL MÓVIL (DRAWER RESPONSIVO) -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="isMobileMenuOpen" class="mobile-menu-backdrop" @click="closeMobileMenu">
          <div class="mobile-menu-drawer p-4 d-flex flex-column justify-content-between" @click.stop>
            
            <div>
              <div class="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-secondary border-opacity-25">
                <div class="d-flex align-items-center gap-2">
                  <img src="/Logo Wamani.png" alt="Wamani" height="36" width="36" />
                  <span class="font-serif fw-bold text-white fs-5" style="letter-spacing: 0.1em;">WAMANI</span>
                </div>
                <button class="btn btn-outline-light btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center" style="width: 44px; height: 44px;" @click="closeMobileMenu" aria-label="Cerrar menú móvil">
                  <i class="bi bi-x-lg"></i>
                </button>
              </div>

              <!-- Links de Navegación Móvil -->
              <nav class="d-flex flex-column gap-3 py-2">
                <!-- CTA Móvil -->
                <router-link to="/experiencias" class="btn btn-accent-navbar w-100 py-2 fw-bold text-uppercase mb-2 d-flex align-items-center justify-content-center gap-2 text-decoration-none shadow-sm" @click="closeMobileMenu">
                  <i class="bi bi-compass"></i> Ver Expediciones
                </router-link>

                <router-link to="/" class="mobile-nav-link" @click="closeMobileMenu">
                  <i class="bi bi-house-door me-2 text-accent"></i>Inicio
                </router-link>
                <router-link to="/experiencias" class="mobile-nav-link" @click="closeMobileMenu">
                  <i class="bi bi-compass me-2 text-accent"></i>Expediciones & Tours
                </router-link>
                <router-link :to="{ path: '/', hash: '#servicios' }" class="mobile-nav-link" @click="closeMobileMenu">
                  <i class="bi bi-stars me-2 text-accent"></i>Nuestros Servicios
                </router-link>
                <router-link :to="{ path: '/', hash: '#destinos' }" class="mobile-nav-link" @click="closeMobileMenu">
                  <i class="bi bi-geo-alt me-2 text-accent"></i>Destinos & Catálogo
                </router-link>
                <router-link :to="{ path: '/', hash: '#opiniones' }" class="mobile-nav-link" @click="closeMobileMenu">
                  <i class="bi bi-chat-heart me-2 text-accent"></i>Reseñas de Clientes
                </router-link>
                <router-link to="/nosotros" class="mobile-nav-link" @click="closeMobileMenu">
                  <i class="bi bi-people me-2 text-accent"></i>Quiénes Somos
                </router-link>
              </nav>
            </div>

            <!-- Footer del Menú Móvil -->
            <div class="pt-4 border-top border-secondary border-opacity-25">
              <a :href="`https://wa.me/${contentStore.content.contact.whatsappNumber}?text=${encodeURIComponent(contentStore.content.contact.whatsappMessage)}`" target="_blank" class="btn btn-whatsapp-custom w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2 mb-3">
                <i class="bi bi-whatsapp fs-5"></i> Contactar por WhatsApp
              </a>
              <p class="small text-white opacity-75 text-center mb-0" style="font-size: 0.8rem;">
                © 2026 Wamani Experience • Pucón, Chile
              </p>
            </div>

          </div>
        </div>
      </Transition>
    </Teleport>

    <main>
      <RouterView />
    </main>

    <!-- Cumbres Andinas en el remate superior del Footer -->
    <MountainDivider v-if="route.name !== 'admin'" />
    
    <!-- Mega Footer Corporativo -->
    <footer v-if="route.name !== 'admin'" class="premium-footer text-white pt-5 pb-4 font-sans">
      <div class="container py-4">
        <div class="row g-4 justify-content-between">
          <!-- Columna 1: Brand -->
          <div class="col-12 col-md-3">
            <div class="mb-3">
              <img src="/Logo Wamani.png" alt="Wamani Logo" height="55" width="55" class="mb-3 d-block" />
              <h4 class="font-serif fw-bold h5 mb-0">Wamani Experience</h4>
            </div>
            
            <!-- Logos de acreditación directos con verificación SERNATUR -->
            <div class="d-flex align-items-center gap-3 mb-2 ps-1">
              <a :href="contentStore.content.legal.sernaturUrl" target="_blank" rel="noopener noreferrer" title="Verificar Registro Nacional de Prestadores Turísticos SERNATUR" class="d-inline-flex align-items-center text-decoration-none">
                <img src="/sernatur.webp" alt="Sernatur" height="36" class="object-fit-contain" style="filter: brightness(0) invert(1); opacity: 0.95;" />
              </a>
              <img src="/Logo_MarcaChile_Caja Roja.webp" alt="Marca Chile" height="36" class="object-fit-contain" />
            </div>
            <p class="small text-accent mb-3" style="font-size: 0.8rem;">
              <i class="bi bi-patch-check-fill me-1"></i>Reg. SERNATUR N° {{ contentStore.content.legal.sernaturRegistry }}
            </p>
            
            <p class="text-white-50 small pe-md-2 lh-lg">
              Diseñando experiencias inolvidables en el sur del mundo. Ecoturismo y turismo aventura de excelencia para viajeros conscientes y exigentes.
            </p>
          </div>
          
          <!-- Columna 2: Quick Links -->
          <div class="col-6 col-md-2">
            <h5 class="text-uppercase mb-4 fw-bold" style="font-size: 0.85rem; letter-spacing: 0.1em;">Explora</h5>
            <ul class="list-unstyled d-flex flex-column gap-3 mb-0 small">
              <li><router-link to="/" class="text-white-50 text-decoration-none nav-link-custom">Inicio</router-link></li>
              <li><router-link to="/experiencias" class="text-white-50 text-decoration-none nav-link-custom">Portafolio</router-link></li>
              <li><router-link :to="{ path: '/', hash: '#servicios' }" class="text-white-50 text-decoration-none nav-link-custom">Servicios</router-link></li>
              <li><router-link :to="{ path: '/', hash: '#opiniones' }" class="text-white-50 text-decoration-none nav-link-custom">Reseñas</router-link></li>
              <li><router-link to="/nosotros" class="text-white-50 text-decoration-none nav-link-custom">Nosotros</router-link></li>
            </ul>
          </div>
          
          <!-- Columna 3: Contacto -->
          <div class="col-6 col-md-3">
            <h5 class="text-uppercase mb-4 fw-bold" style="font-size: 0.85rem; letter-spacing: 0.1em;">Contacto</h5>
            <ul class="list-unstyled d-flex flex-column gap-3 mb-0 small text-white-50">
              <li class="d-flex align-items-center gap-2">
                <i class="fa-solid fa-location-dot text-accent" style="width: 16px; text-align: center;"></i> <span>{{ contentStore.content.contact.address }}</span>
              </li>
              <li class="d-flex align-items-center gap-2">
                <i class="fa-solid fa-envelope text-accent" style="width: 16px; text-align: center;"></i> <span>{{ contentStore.content.contact.email }}</span>
              </li>
            </ul>
          </div>
          
          <!-- Columna 4: Redes Sociales -->
          <div class="col-12 col-md-4">
            <h5 class="text-uppercase mb-4 fw-bold" style="font-size: 0.85rem; letter-spacing: 0.1em;">Síguenos</h5>
            <ul class="list-unstyled d-flex flex-column gap-3 mb-0 small text-white-50">
              <li>
                <a :href="`https://wa.me/${contentStore.content.contact.whatsappNumber}?text=${encodeURIComponent(contentStore.content.contact.whatsappMessage)}`" target="_blank" class="text-white-50 text-decoration-none d-flex align-items-center gap-2 social-link-item py-1">
                  <span class="d-flex align-items-center justify-content-center border border-white border-opacity-25 rounded-circle social-icon-wrapper" style="width: 44px; height: 44px; min-width: 44px; transition: all 0.25s;">
                    <i class="fa-brands fa-whatsapp fs-6"></i>
                  </span>
                  <span class="text-nowrap">{{ contentStore.content.contact.phone }}</span>
                </a>
              </li>
              <li>
                <a :href="contentStore.content.contact.instagramUrl" target="_blank" class="text-white-50 text-decoration-none d-flex align-items-center gap-2 social-link-item py-1">
                  <span class="d-flex align-items-center justify-content-center border border-white border-opacity-25 rounded-circle social-icon-wrapper" style="width: 44px; height: 44px; min-width: 44px; transition: all 0.25s;">
                    <i class="fa-brands fa-instagram fs-6"></i>
                  </span>
                  <span class="text-nowrap">Instagram</span>
                </a>
              </li>
              <li>
                <a :href="contentStore.content.contact.tripadvisorUrl" target="_blank" class="text-white-50 text-decoration-none d-flex align-items-center gap-2 social-link-item py-1">
                  <span class="d-flex align-items-center justify-content-center border border-white border-opacity-25 rounded-circle social-icon-wrapper" style="width: 44px; height: 44px; min-width: 44px; transition: all 0.25s;">
                    <svg width="17" height="17" viewBox="0 0 512 512" fill="currentColor" style="transition: fill 0.2s;">
                      <path d="M175.335 281.334c0 24.483-19.853 44.336-44.336 44.336-24.484 0-44.337-19.853-44.336-44.336 0-24.484 19.853-44.337 44.337-44.337 24.483 0 44.336 19.853 44.336 44.337zm205.554-44.337c-24.48 0-44.336 19.853-44.336 44.337 0 24.483 19.855 44.336 44.336 44.336 24.481 0 44.334-19.853 44.334-44.336-.006-24.47-19.839-44.31-44.309-44.323l-.025-.01v-.004zm125.002 44.337c0 68.997-55.985 124.933-124.999 124.933a124.466 124.466 0 01-84.883-33.252l-40.006 43.527-40.025-43.576a124.45 124.45 0 01-84.908 33.3c-68.968 0-124.933-55.937-124.933-124.932A124.586 124.586 0 0146.889 189L6 144.517h90.839c96.116-65.411 222.447-65.411 318.557 0H506l-40.878 44.484a124.574 124.574 0 0140.769 92.333zm-290.31 0c0-46.695-37.858-84.55-84.55-84.55-46.691 0-84.55 37.858-84.55 84.55 0 46.691 37.859 84.55 84.55 84.55 46.692 0 84.545-37.845 84.55-84.54v-.013.003zM349.818 155.1a244.01 244.01 0 00-187.666 0C215.532 175.533 256 223.254 256 278.893c0-55.634 40.463-103.362 93.826-123.786l-.005-.006h-.003zm115.64 126.224c0-46.694-37.858-84.55-84.55-84.55-46.691 0-84.552 37.859-84.552 84.55 0 46.692 37.855 84.55 84.553 84.55 46.697 0 84.55-37.858 84.55-84.55z" fill-rule="nonzero"/>
                    </svg>
                  </span>
                  <span class="text-nowrap">TripAdvisor</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <!-- Línea Inferior Legal (Decreto 6/2021 de Comercio Electrónico) -->
        <div class="row border-top border-secondary border-opacity-25 mt-5 pt-4 align-items-center">
          <div class="col-12 col-lg-7 text-center text-lg-start mb-3 mb-lg-0">
            <p class="mb-1 small text-white-50 text-uppercase" style="letter-spacing: 0.08em; font-size: 0.76rem;">
              © 2026 {{ contentStore.content.legal.businessName }} • RUT: {{ contentStore.content.legal.rut }}
            </p>
            <p class="mb-0 small text-white-50" style="font-size: 0.72rem;">
              {{ contentStore.content.legal.addressLegal }}, {{ contentStore.content.legal.city }}, {{ contentStore.content.legal.region }}. Todos los derechos reservados.
            </p>
          </div>
          <div class="col-12 col-lg-5 text-center text-lg-end">
            <div class="d-flex gap-4 justify-content-center justify-content-lg-end small">
              <router-link to="/politica-de-privacidad" class="text-white-50 text-decoration-none nav-link-custom">Políticas de Privacidad</router-link>
              <router-link to="/terminos-y-condiciones" class="text-white-50 text-decoration-none nav-link-custom">Términos y Condiciones</router-link>
            </div>
          </div>
        </div>
      </div>
    </footer>

    <!-- BARRA INFERIOR DE ACCIÓN MÓVIL (THUMB ZONE CRO) -->
    <Transition name="slide-up-bottom">
      <div 
        v-if="isScrolled && route.name !== 'checkout' && route.name !== 'admin'" 
        class="mobile-bottom-cta-bar d-lg-none fixed-bottom p-2 px-3 shadow-lg"
      >
        <div class="d-flex align-items-center justify-content-between gap-2">
          <div class="d-flex flex-column text-white text-truncate me-2">
            <span class="small opacity-90 fw-bold text-truncate" style="font-size: 0.68rem; letter-spacing: 0.08em;">WAMANI EXPERIENCE</span>
            <span class="fw-semibold text-accent text-truncate" style="font-size: 0.8rem; color: #2DD4BF !important;">Expediciones en Chile</span>
          </div>
          <div class="d-flex align-items-center gap-2 flex-shrink-0">
            <router-link 
              to="/experiencias" 
              class="btn btn-accent-navbar py-2 px-3 fw-bold text-uppercase d-flex align-items-center gap-1 shadow-sm"
              style="font-size: 0.74rem; border-radius: 12px; min-height: 42px;"
            >
              <i class="bi bi-compass"></i>
              <span>Ver Tours</span>
            </router-link>
            <a 
              :href="`https://wa.me/${contentStore.content.contact.whatsappNumber}?text=${encodeURIComponent(contentStore.content.contact.whatsappMessage)}`" 
              target="_blank" 
              class="btn btn-whatsapp-custom py-2 px-3 fw-bold d-flex align-items-center justify-content-center shadow-sm"
              style="border-radius: 12px; font-size: 0.95rem; min-height: 42px; min-width: 44px;"
              aria-label="WhatsApp directo"
            >
              <i class="bi bi-whatsapp"></i>
            </a>
          </div>
        </div>
      </div>
    </Transition>

    <WhatsAppButton v-if="route.name !== 'admin'" />
    <CookieConsentBanner v-if="route.name !== 'admin'" />
    <CartDrawer v-if="route.name !== 'admin'" />
  </div>
</template>

<style scoped>
.premium-footer { background-color: #1C1C1E; }
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
main {
  flex: 1;
}
.z-3 {
  z-index: 1030;
}
.logo-center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.navbar-sticky-wrapper {
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.navbar-scrolled {
  background: rgba(28, 28, 30, 0.92) !important; /* Taste: Premium carbon dark */
  backdrop-filter: blur(16px) !important;
  -webkit-backdrop-filter: blur(16px) !important;
  padding-top: 0.75rem !important;
  padding-bottom: 0.75rem !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
}

.navbar-scrolled-logo {
  transition: opacity 0.4s cubic-bezier(0.22, 1, 0.36, 1), transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.pointer-events-none {
  pointer-events: none !important;
}

.btn-accent-navbar {
  background-color: #0FA095;
  color: #FFFFFF !important;
  border-radius: 999px;
  padding: 0.5rem 1.25rem;
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  border: none;
  box-shadow: 0 4px 15px rgba(15, 160, 149, 0.2);
}

.btn-accent-navbar:hover {
  background-color: lighten(#0FA095, 5%);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(15, 160, 149, 0.3);
}

.btn-accent-navbar:active {
  transform: scale(0.96) translateY(0); /* Kowalski */
  box-shadow: 0 2px 8px rgba(15, 160, 149, 0.2);
}

.nav-link-custom {
  position: relative;
  transition: color 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  opacity: 0.85;
}
.nav-link-custom:hover {
  opacity: 1;
  color: #0FA095 !important;
}

.social-link-item {
  display: inline-flex !important;
  align-items: center !important;
  gap: 0.5rem !important;
  text-decoration: none;
  transition: color 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.social-link-item span:not(.social-icon-wrapper) {
  line-height: 1 !important;
  transform: translateY(1.5px); /* Corrección de alineación óptica */
}

.social-link-item:hover {
  color: #0FA095 !important;
}

.social-link-item:hover .social-icon-wrapper {
  border-color: #0FA095 !important;
  background-color: rgba(15, 160, 149, 0.1);
  transform: scale(1.08);
}

.contact-item {
  display: flex !important;
  align-items: center !important;
  gap: 0.5rem !important;
  line-height: 1 !important;
}

.contact-item span {
  line-height: 1 !important;
  transform: translateY(1.5px); /* Corrección de alineación óptica */
}

.brand-title-nav {
  letter-spacing: 0.15em;
  font-size: 1.35rem;
  transition: opacity 0.3s ease;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);

  &:hover {
    opacity: 0.85;
  }
}

/* Estilos de Drawer Móvil */
.mobile-menu-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  z-index: 2000;
  display: flex;
  justify-content: flex-end;
}

.mobile-menu-drawer {
  width: 85%;
  max-width: 380px;
  height: 100%;
  background: rgba(28, 28, 30, 0.98); /* Premium dark */
  backdrop-filter: blur(16px);
  border-left: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: -10px 0 40px rgba(0, 0, 0, 0.3);
  animation: slideInRight 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

.mobile-nav-link {
  color: #FFFFFF !important;
  text-decoration: none;
  font-size: 1.15rem;
  font-weight: 500;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  display: flex;
  align-items: center;

  &:hover, &:focus, &.router-link-active {
    background-color: rgba(15, 160, 149, 0.15);
    color: #0FA095 !important;
    transform: translateX(8px);
  }
}

/* Barra inferior de acción rápida móvil */
.mobile-bottom-cta-bar {
  background: rgba(28, 28, 30, 0.95) !important;
  backdrop-filter: blur(16px) !important;
  -webkit-backdrop-filter: blur(16px) !important;
  border-top: 1px solid rgba(255, 255, 255, 0.08) !important;
  z-index: 1035 !important;
}

.slide-up-bottom-enter-active,
.slide-up-bottom-leave-active {
  transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.5s ease;
}

.slide-up-bottom-enter-from,
.slide-up-bottom-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>

<style lang="scss">
/* Sobrescribir estilos de Google Translate para que no rompan el diseño */
body {
  top: 0 !important;
}
.skiptranslate iframe {
  display: none !important;
}
.goog-te-banner-frame.skiptranslate {
  display: none !important;
}
.custom-translate-widget .goog-te-gadget {
  font-family: var(--bs-font-sans-serif) !important;
  color: transparent !important;
}
.custom-translate-widget .goog-te-gadget .goog-te-combo {
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 0.8rem;
  outline: none;
  cursor: pointer;
  transition: all 0.3s ease;
}
.custom-translate-widget .goog-te-gadget .goog-te-combo:hover {
  background-color: rgba(255, 255, 255, 0.2);
}
.custom-translate-widget .goog-te-gadget span {
  display: none;
}
</style>


