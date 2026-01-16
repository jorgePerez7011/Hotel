<template>
  <div v-if="isChecking" class="h-screen flex items-center justify-center bg-gray-100">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p class="text-gray-700">Verificando acceso...</p>
    </div>
  </div>
  <div v-else-if="isAuthenticated">
    <RegisterForm />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import RegisterForm from './RegisterForm.vue';

const isAuthenticated = ref(false);
const isChecking = ref(true);

onMounted(() => {
  // Verify if user has a valid token in localStorage
  const token = localStorage.getItem('hotelToken');
  const user = localStorage.getItem('hotelUser');
  
  if (token && user) {
    isAuthenticated.value = true;
    isChecking.value = false;
  } else {
    // Redirect to login if not authenticated
    window.location.href = '/login';
  }
});
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
