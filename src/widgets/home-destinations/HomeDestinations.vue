<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useContentStore } from '@/shared/stores/contentStore';

const router = useRouter();
const contentStore = useContentStore();

interface DestinationSpot {
  id: string;
  name: string;
  subtitle: string;
  tag: string;
  image: string;
  description: string;
  featured: boolean;
}

const destinations: DestinationSpot[] = [
  {
    id: 'dest-pucon',
    name: 'Pucón & Volcán Villarrica',
    subtitle: 'La Capital del Turismo Aventura',
    tag: 'Lagos & Volcanes (Sur)',
    image: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1200&q=80',
    description: 'Ascensiones al cráter activo, termas geotérmicas naturales y bosques milenarios de araucarias.',
    featured: true
  },
  {
    id: 'dest-panguipulli',
    name: 'Panguipulli & Huilo Huilo',
    subtitle: 'Ruta de los Siete Lagos',
    tag: 'Selva Valdiviana (Sur)',
    image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80',
    description: 'Santuarios de biodiversidad virgen, saltos de agua cristalina y reservas biológicas protegidas.',
    featured: false
  },
  {
    id: 'dest-atacama',
    name: 'San Pedro de Atacama',
    subtitle: 'El Desierto Más Árido del Mundo',
    tag: 'Norte Grande & Altiplano',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    description: 'Geotermia viva en los Géiseres del Tatio, valles lunares y salares infinitos bajo cielos prístinos.',
    featured: false
  },
  {
    id: 'dest-patagonia',
    name: 'Torres del Paine & Patagonia',
    subtitle: 'Los Confines del Continente',
    tag: 'Patagonia Austral',
    image: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80',
    description: 'Trekking épico entre cuernos de granito, glaciares milenarios y estepa salvaje indómita.',
    featured: true
  },
  {
    id: 'dest-cajon-maipo',
    name: 'Cajón del Maipo & Andes',
    subtitle: 'Cordillera Central y Glaciares',
    tag: 'Cordillera de Santiago',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    description: 'Embalse El Yeso, senderos de alta montaña y termas cordilleranas a pocas horas de la capital.',
    featured: false
  }
];

const getExperienceCount = (destId: string) => {
  return contentStore.experiences.filter(e => e.destinationId === destId).length;
};

const totalExperiences = computed(() => contentStore.experiences.length);

const goToDestination = (destId: string) => {
  router.push({
    path: '/experiencias',
    query: { city: destId }
  });
};

const goToAllExperiences = () => {
  router.push('/experiencias');
};
</script>

