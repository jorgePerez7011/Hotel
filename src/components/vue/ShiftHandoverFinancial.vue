<template>
  <div class="bg-white rounded-xl shadow-sm border">
    <div class="p-6 border-b">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-bold text-gray-900">
          <i class="fas fa-exchange-alt mr-2 text-blue-600"></i>
          Entrega de Turnos
        </h3>
        <button 
          @click="openNewHandoverModal"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <i class="fas fa-plus mr-2"></i>
          Nueva Entrega
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="p-6 text-center">
      <i class="fas fa-spinner fa-spin text-2xl text-blue-600 mb-2"></i>
      <p class="text-gray-600">Cargando entregas de turno...</p>
    </div>

    <!-- Handover List -->
    <div v-else class="p-6">
      <div v-if="handovers.length === 0" class="text-center py-8 text-gray-500">
        <i class="fas fa-clipboard-list text-4xl mb-4"></i>
        <p>No hay entregas de turno registradas hoy</p>
      </div>

      <div v-else class="space-y-4">
        <div 
          v-if="getLatestHandover()"
          :key="getLatestHandover().id"
          class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <!-- Header -->
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center space-x-3">
              <div class="flex items-center">
                <div class="w-3 h-3 rounded-full mr-2" :class="getStatusColor(getLatestHandover().status)"></div>
                <span class="font-semibold text-gray-800">
                  {{ getLatestHandover().outgoing_shift }} → {{ getLatestHandover().incoming_shift }}
                </span>
              </div>
              <span class="text-sm text-gray-600">
                {{ formatTime(getLatestHandover().handover_time) }}
              </span>
            </div>
            <span class="text-xs px-2 py-1 rounded-full" :class="getStatusBadgeClass(getLatestHandover().status)">
              {{ getStatusText(getLatestHandover().status) }}
            </span>
          </div>

          <!-- Employee Info -->
          <div class="flex items-center justify-between mb-3 text-sm">
            <div>
              <span class="text-gray-600">Entrega:</span>
              <span class="font-medium ml-1">{{ getLatestHandover().outgoing_employee_name || 'N/A' }}</span>
            </div>
            <div>
              <span class="text-gray-600">Recibe:</span>
              <span class="font-medium ml-1">{{ getLatestHandover().incoming_employee_name || 'N/A' }}</span>
            </div>
          </div>

          <!-- Financial Summary -->
          <div class="bg-gray-50 rounded-lg p-3 mb-3">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span class="block text-gray-600 text-xs">Caja Recibida</span>
                <span class="font-bold text-green-600">
                  {{ new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(getLatestHandover().cash_received || 0) }}
                </span>
              </div>
              <div>
                <span class="block text-gray-600 text-xs">Ingresos</span>
                <span class="font-bold text-green-500">
                  +{{ new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(getLatestHandover().total_income || 0) }}
                </span>
              </div>
              <div>
                <span class="block text-gray-600 text-xs">Egresos</span>
                <span class="font-bold text-red-500">
                  -{{ new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(getLatestHandover().total_expenses || 0) }}
                </span>
              </div>
              <div>
                <span class="block text-gray-600 text-xs">Caja Entregada</span>
                <span class="font-bold text-blue-600">
                  {{ new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(getLatestHandover().cash_delivered || 0) }}
                </span>
              </div>
            </div>
            
            <!-- Total General During Shift -->
            <div class="mt-2 pt-2 border-t border-gray-200 flex justify-between items-center">
              <span class="text-sm text-gray-600 font-medium">Total General en Caja (Turno):</span>
              <span class="font-bold text-lg text-blue-600">
                {{ new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(Number(getLatestHandover().cash_received || 0) + Number(getLatestHandover().total_income || 0) - Number(getLatestHandover().total_expenses || 0)) }}
              </span>
            </div>
          </div>

          <!-- Room Status -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
            <div>
              <span class="block text-gray-600 text-xs">Ocupadas</span>
              <span class="font-medium">{{ getLatestHandover().rooms_occupied || 0 }}</span>
            </div>
            <div>
              <span class="block text-gray-600 text-xs">Disponibles</span>
              <span class="font-medium">{{ getLatestHandover().rooms_available || 0 }}</span>
            </div>
            <div>
              <span class="block text-gray-600 text-xs">Check-outs</span>
              <span class="font-medium">{{ getLatestHandover().pending_checkouts || 0 }}</span>
            </div>
            <div>
              <span class="block text-gray-600 text-xs">Check-ins</span>
              <span class="font-medium">{{ getLatestHandover().pending_checkins || 0 }}</span>
            </div>
          </div>

          <!-- Notes (Collapsible) -->
          <div v-if="getLatestHandover().general_notes || getLatestHandover().maintenance_issues || getLatestHandover().financial_notes">
            <button 
              @click="toggleNotes(getLatestHandover().id)"
              class="text-blue-600 text-sm hover:text-blue-800 transition-colors"
            >
              <i class="fas" :class="expandedNotes[getLatestHandover().id] ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
              {{ expandedNotes[getLatestHandover().id] ? 'Ocultar' : 'Ver' }} observaciones
            </button>

            <div v-if="expandedNotes[getLatestHandover().id]" class="mt-2 space-y-2 text-sm">
              <div v-if="getLatestHandover().general_notes" class="p-2 bg-blue-50 rounded">
                <span class="font-medium text-blue-800">General:</span>
                <p class="text-blue-700">{{ getLatestHandover().general_notes }}</p>
              </div>
              <div v-if="getLatestHandover().maintenance_issues" class="p-2 bg-yellow-50 rounded">
                <span class="font-medium text-yellow-800">Mantenimiento:</span>
                <p class="text-yellow-700">{{ getLatestHandover().maintenance_issues }}</p>
              </div>
              <div v-if="getLatestHandover().financial_notes" class="p-2 bg-green-50 rounded">
                <span class="font-medium text-green-800">Financiero:</span>
                <p class="text-green-700">{{ getLatestHandover().financial_notes }}</p>
              </div>
            </div>
          </div>

          <!-- Transactions Button -->
          <div class="mt-4 pt-3 border-t flex gap-2">
            <button
              v-if="getLatestHandover().status === 'pending'"
              @click="completeHandover(getLatestHandover())"
              class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm flex-1"
            >
              <i class="fas fa-check mr-2"></i>
              Completar Entrega
            </button>
            <button
              @click="goToHandoverHistory"
              class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm flex-1"
            >
              <i class="fas fa-history mr-2"></i>
              Ver Historia
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- New Handover Modal -->
    <div v-if="showNewHandoverModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
        <form @submit.prevent="createHandover" class="p-6">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-bold text-gray-900">Nueva Entrega de Turno</h3>
            <button 
              type="button" 
              @click="closeModal"
              class="text-gray-500 hover:text-gray-700"
            >
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>

          <!-- Tabs -->
          <div class="mb-6">
            <div class="border-b border-gray-200">
              <nav class="-mb-px flex space-x-8">
                <button
                  type="button"
                  @click="currentTab = 'basic'"
                  class="py-2 px-1 border-b-2 font-medium text-sm"
                  :class="currentTab === 'basic' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'"
                >
                  Información Básica
                </button>
                <button
                  type="button"
                    @click="currentTab = 'rooms'"
                    class="py-2 px-1 border-b-2 font-medium text-sm"
                    :class="currentTab === 'rooms' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'"
                  >
                    Estado de Habitaciones
                  </button>
                  <button
                    type="button"
                    @click="currentTab = 'financial'"
                    class="py-2 px-1 border-b-2 font-medium text-sm"
                    :class="currentTab === 'financial' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'"
                  >
                    Control Financiero
                  </button>
                  <button
                    type="button"
                    @click="currentTab = 'notes'"
                    class="py-2 px-1 border-b-2 font-medium text-sm"
                    :class="currentTab === 'notes' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'"
                  >
                    Observaciones
                  </button>
              </nav>
            </div>
          </div>

          <!-- Basic Information Tab -->
          <div v-if="currentTab === 'basic'" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Empleado que Entrega *
                </label>
                <select v-model="newHandover.outgoing_employee_id" required class="w-full border border-gray-300 rounded-md px-3 py-2">
                  <option value="">Seleccionar empleado</option>
                  <option v-for="employee in employees" :key="employee.id" :value="employee.id">
                    {{ employee.name }} - {{ employee.position }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Empleado que Recibe *
                </label>
                <select v-model="newHandover.incoming_employee_id" required class="w-full border border-gray-300 rounded-md px-3 py-2">
                  <option value="">Seleccionar empleado</option>
                  <option v-for="employee in employees" :key="employee.id" :value="employee.id">
                    {{ employee.name }} - {{ employee.position }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Turno que Entrega *
                </label>
                <select v-model="newHandover.outgoing_shift" required class="w-full border border-gray-300 rounded-md px-3 py-2">
                  <option value="mañana">Mañana</option>
                  <option value="tarde">Tarde</option>
                  <option value="noche">Noche</option>
                  <option value="completo">Completo</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Turno que Recibe *
                </label>
                <select v-model="newHandover.incoming_shift" required class="w-full border border-gray-300 rounded-md px-3 py-2">
                  <option value="mañana">Mañana</option>
                  <option value="tarde">Tarde</option>
                  <option value="noche">Noche</option>
                  <option value="completo">Completo</option>
                </select>
              </div>
            </div>

            <!-- Check-ins and Check-outs -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Check-outs Pendientes</label>
                <input v-model.number="newHandover.pending_checkouts" type="number" min="0" class="w-full border border-gray-300 rounded-md px-3 py-2">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Check-ins Pendientes</label>
                <input v-model.number="newHandover.pending_checkins" type="number" min="0" class="w-full border border-gray-300 rounded-md px-3 py-2">
              </div>
            </div>
          </div>

          <!-- Room Selection Tab -->
          <div v-if="currentTab === 'rooms'" class="space-y-4">
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-900 mb-4">Selección de Habitaciones Ocupadas</h4>
              <p class="text-sm text-gray-600 mb-4">Haz clic en las habitaciones que están ocupadas en este momento:</p>

              <!-- Floor 1 Rooms (101-109) -->
              <div class="mb-6">
                <h5 class="text-sm font-medium text-gray-700 mb-2">Piso 1 (Habitaciones 101-109)</h5>
                <div class="grid grid-cols-3 md:grid-cols-9 gap-2">
                  <button
                    v-for="room in floor1Rooms"
                    :key="room"
                    type="button"
                    @click="toggleRoom(room)"
                    :class="[
                      'p-2 text-xs font-medium rounded border transition-colors',
                      selectedRooms.includes(room)
                        ? 'bg-red-500 text-white border-red-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    ]"
                  >
                    {{ room }}
                  </button>
                </div>
              </div>

              <!-- Floor 2 Rooms (201-211) -->
              <div class="mb-4">
                <h5 class="text-sm font-medium text-gray-700 mb-2">Piso 2 (Habitaciones 201-211)</h5>
                <div class="grid grid-cols-3 md:grid-cols-9 gap-2">
                  <button
                    v-for="room in floor2Rooms"
                    :key="room"
                    type="button"
                    @click="toggleRoom(room)"
                    :class="[
                      'p-2 text-xs font-medium rounded border transition-colors',
                      selectedRooms.includes(room)
                        ? 'bg-red-500 text-white border-red-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    ]"
                  >
                    {{ room }}
                  </button>
                </div>
              </div>

              <!-- Summary -->
              <div class="mt-4 p-3 bg-blue-50 rounded-lg">
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span class="font-medium text-blue-800">Habitaciones Ocupadas:</span>
                    <span class="ml-2 text-blue-600">{{ selectedRooms.length }}</span>
                  </div>
                  <div>
                    <span class="font-medium text-blue-800">Habitaciones Disponibles:</span>
                    <span class="ml-2 text-blue-600">{{ totalRooms - selectedRooms.length }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Financial Control Tab -->
          <div v-if="currentTab === 'financial'" class="space-y-6">
            <!-- Cash Control -->
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-900 mb-4">Control de Caja</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Dinero en Caja al Recibir Turno *
                  </label>
                  <div class="relative">
                    <span class="absolute left-3 top-2 text-gray-500">$</span>
                    <input 
                      v-model.number="newHandover.cash_received" 
                      type="number" 
                      step="0.01" 
                      min="0"
                      required
                      class="w-full border border-gray-300 rounded-md pl-8 pr-3 py-2"
                      placeholder="0.00"
                    >
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Dinero en Caja al Entregar Turno *
                  </label>
                  <div class="relative">
                    <span class="absolute left-3 top-2 text-gray-500">$</span>
                    <input 
                      v-model.number="newHandover.cash_delivered" 
                      type="number" 
                      step="0.01" 
                      min="0"
                      required
                      class="w-full border border-gray-300 rounded-md pl-8 pr-3 py-2"
                      placeholder="0.00"
                    >
                  </div>
                </div>
              </div>
            </div>

            <!-- Transactions -->
            <div>
              <div class="flex justify-between items-center mb-4">
                <h4 class="font-medium text-gray-900">Transacciones del Turno</h4>
                <button
                  type="button"
                  @click="addTransaction"
                  class="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                >
                  <i class="fas fa-plus mr-1"></i> Agregar
                </button>
              </div>

              <div class="space-y-3">
                <div 
                  v-for="(transaction, index) in newHandover.transactions" 
                  :key="index"
                  class="border border-gray-200 rounded-lg p-3"
                >
                  <div class="flex justify-between items-start mb-3">
                    <div class="flex items-center space-x-2">
                      <select v-model="transaction.type" class="text-sm border border-gray-300 rounded px-2 py-1">
                        <option value="income">Ingreso</option>
                        <option value="expense">Egreso</option>
                      </select>
                      <span 
                        class="px-2 py-1 rounded text-xs font-medium"
                        :class="transaction.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                      >
                        {{ transaction.type === 'income' ? 'Ingreso' : 'Egreso' }}
                      </span>
                    </div>
                    <button 
                      type="button"
                      @click="removeTransaction(index)"
                      class="text-red-500 hover:text-red-700"
                    >
                      <i class="fas fa-trash text-sm"></i>
                    </button>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label class="block text-xs font-medium text-gray-600 mb-1">Categoría</label>
                      <select v-model="transaction.category" class="w-full text-sm border border-gray-300 rounded px-2 py-1">
                        <option v-if="transaction.type === 'income'" value="Hospedaje">Hospedaje</option>
                        <option v-if="transaction.type === 'income'" value="Servicios">Servicios</option>
                        <option v-if="transaction.type === 'income'" value="Restaurante">Restaurante</option>
                        <option v-if="transaction.type === 'income'" value="Otros Ingresos">Otros Ingresos</option>
                        <option v-if="transaction.type === 'expense'" value="Suministros">Suministros</option>
                        <option v-if="transaction.type === 'expense'" value="Mantenimiento">Mantenimiento</option>
                        <option v-if="transaction.type === 'expense'" value="Servicios">Servicios</option>
                        <option v-if="transaction.type === 'expense'" value="Otros Gastos">Otros Gastos</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-xs font-medium text-gray-600 mb-1">Método de Pago</label>
                      <select v-model="transaction.payment_method" class="w-full text-sm border border-gray-300 rounded px-2 py-1">
                        <option value="cash">Efectivo</option>
                        <option value="card">Tarjeta</option>
                        <option value="transfer">Transferencia</option>
                        <option value="other">Otro</option>
                      </select>
                    </div>
                  </div>

                  <div class="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label class="block text-xs font-medium text-gray-600 mb-1">Monto</label>
                      <div class="relative">
                        <span class="absolute left-2 top-1 text-gray-500 text-sm">$</span>
                        <input 
                          v-model.number="transaction.amount" 
                          type="number" 
                          step="0.01" 
                          min="0"
                          class="w-full text-sm border border-gray-300 rounded pl-6 pr-2 py-1"
                          placeholder="0.00"
                        >
                      </div>
                    </div>
                    <div>
                      <label class="block text-xs font-medium text-gray-600 mb-1">Descripción</label>
                      <input 
                        v-model="transaction.description" 
                        type="text"
                        class="w-full text-sm border border-gray-300 rounded px-2 py-1"
                        placeholder="Descripción detallada"
                      >
                    </div>
                  </div>
                </div>

                <div v-if="newHandover.transactions.length === 0" class="text-center py-4 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                  <i class="fas fa-receipt text-2xl mb-2"></i>
                  <p class="text-sm">No hay transacciones registradas</p>
                  <p class="text-xs">Haz clic en "Agregar" para registrar ingresos y egresos</p>
                </div>
              </div>

              <!-- Financial Summary -->
              <div class="mt-4 bg-blue-50 p-3 rounded-lg">
                <div class="grid grid-cols-3 gap-4 text-sm">
                  <div class="text-center">
                    <span class="block text-gray-600">Total Ingresos</span>
                    <span class="font-bold text-green-600">${{ calculateTotalIncome().toFixed(2) }}</span>
                  </div>
                  <div class="text-center">
                    <span class="block text-gray-600">Total Egresos</span>
                    <span class="font-bold text-red-600">${{ calculateTotalExpenses().toFixed(2) }}</span>
                  </div>
                  <div class="text-center">
                    <span class="block text-gray-600">Diferencia</span>
                    <span 
                      class="font-bold" 
                      :class="(calculateTotalIncome() - calculateTotalExpenses()) >= 0 ? 'text-green-600' : 'text-red-600'"
                    >
                      ${{ (calculateTotalIncome() - calculateTotalExpenses()).toFixed(2) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Financial Notes -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Observaciones Financieras
              </label>
              <textarea 
                v-model="newHandover.financial_notes"
                rows="3"
                class="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Notas sobre el manejo de dinero, diferencias encontradas, etc."
              ></textarea>
            </div>
          </div>

          <!-- Observaciones Tab -->
          <div v-if="currentTab === 'notes'" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Observaciones Generales
              </label>
              <textarea 
                v-model="newHandover.general_notes"
                rows="3"
                class="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Situaciones importantes del turno, eventos destacables, etc."
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Problemas de Mantenimiento
              </label>
              <textarea 
                v-model="newHandover.maintenance_issues"
                rows="3"
                class="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Reportes de daños, solicitudes de reparación, etc."
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Solicitudes de Huéspedes
              </label>
              <textarea 
                v-model="newHandover.guest_requests"
                rows="3"
                class="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Peticiones especiales, quejas, servicios solicitados, etc."
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Notas de Inventario
              </label>
              <textarea 
                v-model="newHandover.inventory_notes"
                rows="3"
                class="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Faltantes, reposiciones necesarias, control de llaves, etc."
              ></textarea>
            </div>
          </div>

          <!-- Modal Actions -->
          <div class="flex justify-end space-x-3 mt-6 pt-4 border-t">
            <button 
              type="button" 
              @click="closeModal"
              class="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              :disabled="loading"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
              {{ loading ? 'Guardando...' : 'Crear Entrega' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Transactions Modal -->
    <div v-if="showTransactionsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-bold text-gray-900">
              Transacciones - {{ selectedHandover?.outgoing_shift }} → {{ selectedHandover?.incoming_shift }}
            </h3>
            <button 
              type="button" 
              @click="showTransactionsModal = false"
              class="text-gray-500 hover:text-gray-700"
            >
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>

          <div v-if="selectedHandover?.transactions?.length === 0" class="text-center py-8 text-gray-500">
            <i class="fas fa-receipt text-4xl mb-4"></i>
            <p>No hay transacciones registradas para esta entrega</p>
          </div>

          <div v-else class="space-y-3">
            <div 
              v-for="transaction in selectedHandover?.transactions" 
              :key="transaction.id"
              class="border border-gray-200 rounded-lg p-3"
            >
              <div class="flex justify-between items-start mb-2">
                <div class="flex items-center space-x-2">
                  <span 
                    class="px-2 py-1 rounded text-xs font-medium"
                    :class="transaction.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                  >
                    {{ transaction.type === 'income' ? 'Ingreso' : 'Egreso' }}
                  </span>
                  <span class="text-sm font-medium">{{ transaction.category }}</span>
                </div>
                <span 
                  class="font-bold"
                  :class="transaction.type === 'income' ? 'text-green-600' : 'text-red-600'"
                >
                  {{ transaction.type === 'income' ? '+' : '-' }}${{ Number(transaction.amount).toFixed(2) }}
                </span>
              </div>
              
              <p class="text-sm text-gray-700 mb-1">{{ transaction.description }}</p>
              
              <div class="flex justify-between items-center text-xs text-gray-500">
                <span>{{ transaction.payment_method }}</span>
                <span>{{ formatDateTime(transaction.created_at) }}</span>
              </div>
            </div>
          </div>

          <!-- Transaction Summary -->
          <div v-if="selectedHandover?.transactions?.length > 0" class="mt-6 bg-gray-50 p-4 rounded-lg">
            <div class="grid grid-cols-3 gap-4 text-sm">
              <div class="text-center">
                <span class="block text-gray-600">Total Ingresos</span>
                <span class="font-bold text-green-600">
                  ${{ getTransactionSum(selectedHandover.transactions, 'income').toFixed(2) }}
                </span>
              </div>
              <div class="text-center">
                <span class="block text-gray-600">Total Egresos</span>
                <span class="font-bold text-red-600">
                  ${{ getTransactionSum(selectedHandover.transactions, 'expense').toFixed(2) }}
                </span>
              </div>
              <div class="text-center">
                <span class="block text-gray-600">Diferencia</span>
                <span 
                  class="font-bold"
                  :class="Number(selectedHandover.cash_difference) >= 0 ? 'text-green-600' : 'text-red-600'"
                >
                  ${{ Number(selectedHandover.cash_difference || 0).toFixed(2) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, reactive, watch } from 'vue'

export default {
  name: 'ShiftHandover',
  setup() {
    const loading = ref(false)
    const handovers = ref([])
    const employees = ref([])
    const showNewHandoverModal = ref(false)
    const showTransactionsModal = ref(false)
    const selectedHandover = ref(null)
    const expandedNotes = ref({})
    const currentTab = ref('basic')
    const selectedRooms = ref([])

    // Room configuration
    const floor1Rooms = [101, 102, 103, 104, 105, 106, 107, 108, 109]
    const floor2Rooms = [201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211]
    const totalRooms = floor1Rooms.length + floor2Rooms.length

    const newHandover = reactive({
      outgoing_employee_id: '',
      incoming_employee_id: '',
      shift_date: new Date().toISOString().split('T')[0],
      outgoing_shift: '',
      incoming_shift: '',
      rooms_occupied: 0,
      rooms_available: 20,
      pending_checkouts: 0,
      pending_checkins: 0,
      general_notes: '',
      maintenance_issues: '',
      guest_requests: '',
      inventory_notes: '',
      cash_received: 0,
      cash_delivered: 0,
      financial_notes: '',
      transactions: []
    })

    const fetchHandovers = async () => {
      loading.value = true
      try {
        const today = new Date().toISOString().split('T')[0]
        const response = await fetch(`http://localhost:4000/api/handovers/date/${today}`)
        const data = await response.json()
        
        if (data.handovers) {
          handovers.value = data.handovers
        }
      } catch (error) {
        console.error('Error fetching handovers:', error)
      } finally {
        loading.value = false
      }
    }

    const fetchEmployees = async () => {
      try {
        const response = await fetch('/api/employees')
        const data = await response.json()
        
        if (data.employees) {
          employees.value = data.employees.filter(emp => emp.is_active)
        }
      } catch (error) {
        console.error('Error fetching employees:', error)
      }
    }

    const addTransaction = () => {
      newHandover.transactions.push({
        type: 'income',
        category: 'Hospedaje',
        description: '',
        amount: 0,
        payment_method: 'cash'
      })
    }

    const removeTransaction = (index) => {
      newHandover.transactions.splice(index, 1)
    }

    const calculateTotalIncome = () => {
      return newHandover.transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
    }

    const calculateTotalExpenses = () => {
      return newHandover.transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
    }

    const toggleRoom = (roomNumber) => {
      const index = selectedRooms.value.indexOf(roomNumber)
      if (index > -1) {
        selectedRooms.value.splice(index, 1)
      } else {
        selectedRooms.value.push(roomNumber)
      }
    }

    // Watch for changes in selectedRooms to update calculated fields
    watch(selectedRooms, (newSelectedRooms) => {
      newHandover.rooms_occupied = newSelectedRooms.length
      newHandover.rooms_available = totalRooms - newSelectedRooms.length
    }, { immediate: true })

    const createHandover = async () => {
      // Validar campos requeridos
      if (!newHandover.outgoing_employee_id || newHandover.outgoing_employee_id === '') {
        alert('Por favor selecciona el empleado que entrega el turno')
        return
      }

      if (!newHandover.incoming_employee_id || newHandover.incoming_employee_id === '') {
        alert('Por favor selecciona el empleado que recibe el turno')
        return
      }

      if (!newHandover.outgoing_shift || newHandover.outgoing_shift === '') {
        alert('Por favor selecciona el turno de salida')
        return
      }

      if (!newHandover.incoming_shift || newHandover.incoming_shift === '') {
        alert('Por favor selecciona el turno de entrada')
        return
      }

      if (!newHandover.shift_date) {
        alert('Por favor selecciona la fecha de la entrega')
        return
      }

      loading.value = true
      try {
        const handoverData = {
          outgoing_employee_id: newHandover.outgoing_employee_id,
          incoming_employee_id: newHandover.incoming_employee_id,
          shift_date: newHandover.shift_date,
          outgoing_shift: newHandover.outgoing_shift,
          incoming_shift: newHandover.incoming_shift,
          rooms_occupied: newHandover.rooms_occupied,
          rooms_available: newHandover.rooms_available,
          pending_checkouts: newHandover.pending_checkouts,
          pending_checkins: newHandover.pending_checkins,
          selected_rooms: selectedRooms.value,
          general_notes: newHandover.general_notes,
          maintenance_issues: newHandover.maintenance_issues,
          guest_requests: newHandover.guest_requests,
          inventory_notes: newHandover.inventory_notes,
          cash_received: newHandover.cash_received,
          cash_delivered: newHandover.cash_delivered,
          total_income: calculateTotalIncome(),
          total_expenses: calculateTotalExpenses(),
          financial_notes: newHandover.financial_notes,
          transactions: newHandover.transactions,
          outgoing_signature: 'Firmado digitalmente'
        }

        const response = await fetch('/api/handovers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(handoverData)
        })

        if (response.ok) {
          await fetchHandovers()
          closeModal()
          alert('Entrega de turno creada exitosamente')
        } else {
          const error = await response.json()
          alert('Error: ' + error.error || error.message)
        }
      } catch (error) {
        console.error('Error creating handover:', error)
        alert('Error al crear la entrega de turno')
      } finally {
        loading.value = false
      }
    }

    const openNewHandoverModal = async () => {
      showNewHandoverModal.value = true
      
      // Cargar la última entrega para obtener las habitaciones ocupadas
      try {
        const today = new Date().toISOString().split('T')[0]
        const response = await fetch(`http://localhost:4000/api/handovers/date/${today}`)
        const data = await response.json()
        
        if (data.handovers && data.handovers.length > 0) {
          // Obtener la última entrega (la más reciente)
          const lastHandover = data.handovers[data.handovers.length - 1]
          
          // Cargar las habitaciones ocupadas de la última entrega
          if (lastHandover.selected_rooms) {
            let occupiedRooms = []
            
            if (typeof lastHandover.selected_rooms === 'string') {
              try {
                occupiedRooms = JSON.parse(lastHandover.selected_rooms)
              } catch (e) {
                console.error('Error parsing selected_rooms:', e)
              }
            } else if (Array.isArray(lastHandover.selected_rooms)) {
              occupiedRooms = lastHandover.selected_rooms
            }
            
            // Pre-seleccionar las habitaciones ocupadas
            selectedRooms.value = occupiedRooms
            console.log('Habitaciones cargadas:', occupiedRooms)
            // El watcher actualizará automáticamente rooms_occupied y rooms_available
          }
        }
      } catch (error) {
        console.error('Error loading last handover:', error)
      }
    }

    const closeModal = () => {
      showNewHandoverModal.value = false
      currentTab.value = 'basic'
      Object.assign(newHandover, {
        outgoing_employee_id: '',
        incoming_employee_id: '',
        shift_date: new Date().toISOString().split('T')[0],
        outgoing_shift: '',
        incoming_shift: '',
        rooms_occupied: 0,
        rooms_available: 20,
        pending_checkouts: 0,
        pending_checkins: 0,
        general_notes: '',
        maintenance_issues: '',
        guest_requests: '',
        inventory_notes: '',
        cash_received: 0,
        cash_delivered: 0,
        financial_notes: '',
        transactions: []
      })
      selectedRooms.value = []
    }

    const viewTransactions = (handover) => {
      selectedHandover.value = handover
      showTransactionsModal.value = true
    }

    const downloadPDF = async (id) => {
      try {
        const response = await fetch(`http://localhost:4000/api/handovers/${id}/pdf`)
        
        if (response.ok) {
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `entrega-turno-${id}.pdf`
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
        } else {
          console.error('Error downloading PDF')
          alert('Error al descargar el PDF')
        }
      } catch (error) {
        console.error('Error downloading PDF:', error)
        alert('Error de conexión al descargar el PDF')
      }
    }

    const completeHandover = async (handover) => {
      try {
        const response = await fetch(`http://localhost:4000/api/handovers/${handover.id}/complete`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ incoming_signature: 'signed' })
        })

        if (response.ok) {
          await fetchHandovers()
          alert('Entrega completada exitosamente')
        } else {
          const error = await response.json()
          alert(`Error: ${error.error}`)
        }
      } catch (error) {
        console.error('Error completing handover:', error)
        alert('Error al completar la entrega')
      }
    }

    const goToHandoverHistory = () => {
      window.location.href = '/admin/handovers-history'
    }

    const toggleNotes = (handoverId) => {
      expandedNotes.value[handoverId] = !expandedNotes.value[handoverId]
    }

    const getStatusColor = (status) => {
      switch (status) {
        case 'pending': return 'bg-yellow-400'
        case 'completed': return 'bg-blue-400'
        case 'reviewed': return 'bg-green-400'
        default: return 'bg-gray-400'
      }
    }

    const getStatusBadgeClass = (status) => {
      switch (status) {
        case 'pending': return 'bg-yellow-100 text-yellow-800'
        case 'completed': return 'bg-blue-100 text-blue-800'
        case 'reviewed': return 'bg-green-100 text-green-800'
        default: return 'bg-gray-100 text-gray-800'
      }
    }

    const getStatusText = (status) => {
      switch (status) {
        case 'pending': return 'Pendiente'
        case 'completed': return 'Completada'
        case 'reviewed': return 'Revisada'
        default: return 'Desconocido'
      }
    }

    const formatTime = (dateTime) => {
      if (!dateTime) return 'N/A'
      return new Date(dateTime).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const formatDateTime = (dateTime) => {
      if (!dateTime) return 'N/A'
      return new Date(dateTime).toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const getTransactionSum = (transactions, type) => {
      return transactions
        .filter(t => t.type === type)
        .reduce((sum, t) => sum + Number(t.amount), 0)
    }

    const getLatestHandover = () => {
      return handovers.value.length > 0 ? handovers.value[0] : null
    }

    onMounted(() => {
      fetchHandovers()
      fetchEmployees()
    })

    return {
      loading,
      handovers,
      employees,
      showNewHandoverModal,
      showTransactionsModal,
      selectedHandover,
      expandedNotes,
      currentTab,
      selectedRooms,
      floor1Rooms,
      floor2Rooms,
      totalRooms,
      newHandover,
      addTransaction,
      removeTransaction,
      calculateTotalIncome,
      calculateTotalExpenses,
      toggleRoom,
      createHandover,
      openNewHandoverModal,
      closeModal,
      viewTransactions,
      downloadPDF,
      completeHandover,
      goToHandoverHistory,
      toggleNotes,
      getStatusColor,
      getStatusBadgeClass,
      getStatusText,
      formatTime,
      formatDateTime,
      getTransactionSum,
      getLatestHandover
    }
  }
}
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>
