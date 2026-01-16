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
            <!-- Date and Time Display -->
            <div class="text-right bg-blue-50 px-4 py-2 rounded-lg border">
              <p class="text-blue-900 font-medium text-sm">📅 {{ currentDateTime }}</p>
            </div>
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
          @click="stat.title === 'Ingresos del Mes' ? handleStatClick(stat.title) : null"
          :class="stat.title === 'Ingresos del Mes' ? 'cursor-pointer hover:shadow-lg transition-all' : ''"
          class="bg-white p-6 rounded-xl shadow-sm border"
        >
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <p class="text-gray-600 text-sm font-medium">{{ stat.title }}</p>
              <p class="text-2xl font-bold text-gray-900 mt-1">{{ stat.value }}</p>
            </div>
            <div :class="stat.iconBg" class="p-3 rounded-lg">
              <i :class="stat.icon" class="text-white text-xl"></i>
            </div>
          </div>
          <div class="mt-4 flex items-center justify-between">
            <div class="flex items-center">
              <span :class="stat.changeClass" class="text-sm font-medium">
                {{ stat.change }}
              </span>
              <span class="text-gray-600 text-sm ml-2">estado actual</span>
            </div>
            <!-- Botón de descarga para Ingresos del Mes -->
            <button 
              v-if="stat.title === 'Ingresos del Mes'"
              @click.stop="downloadMonthlyIncomeExcel"
              class="ml-2 p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Descargar como Excel"
            >
              <i class="fas fa-download text-lg"></i>
            </button>
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
                  <div class="flex items-center gap-2">
                    <h4 class="font-semibold text-gray-900">{{ booking.guest }}</h4>
                    <span v-if="booking.isCompanyBooking" class="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded font-semibold">
                      <i class="fas fa-building mr-1"></i>{{ booking.company }}
                    </span>
                  </div>
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
                            <span class="font-medium min-w-[80px] text-right">= {{ Number(room.price_per_night * calculateNights(room.check_in_date, room.check_out_date)).toLocaleString() }}</span>
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
                          <span class="font-medium">COP {{ Number(room.price_per_night * calculateNights(room.check_in_date, room.check_out_date)).toLocaleString() }}</span>
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
                          <span class="font-semibold">COP {{ Number(room.price_per_night * calculateNights(room.check_in_date, room.check_out_date)).toLocaleString() }}</span>
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
              v-for="(room, index) in reservedRooms.filter(r => r.current_status === 'available')" 
              :key="room.id"
              class="border border-green-200 rounded-lg p-4 hover:bg-green-50 transition-colors bg-green-25"
            >
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <div class="flex items-center mb-2">
                    <h4 class="text-lg font-semibold text-gray-900">
                      Habitación {{ room.room_number || (index < 9 ? (101 + index) : (201 + (index - 9))) }}
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
                      <span class="ml-1 text-green-600 font-medium">COP {{ Number(room.price_per_night).toLocaleString() }}</span>
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
              <span class="font-medium">COP {{ Number(selectedRoom.price_per_night).toLocaleString() }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span>Noches:</span>
              <span class="font-medium">{{ walkInForm.nights }}</span>
            </div>
            <hr class="my-2">
            <div class="flex justify-between font-semibold text-green-600">
              <span>Total:</span>
              <span>COP {{ (Number(selectedRoom.price_per_night) * walkInForm.nights).toLocaleString() }}</span>
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

  <!-- Company Checkin Component -->
  <CompanyCheckin
    :showCompanyCheckinModal="showCompanyCheckinModal"
    :availableRooms="companyAvailableRooms"
    @close="showCompanyCheckinModal = false"
    @submit="handleCompanyCheckinSubmit"
  />

  <!-- Monthly Income Modal -->
  <div v-if="showMonthlyIncomeModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <div class="p-8">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center">
            <div class="bg-purple-100 p-3 rounded-lg mr-4">
              <i class="fas fa-dollar-sign text-2xl text-purple-600"></i>
            </div>
            <div>
              <h3 class="text-2xl font-bold text-gray-900">Ingresos del Mes</h3>
              <p class="text-gray-600">{{ monthlyIncomeData.month }} - {{ monthlyIncomeData.year }}</p>
            </div>
          </div>
          <button 
            @click="showMonthlyIncomeModal = false"
            class="text-gray-500 hover:text-gray-700 text-2xl"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Filter Section -->
        <div class="bg-gray-50 rounded-lg p-4 mb-6 border">
          <div class="flex flex-col gap-4">
            <div class="flex items-center gap-4 flex-wrap">
              <label class="text-sm font-medium text-gray-700">Filtrar por:</label>
              <button 
                @click="incomeFilterType = 'month'"
                :class="incomeFilterType === 'month' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'"
                class="px-3 py-2 rounded-lg font-medium transition-colors text-sm"
              >
                <i class="fas fa-calendar-alt mr-1"></i>Mes Completo
              </button>
              <button 
                @click="incomeFilterType = 'week'"
                :class="incomeFilterType === 'week' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'"
                class="px-3 py-2 rounded-lg font-medium transition-colors text-sm"
              >
                <i class="fas fa-calendar-week mr-1"></i>Semana
              </button>
              <button 
                @click="incomeFilterType = 'day'"
                :class="incomeFilterType === 'day' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'"
                class="px-3 py-2 rounded-lg font-medium transition-colors text-sm"
              >
                <i class="fas fa-calendar-day mr-1"></i>Día
              </button>
              <button 
                @click="incomeFilterType = 'range'"
                :class="incomeFilterType === 'range' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'"
                class="px-3 py-2 rounded-lg font-medium transition-colors text-sm"
              >
                <i class="fas fa-calendar-day mr-1"></i>Rango
              </button>
              <button 
                @click="incomeFilterType = 'select-month'"
                :class="incomeFilterType === 'select-month' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'"
                class="px-3 py-2 rounded-lg font-medium transition-colors text-sm"
              >
                <i class="fas fa-calendar mr-1"></i>Mes
              </button>
            </div>

            <!-- Date picker for specific day -->
            <div v-if="incomeFilterType === 'day'" class="flex gap-2 items-end">
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">Seleccionar día:</label>
                <input 
                  v-model="incomeSelectedDate"
                  @change="applyIncomeFilter"
                  type="date"
                  class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            <!-- Week selector -->
            <div v-if="incomeFilterType === 'week'" class="flex gap-2 items-end">
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">Semana:</label>
                <select 
                  v-model="incomeSelectedWeek"
                  @change="applyIncomeFilter"
                  class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="">Seleccionar semana...</option>
                  <option v-for="(week, index) in incomeWeeksOfMonth" :key="index" :value="index">
                    {{ week.label }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Date range picker -->
            <div v-if="incomeFilterType === 'range'" class="flex gap-2 items-end flex-wrap">
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">Desde:</label>
                <input 
                  v-model="incomeRangeStart"
                  type="date"
                  class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">Hasta:</label>
                <input 
                  v-model="incomeRangeEnd"
                  type="date"
                  class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <button 
                  @click="applyIncomeFilter"
                  class="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                >
                  <i class="fas fa-search mr-1"></i>Filtrar
                </button>
              </div>
            </div>

            <!-- Month selector -->
            <div v-if="incomeFilterType === 'select-month'" class="flex gap-2 items-end flex-wrap">
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">Seleccionar mes:</label>
                <select 
                  v-model="incomeSelectedMonth"
                  @change="applyIncomeFilter"
                  class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="">Seleccionar...</option>
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
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">Año:</label>
                <select 
                  v-model="incomeSelectedYear"
                  @change="applyIncomeFilter"
                  class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="">Seleccionar...</option>
                  <option value="2020">2020</option>
                  <option value="2021">2021</option>
                  <option value="2022">2022</option>
                  <option value="2023">2023</option>
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                  <option value="2028">2028</option>
                  <option value="2029">2029</option>
                  <option value="2030">2030</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Summary Card -->
        <div class="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-8 mb-8 border border-purple-200">
          <div class="text-center">
            <p class="text-gray-600 text-sm font-medium mb-2">TOTAL INGRESOS DEL MES</p>
            <p class="text-5xl font-bold text-purple-600 mb-4">
              {{ new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(monthlyIncomeData.total_income) }}
            </p>
          </div>
        </div>

        <!-- Breakdown -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <!-- Check-out Income -->
          <div class="border border-green-200 rounded-lg p-6 bg-green-50">
            <div class="flex items-center mb-4">
              <div class="bg-green-100 p-3 rounded-lg mr-3">
                <i class="fas fa-sign-out-alt text-green-600 text-lg"></i>
              </div>
              <h4 class="text-lg font-semibold text-gray-900">Ingresos por Check-out</h4>
            </div>
            <p class="text-sm text-gray-600 mb-2">
              <span class="font-semibold">{{ monthlyIncomeData.checkout_count }}</span> transacciones
            </p>
            <p class="text-2xl font-bold text-green-600">
              {{ new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(monthlyIncomeData.checkout_income) }}
            </p>
          </div>

          <!-- Handover Income -->
          <div class="border border-blue-200 rounded-lg p-6 bg-blue-50">
            <div class="flex items-center mb-4">
              <div class="bg-blue-100 p-3 rounded-lg mr-3">
                <i class="fas fa-handshake text-blue-600 text-lg"></i>
              </div>
              <h4 class="text-lg font-semibold text-gray-900">Ingresos por Entregas</h4>
            </div>
            <p class="text-sm text-gray-600 mb-2">
              <span class="font-semibold">{{ monthlyIncomeData.handover_count }}</span> entregas
            </p>
            <p class="text-2xl font-bold text-blue-600">
              {{ new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(monthlyIncomeData.handover_income) }}
            </p>
          </div>
        </div>

        <!-- Tabs for Details -->
        <div class="mb-8">
          <div class="flex gap-4 border-b border-gray-200 mb-6 overflow-x-auto">
            <button 
              @click="incomeTab = 'all'"
              :class="incomeTab === 'all' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600 hover:text-gray-900'"
              class="pb-4 font-semibold transition-colors whitespace-nowrap"
            >
              <i class="fas fa-list mr-2"></i>Todas
            </button>
            <button 
              @click="incomeTab = 'checkout'"
              :class="incomeTab === 'checkout' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-600 hover:text-gray-900'"
              class="pb-4 font-semibold transition-colors whitespace-nowrap"
            >
              <i class="fas fa-sign-out-alt mr-2"></i>Check-outs
            </button>
            <button 
              @click="incomeTab = 'handover'"
              :class="incomeTab === 'handover' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'"
              class="pb-4 font-semibold transition-colors whitespace-nowrap"
            >
              <i class="fas fa-handshake mr-2"></i>Entregas
            </button>
            <button 
              @click="incomeTab = 'details'"
              :class="incomeTab === 'details' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-600 hover:text-gray-900'"
              class="pb-4 font-semibold transition-colors whitespace-nowrap"
            >
              <i class="fas fa-user mr-2"></i>Detalles Completos
            </button>
          </div>

          <!-- Loading State -->
          <div v-if="loadingIncomeDetails" class="flex items-center justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <span class="ml-2 text-gray-600">Cargando detalles...</span>
          </div>

          <!-- Detalles Completos - Nueva pestaña -->
          <div v-else-if="incomeTab === 'details'" class="space-y-4 max-h-96 overflow-y-auto">
            <div v-if="allIncomeItems.length === 0" class="text-center py-8 text-gray-500">
              No hay transacciones en este período
            </div>
            <div v-for="(item, index) in allIncomeItems" :key="`details-${index}`" class="border rounded-lg p-6 hover:shadow-md transition-all" :class="item.type === 'checkout' ? 'border-green-300 bg-green-50' : 'border-blue-300 bg-blue-50'">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <!-- Guest/Employee Info -->
                <div>
                  <p class="text-xs font-semibold text-gray-600 uppercase mb-1">{{ item.type === 'checkout' ? 'Huésped' : 'Empleado' }}</p>
                  <p class="text-lg font-bold text-gray-900">{{ item.type === 'checkout' ? item.guest_name : (item.employee_name || 'No especificado') }}</p>
                  <p class="text-sm text-gray-600 mt-1">{{ item.type === 'checkout' ? `Hab. ${item.room_number}` : 'Entrega de Turno' }}</p>
                </div>

                <!-- Amount -->
                <div>
                  <p class="text-xs font-semibold text-gray-600 uppercase mb-1">Monto</p>
                  <p class="text-2xl font-bold" :class="item.type === 'checkout' ? 'text-green-600' : 'text-blue-600'">
                    {{ new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(parseFloat(item.amount) || 0) }}
                  </p>
                </div>

                <!-- Date Info -->
                <div>
                  <p class="text-xs font-semibold text-gray-600 uppercase mb-1">Fecha</p>
                  <p class="text-lg font-semibold text-gray-900">{{ item.displayDate }}</p>
                  <p v-if="item.type === 'checkout'" class="text-sm text-gray-600 mt-1">
                    {{ new Date(item.check_in_date).toLocaleDateString('es-ES') }} - {{ new Date(item.check_out_date).toLocaleDateString('es-ES') }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Todas las transacciones -->
          <div v-else-if="incomeTab === 'all'" class="space-y-3 max-h-96 overflow-y-auto">
            <div v-if="allIncomeItems.length === 0" class="text-center py-8 text-gray-500">
              No hay transacciones en este período
            </div>
            <div v-for="(item, index) in allIncomeItems" :key="`all-${index}`" class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <div class="flex-shrink-0 w-10 h-10 rounded-full" :class="item.type === 'checkout' ? 'bg-green-100' : 'bg-blue-100'">
                    <i :class="item.type === 'checkout' ? 'fas fa-sign-out-alt text-green-600' : 'fas fa-handshake text-blue-600'" class="flex items-center justify-center w-full h-full"></i>
                  </div>
                  <div>
                    <p class="font-semibold text-gray-900">{{ item.description }}</p>
                    <p class="text-sm text-gray-600">{{ item.displayDate }}</p>
                  </div>
                </div>
                <span class="text-lg font-bold text-gray-900">
                  {{ new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(parseFloat(item.amount) || 0) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Check-outs -->
          <div v-else-if="incomeTab === 'checkout'" class="space-y-3 max-h-96 overflow-y-auto">
            <div v-if="checkoutIncomeItems.length === 0" class="text-center py-8 text-gray-500">
              No hay check-outs en este período
            </div>
            <div v-for="(item, index) in checkoutIncomeItems" :key="`checkout-${index}`" class="border border-green-200 rounded-lg p-4 bg-green-50 hover:bg-green-100 transition-colors">
              <div class="flex items-center justify-between mb-2">
                <div>
                  <p class="font-semibold text-gray-900">Habitación {{ item.room_number }}</p>
                  <p class="text-sm text-gray-600">Huésped: {{ item.guest_name }}</p>
                </div>
                <span class="text-lg font-bold text-green-600">
                  {{ new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(parseFloat(item.amount) || 0) }}
                </span>
              </div>
              <div class="text-xs text-gray-600 flex gap-4">
                <span><strong>Entrada:</strong> {{ new Date(item.check_in_date).toLocaleDateString('es-ES') }}</span>
                <span><strong>Salida:</strong> {{ new Date(item.check_out_date).toLocaleDateString('es-ES') }}</span>
              </div>
            </div>
          </div>

          <!-- Handovers -->
          <div v-else-if="incomeTab === 'handover'" class="space-y-3 max-h-96 overflow-y-auto">
            <div v-if="handoverIncomeItems.length === 0" class="text-center py-8 text-gray-500">
              No hay entregas en este período
            </div>
            <div v-for="(item, index) in handoverIncomeItems" :key="`handover-${index}`" class="border border-blue-200 rounded-lg p-4 bg-blue-50 hover:bg-blue-100 transition-colors">
              <div class="flex items-center justify-between mb-2">
                <div>
                  <p class="font-semibold text-gray-900">Entrega de Turno</p>
                  <p class="text-sm text-gray-600">Empleado: {{ item.employee_name || 'No especificado' }}</p>
                </div>
                <span class="text-lg font-bold text-blue-600">
                  {{ new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(item.amount) }}
                </span>
              </div>
              <div class="text-xs text-gray-600">
                <span><strong>Fecha:</strong> {{ new Date(item.created_at).toLocaleDateString('es-ES') }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Detailed Information -->
        <div class="bg-gray-50 rounded-lg p-6 mb-8">
          <h4 class="font-semibold text-gray-900 mb-4">Información Detallada</h4>
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-gray-600">Mes:</span>
              <span class="font-semibold text-gray-900">{{ monthlyIncomeData.month }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-600">Año:</span>
              <span class="font-semibold text-gray-900">{{ monthlyIncomeData.year }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-600">Total de Transacciones:</span>
              <span class="font-semibold text-gray-900">{{ monthlyIncomeData.checkout_count + monthlyIncomeData.handover_count }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-600">Fecha de Generación:</span>
              <span class="font-semibold text-gray-900">{{ new Date().toLocaleDateString('es-ES') }}</span>
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <p class="text-sm text-blue-900">
            <i class="fas fa-info-circle mr-2"></i>
            <strong>Nota:</strong> Este reporte incluye todas las transacciones completadas. Se excluyen contratos corporativos.
          </p>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-4">
          <button
            @click="downloadMonthlyIncomeExcel"
            class="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center"
          >
            <i class="fas fa-download mr-2"></i>
            Descargar Excel
          </button>
          <button
            @click="showMonthlyIncomeModal = false"
            class="flex-1 bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Success Modal for Check-in -->
  <div v-if="showSuccessCheckinModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-8 transform transition-all animate-bounce">
      <!-- Success Icon -->
      <div class="flex items-center justify-center mb-6">
        <div class="bg-green-100 p-4 rounded-full">
          <i class="fas fa-check-circle text-5xl text-green-600"></i>
        </div>
      </div>

      <!-- Title -->
      <h3 class="text-2xl font-bold text-center text-gray-900 mb-4">¡Éxito!</h3>

      <!-- Message -->
      <p class="text-center text-gray-700 mb-8">{{ successMessage }}</p>

      <!-- Button -->
      <button
        @click="showSuccessCheckinModal = false"
        class="w-full px-4 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
      >
        <i class="fas fa-check mr-2"></i>Aceptar
      </button>
    </div>
  </div>

  <!-- Confirmation Modal for Check-in -->
  <div v-if="showConfirmCheckinModal && pendingCheckInRoom" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-8 transform transition-all">
      <!-- Header with Icon -->
      <div class="flex items-center justify-center mb-6">
        <div class="bg-blue-100 p-4 rounded-full">
          <i class="fas fa-check-circle text-3xl text-blue-600"></i>
        </div>
      </div>

      <!-- Title -->
      <h3 class="text-2xl font-bold text-center text-gray-900 mb-4">Confirmar Check-in</h3>

      <!-- Details -->
      <div class="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
        <div class="flex justify-between items-center">
          <span class="text-gray-600">Habitación:</span>
          <span class="font-semibold text-gray-900">{{ pendingCheckInRoom.room_number }}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-gray-600">Huésped:</span>
          <span class="font-semibold text-gray-900">{{ pendingCheckInRoom.guest_name }}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-gray-600">Noches:</span>
          <span class="font-semibold text-gray-900">{{ calculateNights(pendingCheckInRoom.check_in_date, pendingCheckInRoom.check_out_date) }}</span>
        </div>
        <div class="border-t pt-3 flex justify-between items-center">
          <span class="text-gray-700 font-medium">Total:</span>
          <span class="text-xl font-bold text-green-600">COP {{ Number(pendingCheckInRoom.price_per_night * calculateNights(pendingCheckInRoom.check_in_date, pendingCheckInRoom.check_out_date)).toLocaleString() }}</span>
        </div>
      </div>

      <!-- Message -->
      <p class="text-center text-gray-600 mb-6">¿Deseas confirmar el check-in de este huésped?</p>

      <!-- Buttons -->
      <div class="flex gap-3">
        <button
          @click="cancelCheckIn"
          class="flex-1 px-4 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
        >
          <i class="fas fa-times mr-2"></i>Cancelar
        </button>
        <button
          @click="confirmCheckIn"
          class="flex-1 px-4 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
        >
          <i class="fas fa-check mr-2"></i>Confirmar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import * as XLSX from 'xlsx';
import ShiftHandoverFinancial from './ShiftHandoverFinancial.vue';
import CompanyCheckin from './CompanyCheckin.vue';

// User authentication state
const currentUser = ref({
  name: 'Admin',
  position: 'admin',
  email: ''
});

// Current date and time
const currentDateTime = ref('');
let timeInterval: NodeJS.Timeout | null = null;
let dataInterval: NodeJS.Timeout | null = null;

// Update current date and time
const updateDateTime = () => {
  const now = new Date();
  currentDateTime.value = now.toLocaleString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

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
    
    // Cargar ingresos del mes
    await loadMonthlyIncome();
    
    // Cargar reservas de hoy
    await loadTodaysBookings();
    
    // Cargar últimas 3 reservas recientes
    await loadRecentBookings();
    
    // Iniciar actualización de fecha y hora
    updateDateTime();
    timeInterval = setInterval(updateDateTime, 1000);
    
    // Actualizar datos cada 5 minutos
    dataInterval = setInterval(async () => {
      await loadOccupancyData();
      await loadMonthlyIncome();
      await loadTodaysBookings();
      await loadRecentBookings();
    }, 5 * 60 * 1000); // 5 minutos
    
    // Limpiar intervalos cuando el componente se desmonte
    return () => {
      clearInterval(dataInterval);
    };
  } catch (error) {
    console.error('Error parsing user data:', error);
    window.location.href = '/login';
  }
});

// Cleanup interval on unmount
onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval);
  }
  if (dataInterval) {
    clearInterval(dataInterval);
  }
});

// Load occupancy data
const loadOccupancyData = async () => {
  try {
    const response = await fetch('/api/hotel/rooms');
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

// Load monthly income data
const monthlyIncomeData = ref({
  total_income: 0,
  handover_income: 0,
  checkout_income: 0,
  handover_count: 0,
  checkout_count: 0,
  month: '',
  year: new Date().getFullYear()
});

const showMonthlyIncomeModal = ref(false);
const incomeTab = ref('all');
const loadingIncomeDetails = ref(false);
const allIncomeItems = ref([]);
const handoverIncomeItems = ref([]);
const checkoutIncomeItems = ref([]);

// Filter variables
const incomeFilterType = ref('month');
const incomeSelectedDate = ref('');
const incomeSelectedWeek = ref('');
const incomeRangeStart = ref('');
const incomeRangeEnd = ref('');
const incomeSelectedMonth = ref('');
const incomeSelectedYear = ref('');
const incomeWeeksOfMonth = ref([]);
const fullMonthAllIncomeItems = ref([]);
const fullMonthCheckoutItems = ref([]);
const fullMonthHandoverItems = ref([]);

const handleStatClick = (statTitle) => {
  console.log('Stat clicked:', statTitle);
  if (statTitle === 'Ingresos del Mes') {
    showMonthlyIncomeModal.value = true;
    loadMonthlyIncomeDetails();
  }
};

const loadMonthlyIncome = async () => {
  try {
    const response = await fetch('/api/handovers/monthly-income');
    const data = await response.json();
    
    if (data.success && data.data) {
      monthlyIncomeData.value = data.data;
      
      const incomeStat = stats.value.find(stat => stat.title === 'Ingresos del Mes');
      if (incomeStat) {
        // Formatear el monto en pesos colombianos
        const formattedAmount = new Intl.NumberFormat('es-CO', {
          style: 'currency',
          currency: 'COP',
          minimumFractionDigits: 0
        }).format(data.data.total_income);
        
        incomeStat.value = formattedAmount;
        incomeStat.change = `${data.data.handover_count} entregas • ${data.data.month}`;
      }
    }
  } catch (error) {
    console.error('Error loading monthly income:', error);
  }
};

// Load detailed monthly income items
const loadMonthlyIncomeDetails = async () => {
  loadingIncomeDetails.value = true;
  console.log('📥 Iniciando carga de detalles de ingresos...');
  try {
    // Cargar todos los datos sin filtro de fecha para permitir filtrado posterior
    const checkoutResponse = await fetch('/api/bookings');
    const handoverResponse = await fetch('/api/handovers');
    
    const checkoutData = await checkoutResponse.json();
    const handoverData = await handoverResponse.json();
    
    console.log('📊 Respuesta de checkouts:', checkoutData);
    console.log('📊 Respuesta de handovers:', handoverData);
    
    // Procesar checkouts - incluir checked_in y checked_out
    const allCheckouts = (checkoutData.bookings || [])
      .filter(b => b.status === 'checked_out' || b.status === 'checked_in')
      .map(item => ({
        ...item,
        amount: parseFloat(item.total_amount || 0)
      }));
      
    // Procesar handovers
    const allHandovers = (handoverData.handovers || [])
      .filter(h => h.status === 'completed')
      .map(item => ({
        ...item,
        amount: parseFloat(item.total_income || 0)
      }));
    
    console.log('✅ Check-outs procesados:', allCheckouts.length);
    console.log('✅ Entregas procesadas:', allHandovers.length);
    
    // Combinar todos y ordenar por fecha más reciente
    allIncomeItems.value = [
      ...allCheckouts.map(item => ({
        ...item,
        type: 'checkout',
        isCompanyReservation: item.payment_type === 'company_contract',
        description: item.payment_type === 'company_contract' 
          ? `Reserva Empresa - Hab. ${item.room_number} - ${item.guest_name}`
          : `Check-out - Hab. ${item.room_number} - ${item.guest_name}`,
        displayDate: new Date(item.check_out_date).toLocaleDateString('es-ES'),
        sortDate: new Date(item.check_out_date)
      })),
      ...allHandovers.map(item => ({
        ...item,
        type: 'handover',
        description: `Entrega de Turno - ${item.employee_name || 'Sin empleado'}`,
        displayDate: new Date(item.created_at || item.shift_date).toLocaleDateString('es-ES'),
        sortDate: new Date(item.created_at || item.shift_date)
      }))
    ].sort((a, b) => b.sortDate - a.sortDate);
    
    // Guardar datos completos para filtrado
    fullMonthAllIncomeItems.value = [...allIncomeItems.value];
    fullMonthCheckoutItems.value = [...allCheckouts];
    fullMonthHandoverItems.value = [...allHandovers];
    
    console.log(`✅ Datos almacenados. Total items: ${fullMonthAllIncomeItems.value.length}, Checkouts: ${allCheckouts.length}, Handovers: ${allHandovers.length}`);
    
    // Inicializar semanas con mes actual
    incomeWeeksOfMonth.value = getIncomeWeeksOfMonth();
    console.log(`📅 Semanas del mes: ${incomeWeeksOfMonth.value.length}`);
    
    // Solo resetear filtros si es necesario, preservar select-month
    if (incomeFilterType.value === '') {
      incomeFilterType.value = 'month';
      incomeSelectedDate.value = '';
      incomeSelectedWeek.value = '';
    } else if (incomeFilterType.value === 'month') {
      incomeSelectedDate.value = '';
      incomeSelectedWeek.value = '';
      incomeSelectedMonth.value = '';
      incomeSelectedYear.value = '';
    } else if (incomeFilterType.value === 'day') {
      incomeSelectedWeek.value = '';
      // Preservar month y year si estaban seteados
    } else if (incomeFilterType.value === 'week') {
      incomeSelectedDate.value = '';
      // Preservar month y year si estaban seteados
    } else if (incomeFilterType.value === 'range') {
      incomeSelectedDate.value = '';
      incomeSelectedWeek.value = '';
      // Preservar month y year si estaban seteados
    }
    // Para 'select-month', SIEMPRE preservar los valores de mes y año
    
    // Aplicar filtro
    console.log(`🔄 Reaplicando filtro. Tipo: ${incomeFilterType.value}, Mes: ${incomeSelectedMonth.value}, Año: ${incomeSelectedYear.value}`);
    applyIncomeFilter();
    
    console.log('Detalles de ingresos cargados:', {
      checkouts: allCheckouts.length,
      handovers: allHandovers.length,
      total: allIncomeItems.value.length
    });
  } catch (error) {
    console.error('Error loading monthly income details:', error);
    allIncomeItems.value = [];
    checkoutIncomeItems.value = [];
    handoverIncomeItems.value = [];
  } finally {
    loadingIncomeDetails.value = false;
  }
};

// Función para obtener las semanas del mes actual
const getIncomeWeeksOfMonth = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  const weeks = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  let currentDate = new Date(firstDay);
  let weekNumber = 0;
  
  while (currentDate <= lastDay) {
    const weekStart = new Date(currentDate);
    const weekEnd = new Date(currentDate);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    if (weekEnd > lastDay) {
      weekEnd.setDate(lastDay.getDate());
    }
    
    const startStr = weekStart.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
    const endStr = weekEnd.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
    
    weeks.push({
      index: weekNumber,
      label: `Semana ${weekNumber + 1}: ${startStr} - ${endStr}`,
      start: new Date(weekStart),
      end: new Date(weekEnd)
    });
    
    currentDate.setDate(currentDate.getDate() + 7);
    weekNumber++;
  }
  
  return weeks;
};

// Aplicar filtro de ingresos
const applyIncomeFilter = () => {
  let filtered = [];
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  // Base: siempre filtramos por mes actual primero, excepto cuando es 'select-month'
  if (incomeFilterType.value === 'select-month') {
    // Este filtro permite seleccionar cualquier mes/año
    if (incomeSelectedMonth.value && incomeSelectedYear.value) {
      const selectedMonth = parseInt(incomeSelectedMonth.value) - 1;
      const selectedYear = parseInt(incomeSelectedYear.value);
      
      console.log(`🔍 Filtrando por mes seleccionado: ${incomeSelectedMonth.value}/${incomeSelectedYear.value} (index: ${selectedMonth}/${selectedYear})`);
      console.log(`📊 Total items en fullMonthAllIncomeItems: ${fullMonthAllIncomeItems.value.length}`);
      
      filtered = fullMonthAllIncomeItems.value.filter(item => {
        const itemDate = item.sortDate;
        const matches = itemDate.getMonth() === selectedMonth && itemDate.getFullYear() === selectedYear;
        if (matches) {
          console.log(`✅ Item incluido: ${item.displayDate} - ${item.description}`);
        }
        return matches;
      });
      
      console.log(`📍 Items filtrados para ${incomeSelectedMonth.value}/${incomeSelectedYear.value}: ${filtered.length}`);
    }
  } else {
    // Para todos los demás filtros, primero filtramos por mes actual
    const currentMonthItems = fullMonthAllIncomeItems.value.filter(item => {
      const itemDate = item.sortDate;
      return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
    });
    
    // Luego aplicamos el filtro específico
    if (incomeFilterType.value === 'month') {
      filtered = [...currentMonthItems];
    } else if (incomeFilterType.value === 'day' && incomeSelectedDate.value) {
      const targetDate = new Date(incomeSelectedDate.value);
      const targetDateStr = targetDate.toISOString().split('T')[0];
      
      filtered = currentMonthItems.filter(item => {
        const itemDate = item.sortDate.toISOString().split('T')[0];
        return itemDate === targetDateStr;
      });
    } else if (incomeFilterType.value === 'week' && incomeSelectedWeek.value !== '') {
      const week = incomeWeeksOfMonth.value[parseInt(incomeSelectedWeek.value)];
      if (week) {
        filtered = currentMonthItems.filter(item => {
          const itemDate = item.sortDate;
          return itemDate >= week.start && itemDate <= week.end;
        });
      }
    } else if (incomeFilterType.value === 'range' && incomeRangeStart.value && incomeRangeEnd.value) {
      const startDate = new Date(incomeRangeStart.value);
      const endDate = new Date(incomeRangeEnd.value);
      
      if (startDate <= endDate) {
        filtered = currentMonthItems.filter(item => {
          const itemDate = item.sortDate;
          return itemDate >= startDate && itemDate <= endDate;
        });
      } else {
        alert('La fecha inicio no puede ser mayor que la fecha fin');
        return;
      }
    } else {
      filtered = [...currentMonthItems];
    }
  }
  
  // Actualizar items visibles
  allIncomeItems.value = filtered;
  
  // Recalcular totales
  const checkouts = filtered.filter(item => item.type === 'checkout');
  const handovers = filtered.filter(item => item.type === 'handover');
  
  checkoutIncomeItems.value = checkouts;
  handoverIncomeItems.value = handovers;
  
  const totalCheckout = checkouts.reduce((sum, item) => sum + (item.amount || 0), 0);
  const totalHandover = handovers.reduce((sum, item) => sum + (item.amount || 0), 0);
  
  console.log(`💾 Datos para el Excel - Checkouts: ${checkouts.length}, Handovers: ${handovers.length}, Total: ${totalCheckout + totalHandover}`);
  
  monthlyIncomeData.value.checkout_income = totalCheckout;
  monthlyIncomeData.value.handover_income = totalHandover;
  monthlyIncomeData.value.total_income = totalCheckout + totalHandover;
  monthlyIncomeData.value.checkout_count = checkouts.length;
  monthlyIncomeData.value.handover_count = handovers.length;
};

// Watcher para cambiar el tipo de filtro
watch(() => incomeFilterType.value, () => {
  console.log(`🔄 Tipo de filtro cambiado a: ${incomeFilterType.value}`);
  // Resetear selecciones cuando cambia el tipo de filtro
  if (incomeFilterType.value === 'month') {
    incomeSelectedDate.value = '';
    incomeSelectedWeek.value = '';
    incomeRangeStart.value = '';
    incomeRangeEnd.value = '';
    incomeSelectedMonth.value = '';
    incomeSelectedYear.value = '';
  }
  applyIncomeFilter();
});

// Watcher para cambios en mes/año seleccionado
watch([() => incomeSelectedMonth.value, () => incomeSelectedYear.value], () => {
  if (incomeFilterType.value === 'select-month') {
    console.log(`🔄 Mes/Año cambiado: ${incomeSelectedMonth.value}/${incomeSelectedYear.value}`);
    applyIncomeFilter();
  }
});

// Watcher para cambios en otras selecciones de filtro
watch([() => incomeSelectedDate.value, () => incomeSelectedWeek.value, () => incomeRangeStart.value, () => incomeRangeEnd.value], () => {
  if (incomeFilterType.value !== 'select-month') {
    console.log(`🔄 Filtro seleccionado cambiado`);
    applyIncomeFilter();
  }
});

// Load today's bookings
const loadTodaysBookings = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const response = await fetch(`http://localhost:4000/api/bookings/by-date/${today}`);
    const data = await response.json();
    
    if (data.success && data.bookings) {
      const bookingsStat = stats.value.find(stat => stat.title === 'Reservas de Hoy');
      if (bookingsStat) {
        bookingsStat.value = data.bookings.length.toString();
        bookingsStat.change = `${data.bookings.length} huéspedes esperados`;
      }
    }
  } catch (error) {
    console.error('Error loading today\'s bookings:', error);
  }
};

// Load recent bookings (últimas 5 reservas sin importar la fecha)
const loadRecentBookings = async () => {
  try {
    const response = await fetch('/api/bookings');
    const data = await response.json();
    
    if (data.success && Array.isArray(data.bookings)) {
      // Ordenar por check_in_date descendente y tomar las últimas 5
      const sortedBookings = data.bookings
        .sort((a, b) => new Date(b.check_in_date) - new Date(a.check_in_date))
        .slice(0, 5);
      
      recentBookings.value = sortedBookings.map(booking => ({
        id: booking.id,
        guest: booking.guest_name,
        company: booking.company_name || null,
        room: booking.room_number,
        dates: `${new Date(booking.check_in_date).toLocaleDateString('es-ES')} - ${new Date(booking.check_out_date).toLocaleDateString('es-ES')}`,
        status: booking.status === 'confirmed' ? 'Confirmada' : booking.status === 'checked_in' ? 'Check-in' : booking.status === 'checked_out' ? 'Realizado' : 'Pendiente',
        statusClass: booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                    booking.status === 'checked_in' ? 'bg-blue-100 text-blue-800' : 
                    booking.status === 'checked_out' ? 'bg-purple-100 text-purple-800' :
                    'bg-yellow-100 text-yellow-800',
        isCompanyBooking: !!booking.company_name
      }));
      
      console.log('✅ Últimas 5 reservas cargadas:', recentBookings.value.length);
    }
  } catch (error) {
    console.error('Error loading recent bookings:', error);
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
    title: 'Ocupación Actual',
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
    value: '$0',
    change: 'Sin entregas registradas',
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
    title: 'Check-in Empresas',
    description: 'Check-in para clientes corporativos',
    icon: 'fas fa-building',
    iconBg: 'bg-purple-600',
    action: 'company-checkin'
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
    title: 'Crear Nuevo Empleado',
    description: 'Registrar un nuevo empleado',
    icon: 'fas fa-user-plus',
    iconBg: 'bg-green-600',
    action: 'create-employee'
  },
  {
    title: 'Informes y Reportes',
    description: 'Estadísticas del hotel',
    icon: 'fas fa-chart-bar',
    iconBg: 'bg-orange-500',
    action: 'reports'
  },
  {
    title: 'Sistema de Inventarios',
    description: 'Gestión de productos y materiales',
    icon: 'fas fa-boxes',
    iconBg: 'bg-orange-600',
    action: 'inventory'
  }
]);

// Quick Check-in Modal
const showQuickCheckinModal = ref(false);
const showCompanyCheckinModal = ref(false);
const showConfirmCheckinModal = ref(false);
const showSuccessCheckinModal = ref(false);
const successMessage = ref('');
const pendingCheckInRoom = ref(null);
const reservedRooms = ref([]);
const companyAvailableRooms = ref([]);
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
    case 'create-employee':
      window.location.href = '/admin/create-employee';
      break;
    case 'new-booking':
      window.location.href = '/admin/new-booking';
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
    case 'company-checkin':
      showCompanyCheckinModal.value = true;
      fetchAvailableRooms();
      break;
    case 'reports':
      window.location.href = '/admin/reports';
      break;
    case 'inventory':
      window.location.href = '/admin/inventory';
      break;
    default:
      alert(`Función ${action} - Próximamente implementada`);
  }
};

