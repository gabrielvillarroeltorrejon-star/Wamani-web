<script setup lang="ts">
import { useContentStore } from '@/shared/stores/contentStore';

const contentStore = useContentStore();
</script>

<template>
  <div class="legal-page min-vh-100 font-sans" style="background-color: #83AAA8; padding-top: 120px; padding-bottom: 80px;">
    <div class="container py-4">
      
      <!-- Encabezado Editorial -->
      <div class="text-center text-white mb-5">
        <span class="badge px-3 py-2 rounded-pill font-sans text-uppercase tracking-wide mb-3" style="background-color: #045D56; color: #2DD4BF; font-size: 0.8rem; letter-spacing: 0.15em;">
          Protección de la Vida Privada & Ley 19.628
        </span>
        <h1 class="display-4 fw-bold font-brush text-white mb-2" style="font-family: 'Caveat', cursive !important;">
          Política de Privacidad y Tratamiento de Datos Personales
        </h1>
        <p class="lead opacity-90 max-w-700 mx-auto" style="font-size: 1.05rem;">
          Wamani Turismo y Expediciones SpA • Seguridad y Confidencialidad en el Sur de Chile
        </p>
        <p class="small opacity-75">
          Vigente desde: Octubre 2026 • En conformidad con la legislación de protección de datos de Chile.
        </p>
      </div>

      <!-- Contenedor Principal -->
      <div class="row justify-content-center">
        <div class="col-12 col-lg-10">
          <div class="legal-card p-4 p-md-5 rounded-4 shadow-lg text-white" style="background: linear-gradient(145deg, #045D56 0%, #033E3B 100%); border: 1px solid rgba(45, 212, 191, 0.45); line-height: 1.8;">

            <!-- Resumen de Principios Clave -->
            <div class="row g-3 mb-5">
              <div class="col-md-4">
                <div class="p-3 rounded-3 text-center h-100" style="background-color: #022C2A; border: 1px solid rgba(45, 212, 191, 0.3);">
                  <i class="bi bi-shield-check text-accent fs-2 mb-2 d-block"></i>
                  <strong class="d-block mb-1 text-white">Transparencia Total</strong>
                  <span class="small opacity-85">Tus datos solo se usan para tu viaje, tus seguros y tu seguridad en montaña.</span>
                </div>
              </div>
              <div class="col-md-4">
                <div class="p-3 rounded-3 text-center h-100" style="background-color: #022C2A; border: 1px solid rgba(45, 212, 191, 0.3);">
                  <i class="bi bi-credit-card-2-back text-accent fs-2 mb-2 d-block"></i>
                  <strong class="d-block mb-1 text-white">Pagos Tokenizados</strong>
                  <span class="small opacity-85">Nunca almacenamos números de tarjeta ni claves. Transbank procesa el 100%.</span>
                </div>
              </div>
              <div class="col-md-4">
                <div class="p-3 rounded-3 text-center h-100" style="background-color: #022C2A; border: 1px solid rgba(45, 212, 191, 0.3);">
                  <i class="bi bi-person-lock text-accent fs-2 mb-2 d-block"></i>
                  <strong class="d-block mb-1 text-white">Derechos ARCO</strong>
                  <span class="small opacity-85">Puedes solicitar en cualquier momento la consulta o borrado de tu información.</span>
                </div>
              </div>
            </div>

            <!-- Contenido Formal -->
            <div class="legal-content">

              <section class="mb-5">
                <h3 class="h4 fw-bold text-accent mb-3">1. Responsable del Tratamiento de Datos</h3>
                <p>
                  El responsable del tratamiento de sus datos personales es <strong>{{ contentStore.content.legal.businessName }}</strong>, RUT <strong>{{ contentStore.content.legal.rut }}</strong>, con domicilio legal en {{ contentStore.content.legal.addressLegal }}, {{ contentStore.content.legal.city }}, Región de La Araucanía, Chile.
                </p>
                <p>
                  Para cualquier consulta, ejercicio de derechos o requerimiento sobre esta política, nuestro canal formal es el correo electrónico: <a :href="`mailto:${contentStore.content.legal.supportEmail}`" class="text-accent">{{ contentStore.content.legal.supportEmail }}</a>.
                </p>
              </section>

              <section class="mb-5">
                <h3 class="h4 fw-bold text-accent mb-3">2. Datos que Recolectamos</h3>
                <p>
                  Para procesar reservas de excursiones, coordinar guías y asegurar cumplimiento normativo, recopilamos las siguientes categorías de información:
                </p>
                <ul>
                  <li><strong>Datos de Identificación del Titular y Acompañantes:</strong> Nombre completo, número de cédula de identidad (RUT) o número de pasaporte/DNI extranjero, fecha de nacimiento o edad.</li>
                  <li><strong>Datos de Contacto:</strong> Correo electrónico y número de teléfono móvil / WhatsApp para envío de vouchers, confirmaciones logísticas y avisos de contingencia climática.</li>
                  <li><strong>Información de Seguridad y Salud en Montaña:</strong> Antecedentes médicos relevantes que el pasajero declare voluntariamente (alergias graves, patologías cardiorrespiratorias, intolerancias o cirugías recientes), así como nombre y teléfono de un contacto de emergencia. Estos datos son considerados <em>datos sensibles</em> y son tratados con reserva y confidencialidad absoluta únicamente por el equipo guía y de primeros auxilios.</li>
                  <li><strong>Datos Tributarios de Facturación:</strong> Si solicita Factura Electrónica, recolectamos Razón Social, RUT de empresa, Giro comercial y Domicilio tributario para emisión ante el Servicio de Impuestos Internos (SII).</li>
                  <li><strong>Datos de Navegación:</strong> Dirección IP, tipo de navegador e identificadores de sesión anónimos para mitigar ciberataques y garantizar la estabilidad del portal.</li>
                </ul>
              </section>

              <section class="mb-5">
                <h3 class="h4 fw-bold text-accent mb-3">3. Finalidades del Tratamiento</h3>
                <p>
                  Sus datos personales son tratados estrictamente para los siguientes fines legítimos:
                </p>
                <ol>
                  <li><strong>Gestión y Confirmación de la Reserva:</strong> Emisión de órdenes de compra correlativas, vouchers oficiales y asignación de cupos con los guías de montaña.</li>
                  <li><strong>Activación de Pólizas de Seguro:</strong> Enrolamiento en la nómina colectiva de pasajeros del seguro de accidentes personales exigido por el Reglamento de Turismo Aventura de SERNATUR.</li>
                  <li><strong>Seguridad Operativa y Rescate:</strong> Contar con fichas de contacto y salud inmediatas en caso de emergencia médica o evacuación en terreno agreste.</li>
                  <li><strong>Cumplimiento Tributario y Legal:</strong> Emisión de boletas o facturas electrónicas válidas ante el Servicio de Impuestos Internos (SII).</li>
                  <li><strong>Atención al Cliente y Postventa:</strong> Gestión de consultas, solicitudes de reprogramación por causas climáticas y resolución de reclamos.</li>
                </ol>
                <p class="text-accent fw-bold mb-0">
                  WAMANI jamás venderá, arrendará ni comercializará sus datos personales a terceras entidades publicitarias o financieras.
                </p>
              </section>

              <section class="mb-5">
                <h3 class="h4 fw-bold text-accent mb-3">4. Pasarelas de Pago y Seguridad Transaccional</h3>
                <p>
                  Todas las transacciones con tarjetas bancarias (crédito, débito Redcompra y prepago) se efectúan de forma directa y encriptada a través del portal de <strong>Transbank Webpay Plus</strong>.
                </p>
                <p>
                  WAMANI <strong>nunca almacena, procesa ni tiene acceso</strong> a los números completos de sus tarjetas de crédito o débito, fechas de caducidad ni códigos de seguridad CVV/CVC. Los estándares internacionales de seguridad PCI-DSS son gestionados de manera directa por el operador financiero regulado por la Comisión para el Mercado Financiero (CMF).
                </p>
              </section>

              <section class="mb-5">
                <h3 class="h4 fw-bold text-accent mb-3">5. Conservación de los Datos y Medidas de Seguridad</h3>
                <p>
                  Los datos se conservan durante el tiempo estrictamente necesario para cumplir las finalidades del viaje y las obligaciones legales chilenas (retención contable tributaria de 6 años ante el SII).
                </p>
                <p>
                  Implementamos salvaguardas técnicas, administrativas y lógicas que incluyen:
                </p>
                <ul>
                  <li>Comunicaciones encriptadas de extremo a extremo mediante protocolo seguro <strong>HTTPS / TLS de 256 bits</strong>.</li>
                  <li>Protección contra ataques volumétricos, encabezados de seguridad Helmet y limitación de tasa de solicitudes (Rate Limiting) en nuestra API.</li>
                  <li>Bases de datos en la nube con acceso restringido bajo autenticación de múltiples factores y políticas de seguridad a nivel de fila (Row Level Security).</li>
                </ul>
              </section>

              <section class="mb-5">
                <h3 class="h4 fw-bold text-accent mb-3">6. Derechos del Titular (Derechos ARCO)</h3>
                <p>
                  De conformidad con la Ley N° 19.628, todo titular de datos personales tiene derecho a:
                </p>
                <ul>
                  <li><strong>Acceso:</strong> Solicitar información sobre los datos personales que mantenemos sobre su persona.</li>
                  <li><strong>Rectificación:</strong> Solicitar la corrección de datos inexactos, erróneos o desactualizados.</li>
                  <li><strong>Cancelación / Eliminación:</strong> Solicitar la eliminación de sus datos cuando ya no sean requeridos para los fines contratados, sin perjuicio de los plazos legales de retención tributaria.</li>
                  <li><strong>Oposición / Bloqueo:</strong> Oponerse al tratamiento de sus datos para fines específicos no esenciales para la ejecución del servicio contratado.</li>
                </ul>
                <p>
                  Para ejercer estos derechos, envíe una solicitud escrita a <a :href="`mailto:${contentStore.content.legal.supportEmail}`" class="text-accent">{{ contentStore.content.legal.supportEmail }}</a> acompañando copia simple de su cédula o pasaporte para acreditar su identidad. Su solicitud será tramitada en un plazo máximo de <strong>10 días hábiles</strong>.
                </p>
              </section>

              <section class="mb-0">
                <h3 class="h4 fw-bold text-accent mb-3">7. Uso de Cookies y Tecnologías Similares</h3>
                <p class="mb-0">
                  Este sitio web utiliza cookies técnicas indispensables para el funcionamiento del carrito de reservas, almacenamiento temporal de preferencias de idioma y detección de anomalías de seguridad. Los usuarios pueden configurar su navegador web para rechazar cookies, si bien ciertas funciones transaccionales podrían verse limitadas.
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
.tracking-wide {
  letter-spacing: 0.12em;
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
