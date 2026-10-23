<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useContentStore, type ServiceItem } from '@/shared/stores/contentStore';
import { useCartStore } from '@/shared/stores/cartStore';
import type { Experience } from '@/entities/experience/model/schemas';
import WCard from '@/shared/ui/WCard.vue';
import WButton from '@/shared/ui/WButton.vue';
import ExperienceModal from '@/widgets/experience-modal/ExperienceModal.vue';
import HomePackages from '@/widgets/home-packages/HomePackages.vue';

const route = useRoute();
const router = useRouter();
const contentStore = useContentStore();
const cartStore = useCartStore();

// Fechas por defecto
const todayDate = new Date().toISOString().split('T')[0];
const defaultNextDay = new Date(Date.now() + 86400000).toISOString().split('T')[0];

// State Buscador & Filtros
const searchQuery = ref('');
const searchDate = ref('');
const searchPax = ref(1);
const selectedDifficulty = ref('');
const selectedCity = ref('');
const selectedZone = ref('all');
const selectedModality = ref('all'); // all, grupales, privadas, medida, transporte

// Metadatos enriquecidos de Destinos Emblemáticos
interface DestinationMeta {
  id: string;
  name: string;
  subtitle: string;
  zone: string;
  zoneId: string;
  coverImage: string;
  description: string;
  highlights: string[];
  climate: string;
  bestSeason: string;
  altitude: string;
}

const destinationsMeta: DestinationMeta[] = [
  {
    id: 'dest-pucon',
    name: 'Pucón & Volcán Villarrica',
    subtitle: 'La capital del turismo aventura y volcanes activos',
    zone: 'Lagos & Volcanes (Zona Sur)',
    zoneId: 'sur',
    coverImage: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1200&q=80',
    description: 'Rodeado por el lago y el imponente volcán activo Villarrica, Pucón es el epicentro del ecoturismo andino. Bosques milenarios de araucarias, termas geológicas, ríos indómitos y ascensiones de alta montaña.',
    highlights: ['Ascenso al Volcán Villarrica (2.847 m)', 'Termas Geométricas e Indómito', 'Rafting en Río Trancura', 'Parque Nacional Huerquehue'],
    climate: 'Templado lluvioso con influencia de montaña',
    bestSeason: 'Todo el año (Nieve en invierno, lagos en verano)',
    altitude: '227 m - 2.847 m'
  },
  {
    id: 'dest-panguipulli',
    name: 'Panguipulli & Huilo Huilo',
    subtitle: 'Tierra de siete lagos y selva valdiviana virgen',
    zone: 'Selva Valdiviana (Zona Sur)',
    zoneId: 'sur',
    coverImage: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80',
    description: 'Santuario de biodiversidad donde la cordillera se une con lagos cristalinos y cascadas ocultas. Un destino perfecto para desconexión, senderismo botánico y navegación panorámica.',
    highlights: ['Reserva Biológica Huilo Huilo', 'Ruta de los 7 Lagos', 'Saltos del Huilo Huilo y La Leona', 'Miradores del Mocho-Choshuenco'],
    climate: 'Oceánico lluvioso templado',
    bestSeason: 'Septiembre a Mayo',
    altitude: '130 m - 2.422 m'
  },
  {
    id: 'dest-atacama',
    name: 'San Pedro de Atacama',
    subtitle: 'El desierto más árido del planeta y cielos infinitos',
    zone: 'Norte Grande & Altiplano',
    zoneId: 'norte',
    coverImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    description: 'Un paisaje lunar de salares resplandecientes, géiseres geotérmicos a 4.300 m y lagunas altiplánicas habitadas por flamencos. El santuario astronómico y místico por excelencia.',
    highlights: ['Géiseres del Tatio', 'Valle de la Luna y de la Muerte', 'Lagunas Escondidas de Baltinache', 'Astrofotografía en salares'],
    climate: 'Desértico de altura con alta radiación solar',
    bestSeason: 'Todo el año',
    altitude: '2.400 m - 4.320 m'
  },
  {
    id: 'dest-patagonia',
    name: 'Torres del Paine & Patagonia',
    subtitle: 'Los confines del continente y glaciares milenarios',
    zone: 'Patagonia Austral',
    zoneId: 'patagonia',
    coverImage: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80',
    description: 'Cumbres de granito esculpidas por el viento, témpanos de hielo turquesa y la estepa salvaje. El santuario del trekking mundial para quienes buscan la verdadera aventura.',
    highlights: ['Base Torres del Paine', 'Glaciar Grey y Campos de Hielo Sur', 'Circuito W & O', 'Navegación por Fiordos'],
    climate: 'Frío estepario y templado frío con vientos',
    bestSeason: 'Octubre a Abril',
    altitude: '0 m - 3.050 m'
  },
  {
    id: 'dest-cajon-maipo',
    name: 'Cajón del Maipo & Andes Centrales',
    subtitle: 'La majestuosidad de la alta cordillera cerca de Santiago',
    zone: 'Cordillera Central',
    zoneId: 'centro',
    coverImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    description: 'El cañón cordillerano del Maipo ofrece glaciares colgantes, aguas termales medicinales y el imponente Embalse El Yeso, perfecto para escapadas de montaña desde la capital.',
    highlights: ['Embalse El Yeso y Cordillera', 'Termas de Colina y del Plomo', 'Glaciar El Morado', 'Trekking en Valle de las Arenas'],
    climate: 'Mediterráneo de montaña',
    bestSeason: 'Todo el año (Raquetas de nieve en invierno)',
    altitude: '900 m - 3.200 m'
  }
];

// Macrozonas de Chile
const macrozones = [
  { id: 'all', label: 'Todo Chile', icon: 'bi-globe-americas' },
  { id: 'sur', label: 'Lagos & Volcanes (Sur)', icon: 'bi-tree-fill' },
  { id: 'norte', label: 'Norte & Atacama', icon: 'bi-sun-fill' },
  { id: 'patagonia', label: 'Patagonia & Glaciares', icon: 'bi-snow2' },
  { id: 'centro', label: 'Zona Central & Cordillera', icon: 'bi-compass-fill' }
];

// Modalidades de viaje
const modalities = [
  { id: 'all', label: 'Todas las Salidas', icon: 'bi-collection' },
  { id: 'grupales', label: 'Salidas Grupales', icon: 'bi-people' },
  { id: 'privadas', label: 'Privadas VIP', icon: 'bi-gem' },
  { id: 'medida', label: 'A Medida / Empresas', icon: 'bi-briefcase' },
  { id: 'transporte', label: 'Transporte & Transfers', icon: 'bi-car-front' }
];