// Watcher para recargar habitaciones cuando se abre el modal de Quick Check-in
watch(
  () => showQuickCheckinModal.value,
  (newVal) => {
    if (newVal) {
      fetchReservedRooms();
    }
  }
);

// Quick Check-in Functions
const fetchReservedRooms = async () => {
  loading.value = true;
  try {
    const response = await fetch('/api/hotel/rooms');
    const data = await response.json();
    
    if (data.success && Array.isArray(data.rooms)) {
      console.log('🔍 Total de habitaciones recibidas:', data.rooms.length);
      console.log('📋 Estados de habitaciones:', data.rooms.map(r => ({ number: r.room_number, status: r.current_status })));
      
      // Filtrar SOLO habitaciones disponibles (case-insensitive)
      const filtered = data.rooms.filter(room => {
        const status = (room.current_status || '').trim().toLowerCase();
        const isAvailable = status === 'available';
        
        if (!isAvailable) {
          console.log(`❌ Habitación ${room.room_number}: estado="${room.current_status}" (EXCLUIDA)`);
        }
        return isAvailable;
      });
      
      console.log(`✅ ${filtered.length} habitaciones DISPONIBLES encontradas de ${data.rooms.length} totales`);
      
      reservedRooms.value = filtered.map(room => ({
        ...room,
        price_per_night: parseInt(room.price_per_night || 0),
        adults: room.adults || 1,
        children: room.children || 0,
        booking_id: room.booking_id || Math.floor(Math.random() * 9000000) + 1000000,
        discount_amount: room.discount_amount || 0,
        additional_charges: room.additional_charges || 0,
        tax_percentage: room.tax_percentage || 0,
        paid_amount: room.paid_amount || 0,
        // Convertir fechas al formato correcto para inputs type="date"
        check_in_date: formatDateForInput(room.check_in_date),
        check_out_date: formatDateForInput(room.check_out_date)
      }));
      
      console.log('📊 Habitaciones disponibles procesadas:', reservedRooms.value.length);
      
      if (filtered.length === 0) {
        console.warn('⚠️ ADVERTENCIA: No hay habitaciones disponibles');
      }
    } else {
      console.error('Error: respuesta inválida del servidor', data);
      reservedRooms.value = [];
    }
  } catch (error) {
    console.error('❌ Error fetching reserved rooms:', error);
    reservedRooms.value = [];
  } finally {
    loading.value = false;
  }
};

