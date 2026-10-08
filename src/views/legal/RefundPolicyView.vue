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
          Política de Reembolsos y Retracto
        </h1>
        <p class="lead opacity-90 mx-auto" style="font-size: 1.05rem;">
          Wamani Turismo y Expediciones SpA (Conforme a Ley del Consumidor)
        </p>
      </div>

      <!-- Contenedor Principal -->
      <div class="row justify-content-center">
        <div class="col-12 col-lg-10">
          <div class="legal-card p-4 p-md-5 rounded-4 shadow-lg text-white" style="background: linear-gradient(145deg, #045D56 0%, #033E3B 100%); border: 1px solid rgba(45, 212, 191, 0.45); line-height: 1.8;">

            <div class="legal-content">
              <section class="mb-5">
                <h3 class="h4 fw-bold text-accent mb-3">1. Derecho a Retracto</h3>
                <p>
                  De conformidad con la Ley N° 19.496 sobre Protección de los Derechos de los Consumidores y sus modificaciones, el cliente tiene derecho a retractarse del servicio contratado dentro de los <strong>10 días</strong> siguientes a la confirmación de su reserva, siempre y cuando la fecha del tour contratado no se haya ejecutado. En este caso se devolverá el 100% de lo pagado.
                </p>
              </section>

              <section class="mb-5">
                <h3 class="h4 fw-bold text-accent mb-3">2. Cancelaciones y Reembolsos Posteriores (Tours)</h3>
                <p>
                  Una vez excedido el plazo de retracto inicial, aplicarán las siguientes políticas por cancelación voluntaria:
                </p>
                <ul>
                  <li><strong>Hasta 48 horas antes de la excursión:</strong> Reembolso del 100% o reagendamiento sin costo.</li>
                  <li><strong>Entre 47 y 24 horas antes:</strong> Reembolso del 50%.</li>
                  <li><strong>Menos de 24 horas antes (No Show):</strong> No habrá lugar a reembolso debido a los costos logísticos y de seguros ya comprometidos.</li>
                </ul>
              </section>

              <section class="mb-5">
                <h3 class="h4 fw-bold text-accent mb-3">3. Cancelaciones por Clima o Fuerza Mayor</h3>
                <p>
                  Dado que nuestras experiencias ocurren en entornos de montaña y la seguridad es primordial, si las condiciones climáticas (viento blanco, tormentas, alerta temprana de ONEMI/SENAPRED, cierre de parques) impiden la ejecución de la actividad, <strong>el equipo guía podrá cancelar o modificar el itinerario.</strong>
                </p>
                <p>
                  En estos casos, el cliente podrá optar entre:
                </p>
                <ol>
                  <li>Reagendar el tour sujeto a disponibilidad.</li>
                  <li>El reembolso del 100% de lo pagado.</li>
                </ol>
              </section>

              <section class="mb-0">
                <h3 class="h4 fw-bold text-accent mb-3">4. Proceso de Devolución</h3>
                <p>
                  Las solicitudes de reembolso deben dirigirse por escrito a <a :href="`mailto:${contentStore.content.legal.supportEmail}`" class="text-accent">{{ contentStore.content.legal.supportEmail }}</a> indicando su número de orden (WAM-...). Los reembolsos se procesarán hacia el mismo medio de pago (reversa de tarjeta o transferencia bancaria) en un plazo máximo de <strong>5 a 10 días hábiles</strong>.
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