// Modal Detalle y Reserva de Tour
const selectedExperience = ref<Experience | null>(null);
const modalDate = ref(defaultNextDay);
const modalPax = ref(1);

// Modal de Información de Servicio
const selectedService = ref<ServiceItem | null>(null);

const openServiceModal = (service: ServiceItem) => {
  selectedService.value = service;
  document.body.style.overflow = 'hidden';
};

const closeServiceModal = () => {
  selectedService.value = null;
  document.body.style.overflow = '';
};

// Ciudades únicas
const cities = computed(() => {
  const allDestinations = contentStore.experiences.map(e => e.destinationId);
  return [...new Set(allDestinations)];
});

const getCityName = (id: string) => {
  const found = destinationsMeta.find(d => d.id === id);
  if (found) return found.name.split('&')[0].trim();
  if (id === 'dest-pucon') return 'Pucón';
  if (id === 'dest-panguipulli') return 'Panguipulli';
  if (id === 'dest-atacama') return 'San Pedro de Atacama';
  if (id === 'dest-patagonia') return 'Torres del Paine';
  if (id === 'dest-cajon-maipo') return 'Cajón del Maipo';
  return id.replace('dest-', '').replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase());
};

// Destino seleccionado actualmente (metadata)
const currentDestinationMeta = computed(() => {
  if (!selectedCity.value) return null;
  return destinationsMeta.find(d => d.id === selectedCity.value) || null;
});

// Contador de experiencias por destino
const getExperienceCountByCity = (cityId: string) => {
  return contentStore.experiences.filter(e => e.destinationId === cityId).length;
};

// Filtrado reactivo completo
const filteredExperiences = computed(() => {
  return contentStore.experiences.filter(exp => {
    // 1. Filtro de búsqueda por texto libre
    const query = searchQuery.value.trim().toLowerCase();
    const matchesSearch = query ? (
      exp.title.toLowerCase().includes(query) ||
      (exp.tags && exp.tags.some(t => t.toLowerCase().includes(query))) ||
      (exp.summary && exp.summary.toLowerCase().includes(query)) ||
      (exp.destinationId && getCityName(exp.destinationId).toLowerCase().includes(query))
    ) : true;

    // 2. Filtro por dificultad
    const matchesDiff = selectedDifficulty.value ? exp.difficulty === selectedDifficulty.value : true;

    // 3. Filtro por destino puntual (ciudad)
    const matchesCity = selectedCity.value ? exp.destinationId === selectedCity.value : true;

    // 4. Filtro por macrozona de Chile
    const matchesZone = selectedZone.value === 'all' || exp.macroZone === selectedZone.value || (
      selectedZone.value === 'sur' && ['dest-pucon', 'dest-panguipulli'].includes(exp.destinationId) ||
      selectedZone.value === 'norte' && exp.destinationId === 'dest-atacama' ||
      selectedZone.value === 'patagonia' && exp.destinationId === 'dest-patagonia' ||
      selectedZone.value === 'centro' && exp.destinationId === 'dest-cajon-maipo'
    );

    // 5. Filtro por modalidad de servicio
    let matchesModality = true;
    if (selectedModality.value === 'privadas') {
      matchesModality = exp.categories.some(c => c.toLowerCase().includes('privad')) || exp.tags.some(t => t.toLowerCase().includes('privad'));
    } else if (selectedModality.value === 'grupales') {
      matchesModality = !exp.tags.some(t => t.toLowerCase().includes('privad'));
    } else if (selectedModality.value === 'transporte') {
      matchesModality = exp.tags.some(t => t.toLowerCase().includes('transfer') || t.toLowerCase().includes('transporte'));
    }

    return matchesSearch && matchesDiff && matchesCity && matchesZone && matchesModality;
  });
});

const selectDestination = (destinationId: string) => {
  if (selectedCity.value === destinationId) {
    selectedCity.value = '';
  } else {
    selectedCity.value = destinationId;
    const dest = destinationsMeta.find(d => d.id === destinationId);
    if (dest) {
      selectedZone.value = dest.zoneId;
    }
  }
};

const selectZoneAction = (zoneId: string) => {
  selectedZone.value = zoneId;
  if (selectedCity.value) {
    const current = destinationsMeta.find(d => d.id === selectedCity.value);
    if (current && zoneId !== 'all' && current.zoneId !== zoneId) {
      selectedCity.value = '';
    }
  }
};

const resetFilters = () => {
  searchQuery.value = '';
  searchDate.value = '';
  searchPax.value = 1;
  selectedCity.value = '';
  selectedDifficulty.value = '';
  selectedZone.value = 'all';
  selectedModality.value = 'all';
};

const hasActiveFilters = computed(() => {
  return searchQuery.value !== '' ||
    searchDate.value !== '' ||
    searchPax.value > 1 ||
    selectedCity.value !== '' ||
    selectedDifficulty.value !== '' ||
    selectedZone.value !== 'all' ||
    selectedModality.value !== 'all';
});

// Modal de Expedición
const openModal = (exp: Experience) => {
  if (window.innerWidth < 768) {
    router.push({ path: `/experiencias/${exp.slug}` });
    return;
  }
  selectedExperience.value = exp;
  modalDate.value = searchDate.value || defaultNextDay;
  modalPax.value = searchPax.value || 1;
  document.body.style.overflow = 'hidden';
};

const closeModal = () => {
  selectedExperience.value = null;
  document.body.style.overflow = '';
};

// Formato y cálculos
const formatCurrency = (val: number, currency: string) => {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency, maximumFractionDigits: 0 }).format(val);
};

const contactCustomQuote = (serviceName?: string) => {
  const wa = contentStore.content.contact.whatsappNumber || '56985673376';
  const prefix = serviceName ? `Hola Wamani Experience, deseo cotizar el servicio de *${serviceName}*.` : 'Hola Wamani Experience, deseo solicitar una propuesta a medida para nuestro grupo.';
  const msg = encodeURIComponent(`${prefix}\n\nSomos aproximadamente ${searchPax.value} personas con fecha tentativa: ${searchDate.value || 'Por definir'}.\n¿Podrían brindarnos asesoría y disponibilidad?`);
  window.open(`https://wa.me/${wa}?text=${msg}`, '_blank');
};

