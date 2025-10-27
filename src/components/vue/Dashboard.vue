<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="container mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <div class="bg-blue-600 text-white p-3 rounded-lg mr-4">
              <i class="fas fa-hotel text-xl"></i>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Panel de Control</h1>
              <p class="text-gray-600">Hotel Sol - Sistema de Gestión</p>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <div class="text-right bg-gray-50 px-4 py-2 rounded-lg">
              <p class="text-gray-900 font-medium">👤 {{ currentUser.name }}</p>
              <p class="text-gray-600 text-sm capitalize">🏷️ {{ currentUser.position === 'admin' ? 'Administrador' : 'Empleado' }}</p>
            </div>
            <button 
              @click="handleLogout"
              class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
            >
              <i class="fas fa-sign-out-alt mr-2"></i>
              Salir del Sistema
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Dashboard Content -->
    <div class="container mx-auto px-6 py-8">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div 
          v-for="stat in stats" 
          :key="stat.title"
          class="bg-white p-6 rounded-xl shadow-sm border"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">{{ stat.title }}</p>
              <p class="text-2xl font-bold text-gray-900 mt-1">{{ stat.value }}</p>
            </div>
            <div :class="stat.iconBg" class="p-3 rounded-lg">
              <i :class="stat.icon" class="text-white text-xl"></i>
            </div>
          </div>
          <div class="mt-4 flex items-center">
            <span :class="stat.changeClass" class="text-sm font-medium">
              {{ stat.change }}
            </span>
            <span class="text-gray-600 text-sm ml-2">estado actual</span>
          </div>
        </div>
      </div>

      <!-- Shift Handover Section -->
      <div class="mb-8">
        <ShiftHandoverFinancial />
      </div>

      <!-- Quick Actions -->
      <div class="grid lg:grid-cols-3 gap-8">
        <!-- Recent Bookings -->
        <div class="lg:col-span-2 bg-white rounded-xl shadow-sm border">
          <div class="p-6 border-b">
            <h3 class="text-lg font-bold text-gray-900">Reservas Recientes</h3>
          </div>
          <div class="p-6">
            <div class="space-y-4">
              <div 
                v-for="booking in recentBookings" 
                :key="booking.id"
                class="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <h4 class="font-semibold text-gray-900">{{ booking.guest }}</h4>
                  <p class="text-gray-600 text-sm">Habitación {{ booking.room }} • {{ booking.dates }}</p>
                </div>
                <span :class="booking.statusClass" class="px-3 py-1 rounded-full text-sm font-medium">
                  {{ booking.status }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions Panel -->
        <div class="bg-white rounded-xl shadow-sm border">
          <div class="p-6 border-b">
            <h3 class="text-lg font-bold text-gray-900">Acciones Rápidas</h3>
          </div>
          <div class="p-6">
            <div class="space-y-3">
              <button 
                v-for="action in quickActions" 
                :key="action.title"
                class="w-full flex items-center p-3 text-left rounded-lg hover:bg-gray-50 transition-colors"
                @click="handleQuickAction(action.action)"
              >
                <div :class="action.iconBg" class="p-2 rounded-lg mr-3">
                  <i :class="action.icon" class="text-white text-sm"></i>
                </div>
                <div>
                  <h4 class="font-medium text-gray-900">{{ action.title }}</h4>
                  <p class="text-gray-600 text-sm">{{ action.description }}</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Hotel Information -->
      <div class="mt-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <h3 class="text-xl font-bold mb-4">🏨 Sistema de Gestión Hotel Sol</h3>
        <div class="grid md:grid-cols-3 gap-6">
          <div>
            <h4 class="font-semibold mb-2">📊 Panel de Control</h4>
            <ul class="text-blue-100 text-sm space-y-1">
              <li>• Gestión de reservas en tiempo real</li>
              <li>• Control de ocupación de habitaciones</li>
              <li>• Registro de huéspedes (Check-in/Check-out)</li>
              <li>• Administración de empleados</li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-2">💼 Operaciones Diarias</h4>
            <ul class="text-blue-100 text-sm space-y-1">
              <li>• Entrega de turnos con finanzas</li>
              <li>• Reportes de ingresos</li>
              <li>• Control de tarifas por temporada</li>
              <li>• Gestión de pagos y descuentos</li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-2">🔧 Características</h4>
            <ul class="text-blue-100 text-sm space-y-1">
              <li>• Interface completamente en español</li>
              <li>• Base de datos MySQL integrada</li>
              <li>• Sistema de notificaciones por email</li>
              <li>• Acceso seguro con autenticación</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Quick Check-in Modal -->
  <div v-if="showQuickCheckinModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
    <div class="bg-white rounded-lg max-w-7xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
      <div class="p-6">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-bold text-gray-900">
            <i class="fas fa-sign-in-alt mr-2 text-blue-500"></i>
            Check-in Rápido
          </h3>
          <button 
            @click="closeQuickCheckinModal"
            class="text-gray-500 hover:text-gray-700"
          >
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span class="ml-2 text-gray-600">Cargando habitaciones...</span>
        </div>

        <!-- No Available Rooms -->
        <div v-else-if="reservedRooms.length === 0" class="text-center py-8">
          <i class="fas fa-bed text-gray-400 text-4xl mb-4"></i>
          <h4 class="text-lg font-medium text-gray-900 mb-2">No hay habitaciones disponibles</h4>
          <p class="text-gray-600">No hay habitaciones reservadas ni disponibles para check-in en este momento.</p>
          <button 
            @click="closeQuickCheckinModal"
            class="mt-4 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
          >
            Cerrar
          </button>
        </div>

        <!-- Available Rooms List -->
        <div v-else class="space-y-4">
          <!-- Habitaciones Reservadas -->
          <div v-if="reservedRooms.filter(r => r.current_status === 'reserved').length > 0">
            <div 
              v-for="room in reservedRooms.filter(r => r.current_status === 'reserved')" 
              :key="room.id"
              class="border border-orange-300 rounded-lg overflow-hidden bg-white shadow-lg mb-6 min-w-0"
            >
              <!-- Header con ID de reserva y titular -->
              <div class="px-4 py-3 border-b" :class="room.isWalkIn ? 'bg-green-100 border-green-200' : 'bg-orange-100 border-orange-200'">
                <div class="flex justify-between items-center">
                  <div class="flex items-center space-x-4">
                    <button 
                      @click="toggleMinimized(room.id)"
                      class="text-gray-600 hover:text-gray-800 p-1 rounded hover:bg-white/50 transition-colors"
                      :title="isMinimized(room.id) ? 'Expandir' : 'Minimizar'"
                    >
                      <i class="fas" :class="isMinimized(room.id) ? 'fa-plus' : 'fa-minus'"></i>
                    </button>
                    <span class="text-sm text-gray-700">
                      <strong>{{ room.isWalkIn ? 'Check-in Directo' : 'Reserva' }}:</strong> 
                      <span class="text-red-600 font-semibold">{{ room.booking_id }}</span>
                    </span>
                    <span class="text-sm text-gray-700">
                      <strong>Titular:</strong> {{ currentUser.name }} 
                      <i class="fas fa-user ml-1 text-gray-500"></i>
                    </span>
                    <span class="px-2 py-1 rounded text-xs font-medium" :class="room.isWalkIn ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'">
                      {{ room.isWalkIn ? 'Walk-in Guest' : 'Sin pagos' }}
                    </span>
                  </div>
                  
                  <div class="flex items-center space-x-2">
                    <!-- Información resumida cuando está minimizado -->
                    <div v-if="isMinimized(room.id)" class="flex items-center space-x-4 text-sm text-gray-600 mr-4">
                      <span class="font-medium">Hab. {{ room.room_number }}</span>
                      <span>•</span>
                      <span>{{ room.guest_name || 'Sin huésped' }}</span>
                      <span>•</span>
                      <span class="text-green-600 font-semibold">COP {{ calculateFinalTotal(room).toLocaleString() }}.00</span>
                      
                      <!-- Botones rápidos cuando está minimizado -->
                      <div class="flex space-x-2 ml-4">
                        <button
                          @click.stop="processCheckIn(room)"
                          class="bg-green-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-green-700 transition-colors"
                        >
                          {{ room.isWalkIn ? 'CHECK-IN' : 'REGISTRAR' }}
                        </button>
                        <button
                          @click.stop="room.isWalkIn ? closeWalkInInterface(room) : performQuickCheckin(room)"
                          class="bg-red-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-red-700 transition-colors"
                        >
                          {{ room.isWalkIn ? 'CANCELAR' : 'DESHACER' }}
                        </button>
                      </div>
                    </div>
                    
                    <button class="text-gray-500 hover:text-gray-700 bg-gray-200 px-3 py-1 rounded text-sm">
                      <i class="fas fa-arrow-left mr-1"></i>
                      {{ room.isWalkIn ? 'Volver a habitaciones' : 'Volver al calendario' }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Contenido principal -->
              <transition name="slide-down">
                <div v-show="!isMinimized(room.id)" class="p-8">
                <div class="grid grid-cols-1 xl:grid-cols-2 gap-12">
                  <!-- Columna Izquierda: Información de la reserva -->
                  <div>
                    <!-- Información del huésped para walk-in -->
                    <div v-if="room.isWalkIn" class="bg-blue-50 rounded-lg p-4 mb-4">
                      <h4 class="font-semibold text-gray-900 mb-3 flex items-center">
                        <i class="fas fa-user-plus text-blue-500 mr-2"></i>
                        Información del Huésped
                      </h4>
                      
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-2">Nombre Completo *</label>
                          <input 
                            v-model="room.guest_name"
                            type="text" 
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Nombre del huésped"
                          >
                        </div>
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                          <input 
                            v-model="room.guest_phone"
                            type="tel" 
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="+57 300 123 4567"
                          >
                        </div>
                        <div class="col-span-1 md:col-span-2">
                          <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                          <input 
                            v-model="room.guest_email"
                            type="email" 
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="email@ejemplo.com"
                          >
                        </div>
                      </div>
                    </div>

                    <div class="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 class="font-semibold text-gray-900 mb-3">
                        {{ room.type }} | Habitación {{ room.room_number }}
                      </h4>
                      
                      <!-- Fechas de check-in/out editables -->
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-2">
                            <i class="fas fa-calendar text-blue-500 mr-2"></i>Fecha de Check-in
                          </label>
                          <input 
                            v-model="room.check_in_date"
                            type="date" 
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                        </div>
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-2">
                            <i class="fas fa-calendar text-blue-500 mr-2"></i>Fecha de Check-out
                          </label>
                          <input 
                            v-model="room.check_out_date"
                            type="date" 
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                        </div>
                      </div>

                      <!-- Número de noches calculado -->
                      <div class="text-center bg-blue-50 rounded-xl p-6 border-2 border-blue-200 mb-6">
                        <div class="text-5xl font-bold text-blue-600 mb-2">
                          {{ calculateNights(room.check_in_date, room.check_out_date) }}
                        </div>
                        <div class="text-base text-blue-800 font-medium">Noches de Hospedaje</div>
                      </div>

                      <!-- Huéspedes -->
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-2">
                            <i class="fas fa-users text-blue-500 mr-2"></i>Adultos
                          </label>
                          <select v-model="room.adults" class="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
                            <option value="1">1 Adulto</option>
                            <option value="2">2 Adultos</option>
                            <option value="3">3 Adultos</option>
                            <option value="4">4 Adultos</option>
                          </select>
                        </div>
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-2">
                            <i class="fas fa-child text-green-500 mr-2"></i>Menores
                          </label>
                          <select v-model="room.children" class="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white">
                            <option value="0">Sin menores</option>
                            <option value="1">1 Menor</option>
                            <option value="2">2 Menores</option>
                            <option value="3">3 Menores</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <!-- Información del huésped -->
                    <div class="text-sm text-gray-600 mb-4">
                      <div><strong>Canal:</strong> Sin asignar</div>
                      <button class="text-blue-600 hover:underline text-sm mt-1">
                        <i class="fas fa-credit-card mr-1"></i> Ver datos de tarjeta
                      </button>
                    </div>
                  </div>

                  <!-- Columna Derecha: Cargos y totales -->
                  <div class="space-y-6">
                    <div class="border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                      <!-- Tabs -->
                      <div class="flex border-b">
                        <button class="flex-1 px-4 py-2 bg-gray-100 text-sm font-medium text-gray-700 border-r">
                          <i class="fas fa-bed mr-2"></i>
                          Cargos del alojamiento
                        </button>
                        <button class="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50">
                          Ver tarifas por noche
                        </button>
                        <button class="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
                          <i class="fas fa-dollar-sign mr-1"></i>
                          Cargos totales
                        </button>
                      </div>

                      <!-- Contenido de cargos -->
                      <div class="p-6 space-y-4">
                        <div class="flex justify-between text-sm items-center">
                          <span>Tarifa para {{ calculateNights(room.check_in_date, room.check_out_date) }} Noches: <i class="fas fa-info-circle text-gray-400"></i></span>
                          <div class="flex items-center space-x-2">
                            <span class="text-xs text-gray-500">COP</span>
                            <input 
                              v-model.number="room.price_per_night"
                              type="number"
                              min="0"
                              step="1000"
                              class="w-24 px-2 py-1 border border-gray-300 rounded text-sm text-right font-medium bg-yellow-50 focus:bg-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                              @input="updateTotalAmount(room)"
                            >
                            <span class="text-xs text-gray-500">x {{ calculateNights(room.check_in_date, room.check_out_date) }}</span>
                            <span class="font-medium min-w-[80px] text-right">= {{ Number(room.price_per_night * calculateNights(room.check_in_date, room.check_out_date)).toLocaleString() }}.00</span>
                          </div>
                        </div>
                        
                        <div class="flex justify-between text-sm items-center">
                          <span>Descuentos de alojamiento: <i class="fas fa-info-circle text-gray-400"></i></span>
                          <div class="flex items-center space-x-2">
                            <span class="text-xs text-gray-500">COP</span>
                            <input 
                              v-model.number="room.discount_amount"
                              type="number"
                              min="0"
                              step="1000"
                              class="w-24 px-2 py-1 border border-gray-300 rounded text-sm text-right bg-red-50 focus:bg-white focus:ring-2 focus:ring-red-400 focus:border-red-400"
                              @input="updateTotalAmount(room)"
                              placeholder="0"
                            >
                            <button 
                              @click="applyPercentageDiscount(room)"
                              class="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                              title="Aplicar descuento por porcentaje"
                            >
                              %
                            </button>
                          </div>
                        </div>
                        
                        <hr class="border-gray-200">
                        
                        <div class="flex justify-between text-sm">
                          <span>Subtotal sin impuestos:</span>
                          <span class="font-medium">COP {{ Number(room.price_per_night * calculateNights(room.check_in_date, room.check_out_date)).toLocaleString() }}.00</span>
                        </div>
                        
                        <div class="flex justify-between text-sm items-center">
                          <span>Cargos adicionales:</span>
                          <div class="flex items-center space-x-2">
                            <span class="text-xs text-gray-500">COP</span>
                            <input 
                              v-model.number="room.additional_charges"
                              type="number"
                              min="0"
                              step="1000"
                              class="w-24 px-2 py-1 border border-gray-300 rounded text-sm text-right bg-blue-50 focus:bg-white focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                              @input="updateTotalAmount(room)"
                              placeholder="0"
                            >
                            <button 
                              @click="showAdditionalChargesModal(room)"
                              class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                              title="Agregar cargos detallados"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        
                        <div class="flex justify-between text-sm items-center">
                          <span>Impuestos ({{ room.tax_percentage || 0 }}%):</span>
                          <div class="flex items-center space-x-2">
                            <input 
                              v-model.number="room.tax_percentage"
                              type="number"
                              min="0"
                              max="100"
                              step="1"
                              class="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-right"
                              @input="updateTotalAmount(room)"
                            >
                            <span class="text-xs text-gray-500">%</span>
                            <span class="font-medium min-w-[80px] text-right">COP {{ calculateTaxAmount(room).toLocaleString() }}.00</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Resumen de totales -->
                    <div class="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                          <span class="text-gray-600">ALOJAMIENTO:</span>
                          <span class="font-semibold">COP {{ Number(room.price_per_night * calculateNights(room.check_in_date, room.check_out_date)).toLocaleString() }}.00</span>
                        </div>
                        <div v-if="room.discount_amount > 0" class="flex justify-between text-red-600">
                          <span>DESCUENTOS:</span>
                          <span class="font-semibold">-COP {{ Number(room.discount_amount || 0).toLocaleString() }}.00</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-gray-600">CARGOS ADICIONALES:</span>
                          <span class="font-semibold">COP {{ Number(room.additional_charges || 0).toLocaleString() }}.00</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-gray-600">IMPUESTOS:</span>
                          <span class="font-semibold">COP {{ calculateTaxAmount(room).toLocaleString() }}.00</span>
                        </div>
                        <hr>
                        <div class="flex justify-between text-lg font-bold text-red-600">
                          <span>TOTAL:</span>
                          <span>COP {{ calculateFinalTotal(room).toLocaleString() }}.00</span>
                        </div>
                        <div class="flex justify-between text-green-600">
                          <span>PAGADO:</span>
                          <span class="font-semibold">COP {{ Number(room.paid_amount || 0).toLocaleString() }}.00</span>
                        </div>
                        <div class="flex justify-between text-lg font-bold">
                          <span>PENDIENTE:</span>
                          <span>COP {{ (calculateFinalTotal(room) - (room.paid_amount || 0)).toLocaleString() }}.00</span>
                        </div>
                      </div>

                      <!-- Controles de precio rápido -->
                      <div class="p-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl border">
                        <h5 class="text-sm font-semibold text-gray-800 mb-4 flex items-center">
                          <i class="fas fa-tags text-purple-500 mr-2"></i>
                          Ajustes Rápidos de Tarifa
                        </h5>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <button 
                            @click="applyPricePreset(room, 'weekend')"
                            class="bg-purple-500 text-white px-3 py-1 rounded text-xs hover:bg-purple-600"
                          >
                            Tarifa Fin de Semana (+20%)
                          </button>
                          <button 
                            @click="applyPricePreset(room, 'weekday')"
                            class="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600"
                          >
                            Tarifa Entre Semana (-10%)
                          </button>
                          <button 
                            @click="applyPricePreset(room, 'corporate')"
                            class="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600"
                          >
                            Tarifa Corporativa (-15%)
                          </button>
                          <button 
                            @click="applyPricePreset(room, 'vip')"
                            class="bg-yellow-500 text-white px-3 py-1 rounded text-xs hover:bg-yellow-600"
                          >
                            Tarifa VIP (+30%)
                          </button>
                        </div>
                      </div>

                      <!-- Botones de acción -->
                      <div class="flex gap-2 mt-4">
                        <button 
                          @click="applyPercentageDiscount(room)"
                          class="bg-red-500 text-white px-4 py-2 rounded text-sm hover:bg-red-600"
                        >
                          Agregar descuento
                        </button>
                        <button 
                          @click="showAdditionalChargesModal(room)"
                          class="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600"
                        >
                          Agregar cargos
                        </button>
                      </div>

                      <button
                        @click="processCheckIn(room)"
                        class="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-5 rounded-xl font-bold text-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mt-6"
                      >
                        <i class="fas fa-check-circle mr-2"></i>
                        {{ room.isWalkIn ? 'PROCESAR CHECK-IN' : 'REGISTRAR PAGO' }}
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Botones superiores -->
                <div class="flex flex-wrap gap-3 mt-8 pt-6 border-t border-gray-200">
                  <button class="bg-blue-500 text-white border border-blue-600 px-5 py-3 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
                    <i class="fas fa-sign-out-alt mr-2"></i>
                    Check Out
                  </button>
                  <button
                    @click="room.isWalkIn ? closeWalkInInterface(room) : performQuickCheckin(room)"
                    class="bg-red-600 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
                  >
                    <i class="fas fa-times mr-2"></i>
                    {{ room.isWalkIn ? 'Cancelar Check-in' : 'Deshacer check-in' }}
                  </button>
                  <button class="bg-gray-500 text-white border border-gray-600 px-5 py-3 rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors">
                    <i class="fas fa-envelope mr-2"></i>
                    Enviar mail
                  </button>
                  <button class="bg-gray-500 text-white border border-gray-600 px-5 py-3 rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors">
                    <i class="fas fa-print mr-2"></i>
                    Imprimir check-in
                  </button>
                  <button class="bg-gray-500 text-white border border-gray-600 px-5 py-3 rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors">
                    <i class="fas fa-history mr-2"></i>
                    Historial
                  </button>
                  <button class="bg-gray-500 text-white border border-gray-600 px-5 py-3 rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors">
                    <i class="fas fa-eye mr-2"></i>
                    Ver estado de cuenta
                  </button>
                </div>
                </div>
              </transition>
            </div>
          </div>          <!-- Habitaciones Disponibles -->
          <div v-if="reservedRooms.filter(r => r.current_status === 'available').length > 0" class="mt-6">
            <h4 class="text-md font-semibold text-gray-900 mb-3 flex items-center">
              <i class="fas fa-bed text-green-500 mr-2"></i>
              Habitaciones Disponibles (Walk-in)
            </h4>
            
            <div 
              v-for="room in reservedRooms.filter(r => r.current_status === 'available')" 
              :key="room.id"
              class="border border-green-200 rounded-lg p-4 hover:bg-green-50 transition-colors bg-green-25"
            >
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <div class="flex items-center mb-2">
                    <h4 class="text-lg font-semibold text-gray-900">
                      Habitación {{ room.room_number }}
                    </h4>
                    <span class="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      {{ room.type }}
                    </span>
                    <span class="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                      Disponible
                    </span>
                  </div>
                  
                  <div class="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span class="font-medium">Precio por noche:</span>
                      <span class="ml-1 text-green-600 font-medium">${{ Number(room.price_per_night).toFixed(2) }}</span>
                    </div>
                    <div>
                      <span class="font-medium">Piso:</span>
                      <span class="ml-1">{{ room.floor }}</span>
                    </div>
                  </div>
                </div>
                
                <button
                  @click="performQuickCheckin(room)"
                  class="bg-red-600 text-white px-8 py-3 rounded-md text-sm font-semibold hover:bg-red-700 transition-colors duration-200 min-w-[140px] shadow-sm"
                >
                  Check-in
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Walk-in Guest Form Modal -->
  <div v-if="showWalkInForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
    <div class="bg-white rounded-lg max-w-md w-full">
      <div class="p-6">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-bold text-gray-900">
            <i class="fas fa-user-plus mr-2 text-green-500"></i>
            Check-in Directo - Habitación {{ selectedRoom?.room_number }}
          </h3>
          <button 
            @click="closeWalkInForm"
            class="text-gray-500 hover:text-gray-700"
          >
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>

        <form @submit.prevent="performWalkInCheckin" class="space-y-4">
          <!-- Guest Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre del Huésped *</label>
            <input 
              v-model="walkInForm.name"
              type="text" 
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              placeholder="Ej: Juan Pérez"
            >
          </div>

          <!-- Guest Email -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              v-model="walkInForm.email"
              type="email"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              placeholder="ejemplo@email.com"
            >
          </div>

          <!-- Guest Phone -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <input 
              v-model="walkInForm.phone"
              type="tel"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              placeholder="+57 300 123 4567"
            >
          </div>

          <!-- Nights -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Número de Noches *</label>
            <input 
              v-model.number="walkInForm.nights"
              type="number"
              min="1"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
            >
          </div>

          <!-- Total Calculation -->
          <div v-if="selectedRoom" class="bg-gray-50 rounded-lg p-3">
            <div class="flex justify-between text-sm">
              <span>Precio por noche:</span>
              <span class="font-medium">${{ Number(selectedRoom.price_per_night).toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span>Noches:</span>
              <span class="font-medium">{{ walkInForm.nights }}</span>
            </div>
            <hr class="my-2">
            <div class="flex justify-between font-semibold text-green-600">
              <span>Total:</span>
              <span>${{ (Number(selectedRoom.price_per_night) * walkInForm.nights).toFixed(2) }}</span>
            </div>
          </div>

          <!-- Notes -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <textarea 
              v-model="walkInForm.notes"
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              placeholder="Notas adicionales..."
            ></textarea>
          </div>

          <!-- Buttons -->
          <div class="flex gap-3 pt-4">
            <button
              type="button"
              @click="closeWalkInForm"
              class="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="flex-1 bg-red-600 text-white px-4 py-3 rounded-md font-semibold hover:bg-red-700 transition-colors shadow-sm"
            >
              Confirmar Check-in
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import ShiftHandoverFinancial from './ShiftHandoverFinancial.vue';

// User authentication state
const currentUser = ref({
  name: 'Admin',
  position: 'admin',
  email: ''
});

// Check authentication on component mount
onMounted(async () => {
  // Verificar autenticación
  const token = localStorage.getItem('hotelToken');
  const userStr = localStorage.getItem('hotelUser');
  
  if (!token || !userStr) {
    window.location.href = '/login';
    return;
  }
  
  try {
    const user = JSON.parse(userStr);
    currentUser.value = {
      name: user.name || 'Usuario',
      position: user.position || 'staff',
      email: user.email || ''
    };

    // Cargar datos reales de ocupación
    await loadOccupancyData();
  } catch (error) {
    console.error('Error parsing user data:', error);
    window.location.href = '/login';
  }
});

// Load occupancy data
const loadOccupancyData = async () => {
  try {
    const response = await fetch('http://localhost:4000/api/hotel/rooms');
    const data = await response.json();
    
    if (data.success && data.summary) {
      const occupancyPercentage = data.summary.total > 0 
        ? Math.round((data.summary.occupied / data.summary.total) * 100)
        : 0;
      
      // Actualizar las estadísticas con datos reales
      const totalStat = stats.value.find(stat => stat.title === 'Total Habitaciones');
      if (totalStat) {
        totalStat.value = data.summary.total.toString();
      }
      
      const occupancyStat = stats.value.find(stat => stat.title === 'Ocupación Actual');
      if (occupancyStat) {
        occupancyStat.value = `${occupancyPercentage}%`;
        occupancyStat.change = `${data.summary.occupied}/${data.summary.total} habitaciones`;
      }
      
      console.log('Datos cargados:', data.summary);
    } else {
      console.warn('No se pudieron cargar los datos de ocupación:', data);
    }
  } catch (error) {
    console.error('Error loading occupancy data:', error);
  }
};

// Logout function
const handleLogout = () => {
  localStorage.removeItem('hotelToken');
  localStorage.removeItem('hotelUser');
  window.location.href = '/';
};

// Stats data
const stats = ref([
  {
    title: 'Total de Habitaciones',
    value: '20',
    change: 'Habitaciones configuradas',
    changeClass: 'text-gray-600',
    icon: 'fas fa-bed',
    iconBg: 'bg-blue-500'
  },
  {
    title: 'Ocupación del Hotel',
    value: '0%',
    change: '0/20 habitaciones ocupadas',
    changeClass: 'text-gray-600',
    icon: 'fas fa-users',
    iconBg: 'bg-green-500'
  },
  {
    title: 'Reservas de Hoy',
    value: '3',
    change: 'Huéspedes esperados',
    changeClass: 'text-blue-600',
    icon: 'fas fa-calendar-check',
    iconBg: 'bg-orange-500'
  },
  {
    title: 'Ingresos del Mes',
    value: '$2,850,000',
    change: 'Pesos colombianos',
    changeClass: 'text-green-600',
    icon: 'fas fa-dollar-sign',
    iconBg: 'bg-purple-500'
  }
]);

// Recent bookings
const recentBookings = ref([
  {
    id: 1,
    guest: 'María González Rodríguez',
    room: '204',
    dates: '15-17 Oct 2025',
    status: 'Confirmada',
    statusClass: 'bg-green-100 text-green-800'
  },
  {
    id: 2,
    guest: 'Carlos Andrés Ruiz',
    room: '156',
    dates: '16-20 Oct 2025',
    status: 'Registrado',
    statusClass: 'bg-blue-100 text-blue-800'
  },
  {
    id: 3,
    guest: 'Ana Patricia Martín',
    room: '089',
    dates: '18-22 Oct 2025',
    status: 'Por Llegar',
    statusClass: 'bg-yellow-100 text-yellow-800'
  }
]);

// Quick actions
const quickActions = ref([
  {
    title: 'Nueva Reserva',
    description: 'Crear una nueva reserva de habitación',
    icon: 'fas fa-plus',
    iconBg: 'bg-green-500',
    action: 'new-booking'
  },
  {
    title: 'Galería de Habitaciones',
    description: 'Ver tipos y fotos de habitaciones',
    icon: 'fas fa-images',
    iconBg: 'bg-teal-500',
    action: 'view-rooms'
  },
  {
    title: 'Registro de Huéspedes',
    description: 'Check-in rápido de huéspedes',
    icon: 'fas fa-sign-in-alt',
    iconBg: 'bg-blue-500',
    action: 'quick-checkin'
  },
  {
    title: 'Administrar Habitaciones',
    description: 'Gestión completa de habitaciones',
    icon: 'fas fa-bed',
    iconBg: 'bg-purple-500',
    action: 'room-management'
  },
  {
    title: 'Personal del Hotel',
    description: 'Administrar empleados y turnos',
    icon: 'fas fa-users',
    iconBg: 'bg-indigo-500',
    action: 'employees'
  },
  {
    title: 'Informes y Reportes',
    description: 'Estadísticas del hotel',
    icon: 'fas fa-chart-bar',
    iconBg: 'bg-orange-500',
    action: 'reports'
  }
]);

// Quick Check-in Modal
const showQuickCheckinModal = ref(false);
const reservedRooms = ref([]);
const loading = ref(false);

// Walk-in Guest Form
const showWalkInForm = ref(false);
const selectedRoom = ref(null);
const walkInForm = ref({
  name: '',
  email: '',
  phone: '',
  nights: 1,
  notes: ''
});

// Minimized state for each room
const minimizedRooms = ref(new Set());

const handleQuickAction = (action: string) => {
  console.log(`Ejecutando acción: ${action}`);
  
  switch (action) {
    case 'employees':
      window.location.href = '/admin/employees';
      break;
    case 'new-booking':
      window.location.href = '/';
      break;
    case 'view-rooms':
      window.location.href = '/rooms';
      break;
    case 'room-management':
      window.location.href = '/admin/rooms';
      break;
    case 'quick-checkin':
      showQuickCheckinModal.value = true;
      fetchReservedRooms();
      break;
    default:
      alert(`Función ${action} - Próximamente implementada`);
  }
};

// Quick Check-in Functions
const fetchReservedRooms = async () => {
  loading.value = true;
  try {
    const response = await fetch('http://localhost:4000/api/hotel/rooms');
    const data = await response.json();
    
    if (data.success) {
      // Filtrar habitaciones reservadas y disponibles
      reservedRooms.value = data.rooms.filter(room => 
        room.current_status === 'reserved' || room.current_status === 'available'
      ).map(room => ({
        ...room,
        adults: room.adults || 1,
        children: room.children || 0,
        booking_id: room.booking_id || Math.floor(Math.random() * 9000000) + 1000000,
        discount_amount: room.discount_amount || 0,
        additional_charges: room.additional_charges || 0,
        tax_percentage: room.tax_percentage || 0,
        paid_amount: room.paid_amount || 0
      }));
    } else {
      console.error('Error fetching rooms:', data.error);
    }
  } catch (error) {
    console.error('Error fetching reserved rooms:', error);
  } finally {
    loading.value = false;
  }
};

const performQuickCheckin = async (room) => {
  // Si es una habitación disponible, mostrar interfaz completa de check-in
  if (room.current_status === 'available') {
    // Crear una reserva temporal para la interfaz
    const tempReservation = {
      ...room,
      current_status: 'reserved', // Temporalmente como reservada para mostrar interfaz
      booking_id: Math.floor(Math.random() * 9000000) + 1000000,
      guest_name: 'Walk-in Guest',
      guest_email: '',
      guest_phone: '',
      check_in_date: new Date().toISOString().split('T')[0],
      check_out_date: new Date(Date.now() + 24*60*60*1000).toISOString().split('T')[0],
      adults: 1,
      children: 0,
      discount_amount: 0,
      additional_charges: 0,
      tax_percentage: 0,
      paid_amount: 0,
      isWalkIn: true // Flag para identificar que es walk-in
    };
    
    // Agregar a la lista temporal para mostrar la interfaz
    const existingIndex = reservedRooms.value.findIndex(r => r.id === room.id);
    if (existingIndex >= 0) {
      reservedRooms.value[existingIndex] = tempReservation;
    } else {
      reservedRooms.value.unshift(tempReservation);
    }
    return;
  }

  // Si es una habitación reservada, hacer check-in directo
  if (!confirm(`¿Confirmar check-in para la habitación ${room.room_number}?`)) {
    return;
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
    });

    const data = await response.json();

    if (data.success) {
      alert(`Check-in realizado exitosamente para la habitación ${room.room_number}`);
      // Actualizar la lista quitando la habitación
      reservedRooms.value = reservedRooms.value.filter(r => r.id !== room.id);
      
      // Si no quedan habitaciones disponibles, cerrar el modal
      if (reservedRooms.value.length === 0) {
        showQuickCheckinModal.value = false;
      }
    } else {
      alert('Error realizando check-in: ' + data.error);
    }
  } catch (error) {
    console.error('Error performing quick check-in:', error);
    alert('Error al realizar el check-in');
  }
};

const performWalkInCheckin = async () => {
  if (!walkInForm.value.name.trim()) {
    alert('Por favor ingresa el nombre del huésped');
    return;
  }

  if (walkInForm.value.nights < 1) {
    alert('El número de noches debe ser al menos 1');
    return;
  }

  try {
    const response = await fetch(`http://localhost:4000/api/hotel/rooms/${selectedRoom.value.id}/checkin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        checkin_time: new Date().toISOString(),
        guest_info: {
          name: walkInForm.value.name,
          email: walkInForm.value.email,
          phone: walkInForm.value.phone,
          nights: walkInForm.value.nights,
          notes: walkInForm.value.notes
        }
      })
    });

    const data = await response.json();

    if (data.success) {
      alert(`Check-in realizado exitosamente para ${walkInForm.value.name} en habitación ${selectedRoom.value.room_number}`);
      
      // Limpiar formulario y cerrar modales
      closeWalkInForm();
      reservedRooms.value = reservedRooms.value.filter(r => r.id !== selectedRoom.value.id);
      
      if (reservedRooms.value.length === 0) {
        showQuickCheckinModal.value = false;
      }
    } else {
      alert('Error realizando check-in: ' + data.error);
    }
  } catch (error) {
    console.error('Error performing walk-in check-in:', error);
    alert('Error al realizar el check-in');
  }
};

const closeQuickCheckinModal = () => {
  showQuickCheckinModal.value = false;
  reservedRooms.value = [];
  closeWalkInForm();
};

const closeWalkInForm = () => {
  showWalkInForm.value = false;
  selectedRoom.value = null;
  walkInForm.value = {
    name: '',
    email: '',
    phone: '',
    nights: 1,
    notes: ''
  };
};

const closeWalkInInterface = (room) => {
  // Remover la habitación temporal de walk-in de la lista
  reservedRooms.value = reservedRooms.value.filter(r => !(r.id === room.id && r.isWalkIn));
  
  // Si no quedan habitaciones, cerrar el modal
  if (reservedRooms.value.length === 0) {
    showQuickCheckinModal.value = false;
  }
};

// Functions for minimize/maximize
const toggleMinimized = (roomId) => {
  if (minimizedRooms.value.has(roomId)) {
    minimizedRooms.value.delete(roomId);
  } else {
    minimizedRooms.value.add(roomId);
  }
};

const isMinimized = (roomId) => {
  return minimizedRooms.value.has(roomId);
};

// Price calculation functions
const calculateTaxAmount = (room) => {
  const subtotal = (room.price_per_night * calculateNights(room.check_in_date, room.check_out_date)) - (room.discount_amount || 0) + (room.additional_charges || 0);
  return Math.round(subtotal * (room.tax_percentage || 0) / 100);
};

const calculateFinalTotal = (room) => {
  const accommodation = room.price_per_night * calculateNights(room.check_in_date, room.check_out_date);
  const discount = room.discount_amount || 0;
  const additional = room.additional_charges || 0;
  const tax = calculateTaxAmount(room);
  
  return accommodation - discount + additional + tax;
};

const updateTotalAmount = (room) => {
  // Recalcular totales cuando cambian los precios
  const newTotal = calculateFinalTotal(room);
  room.total_amount = newTotal;
};

const applyPercentageDiscount = (room) => {
  const percentage = prompt('Ingrese el porcentaje de descuento (ej: 10 para 10%):');
  if (percentage && !isNaN(percentage)) {
    const accommodationCost = room.price_per_night * calculateNights(room.check_in_date, room.check_out_date);
    room.discount_amount = Math.round(accommodationCost * parseFloat(percentage) / 100);
    updateTotalAmount(room);
  }
};

const showAdditionalChargesModal = (room) => {
  const charges = prompt('Ingrese cargos adicionales (ej: minibar, lavandería, etc.):');
  if (charges && !isNaN(charges)) {
    room.additional_charges = (room.additional_charges || 0) + parseFloat(charges);
    updateTotalAmount(room);
  }
};

const applyPricePreset = (room, preset) => {
  const originalPrice = room.price_per_night;
  
  switch (preset) {
    case 'weekend':
      room.price_per_night = Math.round(originalPrice * 1.20); // +20%
      break;
    case 'weekday':
      room.price_per_night = Math.round(originalPrice * 0.90); // -10%
      break;
    case 'corporate':
      room.price_per_night = Math.round(originalPrice * 0.85); // -15%
      room.discount_amount = 0; // Reset discount
      break;
    case 'vip':
      room.price_per_night = Math.round(originalPrice * 1.30); // +30%
      break;
  }
  
  updateTotalAmount(room);
};

// Helper function to calculate nights between dates
const calculateNights = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 1;
  
  const startDate = new Date(checkIn);
  const endDate = new Date(checkOut);
  const timeDiff = endDate.getTime() - startDate.getTime();
  const nights = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  
  return nights > 0 ? nights : 1;
};

// Process check-in for both reserved and walk-in guests
const processCheckIn = async (room) => {
  // Validar datos si es walk-in
  if (room.isWalkIn) {
    if (!room.guest_name || room.guest_name.trim() === '' || room.guest_name === 'Walk-in Guest') {
      alert('Por favor ingresa el nombre del huésped');
      return;
    }
  }

  const nights = calculateNights(room.check_in_date, room.check_out_date);
  
  if (!confirm(`¿Confirmar check-in para la habitación ${room.room_number}?\nHuésped: ${room.guest_name}\nNoches: ${nights}\nTotal: COP ${Number(room.price_per_night * nights).toLocaleString()}.00`)) {
    return;
  }

  try {
    const requestBody = {
      checkin_time: new Date().toISOString()
    };

    // Si es walk-in, agregar información del huésped
    if (room.isWalkIn) {
      requestBody.guest_info = {
        name: room.guest_name,
        email: room.guest_email || '',
        phone: room.guest_phone || '',
        nights: nights,
        notes: `Walk-in guest - Check-in directo del ${new Date().toLocaleDateString('es-ES')}`
      };
    }

    const response = await fetch(`http://localhost:4000/api/hotel/rooms/${room.id}/checkin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (data.success) {
      alert(`Check-in realizado exitosamente para ${room.guest_name} en habitación ${room.room_number}`);
      
      // Remover de la lista y cerrar modal si no quedan más
      reservedRooms.value = reservedRooms.value.filter(r => r.id !== room.id);
      
      if (reservedRooms.value.length === 0) {
        showQuickCheckinModal.value = false;
      }
    } else {
      alert('Error realizando check-in: ' + data.error);
    }
  } catch (error) {
    console.error('Error performing check-in:', error);
    alert('Error al realizar el check-in');
  }
};
</script>

<style scoped>
/* Animaciones para minimizar/expandir */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease-in-out;
  max-height: 1000px;
  overflow: hidden;
}

.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}

.slide-down-enter-to,
.slide-down-leave-from {
  max-height: 1000px;
  opacity: 1;
  transform: translateY(0);
}

/* Estilos adicionales para los botones de minimizar */
.minimize-button:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

/* Mejora visual para las tarjetas minimizadas */
.minimized-card {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Estilos para campos de precios editables */
input[type="number"]:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Indicadores visuales para diferentes tipos de campos */
.price-field {
  transition: all 0.2s ease;
}

.price-field:hover {
  transform: scale(1.02);
}

/* Colores para diferentes tipos de cargos */
.accommodation-field { background-color: #fef3c7; }
.discount-field { background-color: #fee2e2; }
.additional-field { background-color: #dbeafe; }
.tax-field { background-color: #f3f4f6; }
</style>