<template>
  <section id="destinos" class="home-destinations py-5 position-relative">
    <div class="container py-4">
      
      <!-- ENCABEZADO EDITORIAL DE DESTINOS -->
      <div class="text-center mb-5">
        <span class="text-uppercase tracking-wider small fw-bold" style="color: #E7DCC3; letter-spacing: 0.15em;">
          Territorios de Expedición
        </span>
        <h2 class="display-4 font-brush fw-bold mb-3 text-white" style="font-family: 'Caveat', cursive !important; text-shadow: 0 3px 10px rgba(0,0,0,0.35);">
          Nuestros Destinos Emblemáticos
        </h2>
        <p class="lead text-white opacity-90 max-w-700 mx-auto" style="font-size: 1.15rem; color: #FFFFFF !important;">
          De norte a sur, recorremos los paisajes más sobrecogedores de Chile. Elige tu próximo territorio y conoce sus expediciones guiadas.
        </p>
      </div>

      <!-- GRILLA VISUAL DE DESTINOS (BENTO MODERNO) -->
      <div class="row g-4 mb-5">
        
        <!-- Tarjeta Grande 1: Pucón (Destacado) -->
        <div class="col-12 col-lg-7">
          <div 
            class="destination-showcase-card rounded-4 position-relative overflow-hidden cursor-pointer shadow-lg h-100" 
            style="min-height: 380px;"
            @click="goToDestination(destinations[0].id)"
          >
            <img :src="destinations[0].image" :alt="destinations[0].name" class="dest-card-img position-absolute top-0 start-0 w-100 h-100 object-fit-cover">
            <div class="dest-card-overlay position-absolute top-0 start-0 w-100 h-100"></div>
            
            <div class="dest-card-content position-relative z-2 p-4 p-md-5 d-flex flex-column justify-content-between h-100 text-white">
              <div class="d-flex justify-content-between align-items-start">
                <span class="badge rounded-pill bg-dark bg-opacity-75 text-accent px-3 py-2 text-uppercase fw-bold border border-secondary border-opacity-40" style="color: #E7DCC3 !important; font-size: 0.75rem;">
                  <i class="bi bi-geo-alt-fill me-1"></i> {{ destinations[0].tag }}
                </span>
                <span class="badge rounded-pill px-3 py-1 small fw-semibold" style="background: rgba(0, 0, 0, 0.65); color: #FFFFFF; border: 1px solid rgba(255, 255, 255, 0.35); backdrop-filter: blur(6px);">
                  {{ getExperienceCount(destinations[0].id) }} Expediciones
                </span>
              </div>

              <div>
                <span class="text-uppercase tracking-wider small fw-bold d-block mb-1" style="color: #E7DCC3; letter-spacing: 0.1em;">
                  {{ destinations[0].subtitle }}
                </span>
                <h3 class="display-6 fw-bold font-serif mb-2 text-white">{{ destinations[0].name }}</h3>
                <p class="mb-3 text-white opacity-90 max-w-500 d-none d-sm-block small">{{ destinations[0].description }}</p>
                <div class="d-inline-flex align-items-center gap-2 text-uppercase tracking-wide fw-bold border-bottom border-accent pb-1" style="font-size: 0.8rem; color: #E7DCC3;">
                  <span>Explorar Expediciones en Pucón</span>
                  <i class="bi bi-arrow-right"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tarjeta Grande 2: Torres del Paine (Destacado) -->
        <div class="col-12 col-lg-5">
          <div 
            class="destination-showcase-card rounded-4 position-relative overflow-hidden cursor-pointer shadow-lg h-100" 
            style="min-height: 380px;"
            @click="goToDestination(destinations[3].id)"
          >
            <img :src="destinations[3].image" :alt="destinations[3].name" class="dest-card-img position-absolute top-0 start-0 w-100 h-100 object-fit-cover">
            <div class="dest-card-overlay position-absolute top-0 start-0 w-100 h-100"></div>
            
            <div class="dest-card-content position-relative z-2 p-4 p-md-5 d-flex flex-column justify-content-between h-100 text-white">
              <div class="d-flex justify-content-between align-items-start">
                <span class="badge rounded-pill bg-dark bg-opacity-75 text-accent px-3 py-2 text-uppercase fw-bold border border-secondary border-opacity-40" style="color: #E7DCC3 !important; font-size: 0.75rem;">
                  <i class="bi bi-geo-alt-fill me-1"></i> {{ destinations[3].tag }}
                </span>
                <span class="badge rounded-pill px-3 py-1 small fw-semibold" style="background: rgba(0, 0, 0, 0.65); color: #FFFFFF; border: 1px solid rgba(255, 255, 255, 0.35); backdrop-filter: blur(6px);">
                  {{ getExperienceCount(destinations[3].id) }} Expediciones
                </span>
              </div>

              <div>
                <span class="text-uppercase tracking-wider small fw-bold d-block mb-1" style="color: #E7DCC3; letter-spacing: 0.1em;">
                  {{ destinations[3].subtitle }}
                </span>
                <h3 class="h2 fw-bold font-serif mb-2 text-white">{{ destinations[3].name }}</h3>
                <p class="mb-3 text-white opacity-90 d-none d-sm-block small">{{ destinations[3].description }}</p>
                <div class="d-inline-flex align-items-center gap-2 text-uppercase tracking-wide fw-bold border-bottom border-accent pb-1" style="font-size: 0.8rem; color: #E7DCC3;">
                  <span>Explorar Patagonia</span>
                  <i class="bi bi-arrow-right"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 3 Tarjetas Inferiores: Panguipulli, Atacama, Cajón del Maipo -->
        <div class="col-12 col-md-4">
          <div 
            class="destination-showcase-card rounded-4 position-relative overflow-hidden cursor-pointer shadow-lg" 
            style="height: 300px;"
            @click="goToDestination(destinations[1].id)"
          >
            <img :src="destinations[1].image" :alt="destinations[1].name" class="dest-card-img position-absolute top-0 start-0 w-100 h-100 object-fit-cover">
            <div class="dest-card-overlay position-absolute top-0 start-0 w-100 h-100"></div>
            
            <div class="dest-card-content position-relative z-2 p-4 d-flex flex-column justify-content-between h-100 text-white">
              <div>
                <span class="badge rounded-pill bg-dark bg-opacity-75 text-accent px-2 py-1 small fw-bold mb-2 border border-secondary border-opacity-40" style="color: #E7DCC3 !important; font-size: 0.68rem;">
                  {{ destinations[1].tag }}
                </span>
                <h4 class="h5 fw-bold font-serif mb-1 text-white">{{ destinations[1].name }}</h4>
                <span class="small opacity-85 d-block" style="font-size: 0.78rem;">{{ destinations[1].subtitle }}</span>
              </div>
              <div class="d-flex justify-content-between align-items-center pt-2 border-top border-white border-opacity-25">
                <span class="small opacity-90">{{ getExperienceCount(destinations[1].id) }} Tours</span>
                <span class="small fw-bold text-accent" style="color: #E7DCC3;">Ver destino <i class="bi bi-arrow-right"></i></span>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-md-4">
          <div 
            class="destination-showcase-card rounded-4 position-relative overflow-hidden cursor-pointer shadow-lg" 
            style="height: 300px;"
            @click="goToDestination(destinations[2].id)"
          >
            <img :src="destinations[2].image" :alt="destinations[2].name" class="dest-card-img position-absolute top-0 start-0 w-100 h-100 object-fit-cover">
            <div class="dest-card-overlay position-absolute top-0 start-0 w-100 h-100"></div>
            
            <div class="dest-card-content position-relative z-2 p-4 d-flex flex-column justify-content-between h-100 text-white">
              <div>
                <span class="badge rounded-pill bg-dark bg-opacity-75 text-accent px-2 py-1 small fw-bold mb-2 border border-secondary border-opacity-40" style="color: #E7DCC3 !important; font-size: 0.68rem;">
                  {{ destinations[2].tag }}
                </span>
                <h4 class="h5 fw-bold font-serif mb-1 text-white">{{ destinations[2].name }}</h4>
                <span class="small opacity-85 d-block" style="font-size: 0.78rem;">{{ destinations[2].subtitle }}</span>
              </div>
              <div class="d-flex justify-content-between align-items-center pt-2 border-top border-white border-opacity-25">
                <span class="small opacity-90">{{ getExperienceCount(destinations[2].id) }} Tours</span>
                <span class="small fw-bold text-accent" style="color: #E7DCC3;">Ver destino <i class="bi bi-arrow-right"></i></span>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-md-4">
          <div 
            class="destination-showcase-card rounded-4 position-relative overflow-hidden cursor-pointer shadow-lg" 
            style="height: 300px;"
            @click="goToDestination(destinations[4].id)"
          >
            <img :src="destinations[4].image" :alt="destinations[4].name" class="dest-card-img position-absolute top-0 start-0 w-100 h-100 object-fit-cover">
            <div class="dest-card-overlay position-absolute top-0 start-0 w-100 h-100"></div>
            
            <div class="dest-card-content position-relative z-2 p-4 d-flex flex-column justify-content-between h-100 text-white">
              <div>
                <span class="badge rounded-pill bg-dark bg-opacity-75 text-accent px-2 py-1 small fw-bold mb-2 border border-secondary border-opacity-40" style="color: #E7DCC3 !important; font-size: 0.68rem;">
                  {{ destinations[4].tag }}
                </span>
                <h4 class="h5 fw-bold font-serif mb-1 text-white">{{ destinations[4].name }}</h4>
                <span class="small opacity-85 d-block" style="font-size: 0.78rem;">{{ destinations[4].subtitle }}</span>
              </div>
              <div class="d-flex justify-content-between align-items-center pt-2 border-top border-white border-opacity-25">
                <span class="small opacity-90">{{ getExperienceCount(destinations[4].id) }} Tours</span>
                <span class="small fw-bold text-accent" style="color: #E7DCC3;">Ver destino <i class="bi bi-arrow-right"></i></span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- CTA BANNER INTEGRAL: ACCESO DIRECTO AL CATÁLOGO UNIFICADO -->
      <div class="unified-catalog-cta-box p-4 p-md-5 rounded-4 shadow-xl text-center text-white position-relative overflow-hidden">
        <div class="position-relative z-2 max-w-700 mx-auto">
        <div class="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-3 shadow-sm" style="background: rgba(0, 0, 0, 0.45); border: 1px solid rgba(231, 220, 195, 0.5); backdrop-filter: blur(8px);">
          <i class="bi bi-compass" style="color: #E7DCC3; font-size: 0.85rem;"></i>
          <span class="fw-bold text-white small" style="letter-spacing: 0.05em; font-size: 0.8rem;">Catálogo Wamani Experience</span>
        </div>
          <h3 class="display-6 fw-bold mb-3 font-brush" style="font-family: 'Caveat', cursive !important;">
            ¿Buscas una fecha, tour o cotización inmediata?
          </h3>
          <p class="mb-4 opacity-95 lead" style="font-size: 1.05rem;">
            Accede a nuestras más de {{ totalExperiences }} expediciones activas. Cotiza según el número de pasajeros, filtra por nivel de dificultad o modalidad privada/grupal y reserva en segundos.
          </p>
          <div class="d-flex flex-wrap justify-content-center gap-3">
            <button 
              class="btn btn-accent-custom py-3 px-5 fw-bold text-uppercase rounded-pill shadow-lg d-inline-flex align-items-center gap-2"
              @click="goToAllExperiences"
            >
              <i class="bi bi-grid-3x3-gap-fill"></i>
              <span>Ver Catálogo Completo & Reservar</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>