const scrollToHash = () => {
  if (route.hash) {
    setTimeout(() => {
      const el = document.querySelector(route.hash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 250);
  }
};

onMounted(() => {
  if (route.query.q) searchQuery.value = route.query.q as string;
  if (route.query.date) searchDate.value = route.query.date as string;
  if (route.query.pax) searchPax.value = Number(route.query.pax) || 1;
  if (route.query.diff) selectedDifficulty.value = route.query.diff as string;
  if (route.query.city) {
    selectedCity.value = route.query.city as string;
    const dest = destinationsMeta.find(d => d.id === route.query.city);
    if (dest) selectedZone.value = dest.zoneId;
  }
  if (route.query.zone) selectedZone.value = route.query.zone as string;
  if (route.query.modality) selectedModality.value = route.query.modality as string;
  scrollToHash();
});

watch(() => route.hash, () => {
  scrollToHash();
});

watch(() => route.query, (newQ) => {
  if (newQ.city && newQ.city !== selectedCity.value) {
    selectedCity.value = newQ.city as string;
  }
});
</script>

<template>
  <div class="portfolio-page">
    
    <!-- 1. HERO INTEGRAL: EXPEDICIONES, DESTINOS & SERVICIOS -->
    <header class="portfolio-hero position-relative d-flex align-items-center justify-content-center text-center">
      <div class="hero-overlay"></div>
      <div class="position-relative z-1 text-white px-3 max-w-900 mx-auto">
        <div class="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill mb-3 shadow-sm" style="background: rgba(13, 91, 87, 0.85); border: 1px solid rgba(231, 220, 195, 0.5); backdrop-filter: blur(8px);">
          <i class="bi bi-compass" style="color: #E7DCC3; font-size: 0.9rem;"></i>
          <span class="fw-bold text-white tracking-wide" style="letter-spacing: 0.05em; font-size: 0.82rem;">Catálogo Wamani Experience</span>
        </div>
        <h1 class="display-3 fw-bold mb-3 font-brush text-white" style="font-family: 'Caveat', cursive !important; text-shadow: 0 4px 16px rgba(0,0,0,0.85);">
          Expediciones, Destinos & Servicios
        </h1>
        <p class="lead fw-medium text-white mb-4" style="text-shadow: 0 2px 10px rgba(0,0,0,0.85); font-size: 1.18rem; line-height: 1.6;">
          Descubre Chile de norte a sur. Selecciona tu territorio, elige tu formato de viaje (grupal, privado o a medida) y cotiza tu aventura en vivo con guías certificados y logística integral.
        </p>

        <!-- Sub-navegación rápida interna -->
        <div class="d-flex flex-wrap justify-content-center gap-2 pt-2">
          <a href="#catalogo" class="btn btn-sm btn-subnav rounded-pill px-3 py-2 fw-bold text-decoration-none">
            <i class="bi bi-grid-3x3-gap-fill me-1" style="color: #E7DCC3;"></i> Ver Catálogo
          </a>
          <a href="#destinos" class="btn btn-sm btn-subnav rounded-pill px-3 py-2 fw-bold text-decoration-none">
            <i class="bi bi-geo-alt-fill me-1" style="color: #E7DCC3;"></i> Destinos
          </a>
          <a href="#servicios" class="btn btn-sm btn-subnav rounded-pill px-3 py-2 fw-bold text-decoration-none">
            <i class="bi bi-stars me-1" style="color: #E7DCC3;"></i> Formatos de Servicio
          </a>
          <a href="#paquetes" class="btn btn-sm btn-subnav rounded-pill px-3 py-2 fw-bold text-decoration-none">
            <i class="bi bi-box-seam-fill me-1" style="color: #E7DCC3;"></i> Paquetes & Combos
          </a>
        </div>
      </div>
    </header>

    <!-- 2. SELECTOR VISUAL DE DESTINOS & MACROZONAS -->
    <section id="destinos" class="py-5 destinations-section position-relative">
      <div class="container">
        
        <div class="text-center mb-4">
          <span class="text-uppercase tracking-wider small fw-bold" style="color: #E7DCC3; letter-spacing: 0.15em;">Territorios Únicos</span>
          <h2 class="display-5 font-brush fw-bold text-white mb-2" style="font-family: 'Caveat', cursive !important;">Nuestros Destinos en Chile</h2>
          <p class="text-white opacity-85 mx-auto max-w-700 small mb-4">
            Haz clic en un destino para explorar sus expediciones y conocer detalles de su geografía y clima.
          </p>

          <!-- Filtro rápido por Macrozona -->
          <div class="macrozone-filter-bar d-flex justify-content-center flex-wrap gap-2 mb-4">
            <button 
              v-for="zone in macrozones" 
              :key="zone.id"
              type="button"
              class="btn rounded-pill px-3 py-2 fw-bold d-inline-flex align-items-center gap-2 shadow-sm transition-all"
              :class="selectedZone === zone.id ? 'btn-macrozone-active' : 'btn-macrozone-inactive'"
              @click="selectZoneAction(zone.id)"
            >
              <i :class="['bi', zone.icon]"></i>
              <span>{{ zone.label }}</span>
            </button>
          </div>
        </div>

        <!-- Fichas Visuales de Destinos -->
        <div class="row g-3 justify-content-center mb-4">
          <div 
            v-for="dest in destinationsMeta" 
            :key="dest.id" 
            class="col-12 col-sm-6 col-lg-4 col-xl-2-4"
            v-show="selectedZone === 'all' || dest.zoneId === selectedZone"
          >
            <div 
              class="destination-pill-card p-3 rounded-4 cursor-pointer transition-all position-relative overflow-hidden text-white h-100 d-flex flex-column justify-content-end"
              :class="{ 'destination-active': selectedCity === dest.id }"
              @click="selectDestination(dest.id)"
            >
              <img :src="dest.coverImage" :alt="dest.name" class="destination-bg-img position-absolute top-0 start-0 w-100 h-100 object-fit-cover">
              <div class="destination-pill-overlay position-absolute top-0 start-0 w-100 h-100"></div>
              
              <div class="position-relative z-2">
                <span class="badge rounded-pill bg-dark bg-opacity-75 text-accent px-2 py-1 small mb-1 fw-bold border border-secondary border-opacity-25" style="font-size: 0.68rem; color: #E7DCC3 !important;">
                  {{ dest.zone }}
                </span>
                <h3 class="h6 fw-bold mb-1 text-white">{{ dest.name }}</h3>
                <span class="small opacity-85 d-block" style="font-size: 0.75rem;">
                  <i class="bi bi-compass me-1 text-accent"></i>{{ getExperienceCountByCity(dest.id) }} expediciones
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Banner Contextual del Destino Seleccionado -->
        <div v-if="currentDestinationMeta" class="destination-context-banner p-4 rounded-4 shadow-lg mb-4 text-white position-relative">
          <button 
            class="btn btn-outline-light btn-sm rounded-circle position-absolute top-0 end-0 m-3 d-flex align-items-center justify-content-center"
            style="width: 36px; height: 36px;"
            @click="selectedCity = ''"
            title="Quitar filtro de destino"
          >
            <i class="bi bi-x-lg"></i>
          </button>
          
          <div class="row align-items-center g-4">
            <div class="col-lg-8">
              <span class="badge bg-accent text-dark fw-bold px-3 py-1 rounded-pill mb-2" style="background-color: #E7DCC3 !important; color: #0D5B57 !important;">
                Destino Activo: {{ currentDestinationMeta.zone }}
              </span>
              <h3 class="display-6 font-brush text-white mb-2" style="font-family: 'Caveat', cursive !important;">{{ currentDestinationMeta.name }}</h3>
              <p class="mb-3 opacity-90 lh-base" style="font-size: 0.95rem;">{{ currentDestinationMeta.description }}</p>
              
              <div class="d-flex flex-wrap gap-3 small pt-1">
                <div class="d-flex align-items-center gap-1">
                  <i class="bi bi-cloud-sun text-accent" style="color: #E7DCC3;"></i>
                  <span><strong>Clima:</strong> {{ currentDestinationMeta.climate }}</span>
                </div>
                <div class="d-flex align-items-center gap-1">
                  <i class="bi bi-calendar-check text-accent" style="color: #E7DCC3;"></i>
                  <span><strong>Mejor temporada:</strong> {{ currentDestinationMeta.bestSeason }}</span>
                </div>
                <div class="d-flex align-items-center gap-1">
                  <i class="bi bi-alt text-accent" style="color: #E7DCC3;"></i>
                  <span><strong>Altitud:</strong> {{ currentDestinationMeta.altitude }}</span>
                </div>
              </div>
            </div>

            <div class="col-lg-4 border-start-lg border-white border-opacity-25 ps-lg-4">
              <h4 class="h6 text-uppercase fw-bold mb-2" style="letter-spacing: 0.1em; color: #E7DCC3;">Imperdibles en esta zona:</h4>
              <ul class="list-unstyled mb-0 small opacity-95">
                <li v-for="(h, idx) in currentDestinationMeta.highlights" :key="idx" class="d-flex align-items-center gap-2 mb-1">
                  <i class="bi bi-check-circle-fill text-accent" style="color: #E7DCC3;"></i>
                  <span>{{ h }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- 3. MOTOR DE BÚSQUEDA Y CATÁLOGO DE EXPEDICIONES -->
    <div id="catalogo" class="container py-4">
      
      <!-- ENCABEZADO Y BUSCADOR CENTRADO ESTILO WAMANI DE LUJO -->
      <div class="catalog-header-container text-center mb-5">
        <h2 class="display-4 font-brush text-white fw-bold mb-2" style="font-family: 'Caveat', cursive !important; text-shadow: 0 3px 10px rgba(0,0,0,0.35);">
          Explorar Expediciones
        </h2>
        <p class="lead text-white fw-medium mb-4" style="font-size: 1.15rem; color: #FFFFFF !important; text-shadow: 0 1px 4px rgba(0,0,0,0.3);">
          Ajusta fecha, pasajeros y dificultad para cotizar en tiempo real
        </p>

        <!-- Filtro por Modalidad de Servicio (Pills) -->
        <div class="d-flex justify-content-center flex-wrap gap-2 mb-3">
          <button 
            v-for="mod in modalities" 
            :key="mod.id"
            type="button"
            class="btn btn-sm rounded-pill px-3 py-2 fw-bold d-inline-flex align-items-center gap-2 shadow-sm transition-all"
            :class="selectedModality === mod.id ? 'btn-macrozone-active' : 'btn-macrozone-inactive'"
            @click="selectedModality = mod.id"
          >
            <i :class="['bi', mod.icon]"></i>
            <span>{{ mod.label }}</span>
          </button>
        </div>

        <!-- CONTENEDOR BUSCADOR EN VERDE WAMANI #147E79 -->
        <div class="search-filter-box mx-auto p-3 p-md-4 rounded-4 shadow-lg">
          <div class="row g-3 align-items-center">
            
            <!-- 1. Input de Búsqueda -->
            <div class="col-12 col-md-4">
              <div class="input-icon-wrapper position-relative">
                <i class="bi bi-search search-icon" style="color: #E7DCC3 !important;"></i>
                <input 
                  v-model="searchQuery" 
                  type="search" 
                  class="form-control custom-search-input text-white fw-medium" 
                  placeholder="Tour, volcán o actividad..."
                  aria-label="Buscar tour, volcán o actividad"
                >
              </div>
            </div>

            <!-- 2. Selector de Fecha de Viaje -->
            <div class="col-12 col-sm-6 col-md-3">
              <div class="input-icon-wrapper position-relative">
                <i class="bi bi-calendar3 select-icon" style="color: #E7DCC3 !important;"></i>
                <input 
                  v-model="searchDate" 
                  type="date" 
                  :min="todayDate" 
                  class="form-control custom-select-input text-white fw-medium" 
                  title="Fecha estimada de excursión"
                  aria-label="Seleccionar fecha"
                >
              </div>
            </div>

            <!-- 3. Selector de Pasajeros -->
            <div class="col-12 col-sm-6 col-md-2">
              <div class="input-icon-wrapper position-relative">
                <i class="bi bi-people-fill select-icon" style="color: #E7DCC3 !important;"></i>
                <select v-model="searchPax" class="form-select custom-select-input text-white fw-medium" aria-label="Número de personas">
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

            <!-- 4. Selector de Dificultad -->
            <div class="col-12 col-sm-6" :class="hasActiveFilters ? 'col-md-2' : 'col-md-3'">
              <div class="input-icon-wrapper position-relative">
                <i class="bi bi-speedometer2 select-icon" style="color: #E7DCC3 !important;"></i>
                <select v-model="selectedDifficulty" class="form-select custom-select-input text-white fw-medium" aria-label="Nivel de exigencia">
                  <option value="">Cualquier dificultad</option>
                  <option value="easy">Fácil / Familiar</option>
                  <option value="moderate">Moderada</option>
                  <option value="hard">Exigente / Alta montaña</option>
                </select>
              </div>
            </div>

            <!-- Botón Limpiar Filtros -->
            <div class="col-12 col-md-1 d-flex align-items-center justify-content-center" v-if="hasActiveFilters">
              <button 
                class="btn btn-outline-light btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center fw-bold" 
                @click="resetFilters" 
                title="Limpiar todos los filtros"
                style="width: 42px; height: 42px;"
              >
                <i class="bi bi-x-lg"></i>
              </button>
            </div>

          </div>

          <!-- Contador de Resultados & Configuración de Viaje -->
          <div class="d-flex flex-wrap justify-content-between align-items-center mt-3 pt-3 border-top border-light border-opacity-25 px-1 gap-2">
            <span class="small text-white fw-semibold">
              <i class="bi bi-compass me-1 text-accent" style="color: #E7DCC3 !important;"></i> Mostrando <strong class="text-white fw-bold">{{ filteredExperiences.length }}</strong> expediciones disponibles
            </span>
            <div class="d-flex align-items-center gap-2">
              <span class="badge bg-dark bg-opacity-75 text-white border border-secondary border-opacity-50 small px-3 py-1 fw-bold">
                <i class="bi bi-person-fill text-accent me-1" style="color: #E7DCC3;"></i> Cotizando para <strong class="text-white">{{ searchPax }} {{ searchPax === 1 ? 'persona' : 'personas' }}</strong>
              </span>
              <span v-if="searchDate" class="badge bg-dark bg-opacity-75 text-accent border border-secondary border-opacity-50 small px-3 py-1 fw-bold" style="color: #E7DCC3 !important;">
                <i class="bi bi-calendar-event me-1"></i> {{ searchDate }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- GRID DE TARJETAS DE EXPEDICIÓN -->
      <div class="row g-4 mb-5">
        <div v-for="exp in filteredExperiences" :key="exp.id" class="col-md-6 col-lg-4">
          <WCard no-padding class="h-100 cursor-pointer catalog-card border-0" @click="openModal(exp)">
            <div class="position-relative overflow-hidden card-img-wrapper">
              <img :src="exp.coverImage.url" :alt="exp.coverImage.alt" width="400" height="220" loading="lazy" class="w-100 object-fit-cover transition-transform" style="height: 220px;">
              <div class="card-image-overlay"></div>
              <span class="badge bg-dark bg-opacity-85 text-accent position-absolute top-0 start-0 m-3 px-3 py-2 text-uppercase tracking-wide fw-bold border border-secondary border-opacity-40" style="font-size: 0.72rem; color: #E7DCC3 !important;">
                <i class="bi bi-geo-alt-fill me-1"></i>{{ getCityName(exp.destinationId) }}
              </span>
              <span v-if="exp.difficulty" class="badge bg-dark bg-opacity-75 text-white position-absolute top-0 end-0 m-3 px-2 py-1 text-uppercase fw-semibold" style="font-size: 0.68rem;">
                {{ exp.difficulty === 'hard' ? 'Alta Exigencia' : exp.difficulty === 'moderate' ? 'Moderada' : 'Fácil' }}
              </span>
            </div>
            <div class="p-4 d-flex flex-column flex-grow-1 justify-content-between">
              <div>
                <p class="small text-accent mb-1 text-uppercase fw-bold" style="color: #147E79 !important; font-size: 0.78rem; letter-spacing: 0.08em;">
                  {{ exp.tags && exp.tags.length ? exp.tags[0] : 'EXPERIENCIA' }}
                </p>
                <h3 class="h5 fw-bold mb-2" style="font-size: 1.25rem; color: #1C1C1E !important; font-family: 'Montserrat', sans-serif !important;">
                  {{ exp.title }}
                </h3>
                <p class="small mb-3 text-truncate fw-medium" style="color: #4C4C4C !important; font-size: 0.88rem;">
                  {{ exp.summary }}
                </p>
              </div>
              
              <div class="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
                <div>
                  <span class="small d-block fw-semibold" style="font-size: 0.8rem; color: #4C4C4C !important;">
                    {{ searchPax > 1 ? `Total (${searchPax} pax)` : 'Por persona' }}
                  </span>
                  <span class="fw-bold fs-5" style="color: #147E79 !important;">
                    {{ formatCurrency((exp.pricing ? exp.pricing.basePrice : 50000) * searchPax, 'CLP') }}
                  </span>
                </div>
                <WButton variant="primary" size="sm" class="px-3 py-2 fw-bold">Ver y Reservar</WButton>
              </div>
            </div>
          </WCard>
        </div>
        
        <!-- Estado Vacío -->
        <div v-if="filteredExperiences.length === 0" class="col-12 text-center py-5 text-white fw-bold bg-dark bg-opacity-25 rounded-4 p-5">
          <i class="bi bi-search fs-1 d-block mb-3" style="color: #E7DCC3;"></i>
          <h4 class="h5 text-white mb-2">No se encontraron expediciones con los filtros actuales</h4>
          <p class="small text-white opacity-75 mb-3">Intenta cambiar la macrozona, destino o limpiar los criterios de búsqueda.</p>
          <button class="btn btn-sm px-4 py-2 fw-bold rounded-pill" style="background-color: #E7DCC3; color: #0D5B57;" @click="resetFilters">
            Restablecer Filtros
          </button>
        </div>
      </div>

    </div>

    <!-- 4. PAQUETES & COMBOS MULTIDÍA -->
    <div id="paquetes">
      <HomePackages />
    </div>

    <!-- 5. FORMATOS DE SERVICIO WAMANI & COTIZACIONES A MEDIDA -->
    <section id="servicios" class="services-unified-section py-5 position-relative">
      <div class="container py-4">
        
        <div class="text-center mb-5">
          <span class="text-uppercase tracking-wider small fw-bold" style="color: #E7DCC3; letter-spacing: 0.15em;">Formatos y Modalidades</span>
          <h2 class="display-4 font-brush fw-bold mb-3 text-white" style="font-family: 'Caveat', cursive !important;">
            {{ contentStore.content.home.services.title }}
          </h2>
          <p class="lead text-white opacity-85 max-w-700 mx-auto" style="font-size: 1.15rem;">
            {{ contentStore.content.home.services.description }}
          </p>
        </div>

        <!-- Fila 1: 3 Tarjetas -->
        <div class="row g-4 justify-content-center mb-4">
          <div 
            v-for="service in contentStore.content.home.services.items.slice(0, 3)" 
            :key="service.id" 
            class="col-12 col-md-6 col-lg-4"
          >
            <div 
              class="service-card position-relative overflow-hidden cursor-pointer shadow-sm rounded-custom card-border h-100" 
              @click="openServiceModal(service)"
            >
              <div class="card-image-wrapper position-absolute top-0 start-0 w-100 h-100">
                <img :src="service.coverImage" :alt="service.title" class="w-100 h-100 object-fit-cover transition-all duration-700">
                <div class="card-overlay position-absolute top-0 start-0 w-100 h-100 transition-all duration-500"></div>
              </div>
              <div class="card-content position-relative z-2 d-flex flex-column justify-content-end align-items-center text-center h-100 p-4">
                <span class="font-sans text-uppercase text-white tracking-wide small mb-2 d-block subtitle-anim fw-bold" style="letter-spacing: 0.12em; font-size: 0.8rem; text-shadow: 0 2px 6px rgba(0,0,0,0.5);">
                  {{ service.subtitle }}
                </span>
                <h3 class="font-sans h3 text-white mb-0 title-anim fw-bold" style="font-size: 1.65rem; text-shadow: 0 2px 10px rgba(0,0,0,0.6);">
                  {{ service.title }}
                </h3>
                
                <div class="mt-3 opacity-0 btn-anim">
                  <span class="d-inline-flex align-items-center gap-2 font-sans text-uppercase tracking-wide small text-white border-bottom border-white pb-1 px-3 fw-bold" style="font-size: 0.75rem; letter-spacing: 0.1em; text-shadow: 0 1px 4px rgba(0,0,0,0.7);">
                    Ver Detalles 
                    <i class="bi bi-arrow-right"></i>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Fila 2: 2 Tarjetas Centradas -->
        <div class="row g-4 justify-content-center">
          <div 
            v-for="service in contentStore.content.home.services.items.slice(3, 5)" 
            :key="service.id" 
            class="col-12 col-md-6 col-lg-4"
          >
            <div 
              class="service-card position-relative overflow-hidden cursor-pointer shadow-sm rounded-custom card-border h-100" 
              @click="openServiceModal(service)"
            >
              <div class="card-image-wrapper position-absolute top-0 start-0 w-100 h-100">
                <img :src="service.coverImage" :alt="service.title" class="w-100 h-100 object-fit-cover transition-all duration-700">
                <div class="card-overlay position-absolute top-0 start-0 w-100 h-100 transition-all duration-500"></div>
              </div>
              <div class="card-content position-relative z-2 d-flex flex-column justify-content-end align-items-center text-center h-100 p-4">
                <span class="font-sans text-uppercase text-white tracking-wide small mb-2 d-block subtitle-anim fw-bold" style="letter-spacing: 0.12em; font-size: 0.8rem; text-shadow: 0 2px 6px rgba(0,0,0,0.5);">
                  {{ service.subtitle }}
                </span>
                <h3 class="font-sans h3 text-white mb-0 title-anim fw-bold" style="font-size: 1.65rem; text-shadow: 0 2px 10px rgba(0,0,0,0.6);">
                  {{ service.title }}
                </h3>
                
                <div class="mt-3 opacity-0 btn-anim">
                  <span class="d-inline-flex align-items-center gap-2 font-sans text-uppercase tracking-wide small text-white border-bottom border-white pb-1 px-3 fw-bold" style="font-size: 0.75rem; letter-spacing: 0.1em; text-shadow: 0 1px 4px rgba(0,0,0,0.7);">
                    Ver Detalles 
                    <i class="bi bi-arrow-right"></i>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Banner Especial de Cotización Corporativa / A Medida -->
        <div class="corporate-banner mt-5 p-4 p-md-5 rounded-4 shadow-lg text-white d-flex flex-column flex-md-row align-items-center justify-content-between gap-4">
          <div class="text-center text-md-start">
            <span class="badge bg-dark bg-opacity-75 text-accent px-3 py-1 rounded-pill mb-2 fw-bold" style="color: #E7DCC3 !important;">
              <i class="bi bi-buildings me-1"></i> Empresas, Universidades & Grupos Privados
            </span>
            <h3 class="h3 fw-bold mb-2 font-serif text-white">¿Necesitas una expedición personalizada o a medida?</h3>
            <p class="mb-0 text-white-50 max-w-700" style="color: rgba(255,255,255,0.85) !important;">
              Diseñamos experiencias corporativas, salidas formativas, team building y logística de transporte privado con acompañamiento profesional en cualquier territorio de Chile.
            </p>
          </div>
          <button 
            class="btn btn-whatsapp-custom py-3 px-4 fw-bold text-nowrap d-flex align-items-center gap-2 shadow-sm rounded-pill"
            @click="contactCustomQuote()"
          >
            <i class="bi bi-whatsapp fs-5"></i>
            <span>Cotizar Salida a Medida</span>
          </button>
        </div>

      </div>
    </section>

    <!-- MODAL DETALLE DE SERVICIO FLOTANTE CON SCROLL INTERNO -->
    <Teleport to="body">
      <Transition name="fade">
        <div 
          v-if="selectedService" 
          class="service-modal-backdrop" 
          @click="closeServiceModal"
        >
          <div 
            class="service-floating-card text-white shadow-2xl" 
            @click.stop
          >
            <!-- Botón Cerrar Flotante Fijo -->
            <button 
              @click="closeServiceModal" 
              class="btn-close-floating shadow-sm" 
              aria-label="Cerrar modal"
            >
              <i class="bi bi-x-lg"></i>
            </button>

            <!-- Cabecera Visual Fija -->
            <div class="card-fixed-header position-relative overflow-hidden">
              <img :src="selectedService.coverImage" :alt="selectedService.title" class="w-100 h-100 object-fit-cover scale-in-anim">
              <div class="header-overlay position-absolute top-0 start-0 w-100 h-100"></div>
              <div class="position-absolute bottom-0 start-0 p-3 p-sm-4 w-100 pe-5 z-2">
                <span class="font-sans text-uppercase tracking-wider small mb-1 d-block fw-bold text-accent" style="color: #E7DCC3 !important; font-size: 0.74rem;">
                  {{ selectedService.subtitle }}
                </span>
                <h3 class="font-brush fs-2 mb-0 text-white text-shadow lh-1" style="font-family: 'Caveat', cursive !important;">
                  {{ selectedService.title }}
                </h3>
              </div>
            </div>

            <!-- Cuerpo Desplazable con Scroll Interno -->
            <div class="card-scrollable-body p-3 p-sm-4 custom-scrollbar">
              <div class="mb-3">
                <h4 class="h6 text-uppercase fw-bold text-white mb-2 d-flex align-items-center gap-2" style="letter-spacing: 0.08em; color: #E7DCC3 !important;">
                  <i class="bi bi-compass"></i> La Experiencia
                </h4>
                <p v-for="(parrafo, idx) in selectedService.description" :key="idx" class="font-sans text-white opacity-95 lh-base mb-2 text-justify" style="font-size: 0.92rem;">
                  {{ parrafo }}
                </p>
                <div v-if="selectedService.targetAudience" class="p-3 rounded-3 border-start border-3 mt-3 shadow-sm" style="background-color: #0D5B57 !important; border-color: #E7DCC3 !important;">
                  <span class="font-sans text-uppercase tracking-wide small mb-1 fw-bold d-block" style="color: #E7DCC3 !important; font-size: 0.72rem;">Dirigido a:</span>
                  <p class="font-sans mb-0 text-white opacity-90 small" style="font-size: 0.85rem;">{{ selectedService.targetAudience }}</p>
                </div>
              </div>

              <!-- Características -->
              <div class="mb-3 pt-2 border-top border-white border-opacity-15">
                <h4 class="h6 text-uppercase fw-bold text-white mb-2 d-flex align-items-center gap-2" style="letter-spacing: 0.08em; color: #E7DCC3 !important;">
                  <i class="bi bi-stars"></i> Características Exclusivas
                </h4>
                <ul class="list-unstyled row g-2 mb-0">
                  <li v-for="(char, idx) in selectedService.characteristics" :key="idx" class="col-12 col-sm-6 d-flex align-items-start gap-2">
                    <span class="mt-1 p-1 rounded-circle shadow-sm d-flex align-items-center justify-content-center flex-shrink-0" style="background-color: #0D5B57; border: 1px solid #E7DCC3; color: #E7DCC3; width: 22px; height: 22px; font-size: 0.7rem;">
                      <i class="bi bi-check-lg fw-bold"></i>
                    </span>
                    <span class="font-sans text-white opacity-95 small lh-sm pt-1" style="font-size: 0.84rem;">{{ char }}</span>
                  </li>
                </ul>
              </div>

              <!-- Galería Compacta -->
              <div v-if="selectedService.gallery && selectedService.gallery.length > 0" class="mb-3 pt-2 border-top border-white border-opacity-15">
                <h4 class="h6 text-uppercase fw-bold text-white mb-2 d-flex align-items-center gap-2" style="letter-spacing: 0.08em; color: #E7DCC3 !important;">
                  <i class="bi bi-images"></i> Galería
                </h4>
                <div class="row g-2">
                  <div v-for="(img, idx) in selectedService.gallery" :key="idx" class="col-4">
                    <div class="gallery-img-wrapper rounded-3 overflow-hidden shadow-sm position-relative" style="height: 90px; border: 1px solid rgba(231, 220, 195, 0.3);">
                      <img :src="img" alt="Gallery image" class="w-100 h-100 object-fit-cover transition-all duration-500 hover-scale">
                    </div>
                  </div>
                </div>
              </div>

              <!-- Botón Acción Modal -->
              <div class="text-center pt-3 pb-1">
                <button 
                  class="btn btn-whatsapp-custom py-2 px-4 fw-bold rounded-pill shadow-md d-inline-flex align-items-center gap-2 small"
                  @click="contactCustomQuote(selectedService.title)"
                >
                  <i class="bi bi-whatsapp"></i>
                  <span>Cotizar {{ selectedService.title }} por WhatsApp</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- 6. MODAL FLOTANTE DE DETALLE Y RESERVA DE EXPEDICIÓN -->
    <ExperienceModal 
      :experience="selectedExperience" 
      :initial-date="searchDate || defaultNextDay" 
      :initial-pax="searchPax || 1" 
      @close="closeModal" 
    />

  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables';

.max-w-700 { max-width: 700px; }
.max-w-900 { max-width: 900px; }

.portfolio-hero {
  height: 52vh;
  min-height: 420px;
  overflow: hidden;
  background: url('https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1920&q=80') center/cover no-repeat;
  background-attachment: fixed;
  
  .hero-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to bottom, rgba(13, 91, 87, 0.65) 0%, rgba(20, 126, 121, 0.95) 100%);
  }
}

.btn-subnav {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(231, 220, 195, 0.5);
  color: #ffffff;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;

  &:hover {
    background: #E7DCC3;
    color: #0D5B57;
    border-color: #E7DCC3;
    transform: translateY(-2px);
  }
}

.destinations-section {
  background: rgba(13, 91, 87, 0.25);
  border-bottom: 1px solid rgba(231, 220, 195, 0.2);
}

// Columna 5 items en pantallas grandes (xl)
@media (min-width: 1200px) {
  .col-xl-2-4 {
    flex: 0 0 auto;
    width: 20%;
  }
}

.destination-pill-card {
  height: 160px;
  border: 1px solid rgba(231, 220, 195, 0.3);
  transition: all 0.35s cubic-bezier(0.2, 0.8, 0.2, 1);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);

  .destination-bg-img {
    transition: transform 0.6s ease;
  }

  .destination-pill-overlay {
    background: linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(13, 91, 87, 0.9) 80%);
    transition: background 0.35s ease;
  }

  &:hover {
    transform: translateY(-4px);
    border-color: #E7DCC3;
    box-shadow: 0 14px 30px rgba(0, 0, 0, 0.35);

    .destination-bg-img {
      transform: scale(1.08);
    }
  }

  &.destination-active {
    border: 2px solid #E7DCC3 !important;
    box-shadow: 0 0 20px rgba(231, 220, 195, 0.5) !important;
    transform: translateY(-4px);

    .destination-pill-overlay {
      background: linear-gradient(180deg, rgba(20, 126, 121, 0.4) 0%, rgba(13, 91, 87, 0.95) 90%);
    }
  }
}

