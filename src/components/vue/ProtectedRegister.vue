<template>
  <div v-if="isAuthenticated" class="w-full">
    <slot></slot>
  </div>
  <div v-else class="h-screen bg-gradient-to-br from-red-900 via-red-800 to-orange-900 flex items-center justify-center px-4">
    <div class="relative z-10 w-full max-w-md">
      <div class="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6">
        <div class="text-center mb-4">
          <div class="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-3">
            <i class="fas fa-lock text-2xl text-red-600"></i>
          </div>
          <h2 class="text-xl font-bold text-gray-800 mb-1">Acceso Restringido</h2>
          <p class="text-gray-600 text-sm">El registro de empleados solo está disponible para usuarios autenticados</p>
        </div>

        <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p class="text-sm text-gray-700">
            <i class="fas fa-exclamation-triangle text-red-600 mr-2"></i>
            Por razones de seguridad, solo los administradores del sistema pueden crear nuevas cuentas de empleados.
          </p>
        </div>

        <button 
          @click="goToLogin"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300"
        >
          <i class="fas fa-sign-in-alt mr-2"></i>
          Volver a Iniciar Sesión
        </button>

        <button 
          @click="goToHome"
          class="w-full mt-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-all duration-300"
        >
          <i class="fas fa-home mr-2"></i>
          Volver al Inicio
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const isAuthenticated = ref(false);

const checkAuthentication = () => {
  // Verify if user has a valid token in localStorage
  const token = localStorage.getItem('hotelToken');
  const user = localStorage.getItem('hotelUser');
  
  if (token && user) {
    isAuthenticated.value = true;
  } else {
    // Redirect to login if not authenticated
    window.location.href = '/login';
  }
};

const goToLogin = () => {
  window.location.href = '/login';
};

const goToHome = () => {
  window.location.href = '/';
};

onMounted(() => {
  checkAuthentication();
});
</script>

<style scoped>
/* Custom animations */
.transform {
  transition: transform 0.2s ease-in-out;
}
</style>