<style scoped lang="scss">
@import '@/assets/styles/variables';

.max-w-700 { max-width: 700px; }
.max-w-500 { max-width: 500px; }

.destination-showcase-card {
  border: 1px solid rgba(231, 220, 195, 0.35);
  transition: transform 0.4s ease, box-shadow 0.4s ease, border-color 0.3s ease;

  .dest-card-img {
    transition: transform 0.7s cubic-bezier(0.2, 0.8, 0.2, 1);
  }

  .dest-card-overlay {
    background: linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(13, 91, 87, 0.95) 85%);
    transition: background 0.4s ease;
  }

  &:hover {
    transform: translateY(-8px);
    border-color: #E7DCC3;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.45) !important;

    .dest-card-img {
      transform: scale(1.08);
    }

    .dest-card-overlay {
      background: linear-gradient(180deg, rgba(20, 126, 121, 0.25) 0%, rgba(13, 91, 87, 0.98) 85%);
    }
  }
}

.unified-catalog-cta-box {
  background: linear-gradient(135deg, #0D5B57 0%, #147E79 50%, #0D5B57 100%);
  border: 1px solid #E7DCC3;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
}

.btn-accent-custom {
  background-color: #E7DCC3;
  color: #0D5B57;
  border: none;
  letter-spacing: 0.08em;
  font-size: 0.9rem;
  transition: all 0.3s ease;

  &:hover {
    background-color: #ffffff;
    color: #0D5B57;
    transform: translateY(-2px);
    box-shadow: 0 10px 24px rgba(231, 220, 195, 0.4);
  }
}
</style>
