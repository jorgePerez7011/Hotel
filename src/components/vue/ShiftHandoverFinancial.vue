<template>
  <div class="bg-white rounded-xl shadow-sm border">
    <div class="p-6 border-b">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-bold text-gray-900">
          <i class="fas fa-exchange-alt mr-2 text-blue-600"></i>
          Entrega de Turnos
        </h3>
        <button 
          @click="showNewHandoverModal = true"
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
          v-for="handover in handovers" 
          :key="handover.id"
          class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <!-- Header -->
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center space-x-3">
              <div class="flex items-center">
                <div class="w-3 h-3 rounded-full mr-2" :class="getStatusColor(handover.status)"></div>
                <span class="font-semibold text-gray-800">
                  {{ handover.outgoing_shift }} → {{ handover.incoming_shift }}
                </span>
              </div>
              <span class="text-sm text-gray-600">
                {{ formatTime(handover.handover_time) }}
              </span>
            </div>
            <span class="text-xs px-2 py-1 rounded-full" :class="getStatusBadgeClass(handover.status)">
              {{ getStatusText(handover.status) }}
            </span>
          </div>

          <!-- Employee Info -->
          <div class="flex items-center justify-between mb-3 text-sm">
            <div>
              <span class="text-gray-600">Entrega:</span>
              <span class="font-medium ml-1">{{ handover.outgoing_employee_name || 'N/A' }}</span>
            </div>
            <div>
              <span class="text-gray-600">Recibe:</span>
              <span class="font-medium ml-1">{{ handover.incoming_employee_name || 'N/A' }}</span>
            </div>
          </div>

          <!-- Financial Summary -->
          <div class="bg-gray-50 rounded-lg p-3 mb-3">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span class="block text-gray-600 text-xs">Caja Recibida</span>
                <span class="font-bold text-green-600">
                  ${{ Number(handover.cash_received || 0).toFixed(2) }}
                </span>
              </div>
              <div>
                <span class="block text-gray-600 text-xs">Caja Entregada</span>
                <span class="font-bold text-blue-600">
                  ${{ Number(handover.cash_delivered || 0).toFixed(2) }}
                </span>
              </div>
              <div>
                <span class="block text-gray-600 text-xs">Ingresos</span>
                <span class="font-bold text-green-500">
                  +${{ Number(handover.total_income || 0).toFixed(2) }}
                </span>
              </div>
              <div>
                <span class="block text-gray-600 text-xs">Egresos</span>
                <span class="font-bold text-red-500">
                  -${{ Number(handover.total_expenses || 0).toFixed(2) }}
                </span>
              </div>
            </div>
            
            <!-- Cash Difference -->
            <div class="mt-2 pt-2 border-t border-gray-200 flex justify-between items-center">
              <span class="text-sm text-gray-600">Diferencia en Caja:</span>
              <span class="font-bold" :class="handover.cash_difference >= 0 ? 'text-green-600' : 'text-red-600'">
                ${{ Number(handover.cash_difference || 0).toFixed(2) }}
              </span>
            </div>
          </div>

          <!-- Room Status -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
            <div>
              <span class="block text-gray-600 text-xs">Ocupadas</span>
              <span class="font-medium">{{ handover.rooms_occupied || 0 }}</span>
            </div>
            <div>
              <span class="block text-gray-600 text-xs">Disponibles</span>
              <span class="font-medium">{{ handover.rooms_available || 0 }}</span>
            </div>
            <div>
              <span class="block text-gray-600 text-xs">Check-outs</span>
              <span class="font-medium">{{ handover.pending_checkouts || 0 }}</span>
            </div>
            <div>
              <span class="block text-gray-600 text-xs">Check-ins</span>
              <span class="font-medium">{{ handover.pending_checkins || 0 }}</span>
            </div>
          </div>

          <!-- Notes (Collapsible) -->
          <div v-if="handover.general_notes || handover.maintenance_issues || handover.financial_notes">
            <button 
              @click="toggleNotes(handover.id)"
              class="text-blue-600 text-sm hover:text-blue-800 transition-colors"
            >
              <i class="fas" :class="expandedNotes[handover.id] ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
              {{ expandedNotes[handover.id] ? 'Ocultar' : 'Ver' }} observaciones
            </button>

            <div v-if="expandedNotes[handover.id]" class="mt-2 space-y-2 text-sm">
              <div v-if="handover.general_notes" class="p-2 bg-blue-50 rounded">
                <span class="font-medium text-blue-800">General:</span>
                <p class="text-blue-700">{{ handover.general_notes }}</p>
              </div>
              <div v-if="handover.maintenance_issues" class="p-2 bg-yellow-50 rounded">
                <span class="font-medium text-yellow-800">Mantenimiento:</span>
                <p class="text-yellow-700">{{ handover.maintenance_issues }}</p>
              </div>
              <div v-if="handover.financial_notes" class="p-2 bg-green-50 rounded">
                <span class="font-medium text-green-800">Financiero:</span>
                <p class="text-green-700">{{ handover.financial_notes }}</p>
              </div>
            </div>
          </div>

          <!-- Transactions Button -->
          <div class="mt-3 flex justify-end">
            <button
              @click="viewTransactions(handover)"
              class="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 transition-colors"
            >
              <i class="fas fa-list mr-1"></i>
              Ver Transacciones ({{ (handover.transactions || []).length }})
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
                  @click="currentTab = 'financial'"
                  class="py-2 px-1 border-b-2 font-medium text-sm"
                  :class="currentTab === 'financial' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'"
                >
                  Control Financiero
                </button>
                <button
                  type="button"
                  @click="currentTab = 'operations'"
                  class="py-2 px-1 border-b-2 font-medium text-sm"
                  :class="currentTab === 'operations' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'"
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

            <!-- Room Status -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Habitaciones Ocupadas</label>
                <input v-model.number="newHandover.rooms_occupied" type="number" min="0" max="20" class="w-full border border-gray-300 rounded-md px-3 py-2">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Habitaciones Disponibles</label>
                <input v-model.number="newHandover.rooms_available" type="number" min="0" max="20" class="w-full border border-gray-300 rounded-md px-3 py-2">
              </div>
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

          <!-- Operations Tab -->
          <div v-if="currentTab === 'operations'" class="space-y-4">
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
import { ref, onMounted, reactive } from 'vue'

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
        const response = await fetch('http://localhost:4000/api/employees')
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

    const createHandover = async () => {
      loading.value = true
      try {
        const handoverData = {
          ...newHandover,
          total_income: calculateTotalIncome(),
          total_expenses: calculateTotalExpenses(),
          outgoing_signature: 'Firmado digitalmente'
        }

        const response = await fetch('http://localhost:4000/api/handovers', {
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
          alert('Error: ' + error.message)
        }
      } catch (error) {
        console.error('Error creating handover:', error)
        alert('Error al crear la entrega de turno')
      } finally {
        loading.value = false
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
    }

    const viewTransactions = (handover) => {
      selectedHandover.value = handover
      showTransactionsModal.value = true
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
      newHandover,
      addTransaction,
      removeTransaction,
      calculateTotalIncome,
      calculateTotalExpenses,
      createHandover,
      closeModal,
      viewTransactions,
      toggleNotes,
      getStatusColor,
      getStatusBadgeClass,
      getStatusText,
      formatTime,
      formatDateTime,
      getTransactionSum
    }
  }
}
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>