.destination-context-banner {
  background: linear-gradient(135deg, rgba(13, 91, 87, 0.95) 0%, rgba(20, 126, 121, 0.95) 100%);
  border: 1px solid rgba(231, 220, 195, 0.4);
  backdrop-filter: blur(12px);
  animation: slideUp 0.35s ease;
}

@media (min-width: 992px) {
  .border-start-lg {
    border-left: 1px solid rgba(231, 220, 195, 0.35) !important;
  }
}

.macrozone-filter-bar {
  .btn-macrozone-active {
    background-color: #E7DCC3 !important;
    color: #0D5B57 !important;
    border: 1px solid #E7DCC3 !important;
    font-weight: 700 !important;
    box-shadow: 0 4px 14px rgba(231, 220, 195, 0.4) !important;
    transform: translateY(-2px);
  }

  .btn-macrozone-inactive {
    background-color: rgba(13, 91, 87, 0.85) !important;
    color: #ffffff !important;
    border: 1px solid rgba(231, 220, 195, 0.35) !important;
    backdrop-filter: blur(8px);
    
    &:hover {
      background-color: #147E79 !important;
      border-color: #E7DCC3 !important;
      color: #E7DCC3 !important;
      transform: translateY(-1px);
    }
  }
}

// Caja Buscador
.search-filter-box {
  background: #147E79 !important;
  border: 1px solid rgba(231, 220, 195, 0.45);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35) !important;
  max-width: 1050px;
}

