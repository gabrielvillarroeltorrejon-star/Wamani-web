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
          Marco Regulatorio & E-Commerce Chile
        </span>
        <h1 class="display-4 fw-bold font-brush text-white mb-2" style="font-family: 'Caveat', cursive !important;">
          Términos y Condiciones Generales de Contratación
        </h1>
        <p class="lead opacity-90 max-w-700 mx-auto" style="font-size: 1.05rem;">
          Wamani Turismo y Expediciones SpA • Registro Nacional SERNATUR N° {{ contentStore.content.legal.sernaturRegistry }}
        </p>
        <p class="small opacity-75">
          Última actualización conforme al Reglamento de Comercio Electrónico (Decreto 6/2021) y Ley N° 19.496: Octubre 2026.
        </p>
      </div>

      <!-- Tarjeta Contenedora Principal -->
      <div class="row justify-content-center">
        <div class="col-12 col-lg-10">
          <div class="legal-card p-4 p-md-5 rounded-4 shadow-lg text-white" style="background: linear-gradient(145deg, #045D56 0%, #033E3B 100%); border: 1px solid rgba(45, 212, 191, 0.45); line-height: 1.8;">

            <!-- Ficha de Identificación del Proveedor (Decreto 6/2021 Art. 2) -->
            <div class="provider-box p-4 rounded-4 mb-5" style="background-color: #022C2A; border: 1px solid rgba(45, 212, 191, 0.35);">
              <h2 class="h5 fw-bold text-accent mb-3 d-flex align-items-center gap-2">
                <i class="bi bi-building-check fs-4"></i> 1. Identificación del Proveedor y Prestador Oficial
              </h2>
              <div class="row g-3 small">
                <div class="col-md-6">
                  <p class="mb-1"><strong class="text-white">Razón Social:</strong> {{ contentStore.content.legal.businessName }}</p>
                  <p class="mb-1"><strong class="text-white">RUT Empresa:</strong> {{ contentStore.content.legal.rut }}</p>
                  <p class="mb-1"><strong class="text-white">Registro Nacional SERNATUR:</strong> N° {{ contentStore.content.legal.sernaturRegistry }} (Agencia & Turismo Aventura)</p>
                  <p class="mb-0"><strong class="text-white">Representante Legal:</strong> {{ contentStore.content.legal.legalRepresentative }}</p>
                </div>
                <div class="col-md-6">
                  <p class="mb-1"><strong class="text-white">Domicilio Legal:</strong> {{ contentStore.content.legal.addressLegal }}, {{ contentStore.content.legal.city }}, {{ contentStore.content.legal.region }}</p>
                  <p class="mb-1"><strong class="text-white">Correo Oficial de Contacto:</strong> <a :href="`mailto:${contentStore.content.legal.supportEmail}`" class="text-accent">{{ contentStore.content.legal.supportEmail }}</a></p>
                  <p class="mb-1"><strong class="text-white">Línea de Asistencia / Emergencias:</strong> {{ contentStore.content.legal.emergencyPhone }}</p>
                  <p class="mb-0"><strong class="text-white">Sitio Web Oficial:</strong> https://wamani.cl</p>
                </div>
              </div>
            </div>

            <!-- Cláusulas Contractuales -->
            <div class="legal-content">
              
              <section class="mb-5">
                <h3 class="h4 fw-bold text-accent mb-3">2. Ámbito de Aplicación y Marco Normativo</h3>
                <p>
                  El presente contrato regula los términos y condiciones bajo los cuales los usuarios adquieren experiencias, excursiones, programas guiados y servicios de transporte turístico prestados o coordinados por <strong>{{ contentStore.content.legal.businessName }}</strong> (en adelante, <em>"WAMANI"</em>), a través de este portal web de comercio electrónico.
                </p>
                <p>
                  Las transacciones están sujetas a la legislación vigente en la República de Chile, en particular a la <strong>Ley N° 19.496 sobre Protección de los Derechos de los Consumidores</strong>, el <strong>Decreto N° 6 de 2021 del Ministerio de Economía (Reglamento de Comercio Electrónico)</strong>, la <strong>Ley N° 20.423 del Sistema Institucional para el Desarrollo del Turismo</strong>, el Decreto N° 222 (Reglamento de Turismo Aventura de SERNATUR) y la <strong>Ley N° 19.628 sobre Protección de la Vida Privada</strong>.
                </p>
              </section>

              <section class="mb-5">
                <h3 class="h4 fw-bold text-accent mb-3">3. Proceso de Contratación Electrónica y Confirmación</h3>
                <p>
                  Para adquirir una experiencia en WAMANI, el cliente seleccionará el servicio deseado, la fecha programada y el número de pasajeros. Posteriormente completará el formulario con sus datos de identificación fidedignos (RUT chileno o Pasaporte internacional), datos de contacto, contacto de emergencia y antecedentes de salud relevantes.
                </p>
                <p>
                  El contrato se perfecciona una vez que:
                </p>
                <ul>
                  <li>El cliente acepta de manera afirmativa e informada estos Términos y Condiciones.</li>
                  <li>Se valida la transacción a través de la pasarela de pago <strong>Transbank Webpay Plus</strong> (autorización bancaria con código oficial) o se valida el pago íntegro por transferencia bancaria.</li>
                  <li>El sistema emite de manera automática el <strong>Comprobante Oficial de Reserva / Voucher Electrónico</strong> con número de orden único correlativo (Buy Order), enviado al correo electrónico registrado por el cliente.</li>
                </ul>
              </section>

              <section class="mb-5">
                <h3 class="h4 fw-bold text-accent mb-3">4. Precios, Moneda, Impuestos y Entradas a Parques</h3>
                <p>
                  Todos los precios publicados en el sitio web se expresan en <strong>Pesos Chilenos (CLP)</strong> e incluyen el <strong>Impuesto al Valor Agregado (IVA del 19%)</strong> conforme a la legislación tributaria chilena, salvo que expresamente se indique lo contrario. Las referencias en dólares estadounidenses (USD) o reales brasileños (BRL) tienen fines informativos de conversión referencial para turistas extranjeros.
                </p>
                <div class="alert alert-dark p-3 rounded-3 border-secondary border-opacity-50 text-white" style="background-color: #022C2A;">
                  <strong class="text-accent"><i class="bi bi-info-circle-fill me-1"></i> Entradas a Parques Nacionales y Reservas del Estado (CONAF):</strong>
                  Salvo mención explícita en el detalle del tour ("Qué incluye"), las tarifas de ingreso a áreas silvestres protegidas (como el Parque Nacional Villarrica o Parque Nacional Huerquehue) no forman parte de la tarifa de guiado y deben ser gestionadas por cada visitante en la plataforma oficial del Estado (<em>pasesparques.cl</em> de CONAF). WAMANI brindará asistencia técnica a los pasajeros para dicha gestión.
                </div>
              </section>

              <section class="mb-5">
                <h3 class="h4 fw-bold text-accent mb-3">5. Derecho a Retracto y Política Especial de Cancelación</h3>
                <p>
                  En conformidad con el <strong>Artículo 3° bis letra b) de la Ley N° 19.496</strong> y la naturaleza de las prestaciones turísticas con reserva de aforos y cupos exclusivos fijados para fechas determinadas, WAMANI estipula expresamente que <strong>no opera el derecho a retracto unilateral genérico de 10 días</strong> una vez confirmada la fecha, aplicándose en su lugar la siguiente <strong>Política de Cancelación y Reembolso Transparente</strong>:
                </p>
                <div class="table-responsive my-3">
                  <table class="table table-dark table-bordered table-striped" style="border-color: rgba(45, 212, 191, 0.35);">
                    <thead style="background-color: #022C2A;">
                      <tr>
                        <th class="text-accent">Anticipación del Aviso de Cancelación</th>
                        <th class="text-accent">Porcentaje de Reembolso</th>
                        <th class="text-accent">Alternativa Sin Costo</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>Más de 48 horas</strong> antes de la salida programada</td>
                        <td><span class="badge bg-success">100% de devolución</span> (menos costos operacionales bancarios si aplican)</td>
                        <td>Reprogramación de fecha gratuita o Voucher abierto por 12 meses.</td>
                      </tr>
                      <tr>
                        <td><strong>Entre 48 y 24 horas</strong> antes de la salida</td>
                        <td><span class="badge bg-warning text-dark">50% de devolución</span></td>
                        <td>Reprogramación sujeta a disponibilidad de guías.</td>
                      </tr>
                      <tr>
                        <td><strong>Menos de 24 horas o No Show (Inasistencia)</strong></td>
                        <td><span class="badge bg-danger">0% de devolución</span></td>
                        <td>No aplica reprogramación por pérdida de cupo logístico.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p class="small opacity-85">
                  <strong>Plazo de Reembolso:</strong> Toda devolución monetaria aprobada será transferida a la cuenta bancaria del titular dentro de un plazo máximo de <strong>5 a 10 días hábiles bancarios</strong> contados desde la aceptación formal de la solicitud vía correo electrónico.
                </p>
              </section>

              <section class="mb-5">
                <h3 class="h4 fw-bold text-accent mb-3">6. Protocolo por Factores Meteorológicos, Alertas Senapred y Fuerza Mayor</h3>
                <p>
                  La seguridad física de nuestros viajeros y guías es la prioridad institucional intransable. En actividades de montaña y ecoturismo, las operaciones quedan supeditadas a condiciones climáticas seguras, alertas tempranas de <strong>SENAPRED</strong>, informes de <strong>SERNAGEOMIN</strong> (actividad volcánica) y determinaciones de <strong>CONAF</strong> o la Autoridad Marítima.
                </p>
                <p>
                  Si una experiencia debe ser suspendida previo al inicio por cierre oficial de rutas o condiciones meteorológicas severas:
                </p>
                <ul>
                  <li><strong>Opción A:</strong> Reprogramación de la actividad en una fecha inmediata consensuada con el cliente.</li>
                  <li><strong>Opción B:</strong> Cambio por una experiencia alternativa de valor equivalente en zonas no afectadas.</li>
                  <li><strong>Opción C:</strong> Emisión de un Voucher de Crédito Flexible válido por 12 meses transferible.</li>
                  <li><strong>Opción D:</strong> Devolución íntegra del 100% de lo pagado, sin multas ni recargos.</li>
                </ul>
              </section>

              <section class="mb-5">
                <h3 class="h4 fw-bold text-accent mb-3">7. Normativa de Turismo Aventura, Salud y Aceptación de Riesgo</h3>
                <p>
                  En conformidad con la Ley N° 20.423 de SERNATUR, el turismo aventura involucra actividad física en ambientes naturales cambiantes. Por tanto:
                </p>
                <ul>
                  <li><strong>Declaración de Salud:</strong> El cliente declara bajo juramento que él y sus acompañantes cuentan con un estado de salud y condición física compatible con la exigencia técnica del tour contratado. Es obligación informar al momento de la reserva cualquier afección cardiovascular, asma, alergias severas o cirugías recientes.</li>
                  <li><strong>Uso de Equipamiento de Protección:</strong> El pasajero se compromete a utilizar la totalidad del equipamiento técnico y de seguridad proporcionado por WAMANI (cascos, arneses, piolets, chalecos salvavidas, etc.) durante toda la actividad.</li>
                  <li><strong>Autoridad del Guía Líder:</strong> Los guías certificados por SERNATUR tienen la autoridad técnica y legal absoluta para modificar itinerarios, denegar el ascenso o cancelar la marcha en terreno si un pasajero no cuenta con la condición requerida o si las condiciones del terreno amenazan la integridad del grupo.</li>
                </ul>
              </section>

              <section class="mb-5">
                <h3 class="h4 fw-bold text-accent mb-3">8. Previsión de Salud y Asistencia</h3>
                <p>
                  Las actividades guiadas de WAMANI se ejecutan bajo estrictos estándares de seguridad y primeros auxilios con guías certificados por SERNATUR y equipamiento técnico homologado. Cada participante es responsable de contar con su propia previsión de salud (Fonasa, Isapre o seguro de asistencia en viaje internacional) vigente durante el desarrollo de la excursión, así como de completar con veracidad la Declaración de Salud y Aceptación de Riesgo al momento de reservar.
                </p>
              </section>

              <section class="mb-5">
                <h3 class="h4 fw-bold text-accent mb-3">9. Facturación y Documentación Tributaria (SII)</h3>
                <p>
                  Por cada compra realizada en la plataforma, WAMANI emitirá la correspondiente <strong>Boleta Electrónica de Ventas y Servicios</strong> ante el Servicio de Impuestos Internos (SII), la cual será remitida al correo electrónico del cliente. En caso de personas jurídicas o empresas que requieran <strong>Factura Electrónica con crédito fiscal</strong>, deberán seleccionar la opción en el formulario de compra e ingresar RUT corporativo, razón social, giro comercial y domicilio tributario válido.
                </p>
              </section>

              <section class="mb-5">
                <h3 class="h4 fw-bold text-accent mb-3">10. Canal de Reclamos, Postventa y Resolución de Conflictos</h3>
                <p>
                  En cumplimiento del Reglamento de Comercio Electrónico, WAMANI mantiene a disposición del consumidor canales expeditos y formales para la recepción de dudas, solicitudes, cambios o reclamos:
                </p>
                <ul>
                  <li><strong>Correo Electrónico de Atención:</strong> <a :href="`mailto:${contentStore.content.legal.supportEmail}`" class="text-accent">{{ contentStore.content.legal.supportEmail }}</a></li>
                  <li><strong>Canal Telefónico y WhatsApp de Guardia:</strong> {{ contentStore.content.legal.emergencyPhone }}</li>
                  <li><strong>Oficina de Atención Presencial:</strong> {{ contentStore.content.legal.addressLegal }}, {{ contentStore.content.legal.city }}, Chile.</li>
                  <li><strong>Plazo de Respuesta Formal:</strong> WAMANI responderá fundadamente todo reclamo o requerimiento en un plazo no superior a <strong>5 días hábiles</strong>.</li>
                </ul>
              </section>

              <section class="mb-0">
                <h3 class="h4 fw-bold text-accent mb-3">11. Legislación Aplicable y Jurisdicción</h3>
                <p class="mb-0">
                  Las relaciones contractuales entre WAMANI y los usuarios se regirán por las leyes de la República de Chile. Para cualquier controversia legal que no pueda ser resuelta de común acuerdo entre las partes, estas se someterán a la competencia de los <strong>Tribunales Ordinarios de Justicia con asiento en la ciudad de Pucón o Temuco</strong>, sin perjuicio de los derechos irrenunciables que asisten al consumidor ante los Juzgados de Policía Local respectivos conforme a la Ley N° 19.496.
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

