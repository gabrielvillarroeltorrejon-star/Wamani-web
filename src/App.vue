<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import CartDrawer from '@/widgets/cart-drawer/CartDrawer.vue'
import WhatsAppButton from '@/shared/ui/WhatsAppButton.vue'
import MountainDivider from '@/shared/ui/MountainDivider.vue'
import CookieConsentBanner from '@/shared/ui/CookieConsentBanner.vue'
import { useContentStore } from '@/shared/stores/contentStore'
import { useCartStore } from '@/shared/stores/cartStore'

const route = useRoute()
const contentStore = useContentStore()
const cartStore = useCartStore()

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
      :class="{ 'navbar-scrolled': isScrolled, 'navbar-transparent py-3 py-lg-4': !isScrolled }"
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
        <nav class="nav-pill d-none d-lg-flex align-items-center gap-4 gap-xl-5 text-uppercase font-sans fw-medium mx-auto px-4 py-2" style="font-size: 0.85rem; letter-spacing: 0.12em;">
          <router-link to="/" class="text-white text-decoration-none nav-link-custom">Inicio</router-link>
          <router-link to="/experiencias" class="text-white text-decoration-none nav-link-custom">Expediciones</router-link>
          <router-link :to="{ path: '/', hash: '#servicios' }" class="text-white text-decoration-none nav-link-custom">Servicios</router-link>
          <router-link :to="{ path: '/', hash: '#destinos' }" class="text-white text-decoration-none nav-link-custom">Destinos</router-link>
          <router-link :to="{ path: '/', hash: '#guias' }" class="text-white text-decoration-none nav-link-custom">Guías</router-link>
          <router-link :to="{ path: '/', hash: '#opiniones' }" class="text-white text-decoration-none nav-link-custom">Reseñas</router-link>
          <router-link to="/nosotros" class="text-white text-decoration-none nav-link-custom">Nosotros</router-link>
        </nav>

        <!-- Controles Desktop (CTA + Idiomas + Carrito) -->
        <div class="d-none d-lg-flex align-items-center gap-3">
          <!-- Carrito de Compras -->
          <button class="btn btn-link text-white p-0 border-0 fs-5 lh-1 text-decoration-none position-relative me-1 nav-icon-hover" @click="cartStore.toggleCart" title="Ver carrito">
            <i class="bi bi-cart3"></i>
            <span v-if="cartStore.totalItems > 0" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-accent text-dark-mountain" style="font-size: 0.65rem;">
              {{ cartStore.totalItems }}
            </span>
          </button>

          <!-- Idiomas Desktop -->
          <div class="dropdown">
            <button class="btn btn-link text-white p-0 border-0 fs-5 lh-1 dropdown-toggle text-decoration-none d-flex align-items-center gap-1 nav-icon-hover" type="button" data-bs-toggle="dropdown" aria-expanded="false" title="Cambiar idioma">
              <i class="fa-solid fa-globe opacity-90"></i>
            </button>
            <ul class="dropdown-menu dropdown-menu-end shadow-sm border-0 custom-dropdown-glass">
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
          
          <!-- Carrito de Compras Móvil -->
          <button class="btn btn-link text-white p-0 border-0 fs-5 lh-1 text-decoration-none position-relative nav-icon-hover" @click="cartStore.toggleCart" aria-label="Ver carrito">
            <i class="bi bi-cart3"></i>
            <span v-if="cartStore.totalItems > 0" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-accent text-dark-mountain" style="font-size: 0.65rem;">
              {{ cartStore.totalItems }}
            </span>
          </button>

          <div class="dropdown">
            <button class="btn btn-link text-white p-0 border-0 fs-5 lh-1 dropdown-toggle text-decoration-none nav-icon-hover" type="button" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Cambiar idioma">
              <i class="fa-solid fa-globe opacity-90"></i>
            </button>
            <ul class="dropdown-menu dropdown-menu-end shadow-sm border-0 custom-dropdown-glass">
              <li><a class="dropdown-item" href="#" @click.prevent="changeLanguage('es')"><span class="fi fi-es me-2"></span> Español</a></li>
              <li><a class="dropdown-item" href="#" @click.prevent="changeLanguage('en')"><span class="fi fi-gb me-2"></span> Inglés</a></li>
              <li><a class="dropdown-item" href="#" @click.prevent="changeLanguage('pt')"><span class="fi fi-br me-2"></span> Português</a></li>
              <li><a class="dropdown-item" href="#" @click.prevent="changeLanguage('fr')"><span class="fi fi-fr me-2"></span> Français</a></li>
              <li><a class="dropdown-item" href="#" @click.prevent="changeLanguage('it')"><span class="fi fi-it me-2"></span> Italiano</a></li>
              <li><a class="dropdown-item" href="#" @click.prevent="changeLanguage('zh-CN')"><span class="fi fi-cn me-2"></span> 中文</a></li>
            </ul>
          </div>

          <!-- Botón Hamburguesa -->
          <button class="btn btn-link text-white p-1 border-0 fs-2 lh-1 nav-icon-hover" @click="toggleMobileMenu" aria-label="Abrir menú">
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
                <router-link :to="{ path: '/', hash: '#guias' }" class="mobile-nav-link" @click="closeMobileMenu">
                  <i class="bi bi-person-badge me-2 text-accent"></i>Nuestros Guías
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
          
          <!-- Columna 1: Brand & Propósito -->
          <div class="col-12 col-md-4 col-lg-3">
            <div class="mb-3 d-flex align-items-center gap-2">
              <img src="/Logo Wamani.png" alt="Wamani Logo" height="48" width="48" class="d-block" />
              <div>
                <h4 class="font-sans fw-bold h5 mb-0 text-white">Wamani Experience</h4>
                <span class="small brand-slogan text-white-50" style="font-size: 0.85rem;">Ecoturismo desde Chile.</span>
              </div>
            </div>
            
            <!-- Logos de acreditación con verificación SERNATUR -->
            <div class="d-flex align-items-center gap-3 mb-2 ps-1">
              <a :href="contentStore.content.legal.sernaturUrl" target="_blank" rel="noopener noreferrer" title="Verificar Registro Nacional de Prestadores Turísticos SERNATUR" class="d-inline-flex align-items-center text-decoration-none">
                <img src="/sernatur.webp" alt="Sernatur" height="32" class="object-fit-contain" style="filter: brightness(0) invert(1); opacity: 0.95;" />
              </a>
              <img src="/Logo_MarcaChile_Caja Roja.webp" alt="Marca Chile" height="32" class="object-fit-contain" />
            </div>
            <p class="small text-white-50 mb-3" style="font-size: 0.8rem;">
              <i class="bi bi-patch-check-fill me-1" style="color: #E7DCC3;"></i>Reg. SERNATUR N° {{ contentStore.content.legal.sernaturRegistry }}
            </p>
            
            <p class="text-white-50 small pe-md-2 lh-lg mb-0">
              Agencia boutique de ecoturismo y turismo aventura en Chile. Guiados por la cosmovisión andina que reconoce a la montaña como espíritu protector.
            </p>
          </div>
          
          <!-- Columna 2: Enlaces Rápidos -->
          <div class="col-6 col-md-2">
            <h5 class="text-uppercase mb-3 fw-bold" style="font-size: 0.85rem; letter-spacing: 0.1em; color: #E7DCC3;">Enlaces Rápidos</h5>
            <ul class="list-unstyled d-flex flex-column gap-2 mb-0 small">
              <li><router-link to="/" class="text-white-50 text-decoration-none nav-link-custom">Inicio</router-link></li>
              <li><router-link to="/nosotros" class="text-white-50 text-decoration-none nav-link-custom">Nosotros</router-link></li>
              <li><router-link :to="{ path: '/', hash: '#servicios' }" class="text-white-50 text-decoration-none nav-link-custom">Servicios</router-link></li>
              <li><router-link :to="{ path: '/', hash: '#destinos' }" class="text-white-50 text-decoration-none nav-link-custom">Destinos</router-link></li>
              <li><router-link :to="{ path: '/', hash: '#reserva' }" class="text-white-50 text-decoration-none nav-link-custom">Reservar</router-link></li>
              <li><router-link to="/experiencias" class="text-white-50 text-decoration-none nav-link-custom">Expediciones</router-link></li>
            </ul>
          </div>

          <!-- Columna 3: Soporte & Legal -->
          <div class="col-6 col-md-3">
            <h5 class="text-uppercase mb-3 fw-bold" style="font-size: 0.85rem; letter-spacing: 0.1em; color: #E7DCC3;">Soporte & Legal</h5>
            <ul class="list-unstyled d-flex flex-column gap-2 mb-0 small">
              <li><router-link to="/terminos-y-condiciones" class="text-white-50 text-decoration-none nav-link-custom">Términos y Condiciones</router-link></li>
              <li><router-link to="/politica-de-privacidad" class="text-white-50 text-decoration-none nav-link-custom">Política de Privacidad</router-link></li>
              <li><router-link to="/politica-de-cookies" class="text-white-50 text-decoration-none nav-link-custom">Política de Cookies</router-link></li>
              <li><router-link to="/politica-de-reembolsos" class="text-white-50 text-decoration-none nav-link-custom">Cambios y Cancelaciones</router-link></li>
              <li><a :href="`mailto:${contentStore.content.contact.email}?subject=Preguntas%20Frecuentes%20-%20Ayuda`" class="text-white-50 text-decoration-none nav-link-custom">Preguntas Frecuentes (FAQ)</a></li>
              <li><router-link :to="{ path: '/', hash: '#galeria' }" class="text-white-50 text-decoration-none nav-link-custom">Blog & Historias</router-link></li>
            </ul>
          </div>
          
          <!-- Columna 4: Contacto & Redes -->
          <div class="col-12 col-md-3">
            <h5 class="text-uppercase mb-3 fw-bold" style="font-size: 0.85rem; letter-spacing: 0.1em; color: #E7DCC3;">Contacto</h5>
            <ul class="list-unstyled d-flex flex-column gap-2 mb-3 small text-white-50">
              <li class="d-flex align-items-start gap-2">
                <i class="fa-solid fa-location-dot mt-1" style="color: #E7DCC3; width: 16px;"></i>
                <span>{{ contentStore.content.contact.address }}</span>
              </li>
              <li class="d-flex align-items-center gap-2">
                <i class="fa-solid fa-envelope" style="color: #E7DCC3; width: 16px;"></i>
                <span>{{ contentStore.content.contact.email }}</span>
              </li>
              <li class="d-flex align-items-center gap-2">
                <i class="fa-solid fa-phone" style="color: #E7DCC3; width: 16px;"></i>
                <span>{{ contentStore.content.contact.phone }}</span>
              </li>
            </ul>

            <h6 class="text-uppercase mb-2 fw-bold small" style="font-size: 0.75rem; letter-spacing: 0.1em; color: #E7DCC3;">Redes Sociales</h6>
            <div class="d-flex gap-2">
              <a :href="`https://wa.me/${contentStore.content.contact.whatsappNumber}?text=${encodeURIComponent(contentStore.content.contact.whatsappMessage)}`" target="_blank" class="social-icon-box text-white" aria-label="WhatsApp">
                <i class="fa-brands fa-whatsapp"></i>
              </a>
              <a :href="contentStore.content.contact.instagramUrl" target="_blank" class="social-icon-box text-white" aria-label="Instagram">
                <i class="fa-brands fa-instagram"></i>
              </a>
              <a :href="contentStore.content.contact.tripadvisorUrl" target="_blank" class="social-icon-box text-white" aria-label="TripAdvisor">
                <i class="fa-brands fa-tripadvisor"></i>
              </a>
              <a href="https://linkedin.com" target="_blank" class="social-icon-box text-white" aria-label="LinkedIn">
                <i class="fa-brands fa-linkedin-in"></i>
              </a>
            </div>
          </div>

        </div>
        
        <!-- Línea Inferior Legal & Mensaje de Marca Final -->
        <div class="border-top border-white border-opacity-20 mt-5 pt-4 text-center">
          <p class="brand-slogan fs-4 text-white mb-2">
            “Viaja con propósito. Vive Wamani Experience.”
          </p>
          <div class="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2 mt-3 pt-2 text-white-50 small" style="font-size: 0.75rem;">
            <span>
              © 2026 {{ contentStore.content.legal.businessName }} • RUT: {{ contentStore.content.legal.rut }} • {{ contentStore.content.legal.addressLegal }}, {{ contentStore.content.legal.city }}.
            </span>
            <span>
              Todos los derechos reservados. Turismo sustentable y aventura en Chile.
            </span>
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
.premium-footer { 
  background: linear-gradient(180deg, #147E79 0%, #0E5E5A 100%);
  border-top: 1px solid rgba(231, 220, 195, 0.3);
}

.premium-footer .text-white-50 {
  color: rgba(255, 255, 255, 0.88) !important;
}

.premium-footer a.text-white-50:hover {
  color: #E7DCC3 !important;
}

.social-icon-box {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid rgba(231, 220, 195, 0.4);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  transition: all 0.3s ease;
  font-size: 0.95rem;

  &:hover {
    background-color: #E7DCC3;
    color: #147E79 !important;
    border-color: #E7DCC3;
    transform: translateY(-2px);
  }
}
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
  background: transparent !important;
  padding-top: 0.75rem !important;
  padding-bottom: 0.75rem !important;
  border-bottom: none !important;
}

.nav-pill {
  background: rgba(4, 93, 86, 0.4); /* Transparente verdoso */
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 50px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  transition: background 0.4s ease;
}

.navbar-scrolled .nav-pill {
  background: rgba(4, 93, 86, 0.7); /* Verdoso más intenso al hacer scroll */
}

.nav-icon-hover {
  transition: color 0.3s ease, transform 0.2s ease;
  
  &:hover {
    color: #0FA095 !important;
    transform: scale(1.1);
  }
}

.custom-dropdown-glass {
  background: rgba(4, 93, 86, 0.85) !important;
  backdrop-filter: blur(12px) !important;
  -webkit-backdrop-filter: blur(12px) !important;
  border-radius: 16px !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  padding: 0.5rem 0;
  
  .dropdown-item {
    color: white !important;
    transition: background 0.3s ease, color 0.3s ease;
    padding: 0.5rem 1.25rem;
    
    &:hover {
      background: rgba(255, 255, 255, 0.1) !important;
      color: #0FA095 !important;
    }
  }
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


