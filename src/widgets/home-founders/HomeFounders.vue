<script setup lang="ts">
// Sección oficial: Presentación Nosotros & Fundadores
// Manual de Marca Wamani Experience - Páginas 6 y 7
import { ref } from 'vue';

const founders = ref([
  {
    name: 'Camilo Tamayo',
    role: 'Fundador',
    image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=80',
    bio: 'Guía de montaña apasionado por la seguridad, la expedición y el respeto hacia los ecosistemas andinos. Dedicado a conectar a los viajeros con la fuerza transformadora de las cumbres.'
  },
  {
    name: 'Benjamín Meneses',
    role: 'Co-Fundador',
    image: 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=800&q=80',
    bio: 'Especialista en conservación ambiental y diseño de rutas sustentables que conectan con la memoria, la cultura y el cuidado de las comunidades locales en cada territorio.'
  }
]);
</script>

<template>
  <section id="nosotros" class="founders-section py-5 position-relative" style="background-color: #FAF8F5;">
    <div class="container py-4">
      
      <!-- Encabezado de la Sección -->
      <div class="row justify-content-center text-center mb-5">
        <div class="col-12 col-lg-9">
          <div class="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-3" style="background: rgba(20, 126, 121, 0.08); border: 1px solid rgba(20, 126, 121, 0.2);">
            <i class="bi bi-people-fill" style="color: #147E79;"></i>
            <span class="small text-uppercase fw-bold" style="color: #147E79; letter-spacing: 0.12em; font-size: 0.78rem;">Quiénes Somos</span>
          </div>

          <h2 class="display-5 fw-bold mb-2 font-sans" style="color: #147E79;">
            Wamani Experience
          </h2>
          <p class="brand-slogan fs-4 mb-4" style="color: #147E79;">
            Guardianes del territorio y creadores de experiencias con sentido.
          </p>

          <div class="narrative-text text-start mx-auto" style="max-width: 860px;">
            <p class="lead fw-medium mb-3" style="color: #4C4C4C; font-size: 1.1rem; line-height: 1.8;">
              Wamani Experience es una agencia boutique de turismo sustentable con base en Chile, inspirada en la cosmovisión andina que reconoce a la montaña —el Wamani— como espíritu protector de la naturaleza.
            </p>
            <p class="mb-3" style="color: #4C4C4C; font-size: 1.05rem; line-height: 1.8;">
              Nuestro propósito es crear experiencias que inspiren a <strong>ver, sentir y cuidar Sudamérica</strong>, conectando a los viajeros con sus paisajes, culturas y comunidades desde una mirada consciente y respetuosa.
            </p>
            <p class="mb-3" style="color: #4C4C4C; font-size: 1.05rem; line-height: 1.8;">
              Diseñamos tours auténticos, donde la aventura, la cultura y la sostenibilidad se encuentran en equilibrio. Cada recorrido es una invitación a mirar con los ojos del territorio, a descubrir su diversidad y a vivir el turismo como una experiencia de transformación y conexión profunda.
            </p>
          </div>
        </div>
      </div>

      <!-- Tarjetas del Equipo Fundador -->
      <div class="text-center mb-4">
        <h3 class="h4 fw-bold font-sans" style="color: #147E79; letter-spacing: 0.05em;">Nuestro Equipo</h3>
      </div>

      <div class="row g-4 justify-content-center">
        <div v-for="founder in founders" :key="founder.name" class="col-12 col-md-6 col-lg-5">
          <div class="founder-card h-100 rounded-4 overflow-hidden shadow-sm d-flex flex-column border-0" style="background-color: #FFFFFF;">
            <div class="founder-img-wrapper position-relative overflow-hidden" style="height: 340px; background-color: #E7DCC3;">
              <img 
                :src="founder.image" 
                :alt="founder.name" 
                class="w-100 h-100 object-fit-cover transition-all hover-scale"
                loading="lazy"
              />
              <div class="position-absolute bottom-0 start-0 w-100 p-4" style="background: linear-gradient(to top, rgba(20, 126, 121, 0.95) 0%, rgba(20, 126, 121, 0.4) 60%, transparent 100%);">
                <h3 class="h4 text-white fw-bold mb-1 font-sans">{{ founder.name }}</h3>
                <span class="badge rounded-pill fw-bold text-uppercase" style="background-color: #E7DCC3; color: #147E79; font-size: 0.78rem; letter-spacing: 0.08em;">
                  {{ founder.role }}
                </span>
              </div>
            </div>
            
            <div class="p-4 flex-grow-1 d-flex flex-column justify-content-between">
              <p class="small mb-0 fw-medium" style="color: #4C4C4C; line-height: 1.7; font-size: 0.95rem;">
                {{ founder.bio }}
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>

<style scoped>
.founder-card {
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s ease;
  border: 1px solid rgba(231, 220, 195, 0.6) !important;
}

.founder-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 36px rgba(20, 126, 121, 0.15) !important;
}

.hover-scale {
  transition: transform 0.5s ease;
}

.founder-card:hover .hover-scale {
  transform: scale(1.04);
}
</style>