.input-icon-wrapper {
  position: relative;
  
  .search-icon,
  .select-icon {
    position: absolute;
    top: 50%;
    left: 1rem;
    transform: translateY(-50%);
    color: #E7DCC3 !important;
    font-size: 1.15rem !important;
    z-index: 5;
    pointer-events: none;
    opacity: 1 !important;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  }
}

.custom-search-input,
.custom-select-input {
  background-color: #0D5B57 !important;
  border: 1.5px solid rgba(231, 220, 195, 0.6) !important;
  color: #FFFFFF !important;
  padding: 0.75rem 1rem 0.75rem 2.85rem !important;
  border-radius: 14px !important;
  font-size: 0.95rem !important;
  color-scheme: dark !important;

  &:focus {
    background-color: #083D3A !important;
    border-color: #E7DCC3 !important;
    box-shadow: 0 0 0 3px rgba(231, 220, 195, 0.4) !important;
    color: #FFFFFF !important;
  }

  &::placeholder,
  &::-webkit-input-placeholder {
    color: rgba(255, 255, 255, 0.85) !important;
    opacity: 1 !important;
  }
}

/* Indicador nativo de calendario SVG Beige Tierra en alta resolución */
input[type="date"]::-webkit-calendar-picker-indicator {
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' fill='%23E7DCC3' viewBox='0 0 16 16'%3E%3Cpath d='M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z'/%3E%3C/svg%3E") !important;
  background-repeat: no-repeat !important;
  background-position: center !important;
  background-size: 18px 18px !important;
  filter: none !important;
  opacity: 1 !important;
  width: 22px !important;
  height: 22px !important;
}

