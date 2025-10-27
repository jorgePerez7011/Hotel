<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="container mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <button 
              @click="goBackToDashboard"
              class="text-blue-600 hover:text-blue-800"
            >
              <i class="fas fa-arrow-left mr-2"></i>
              Volver al Dashboard
            </button>
            <h1 class="text-2xl font-bold text-gray-900">Gestión de Habitaciones</h1>
          </div>
          <div class="flex items-center space-x-3">
            <button 
              @click="refreshRooms"
              class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              :disabled="loading"
            >
              <i class="fas fa-sync-alt mr-2" :class="{ 'fa-spin': loading }"></i>
              Actualizar
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <div class="container mx-auto px-6 py-8">
      <!-- Summary Cards -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div class="bg-white p-4 rounded-xl shadow-sm border text-center">
          <div class="text-2xl font-bold text-gray-900">{{ roomSummary.total }}</div>
          <div class="text-sm text-gray-600">Total</div>
        </div>
        <div class="bg-white p-4 rounded-xl shadow-sm border text-center">
          <div class="text-2xl font-bold text-green-600">{{ roomSummary.available }}</div>
          <div class="text-sm text-gray-600">Disponibles</div>
        </div>
        <div class="bg-white p-4 rounded-xl shadow-sm border text-center">
          <div class="text-2xl font-bold text-red-600">{{ roomSummary.occupied }}</div>
          <div class="text-sm text-gray-600">Ocupadas</div>
        </div>
        <div class="bg-white p-4 rounded-xl shadow-sm border text-center">
          <div class="text-2xl font-bold text-blue-600">{{ roomSummary.reserved }}</div>
          <div class="text-sm text-gray-600">Reservadas</div>
        </div>
        <div class="bg-white p-4 rounded-xl shadow-sm border text-center">
          <div class="text-2xl font-bold text-yellow-600">{{ roomSummary.maintenance }}</div>
          <div class="text-sm text-gray-600">Mantenimiento</div>
        </div>
        <div class="bg-white p-4 rounded-xl shadow-sm border text-center">
          <div class="text-2xl font-bold text-purple-600">{{ roomSummary.cleaning }}</div>
          <div class="text-sm text-gray-600">Limpieza</div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-xl shadow-sm border p-6 mb-8">
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex items-center space-x-2">
            <label class="text-sm font-medium text-gray-700">Filtrar por estado:</label>
            <select 
              v-model="selectedFilter" 
              @change="filterRooms"
              class="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">Todas</option>
              <option value="available">Disponibles</option>
              <option value="occupied">Ocupadas</option>
              <option value="reserved">Reservadas</option>
              <option value="maintenance">Mantenimiento</option>
              <option value="cleaning">Limpieza</option>
            </select>
          </div>

          <div class="flex items-center space-x-2">
            <label class="text-sm font-medium text-gray-700">Piso:</label>
            <select 
              v-model="selectedFloor" 
              @change="filterRooms"
              class="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">Todos</option>
              <option value="1">Piso 1</option>
              <option value="2">Piso 2</option>
            </select>
          </div>

          <div class="flex items-center space-x-2">
            <label class="text-sm font-medium text-gray-700">Tipo:</label>
            <select 
              v-model="selectedType" 
              @change="filterRooms"
              class="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">Todos</option>
              <option value="doble">Doble</option>
              <option value="sencilla">Sencilla</option>
              <option value="familiar">Familiar</option>
              <option value="duplex">Duplex</option>
              <option value="suite">Suite</option>
            </select>
          </div>

          <div class="ml-auto">
            <span class="text-sm text-gray-600">
              Mostrando {{ filteredRooms.length }} de {{ rooms.length }} habitaciones
            </span>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading && rooms.length === 0" class="text-center py-12">
        <i class="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
        <p class="text-gray-600">Cargando habitaciones...</p>
      </div>

      <!-- Rooms Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div 
          v-for="room in filteredRooms" 
          :key="room.id"
          class="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow"
        >
          <!-- Room Header -->
          <div class="p-4 border-b">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-lg font-bold text-gray-900">{{ room.number }}</h3>
              <span 
                class="px-2 py-1 rounded-full text-xs font-medium"
                :class="getStatusBadgeClass(room.current_status)"
              >
                {{ getStatusText(room.current_status) }}
              </span>
            </div>
            <div class="flex items-center justify-between text-sm text-gray-600">
              <span class="capitalize">{{ room.type === 'standard' ? 'Estándar' : 'Ejecutiva' }}</span>
              <span>Piso {{ room.floor }}</span>
            </div>
          </div>

          <!-- Room Content -->
          <div class="p-4">
            <!-- Price and Capacity -->
            <div class="flex items-center justify-between mb-3">
              <div class="text-sm">
                <span class="font-medium text-gray-900">${{ room.price_per_night }}</span>
                <span class="text-gray-600">/noche</span>
              </div>
              <div class="text-sm text-gray-600">
                <i class="fas fa-users mr-1"></i>
                {{ room.capacity }} personas
              </div>
            </div>

            <!-- Guest Information (if occupied/reserved) -->
            <div v-if="room.current_status === 'occupied' || room.current_status === 'reserved'" class="bg-gray-50 rounded-lg p-3 mb-3">
              <div class="text-sm">
                <div class="font-medium text-gray-900 mb-1">{{ room.guest_name || 'Huésped' }}</div>
                <div class="text-gray-600">
                  <i class="fas fa-calendar mr-1"></i>
                  {{ formatDate(room.check_in_date) }} - {{ formatDate(room.check_out_date) }}
                </div>
                <div v-if="room.total_amount" class="text-gray-600 mt-1">
                  <i class="fas fa-dollar-sign mr-1"></i>
                  ${{ Number(room.total_amount).toFixed(2) }} total
                </div>
              </div>
            </div>

            <!-- Description -->
            <p class="text-xs text-gray-600 mb-4 line-clamp-2">{{ room.description }}</p>

            <!-- Action Buttons -->
            <div class="space-y-2">
              <!-- Status Change Buttons -->
              <div v-if="room.current_status !== 'occupied' && room.current_status !== 'reserved'" class="flex flex-wrap gap-1">
                <button
                  v-if="room.current_status !== 'available'"
                  @click="openStatusChangeModal(room, 'available')"
                  class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                >
                  Disponible
                </button>
                <button
                  v-if="room.current_status !== 'cleaning'"
                  @click="openStatusChangeModal(room, 'cleaning')"
                  class="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200"
                >
                  Limpieza
                </button>
                <button
                  v-if="room.current_status !== 'maintenance'"
                  @click="openStatusChangeModal(room, 'maintenance')"
                  class="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded hover:bg-yellow-200"
                >
                  Mantenimiento
                </button>
              </div>

              <!-- Action Buttons -->
              <div class="flex gap-1">
                <button
                  @click="viewRoomDetails(room)"
                  class="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                >
                  <i class="fas fa-eye mr-1"></i>
                  Detalles
                </button>
                <button
                  v-if="room.current_status === 'available'"
                  @click="openReservationModal(room)"
                  class="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors"
                >
                  <i class="fas fa-calendar-plus mr-1"></i>
                  Reservar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && filteredRooms.length === 0" class="text-center py-12">
        <i class="fas fa-bed text-4xl text-gray-400 mb-4"></i>
        <p class="text-gray-600">No se encontraron habitaciones con los filtros seleccionados</p>
      </div>
    </div>

    <!-- Room Details Modal -->
    <div v-if="showDetailsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-bold text-gray-900">
              Habitación {{ selectedRoom?.number }}
            </h3>
            <button 
              @click="showDetailsModal = false"
              class="text-gray-500 hover:text-gray-700"
            >
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>

          <div v-if="selectedRoom" class="space-y-6">
            <!-- Basic Info -->
            <div>
              <h4 class="font-medium text-gray-900 mb-3">Información Básica</h4>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="text-gray-600">Tipo:</span>
                  <span class="ml-2 font-medium">{{ selectedRoom.type === 'standard' ? 'Estándar' : 'Ejecutiva' }}</span>
                </div>
                <div>
                  <span class="text-gray-600">Piso:</span>
                  <span class="ml-2 font-medium">{{ selectedRoom.floor }}</span>
                </div>
                <div>
                  <span class="text-gray-600">Capacidad:</span>
                  <span class="ml-2 font-medium">{{ selectedRoom.capacity }} personas</span>
                </div>
                <div>
                  <span class="text-gray-600">Precio:</span>
                  <span class="ml-2 font-medium">${{ selectedRoom.price_per_night }}/noche</span>
                </div>
                <div class="col-span-2">
                  <span class="text-gray-600">Estado:</span>
                  <span 
                    class="ml-2 px-2 py-1 rounded-full text-xs font-medium"
                    :class="getStatusBadgeClass(selectedRoom.current_status)"
                  >
                    {{ getStatusText(selectedRoom.current_status) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Guest Info (if occupied/reserved) -->
            <div v-if="selectedRoom.current_status === 'occupied' || selectedRoom.current_status === 'reserved'">
              <h4 class="font-medium text-gray-900 mb-3">Información del Huésped</h4>
              <div class="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div>
                  <span class="text-gray-600">Nombre:</span>
                  <span class="ml-2 font-medium">{{ selectedRoom.guest_name || 'N/A' }}</span>
                </div>
                <div v-if="selectedRoom.guest_email">
                  <span class="text-gray-600">Email:</span>
                  <span class="ml-2 font-medium">{{ selectedRoom.guest_email }}</span>
                </div>
                <div v-if="selectedRoom.guest_phone">
                  <span class="text-gray-600">Teléfono:</span>
                  <span class="ml-2 font-medium">{{ selectedRoom.guest_phone }}</span>
                </div>
                <div>
                  <span class="text-gray-600">Check-in:</span>
                  <span class="ml-2 font-medium">{{ formatDate(selectedRoom.check_in_date) }}</span>
                </div>
                <div>
                  <span class="text-gray-600">Check-out:</span>
                  <span class="ml-2 font-medium">{{ formatDate(selectedRoom.check_out_date) }}</span>
                </div>
                <div v-if="selectedRoom.nights_booked">
                  <span class="text-gray-600">Noches:</span>
                  <span class="ml-2 font-medium">{{ selectedRoom.nights_booked }}</span>
                </div>
                <div v-if="selectedRoom.total_amount">
                  <span class="text-gray-600">Total:</span>
                  <span class="ml-2 font-medium text-green-600">${{ Number(selectedRoom.total_amount).toFixed(2) }}</span>
                </div>
              </div>
            </div>

            <!-- Description -->
            <div>
              <h4 class="font-medium text-gray-900 mb-3">Descripción</h4>
              <p class="text-sm text-gray-700 bg-gray-50 rounded-lg p-4">
                {{ selectedRoom.description }}
              </p>
            </div>

            <!-- Notes -->
            <div v-if="selectedRoom.notes">
              <h4 class="font-medium text-gray-900 mb-3">Notas</h4>
              <p class="text-sm text-gray-700 bg-yellow-50 rounded-lg p-4">
                {{ selectedRoom.notes }}
              </p>
            </div>

            <!-- Check-in/Check-out Actions -->
            <div v-if="selectedRoom.current_status === 'reserved'">
              <h4 class="font-medium text-gray-900 mb-3">Acciones de Reserva</h4>
              <div class="flex flex-wrap gap-2">
                <button
                  @click="performCheckin(selectedRoom)"
                  class="bg-red-600 text-white px-8 py-3 rounded-md text-sm font-semibold hover:bg-red-700 transition-colors duration-200 min-w-[140px] shadow-sm"
                >
                  Check-in
                </button>
              </div>
            </div>

            <!-- Check-out Action -->
            <div v-if="selectedRoom.current_status === 'occupied'">
              <h4 class="font-medium text-gray-900 mb-3">Acciones de Huésped</h4>
              <div class="flex flex-wrap gap-2">
                <button
                  @click="performCheckout(selectedRoom)"
                  class="bg-blue-600 text-white px-8 py-3 rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors duration-200 min-w-[140px] shadow-sm"
                >
                  Check-out
                </button>
              </div>
            </div>

            <!-- Status Change Actions -->
            <div v-if="selectedRoom.current_status !== 'occupied' && selectedRoom.current_status !== 'reserved'">
              <h4 class="font-medium text-gray-900 mb-3">Cambiar Estado</h4>
              <div class="flex flex-wrap gap-2">
                <button
                  v-if="selectedRoom.current_status !== 'available'"
                  @click="openStatusChangeModal(selectedRoom, 'available')"
                  class="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
                >
                  Marcar como Disponible
                </button>
                <button
                  v-if="selectedRoom.current_status !== 'cleaning'"
                  @click="openStatusChangeModal(selectedRoom, 'cleaning')"
                  class="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700"
                >
                  Marcar en Limpieza
                </button>
                <button
                  v-if="selectedRoom.current_status !== 'maintenance'"
                  @click="openStatusChangeModal(selectedRoom, 'maintenance')"
                  class="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-700"
                >
                  Marcar en Mantenimiento
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Reservation Modal -->
    <div v-if="showReservationModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg max-w-lg w-full max-h-screen overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-bold text-gray-900">
              Reservar Habitación {{ reservationForm.room?.number }}
            </h3>
            <button 
              @click="closeReservationModal"
              class="text-gray-500 hover:text-gray-700"
            >
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>

          <form @submit.prevent="createReservation" class="space-y-4">
            <!-- Guest Information -->
            <div>
              <h4 class="font-medium text-gray-900 mb-3">Información del Huésped</h4>
              <div class="space-y-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Nombre Completo *</label>
                  <input 
                    v-model="reservationForm.guestName"
                    type="text" 
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: Juan Pérez"
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input 
                    v-model="reservationForm.guestEmail"
                    type="email" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="correo@ejemplo.com"
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input 
                    v-model="reservationForm.guestPhone"
                    type="tel" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+1234567890"
                  >
                </div>
              </div>
            </div>

            <!-- Dates -->
            <div>
              <h4 class="font-medium text-gray-900 mb-3">Fechas de Estancia</h4>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Check-in *</label>
                  <input 
                    v-model="reservationForm.checkIn"
                    type="date" 
                    required
                    :min="getTodayDate()"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    @change="calculateTotal"
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Check-out *</label>
                  <input 
                    v-model="reservationForm.checkOut"
                    type="date" 
                    required
                    :min="reservationForm.checkIn"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    @change="calculateTotal"
                  >
                </div>
              </div>
            </div>

            <!-- Pricing -->
            <div>
              <h4 class="font-medium text-gray-900 mb-3">Precio Personalizado</h4>
              <div class="space-y-3">
                <div class="bg-gray-50 rounded-lg p-3">
                  <div class="text-sm text-gray-600 mb-2">Precio base por noche: ${{ reservationForm.room?.base_price }}</div>
                  <div class="text-sm text-gray-600">Noches: {{ reservationForm.nights }}</div>
                  <div class="text-sm text-gray-600">Subtotal: ${{ (reservationForm.room?.base_price * reservationForm.nights).toFixed(2) }}</div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Precio por Noche (Personalizado)</label>
                  <input 
                    v-model.number="reservationForm.pricePerNight"
                    type="number" 
                    step="0.01"
                    min="0"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    @input="calculateTotal"
                    placeholder="Precio personalizado"
                  >
                </div>
                <div class="bg-blue-50 rounded-lg p-3">
                  <div class="font-medium text-blue-900">Total a Pagar: ${{ reservationForm.totalAmount.toFixed(2) }}</div>
                </div>
              </div>
            </div>

            <!-- Notes -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Notas Adicionales</label>
              <textarea 
                v-model="reservationForm.notes"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                rows="3"
                placeholder="Notas especiales, preferencias del huésped, etc."
              ></textarea>
            </div>

            <!-- Action Buttons -->
            <div class="flex space-x-3 pt-4">
              <button
                type="button"
                @click="closeReservationModal"
                class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="!reservationForm.guestName || !reservationForm.checkIn || !reservationForm.checkOut || reservationForm.nights <= 0"
                class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i class="fas fa-check mr-2"></i>
                Crear Reserva
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Status Change Confirmation Modal -->
    <div v-if="showStatusChangeModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg max-w-md w-full">
        <div class="p-6">
          <div class="flex items-center justify-center mb-6">
            <div class="bg-blue-100 rounded-full p-3 mr-4">
              <i class="fas fa-question-circle text-blue-600 text-2xl"></i>
            </div>
            <div>
              <h3 class="text-lg font-bold text-gray-900">Confirmar Cambio de Estado</h3>
              <p class="text-gray-600 text-sm mt-1">¿Estás seguro de realizar este cambio?</p>
            </div>
          </div>

          <div class="bg-gray-50 rounded-lg p-4 mb-6">
            <div class="text-sm">
              <p><strong>Habitación:</strong> {{ statusChangeData.room?.number }}</p>
              <p><strong>Estado actual:</strong> 
                <span :class="getStatusBadgeClass(statusChangeData.room?.current_status)">
                  {{ getStatusText(statusChangeData.room?.current_status) }}
                </span>
              </p>
              <p><strong>Nuevo estado:</strong> 
                <span :class="getStatusBadgeClass(statusChangeData.newStatus)">
                  {{ getStatusText(statusChangeData.newStatus) }}
                </span>
              </p>
            </div>
          </div>

          <div class="flex space-x-3">
            <button
              @click="closeStatusChangeModal"
              class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              <i class="fas fa-times mr-2"></i>
              Cancelar
            </button>
            <button
              @click="confirmStatusChange"
              class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              <i class="fas fa-check mr-2"></i>
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'

export default {
  name: 'RoomManagement',
  setup() {
    const loading = ref(false)
    const rooms = ref([])
    const selectedFilter = ref('all')
    const selectedFloor = ref('all')
    const selectedType = ref('all')
    const showDetailsModal = ref(false)
    const selectedRoom = ref(null)
    
    // Reservation Modal
    const showReservationModal = ref(false)
    const reservationForm = ref({
      room: null,
      guestName: '',
      guestEmail: '',
      guestPhone: '',
      checkIn: '',
      checkOut: '',
      pricePerNight: 0,
      totalAmount: 0,
      nights: 0,
      notes: ''
    })

    // Status Change Confirmation Modal
    const showStatusChangeModal = ref(false)
    const statusChangeData = ref({
      room: null,
      newStatus: ''
    })

    const roomSummary = computed(() => {
      return {
        total: rooms.value.length,
        available: rooms.value.filter(r => r.current_status === 'available').length,
        occupied: rooms.value.filter(r => r.current_status === 'occupied').length,
        reserved: rooms.value.filter(r => r.current_status === 'reserved').length,
        maintenance: rooms.value.filter(r => r.current_status === 'maintenance').length,
        cleaning: rooms.value.filter(r => r.current_status === 'cleaning').length
      }
    })

    const filteredRooms = computed(() => {
      let filtered = rooms.value

      // Filter by status
      if (selectedFilter.value !== 'all') {
        filtered = filtered.filter(room => room.current_status === selectedFilter.value)
      }

      // Filter by floor
      if (selectedFloor.value !== 'all') {
        filtered = filtered.filter(room => room.floor.toString() === selectedFloor.value)
      }

      // Filter by type
      if (selectedType.value !== 'all') {
        filtered = filtered.filter(room => room.type === selectedType.value)
      }

      return filtered
    })

    const fetchRooms = async () => {
      loading.value = true
      try {
        const response = await fetch('http://localhost:4000/api/hotel/rooms')
        const data = await response.json()
        
        if (data.success) {
          rooms.value = data.rooms
        } else {
          console.error('Error fetching rooms:', data.error)
        }
      } catch (error) {
        console.error('Error fetching rooms:', error)
      } finally {
        loading.value = false
      }
    }

    const refreshRooms = async () => {
      await fetchRooms()
    }

    const filterRooms = () => {
      // El filtrado se maneja automáticamente por el computed
    }

    const changeRoomStatus = async (roomId, newStatus) => {
      try {
        const response = await fetch(`http://localhost:4000/api/hotel/rooms/${roomId}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            status: newStatus,
            notes: `Estado cambiado a ${newStatus} el ${new Date().toLocaleString('es-ES')}`
          })
        })

        const data = await response.json()

        if (data.success) {
          // Actualizar el estado local
          const roomIndex = rooms.value.findIndex(r => r.id === roomId)
          if (roomIndex !== -1) {
            rooms.value[roomIndex].current_status = newStatus
            rooms.value[roomIndex].status = newStatus
          }
        } else {
          alert('Error actualizando el estado: ' + data.error)
        }
      } catch (error) {
        console.error('Error changing room status:', error)
        alert('Error al cambiar el estado de la habitación')
      }
    }

    // Status Change Modal Functions
    const openStatusChangeModal = (room, newStatus) => {
      statusChangeData.value = {
        room: room,
        newStatus: newStatus
      }
      showStatusChangeModal.value = true
    }

    const closeStatusChangeModal = () => {
      showStatusChangeModal.value = false
      statusChangeData.value = {
        room: null,
        newStatus: ''
      }
    }

    const confirmStatusChange = async () => {
      if (statusChangeData.value.room && statusChangeData.value.newStatus) {
        await changeRoomStatus(statusChangeData.value.room.id, statusChangeData.value.newStatus)
        closeStatusChangeModal()
        if (showDetailsModal.value) {
          showDetailsModal.value = false
        }
      }
    }

    // Check-in and Check-out Functions
    const performCheckin = async (room) => {
      if (!confirm(`¿Confirmar check-in para la habitación ${room.room_number}?`)) {
        return
      }

      try {
        const response = await fetch(`http://localhost:4000/api/hotel/rooms/${room.id}/checkin`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            checkin_time: new Date().toISOString()
          })
        })

        const data = await response.json()

        if (data.success) {
          // Actualizar el estado local
          const roomIndex = rooms.value.findIndex(r => r.id === room.id)
          if (roomIndex !== -1) {
            rooms.value[roomIndex].current_status = 'occupied'
            rooms.value[roomIndex].status = 'occupied'
          }
          
          alert(`Check-in realizado exitosamente para la habitación ${room.room_number}`)
          showDetailsModal.value = false
          await fetchRooms()
        } else {
          alert('Error realizando check-in: ' + data.error)
        }
      } catch (error) {
        console.error('Error performing check-in:', error)
        alert('Error al realizar el check-in')
      }
    }

    const performCheckout = async (room) => {
      if (!confirm(`¿Confirmar check-out para la habitación ${room.room_number}?`)) {
        return
      }

      try {
        const response = await fetch(`http://localhost:4000/api/hotel/rooms/${room.id}/checkout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            checkout_time: new Date().toISOString()
          })
        })

        const data = await response.json()

        if (data.success) {
          // Actualizar el estado local
          const roomIndex = rooms.value.findIndex(r => r.id === room.id)
          if (roomIndex !== -1) {
            rooms.value[roomIndex].current_status = 'cleaning'
            rooms.value[roomIndex].status = 'cleaning'
          }
          
          alert(`Check-out realizado exitosamente para la habitación ${room.room_number}`)
          showDetailsModal.value = false
          await fetchRooms()
        } else {
          alert('Error realizando check-out: ' + data.error)
        }
      } catch (error) {
        console.error('Error performing check-out:', error)
        alert('Error al realizar el check-out')
      }
    }

    const viewRoomDetails = (room) => {
      selectedRoom.value = room
      showDetailsModal.value = true
    }

    const getStatusBadgeClass = (status) => {
      switch (status) {
        case 'available': return 'bg-green-100 text-green-800'
        case 'occupied': return 'bg-red-100 text-red-800'
        case 'reserved': return 'bg-blue-100 text-blue-800'
        case 'maintenance': return 'bg-yellow-100 text-yellow-800'
        case 'cleaning': return 'bg-purple-100 text-purple-800'
        default: return 'bg-gray-100 text-gray-800'
      }
    }

    const getStatusText = (status) => {
      switch (status) {
        case 'available': return 'Disponible'
        case 'occupied': return 'Ocupada'
        case 'reserved': return 'Reservada'
        case 'maintenance': return 'Mantenimiento'
        case 'cleaning': return 'Limpieza'
        default: return 'Desconocido'
      }
    }

    const formatDate = (dateStr) => {
      if (!dateStr) return 'N/A'
      return new Date(dateStr).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    }

    // Reservation Modal Functions
    const openReservationModal = (room) => {
      reservationForm.value = {
        room: room,
        guestName: '',
        guestEmail: '',
        guestPhone: '',
        checkIn: '',
        checkOut: '',
        pricePerNight: room.base_price,
        totalAmount: 0,
        nights: 0,
        notes: ''
      }
      showReservationModal.value = true
    }

    const closeReservationModal = () => {
      showReservationModal.value = false
      reservationForm.value = {
        room: null,
        guestName: '',
        guestEmail: '',
        guestPhone: '',
        checkIn: '',
        checkOut: '',
        pricePerNight: 0,
        totalAmount: 0,
        nights: 0,
        notes: ''
      }
    }

    const getTodayDate = () => {
      return new Date().toISOString().split('T')[0]
    }

    const calculateTotal = () => {
      if (reservationForm.value.checkIn && reservationForm.value.checkOut) {
        const checkIn = new Date(reservationForm.value.checkIn)
        const checkOut = new Date(reservationForm.value.checkOut)
        const timeDiff = checkOut.getTime() - checkIn.getTime()
        const nights = Math.ceil(timeDiff / (1000 * 3600 * 24))
        
        if (nights > 0) {
          reservationForm.value.nights = nights
          const pricePerNight = reservationForm.value.pricePerNight || reservationForm.value.room?.base_price || 0
          reservationForm.value.totalAmount = nights * pricePerNight
        } else {
          reservationForm.value.nights = 0
          reservationForm.value.totalAmount = 0
        }
      }
    }

    const createReservation = async () => {
      try {
        loading.value = true
        
        const reservationData = {
          room_id: reservationForm.value.room.id,
          guest_name: reservationForm.value.guestName,
          guest_email: reservationForm.value.guestEmail || null,
          guest_phone: reservationForm.value.guestPhone || null,
          check_in_date: reservationForm.value.checkIn,
          check_out_date: reservationForm.value.checkOut,
          nights_booked: reservationForm.value.nights,
          price_per_night: reservationForm.value.pricePerNight,
          total_amount: reservationForm.value.totalAmount,
          notes: reservationForm.value.notes || null,
          status: 'confirmed'
        }

        console.log('Enviando datos de reserva:', reservationData)

        const response = await fetch('http://localhost:4000/api/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('hotelToken')}`
          },
          body: JSON.stringify(reservationData)
        })

        console.log('Respuesta del servidor:', response.status, response.statusText)

        if (response.ok) {
          const result = await response.json()
          alert('Reserva creada exitosamente')
          closeReservationModal()
          await fetchRooms() // Refresh rooms list
        } else {
          const error = await response.json()
          console.error('Error detallado:', error)
          alert(`Error al crear la reserva (${response.status}): ${error.message || 'Error desconocido'}`)
        }
      } catch (error) {
        console.error('Error creating reservation:', error)
        alert('Error al crear la reserva. Por favor intente nuevamente.')
      } finally {
        loading.value = false
      }
    }

    const goBackToDashboard = () => {
      // Intentar ir hacia atrás en el historial
      if (window.history.length > 1) {
        window.history.back()
      } else {
        // Si no hay historial, ir directamente al dashboard
        const user = localStorage.getItem('hotelUser')
        if (user) {
          try {
            const userData = JSON.parse(user)
            if (userData.position === 'admin') {
              window.location.href = '/admin/dashboard'
            } else {
              window.location.href = '/login'
            }
          } catch (error) {
            window.location.href = '/login'
          }
        } else {
          window.location.href = '/login'
        }
      }
    }

    onMounted(() => {
      fetchRooms()
    })

    return {
      loading,
      rooms,
      roomSummary,
      filteredRooms,
      selectedFilter,
      selectedFloor,
      selectedType,
      showDetailsModal,
      selectedRoom,
      showReservationModal,
      reservationForm,
      showStatusChangeModal,
      statusChangeData,
      refreshRooms,
      filterRooms,
      changeRoomStatus,
      viewRoomDetails,
      openReservationModal,
      closeReservationModal,
      openStatusChangeModal,
      closeStatusChangeModal,
      confirmStatusChange,
      performCheckin,
      performCheckout,
      getTodayDate,
      calculateTotal,
      createReservation,
      getStatusBadgeClass,
      getStatusText,
      formatDate,
      goBackToDashboard
    }
  }
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>