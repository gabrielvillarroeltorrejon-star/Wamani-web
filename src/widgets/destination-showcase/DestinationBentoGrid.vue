<script setup lang="ts">
// Sección inspirada en "Reportajes fotográficos" (Photo Reports) de la imagen.
// Uso de asimetría y diseño minimalista.
</script>

<template>
  <section class="container py-5 my-5">
    <!-- Header de la sección -->
    <div class="text-center mb-5 pb-4">
      <p class="font-sans text-uppercase small text-accent mb-2" style="letter-spacing: 0.15em;">Inspírate con las vistas</p>
      <h2 class="font-serif h1 mb-4">Reportajes Fotográficos</h2>
      <p class="font-sans text-uppercase small opacity-50 mx-auto" style="max-width: 600px; line-height: 1.8;">
        Embárcate en las rutas más fascinantes con nuestras galerías exclusivas.
      </p>
      <div class="divider-line mx-auto" style="max-width: 200px;"></div>
    </div>

    <!-- Grilla Asimétrica Editorial -->
    <div class="row g-4 align-items-center">
      
      <!-- Bloque de texto izquierdo -->
      <div class="col-md-4">
        <div class="pe-md-4">
          <h3 class="font-serif h4 mb-3">La majestuosidad del sur del mundo.</h3>
          <p class="font-sans small opacity-75 mb-4 lh-lg text-accent">Una ruta mágica por los glaciares y estepas más hermosas.</p>
          <img src="https://images.unsplash.com/photo-1576082761138-0cc8404a3487?auto=format&fit=crop&w=600&q=80" alt="Paisaje" class="w-100 object-fit-cover shadow-sm grayscale-hover" style="height: 250px;">
        </div>
      </div>

      <!-- Imagen Central Grande -->
      <div class="col-md-4">
        <img src="https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=800&q=80" alt="Cascada" class="w-100 object-fit-cover shadow-sm grayscale-hover" style="height: 500px;">
      </div>

      <!-- Imagen Derecha y Texto -->
      <div class="col-md-4 position-relative">
        <img src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=600&q=80" alt="Montaña" class="w-100 object-fit-cover shadow-sm grayscale-hover" style="height: 400px;">
        
        <div class="position-absolute bottom-0 start-0 w-100 p-4 text-white" style="background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);">
          <h4 class="font-serif h3 mb-2">Cerro Castillo</h4>
          <p class="font-sans small opacity-75 mb-0">Una expedición inolvidable por la Patagonia Aysén.</p>
        </div>
      </div>

    </div>
  </section>
</template>

<style scoped>
.grayscale-hover {
  filter: grayscale(20%);
  transition: filter 0.5s ease, transform 0.5s ease;
}
.grayscale-hover:hover {
  filter: grayscale(0%);
  transform: scale(1.02);
}
</style>