// Tarjetas Catalog
.catalog-card {
  background-color: #FFFFFF !important;
  border-radius: 22px !important;
  border: 1px solid rgba(0, 0, 0, 0.06) !important;
  box-shadow: 0 4px 24px -4px rgba(0, 0, 0, 0.03);
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  color: var(--bs-body-color);
  
  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 16px 40px -8px rgba(0, 0, 0, 0.08);
    
    .transition-transform {
      transform: scale(1.04);
    }
  }
  
  .transition-transform {
    transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
  }
  
  .card-img-wrapper {
    border-top-left-radius: 22px;
    border-top-right-radius: 22px;
    overflow: hidden;
  }
  
  h3, .h5 {
    color: #1C1C1E !important;
    font-family: var(--bs-font-sans-serif) !important;
    font-weight: 700 !important;
  }
  
  .text-muted, p:not(.text-accent) {
    color: #4C4C4C !important;
  }
  
  .text-accent {
    color: #147E79 !important;
  }
  
  .border-top {
    border-top-color: rgba(0, 0, 0, 0.08) !important;
  }
}

.card-image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, transparent 50%, rgba(26, 26, 26, 0.4) 100%);
  pointer-events: none;
  z-index: 1;
}

// Sección de Servicios
.services-unified-section {
  background: rgba(13, 91, 87, 0.35);
  border-top: 1px solid rgba(231, 220, 195, 0.2);
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.service-card {
  aspect-ratio: 1 / 1;
  min-height: 340px;
  background-color: #0D5B57;
  border-radius: 24px;
  border: 1px solid rgba(231, 220, 195, 0.25);
  transition: transform 0.4s ease, box-shadow 0.4s ease;
  display: flex;
  flex-direction: column;

  .card-overlay {
    background: linear-gradient(to top, rgba(13, 91, 87, 0.95) 0%, rgba(13, 91, 87, 0.3) 50%, rgba(0, 0, 0, 0.08) 100%);
  }

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 16px 36px rgba(0, 0, 0, 0.4);

    img {
      transform: scale(1.08);
    }

    .btn-anim {
      opacity: 1 !important;
      transform: translateY(0);
    }
  }
}

