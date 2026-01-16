<template>
  <div class="h-screen bg-gradient-to-br from-green-900 via-green-800 to-blue-900 flex items-center justify-center px-4 overflow-hidden">
    <!-- Background Pattern -->
    <div class="absolute inset-0 opacity-10">
      <div class="absolute inset-0 bg-repeat" style="background-image: url('data:image/svg+xml;utf8,<svg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;><g fill=&quot;none&quot; fill-rule=&quot;evenodd&quot;><g fill=&quot;%23ffffff&quot; fill-opacity=&quot;0.1&quot;><circle cx=&quot;30&quot; cy=&quot;30&quot; r=&quot;2&quot;/></g></g></svg>');"></div>
    </div>

    <!-- Register Card -->
    <div class="relative z-10 w-full max-w-lg max-h-screen overflow-y-auto py-4">
      <!-- Hotel Logo/Header -->
      <div class="text-center mb-6">
        <div class="mx-auto w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-3 backdrop-blur-sm">
          <i class="fas fa-user-plus text-2xl text-white"></i>
        </div>
        <h1 class="text-2xl font-bold text-white mb-1">Hotel Sol</h1>
        <p class="text-green-200 text-sm">Registro de Nuevo Empleado</p>
      </div>

      <!-- Register Form -->
      <div class="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6">
        <div class="text-center mb-4">
          <h2 class="text-xl font-bold text-gray-800 mb-1">Crear Cuenta</h2>
          <p class="text-gray-600 text-sm">Completa todos los campos para registrar un nuevo empleado</p>
        </div>

        <form @submit.prevent="handleRegister" class="space-y-4">
          <!-- Name Field -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <i class="fas fa-user mr-2 text-gray-500"></i>
              Nombre Completo
            </label>
            <input 
              v-model="registerForm.name"
              type="text" 
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors bg-white"
              placeholder="Juan Pérez"
              :disabled="isSubmitting"
            />
          </div>

          <!-- Email Field -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <i class="fas fa-envelope mr-2 text-gray-500"></i>
              Email Corporativo
            </label>
            <input 
              v-model="registerForm.email"
              type="email" 
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors bg-white"
              placeholder="juan.perez@ejemplo.com"
              :disabled="isSubmitting"
            />
          </div>

          <!-- Phone Field -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <i class="fas fa-phone mr-2 text-gray-500"></i>
              Teléfono
            </label>
            <input 
              v-model="registerForm.phone"
              type="tel" 
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors bg-white"
              placeholder="+1-555-0123"
              :disabled="isSubmitting"
            />
          </div>

          <!-- Position Field -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <i class="fas fa-briefcase mr-2 text-gray-500"></i>
              Posición
            </label>
            <select 
              v-model="registerForm.position"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors bg-white"
              :disabled="isSubmitting"
            >
              <option value="">Selecciona una posición</option>
              <option value="recepcionista">Recepcionista</option>
              <option value="aseadora">Aseadora</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <!-- Salary Field -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <i class="fas fa-dollar-sign mr-2 text-gray-500"></i>
              Salario Mensual
            </label>
            <input 
              v-model.number="registerForm.salary"
              type="number" 
              step="0.01"
              min="0"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors bg-white"
              placeholder="1200.00"
              :disabled="isSubmitting"
            />
          </div>

          <!-- Hire Date Field -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <i class="fas fa-calendar mr-2 text-gray-500"></i>
              Fecha de Contratación
            </label>
            <input 
              v-model="registerForm.hireDate"
              type="date" 
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors bg-white"
              :disabled="isSubmitting"
            />
          </div>

          <!-- Shift Field -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <i class="fas fa-clock mr-2 text-gray-500"></i>
              Turno de Trabajo
            </label>
            <select 
              v-model="registerForm.shift"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors bg-white"
              :disabled="isSubmitting"
            >
              <option value="">Selecciona un turno</option>
              <option value="mañana">Mañana (6:00 AM - 2:00 PM)</option>
              <option value="tarde">Tarde (2:00 PM - 10:00 PM)</option>
              <option value="noche">Noche (10:00 PM - 6:00 AM)</option>
              <option value="completo">Tiempo completo</option>
            </select>
          </div>

          <!-- Password Fields -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                <i class="fas fa-lock mr-2 text-gray-500"></i>
                Contraseña
              </label>
              <div class="relative">
                <input 
                  v-model="registerForm.password"
                  :type="showPassword ? 'text' : 'password'" 
                  required
                  minlength="6"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors bg-white pr-12"
                  placeholder="Mínimo 6 caracteres"
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

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                <i class="fas fa-lock mr-2 text-gray-500"></i>
                Confirmar Contraseña
              </label>
              <input 
                v-model="registerForm.confirmPassword"
                :type="showPassword ? 'text' : 'password'" 
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors bg-white"
                placeholder="Repite la contraseña"
                :disabled="isSubmitting"
              />
            </div>
          </div>

          <!-- Emergency Contact -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <i class="fas fa-user-friends mr-2 text-gray-500"></i>
              Contacto de Emergencia
            </label>
            <input 
              v-model="registerForm.emergencyContact"
              type="text" 
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors bg-white"
              placeholder="María Pérez +1-555-0124"
              :disabled="isSubmitting"
            />
          </div>

          <!-- Address -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <i class="fas fa-map-marker-alt mr-2 text-gray-500"></i>
              Dirección
            </label>
            <textarea 
              v-model="registerForm.address"
              rows="2"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors bg-white resize-none"
              placeholder="Calle Principal 123, Ciudad, Estado"
              :disabled="isSubmitting"
            ></textarea>
          </div>

          <!-- Submit Button -->
          <button 
            type="submit"
            :disabled="isSubmitting"
            class="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100"
          >
            <span v-if="!isSubmitting">
              <i class="fas fa-user-plus mr-2"></i>
              Registrar Empleado
            </span>
            <span v-else>
              <i class="fas fa-spinner fa-spin mr-2"></i>
              Creando cuenta...
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
            ¿Ya tienes una cuenta? 
            <button 
              @click="goToLogin"
              class="text-green-600 hover:text-green-800 font-medium"
            >
              Iniciar Sesión
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
      <div class="mt-4 text-center text-green-200 text-xs">
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
const registerForm = reactive({
  name: '',
  email: '',
  phone: '',
  position: '',
  salary: null as number | null,
  hireDate: '',
  shift: '',
  password: '',
  confirmPassword: '',
  emergencyContact: '',
  address: ''
});

