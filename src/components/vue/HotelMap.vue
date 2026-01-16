<template>
  <div class="flex justify-center items-center py-8">
    <div class="w-full max-w-2xl">
      <!-- Title -->
      <h3 class="text-2xl font-bold text-gray-900 mb-4">
        Cómo llegar a nuestro hotel
      </h3>
      
      <!-- Map Container -->
      <div 
        @click="openGoogleMaps"
        class="rounded-lg overflow-hidden shadow-md cursor-pointer hover:shadow-lg transition-all hover:scale-105 transform"
        style="height: 200px; position: relative;"
      >
        <iframe
          class="w-full h-full border-0"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.123456!2d-73.5097608!3d7.9998058!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1sSol+Hotel!2s!5e0!3m2!1ses!2sco!4v1640000000000"
          allowfullscreen
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
        ></iframe>
        <!-- Click overlay for better UX -->
        <div class="absolute inset-0 bg-transparent hover:bg-black hover:bg-opacity-5 transition-colors pointer-events-none rounded-lg"></div>
      </div>
      
      <!-- Description -->
      <p class="text-gray-600 mt-4">
        Encuentra nuestra ubicación en el mapa. Haz click para obtener direcciones, rutas y más detalles en Google Maps.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
// Hotel information
const hotelAddress = 'Sol Hotel';

// Open Google Maps in new tab
const openGoogleMaps = () => {
  const encodedAddress = encodeURIComponent(hotelAddress);
  const googleMapsUrl = `https://www.google.com/maps/search/${encodedAddress}`;
  window.open(googleMapsUrl, '_blank', 'noopener,noreferrer');
};
</script>

<style scoped>
/* Map container styles */
:deep(iframe) {
  border: none;
  border-radius: 0.5rem;
}

/* Smooth transitions */
button {
  transition: all 0.3s ease;
}

button:active {
  transform: scale(0.98);
}

/* Map hover effect */
div {
  transition: all 0.3s ease;
}
</style>