.corporate-banner {
  background: linear-gradient(135deg, #0D5B57 0%, #147E79 100%);
  border: 1px solid #E7DCC3;
}

.btn-whatsapp-custom {
  background-color: #25D366;
  color: #ffffff;
  border: none;
  transition: all 0.3s ease;

  &:hover {
    background-color: #20BA5A;
    color: #ffffff;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(37, 211, 102, 0.4);
  }
}

.btn-close-custom {
  background: rgba(0, 0, 0, 0.6);
  width: 44px;
  height: 44px;
  &:hover {
    background: rgba(0, 0, 0, 0.9);
    transform: rotate(90deg);
  }
}

.bg-gradient-dark-bottom {
  background: linear-gradient(180deg, transparent 40%, rgba(13, 91, 87, 0.95) 100%);
}

.decorative-line {
  display: inline-block;
  width: 40px;
  height: 3px;
  background-color: #E7DCC3;
  border-radius: 2px;
}

.divider-line {
  height: 1px;
  background: rgba(231, 220, 195, 0.35);
}

.custom-scrollbar {
  &::-webkit-scrollbar { width: 8px; }
  &::-webkit-scrollbar-thumb {
    background: rgba(231, 220, 195, 0.4);
    border-radius: 10px;
  }
}

.service-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 2050;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(10, 50, 48, 0.85);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.service-floating-card {
  width: 100%;
  max-width: 580px;
  max-height: 85vh;
  max-height: 85dvh;
  background-color: #147E79 !important;
  border: 1.5px solid rgba(231, 220, 195, 0.5) !important;
  border-radius: 24px !important;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.75) !important;
  overflow: hidden !important;
  display: flex;
  flex-direction: column;
  position: relative;
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.btn-close-floating {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 30;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.35);
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.25s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.9);
    transform: rotate(90deg) scale(1.05);
    border-color: #E7DCC3;
  }
}

.card-fixed-header {
  height: 160px;
  min-height: 160px;
  flex-shrink: 0;
  position: relative;

  .header-overlay {
    background: linear-gradient(180deg, rgba(0, 0, 0, 0.15) 0%, rgba(13, 91, 87, 0.95) 100%);
  }
}

.card-scrollable-body {
  overflow-y: auto !important;
  flex: 1 1 auto;
  -webkit-overflow-scrolling: touch;
  background-color: #147E79 !important;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.15);
    border-radius: 10px;
  }
  &::-webkit-scrollbar-thumb {
    background: #E7DCC3;
    border-radius: 10px;
    &:hover {
      background: #FFFFFF;
    }
  }
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@keyframes slideUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
