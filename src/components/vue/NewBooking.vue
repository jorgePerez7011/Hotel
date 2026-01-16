<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="container mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <button 
              @click="goBack"
              class="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Volver"
            >
              <i class="fas fa-arrow-left text-xl text-gray-600"></i>
            </button>
            <div class="bg-green-600 text-white p-3 rounded-lg mr-4">
              <i class="fas fa-plus text-xl"></i>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Nueva Reserva</h1>
              <p class="text-gray-600">Crear una nueva reserva de habitación</p>
            </div>
          </div>
          <button
            @click="showAllBookings = true; fetchAllBookings()"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
          >
            <i class="fas fa-list mr-2"></i>
            Ver Todas las Reservas
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <div class="container mx-auto px-6 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Form Section -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-xl shadow-sm border p-8">
            <form @submit.prevent="submitForm">
              <!-- Step Indicator -->
              <div class="mb-8">
                <div class="flex items-center justify-between">
                  <div v-for="(step, index) in steps" :key="step" class="flex items-center">
                    <div :class="[
                      'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all',
                      currentStep === index + 1 
                        ? 'bg-green-600 text-white' 
                        : currentStep > index + 1
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-200 text-gray-700'
                    ]">
                      {{ index + 1 }}
                    </div>
                    <p :class="[
                      'ml-2 text-sm font-medium',
                      currentStep === index + 1
                        ? 'text-green-600'
                        : currentStep > index + 1
                        ? 'text-green-600'
                        : 'text-gray-600'
                    ]">
                      {{ step }}
                    </p>
                    <div v-if="index < steps.length - 1" class="w-8 h-0.5 bg-gray-300 mx-2 md:mx-4"></div>
                  </div>
                </div>
              </div>

              <!-- Step 1: Información de Fechas -->
              <div v-if="currentStep === 1" class="space-y-6">
                <h2 class="text-xl font-bold text-gray-900 mb-6">Información de Fechas</h2>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <!-- Día -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Día de Entrada
                    </label>
                    <input
                      v-model.number="form.day"
                      type="number"
                      min="1"
                      max="31"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="1"
                      required
                    >
                  </div>

                  <!-- Mes -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Mes
                    </label>
                    <select
                      v-model.number="form.month"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    >
                      <option value="">Seleccionar mes</option>
                      <option value="1">Enero</option>
                      <option value="2">Febrero</option>
                      <option value="3">Marzo</option>
                      <option value="4">Abril</option>
                      <option value="5">Mayo</option>
                      <option value="6">Junio</option>
                      <option value="7">Julio</option>
                      <option value="8">Agosto</option>
                      <option value="9">Septiembre</option>
                      <option value="10">Octubre</option>
                      <option value="11">Noviembre</option>
                      <option value="12">Diciembre</option>
                    </select>
                  </div>

                  <!-- Año -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Año
                    </label>
                    <input
                      v-model.number="form.year"
                      type="number"
                      :min="currentYear"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      :placeholder="currentYear"
                      required
                    >
                  </div>
                </div>

                <!-- Fecha de Salida -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Salida
                  </label>
                  <input
                    v-model="form.checkout_date"
                    type="date"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    :min="getMinCheckoutDate()"
                    required
                  >
                  <p class="text-sm text-gray-600 mt-2">
                    Noches: <span class="font-bold text-green-600">{{ calculateNights }}</span>
                  </p>
                </div>
              </div>

              <!-- Step 2: Información del Huésped -->
              <div v-if="currentStep === 2" class="space-y-6">
                <h2 class="text-xl font-bold text-gray-900 mb-6">Información del Huésped</h2>
                
                <!-- Nombre -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo
                  </label>
                  <input
                    v-model="form.guest_name"
                    type="text"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Ej: Juan Pérez"
                    required
                  >
                </div>

                <!-- Email -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Correo Electrónico
                  </label>
                  <input
                    v-model="form.guest_email"
                    type="email"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Ej: juan@email.com"
                    required
                  >
                </div>

                <!-- Teléfono -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono / Celular
                  </label>
                  <input
                    v-model="form.guest_phone"
                    type="tel"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Ej: +57 312 345 6789"
                  >
                </div>

                <!-- CC -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Cédula de Ciudadanía (CC)
                  </label>
                  <input
                    v-model="form.guest_cc"
                    type="text"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Ej: 123456789"
                    required
                  >
                </div>

                <!-- Notas -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Notas Adicionales
                  </label>
                  <textarea
                    v-model="form.notes"
                    rows="4"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Ej: Preferencias especiales, requerimientos especiales, etc."
                  ></textarea>
                </div>
              </div>

              <!-- Step 3: Seleccionar Habitación y Precio -->
              <div v-if="currentStep === 3" class="space-y-6">
                <h2 class="text-xl font-bold text-gray-900 mb-6">Habitación y Precio</h2>
                
                <!-- Habitación -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Seleccionar Habitación
                  </label>
                  <div v-if="loadingRooms" class="text-center py-4">
                    <div class="inline-block animate-spin">
                      <i class="fas fa-spinner text-2xl text-green-600"></i>
                    </div>
                    <p class="text-gray-600 mt-2">Cargando habitaciones disponibles...</p>
                  </div>
                  <div v-else-if="availableRooms.length === 0" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p class="text-yellow-800">No hay habitaciones disponibles para estas fechas</p>
                  </div>
                  <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                      v-for="room in availableRooms"
                      :key="room.id"
                      @click="form.room_id = room.id; form.price_per_night = parseInt(room.price_per_night)"
                      :class="[
                        'p-4 border-2 rounded-lg text-left transition-all',
                        form.room_id === room.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-300 hover:border-gray-400'
                      ]"
                      type="button"
                    >
                      <div class="font-bold text-gray-900">Habitación {{ room.room_number }}</div>
                      <div class="text-sm text-gray-600">Tipo: {{ room.type }}</div>
                      <div class="text-sm text-gray-600">Piso: {{ room.floor }}</div>
                      <div class="text-lg font-bold text-green-600 mt-2">
                        ${{ Number(room.price_per_night).toLocaleString('es-CO') }} / noche
                      </div>
                    </button>
                  </div>
                </div>

                <!-- Precio por noche -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Precio por Noche
                  </label>
                  <input
                    v-model.number="form.price_per_night"
                    type="number"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0"
                    required
                  >
                </div>

                <!-- Total -->
                <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div class="flex items-center justify-between">
                    <span class="text-lg font-medium text-gray-900">Total de la Reserva:</span>
                    <span class="text-2xl font-bold text-green-600">
                      ${{ calculateTotal.toLocaleString('es-CO') }}
                    </span>
                  </div>
                  <p class="text-sm text-gray-600 mt-2">
                    {{ calculateNights }} noches × ${{ form.price_per_night.toLocaleString('es-CO') }}
                  </p>
                </div>
              </div>

              <!-- Step 4: Resumen y Confirmación -->
              <div v-if="currentStep === 4" class="space-y-6">
                <h2 class="text-xl font-bold text-gray-900 mb-6">Resumen de la Reserva</h2>
                
                <div class="bg-gray-50 rounded-lg p-6 space-y-4">
                  <!-- Información de Fechas -->
                  <div class="border-b pb-4">
                    <h3 class="font-bold text-gray-900 mb-2">📅 Información de Fechas</h3>
                    <div class="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p class="text-gray-600">Entrada</p>
                        <p class="font-bold text-gray-900">{{ formatDate(form.check_in_date) }}</p>
                      </div>
                      <div>
                        <p class="text-gray-600">Salida</p>
                        <p class="font-bold text-gray-900">{{ formatDate(form.checkout_date) }}</p>
                      </div>
                      <div>
                        <p class="text-gray-600">Noches</p>
                        <p class="font-bold text-gray-900">{{ calculateNights }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- Información del Huésped -->
                  <div class="border-b pb-4">
                    <h3 class="font-bold text-gray-900 mb-2">👤 Información del Huésped</h3>
                    <div class="space-y-2 text-sm">
                      <p><span class="text-gray-600">Nombre:</span> <span class="font-bold text-gray-900">{{ form.guest_name }}</span></p>
                      <p><span class="text-gray-600">Email:</span> <span class="font-bold text-gray-900">{{ form.guest_email }}</span></p>
                      <p><span class="text-gray-600">Teléfono:</span> <span class="font-bold text-gray-900">{{ form.guest_phone || 'No especificado' }}</span></p>
                      <p><span class="text-gray-600">CC:</span> <span class="font-bold text-gray-900">{{ form.guest_cc }}</span></p>
                    </div>
                  </div>

                  <!-- Información de Habitación -->
                  <div class="border-b pb-4">
                    <h3 class="font-bold text-gray-900 mb-2">🏨 Habitación Seleccionada</h3>
                    <div class="text-sm">
                      <p><span class="text-gray-600">Habitación:</span> <span class="font-bold text-gray-900">{{ getSelectedRoomInfo() }}</span></p>
                      <p><span class="text-gray-600">Precio por noche:</span> <span class="font-bold text-green-600">${{ form.price_per_night.toLocaleString('es-CO') }}</span></p>
                    </div>
                  </div>

                  <!-- Total -->
                  <div class="bg-green-50 rounded-lg p-4">
                    <div class="flex items-center justify-between">
                      <span class="font-bold text-gray-900">Monto Total:</span>
                      <span class="text-2xl font-bold text-green-600">${{ calculateTotal.toLocaleString('es-CO') }}</span>
                    </div>
                  </div>

                  <!-- Notas -->
                  <div v-if="form.notes" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p class="text-sm text-gray-600 mb-1">Notas:</p>
                    <p class="text-sm text-gray-900">{{ form.notes }}</p>
                  </div>
                </div>
              </div>

              <!-- Botones de Navegación -->
              <div class="flex items-center justify-between mt-8 pt-8 border-t">
                <button
                  v-if="currentStep > 1"
                  @click="previousStep"
                  type="button"
                  class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center"
                >
                  <i class="fas fa-arrow-left mr-2"></i>
                  Anterior
                </button>
                <div v-else></div>

                <button
                  v-if="currentStep < steps.length"
                  @click="nextStep"
                  type="button"
                  class="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center"
                >
                  Siguiente
                  <i class="fas fa-arrow-right ml-2"></i>
                </button>

                <button
                  v-else
                  @click="submitForm"
                  :disabled="isSubmitting"
                  class="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
                >
                  <i v-if="!isSubmitting" class="fas fa-check mr-2"></i>
                  <i v-else class="fas fa-spinner animate-spin mr-2"></i>
                  {{ isSubmitting ? 'Guardando...' : 'Crear Reserva' }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Summary Sidebar -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-xl shadow-sm border p-6 sticky top-6">
            <h3 class="text-lg font-bold text-gray-900 mb-4">Resumen Actual</h3>
            
            <div class="space-y-4 text-sm">
              <!-- Fechas -->
              <div>
                <p class="text-gray-600 font-medium">Fechas</p>
                <p v-if="form.check_in_date" class="text-gray-900">
                  {{ formatDate(form.check_in_date) }} a {{ formatDate(form.checkout_date) }}
                </p>
                <p v-else class="text-gray-500 italic">Por definir</p>
              </div>

              <div class="border-t pt-4">
                <p class="text-gray-600 font-medium">Huésped</p>
                <p v-if="form.guest_name" class="text-gray-900">{{ form.guest_name }}</p>
                <p v-else class="text-gray-500 italic">Por definir</p>
              </div>

              <div class="border-t pt-4">
                <p class="text-gray-600 font-medium">Habitación</p>
                <p v-if="form.room_id" class="text-gray-900">{{ getSelectedRoomInfo() }}</p>
                <p v-else class="text-gray-500 italic">Por definir</p>
              </div>

              <div class="border-t pt-4">
                <p class="text-gray-600 font-medium">Noches</p>
                <p class="text-lg font-bold text-green-600">{{ calculateNights }}</p>
              </div>

              <div class="border-t pt-4">
                <p class="text-gray-600 font-medium">Total</p>
                <p class="text-2xl font-bold text-green-600">
                  ${{ calculateTotal.toLocaleString('es-CO') }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Success Modal -->
    <div v-if="showSuccessModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4 text-center">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="fas fa-check text-3xl text-green-600"></i>
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">¡Reserva Creada!</h3>
        <p class="text-gray-600 mb-6">{{ successMessage }}</p>
        <button
          @click="handleSuccessClose"
          class="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
        >
          Volver al Dashboard
        </button>
      </div>
    </div>

    <!-- Error Modal -->
    <div v-if="showErrorModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4 text-center">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="fas fa-times text-3xl text-red-600"></i>
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">Error al Crear Reserva</h3>
        <p class="text-gray-600 mb-6">{{ errorMessage }}</p>
        <button
          @click="showErrorModal = false"
          class="w-full px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
        >
          Cerrar
        </button>
      </div>
    </div>

    <!-- All Bookings Modal -->
    <div v-if="showAllBookings" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-lg p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-gray-900">Todas las Reservas</h2>
          <button
            @click="showAllBookings = false"
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <i class="fas fa-times text-xl text-gray-600"></i>
          </button>
        </div>

        <div v-if="loadingBookings" class="text-center py-8">
          <div class="inline-block animate-spin">
            <i class="fas fa-spinner text-3xl text-blue-600"></i>
          </div>
          <p class="text-gray-600 mt-2">Cargando reservas...</p>
        </div>

        <div v-else-if="allBookings.length === 0" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p class="text-yellow-800">No hay reservas registradas</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-100 border-b-2">
              <tr>
                <th class="px-4 py-3 text-left font-bold text-gray-900">Habitación</th>
                <th class="px-4 py-3 text-left font-bold text-gray-900">Huésped</th>
                <th class="px-4 py-3 text-left font-bold text-gray-900">Email</th>
                <th class="px-4 py-3 text-left font-bold text-gray-900">CC</th>
                <th class="px-4 py-3 text-left font-bold text-gray-900">Entrada</th>
                <th class="px-4 py-3 text-left font-bold text-gray-900">Salida</th>
                <th class="px-4 py-3 text-left font-bold text-gray-900">Total</th>
                <th class="px-4 py-3 text-left font-bold text-gray-900">Estado</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              <tr v-for="booking in allBookings" :key="booking.id" class="hover:bg-gray-50">
                <td class="px-4 py-3 text-gray-900 font-medium">{{ booking.room_number }}</td>
                <td class="px-4 py-3 text-gray-900">{{ booking.guest_name }}</td>
                <td class="px-4 py-3 text-gray-600">{{ booking.guest_email }}</td>
                <td class="px-4 py-3 text-gray-600">{{ booking.guest_cc || 'N/A' }}</td>
                <td class="px-4 py-3 text-gray-600">{{ formatBookingDate(booking.check_in_date) }}</td>
                <td class="px-4 py-3 text-gray-600">{{ formatBookingDate(booking.check_out_date) }}</td>
                <td class="px-4 py-3 font-bold text-green-600">${{ Number(booking.total_amount).toLocaleString('es-CO') }}</td>
                <td class="px-4 py-3">
                  <span :class="[
                    'px-3 py-1 rounded-full text-xs font-bold',
                    booking.status === 'confirmed'
                      ? 'bg-blue-100 text-blue-800'
                      : booking.status === 'checked_in'
                      ? 'bg-green-100 text-green-800'
                      : booking.status === 'checked_out'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-yellow-100 text-yellow-800'
                  ]">
                    {{ translateStatus(booking.status) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>

          <div class="mt-6 p-4 bg-gray-50 rounded-lg">
            <p class="text-gray-600">
              <span class="font-bold">Total de reservas:</span> {{ allBookings.length }}
            </p>
            <p class="text-gray-600">
              <span class="font-bold">Ingreso total:</span> 
              <span class="text-green-600 font-bold">${{ calculateTotalIncome.toLocaleString('es-CO') }}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const currentStep = ref(1);
const steps = ['Fechas', 'Huésped', 'Habitación', 'Confirmación'];
const currentYear = new Date().getFullYear();

const form = ref({
  day: null,
  month: null,
  year: currentYear,
  checkout_date: '',
  guest_name: '',
  guest_email: '',
  guest_phone: '',
  guest_cc: '',
  room_id: null,
  price_per_night: 0,
  notes: '',
  check_in_date: ''
});

const availableRooms = ref([]);
const loadingRooms = ref(false);
const isSubmitting = ref(false);
const showSuccessModal = ref(false);
const showErrorModal = ref(false);
const successMessage = ref('');
const errorMessage = ref('');
const showAllBookings = ref(false);
const allBookings = ref([]);
const loadingBookings = ref(false);

const calculateNights = computed(() => {
  if (!form.value.check_in_date || !form.value.checkout_date) return 0;
  const checkIn = new Date(form.value.check_in_date);
  const checkOut = new Date(form.value.checkout_date);
  const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  return Math.max(nights, 0);
});

const calculateTotal = computed(() => {
  return calculateNights.value * form.value.price_per_night;
});

const calculateTotalIncome = computed(() => {
  return allBookings.value.reduce((total, booking) => {
    return total + (parseFloat(booking.total_amount) || 0);
  }, 0);
});

const getMinCheckoutDate = () => {
  if (!form.value.check_in_date) return '';
  const checkIn = new Date(form.value.check_in_date);
  checkIn.setDate(checkIn.getDate() + 1);
  return checkIn.toISOString().split('T')[0];
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const getSelectedRoomInfo = () => {
  const room = availableRooms.value.find(r => r.id === form.value.room_id);
  if (!room) return 'No seleccionada';
  return `${room.room_number} (${room.type}) - Piso ${room.floor}`;
};

const nextStep = async () => {
  if (currentStep.value === 1) {
    if (!form.value.day || !form.value.month || !form.value.year || !form.value.checkout_date) {
      alert('Por favor completa todas las fechas');
      return;
    }
    // Construir fecha de entrada
    const checkInDate = new Date(form.value.year, form.value.month - 1, form.value.day);
    form.value.check_in_date = checkInDate.toISOString().split('T')[0];
  } else if (currentStep.value === 2) {
    if (!form.value.guest_name || !form.value.guest_email || !form.value.guest_cc) {
      alert('Por favor completa la información requerida del huésped');
      return;
    }
    // Cargar habitaciones disponibles
    loadingRooms.value = true;
    try {
      const response = await fetch('/api/hotel/rooms');
      const data = await response.json();
      if (data.success && Array.isArray(data.rooms)) {
        availableRooms.value = data.rooms.filter(room => 
          (room.current_status || '').trim().toLowerCase() === 'available'
        );
      }
    } catch (error) {
      console.error('Error loading rooms:', error);
      alert('Error al cargar las habitaciones disponibles');
    } finally {
      loadingRooms.value = false;
    }
  } else if (currentStep.value === 3) {
    if (!form.value.room_id || !form.value.price_per_night) {
      alert('Por favor selecciona una habitación y confirma el precio');
      return;
    }
  }
  
  currentStep.value++;
};

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

const submitForm = async () => {
  isSubmitting.value = true;
  try {
    const bookingData = {
      room_id: form.value.room_id,
      guest_name: form.value.guest_name,
      guest_email: form.value.guest_email,
      guest_phone: form.value.guest_phone || '',
      guest_cc: form.value.guest_cc,
      check_in_date: form.value.check_in_date,
      check_out_date: form.value.checkout_date,
      nights_booked: calculateNights.value,
      price_per_night: form.value.price_per_night,
      total_amount: calculateTotal.value,
      notes: form.value.notes || `CC: ${form.value.guest_cc}`,
      status: 'confirmed'
    };

    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bookingData)
    });

    const data = await response.json();

    if (data.success) {
      successMessage.value = `Reserva creada exitosamente para ${form.value.guest_name} en la habitación ${getSelectedRoomInfo()}`;
      showSuccessModal.value = true;
    } else {
      errorMessage.value = data.message || 'Error al crear la reserva';
      showErrorModal.value = true;
    }
  } catch (error) {
    console.error('Error creating booking:', error);
    errorMessage.value = 'Error de conexión al servidor';
    showErrorModal.value = true;
  } finally {
    isSubmitting.value = false;
  }
};

const goBack = () => {
  window.location.href = '/admin/dashboard';
};

const handleSuccessClose = () => {
  window.location.href = '/admin/dashboard';
};

const fetchAllBookings = async () => {
  loadingBookings.value = true;
  try {
    const response = await fetch('/api/bookings');
    const data = await response.json();
    if (data.success && Array.isArray(data.bookings)) {
      allBookings.value = data.bookings;
    } else {
      allBookings.value = [];
    }
  } catch (error) {
    console.error('Error fetching bookings:', error);
    allBookings.value = [];
  } finally {
    loadingBookings.value = false;
  }
};

const formatBookingDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

const translateStatus = (status) => {
  const statusMap = {
    'confirmed': 'Confirmada',
    'checked_in': 'Check-in',
    'checked_out': 'Check-out',
    'cancelled': 'Cancelada',
    'pending': 'Pendiente'
  };
  return statusMap[status] || status;
};

onMounted(() => {
  // Set default year
  form.value.year = currentYear;
});
</script>

<style scoped>
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type=number] {
  -moz-appearance: textfield;
}
</style>
