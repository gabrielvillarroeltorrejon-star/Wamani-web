<script setup lang="ts">
// Widget oficial: Galería Fotográfica (8 Fotos)
// Manual de Marca Wamani Experience - Páginas 5 y 8
import { ref } from 'vue';

const photos = ref([
  {
    url: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=80',
    title: 'Travesía Andina',
    caption: 'Senderismo de altura entre cumbres cordilleranas',
    gridClass: 'col-12 col-md-6 col-lg-4'
  },
  {
    url: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=800&q=80',
    title: 'Volcanes Activos',
    caption: 'Ascenso consciente al cráter humeante',
    gridClass: 'col-12 col-md-6 col-lg-4'
  },
  {
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    title: 'Bosques Nativos & Valles',
    caption: 'Luz natural matutina en senderos protegidos',
    gridClass: 'col-12 col-md-6 col-lg-4'
  },
  {
    url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80',
    title: 'Lagos & Espejos de Agua',
    caption: 'Navegación silenciosa al caer la tarde',
    gridClass: 'col-12 col-md-6 col-lg-3'
  },
  {
    url: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80',
    title: 'Fogón & Encuentro Local',
    caption: 'Momentos espontáneos compartiendo saberes y relatos',
    gridClass: 'col-12 col-md-6 col-lg-3'
  },
  {
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    title: 'Horizonte Patagónico',
    caption: 'Estepas infinitas y aire puro del sur del mundo',
    gridClass: 'col-12 col-md-6 col-lg-3'
  },
  {
    url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    title: 'Aguas Termales del Bosque',
    caption: 'Desconexión y relajo en pozas termales naturales',
    gridClass: 'col-12 col-md-6 col-lg-3'
  },
  {
    url: 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=800&q=80',
    title: 'Comunidad & Territorio',
    caption: 'Caminatas compartidas con respeto ambiental y cultural',
    gridClass: 'col-12 col-lg-12'
  }
]);
</script>

<template>
  <section id="galeria" class="gallery-section py-5 position-relative" style="background-color: #FFFFFF;">
    <div class="container py-4">
      
      <div class="text-center mb-5">
        <div class="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-3" style="background: rgba(20, 126, 121, 0.08); border: 1px solid rgba(20, 126, 121, 0.2);">
          <i class="bi bi-camera-fill" style="color: #147E79;"></i>
          <span class="small text-uppercase fw-bold" style="color: #147E79; letter-spacing: 0.12em; font-size: 0.78rem;">Dirección de Arte</span>
        </div>

        <h2 class="display-5 fw-bold mb-2 font-sans" style="color: #147E79;">
          Miradas Auténticas
        </h2>
        <p class="brand-slogan fs-4 mb-2" style="color: #147E79;">
          Luz natural, paisajes reales y vivencias sin posar.
        </p>
        <p class="text-muted small mx-auto" style="max-width: 650px; color: #4C4C4C !important;">
          Capturamos la esencia espontánea de la naturaleza y de quienes la recorren con respeto, humildad y asombro.
        </p>
      </div>

      <!-- Malla de 8 Fotografías -->
      <div class="row g-3">
        <div v-for="(photo, idx) in photos" :key="idx" :class="photo.gridClass">
          <div class="gallery-card rounded-4 overflow-hidden position-relative shadow-sm group">
            <div class="photo-wrapper overflow-hidden" :style="{ height: photo.gridClass.includes('col-lg-12') ? '320px' : '260px' }">
              <img 
                :src="photo.url" 
                :alt="photo.title" 
                class="w-100 h-100 object-fit-cover transition-all duration-700 hover-zoom"
                loading="lazy"
              />
            </div>
            
            <div class="photo-overlay position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-end p-3 text-white">
              <span class="badge align-self-start mb-1 fw-bold text-uppercase" style="background-color: rgba(20, 126, 121, 0.9); font-size: 0.68rem; letter-spacing: 0.08em;">
                {{ photo.title }}
              </span>
              <p class="small mb-0 text-white fw-medium text-shadow" style="font-size: 0.85rem;">
                {{ photo.caption }}
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>

<style scoped>
.gallery-card {
  position: relative;
  background-color: #E7DCC3;
  border: 1px solid rgba(231, 220, 195, 0.5);
  transition: transform 0.35s ease, box-shadow 0.35s ease;
}

.gallery-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(20, 126, 121, 0.15) !important;
}

.photo-overlay {
  background: linear-gradient(to top, rgba(14, 94, 90, 0.88) 0%, rgba(14, 94, 90, 0.25) 50%, transparent 100%);
  opacity: 0.9;
  transition: opacity 0.3s ease;
}

.gallery-card:hover .photo-overlay {
  opacity: 1;
}

.hover-zoom {
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.gallery-card:hover .hover-zoom {
  transform: scale(1.05);
}

.text-shadow {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}
</style>
