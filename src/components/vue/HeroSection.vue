<template>
  <section class="relative text-white min-h-screen flex items-center overflow-hidden">
    <!-- Slider de imágenes -->
    <div class="absolute inset-0 w-full h-full">
      <div class="relative w-full h-full">
        <!-- Imágenes del slide -->
        <img 
          v-for="(image, index) in slides" 
          :key="index"
          :src="image"
          :alt="`Slide ${index + 1}`"
          :class="[
            'absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out',
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          ]"
        />
        <!-- Overlay oscuro para mejor legibilidad del texto -->
        <div class="absolute inset-0 bg-black/40"></div>
      </div>
      
      <!-- Controles del slider -->
      <button
        @click="prevSlide"
        class="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/30 hover:bg-white/50 text-white p-3 rounded-full transition-colors duration-300"
      >
        <i class="fas fa-chevron-left"></i>
      </button>
      <button
        @click="nextSlide"
        class="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/30 hover:bg-white/50 text-white p-3 rounded-full transition-colors duration-300"
      >
        <i class="fas fa-chevron-right"></i>
      </button>
      
      <!-- Indicadores de slide -->
      <div class="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        <button
          v-for="(_, index) in slides"
          :key="index"
          @click="currentSlide = index"
          :class="[
            'w-3 h-3 rounded-full transition-all duration-300',
            index === currentSlide ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/75'
          ]"
        ></button>
      </div>
    </div>

    <!-- Contenido -->
    <div class="container mx-auto px-6 py-20 relative z-5">
      <div class="max-w-4xl mx-auto text-center">
        <h1 class="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
          Hotel Management
          <span class="text-primary-300">System</span>
        </h1>
        <p class="text-xl md:text-2xl mb-8 text-primary-100 animate-slide-up">
          Gestiona tu hotel con tecnología moderna: Vue.js, Tailwind CSS, Node.js y bases de datos flexibles
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
          <button 
            @click="navigateToAdmin"
            class="bg-white text-primary-900 px-8 py-4 rounded-lg font-semibold hover:bg-primary-50 transition-colors duration-300 shadow-lg"
          >
            <i class="fas fa-sign-in-alt mr-2"></i>
            Dashboard
          </button>
          <button 
            @click="goToRegister"
            class="bg-green-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-300 shadow-lg"
          >
            <i class="fas fa-user-plus mr-2"></i>
            Registrar Empleado
          </button>
          <button 
            @click="scrollToFeatures"
            class="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-primary-900 transition-colors duration-300"
          >
            Ver Características
          </button>
        </div>
      </div>
      
      <!-- Tech Stack Display -->
      <div class="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
        <div class="text-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
          <h3 class="font-bold text-primary-300">Frontend</h3>
          <p class="text-sm">Vue.js + Astro</p>
          <p class="text-sm">Tailwind CSS</p>
        </div>
        <div class="text-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
          <h3 class="font-bold text-primary-300">Backend</h3>
          <p class="text-sm">Node.js</p>
          <p class="text-sm">Express.js</p>
        </div>
        <div class="text-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
          <h3 class="font-bold text-primary-300">Base de Datos</h3>
          <p class="text-sm">PostgreSQL</p>
          <p class="text-sm">MongoDB</p>
        </div>
        <div class="text-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
          <h3 class="font-bold text-primary-300">Características</h3>
          <p class="text-sm">API REST</p>
          <p class="text-sm">Autenticación</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

// Imágenes del carrusel
const slides = ref([
  '/Fotos/SlidePrincipal/DSC09271.jpg',
  '/Fotos/SlidePrincipal/DSC09362.jpg',
  '/Fotos/SlidePrincipal/DSC09409.jpg'
]);

const currentSlide = ref(0);
let autoplayInterval: NodeJS.Timeout | null = null;

const navigateToAdmin = () => {
  // Verificar si el usuario ya está autenticado
  const token = localStorage.getItem('hotelToken');
  const user = localStorage.getItem('hotelUser');
  
  if (token && user) {
    // Si ya está autenticado, ir directamente al dashboard
    window.location.href = '/admin/dashboard';
  } else {
    // Si no está autenticado, ir al login
    window.location.href = '/login';
  }
};

const goToRegister = () => {
  window.location.href = '/register';
};

const scrollToFeatures = () => {
  const featuresSection = document.querySelector('#features');
  if (featuresSection) {
    featuresSection.scrollIntoView({ behavior: 'smooth' });
  }
};

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % slides.value.length;
  resetAutoplay();
};

const prevSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + slides.value.length) % slides.value.length;
  resetAutoplay();
};

const resetAutoplay = () => {
  if (autoplayInterval) {
    clearInterval(autoplayInterval);
  }
  startAutoplay();
};

const startAutoplay = () => {
  autoplayInterval = setInterval(() => {
    currentSlide.value = (currentSlide.value + 1) % slides.value.length;
  }, 5000); // Cambiar imagen cada 5 segundos
};

onMounted(() => {
  startAutoplay();
});

onUnmounted(() => {
  if (autoplayInterval) {
    clearInterval(autoplayInterval);
  }
});
</script>
