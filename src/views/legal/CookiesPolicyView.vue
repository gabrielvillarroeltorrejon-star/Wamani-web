<script setup lang="ts">
import { useContentStore } from '@/shared/stores/contentStore';

const contentStore = useContentStore();
</script>

<template>
  <div class="legal-page min-vh-100 font-sans" style="background-color: #83AAA8; padding-top: 120px; padding-bottom: 80px;">
    <div class="container py-4">
      
      <!-- Encabezado Editorial -->
      <div class="text-center text-white mb-5">
        <h1 class="display-4 fw-bold font-brush text-white mb-2" style="font-family: 'Caveat', cursive !important;">
          Política de Cookies
        </h1>
        <p class="lead opacity-90 mx-auto" style="font-size: 1.05rem;">
          Wamani Turismo y Expediciones SpA
        </p>
      </div>

      <!-- Contenedor Principal -->
      <div class="row justify-content-center">
        <div class="col-12 col-lg-10">
          <div class="legal-card p-4 p-md-5 rounded-4 shadow-lg text-white" style="background: linear-gradient(145deg, #045D56 0%, #033E3B 100%); border: 1px solid rgba(45, 212, 191, 0.45); line-height: 1.8;">

            <div class="legal-content">
              <section class="mb-5">
                <h3 class="h4 fw-bold text-accent mb-3">1. ¿Qué son las cookies?</h3>
                <p>
                  Las cookies son pequeños archivos de texto que los sitios web almacenan en su ordenador o dispositivo móvil cuando usted los visita. Permiten que el sitio web recuerde sus acciones y preferencias (como inicio de sesión, idioma, tamaño de fuente y otras preferencias de visualización) durante un período de tiempo.
                </p>
              </section>

              <section class="mb-5">
                <h3 class="h4 fw-bold text-accent mb-3">2. ¿Cómo utilizamos las cookies?</h3>
                <p>
                  En <strong>{{ contentStore.content.legal.businessName }}</strong> utilizamos cookies estrictamente necesarias para el correcto funcionamiento de nuestra plataforma, particularmente para:
                </p>
                <ul>
                  <li>Permitir la gestión del carrito de reservas y el proceso de checkout seguro.</li>
                  <li>Recordar su preferencia sobre la aceptación de esta misma política (para no mostrarle el banner repetidamente).</li>
                  <li>Prevenir actividades fraudulentas y asegurar la navegación.</li>
                </ul>
                <p>Actualmente <strong>no</strong> utilizamos cookies de seguimiento de terceros, cookies publicitarias, ni compartimos información de navegación con redes de anuncios externas.</p>
              </section>

              <section class="mb-5">
                <h3 class="h4 fw-bold text-accent mb-3">3. Gestión y Consentimiento</h3>
                <p>
                  Al ingresar a nuestro sitio web, usted puede elegir aceptar todas las cookies o solo las esenciales a través de nuestro Banner de Privacidad. Además, usted puede controlar y/o eliminar las cookies mediante la configuración de su propio navegador web en cualquier momento.
                </p>
                <p>
                  Tenga en cuenta que restringir las cookies estrictamente necesarias podría imposibilitar la completitud de su reserva en línea.
                </p>
              </section>

              <section class="mb-0">
                <h3 class="h4 fw-bold text-accent mb-3">4. Contacto</h3>
                <p class="mb-0">
                  Para dudas relacionadas a la privacidad y el uso de tecnologías de almacenamiento en su navegador, por favor contáctenos a: <a :href="`mailto:${contentStore.content.legal.supportEmail}`" class="text-accent">{{ contentStore.content.legal.supportEmail }}</a>.
                </p>
              </section>

            </div>

          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.legal-page {
  color: #FFFFFF;
}
.text-accent {
  color: #2DD4BF !important;
}
.legal-content h3 {
  border-bottom: 1px solid rgba(45, 212, 191, 0.25);
  padding-bottom: 8px;
  font-family: 'Montserrat', sans-serif;
  letter-spacing: 0.05em;
}
.legal-content p, .legal-content li {
  color: rgba(255, 255, 255, 0.92);
}
</style>
