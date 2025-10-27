<template>
  <div class="h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 flex items-center justify-center px-4 overflow-hidden">
    <!-- Background Pattern -->
    <div class="absolute inset-0 opacity-10">
      <div class="absolute inset-0 bg-repeat" style="background-image: url('data:image/svg+xml;utf8,<svg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;><g fill=&quot;none&quot; fill-rule=&quot;evenodd&quot;><g fill=&quot;%23ffffff&quot; fill-opacity=&quot;0.1&quot;><circle cx=&quot;30&quot; cy=&quot;30&quot; r=&quot;2&quot;/></g></g></svg>');"></div>
    </div>

    <!-- Login Card -->
    <div class="relative z-10 w-full max-w-md max-h-screen overflow-y-auto py-4">
      <!-- Hotel Logo/Header -->
      <div class="text-center mb-6">
        <div class="mx-auto w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-3 backdrop-blur-sm">
          <i class="fas fa-hotel text-2xl text-white"></i>
        </div>
        <h1 class="text-2xl font-bold text-white mb-1">Hotel Sol</h1>
        <p class="text-blue-200 text-sm">Panel de Administración</p>
      </div>

      <!-- Login Form -->
      <div class="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6">
        <div class="text-center mb-4">
          <h2 class="text-xl font-bold text-gray-800 mb-1">Iniciar Sesión</h2>
          <p class="text-gray-600 text-sm">Acceso exclusivo para personal del hotel</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <!-- Email Field -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <i class="fas fa-user mr-2 text-gray-500"></i>
              Email o Usuario
            </label>
            <input 
              v-model="loginForm.email"
              type="email" 
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white"
              placeholder="tu-email@hotelsol.com"
              :disabled="isSubmitting"
            />
          </div>

          <!-- Password Field -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <i class="fas fa-lock mr-2 text-gray-500"></i>
              Contraseña
            </label>
            <div class="relative">
              <input 
                v-model="loginForm.password"
                :type="showPassword ? 'text' : 'password'" 
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white pr-12"
                placeholder="Tu contraseña"
                :disabled="isSubmitting"
              />
              <button 
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
          </div>

          <!-- Remember Me -->
          <div class="flex items-center justify-between">
            <label class="flex items-center">
              <input 
                v-model="loginForm.rememberMe"
                type="checkbox" 
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span class="ml-2 text-sm text-gray-700">Recordar sesión</span>
            </label>
          </div>

          <!-- Submit Button -->
          <button 
            type="submit"
            :disabled="isSubmitting"
            class="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100"
          >
            <span v-if="!isSubmitting">
              <i class="fas fa-sign-in-alt mr-2"></i>
              Iniciar Sesión
            </span>
            <span v-else>
              <i class="fas fa-spinner fa-spin mr-2"></i>
              Iniciando sesión...
            </span>
          </button>
        </form>

        <!-- Error/Success Messages -->
        <div v-if="message" class="mt-4 p-3 rounded-lg" :class="messageClass">
          <i :class="messageType === 'error' ? 'fas fa-exclamation-circle' : 'fas fa-check-circle'" class="mr-2"></i>
          {{ message }}
        </div>

     

        <!-- Navigation Links -->
        <div class="mt-4 text-center space-y-2">
          <p class="text-sm text-gray-600">
            ¿Necesitas registrar un nuevo empleado? 
            <button 
              @click="goToRegister"
              class="text-blue-600 hover:text-blue-800 font-medium"
            >
              Crear Cuenta
            </button>
          </p>
          <button 
            @click="goToHome"
            class="text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            <i class="fas fa-arrow-left mr-1"></i>
            Volver al inicio
          </button>
        </div>
      </div>

      <!-- Footer Info -->
      <div class="mt-4 text-center text-blue-200 text-xs">
        <p>© 2025 Hotel Sol. Sistema de gestión interno.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';

// Component state
const isSubmitting = ref(false);
const showPassword = ref(false);
const message = ref('');
const messageType = ref<'success' | 'error'>('success');

// Form data
const loginForm = reactive({
  email: '',
  password: '',
  rememberMe: false
});

// Computed properties
const messageClass = computed(() => {
  return messageType.value === 'success' 
    ? 'bg-green-100 text-green-800 border border-green-300'
    : 'bg-red-100 text-red-800 border border-red-300';
});

// Methods
const handleLogin = async () => {
  isSubmitting.value = true;
  message.value = '';

  try {
    // Validate input
    if (!loginForm.email || !loginForm.password) {
      throw new Error('Por favor, completa todos los campos');
    }

    // Call authentication API
    const response = await fetch('http://localhost:4000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: loginForm.email,
        password: loginForm.password
      })
    });

    if (response.ok) {
      const data = await response.json();
      
      // Store authentication data
      localStorage.setItem('hotelToken', data.token);
      localStorage.setItem('hotelUser', JSON.stringify(data.user));
      
      messageType.value = 'success';
      message.value = `¡Bienvenido, ${data.user.name}!`;
      
      // Redirect to dashboard after short delay
      setTimeout(() => {
        window.location.href = '/admin/dashboard';
      }, 1500);
      
    } else {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Credenciales incorrectas');
    }

  } catch (error) {
    messageType.value = 'error';
    
    if (error instanceof Error) {
      message.value = error.message;
    } else {
      // Demo login for testing (when API is not available)
      const demoUsers = [
        { email: 'admin@hotelsol.com', password: 'admin123', name: 'Administrador', role: 'admin' },
        { email: 'maria.gonzalez@hotelsol.com', password: 'maria123', name: 'María González', role: 'recepcionista' },
        { email: 'ana.martinez@hotelsol.com', password: 'ana123', name: 'Ana Martínez', role: 'aseadora' }
      ];

      const user = demoUsers.find(u => 
        u.email === loginForm.email && u.password === loginForm.password
      );

      if (user) {
        // Demo successful login
        localStorage.setItem('hotelToken', 'demo-token-' + Date.now());
        localStorage.setItem('hotelUser', JSON.stringify(user));
        
        messageType.value = 'success';
        message.value = `¡Bienvenido, ${user.name}!`;
        
        setTimeout(() => {
          window.location.href = '/admin/dashboard';
        }, 1500);
      } else {
        message.value = 'Email o contraseña incorrectos';
      }
    }
  } finally {
    isSubmitting.value = false;
  }
};

const goToHome = () => {
  window.location.href = '/';
};

const goToRegister = () => {
  window.location.href = '/register';
};
</script>

<style scoped>
/* Add some custom animations */
.transform {
  transition: transform 0.2s ease-in-out;
}

/* Focus styles for better accessibility */
input:focus, button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Loading animation */
@keyframes spin {
  to { transform: rotate(360deg); }
}

.fa-spin {
  animation: spin 1s linear infinite;
}
</style>