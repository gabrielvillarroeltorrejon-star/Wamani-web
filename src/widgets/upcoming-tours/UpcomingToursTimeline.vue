<script setup lang="ts">
const tours = [
  { day: '07', month: 'OCTUBRE', title: 'BASE LAS TORRES', subtitle: 'Patagonia' },
  { day: '16', month: 'OCTUBRE', title: 'VALLE DE LA LUNA', subtitle: 'Atacama' },
  { day: '25', month: 'OCTUBRE', title: 'GLACIAR GREY', subtitle: 'Patagonia' },
  { day: '04', month: 'NOVIEMBRE', title: 'GÉISERES DEL TATIO', subtitle: 'Atacama' },
  { day: '09', month: 'NOVIEMBRE', title: 'CASCADAS SALTO GRANDE', subtitle: 'Patagonia' }
];
</script>

<template>
  <section class="timeline-section position-relative d-flex flex-column align-items-center">
    <div class="overlay position-absolute top-0 start-0 w-100 h-100"></div>
    
    <div class="container position-relative z-1 py-5 my-5">
      <div class="text-center text-white mb-5">
        <p class="font-sans text-uppercase small text-accent mb-2" style="letter-spacing: 0.2em;">Destino destacado</p>
        <h2 class="font-serif display-2 mb-4" style="letter-spacing: 0.1em;">PATAGONIA</h2>
        <p class="font-sans text-uppercase mx-auto small" style="max-width: 600px; line-height: 2; opacity: 0.7; letter-spacing: 0.1em;">
          Experimenta la inmensidad de los glaciares, lagos color turquesa y las montañas más desafiantes del fin del mundo.
        </p>
        <div class="mt-4">
          <a href="#" class="btn btn-outline-light rounded-0 px-4 py-3 font-sans text-uppercase small" style="letter-spacing: 0.1em;">Descubrir más</a>
        </div>
      </div>

      <div class="row mt-5 pt-5 text-white justify-content-center">
        <div class="col-md-2 d-none d-md-flex align-items-center justify-content-end position-relative">
           <p class="vertical-text text-white opacity-50 m-0 position-absolute end-0 top-50 translate-middle-y me-4">Próximas Salidas</p>
        </div>
        <div class="col-md-6 col-lg-5">
          <ul class="list-unstyled mb-5">
            <li v-for="(tour, index) in tours" :key="index" class="d-flex align-items-center mb-4 pb-2 tour-item">
              <span class="font-serif display-3 fw-bold me-4 lh-1">{{ tour.day }}</span>
              <div>
                <span class="font-sans small text-uppercase text-accent d-block mb-1" style="letter-spacing: 0.1em;">{{ tour.month }}</span>
                <h3 class="font-serif h5 mb-0 text-uppercase">{{ tour.title }}</h3>
                <span class="font-sans small text-uppercase opacity-50">{{ tour.subtitle }}</span>
              </div>
            </li>
          </ul>
          <div class="text-start border-top border-light border-opacity-25 pt-4 mt-5">
            <a href="#" class="text-accent text-uppercase font-sans text-decoration-none small fw-bold d-inline-block mb-2" style="letter-spacing: 0.1em;">Ver todas las fechas</a>
            <p class="font-sans small opacity-50">Suscríbete a nuestra lista de correo para recibir nuevas rutas.</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.timeline-section {
  background: url('https://images.unsplash.com/photo-1598462059374-142bf48edcc9?auto=format&fit=crop&w=1920&q=80') center/cover no-repeat;
  margin-top: -50px; /* Overlap with previous section */
  min-height: 1000px;
}

.overlay {
  background: linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0.9) 100%);
}

.tour-item {
  transition: transform 0.3s;
  cursor: pointer;
}
.tour-item:hover {
  transform: translateX(10px);
}
.tour-item:hover .text-accent {
  color: #fff !important;
}
</style>
