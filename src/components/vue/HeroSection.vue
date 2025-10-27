<template>
  <section class="bg-gradient-to-br from-primary-900 to-primary-700 text-white min-h-screen flex items-center">
    <div class="container mx-auto px-6 py-20">
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
</script>