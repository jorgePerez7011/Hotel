<template>
  <div v-if="showCompanyCheckinModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
    <div class="bg-white rounded-lg max-w-7xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
      <div class="p-6">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-bold text-gray-900">
            <i class="fas fa-building mr-2 text-purple-500"></i>
            Check-in Empresas
          </h3>
          <button 
            @click="closeCompanyCheckinModal"
            class="text-gray-500 hover:text-gray-700"
          >
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>

        <!-- Step 1: Select Company -->
        <div v-if="step === 1" class="space-y-6">
          <div class="flex justify-between items-center mb-4">
            <h4 class="text-lg font-semibold text-gray-900">Seleccione la Empresa</h4>
            <button 
              @click="showAddCompanyModal = true"
              class="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              <i class="fas fa-plus mr-2"></i>
              Agregar Empresa
            </button>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div 
              v-for="company in companies"
              :key="company.id"
              :class="[
                'p-6 border-2 rounded-lg transition-all duration-300 group',
                selectedCompany?.id === company.id 
                  ? 'border-purple-500 bg-purple-50' 
                  : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/50'
              ]"
            >
              <!-- Selection Click Area -->
              <div @click="selectCompany(company)" class="cursor-pointer mb-4">
                <div class="flex items-center space-x-3">
                  <i class="fas fa-check-circle text-2xl" :class="selectedCompany?.id === company.id ? 'text-purple-500' : 'text-gray-300'"></i>
                  <div>
                    <h5 class="font-semibold text-gray-900">{{ company.name }}</h5>
                    <p class="text-sm text-gray-600">{{ company.description }}</p>
                    <p class="text-xs text-gray-500 mt-1">NIT: {{ company.nit || 'N/A' }}</p>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex gap-2 pt-4 border-t border-gray-200">
                <button
                  @click="editCompany(company)"
                  class="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium text-sm"
                >
                  <i class="fas fa-edit"></i>
                  Editar
                </button>
                <button
                  @click="deleteCompany(company)"
                  class="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium text-sm"
                >
                  <i class="fas fa-trash"></i>
                  Eliminar
                </button>
              </div>
            </div>
          </div>

          <div class="flex justify-end space-x-4 mt-8">
            <button 
              @click="closeCompanyCheckinModal"
              class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button 
              @click="step = 2"
              :disabled="!selectedCompany"
              :class="[
                'px-6 py-2 rounded-lg text-white font-medium transition-colors',
                selectedCompany 
                  ? 'bg-purple-600 hover:bg-purple-700' 
                  : 'bg-gray-300 cursor-not-allowed'
              ]"
            >
              Continuar
            </button>
          </div>
        </div>

        <!-- Step 2: Select Room -->
        <div v-else-if="step === 2" class="space-y-6">
          <div class="flex items-center space-x-4 mb-6 bg-purple-50 p-4 rounded-lg">
            <div class="flex-1">
              <h4 class="text-lg font-semibold text-gray-900">Empresa: <span class="text-purple-600">{{ selectedCompany?.name }}</span></h4>
            </div>
            <button 
              @click="step = 1"
              class="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center"
            >
              <i class="fas fa-edit mr-2"></i>
              Cambiar
            </button>
          </div>

          <h4 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <i class="fas fa-bed mr-2 text-purple-600"></i>
            Seleccione la Habitación ({{ allRooms.length }} disponibles)
          </h4>

          <!-- All Rooms Grid - 20 Rooms -->
          <div class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            <div 
              v-for="room in allRooms"
              :key="room.id"
              @click="selectRoom(room)"
              :class="[
                'p-4 border-2 rounded-lg transition-all duration-300 text-center',
                room.current_status !== 'available' ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
                selectedRoom?.id === room.id 
                  ? 'border-purple-500 bg-purple-100 shadow-lg ring-2 ring-purple-400' 
                  : room.current_status === 'available'
                    ? 'border-green-300 bg-green-50 hover:border-green-500 hover:shadow-md'
                    : 'border-gray-300 bg-gray-100 opacity-60'
              ]"
              :disabled="room.current_status !== 'available'"
            >
              <!-- Número de Habitación -->
              <p class="text-sm font-bold text-gray-700 mb-2">
                🏘️ {{ room.room_number }}
              </p>
              
              <!-- Tipo de habitación -->
              <p class="text-xs text-gray-700 font-semibold mb-2">{{ room.type }}</p>
              
              <!-- Estado -->
              <p v-if="room.current_status === 'available'" class="text-xs text-green-600 font-semibold">
                <i class="fas fa-check-circle mr-1"></i>Disponible
              </p>
              <p v-else class="text-xs text-red-600 font-bold">
                <i class="fas fa-times-circle mr-1"></i>NO DISPONIBLE
              </p>
            </div>
          </div>

          <!-- Legend -->
          <div class="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p class="text-sm font-semibold text-gray-900 mb-2">Leyenda:</p>
            <div class="flex flex-wrap gap-4">
              <div class="flex items-center gap-2">
                <div class="w-6 h-6 bg-green-100 border-2 border-green-300 rounded"></div>
                <span class="text-sm text-gray-700">Disponible</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-6 h-6 bg-gray-100 border-2 border-gray-300 rounded opacity-60"></div>
                <span class="text-sm text-gray-700">Ocupada</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-6 h-6 bg-purple-100 border-2 border-purple-500 rounded ring-2 ring-purple-400"></div>
                <span class="text-sm text-gray-700">Seleccionada</span>
              </div>
            </div>
          </div>

          <div class="flex justify-between space-x-4 mt-8">
            <button 
              @click="step = 1"
              class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Atrás
            </button>
            <div class="flex space-x-4">
              <button 
                @click="closeCompanyCheckinModal"
                class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button 
                @click="step = 3"
                :disabled="!selectedRoom"
                :class="[
                  'px-6 py-2 rounded-lg text-white font-medium transition-colors',
                  selectedRoom 
                    ? 'bg-purple-600 hover:bg-purple-700' 
                    : 'bg-gray-300 cursor-not-allowed'
                ]"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>

        <!-- Step 3: Enter Guest Information & Dates -->
        <div v-else-if="step === 3" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-purple-50 p-4 rounded-lg">
            <div>
              <h4 class="text-lg font-semibold text-gray-900">Empresa: <span class="text-purple-600">{{ selectedCompany?.name }}</span></h4>
            </div>
            <div>
              <h4 class="text-lg font-semibold text-gray-900">Habitación: <span class="text-purple-600">{{ selectedRoom?.room_number }}</span></h4>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Información del Huésped -->
            <div>
              <h4 class="font-semibold text-gray-900 mb-4 flex items-center">
                <i class="fas fa-user text-purple-500 mr-2"></i>
                Información del Huésped
              </h4>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Nombre Completo *</label>
                  <input 
                    v-model="guestInfo.name"
                    type="text" 
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Nombre del huésped"
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                  <input 
                    v-model="guestInfo.phone"
                    type="tel" 
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="+57 300 123 4567"
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input 
                    v-model="guestInfo.email"
                    type="email" 
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="email@ejemplo.com"
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Identificación</label>
                  <input 
                    v-model="guestInfo.identification"
                    type="text" 
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Ej: 1234567890"
                  >
                </div>
              </div>
            </div>

            <!-- Fechas y Duración -->
            <div>
              <h4 class="font-semibold text-gray-900 mb-4 flex items-center">
                <i class="fas fa-calendar text-purple-500 mr-2"></i>
                Fechas de Hospedaje
              </h4>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Fecha de Check-in *</label>
                  <input 
                    v-model="stayInfo.checkInDate"
                    type="date" 
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Fecha de Check-out *</label>
                  <input 
                    v-model="stayInfo.checkOutDate"
                    type="date" 
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                </div>

                <!-- Noches calculadas -->
                <div class="text-center bg-purple-50 rounded-lg p-4 border-2 border-purple-200">
                  <div class="text-3xl font-bold text-purple-600 mb-1">
                    {{ calculateNights() }}
                  </div>
                  <div class="text-sm text-purple-800 font-medium">Noches de Hospedaje</div>
                </div>

                <!-- Precio por Noche - EDITABLE -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    <i class="fas fa-dollar-sign mr-1 text-green-500"></i>
                    Precio por Noche (COP) *
                  </label>
                  <input 
                    v-model.number="stayInfo.pricePerNight"
                    type="number"
                    min="0"
                    step="1000"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 font-semibold text-green-600"
                    placeholder="Ej: 80000"
                  >
                  <p class="text-xs text-gray-500 mt-1">Precio especial para la empresa</p>
                </div>

                <!-- Observaciones -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Observaciones</label>
                  <textarea 
                    v-model="stayInfo.notes"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Notas adicionales"
                    rows="3"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          <!-- Summary -->
          <div class="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border-2 border-purple-200">
            <h4 class="font-semibold text-gray-900 mb-4 text-lg">📋 Resumen de Facturación</h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="bg-white p-4 rounded-lg border border-purple-200">
                <p class="text-xs text-gray-600 uppercase font-semibold mb-2">Empresa</p>
                <p class="text-lg font-bold text-purple-600">{{ selectedCompany?.name }}</p>
              </div>
              <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border-2 border-blue-400">
                <p class="text-xs text-blue-600 uppercase font-semibold mb-2">
                  <i class="fas fa-door-open mr-1"></i>Habitación
                </p>
                <p class="text-3xl font-bold text-blue-700 mb-2">{{ selectedRoom?.room_number }}</p>
                <p class="text-sm text-blue-600 font-semibold">
                  <i class="fas fa-building mr-1"></i>Piso {{ getFloorNumber(selectedRoom?.room_number) }}
                </p>
              </div>
              <div class="bg-white p-4 rounded-lg border border-purple-200">
                <p class="text-xs text-gray-600 uppercase font-semibold mb-2">Noches</p>
                <p class="text-lg font-bold text-gray-900">{{ calculateNights() }}</p>
              </div>
            </div>

            <!-- Tipo de habitación y Huésped -->
            <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="bg-white p-3 rounded-lg border border-gray-200">
                <p class="text-xs text-gray-600 uppercase font-semibold mb-1">Tipo de Habitación</p>
                <p class="text-sm font-bold text-gray-900">{{ selectedRoom?.type }}</p>
              </div>
              <div class="bg-white p-3 rounded-lg border border-gray-200">
                <p class="text-xs text-gray-600 uppercase font-semibold mb-1">Huésped</p>
                <p class="text-sm font-bold text-gray-900">{{ guestInfo.name || 'No especificado' }}</p>
              </div>
            </div>

            <!-- Precio por noche destacado -->
            <div class="mt-4 bg-green-50 border-2 border-green-300 rounded-lg p-4">
              <p class="text-sm text-gray-700 mb-2">
                <strong>Precio por Noche (según contrato):</strong>
              </p>
              <div class="flex items-center space-x-4">
                <div class="text-4xl font-bold text-green-600">
                  COP {{ (stayInfo.pricePerNight || 0).toLocaleString() }}
                </div>
                <div class="text-sm text-gray-600">
                  <p>{{ calculateNights() }} noches × COP {{ (stayInfo.pricePerNight || 0).toLocaleString() }}</p>
                </div>
              </div>
            </div>

            <!-- Total a facturar -->
            <div class="mt-4 bg-gradient-to-r from-green-100 to-green-50 border-2 border-green-500 rounded-lg p-6">
              <p class="text-sm text-gray-700 mb-2 uppercase font-semibold">Total a Facturar</p>
              <p class="text-5xl font-bold text-green-600">
                COP {{ calculateTotal().toLocaleString() }}.00
              </p>
              <p class="text-xs text-green-700 mt-2">
                <i class="fas fa-check-circle mr-1"></i>
                Se sumará a los ingresos del mes
              </p>
            </div>

            <p class="text-xs text-gray-600 mt-4 bg-white p-3 rounded">
              <i class="fas fa-info-circle mr-1 text-blue-500"></i>
              El pago será procesado al final del mes de acuerdo al contrato con <strong>{{ selectedCompany?.name }}</strong>
            </p>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-between space-x-4 mt-8">
            <button 
              @click="step = 2"
              class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Atrás
            </button>
            <div class="flex space-x-4">
              <button 
                @click="closeCompanyCheckinModal"
                class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button 
                @click="submitCompanyCheckin"
                :disabled="loading || !isFormValid()"
                :class="[
                  'px-6 py-2 rounded-lg text-white font-medium transition-colors flex items-center',
                  isFormValid() && !loading
                    ? 'bg-purple-600 hover:bg-purple-700' 
                    : 'bg-gray-300 cursor-not-allowed'
                ]"
              >
                <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
                {{ loading ? 'Procesando...' : 'Completar Check-in' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Agregar Nueva Empresa -->
    <div v-if="showAddCompanyModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div class="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div class="p-8">
          <!-- Header -->
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-2xl font-bold text-gray-900 flex items-center">
              <i class="fas fa-building mr-3 text-green-600"></i>
              Agregar Empresa
            </h3>
            <button 
              @click="showAddCompanyModal = false"
              class="text-gray-500 hover:text-gray-700"
            >
              <i class="fas fa-times text-2xl"></i>
            </button>
          </div>

          <!-- Form -->
          <form @submit.prevent="saveNewCompany" class="space-y-6">
            <!-- NIT/CIF -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                <i class="fas fa-id-card mr-2 text-blue-600"></i>
                Número de Identificación (NIT) *
              </label>
              <input 
                v-model="newCompanyForm.nit"
                type="text" 
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Ej: 800.123.456-7"
              >
              <p class="text-xs text-gray-500 mt-1">
                <i class="fas fa-info-circle mr-1"></i>
                NIT colombiano (formato: XXX.XXX.XXX-X)
              </p>
            </div>

            <!-- Razón Social -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                <i class="fas fa-signature mr-2 text-blue-600"></i>
                Nombre Legal (Razón Social) *
              </label>
              <input 
                v-model="newCompanyForm.name"
                type="text" 
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Ej: EMPRESA S.A.S."
              >
              <p class="text-xs text-gray-500 mt-1">
                <i class="fas fa-info-circle mr-1"></i>
                Nombre oficial registrado ante las autoridades
              </p>
            </div>

            <!-- Descripción (Opcional) -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                <i class="fas fa-align-left mr-2 text-blue-600"></i>
                Descripción (Opcional)
              </label>
              <textarea 
                v-model="newCompanyForm.description"
                rows="3"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Ej: Descripción del giro empresarial"
              ></textarea>
            </div>

            <!-- Validation Error -->
            <div v-if="formError" class="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <i class="fas fa-exclamation-triangle text-red-600 mr-3 mt-1"></i>
              <p class="text-sm text-red-700">{{ formError }}</p>
            </div>

            <!-- Buttons -->
            <div class="flex gap-4 pt-4">
              <button
                type="button"
                @click="showAddCompanyModal = false"
                class="flex-1 px-4 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
              >
                <i class="fas fa-times mr-2"></i>Cancelar
              </button>
              <button
                type="submit"
                :disabled="savingCompany || !newCompanyForm.nit.trim() || !newCompanyForm.name.trim()"
                :class="[
                  'flex-1 px-4 py-3 rounded-lg text-white font-semibold transition-colors flex items-center justify-center',
                  (savingCompany || !newCompanyForm.nit.trim() || !newCompanyForm.name.trim())
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                ]"
              >
                <i v-if="savingCompany" class="fas fa-spinner fa-spin mr-2"></i>
                {{ savingCompany ? 'Guardando...' : 'Guardar Empresa' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal: Editar Empresa -->
    <div v-if="showEditCompanyModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div class="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div class="p-8">
          <!-- Header -->
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-2xl font-bold text-gray-900 flex items-center">
              <i class="fas fa-edit mr-3 text-blue-600"></i>
              Editar Empresa
            </h3>
            <button 
              @click="showEditCompanyModal = false"
              class="text-gray-500 hover:text-gray-700"
            >
              <i class="fas fa-times text-2xl"></i>
            </button>
          </div>

          <!-- Form -->
          <form @submit.prevent="saveEditedCompany" class="space-y-6">
            <!-- NIT/CIF -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                <i class="fas fa-id-card mr-2 text-blue-600"></i>
                Número de Identificación (NIT) *
              </label>
              <input 
                v-model="editCompanyForm.nit"
                type="text" 
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: 800.123.456-7"
              >
              <p class="text-xs text-gray-500 mt-1">
                <i class="fas fa-info-circle mr-1"></i>
                NIT colombiano (formato: XXX.XXX.XXX-X)
              </p>
            </div>

            <!-- Razón Social -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                <i class="fas fa-signature mr-2 text-blue-600"></i>
                Nombre Legal (Razón Social) *
              </label>
              <input 
                v-model="editCompanyForm.name"
                type="text" 
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: EMPRESA S.A.S."
              >
              <p class="text-xs text-gray-500 mt-1">
                <i class="fas fa-info-circle mr-1"></i>
                Nombre oficial registrado ante las autoridades
              </p>
            </div>

            <!-- Descripción (Opcional) -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                <i class="fas fa-align-left mr-2 text-blue-600"></i>
                Descripción (Opcional)
              </label>
              <textarea 
                v-model="editCompanyForm.description"
                rows="3"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: Descripción del giro empresarial"
              ></textarea>
            </div>

            <!-- Validation Error -->
            <div v-if="formError" class="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <i class="fas fa-exclamation-triangle text-red-600 mr-3 mt-1"></i>
              <p class="text-sm text-red-700">{{ formError }}</p>
            </div>

            <!-- Buttons -->
            <div class="flex gap-4 pt-4">
              <button
                type="button"
                @click="showEditCompanyModal = false"
                class="flex-1 px-4 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
              >
                <i class="fas fa-times mr-2"></i>Cancelar
              </button>
              <button
                type="submit"
                :disabled="savingCompany || !editCompanyForm.nit.trim() || !editCompanyForm.name.trim()"
                :class="[
                  'flex-1 px-4 py-3 rounded-lg text-white font-semibold transition-colors flex items-center justify-center',
                  (savingCompany || !editCompanyForm.nit.trim() || !editCompanyForm.name.trim())
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                ]"
              >
                <i v-if="savingCompany" class="fas fa-spinner fa-spin mr-2"></i>
                {{ savingCompany ? 'Guardando...' : 'Guardar Cambios' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal: Confirmar Eliminación -->
    <div v-if="showDeleteConfirmModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div class="bg-white rounded-xl shadow-2xl max-w-sm w-full">
        <div class="p-8">
          <!-- Header -->
          <div class="flex items-center space-x-3 mb-6">
            <i class="fas fa-exclamation-triangle text-3xl text-red-600"></i>
            <h2 class="text-2xl font-bold text-gray-900">Confirmar Eliminación</h2>
          </div>

          <!-- Content -->
          <p class="text-gray-700 mb-6">
            ¿Está seguro de que desea eliminar la empresa <strong>{{ companyToDelete?.name }}</strong>? Esta acción no se puede deshacer.
          </p>

          <!-- Buttons -->
          <div class="flex gap-3">
            <button
              @click="showDeleteConfirmModal = false"
              class="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
            >
              Cancelar
            </button>
            <button
              @click="confirmDeleteCompany"
              :disabled="savingCompany"
              :class="[
                'flex-1 px-4 py-3 rounded-lg text-white font-semibold transition-colors flex items-center justify-center',
                savingCompany ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
              ]"
            >
              <i :class="savingCompany ? 'fas fa-spinner fa-spin' : 'fas fa-trash'" class="mr-2"></i>
              {{ savingCompany ? 'Eliminando...' : 'Eliminar' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Notificaciones Toast -->
    <div class="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      <div
        v-for="(notification, index) in notifications"
        :key="index"
        :class="[
          'p-4 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-top fade-in pointer-events-auto max-w-sm',
          notification.type === 'success' ? 'bg-green-500 text-white' : '',
          notification.type === 'error' ? 'bg-red-500 text-white' : '',
          notification.type === 'warning' ? 'bg-yellow-500 text-white' : '',
          notification.type === 'info' ? 'bg-blue-500 text-white' : ''
        ]"
      >
        <i :class="[
          notification.type === 'success' ? 'fas fa-check-circle' : '',
          notification.type === 'error' ? 'fas fa-exclamation-circle' : '',
          notification.type === 'warning' ? 'fas fa-exclamation-triangle' : '',
          notification.type === 'info' ? 'fas fa-info-circle' : ''
        ]"></i>
        <span class="font-medium">{{ notification.message }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

// Props
const props = defineProps({
  showCompanyCheckinModal: {
    type: Boolean,
    default: false
  },
  availableRooms: {
    type: Array,
    default: () => []
  }
});

// Emits
const emit = defineEmits(['close', 'submit']);

// Companies list
const companies = ref([]);

// State
const step = ref(1);
const selectedCompany = ref(null);
const selectedRoom = ref(null);
const loading = ref(false);
const savingCompany = ref(false);
const allRooms = ref([]);
const showAddCompanyModal = ref(false);
const showEditCompanyModal = ref(false);
const showDeleteConfirmModal = ref(false);
const formError = ref('');
const companyToDelete = ref(null);
const companyToEdit = ref(null);
const notifications = ref([]);

// New Company Form
const newCompanyForm = ref({
  nit: '',
  name: '',
  description: ''
});

// Edit Company Form
const editCompanyForm = ref({
  nit: '',
  name: '',
  description: ''
});

// Guest information
const guestInfo = ref({
  name: '',
  phone: '',
  email: '',
  identification: ''
});

// Stay information
const stayInfo = ref({
  checkInDate: new Date().toISOString().split('T')[0],
  checkOutDate: '',
  pricePerNight: 0,
  notes: ''
});

// Methods
const selectCompany = (company) => {
  selectedCompany.value = company;
};

const saveNewCompany = async () => {
  formError.value = '';
  
  // Validaciones
  if (!newCompanyForm.value.nit.trim()) {
    formError.value = 'El NIT es requerido';
    return;
  }
  
  if (!newCompanyForm.value.name.trim()) {
    formError.value = 'El nombre de la empresa es requerido';
    return;
  }

  savingCompany.value = true;
  formError.value = '';
  try {
    // Enviar a la API
    const response = await fetch('http://localhost:4000/api/companies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nit: newCompanyForm.value.nit.trim(),
        name: newCompanyForm.value.name.trim(),
        description: newCompanyForm.value.description.trim()
      })
    });

    const data = await response.json();

    if (data.success) {
      // Agregar a la lista local
      companies.value.push({
        id: data.data.id,
        nit: data.data.nit,
        name: data.data.name,
        description: data.data.description
      });

      // Seleccionar automáticamente la empresa recién creada
      selectedCompany.value = companies.value[companies.value.length - 1];

      // Limpiar formulario y cerrar modal
      newCompanyForm.value = { nit: '', name: '', description: '' };
      showAddCompanyModal.value = false;

      // Mostrar notificación
      showNotification(`Empresa "${data.data.name}" agregada correctamente`, 'success');
      console.log('✅ Empresa agregada exitosamente:', data.data.name);
    } else {
      formError.value = data.error || 'Error al guardar la empresa';
      showNotification(formError.value, 'error');
    }
  } catch (error) {
    console.error('Error al guardar empresa:', error);
    formError.value = 'Error al guardar la empresa. Intente nuevamente.';
    showNotification(formError.value, 'error');
  } finally {
    savingCompany.value = false;
  }
};

const selectRoom = (room) => {
  // Prevenir selección de habitaciones ocupadas
  if (room.current_status !== 'available') {
    alert(`La habitación ${room.room_number} no está disponible. Por favor, selecciona otra habitación.`);
    return;
  }
  selectedRoom.value = room;
};

const loadAllRooms = async () => {
  try {
    const response = await fetch('http://localhost:4000/api/hotel/rooms');
    const data = await response.json();
    
    if (data.success) {
      allRooms.value = data.rooms
        .map(room => ({
          id: room.id,
          room_number: parseInt(room.room_number) || room.room_number,
          room_number_display: room.room_number,
          type: room.type,
          price: parseInt(room.price || room.price_per_night || 0),
          current_status: room.current_status,
          floor: room.floor || Math.floor(parseInt(room.room_number) / 100)
        }))
        .sort((a, b) => {
          const numA = parseInt(a.room_number);
          const numB = parseInt(b.room_number);
          return numA - numB;
        });
      console.log(`Cargadas ${allRooms.value.length} habitaciones ordenadas`);
    }
  } catch (error) {
    console.error('Error cargando habitaciones:', error);
  }
};

// Watcher para cargar habitaciones cuando se abre el modal
watch(
  () => props.showCompanyCheckinModal,
  (newVal) => {
    if (newVal) {
      loadAllRooms();
    }
  }
);

// Watcher para asignar el precio cuando se selecciona una habitación
watch(
  () => selectedRoom.value,
  (newRoom) => {
    if (newRoom) {
      stayInfo.value.pricePerNight = newRoom.price || 0;
    }
  }
);

const calculateNights = () => {
  if (!stayInfo.value.checkInDate || !stayInfo.value.checkOutDate) return 0;
  
  const checkIn = new Date(stayInfo.value.checkInDate);
  const checkOut = new Date(stayInfo.value.checkOutDate);
  const diffTime = checkOut - checkIn;
  const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return nights > 0 ? nights : 0;
};

const calculateTotal = () => {
  return calculateNights() * (stayInfo.value.pricePerNight || 0);
};

const isFormValid = () => {
  return (
    selectedCompany.value &&
    selectedRoom.value &&
    guestInfo.value.name.trim() &&
    stayInfo.value.checkInDate &&
    stayInfo.value.checkOutDate &&
    stayInfo.value.pricePerNight > 0 &&
    calculateNights() > 0
  );
};

const getFloorNumber = (roomNumber) => {
  if (!roomNumber) return 'N/A';
  const num = parseInt(roomNumber);
  if (isNaN(num)) return 'N/A';
  return Math.floor(num / 100);
};

const closeCompanyCheckinModal = () => {
  // Reset form
  step.value = 1;
  selectedCompany.value = null;
  selectedRoom.value = null;
  guestInfo.value = { name: '', phone: '', email: '', identification: '' };
  stayInfo.value = { checkInDate: new Date().toISOString().split('T')[0], checkOutDate: '', pricePerNight: 0, notes: '' };
  emit('close');
};

// Load companies from database
const loadCompanies = async () => {
  loading.value = true;
  try {
    const response = await fetch('http://localhost:4000/api/companies');
    const data = await response.json();

    if (data.success) {
      companies.value = data.data || [];
      console.log('✅ Empresas cargadas:', companies.value.length);
    } else {
      console.warn('Error loading companies:', data.error);
      companies.value = [];
    }
  } catch (error) {
    console.error('Error fetching companies:', error);
    companies.value = [];
  } finally {
    loading.value = false;
  }
};

// Watch for modal opening to load companies
watch(() => props.showCompanyCheckinModal, (newVal) => {
  if (newVal) {
    loadCompanies();
    step.value = 1; // Reset to step 1 when opening
  }
});

// Notification System
const showNotification = (message, type = 'info') => {
  const notification = { message, type };
  notifications.value.push(notification);
  
  setTimeout(() => {
    const index = notifications.value.indexOf(notification);
    if (index > -1) {
      notifications.value.splice(index, 1);
    }
  }, 4000);
};

// Edit Company
const editCompany = (company) => {
  companyToEdit.value = company;
  editCompanyForm.value = {
    nit: company.nit || '',
    name: company.name,
    description: company.description || ''
  };
  formError.value = '';
  showEditCompanyModal.value = true;
};

// Save Edited Company
const saveEditedCompany = async () => {
  formError.value = '';
  
  if (!editCompanyForm.value.nit.trim()) {
    formError.value = 'El NIT es requerido';
    return;
  }
  
  if (!editCompanyForm.value.name.trim()) {
    formError.value = 'El nombre de la empresa es requerido';
    return;
  }

  savingCompany.value = true;
  try {
    // Enviar actualización a la API
    const response = await fetch(`http://localhost:4000/api/companies/${companyToEdit.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nit: editCompanyForm.value.nit.trim(),
        name: editCompanyForm.value.name.trim(),
        description: editCompanyForm.value.description.trim()
      })
    });

    const data = await response.json();

    if (data.success) {
      // Find and update the company locally
      const index = companies.value.findIndex(c => c.id === companyToEdit.value.id);
      if (index > -1) {
        companies.value[index] = {
          id: data.data.id,
          nit: data.data.nit,
          name: data.data.name,
          description: data.data.description
        };
        
        // If the edited company is selected, update selection
        if (selectedCompany.value?.id === companyToEdit.value.id) {
          selectedCompany.value = companies.value[index];
        }
      }
      
      showEditCompanyModal.value = false;
      showNotification(`Empresa "${data.data.name}" actualizada correctamente`, 'success');
      console.log('✅ Empresa actualizada:', data.data.name);
    } else {
      formError.value = data.error || 'Error al actualizar la empresa';
      showNotification(formError.value, 'error');
    }
  } catch (error) {
    console.error('Error al guardar empresa:', error);
    formError.value = 'Error al guardar la empresa. Intente nuevamente.';
    showNotification('Error al actualizar la empresa', 'error');
  } finally {
    savingCompany.value = false;
  }
};

// Delete Company
const deleteCompany = (company) => {
  companyToDelete.value = company;
  showDeleteConfirmModal.value = true;
};

// Confirm Delete Company
const confirmDeleteCompany = async () => {
  savingCompany.value = true;
  try {
    // Enviar solicitud de eliminación a la API
    const response = await fetch(`http://localhost:4000/api/companies/${companyToDelete.value.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (data.success) {
      // Eliminar de la lista local
      const index = companies.value.findIndex(c => c.id === companyToDelete.value.id);
      if (index > -1) {
        const deletedName = companies.value[index].name;
        companies.value.splice(index, 1);
        
        // If the deleted company was selected, clear selection
        if (selectedCompany.value?.id === companyToDelete.value.id) {
          selectedCompany.value = null;
        }
        
        showDeleteConfirmModal.value = false;
        showNotification(`Empresa "${deletedName}" eliminada correctamente`, 'success');
        console.log('✅ Empresa eliminada:', deletedName);
      }
    } else {
      showNotification(data.error || 'Error al eliminar la empresa', 'error');
    }
  } catch (error) {
    console.error('Error al eliminar empresa:', error);
    showNotification('Error al eliminar la empresa', 'error');
  } finally {
    savingCompany.value = false;
  }
};

const submitCompanyCheckin = async () => {
  if (!isFormValid()) return;

  loading.value = true;
  try {
    const checkInData = {
      company_id: selectedCompany.value.id,
      company_name: selectedCompany.value.name,
      room_id: selectedRoom.value.id,
      room_number: selectedRoom.value.room_number,
      guest_name: guestInfo.value.name,
      guest_phone: guestInfo.value.phone,
      guest_email: guestInfo.value.email,
      guest_identification: guestInfo.value.identification,
      check_in_date: stayInfo.value.checkInDate,
      check_out_date: stayInfo.value.checkOutDate,
      nights: calculateNights(),
      price_per_night: stayInfo.value.pricePerNight, // Precio especial para la empresa
      total_amount: calculateTotal(), // Total basado en precio ingresado
      notes: stayInfo.value.notes,
      payment_type: 'company_contract', // Diferencia clave: pago al final del mes
      status: 'checked_in' // Se marca como checked_in para que aparezca en detalles de habitación
    };

    // Call API to create company booking
    const response = await fetch('http://localhost:4000/api/bookings/company-checkin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(checkInData)
    });

    if (response.ok) {
      console.log('Check-in empresarial completado exitosamente');
      emit('submit', checkInData);
      closeCompanyCheckinModal();
    } else {
      const errorData = await response.json();
      console.error('Error al procesar check-in empresarial:', errorData);
      alert('Error: ' + (errorData.message || 'Error al procesar check-in'));
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error de conexión: ' + error.message);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