// Computed properties
const messageClass = computed(() => {
  return messageType.value === 'success' 
    ? 'bg-green-100 text-green-800 border border-green-300'
    : 'bg-red-100 text-red-800 border border-red-300';
});

// Methods
const handleRegister = async () => {
  isSubmitting.value = true;
  message.value = '';

  try {
    // Client-side validation
    if (!registerForm.name || !registerForm.email || !registerForm.password) {
      throw new Error('Por favor, completa todos los campos obligatorios');
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      throw new Error('Las contraseñas no coinciden');
    }

    if (registerForm.password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }

    // Prepare data for API
    const employeeData = {
      name: registerForm.name,
      email: registerForm.email,
      password: registerForm.password,
      phone: registerForm.phone,
      position: registerForm.position,
      salary: registerForm.salary,
      hire_date: registerForm.hireDate,
      shift: registerForm.shift,
      emergency_contact: registerForm.emergencyContact,
      address: registerForm.address
    };

    // Call API
    const token = localStorage.getItem('hotelToken');
    const response = await fetch('/api/employees', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: JSON.stringify(employeeData)
    });

    if (response.ok) {
      const data = await response.json();
      
      messageType.value = 'success';
      message.value = `¡Empleado ${registerForm.name} registrado exitosamente!`;
      
      // Clear form
      Object.keys(registerForm).forEach(key => {
        if (key === 'salary') {
          registerForm[key] = null;
        } else {
          registerForm[key] = '';
        }
      });
      
      // Redirect to login after short delay
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      
    } else {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al registrar empleado');
    }

  } catch (error) {
    messageType.value = 'error';
    message.value = error instanceof Error ? error.message : 'Error desconocido';
  } finally {
    isSubmitting.value = false;
  }
};

const goToLogin = () => {
  window.location.href = '/login';
};

const goToHome = () => {
  window.location.href = '/';
};

// Set default hire date to today
const setDefaultDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  registerForm.hireDate = `${year}-${month}-${day}`;
};

// Initialize default date
setDefaultDate();
</script>

<style scoped>
/* Custom animations */
.transform {
  transition: transform 0.2s ease-in-out;
}

/* Focus styles for better accessibility */
input:focus, select:focus, textarea:focus, button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
}

/* Loading animation */
@keyframes spin {
  to { transform: rotate(360deg); }
}

.fa-spin {
  animation: spin 1s linear infinite;
}

/* Responsive grid adjustments */
@media (max-width: 768px) {
  .grid-cols-1.md\\:grid-cols-2 {
    grid-template-columns: 1fr;
  }
}
</style>