// Watcher para recargar habitaciones disponibles cuando se abre el modal de Company Check-in
watch(
  () => showCompanyCheckinModal.value,
  (newVal) => {
    if (newVal) {
      fetchAvailableRooms();
    }
  }
);

const fetchAvailableRooms = async () => {
  loading.value = true;
  try {
    const response = await fetch('/api/hotel/rooms');
    const data = await response.json();
    
    if (data.success) {
      // Filtrar solo habitaciones disponibles para empresas
      companyAvailableRooms.value = data.rooms.filter(room => 
        room.current_status === 'available'
      ).map(room => ({
        id: room.id,
        room_number: room.room_number,
        type: room.type,
        price: (room.price || room.price_per_night || 0) * 1000,
        current_status: room.current_status
      }));
    } else {
      console.error('Error fetching rooms:', data.error);
    }
  } catch (error) {
    console.error('Error fetching available rooms:', error);
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

  // Mostrar modal de confirmación para reserved rooms también
  pendingCheckInRoom.value = room;
  showConfirmCheckinModal.value = true;
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
    const roomId = selectedRoom.value.id;
    const price = parseInt(selectedRoom.value.price_per_night);
    
    const response = await fetch(`http://localhost:4000/api/hotel/rooms/${roomId}/checkin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        checkin_time: new Date().toISOString(),
        // Enviar el precio directamente en COP
        price_per_night: price,
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
      successMessage.value = `Check-in realizado exitosamente para ${walkInForm.value.name} en habitación ${selectedRoom.value.room_number}`;
      showSuccessCheckinModal.value = true;
      
      // Limpiar formulario y cerrar modales
      closeWalkInForm();
      reservedRooms.value = reservedRooms.value.filter(r => r.id !== selectedRoom.value.id);
      
      if (reservedRooms.value.length === 0) {
        showQuickCheckinModal.value = false;
      } else {
        // Refrescar la lista completa después de 2 segundos
        setTimeout(() => {
          console.log('🔄 Recargando habitaciones disponibles...');
          fetchReservedRooms();
        }, 2000);
      }
      
      // Cerrar el modal de éxito después de 3 segundos
      setTimeout(() => {
        showSuccessCheckinModal.value = false;
      }, 3000);
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

const closeCompanyCheckinModal = () => {
  showCompanyCheckinModal.value = false;
};

const handleCompanyCheckinSubmit = async (checkInData) => {
  try {
    console.log('Procesando check-in empresarial:', checkInData);
    
    // El componente ya envió la solicitud al servidor
    // Aquí solo actualizamos el estado local
    showCompanyCheckinModal.value = false;
    
    // Actualizar lista de habitaciones
    await fetchReservedRooms();
    
    // Mostrar mensaje de éxito
    alert(`Check-in completado exitosamente para ${checkInData.guest_name} en la habitación ${checkInData.room_number}`);
  } catch (error) {
    console.error('Error procesando check-in empresarial:', error);
    alert('Error al procesar el check-in empresarial');
  }
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
  return nights;
};

// Convertir fecha ISO o de cualquier formato a yyyy-MM-dd para inputs type="date"
const formatDateForInput = (dateStr) => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (error) {
    return '';
  }
};

// Download Monthly Income as Excel
const downloadMonthlyIncomeExcel = () => {
  try {
    console.log('📥 Iniciando descarga de Excel...');
    console.log(`📊 Checkouts en memoria: ${checkoutIncomeItems.value.length}`);
    console.log(`📊 Handovers en memoria: ${handoverIncomeItems.value.length}`);
    console.log(`📊 Total items: ${allIncomeItems.value.length}`);
    
    // Crear workbook
    const wb = XLSX.utils.book_new();

    // Calcular totales basados en datos filtrados
    const totalCheckoutIncome = checkoutIncomeItems.value.reduce((sum, item) => sum + (parseFloat(item.amount || 0)), 0);
    const totalHandoverIncome = handoverIncomeItems.value.reduce((sum, item) => sum + (parseFloat(item.amount || 0)), 0);
    const totalIncome = totalCheckoutIncome + totalHandoverIncome;

    // Obtener label del filtro actual
    let filterLabel = 'Mes Completo';
    if (incomeFilterType.value === 'day' && incomeSelectedDate.value) {
      filterLabel = `Día: ${new Date(incomeSelectedDate.value).toLocaleDateString('es-ES')}`;
    } else if (incomeFilterType.value === 'week' && incomeSelectedWeek.value !== '') {
      const week = incomeWeeksOfMonth.value[parseInt(incomeSelectedWeek.value)];
      if (week) filterLabel = week.label;
    } else if (incomeFilterType.value === 'range' && incomeRangeStart.value && incomeRangeEnd.value) {
      filterLabel = `Rango: ${new Date(incomeRangeStart.value).toLocaleDateString('es-ES')} - ${new Date(incomeRangeEnd.value).toLocaleDateString('es-ES')}`;
    } else if (incomeFilterType.value === 'select-month' && incomeSelectedMonth.value && incomeSelectedYear.value) {
      const months = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      filterLabel = `${months[parseInt(incomeSelectedMonth.value)]} ${incomeSelectedYear.value}`;
    }

    // ===== SHEET 1: RESUMEN =====
    const summaryData = [
      ['HOTEL SOL - INFORME DE INGRESOS'],
      [],
      ['Filtro:', filterLabel],
      ['Fecha de generación:', new Date().toLocaleDateString('es-ES')],
      [],
      ['RESUMEN DE INGRESOS'],
      ['Concepto', 'Cantidad', 'Monto COP'],
      ['Ingresos por Check-out', checkoutIncomeItems.value.length.toString(), totalCheckoutIncome.toString()],
      ['Ingresos por Entregas', handoverIncomeItems.value.length.toString(), totalHandoverIncome.toString()],
      [],
      ['TOTAL INGRESOS', '', totalIncome.toString()],
      [],
      ['Notas:'],
      ['- Los datos mostrados corresponden al filtro seleccionado'],
      ['- Se excluyen contratos corporativos'],
      ['- Reporte generado automáticamente desde el sistema']
    ];

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    wsSummary['!cols'] = [
      { wch: 30 },
      { wch: 15 },
      { wch: 20 }
    ];
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen');

    // ===== SHEET 2: CHECK-OUTS DETALLADOS =====
    const checkoutsHeader = ['Habitación', 'Huésped', 'Fecha Entrada', 'Fecha Salida', 'Monto COP'];
    const checkoutsData = checkoutIncomeItems.value.map(item => [
      item.room_number || 'N/A',
      item.guest_name || '',
      new Date(item.check_in_date).toLocaleDateString('es-ES'),
      new Date(item.check_out_date).toLocaleDateString('es-ES'),
      parseFloat(item.amount || 0)
    ]);
    
    const checkoutsSheet = [
      ['CHECK-OUTS DETALLADOS'],
      [`Total de Check-outs: ${checkoutIncomeItems.value.length}`],
      [`Total Ingresos: ${totalCheckoutIncome}`],
      [],
      checkoutsHeader,
      ...checkoutsData
    ];

    const wsCheckouts = XLSX.utils.aoa_to_sheet(checkoutsSheet);
    wsCheckouts['!cols'] = [
      { wch: 15 },
      { wch: 25 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 }
    ];
    XLSX.utils.book_append_sheet(wb, wsCheckouts, 'Check-outs');

    // ===== SHEET 3: ENTREGAS DETALLADAS =====
    const handoversHeader = ['Empleado', 'Fecha', 'Monto COP'];
    const handoversData = handoverIncomeItems.value.map(item => [
      item.employee_name || 'Sin especificar',
      new Date(item.created_at || item.shift_date).toLocaleDateString('es-ES'),
      parseFloat(item.amount || 0)
    ]);
    
    const handoversSheet = [
      ['ENTREGAS DE TURNO DETALLADAS'],
      [`Total de Entregas: ${handoverIncomeItems.value.length}`],
      [`Total Ingresos: ${totalHandoverIncome}`],
      [],
      handoversHeader,
      ...handoversData
    ];

    const wsHandovers = XLSX.utils.aoa_to_sheet(handoversSheet);
    wsHandovers['!cols'] = [
      { wch: 25 },
      { wch: 15 },
      { wch: 15 }
    ];
    XLSX.utils.book_append_sheet(wb, wsHandovers, 'Entregas');

    // ===== SHEET 4: TODAS LAS TRANSACCIONES =====
    const allTransactionsHeader = ['Tipo', 'Descripción', 'Monto COP', 'Fecha'];
    const allTransactionsData = allIncomeItems.value.map(item => [
      item.type === 'checkout' ? 'Check-out' : 'Entrega',
      item.description,
      parseFloat(item.amount || 0),
      item.displayDate
    ]);
    
    const allTransactionsSheet = [
      ['TODAS LAS TRANSACCIONES'],
      [`Total de transacciones: ${allIncomeItems.value.length}`],
      [`Total Ingresos: ${totalIncome}`],
      [],
      allTransactionsHeader,
      ...allTransactionsData
    ];

    const wsAllTransactions = XLSX.utils.aoa_to_sheet(allTransactionsSheet);
    wsAllTransactions['!cols'] = [
      { wch: 15 },
      { wch: 40 },
      { wch: 15 },
      { wch: 15 }
    ];
    XLSX.utils.book_append_sheet(wb, wsAllTransactions, 'Todas');

    // Generar nombre del archivo basado en el filtro
    let fileName = '';
    if (incomeFilterType.value === 'day' && incomeSelectedDate.value) {
      const date = new Date(incomeSelectedDate.value);
      fileName = `Ingresos-${date.toISOString().split('T')[0]}.xlsx`;
    } else if (incomeFilterType.value === 'week' && incomeSelectedWeek.value !== '') {
      const week = incomeWeeksOfMonth.value[parseInt(incomeSelectedWeek.value)];
      fileName = `Ingresos-Semana${week.index + 1}-${new Date().getFullYear()}.xlsx`;
    } else if (incomeFilterType.value === 'range' && incomeRangeStart.value && incomeRangeEnd.value) {
      const startDate = new Date(incomeRangeStart.value).toISOString().split('T')[0];
      const endDate = new Date(incomeRangeEnd.value).toISOString().split('T')[0];
      fileName = `Ingresos-${startDate}_a_${endDate}.xlsx`;
    } else if (incomeFilterType.value === 'select-month' && incomeSelectedMonth.value && incomeSelectedYear.value) {
      const monthNum = parseInt(incomeSelectedMonth.value).toString().padStart(2, '0');
      fileName = `Ingresos-${incomeSelectedYear.value}-${monthNum}.xlsx`;
    } else {
      // Mes completo (actual)
      const now = new Date();
      const monthNum = (now.getMonth() + 1).toString().padStart(2, '0');
      fileName = `Ingresos-${now.getFullYear()}-${monthNum}.xlsx`;
    }
    
    XLSX.writeFile(wb, fileName);

    // Mostrar mensaje de éxito
    successMessage.value = `Archivo descargado: ${fileName}`;
    showSuccessCheckinModal.value = true;
    setTimeout(() => {
      showSuccessCheckinModal.value = false;
    }, 3000);

  } catch (error) {
    console.error('Error descargando Excel:', error);
    alert('Error al descargar el archivo Excel');
  }
  
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

  // Mostrar modal de confirmación
  pendingCheckInRoom.value = room;
  showConfirmCheckinModal.value = true;
};

const confirmCheckIn = async () => {
  if (!pendingCheckInRoom.value) return;
  
  const room = pendingCheckInRoom.value;
  const nights = calculateNights(room.check_in_date, room.check_out_date);

  try {
    const roomId = room.id;
    const price = parseInt(room.price_per_night);
    
    const requestBody = {
      checkin_time: new Date().toISOString(),
      // Enviar el precio directamente en COP
      price_per_night: price
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

    const response = await fetch(`http://localhost:4000/api/hotel/rooms/${roomId}/checkin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (data.success) {
      successMessage.value = `Check-in realizado exitosamente para ${room.guest_name} en habitación ${room.room_number}`;
      showSuccessCheckinModal.value = true;
      
      // Remover de la lista y cerrar modal si no quedan más
      reservedRooms.value = reservedRooms.value.filter(r => r.id !== room.id);
      
      if (reservedRooms.value.length === 0) {
        showQuickCheckinModal.value = false;
      } else {
        // Refrescar la lista completa después de 2 segundos
        setTimeout(() => {
          console.log('🔄 Recargando habitaciones disponibles...');
          fetchReservedRooms();
        }, 2000);
      }
      
      showConfirmCheckinModal.value = false;
      pendingCheckInRoom.value = null;
      
      // Cerrar el modal de éxito después de 3 segundos
      setTimeout(() => {
        showSuccessCheckinModal.value = false;
      }, 3000);
    } else {
      alert('Error realizando check-in: ' + data.error);
      console.error('❌ Error en check-in:', data.error);
      showConfirmCheckinModal.value = false;
      pendingCheckInRoom.value = null;
    }
  } catch (error) {
    console.error('Error performing check-in:', error);
    alert('Error al realizar el check-in');
    showConfirmCheckinModal.value = false;
    pendingCheckInRoom.value = null;
  }
};

const cancelCheckIn = () => {
  showConfirmCheckinModal.value = false;
  pendingCheckInRoom.value = null;
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
